'use strict';

app.directive('jsonCms', function ($compile, $timeout) {
  var root = 'document.draft';

  return {
    link: function(scope, element, attrs, controllers) {
      if(!_.isUndefined(scope.document)) {
        updateUi(element, scope, scope.document.draft);
      }

      // We are watching to see if the document.json variable changes... this can happen in the JSON tab...
      scope.$watch('document.draft', function(newValue, oldValue) {
        //var newBlank = _.mapObject(newValue, function(val, key) { return ''; });
        //console.log(newBlank);
        //Trying to compare the keys, to decide if we need to update the UI...
        
        if (newValue) {
          var newKeys = JSON.stringify(deepKeys(newValue));
          var oldKeys = JSON.stringify(deepKeys(oldValue));

          if(newKeys !== oldKeys) {
            console.log('key change');
            updateUi(element, scope, newValue);
          }
        }
      }, true);
    }
  };

  function updateUi(element, scope, json) {
  	// Get focus
  	var $focus = $('*:focus');
  	var focusId = $focus.attr('id');
  	var position = $focus.getCursorPosition();

    // Turn it into an object if it isn't already... just being safe really
    if(!_.isObject(json)) {
      //json = JSON.parse(json);
    }

    // Get the HTML
    var fields = generateFields(json);

    // Set the HTML
    element.html(fields).show();

    // Update UI
    $compile(element.contents())(scope);

    // Update textfit
    //$('.textfit').textfit();

    // Set focus... not pretty but seems to be the only way to make sure the CMS fields match any JSON changes... I could probably avoid firing field rebuilds if only working with CMS but meh...
    $timeout(function() {
      $('[id="'+focusId+'"]').focus();
      $('[id="'+focusId+'"]').setCursorPosition(position);
    });
  }

  function generateFields(object, parent, depth) {
    var field = '';

    // Set parent key so we don't get undefined
    if(_.isUndefined(parent)) {
      parent = root;
    }

    // Set parent key so we don't get undefined
    if(_.isUndefined(depth)) {
      depth = 0;
    }

    // Iterate object
    for (var key in object) {
      // Get object value
      var value = object[key];
      var id = parent+'.'+key;
      depth--;

      // Match input field
      if(_.isArray(value)) { // Making the assumption that if it's an array and the first value is a string/number then it's a select they want
        field += '<h4 class="heading">'+key+'</h4>';
        field += '<div class="form-group">';
        //field += '<label for="'+id+'">'+key+'</label>';

        if(depth % 2) {
          field += '<div class="cms-grouper alt">';
        } else {
          field += '<div class="cms-grouper">';
        }
        depth++;

        // Loop through array...
        for(var i = 0; i < value.length; i++) {
          //id += id+'['+i+']';
          if(_.isObject(value[i])) {
            field += '<div class="well">';
            field += generateFields(value[i], id+'['+i+']', depth);
            field += '</div>';
          } else {
            field += generateStaticField(parent, key+'['+i+']', value[i], false);
          }

          // Controls
          field += '<div class="form-array-controls">'
          if(i === value.length-1) {
            field += '<button class="btn btn-success new" ng-click="newArrayField('+id+', '+i+')"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>';
          }
          field += '<button class="btn btn-danger remove" ng-click="removeArrayField('+id+', '+i+')"><span class="glyphicon glyphicon-minus" aria-hidden="true"></span></button>';
          field += '</div>';
        }
        field += '</div>'; // Ending grouper
        field += '</div>';
      } else if(_.isObject(value)) { // Keep going through and checking...
        field += '<h4 class="heading">'+key+'</h4>';
        if(depth % 2) {
          field += '<div class="cms-grouper alt">';
        } else {
          field += '<div class="cms-grouper">';
        }
        depth++;
        field += generateFields(value, id, depth);
        field += '</div>';
      } else {
        field += generateStaticField(parent, key, value);
      }
    }

    return field;
  }

  function generateStaticField(parent, key, value, label) {
    var field = '';
    var id = parent+'.'+key;
    var imageTypes = ['.jpg', '.gif', '.png', '.jpeg'];

    if(_.isUndefined(label)) label = true;

    if(_.isBoolean(value)) {
      field += '<div class="form-group">';
      if(label) field += '<label for="'+id+'">'+key+'</label>';
      field += '<input type="checkbox" id="'+id+'" name="'+id+'" ng-model="'+id+'" class="form-control" />';
      field += '</div>';
    } else if(_.isString(value) && stringHasEnds(value, imageTypes)) { // If the string has an image type...
      field += '<div class="form-group">';
      if(label) field += '<label for="'+id+'">'+key+'</label>';
      field += '<div class="form-image">';
      // Progress
      field += '<progressbar class="progress-striped active complete-{{progress[\''+id+'\'][\'complete\']}}" value="progress[\''+id+'\'][\'position\']"></progressbar>'; // Generate fields doesn't have scope, so I can't set it to scope... passing it in might be bad... 
      // Input
      field += '<div class="input-group">';
      field += '<input type="text" id="'+id+'" name="'+id+'" ng-model="'+id+'" class="form-control" ng-trim="false" />';
      // Controls
      field += '<div class="input-group-btn">';
      field += '<button class="btn btn-success view" ng-click="viewImage('+id+')">View</button>';
      field += '<div class="btn btn-primary" ng-file-select ng-file-change="upload($files, '+parent+', \''+key+'\', \''+id+'\', '+id+', \''+parent+'\')" accept=".jpg,.jpeg,.gif,.png">Upload New</div>';
      // Ending divs
      field += '</div>';
      field += '</div>';
      field += '</div>';
      field += '</div>';
    } else if(_.isString(value)) {
      field += '<div class="form-group">';
      if(label) field += '<label for="'+id+'">'+key+'</label>';
      field += '<textarea id="'+id+'" name="'+id+'" ng-model="'+id+'" class="form-control" ng-trim="false" textfit/></textarea>';
      field += '</div>';
    } else if(_.isNumber(value)) {
      field += '<div class="form-group">';
      if(label) field += '<label for="'+id+'">'+key+'</label>';
      field += '<input type="number" id="'+id+'" name="'+id+'" ng-model="'+id+'" class="form-control" />';
      field += '</div>';
    } else {
      console.log(key, value);
    }

    return field;
  }

  // Gets all of the keys of the object, not the values... since we don't care if the values have changed
  // Repeated in documentCtrl, but documentCtrl is better really... should use it
  function deepKeys(object) {
    var keys = [];

    for (var key in object) {
      var value = object[key];
      keys.push(key);

      if(_.isObject(value)) {
        keys.push(deepKeys(value));
      }
    }

    return keys;
  }

  function stringHasEnds(string, array) {
    var contains = false;
    var length = array.length;

    while(length--) {
       if (string.indexOf(array[length], string.length - array[length].length) !== -1) {
          contains = true;
       }
    }

    return contains;
  }
});