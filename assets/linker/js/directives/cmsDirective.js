'use strict';

app.directive('cms', function () {
  return {
    link: function(scope, element, attrs, controllers) {
      console.log(element);
      var $this = $(element);
      console.log(scope.document.draft);
      $this.alpaca(JSON.parse(scope.document.draft));
    },
  };
});