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

    var pub = {};

    /**
     * Instantiate
     */
    pub.init = function (options) {
        registerEventHandlers();
        registerBootEventHandlers();
    };

    /**
     * Register event handlers
     */
    function registerEventHandlers() {

        // Toggle drawer
        $('[data-toggle-drawer], .layout-obfuscator').on('click touchstart', function(event) {
            event.preventDefault();
            var $element = $(this);

            toggleDrawer($element);
        });
    }

    /**
     * Register boot event handlers
     */
    function registerBootEventHandlers() {

    }

    function toggleDrawer($element) {
        var $obfuscator = $('.layout-obfuscator'),
            $drawer = $('.layout-drawer'),
            drawer_status = ($drawer.hasClass('is-visible')) ? 'open' : 'closed',
            aria_hidden_status = (drawer_status == 'open') ? false : true;

        // Toggle visible state
        $obfuscator.toggleClass('is-visible');
        $drawer.toggleClass('is-visible');

        // Alter aria-hidden status
        $drawer.attr('aria-hidden', aria_hidden_status);
    }

    return pub;
})(jQuery);
