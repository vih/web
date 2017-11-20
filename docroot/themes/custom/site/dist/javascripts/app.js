'use strict';

/* ========================================================================
 * Bootstrap: tab.js v3.3.7
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function Tab(element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element);
    // jscs:enable requireDollarBeforejQueryAssignment
  };

  Tab.VERSION = '3.3.7';

  Tab.TRANSITION_DURATION = 150;

  Tab.prototype.show = function () {
    var $this = this.element;
    var $ul = $this.closest('ul:not(.dropdown-menu)');
    var selector = $this.data('target');

    if (!selector) {
      selector = $this.attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return;

    var $previous = $ul.find('.active:last a');
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    });
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    });

    $previous.trigger(hideEvent);
    $this.trigger(showEvent);

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return;

    var $target = $(selector);

    this.activate($this.closest('li'), $ul);
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      });
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      });
    });
  };

  Tab.prototype.activate = function (element, container, callback) {
    var $active = container.find('> .active');
    var transition = callback && $.support.transition && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length);

    function next() {
      $active.removeClass('active').find('> .dropdown-menu > .active').removeClass('active').end().find('[data-toggle="tab"]').attr('aria-expanded', false);

      element.addClass('active').find('[data-toggle="tab"]').attr('aria-expanded', true);

      if (transition) {
        element[0].offsetWidth; // reflow for transition
        element.addClass('in');
      } else {
        element.removeClass('fade');
      }

      if (element.parent('.dropdown-menu').length) {
        element.closest('li.dropdown').addClass('active').end().find('[data-toggle="tab"]').attr('aria-expanded', true);
      }

      callback && callback();
    }

    $active.length && transition ? $active.one('bsTransitionEnd', next).emulateTransitionEnd(Tab.TRANSITION_DURATION) : next();

    $active.removeClass('in');
  };

  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.tab');

      if (!data) $this.data('bs.tab', data = new Tab(this));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.tab;

  $.fn.tab = Plugin;
  $.fn.tab.Constructor = Tab;

  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old;
    return this;
  };

  // TAB DATA-API
  // ============

  var clickHandler = function clickHandler(e) {
    e.preventDefault();
    Plugin.call($(this), 'show');
  };

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler).on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler);
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* ========================================================================
 * Bootstrap: collapse.js v3.3.7
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

/* jshint latedef: false */

+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function Collapse(element, options) {
    this.$element = $(element);
    this.options = $.extend({}, Collapse.DEFAULTS, options);
    this.$trigger = $('[data-toggle="collapse"][href="#' + element.id + '"],' + '[data-toggle="collapse"][data-target="#' + element.id + '"]');
    this.transitioning = null;

    if (this.options.parent) {
      this.$parent = this.getParent();
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger);
    }

    if (this.options.toggle) this.toggle();
  };

  Collapse.VERSION = '3.3.7';

  Collapse.TRANSITION_DURATION = 350;

  Collapse.DEFAULTS = {
    toggle: true
  };

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width');
    return hasWidth ? 'width' : 'height';
  };

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return;

    var activesData;
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing');

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse');
      if (activesData && activesData.transitioning) return;
    }

    var startEvent = $.Event('show.bs.collapse');
    this.$element.trigger(startEvent);
    if (startEvent.isDefaultPrevented()) return;

    if (actives && actives.length) {
      Plugin.call(actives, 'hide');
      activesData || actives.data('bs.collapse', null);
    }

    var dimension = this.dimension();

    this.$element.removeClass('collapse').addClass('collapsing')[dimension](0).attr('aria-expanded', true);

    this.$trigger.removeClass('collapsed').attr('aria-expanded', true);

    this.transitioning = 1;

    var complete = function complete() {
      this.$element.removeClass('collapsing').addClass('collapse in')[dimension]('');
      this.transitioning = 0;
      this.$element.trigger('shown.bs.collapse');
    };

    if (!$.support.transition) return complete.call(this);

    var scrollSize = $.camelCase(['scroll', dimension].join('-'));

    this.$element.one('bsTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize]);
  };

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return;

    var startEvent = $.Event('hide.bs.collapse');
    this.$element.trigger(startEvent);
    if (startEvent.isDefaultPrevented()) return;

    var dimension = this.dimension();

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight;

    this.$element.addClass('collapsing').removeClass('collapse in').attr('aria-expanded', false);

    this.$trigger.addClass('collapsed').attr('aria-expanded', false);

    this.transitioning = 1;

    var complete = function complete() {
      this.transitioning = 0;
      this.$element.removeClass('collapsing').addClass('collapse').trigger('hidden.bs.collapse');
    };

    if (!$.support.transition) return complete.call(this);

    this.$element[dimension](0).one('bsTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(Collapse.TRANSITION_DURATION);
  };

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']();
  };

  Collapse.prototype.getParent = function () {
    return $(this.options.parent).find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]').each($.proxy(function (i, element) {
      var $element = $(element);
      this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element);
    }, this)).end();
  };

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in');

    $element.attr('aria-expanded', isOpen);
    $trigger.toggleClass('collapsed', !isOpen).attr('aria-expanded', isOpen);
  };

  function getTargetFromTrigger($trigger) {
    var href;
    var target = $trigger.attr('data-target') || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, ''); // strip for ie7

    return $(target);
  }

  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.collapse');
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), (typeof option === 'undefined' ? 'undefined' : _typeof(option)) == 'object' && option);

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false;
      if (!data) $this.data('bs.collapse', data = new Collapse(this, options));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.collapse;

  $.fn.collapse = Plugin;
  $.fn.collapse.Constructor = Collapse;

  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old;
    return this;
  };

  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this = $(this);

    if (!$this.attr('data-target')) e.preventDefault();

    var $target = getTargetFromTrigger($this);
    var data = $target.data('bs.collapse');
    var option = data ? 'toggle' : $this.data();

    Plugin.call($target, option);
  });
}(jQuery);
'use strict';

