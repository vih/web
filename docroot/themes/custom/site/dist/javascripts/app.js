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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* ========================================================================
 * Bootstrap: tooltip.js v3.3.7
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function Tooltip(element, options) {
    this.type = null;
    this.options = null;
    this.enabled = null;
    this.timeout = null;
    this.hoverState = null;
    this.$element = null;
    this.inState = null;

    this.init('tooltip', element, options);
  };

  Tooltip.VERSION = '3.3.7';

  Tooltip.TRANSITION_DURATION = 150;

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  };

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled = true;
    this.type = type;
    this.$element = $(element);
    this.options = this.getOptions(options);
    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : this.options.viewport.selector || this.options.viewport);
    this.inState = { click: false, hover: false, focus: false };

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!');
    }

    var triggers = this.options.trigger.split(' ');

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i];

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
      } else if (trigger != 'manual') {
        var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin';
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

        this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
      }
    }

    this.options.selector ? this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' }) : this.fixTitle();
  };

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS;
  };

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options);

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      };
    }

    return options;
  };

  Tooltip.prototype.getDelegateOptions = function () {
    var options = {};
    var defaults = this.getDefaults();

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value;
    });

    return options;
  };

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type);

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
      $(obj.currentTarget).data('bs.' + this.type, self);
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true;
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in';
      return;
    }

    clearTimeout(self.timeout);

    self.hoverState = 'in';

    if (!self.options.delay || !self.options.delay.show) return self.show();

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show();
    }, self.options.delay.show);
  };

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true;
    }

    return false;
  };

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type);

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
      $(obj.currentTarget).data('bs.' + this.type, self);
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false;
    }

    if (self.isInStateTrue()) return;

    clearTimeout(self.timeout);

    self.hoverState = 'out';

    if (!self.options.delay || !self.options.delay.hide) return self.hide();

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide();
    }, self.options.delay.hide);
  };

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type);

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e);

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0]);
      if (e.isDefaultPrevented() || !inDom) return;
      var that = this;

      var $tip = this.tip();

      var tipId = this.getUID(this.type);

      this.setContent();
      $tip.attr('id', tipId);
      this.$element.attr('aria-describedby', tipId);

      if (this.options.animation) $tip.addClass('fade');

      var placement = typeof this.options.placement == 'function' ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement;

      var autoToken = /\s?auto?\s?/i;
      var autoPlace = autoToken.test(placement);
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top';

      $tip.detach().css({ top: 0, left: 0, display: 'block' }).addClass(placement).data('bs.' + this.type, this);

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);
      this.$element.trigger('inserted.bs.' + this.type);

      var pos = this.getPosition();
      var actualWidth = $tip[0].offsetWidth;
      var actualHeight = $tip[0].offsetHeight;

      if (autoPlace) {
        var orgPlacement = placement;
        var viewportDim = this.getPosition(this.$viewport);

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top' : placement == 'top' && pos.top - actualHeight < viewportDim.top ? 'bottom' : placement == 'right' && pos.right + actualWidth > viewportDim.width ? 'left' : placement == 'left' && pos.left - actualWidth < viewportDim.left ? 'right' : placement;

        $tip.removeClass(orgPlacement).addClass(placement);
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

      this.applyPlacement(calculatedOffset, placement);

      var complete = function complete() {
        var prevHoverState = that.hoverState;
        that.$element.trigger('shown.bs.' + that.type);
        that.hoverState = null;

        if (prevHoverState == 'out') that.leave(that);
      };

      $.support.transition && this.$tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION) : complete();
    }
  };

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip = this.tip();
    var width = $tip[0].offsetWidth;
    var height = $tip[0].offsetHeight;

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10);
    var marginLeft = parseInt($tip.css('margin-left'), 10);

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop)) marginTop = 0;
    if (isNaN(marginLeft)) marginLeft = 0;

    offset.top += marginTop;
    offset.left += marginLeft;

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function using(props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        });
      }
    }, offset), 0);

    $tip.addClass('in');

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth = $tip[0].offsetWidth;
    var actualHeight = $tip[0].offsetHeight;

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight;
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight);

    if (delta.left) offset.left += delta.left;else offset.top += delta.top;

    var isVertical = /top|bottom/.test(placement);
    var arrowDelta = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight;
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight';

    $tip.offset(offset);
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical);
  };

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow().css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%').css(isVertical ? 'top' : 'left', '');
  };

  Tooltip.prototype.setContent = function () {
    var $tip = this.tip();
    var title = this.getTitle();

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title);
    $tip.removeClass('fade in top bottom left right');
  };

  Tooltip.prototype.hide = function (callback) {
    var that = this;
    var $tip = $(this.$tip);
    var e = $.Event('hide.bs.' + this.type);

    function complete() {
      if (that.hoverState != 'in') $tip.detach();
      if (that.$element) {
        // TODO: Check whether guarding this code with this `if` is really necessary.
        that.$element.removeAttr('aria-describedby').trigger('hidden.bs.' + that.type);
      }
      callback && callback();
    }

    this.$element.trigger(e);

    if (e.isDefaultPrevented()) return;

    $tip.removeClass('in');

    $.support.transition && $tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION) : complete();

    this.hoverState = null;

    return this;
  };

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element;
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
    }
  };

  Tooltip.prototype.hasContent = function () {
    return this.getTitle();
  };

  Tooltip.prototype.getPosition = function ($element) {
    $element = $element || this.$element;

    var el = $element[0];
    var isBody = el.tagName == 'BODY';

    var elRect = el.getBoundingClientRect();
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top });
    }
    var isSvg = window.SVGElement && el instanceof window.SVGElement;
    // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
    // See https://github.com/twbs/bootstrap/issues/20280
    var elOffset = isBody ? { top: 0, left: 0 } : isSvg ? null : $element.offset();
    var scroll = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() };
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null;

    return $.extend({}, elRect, scroll, outerDims, elOffset);
  };

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2 } : placement == 'top' ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } : placement == 'left' ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
    /* placement == 'right' */{ top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width };
  };

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 };
    if (!this.$viewport) return delta;

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0;
    var viewportDimensions = this.getPosition(this.$viewport);

    if (/right|left/.test(placement)) {
      var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll;
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight;
      if (topEdgeOffset < viewportDimensions.top) {
        // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset;
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) {
        // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset;
      }
    } else {
      var leftEdgeOffset = pos.left - viewportPadding;
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth;
      if (leftEdgeOffset < viewportDimensions.left) {
        // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset;
      } else if (rightEdgeOffset > viewportDimensions.right) {
        // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset;
      }
    }

    return delta;
  };

  Tooltip.prototype.getTitle = function () {
    var title;
    var $e = this.$element;
    var o = this.options;

    title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title);

    return title;
  };

  Tooltip.prototype.getUID = function (prefix) {
    do {
      prefix += ~~(Math.random() * 1000000);
    } while (document.getElementById(prefix));
    return prefix;
  };

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template);
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!');
      }
    }
    return this.$tip;
  };

  Tooltip.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow');
  };

  Tooltip.prototype.enable = function () {
    this.enabled = true;
  };

  Tooltip.prototype.disable = function () {
    this.enabled = false;
  };

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled;
  };

  Tooltip.prototype.toggle = function (e) {
    var self = this;
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type);
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions());
        $(e.currentTarget).data('bs.' + this.type, self);
      }
    }

    if (e) {
      self.inState.click = !self.inState.click;
      if (self.isInStateTrue()) self.enter(self);else self.leave(self);
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self);
    }
  };

  Tooltip.prototype.destroy = function () {
    var that = this;
    clearTimeout(this.timeout);
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type);
      if (that.$tip) {
        that.$tip.detach();
      }
      that.$tip = null;
      that.$arrow = null;
      that.$viewport = null;
      that.$element = null;
    });
  };

  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.tooltip');
      var options = (typeof option === 'undefined' ? 'undefined' : _typeof(option)) == 'object' && option;

      if (!data && /destroy|hide/.test(option)) return;
      if (!data) $this.data('bs.tooltip', data = new Tooltip(this, options));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.tooltip;

  $.fn.tooltip = Plugin;
  $.fn.tooltip.Constructor = Tooltip;

  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old;
    return this;
  };
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* ========================================================================
 * Bootstrap: popover.js v3.3.7
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function Popover(element, options) {
    this.init('popover', element, options);
  };

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js');

  Popover.VERSION = '3.3.7';

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  });

  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype);

  Popover.prototype.constructor = Popover;

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS;
  };

  Popover.prototype.setContent = function () {
    var $tip = this.tip();
    var title = this.getTitle();
    var content = this.getContent();

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title);
    $tip.find('.popover-content').children().detach().end()[// we use append for html objects to maintain js events
    this.options.html ? typeof content == 'string' ? 'html' : 'append' : 'text'](content);

    $tip.removeClass('fade top bottom left right in');

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide();
  };

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent();
  };

  Popover.prototype.getContent = function () {
    var $e = this.$element;
    var o = this.options;

    return $e.attr('data-content') || (typeof o.content == 'function' ? o.content.call($e[0]) : o.content);
  };

  Popover.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.arrow');
  };

  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.popover');
      var options = (typeof option === 'undefined' ? 'undefined' : _typeof(option)) == 'object' && option;

      if (!data && /destroy|hide/.test(option)) return;
      if (!data) $this.data('bs.popover', data = new Popover(this, options));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.popover;

  $.fn.popover = Plugin;
  $.fn.popover.Constructor = Popover;

  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old;
    return this;
  };
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* ========================================================================
 * Bootstrap: modal.js v3.3.7
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function Modal(element, options) {
    this.options = options;
    this.$body = $(document.body);
    this.$element = $(element);
    this.$dialog = this.$element.find('.modal-dialog');
    this.$backdrop = null;
    this.isShown = null;
    this.originalBodyPad = null;
    this.scrollbarWidth = 0;
    this.ignoreBackdropClick = false;

    if (this.options.remote) {
      this.$element.find('.modal-content').load(this.options.remote, $.proxy(function () {
        this.$element.trigger('loaded.bs.modal');
      }, this));
    }
  };

  Modal.VERSION = '3.3.7';

  Modal.TRANSITION_DURATION = 300;
  Modal.BACKDROP_TRANSITION_DURATION = 150;

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  };

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget);
  };

  Modal.prototype.show = function (_relatedTarget) {
    var that = this;
    var e = $.Event('show.bs.modal', { relatedTarget: _relatedTarget });

    this.$element.trigger(e);

    if (this.isShown || e.isDefaultPrevented()) return;

    this.isShown = true;

    this.checkScrollbar();
    this.setScrollbar();
    this.$body.addClass('modal-open');

    this.escape();
    this.resize();

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this));

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true;
      });
    });

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade');

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body); // don't move modals dom position
      }

      that.$element.show().scrollTop(0);

      that.adjustDialog();

      if (transition) {
        that.$element[0].offsetWidth; // force reflow
      }

      that.$element.addClass('in');

      that.enforceFocus();

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget });

      transition ? that.$dialog // wait for modal to slide in
      .one('bsTransitionEnd', function () {
        that.$element.trigger('focus').trigger(e);
      }).emulateTransitionEnd(Modal.TRANSITION_DURATION) : that.$element.trigger('focus').trigger(e);
    });
  };

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault();

    e = $.Event('hide.bs.modal');

    this.$element.trigger(e);

    if (!this.isShown || e.isDefaultPrevented()) return;

    this.isShown = false;

    this.escape();
    this.resize();

    $(document).off('focusin.bs.modal');

    this.$element.removeClass('in').off('click.dismiss.bs.modal').off('mouseup.dismiss.bs.modal');

    this.$dialog.off('mousedown.dismiss.bs.modal');

    $.support.transition && this.$element.hasClass('fade') ? this.$element.one('bsTransitionEnd', $.proxy(this.hideModal, this)).emulateTransitionEnd(Modal.TRANSITION_DURATION) : this.hideModal();
  };

  Modal.prototype.enforceFocus = function () {
    $(document).off('focusin.bs.modal') // guard against infinite focus loop
    .on('focusin.bs.modal', $.proxy(function (e) {
      if (document !== e.target && this.$element[0] !== e.target && !this.$element.has(e.target).length) {
        this.$element.trigger('focus');
      }
    }, this));
  };

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide();
      }, this));
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal');
    }
  };

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this));
    } else {
      $(window).off('resize.bs.modal');
    }
  };

  Modal.prototype.hideModal = function () {
    var that = this;
    this.$element.hide();
    this.backdrop(function () {
      that.$body.removeClass('modal-open');
      that.resetAdjustments();
      that.resetScrollbar();
      that.$element.trigger('hidden.bs.modal');
    });
  };

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove();
    this.$backdrop = null;
  };

  Modal.prototype.backdrop = function (callback) {
    var that = this;
    var animate = this.$element.hasClass('fade') ? 'fade' : '';

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate;

      this.$backdrop = $(document.createElement('div')).addClass('modal-backdrop ' + animate).appendTo(this.$body);

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false;
          return;
        }
        if (e.target !== e.currentTarget) return;
        this.options.backdrop == 'static' ? this.$element[0].focus() : this.hide();
      }, this));

      if (doAnimate) this.$backdrop[0].offsetWidth; // force reflow

      this.$backdrop.addClass('in');

      if (!callback) return;

      doAnimate ? this.$backdrop.one('bsTransitionEnd', callback).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) : callback();
    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in');

      var callbackRemove = function callbackRemove() {
        that.removeBackdrop();
        callback && callback();
      };
      $.support.transition && this.$element.hasClass('fade') ? this.$backdrop.one('bsTransitionEnd', callbackRemove).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) : callbackRemove();
    } else if (callback) {
      callback();
    }
  };

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog();
  };

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight;

    this.$element.css({
      paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    });
  };

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    });
  };

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth;
    if (!fullWindowWidth) {
      // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect();
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
    this.scrollbarWidth = this.measureScrollbar();
  };

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt(this.$body.css('padding-right') || 0, 10);
    this.originalBodyPad = document.body.style.paddingRight || '';
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth);
  };

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad);
  };

  Modal.prototype.measureScrollbar = function () {
    // thx walsh
    var scrollDiv = document.createElement('div');
    scrollDiv.className = 'modal-scrollbar-measure';
    this.$body.append(scrollDiv);
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    this.$body[0].removeChild(scrollDiv);
    return scrollbarWidth;
  };

  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.modal');
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), (typeof option === 'undefined' ? 'undefined' : _typeof(option)) == 'object' && option);

      if (!data) $this.data('bs.modal', data = new Modal(this, options));
      if (typeof option == 'string') data[option](_relatedTarget);else if (options.show) data.show(_relatedTarget);
    });
  }

  var old = $.fn.modal;

  $.fn.modal = Plugin;
  $.fn.modal.Constructor = Modal;

  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old;
    return this;
  };

  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this = $(this);
    var href = $this.attr('href');
    var $target = $($this.attr('data-target') || href && href.replace(/.*(?=#[^\s]+$)/, '')); // strip for ie7
    var option = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

    if ($this.is('a')) e.preventDefault();

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return; // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus');
      });
    });
    Plugin.call($target, option, this);
  });
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * JavaScript Cookie v2.2.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader = false;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
})(function () {
	function extend() {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[i];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init(converter) {
		function api(key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';

				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}
					stringifiedAttributes += '=' + attributes[attributeName];
				}
				return document.cookie = key + '=' + value + stringifiedAttributes;
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (!this.json && cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ? converter.read(cookie, name) : converter(cookie, name) || cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
});
"use strict";

!function (e) {
  var t;e.fn.slinky = function (a) {
    var s = e.extend({ label: "Back", title: !1, speed: 300, resize: !0 }, a),
        i = e(this),
        n = i.children().first();i.addClass("slinky-menu");var r = function r(e, t) {
      var a = Math.round(parseInt(n.get(0).style.left)) || 0;n.css("left", a - 100 * e + "%"), "function" == typeof t && setTimeout(t, s.speed);
    },
        l = function l(e) {
      i.height(e.outerHeight());
    },
        d = function d(e) {
      i.css("transition-duration", e + "ms"), n.css("transition-duration", e + "ms");
    };if (d(s.speed), e("a + ul", i).prev().addClass("next"), e("li > ul", i).prepend('<li class="header">'), s.title === !0 && e("li > ul", i).each(function () {
      var t = e(this).parent().find("a").first().text(),
          a = e("<h2>").text(t);e("> .header", this).append(a);
    }), s.title || s.label !== !0) {
      var o = e("<a>").text(s.label).prop("href", "#").addClass("back");e(".header", i).append(o);
    } else e("li > ul", i).each(function () {
      var t = e(this).parent().find("a").first().text(),
          a = e("<a>").text(t).prop("href", "#").addClass("back");e("> .header", this).append(a);
    });e("a", i).on("click", function (a) {
      if (!(t + s.speed > Date.now())) {
        t = Date.now();var n = e(this);/#/.test(this.href) && a.preventDefault(), n.hasClass("next") ? (i.find(".active").removeClass("active"), n.next().show().addClass("active"), r(1), s.resize && l(n.next())) : n.hasClass("back") && (r(-1, function () {
          i.find(".active").removeClass("active"), n.parent().parent().hide().parentsUntil(i, "ul").first().addClass("active");
        }), s.resize && l(n.parent().parent().parentsUntil(i, "ul")));
      }
    }), this.jump = function (t, a) {
      t = e(t);var n = i.find(".active");n = n.length > 0 ? n.parentsUntil(i, "ul").length : 0, i.find("ul").removeClass("active").hide();var o = t.parentsUntil(i, "ul");o.show(), t.show().addClass("active"), a === !1 && d(0), r(o.length - n), s.resize && l(t), a === !1 && d(s.speed);
    }, this.home = function (t) {
      t === !1 && d(0);var a = i.find(".active"),
          n = a.parentsUntil(i, "li").length;n > 0 && (r(-n, function () {
        a.removeClass("active");
      }), s.resize && l(e(a.parentsUntil(i, "li").get(n - 1)).parent())), t === !1 && d(s.speed);
    }, this.destroy = function () {
      e(".header", i).remove(), e("a", i).removeClass("next").off("click"), i.removeClass("slinky-menu").css("transition-duration", ""), n.css("transition-duration", "");
    };var c = i.find(".active");return c.length > 0 && (c.removeClass("active"), this.jump(c, !1)), this;
  };
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

