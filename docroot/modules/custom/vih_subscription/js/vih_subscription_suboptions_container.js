(function ($, Drupal, drupalSettings) {
  'use strict';

  Drupal.behaviors.moveSuboptionsContainer = {
    attach: function (context, settings) {
        $.fn.moveSuboptionsContainer = function(data) {
            $('.vih-suboptions-container').each(function() {
                var optionGroupDelta = $(this).data('option-group-delta');
                var optionDelta = $(this).data('option-delta');

                var parentContainer = $("input[name='availableOptionsContainer[optionGroups][" + optionGroupDelta + "][option]'][value='" + optionDelta +"']").closest('.form-item');

                if (parentContainer.length) {
                    $(this).detach().appendTo(parentContainer);
                }
            });
        };
        $.fn.moveSuboptionsContainer();
    }

  };
})(jQuery, Drupal, drupalSettings);
