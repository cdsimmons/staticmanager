'use strict';

app.directive('textfit', function ($compile, $timeout) {
  return {
    link: function(scope, element, attrs, controllers) {
      var $element = $(element);

      // For CSS purposes
      if(!$element.hasClass('textfit')) { 
        $element.addClass('textfit');
      }

      // Adding objects for us to work with...
      $element.wrap('<div class="textfit-container"></div>');
      $element.after('<pre class="textfit-sizer"></pre>');

      // We are watching to see if the document.json variable changes... this can happen in the JSON tab...
      scope.$watch(attrs.id, function(newValue, oldValue) {
        //if (newValue) {
          autosize($element, newValue);
        //}
      }, true);
    }
  };

  function autosize($element, newValue) {
    // Copy textarea contents; browser will calculate correct height of copy,
    // which will make overall container taller, which will make textarea taller.
    var text = newValue;//.replace(/\n/g, '<br/>');
    text += '\n'; // Last line break is being ignored, so let's just add one
    //var text = newValue.replace(/\n/g, '</p><p>');
    //$element.parent().children('.textfit-sizer').children('.textfit-sizer-content').html(text);
    $element.parent().children('.textfit-sizer').text(text);
  }
});