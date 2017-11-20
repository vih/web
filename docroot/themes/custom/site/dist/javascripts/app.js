'use strict';

// |--------------------------------------------------------------------------
// | Layout
// |--------------------------------------------------------------------------
// |
// | This jQuery script is written by
// |
// | Morten Nissen
// | hjemmesidekongen.dk
// |
var layout = function ($) {
    'use strict';

    var pub = {},
        $layout__header = $('.layout__header'),
        $layout__document = $('.layout__document'),
        layout_classes = {
        'layout__wrapper': '.layout__wrapper',
        'layout__drawer': '.layout__drawer',
        'layout__header': '.layout__header',
        'layout__obfuscator': '.layout__obfuscator',
        'layout__document': '.layout__document',

        'wrapper_is_upgraded': 'is-upgraded',
        'wrapper_has_drawer': 'has-drawer',
        'wrapper_has_scrolling_header': 'has-scrolling-header',
        'header_scroll': 'layout__header--scroll',
        'header_is_compact': 'is-compact',
        'header_waterfall': 'layout__header--waterfall',
        'drawer_is_visible': 'is-visible',
        'obfuscator_is_visible': 'is-visible'
    };

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
    function registerBootEventHandlers() {

        // Add classes to elements
        addElementClasses();
    }

    /**
     * Register event handlers
     */
    function registerEventHandlers() {

        // Toggle drawer
        $('[data-toggle-drawer]').add($(layout_classes.layout__obfuscator)).on('click touchstart', function (event) {
            event.preventDefault();
            var $element = $(this);

            toggleDrawer($element);
        });

        // Waterfall header
        if ($layout__header.hasClass(layout_classes.header_waterfall)) {

            $layout__document.on('touchmove scroll', function (event) {
                var $document = $(this);

                waterfallHeader($document);
            });
        }
    }

    /**
     * Toggle drawer
     */
    function toggleDrawer($element) {
        var $wrapper = $element.closest(layout_classes.layout__wrapper),
            $obfuscator = $wrapper.children(layout_classes.layout__obfuscator),
            $drawer = $wrapper.children(layout_classes.layout__drawer);

        // Toggle visible state
        $obfuscator.toggleClass(layout_classes.obfuscator_is_visible);
        $drawer.toggleClass(layout_classes.drawer_is_visible);

        // Alter aria-hidden status
        $drawer.attr('aria-hidden', $drawer.hasClass(layout_classes.drawer_is_visible) ? false : true);
    }

    /**
     * Waterfall header
     */
    function waterfallHeader($document) {
        var $wrapper = $document.closest(layout_classes.layout__wrapper),
            $header = $wrapper.children(layout_classes.layout__header),
            distance = $document.scrollTop();

        if (distance > 0) {
            $header.addClass(layout_classes.header_is_compact);
        } else {
            $header.removeClass(layout_classes.header_is_compact);
        }
    }

    /**
     * Add classes to elements, based on attached classes
     */
    function addElementClasses() {

        $(layout_classes.layout__wrapper).each(function (index, element) {
            var $wrapper = $(this),
                $header = $wrapper.children(layout_classes.layout__header),
                $drawer = $wrapper.children(layout_classes.layout__drawer);

            // Scroll header
            if ($header.hasClass(layout_classes.header_scroll)) {
                $wrapper.addClass(layout_classes.wrapper_has_scrolling_header);
            }

            // Drawer
            if ($drawer.length > 0) {
                $wrapper.addClass(layout_classes.wrapper_has_drawer);
            }

            // Upgraded
            if ($wrapper.length > 0) {
                $wrapper.addClass(layout_classes.wrapper_is_upgraded);
            }
        });
    }

    return pub;
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
var jQueryCookies = function ($) {
	'use strict';

	console.log('Cookies were loaded');

	(function (factory) {
		if (typeof define === 'function' && define.amd) {
			// AMD
			define(['jquery'], factory);
		} else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
			// CommonJS
			factory(require('jquery'));
		} else {
			// Browser globals
			factory(jQuery);
		}
	})(function ($) {

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
			} catch (e) {}
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
					var days = options.expires,
					    t = options.expires = new Date();
					t.setTime(+t + days * 864e+5);
				}

				return document.cookie = [encode(key), '=', stringifyCookieValue(value), options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path ? '; path=' + options.path : '', options.domain ? '; domain=' + options.domain : '', options.secure ? '; secure' : ''].join('');
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
	});
}(jQuery);
"use strict";

