(function ($, Drupal, drupalSettings) {
    'use strict';

    Drupal.behaviors.accordionClassSelection = {
        attach: function (context, settings) {

            $('.btn-radio-select').once('vih-subscription').click(function(event) {
                var $element = $(this),
                    $wrapper = $element.parents('.panel-group'),
                    $period = $element.parents('.panel'),
                    $period_heading = $period.find('.panel-heading'),
                    $period_body = $period.find('.panel-body'),
                    $selected_class = $element.parents('.class-selection');

                // Move old selections back inside the body again
                if ($period_heading.next('.class-selection')) {
                    var $old_class = $period_heading.next('.class-selection'),
                        $old_class_button = $old_class.find('.btn');

                    $old_class_button.removeClass('active');

                    $old_class
                        .detach()
                        .appendTo($period_body);
                }

                // Move the selected class outside of panel-body so it's always displayed.
                $selected_class
                    .insertAfter($period_heading);

                $element
                    .addClass('active');

                // collapsing this panel
                $period
                    .find('.panel-collapse')
                    .collapse('hide');

                // expanding next panel
                $period
                    .nextAll('.panel')
                    .first()
                    .find('.panel-collapse')
                    .collapse('show');
            });
        }
    };
})(jQuery, Drupal, drupalSettings);
