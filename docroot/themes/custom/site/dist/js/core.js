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

/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
var jQueryCookies = (function ($) {
    'use strict';
    
    console.log('Cookies were loaded');

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (value !== undefined && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));
    
    
})(jQuery);

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

// Document ready
(function ($) {
    'use strict';

    // Enable layout
    layout.init();
    
    //Modal PopUp
    modalPopUp.init();

})(jQuery);

//# sourceMappingURL=core.js.map