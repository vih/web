// Document ready
(function ($) {
    'use strict';

    // Enable layout
    layout.init();
    
    //Modal PopUp
    modalPopUp.init();
    
    $(".search-button").popover({     
    html : true,
    trigger: 'click',
    placement : 'bottom',
    content: function() {
      return $("#search-form-popover").html();
    }
          
});

})(jQuery);