// Document ready
(function ($) {
  'use strict';

  // Enable layout

  layout.init();

  // Slinky
  $('.slinky-menu').find('ul, li, a').removeClass();

  $('.region-mobile-header-navigation .slinky-menu').slinky({
    title: true,
    label: ''
  });

  // Notify
  var $notifications = $('.notify');
  if ($notifications.length) {

    $notifications.each(function (index, val) {
      var $document = $('.layout__document'),
          $region = $('.region-notify'),
          $element = $(this),
          cookie_id = 'notify_id_' + $element.attr('id'),
          $close = $element.find('.notify__close');

      // Flex magic - fixing display: block on fadeIn (see: https://stackoverflow.com/questions/28904698/how-fade-in-a-flex-box)
      $element.css('display', 'flex').hide();

      // No cookie has been set yet
      if (!Cookies.get(cookie_id)) {

        // Fade the element in
        $element.delay(2000).fadeIn(function () {
          var height = $region.outerHeight(true);

          $document.css('padding-bottom', height);
        });
      }

      // Closed
      $close.on('click', function (event) {
        $element.fadeOut(function () {
          $document.css('padding-bottom', 0);
        });

        // Set a cookie, to stop this notification from being displayed again
        Cookies.set(cookie_id, true);
      });
    });
  }

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

  // Toggler
  $('[data-toggler]').on('click', function (event) {
    event.preventDefault();

    var $element = $(this),
        target = $element.attr('data-toggler'),
        $parent = $element.parents('.toggler'),
        $target = $parent.find(target),
        $all_toggle_buttons = $parent.find('[data-toggler]'),
        $toggle_button = $parent.find('[data-toggler="' + target + '"]'),
        $all_content = $parent.find('.toggler__content');

    // Remove all active togglers
    $all_toggle_buttons.parent().removeClass('active');

    $all_content.removeClass('active');

    // Show
    $toggle_button.parent().addClass('active');
    $target.addClass('active');
  });

  $(".toggler").each(function (index) {
    $(this).find('.toggler__button').first().trigger('click');
  });

  // Use multiple modals (http://jsfiddle.net/likhi1/wtj6nacd/)
  $('#openBtn').click(function () {
    $('#myModal').modal({
      show: true
    });
  });

  $(document).on({
    'show.bs.modal': function showBsModal() {
      var zIndex = 1040 + 10 * $('.modal:visible').length;
      $(this).css('z-index', zIndex);
      setTimeout(function () {
        $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
      }, 0);
    },
    'hidden.bs.modal': function hiddenBsModal() {
      if ($('.modal:visible').length > 0) {
        // restore the modal-open class to the body element, so that scrolling
        // works properly after de-stacking a modal.
        setTimeout(function () {
          $(document.body).addClass('modal-open');
        }, 0);
      }
    }
  }, '.modal');
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhYi5qcyIsImNvbGxhcHNlLmpzIiwidHJhbnNpdGlvbi5qcyIsInRvb2x0aXAuanMiLCJwb3BvdmVyLmpzIiwibW9kYWwuanMiLCJqcy5jb29raWUuanMiLCJqcXVlcnkuc2xpbmt5LmpzIiwibGF5b3V0LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIiQiLCJUYWIiLCJlbGVtZW50IiwiVkVSU0lPTiIsIlRSQU5TSVRJT05fRFVSQVRJT04iLCJwcm90b3R5cGUiLCJzaG93IiwiJHRoaXMiLCIkdWwiLCJjbG9zZXN0Iiwic2VsZWN0b3IiLCJkYXRhIiwiYXR0ciIsInJlcGxhY2UiLCJwYXJlbnQiLCJoYXNDbGFzcyIsIiRwcmV2aW91cyIsImZpbmQiLCJoaWRlRXZlbnQiLCJFdmVudCIsInJlbGF0ZWRUYXJnZXQiLCJzaG93RXZlbnQiLCJ0cmlnZ2VyIiwiaXNEZWZhdWx0UHJldmVudGVkIiwiJHRhcmdldCIsImFjdGl2YXRlIiwidHlwZSIsImNvbnRhaW5lciIsImNhbGxiYWNrIiwiJGFjdGl2ZSIsInRyYW5zaXRpb24iLCJzdXBwb3J0IiwibGVuZ3RoIiwibmV4dCIsInJlbW92ZUNsYXNzIiwiZW5kIiwiYWRkQ2xhc3MiLCJvZmZzZXRXaWR0aCIsIm9uZSIsImVtdWxhdGVUcmFuc2l0aW9uRW5kIiwiUGx1Z2luIiwib3B0aW9uIiwiZWFjaCIsIm9sZCIsImZuIiwidGFiIiwiQ29uc3RydWN0b3IiLCJub0NvbmZsaWN0IiwiY2xpY2tIYW5kbGVyIiwiZSIsInByZXZlbnREZWZhdWx0IiwiY2FsbCIsImRvY3VtZW50Iiwib24iLCJqUXVlcnkiLCJDb2xsYXBzZSIsIm9wdGlvbnMiLCIkZWxlbWVudCIsImV4dGVuZCIsIkRFRkFVTFRTIiwiJHRyaWdnZXIiLCJpZCIsInRyYW5zaXRpb25pbmciLCIkcGFyZW50IiwiZ2V0UGFyZW50IiwiYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzIiwidG9nZ2xlIiwiZGltZW5zaW9uIiwiaGFzV2lkdGgiLCJhY3RpdmVzRGF0YSIsImFjdGl2ZXMiLCJjaGlsZHJlbiIsInN0YXJ0RXZlbnQiLCJjb21wbGV0ZSIsInNjcm9sbFNpemUiLCJjYW1lbENhc2UiLCJqb2luIiwicHJveHkiLCJoaWRlIiwib2Zmc2V0SGVpZ2h0IiwiaSIsImdldFRhcmdldEZyb21UcmlnZ2VyIiwiaXNPcGVuIiwidG9nZ2xlQ2xhc3MiLCJocmVmIiwidGFyZ2V0IiwidGVzdCIsImNvbGxhcHNlIiwidHJhbnNpdGlvbkVuZCIsImVsIiwiY3JlYXRlRWxlbWVudCIsInRyYW5zRW5kRXZlbnROYW1lcyIsIldlYmtpdFRyYW5zaXRpb24iLCJNb3pUcmFuc2l0aW9uIiwiT1RyYW5zaXRpb24iLCJuYW1lIiwic3R5bGUiLCJ1bmRlZmluZWQiLCJkdXJhdGlvbiIsImNhbGxlZCIsIiRlbCIsInNldFRpbWVvdXQiLCJldmVudCIsInNwZWNpYWwiLCJic1RyYW5zaXRpb25FbmQiLCJiaW5kVHlwZSIsImRlbGVnYXRlVHlwZSIsImhhbmRsZSIsImlzIiwiaGFuZGxlT2JqIiwiaGFuZGxlciIsImFwcGx5IiwiYXJndW1lbnRzIiwiVG9vbHRpcCIsImVuYWJsZWQiLCJ0aW1lb3V0IiwiaG92ZXJTdGF0ZSIsImluU3RhdGUiLCJpbml0IiwiYW5pbWF0aW9uIiwicGxhY2VtZW50IiwidGVtcGxhdGUiLCJ0aXRsZSIsImRlbGF5IiwiaHRtbCIsInZpZXdwb3J0IiwicGFkZGluZyIsImdldE9wdGlvbnMiLCIkdmlld3BvcnQiLCJpc0Z1bmN0aW9uIiwiY2xpY2siLCJob3ZlciIsImZvY3VzIiwiY29uc3RydWN0b3IiLCJFcnJvciIsInRyaWdnZXJzIiwic3BsaXQiLCJldmVudEluIiwiZXZlbnRPdXQiLCJlbnRlciIsImxlYXZlIiwiX29wdGlvbnMiLCJmaXhUaXRsZSIsImdldERlZmF1bHRzIiwiZ2V0RGVsZWdhdGVPcHRpb25zIiwiZGVmYXVsdHMiLCJrZXkiLCJ2YWx1ZSIsIm9iaiIsInNlbGYiLCJjdXJyZW50VGFyZ2V0IiwidGlwIiwiY2xlYXJUaW1lb3V0IiwiaXNJblN0YXRlVHJ1ZSIsImhhc0NvbnRlbnQiLCJpbkRvbSIsImNvbnRhaW5zIiwib3duZXJEb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsInRoYXQiLCIkdGlwIiwidGlwSWQiLCJnZXRVSUQiLCJzZXRDb250ZW50IiwiYXV0b1Rva2VuIiwiYXV0b1BsYWNlIiwiZGV0YWNoIiwiY3NzIiwidG9wIiwibGVmdCIsImRpc3BsYXkiLCJhcHBlbmRUbyIsImluc2VydEFmdGVyIiwicG9zIiwiZ2V0UG9zaXRpb24iLCJhY3R1YWxXaWR0aCIsImFjdHVhbEhlaWdodCIsIm9yZ1BsYWNlbWVudCIsInZpZXdwb3J0RGltIiwiYm90dG9tIiwicmlnaHQiLCJ3aWR0aCIsImNhbGN1bGF0ZWRPZmZzZXQiLCJnZXRDYWxjdWxhdGVkT2Zmc2V0IiwiYXBwbHlQbGFjZW1lbnQiLCJwcmV2SG92ZXJTdGF0ZSIsIm9mZnNldCIsImhlaWdodCIsIm1hcmdpblRvcCIsInBhcnNlSW50IiwibWFyZ2luTGVmdCIsImlzTmFOIiwic2V0T2Zmc2V0IiwidXNpbmciLCJwcm9wcyIsIk1hdGgiLCJyb3VuZCIsImRlbHRhIiwiZ2V0Vmlld3BvcnRBZGp1c3RlZERlbHRhIiwiaXNWZXJ0aWNhbCIsImFycm93RGVsdGEiLCJhcnJvd09mZnNldFBvc2l0aW9uIiwicmVwbGFjZUFycm93IiwiYXJyb3ciLCJnZXRUaXRsZSIsInJlbW92ZUF0dHIiLCIkZSIsImlzQm9keSIsInRhZ05hbWUiLCJlbFJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJpc1N2ZyIsIndpbmRvdyIsIlNWR0VsZW1lbnQiLCJlbE9mZnNldCIsInNjcm9sbCIsInNjcm9sbFRvcCIsImJvZHkiLCJvdXRlckRpbXMiLCJ2aWV3cG9ydFBhZGRpbmciLCJ2aWV3cG9ydERpbWVuc2lvbnMiLCJ0b3BFZGdlT2Zmc2V0IiwiYm90dG9tRWRnZU9mZnNldCIsImxlZnRFZGdlT2Zmc2V0IiwicmlnaHRFZGdlT2Zmc2V0IiwibyIsInByZWZpeCIsInJhbmRvbSIsImdldEVsZW1lbnRCeUlkIiwiJGFycm93IiwiZW5hYmxlIiwiZGlzYWJsZSIsInRvZ2dsZUVuYWJsZWQiLCJkZXN0cm95Iiwib2ZmIiwicmVtb3ZlRGF0YSIsInRvb2x0aXAiLCJQb3BvdmVyIiwiY29udGVudCIsImdldENvbnRlbnQiLCJwb3BvdmVyIiwiTW9kYWwiLCIkYm9keSIsIiRkaWFsb2ciLCIkYmFja2Ryb3AiLCJpc1Nob3duIiwib3JpZ2luYWxCb2R5UGFkIiwic2Nyb2xsYmFyV2lkdGgiLCJpZ25vcmVCYWNrZHJvcENsaWNrIiwicmVtb3RlIiwibG9hZCIsIkJBQ0tEUk9QX1RSQU5TSVRJT05fRFVSQVRJT04iLCJiYWNrZHJvcCIsImtleWJvYXJkIiwiX3JlbGF0ZWRUYXJnZXQiLCJjaGVja1Njcm9sbGJhciIsInNldFNjcm9sbGJhciIsImVzY2FwZSIsInJlc2l6ZSIsImFkanVzdERpYWxvZyIsImVuZm9yY2VGb2N1cyIsImhpZGVNb2RhbCIsImhhcyIsIndoaWNoIiwiaGFuZGxlVXBkYXRlIiwicmVzZXRBZGp1c3RtZW50cyIsInJlc2V0U2Nyb2xsYmFyIiwicmVtb3ZlQmFja2Ryb3AiLCJyZW1vdmUiLCJhbmltYXRlIiwiZG9BbmltYXRlIiwiY2FsbGJhY2tSZW1vdmUiLCJtb2RhbElzT3ZlcmZsb3dpbmciLCJzY3JvbGxIZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJwYWRkaW5nTGVmdCIsImJvZHlJc092ZXJmbG93aW5nIiwicGFkZGluZ1JpZ2h0IiwiZnVsbFdpbmRvd1dpZHRoIiwiaW5uZXJXaWR0aCIsImRvY3VtZW50RWxlbWVudFJlY3QiLCJhYnMiLCJjbGllbnRXaWR0aCIsIm1lYXN1cmVTY3JvbGxiYXIiLCJib2R5UGFkIiwic2Nyb2xsRGl2IiwiY2xhc3NOYW1lIiwiYXBwZW5kIiwicmVtb3ZlQ2hpbGQiLCJtb2RhbCIsImZhY3RvcnkiLCJyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIiLCJkZWZpbmUiLCJhbWQiLCJleHBvcnRzIiwibW9kdWxlIiwiT2xkQ29va2llcyIsIkNvb2tpZXMiLCJhcGkiLCJyZXN1bHQiLCJhdHRyaWJ1dGVzIiwiY29udmVydGVyIiwicGF0aCIsImV4cGlyZXMiLCJEYXRlIiwic2V0TWlsbGlzZWNvbmRzIiwiZ2V0TWlsbGlzZWNvbmRzIiwidG9VVENTdHJpbmciLCJKU09OIiwic3RyaW5naWZ5Iiwid3JpdGUiLCJlbmNvZGVVUklDb21wb25lbnQiLCJTdHJpbmciLCJkZWNvZGVVUklDb21wb25lbnQiLCJzdHJpbmdpZmllZEF0dHJpYnV0ZXMiLCJhdHRyaWJ1dGVOYW1lIiwiY29va2llIiwiY29va2llcyIsInJkZWNvZGUiLCJwYXJ0cyIsInNsaWNlIiwianNvbiIsImNoYXJBdCIsInJlYWQiLCJwYXJzZSIsInNldCIsImdldCIsImdldEpTT04iLCJ3aXRoQ29udmVydGVyIiwidCIsInNsaW5reSIsImEiLCJzIiwibGFiZWwiLCJzcGVlZCIsIm4iLCJmaXJzdCIsInIiLCJsIiwib3V0ZXJIZWlnaHQiLCJkIiwicHJldiIsInByZXBlbmQiLCJ0ZXh0IiwicHJvcCIsIm5vdyIsInBhcmVudHNVbnRpbCIsImp1bXAiLCJob21lIiwiYyIsImxheW91dCIsInB1YiIsIiRsYXlvdXRfX2hlYWRlciIsIiRsYXlvdXRfX2RvY3VtZW50IiwibGF5b3V0X2NsYXNzZXMiLCJyZWdpc3RlckV2ZW50SGFuZGxlcnMiLCJyZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzIiwiYWRkRWxlbWVudENsYXNzZXMiLCJhZGQiLCJsYXlvdXRfX29iZnVzY2F0b3IiLCJ0b2dnbGVEcmF3ZXIiLCJoZWFkZXJfd2F0ZXJmYWxsIiwiJGRvY3VtZW50Iiwid2F0ZXJmYWxsSGVhZGVyIiwiJHdyYXBwZXIiLCJsYXlvdXRfX3dyYXBwZXIiLCIkb2JmdXNjYXRvciIsIiRkcmF3ZXIiLCJsYXlvdXRfX2RyYXdlciIsIm9iZnVzY2F0b3JfaXNfdmlzaWJsZSIsImRyYXdlcl9pc192aXNpYmxlIiwiJGhlYWRlciIsImxheW91dF9faGVhZGVyIiwiZGlzdGFuY2UiLCJoZWFkZXJfaXNfY29tcGFjdCIsImluZGV4IiwiaGVhZGVyX3Njcm9sbCIsIndyYXBwZXJfaGFzX3Njcm9sbGluZ19oZWFkZXIiLCJ3cmFwcGVyX2hhc19kcmF3ZXIiLCJ3cmFwcGVyX2lzX3VwZ3JhZGVkIiwiJG5vdGlmaWNhdGlvbnMiLCJ2YWwiLCIkcmVnaW9uIiwiY29va2llX2lkIiwiJGNsb3NlIiwiZmFkZUluIiwiZmFkZU91dCIsInBhcmVudHMiLCIkYWxsX3RvZ2dsZV9idXR0b25zIiwiJHRvZ2dsZV9idXR0b24iLCIkYWxsX2NvbnRlbnQiLCJ6SW5kZXgiLCJub3QiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7O0FBU0EsQ0FBQyxVQUFVQSxDQUFWLEVBQWE7QUFDWjs7QUFFQTtBQUNBOztBQUVBLE1BQUlDLE1BQU0sU0FBTkEsR0FBTSxDQUFVQyxPQUFWLEVBQW1CO0FBQzNCO0FBQ0EsU0FBS0EsT0FBTCxHQUFlRixFQUFFRSxPQUFGLENBQWY7QUFDQTtBQUNELEdBSkQ7O0FBTUFELE1BQUlFLE9BQUosR0FBYyxPQUFkOztBQUVBRixNQUFJRyxtQkFBSixHQUEwQixHQUExQjs7QUFFQUgsTUFBSUksU0FBSixDQUFjQyxJQUFkLEdBQXFCLFlBQVk7QUFDL0IsUUFBSUMsUUFBVyxLQUFLTCxPQUFwQjtBQUNBLFFBQUlNLE1BQVdELE1BQU1FLE9BQU4sQ0FBYyx3QkFBZCxDQUFmO0FBQ0EsUUFBSUMsV0FBV0gsTUFBTUksSUFBTixDQUFXLFFBQVgsQ0FBZjs7QUFFQSxRQUFJLENBQUNELFFBQUwsRUFBZTtBQUNiQSxpQkFBV0gsTUFBTUssSUFBTixDQUFXLE1BQVgsQ0FBWDtBQUNBRixpQkFBV0EsWUFBWUEsU0FBU0csT0FBVCxDQUFpQixnQkFBakIsRUFBbUMsRUFBbkMsQ0FBdkIsQ0FGYSxDQUVpRDtBQUMvRDs7QUFFRCxRQUFJTixNQUFNTyxNQUFOLENBQWEsSUFBYixFQUFtQkMsUUFBbkIsQ0FBNEIsUUFBNUIsQ0FBSixFQUEyQzs7QUFFM0MsUUFBSUMsWUFBWVIsSUFBSVMsSUFBSixDQUFTLGdCQUFULENBQWhCO0FBQ0EsUUFB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QUFaLEVBQXVCZ08sTUFBdkI7QUFDQWxTLGlCQUFXLFlBQVk7QUFDckJyRyxVQUFFLGlCQUFGLEVBQXFCd1ksR0FBckIsQ0FBeUIsY0FBekIsRUFBeUNqTyxHQUF6QyxDQUE2QyxTQUE3QyxFQUF3RGdPLFNBQVMsQ0FBakUsRUFBb0VuVyxRQUFwRSxDQUE2RSxhQUE3RTtBQUNELE9BRkQsRUFFRyxDQUZIO0FBR0QsS0FQWTtBQVFiLHVCQUFtQix5QkFBWTtBQUM3QixVQUFJcEMsRUFBRSxnQkFBRixFQUFvQmdDLE1BQXBCLEdBQTZCLENBQWpDLEVBQW9DO0FBQ2xDO0FBQ0E7QUFDQXFFLG1CQUFXLFlBQVk7QUFDckJyRyxZQUFFb0QsU0FBU3FLLElBQVgsRUFBaUJyTCxRQUFqQixDQUEwQixZQUExQjtBQUNELFNBRkQsRUFFRyxDQUZIO0FBR0Q7QUFDRjtBQWhCWSxHQUFmLEVBaUJHLFFBakJIO0FBbUJELENBekpELEVBeUpHa0IsTUF6SkgiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBCb290c3RyYXA6IHRhYi5qcyB2My4zLjdcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI3RhYnNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuK2Z1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBUQUIgQ0xBU1MgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBUYWIgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIC8vIGpzY3M6ZGlzYWJsZSByZXF1aXJlRG9sbGFyQmVmb3JlalF1ZXJ5QXNzaWdubWVudFxuICAgIHRoaXMuZWxlbWVudCA9ICQoZWxlbWVudClcbiAgICAvLyBqc2NzOmVuYWJsZSByZXF1aXJlRG9sbGFyQmVmb3JlalF1ZXJ5QXNzaWdubWVudFxuICB9XG5cbiAgVGFiLlZFUlNJT04gPSAnMy4zLjcnXG5cbiAgVGFiLlRSQU5TSVRJT05fRFVSQVRJT04gPSAxNTBcblxuICBUYWIucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICR0aGlzICAgID0gdGhpcy5lbGVtZW50XG4gICAgdmFyICR1bCAgICAgID0gJHRoaXMuY2xvc2VzdCgndWw6bm90KC5kcm9wZG93bi1tZW51KScpXG4gICAgdmFyIHNlbGVjdG9yID0gJHRoaXMuZGF0YSgndGFyZ2V0JylcblxuICAgIGlmICghc2VsZWN0b3IpIHtcbiAgICAgIHNlbGVjdG9yID0gJHRoaXMuYXR0cignaHJlZicpXG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yICYmIHNlbGVjdG9yLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sICcnKSAvLyBzdHJpcCBmb3IgaWU3XG4gICAgfVxuXG4gICAgaWYgKCR0aGlzLnBhcmVudCgnbGknKS5oYXNDbGFzcygnYWN0aXZlJykpIHJldHVyblxuXG4gICAgdmFyICRwcmV2aW91cyA9ICR1bC5maW5kKCcuYWN0aXZlOmxhc3QgYScpXG4gICAgdmFyIGhpZGVFdmVudCA9ICQuRXZlbnQoJ2hpZGUuYnMudGFiJywge1xuICAgICAgcmVsYXRlZFRhcmdldDogJHRoaXNbMF1cbiAgICB9KVxuICAgIHZhciBzaG93RXZlbnQgPSAkLkV2ZW50KCdzaG93LmJzLnRhYicsIHtcbiAgICAgIHJlbGF0ZWRUYXJnZXQ6ICRwcmV2aW91c1swXVxuICAgIH0pXG5cbiAgICAkcHJldmlvdXMudHJpZ2dlcihoaWRlRXZlbnQpXG4gICAgJHRoaXMudHJpZ2dlcihzaG93RXZlbnQpXG5cbiAgICBpZiAoc2hvd0V2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpIHx8IGhpZGVFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICB2YXIgJHRhcmdldCA9ICQoc2VsZWN0b3IpXG5cbiAgICB0aGlzLmFjdGl2YXRlKCR0aGlzLmNsb3Nlc3QoJ2xpJyksICR1bClcbiAgICB0aGlzLmFjdGl2YXRlKCR0YXJnZXQsICR0YXJnZXQucGFyZW50KCksIGZ1bmN0aW9uICgpIHtcbiAgICAgICRwcmV2aW91cy50cmlnZ2VyKHtcbiAgICAgICAgdHlwZTogJ2hpZGRlbi5icy50YWInLFxuICAgICAgICByZWxhdGVkVGFyZ2V0OiAkdGhpc1swXVxuICAgICAgfSlcbiAgICAgICR0aGlzLnRyaWdnZXIoe1xuICAgICAgICB0eXBlOiAnc2hvd24uYnMudGFiJyxcbiAgICAgICAgcmVsYXRlZFRhcmdldDogJHByZXZpb3VzWzBdXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBUYWIucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRhaW5lciwgY2FsbGJhY2spIHtcbiAgICB2YXIgJGFjdGl2ZSAgICA9IGNvbnRhaW5lci5maW5kKCc+IC5hY3RpdmUnKVxuICAgIHZhciB0cmFuc2l0aW9uID0gY2FsbGJhY2tcbiAgICAgICYmICQuc3VwcG9ydC50cmFuc2l0aW9uXG4gICAgICAmJiAoJGFjdGl2ZS5sZW5ndGggJiYgJGFjdGl2ZS5oYXNDbGFzcygnZmFkZScpIHx8ICEhY29udGFpbmVyLmZpbmQoJz4gLmZhZGUnKS5sZW5ndGgpXG5cbiAgICBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgJGFjdGl2ZVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgIC5maW5kKCc+IC5kcm9wZG93bi1tZW51ID4gLmFjdGl2ZScpXG4gICAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICAuZW5kKClcbiAgICAgICAgLmZpbmQoJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXScpXG4gICAgICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSlcblxuICAgICAgZWxlbWVudFxuICAgICAgICAuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgIC5maW5kKCdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nKVxuICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcblxuICAgICAgaWYgKHRyYW5zaXRpb24pIHtcbiAgICAgICAgZWxlbWVudFswXS5vZmZzZXRXaWR0aCAvLyByZWZsb3cgZm9yIHRyYW5zaXRpb25cbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaW4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnZmFkZScpXG4gICAgICB9XG5cbiAgICAgIGlmIChlbGVtZW50LnBhcmVudCgnLmRyb3Bkb3duLW1lbnUnKS5sZW5ndGgpIHtcbiAgICAgICAgZWxlbWVudFxuICAgICAgICAgIC5jbG9zZXN0KCdsaS5kcm9wZG93bicpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICAgLmVuZCgpXG4gICAgICAgICAgLmZpbmQoJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXScpXG4gICAgICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXG4gICAgICB9XG5cbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKClcbiAgICB9XG5cbiAgICAkYWN0aXZlLmxlbmd0aCAmJiB0cmFuc2l0aW9uID9cbiAgICAgICRhY3RpdmVcbiAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgbmV4dClcbiAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKFRhYi5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XG4gICAgICBuZXh0KClcblxuICAgICRhY3RpdmUucmVtb3ZlQ2xhc3MoJ2luJylcbiAgfVxuXG5cbiAgLy8gVEFCIFBMVUdJTiBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcylcbiAgICAgIHZhciBkYXRhICA9ICR0aGlzLmRhdGEoJ2JzLnRhYicpXG5cbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMudGFiJywgKGRhdGEgPSBuZXcgVGFiKHRoaXMpKSlcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxuICAgIH0pXG4gIH1cblxuICB2YXIgb2xkID0gJC5mbi50YWJcblxuICAkLmZuLnRhYiAgICAgICAgICAgICA9IFBsdWdpblxuICAkLmZuLnRhYi5Db25zdHJ1Y3RvciA9IFRhYlxuXG5cbiAgLy8gVEFCIE5PIENPTkZMSUNUXG4gIC8vID09PT09PT09PT09PT09PVxuXG4gICQuZm4udGFiLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi50YWIgPSBvbGRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cblxuICAvLyBUQUIgREFUQS1BUElcbiAgLy8gPT09PT09PT09PT09XG5cbiAgdmFyIGNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgUGx1Z2luLmNhbGwoJCh0aGlzKSwgJ3Nob3cnKVxuICB9XG5cbiAgJChkb2N1bWVudClcbiAgICAub24oJ2NsaWNrLmJzLnRhYi5kYXRhLWFwaScsICdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nLCBjbGlja0hhbmRsZXIpXG4gICAgLm9uKCdjbGljay5icy50YWIuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwicGlsbFwiXScsIGNsaWNrSGFuZGxlcilcblxufShqUXVlcnkpO1xuIiwiLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBCb290c3RyYXA6IGNvbGxhcHNlLmpzIHYzLjMuN1xuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jY29sbGFwc2VcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbi8qIGpzaGludCBsYXRlZGVmOiBmYWxzZSAqL1xuXG4rZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIENPTExBUFNFIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgdmFyIENvbGxhcHNlID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ICAgICAgPSAkKGVsZW1lbnQpXG4gICAgdGhpcy5vcHRpb25zICAgICAgID0gJC5leHRlbmQoe30sIENvbGxhcHNlLkRFRkFVTFRTLCBvcHRpb25zKVxuICAgIHRoaXMuJHRyaWdnZXIgICAgICA9ICQoJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdW2hyZWY9XCIjJyArIGVsZW1lbnQuaWQgKyAnXCJdLCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdW2RhdGEtdGFyZ2V0PVwiIycgKyBlbGVtZW50LmlkICsgJ1wiXScpXG4gICAgdGhpcy50cmFuc2l0aW9uaW5nID0gbnVsbFxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5wYXJlbnQpIHtcbiAgICAgIHRoaXMuJHBhcmVudCA9IHRoaXMuZ2V0UGFyZW50KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hZGRBcmlhQW5kQ29sbGFwc2VkQ2xhc3ModGhpcy4kZWxlbWVudCwgdGhpcy4kdHJpZ2dlcilcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnRvZ2dsZSkgdGhpcy50b2dnbGUoKVxuICB9XG5cbiAgQ29sbGFwc2UuVkVSU0lPTiAgPSAnMy4zLjcnXG5cbiAgQ29sbGFwc2UuVFJBTlNJVElPTl9EVVJBVElPTiA9IDM1MFxuXG4gIENvbGxhcHNlLkRFRkFVTFRTID0ge1xuICAgIHRvZ2dsZTogdHJ1ZVxuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLmRpbWVuc2lvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaGFzV2lkdGggPSB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCd3aWR0aCcpXG4gICAgcmV0dXJuIGhhc1dpZHRoID8gJ3dpZHRoJyA6ICdoZWlnaHQnXG4gIH1cblxuICBDb2xsYXBzZS5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy50cmFuc2l0aW9uaW5nIHx8IHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJykpIHJldHVyblxuXG4gICAgdmFyIGFjdGl2ZXNEYXRhXG4gICAgdmFyIGFjdGl2ZXMgPSB0aGlzLiRwYXJlbnQgJiYgdGhpcy4kcGFyZW50LmNoaWxkcmVuKCcucGFuZWwnKS5jaGlsZHJlbignLmluLCAuY29sbGFwc2luZycpXG5cbiAgICBpZiAoYWN0aXZlcyAmJiBhY3RpdmVzLmxlbmd0aCkge1xuICAgICAgYWN0aXZlc0RhdGEgPSBhY3RpdmVzLmRhdGEoJ2JzLmNvbGxhcHNlJylcbiAgICAgIGlmIChhY3RpdmVzRGF0YSAmJiBhY3RpdmVzRGF0YS50cmFuc2l0aW9uaW5nKSByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgc3RhcnRFdmVudCA9ICQuRXZlbnQoJ3Nob3cuYnMuY29sbGFwc2UnKVxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihzdGFydEV2ZW50KVxuICAgIGlmIChzdGFydEV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgIGlmIChhY3RpdmVzICYmIGFjdGl2ZXMubGVuZ3RoKSB7XG4gICAgICBQbHVnaW4uY2FsbChhY3RpdmVzLCAnaGlkZScpXG4gICAgICBhY3RpdmVzRGF0YSB8fCBhY3RpdmVzLmRhdGEoJ2JzLmNvbGxhcHNlJywgbnVsbClcbiAgICB9XG5cbiAgICB2YXIgZGltZW5zaW9uID0gdGhpcy5kaW1lbnNpb24oKVxuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzZScpXG4gICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNpbmcnKVtkaW1lbnNpb25dKDApXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXG5cbiAgICB0aGlzLiR0cmlnZ2VyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlZCcpXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXG5cbiAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSAxXG5cbiAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2luZycpXG4gICAgICAgIC5hZGRDbGFzcygnY29sbGFwc2UgaW4nKVtkaW1lbnNpb25dKCcnKVxuICAgICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMFxuICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAudHJpZ2dlcignc2hvd24uYnMuY29sbGFwc2UnKVxuICAgIH1cblxuICAgIGlmICghJC5zdXBwb3J0LnRyYW5zaXRpb24pIHJldHVybiBjb21wbGV0ZS5jYWxsKHRoaXMpXG5cbiAgICB2YXIgc2Nyb2xsU2l6ZSA9ICQuY2FtZWxDYXNlKFsnc2Nyb2xsJywgZGltZW5zaW9uXS5qb2luKCctJykpXG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCAkLnByb3h5KGNvbXBsZXRlLCB0aGlzKSlcbiAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChDb2xsYXBzZS5UUkFOU0lUSU9OX0RVUkFUSU9OKVtkaW1lbnNpb25dKHRoaXMuJGVsZW1lbnRbMF1bc2Nyb2xsU2l6ZV0pXG4gIH1cblxuICBDb2xsYXBzZS5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy50cmFuc2l0aW9uaW5nIHx8ICF0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpbicpKSByZXR1cm5cblxuICAgIHZhciBzdGFydEV2ZW50ID0gJC5FdmVudCgnaGlkZS5icy5jb2xsYXBzZScpXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKHN0YXJ0RXZlbnQpXG4gICAgaWYgKHN0YXJ0RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxuXG4gICAgdmFyIGRpbWVuc2lvbiA9IHRoaXMuZGltZW5zaW9uKClcblxuICAgIHRoaXMuJGVsZW1lbnRbZGltZW5zaW9uXSh0aGlzLiRlbGVtZW50W2RpbWVuc2lvbl0oKSlbMF0ub2Zmc2V0SGVpZ2h0XG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNpbmcnKVxuICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzZSBpbicpXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKVxuXG4gICAgdGhpcy4kdHJpZ2dlclxuICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZWQnKVxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSlcblxuICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDFcblxuICAgIHZhciBjb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDBcbiAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzaW5nJylcbiAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZScpXG4gICAgICAgIC50cmlnZ2VyKCdoaWRkZW4uYnMuY29sbGFwc2UnKVxuICAgIH1cblxuICAgIGlmICghJC5zdXBwb3J0LnRyYW5zaXRpb24pIHJldHVybiBjb21wbGV0ZS5jYWxsKHRoaXMpXG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICBbZGltZW5zaW9uXSgwKVxuICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgJC5wcm94eShjb21wbGV0ZSwgdGhpcykpXG4gICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoQ29sbGFwc2UuVFJBTlNJVElPTl9EVVJBVElPTilcbiAgfVxuXG4gIENvbGxhcHNlLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpc1t0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpbicpID8gJ2hpZGUnIDogJ3Nob3cnXSgpXG4gIH1cblxuICBDb2xsYXBzZS5wcm90b3R5cGUuZ2V0UGFyZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAkKHRoaXMub3B0aW9ucy5wYXJlbnQpXG4gICAgICAuZmluZCgnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl1bZGF0YS1wYXJlbnQ9XCInICsgdGhpcy5vcHRpb25zLnBhcmVudCArICdcIl0nKVxuICAgICAgLmVhY2goJC5wcm94eShmdW5jdGlvbiAoaSwgZWxlbWVudCkge1xuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpXG4gICAgICAgIHRoaXMuYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzKGdldFRhcmdldEZyb21UcmlnZ2VyKCRlbGVtZW50KSwgJGVsZW1lbnQpXG4gICAgICB9LCB0aGlzKSlcbiAgICAgIC5lbmQoKVxuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLmFkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyA9IGZ1bmN0aW9uICgkZWxlbWVudCwgJHRyaWdnZXIpIHtcbiAgICB2YXIgaXNPcGVuID0gJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJylcblxuICAgICRlbGVtZW50LmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBpc09wZW4pXG4gICAgJHRyaWdnZXJcbiAgICAgIC50b2dnbGVDbGFzcygnY29sbGFwc2VkJywgIWlzT3BlbilcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgaXNPcGVuKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VGFyZ2V0RnJvbVRyaWdnZXIoJHRyaWdnZXIpIHtcbiAgICB2YXIgaHJlZlxuICAgIHZhciB0YXJnZXQgPSAkdHJpZ2dlci5hdHRyKCdkYXRhLXRhcmdldCcpXG4gICAgICB8fCAoaHJlZiA9ICR0cmlnZ2VyLmF0dHIoJ2hyZWYnKSkgJiYgaHJlZi5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLCAnJykgLy8gc3RyaXAgZm9yIGllN1xuXG4gICAgcmV0dXJuICQodGFyZ2V0KVxuICB9XG5cblxuICAvLyBDT0xMQVBTRSBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5jb2xsYXBzZScpXG4gICAgICB2YXIgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBDb2xsYXBzZS5ERUZBVUxUUywgJHRoaXMuZGF0YSgpLCB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvbilcblxuICAgICAgaWYgKCFkYXRhICYmIG9wdGlvbnMudG9nZ2xlICYmIC9zaG93fGhpZGUvLnRlc3Qob3B0aW9uKSkgb3B0aW9ucy50b2dnbGUgPSBmYWxzZVxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5jb2xsYXBzZScsIChkYXRhID0gbmV3IENvbGxhcHNlKHRoaXMsIG9wdGlvbnMpKSlcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxuICAgIH0pXG4gIH1cblxuICB2YXIgb2xkID0gJC5mbi5jb2xsYXBzZVxuXG4gICQuZm4uY29sbGFwc2UgICAgICAgICAgICAgPSBQbHVnaW5cbiAgJC5mbi5jb2xsYXBzZS5Db25zdHJ1Y3RvciA9IENvbGxhcHNlXG5cblxuICAvLyBDT0xMQVBTRSBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxuXG4gICQuZm4uY29sbGFwc2Uubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLmNvbGxhcHNlID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAgLy8gQ09MTEFQU0UgREFUQS1BUElcbiAgLy8gPT09PT09PT09PT09PT09PT1cblxuICAkKGRvY3VtZW50KS5vbignY2xpY2suYnMuY29sbGFwc2UuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl0nLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuXG4gICAgaWYgKCEkdGhpcy5hdHRyKCdkYXRhLXRhcmdldCcpKSBlLnByZXZlbnREZWZhdWx0KClcblxuICAgIHZhciAkdGFyZ2V0ID0gZ2V0VGFyZ2V0RnJvbVRyaWdnZXIoJHRoaXMpXG4gICAgdmFyIGRhdGEgICAgPSAkdGFyZ2V0LmRhdGEoJ2JzLmNvbGxhcHNlJylcbiAgICB2YXIgb3B0aW9uICA9IGRhdGEgPyAndG9nZ2xlJyA6ICR0aGlzLmRhdGEoKVxuXG4gICAgUGx1Z2luLmNhbGwoJHRhcmdldCwgb3B0aW9uKVxuICB9KVxuXG59KGpRdWVyeSk7XG4iLCIvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEJvb3RzdHJhcDogdHJhbnNpdGlvbi5qcyB2My4zLjdcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI3RyYW5zaXRpb25zXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbitmdW5jdGlvbiAoJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gQ1NTIFRSQU5TSVRJT04gU1VQUE9SVCAoU2hvdXRvdXQ6IGh0dHA6Ly93d3cubW9kZXJuaXpyLmNvbS8pXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIHRyYW5zaXRpb25FbmQoKSB7XG4gICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYm9vdHN0cmFwJylcblxuICAgIHZhciB0cmFuc0VuZEV2ZW50TmFtZXMgPSB7XG4gICAgICBXZWJraXRUcmFuc2l0aW9uIDogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxuICAgICAgTW96VHJhbnNpdGlvbiAgICA6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgIE9UcmFuc2l0aW9uICAgICAgOiAnb1RyYW5zaXRpb25FbmQgb3RyYW5zaXRpb25lbmQnLFxuICAgICAgdHJhbnNpdGlvbiAgICAgICA6ICd0cmFuc2l0aW9uZW5kJ1xuICAgIH1cblxuICAgIGZvciAodmFyIG5hbWUgaW4gdHJhbnNFbmRFdmVudE5hbWVzKSB7XG4gICAgICBpZiAoZWwuc3R5bGVbbmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4geyBlbmQ6IHRyYW5zRW5kRXZlbnROYW1lc1tuYW1lXSB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlIC8vIGV4cGxpY2l0IGZvciBpZTggKCAgLl8uKVxuICB9XG5cbiAgLy8gaHR0cDovL2Jsb2cuYWxleG1hY2Nhdy5jb20vY3NzLXRyYW5zaXRpb25zXG4gICQuZm4uZW11bGF0ZVRyYW5zaXRpb25FbmQgPSBmdW5jdGlvbiAoZHVyYXRpb24pIHtcbiAgICB2YXIgY2FsbGVkID0gZmFsc2VcbiAgICB2YXIgJGVsID0gdGhpc1xuICAgICQodGhpcykub25lKCdic1RyYW5zaXRpb25FbmQnLCBmdW5jdGlvbiAoKSB7IGNhbGxlZCA9IHRydWUgfSlcbiAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7IGlmICghY2FsbGVkKSAkKCRlbCkudHJpZ2dlcigkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQpIH1cbiAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCBkdXJhdGlvbilcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgJChmdW5jdGlvbiAoKSB7XG4gICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gPSB0cmFuc2l0aW9uRW5kKClcblxuICAgIGlmICghJC5zdXBwb3J0LnRyYW5zaXRpb24pIHJldHVyblxuXG4gICAgJC5ldmVudC5zcGVjaWFsLmJzVHJhbnNpdGlvbkVuZCA9IHtcbiAgICAgIGJpbmRUeXBlOiAkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsXG4gICAgICBkZWxlZ2F0ZVR5cGU6ICQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxcbiAgICAgIGhhbmRsZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKCQoZS50YXJnZXQpLmlzKHRoaXMpKSByZXR1cm4gZS5oYW5kbGVPYmouaGFuZGxlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG59KGpRdWVyeSk7XG4iLCIvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEJvb3RzdHJhcDogdG9vbHRpcC5qcyB2My4zLjdcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI3Rvb2x0aXBcbiAqIEluc3BpcmVkIGJ5IHRoZSBvcmlnaW5hbCBqUXVlcnkudGlwc3kgYnkgSmFzb24gRnJhbWVcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuK2Z1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBUT09MVElQIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgVG9vbHRpcCA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy50eXBlICAgICAgID0gbnVsbFxuICAgIHRoaXMub3B0aW9ucyAgICA9IG51bGxcbiAgICB0aGlzLmVuYWJsZWQgICAgPSBudWxsXG4gICAgdGhpcy50aW1lb3V0ICAgID0gbnVsbFxuICAgIHRoaXMuaG92ZXJTdGF0ZSA9IG51bGxcbiAgICB0aGlzLiRlbGVtZW50ICAgPSBudWxsXG4gICAgdGhpcy5pblN0YXRlICAgID0gbnVsbFxuXG4gICAgdGhpcy5pbml0KCd0b29sdGlwJywgZWxlbWVudCwgb3B0aW9ucylcbiAgfVxuXG4gIFRvb2x0aXAuVkVSU0lPTiAgPSAnMy4zLjcnXG5cbiAgVG9vbHRpcC5UUkFOU0lUSU9OX0RVUkFUSU9OID0gMTUwXG5cbiAgVG9vbHRpcC5ERUZBVUxUUyA9IHtcbiAgICBhbmltYXRpb246IHRydWUsXG4gICAgcGxhY2VtZW50OiAndG9wJyxcbiAgICBzZWxlY3RvcjogZmFsc2UsXG4gICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidG9vbHRpcFwiIHJvbGU9XCJ0b29sdGlwXCI+PGRpdiBjbGFzcz1cInRvb2x0aXAtYXJyb3dcIj48L2Rpdj48ZGl2IGNsYXNzPVwidG9vbHRpcC1pbm5lclwiPjwvZGl2PjwvZGl2PicsXG4gICAgdHJpZ2dlcjogJ2hvdmVyIGZvY3VzJyxcbiAgICB0aXRsZTogJycsXG4gICAgZGVsYXk6IDAsXG4gICAgaHRtbDogZmFsc2UsXG4gICAgY29udGFpbmVyOiBmYWxzZSxcbiAgICB2aWV3cG9ydDoge1xuICAgICAgc2VsZWN0b3I6ICdib2R5JyxcbiAgICAgIHBhZGRpbmc6IDBcbiAgICB9XG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKHR5cGUsIGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmVuYWJsZWQgICA9IHRydWVcbiAgICB0aGlzLnR5cGUgICAgICA9IHR5cGVcbiAgICB0aGlzLiRlbGVtZW50ICA9ICQoZWxlbWVudClcbiAgICB0aGlzLm9wdGlvbnMgICA9IHRoaXMuZ2V0T3B0aW9ucyhvcHRpb25zKVxuICAgIHRoaXMuJHZpZXdwb3J0ID0gdGhpcy5vcHRpb25zLnZpZXdwb3J0ICYmICQoJC5pc0Z1bmN0aW9uKHRoaXMub3B0aW9ucy52aWV3cG9ydCkgPyB0aGlzLm9wdGlvbnMudmlld3BvcnQuY2FsbCh0aGlzLCB0aGlzLiRlbGVtZW50KSA6ICh0aGlzLm9wdGlvbnMudmlld3BvcnQuc2VsZWN0b3IgfHwgdGhpcy5vcHRpb25zLnZpZXdwb3J0KSlcbiAgICB0aGlzLmluU3RhdGUgICA9IHsgY2xpY2s6IGZhbHNlLCBob3ZlcjogZmFsc2UsIGZvY3VzOiBmYWxzZSB9XG5cbiAgICBpZiAodGhpcy4kZWxlbWVudFswXSBpbnN0YW5jZW9mIGRvY3VtZW50LmNvbnN0cnVjdG9yICYmICF0aGlzLm9wdGlvbnMuc2VsZWN0b3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYHNlbGVjdG9yYCBvcHRpb24gbXVzdCBiZSBzcGVjaWZpZWQgd2hlbiBpbml0aWFsaXppbmcgJyArIHRoaXMudHlwZSArICcgb24gdGhlIHdpbmRvdy5kb2N1bWVudCBvYmplY3QhJylcbiAgICB9XG5cbiAgICB2YXIgdHJpZ2dlcnMgPSB0aGlzLm9wdGlvbnMudHJpZ2dlci5zcGxpdCgnICcpXG5cbiAgICBmb3IgKHZhciBpID0gdHJpZ2dlcnMubGVuZ3RoOyBpLS07KSB7XG4gICAgICB2YXIgdHJpZ2dlciA9IHRyaWdnZXJzW2ldXG5cbiAgICAgIGlmICh0cmlnZ2VyID09ICdjbGljaycpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vbignY2xpY2suJyArIHRoaXMudHlwZSwgdGhpcy5vcHRpb25zLnNlbGVjdG9yLCAkLnByb3h5KHRoaXMudG9nZ2xlLCB0aGlzKSlcbiAgICAgIH0gZWxzZSBpZiAodHJpZ2dlciAhPSAnbWFudWFsJykge1xuICAgICAgICB2YXIgZXZlbnRJbiAgPSB0cmlnZ2VyID09ICdob3ZlcicgPyAnbW91c2VlbnRlcicgOiAnZm9jdXNpbidcbiAgICAgICAgdmFyIGV2ZW50T3V0ID0gdHJpZ2dlciA9PSAnaG92ZXInID8gJ21vdXNlbGVhdmUnIDogJ2ZvY3Vzb3V0J1xuXG4gICAgICAgIHRoaXMuJGVsZW1lbnQub24oZXZlbnRJbiAgKyAnLicgKyB0aGlzLnR5cGUsIHRoaXMub3B0aW9ucy5zZWxlY3RvciwgJC5wcm94eSh0aGlzLmVudGVyLCB0aGlzKSlcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vbihldmVudE91dCArICcuJyArIHRoaXMudHlwZSwgdGhpcy5vcHRpb25zLnNlbGVjdG9yLCAkLnByb3h5KHRoaXMubGVhdmUsIHRoaXMpKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMub3B0aW9ucy5zZWxlY3RvciA/XG4gICAgICAodGhpcy5fb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIHsgdHJpZ2dlcjogJ21hbnVhbCcsIHNlbGVjdG9yOiAnJyB9KSkgOlxuICAgICAgdGhpcy5maXhUaXRsZSgpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXREZWZhdWx0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gVG9vbHRpcC5ERUZBVUxUU1xuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0T3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCB0aGlzLmdldERlZmF1bHRzKCksIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKVxuXG4gICAgaWYgKG9wdGlvbnMuZGVsYXkgJiYgdHlwZW9mIG9wdGlvbnMuZGVsYXkgPT0gJ251bWJlcicpIHtcbiAgICAgIG9wdGlvbnMuZGVsYXkgPSB7XG4gICAgICAgIHNob3c6IG9wdGlvbnMuZGVsYXksXG4gICAgICAgIGhpZGU6IG9wdGlvbnMuZGVsYXlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb3B0aW9uc1xuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0RGVsZWdhdGVPcHRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBvcHRpb25zICA9IHt9XG4gICAgdmFyIGRlZmF1bHRzID0gdGhpcy5nZXREZWZhdWx0cygpXG5cbiAgICB0aGlzLl9vcHRpb25zICYmICQuZWFjaCh0aGlzLl9vcHRpb25zLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgaWYgKGRlZmF1bHRzW2tleV0gIT0gdmFsdWUpIG9wdGlvbnNba2V5XSA9IHZhbHVlXG4gICAgfSlcblxuICAgIHJldHVybiBvcHRpb25zXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5lbnRlciA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgc2VsZiA9IG9iaiBpbnN0YW5jZW9mIHRoaXMuY29uc3RydWN0b3IgP1xuICAgICAgb2JqIDogJChvYmouY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSlcblxuICAgIGlmICghc2VsZikge1xuICAgICAgc2VsZiA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKG9iai5jdXJyZW50VGFyZ2V0LCB0aGlzLmdldERlbGVnYXRlT3B0aW9ucygpKVxuICAgICAgJChvYmouY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSwgc2VsZilcbiAgICB9XG5cbiAgICBpZiAob2JqIGluc3RhbmNlb2YgJC5FdmVudCkge1xuICAgICAgc2VsZi5pblN0YXRlW29iai50eXBlID09ICdmb2N1c2luJyA/ICdmb2N1cycgOiAnaG92ZXInXSA9IHRydWVcbiAgICB9XG5cbiAgICBpZiAoc2VsZi50aXAoKS5oYXNDbGFzcygnaW4nKSB8fCBzZWxmLmhvdmVyU3RhdGUgPT0gJ2luJykge1xuICAgICAgc2VsZi5ob3ZlclN0YXRlID0gJ2luJ1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY2xlYXJUaW1lb3V0KHNlbGYudGltZW91dClcblxuICAgIHNlbGYuaG92ZXJTdGF0ZSA9ICdpbidcblxuICAgIGlmICghc2VsZi5vcHRpb25zLmRlbGF5IHx8ICFzZWxmLm9wdGlvbnMuZGVsYXkuc2hvdykgcmV0dXJuIHNlbGYuc2hvdygpXG5cbiAgICBzZWxmLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChzZWxmLmhvdmVyU3RhdGUgPT0gJ2luJykgc2VsZi5zaG93KClcbiAgICB9LCBzZWxmLm9wdGlvbnMuZGVsYXkuc2hvdylcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmlzSW5TdGF0ZVRydWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMuaW5TdGF0ZSkge1xuICAgICAgaWYgKHRoaXMuaW5TdGF0ZVtrZXldKSByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUubGVhdmUgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIHNlbGYgPSBvYmogaW5zdGFuY2VvZiB0aGlzLmNvbnN0cnVjdG9yID9cbiAgICAgIG9iaiA6ICQob2JqLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUpXG5cbiAgICBpZiAoIXNlbGYpIHtcbiAgICAgIHNlbGYgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihvYmouY3VycmVudFRhcmdldCwgdGhpcy5nZXREZWxlZ2F0ZU9wdGlvbnMoKSlcbiAgICAgICQob2JqLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUsIHNlbGYpXG4gICAgfVxuXG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mICQuRXZlbnQpIHtcbiAgICAgIHNlbGYuaW5TdGF0ZVtvYmoudHlwZSA9PSAnZm9jdXNvdXQnID8gJ2ZvY3VzJyA6ICdob3ZlciddID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoc2VsZi5pc0luU3RhdGVUcnVlKCkpIHJldHVyblxuXG4gICAgY2xlYXJUaW1lb3V0KHNlbGYudGltZW91dClcblxuICAgIHNlbGYuaG92ZXJTdGF0ZSA9ICdvdXQnXG5cbiAgICBpZiAoIXNlbGYub3B0aW9ucy5kZWxheSB8fCAhc2VsZi5vcHRpb25zLmRlbGF5LmhpZGUpIHJldHVybiBzZWxmLmhpZGUoKVxuXG4gICAgc2VsZi50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc2VsZi5ob3ZlclN0YXRlID09ICdvdXQnKSBzZWxmLmhpZGUoKVxuICAgIH0sIHNlbGYub3B0aW9ucy5kZWxheS5oaWRlKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZSA9ICQuRXZlbnQoJ3Nob3cuYnMuJyArIHRoaXMudHlwZSlcblxuICAgIGlmICh0aGlzLmhhc0NvbnRlbnQoKSAmJiB0aGlzLmVuYWJsZWQpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxuXG4gICAgICB2YXIgaW5Eb20gPSAkLmNvbnRhaW5zKHRoaXMuJGVsZW1lbnRbMF0ub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHRoaXMuJGVsZW1lbnRbMF0pXG4gICAgICBpZiAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSB8fCAhaW5Eb20pIHJldHVyblxuICAgICAgdmFyIHRoYXQgPSB0aGlzXG5cbiAgICAgIHZhciAkdGlwID0gdGhpcy50aXAoKVxuXG4gICAgICB2YXIgdGlwSWQgPSB0aGlzLmdldFVJRCh0aGlzLnR5cGUpXG5cbiAgICAgIHRoaXMuc2V0Q29udGVudCgpXG4gICAgICAkdGlwLmF0dHIoJ2lkJywgdGlwSWQpXG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtZGVzY3JpYmVkYnknLCB0aXBJZClcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbmltYXRpb24pICR0aXAuYWRkQ2xhc3MoJ2ZhZGUnKVxuXG4gICAgICB2YXIgcGxhY2VtZW50ID0gdHlwZW9mIHRoaXMub3B0aW9ucy5wbGFjZW1lbnQgPT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgIHRoaXMub3B0aW9ucy5wbGFjZW1lbnQuY2FsbCh0aGlzLCAkdGlwWzBdLCB0aGlzLiRlbGVtZW50WzBdKSA6XG4gICAgICAgIHRoaXMub3B0aW9ucy5wbGFjZW1lbnRcblxuICAgICAgdmFyIGF1dG9Ub2tlbiA9IC9cXHM/YXV0bz9cXHM/L2lcbiAgICAgIHZhciBhdXRvUGxhY2UgPSBhdXRvVG9rZW4udGVzdChwbGFjZW1lbnQpXG4gICAgICBpZiAoYXV0b1BsYWNlKSBwbGFjZW1lbnQgPSBwbGFjZW1lbnQucmVwbGFjZShhdXRvVG9rZW4sICcnKSB8fCAndG9wJ1xuXG4gICAgICAkdGlwXG4gICAgICAgIC5kZXRhY2goKVxuICAgICAgICAuY3NzKHsgdG9wOiAwLCBsZWZ0OiAwLCBkaXNwbGF5OiAnYmxvY2snIH0pXG4gICAgICAgIC5hZGRDbGFzcyhwbGFjZW1lbnQpXG4gICAgICAgIC5kYXRhKCdicy4nICsgdGhpcy50eXBlLCB0aGlzKVxuXG4gICAgICB0aGlzLm9wdGlvbnMuY29udGFpbmVyID8gJHRpcC5hcHBlbmRUbyh0aGlzLm9wdGlvbnMuY29udGFpbmVyKSA6ICR0aXAuaW5zZXJ0QWZ0ZXIodGhpcy4kZWxlbWVudClcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaW5zZXJ0ZWQuYnMuJyArIHRoaXMudHlwZSlcblxuICAgICAgdmFyIHBvcyAgICAgICAgICA9IHRoaXMuZ2V0UG9zaXRpb24oKVxuICAgICAgdmFyIGFjdHVhbFdpZHRoICA9ICR0aXBbMF0ub2Zmc2V0V2lkdGhcbiAgICAgIHZhciBhY3R1YWxIZWlnaHQgPSAkdGlwWzBdLm9mZnNldEhlaWdodFxuXG4gICAgICBpZiAoYXV0b1BsYWNlKSB7XG4gICAgICAgIHZhciBvcmdQbGFjZW1lbnQgPSBwbGFjZW1lbnRcbiAgICAgICAgdmFyIHZpZXdwb3J0RGltID0gdGhpcy5nZXRQb3NpdGlvbih0aGlzLiR2aWV3cG9ydClcblxuICAgICAgICBwbGFjZW1lbnQgPSBwbGFjZW1lbnQgPT0gJ2JvdHRvbScgJiYgcG9zLmJvdHRvbSArIGFjdHVhbEhlaWdodCA+IHZpZXdwb3J0RGltLmJvdHRvbSA/ICd0b3AnICAgIDpcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50ID09ICd0b3AnICAgICYmIHBvcy50b3AgICAgLSBhY3R1YWxIZWlnaHQgPCB2aWV3cG9ydERpbS50b3AgICAgPyAnYm90dG9tJyA6XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAncmlnaHQnICAmJiBwb3MucmlnaHQgICsgYWN0dWFsV2lkdGggID4gdmlld3BvcnREaW0ud2lkdGggID8gJ2xlZnQnICAgOlxuICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ2xlZnQnICAgJiYgcG9zLmxlZnQgICAtIGFjdHVhbFdpZHRoICA8IHZpZXdwb3J0RGltLmxlZnQgICA/ICdyaWdodCcgIDpcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50XG5cbiAgICAgICAgJHRpcFxuICAgICAgICAgIC5yZW1vdmVDbGFzcyhvcmdQbGFjZW1lbnQpXG4gICAgICAgICAgLmFkZENsYXNzKHBsYWNlbWVudClcbiAgICAgIH1cblxuICAgICAgdmFyIGNhbGN1bGF0ZWRPZmZzZXQgPSB0aGlzLmdldENhbGN1bGF0ZWRPZmZzZXQocGxhY2VtZW50LCBwb3MsIGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpXG5cbiAgICAgIHRoaXMuYXBwbHlQbGFjZW1lbnQoY2FsY3VsYXRlZE9mZnNldCwgcGxhY2VtZW50KVxuXG4gICAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwcmV2SG92ZXJTdGF0ZSA9IHRoYXQuaG92ZXJTdGF0ZVxuICAgICAgICB0aGF0LiRlbGVtZW50LnRyaWdnZXIoJ3Nob3duLmJzLicgKyB0aGF0LnR5cGUpXG4gICAgICAgIHRoYXQuaG92ZXJTdGF0ZSA9IG51bGxcblxuICAgICAgICBpZiAocHJldkhvdmVyU3RhdGUgPT0gJ291dCcpIHRoYXQubGVhdmUodGhhdClcbiAgICAgIH1cblxuICAgICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhpcy4kdGlwLmhhc0NsYXNzKCdmYWRlJykgP1xuICAgICAgICAkdGlwXG4gICAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgY29tcGxldGUpXG4gICAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKFRvb2x0aXAuVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgICBjb21wbGV0ZSgpXG4gICAgfVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuYXBwbHlQbGFjZW1lbnQgPSBmdW5jdGlvbiAob2Zmc2V0LCBwbGFjZW1lbnQpIHtcbiAgICB2YXIgJHRpcCAgID0gdGhpcy50aXAoKVxuICAgIHZhciB3aWR0aCAgPSAkdGlwWzBdLm9mZnNldFdpZHRoXG4gICAgdmFyIGhlaWdodCA9ICR0aXBbMF0ub2Zmc2V0SGVpZ2h0XG5cbiAgICAvLyBtYW51YWxseSByZWFkIG1hcmdpbnMgYmVjYXVzZSBnZXRCb3VuZGluZ0NsaWVudFJlY3QgaW5jbHVkZXMgZGlmZmVyZW5jZVxuICAgIHZhciBtYXJnaW5Ub3AgPSBwYXJzZUludCgkdGlwLmNzcygnbWFyZ2luLXRvcCcpLCAxMClcbiAgICB2YXIgbWFyZ2luTGVmdCA9IHBhcnNlSW50KCR0aXAuY3NzKCdtYXJnaW4tbGVmdCcpLCAxMClcblxuICAgIC8vIHdlIG11c3QgY2hlY2sgZm9yIE5hTiBmb3IgaWUgOC85XG4gICAgaWYgKGlzTmFOKG1hcmdpblRvcCkpICBtYXJnaW5Ub3AgID0gMFxuICAgIGlmIChpc05hTihtYXJnaW5MZWZ0KSkgbWFyZ2luTGVmdCA9IDBcblxuICAgIG9mZnNldC50b3AgICs9IG1hcmdpblRvcFxuICAgIG9mZnNldC5sZWZ0ICs9IG1hcmdpbkxlZnRcblxuICAgIC8vICQuZm4ub2Zmc2V0IGRvZXNuJ3Qgcm91bmQgcGl4ZWwgdmFsdWVzXG4gICAgLy8gc28gd2UgdXNlIHNldE9mZnNldCBkaXJlY3RseSB3aXRoIG91ciBvd24gZnVuY3Rpb24gQi0wXG4gICAgJC5vZmZzZXQuc2V0T2Zmc2V0KCR0aXBbMF0sICQuZXh0ZW5kKHtcbiAgICAgIHVzaW5nOiBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgJHRpcC5jc3Moe1xuICAgICAgICAgIHRvcDogTWF0aC5yb3VuZChwcm9wcy50b3ApLFxuICAgICAgICAgIGxlZnQ6IE1hdGgucm91bmQocHJvcHMubGVmdClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9LCBvZmZzZXQpLCAwKVxuXG4gICAgJHRpcC5hZGRDbGFzcygnaW4nKVxuXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHBsYWNpbmcgdGlwIGluIG5ldyBvZmZzZXQgY2F1c2VkIHRoZSB0aXAgdG8gcmVzaXplIGl0c2VsZlxuICAgIHZhciBhY3R1YWxXaWR0aCAgPSAkdGlwWzBdLm9mZnNldFdpZHRoXG4gICAgdmFyIGFjdHVhbEhlaWdodCA9ICR0aXBbMF0ub2Zmc2V0SGVpZ2h0XG5cbiAgICBpZiAocGxhY2VtZW50ID09ICd0b3AnICYmIGFjdHVhbEhlaWdodCAhPSBoZWlnaHQpIHtcbiAgICAgIG9mZnNldC50b3AgPSBvZmZzZXQudG9wICsgaGVpZ2h0IC0gYWN0dWFsSGVpZ2h0XG4gICAgfVxuXG4gICAgdmFyIGRlbHRhID0gdGhpcy5nZXRWaWV3cG9ydEFkanVzdGVkRGVsdGEocGxhY2VtZW50LCBvZmZzZXQsIGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpXG5cbiAgICBpZiAoZGVsdGEubGVmdCkgb2Zmc2V0LmxlZnQgKz0gZGVsdGEubGVmdFxuICAgIGVsc2Ugb2Zmc2V0LnRvcCArPSBkZWx0YS50b3BcblxuICAgIHZhciBpc1ZlcnRpY2FsICAgICAgICAgID0gL3RvcHxib3R0b20vLnRlc3QocGxhY2VtZW50KVxuICAgIHZhciBhcnJvd0RlbHRhICAgICAgICAgID0gaXNWZXJ0aWNhbCA/IGRlbHRhLmxlZnQgKiAyIC0gd2lkdGggKyBhY3R1YWxXaWR0aCA6IGRlbHRhLnRvcCAqIDIgLSBoZWlnaHQgKyBhY3R1YWxIZWlnaHRcbiAgICB2YXIgYXJyb3dPZmZzZXRQb3NpdGlvbiA9IGlzVmVydGljYWwgPyAnb2Zmc2V0V2lkdGgnIDogJ29mZnNldEhlaWdodCdcblxuICAgICR0aXAub2Zmc2V0KG9mZnNldClcbiAgICB0aGlzLnJlcGxhY2VBcnJvdyhhcnJvd0RlbHRhLCAkdGlwWzBdW2Fycm93T2Zmc2V0UG9zaXRpb25dLCBpc1ZlcnRpY2FsKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUucmVwbGFjZUFycm93ID0gZnVuY3Rpb24gKGRlbHRhLCBkaW1lbnNpb24sIGlzVmVydGljYWwpIHtcbiAgICB0aGlzLmFycm93KClcbiAgICAgIC5jc3MoaXNWZXJ0aWNhbCA/ICdsZWZ0JyA6ICd0b3AnLCA1MCAqICgxIC0gZGVsdGEgLyBkaW1lbnNpb24pICsgJyUnKVxuICAgICAgLmNzcyhpc1ZlcnRpY2FsID8gJ3RvcCcgOiAnbGVmdCcsICcnKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuc2V0Q29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJHRpcCAgPSB0aGlzLnRpcCgpXG4gICAgdmFyIHRpdGxlID0gdGhpcy5nZXRUaXRsZSgpXG5cbiAgICAkdGlwLmZpbmQoJy50b29sdGlwLWlubmVyJylbdGhpcy5vcHRpb25zLmh0bWwgPyAnaHRtbCcgOiAndGV4dCddKHRpdGxlKVxuICAgICR0aXAucmVtb3ZlQ2xhc3MoJ2ZhZGUgaW4gdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0JylcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICB2YXIgJHRpcCA9ICQodGhpcy4kdGlwKVxuICAgIHZhciBlICAgID0gJC5FdmVudCgnaGlkZS5icy4nICsgdGhpcy50eXBlKVxuXG4gICAgZnVuY3Rpb24gY29tcGxldGUoKSB7XG4gICAgICBpZiAodGhhdC5ob3ZlclN0YXRlICE9ICdpbicpICR0aXAuZGV0YWNoKClcbiAgICAgIGlmICh0aGF0LiRlbGVtZW50KSB7IC8vIFRPRE86IENoZWNrIHdoZXRoZXIgZ3VhcmRpbmcgdGhpcyBjb2RlIHdpdGggdGhpcyBgaWZgIGlzIHJlYWxseSBuZWNlc3NhcnkuXG4gICAgICAgIHRoYXQuJGVsZW1lbnRcbiAgICAgICAgICAucmVtb3ZlQXR0cignYXJpYS1kZXNjcmliZWRieScpXG4gICAgICAgICAgLnRyaWdnZXIoJ2hpZGRlbi5icy4nICsgdGhhdC50eXBlKVxuICAgICAgfVxuICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soKVxuICAgIH1cblxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxuXG4gICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxuXG4gICAgJHRpcC5yZW1vdmVDbGFzcygnaW4nKVxuXG4gICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgJHRpcC5oYXNDbGFzcygnZmFkZScpID9cbiAgICAgICR0aXBcbiAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgY29tcGxldGUpXG4gICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChUb29sdGlwLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcbiAgICAgIGNvbXBsZXRlKClcblxuICAgIHRoaXMuaG92ZXJTdGF0ZSA9IG51bGxcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5maXhUaXRsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJGUgPSB0aGlzLiRlbGVtZW50XG4gICAgaWYgKCRlLmF0dHIoJ3RpdGxlJykgfHwgdHlwZW9mICRlLmF0dHIoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnKSAhPSAnc3RyaW5nJykge1xuICAgICAgJGUuYXR0cignZGF0YS1vcmlnaW5hbC10aXRsZScsICRlLmF0dHIoJ3RpdGxlJykgfHwgJycpLmF0dHIoJ3RpdGxlJywgJycpXG4gICAgfVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuaGFzQ29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRUaXRsZSgpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRQb3NpdGlvbiA9IGZ1bmN0aW9uICgkZWxlbWVudCkge1xuICAgICRlbGVtZW50ICAgPSAkZWxlbWVudCB8fCB0aGlzLiRlbGVtZW50XG5cbiAgICB2YXIgZWwgICAgID0gJGVsZW1lbnRbMF1cbiAgICB2YXIgaXNCb2R5ID0gZWwudGFnTmFtZSA9PSAnQk9EWSdcblxuICAgIHZhciBlbFJlY3QgICAgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGlmIChlbFJlY3Qud2lkdGggPT0gbnVsbCkge1xuICAgICAgLy8gd2lkdGggYW5kIGhlaWdodCBhcmUgbWlzc2luZyBpbiBJRTgsIHNvIGNvbXB1dGUgdGhlbSBtYW51YWxseTsgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9pc3N1ZXMvMTQwOTNcbiAgICAgIGVsUmVjdCA9ICQuZXh0ZW5kKHt9LCBlbFJlY3QsIHsgd2lkdGg6IGVsUmVjdC5yaWdodCAtIGVsUmVjdC5sZWZ0LCBoZWlnaHQ6IGVsUmVjdC5ib3R0b20gLSBlbFJlY3QudG9wIH0pXG4gICAgfVxuICAgIHZhciBpc1N2ZyA9IHdpbmRvdy5TVkdFbGVtZW50ICYmIGVsIGluc3RhbmNlb2Ygd2luZG93LlNWR0VsZW1lbnRcbiAgICAvLyBBdm9pZCB1c2luZyAkLm9mZnNldCgpIG9uIFNWR3Mgc2luY2UgaXQgZ2l2ZXMgaW5jb3JyZWN0IHJlc3VsdHMgaW4galF1ZXJ5IDMuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9pc3N1ZXMvMjAyODBcbiAgICB2YXIgZWxPZmZzZXQgID0gaXNCb2R5ID8geyB0b3A6IDAsIGxlZnQ6IDAgfSA6IChpc1N2ZyA/IG51bGwgOiAkZWxlbWVudC5vZmZzZXQoKSlcbiAgICB2YXIgc2Nyb2xsICAgID0geyBzY3JvbGw6IGlzQm9keSA/IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgOiAkZWxlbWVudC5zY3JvbGxUb3AoKSB9XG4gICAgdmFyIG91dGVyRGltcyA9IGlzQm9keSA/IHsgd2lkdGg6ICQod2luZG93KS53aWR0aCgpLCBoZWlnaHQ6ICQod2luZG93KS5oZWlnaHQoKSB9IDogbnVsbFxuXG4gICAgcmV0dXJuICQuZXh0ZW5kKHt9LCBlbFJlY3QsIHNjcm9sbCwgb3V0ZXJEaW1zLCBlbE9mZnNldClcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldENhbGN1bGF0ZWRPZmZzZXQgPSBmdW5jdGlvbiAocGxhY2VtZW50LCBwb3MsIGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpIHtcbiAgICByZXR1cm4gcGxhY2VtZW50ID09ICdib3R0b20nID8geyB0b3A6IHBvcy50b3AgKyBwb3MuaGVpZ2h0LCAgIGxlZnQ6IHBvcy5sZWZ0ICsgcG9zLndpZHRoIC8gMiAtIGFjdHVhbFdpZHRoIC8gMiB9IDpcbiAgICAgICAgICAgcGxhY2VtZW50ID09ICd0b3AnICAgID8geyB0b3A6IHBvcy50b3AgLSBhY3R1YWxIZWlnaHQsIGxlZnQ6IHBvcy5sZWZ0ICsgcG9zLndpZHRoIC8gMiAtIGFjdHVhbFdpZHRoIC8gMiB9IDpcbiAgICAgICAgICAgcGxhY2VtZW50ID09ICdsZWZ0JyAgID8geyB0b3A6IHBvcy50b3AgKyBwb3MuaGVpZ2h0IC8gMiAtIGFjdHVhbEhlaWdodCAvIDIsIGxlZnQ6IHBvcy5sZWZ0IC0gYWN0dWFsV2lkdGggfSA6XG4gICAgICAgIC8qIHBsYWNlbWVudCA9PSAncmlnaHQnICovIHsgdG9wOiBwb3MudG9wICsgcG9zLmhlaWdodCAvIDIgLSBhY3R1YWxIZWlnaHQgLyAyLCBsZWZ0OiBwb3MubGVmdCArIHBvcy53aWR0aCB9XG5cbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFZpZXdwb3J0QWRqdXN0ZWREZWx0YSA9IGZ1bmN0aW9uIChwbGFjZW1lbnQsIHBvcywgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodCkge1xuICAgIHZhciBkZWx0YSA9IHsgdG9wOiAwLCBsZWZ0OiAwIH1cbiAgICBpZiAoIXRoaXMuJHZpZXdwb3J0KSByZXR1cm4gZGVsdGFcblxuICAgIHZhciB2aWV3cG9ydFBhZGRpbmcgPSB0aGlzLm9wdGlvbnMudmlld3BvcnQgJiYgdGhpcy5vcHRpb25zLnZpZXdwb3J0LnBhZGRpbmcgfHwgMFxuICAgIHZhciB2aWV3cG9ydERpbWVuc2lvbnMgPSB0aGlzLmdldFBvc2l0aW9uKHRoaXMuJHZpZXdwb3J0KVxuXG4gICAgaWYgKC9yaWdodHxsZWZ0Ly50ZXN0KHBsYWNlbWVudCkpIHtcbiAgICAgIHZhciB0b3BFZGdlT2Zmc2V0ICAgID0gcG9zLnRvcCAtIHZpZXdwb3J0UGFkZGluZyAtIHZpZXdwb3J0RGltZW5zaW9ucy5zY3JvbGxcbiAgICAgIHZhciBib3R0b21FZGdlT2Zmc2V0ID0gcG9zLnRvcCArIHZpZXdwb3J0UGFkZGluZyAtIHZpZXdwb3J0RGltZW5zaW9ucy5zY3JvbGwgKyBhY3R1YWxIZWlnaHRcbiAgICAgIGlmICh0b3BFZGdlT2Zmc2V0IDwgdmlld3BvcnREaW1lbnNpb25zLnRvcCkgeyAvLyB0b3Agb3ZlcmZsb3dcbiAgICAgICAgZGVsdGEudG9wID0gdmlld3BvcnREaW1lbnNpb25zLnRvcCAtIHRvcEVkZ2VPZmZzZXRcbiAgICAgIH0gZWxzZSBpZiAoYm90dG9tRWRnZU9mZnNldCA+IHZpZXdwb3J0RGltZW5zaW9ucy50b3AgKyB2aWV3cG9ydERpbWVuc2lvbnMuaGVpZ2h0KSB7IC8vIGJvdHRvbSBvdmVyZmxvd1xuICAgICAgICBkZWx0YS50b3AgPSB2aWV3cG9ydERpbWVuc2lvbnMudG9wICsgdmlld3BvcnREaW1lbnNpb25zLmhlaWdodCAtIGJvdHRvbUVkZ2VPZmZzZXRcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGxlZnRFZGdlT2Zmc2V0ICA9IHBvcy5sZWZ0IC0gdmlld3BvcnRQYWRkaW5nXG4gICAgICB2YXIgcmlnaHRFZGdlT2Zmc2V0ID0gcG9zLmxlZnQgKyB2aWV3cG9ydFBhZGRpbmcgKyBhY3R1YWxXaWR0aFxuICAgICAgaWYgKGxlZnRFZGdlT2Zmc2V0IDwgdmlld3BvcnREaW1lbnNpb25zLmxlZnQpIHsgLy8gbGVmdCBvdmVyZmxvd1xuICAgICAgICBkZWx0YS5sZWZ0ID0gdmlld3BvcnREaW1lbnNpb25zLmxlZnQgLSBsZWZ0RWRnZU9mZnNldFxuICAgICAgfSBlbHNlIGlmIChyaWdodEVkZ2VPZmZzZXQgPiB2aWV3cG9ydERpbWVuc2lvbnMucmlnaHQpIHsgLy8gcmlnaHQgb3ZlcmZsb3dcbiAgICAgICAgZGVsdGEubGVmdCA9IHZpZXdwb3J0RGltZW5zaW9ucy5sZWZ0ICsgdmlld3BvcnREaW1lbnNpb25zLndpZHRoIC0gcmlnaHRFZGdlT2Zmc2V0XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlbHRhXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRUaXRsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGl0bGVcbiAgICB2YXIgJGUgPSB0aGlzLiRlbGVtZW50XG4gICAgdmFyIG8gID0gdGhpcy5vcHRpb25zXG5cbiAgICB0aXRsZSA9ICRlLmF0dHIoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnKVxuICAgICAgfHwgKHR5cGVvZiBvLnRpdGxlID09ICdmdW5jdGlvbicgPyBvLnRpdGxlLmNhbGwoJGVbMF0pIDogIG8udGl0bGUpXG5cbiAgICByZXR1cm4gdGl0bGVcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFVJRCA9IGZ1bmN0aW9uIChwcmVmaXgpIHtcbiAgICBkbyBwcmVmaXggKz0gfn4oTWF0aC5yYW5kb20oKSAqIDEwMDAwMDApXG4gICAgd2hpbGUgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHByZWZpeCkpXG4gICAgcmV0dXJuIHByZWZpeFxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUudGlwID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy4kdGlwKSB7XG4gICAgICB0aGlzLiR0aXAgPSAkKHRoaXMub3B0aW9ucy50ZW1wbGF0ZSlcbiAgICAgIGlmICh0aGlzLiR0aXAubGVuZ3RoICE9IDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRoaXMudHlwZSArICcgYHRlbXBsYXRlYCBvcHRpb24gbXVzdCBjb25zaXN0IG9mIGV4YWN0bHkgMSB0b3AtbGV2ZWwgZWxlbWVudCEnKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy4kdGlwXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5hcnJvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKHRoaXMuJGFycm93ID0gdGhpcy4kYXJyb3cgfHwgdGhpcy50aXAoKS5maW5kKCcudG9vbHRpcC1hcnJvdycpKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZW5hYmxlZCA9IHRydWVcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2VcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnRvZ2dsZUVuYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbmFibGVkID0gIXRoaXMuZW5hYmxlZFxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICBpZiAoZSkge1xuICAgICAgc2VsZiA9ICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlKVxuICAgICAgaWYgKCFzZWxmKSB7XG4gICAgICAgIHNlbGYgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihlLmN1cnJlbnRUYXJnZXQsIHRoaXMuZ2V0RGVsZWdhdGVPcHRpb25zKCkpXG4gICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlLCBzZWxmKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlKSB7XG4gICAgICBzZWxmLmluU3RhdGUuY2xpY2sgPSAhc2VsZi5pblN0YXRlLmNsaWNrXG4gICAgICBpZiAoc2VsZi5pc0luU3RhdGVUcnVlKCkpIHNlbGYuZW50ZXIoc2VsZilcbiAgICAgIGVsc2Ugc2VsZi5sZWF2ZShzZWxmKVxuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLnRpcCgpLmhhc0NsYXNzKCdpbicpID8gc2VsZi5sZWF2ZShzZWxmKSA6IHNlbGYuZW50ZXIoc2VsZilcbiAgICB9XG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpXG4gICAgdGhpcy5oaWRlKGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoYXQuJGVsZW1lbnQub2ZmKCcuJyArIHRoYXQudHlwZSkucmVtb3ZlRGF0YSgnYnMuJyArIHRoYXQudHlwZSlcbiAgICAgIGlmICh0aGF0LiR0aXApIHtcbiAgICAgICAgdGhhdC4kdGlwLmRldGFjaCgpXG4gICAgICB9XG4gICAgICB0aGF0LiR0aXAgPSBudWxsXG4gICAgICB0aGF0LiRhcnJvdyA9IG51bGxcbiAgICAgIHRoYXQuJHZpZXdwb3J0ID0gbnVsbFxuICAgICAgdGhhdC4kZWxlbWVudCA9IG51bGxcbiAgICB9KVxuICB9XG5cblxuICAvLyBUT09MVElQIFBMVUdJTiBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMudG9vbHRpcCcpXG4gICAgICB2YXIgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uXG5cbiAgICAgIGlmICghZGF0YSAmJiAvZGVzdHJveXxoaWRlLy50ZXN0KG9wdGlvbikpIHJldHVyblxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy50b29sdGlwJywgKGRhdGEgPSBuZXcgVG9vbHRpcCh0aGlzLCBvcHRpb25zKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgdmFyIG9sZCA9ICQuZm4udG9vbHRpcFxuXG4gICQuZm4udG9vbHRpcCAgICAgICAgICAgICA9IFBsdWdpblxuICAkLmZuLnRvb2x0aXAuQ29uc3RydWN0b3IgPSBUb29sdGlwXG5cblxuICAvLyBUT09MVElQIE5PIENPTkZMSUNUXG4gIC8vID09PT09PT09PT09PT09PT09PT1cblxuICAkLmZuLnRvb2x0aXAubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLnRvb2x0aXAgPSBvbGRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbn0oalF1ZXJ5KTtcbiIsIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiBwb3BvdmVyLmpzIHYzLjMuN1xuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jcG9wb3ZlcnNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuK2Z1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBQT1BPVkVSIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgUG9wb3ZlciA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5pbml0KCdwb3BvdmVyJywgZWxlbWVudCwgb3B0aW9ucylcbiAgfVxuXG4gIGlmICghJC5mbi50b29sdGlwKSB0aHJvdyBuZXcgRXJyb3IoJ1BvcG92ZXIgcmVxdWlyZXMgdG9vbHRpcC5qcycpXG5cbiAgUG9wb3Zlci5WRVJTSU9OICA9ICczLjMuNydcblxuICBQb3BvdmVyLkRFRkFVTFRTID0gJC5leHRlbmQoe30sICQuZm4udG9vbHRpcC5Db25zdHJ1Y3Rvci5ERUZBVUxUUywge1xuICAgIHBsYWNlbWVudDogJ3JpZ2h0JyxcbiAgICB0cmlnZ2VyOiAnY2xpY2snLFxuICAgIGNvbnRlbnQ6ICcnLFxuICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBvcG92ZXJcIiByb2xlPVwidG9vbHRpcFwiPjxkaXYgY2xhc3M9XCJhcnJvd1wiPjwvZGl2PjxoMyBjbGFzcz1cInBvcG92ZXItdGl0bGVcIj48L2gzPjxkaXYgY2xhc3M9XCJwb3BvdmVyLWNvbnRlbnRcIj48L2Rpdj48L2Rpdj4nXG4gIH0pXG5cblxuICAvLyBOT1RFOiBQT1BPVkVSIEVYVEVORFMgdG9vbHRpcC5qc1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIFBvcG92ZXIucHJvdG90eXBlID0gJC5leHRlbmQoe30sICQuZm4udG9vbHRpcC5Db25zdHJ1Y3Rvci5wcm90b3R5cGUpXG5cbiAgUG9wb3Zlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQb3BvdmVyXG5cbiAgUG9wb3Zlci5wcm90b3R5cGUuZ2V0RGVmYXVsdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFBvcG92ZXIuREVGQVVMVFNcbiAgfVxuXG4gIFBvcG92ZXIucHJvdG90eXBlLnNldENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICR0aXAgICAgPSB0aGlzLnRpcCgpXG4gICAgdmFyIHRpdGxlICAgPSB0aGlzLmdldFRpdGxlKClcbiAgICB2YXIgY29udGVudCA9IHRoaXMuZ2V0Q29udGVudCgpXG5cbiAgICAkdGlwLmZpbmQoJy5wb3BvdmVyLXRpdGxlJylbdGhpcy5vcHRpb25zLmh0bWwgPyAnaHRtbCcgOiAndGV4dCddKHRpdGxlKVxuICAgICR0aXAuZmluZCgnLnBvcG92ZXItY29udGVudCcpLmNoaWxkcmVuKCkuZGV0YWNoKCkuZW5kKClbIC8vIHdlIHVzZSBhcHBlbmQgZm9yIGh0bWwgb2JqZWN0cyB0byBtYWludGFpbiBqcyBldmVudHNcbiAgICAgIHRoaXMub3B0aW9ucy5odG1sID8gKHR5cGVvZiBjb250ZW50ID09ICdzdHJpbmcnID8gJ2h0bWwnIDogJ2FwcGVuZCcpIDogJ3RleHQnXG4gICAgXShjb250ZW50KVxuXG4gICAgJHRpcC5yZW1vdmVDbGFzcygnZmFkZSB0b3AgYm90dG9tIGxlZnQgcmlnaHQgaW4nKVxuXG4gICAgLy8gSUU4IGRvZXNuJ3QgYWNjZXB0IGhpZGluZyB2aWEgdGhlIGA6ZW1wdHlgIHBzZXVkbyBzZWxlY3Rvciwgd2UgaGF2ZSB0byBkb1xuICAgIC8vIHRoaXMgbWFudWFsbHkgYnkgY2hlY2tpbmcgdGhlIGNvbnRlbnRzLlxuICAgIGlmICghJHRpcC5maW5kKCcucG9wb3Zlci10aXRsZScpLmh0bWwoKSkgJHRpcC5maW5kKCcucG9wb3Zlci10aXRsZScpLmhpZGUoKVxuICB9XG5cbiAgUG9wb3Zlci5wcm90b3R5cGUuaGFzQ29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRUaXRsZSgpIHx8IHRoaXMuZ2V0Q29udGVudCgpXG4gIH1cblxuICBQb3BvdmVyLnByb3RvdHlwZS5nZXRDb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciAkZSA9IHRoaXMuJGVsZW1lbnRcbiAgICB2YXIgbyAgPSB0aGlzLm9wdGlvbnNcblxuICAgIHJldHVybiAkZS5hdHRyKCdkYXRhLWNvbnRlbnQnKVxuICAgICAgfHwgKHR5cGVvZiBvLmNvbnRlbnQgPT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgICBvLmNvbnRlbnQuY2FsbCgkZVswXSkgOlxuICAgICAgICAgICAgby5jb250ZW50KVxuICB9XG5cbiAgUG9wb3Zlci5wcm90b3R5cGUuYXJyb3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh0aGlzLiRhcnJvdyA9IHRoaXMuJGFycm93IHx8IHRoaXMudGlwKCkuZmluZCgnLmFycm93JykpXG4gIH1cblxuXG4gIC8vIFBPUE9WRVIgUExVR0lOIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5wb3BvdmVyJylcbiAgICAgIHZhciBvcHRpb25zID0gdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb25cblxuICAgICAgaWYgKCFkYXRhICYmIC9kZXN0cm95fGhpZGUvLnRlc3Qob3B0aW9uKSkgcmV0dXJuXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLnBvcG92ZXInLCAoZGF0YSA9IG5ldyBQb3BvdmVyKHRoaXMsIG9wdGlvbnMpKSlcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxuICAgIH0pXG4gIH1cblxuICB2YXIgb2xkID0gJC5mbi5wb3BvdmVyXG5cbiAgJC5mbi5wb3BvdmVyICAgICAgICAgICAgID0gUGx1Z2luXG4gICQuZm4ucG9wb3Zlci5Db25zdHJ1Y3RvciA9IFBvcG92ZXJcblxuXG4gIC8vIFBPUE9WRVIgTk8gQ09ORkxJQ1RcbiAgLy8gPT09PT09PT09PT09PT09PT09PVxuXG4gICQuZm4ucG9wb3Zlci5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4ucG9wb3ZlciA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxufShqUXVlcnkpO1xuIiwiLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBCb290c3RyYXA6IG1vZGFsLmpzIHYzLjMuN1xuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jbW9kYWxzXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbitmdW5jdGlvbiAoJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gTU9EQUwgQ0xBU1MgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09XG5cbiAgdmFyIE1vZGFsID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgICAgICAgICAgICAgPSBvcHRpb25zXG4gICAgdGhpcy4kYm9keSAgICAgICAgICAgICAgID0gJChkb2N1bWVudC5ib2R5KVxuICAgIHRoaXMuJGVsZW1lbnQgICAgICAgICAgICA9ICQoZWxlbWVudClcbiAgICB0aGlzLiRkaWFsb2cgICAgICAgICAgICAgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5tb2RhbC1kaWFsb2cnKVxuICAgIHRoaXMuJGJhY2tkcm9wICAgICAgICAgICA9IG51bGxcbiAgICB0aGlzLmlzU2hvd24gICAgICAgICAgICAgPSBudWxsXG4gICAgdGhpcy5vcmlnaW5hbEJvZHlQYWQgICAgID0gbnVsbFxuICAgIHRoaXMuc2Nyb2xsYmFyV2lkdGggICAgICA9IDBcbiAgICB0aGlzLmlnbm9yZUJhY2tkcm9wQ2xpY2sgPSBmYWxzZVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5yZW1vdGUpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgLmZpbmQoJy5tb2RhbC1jb250ZW50JylcbiAgICAgICAgLmxvYWQodGhpcy5vcHRpb25zLnJlbW90ZSwgJC5wcm94eShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdsb2FkZWQuYnMubW9kYWwnKVxuICAgICAgICB9LCB0aGlzKSlcbiAgICB9XG4gIH1cblxuICBNb2RhbC5WRVJTSU9OICA9ICczLjMuNydcblxuICBNb2RhbC5UUkFOU0lUSU9OX0RVUkFUSU9OID0gMzAwXG4gIE1vZGFsLkJBQ0tEUk9QX1RSQU5TSVRJT05fRFVSQVRJT04gPSAxNTBcblxuICBNb2RhbC5ERUZBVUxUUyA9IHtcbiAgICBiYWNrZHJvcDogdHJ1ZSxcbiAgICBrZXlib2FyZDogdHJ1ZSxcbiAgICBzaG93OiB0cnVlXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKF9yZWxhdGVkVGFyZ2V0KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNTaG93biA/IHRoaXMuaGlkZSgpIDogdGhpcy5zaG93KF9yZWxhdGVkVGFyZ2V0KVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoX3JlbGF0ZWRUYXJnZXQpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICB2YXIgZSAgICA9ICQuRXZlbnQoJ3Nob3cuYnMubW9kYWwnLCB7IHJlbGF0ZWRUYXJnZXQ6IF9yZWxhdGVkVGFyZ2V0IH0pXG5cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcblxuICAgIGlmICh0aGlzLmlzU2hvd24gfHwgZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICB0aGlzLmlzU2hvd24gPSB0cnVlXG5cbiAgICB0aGlzLmNoZWNrU2Nyb2xsYmFyKClcbiAgICB0aGlzLnNldFNjcm9sbGJhcigpXG4gICAgdGhpcy4kYm9keS5hZGRDbGFzcygnbW9kYWwtb3BlbicpXG5cbiAgICB0aGlzLmVzY2FwZSgpXG4gICAgdGhpcy5yZXNpemUoKVxuXG4gICAgdGhpcy4kZWxlbWVudC5vbignY2xpY2suZGlzbWlzcy5icy5tb2RhbCcsICdbZGF0YS1kaXNtaXNzPVwibW9kYWxcIl0nLCAkLnByb3h5KHRoaXMuaGlkZSwgdGhpcykpXG5cbiAgICB0aGlzLiRkaWFsb2cub24oJ21vdXNlZG93bi5kaXNtaXNzLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuICAgICAgdGhhdC4kZWxlbWVudC5vbmUoJ21vdXNldXAuZGlzbWlzcy5icy5tb2RhbCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICgkKGUudGFyZ2V0KS5pcyh0aGF0LiRlbGVtZW50KSkgdGhhdC5pZ25vcmVCYWNrZHJvcENsaWNrID0gdHJ1ZVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5iYWNrZHJvcChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdHJhbnNpdGlvbiA9ICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoYXQuJGVsZW1lbnQuaGFzQ2xhc3MoJ2ZhZGUnKVxuXG4gICAgICBpZiAoIXRoYXQuJGVsZW1lbnQucGFyZW50KCkubGVuZ3RoKSB7XG4gICAgICAgIHRoYXQuJGVsZW1lbnQuYXBwZW5kVG8odGhhdC4kYm9keSkgLy8gZG9uJ3QgbW92ZSBtb2RhbHMgZG9tIHBvc2l0aW9uXG4gICAgICB9XG5cbiAgICAgIHRoYXQuJGVsZW1lbnRcbiAgICAgICAgLnNob3coKVxuICAgICAgICAuc2Nyb2xsVG9wKDApXG5cbiAgICAgIHRoYXQuYWRqdXN0RGlhbG9nKClcblxuICAgICAgaWYgKHRyYW5zaXRpb24pIHtcbiAgICAgICAgdGhhdC4kZWxlbWVudFswXS5vZmZzZXRXaWR0aCAvLyBmb3JjZSByZWZsb3dcbiAgICAgIH1cblxuICAgICAgdGhhdC4kZWxlbWVudC5hZGRDbGFzcygnaW4nKVxuXG4gICAgICB0aGF0LmVuZm9yY2VGb2N1cygpXG5cbiAgICAgIHZhciBlID0gJC5FdmVudCgnc2hvd24uYnMubW9kYWwnLCB7IHJlbGF0ZWRUYXJnZXQ6IF9yZWxhdGVkVGFyZ2V0IH0pXG5cbiAgICAgIHRyYW5zaXRpb24gP1xuICAgICAgICB0aGF0LiRkaWFsb2cgLy8gd2FpdCBmb3IgbW9kYWwgdG8gc2xpZGUgaW5cbiAgICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGF0LiRlbGVtZW50LnRyaWdnZXIoJ2ZvY3VzJykudHJpZ2dlcihlKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKE1vZGFsLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcbiAgICAgICAgdGhhdC4kZWxlbWVudC50cmlnZ2VyKCdmb2N1cycpLnRyaWdnZXIoZSlcbiAgICB9KVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlKSBlLnByZXZlbnREZWZhdWx0KClcblxuICAgIGUgPSAkLkV2ZW50KCdoaWRlLmJzLm1vZGFsJylcblxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxuXG4gICAgaWYgKCF0aGlzLmlzU2hvd24gfHwgZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICB0aGlzLmlzU2hvd24gPSBmYWxzZVxuXG4gICAgdGhpcy5lc2NhcGUoKVxuICAgIHRoaXMucmVzaXplKClcblxuICAgICQoZG9jdW1lbnQpLm9mZignZm9jdXNpbi5icy5tb2RhbCcpXG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAucmVtb3ZlQ2xhc3MoJ2luJylcbiAgICAgIC5vZmYoJ2NsaWNrLmRpc21pc3MuYnMubW9kYWwnKVxuICAgICAgLm9mZignbW91c2V1cC5kaXNtaXNzLmJzLm1vZGFsJylcblxuICAgIHRoaXMuJGRpYWxvZy5vZmYoJ21vdXNlZG93bi5kaXNtaXNzLmJzLm1vZGFsJylcblxuICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2ZhZGUnKSA/XG4gICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsICQucHJveHkodGhpcy5oaWRlTW9kYWwsIHRoaXMpKVxuICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoTW9kYWwuVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgdGhpcy5oaWRlTW9kYWwoKVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLmVuZm9yY2VGb2N1cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAkKGRvY3VtZW50KVxuICAgICAgLm9mZignZm9jdXNpbi5icy5tb2RhbCcpIC8vIGd1YXJkIGFnYWluc3QgaW5maW5pdGUgZm9jdXMgbG9vcFxuICAgICAgLm9uKCdmb2N1c2luLmJzLm1vZGFsJywgJC5wcm94eShmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoZG9jdW1lbnQgIT09IGUudGFyZ2V0ICYmXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50WzBdICE9PSBlLnRhcmdldCAmJlxuICAgICAgICAgICAgIXRoaXMuJGVsZW1lbnQuaGFzKGUudGFyZ2V0KS5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2ZvY3VzJylcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcykpXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuZXNjYXBlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmlzU2hvd24gJiYgdGhpcy5vcHRpb25zLmtleWJvYXJkKSB7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdrZXlkb3duLmRpc21pc3MuYnMubW9kYWwnLCAkLnByb3h5KGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUud2hpY2ggPT0gMjcgJiYgdGhpcy5oaWRlKClcbiAgICAgIH0sIHRoaXMpKVxuICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNTaG93bikge1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ2tleWRvd24uZGlzbWlzcy5icy5tb2RhbCcpXG4gICAgfVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5pc1Nob3duKSB7XG4gICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5icy5tb2RhbCcsICQucHJveHkodGhpcy5oYW5kbGVVcGRhdGUsIHRoaXMpKVxuICAgIH0gZWxzZSB7XG4gICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuYnMubW9kYWwnKVxuICAgIH1cbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5oaWRlTW9kYWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgdGhpcy4kZWxlbWVudC5oaWRlKClcbiAgICB0aGlzLmJhY2tkcm9wKGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoYXQuJGJvZHkucmVtb3ZlQ2xhc3MoJ21vZGFsLW9wZW4nKVxuICAgICAgdGhhdC5yZXNldEFkanVzdG1lbnRzKClcbiAgICAgIHRoYXQucmVzZXRTY3JvbGxiYXIoKVxuICAgICAgdGhhdC4kZWxlbWVudC50cmlnZ2VyKCdoaWRkZW4uYnMubW9kYWwnKVxuICAgIH0pXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUucmVtb3ZlQmFja2Ryb3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy4kYmFja2Ryb3AgJiYgdGhpcy4kYmFja2Ryb3AucmVtb3ZlKClcbiAgICB0aGlzLiRiYWNrZHJvcCA9IG51bGxcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5iYWNrZHJvcCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuICAgIHZhciBhbmltYXRlID0gdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZmFkZScpID8gJ2ZhZGUnIDogJydcblxuICAgIGlmICh0aGlzLmlzU2hvd24gJiYgdGhpcy5vcHRpb25zLmJhY2tkcm9wKSB7XG4gICAgICB2YXIgZG9BbmltYXRlID0gJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgYW5pbWF0ZVxuXG4gICAgICB0aGlzLiRiYWNrZHJvcCA9ICQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpXG4gICAgICAgIC5hZGRDbGFzcygnbW9kYWwtYmFja2Ryb3AgJyArIGFuaW1hdGUpXG4gICAgICAgIC5hcHBlbmRUbyh0aGlzLiRib2R5KVxuXG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdjbGljay5kaXNtaXNzLmJzLm1vZGFsJywgJC5wcm94eShmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAodGhpcy5pZ25vcmVCYWNrZHJvcENsaWNrKSB7XG4gICAgICAgICAgdGhpcy5pZ25vcmVCYWNrZHJvcENsaWNrID0gZmFsc2VcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAoZS50YXJnZXQgIT09IGUuY3VycmVudFRhcmdldCkgcmV0dXJuXG4gICAgICAgIHRoaXMub3B0aW9ucy5iYWNrZHJvcCA9PSAnc3RhdGljJ1xuICAgICAgICAgID8gdGhpcy4kZWxlbWVudFswXS5mb2N1cygpXG4gICAgICAgICAgOiB0aGlzLmhpZGUoKVxuICAgICAgfSwgdGhpcykpXG5cbiAgICAgIGlmIChkb0FuaW1hdGUpIHRoaXMuJGJhY2tkcm9wWzBdLm9mZnNldFdpZHRoIC8vIGZvcmNlIHJlZmxvd1xuXG4gICAgICB0aGlzLiRiYWNrZHJvcC5hZGRDbGFzcygnaW4nKVxuXG4gICAgICBpZiAoIWNhbGxiYWNrKSByZXR1cm5cblxuICAgICAgZG9BbmltYXRlID9cbiAgICAgICAgdGhpcy4kYmFja2Ryb3BcbiAgICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBjYWxsYmFjaylcbiAgICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoTW9kYWwuQkFDS0RST1BfVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgICBjYWxsYmFjaygpXG5cbiAgICB9IGVsc2UgaWYgKCF0aGlzLmlzU2hvd24gJiYgdGhpcy4kYmFja2Ryb3ApIHtcbiAgICAgIHRoaXMuJGJhY2tkcm9wLnJlbW92ZUNsYXNzKCdpbicpXG5cbiAgICAgIHZhciBjYWxsYmFja1JlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhhdC5yZW1vdmVCYWNrZHJvcCgpXG4gICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKClcbiAgICAgIH1cbiAgICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2ZhZGUnKSA/XG4gICAgICAgIHRoaXMuJGJhY2tkcm9wXG4gICAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgY2FsbGJhY2tSZW1vdmUpXG4gICAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKE1vZGFsLkJBQ0tEUk9QX1RSQU5TSVRJT05fRFVSQVRJT04pIDpcbiAgICAgICAgY2FsbGJhY2tSZW1vdmUoKVxuXG4gICAgfSBlbHNlIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2soKVxuICAgIH1cbiAgfVxuXG4gIC8vIHRoZXNlIGZvbGxvd2luZyBtZXRob2RzIGFyZSB1c2VkIHRvIGhhbmRsZSBvdmVyZmxvd2luZyBtb2RhbHNcblxuICBNb2RhbC5wcm90b3R5cGUuaGFuZGxlVXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYWRqdXN0RGlhbG9nKClcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5hZGp1c3REaWFsb2cgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG1vZGFsSXNPdmVyZmxvd2luZyA9IHRoaXMuJGVsZW1lbnRbMF0uc2Nyb2xsSGVpZ2h0ID4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodFxuXG4gICAgdGhpcy4kZWxlbWVudC5jc3Moe1xuICAgICAgcGFkZGluZ0xlZnQ6ICAhdGhpcy5ib2R5SXNPdmVyZmxvd2luZyAmJiBtb2RhbElzT3ZlcmZsb3dpbmcgPyB0aGlzLnNjcm9sbGJhcldpZHRoIDogJycsXG4gICAgICBwYWRkaW5nUmlnaHQ6IHRoaXMuYm9keUlzT3ZlcmZsb3dpbmcgJiYgIW1vZGFsSXNPdmVyZmxvd2luZyA/IHRoaXMuc2Nyb2xsYmFyV2lkdGggOiAnJ1xuICAgIH0pXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUucmVzZXRBZGp1c3RtZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLiRlbGVtZW50LmNzcyh7XG4gICAgICBwYWRkaW5nTGVmdDogJycsXG4gICAgICBwYWRkaW5nUmlnaHQ6ICcnXG4gICAgfSlcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5jaGVja1Njcm9sbGJhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZnVsbFdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICBpZiAoIWZ1bGxXaW5kb3dXaWR0aCkgeyAvLyB3b3JrYXJvdW5kIGZvciBtaXNzaW5nIHdpbmRvdy5pbm5lcldpZHRoIGluIElFOFxuICAgICAgdmFyIGRvY3VtZW50RWxlbWVudFJlY3QgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGZ1bGxXaW5kb3dXaWR0aCA9IGRvY3VtZW50RWxlbWVudFJlY3QucmlnaHQgLSBNYXRoLmFicyhkb2N1bWVudEVsZW1lbnRSZWN0LmxlZnQpXG4gICAgfVxuICAgIHRoaXMuYm9keUlzT3ZlcmZsb3dpbmcgPSBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoIDwgZnVsbFdpbmRvd1dpZHRoXG4gICAgdGhpcy5zY3JvbGxiYXJXaWR0aCA9IHRoaXMubWVhc3VyZVNjcm9sbGJhcigpXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuc2V0U2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBib2R5UGFkID0gcGFyc2VJbnQoKHRoaXMuJGJvZHkuY3NzKCdwYWRkaW5nLXJpZ2h0JykgfHwgMCksIDEwKVxuICAgIHRoaXMub3JpZ2luYWxCb2R5UGFkID0gZG9jdW1lbnQuYm9keS5zdHlsZS5wYWRkaW5nUmlnaHQgfHwgJydcbiAgICBpZiAodGhpcy5ib2R5SXNPdmVyZmxvd2luZykgdGhpcy4kYm9keS5jc3MoJ3BhZGRpbmctcmlnaHQnLCBib2R5UGFkICsgdGhpcy5zY3JvbGxiYXJXaWR0aClcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5yZXNldFNjcm9sbGJhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLiRib2R5LmNzcygncGFkZGluZy1yaWdodCcsIHRoaXMub3JpZ2luYWxCb2R5UGFkKVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLm1lYXN1cmVTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7IC8vIHRoeCB3YWxzaFxuICAgIHZhciBzY3JvbGxEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHNjcm9sbERpdi5jbGFzc05hbWUgPSAnbW9kYWwtc2Nyb2xsYmFyLW1lYXN1cmUnXG4gICAgdGhpcy4kYm9keS5hcHBlbmQoc2Nyb2xsRGl2KVxuICAgIHZhciBzY3JvbGxiYXJXaWR0aCA9IHNjcm9sbERpdi5vZmZzZXRXaWR0aCAtIHNjcm9sbERpdi5jbGllbnRXaWR0aFxuICAgIHRoaXMuJGJvZHlbMF0ucmVtb3ZlQ2hpbGQoc2Nyb2xsRGl2KVxuICAgIHJldHVybiBzY3JvbGxiYXJXaWR0aFxuICB9XG5cblxuICAvLyBNT0RBTCBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24sIF9yZWxhdGVkVGFyZ2V0KSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMubW9kYWwnKVxuICAgICAgdmFyIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgTW9kYWwuREVGQVVMVFMsICR0aGlzLmRhdGEoKSwgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pXG5cbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMubW9kYWwnLCAoZGF0YSA9IG5ldyBNb2RhbCh0aGlzLCBvcHRpb25zKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKF9yZWxhdGVkVGFyZ2V0KVxuICAgICAgZWxzZSBpZiAob3B0aW9ucy5zaG93KSBkYXRhLnNob3coX3JlbGF0ZWRUYXJnZXQpXG4gICAgfSlcbiAgfVxuXG4gIHZhciBvbGQgPSAkLmZuLm1vZGFsXG5cbiAgJC5mbi5tb2RhbCAgICAgICAgICAgICA9IFBsdWdpblxuICAkLmZuLm1vZGFsLkNvbnN0cnVjdG9yID0gTW9kYWxcblxuXG4gIC8vIE1PREFMIE5PIENPTkZMSUNUXG4gIC8vID09PT09PT09PT09PT09PT09XG5cbiAgJC5mbi5tb2RhbC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4ubW9kYWwgPSBvbGRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cblxuICAvLyBNT0RBTCBEQVRBLUFQSVxuICAvLyA9PT09PT09PT09PT09PVxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljay5icy5tb2RhbC5kYXRhLWFwaScsICdbZGF0YS10b2dnbGU9XCJtb2RhbFwiXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXG4gICAgdmFyIGhyZWYgICAgPSAkdGhpcy5hdHRyKCdocmVmJylcbiAgICB2YXIgJHRhcmdldCA9ICQoJHRoaXMuYXR0cignZGF0YS10YXJnZXQnKSB8fCAoaHJlZiAmJiBocmVmLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sICcnKSkpIC8vIHN0cmlwIGZvciBpZTdcbiAgICB2YXIgb3B0aW9uICA9ICR0YXJnZXQuZGF0YSgnYnMubW9kYWwnKSA/ICd0b2dnbGUnIDogJC5leHRlbmQoeyByZW1vdGU6ICEvIy8udGVzdChocmVmKSAmJiBocmVmIH0sICR0YXJnZXQuZGF0YSgpLCAkdGhpcy5kYXRhKCkpXG5cbiAgICBpZiAoJHRoaXMuaXMoJ2EnKSkgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAkdGFyZ2V0Lm9uZSgnc2hvdy5icy5tb2RhbCcsIGZ1bmN0aW9uIChzaG93RXZlbnQpIHtcbiAgICAgIGlmIChzaG93RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVybiAvLyBvbmx5IHJlZ2lzdGVyIGZvY3VzIHJlc3RvcmVyIGlmIG1vZGFsIHdpbGwgYWN0dWFsbHkgZ2V0IHNob3duXG4gICAgICAkdGFyZ2V0Lm9uZSgnaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkdGhpcy5pcygnOnZpc2libGUnKSAmJiAkdGhpcy50cmlnZ2VyKCdmb2N1cycpXG4gICAgICB9KVxuICAgIH0pXG4gICAgUGx1Z2luLmNhbGwoJHRhcmdldCwgb3B0aW9uLCB0aGlzKVxuICB9KVxuXG59KGpRdWVyeSk7XG4iLCIvKiFcbiAqIEphdmFTY3JpcHQgQ29va2llIHYyLjIuMFxuICogaHR0cHM6Ly9naXRodWIuY29tL2pzLWNvb2tpZS9qcy1jb29raWVcbiAqXG4gKiBDb3B5cmlnaHQgMjAwNiwgMjAxNSBLbGF1cyBIYXJ0bCAmIEZhZ25lciBCcmFja1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbjsoZnVuY3Rpb24gKGZhY3RvcnkpIHtcblx0dmFyIHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IGZhbHNlO1xuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0ZGVmaW5lKGZhY3RvcnkpO1xuXHRcdHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IHRydWU7XG5cdH1cblx0aWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRcdHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IHRydWU7XG5cdH1cblx0aWYgKCFyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIpIHtcblx0XHR2YXIgT2xkQ29va2llcyA9IHdpbmRvdy5Db29raWVzO1xuXHRcdHZhciBhcGkgPSB3aW5kb3cuQ29va2llcyA9IGZhY3RvcnkoKTtcblx0XHRhcGkubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHdpbmRvdy5Db29raWVzID0gT2xkQ29va2llcztcblx0XHRcdHJldHVybiBhcGk7XG5cdFx0fTtcblx0fVxufShmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIGV4dGVuZCAoKSB7XG5cdFx0dmFyIGkgPSAwO1xuXHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGF0dHJpYnV0ZXMgPSBhcmd1bWVudHNbIGkgXTtcblx0XHRcdGZvciAodmFyIGtleSBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdHJlc3VsdFtrZXldID0gYXR0cmlidXRlc1trZXldO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdCAoY29udmVydGVyKSB7XG5cdFx0ZnVuY3Rpb24gYXBpIChrZXksIHZhbHVlLCBhdHRyaWJ1dGVzKSB7XG5cdFx0XHR2YXIgcmVzdWx0O1xuXHRcdFx0aWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBXcml0ZVxuXG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0YXR0cmlidXRlcyA9IGV4dGVuZCh7XG5cdFx0XHRcdFx0cGF0aDogJy8nXG5cdFx0XHRcdH0sIGFwaS5kZWZhdWx0cywgYXR0cmlidXRlcyk7XG5cblx0XHRcdFx0aWYgKHR5cGVvZiBhdHRyaWJ1dGVzLmV4cGlyZXMgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdFx0dmFyIGV4cGlyZXMgPSBuZXcgRGF0ZSgpO1xuXHRcdFx0XHRcdGV4cGlyZXMuc2V0TWlsbGlzZWNvbmRzKGV4cGlyZXMuZ2V0TWlsbGlzZWNvbmRzKCkgKyBhdHRyaWJ1dGVzLmV4cGlyZXMgKiA4NjRlKzUpO1xuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyA9IGV4cGlyZXM7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBXZSdyZSB1c2luZyBcImV4cGlyZXNcIiBiZWNhdXNlIFwibWF4LWFnZVwiIGlzIG5vdCBzdXBwb3J0ZWQgYnkgSUVcblx0XHRcdFx0YXR0cmlidXRlcy5leHBpcmVzID0gYXR0cmlidXRlcy5leHBpcmVzID8gYXR0cmlidXRlcy5leHBpcmVzLnRvVVRDU3RyaW5nKCkgOiAnJztcblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHJlc3VsdCA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcblx0XHRcdFx0XHRpZiAoL15bXFx7XFxbXS8udGVzdChyZXN1bHQpKSB7XG5cdFx0XHRcdFx0XHR2YWx1ZSA9IHJlc3VsdDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cblx0XHRcdFx0aWYgKCFjb252ZXJ0ZXIud3JpdGUpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcodmFsdWUpKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoLyUoMjN8MjR8MjZ8MkJ8M0F8M0N8M0V8M0R8MkZ8M0Z8NDB8NUJ8NUR8NUV8NjB8N0J8N0R8N0MpL2csIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBjb252ZXJ0ZXIud3JpdGUodmFsdWUsIGtleSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRrZXkgPSBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKGtleSkpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnw1RXw2MHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoL1tcXChcXCldL2csIGVzY2FwZSk7XG5cblx0XHRcdFx0dmFyIHN0cmluZ2lmaWVkQXR0cmlidXRlcyA9ICcnO1xuXG5cdFx0XHRcdGZvciAodmFyIGF0dHJpYnV0ZU5hbWUgaW4gYXR0cmlidXRlcykge1xuXHRcdFx0XHRcdGlmICghYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSkge1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHN0cmluZ2lmaWVkQXR0cmlidXRlcyArPSAnOyAnICsgYXR0cmlidXRlTmFtZTtcblx0XHRcdFx0XHRpZiAoYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHN0cmluZ2lmaWVkQXR0cmlidXRlcyArPSAnPScgKyBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAoZG9jdW1lbnQuY29va2llID0ga2V5ICsgJz0nICsgdmFsdWUgKyBzdHJpbmdpZmllZEF0dHJpYnV0ZXMpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBSZWFkXG5cblx0XHRcdGlmICgha2V5KSB7XG5cdFx0XHRcdHJlc3VsdCA9IHt9O1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBUbyBwcmV2ZW50IHRoZSBmb3IgbG9vcCBpbiB0aGUgZmlyc3QgcGxhY2UgYXNzaWduIGFuIGVtcHR5IGFycmF5XG5cdFx0XHQvLyBpbiBjYXNlIHRoZXJlIGFyZSBubyBjb29raWVzIGF0IGFsbC4gQWxzbyBwcmV2ZW50cyBvZGQgcmVzdWx0IHdoZW5cblx0XHRcdC8vIGNhbGxpbmcgXCJnZXQoKVwiXG5cdFx0XHR2YXIgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZSA/IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOyAnKSA6IFtdO1xuXHRcdFx0dmFyIHJkZWNvZGUgPSAvKCVbMC05QS1aXXsyfSkrL2c7XG5cdFx0XHR2YXIgaSA9IDA7XG5cblx0XHRcdGZvciAoOyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcGFydHMgPSBjb29raWVzW2ldLnNwbGl0KCc9Jyk7XG5cdFx0XHRcdHZhciBjb29raWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCc9Jyk7XG5cblx0XHRcdFx0aWYgKCF0aGlzLmpzb24gJiYgY29va2llLmNoYXJBdCgwKSA9PT0gJ1wiJykge1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvb2tpZS5zbGljZSgxLCAtMSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHZhciBuYW1lID0gcGFydHNbMF0ucmVwbGFjZShyZGVjb2RlLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvbnZlcnRlci5yZWFkID9cblx0XHRcdFx0XHRcdGNvbnZlcnRlci5yZWFkKGNvb2tpZSwgbmFtZSkgOiBjb252ZXJ0ZXIoY29va2llLCBuYW1lKSB8fFxuXHRcdFx0XHRcdFx0Y29va2llLnJlcGxhY2UocmRlY29kZSwgZGVjb2RlVVJJQ29tcG9uZW50KTtcblxuXHRcdFx0XHRcdGlmICh0aGlzLmpzb24pIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGNvb2tpZSA9IEpTT04ucGFyc2UoY29va2llKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGtleSA9PT0gbmFtZSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0ID0gY29va2llO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCFrZXkpIHtcblx0XHRcdFx0XHRcdHJlc3VsdFtuYW1lXSA9IGNvb2tpZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXG5cdFx0YXBpLnNldCA9IGFwaTtcblx0XHRhcGkuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0cmV0dXJuIGFwaS5jYWxsKGFwaSwga2V5KTtcblx0XHR9O1xuXHRcdGFwaS5nZXRKU09OID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGFwaS5hcHBseSh7XG5cdFx0XHRcdGpzb246IHRydWVcblx0XHRcdH0sIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG5cdFx0fTtcblx0XHRhcGkuZGVmYXVsdHMgPSB7fTtcblxuXHRcdGFwaS5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5LCBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRhcGkoa2V5LCAnJywgZXh0ZW5kKGF0dHJpYnV0ZXMsIHtcblx0XHRcdFx0ZXhwaXJlczogLTFcblx0XHRcdH0pKTtcblx0XHR9O1xuXG5cdFx0YXBpLndpdGhDb252ZXJ0ZXIgPSBpbml0O1xuXG5cdFx0cmV0dXJuIGFwaTtcblx0fVxuXG5cdHJldHVybiBpbml0KGZ1bmN0aW9uICgpIHt9KTtcbn0pKTtcbiIsIiFmdW5jdGlvbihlKXt2YXIgdDtlLmZuLnNsaW5reT1mdW5jdGlvbihhKXt2YXIgcz1lLmV4dGVuZCh7bGFiZWw6XCJCYWNrXCIsdGl0bGU6ITEsc3BlZWQ6MzAwLHJlc2l6ZTohMH0sYSksaT1lKHRoaXMpLG49aS5jaGlsZHJlbigpLmZpcnN0KCk7aS5hZGRDbGFzcyhcInNsaW5reS1tZW51XCIpO3ZhciByPWZ1bmN0aW9uKGUsdCl7dmFyIGE9TWF0aC5yb3VuZChwYXJzZUludChuLmdldCgwKS5zdHlsZS5sZWZ0KSl8fDA7bi5jc3MoXCJsZWZ0XCIsYS0xMDAqZStcIiVcIiksXCJmdW5jdGlvblwiPT10eXBlb2YgdCYmc2V0VGltZW91dCh0LHMuc3BlZWQpfSxsPWZ1bmN0aW9uKGUpe2kuaGVpZ2h0KGUub3V0ZXJIZWlnaHQoKSl9LGQ9ZnVuY3Rpb24oZSl7aS5jc3MoXCJ0cmFuc2l0aW9uLWR1cmF0aW9uXCIsZStcIm1zXCIpLG4uY3NzKFwidHJhbnNpdGlvbi1kdXJhdGlvblwiLGUrXCJtc1wiKX07aWYoZChzLnNwZWVkKSxlKFwiYSArIHVsXCIsaSkucHJldigpLmFkZENsYXNzKFwibmV4dFwiKSxlKFwibGkgPiB1bFwiLGkpLnByZXBlbmQoJzxsaSBjbGFzcz1cImhlYWRlclwiPicpLHMudGl0bGU9PT0hMCYmZShcImxpID4gdWxcIixpKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIHQ9ZSh0aGlzKS5wYXJlbnQoKS5maW5kKFwiYVwiKS5maXJzdCgpLnRleHQoKSxhPWUoXCI8aDI+XCIpLnRleHQodCk7ZShcIj4gLmhlYWRlclwiLHRoaXMpLmFwcGVuZChhKX0pLHMudGl0bGV8fHMubGFiZWwhPT0hMCl7dmFyIG89ZShcIjxhPlwiKS50ZXh0KHMubGFiZWwpLnByb3AoXCJocmVmXCIsXCIjXCIpLmFkZENsYXNzKFwiYmFja1wiKTtlKFwiLmhlYWRlclwiLGkpLmFwcGVuZChvKX1lbHNlIGUoXCJsaSA+IHVsXCIsaSkuZWFjaChmdW5jdGlvbigpe3ZhciB0PWUodGhpcykucGFyZW50KCkuZmluZChcImFcIikuZmlyc3QoKS50ZXh0KCksYT1lKFwiPGE+XCIpLnRleHQodCkucHJvcChcImhyZWZcIixcIiNcIikuYWRkQ2xhc3MoXCJiYWNrXCIpO2UoXCI+IC5oZWFkZXJcIix0aGlzKS5hcHBlbmQoYSl9KTtlKFwiYVwiLGkpLm9uKFwiY2xpY2tcIixmdW5jdGlvbihhKXtpZighKHQrcy5zcGVlZD5EYXRlLm5vdygpKSl7dD1EYXRlLm5vdygpO3ZhciBuPWUodGhpcyk7LyMvLnRlc3QodGhpcy5ocmVmKSYmYS5wcmV2ZW50RGVmYXVsdCgpLG4uaGFzQ2xhc3MoXCJuZXh0XCIpPyhpLmZpbmQoXCIuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLG4ubmV4dCgpLnNob3coKS5hZGRDbGFzcyhcImFjdGl2ZVwiKSxyKDEpLHMucmVzaXplJiZsKG4ubmV4dCgpKSk6bi5oYXNDbGFzcyhcImJhY2tcIikmJihyKC0xLGZ1bmN0aW9uKCl7aS5maW5kKFwiLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSxuLnBhcmVudCgpLnBhcmVudCgpLmhpZGUoKS5wYXJlbnRzVW50aWwoaSxcInVsXCIpLmZpcnN0KCkuYWRkQ2xhc3MoXCJhY3RpdmVcIil9KSxzLnJlc2l6ZSYmbChuLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudHNVbnRpbChpLFwidWxcIikpKX19KSx0aGlzLmp1bXA9ZnVuY3Rpb24odCxhKXt0PWUodCk7dmFyIG49aS5maW5kKFwiLmFjdGl2ZVwiKTtuPW4ubGVuZ3RoPjA/bi5wYXJlbnRzVW50aWwoaSxcInVsXCIpLmxlbmd0aDowLGkuZmluZChcInVsXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLmhpZGUoKTt2YXIgbz10LnBhcmVudHNVbnRpbChpLFwidWxcIik7by5zaG93KCksdC5zaG93KCkuYWRkQ2xhc3MoXCJhY3RpdmVcIiksYT09PSExJiZkKDApLHIoby5sZW5ndGgtbikscy5yZXNpemUmJmwodCksYT09PSExJiZkKHMuc3BlZWQpfSx0aGlzLmhvbWU9ZnVuY3Rpb24odCl7dD09PSExJiZkKDApO3ZhciBhPWkuZmluZChcIi5hY3RpdmVcIiksbj1hLnBhcmVudHNVbnRpbChpLFwibGlcIikubGVuZ3RoO24+MCYmKHIoLW4sZnVuY3Rpb24oKXthLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpfSkscy5yZXNpemUmJmwoZShhLnBhcmVudHNVbnRpbChpLFwibGlcIikuZ2V0KG4tMSkpLnBhcmVudCgpKSksdD09PSExJiZkKHMuc3BlZWQpfSx0aGlzLmRlc3Ryb3k9ZnVuY3Rpb24oKXtlKFwiLmhlYWRlclwiLGkpLnJlbW92ZSgpLGUoXCJhXCIsaSkucmVtb3ZlQ2xhc3MoXCJuZXh0XCIpLm9mZihcImNsaWNrXCIpLGkucmVtb3ZlQ2xhc3MoXCJzbGlua3ktbWVudVwiKS5jc3MoXCJ0cmFuc2l0aW9uLWR1cmF0aW9uXCIsXCJcIiksbi5jc3MoXCJ0cmFuc2l0aW9uLWR1cmF0aW9uXCIsXCJcIil9O3ZhciBjPWkuZmluZChcIi5hY3RpdmVcIik7cmV0dXJuIGMubGVuZ3RoPjAmJihjLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLHRoaXMuanVtcChjLCExKSksdGhpc319KGpRdWVyeSk7IiwiLy8gfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB8IExheW91dFxuLy8gfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB8XG4vLyB8IFRoaXMgalF1ZXJ5IHNjcmlwdCBpcyB3cml0dGVuIGJ5XG4vLyB8XG4vLyB8IE1vcnRlbiBOaXNzZW5cbi8vIHwgaGplbW1lc2lkZWtvbmdlbi5ka1xuLy8gfFxudmFyIGxheW91dCA9IChmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBwdWIgPSB7fSxcbiAgICAgICAgJGxheW91dF9faGVhZGVyID0gJCgnLmxheW91dF9faGVhZGVyJyksXG4gICAgICAgICRsYXlvdXRfX2RvY3VtZW50ID0gJCgnLmxheW91dF9fZG9jdW1lbnQnKSxcbiAgICAgICAgbGF5b3V0X2NsYXNzZXMgPSB7XG4gICAgICAgICAgICAnbGF5b3V0X193cmFwcGVyJzogJy5sYXlvdXRfX3dyYXBwZXInLFxuICAgICAgICAgICAgJ2xheW91dF9fZHJhd2VyJzogJy5sYXlvdXRfX2RyYXdlcicsXG4gICAgICAgICAgICAnbGF5b3V0X19oZWFkZXInOiAnLmxheW91dF9faGVhZGVyJyxcbiAgICAgICAgICAgICdsYXlvdXRfX29iZnVzY2F0b3InOiAnLmxheW91dF9fb2JmdXNjYXRvcicsXG4gICAgICAgICAgICAnbGF5b3V0X19kb2N1bWVudCc6ICcubGF5b3V0X19kb2N1bWVudCcsXG5cbiAgICAgICAgICAgICd3cmFwcGVyX2lzX3VwZ3JhZGVkJzogJ2lzLXVwZ3JhZGVkJyxcbiAgICAgICAgICAgICd3cmFwcGVyX2hhc19kcmF3ZXInOiAnaGFzLWRyYXdlcicsXG4gICAgICAgICAgICAnd3JhcHBlcl9oYXNfc2Nyb2xsaW5nX2hlYWRlcic6ICdoYXMtc2Nyb2xsaW5nLWhlYWRlcicsXG4gICAgICAgICAgICAnaGVhZGVyX3Njcm9sbCc6ICdsYXlvdXRfX2hlYWRlci0tc2Nyb2xsJyxcbiAgICAgICAgICAgICdoZWFkZXJfaXNfY29tcGFjdCc6ICdpcy1jb21wYWN0JyxcbiAgICAgICAgICAgICdoZWFkZXJfd2F0ZXJmYWxsJzogJ2xheW91dF9faGVhZGVyLS13YXRlcmZhbGwnLFxuICAgICAgICAgICAgJ2RyYXdlcl9pc192aXNpYmxlJzogJ2lzLXZpc2libGUnLFxuICAgICAgICAgICAgJ29iZnVzY2F0b3JfaXNfdmlzaWJsZSc6ICdpcy12aXNpYmxlJ1xuICAgICAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5zdGFudGlhdGVcbiAgICAgKi9cbiAgICBwdWIuaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIHJlZ2lzdGVyRXZlbnRIYW5kbGVycygpO1xuICAgICAgICByZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGJvb3QgZXZlbnQgaGFuZGxlcnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzKCkge1xuXG4gICAgICAgIC8vIEFkZCBjbGFzc2VzIHRvIGVsZW1lbnRzXG4gICAgICAgIGFkZEVsZW1lbnRDbGFzc2VzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWdpc3RlckV2ZW50SGFuZGxlcnMoKSB7XG5cbiAgICAgICAgLy8gVG9nZ2xlIGRyYXdlclxuICAgICAgICAkKCdbZGF0YS10b2dnbGUtZHJhd2VyXScpLmFkZCgkKGxheW91dF9jbGFzc2VzLmxheW91dF9fb2JmdXNjYXRvcikpLm9uKCdjbGljayB0b3VjaHN0YXJ0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICB0b2dnbGVEcmF3ZXIoJGVsZW1lbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBXYXRlcmZhbGwgaGVhZGVyXG4gICAgICAgIGlmICgkbGF5b3V0X19oZWFkZXIuaGFzQ2xhc3MobGF5b3V0X2NsYXNzZXMuaGVhZGVyX3dhdGVyZmFsbCkpIHtcblxuICAgICAgICAgICAgJGxheW91dF9fZG9jdW1lbnQub24oJ3RvdWNobW92ZSBzY3JvbGwnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciAkZG9jdW1lbnQgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgd2F0ZXJmYWxsSGVhZGVyKCRkb2N1bWVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBkcmF3ZXJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0b2dnbGVEcmF3ZXIoJGVsZW1lbnQpIHtcbiAgICAgICAgdmFyICR3cmFwcGVyID0gJGVsZW1lbnQuY2xvc2VzdChsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX3dyYXBwZXIpLFxuICAgICAgICAgICAgJG9iZnVzY2F0b3IgPSAkd3JhcHBlci5jaGlsZHJlbihsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX29iZnVzY2F0b3IpLFxuICAgICAgICAgICAgJGRyYXdlciA9ICR3cmFwcGVyLmNoaWxkcmVuKGxheW91dF9jbGFzc2VzLmxheW91dF9fZHJhd2VyKTtcblxuICAgICAgICAvLyBUb2dnbGUgdmlzaWJsZSBzdGF0ZVxuICAgICAgICAkb2JmdXNjYXRvci50b2dnbGVDbGFzcyhsYXlvdXRfY2xhc3Nlcy5vYmZ1c2NhdG9yX2lzX3Zpc2libGUpO1xuICAgICAgICAkZHJhd2VyLnRvZ2dsZUNsYXNzKGxheW91dF9jbGFzc2VzLmRyYXdlcl9pc192aXNpYmxlKTtcblxuICAgICAgICAvLyBBbHRlciBhcmlhLWhpZGRlbiBzdGF0dXNcbiAgICAgICAgJGRyYXdlci5hdHRyKCdhcmlhLWhpZGRlbicsICgkZHJhd2VyLmhhc0NsYXNzKGxheW91dF9jbGFzc2VzLmRyYXdlcl9pc192aXNpYmxlKSkgPyBmYWxzZSA6IHRydWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGVyZmFsbCBoZWFkZXJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB3YXRlcmZhbGxIZWFkZXIoJGRvY3VtZW50KSB7XG4gICAgICAgIHZhciAkd3JhcHBlciA9ICRkb2N1bWVudC5jbG9zZXN0KGxheW91dF9jbGFzc2VzLmxheW91dF9fd3JhcHBlciksXG4gICAgICAgICAgICAkaGVhZGVyID0gJHdyYXBwZXIuY2hpbGRyZW4obGF5b3V0X2NsYXNzZXMubGF5b3V0X19oZWFkZXIpLFxuICAgICAgICAgICAgZGlzdGFuY2UgPSAkZG9jdW1lbnQuc2Nyb2xsVG9wKCk7XG5cbiAgICAgICAgaWYgKGRpc3RhbmNlID4gMCkge1xuICAgICAgICAgICAgJGhlYWRlci5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy5oZWFkZXJfaXNfY29tcGFjdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAkaGVhZGVyLnJlbW92ZUNsYXNzKGxheW91dF9jbGFzc2VzLmhlYWRlcl9pc19jb21wYWN0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBjbGFzc2VzIHRvIGVsZW1lbnRzLCBiYXNlZCBvbiBhdHRhY2hlZCBjbGFzc2VzXG4gICAgICovXG4gICAgZnVuY3Rpb24gYWRkRWxlbWVudENsYXNzZXMoKSB7XG5cbiAgICAgICAgJChsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX3dyYXBwZXIpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciAkd3JhcHBlciA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgJGhlYWRlciA9ICR3cmFwcGVyLmNoaWxkcmVuKGxheW91dF9jbGFzc2VzLmxheW91dF9faGVhZGVyKSxcbiAgICAgICAgICAgICAgICAkZHJhd2VyID0gJHdyYXBwZXIuY2hpbGRyZW4obGF5b3V0X2NsYXNzZXMubGF5b3V0X19kcmF3ZXIpO1xuXG4gICAgICAgICAgICAvLyBTY3JvbGwgaGVhZGVyXG4gICAgICAgICAgICBpZiAoJGhlYWRlci5oYXNDbGFzcyhsYXlvdXRfY2xhc3Nlcy5oZWFkZXJfc2Nyb2xsKSkge1xuICAgICAgICAgICAgICAgICR3cmFwcGVyLmFkZENsYXNzKGxheW91dF9jbGFzc2VzLndyYXBwZXJfaGFzX3Njcm9sbGluZ19oZWFkZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEcmF3ZXJcbiAgICAgICAgICAgIGlmICgkZHJhd2VyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAkd3JhcHBlci5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy53cmFwcGVyX2hhc19kcmF3ZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVcGdyYWRlZFxuICAgICAgICAgICAgaWYgKCR3cmFwcGVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAkd3JhcHBlci5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy53cmFwcGVyX2lzX3VwZ3JhZGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHB1Yjtcbn0pKGpRdWVyeSk7XG4iLCIvLyBEb2N1bWVudCByZWFkeVxuKGZ1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBFbmFibGUgbGF5b3V0XG4gIGxheW91dC5pbml0KCk7XG5cbiAgLy8gU2xpbmt5XG4gICQoJy5zbGlua3ktbWVudScpXG4gICAgICAuZmluZCgndWwsIGxpLCBhJylcbiAgICAgIC5yZW1vdmVDbGFzcygpO1xuXG4gICQoJy5yZWdpb24tbW9iaWxlLWhlYWRlci1uYXZpZ2F0aW9uIC5zbGlua3ktbWVudScpLnNsaW5reSh7XG4gICAgdGl0bGU6IHRydWUsXG4gICAgbGFiZWw6ICcnXG4gIH0pO1xuXG4gIC8vIE5vdGlmeVxuICB2YXIgJG5vdGlmaWNhdGlvbnMgPSAkKCcubm90aWZ5Jyk7XG4gIGlmICgkbm90aWZpY2F0aW9ucy5sZW5ndGgpIHtcblxuICAgICRub3RpZmljYXRpb25zLmVhY2goZnVuY3Rpb24oaW5kZXgsIHZhbCkge1xuICAgICAgdmFyICRkb2N1bWVudCA9ICQoJy5sYXlvdXRfX2RvY3VtZW50JyksXG4gICAgICAgICAgJHJlZ2lvbiA9ICQoJy5yZWdpb24tbm90aWZ5JyksXG4gICAgICAgICAgJGVsZW1lbnQgPSAkKHRoaXMpLFxuICAgICAgICAgIGNvb2tpZV9pZCA9ICdub3RpZnlfaWRfJyArICRlbGVtZW50LmF0dHIoJ2lkJyksXG4gICAgICAgICAgJGNsb3NlID0gJGVsZW1lbnQuZmluZCgnLm5vdGlmeV9fY2xvc2UnKTtcblxuICAgICAgLy8gRmxleCBtYWdpYyAtIGZpeGluZyBkaXNwbGF5OiBibG9jayBvbiBmYWRlSW4gKHNlZTogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjg5MDQ2OTgvaG93LWZhZGUtaW4tYS1mbGV4LWJveClcbiAgICAgICRlbGVtZW50LmNzcygnZGlzcGxheScsICdmbGV4JykuaGlkZSgpO1xuXG4gICAgICAvLyBObyBjb29raWUgaGFzIGJlZW4gc2V0IHlldFxuICAgICAgaWYgKCEgQ29va2llcy5nZXQoY29va2llX2lkKSkge1xuXG4gICAgICAgIC8vIEZhZGUgdGhlIGVsZW1lbnQgaW5cbiAgICAgICAgJGVsZW1lbnRcbiAgICAgICAgICAgIC5kZWxheSgyMDAwKVxuICAgICAgICAgICAgLmZhZGVJbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIGhlaWdodCA9ICRyZWdpb24ub3V0ZXJIZWlnaHQodHJ1ZSk7XG5cbiAgICAgICAgICAgICAgJGRvY3VtZW50LmNzcygncGFkZGluZy1ib3R0b20nLCBoZWlnaHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENsb3NlZFxuICAgICAgJGNsb3NlLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICRlbGVtZW50LmZhZGVPdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJGRvY3VtZW50LmNzcygncGFkZGluZy1ib3R0b20nLCAwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU2V0IGEgY29va2llLCB0byBzdG9wIHRoaXMgbm90aWZpY2F0aW9uIGZyb20gYmVpbmcgZGlzcGxheWVkIGFnYWluXG4gICAgICAgIENvb2tpZXMuc2V0KGNvb2tpZV9pZCwgdHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gICQoXCIjdG9nZ2xlX21vYmlsZV9tZW51XCIpLmNsaWNrKGZ1bmN0aW9uIChldmVudCkge1xuICAgICQoJyNtYWluLW1lbnUnKS50b2dnbGVDbGFzcygnbW9iaWxlLW1lbnUtb3BlbicpO1xuICAgICQoJy5sYXlvdXRfX2RvY3VtZW50JykudG9nZ2xlQ2xhc3MoJ21vYmlsZS1tZW51LW9wZW4nKTtcbiAgfSk7XG5cbiAgLy9TaG93IHNlYXJjaCBmb3JtIGJsb2NrXG4gICQoXCIuc2VhcmNoLWJ1dHRvblwiKS5jbGljayhmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoJChcIiNzZWFyY2gtZm9ybS1wb3BvdmVyXCIpLmhhc0NsYXNzKFwiaGlkZGVuXCIpKSB7XG4gICAgICAkKFwiI3NlYXJjaC1mb3JtLXBvcG92ZXJcIikucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJChcIi5mb3JtLWNvbnRyb2xcIikuZm9jdXMoKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vSGlkZSBzZWFyY2ggZm9ybSBibG9ja1xuICAkKGRvY3VtZW50KS5jbGljayhmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoISQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcjc2VhcmNoLWZvcm0tcG9wb3ZlcicpLmxlbmd0aCAmJiAhJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5zZWFyY2gtYnV0dG9uJykubGVuZ3RoKSB7XG4gICAgICBpZiAoISQoXCIjc2VhcmNoLWZvcm0tcG9wb3ZlclwiKS5oYXNDbGFzcyhcImhpZGRlblwiKSkge1xuICAgICAgICAkKFwiI3NlYXJjaC1mb3JtLXBvcG92ZXJcIikuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgLy9JbXByb3ZpbmcgdXNhYmlsaXR5IGZvciBtZW51ZHJvcGRvd25zIGZvciBtb2JpbGUgZGV2aWNlc1xuICBpZiAoISEoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSkgey8vY2hlY2sgZm9yIHRvdWNoIGRldmljZVxuICAgICQoJ2xpLmRyb3Bkb3duLmxheW91dC1uYXZpZ2F0aW9uX19kcm9wZG93bicpLmZpbmQoJz4gYScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgICBpZiAoJCh0aGlzKS5wYXJlbnQoKS5oYXNDbGFzcyhcImV4cGFuZGVkXCIpKSB7XG4gICAgICAgIC8vJCh0aGlzKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyhcImV4cGFuZGVkXCIpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5hZGRDbGFzcyhcImV4cGFuZGVkXCIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGVsc2Ugey8va2VlcGluZyBpdCBjb21wYXRpYmxlIHdpdGggZGVza3RvcCBkZXZpY2VzXG4gICAgJCgnbGkuZHJvcGRvd24ubGF5b3V0LW5hdmlnYXRpb25fX2Ryb3Bkb3duJykuaG92ZXIoXG4gICAgICAgIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImV4cGFuZGVkXCIpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJleHBhbmRlZFwiKTtcbiAgICAgICAgfVxuICAgICk7XG4gIH1cblxuICAvLyBUb2dnbGVyXG4gICQoJ1tkYXRhLXRvZ2dsZXJdJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyICRlbGVtZW50ID0gJCh0aGlzKSxcbiAgICAgICAgdGFyZ2V0ID0gJGVsZW1lbnQuYXR0cignZGF0YS10b2dnbGVyJyksXG4gICAgICAgICRwYXJlbnQgPSAkZWxlbWVudC5wYXJlbnRzKCcudG9nZ2xlcicpLFxuICAgICAgICAkdGFyZ2V0ID0gJHBhcmVudC5maW5kKHRhcmdldCksXG4gICAgICAgICRhbGxfdG9nZ2xlX2J1dHRvbnMgPSAkcGFyZW50LmZpbmQoJ1tkYXRhLXRvZ2dsZXJdJyksXG4gICAgICAgICR0b2dnbGVfYnV0dG9uID0gJHBhcmVudC5maW5kKCdbZGF0YS10b2dnbGVyPVwiJyArIHRhcmdldCArICdcIl0nKSxcbiAgICAgICAgJGFsbF9jb250ZW50ID0gJHBhcmVudC5maW5kKCcudG9nZ2xlcl9fY29udGVudCcpO1xuXG4gICAgLy8gUmVtb3ZlIGFsbCBhY3RpdmUgdG9nZ2xlcnNcbiAgICAkYWxsX3RvZ2dsZV9idXR0b25zXG4gICAgICAgIC5wYXJlbnQoKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gICAgJGFsbF9jb250ZW50LnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcblxuICAgIC8vIFNob3dcbiAgICAkdG9nZ2xlX2J1dHRvbi5wYXJlbnQoKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgJHRhcmdldC5hZGRDbGFzcygnYWN0aXZlJyk7XG4gIH0pO1xuXG4gICQoXCIudG9nZ2xlclwiKS5lYWNoKGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgJCh0aGlzKS5maW5kKCcudG9nZ2xlcl9fYnV0dG9uJykuZmlyc3QoKS50cmlnZ2VyKCdjbGljaycpO1xuICB9KTtcblxuICAvLyBVc2UgbXVsdGlwbGUgbW9kYWxzIChodHRwOi8vanNmaWRkbGUubmV0L2xpa2hpMS93dGo2bmFjZC8pXG4gICQoJyNvcGVuQnRuJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgJCgnI215TW9kYWwnKS5tb2RhbCh7XG4gICAgICBzaG93OiB0cnVlXG4gICAgfSlcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oe1xuICAgICdzaG93LmJzLm1vZGFsJzogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHpJbmRleCA9IDEwNDAgKyAoMTAgKiAkKCcubW9kYWw6dmlzaWJsZScpLmxlbmd0aCk7XG4gICAgICAkKHRoaXMpLmNzcygnei1pbmRleCcsIHpJbmRleCk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCgnLm1vZGFsLWJhY2tkcm9wJykubm90KCcubW9kYWwtc3RhY2snKS5jc3MoJ3otaW5kZXgnLCB6SW5kZXggLSAxKS5hZGRDbGFzcygnbW9kYWwtc3RhY2snKTtcbiAgICAgIH0sIDApO1xuICAgIH0sXG4gICAgJ2hpZGRlbi5icy5tb2RhbCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICgkKCcubW9kYWw6dmlzaWJsZScpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gcmVzdG9yZSB0aGUgbW9kYWwtb3BlbiBjbGFzcyB0byB0aGUgYm9keSBlbGVtZW50LCBzbyB0aGF0IHNjcm9sbGluZ1xuICAgICAgICAvLyB3b3JrcyBwcm9wZXJseSBhZnRlciBkZS1zdGFja2luZyBhIG1vZGFsLlxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLmFkZENsYXNzKCdtb2RhbC1vcGVuJyk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfVxuICAgIH1cbiAgfSwgJy5tb2RhbCcpO1xuXG59KShqUXVlcnkpO1xuIl19
