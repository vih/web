// |--------------------------------------------------------------------------
// | Blur on scroll
// |--------------------------------------------------------------------------
// |
// | Blurs a background image upon scroll.
// |
// | This jQuery script is written by
// | Simon Tofteby
// |
var blurOnScroll = (function ($) {
    'use strict';

    var pub = {};

    /**
     * Instantiate
     */
    pub.init = function (options) {
        registerEventHandlers();
        registerBootEventHandlers();
    };

    /**
     * Register boot event handlers
     */
    function registerBootEventHandlers() {}

    /**
     * Register event handlers
     */
    function registerEventHandlers() {
            console.log('Function was loaded');
        
        // Detect scroll
        $('.layout__document').scroll(function(e) {
            var s = $('.layout__document').scrollTop(),
                opacityVal = (s / 200);
            
        

            $('.blur').css('opacity', opacityVal);
        });
    }

    return pub;
})(jQuery);


//jQuery(document).ready(function($){
//
//   $(document).ready(function() {
//    $(window).scroll(function(e) {
//        var s = $(window).scrollTop(),
//            opacityVal = (s / 200);
//
//        $('.blur').css('opacity', opacityVal);
//    });
//});
//    });
