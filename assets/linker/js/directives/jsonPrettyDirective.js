'use strict';

app.directive('jsonPretty', function ($compile) {
  return {
  	require: 'ngModel',
    link: function(scope, element, attrs, controllers) {
      controllers.$formatters.unshift(function(valueFromModel) {
        // return how data will be shown in input
        return JSON.stringify(valueFromModel, null, 4);
      });

      controllers.$parsers.push(function(valueFromInput) {
        // return how data should be stored in model
        var json;

        // Need to make sure we don't chuck a shed load of errors out...
        try {
          json = JSON.parse(valueFromInput);
          scope.validJson = true;
        } catch(e) {
          scope.validJson = false;
          return scope.document.draft;
        }

        return json;
      });

      // We are watching to see if the document.json variable changes... this can happen in the CMS tab...
      scope.$watch('document.draft', function(newValue, oldValue) {
        if (newValue) {
          controllers.$modelValue = ''; // Makes $formatters run again...
        }
      }, true);
    }
  };
});