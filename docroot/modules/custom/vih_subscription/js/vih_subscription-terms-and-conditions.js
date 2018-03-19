(function ($, Drupal, drupalSettings) {
  'use strict';

// Add custom class to terms and conditions modal
  var modalClass;

  $(document).on("mousedown", ".use-ajax", function () {
    modalClass = $(this).data('dialog-class');
    $(document).on('show.bs.modal', '.modal', function () {
      $(this).addClass(modalClass);
    })
  });

  // Add this part to remove the class when the modal is closed.
  $(document).on('hide.bs.modal', '.modal', function () {
    $(this).removeClass(modalClass);
  });

})(jQuery, Drupal, drupalSettings);
