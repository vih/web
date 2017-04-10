// Document ready
(function ($) {
    'use strict';

    // Enable layout
    layout.init();

    //Modal PopUp
    modalPopUp.init();

    $("#toggle_mobile_menu").click(function(event){
      $('#main-menu').toggleClass('mobile-menu-open');
      $('.layout__document').toggleClass('mobile-menu-open');
    })
    $(".search-button").popover({
    html : true,
    trigger: 'click',
    placement : 'bottom',
    content: function() {
      return $("#search-form-popover").html();
    }
  });


})(jQuery);
