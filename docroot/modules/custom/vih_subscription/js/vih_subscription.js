(function ($, Drupal, drupalSettings) {
    'use strict';

    Drupal.behaviors.accordionClassSelection = {
        attach: function (context, settings) {

            $('.btn-radio-select').once('vih-subscription').click(function(){
                var classSelectionContainer = $(this).closest('.class-selection');

                var parentPanel = classSelectionContainer.closest('.panel');
                var parentPanelHeading = parentPanel.find('.panel-heading');
                var allClassesContainer = parentPanel.find('.all-classes-container');

                //removing if we had any previous selection = class outside the collapsible area
                if (parentPanelHeading.next('.class-selection')) {
                    parentPanelHeading.next('.class-selection').detach().appendTo(allClassesContainer);
                }

                //moving the selected class outside the collapsible area
                classSelectionContainer.insertAfter(parentPanelHeading);

                //collapsing this panel
                parentPanel.find('.panel-collapse').collapse("hide");

                //expanding next panel
                parentPanel.nextAll('.panel').first().find('.panel-collapse').collapse("show");
            });
        }
    };
})(jQuery, Drupal, drupalSettings);