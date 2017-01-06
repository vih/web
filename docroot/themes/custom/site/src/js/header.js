// |--------------------------------------------------------------------------
// | Header
// |--------------------------------------------------------------------------
// |
// | This jQuery script is written by
// | Morten Nissen
// |

var header = (function ($) {
    'use strict';

    var pub = {};

    /**
     * Instantiate
     */
    pub.init = function () {
        registerBootEventHandlers();
        registerEventHandlers();
    };

    /**
     * Register boot event handlers
     */
    function registerBootEventHandlers() {}

    /**
     * Register event handlers
     */
    function registerEventHandlers() {

        if ( ! Modernizr.touchevents) {
            var $element = $('#header'),
                scrollTop     = $(window).scrollTop(),
                elementOffset = $element.find('.header-bottom-inner').offset().top,
                distance      = (elementOffset - scrollTop);

            $element.sticky({
                topSpacing: 0,
                className: 'header-is-sticky'
            });
        }
    }

    return pub;
})(jQuery);