// |--------------------------------------------------------------------------
// | Modal PopUp
// |--------------------------------------------------------------------------
// |
// | This jQuery script is written by
// | Simon Tofteby
// |

var modalPopUp = function ($) {
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
    $.cookie('no_thanks', 'true', { expires: 36500, path: '/' });
  });

  if ($.cookie("no_thanks") !== true) {
    $("#block-popup-cta").hide();
  }

  return pub;
}(jQuery);
'use strict';

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
  });

  //Show search form block
  $(".search-button").click(function (event) {
    if ($("#search-form-popover").hasClass("hidden")) {
      $("#search-form-popover").removeClass('hidden');
      $(".form-control").focus();
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

  //Improving usability for menudropdowns for mobile devices
  if (!!('ontouchstart' in window)) {
    //check for touch device
    $('li.dropdown.layout-navigation__dropdown').find('> a').click(function (e) {
      if ($(this).parent().hasClass("expanded")) {
        //$(this).parent().removeClass("expanded");
      } else {
        e.preventDefault();
        $(this).parent().addClass("expanded");
      }
    });
  } else {
    //keeping it compatible with desktop devices
    $('li.dropdown.layout-navigation__dropdown').hover(function (e) {
      $(this).addClass("expanded");
    }, function (e) {
      $(this).removeClass("expanded");
    });
  }
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxheW91dC5qcyIsImpxdWVyeS5jb29raWUuanMiLCJtb2RhbC1wb3B1cC5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJsYXlvdXQiLCIkIiwicHViIiwiJGxheW91dF9faGVhZGVyIiwiJGxheW91dF9fZG9jdW1lbnQiLCJsYXlvdXRfY2xhc3NlcyIsImluaXQiLCJvcHRpb25zIiwicmVnaXN0ZXJFdmVudEhhbmRsZXJzIiwicmVnaXN0ZXJCb290RXZlbnRIYW5kbGVycyIsImFkZEVsZW1lbnRDbGFzc2VzIiwiYWRkIiwibGF5b3V0X19vYmZ1c2NhdG9yIiwib24iLCJldmVudCIsInByZXZlbnREZWZhdWx0IiwiJGVsZW1lbnQiLCJ0b2dnbGVEcmF3ZXIiLCJoYXNDbGFzcyIsImhlYWRlcl93YXRlcmZhbGwiLCIkZG9jdW1lbnQiLCJ3YXRlcmZhbGxIZWFkZXIiLCIkd3JhcHBlciIsImNsb3Nlc3QiLCJsYXlvdXRfX3dyYXBwZXIiLCIkb2JmdXNjYXRvciIsImNoaWxkcmVuIiwiJGRyYXdlciIsImxheW91dF9fZHJhd2VyIiwidG9nZ2xlQ2xhc3MiLCJvYmZ1c2NhdG9yX2lzX3Zpc2libGUiLCJkcmF3ZXJfaXNfdmlzaWJsZSIsImF0dHIiLCIkaGVhZGVyIiwibGF5b3V0X19oZWFkZXIiLCJkaXN0YW5jZSIsInNjcm9sbFRvcCIsImFkZENsYXNzIiwiaGVhZGVyX2lzX2NvbXBhY3QiLCJyZW1vdmVDbGFzcyIsImVhY2giLCJpbmRleCIsImVsZW1lbnQiLCJoZWFkZXJfc2Nyb2xsIiwid3JhcHBlcl9oYXNfc2Nyb2xsaW5nX2hlYWRlciIsImxlbmd0aCIsIndyYXBwZXJfaGFzX2RyYXdlciIsIndyYXBwZXJfaXNfdXBncmFkZWQiLCJqUXVlcnkiLCJqUXVlcnlDb29raWVzIiwiY29uc29sZSIsImxvZyIsImZhY3RvcnkiLCJkZWZpbmUiLCJhbWQiLCJleHBvcnRzIiwicmVxdWlyZSIsInBsdXNlcyIsImVuY29kZSIsInMiLCJjb25maWciLCJyYXciLCJlbmNvZGVVUklDb21wb25lbnQiLCJkZWNvZGUiLCJkZWNvZGVVUklDb21wb25lbnQiLCJzdHJpbmdpZnlDb29raWVWYWx1ZSIsInZhbHVlIiwianNvbiIsIkpTT04iLCJzdHJpbmdpZnkiLCJTdHJpbmciLCJwYXJzZUNvb2tpZVZhbHVlIiwiaW5kZXhPZiIsInNsaWNlIiwicmVwbGFjZSIsInBhcnNlIiwiZSIsInJlYWQiLCJjb252ZXJ0ZXIiLCJpc0Z1bmN0aW9uIiwiY29va2llIiwia2V5IiwidW5kZWZpbmVkIiwiZXh0ZW5kIiwiZGVmYXVsdHMiLCJleHBpcmVzIiwiZGF5cyIsInQiLCJEYXRlIiwic2V0VGltZSIsImRvY3VtZW50IiwidG9VVENTdHJpbmciLCJwYXRoIiwiZG9tYWluIiwic2VjdXJlIiwiam9pbiIsInJlc3VsdCIsImNvb2tpZXMiLCJzcGxpdCIsImkiLCJsIiwicGFydHMiLCJuYW1lIiwic2hpZnQiLCJyZW1vdmVDb29raWUiLCJtb2RhbFBvcFVwIiwiaGlkZSIsImRlbGF5IiwiZmFkZUluIiwiY2xpY2siLCJmb2N1cyIsInRhcmdldCIsIndpbmRvdyIsImZpbmQiLCJwYXJlbnQiLCJob3ZlciJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQSxTQUFVLFVBQVVDLENBQVYsRUFBYTtBQUN2Qjs7QUFFQSxRQUFJQyxNQUFNLEVBQVY7QUFBQSxRQUNJQyxrQkFBa0JGLEVBQUUsaUJBQUYsQ0FEdEI7QUFBQSxRQUVJRyxvQkFBb0JILEVBQUUsbUJBQUYsQ0FGeEI7QUFBQSxRQUdJSSxpQkFBaUI7QUFDYiwyQkFBbUIsa0JBRE47QUFFYiwwQkFBa0IsaUJBRkw7QUFHYiwwQkFBa0IsaUJBSEw7QUFJYiw4QkFBc0IscUJBSlQ7QUFLYiw0QkFBb0IsbUJBTFA7O0FBT2IsK0JBQXVCLGFBUFY7QUFRYiw4QkFBc0IsWUFSVDtBQVNiLHdDQUFnQyxzQkFUbkI7QUFVYix5QkFBaUIsd0JBVko7QUFXYiw2QkFBcUIsWUFY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QUYsRUFBUXNDLFdBQVIsQ0FBb0IsVUFBcEI7QUFDRCxLQUxMO0FBT0Q7QUFFRixDQXJERCxFQXFER1MsTUFyREgiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB8IExheW91dFxuLy8gfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB8XG4vLyB8IFRoaXMgalF1ZXJ5IHNjcmlwdCBpcyB3cml0dGVuIGJ5XG4vLyB8XG4vLyB8IE1vcnRlbiBOaXNzZW5cbi8vIHwgaGplbW1lc2lkZWtvbmdlbi5ka1xuLy8gfFxudmFyIGxheW91dCA9IChmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBwdWIgPSB7fSxcbiAgICAgICAgJGxheW91dF9faGVhZGVyID0gJCgnLmxheW91dF9faGVhZGVyJyksXG4gICAgICAgICRsYXlvdXRfX2RvY3VtZW50ID0gJCgnLmxheW91dF9fZG9jdW1lbnQnKSxcbiAgICAgICAgbGF5b3V0X2NsYXNzZXMgPSB7XG4gICAgICAgICAgICAnbGF5b3V0X193cmFwcGVyJzogJy5sYXlvdXRfX3dyYXBwZXInLFxuICAgICAgICAgICAgJ2xheW91dF9fZHJhd2VyJzogJy5sYXlvdXRfX2RyYXdlcicsXG4gICAgICAgICAgICAnbGF5b3V0X19oZWFkZXInOiAnLmxheW91dF9faGVhZGVyJyxcbiAgICAgICAgICAgICdsYXlvdXRfX29iZnVzY2F0b3InOiAnLmxheW91dF9fb2JmdXNjYXRvcicsXG4gICAgICAgICAgICAnbGF5b3V0X19kb2N1bWVudCc6ICcubGF5b3V0X19kb2N1bWVudCcsXG5cbiAgICAgICAgICAgICd3cmFwcGVyX2lzX3VwZ3JhZGVkJzogJ2lzLXVwZ3JhZGVkJyxcbiAgICAgICAgICAgICd3cmFwcGVyX2hhc19kcmF3ZXInOiAnaGFzLWRyYXdlcicsXG4gICAgICAgICAgICAnd3JhcHBlcl9oYXNfc2Nyb2xsaW5nX2hlYWRlcic6ICdoYXMtc2Nyb2xsaW5nLWhlYWRlcicsXG4gICAgICAgICAgICAnaGVhZGVyX3Njcm9sbCc6ICdsYXlvdXRfX2hlYWRlci0tc2Nyb2xsJyxcbiAgICAgICAgICAgICdoZWFkZXJfaXNfY29tcGFjdCc6ICdpcy1jb21wYWN0JyxcbiAgICAgICAgICAgICdoZWFkZXJfd2F0ZXJmYWxsJzogJ2xheW91dF9faGVhZGVyLS13YXRlcmZhbGwnLFxuICAgICAgICAgICAgJ2RyYXdlcl9pc192aXNpYmxlJzogJ2lzLXZpc2libGUnLFxuICAgICAgICAgICAgJ29iZnVzY2F0b3JfaXNfdmlzaWJsZSc6ICdpcy12aXNpYmxlJ1xuICAgICAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5zdGFudGlhdGVcbiAgICAgKi9cbiAgICBwdWIuaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIHJlZ2lzdGVyRXZlbnRIYW5kbGVycygpO1xuICAgICAgICByZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGJvb3QgZXZlbnQgaGFuZGxlcnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzKCkge1xuXG4gICAgICAgIC8vIEFkZCBjbGFzc2VzIHRvIGVsZW1lbnRzXG4gICAgICAgIGFkZEVsZW1lbnRDbGFzc2VzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWdpc3RlckV2ZW50SGFuZGxlcnMoKSB7XG5cbiAgICAgICAgLy8gVG9nZ2xlIGRyYXdlclxuICAgICAgICAkKCdbZGF0YS10b2dnbGUtZHJhd2VyXScpLmFkZCgkKGxheW91dF9jbGFzc2VzLmxheW91dF9fb2JmdXNjYXRvcikpLm9uKCdjbGljayB0b3VjaHN0YXJ0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICB0b2dnbGVEcmF3ZXIoJGVsZW1lbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBXYXRlcmZhbGwgaGVhZGVyXG4gICAgICAgIGlmICgkbGF5b3V0X19oZWFkZXIuaGFzQ2xhc3MobGF5b3V0X2NsYXNzZXMuaGVhZGVyX3dhdGVyZmFsbCkpIHtcblxuICAgICAgICAgICAgJGxheW91dF9fZG9jdW1lbnQub24oJ3RvdWNobW92ZSBzY3JvbGwnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciAkZG9jdW1lbnQgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgd2F0ZXJmYWxsSGVhZGVyKCRkb2N1bWVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBkcmF3ZXJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0b2dnbGVEcmF3ZXIoJGVsZW1lbnQpIHtcbiAgICAgICAgdmFyICR3cmFwcGVyID0gJGVsZW1lbnQuY2xvc2VzdChsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX3dyYXBwZXIpLFxuICAgICAgICAgICAgJG9iZnVzY2F0b3IgPSAkd3JhcHBlci5jaGlsZHJlbihsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX29iZnVzY2F0b3IpLFxuICAgICAgICAgICAgJGRyYXdlciA9ICR3cmFwcGVyLmNoaWxkcmVuKGxheW91dF9jbGFzc2VzLmxheW91dF9fZHJhd2VyKTtcblxuICAgICAgICAvLyBUb2dnbGUgdmlzaWJsZSBzdGF0ZVxuICAgICAgICAkb2JmdXNjYXRvci50b2dnbGVDbGFzcyhsYXlvdXRfY2xhc3Nlcy5vYmZ1c2NhdG9yX2lzX3Zpc2libGUpO1xuICAgICAgICAkZHJhd2VyLnRvZ2dsZUNsYXNzKGxheW91dF9jbGFzc2VzLmRyYXdlcl9pc192aXNpYmxlKTtcblxuICAgICAgICAvLyBBbHRlciBhcmlhLWhpZGRlbiBzdGF0dXNcbiAgICAgICAgJGRyYXdlci5hdHRyKCdhcmlhLWhpZGRlbicsICgkZHJhd2VyLmhhc0NsYXNzKGxheW91dF9jbGFzc2VzLmRyYXdlcl9pc192aXNpYmxlKSkgPyBmYWxzZSA6IHRydWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGVyZmFsbCBoZWFkZXJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB3YXRlcmZhbGxIZWFkZXIoJGRvY3VtZW50KSB7XG4gICAgICAgIHZhciAkd3JhcHBlciA9ICRkb2N1bWVudC5jbG9zZXN0KGxheW91dF9jbGFzc2VzLmxheW91dF9fd3JhcHBlciksXG4gICAgICAgICAgICAkaGVhZGVyID0gJHdyYXBwZXIuY2hpbGRyZW4obGF5b3V0X2NsYXNzZXMubGF5b3V0X19oZWFkZXIpLFxuICAgICAgICAgICAgZGlzdGFuY2UgPSAkZG9jdW1lbnQuc2Nyb2xsVG9wKCk7XG5cbiAgICAgICAgaWYgKGRpc3RhbmNlID4gMCkge1xuICAgICAgICAgICAgJGhlYWRlci5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy5oZWFkZXJfaXNfY29tcGFjdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAkaGVhZGVyLnJlbW92ZUNsYXNzKGxheW91dF9jbGFzc2VzLmhlYWRlcl9pc19jb21wYWN0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBjbGFzc2VzIHRvIGVsZW1lbnRzLCBiYXNlZCBvbiBhdHRhY2hlZCBjbGFzc2VzXG4gICAgICovXG4gICAgZnVuY3Rpb24gYWRkRWxlbWVudENsYXNzZXMoKSB7XG5cbiAgICAgICAgJChsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX3dyYXBwZXIpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciAkd3JhcHBlciA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgJGhlYWRlciA9ICR3cmFwcGVyLmNoaWxkcmVuKGxheW91dF9jbGFzc2VzLmxheW91dF9faGVhZGVyKSxcbiAgICAgICAgICAgICAgICAkZHJhd2VyID0gJHdyYXBwZXIuY2hpbGRyZW4obGF5b3V0X2NsYXNzZXMubGF5b3V0X19kcmF3ZXIpO1xuXG4gICAgICAgICAgICAvLyBTY3JvbGwgaGVhZGVyXG4gICAgICAgICAgICBpZiAoJGhlYWRlci5oYXNDbGFzcyhsYXlvdXRfY2xhc3Nlcy5oZWFkZXJfc2Nyb2xsKSkge1xuICAgICAgICAgICAgICAgICR3cmFwcGVyLmFkZENsYXNzKGxheW91dF9jbGFzc2VzLndyYXBwZXJfaGFzX3Njcm9sbGluZ19oZWFkZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEcmF3ZXJcbiAgICAgICAgICAgIGlmICgkZHJhd2VyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAkd3JhcHBlci5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy53cmFwcGVyX2hhc19kcmF3ZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVcGdyYWRlZFxuICAgICAgICAgICAgaWYgKCR3cmFwcGVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAkd3JhcHBlci5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy53cmFwcGVyX2lzX3VwZ3JhZGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHB1Yjtcbn0pKGpRdWVyeSk7XG4iLCIvKiFcbiAqIGpRdWVyeSBDb29raWUgUGx1Z2luIHYxLjQuMVxuICogaHR0cHM6Ly9naXRodWIuY29tL2NhcmhhcnRsL2pxdWVyeS1jb29raWVcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMyBLbGF1cyBIYXJ0bFxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbnZhciBqUXVlcnlDb29raWVzID0gKGZ1bmN0aW9uICgkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKCdDb29raWVzIHdlcmUgbG9hZGVkJyk7XG5cbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0Ly8gQU1EXG5cdFx0ZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuXHRcdC8vIENvbW1vbkpTXG5cdFx0ZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gQnJvd3NlciBnbG9iYWxzXG5cdFx0ZmFjdG9yeShqUXVlcnkpO1xuXHR9XG59KGZ1bmN0aW9uICgkKSB7XG5cblx0dmFyIHBsdXNlcyA9IC9cXCsvZztcblxuXHRmdW5jdGlvbiBlbmNvZGUocykge1xuXHRcdHJldHVybiBjb25maWcucmF3ID8gcyA6IGVuY29kZVVSSUNvbXBvbmVudChzKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlY29kZShzKSB7XG5cdFx0cmV0dXJuIGNvbmZpZy5yYXcgPyBzIDogZGVjb2RlVVJJQ29tcG9uZW50KHMpO1xuXHR9XG5cblx0ZnVuY3Rpb24gc3RyaW5naWZ5Q29va2llVmFsdWUodmFsdWUpIHtcblx0XHRyZXR1cm4gZW5jb2RlKGNvbmZpZy5qc29uID8gSlNPTi5zdHJpbmdpZnkodmFsdWUpIDogU3RyaW5nKHZhbHVlKSk7XG5cdH1cblxuXHRmdW5jdGlvbiBwYXJzZUNvb2tpZVZhbHVlKHMpIHtcblx0XHRpZiAocy5pbmRleE9mKCdcIicpID09PSAwKSB7XG5cdFx0XHQvLyBUaGlzIGlzIGEgcXVvdGVkIGNvb2tpZSBhcyBhY2NvcmRpbmcgdG8gUkZDMjA2OCwgdW5lc2NhcGUuLi5cblx0XHRcdHMgPSBzLnNsaWNlKDEsIC0xKS5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykucmVwbGFjZSgvXFxcXFxcXFwvZywgJ1xcXFwnKTtcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0Ly8gUmVwbGFjZSBzZXJ2ZXItc2lkZSB3cml0dGVuIHBsdXNlcyB3aXRoIHNwYWNlcy5cblx0XHRcdC8vIElmIHdlIGNhbid0IGRlY29kZSB0aGUgY29va2llLCBpZ25vcmUgaXQsIGl0J3MgdW51c2FibGUuXG5cdFx0XHQvLyBJZiB3ZSBjYW4ndCBwYXJzZSB0aGUgY29va2llLCBpZ25vcmUgaXQsIGl0J3MgdW51c2FibGUuXG5cdFx0XHRzID0gZGVjb2RlVVJJQ29tcG9uZW50KHMucmVwbGFjZShwbHVzZXMsICcgJykpO1xuXHRcdFx0cmV0dXJuIGNvbmZpZy5qc29uID8gSlNPTi5wYXJzZShzKSA6IHM7XG5cdFx0fSBjYXRjaChlKSB7fVxuXHR9XG5cblx0ZnVuY3Rpb24gcmVhZChzLCBjb252ZXJ0ZXIpIHtcblx0XHR2YXIgdmFsdWUgPSBjb25maWcucmF3ID8gcyA6IHBhcnNlQ29va2llVmFsdWUocyk7XG5cdFx0cmV0dXJuICQuaXNGdW5jdGlvbihjb252ZXJ0ZXIpID8gY29udmVydGVyKHZhbHVlKSA6IHZhbHVlO1xuXHR9XG5cblx0dmFyIGNvbmZpZyA9ICQuY29va2llID0gZnVuY3Rpb24gKGtleSwgdmFsdWUsIG9wdGlvbnMpIHtcblxuXHRcdC8vIFdyaXRlXG5cblx0XHRpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiAhJC5pc0Z1bmN0aW9uKHZhbHVlKSkge1xuXHRcdFx0b3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBjb25maWcuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMuZXhwaXJlcyA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0dmFyIGRheXMgPSBvcHRpb25zLmV4cGlyZXMsIHQgPSBvcHRpb25zLmV4cGlyZXMgPSBuZXcgRGF0ZSgpO1xuXHRcdFx0XHR0LnNldFRpbWUoK3QgKyBkYXlzICogODY0ZSs1KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIChkb2N1bWVudC5jb29raWUgPSBbXG5cdFx0XHRcdGVuY29kZShrZXkpLCAnPScsIHN0cmluZ2lmeUNvb2tpZVZhbHVlKHZhbHVlKSxcblx0XHRcdFx0b3B0aW9ucy5leHBpcmVzID8gJzsgZXhwaXJlcz0nICsgb3B0aW9ucy5leHBpcmVzLnRvVVRDU3RyaW5nKCkgOiAnJywgLy8gdXNlIGV4cGlyZXMgYXR0cmlidXRlLCBtYXgtYWdlIGlzIG5vdCBzdXBwb3J0ZWQgYnkgSUVcblx0XHRcdFx0b3B0aW9ucy5wYXRoICAgID8gJzsgcGF0aD0nICsgb3B0aW9ucy5wYXRoIDogJycsXG5cdFx0XHRcdG9wdGlvbnMuZG9tYWluICA/ICc7IGRvbWFpbj0nICsgb3B0aW9ucy5kb21haW4gOiAnJyxcblx0XHRcdFx0b3B0aW9ucy5zZWN1cmUgID8gJzsgc2VjdXJlJyA6ICcnXG5cdFx0XHRdLmpvaW4oJycpKTtcblx0XHR9XG5cblx0XHQvLyBSZWFkXG5cblx0XHR2YXIgcmVzdWx0ID0ga2V5ID8gdW5kZWZpbmVkIDoge307XG5cblx0XHQvLyBUbyBwcmV2ZW50IHRoZSBmb3IgbG9vcCBpbiB0aGUgZmlyc3QgcGxhY2UgYXNzaWduIGFuIGVtcHR5IGFycmF5XG5cdFx0Ly8gaW4gY2FzZSB0aGVyZSBhcmUgbm8gY29va2llcyBhdCBhbGwuIEFsc28gcHJldmVudHMgb2RkIHJlc3VsdCB3aGVuXG5cdFx0Ly8gY2FsbGluZyAkLmNvb2tpZSgpLlxuXHRcdHZhciBjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7ICcpIDogW107XG5cblx0XHRmb3IgKHZhciBpID0gMCwgbCA9IGNvb2tpZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHR2YXIgcGFydHMgPSBjb29raWVzW2ldLnNwbGl0KCc9Jyk7XG5cdFx0XHR2YXIgbmFtZSA9IGRlY29kZShwYXJ0cy5zaGlmdCgpKTtcblx0XHRcdHZhciBjb29raWUgPSBwYXJ0cy5qb2luKCc9Jyk7XG5cblx0XHRcdGlmIChrZXkgJiYga2V5ID09PSBuYW1lKSB7XG5cdFx0XHRcdC8vIElmIHNlY29uZCBhcmd1bWVudCAodmFsdWUpIGlzIGEgZnVuY3Rpb24gaXQncyBhIGNvbnZlcnRlci4uLlxuXHRcdFx0XHRyZXN1bHQgPSByZWFkKGNvb2tpZSwgdmFsdWUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblxuXHRcdFx0Ly8gUHJldmVudCBzdG9yaW5nIGEgY29va2llIHRoYXQgd2UgY291bGRuJ3QgZGVjb2RlLlxuXHRcdFx0aWYgKCFrZXkgJiYgKGNvb2tpZSA9IHJlYWQoY29va2llKSkgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRyZXN1bHRbbmFtZV0gPSBjb29raWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblxuXHRjb25maWcuZGVmYXVsdHMgPSB7fTtcblxuXHQkLnJlbW92ZUNvb2tpZSA9IGZ1bmN0aW9uIChrZXksIG9wdGlvbnMpIHtcblx0XHRpZiAoJC5jb29raWUoa2V5KSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gTXVzdCBub3QgYWx0ZXIgb3B0aW9ucywgdGh1cyBleHRlbmRpbmcgYSBmcmVzaCBvYmplY3QuLi5cblx0XHQkLmNvb2tpZShrZXksICcnLCAkLmV4dGVuZCh7fSwgb3B0aW9ucywgeyBleHBpcmVzOiAtMSB9KSk7XG5cdFx0cmV0dXJuICEkLmNvb2tpZShrZXkpO1xuXHR9O1xuXG59KSk7XG4gICAgXG4gICAgXG59KShqUXVlcnkpOyIsIi8vIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gfCBNb2RhbCBQb3BVcFxuLy8gfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB8XG4vLyB8IFRoaXMgalF1ZXJ5IHNjcmlwdCBpcyB3cml0dGVuIGJ5XG4vLyB8IFNpbW9uIFRvZnRlYnlcbi8vIHxcblxudmFyIG1vZGFsUG9wVXAgPSAoZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBwdWIgPSB7fTtcblxuICAvKipcbiAgICogSW5zdGFudGlhdGVcbiAgICovXG4gIHB1Yi5pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICByZWdpc3RlckV2ZW50SGFuZGxlcnMoKTtcbiAgICByZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGJvb3QgZXZlbnQgaGFuZGxlcnNcbiAgICovXG4gIGZ1bmN0aW9uIHJlZ2lzdGVyQm9vdEV2ZW50SGFuZGxlcnMoKSB7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnNcbiAgICovXG4gIGZ1bmN0aW9uIHJlZ2lzdGVyRXZlbnRIYW5kbGVycygpIHtcblxuICAgIC8vSW5zZXJ0IGJlbG93XG4gICAgaWYgKCQuY29va2llKFwibm9fdGhhbmtzXCIpID09IG51bGwpIHtcblxuICAgICAgLy8gSGlkZSB0aGUgZGl2XG4gICAgICAkKFwiI2Jsb2NrLXBvcHVwLWN0YVwiKS5oaWRlKCk7XG5cbiAgICAgIC8vIFNob3cgdGhlIGRpdiBpbiA1c1xuICAgICAgJChcIiNibG9jay1wb3B1cC1jdGFcIikuZGVsYXkoMTAwMDApLmZhZGVJbigzMDApO1xuXG4gICAgICAvL0Nsb3NlIGRpdlxuICAgICAgJChcIi5jbG9zZVwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoXCIjYmxvY2stcG9wdXAtY3RhXCIpLmhpZGUoKTtcblxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgJChcIi5jbG9zZVwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgJC5jb29raWUoJ25vX3RoYW5rcycsICd0cnVlJywge2V4cGlyZXM6IDM2NTAwLCBwYXRoOiAnLyd9KTtcbiAgfSk7XG5cbiAgaWYgKCQuY29va2llKFwibm9fdGhhbmtzXCIpICE9PSB0cnVlKSB7XG4gICAgJChcIiNibG9jay1wb3B1cC1jdGFcIikuaGlkZSgpO1xuICB9XG5cbiAgcmV0dXJuIHB1Yjtcbn0pKGpRdWVyeSk7XG4iLCIvLyBEb2N1bWVudCByZWFkeVxuKGZ1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBFbmFibGUgbGF5b3V0XG4gIGxheW91dC5pbml0KCk7XG5cbiAgLy9Nb2RhbCBQb3BVcFxuICBtb2RhbFBvcFVwLmluaXQoKTtcblxuICAkKFwiI3RvZ2dsZV9tb2JpbGVfbWVudVwiKS5jbGljayhmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAkKCcjbWFpbi1tZW51JykudG9nZ2xlQ2xhc3MoJ21vYmlsZS1tZW51LW9wZW4nKTtcbiAgICAkKCcubGF5b3V0X19kb2N1bWVudCcpLnRvZ2dsZUNsYXNzKCdtb2JpbGUtbWVudS1vcGVuJyk7XG4gIH0pXG5cbi8vU2hvdyBzZWFyY2ggZm9ybSBibG9ja1xuICAkKFwiLnNlYXJjaC1idXR0b25cIikuY2xpY2soZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKCQoXCIjc2VhcmNoLWZvcm0tcG9wb3ZlclwiKS5oYXNDbGFzcyhcImhpZGRlblwiKSkge1xuICAgICAgJChcIiNzZWFyY2gtZm9ybS1wb3BvdmVyXCIpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoXCIuZm9ybS1jb250cm9sXCIpLmZvY3VzKCk7XG4gICAgfVxuICB9KTtcblxuLy9IaWRlIHNlYXJjaCBmb3JtIGJsb2NrXG4gICQoZG9jdW1lbnQpLmNsaWNrKGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmICghJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJyNzZWFyY2gtZm9ybS1wb3BvdmVyJykubGVuZ3RoICYmICEkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnNlYXJjaC1idXR0b24nKS5sZW5ndGgpIHtcbiAgICAgIGlmICghJChcIiNzZWFyY2gtZm9ybS1wb3BvdmVyXCIpLmhhc0NsYXNzKFwiaGlkZGVuXCIpKSB7XG4gICAgICAgICQoXCIjc2VhcmNoLWZvcm0tcG9wb3ZlclwiKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAvL0ltcHJvdmluZyB1c2FiaWxpdHkgZm9yIG1lbnVkcm9wZG93bnMgZm9yIG1vYmlsZSBkZXZpY2VzXG4gIGlmICghISgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpKSB7Ly9jaGVjayBmb3IgdG91Y2ggZGV2aWNlXG4gICAgJCgnbGkuZHJvcGRvd24ubGF5b3V0LW5hdmlnYXRpb25fX2Ryb3Bkb3duJykuZmluZCgnPiBhJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgIGlmICgkKHRoaXMpLnBhcmVudCgpLmhhc0NsYXNzKFwiZXhwYW5kZWRcIikpIHtcbiAgICAgICAgLy8kKHRoaXMpLnBhcmVudCgpLnJlbW92ZUNsYXNzKFwiZXhwYW5kZWRcIik7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmFkZENsYXNzKFwiZXhwYW5kZWRcIik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgZWxzZSB7Ly9rZWVwaW5nIGl0IGNvbXBhdGlibGUgd2l0aCBkZXNrdG9wIGRldmljZXNcbiAgICAkKCdsaS5kcm9wZG93bi5sYXlvdXQtbmF2aWdhdGlvbl9fZHJvcGRvd24nKS5ob3ZlcihcbiAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKFwiZXhwYW5kZWRcIik7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImV4cGFuZGVkXCIpO1xuICAgICAgICB9XG4gICAgKTtcbiAgfVxuXG59KShqUXVlcnkpO1xuIl19
