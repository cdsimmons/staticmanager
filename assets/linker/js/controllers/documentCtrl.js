'use strict';

//var documentControllers = angular.module('documentControllers', []);

app.controller('DocumentCtrl', function DocumentCtrl($scope, $route, $routeParams, $modal, $http, $log, $location, $upload, filterFilter, _, sailsSocket) {
// Init
  var apiRoot = 'v1/api';
  var initiated = false;
  var pauseTimer;
  var pauseTimerDelay = 250;
  var temps = [];

  $scope.bypass = false;
  $scope.document = {};
  $scope.document.options = {};
  $scope.validJson = true;
  $scope.publishable = false; // Basically, no changes to begin with right?
  $scope.host = $location.host();
  $scope.version = $location.absUrl().split($scope.host)[1].split('/')[1]; // Split at host, then at /, and it's fairly reliable at getting the version :P
  $scope.apiRoot = apiRoot;
  $scope.placeholder = '{{sm.title}}';
  $scope.progress = [];
  $scope.examples = {};
  $scope.examples.simpleWebsite = {};
  $scope.examples.simpleWebsite.title = 'Simple Website';
  $scope.examples.simpleWebsite.draft = {
    "home": {
      "logo": "logo.jpg",
      "hero": "Welcome to this website.",
      "product": "This is what we provide.",
      "clients": "We have worked with a lot of people."
    },
    "about": {
      "who": "We are great.",
      "why": [
        "Super great",
        "Something else",
        "Another reason"
      ]
    },
    "contact": {
      "availability": "We are always available.",
      "phone": "01010101"
    }
  };
  $scope.examples.complexWebsite = {};
  $scope.examples.complexWebsite.title = 'Complex Website';
  $scope.examples.complexWebsite.draft = {
    "home": {
      "logo": "logo.jpg",
      "hero": "Welcome to this website.",
      "product": "This is what we provide.",
      "clients": "We have worked with a lot of people."
    },
    "about": {
      "who": "We are great.",
      "why": [
        {
          "title": "Super great",
          "description": "This is description of super great."
        },
        {
          "title": "Something else",
          "description": "This is description of something else."
        },
        {
          "title": "Another reason",
          "description": "This is description of another reason."
        }
      ]
    },
    "contact": {
      "availability": "We are always available.",
      "phone": "01010101"
    }
  };

  //$http.put('/'+apiRoot+'/document/'+$routeParams.id, {});
  
  // Populate document if we don't have it
  if($routeParams.id) {
    // Get document data
    if(!initiated) {
      init();

      initiated = true;
    }
  }

  function init() {
    sailsSocket.get('/'+apiRoot+'/document/'+$routeParams.id, {}, processFind); // Do an initial request (Does this user need to login?) If true, then make them login, otherwise do get etc...
    //$http.put('/'+apiRoot+'/document/'+$routeParams.id, {}, processFind, processError); // Socket is saying no method "isAuthenticated"... likely don't need to use socket for initial get anyway
    $http.put('/'+apiRoot+'/document/'+$routeParams.id, {}).success(processFind).error(processError);

    // If message received...
    $scope.$on('sailsSocket:message', function(ev, message) {
      $log.debug('New comet message received :: ', message);
      $scope.bypass = true; // Bypass = Don't let watch trigger when setting variable again...
      //console.log('bypass started');
      var tempsIndex = _.indexOf(temps, JSON.stringify(message.data.draft));

      if(tempsIndex >= 0) { // If it exists in temps, then we don't need to set it because it's probably old... just throw it away
        console.log('exists', tempsIndex);
        temps.splice(tempsIndex, 1);
      } else {
        if(message.verb === 'update') {
          // Draft data#
          if(message.model === 'document') {
            if(JSON.stringify($scope.document.draft) !== JSON.stringify(message.data.draft)) { // Current is newer, so it's different to previous message...
              //$log.debug('New draft received'); // Delay, and then the fact that it's setting the value which triggers the watch again...
              //$scope.document.draft = message.data.draft; 
              console.log('doesnt exist')
              $scope.document.draft = message.data.draft;
            }
            // Live data
            if(JSON.stringify($scope.document.live) !== JSON.stringify(message.data.live)) {
              $scope.document.live = message.data.live;
            }
            // Options data
            if(JSON.stringify($scope.document.live) !== JSON.stringify(message.data.options)) {
              $scope.document.options = message.data.options;
            }
          }
          if(message.model === 'options') {
          }
        }
      }

      // I don't think Watch is actually being called on value change... I think it's just that 2 messages get sent at once, so one arrives, different, sets... it has to make the call though? ugh
      // Deferred, because we want to make sure this is changed just after document is set to avoid watch triggering...
      _.defer(function() {
        $scope.bypass = false;
      });
    });

    // If JSON has changed, send out to other socket connections...
    $scope.$watch('document.draft', function(newValue, oldValue) { // Thinking here, I need to compare the newValue
      console.log('watch updated');
      var tempsIndex = _.indexOf(temps, JSON.stringify(newValue));
     
      if (newValue && oldValue && newValue !== oldValue && !$scope.bypass && tempsIndex === -1) { // oldValue is empty to begin with, then the get makes it a value, so the watch is like "Oh hey, it's changed!"... bit hacky to just be like "Only update if previous value wasn't undefined" but meh
        clearTimeout(pauseTimer);
        pauseTimer = setTimeout(function() {
          temps.push(JSON.stringify(newValue));
          // Bypass is working... basically if we set the document before, it doesn't update in put... however, the put is still older than the data we have!
          sailsSocket.put('/'+apiRoot+'/document/'+$routeParams.id, {draft: newValue});
        }, pauseTimerDelay);

        // Basically need to stop it triggering socket message when from itself...
        // Determine if it's publishable...
        checkPublishable();
      } else {
        console.log('exists', tempsIndex);
        temps.splice(tempsIndex, 1);
      }
    }, true);

    $scope.$watch('document.options', function(newValue, oldValue) {
      var tempsIndex = _.indexOf(temps, JSON.stringify(newValue));

      if (newValue && oldValue && newValue !== oldValue && !$scope.bypass) { // oldValue is empty to begin with, then the get makes it a value, so the watch is like "Oh hey, it's changed!"... bit hacky to just be like "Only update if previous value wasn't undefined" but meh
        clearTimeout(pauseTimer);
        pauseTimer = setTimeout(function() {
          temps.push(JSON.stringify(newValue));
          sailsSocket.put('/'+apiRoot+'/document/'+$routeParams.id, {options: newValue});
        }, pauseTimerDelay);
      } else {
        console.log('exists', tempsIndex);
        temps.splice(tempsIndex, 1);
      }
    }, true);
  }


// Misc
  function logResponse(response, status) {
    $log.debug(processResponse(response, status));
  }

  function processResponse(response, status) {
    // NOTE:
    // Socket calls do not return HTTP status in the `status` argument. Though, a `response.status` is returned when the socket experiences an error. When successful, the `response.status` will likely not exist unless you explicitly include it in your controller responses.
    if (!status) {
      status = (response && response.status) ? response.status : 200;
    }

    //$log.debug('REST::' + url, status, response);
    var alertType = (status === 200) ? 'success' : 'danger';
    return [{
      msg: response, status: status, type: alertType, timestamp: new Date()
    }];
  }

  function copyProperties(object) {
    var clone;

    // Need to keep it as either array or object...
    if(_.isArray(object)) {
      clone = [];
    } else if(_.isObject(object)) {
      clone = {};
    }

    // Begin looping through object properties
    for (var prop in object) {
      if (object.hasOwnProperty(prop)) {
        if(_.isString(object[prop])) {
          clone[prop] = '';
        } else if(_.isBoolean(object[prop])) {
          clone[prop] = false;
        } else if(_.isNumber(object[prop])) {
          clone[prop] = 0;
        } else if(_.isObject(object[prop]) || _.isArray(object[prop])) {
          clone[prop] = copyProperties(object[prop]);
        }
      }
    }

    return clone;
  }

  function getPropByString(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
      var n = a[i];
      if (n in o) {
        o = o[n];
      } else {
        return;
      }
    }
    return o;
  }

  var resolve = (function(){
    var UNRESOLVED = resolve.UNRESOLVED = {};
    return resolve;

    function resolve(cur, ns) {
      var undef;

      ns = ns.replace(/\[(\w+)\]/g, '.$1');
      ns = ns.split('.');

      while (cur && ns[0])
        cur = cur[ns.shift()] || undef;

      if (cur === undef || ns[0]) {
        return UNRESOLVED;
      }

      return cur;
    }
  }());

  function get(obj, ns) {            
    function recurse(o, props) {
      if (props.length === 0) {
        return o;
      }
      if (!o) {
        return undefined;
      }
      return recurse(o[props.shift()], props);
    }

    return recurse(obj, ns.split('.'));
  }

  function checkPublishable() {
    if (JSON.stringify($scope.document.draft) !== JSON.stringify($scope.document.live)) {
      $scope.publishable = true;
    } else {
      $scope.publishable = false;
    }
  }


// HTTP Method handling
  function processCreate(response, status) {
    $scope.document = response;
    $location.path('/view/'+$scope.document.id);
  }

  function processFind(response, status) {
    $scope.document = response;
    checkPublishable();
    $log.debug('sailsSocket::/processFind', response, status);
  }

  function processError(response, status) {
    console.log('error', status);
    if(status === 403) { // If forbidden, then make them login
      $location.path('/login/'+$routeParams.id);
    }
  }


// Scope functions
  $scope.create = function (action) {
    if($scope.documentForm.$valid) {
      $http.post('/'+apiRoot+'/document', $scope.document).success(processCreate).error(logResponse);
    }
  };

  $scope.publish = function () {
    $log.debug('Publishing document:', $scope.document.draft);

    $scope.document.live = JSON.parse(JSON.stringify($scope.document.draft)); // Copy it over
    sailsSocket.put('/'+apiRoot+'/document/'+$routeParams.id, {live: $scope.document.live}); // Make it post to server
    $scope.publishable = false; // Update publishable...
  }

  $scope.showExample = function (example) {
    $scope.document = $scope.examples[example];
  }

  $scope.removeArrayField = function (key, index) {
    if(key.length !== 1) {
      key.splice(index, 1);
    } else {
      alert('Can\'t remove last field of a list.');
    }
  }

  $scope.newArrayField = function (key, index) {
    var clone;

    if(_.isString(key[index])) {
      clone = '';
    } else if(_.isObject(key[index]) || _.isArray(key[index])) {
      clone = copyProperties(key[index]); // Copies all of the property names but not the values...
    }

    key.push(clone);
  }

  $scope.viewImage = function(url) {

    // They might be hosting on their own site, so let's just make sure we check for site URL first
    if(url.substr(0, 4) !== 'http') {
      if($scope.document.options && $scope.document.options.site) {
        url = $scope.document.options.site+url;
      } else {
        alert('Please set the site URL under options to view this image.');
        return;
      }
    }

    // Get it opening up in a modal...
    //window.open(url);
    $scope.activeImage = url; // Dirty... basically we just want to pass the url into our partial, but resolve isn't working! :)
    var modalInstance = $modal.open({
      templateUrl: '/views/partials/_modal-image.html',
      controller: 'ModalInstanceCtrl',
      //size: 'lg',
      scope: $scope
      // resolve: {
      //   urly: function() {
      //     return 'test';
      //   }
      // }
    });

    /*modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });*/
  }

  $scope.upload = function (files, parent, key, literalId, id, literalParent) { // Passing parent and key separately, because screw JS... I want the bloody reference, not the value itself
    if (files && files.length) {
      // Split key, and check if it has an index property... if it does, then it's because it's from a list of images... which means we need to tack it on the end of parent selector :P
      var split = [];
      var index = 0;
      var id;

      // Sigh... I have everything, but I just can't change the reference value... perhaps instead I could create a whole new object, set the value, and then replace $scope? lol
      //var test = resolve($scope, literalParent);
      //id = 'ra';
      //test = 'ra2';

      // If there is an index in key, then extract it... we need to do this to be used in reference later
      split = key.split('[');
      if(split[1]) {
        index = split[1].split(']')[0];
      }

      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        $scope.progress[literalId] = [];

        // Reading the file, and then we're just pushing it to imgur...
        var fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = function(e) {
          $upload.http({
            url: 'https://api.imgur.com/3/image',
            headers: {
              'Authorization': 'Client-ID db23471928c6ecb',
              'Content-Type': file.type
            },
            data: e.target.result
          }).progress(function(event) {
            var progressPercentage = parseInt(100.0 * event.loaded / event.total);
            $scope.progress[literalId]['position'] = progressPercentage;
            $scope.progress[literalId]['complete'] = false;
          }).success(function(data) {
            // All we need to do is set the file location
            var url = data.data.link;

            // Bit hacky... basically getting the reference now the value itself
            if(index) {
              parent[split[0]][index] = url;
            } else {
              parent[key] = url;
            }
            // Having a problem... basically multiple images aren't work... could be because the reference is out of date it isn't updating the right value...

            $scope.progress[literalId]['position'] = 0;
            $scope.progress[literalId]['complete'] = true;
          }).error(function(data) {
            //error
            $scope.progress[literalId]['complete'] = true;
          });
        }
      }
    }
  };
});