/* ========================================================================
 * Bootstrap: transition.js v3.3.7
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap');

    var transEndEventNames = {
      WebkitTransition: 'webkitTransitionEnd',
      MozTransition: 'transitionend',
      OTransition: 'oTransitionEnd otransitionend',
      transition: 'transitionend'
    };

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] };
      }
    }

    return false; // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false;
    var $el = this;
    $(this).one('bsTransitionEnd', function () {
      called = true;
    });
    var callback = function callback() {
      if (!called) $($el).trigger($.support.transition.end);
    };
    setTimeout(callback, duration);
    return this;
  };

  $(function () {
    $.support.transition = transitionEnd();

    if (!$.support.transition) return;

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function handle(e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments);
      }
    };
  });
}(jQuery);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhYi5qcyIsImNvbGxhcHNlLmpzIiwidHJhbnNpdGlvbi5qcyIsImxheW91dC5qcyIsImpxdWVyeS5jb29raWUuanMiLCJtb2RhbC1wb3B1cC5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyIkIiwiVGFiIiwiZWxlbWVudCIsIlZFUlNJT04iLCJUUkFOU0lUSU9OX0RVUkFUSU9OIiwicHJvdG90eXBlIiwic2hvdyIsIiR0aGlzIiwiJHVsIiwiY2xvc2VzdCIsInNlbGVjdG9yIiwiZGF0YSIsImF0dHIiLCJyZXBsYWNlIiwicGFyZW50IiwiaGFzQ2xhc3MiLCIkcHJldmlvdXMiLCJmaW5kIiwiaGlkZUV2ZW50IiwiRXZlbnQiLCJyZWxhdGVkVGFyZ2V0Iiwic2hvd0V2ZW50IiwidHJpZ2dlciIsImlzRGVmYXVsdFByZXZlbnRlZCIsIiR0YXJnZXQiLCJhY3RpdmF0ZSIsInR5cGUiLCJjb250YWluZXIiLCJjYWxsYmFjayIsIiRhY3RpdmUiLCJ0cmFuc2l0aW9uIiwic3VwcG9ydCIsImxlbmd0aCIsIm5leHQiLCJyZW1vdmVDbGFzcyIsImVuZCIsImFkZENsYXNzIiwib2Zmc2V0V2lkdGgiLCJvbmUiLCJlbXVsYXRlVHJhbnNpdGlvbkVuZCIsIlBsdWdpbiIsIm9wdGlvbiIsImVhY2giLCJvbGQiLCJmbiIsInRhYiIsIkNvbnN0cnVjdG9yIiwibm9Db25mbGljdCIsImNsaWNrSGFuZGxlciIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImNhbGwiLCJkb2N1bWVudCIsIm9uIiwialF1ZXJ5IiwiQ29sbGFwc2UiLCJvcHRpb25zIiwiJGVsZW1lbnQiLCJleHRlbmQiLCJERUZBVUxUUyIsIiR0cmlnZ2VyIiwiaWQiLCJ0cmFuc2l0aW9uaW5nIiwiJHBhcmVudCIsImdldFBhcmVudCIsImFkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyIsInRvZ2dsZSIsImRpbWVuc2lvbiIsImhhc1dpZHRoIiwiYWN0aXZlc0RhdGEiLCJhY3RpdmVzIiwiY2hpbGRyZW4iLCJzdGFydEV2ZW50IiwiY29tcGxldGUiLCJzY3JvbGxTaXplIiwiY2FtZWxDYXNlIiwiam9pbiIsInByb3h5IiwiaGlkZSIsIm9mZnNldEhlaWdodCIsImkiLCJnZXRUYXJnZXRGcm9tVHJpZ2dlciIsImlzT3BlbiIsInRvZ2dsZUNsYXNzIiwiaHJlZiIsInRhcmdldCIsInRlc3QiLCJjb2xsYXBzZSIsInRyYW5zaXRpb25FbmQiLCJlbCIsImNyZWF0ZUVsZW1lbnQiLCJ0cmFuc0VuZEV2ZW50TmFtZXMiLCJXZWJraXRUcmFuc2l0aW9uIiwiTW96VHJhbnNpdGlvbiIsIk9UcmFuc2l0aW9uIiwibmFtZSIsInN0eWxlIiwidW5kZWZpbmVkIiwiZHVyYXRpb24iLCJjYWxsZWQiLCIkZWwiLCJzZXRUaW1lb3V0IiwiZXZlbnQiLCJzcGVjaWFsIiwiYnNUcmFuc2l0aW9uRW5kIiwiYmluZFR5cGUiLCJkZWxlZ2F0ZVR5cGUiLCJoYW5kbGUiLCJpcyIsImhhbmRsZU9iaiIsImhhbmRsZXIiLCJhcHBseSIsImFyZ3VtZW50cyIsImxheW91dCIsInB1YiIsIiRsYXlvdXRfX2hlYWRlciIsIiRsYXlvdXRfX2RvY3VtZW50IiwibGF5b3V0X2NsYXNzZXMiLCJpbml0IiwicmVnaXN0ZXJFdmVudEhhbmRsZXJzIiwicmVnaXN0ZXJCb290RXZlbnRIYW5kbGVycyIsImFkZEVsZW1lbnRDbGFzc2VzIiwiYWRkIiwibGF5b3V0X19vYmZ1c2NhdG9yIiwidG9nZ2xlRHJhd2VyIiwiaGVhZGVyX3dhdGVyZmFsbCIsIiRkb2N1bWVudCIsIndhdGVyZmFsbEhlYWRlciIsIiR3cmFwcGVyIiwibGF5b3V0X193cmFwcGVyIiwiJG9iZnVzY2F0b3IiLCIkZHJhd2VyIiwibGF5b3V0X19kcmF3ZXIiLCJvYmZ1c2NhdG9yX2lzX3Zpc2libGUiLCJkcmF3ZXJfaXNfdmlzaWJsZSIsIiRoZWFkZXIiLCJsYXlvdXRfX2hlYWRlciIsImRpc3RhbmNlIiwic2Nyb2xsVG9wIiwiaGVhZGVyX2lzX2NvbXBhY3QiLCJpbmRleCIsImhlYWRlcl9zY3JvbGwiLCJ3cmFwcGVyX2hhc19zY3JvbGxpbmdfaGVhZGVyIiwid3JhcHBlcl9oYXNfZHJhd2VyIiwid3JhcHBlcl9pc191cGdyYWRlZCIsImpRdWVyeUNvb2tpZXMiLCJjb25zb2xlIiwibG9nIiwiZmFjdG9yeSIsImRlZmluZSIsImFtZCIsImV4cG9ydHMiLCJyZXF1aXJlIiwicGx1c2VzIiwiZW5jb2RlIiwicyIsImNvbmZpZyIsInJhdyIsImVuY29kZVVSSUNvbXBvbmVudCIsImRlY29kZSIsImRlY29kZVVSSUNvbXBvbmVudCIsInN0cmluZ2lmeUNvb2tpZVZhbHVlIiwidmFsdWUiLCJqc29uIiwiSlNPTiIsInN0cmluZ2lmeSIsIlN0cmluZyIsInBhcnNlQ29va2llVmFsdWUiLCJpbmRleE9mIiwic2xpY2UiLCJwYXJzZSIsInJlYWQiLCJjb252ZXJ0ZXIiLCJpc0Z1bmN0aW9uIiwiY29va2llIiwia2V5IiwiZGVmYXVsdHMiLCJleHBpcmVzIiwiZGF5cyIsInQiLCJEYXRlIiwic2V0VGltZSIsInRvVVRDU3RyaW5nIiwicGF0aCIsImRvbWFpbiIsInNlY3VyZSIsInJlc3VsdCIsImNvb2tpZXMiLCJzcGxpdCIsImwiLCJwYXJ0cyIsInNoaWZ0IiwicmVtb3ZlQ29va2llIiwibW9kYWxQb3BVcCIsImRlbGF5IiwiZmFkZUluIiwiY2xpY2siLCJmb2N1cyIsIndpbmRvdyIsImhvdmVyIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7OztBQVNBLENBQUMsVUFBVUEsQ0FBVixFQUFhO0FBQ1o7O0FBRUE7QUFDQTs7QUFFQSxNQUFJQyxNQUFNLFNBQU5BLEdBQU0sQ0FBVUMsT0FBVixFQUFtQjtBQUMzQjtBQUNBLFNBQUtBLE9BQUwsR0FBZUYsRUFBRUUsT0FBRixDQUFmO0FBQ0E7QUFDRCxHQUpEOztBQU1BRCxNQUFJRSxPQUFKLEdBQWMsT0FBZDs7QUFFQUYsTUFBSUcsbUJBQUosR0FBMEIsR0FBMUI7O0FBRUFILE1BQUlJLFNBQUosQ0FBY0MsSUFBZCxHQUFxQixZQUFZO0FBQy9CLFFBQUlDLFFBQVcsS0FB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QUEyQztBQUN6QztBQUNELE9BRkQsTUFHSztBQUNIa0MsVUFBRUMsY0FBRjtBQUNBbEQsVUFBRSxJQUFGLEVBQVFjLE1BQVIsR0FBaUJzQixRQUFqQixDQUEwQixVQUExQjtBQUNEO0FBQ0YsS0FSRDtBQVNELEdBVkQsTUFXSztBQUFDO0FBQ0pwQyxNQUFFLHlDQUFGLEVBQTZDdU0sS0FBN0MsQ0FDSSxVQUFVdEosQ0FBVixFQUFhO0FBQ1hqRCxRQUFFLElBQUYsRUFBUW9DLFFBQVIsQ0FBaUIsVUFBakI7QUFDRCxLQUhMLEVBR08sVUFBVWEsQ0FBVixFQUFhO0FBQ2RqRCxRQUFFLElBQUYsRUFBUWtDLFdBQVIsQ0FBb0IsVUFBcEI7QUFDRCxLQUxMO0FBT0Q7QUFFRixDQXJERCxFQXFER29CLE1BckRIIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiB0YWIuanMgdjMuMy43XG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyN0YWJzXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbitmdW5jdGlvbiAoJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gVEFCIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgVGFiID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAvLyBqc2NzOmRpc2FibGUgcmVxdWlyZURvbGxhckJlZm9yZWpRdWVyeUFzc2lnbm1lbnRcbiAgICB0aGlzLmVsZW1lbnQgPSAkKGVsZW1lbnQpXG4gICAgLy8ganNjczplbmFibGUgcmVxdWlyZURvbGxhckJlZm9yZWpRdWVyeUFzc2lnbm1lbnRcbiAgfVxuXG4gIFRhYi5WRVJTSU9OID0gJzMuMy43J1xuXG4gIFRhYi5UUkFOU0lUSU9OX0RVUkFUSU9OID0gMTUwXG5cbiAgVGFiLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciAkdGhpcyAgICA9IHRoaXMuZWxlbWVudFxuICAgIHZhciAkdWwgICAgICA9ICR0aGlzLmNsb3Nlc3QoJ3VsOm5vdCguZHJvcGRvd24tbWVudSknKVxuICAgIHZhciBzZWxlY3RvciA9ICR0aGlzLmRhdGEoJ3RhcmdldCcpXG5cbiAgICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgICBzZWxlY3RvciA9ICR0aGlzLmF0dHIoJ2hyZWYnKVxuICAgICAgc2VsZWN0b3IgPSBzZWxlY3RvciAmJiBzZWxlY3Rvci5yZXBsYWNlKC8uKig/PSNbXlxcc10qJCkvLCAnJykgLy8gc3RyaXAgZm9yIGllN1xuICAgIH1cblxuICAgIGlmICgkdGhpcy5wYXJlbnQoJ2xpJykuaGFzQ2xhc3MoJ2FjdGl2ZScpKSByZXR1cm5cblxuICAgIHZhciAkcHJldmlvdXMgPSAkdWwuZmluZCgnLmFjdGl2ZTpsYXN0IGEnKVxuICAgIHZhciBoaWRlRXZlbnQgPSAkLkV2ZW50KCdoaWRlLmJzLnRhYicsIHtcbiAgICAgIHJlbGF0ZWRUYXJnZXQ6ICR0aGlzWzBdXG4gICAgfSlcbiAgICB2YXIgc2hvd0V2ZW50ID0gJC5FdmVudCgnc2hvdy5icy50YWInLCB7XG4gICAgICByZWxhdGVkVGFyZ2V0OiAkcHJldmlvdXNbMF1cbiAgICB9KVxuXG4gICAgJHByZXZpb3VzLnRyaWdnZXIoaGlkZUV2ZW50KVxuICAgICR0aGlzLnRyaWdnZXIoc2hvd0V2ZW50KVxuXG4gICAgaWYgKHNob3dFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSB8fCBoaWRlRXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxuXG4gICAgdmFyICR0YXJnZXQgPSAkKHNlbGVjdG9yKVxuXG4gICAgdGhpcy5hY3RpdmF0ZSgkdGhpcy5jbG9zZXN0KCdsaScpLCAkdWwpXG4gICAgdGhpcy5hY3RpdmF0ZSgkdGFyZ2V0LCAkdGFyZ2V0LnBhcmVudCgpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAkcHJldmlvdXMudHJpZ2dlcih7XG4gICAgICAgIHR5cGU6ICdoaWRkZW4uYnMudGFiJyxcbiAgICAgICAgcmVsYXRlZFRhcmdldDogJHRoaXNbMF1cbiAgICAgIH0pXG4gICAgICAkdGhpcy50cmlnZ2VyKHtcbiAgICAgICAgdHlwZTogJ3Nob3duLmJzLnRhYicsXG4gICAgICAgIHJlbGF0ZWRUYXJnZXQ6ICRwcmV2aW91c1swXVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgVGFiLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBjb250YWluZXIsIGNhbGxiYWNrKSB7XG4gICAgdmFyICRhY3RpdmUgICAgPSBjb250YWluZXIuZmluZCgnPiAuYWN0aXZlJylcbiAgICB2YXIgdHJhbnNpdGlvbiA9IGNhbGxiYWNrXG4gICAgICAmJiAkLnN1cHBvcnQudHJhbnNpdGlvblxuICAgICAgJiYgKCRhY3RpdmUubGVuZ3RoICYmICRhY3RpdmUuaGFzQ2xhc3MoJ2ZhZGUnKSB8fCAhIWNvbnRhaW5lci5maW5kKCc+IC5mYWRlJykubGVuZ3RoKVxuXG4gICAgZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICRhY3RpdmVcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICAuZmluZCgnPiAuZHJvcGRvd24tbWVudSA+IC5hY3RpdmUnKVxuICAgICAgICAgIC5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAgICAgLmVuZCgpXG4gICAgICAgIC5maW5kKCdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nKVxuICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpXG5cbiAgICAgIGVsZW1lbnRcbiAgICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgICAgICAuZmluZCgnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJylcbiAgICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXG5cbiAgICAgIGlmICh0cmFuc2l0aW9uKSB7XG4gICAgICAgIGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGggLy8gcmVmbG93IGZvciB0cmFuc2l0aW9uXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2luJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2ZhZGUnKVxuICAgICAgfVxuXG4gICAgICBpZiAoZWxlbWVudC5wYXJlbnQoJy5kcm9wZG93bi1tZW51JykubGVuZ3RoKSB7XG4gICAgICAgIGVsZW1lbnRcbiAgICAgICAgICAuY2xvc2VzdCgnbGkuZHJvcGRvd24nKVxuICAgICAgICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgICAgICAgIC5lbmQoKVxuICAgICAgICAgIC5maW5kKCdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nKVxuICAgICAgICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxuICAgICAgfVxuXG4gICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpXG4gICAgfVxuXG4gICAgJGFjdGl2ZS5sZW5ndGggJiYgdHJhbnNpdGlvbiA/XG4gICAgICAkYWN0aXZlXG4gICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIG5leHQpXG4gICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChUYWIuVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgbmV4dCgpXG5cbiAgICAkYWN0aXZlLnJlbW92ZUNsYXNzKCdpbicpXG4gIH1cblxuXG4gIC8vIFRBQiBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG4gICAgICB2YXIgZGF0YSAgPSAkdGhpcy5kYXRhKCdicy50YWInKVxuXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLnRhYicsIChkYXRhID0gbmV3IFRhYih0aGlzKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgdmFyIG9sZCA9ICQuZm4udGFiXG5cbiAgJC5mbi50YWIgICAgICAgICAgICAgPSBQbHVnaW5cbiAgJC5mbi50YWIuQ29uc3RydWN0b3IgPSBUYWJcblxuXG4gIC8vIFRBQiBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT1cblxuICAkLmZuLnRhYi5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4udGFiID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAgLy8gVEFCIERBVEEtQVBJXG4gIC8vID09PT09PT09PT09PVxuXG4gIHZhciBjbGlja0hhbmRsZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIFBsdWdpbi5jYWxsKCQodGhpcyksICdzaG93JylcbiAgfVxuXG4gICQoZG9jdW1lbnQpXG4gICAgLm9uKCdjbGljay5icy50YWIuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJywgY2xpY2tIYW5kbGVyKVxuICAgIC5vbignY2xpY2suYnMudGFiLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cInBpbGxcIl0nLCBjbGlja0hhbmRsZXIpXG5cbn0oalF1ZXJ5KTtcbiIsIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiBjb2xsYXBzZS5qcyB2My4zLjdcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI2NvbGxhcHNlXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4vKiBqc2hpbnQgbGF0ZWRlZjogZmFsc2UgKi9cblxuK2Z1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBDT0xMQVBTRSBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBDb2xsYXBzZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCAgICAgID0gJChlbGVtZW50KVxuICAgIHRoaXMub3B0aW9ucyAgICAgICA9ICQuZXh0ZW5kKHt9LCBDb2xsYXBzZS5ERUZBVUxUUywgb3B0aW9ucylcbiAgICB0aGlzLiR0cmlnZ2VyICAgICAgPSAkKCdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXVtocmVmPVwiIycgKyBlbGVtZW50LmlkICsgJ1wiXSwnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXVtkYXRhLXRhcmdldD1cIiMnICsgZWxlbWVudC5pZCArICdcIl0nKVxuICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IG51bGxcblxuICAgIGlmICh0aGlzLm9wdGlvbnMucGFyZW50KSB7XG4gICAgICB0aGlzLiRwYXJlbnQgPSB0aGlzLmdldFBhcmVudCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzKHRoaXMuJGVsZW1lbnQsIHRoaXMuJHRyaWdnZXIpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy50b2dnbGUpIHRoaXMudG9nZ2xlKClcbiAgfVxuXG4gIENvbGxhcHNlLlZFUlNJT04gID0gJzMuMy43J1xuXG4gIENvbGxhcHNlLlRSQU5TSVRJT05fRFVSQVRJT04gPSAzNTBcblxuICBDb2xsYXBzZS5ERUZBVUxUUyA9IHtcbiAgICB0b2dnbGU6IHRydWVcbiAgfVxuXG4gIENvbGxhcHNlLnByb3RvdHlwZS5kaW1lbnNpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGhhc1dpZHRoID0gdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnd2lkdGgnKVxuICAgIHJldHVybiBoYXNXaWR0aCA/ICd3aWR0aCcgOiAnaGVpZ2h0J1xuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMudHJhbnNpdGlvbmluZyB8fCB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpbicpKSByZXR1cm5cblxuICAgIHZhciBhY3RpdmVzRGF0YVxuICAgIHZhciBhY3RpdmVzID0gdGhpcy4kcGFyZW50ICYmIHRoaXMuJHBhcmVudC5jaGlsZHJlbignLnBhbmVsJykuY2hpbGRyZW4oJy5pbiwgLmNvbGxhcHNpbmcnKVxuXG4gICAgaWYgKGFjdGl2ZXMgJiYgYWN0aXZlcy5sZW5ndGgpIHtcbiAgICAgIGFjdGl2ZXNEYXRhID0gYWN0aXZlcy5kYXRhKCdicy5jb2xsYXBzZScpXG4gICAgICBpZiAoYWN0aXZlc0RhdGEgJiYgYWN0aXZlc0RhdGEudHJhbnNpdGlvbmluZykgcmV0dXJuXG4gICAgfVxuXG4gICAgdmFyIHN0YXJ0RXZlbnQgPSAkLkV2ZW50KCdzaG93LmJzLmNvbGxhcHNlJylcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoc3RhcnRFdmVudClcbiAgICBpZiAoc3RhcnRFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICBpZiAoYWN0aXZlcyAmJiBhY3RpdmVzLmxlbmd0aCkge1xuICAgICAgUGx1Z2luLmNhbGwoYWN0aXZlcywgJ2hpZGUnKVxuICAgICAgYWN0aXZlc0RhdGEgfHwgYWN0aXZlcy5kYXRhKCdicy5jb2xsYXBzZScsIG51bGwpXG4gICAgfVxuXG4gICAgdmFyIGRpbWVuc2lvbiA9IHRoaXMuZGltZW5zaW9uKClcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2UnKVxuICAgICAgLmFkZENsYXNzKCdjb2xsYXBzaW5nJylbZGltZW5zaW9uXSgwKVxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxuXG4gICAgdGhpcy4kdHJpZ2dlclxuICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzZWQnKVxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxuXG4gICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMVxuXG4gICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNpbmcnKVxuICAgICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNlIGluJylbZGltZW5zaW9uXSgnJylcbiAgICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDBcbiAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgLnRyaWdnZXIoJ3Nob3duLmJzLmNvbGxhcHNlJylcbiAgICB9XG5cbiAgICBpZiAoISQuc3VwcG9ydC50cmFuc2l0aW9uKSByZXR1cm4gY29tcGxldGUuY2FsbCh0aGlzKVxuXG4gICAgdmFyIHNjcm9sbFNpemUgPSAkLmNhbWVsQ2FzZShbJ3Njcm9sbCcsIGRpbWVuc2lvbl0uam9pbignLScpKVxuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgJC5wcm94eShjb21wbGV0ZSwgdGhpcykpXG4gICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoQ29sbGFwc2UuVFJBTlNJVElPTl9EVVJBVElPTilbZGltZW5zaW9uXSh0aGlzLiRlbGVtZW50WzBdW3Njcm9sbFNpemVdKVxuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMudHJhbnNpdGlvbmluZyB8fCAhdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaW4nKSkgcmV0dXJuXG5cbiAgICB2YXIgc3RhcnRFdmVudCA9ICQuRXZlbnQoJ2hpZGUuYnMuY29sbGFwc2UnKVxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihzdGFydEV2ZW50KVxuICAgIGlmIChzdGFydEV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgIHZhciBkaW1lbnNpb24gPSB0aGlzLmRpbWVuc2lvbigpXG5cbiAgICB0aGlzLiRlbGVtZW50W2RpbWVuc2lvbl0odGhpcy4kZWxlbWVudFtkaW1lbnNpb25dKCkpWzBdLm9mZnNldEhlaWdodFxuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLmFkZENsYXNzKCdjb2xsYXBzaW5nJylcbiAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2UgaW4nKVxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSlcblxuICAgIHRoaXMuJHRyaWdnZXJcbiAgICAgIC5hZGRDbGFzcygnY29sbGFwc2VkJylcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpXG5cbiAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSAxXG5cbiAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSAwXG4gICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2luZycpXG4gICAgICAgIC5hZGRDbGFzcygnY29sbGFwc2UnKVxuICAgICAgICAudHJpZ2dlcignaGlkZGVuLmJzLmNvbGxhcHNlJylcbiAgICB9XG5cbiAgICBpZiAoISQuc3VwcG9ydC50cmFuc2l0aW9uKSByZXR1cm4gY29tcGxldGUuY2FsbCh0aGlzKVxuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgW2RpbWVuc2lvbl0oMClcbiAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsICQucHJveHkoY29tcGxldGUsIHRoaXMpKVxuICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKENvbGxhcHNlLlRSQU5TSVRJT05fRFVSQVRJT04pXG4gIH1cblxuICBDb2xsYXBzZS5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXNbdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaW4nKSA/ICdoaWRlJyA6ICdzaG93J10oKVxuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLmdldFBhcmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJCh0aGlzLm9wdGlvbnMucGFyZW50KVxuICAgICAgLmZpbmQoJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdW2RhdGEtcGFyZW50PVwiJyArIHRoaXMub3B0aW9ucy5wYXJlbnQgKyAnXCJdJylcbiAgICAgIC5lYWNoKCQucHJveHkoZnVuY3Rpb24gKGksIGVsZW1lbnQpIHtcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KVxuICAgICAgICB0aGlzLmFkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyhnZXRUYXJnZXRGcm9tVHJpZ2dlcigkZWxlbWVudCksICRlbGVtZW50KVxuICAgICAgfSwgdGhpcykpXG4gICAgICAuZW5kKClcbiAgfVxuXG4gIENvbGxhcHNlLnByb3RvdHlwZS5hZGRBcmlhQW5kQ29sbGFwc2VkQ2xhc3MgPSBmdW5jdGlvbiAoJGVsZW1lbnQsICR0cmlnZ2VyKSB7XG4gICAgdmFyIGlzT3BlbiA9ICRlbGVtZW50Lmhhc0NsYXNzKCdpbicpXG5cbiAgICAkZWxlbWVudC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgaXNPcGVuKVxuICAgICR0cmlnZ2VyXG4gICAgICAudG9nZ2xlQ2xhc3MoJ2NvbGxhcHNlZCcsICFpc09wZW4pXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGlzT3BlbilcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFRhcmdldEZyb21UcmlnZ2VyKCR0cmlnZ2VyKSB7XG4gICAgdmFyIGhyZWZcbiAgICB2YXIgdGFyZ2V0ID0gJHRyaWdnZXIuYXR0cignZGF0YS10YXJnZXQnKVxuICAgICAgfHwgKGhyZWYgPSAkdHJpZ2dlci5hdHRyKCdocmVmJykpICYmIGhyZWYucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLywgJycpIC8vIHN0cmlwIGZvciBpZTdcblxuICAgIHJldHVybiAkKHRhcmdldClcbiAgfVxuXG5cbiAgLy8gQ09MTEFQU0UgUExVR0lOIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMuY29sbGFwc2UnKVxuICAgICAgdmFyIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQ29sbGFwc2UuREVGQVVMVFMsICR0aGlzLmRhdGEoKSwgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pXG5cbiAgICAgIGlmICghZGF0YSAmJiBvcHRpb25zLnRvZ2dsZSAmJiAvc2hvd3xoaWRlLy50ZXN0KG9wdGlvbikpIG9wdGlvbnMudG9nZ2xlID0gZmFsc2VcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuY29sbGFwc2UnLCAoZGF0YSA9IG5ldyBDb2xsYXBzZSh0aGlzLCBvcHRpb25zKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgdmFyIG9sZCA9ICQuZm4uY29sbGFwc2VcblxuICAkLmZuLmNvbGxhcHNlICAgICAgICAgICAgID0gUGx1Z2luXG4gICQuZm4uY29sbGFwc2UuQ29uc3RydWN0b3IgPSBDb2xsYXBzZVxuXG5cbiAgLy8gQ09MTEFQU0UgTk8gQ09ORkxJQ1RcbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cblxuICAkLmZuLmNvbGxhcHNlLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi5jb2xsYXBzZSA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuXG4gIC8vIENPTExBUFNFIERBVEEtQVBJXG4gIC8vID09PT09PT09PT09PT09PT09XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLmJzLmNvbGxhcHNlLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdJywgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcblxuICAgIGlmICghJHRoaXMuYXR0cignZGF0YS10YXJnZXQnKSkgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICB2YXIgJHRhcmdldCA9IGdldFRhcmdldEZyb21UcmlnZ2VyKCR0aGlzKVxuICAgIHZhciBkYXRhICAgID0gJHRhcmdldC5kYXRhKCdicy5jb2xsYXBzZScpXG4gICAgdmFyIG9wdGlvbiAgPSBkYXRhID8gJ3RvZ2dsZScgOiAkdGhpcy5kYXRhKClcblxuICAgIFBsdWdpbi5jYWxsKCR0YXJnZXQsIG9wdGlvbilcbiAgfSlcblxufShqUXVlcnkpO1xuIiwiLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBCb290c3RyYXA6IHRyYW5zaXRpb24uanMgdjMuMy43XG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyN0cmFuc2l0aW9uc1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4rZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIENTUyBUUkFOU0lUSU9OIFNVUFBPUlQgKFNob3V0b3V0OiBodHRwOi8vd3d3Lm1vZGVybml6ci5jb20vKVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiB0cmFuc2l0aW9uRW5kKCkge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Jvb3RzdHJhcCcpXG5cbiAgICB2YXIgdHJhbnNFbmRFdmVudE5hbWVzID0ge1xuICAgICAgV2Via2l0VHJhbnNpdGlvbiA6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAgIE1velRyYW5zaXRpb24gICAgOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICBPVHJhbnNpdGlvbiAgICAgIDogJ29UcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kJyxcbiAgICAgIHRyYW5zaXRpb24gICAgICAgOiAndHJhbnNpdGlvbmVuZCdcbiAgICB9XG5cbiAgICBmb3IgKHZhciBuYW1lIGluIHRyYW5zRW5kRXZlbnROYW1lcykge1xuICAgICAgaWYgKGVsLnN0eWxlW25hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHsgZW5kOiB0cmFuc0VuZEV2ZW50TmFtZXNbbmFtZV0gfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZSAvLyBleHBsaWNpdCBmb3IgaWU4ICggIC5fLilcbiAgfVxuXG4gIC8vIGh0dHA6Ly9ibG9nLmFsZXhtYWNjYXcuY29tL2Nzcy10cmFuc2l0aW9uc1xuICAkLmZuLmVtdWxhdGVUcmFuc2l0aW9uRW5kID0gZnVuY3Rpb24gKGR1cmF0aW9uKSB7XG4gICAgdmFyIGNhbGxlZCA9IGZhbHNlXG4gICAgdmFyICRlbCA9IHRoaXNcbiAgICAkKHRoaXMpLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgZnVuY3Rpb24gKCkgeyBjYWxsZWQgPSB0cnVlIH0pXG4gICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24gKCkgeyBpZiAoIWNhbGxlZCkgJCgkZWwpLnRyaWdnZXIoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kKSB9XG4gICAgc2V0VGltZW91dChjYWxsYmFjaywgZHVyYXRpb24pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gICQoZnVuY3Rpb24gKCkge1xuICAgICQuc3VwcG9ydC50cmFuc2l0aW9uID0gdHJhbnNpdGlvbkVuZCgpXG5cbiAgICBpZiAoISQuc3VwcG9ydC50cmFuc2l0aW9uKSByZXR1cm5cblxuICAgICQuZXZlbnQuc3BlY2lhbC5ic1RyYW5zaXRpb25FbmQgPSB7XG4gICAgICBiaW5kVHlwZTogJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLFxuICAgICAgZGVsZWdhdGVUeXBlOiAkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsXG4gICAgICBoYW5kbGU6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICgkKGUudGFyZ2V0KS5pcyh0aGlzKSkgcmV0dXJuIGUuaGFuZGxlT2JqLmhhbmRsZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxufShqUXVlcnkpO1xuIiwiLy8gfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB8IExheW91dFxuLy8gfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB8XG4vLyB8IFRoaXMgalF1ZXJ5IHNjcmlwdCBpcyB3cml0dGVuIGJ5XG4vLyB8XG4vLyB8IE1vcnRlbiBOaXNzZW5cbi8vIHwgaGplbW1lc2lkZWtvbmdlbi5ka1xuLy8gfFxudmFyIGxheW91dCA9IChmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBwdWIgPSB7fSxcbiAgICAgICAgJGxheW91dF9faGVhZGVyID0gJCgnLmxheW91dF9faGVhZGVyJyksXG4gICAgICAgICRsYXlvdXRfX2RvY3VtZW50ID0gJCgnLmxheW91dF9fZG9jdW1lbnQnKSxcbiAgICAgICAgbGF5b3V0X2NsYXNzZXMgPSB7XG4gICAgICAgICAgICAnbGF5b3V0X193cmFwcGVyJzogJy5sYXlvdXRfX3dyYXBwZXInLFxuICAgICAgICAgICAgJ2xheW91dF9fZHJhd2VyJzogJy5sYXlvdXRfX2RyYXdlcicsXG4gICAgICAgICAgICAnbGF5b3V0X19oZWFkZXInOiAnLmxheW91dF9faGVhZGVyJyxcbiAgICAgICAgICAgICdsYXlvdXRfX29iZnVzY2F0b3InOiAnLmxheW91dF9fb2JmdXNjYXRvcicsXG4gICAgICAgICAgICAnbGF5b3V0X19kb2N1bWVudCc6ICcubGF5b3V0X19kb2N1bWVudCcsXG5cbiAgICAgICAgICAgICd3cmFwcGVyX2lzX3VwZ3JhZGVkJzogJ2lzLXVwZ3JhZGVkJyxcbiAgICAgICAgICAgICd3cmFwcGVyX2hhc19kcmF3ZXInOiAnaGFzLWRyYXdlcicsXG4gICAgICAgICAgICAnd3JhcHBlcl9oYXNfc2Nyb2xsaW5nX2hlYWRlcic6ICdoYXMtc2Nyb2xsaW5nLWhlYWRlcicsXG4gICAgICAgICAgICAnaGVhZGVyX3Njcm9sbCc6ICdsYXlvdXRfX2hlYWRlci0tc2Nyb2xsJyxcbiAgICAgICAgICAgICdoZWFkZXJfaXNfY29tcGFjdCc6ICdpcy1jb21wYWN0JyxcbiAgICAgICAgICAgICdoZWFkZXJfd2F0ZXJmYWxsJzogJ2xheW91dF9faGVhZGVyLS13YXRlcmZhbGwnLFxuICAgICAgICAgICAgJ2RyYXdlcl9pc192aXNpYmxlJzogJ2lzLXZpc2libGUnLFxuICAgICAgICAgICAgJ29iZnVzY2F0b3JfaXNfdmlzaWJsZSc6ICdpcy12aXNpYmxlJ1xuICAgICAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5zdGFudGlhdGVcbiAgICAgKi9cbiAgICBwdWIuaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIHJlZ2lzdGVyRXZlbnRIYW5kbGVycygpO1xuICAgICAgICByZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGJvb3QgZXZlbnQgaGFuZGxlcnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzKCkge1xuXG4gICAgICAgIC8vIEFkZCBjbGFzc2VzIHRvIGVsZW1lbnRzXG4gICAgICAgIGFkZEVsZW1lbnRDbGFzc2VzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWdpc3RlckV2ZW50SGFuZGxlcnMoKSB7XG5cbiAgICAgICAgLy8gVG9nZ2xlIGRyYXdlclxuICAgICAgICAkKCdbZGF0YS10b2dnbGUtZHJhd2VyXScpLmFkZCgkKGxheW91dF9jbGFzc2VzLmxheW91dF9fb2JmdXNjYXRvcikpLm9uKCdjbGljayB0b3VjaHN0YXJ0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICB0b2dnbGVEcmF3ZXIoJGVsZW1lbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBXYXRlcmZhbGwgaGVhZGVyXG4gICAgICAgIGlmICgkbGF5b3V0X19oZWFkZXIuaGFzQ2xhc3MobGF5b3V0X2NsYXNzZXMuaGVhZGVyX3dhdGVyZmFsbCkpIHtcblxuICAgICAgICAgICAgJGxheW91dF9fZG9jdW1lbnQub24oJ3RvdWNobW92ZSBzY3JvbGwnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciAkZG9jdW1lbnQgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgd2F0ZXJmYWxsSGVhZGVyKCRkb2N1bWVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBkcmF3ZXJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0b2dnbGVEcmF3ZXIoJGVsZW1lbnQpIHtcbiAgICAgICAgdmFyICR3cmFwcGVyID0gJGVsZW1lbnQuY2xvc2VzdChsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX3dyYXBwZXIpLFxuICAgICAgICAgICAgJG9iZnVzY2F0b3IgPSAkd3JhcHBlci5jaGlsZHJlbihsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX29iZnVzY2F0b3IpLFxuICAgICAgICAgICAgJGRyYXdlciA9ICR3cmFwcGVyLmNoaWxkcmVuKGxheW91dF9jbGFzc2VzLmxheW91dF9fZHJhd2VyKTtcblxuICAgICAgICAvLyBUb2dnbGUgdmlzaWJsZSBzdGF0ZVxuICAgICAgICAkb2JmdXNjYXRvci50b2dnbGVDbGFzcyhsYXlvdXRfY2xhc3Nlcy5vYmZ1c2NhdG9yX2lzX3Zpc2libGUpO1xuICAgICAgICAkZHJhd2VyLnRvZ2dsZUNsYXNzKGxheW91dF9jbGFzc2VzLmRyYXdlcl9pc192aXNpYmxlKTtcblxuICAgICAgICAvLyBBbHRlciBhcmlhLWhpZGRlbiBzdGF0dXNcbiAgICAgICAgJGRyYXdlci5hdHRyKCdhcmlhLWhpZGRlbicsICgkZHJhd2VyLmhhc0NsYXNzKGxheW91dF9jbGFzc2VzLmRyYXdlcl9pc192aXNpYmxlKSkgPyBmYWxzZSA6IHRydWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGVyZmFsbCBoZWFkZXJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB3YXRlcmZhbGxIZWFkZXIoJGRvY3VtZW50KSB7XG4gICAgICAgIHZhciAkd3JhcHBlciA9ICRkb2N1bWVudC5jbG9zZXN0KGxheW91dF9jbGFzc2VzLmxheW91dF9fd3JhcHBlciksXG4gICAgICAgICAgICAkaGVhZGVyID0gJHdyYXBwZXIuY2hpbGRyZW4obGF5b3V0X2NsYXNzZXMubGF5b3V0X19oZWFkZXIpLFxuICAgICAgICAgICAgZGlzdGFuY2UgPSAkZG9jdW1lbnQuc2Nyb2xsVG9wKCk7XG5cbiAgICAgICAgaWYgKGRpc3RhbmNlID4gMCkge1xuICAgICAgICAgICAgJGhlYWRlci5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy5oZWFkZXJfaXNfY29tcGFjdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAkaGVhZGVyLnJlbW92ZUNsYXNzKGxheW91dF9jbGFzc2VzLmhlYWRlcl9pc19jb21wYWN0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBjbGFzc2VzIHRvIGVsZW1lbnRzLCBiYXNlZCBvbiBhdHRhY2hlZCBjbGFzc2VzXG4gICAgICovXG4gICAgZnVuY3Rpb24gYWRkRWxlbWVudENsYXNzZXMoKSB7XG5cbiAgICAgICAgJChsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX3dyYXBwZXIpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciAkd3JhcHBlciA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgJGhlYWRlciA9ICR3cmFwcGVyLmNoaWxkcmVuKGxheW91dF9jbGFzc2VzLmxheW91dF9faGVhZGVyKSxcbiAgICAgICAgICAgICAgICAkZHJhd2VyID0gJHdyYXBwZXIuY2hpbGRyZW4obGF5b3V0X2NsYXNzZXMubGF5b3V0X19kcmF3ZXIpO1xuXG4gICAgICAgICAgICAvLyBTY3JvbGwgaGVhZGVyXG4gICAgICAgICAgICBpZiAoJGhlYWRlci5oYXNDbGFzcyhsYXlvdXRfY2xhc3Nlcy5oZWFkZXJfc2Nyb2xsKSkge1xuICAgICAgICAgICAgICAgICR3cmFwcGVyLmFkZENsYXNzKGxheW91dF9jbGFzc2VzLndyYXBwZXJfaGFzX3Njcm9sbGluZ19oZWFkZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEcmF3ZXJcbiAgICAgICAgICAgIGlmICgkZHJhd2VyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAkd3JhcHBlci5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy53cmFwcGVyX2hhc19kcmF3ZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVcGdyYWRlZFxuICAgICAgICAgICAgaWYgKCR3cmFwcGVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAkd3JhcHBlci5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy53cmFwcGVyX2lzX3VwZ3JhZGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHB1Yjtcbn0pKGpRdWVyeSk7XG4iLCIvKiFcbiAqIGpRdWVyeSBDb29raWUgUGx1Z2luIHYxLjQuMVxuICogaHR0cHM6Ly9naXRodWIuY29tL2NhcmhhcnRsL2pxdWVyeS1jb29raWVcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMyBLbGF1cyBIYXJ0bFxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbnZhciBqUXVlcnlDb29raWVzID0gKGZ1bmN0aW9uICgkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKCdDb29raWVzIHdlcmUgbG9hZGVkJyk7XG5cbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0Ly8gQU1EXG5cdFx0ZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuXHRcdC8vIENvbW1vbkpTXG5cdFx0ZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gQnJvd3NlciBnbG9iYWxzXG5cdFx0ZmFjdG9yeShqUXVlcnkpO1xuXHR9XG59KGZ1bmN0aW9uICgkKSB7XG5cblx0dmFyIHBsdXNlcyA9IC9cXCsvZztcblxuXHRmdW5jdGlvbiBlbmNvZGUocykge1xuXHRcdHJldHVybiBjb25maWcucmF3ID8gcyA6IGVuY29kZVVSSUNvbXBvbmVudChzKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlY29kZShzKSB7XG5cdFx0cmV0dXJuIGNvbmZpZy5yYXcgPyBzIDogZGVjb2RlVVJJQ29tcG9uZW50KHMpO1xuXHR9XG5cblx0ZnVuY3Rpb24gc3RyaW5naWZ5Q29va2llVmFsdWUodmFsdWUpIHtcblx0XHRyZXR1cm4gZW5jb2RlKGNvbmZpZy5qc29uID8gSlNPTi5zdHJpbmdpZnkodmFsdWUpIDogU3RyaW5nKHZhbHVlKSk7XG5cdH1cblxuXHRmdW5jdGlvbiBwYXJzZUNvb2tpZVZhbHVlKHMpIHtcblx0XHRpZiAocy5pbmRleE9mKCdcIicpID09PSAwKSB7XG5cdFx0XHQvLyBUaGlzIGlzIGEgcXVvdGVkIGNvb2tpZSBhcyBhY2NvcmRpbmcgdG8gUkZDMjA2OCwgdW5lc2NhcGUuLi5cblx0XHRcdHMgPSBzLnNsaWNlKDEsIC0xKS5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykucmVwbGFjZSgvXFxcXFxcXFwvZywgJ1xcXFwnKTtcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0Ly8gUmVwbGFjZSBzZXJ2ZXItc2lkZSB3cml0dGVuIHBsdXNlcyB3aXRoIHNwYWNlcy5cblx0XHRcdC8vIElmIHdlIGNhbid0IGRlY29kZSB0aGUgY29va2llLCBpZ25vcmUgaXQsIGl0J3MgdW51c2FibGUuXG5cdFx0XHQvLyBJZiB3ZSBjYW4ndCBwYXJzZSB0aGUgY29va2llLCBpZ25vcmUgaXQsIGl0J3MgdW51c2FibGUuXG5cdFx0XHRzID0gZGVjb2RlVVJJQ29tcG9uZW50KHMucmVwbGFjZShwbHVzZXMsICcgJykpO1xuXHRcdFx0cmV0dXJuIGNvbmZpZy5qc29uID8gSlNPTi5wYXJzZShzKSA6IHM7XG5cdFx0fSBjYXRjaChlKSB7fVxuXHR9XG5cblx0ZnVuY3Rpb24gcmVhZChzLCBjb252ZXJ0ZXIpIHtcblx0XHR2YXIgdmFsdWUgPSBjb25maWcucmF3ID8gcyA6IHBhcnNlQ29va2llVmFsdWUocyk7XG5cdFx0cmV0dXJuICQuaXNGdW5jdGlvbihjb252ZXJ0ZXIpID8gY29udmVydGVyKHZhbHVlKSA6IHZhbHVlO1xuXHR9XG5cblx0dmFyIGNvbmZpZyA9ICQuY29va2llID0gZnVuY3Rpb24gKGtleSwgdmFsdWUsIG9wdGlvbnMpIHtcblxuXHRcdC8vIFdyaXRlXG5cblx0XHRpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiAhJC5pc0Z1bmN0aW9uKHZhbHVlKSkge1xuXHRcdFx0b3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBjb25maWcuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMuZXhwaXJlcyA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0dmFyIGRheXMgPSBvcHRpb25zLmV4cGlyZXMsIHQgPSBvcHRpb25zLmV4cGlyZXMgPSBuZXcgRGF0ZSgpO1xuXHRcdFx0XHR0LnNldFRpbWUoK3QgKyBkYXlzICogODY0ZSs1KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIChkb2N1bWVudC5jb29raWUgPSBbXG5cdFx0XHRcdGVuY29kZShrZXkpLCAnPScsIHN0cmluZ2lmeUNvb2tpZVZhbHVlKHZhbHVlKSxcblx0XHRcdFx0b3B0aW9ucy5leHBpcmVzID8gJzsgZXhwaXJlcz0nICsgb3B0aW9ucy5leHBpcmVzLnRvVVRDU3RyaW5nKCkgOiAnJywgLy8gdXNlIGV4cGlyZXMgYXR0cmlidXRlLCBtYXgtYWdlIGlzIG5vdCBzdXBwb3J0ZWQgYnkgSUVcblx0XHRcdFx0b3B0aW9ucy5wYXRoICAgID8gJzsgcGF0aD0nICsgb3B0aW9ucy5wYXRoIDogJycsXG5cdFx0XHRcdG9wdGlvbnMuZG9tYWluICA/ICc7IGRvbWFpbj0nICsgb3B0aW9ucy5kb21haW4gOiAnJyxcblx0XHRcdFx0b3B0aW9ucy5zZWN1cmUgID8gJzsgc2VjdXJlJyA6ICcnXG5cdFx0XHRdLmpvaW4oJycpKTtcblx0XHR9XG5cblx0XHQvLyBSZWFkXG5cblx0XHR2YXIgcmVzdWx0ID0ga2V5ID8gdW5kZWZpbmVkIDoge307XG5cblx0XHQvLyBUbyBwcmV2ZW50IHRoZSBmb3IgbG9vcCBpbiB0aGUgZmlyc3QgcGxhY2UgYXNzaWduIGFuIGVtcHR5IGFycmF5XG5cdFx0Ly8gaW4gY2FzZSB0aGVyZSBhcmUgbm8gY29va2llcyBhdCBhbGwuIEFsc28gcHJldmVudHMgb2RkIHJlc3VsdCB3aGVuXG5cdFx0Ly8gY2FsbGluZyAkLmNvb2tpZSgpLlxuXHRcdHZhciBjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7ICcpIDogW107XG5cblx0XHRmb3IgKHZhciBpID0gMCwgbCA9IGNvb2tpZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHR2YXIgcGFydHMgPSBjb29raWVzW2ldLnNwbGl0KCc9Jyk7XG5cdFx0XHR2YXIgbmFtZSA9IGRlY29kZShwYXJ0cy5zaGlmdCgpKTtcblx0XHRcdHZhciBjb29raWUgPSBwYXJ0cy5qb2luKCc9Jyk7XG5cblx0XHRcdGlmIChrZXkgJiYga2V5ID09PSBuYW1lKSB7XG5cdFx0XHRcdC8vIElmIHNlY29uZCBhcmd1bWVudCAodmFsdWUpIGlzIGEgZnVuY3Rpb24gaXQncyBhIGNvbnZlcnRlci4uLlxuXHRcdFx0XHRyZXN1bHQgPSByZWFkKGNvb2tpZSwgdmFsdWUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblxuXHRcdFx0Ly8gUHJldmVudCBzdG9yaW5nIGEgY29va2llIHRoYXQgd2UgY291bGRuJ3QgZGVjb2RlLlxuXHRcdFx0aWYgKCFrZXkgJiYgKGNvb2tpZSA9IHJlYWQoY29va2llKSkgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRyZXN1bHRbbmFtZV0gPSBjb29raWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblxuXHRjb25maWcuZGVmYXVsdHMgPSB7fTtcblxuXHQkLnJlbW92ZUNvb2tpZSA9IGZ1bmN0aW9uIChrZXksIG9wdGlvbnMpIHtcblx0XHRpZiAoJC5jb29raWUoa2V5KSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gTXVzdCBub3QgYWx0ZXIgb3B0aW9ucywgdGh1cyBleHRlbmRpbmcgYSBmcmVzaCBvYmplY3QuLi5cblx0XHQkLmNvb2tpZShrZXksICcnLCAkLmV4dGVuZCh7fSwgb3B0aW9ucywgeyBleHBpcmVzOiAtMSB9KSk7XG5cdFx0cmV0dXJuICEkLmNvb2tpZShrZXkpO1xuXHR9O1xuXG59KSk7XG4gICAgXG4gICAgXG59KShqUXVlcnkpOyIsIi8vIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gfCBNb2RhbCBQb3BVcFxuLy8gfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB8XG4vLyB8IFRoaXMgalF1ZXJ5IHNjcmlwdCBpcyB3cml0dGVuIGJ5XG4vLyB8IFNpbW9uIFRvZnRlYnlcbi8vIHxcblxudmFyIG1vZGFsUG9wVXAgPSAoZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBwdWIgPSB7fTtcblxuICAvKipcbiAgICogSW5zdGFudGlhdGVcbiAgICovXG4gIHB1Yi5pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICByZWdpc3RlckV2ZW50SGFuZGxlcnMoKTtcbiAgICByZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGJvb3QgZXZlbnQgaGFuZGxlcnNcbiAgICovXG4gIGZ1bmN0aW9uIHJlZ2lzdGVyQm9vdEV2ZW50SGFuZGxlcnMoKSB7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnNcbiAgICovXG4gIGZ1bmN0aW9uIHJlZ2lzdGVyRXZlbnRIYW5kbGVycygpIHtcblxuICAgIC8vSW5zZXJ0IGJlbG93XG4gICAgaWYgKCQuY29va2llKFwibm9fdGhhbmtzXCIpID09IG51bGwpIHtcblxuICAgICAgLy8gSGlkZSB0aGUgZGl2XG4gICAgICAkKFwiI2Jsb2NrLXBvcHVwLWN0YVwiKS5oaWRlKCk7XG5cbiAgICAgIC8vIFNob3cgdGhlIGRpdiBpbiA1c1xuICAgICAgJChcIiNibG9jay1wb3B1cC1jdGFcIikuZGVsYXkoMTAwMDApLmZhZGVJbigzMDApO1xuXG4gICAgICAvL0Nsb3NlIGRpdlxuICAgICAgJChcIi5jbG9zZVwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoXCIjYmxvY2stcG9wdXAtY3RhXCIpLmhpZGUoKTtcblxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgJChcIi5jbG9zZVwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgJC5jb29raWUoJ25vX3RoYW5rcycsICd0cnVlJywge2V4cGlyZXM6IDM2NTAwLCBwYXRoOiAnLyd9KTtcbiAgfSk7XG5cbiAgaWYgKCQuY29va2llKFwibm9fdGhhbmtzXCIpICE9PSB0cnVlKSB7XG4gICAgJChcIiNibG9jay1wb3B1cC1jdGFcIikuaGlkZSgpO1xuICB9XG5cbiAgcmV0dXJuIHB1Yjtcbn0pKGpRdWVyeSk7XG4iLCIvLyBEb2N1bWVudCByZWFkeVxuKGZ1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBFbmFibGUgbGF5b3V0XG4gIGxheW91dC5pbml0KCk7XG5cbiAgLy9Nb2RhbCBQb3BVcFxuICBtb2RhbFBvcFVwLmluaXQoKTtcblxuICAkKFwiI3RvZ2dsZV9tb2JpbGVfbWVudVwiKS5jbGljayhmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAkKCcjbWFpbi1tZW51JykudG9nZ2xlQ2xhc3MoJ21vYmlsZS1tZW51LW9wZW4nKTtcbiAgICAkKCcubGF5b3V0X19kb2N1bWVudCcpLnRvZ2dsZUNsYXNzKCdtb2JpbGUtbWVudS1vcGVuJyk7XG4gIH0pXG5cbi8vU2hvdyBzZWFyY2ggZm9ybSBibG9ja1xuICAkKFwiLnNlYXJjaC1idXR0b25cIikuY2xpY2soZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKCQoXCIjc2VhcmNoLWZvcm0tcG9wb3ZlclwiKS5oYXNDbGFzcyhcImhpZGRlblwiKSkge1xuICAgICAgJChcIiNzZWFyY2gtZm9ybS1wb3BvdmVyXCIpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoXCIuZm9ybS1jb250cm9sXCIpLmZvY3VzKCk7XG4gICAgfVxuICB9KTtcblxuLy9IaWRlIHNlYXJjaCBmb3JtIGJsb2NrXG4gICQoZG9jdW1lbnQpLmNsaWNrKGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmICghJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJyNzZWFyY2gtZm9ybS1wb3BvdmVyJykubGVuZ3RoICYmICEkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnNlYXJjaC1idXR0b24nKS5sZW5ndGgpIHtcbiAgICAgIGlmICghJChcIiNzZWFyY2gtZm9ybS1wb3BvdmVyXCIpLmhhc0NsYXNzKFwiaGlkZGVuXCIpKSB7XG4gICAgICAgICQoXCIjc2VhcmNoLWZvcm0tcG9wb3ZlclwiKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAvL0ltcHJvdmluZyB1c2FiaWxpdHkgZm9yIG1lbnVkcm9wZG93bnMgZm9yIG1vYmlsZSBkZXZpY2VzXG4gIGlmICghISgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpKSB7Ly9jaGVjayBmb3IgdG91Y2ggZGV2aWNlXG4gICAgJCgnbGkuZHJvcGRvd24ubGF5b3V0LW5hdmlnYXRpb25fX2Ryb3Bkb3duJykuZmluZCgnPiBhJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgIGlmICgkKHRoaXMpLnBhcmVudCgpLmhhc0NsYXNzKFwiZXhwYW5kZWRcIikpIHtcbiAgICAgICAgLy8kKHRoaXMpLnBhcmVudCgpLnJlbW92ZUNsYXNzKFwiZXhwYW5kZWRcIik7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmFkZENsYXNzKFwiZXhwYW5kZWRcIik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgZWxzZSB7Ly9rZWVwaW5nIGl0IGNvbXBhdGlibGUgd2l0aCBkZXNrdG9wIGRldmljZXNcbiAgICAkKCdsaS5kcm9wZG93bi5sYXlvdXQtbmF2aWdhdGlvbl9fZHJvcGRvd24nKS5ob3ZlcihcbiAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKFwiZXhwYW5kZWRcIik7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImV4cGFuZGVkXCIpO1xuICAgICAgICB9XG4gICAgKTtcbiAgfVxuXG59KShqUXVlcnkpO1xuIl19
