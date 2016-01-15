app.controller('LoginCtrl', function ($scope, $http) {
// Init
  var apiRoot = 'v1/api';

// Create user and passwords... basically, only prevent use if email and password has been set... tricky, how do I do that?
// Maybe server-side needs to check for user password existence on update, if so authenticate... maybe do a beforeUpdate or something?
// Or, maybe it could just authenticate against empty user? Like, have it blocked, but try to authenticate as empty user first, if fine then it's authenticated...

// Basically, do authentication request, 
// If successfull put them through to the view page because we now have the session in place all should be fine
// If failed, then just put a fail response on there...

// Scope functions
  $scope.authenticate = function (action) {
    if($scope.documentForm.$valid) {
      $http.get('/'+apiRoot+'/user', $scope.document).success(processAuthenticate).error(logResponse);
    }
  };
});