// Document ready
(function ($) {
  'use strict';

  // Enable layout
  layout.init();

  //Modal PopUp
  modalPopUp.init();

  $("#toggle_mobile_menu").click(function (event) {
    $('#main-menu').toggleClass('mobile-menu-open');
    $('.layout__document').toggleClass('mobile-menu-open');

  })

//Show search form block
  $(".search-button").click(function (event) {
    if ($("#search-form-popover").hasClass("hidden")) {
      $("#search-form-popover").removeClass('hidden');
    }
  });

//Hide search form block
  $(document).click(function (event) {
    if (!$(event.target).closest('#search-form-popover').length && !$(event.target).closest('.search-button').length) {
      if (!$("#search-form-popover").hasClass("hidden")) {
        $("#search-form-popover").addClass('hidden');
      }
    }
  });

})(jQuery);
