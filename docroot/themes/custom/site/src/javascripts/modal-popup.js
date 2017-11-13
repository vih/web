// |--------------------------------------------------------------------------
// | Modal PopUp
// |--------------------------------------------------------------------------
// |
// | Blurs a background image upon scroll.
// |
// | This jQuery script is written by
// | Simon Tofteby
// |

var modalPopUp = (function ($) {
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

        //Insert below
        if ($.cookie("no_thanks") == null) {

            // Hide the div
            $("#block-popup-cta").hide();

            // Show the div in 5s
            $("#block-popup-cta").delay(10000).fadeIn(300);

            //Close div
            $(".close").click(function () {
                $("#block-popup-cta").hide();

            });


        }
    }

    $(".close").click(function () {
        $.cookie('no_thanks', 'true', {expires: 36500, path: '/'});
    });

    if ($.cookie("no_thanks") !== true) {
        $("#block-popup-cta").hide();
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
