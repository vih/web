// |--------------------------------------------------------------------------
// | BS3 sidebar
// |--------------------------------------------------------------------------
// |
// | App alike navigation with sidebar.
// |
// | This jQuery script is written by
// | Morten Nissen
// |
var layout = (function ($) {
    'use strict';

    var pub = {},
        $wrapper = $('.layout__wrapper'),
        $drawer = $('.layout__drawer'),
        $header = $('.layout__header'),
        $obfuscator = $('.layout__obfuscator'),
        $document = $('.layout__document');

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

        // Toggle drawer
        $('[data-toggle-drawer]').on('click touchstart', function(event) {
            event.preventDefault();
            var $element = $(this);

            toggleDrawer($element);
        });

        // Waterfall header
        waterfallHeader();
    }

    /**
     * Toggle drawer
     */
    function toggleDrawer($element) {
        var drawer_status = ($drawer.hasClass('is-visible')) ? 'open' : 'closed',
            aria_hidden_status = (drawer_status == 'open') ? false : true;

        // Toggle visible state
        $obfuscator.toggleClass('is-visible');
        $drawer.toggleClass('is-visible');

        // Alter aria-hidden status
        $drawer.attr('aria-hidden', aria_hidden_status);
    }

    /**
     * Waterfall header
      */
    function waterfallHeader() {
    }

    return pub;
})(jQuery);

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
            
            console.log('Window was scrolled');
            console.log(s);
            console.log(opacityVal);

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

// Document ready
(function ($) {
    'use strict';

    // Enable layout
    layout.init();
    
    // Enable blur on scroll
    blurOnScroll.init();

})(jQuery);

//# sourceMappingURL=core.js.map