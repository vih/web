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
        $wrapper = $('.layout-wrapper'),
        $drawer = $('.layout-drawer'),
        $header = $('.layout-header'),
        $obfuscator = $('.layout-obfuscator'),
        $document = $('.layout-document');

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
