(function ($, Drupal, drupalSettings) {
    'use strict';

    Drupal.behaviors.accordionClassSelection = {
        attach: function (context, settings) {
            var $buttons = $('.btn-radio-select');

            // Run through all buttons to check if any has a selected radio button inside
            // If so, we can add an active class to the button
            $buttons.each(function(index, item) {
                var $element = $(this),
                    $radio = $element.find('input[type=radio]');

                if ($radio.is(':checked')) {
                    $element.addClass('active');
                }
            });

            $buttons.once('vih-subscription').click(function(event) {
                var $element = $(this),
                    $wrapper = $element.parents('.panel-group'),
                    $period = $element.parents('.panel'),
                    $period_heading = $period.find('.panel-heading'),
                    $period_body = $period.find('.panel-body'),
                    $selected_class = $element.parents('.class-selection'),
                    $buttons = $period.find('.btn-radio-select');

                // Move old selections back inside the body again
                // if ($period_heading.next('.class-selection')) {
                //     var $old_class = $period_heading.next('.class-selection'),
                //         $old_class_button = $old_class.find('.btn');
                //
                //     $old_class_button.removeClass('active');
                //
                //     $old_class
                //         .detach()
                //         .appendTo($period_body);
                // }

                // // Move the selected class outside of panel-body so it's always displayed.
                // $selected_class
                //     .insertAfter($period_heading);

                $buttons
                    .removeClass('active');

                $element
                    .addClass('active')
                    .find('input[type=radio]')
                    .prop('checked', true);

                // // collapsing this panel
                // $period
                //     .find('.panel-collapse')
                //     .collapse('hide');
                //
                // // expanding next panel
                // $period
                //     .nextAll('.panel')
                //     .first()
                //     .find('.panel-collapse')
                //     .collapse('show');
            });
        }
    };
})(jQuery, Drupal, drupalSettings);
