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

  $('.modal-close--this-modal-only').on('click', function (event) {
    var $element = $(this),
        $modal = $element.parents('.modal').first();

    $modal.modal('hide');

    $modal.on('hidden.bs.modal', function (event) {

      if (!$('body').hasClass('modal-open')) {
        $('body').addClass('modal-open');
      }
    });
  });

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
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhYi5qcyIsImNvbGxhcHNlLmpzIiwidHJhbnNpdGlvbi5qcyIsInRvb2x0aXAuanMiLCJwb3BvdmVyLmpzIiwibW9kYWwuanMiLCJqcy5jb29raWUuanMiLCJqcXVlcnkuc2xpbmt5LmpzIiwibGF5b3V0LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIiQiLCJUYWIiLCJlbGVtZW50IiwiVkVSU0lPTiIsIlRSQU5TSVRJT05fRFVSQVRJT04iLCJwcm90b3R5cGUiLCJzaG93IiwiJHRoaXMiLCIkdWwiLCJjbG9zZXN0Iiwic2VsZWN0b3IiLCJkYXRhIiwiYXR0ciIsInJlcGxhY2UiLCJwYXJlbnQiLCJoYXNDbGFzcyIsIiRwcmV2aW91cyIsImZpbmQiLCJoaWRlRXZlbnQiLCJFdmVudCIsInJlbGF0ZWRUYXJnZXQiLCJzaG93RXZlbnQiLCJ0cmlnZ2VyIiwiaXNEZWZhdWx0UHJldmVudGVkIiwiJHRhcmdldCIsImFjdGl2YXRlIiwidHlwZSIsImNvbnRhaW5lciIsImNhbGxiYWNrIiwiJGFjdGl2ZSIsInRyYW5zaXRpb24iLCJzdXBwb3J0IiwibGVuZ3RoIiwibmV4dCIsInJlbW92ZUNsYXNzIiwiZW5kIiwiYWRkQ2xhc3MiLCJvZmZzZXRXaWR0aCIsIm9uZSIsImVtdWxhdGVUcmFuc2l0aW9uRW5kIiwiUGx1Z2luIiwib3B0aW9uIiwiZWFjaCIsIm9sZCIsImZuIiwidGFiIiwiQ29uc3RydWN0b3IiLCJub0NvbmZsaWN0IiwiY2xpY2tIYW5kbGVyIiwiZSIsInByZXZlbnREZWZhdWx0IiwiY2FsbCIsImRvY3VtZW50Iiwib24iLCJqUXVlcnkiLCJDb2xsYXBzZSIsIm9wdGlvbnMiLCIkZWxlbWVudCIsImV4dGVuZCIsIkRFRkFVTFRTIiwiJHRyaWdnZXIiLCJpZCIsInRyYW5zaXRpb25pbmciLCIkcGFyZW50IiwiZ2V0UGFyZW50IiwiYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzIiwidG9nZ2xlIiwiZGltZW5zaW9uIiwiaGFzV2lkdGgiLCJhY3RpdmVzRGF0YSIsImFjdGl2ZXMiLCJjaGlsZHJlbiIsInN0YXJ0RXZlbnQiLCJjb21wbGV0ZSIsInNjcm9sbFNpemUiLCJjYW1lbENhc2UiLCJqb2luIiwicHJveHkiLCJoaWRlIiwib2Zmc2V0SGVpZ2h0IiwiaSIsImdldFRhcmdldEZyb21UcmlnZ2VyIiwiaXNPcGVuIiwidG9nZ2xlQ2xhc3MiLCJocmVmIiwidGFyZ2V0IiwidGVzdCIsImNvbGxhcHNlIiwidHJhbnNpdGlvbkVuZCIsImVsIiwiY3JlYXRlRWxlbWVudCIsInRyYW5zRW5kRXZlbnROYW1lcyIsIldlYmtpdFRyYW5zaXRpb24iLCJNb3pUcmFuc2l0aW9uIiwiT1RyYW5zaXRpb24iLCJuYW1lIiwic3R5bGUiLCJ1bmRlZmluZWQiLCJkdXJhdGlvbiIsImNhbGxlZCIsIiRlbCIsInNldFRpbWVvdXQiLCJldmVudCIsInNwZWNpYWwiLCJic1RyYW5zaXRpb25FbmQiLCJiaW5kVHlwZSIsImRlbGVnYXRlVHlwZSIsImhhbmRsZSIsImlzIiwiaGFuZGxlT2JqIiwiaGFuZGxlciIsImFwcGx5IiwiYXJndW1lbnRzIiwiVG9vbHRpcCIsImVuYWJsZWQiLCJ0aW1lb3V0IiwiaG92ZXJTdGF0ZSIsImluU3RhdGUiLCJpbml0IiwiYW5pbWF0aW9uIiwicGxhY2VtZW50IiwidGVtcGxhdGUiLCJ0aXRsZSIsImRlbGF5IiwiaHRtbCIsInZpZXdwb3J0IiwicGFkZGluZyIsImdldE9wdGlvbnMiLCIkdmlld3BvcnQiLCJpc0Z1bmN0aW9uIiwiY2xpY2siLCJob3ZlciIsImZvY3VzIiwiY29uc3RydWN0b3IiLCJFcnJvciIsInRyaWdnZXJzIiwic3BsaXQiLCJldmVudEluIiwiZXZlbnRPdXQiLCJlbnRlciIsImxlYXZlIiwiX29wdGlvbnMiLCJmaXhUaXRsZSIsImdldERlZmF1bHRzIiwiZ2V0RGVsZWdhdGVPcHRpb25zIiwiZGVmYXVsdHMiLCJrZXkiLCJ2YWx1ZSIsIm9iaiIsInNlbGYiLCJjdXJyZW50VGFyZ2V0IiwidGlwIiwiY2xlYXJUaW1lb3V0IiwiaXNJblN0YXRlVHJ1ZSIsImhhc0NvbnRlbnQiLCJpbkRvbSIsImNvbnRhaW5zIiwib3duZXJEb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsInRoYXQiLCIkdGlwIiwidGlwSWQiLCJnZXRVSUQiLCJzZXRDb250ZW50IiwiYXV0b1Rva2VuIiwiYXV0b1BsYWNlIiwiZGV0YWNoIiwiY3NzIiwidG9wIiwibGVmdCIsImRpc3BsYXkiLCJhcHBlbmRUbyIsImluc2VydEFmdGVyIiwicG9zIiwiZ2V0UG9zaXRpb24iLCJhY3R1YWxXaWR0aCIsImFjdHVhbEhlaWdodCIsIm9yZ1BsYWNlbWVudCIsInZpZXdwb3J0RGltIiwiYm90dG9tIiwicmlnaHQiLCJ3aWR0aCIsImNhbGN1bGF0ZWRPZmZzZXQiLCJnZXRDYWxjdWxhdGVkT2Zmc2V0IiwiYXBwbHlQbGFjZW1lbnQiLCJwcmV2SG92ZXJTdGF0ZSIsIm9mZnNldCIsImhlaWdodCIsIm1hcmdpblRvcCIsInBhcnNlSW50IiwibWFyZ2luTGVmdCIsImlzTmFOIiwic2V0T2Zmc2V0IiwidXNpbmciLCJwcm9wcyIsIk1hdGgiLCJyb3VuZCIsImRlbHRhIiwiZ2V0Vmlld3BvcnRBZGp1c3RlZERlbHRhIiwiaXNWZXJ0aWNhbCIsImFycm93RGVsdGEiLCJhcnJvd09mZnNldFBvc2l0aW9uIiwicmVwbGFjZUFycm93IiwiYXJyb3ciLCJnZXRUaXRsZSIsInJlbW92ZUF0dHIiLCIkZSIsImlzQm9keSIsInRhZ05hbWUiLCJlbFJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJpc1N2ZyIsIndpbmRvdyIsIlNWR0VsZW1lbnQiLCJlbE9mZnNldCIsInNjcm9sbCIsInNjcm9sbFRvcCIsImJvZHkiLCJvdXRlckRpbXMiLCJ2aWV3cG9ydFBhZGRpbmciLCJ2aWV3cG9ydERpbWVuc2lvbnMiLCJ0b3BFZGdlT2Zmc2V0IiwiYm90dG9tRWRnZU9mZnNldCIsImxlZnRFZGdlT2Zmc2V0IiwicmlnaHRFZGdlT2Zmc2V0IiwibyIsInByZWZpeCIsInJhbmRvbSIsImdldEVsZW1lbnRCeUlkIiwiJGFycm93IiwiZW5hYmxlIiwiZGlzYWJsZSIsInRvZ2dsZUVuYWJsZWQiLCJkZXN0cm95Iiwib2ZmIiwicmVtb3ZlRGF0YSIsInRvb2x0aXAiLCJQb3BvdmVyIiwiY29udGVudCIsImdldENvbnRlbnQiLCJwb3BvdmVyIiwiTW9kYWwiLCIkYm9keSIsIiRkaWFsb2ciLCIkYmFja2Ryb3AiLCJpc1Nob3duIiwib3JpZ2luYWxCb2R5UGFkIiwic2Nyb2xsYmFyV2lkdGgiLCJpZ25vcmVCYWNrZHJvcENsaWNrIiwicmVtb3RlIiwibG9hZCIsIkJBQ0tEUk9QX1RSQU5TSVRJT05fRFVSQVRJT04iLCJiYWNrZHJvcCIsImtleWJvYXJkIiwiX3JlbGF0ZWRUYXJnZXQiLCJjaGVja1Njcm9sbGJhciIsInNldFNjcm9sbGJhciIsImVzY2FwZSIsInJlc2l6ZSIsImFkanVzdERpYWxvZyIsImVuZm9yY2VGb2N1cyIsImhpZGVNb2RhbCIsImhhcyIsIndoaWNoIiwiaGFuZGxlVXBkYXRlIiwicmVzZXRBZGp1c3RtZW50cyIsInJlc2V0U2Nyb2xsYmFyIiwicmVtb3ZlQmFja2Ryb3AiLCJyZW1vdmUiLCJhbmltYXRlIiwiZG9BbmltYXRlIiwiY2FsbGJhY2tSZW1vdmUiLCJtb2RhbElzT3ZlcmZsb3dpbmciLCJzY3JvbGxIZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJwYWRkaW5nTGVmdCIsImJvZHlJc092ZXJmbG93aW5nIiwicGFkZGluZ1JpZ2h0IiwiZnVsbFdpbmRvd1dpZHRoIiwiaW5uZXJXaWR0aCIsImRvY3VtZW50RWxlbWVudFJlY3QiLCJhYnMiLCJjbGllbnRXaWR0aCIsIm1lYXN1cmVTY3JvbGxiYXIiLCJib2R5UGFkIiwic2Nyb2xsRGl2IiwiY2xhc3NOYW1lIiwiYXBwZW5kIiwicmVtb3ZlQ2hpbGQiLCJtb2RhbCIsImZhY3RvcnkiLCJyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIiLCJkZWZpbmUiLCJhbWQiLCJleHBvcnRzIiwibW9kdWxlIiwiT2xkQ29va2llcyIsIkNvb2tpZXMiLCJhcGkiLCJyZXN1bHQiLCJhdHRyaWJ1dGVzIiwiY29udmVydGVyIiwicGF0aCIsImV4cGlyZXMiLCJEYXRlIiwic2V0TWlsbGlzZWNvbmRzIiwiZ2V0TWlsbGlzZWNvbmRzIiwidG9VVENTdHJpbmciLCJKU09OIiwic3RyaW5naWZ5Iiwid3JpdGUiLCJlbmNvZGVVUklDb21wb25lbnQiLCJTdHJpbmciLCJkZWNvZGVVUklDb21wb25lbnQiLCJzdHJpbmdpZmllZEF0dHJpYnV0ZXMiLCJhdHRyaWJ1dGVOYW1lIiwiY29va2llIiwiY29va2llcyIsInJkZWNvZGUiLCJwYXJ0cyIsInNsaWNlIiwianNvbiIsImNoYXJBdCIsInJlYWQiLCJwYXJzZSIsInNldCIsImdldCIsImdldEpTT04iLCJ3aXRoQ29udmVydGVyIiwidCIsInNsaW5reSIsImEiLCJzIiwibGFiZWwiLCJzcGVlZCIsIm4iLCJmaXJzdCIsInIiLCJsIiwib3V0ZXJIZWlnaHQiLCJkIiwicHJldiIsInByZXBlbmQiLCJ0ZXh0IiwicHJvcCIsIm5vdyIsInBhcmVudHNVbnRpbCIsImp1bXAiLCJob21lIiwiYyIsImxheW91dCIsInB1YiIsIiRsYXlvdXRfX2hlYWRlciIsIiRsYXlvdXRfX2RvY3VtZW50IiwibGF5b3V0X2NsYXNzZXMiLCJyZWdpc3RlckV2ZW50SGFuZGxlcnMiLCJyZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzIiwiYWRkRWxlbWVudENsYXNzZXMiLCJhZGQiLCJsYXlvdXRfX29iZnVzY2F0b3IiLCJ0b2dnbGVEcmF3ZXIiLCJoZWFkZXJfd2F0ZXJmYWxsIiwiJGRvY3VtZW50Iiwid2F0ZXJmYWxsSGVhZGVyIiwiJHdyYXBwZXIiLCJsYXlvdXRfX3dyYXBwZXIiLCIkb2JmdXNjYXRvciIsIiRkcmF3ZXIiLCJsYXlvdXRfX2RyYXdlciIsIm9iZnVzY2F0b3JfaXNfdmlzaWJsZSIsImRyYXdlcl9pc192aXNpYmxlIiwiJGhlYWRlciIsImxheW91dF9faGVhZGVyIiwiZGlzdGFuY2UiLCJoZWFkZXJfaXNfY29tcGFjdCIsImluZGV4IiwiaGVhZGVyX3Njcm9sbCIsIndyYXBwZXJfaGFzX3Njcm9sbGluZ19oZWFkZXIiLCJ3cmFwcGVyX2hhc19kcmF3ZXIiLCJ3cmFwcGVyX2lzX3VwZ3JhZGVkIiwiJG5vdGlmaWNhdGlvbnMiLCJ2YWwiLCIkcmVnaW9uIiwiY29va2llX2lkIiwiJGNsb3NlIiwiZmFkZUluIiwiZmFkZU91dCIsIiRtb2RhbCIsInBhcmVudHMiLCIkYWxsX3RvZ2dsZV9idXR0b25zIiwiJHRvZ2dsZV9idXR0b24iLCIkYWxsX2NvbnRlbnQiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7O0FBU0EsQ0FBQyxVQUFVQSxDQUFWLEVBQWE7QUFDWjs7QUFFQTtBQUNBOztBQUVBLE1BQUlDLE1BQU0sU0FBTkEsR0FBTSxDQUFVQyxPQUFWLEVBQW1CO0FBQzNCO0FBQ0EsU0FBS0EsT0FBTCxHQUFlRixFQUFFRSxPQUFGLENBQWY7QUFDQTtBQUNELEdBSkQ7O0FBTUFELE1BQUlFLE9BQUosR0FBYyxPQUFkOztBQUVBRixNQUFJRyxtQkFBSixHQUEwQixHQUExQjs7QUFFQUgsTUFBSUksU0FBSixDQUFjQyxJQUFkLEdBQXFCLFlBQVk7QUFDL0IsUUFBSUMsUUFBVyxLQUFLTCxPQUFwQjtBQUNBLFFBQUlNLE1BQVdELE1BQU1FLE9BQU4sQ0FBYyx3QkFBZCxDQUFmO0FBQ0EsUUFBSUMsV0FBV0gsTUFBTUksSUFBTixDQUFXLFFBQVgsQ0FBZjs7QUFFQSxRQUFJLENBQUNELFFBQUwsRUFBZTtBQUNiQSxpQkFBV0gsTUFBTUssSUFBTixDQUFXLE1BQVgsQ0FBWDtBQUNBRixpQkFBV0EsWUFBWUEsU0FBU0csT0FBVCxDQUFpQixnQkFBakIsRUFBbUMsRUFBbkMsQ0FBdkIsQ0FGYSxDQUVpRDtBQUMvRDs7QUFFRCxRQUFJTixNQUFNTyxNQUFOLENBQWEsSUFBYixFQUFtQkMsUUFBbkIsQ0FBNEIsUUFBNUIsQ0FBSixFQUEyQzs7QUFFM0MsUUFBSUMsWUFBWVIsSUFBSVMsSUFBSixDQUFTLGdCQUFULENBQWhCO0FBQ0EsUUFBSUMsWUFB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Q0FBbUIsVUFBVTZVLEtBQVYsRUFBaUI7QUFDaEN2WCxNQUFFLElBQUYsRUFBUWlCLElBQVIsQ0FBYSxrQkFBYixFQUFpQytULEtBQWpDLEdBQXlDMVQsT0FBekMsQ0FBaUQsT0FBakQ7QUFDSCxHQUZEO0FBSUQsQ0E3SUQsRUE2SUdnQyxNQTdJSCIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEJvb3RzdHJhcDogdGFiLmpzIHYzLjMuN1xuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jdGFic1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4rZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIFRBQiBDTEFTUyBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09XG5cbiAgdmFyIFRhYiA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgLy8ganNjczpkaXNhYmxlIHJlcXVpcmVEb2xsYXJCZWZvcmVqUXVlcnlBc3NpZ25tZW50XG4gICAgdGhpcy5lbGVtZW50ID0gJChlbGVtZW50KVxuICAgIC8vIGpzY3M6ZW5hYmxlIHJlcXVpcmVEb2xsYXJCZWZvcmVqUXVlcnlBc3NpZ25tZW50XG4gIH1cblxuICBUYWIuVkVSU0lPTiA9ICczLjMuNydcblxuICBUYWIuVFJBTlNJVElPTl9EVVJBVElPTiA9IDE1MFxuXG4gIFRhYi5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJHRoaXMgICAgPSB0aGlzLmVsZW1lbnRcbiAgICB2YXIgJHVsICAgICAgPSAkdGhpcy5jbG9zZXN0KCd1bDpub3QoLmRyb3Bkb3duLW1lbnUpJylcbiAgICB2YXIgc2VsZWN0b3IgPSAkdGhpcy5kYXRhKCd0YXJnZXQnKVxuXG4gICAgaWYgKCFzZWxlY3Rvcikge1xuICAgICAgc2VsZWN0b3IgPSAkdGhpcy5hdHRyKCdocmVmJylcbiAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IgJiYgc2VsZWN0b3IucmVwbGFjZSgvLiooPz0jW15cXHNdKiQpLywgJycpIC8vIHN0cmlwIGZvciBpZTdcbiAgICB9XG5cbiAgICBpZiAoJHRoaXMucGFyZW50KCdsaScpLmhhc0NsYXNzKCdhY3RpdmUnKSkgcmV0dXJuXG5cbiAgICB2YXIgJHByZXZpb3VzID0gJHVsLmZpbmQoJy5hY3RpdmU6bGFzdCBhJylcbiAgICB2YXIgaGlkZUV2ZW50ID0gJC5FdmVudCgnaGlkZS5icy50YWInLCB7XG4gICAgICByZWxhdGVkVGFyZ2V0OiAkdGhpc1swXVxuICAgIH0pXG4gICAgdmFyIHNob3dFdmVudCA9ICQuRXZlbnQoJ3Nob3cuYnMudGFiJywge1xuICAgICAgcmVsYXRlZFRhcmdldDogJHByZXZpb3VzWzBdXG4gICAgfSlcblxuICAgICRwcmV2aW91cy50cmlnZ2VyKGhpZGVFdmVudClcbiAgICAkdGhpcy50cmlnZ2VyKHNob3dFdmVudClcblxuICAgIGlmIChzaG93RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkgfHwgaGlkZUV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgIHZhciAkdGFyZ2V0ID0gJChzZWxlY3RvcilcblxuICAgIHRoaXMuYWN0aXZhdGUoJHRoaXMuY2xvc2VzdCgnbGknKSwgJHVsKVxuICAgIHRoaXMuYWN0aXZhdGUoJHRhcmdldCwgJHRhcmdldC5wYXJlbnQoKSwgZnVuY3Rpb24gKCkge1xuICAgICAgJHByZXZpb3VzLnRyaWdnZXIoe1xuICAgICAgICB0eXBlOiAnaGlkZGVuLmJzLnRhYicsXG4gICAgICAgIHJlbGF0ZWRUYXJnZXQ6ICR0aGlzWzBdXG4gICAgICB9KVxuICAgICAgJHRoaXMudHJpZ2dlcih7XG4gICAgICAgIHR5cGU6ICdzaG93bi5icy50YWInLFxuICAgICAgICByZWxhdGVkVGFyZ2V0OiAkcHJldmlvdXNbMF1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIFRhYi5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbiAoZWxlbWVudCwgY29udGFpbmVyLCBjYWxsYmFjaykge1xuICAgIHZhciAkYWN0aXZlICAgID0gY29udGFpbmVyLmZpbmQoJz4gLmFjdGl2ZScpXG4gICAgdmFyIHRyYW5zaXRpb24gPSBjYWxsYmFja1xuICAgICAgJiYgJC5zdXBwb3J0LnRyYW5zaXRpb25cbiAgICAgICYmICgkYWN0aXZlLmxlbmd0aCAmJiAkYWN0aXZlLmhhc0NsYXNzKCdmYWRlJykgfHwgISFjb250YWluZXIuZmluZCgnPiAuZmFkZScpLmxlbmd0aClcblxuICAgIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAkYWN0aXZlXG4gICAgICAgIC5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAgICAgLmZpbmQoJz4gLmRyb3Bkb3duLW1lbnUgPiAuYWN0aXZlJylcbiAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgIC5lbmQoKVxuICAgICAgICAuZmluZCgnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJylcbiAgICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKVxuXG4gICAgICBlbGVtZW50XG4gICAgICAgIC5hZGRDbGFzcygnYWN0aXZlJylcbiAgICAgICAgLmZpbmQoJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXScpXG4gICAgICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxuXG4gICAgICBpZiAodHJhbnNpdGlvbikge1xuICAgICAgICBlbGVtZW50WzBdLm9mZnNldFdpZHRoIC8vIHJlZmxvdyBmb3IgdHJhbnNpdGlvblxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdpbicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdmYWRlJylcbiAgICAgIH1cblxuICAgICAgaWYgKGVsZW1lbnQucGFyZW50KCcuZHJvcGRvd24tbWVudScpLmxlbmd0aCkge1xuICAgICAgICBlbGVtZW50XG4gICAgICAgICAgLmNsb3Nlc3QoJ2xpLmRyb3Bkb3duJylcbiAgICAgICAgICAgIC5hZGRDbGFzcygnYWN0aXZlJylcbiAgICAgICAgICAuZW5kKClcbiAgICAgICAgICAuZmluZCgnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJylcbiAgICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soKVxuICAgIH1cblxuICAgICRhY3RpdmUubGVuZ3RoICYmIHRyYW5zaXRpb24gP1xuICAgICAgJGFjdGl2ZVxuICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBuZXh0KVxuICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoVGFiLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcbiAgICAgIG5leHQoKVxuXG4gICAgJGFjdGl2ZS5yZW1vdmVDbGFzcygnaW4nKVxuICB9XG5cblxuICAvLyBUQUIgUExVR0lOIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKVxuICAgICAgdmFyIGRhdGEgID0gJHRoaXMuZGF0YSgnYnMudGFiJylcblxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy50YWInLCAoZGF0YSA9IG5ldyBUYWIodGhpcykpKVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXG4gICAgfSlcbiAgfVxuXG4gIHZhciBvbGQgPSAkLmZuLnRhYlxuXG4gICQuZm4udGFiICAgICAgICAgICAgID0gUGx1Z2luXG4gICQuZm4udGFiLkNvbnN0cnVjdG9yID0gVGFiXG5cblxuICAvLyBUQUIgTk8gQ09ORkxJQ1RcbiAgLy8gPT09PT09PT09PT09PT09XG5cbiAgJC5mbi50YWIubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLnRhYiA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuXG4gIC8vIFRBQiBEQVRBLUFQSVxuICAvLyA9PT09PT09PT09PT1cblxuICB2YXIgY2xpY2tIYW5kbGVyID0gZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBQbHVnaW4uY2FsbCgkKHRoaXMpLCAnc2hvdycpXG4gIH1cblxuICAkKGRvY3VtZW50KVxuICAgIC5vbignY2xpY2suYnMudGFiLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXScsIGNsaWNrSGFuZGxlcilcbiAgICAub24oJ2NsaWNrLmJzLnRhYi5kYXRhLWFwaScsICdbZGF0YS10b2dnbGU9XCJwaWxsXCJdJywgY2xpY2tIYW5kbGVyKVxuXG59KGpRdWVyeSk7XG4iLCIvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEJvb3RzdHJhcDogY29sbGFwc2UuanMgdjMuMy43XG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNjb2xsYXBzZVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuLyoganNoaW50IGxhdGVkZWY6IGZhbHNlICovXG5cbitmdW5jdGlvbiAoJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gQ09MTEFQU0UgUFVCTElDIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgQ29sbGFwc2UgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgICAgICA9ICQoZWxlbWVudClcbiAgICB0aGlzLm9wdGlvbnMgICAgICAgPSAkLmV4dGVuZCh7fSwgQ29sbGFwc2UuREVGQVVMVFMsIG9wdGlvbnMpXG4gICAgdGhpcy4kdHJpZ2dlciAgICAgID0gJCgnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl1baHJlZj1cIiMnICsgZWxlbWVudC5pZCArICdcIl0sJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl1bZGF0YS10YXJnZXQ9XCIjJyArIGVsZW1lbnQuaWQgKyAnXCJdJylcbiAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSBudWxsXG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnBhcmVudCkge1xuICAgICAgdGhpcy4kcGFyZW50ID0gdGhpcy5nZXRQYXJlbnQoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyh0aGlzLiRlbGVtZW50LCB0aGlzLiR0cmlnZ2VyKVxuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMudG9nZ2xlKSB0aGlzLnRvZ2dsZSgpXG4gIH1cblxuICBDb2xsYXBzZS5WRVJTSU9OICA9ICczLjMuNydcblxuICBDb2xsYXBzZS5UUkFOU0lUSU9OX0RVUkFUSU9OID0gMzUwXG5cbiAgQ29sbGFwc2UuREVGQVVMVFMgPSB7XG4gICAgdG9nZ2xlOiB0cnVlXG4gIH1cblxuICBDb2xsYXBzZS5wcm90b3R5cGUuZGltZW5zaW9uID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBoYXNXaWR0aCA9IHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ3dpZHRoJylcbiAgICByZXR1cm4gaGFzV2lkdGggPyAnd2lkdGgnIDogJ2hlaWdodCdcbiAgfVxuXG4gIENvbGxhcHNlLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnRyYW5zaXRpb25pbmcgfHwgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaW4nKSkgcmV0dXJuXG5cbiAgICB2YXIgYWN0aXZlc0RhdGFcbiAgICB2YXIgYWN0aXZlcyA9IHRoaXMuJHBhcmVudCAmJiB0aGlzLiRwYXJlbnQuY2hpbGRyZW4oJy5wYW5lbCcpLmNoaWxkcmVuKCcuaW4sIC5jb2xsYXBzaW5nJylcblxuICAgIGlmIChhY3RpdmVzICYmIGFjdGl2ZXMubGVuZ3RoKSB7XG4gICAgICBhY3RpdmVzRGF0YSA9IGFjdGl2ZXMuZGF0YSgnYnMuY29sbGFwc2UnKVxuICAgICAgaWYgKGFjdGl2ZXNEYXRhICYmIGFjdGl2ZXNEYXRhLnRyYW5zaXRpb25pbmcpIHJldHVyblxuICAgIH1cblxuICAgIHZhciBzdGFydEV2ZW50ID0gJC5FdmVudCgnc2hvdy5icy5jb2xsYXBzZScpXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKHN0YXJ0RXZlbnQpXG4gICAgaWYgKHN0YXJ0RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxuXG4gICAgaWYgKGFjdGl2ZXMgJiYgYWN0aXZlcy5sZW5ndGgpIHtcbiAgICAgIFBsdWdpbi5jYWxsKGFjdGl2ZXMsICdoaWRlJylcbiAgICAgIGFjdGl2ZXNEYXRhIHx8IGFjdGl2ZXMuZGF0YSgnYnMuY29sbGFwc2UnLCBudWxsKVxuICAgIH1cblxuICAgIHZhciBkaW1lbnNpb24gPSB0aGlzLmRpbWVuc2lvbigpXG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlJylcbiAgICAgIC5hZGRDbGFzcygnY29sbGFwc2luZycpW2RpbWVuc2lvbl0oMClcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcblxuICAgIHRoaXMuJHRyaWdnZXJcbiAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2VkJylcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcblxuICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDFcblxuICAgIHZhciBjb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzaW5nJylcbiAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZSBpbicpW2RpbWVuc2lvbl0oJycpXG4gICAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSAwXG4gICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAgIC50cmlnZ2VyKCdzaG93bi5icy5jb2xsYXBzZScpXG4gICAgfVxuXG4gICAgaWYgKCEkLnN1cHBvcnQudHJhbnNpdGlvbikgcmV0dXJuIGNvbXBsZXRlLmNhbGwodGhpcylcblxuICAgIHZhciBzY3JvbGxTaXplID0gJC5jYW1lbENhc2UoWydzY3JvbGwnLCBkaW1lbnNpb25dLmpvaW4oJy0nKSlcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsICQucHJveHkoY29tcGxldGUsIHRoaXMpKVxuICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKENvbGxhcHNlLlRSQU5TSVRJT05fRFVSQVRJT04pW2RpbWVuc2lvbl0odGhpcy4kZWxlbWVudFswXVtzY3JvbGxTaXplXSlcbiAgfVxuXG4gIENvbGxhcHNlLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnRyYW5zaXRpb25pbmcgfHwgIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJykpIHJldHVyblxuXG4gICAgdmFyIHN0YXJ0RXZlbnQgPSAkLkV2ZW50KCdoaWRlLmJzLmNvbGxhcHNlJylcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoc3RhcnRFdmVudClcbiAgICBpZiAoc3RhcnRFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICB2YXIgZGltZW5zaW9uID0gdGhpcy5kaW1lbnNpb24oKVxuXG4gICAgdGhpcy4kZWxlbWVudFtkaW1lbnNpb25dKHRoaXMuJGVsZW1lbnRbZGltZW5zaW9uXSgpKVswXS5vZmZzZXRIZWlnaHRcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5hZGRDbGFzcygnY29sbGFwc2luZycpXG4gICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlIGluJylcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpXG5cbiAgICB0aGlzLiR0cmlnZ2VyXG4gICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNlZCcpXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKVxuXG4gICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMVxuXG4gICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMFxuICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNpbmcnKVxuICAgICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNlJylcbiAgICAgICAgLnRyaWdnZXIoJ2hpZGRlbi5icy5jb2xsYXBzZScpXG4gICAgfVxuXG4gICAgaWYgKCEkLnN1cHBvcnQudHJhbnNpdGlvbikgcmV0dXJuIGNvbXBsZXRlLmNhbGwodGhpcylcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIFtkaW1lbnNpb25dKDApXG4gICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCAkLnByb3h5KGNvbXBsZXRlLCB0aGlzKSlcbiAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChDb2xsYXBzZS5UUkFOU0lUSU9OX0RVUkFUSU9OKVxuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzW3RoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJykgPyAnaGlkZScgOiAnc2hvdyddKClcbiAgfVxuXG4gIENvbGxhcHNlLnByb3RvdHlwZS5nZXRQYXJlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICQodGhpcy5vcHRpb25zLnBhcmVudClcbiAgICAgIC5maW5kKCdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXVtkYXRhLXBhcmVudD1cIicgKyB0aGlzLm9wdGlvbnMucGFyZW50ICsgJ1wiXScpXG4gICAgICAuZWFjaCgkLnByb3h5KGZ1bmN0aW9uIChpLCBlbGVtZW50KSB7XG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudClcbiAgICAgICAgdGhpcy5hZGRBcmlhQW5kQ29sbGFwc2VkQ2xhc3MoZ2V0VGFyZ2V0RnJvbVRyaWdnZXIoJGVsZW1lbnQpLCAkZWxlbWVudClcbiAgICAgIH0sIHRoaXMpKVxuICAgICAgLmVuZCgpXG4gIH1cblxuICBDb2xsYXBzZS5wcm90b3R5cGUuYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzID0gZnVuY3Rpb24gKCRlbGVtZW50LCAkdHJpZ2dlcikge1xuICAgIHZhciBpc09wZW4gPSAkZWxlbWVudC5oYXNDbGFzcygnaW4nKVxuXG4gICAgJGVsZW1lbnQuYXR0cignYXJpYS1leHBhbmRlZCcsIGlzT3BlbilcbiAgICAkdHJpZ2dlclxuICAgICAgLnRvZ2dsZUNsYXNzKCdjb2xsYXBzZWQnLCAhaXNPcGVuKVxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBpc09wZW4pXG4gIH1cblxuICBmdW5jdGlvbiBnZXRUYXJnZXRGcm9tVHJpZ2dlcigkdHJpZ2dlcikge1xuICAgIHZhciBocmVmXG4gICAgdmFyIHRhcmdldCA9ICR0cmlnZ2VyLmF0dHIoJ2RhdGEtdGFyZ2V0JylcbiAgICAgIHx8IChocmVmID0gJHRyaWdnZXIuYXR0cignaHJlZicpKSAmJiBocmVmLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sICcnKSAvLyBzdHJpcCBmb3IgaWU3XG5cbiAgICByZXR1cm4gJCh0YXJnZXQpXG4gIH1cblxuXG4gIC8vIENPTExBUFNFIFBMVUdJTiBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLmNvbGxhcHNlJylcbiAgICAgIHZhciBvcHRpb25zID0gJC5leHRlbmQoe30sIENvbGxhcHNlLkRFRkFVTFRTLCAkdGhpcy5kYXRhKCksIHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uKVxuXG4gICAgICBpZiAoIWRhdGEgJiYgb3B0aW9ucy50b2dnbGUgJiYgL3Nob3d8aGlkZS8udGVzdChvcHRpb24pKSBvcHRpb25zLnRvZ2dsZSA9IGZhbHNlXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLmNvbGxhcHNlJywgKGRhdGEgPSBuZXcgQ29sbGFwc2UodGhpcywgb3B0aW9ucykpKVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXG4gICAgfSlcbiAgfVxuXG4gIHZhciBvbGQgPSAkLmZuLmNvbGxhcHNlXG5cbiAgJC5mbi5jb2xsYXBzZSAgICAgICAgICAgICA9IFBsdWdpblxuICAkLmZuLmNvbGxhcHNlLkNvbnN0cnVjdG9yID0gQ29sbGFwc2VcblxuXG4gIC8vIENPTExBUFNFIE5PIENPTkZMSUNUXG4gIC8vID09PT09PT09PT09PT09PT09PT09XG5cbiAgJC5mbi5jb2xsYXBzZS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4uY29sbGFwc2UgPSBvbGRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cblxuICAvLyBDT0xMQVBTRSBEQVRBLUFQSVxuICAvLyA9PT09PT09PT09PT09PT09PVxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljay5icy5jb2xsYXBzZS5kYXRhLWFwaScsICdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXG5cbiAgICBpZiAoISR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JykpIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgdmFyICR0YXJnZXQgPSBnZXRUYXJnZXRGcm9tVHJpZ2dlcigkdGhpcylcbiAgICB2YXIgZGF0YSAgICA9ICR0YXJnZXQuZGF0YSgnYnMuY29sbGFwc2UnKVxuICAgIHZhciBvcHRpb24gID0gZGF0YSA/ICd0b2dnbGUnIDogJHRoaXMuZGF0YSgpXG5cbiAgICBQbHVnaW4uY2FsbCgkdGFyZ2V0LCBvcHRpb24pXG4gIH0pXG5cbn0oalF1ZXJ5KTtcbiIsIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiB0cmFuc2l0aW9uLmpzIHYzLjMuN1xuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jdHJhbnNpdGlvbnNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuK2Z1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBDU1MgVFJBTlNJVElPTiBTVVBQT1JUIChTaG91dG91dDogaHR0cDovL3d3dy5tb2Rlcm5penIuY29tLylcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gdHJhbnNpdGlvbkVuZCgpIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdib290c3RyYXAnKVxuXG4gICAgdmFyIHRyYW5zRW5kRXZlbnROYW1lcyA9IHtcbiAgICAgIFdlYmtpdFRyYW5zaXRpb24gOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG4gICAgICBNb3pUcmFuc2l0aW9uICAgIDogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgT1RyYW5zaXRpb24gICAgICA6ICdvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCcsXG4gICAgICB0cmFuc2l0aW9uICAgICAgIDogJ3RyYW5zaXRpb25lbmQnXG4gICAgfVxuXG4gICAgZm9yICh2YXIgbmFtZSBpbiB0cmFuc0VuZEV2ZW50TmFtZXMpIHtcbiAgICAgIGlmIChlbC5zdHlsZVtuYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB7IGVuZDogdHJhbnNFbmRFdmVudE5hbWVzW25hbWVdIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2UgLy8gZXhwbGljaXQgZm9yIGllOCAoICAuXy4pXG4gIH1cblxuICAvLyBodHRwOi8vYmxvZy5hbGV4bWFjY2F3LmNvbS9jc3MtdHJhbnNpdGlvbnNcbiAgJC5mbi5lbXVsYXRlVHJhbnNpdGlvbkVuZCA9IGZ1bmN0aW9uIChkdXJhdGlvbikge1xuICAgIHZhciBjYWxsZWQgPSBmYWxzZVxuICAgIHZhciAkZWwgPSB0aGlzXG4gICAgJCh0aGlzKS5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGZ1bmN0aW9uICgpIHsgY2FsbGVkID0gdHJ1ZSB9KVxuICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uICgpIHsgaWYgKCFjYWxsZWQpICQoJGVsKS50cmlnZ2VyKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCkgfVxuICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIGR1cmF0aW9uKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAkKGZ1bmN0aW9uICgpIHtcbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiA9IHRyYW5zaXRpb25FbmQoKVxuXG4gICAgaWYgKCEkLnN1cHBvcnQudHJhbnNpdGlvbikgcmV0dXJuXG5cbiAgICAkLmV2ZW50LnNwZWNpYWwuYnNUcmFuc2l0aW9uRW5kID0ge1xuICAgICAgYmluZFR5cGU6ICQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxcbiAgICAgIGRlbGVnYXRlVHlwZTogJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLFxuICAgICAgaGFuZGxlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoJChlLnRhcmdldCkuaXModGhpcykpIHJldHVybiBlLmhhbmRsZU9iai5oYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbn0oalF1ZXJ5KTtcbiIsIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiB0b29sdGlwLmpzIHYzLjMuN1xuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jdG9vbHRpcFxuICogSW5zcGlyZWQgYnkgdGhlIG9yaWdpbmFsIGpRdWVyeS50aXBzeSBieSBKYXNvbiBGcmFtZVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4rZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIFRPT0xUSVAgUFVCTElDIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBUb29sdGlwID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLnR5cGUgICAgICAgPSBudWxsXG4gICAgdGhpcy5vcHRpb25zICAgID0gbnVsbFxuICAgIHRoaXMuZW5hYmxlZCAgICA9IG51bGxcbiAgICB0aGlzLnRpbWVvdXQgICAgPSBudWxsXG4gICAgdGhpcy5ob3ZlclN0YXRlID0gbnVsbFxuICAgIHRoaXMuJGVsZW1lbnQgICA9IG51bGxcbiAgICB0aGlzLmluU3RhdGUgICAgPSBudWxsXG5cbiAgICB0aGlzLmluaXQoJ3Rvb2x0aXAnLCBlbGVtZW50LCBvcHRpb25zKVxuICB9XG5cbiAgVG9vbHRpcC5WRVJTSU9OICA9ICczLjMuNydcblxuICBUb29sdGlwLlRSQU5TSVRJT05fRFVSQVRJT04gPSAxNTBcblxuICBUb29sdGlwLkRFRkFVTFRTID0ge1xuICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICBwbGFjZW1lbnQ6ICd0b3AnLFxuICAgIHNlbGVjdG9yOiBmYWxzZSxcbiAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0b29sdGlwXCIgcm9sZT1cInRvb2x0aXBcIj48ZGl2IGNsYXNzPVwidG9vbHRpcC1hcnJvd1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0b29sdGlwLWlubmVyXCI+PC9kaXY+PC9kaXY+JyxcbiAgICB0cmlnZ2VyOiAnaG92ZXIgZm9jdXMnLFxuICAgIHRpdGxlOiAnJyxcbiAgICBkZWxheTogMCxcbiAgICBodG1sOiBmYWxzZSxcbiAgICBjb250YWluZXI6IGZhbHNlLFxuICAgIHZpZXdwb3J0OiB7XG4gICAgICBzZWxlY3RvcjogJ2JvZHknLFxuICAgICAgcGFkZGluZzogMFxuICAgIH1cbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAodHlwZSwgZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuZW5hYmxlZCAgID0gdHJ1ZVxuICAgIHRoaXMudHlwZSAgICAgID0gdHlwZVxuICAgIHRoaXMuJGVsZW1lbnQgID0gJChlbGVtZW50KVxuICAgIHRoaXMub3B0aW9ucyAgID0gdGhpcy5nZXRPcHRpb25zKG9wdGlvbnMpXG4gICAgdGhpcy4kdmlld3BvcnQgPSB0aGlzLm9wdGlvbnMudmlld3BvcnQgJiYgJCgkLmlzRnVuY3Rpb24odGhpcy5vcHRpb25zLnZpZXdwb3J0KSA/IHRoaXMub3B0aW9ucy52aWV3cG9ydC5jYWxsKHRoaXMsIHRoaXMuJGVsZW1lbnQpIDogKHRoaXMub3B0aW9ucy52aWV3cG9ydC5zZWxlY3RvciB8fCB0aGlzLm9wdGlvbnMudmlld3BvcnQpKVxuICAgIHRoaXMuaW5TdGF0ZSAgID0geyBjbGljazogZmFsc2UsIGhvdmVyOiBmYWxzZSwgZm9jdXM6IGZhbHNlIH1cblxuICAgIGlmICh0aGlzLiRlbGVtZW50WzBdIGluc3RhbmNlb2YgZG9jdW1lbnQuY29uc3RydWN0b3IgJiYgIXRoaXMub3B0aW9ucy5zZWxlY3Rvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdgc2VsZWN0b3JgIG9wdGlvbiBtdXN0IGJlIHNwZWNpZmllZCB3aGVuIGluaXRpYWxpemluZyAnICsgdGhpcy50eXBlICsgJyBvbiB0aGUgd2luZG93LmRvY3VtZW50IG9iamVjdCEnKVxuICAgIH1cblxuICAgIHZhciB0cmlnZ2VycyA9IHRoaXMub3B0aW9ucy50cmlnZ2VyLnNwbGl0KCcgJylcblxuICAgIGZvciAodmFyIGkgPSB0cmlnZ2Vycy5sZW5ndGg7IGktLTspIHtcbiAgICAgIHZhciB0cmlnZ2VyID0gdHJpZ2dlcnNbaV1cblxuICAgICAgaWYgKHRyaWdnZXIgPT0gJ2NsaWNrJykge1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKCdjbGljay4nICsgdGhpcy50eXBlLCB0aGlzLm9wdGlvbnMuc2VsZWN0b3IsICQucHJveHkodGhpcy50b2dnbGUsIHRoaXMpKVxuICAgICAgfSBlbHNlIGlmICh0cmlnZ2VyICE9ICdtYW51YWwnKSB7XG4gICAgICAgIHZhciBldmVudEluICA9IHRyaWdnZXIgPT0gJ2hvdmVyJyA/ICdtb3VzZWVudGVyJyA6ICdmb2N1c2luJ1xuICAgICAgICB2YXIgZXZlbnRPdXQgPSB0cmlnZ2VyID09ICdob3ZlcicgPyAnbW91c2VsZWF2ZScgOiAnZm9jdXNvdXQnXG5cbiAgICAgICAgdGhpcy4kZWxlbWVudC5vbihldmVudEluICArICcuJyArIHRoaXMudHlwZSwgdGhpcy5vcHRpb25zLnNlbGVjdG9yLCAkLnByb3h5KHRoaXMuZW50ZXIsIHRoaXMpKVxuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKGV2ZW50T3V0ICsgJy4nICsgdGhpcy50eXBlLCB0aGlzLm9wdGlvbnMuc2VsZWN0b3IsICQucHJveHkodGhpcy5sZWF2ZSwgdGhpcykpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zLnNlbGVjdG9yID9cbiAgICAgICh0aGlzLl9vcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgeyB0cmlnZ2VyOiAnbWFudWFsJywgc2VsZWN0b3I6ICcnIH0pKSA6XG4gICAgICB0aGlzLmZpeFRpdGxlKClcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldERlZmF1bHRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBUb29sdGlwLkRFRkFVTFRTXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMuZ2V0RGVmYXVsdHMoKSwgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpXG5cbiAgICBpZiAob3B0aW9ucy5kZWxheSAmJiB0eXBlb2Ygb3B0aW9ucy5kZWxheSA9PSAnbnVtYmVyJykge1xuICAgICAgb3B0aW9ucy5kZWxheSA9IHtcbiAgICAgICAgc2hvdzogb3B0aW9ucy5kZWxheSxcbiAgICAgICAgaGlkZTogb3B0aW9ucy5kZWxheVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvcHRpb25zXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXREZWxlZ2F0ZU9wdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG9wdGlvbnMgID0ge31cbiAgICB2YXIgZGVmYXVsdHMgPSB0aGlzLmdldERlZmF1bHRzKClcblxuICAgIHRoaXMuX29wdGlvbnMgJiYgJC5lYWNoKHRoaXMuX29wdGlvbnMsIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICBpZiAoZGVmYXVsdHNba2V5XSAhPSB2YWx1ZSkgb3B0aW9uc1trZXldID0gdmFsdWVcbiAgICB9KVxuXG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmVudGVyID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciBzZWxmID0gb2JqIGluc3RhbmNlb2YgdGhpcy5jb25zdHJ1Y3RvciA/XG4gICAgICBvYmogOiAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlKVxuXG4gICAgaWYgKCFzZWxmKSB7XG4gICAgICBzZWxmID0gbmV3IHRoaXMuY29uc3RydWN0b3Iob2JqLmN1cnJlbnRUYXJnZXQsIHRoaXMuZ2V0RGVsZWdhdGVPcHRpb25zKCkpXG4gICAgICAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlLCBzZWxmKVxuICAgIH1cblxuICAgIGlmIChvYmogaW5zdGFuY2VvZiAkLkV2ZW50KSB7XG4gICAgICBzZWxmLmluU3RhdGVbb2JqLnR5cGUgPT0gJ2ZvY3VzaW4nID8gJ2ZvY3VzJyA6ICdob3ZlciddID0gdHJ1ZVxuICAgIH1cblxuICAgIGlmIChzZWxmLnRpcCgpLmhhc0NsYXNzKCdpbicpIHx8IHNlbGYuaG92ZXJTdGF0ZSA9PSAnaW4nKSB7XG4gICAgICBzZWxmLmhvdmVyU3RhdGUgPSAnaW4nXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjbGVhclRpbWVvdXQoc2VsZi50aW1lb3V0KVxuXG4gICAgc2VsZi5ob3ZlclN0YXRlID0gJ2luJ1xuXG4gICAgaWYgKCFzZWxmLm9wdGlvbnMuZGVsYXkgfHwgIXNlbGYub3B0aW9ucy5kZWxheS5zaG93KSByZXR1cm4gc2VsZi5zaG93KClcblxuICAgIHNlbGYudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHNlbGYuaG92ZXJTdGF0ZSA9PSAnaW4nKSBzZWxmLnNob3coKVxuICAgIH0sIHNlbGYub3B0aW9ucy5kZWxheS5zaG93KVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuaXNJblN0YXRlVHJ1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5pblN0YXRlKSB7XG4gICAgICBpZiAodGhpcy5pblN0YXRlW2tleV0pIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5sZWF2ZSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgc2VsZiA9IG9iaiBpbnN0YW5jZW9mIHRoaXMuY29uc3RydWN0b3IgP1xuICAgICAgb2JqIDogJChvYmouY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSlcblxuICAgIGlmICghc2VsZikge1xuICAgICAgc2VsZiA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKG9iai5jdXJyZW50VGFyZ2V0LCB0aGlzLmdldERlbGVnYXRlT3B0aW9ucygpKVxuICAgICAgJChvYmouY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSwgc2VsZilcbiAgICB9XG5cbiAgICBpZiAob2JqIGluc3RhbmNlb2YgJC5FdmVudCkge1xuICAgICAgc2VsZi5pblN0YXRlW29iai50eXBlID09ICdmb2N1c291dCcgPyAnZm9jdXMnIDogJ2hvdmVyJ10gPSBmYWxzZVxuICAgIH1cblxuICAgIGlmIChzZWxmLmlzSW5TdGF0ZVRydWUoKSkgcmV0dXJuXG5cbiAgICBjbGVhclRpbWVvdXQoc2VsZi50aW1lb3V0KVxuXG4gICAgc2VsZi5ob3ZlclN0YXRlID0gJ291dCdcblxuICAgIGlmICghc2VsZi5vcHRpb25zLmRlbGF5IHx8ICFzZWxmLm9wdGlvbnMuZGVsYXkuaGlkZSkgcmV0dXJuIHNlbGYuaGlkZSgpXG5cbiAgICBzZWxmLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChzZWxmLmhvdmVyU3RhdGUgPT0gJ291dCcpIHNlbGYuaGlkZSgpXG4gICAgfSwgc2VsZi5vcHRpb25zLmRlbGF5LmhpZGUpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBlID0gJC5FdmVudCgnc2hvdy5icy4nICsgdGhpcy50eXBlKVxuXG4gICAgaWYgKHRoaXMuaGFzQ29udGVudCgpICYmIHRoaXMuZW5hYmxlZCkge1xuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXG5cbiAgICAgIHZhciBpbkRvbSA9ICQuY29udGFpbnModGhpcy4kZWxlbWVudFswXS5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgdGhpcy4kZWxlbWVudFswXSlcbiAgICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpIHx8ICFpbkRvbSkgcmV0dXJuXG4gICAgICB2YXIgdGhhdCA9IHRoaXNcblxuICAgICAgdmFyICR0aXAgPSB0aGlzLnRpcCgpXG5cbiAgICAgIHZhciB0aXBJZCA9IHRoaXMuZ2V0VUlEKHRoaXMudHlwZSlcblxuICAgICAgdGhpcy5zZXRDb250ZW50KClcbiAgICAgICR0aXAuYXR0cignaWQnLCB0aXBJZClcbiAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1kZXNjcmliZWRieScsIHRpcElkKVxuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmFuaW1hdGlvbikgJHRpcC5hZGRDbGFzcygnZmFkZScpXG5cbiAgICAgIHZhciBwbGFjZW1lbnQgPSB0eXBlb2YgdGhpcy5vcHRpb25zLnBsYWNlbWVudCA9PSAnZnVuY3Rpb24nID9cbiAgICAgICAgdGhpcy5vcHRpb25zLnBsYWNlbWVudC5jYWxsKHRoaXMsICR0aXBbMF0sIHRoaXMuJGVsZW1lbnRbMF0pIDpcbiAgICAgICAgdGhpcy5vcHRpb25zLnBsYWNlbWVudFxuXG4gICAgICB2YXIgYXV0b1Rva2VuID0gL1xccz9hdXRvP1xccz8vaVxuICAgICAgdmFyIGF1dG9QbGFjZSA9IGF1dG9Ub2tlbi50ZXN0KHBsYWNlbWVudClcbiAgICAgIGlmIChhdXRvUGxhY2UpIHBsYWNlbWVudCA9IHBsYWNlbWVudC5yZXBsYWNlKGF1dG9Ub2tlbiwgJycpIHx8ICd0b3AnXG5cbiAgICAgICR0aXBcbiAgICAgICAgLmRldGFjaCgpXG4gICAgICAgIC5jc3MoeyB0b3A6IDAsIGxlZnQ6IDAsIGRpc3BsYXk6ICdibG9jaycgfSlcbiAgICAgICAgLmFkZENsYXNzKHBsYWNlbWVudClcbiAgICAgICAgLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUsIHRoaXMpXG5cbiAgICAgIHRoaXMub3B0aW9ucy5jb250YWluZXIgPyAkdGlwLmFwcGVuZFRvKHRoaXMub3B0aW9ucy5jb250YWluZXIpIDogJHRpcC5pbnNlcnRBZnRlcih0aGlzLiRlbGVtZW50KVxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdpbnNlcnRlZC5icy4nICsgdGhpcy50eXBlKVxuXG4gICAgICB2YXIgcG9zICAgICAgICAgID0gdGhpcy5nZXRQb3NpdGlvbigpXG4gICAgICB2YXIgYWN0dWFsV2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxuICAgICAgdmFyIGFjdHVhbEhlaWdodCA9ICR0aXBbMF0ub2Zmc2V0SGVpZ2h0XG5cbiAgICAgIGlmIChhdXRvUGxhY2UpIHtcbiAgICAgICAgdmFyIG9yZ1BsYWNlbWVudCA9IHBsYWNlbWVudFxuICAgICAgICB2YXIgdmlld3BvcnREaW0gPSB0aGlzLmdldFBvc2l0aW9uKHRoaXMuJHZpZXdwb3J0KVxuXG4gICAgICAgIHBsYWNlbWVudCA9IHBsYWNlbWVudCA9PSAnYm90dG9tJyAmJiBwb3MuYm90dG9tICsgYWN0dWFsSGVpZ2h0ID4gdmlld3BvcnREaW0uYm90dG9tID8gJ3RvcCcgICAgOlxuICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ3RvcCcgICAgJiYgcG9zLnRvcCAgICAtIGFjdHVhbEhlaWdodCA8IHZpZXdwb3J0RGltLnRvcCAgICA/ICdib3R0b20nIDpcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50ID09ICdyaWdodCcgICYmIHBvcy5yaWdodCAgKyBhY3R1YWxXaWR0aCAgPiB2aWV3cG9ydERpbS53aWR0aCAgPyAnbGVmdCcgICA6XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAnbGVmdCcgICAmJiBwb3MubGVmdCAgIC0gYWN0dWFsV2lkdGggIDwgdmlld3BvcnREaW0ubGVmdCAgID8gJ3JpZ2h0JyAgOlxuICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRcblxuICAgICAgICAkdGlwXG4gICAgICAgICAgLnJlbW92ZUNsYXNzKG9yZ1BsYWNlbWVudClcbiAgICAgICAgICAuYWRkQ2xhc3MocGxhY2VtZW50KVxuICAgICAgfVxuXG4gICAgICB2YXIgY2FsY3VsYXRlZE9mZnNldCA9IHRoaXMuZ2V0Q2FsY3VsYXRlZE9mZnNldChwbGFjZW1lbnQsIHBvcywgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodClcblxuICAgICAgdGhpcy5hcHBseVBsYWNlbWVudChjYWxjdWxhdGVkT2Zmc2V0LCBwbGFjZW1lbnQpXG5cbiAgICAgIHZhciBjb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHByZXZIb3ZlclN0YXRlID0gdGhhdC5ob3ZlclN0YXRlXG4gICAgICAgIHRoYXQuJGVsZW1lbnQudHJpZ2dlcignc2hvd24uYnMuJyArIHRoYXQudHlwZSlcbiAgICAgICAgdGhhdC5ob3ZlclN0YXRlID0gbnVsbFxuXG4gICAgICAgIGlmIChwcmV2SG92ZXJTdGF0ZSA9PSAnb3V0JykgdGhhdC5sZWF2ZSh0aGF0KVxuICAgICAgfVxuXG4gICAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiR0aXAuaGFzQ2xhc3MoJ2ZhZGUnKSA/XG4gICAgICAgICR0aXBcbiAgICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBjb21wbGV0ZSlcbiAgICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoVG9vbHRpcC5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XG4gICAgICAgIGNvbXBsZXRlKClcbiAgICB9XG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5hcHBseVBsYWNlbWVudCA9IGZ1bmN0aW9uIChvZmZzZXQsIHBsYWNlbWVudCkge1xuICAgIHZhciAkdGlwICAgPSB0aGlzLnRpcCgpXG4gICAgdmFyIHdpZHRoICA9ICR0aXBbMF0ub2Zmc2V0V2lkdGhcbiAgICB2YXIgaGVpZ2h0ID0gJHRpcFswXS5vZmZzZXRIZWlnaHRcblxuICAgIC8vIG1hbnVhbGx5IHJlYWQgbWFyZ2lucyBiZWNhdXNlIGdldEJvdW5kaW5nQ2xpZW50UmVjdCBpbmNsdWRlcyBkaWZmZXJlbmNlXG4gICAgdmFyIG1hcmdpblRvcCA9IHBhcnNlSW50KCR0aXAuY3NzKCdtYXJnaW4tdG9wJyksIDEwKVxuICAgIHZhciBtYXJnaW5MZWZ0ID0gcGFyc2VJbnQoJHRpcC5jc3MoJ21hcmdpbi1sZWZ0JyksIDEwKVxuXG4gICAgLy8gd2UgbXVzdCBjaGVjayBmb3IgTmFOIGZvciBpZSA4LzlcbiAgICBpZiAoaXNOYU4obWFyZ2luVG9wKSkgIG1hcmdpblRvcCAgPSAwXG4gICAgaWYgKGlzTmFOKG1hcmdpbkxlZnQpKSBtYXJnaW5MZWZ0ID0gMFxuXG4gICAgb2Zmc2V0LnRvcCAgKz0gbWFyZ2luVG9wXG4gICAgb2Zmc2V0LmxlZnQgKz0gbWFyZ2luTGVmdFxuXG4gICAgLy8gJC5mbi5vZmZzZXQgZG9lc24ndCByb3VuZCBwaXhlbCB2YWx1ZXNcbiAgICAvLyBzbyB3ZSB1c2Ugc2V0T2Zmc2V0IGRpcmVjdGx5IHdpdGggb3VyIG93biBmdW5jdGlvbiBCLTBcbiAgICAkLm9mZnNldC5zZXRPZmZzZXQoJHRpcFswXSwgJC5leHRlbmQoe1xuICAgICAgdXNpbmc6IGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICAkdGlwLmNzcyh7XG4gICAgICAgICAgdG9wOiBNYXRoLnJvdW5kKHByb3BzLnRvcCksXG4gICAgICAgICAgbGVmdDogTWF0aC5yb3VuZChwcm9wcy5sZWZ0KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0sIG9mZnNldCksIDApXG5cbiAgICAkdGlwLmFkZENsYXNzKCdpbicpXG5cbiAgICAvLyBjaGVjayB0byBzZWUgaWYgcGxhY2luZyB0aXAgaW4gbmV3IG9mZnNldCBjYXVzZWQgdGhlIHRpcCB0byByZXNpemUgaXRzZWxmXG4gICAgdmFyIGFjdHVhbFdpZHRoICA9ICR0aXBbMF0ub2Zmc2V0V2lkdGhcbiAgICB2YXIgYWN0dWFsSGVpZ2h0ID0gJHRpcFswXS5vZmZzZXRIZWlnaHRcblxuICAgIGlmIChwbGFjZW1lbnQgPT0gJ3RvcCcgJiYgYWN0dWFsSGVpZ2h0ICE9IGhlaWdodCkge1xuICAgICAgb2Zmc2V0LnRvcCA9IG9mZnNldC50b3AgKyBoZWlnaHQgLSBhY3R1YWxIZWlnaHRcbiAgICB9XG5cbiAgICB2YXIgZGVsdGEgPSB0aGlzLmdldFZpZXdwb3J0QWRqdXN0ZWREZWx0YShwbGFjZW1lbnQsIG9mZnNldCwgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodClcblxuICAgIGlmIChkZWx0YS5sZWZ0KSBvZmZzZXQubGVmdCArPSBkZWx0YS5sZWZ0XG4gICAgZWxzZSBvZmZzZXQudG9wICs9IGRlbHRhLnRvcFxuXG4gICAgdmFyIGlzVmVydGljYWwgICAgICAgICAgPSAvdG9wfGJvdHRvbS8udGVzdChwbGFjZW1lbnQpXG4gICAgdmFyIGFycm93RGVsdGEgICAgICAgICAgPSBpc1ZlcnRpY2FsID8gZGVsdGEubGVmdCAqIDIgLSB3aWR0aCArIGFjdHVhbFdpZHRoIDogZGVsdGEudG9wICogMiAtIGhlaWdodCArIGFjdHVhbEhlaWdodFxuICAgIHZhciBhcnJvd09mZnNldFBvc2l0aW9uID0gaXNWZXJ0aWNhbCA/ICdvZmZzZXRXaWR0aCcgOiAnb2Zmc2V0SGVpZ2h0J1xuXG4gICAgJHRpcC5vZmZzZXQob2Zmc2V0KVxuICAgIHRoaXMucmVwbGFjZUFycm93KGFycm93RGVsdGEsICR0aXBbMF1bYXJyb3dPZmZzZXRQb3NpdGlvbl0sIGlzVmVydGljYWwpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5yZXBsYWNlQXJyb3cgPSBmdW5jdGlvbiAoZGVsdGEsIGRpbWVuc2lvbiwgaXNWZXJ0aWNhbCkge1xuICAgIHRoaXMuYXJyb3coKVxuICAgICAgLmNzcyhpc1ZlcnRpY2FsID8gJ2xlZnQnIDogJ3RvcCcsIDUwICogKDEgLSBkZWx0YSAvIGRpbWVuc2lvbikgKyAnJScpXG4gICAgICAuY3NzKGlzVmVydGljYWwgPyAndG9wJyA6ICdsZWZ0JywgJycpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciAkdGlwICA9IHRoaXMudGlwKClcbiAgICB2YXIgdGl0bGUgPSB0aGlzLmdldFRpdGxlKClcblxuICAgICR0aXAuZmluZCgnLnRvb2x0aXAtaW5uZXInKVt0aGlzLm9wdGlvbnMuaHRtbCA/ICdodG1sJyA6ICd0ZXh0J10odGl0bGUpXG4gICAgJHRpcC5yZW1vdmVDbGFzcygnZmFkZSBpbiB0b3AgYm90dG9tIGxlZnQgcmlnaHQnKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuICAgIHZhciAkdGlwID0gJCh0aGlzLiR0aXApXG4gICAgdmFyIGUgICAgPSAkLkV2ZW50KCdoaWRlLmJzLicgKyB0aGlzLnR5cGUpXG5cbiAgICBmdW5jdGlvbiBjb21wbGV0ZSgpIHtcbiAgICAgIGlmICh0aGF0LmhvdmVyU3RhdGUgIT0gJ2luJykgJHRpcC5kZXRhY2goKVxuICAgICAgaWYgKHRoYXQuJGVsZW1lbnQpIHsgLy8gVE9ETzogQ2hlY2sgd2hldGhlciBndWFyZGluZyB0aGlzIGNvZGUgd2l0aCB0aGlzIGBpZmAgaXMgcmVhbGx5IG5lY2Vzc2FyeS5cbiAgICAgICAgdGhhdC4kZWxlbWVudFxuICAgICAgICAgIC5yZW1vdmVBdHRyKCdhcmlhLWRlc2NyaWJlZGJ5JylcbiAgICAgICAgICAudHJpZ2dlcignaGlkZGVuLmJzLicgKyB0aGF0LnR5cGUpXG4gICAgICB9XG4gICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpXG4gICAgfVxuXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXG5cbiAgICBpZiAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICAkdGlwLnJlbW92ZUNsYXNzKCdpbicpXG5cbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiAkdGlwLmhhc0NsYXNzKCdmYWRlJykgP1xuICAgICAgJHRpcFxuICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBjb21wbGV0ZSlcbiAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKFRvb2x0aXAuVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgY29tcGxldGUoKVxuXG4gICAgdGhpcy5ob3ZlclN0YXRlID0gbnVsbFxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmZpeFRpdGxlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciAkZSA9IHRoaXMuJGVsZW1lbnRcbiAgICBpZiAoJGUuYXR0cigndGl0bGUnKSB8fCB0eXBlb2YgJGUuYXR0cignZGF0YS1vcmlnaW5hbC10aXRsZScpICE9ICdzdHJpbmcnKSB7XG4gICAgICAkZS5hdHRyKCdkYXRhLW9yaWdpbmFsLXRpdGxlJywgJGUuYXR0cigndGl0bGUnKSB8fCAnJykuYXR0cigndGl0bGUnLCAnJylcbiAgICB9XG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5oYXNDb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmdldFRpdGxlKClcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFBvc2l0aW9uID0gZnVuY3Rpb24gKCRlbGVtZW50KSB7XG4gICAgJGVsZW1lbnQgICA9ICRlbGVtZW50IHx8IHRoaXMuJGVsZW1lbnRcblxuICAgIHZhciBlbCAgICAgPSAkZWxlbWVudFswXVxuICAgIHZhciBpc0JvZHkgPSBlbC50YWdOYW1lID09ICdCT0RZJ1xuXG4gICAgdmFyIGVsUmVjdCAgICA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgaWYgKGVsUmVjdC53aWR0aCA9PSBudWxsKSB7XG4gICAgICAvLyB3aWR0aCBhbmQgaGVpZ2h0IGFyZSBtaXNzaW5nIGluIElFOCwgc28gY29tcHV0ZSB0aGVtIG1hbnVhbGx5OyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2lzc3Vlcy8xNDA5M1xuICAgICAgZWxSZWN0ID0gJC5leHRlbmQoe30sIGVsUmVjdCwgeyB3aWR0aDogZWxSZWN0LnJpZ2h0IC0gZWxSZWN0LmxlZnQsIGhlaWdodDogZWxSZWN0LmJvdHRvbSAtIGVsUmVjdC50b3AgfSlcbiAgICB9XG4gICAgdmFyIGlzU3ZnID0gd2luZG93LlNWR0VsZW1lbnQgJiYgZWwgaW5zdGFuY2VvZiB3aW5kb3cuU1ZHRWxlbWVudFxuICAgIC8vIEF2b2lkIHVzaW5nICQub2Zmc2V0KCkgb24gU1ZHcyBzaW5jZSBpdCBnaXZlcyBpbmNvcnJlY3QgcmVzdWx0cyBpbiBqUXVlcnkgMy5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2lzc3Vlcy8yMDI4MFxuICAgIHZhciBlbE9mZnNldCAgPSBpc0JvZHkgPyB7IHRvcDogMCwgbGVmdDogMCB9IDogKGlzU3ZnID8gbnVsbCA6ICRlbGVtZW50Lm9mZnNldCgpKVxuICAgIHZhciBzY3JvbGwgICAgPSB7IHNjcm9sbDogaXNCb2R5ID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA6ICRlbGVtZW50LnNjcm9sbFRvcCgpIH1cbiAgICB2YXIgb3V0ZXJEaW1zID0gaXNCb2R5ID8geyB3aWR0aDogJCh3aW5kb3cpLndpZHRoKCksIGhlaWdodDogJCh3aW5kb3cpLmhlaWdodCgpIH0gOiBudWxsXG5cbiAgICByZXR1cm4gJC5leHRlbmQoe30sIGVsUmVjdCwgc2Nyb2xsLCBvdXRlckRpbXMsIGVsT2Zmc2V0KVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0Q2FsY3VsYXRlZE9mZnNldCA9IGZ1bmN0aW9uIChwbGFjZW1lbnQsIHBvcywgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodCkge1xuICAgIHJldHVybiBwbGFjZW1lbnQgPT0gJ2JvdHRvbScgPyB7IHRvcDogcG9zLnRvcCArIHBvcy5oZWlnaHQsICAgbGVmdDogcG9zLmxlZnQgKyBwb3Mud2lkdGggLyAyIC0gYWN0dWFsV2lkdGggLyAyIH0gOlxuICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ3RvcCcgICAgPyB7IHRvcDogcG9zLnRvcCAtIGFjdHVhbEhlaWdodCwgbGVmdDogcG9zLmxlZnQgKyBwb3Mud2lkdGggLyAyIC0gYWN0dWFsV2lkdGggLyAyIH0gOlxuICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ2xlZnQnICAgPyB7IHRvcDogcG9zLnRvcCArIHBvcy5oZWlnaHQgLyAyIC0gYWN0dWFsSGVpZ2h0IC8gMiwgbGVmdDogcG9zLmxlZnQgLSBhY3R1YWxXaWR0aCB9IDpcbiAgICAgICAgLyogcGxhY2VtZW50ID09ICdyaWdodCcgKi8geyB0b3A6IHBvcy50b3AgKyBwb3MuaGVpZ2h0IC8gMiAtIGFjdHVhbEhlaWdodCAvIDIsIGxlZnQ6IHBvcy5sZWZ0ICsgcG9zLndpZHRoIH1cblxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0Vmlld3BvcnRBZGp1c3RlZERlbHRhID0gZnVuY3Rpb24gKHBsYWNlbWVudCwgcG9zLCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KSB7XG4gICAgdmFyIGRlbHRhID0geyB0b3A6IDAsIGxlZnQ6IDAgfVxuICAgIGlmICghdGhpcy4kdmlld3BvcnQpIHJldHVybiBkZWx0YVxuXG4gICAgdmFyIHZpZXdwb3J0UGFkZGluZyA9IHRoaXMub3B0aW9ucy52aWV3cG9ydCAmJiB0aGlzLm9wdGlvbnMudmlld3BvcnQucGFkZGluZyB8fCAwXG4gICAgdmFyIHZpZXdwb3J0RGltZW5zaW9ucyA9IHRoaXMuZ2V0UG9zaXRpb24odGhpcy4kdmlld3BvcnQpXG5cbiAgICBpZiAoL3JpZ2h0fGxlZnQvLnRlc3QocGxhY2VtZW50KSkge1xuICAgICAgdmFyIHRvcEVkZ2VPZmZzZXQgICAgPSBwb3MudG9wIC0gdmlld3BvcnRQYWRkaW5nIC0gdmlld3BvcnREaW1lbnNpb25zLnNjcm9sbFxuICAgICAgdmFyIGJvdHRvbUVkZ2VPZmZzZXQgPSBwb3MudG9wICsgdmlld3BvcnRQYWRkaW5nIC0gdmlld3BvcnREaW1lbnNpb25zLnNjcm9sbCArIGFjdHVhbEhlaWdodFxuICAgICAgaWYgKHRvcEVkZ2VPZmZzZXQgPCB2aWV3cG9ydERpbWVuc2lvbnMudG9wKSB7IC8vIHRvcCBvdmVyZmxvd1xuICAgICAgICBkZWx0YS50b3AgPSB2aWV3cG9ydERpbWVuc2lvbnMudG9wIC0gdG9wRWRnZU9mZnNldFxuICAgICAgfSBlbHNlIGlmIChib3R0b21FZGdlT2Zmc2V0ID4gdmlld3BvcnREaW1lbnNpb25zLnRvcCArIHZpZXdwb3J0RGltZW5zaW9ucy5oZWlnaHQpIHsgLy8gYm90dG9tIG92ZXJmbG93XG4gICAgICAgIGRlbHRhLnRvcCA9IHZpZXdwb3J0RGltZW5zaW9ucy50b3AgKyB2aWV3cG9ydERpbWVuc2lvbnMuaGVpZ2h0IC0gYm90dG9tRWRnZU9mZnNldFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbGVmdEVkZ2VPZmZzZXQgID0gcG9zLmxlZnQgLSB2aWV3cG9ydFBhZGRpbmdcbiAgICAgIHZhciByaWdodEVkZ2VPZmZzZXQgPSBwb3MubGVmdCArIHZpZXdwb3J0UGFkZGluZyArIGFjdHVhbFdpZHRoXG4gICAgICBpZiAobGVmdEVkZ2VPZmZzZXQgPCB2aWV3cG9ydERpbWVuc2lvbnMubGVmdCkgeyAvLyBsZWZ0IG92ZXJmbG93XG4gICAgICAgIGRlbHRhLmxlZnQgPSB2aWV3cG9ydERpbWVuc2lvbnMubGVmdCAtIGxlZnRFZGdlT2Zmc2V0XG4gICAgICB9IGVsc2UgaWYgKHJpZ2h0RWRnZU9mZnNldCA+IHZpZXdwb3J0RGltZW5zaW9ucy5yaWdodCkgeyAvLyByaWdodCBvdmVyZmxvd1xuICAgICAgICBkZWx0YS5sZWZ0ID0gdmlld3BvcnREaW1lbnNpb25zLmxlZnQgKyB2aWV3cG9ydERpbWVuc2lvbnMud2lkdGggLSByaWdodEVkZ2VPZmZzZXRcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGVsdGFcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFRpdGxlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aXRsZVxuICAgIHZhciAkZSA9IHRoaXMuJGVsZW1lbnRcbiAgICB2YXIgbyAgPSB0aGlzLm9wdGlvbnNcblxuICAgIHRpdGxlID0gJGUuYXR0cignZGF0YS1vcmlnaW5hbC10aXRsZScpXG4gICAgICB8fCAodHlwZW9mIG8udGl0bGUgPT0gJ2Z1bmN0aW9uJyA/IG8udGl0bGUuY2FsbCgkZVswXSkgOiAgby50aXRsZSlcblxuICAgIHJldHVybiB0aXRsZVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0VUlEID0gZnVuY3Rpb24gKHByZWZpeCkge1xuICAgIGRvIHByZWZpeCArPSB+fihNYXRoLnJhbmRvbSgpICogMTAwMDAwMClcbiAgICB3aGlsZSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocHJlZml4KSlcbiAgICByZXR1cm4gcHJlZml4XG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS50aXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLiR0aXApIHtcbiAgICAgIHRoaXMuJHRpcCA9ICQodGhpcy5vcHRpb25zLnRlbXBsYXRlKVxuICAgICAgaWYgKHRoaXMuJHRpcC5sZW5ndGggIT0gMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGhpcy50eXBlICsgJyBgdGVtcGxhdGVgIG9wdGlvbiBtdXN0IGNvbnNpc3Qgb2YgZXhhY3RseSAxIHRvcC1sZXZlbCBlbGVtZW50IScpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLiR0aXBcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmFycm93ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAodGhpcy4kYXJyb3cgPSB0aGlzLiRhcnJvdyB8fCB0aGlzLnRpcCgpLmZpbmQoJy50b29sdGlwLWFycm93JykpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUudG9nZ2xlRW5hYmxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVuYWJsZWQgPSAhdGhpcy5lbmFibGVkXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgIGlmIChlKSB7XG4gICAgICBzZWxmID0gJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUpXG4gICAgICBpZiAoIXNlbGYpIHtcbiAgICAgICAgc2VsZiA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKGUuY3VycmVudFRhcmdldCwgdGhpcy5nZXREZWxlZ2F0ZU9wdGlvbnMoKSlcbiAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUsIHNlbGYpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGUpIHtcbiAgICAgIHNlbGYuaW5TdGF0ZS5jbGljayA9ICFzZWxmLmluU3RhdGUuY2xpY2tcbiAgICAgIGlmIChzZWxmLmlzSW5TdGF0ZVRydWUoKSkgc2VsZi5lbnRlcihzZWxmKVxuICAgICAgZWxzZSBzZWxmLmxlYXZlKHNlbGYpXG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYudGlwKCkuaGFzQ2xhc3MoJ2luJykgPyBzZWxmLmxlYXZlKHNlbGYpIDogc2VsZi5lbnRlcihzZWxmKVxuICAgIH1cbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dClcbiAgICB0aGlzLmhpZGUoZnVuY3Rpb24gKCkge1xuICAgICAgdGhhdC4kZWxlbWVudC5vZmYoJy4nICsgdGhhdC50eXBlKS5yZW1vdmVEYXRhKCdicy4nICsgdGhhdC50eXBlKVxuICAgICAgaWYgKHRoYXQuJHRpcCkge1xuICAgICAgICB0aGF0LiR0aXAuZGV0YWNoKClcbiAgICAgIH1cbiAgICAgIHRoYXQuJHRpcCA9IG51bGxcbiAgICAgIHRoYXQuJGFycm93ID0gbnVsbFxuICAgICAgdGhhdC4kdmlld3BvcnQgPSBudWxsXG4gICAgICB0aGF0LiRlbGVtZW50ID0gbnVsbFxuICAgIH0pXG4gIH1cblxuXG4gIC8vIFRPT0xUSVAgUExVR0lOIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy50b29sdGlwJylcbiAgICAgIHZhciBvcHRpb25zID0gdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb25cblxuICAgICAgaWYgKCFkYXRhICYmIC9kZXN0cm95fGhpZGUvLnRlc3Qob3B0aW9uKSkgcmV0dXJuXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLnRvb2x0aXAnLCAoZGF0YSA9IG5ldyBUb29sdGlwKHRoaXMsIG9wdGlvbnMpKSlcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxuICAgIH0pXG4gIH1cblxuICB2YXIgb2xkID0gJC5mbi50b29sdGlwXG5cbiAgJC5mbi50b29sdGlwICAgICAgICAgICAgID0gUGx1Z2luXG4gICQuZm4udG9vbHRpcC5Db25zdHJ1Y3RvciA9IFRvb2x0aXBcblxuXG4gIC8vIFRPT0xUSVAgTk8gQ09ORkxJQ1RcbiAgLy8gPT09PT09PT09PT09PT09PT09PVxuXG4gICQuZm4udG9vbHRpcC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4udG9vbHRpcCA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxufShqUXVlcnkpO1xuIiwiLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBCb290c3RyYXA6IHBvcG92ZXIuanMgdjMuMy43XG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNwb3BvdmVyc1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4rZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIFBPUE9WRVIgUFVCTElDIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBQb3BvdmVyID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmluaXQoJ3BvcG92ZXInLCBlbGVtZW50LCBvcHRpb25zKVxuICB9XG5cbiAgaWYgKCEkLmZuLnRvb2x0aXApIHRocm93IG5ldyBFcnJvcignUG9wb3ZlciByZXF1aXJlcyB0b29sdGlwLmpzJylcblxuICBQb3BvdmVyLlZFUlNJT04gID0gJzMuMy43J1xuXG4gIFBvcG92ZXIuREVGQVVMVFMgPSAkLmV4dGVuZCh7fSwgJC5mbi50b29sdGlwLkNvbnN0cnVjdG9yLkRFRkFVTFRTLCB7XG4gICAgcGxhY2VtZW50OiAncmlnaHQnLFxuICAgIHRyaWdnZXI6ICdjbGljaycsXG4gICAgY29udGVudDogJycsXG4gICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwicG9wb3ZlclwiIHJvbGU9XCJ0b29sdGlwXCI+PGRpdiBjbGFzcz1cImFycm93XCI+PC9kaXY+PGgzIGNsYXNzPVwicG9wb3Zlci10aXRsZVwiPjwvaDM+PGRpdiBjbGFzcz1cInBvcG92ZXItY29udGVudFwiPjwvZGl2PjwvZGl2PidcbiAgfSlcblxuXG4gIC8vIE5PVEU6IFBPUE9WRVIgRVhURU5EUyB0b29sdGlwLmpzXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgUG9wb3Zlci5wcm90b3R5cGUgPSAkLmV4dGVuZCh7fSwgJC5mbi50b29sdGlwLkNvbnN0cnVjdG9yLnByb3RvdHlwZSlcblxuICBQb3BvdmVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBvcG92ZXJcblxuICBQb3BvdmVyLnByb3RvdHlwZS5nZXREZWZhdWx0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUG9wb3Zlci5ERUZBVUxUU1xuICB9XG5cbiAgUG9wb3Zlci5wcm90b3R5cGUuc2V0Q29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJHRpcCAgICA9IHRoaXMudGlwKClcbiAgICB2YXIgdGl0bGUgICA9IHRoaXMuZ2V0VGl0bGUoKVxuICAgIHZhciBjb250ZW50ID0gdGhpcy5nZXRDb250ZW50KClcblxuICAgICR0aXAuZmluZCgnLnBvcG92ZXItdGl0bGUnKVt0aGlzLm9wdGlvbnMuaHRtbCA/ICdodG1sJyA6ICd0ZXh0J10odGl0bGUpXG4gICAgJHRpcC5maW5kKCcucG9wb3Zlci1jb250ZW50JykuY2hpbGRyZW4oKS5kZXRhY2goKS5lbmQoKVsgLy8gd2UgdXNlIGFwcGVuZCBmb3IgaHRtbCBvYmplY3RzIHRvIG1haW50YWluIGpzIGV2ZW50c1xuICAgICAgdGhpcy5vcHRpb25zLmh0bWwgPyAodHlwZW9mIGNvbnRlbnQgPT0gJ3N0cmluZycgPyAnaHRtbCcgOiAnYXBwZW5kJykgOiAndGV4dCdcbiAgICBdKGNvbnRlbnQpXG5cbiAgICAkdGlwLnJlbW92ZUNsYXNzKCdmYWRlIHRvcCBib3R0b20gbGVmdCByaWdodCBpbicpXG5cbiAgICAvLyBJRTggZG9lc24ndCBhY2NlcHQgaGlkaW5nIHZpYSB0aGUgYDplbXB0eWAgcHNldWRvIHNlbGVjdG9yLCB3ZSBoYXZlIHRvIGRvXG4gICAgLy8gdGhpcyBtYW51YWxseSBieSBjaGVja2luZyB0aGUgY29udGVudHMuXG4gICAgaWYgKCEkdGlwLmZpbmQoJy5wb3BvdmVyLXRpdGxlJykuaHRtbCgpKSAkdGlwLmZpbmQoJy5wb3BvdmVyLXRpdGxlJykuaGlkZSgpXG4gIH1cblxuICBQb3BvdmVyLnByb3RvdHlwZS5oYXNDb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmdldFRpdGxlKCkgfHwgdGhpcy5nZXRDb250ZW50KClcbiAgfVxuXG4gIFBvcG92ZXIucHJvdG90eXBlLmdldENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICRlID0gdGhpcy4kZWxlbWVudFxuICAgIHZhciBvICA9IHRoaXMub3B0aW9uc1xuXG4gICAgcmV0dXJuICRlLmF0dHIoJ2RhdGEtY29udGVudCcpXG4gICAgICB8fCAodHlwZW9mIG8uY29udGVudCA9PSAnZnVuY3Rpb24nID9cbiAgICAgICAgICAgIG8uY29udGVudC5jYWxsKCRlWzBdKSA6XG4gICAgICAgICAgICBvLmNvbnRlbnQpXG4gIH1cblxuICBQb3BvdmVyLnByb3RvdHlwZS5hcnJvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKHRoaXMuJGFycm93ID0gdGhpcy4kYXJyb3cgfHwgdGhpcy50aXAoKS5maW5kKCcuYXJyb3cnKSlcbiAgfVxuXG5cbiAgLy8gUE9QT1ZFUiBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLnBvcG92ZXInKVxuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxuXG4gICAgICBpZiAoIWRhdGEgJiYgL2Rlc3Ryb3l8aGlkZS8udGVzdChvcHRpb24pKSByZXR1cm5cbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMucG9wb3ZlcicsIChkYXRhID0gbmV3IFBvcG92ZXIodGhpcywgb3B0aW9ucykpKVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXG4gICAgfSlcbiAgfVxuXG4gIHZhciBvbGQgPSAkLmZuLnBvcG92ZXJcblxuICAkLmZuLnBvcG92ZXIgICAgICAgICAgICAgPSBQbHVnaW5cbiAgJC5mbi5wb3BvdmVyLkNvbnN0cnVjdG9yID0gUG9wb3ZlclxuXG5cbiAgLy8gUE9QT1ZFUiBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT09PT09XG5cbiAgJC5mbi5wb3BvdmVyLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi5wb3BvdmVyID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG59KGpRdWVyeSk7XG4iLCIvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEJvb3RzdHJhcDogbW9kYWwuanMgdjMuMy43XG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNtb2RhbHNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuK2Z1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBNT0RBTCBDTEFTUyBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgTW9kYWwgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyAgICAgICAgICAgICA9IG9wdGlvbnNcbiAgICB0aGlzLiRib2R5ICAgICAgICAgICAgICAgPSAkKGRvY3VtZW50LmJvZHkpXG4gICAgdGhpcy4kZWxlbWVudCAgICAgICAgICAgID0gJChlbGVtZW50KVxuICAgIHRoaXMuJGRpYWxvZyAgICAgICAgICAgICA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLm1vZGFsLWRpYWxvZycpXG4gICAgdGhpcy4kYmFja2Ryb3AgICAgICAgICAgID0gbnVsbFxuICAgIHRoaXMuaXNTaG93biAgICAgICAgICAgICA9IG51bGxcbiAgICB0aGlzLm9yaWdpbmFsQm9keVBhZCAgICAgPSBudWxsXG4gICAgdGhpcy5zY3JvbGxiYXJXaWR0aCAgICAgID0gMFxuICAgIHRoaXMuaWdub3JlQmFja2Ryb3BDbGljayA9IGZhbHNlXG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnJlbW90ZSkge1xuICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAuZmluZCgnLm1vZGFsLWNvbnRlbnQnKVxuICAgICAgICAubG9hZCh0aGlzLm9wdGlvbnMucmVtb3RlLCAkLnByb3h5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2xvYWRlZC5icy5tb2RhbCcpXG4gICAgICAgIH0sIHRoaXMpKVxuICAgIH1cbiAgfVxuXG4gIE1vZGFsLlZFUlNJT04gID0gJzMuMy43J1xuXG4gIE1vZGFsLlRSQU5TSVRJT05fRFVSQVRJT04gPSAzMDBcbiAgTW9kYWwuQkFDS0RST1BfVFJBTlNJVElPTl9EVVJBVElPTiA9IDE1MFxuXG4gIE1vZGFsLkRFRkFVTFRTID0ge1xuICAgIGJhY2tkcm9wOiB0cnVlLFxuICAgIGtleWJvYXJkOiB0cnVlLFxuICAgIHNob3c6IHRydWVcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoX3JlbGF0ZWRUYXJnZXQpIHtcbiAgICByZXR1cm4gdGhpcy5pc1Nob3duID8gdGhpcy5oaWRlKCkgOiB0aGlzLnNob3coX3JlbGF0ZWRUYXJnZXQpXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uIChfcmVsYXRlZFRhcmdldCkge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuICAgIHZhciBlICAgID0gJC5FdmVudCgnc2hvdy5icy5tb2RhbCcsIHsgcmVsYXRlZFRhcmdldDogX3JlbGF0ZWRUYXJnZXQgfSlcblxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxuXG4gICAgaWYgKHRoaXMuaXNTaG93biB8fCBlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgIHRoaXMuaXNTaG93biA9IHRydWVcblxuICAgIHRoaXMuY2hlY2tTY3JvbGxiYXIoKVxuICAgIHRoaXMuc2V0U2Nyb2xsYmFyKClcbiAgICB0aGlzLiRib2R5LmFkZENsYXNzKCdtb2RhbC1vcGVuJylcblxuICAgIHRoaXMuZXNjYXBlKClcbiAgICB0aGlzLnJlc2l6ZSgpXG5cbiAgICB0aGlzLiRlbGVtZW50Lm9uKCdjbGljay5kaXNtaXNzLmJzLm1vZGFsJywgJ1tkYXRhLWRpc21pc3M9XCJtb2RhbFwiXScsICQucHJveHkodGhpcy5oaWRlLCB0aGlzKSlcblxuICAgIHRoaXMuJGRpYWxvZy5vbignbW91c2Vkb3duLmRpc21pc3MuYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGF0LiRlbGVtZW50Lm9uZSgnbW91c2V1cC5kaXNtaXNzLmJzLm1vZGFsJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKCQoZS50YXJnZXQpLmlzKHRoYXQuJGVsZW1lbnQpKSB0aGF0Lmlnbm9yZUJhY2tkcm9wQ2xpY2sgPSB0cnVlXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB0aGlzLmJhY2tkcm9wKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB0cmFuc2l0aW9uID0gJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhhdC4kZWxlbWVudC5oYXNDbGFzcygnZmFkZScpXG5cbiAgICAgIGlmICghdGhhdC4kZWxlbWVudC5wYXJlbnQoKS5sZW5ndGgpIHtcbiAgICAgICAgdGhhdC4kZWxlbWVudC5hcHBlbmRUbyh0aGF0LiRib2R5KSAvLyBkb24ndCBtb3ZlIG1vZGFscyBkb20gcG9zaXRpb25cbiAgICAgIH1cblxuICAgICAgdGhhdC4kZWxlbWVudFxuICAgICAgICAuc2hvdygpXG4gICAgICAgIC5zY3JvbGxUb3AoMClcblxuICAgICAgdGhhdC5hZGp1c3REaWFsb2coKVxuXG4gICAgICBpZiAodHJhbnNpdGlvbikge1xuICAgICAgICB0aGF0LiRlbGVtZW50WzBdLm9mZnNldFdpZHRoIC8vIGZvcmNlIHJlZmxvd1xuICAgICAgfVxuXG4gICAgICB0aGF0LiRlbGVtZW50LmFkZENsYXNzKCdpbicpXG5cbiAgICAgIHRoYXQuZW5mb3JjZUZvY3VzKClcblxuICAgICAgdmFyIGUgPSAkLkV2ZW50KCdzaG93bi5icy5tb2RhbCcsIHsgcmVsYXRlZFRhcmdldDogX3JlbGF0ZWRUYXJnZXQgfSlcblxuICAgICAgdHJhbnNpdGlvbiA/XG4gICAgICAgIHRoYXQuJGRpYWxvZyAvLyB3YWl0IGZvciBtb2RhbCB0byBzbGlkZSBpblxuICAgICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoYXQuJGVsZW1lbnQudHJpZ2dlcignZm9jdXMnKS50cmlnZ2VyKGUpXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoTW9kYWwuVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgICB0aGF0LiRlbGVtZW50LnRyaWdnZXIoJ2ZvY3VzJykudHJpZ2dlcihlKVxuICAgIH0pXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGUpIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgZSA9ICQuRXZlbnQoJ2hpZGUuYnMubW9kYWwnKVxuXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXG5cbiAgICBpZiAoIXRoaXMuaXNTaG93biB8fCBlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgIHRoaXMuaXNTaG93biA9IGZhbHNlXG5cbiAgICB0aGlzLmVzY2FwZSgpXG4gICAgdGhpcy5yZXNpemUoKVxuXG4gICAgJChkb2N1bWVudCkub2ZmKCdmb2N1c2luLmJzLm1vZGFsJylcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5yZW1vdmVDbGFzcygnaW4nKVxuICAgICAgLm9mZignY2xpY2suZGlzbWlzcy5icy5tb2RhbCcpXG4gICAgICAub2ZmKCdtb3VzZXVwLmRpc21pc3MuYnMubW9kYWwnKVxuXG4gICAgdGhpcy4kZGlhbG9nLm9mZignbW91c2Vkb3duLmRpc21pc3MuYnMubW9kYWwnKVxuXG4gICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZmFkZScpID9cbiAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgJC5wcm94eSh0aGlzLmhpZGVNb2RhbCwgdGhpcykpXG4gICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChNb2RhbC5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XG4gICAgICB0aGlzLmhpZGVNb2RhbCgpXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuZW5mb3JjZUZvY3VzID0gZnVuY3Rpb24gKCkge1xuICAgICQoZG9jdW1lbnQpXG4gICAgICAub2ZmKCdmb2N1c2luLmJzLm1vZGFsJykgLy8gZ3VhcmQgYWdhaW5zdCBpbmZpbml0ZSBmb2N1cyBsb29wXG4gICAgICAub24oJ2ZvY3VzaW4uYnMubW9kYWwnLCAkLnByb3h5KGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChkb2N1bWVudCAhPT0gZS50YXJnZXQgJiZcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnRbMF0gIT09IGUudGFyZ2V0ICYmXG4gICAgICAgICAgICAhdGhpcy4kZWxlbWVudC5oYXMoZS50YXJnZXQpLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZm9jdXMnKVxuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSlcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5lc2NhcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuaXNTaG93biAmJiB0aGlzLm9wdGlvbnMua2V5Ym9hcmQpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ2tleWRvd24uZGlzbWlzcy5icy5tb2RhbCcsICQucHJveHkoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS53aGljaCA9PSAyNyAmJiB0aGlzLmhpZGUoKVxuICAgICAgfSwgdGhpcykpXG4gICAgfSBlbHNlIGlmICghdGhpcy5pc1Nob3duKSB7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZigna2V5ZG93bi5kaXNtaXNzLmJzLm1vZGFsJylcbiAgICB9XG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmlzU2hvd24pIHtcbiAgICAgICQod2luZG93KS5vbigncmVzaXplLmJzLm1vZGFsJywgJC5wcm94eSh0aGlzLmhhbmRsZVVwZGF0ZSwgdGhpcykpXG4gICAgfSBlbHNlIHtcbiAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS5icy5tb2RhbCcpXG4gICAgfVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLmhpZGVNb2RhbCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICB0aGlzLiRlbGVtZW50LmhpZGUoKVxuICAgIHRoaXMuYmFja2Ryb3AoZnVuY3Rpb24gKCkge1xuICAgICAgdGhhdC4kYm9keS5yZW1vdmVDbGFzcygnbW9kYWwtb3BlbicpXG4gICAgICB0aGF0LnJlc2V0QWRqdXN0bWVudHMoKVxuICAgICAgdGhhdC5yZXNldFNjcm9sbGJhcigpXG4gICAgICB0aGF0LiRlbGVtZW50LnRyaWdnZXIoJ2hpZGRlbi5icy5tb2RhbCcpXG4gICAgfSlcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5yZW1vdmVCYWNrZHJvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLiRiYWNrZHJvcCAmJiB0aGlzLiRiYWNrZHJvcC5yZW1vdmUoKVxuICAgIHRoaXMuJGJhY2tkcm9wID0gbnVsbFxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLmJhY2tkcm9wID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgdmFyIGFuaW1hdGUgPSB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJykgPyAnZmFkZScgOiAnJ1xuXG4gICAgaWYgKHRoaXMuaXNTaG93biAmJiB0aGlzLm9wdGlvbnMuYmFja2Ryb3ApIHtcbiAgICAgIHZhciBkb0FuaW1hdGUgPSAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiBhbmltYXRlXG5cbiAgICAgIHRoaXMuJGJhY2tkcm9wID0gJChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSlcbiAgICAgICAgLmFkZENsYXNzKCdtb2RhbC1iYWNrZHJvcCAnICsgYW5pbWF0ZSlcbiAgICAgICAgLmFwcGVuZFRvKHRoaXMuJGJvZHkpXG5cbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrLmRpc21pc3MuYnMubW9kYWwnLCAkLnByb3h5KGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICh0aGlzLmlnbm9yZUJhY2tkcm9wQ2xpY2spIHtcbiAgICAgICAgICB0aGlzLmlnbm9yZUJhY2tkcm9wQ2xpY2sgPSBmYWxzZVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGlmIChlLnRhcmdldCAhPT0gZS5jdXJyZW50VGFyZ2V0KSByZXR1cm5cbiAgICAgICAgdGhpcy5vcHRpb25zLmJhY2tkcm9wID09ICdzdGF0aWMnXG4gICAgICAgICAgPyB0aGlzLiRlbGVtZW50WzBdLmZvY3VzKClcbiAgICAgICAgICA6IHRoaXMuaGlkZSgpXG4gICAgICB9LCB0aGlzKSlcblxuICAgICAgaWYgKGRvQW5pbWF0ZSkgdGhpcy4kYmFja2Ryb3BbMF0ub2Zmc2V0V2lkdGggLy8gZm9yY2UgcmVmbG93XG5cbiAgICAgIHRoaXMuJGJhY2tkcm9wLmFkZENsYXNzKCdpbicpXG5cbiAgICAgIGlmICghY2FsbGJhY2spIHJldHVyblxuXG4gICAgICBkb0FuaW1hdGUgP1xuICAgICAgICB0aGlzLiRiYWNrZHJvcFxuICAgICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGNhbGxiYWNrKVxuICAgICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChNb2RhbC5CQUNLRFJPUF9UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XG4gICAgICAgIGNhbGxiYWNrKClcblxuICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNTaG93biAmJiB0aGlzLiRiYWNrZHJvcCkge1xuICAgICAgdGhpcy4kYmFja2Ryb3AucmVtb3ZlQ2xhc3MoJ2luJylcblxuICAgICAgdmFyIGNhbGxiYWNrUmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGF0LnJlbW92ZUJhY2tkcm9wKClcbiAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soKVxuICAgICAgfVxuICAgICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZmFkZScpID9cbiAgICAgICAgdGhpcy4kYmFja2Ryb3BcbiAgICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBjYWxsYmFja1JlbW92ZSlcbiAgICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoTW9kYWwuQkFDS0RST1BfVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgICBjYWxsYmFja1JlbW92ZSgpXG5cbiAgICB9IGVsc2UgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjaygpXG4gICAgfVxuICB9XG5cbiAgLy8gdGhlc2UgZm9sbG93aW5nIG1ldGhvZHMgYXJlIHVzZWQgdG8gaGFuZGxlIG92ZXJmbG93aW5nIG1vZGFsc1xuXG4gIE1vZGFsLnByb3RvdHlwZS5oYW5kbGVVcGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hZGp1c3REaWFsb2coKVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLmFkanVzdERpYWxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbW9kYWxJc092ZXJmbG93aW5nID0gdGhpcy4kZWxlbWVudFswXS5zY3JvbGxIZWlnaHQgPiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0XG5cbiAgICB0aGlzLiRlbGVtZW50LmNzcyh7XG4gICAgICBwYWRkaW5nTGVmdDogICF0aGlzLmJvZHlJc092ZXJmbG93aW5nICYmIG1vZGFsSXNPdmVyZmxvd2luZyA/IHRoaXMuc2Nyb2xsYmFyV2lkdGggOiAnJyxcbiAgICAgIHBhZGRpbmdSaWdodDogdGhpcy5ib2R5SXNPdmVyZmxvd2luZyAmJiAhbW9kYWxJc092ZXJmbG93aW5nID8gdGhpcy5zY3JvbGxiYXJXaWR0aCA6ICcnXG4gICAgfSlcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5yZXNldEFkanVzdG1lbnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuJGVsZW1lbnQuY3NzKHtcbiAgICAgIHBhZGRpbmdMZWZ0OiAnJyxcbiAgICAgIHBhZGRpbmdSaWdodDogJydcbiAgICB9KVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLmNoZWNrU2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmdWxsV2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIGlmICghZnVsbFdpbmRvd1dpZHRoKSB7IC8vIHdvcmthcm91bmQgZm9yIG1pc3Npbmcgd2luZG93LmlubmVyV2lkdGggaW4gSUU4XG4gICAgICB2YXIgZG9jdW1lbnRFbGVtZW50UmVjdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgZnVsbFdpbmRvd1dpZHRoID0gZG9jdW1lbnRFbGVtZW50UmVjdC5yaWdodCAtIE1hdGguYWJzKGRvY3VtZW50RWxlbWVudFJlY3QubGVmdClcbiAgICB9XG4gICAgdGhpcy5ib2R5SXNPdmVyZmxvd2luZyA9IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGggPCBmdWxsV2luZG93V2lkdGhcbiAgICB0aGlzLnNjcm9sbGJhcldpZHRoID0gdGhpcy5tZWFzdXJlU2Nyb2xsYmFyKClcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5zZXRTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGJvZHlQYWQgPSBwYXJzZUludCgodGhpcy4kYm9keS5jc3MoJ3BhZGRpbmctcmlnaHQnKSB8fCAwKSwgMTApXG4gICAgdGhpcy5vcmlnaW5hbEJvZHlQYWQgPSBkb2N1bWVudC5ib2R5LnN0eWxlLnBhZGRpbmdSaWdodCB8fCAnJ1xuICAgIGlmICh0aGlzLmJvZHlJc092ZXJmbG93aW5nKSB0aGlzLiRib2R5LmNzcygncGFkZGluZy1yaWdodCcsIGJvZHlQYWQgKyB0aGlzLnNjcm9sbGJhcldpZHRoKVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLnJlc2V0U2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuJGJvZHkuY3NzKCdwYWRkaW5nLXJpZ2h0JywgdGhpcy5vcmlnaW5hbEJvZHlQYWQpXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUubWVhc3VyZVNjcm9sbGJhciA9IGZ1bmN0aW9uICgpIHsgLy8gdGh4IHdhbHNoXG4gICAgdmFyIHNjcm9sbERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgc2Nyb2xsRGl2LmNsYXNzTmFtZSA9ICdtb2RhbC1zY3JvbGxiYXItbWVhc3VyZSdcbiAgICB0aGlzLiRib2R5LmFwcGVuZChzY3JvbGxEaXYpXG4gICAgdmFyIHNjcm9sbGJhcldpZHRoID0gc2Nyb2xsRGl2Lm9mZnNldFdpZHRoIC0gc2Nyb2xsRGl2LmNsaWVudFdpZHRoXG4gICAgdGhpcy4kYm9keVswXS5yZW1vdmVDaGlsZChzY3JvbGxEaXYpXG4gICAgcmV0dXJuIHNjcm9sbGJhcldpZHRoXG4gIH1cblxuXG4gIC8vIE1PREFMIFBMVUdJTiBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbiwgX3JlbGF0ZWRUYXJnZXQpIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5tb2RhbCcpXG4gICAgICB2YXIgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBNb2RhbC5ERUZBVUxUUywgJHRoaXMuZGF0YSgpLCB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvbilcblxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5tb2RhbCcsIChkYXRhID0gbmV3IE1vZGFsKHRoaXMsIG9wdGlvbnMpKSlcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oX3JlbGF0ZWRUYXJnZXQpXG4gICAgICBlbHNlIGlmIChvcHRpb25zLnNob3cpIGRhdGEuc2hvdyhfcmVsYXRlZFRhcmdldClcbiAgICB9KVxuICB9XG5cbiAgdmFyIG9sZCA9ICQuZm4ubW9kYWxcblxuICAkLmZuLm1vZGFsICAgICAgICAgICAgID0gUGx1Z2luXG4gICQuZm4ubW9kYWwuQ29uc3RydWN0b3IgPSBNb2RhbFxuXG5cbiAgLy8gTU9EQUwgTk8gQ09ORkxJQ1RcbiAgLy8gPT09PT09PT09PT09PT09PT1cblxuICAkLmZuLm1vZGFsLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi5tb2RhbCA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuXG4gIC8vIE1PREFMIERBVEEtQVBJXG4gIC8vID09PT09PT09PT09PT09XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLmJzLm1vZGFsLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cIm1vZGFsXCJdJywgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcbiAgICB2YXIgaHJlZiAgICA9ICR0aGlzLmF0dHIoJ2hyZWYnKVxuICAgIHZhciAkdGFyZ2V0ID0gJCgkdGhpcy5hdHRyKCdkYXRhLXRhcmdldCcpIHx8IChocmVmICYmIGhyZWYucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLywgJycpKSkgLy8gc3RyaXAgZm9yIGllN1xuICAgIHZhciBvcHRpb24gID0gJHRhcmdldC5kYXRhKCdicy5tb2RhbCcpID8gJ3RvZ2dsZScgOiAkLmV4dGVuZCh7IHJlbW90ZTogIS8jLy50ZXN0KGhyZWYpICYmIGhyZWYgfSwgJHRhcmdldC5kYXRhKCksICR0aGlzLmRhdGEoKSlcblxuICAgIGlmICgkdGhpcy5pcygnYScpKSBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICR0YXJnZXQub25lKCdzaG93LmJzLm1vZGFsJywgZnVuY3Rpb24gKHNob3dFdmVudCkge1xuICAgICAgaWYgKHNob3dFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuIC8vIG9ubHkgcmVnaXN0ZXIgZm9jdXMgcmVzdG9yZXIgaWYgbW9kYWwgd2lsbCBhY3R1YWxseSBnZXQgc2hvd25cbiAgICAgICR0YXJnZXQub25lKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICR0aGlzLmlzKCc6dmlzaWJsZScpICYmICR0aGlzLnRyaWdnZXIoJ2ZvY3VzJylcbiAgICAgIH0pXG4gICAgfSlcbiAgICBQbHVnaW4uY2FsbCgkdGFyZ2V0LCBvcHRpb24sIHRoaXMpXG4gIH0pXG5cbn0oalF1ZXJ5KTtcbiIsIi8qIVxuICogSmF2YVNjcmlwdCBDb29raWUgdjIuMi4wXG4gKiBodHRwczovL2dpdGh1Yi5jb20vanMtY29va2llL2pzLWNvb2tpZVxuICpcbiAqIENvcHlyaWdodCAyMDA2LCAyMDE1IEtsYXVzIEhhcnRsICYgRmFnbmVyIEJyYWNrXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuOyhmdW5jdGlvbiAoZmFjdG9yeSkge1xuXHR2YXIgcmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyID0gZmFsc2U7XG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoZmFjdG9yeSk7XG5cdFx0cmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyID0gdHJ1ZTtcblx0fVxuXHRpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdFx0cmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyID0gdHJ1ZTtcblx0fVxuXHRpZiAoIXJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlcikge1xuXHRcdHZhciBPbGRDb29raWVzID0gd2luZG93LkNvb2tpZXM7XG5cdFx0dmFyIGFwaSA9IHdpbmRvdy5Db29raWVzID0gZmFjdG9yeSgpO1xuXHRcdGFwaS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0d2luZG93LkNvb2tpZXMgPSBPbGRDb29raWVzO1xuXHRcdFx0cmV0dXJuIGFwaTtcblx0XHR9O1xuXHR9XG59KGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gZXh0ZW5kICgpIHtcblx0XHR2YXIgaSA9IDA7XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgYXR0cmlidXRlcyA9IGFyZ3VtZW50c1sgaSBdO1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIGF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0cmVzdWx0W2tleV0gPSBhdHRyaWJ1dGVzW2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRmdW5jdGlvbiBpbml0IChjb252ZXJ0ZXIpIHtcblx0XHRmdW5jdGlvbiBhcGkgKGtleSwgdmFsdWUsIGF0dHJpYnV0ZXMpIHtcblx0XHRcdHZhciByZXN1bHQ7XG5cdFx0XHRpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIFdyaXRlXG5cblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRhdHRyaWJ1dGVzID0gZXh0ZW5kKHtcblx0XHRcdFx0XHRwYXRoOiAnLydcblx0XHRcdFx0fSwgYXBpLmRlZmF1bHRzLCBhdHRyaWJ1dGVzKTtcblxuXHRcdFx0XHRpZiAodHlwZW9mIGF0dHJpYnV0ZXMuZXhwaXJlcyA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0XHR2YXIgZXhwaXJlcyA9IG5ldyBEYXRlKCk7XG5cdFx0XHRcdFx0ZXhwaXJlcy5zZXRNaWxsaXNlY29uZHMoZXhwaXJlcy5nZXRNaWxsaXNlY29uZHMoKSArIGF0dHJpYnV0ZXMuZXhwaXJlcyAqIDg2NGUrNSk7XG5cdFx0XHRcdFx0YXR0cmlidXRlcy5leHBpcmVzID0gZXhwaXJlcztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFdlJ3JlIHVzaW5nIFwiZXhwaXJlc1wiIGJlY2F1c2UgXCJtYXgtYWdlXCIgaXMgbm90IHN1cHBvcnRlZCBieSBJRVxuXHRcdFx0XHRhdHRyaWJ1dGVzLmV4cGlyZXMgPSBhdHRyaWJ1dGVzLmV4cGlyZXMgPyBhdHRyaWJ1dGVzLmV4cGlyZXMudG9VVENTdHJpbmcoKSA6ICcnO1xuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0cmVzdWx0ID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuXHRcdFx0XHRcdGlmICgvXltcXHtcXFtdLy50ZXN0KHJlc3VsdCkpIHtcblx0XHRcdFx0XHRcdHZhbHVlID0gcmVzdWx0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZSkge31cblxuXHRcdFx0XHRpZiAoIWNvbnZlcnRlci53cml0ZSkge1xuXHRcdFx0XHRcdHZhbHVlID0gZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyh2YWx1ZSkpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnwzQXwzQ3wzRXwzRHwyRnwzRnw0MHw1Qnw1RHw1RXw2MHw3Qnw3RHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGNvbnZlcnRlci53cml0ZSh2YWx1ZSwga2V5KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGtleSA9IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcoa2V5KSk7XG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC8lKDIzfDI0fDI2fDJCfDVFfDYwfDdDKS9nLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvW1xcKFxcKV0vZywgZXNjYXBlKTtcblxuXHRcdFx0XHR2YXIgc3RyaW5naWZpZWRBdHRyaWJ1dGVzID0gJyc7XG5cblx0XHRcdFx0Zm9yICh2YXIgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdFx0aWYgKCFhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c3RyaW5naWZpZWRBdHRyaWJ1dGVzICs9ICc7ICcgKyBhdHRyaWJ1dGVOYW1lO1xuXHRcdFx0XHRcdGlmIChhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c3RyaW5naWZpZWRBdHRyaWJ1dGVzICs9ICc9JyArIGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIChkb2N1bWVudC5jb29raWUgPSBrZXkgKyAnPScgKyB2YWx1ZSArIHN0cmluZ2lmaWVkQXR0cmlidXRlcyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFJlYWRcblxuXHRcdFx0aWYgKCFrZXkpIHtcblx0XHRcdFx0cmVzdWx0ID0ge307XG5cdFx0XHR9XG5cblx0XHRcdC8vIFRvIHByZXZlbnQgdGhlIGZvciBsb29wIGluIHRoZSBmaXJzdCBwbGFjZSBhc3NpZ24gYW4gZW1wdHkgYXJyYXlcblx0XHRcdC8vIGluIGNhc2UgdGhlcmUgYXJlIG5vIGNvb2tpZXMgYXQgYWxsLiBBbHNvIHByZXZlbnRzIG9kZCByZXN1bHQgd2hlblxuXHRcdFx0Ly8gY2FsbGluZyBcImdldCgpXCJcblx0XHRcdHZhciBjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7ICcpIDogW107XG5cdFx0XHR2YXIgcmRlY29kZSA9IC8oJVswLTlBLVpdezJ9KSsvZztcblx0XHRcdHZhciBpID0gMDtcblxuXHRcdFx0Zm9yICg7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBwYXJ0cyA9IGNvb2tpZXNbaV0uc3BsaXQoJz0nKTtcblx0XHRcdFx0dmFyIGNvb2tpZSA9IHBhcnRzLnNsaWNlKDEpLmpvaW4oJz0nKTtcblxuXHRcdFx0XHRpZiAoIXRoaXMuanNvbiAmJiBjb29raWUuY2hhckF0KDApID09PSAnXCInKSB7XG5cdFx0XHRcdFx0Y29va2llID0gY29va2llLnNsaWNlKDEsIC0xKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0dmFyIG5hbWUgPSBwYXJ0c1swXS5yZXBsYWNlKHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdFx0XHRcdFx0Y29va2llID0gY29udmVydGVyLnJlYWQgP1xuXHRcdFx0XHRcdFx0Y29udmVydGVyLnJlYWQoY29va2llLCBuYW1lKSA6IGNvbnZlcnRlcihjb29raWUsIG5hbWUpIHx8XG5cdFx0XHRcdFx0XHRjb29raWUucmVwbGFjZShyZGVjb2RlLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXG5cdFx0XHRcdFx0aWYgKHRoaXMuanNvbikge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0Y29va2llID0gSlNPTi5wYXJzZShjb29raWUpO1xuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge31cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoa2V5ID09PSBuYW1lKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgPSBjb29raWU7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIWtleSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0W25hbWVdID0gY29va2llO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZSkge31cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cblx0XHRhcGkuc2V0ID0gYXBpO1xuXHRcdGFwaS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRyZXR1cm4gYXBpLmNhbGwoYXBpLCBrZXkpO1xuXHRcdH07XG5cdFx0YXBpLmdldEpTT04gPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gYXBpLmFwcGx5KHtcblx0XHRcdFx0anNvbjogdHJ1ZVxuXHRcdFx0fSwgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcblx0XHR9O1xuXHRcdGFwaS5kZWZhdWx0cyA9IHt9O1xuXG5cdFx0YXBpLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXksIGF0dHJpYnV0ZXMpIHtcblx0XHRcdGFwaShrZXksICcnLCBleHRlbmQoYXR0cmlidXRlcywge1xuXHRcdFx0XHRleHBpcmVzOiAtMVxuXHRcdFx0fSkpO1xuXHRcdH07XG5cblx0XHRhcGkud2l0aENvbnZlcnRlciA9IGluaXQ7XG5cblx0XHRyZXR1cm4gYXBpO1xuXHR9XG5cblx0cmV0dXJuIGluaXQoZnVuY3Rpb24gKCkge30pO1xufSkpO1xuIiwiIWZ1bmN0aW9uKGUpe3ZhciB0O2UuZm4uc2xpbmt5PWZ1bmN0aW9uKGEpe3ZhciBzPWUuZXh0ZW5kKHtsYWJlbDpcIkJhY2tcIix0aXRsZTohMSxzcGVlZDozMDAscmVzaXplOiEwfSxhKSxpPWUodGhpcyksbj1pLmNoaWxkcmVuKCkuZmlyc3QoKTtpLmFkZENsYXNzKFwic2xpbmt5LW1lbnVcIik7dmFyIHI9ZnVuY3Rpb24oZSx0KXt2YXIgYT1NYXRoLnJvdW5kKHBhcnNlSW50KG4uZ2V0KDApLnN0eWxlLmxlZnQpKXx8MDtuLmNzcyhcImxlZnRcIixhLTEwMCplK1wiJVwiKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiB0JiZzZXRUaW1lb3V0KHQscy5zcGVlZCl9LGw9ZnVuY3Rpb24oZSl7aS5oZWlnaHQoZS5vdXRlckhlaWdodCgpKX0sZD1mdW5jdGlvbihlKXtpLmNzcyhcInRyYW5zaXRpb24tZHVyYXRpb25cIixlK1wibXNcIiksbi5jc3MoXCJ0cmFuc2l0aW9uLWR1cmF0aW9uXCIsZStcIm1zXCIpfTtpZihkKHMuc3BlZWQpLGUoXCJhICsgdWxcIixpKS5wcmV2KCkuYWRkQ2xhc3MoXCJuZXh0XCIpLGUoXCJsaSA+IHVsXCIsaSkucHJlcGVuZCgnPGxpIGNsYXNzPVwiaGVhZGVyXCI+Jykscy50aXRsZT09PSEwJiZlKFwibGkgPiB1bFwiLGkpLmVhY2goZnVuY3Rpb24oKXt2YXIgdD1lKHRoaXMpLnBhcmVudCgpLmZpbmQoXCJhXCIpLmZpcnN0KCkudGV4dCgpLGE9ZShcIjxoMj5cIikudGV4dCh0KTtlKFwiPiAuaGVhZGVyXCIsdGhpcykuYXBwZW5kKGEpfSkscy50aXRsZXx8cy5sYWJlbCE9PSEwKXt2YXIgbz1lKFwiPGE+XCIpLnRleHQocy5sYWJlbCkucHJvcChcImhyZWZcIixcIiNcIikuYWRkQ2xhc3MoXCJiYWNrXCIpO2UoXCIuaGVhZGVyXCIsaSkuYXBwZW5kKG8pfWVsc2UgZShcImxpID4gdWxcIixpKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIHQ9ZSh0aGlzKS5wYXJlbnQoKS5maW5kKFwiYVwiKS5maXJzdCgpLnRleHQoKSxhPWUoXCI8YT5cIikudGV4dCh0KS5wcm9wKFwiaHJlZlwiLFwiI1wiKS5hZGRDbGFzcyhcImJhY2tcIik7ZShcIj4gLmhlYWRlclwiLHRoaXMpLmFwcGVuZChhKX0pO2UoXCJhXCIsaSkub24oXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2lmKCEodCtzLnNwZWVkPkRhdGUubm93KCkpKXt0PURhdGUubm93KCk7dmFyIG49ZSh0aGlzKTsvIy8udGVzdCh0aGlzLmhyZWYpJiZhLnByZXZlbnREZWZhdWx0KCksbi5oYXNDbGFzcyhcIm5leHRcIik/KGkuZmluZChcIi5hY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIiksbi5uZXh0KCkuc2hvdygpLmFkZENsYXNzKFwiYWN0aXZlXCIpLHIoMSkscy5yZXNpemUmJmwobi5uZXh0KCkpKTpuLmhhc0NsYXNzKFwiYmFja1wiKSYmKHIoLTEsZnVuY3Rpb24oKXtpLmZpbmQoXCIuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLG4ucGFyZW50KCkucGFyZW50KCkuaGlkZSgpLnBhcmVudHNVbnRpbChpLFwidWxcIikuZmlyc3QoKS5hZGRDbGFzcyhcImFjdGl2ZVwiKX0pLHMucmVzaXplJiZsKG4ucGFyZW50KCkucGFyZW50KCkucGFyZW50c1VudGlsKGksXCJ1bFwiKSkpfX0pLHRoaXMuanVtcD1mdW5jdGlvbih0LGEpe3Q9ZSh0KTt2YXIgbj1pLmZpbmQoXCIuYWN0aXZlXCIpO249bi5sZW5ndGg+MD9uLnBhcmVudHNVbnRpbChpLFwidWxcIikubGVuZ3RoOjAsaS5maW5kKFwidWxcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIikuaGlkZSgpO3ZhciBvPXQucGFyZW50c1VudGlsKGksXCJ1bFwiKTtvLnNob3coKSx0LnNob3coKS5hZGRDbGFzcyhcImFjdGl2ZVwiKSxhPT09ITEmJmQoMCkscihvLmxlbmd0aC1uKSxzLnJlc2l6ZSYmbCh0KSxhPT09ITEmJmQocy5zcGVlZCl9LHRoaXMuaG9tZT1mdW5jdGlvbih0KXt0PT09ITEmJmQoMCk7dmFyIGE9aS5maW5kKFwiLmFjdGl2ZVwiKSxuPWEucGFyZW50c1VudGlsKGksXCJsaVwiKS5sZW5ndGg7bj4wJiYocigtbixmdW5jdGlvbigpe2EucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIil9KSxzLnJlc2l6ZSYmbChlKGEucGFyZW50c1VudGlsKGksXCJsaVwiKS5nZXQobi0xKSkucGFyZW50KCkpKSx0PT09ITEmJmQocy5zcGVlZCl9LHRoaXMuZGVzdHJveT1mdW5jdGlvbigpe2UoXCIuaGVhZGVyXCIsaSkucmVtb3ZlKCksZShcImFcIixpKS5yZW1vdmVDbGFzcyhcIm5leHRcIikub2ZmKFwiY2xpY2tcIiksaS5yZW1vdmVDbGFzcyhcInNsaW5reS1tZW51XCIpLmNzcyhcInRyYW5zaXRpb24tZHVyYXRpb25cIixcIlwiKSxuLmNzcyhcInRyYW5zaXRpb24tZHVyYXRpb25cIixcIlwiKX07dmFyIGM9aS5maW5kKFwiLmFjdGl2ZVwiKTtyZXR1cm4gYy5sZW5ndGg+MCYmKGMucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIiksdGhpcy5qdW1wKGMsITEpKSx0aGlzfX0oalF1ZXJ5KTsiLCIvLyB8LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIHwgTGF5b3V0XG4vLyB8LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIHxcbi8vIHwgVGhpcyBqUXVlcnkgc2NyaXB0IGlzIHdyaXR0ZW4gYnlcbi8vIHxcbi8vIHwgTW9ydGVuIE5pc3NlblxuLy8gfCBoamVtbWVzaWRla29uZ2VuLmRrXG4vLyB8XG52YXIgbGF5b3V0ID0gKGZ1bmN0aW9uICgkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIHB1YiA9IHt9LFxuICAgICAgICAkbGF5b3V0X19oZWFkZXIgPSAkKCcubGF5b3V0X19oZWFkZXInKSxcbiAgICAgICAgJGxheW91dF9fZG9jdW1lbnQgPSAkKCcubGF5b3V0X19kb2N1bWVudCcpLFxuICAgICAgICBsYXlvdXRfY2xhc3NlcyA9IHtcbiAgICAgICAgICAgICdsYXlvdXRfX3dyYXBwZXInOiAnLmxheW91dF9fd3JhcHBlcicsXG4gICAgICAgICAgICAnbGF5b3V0X19kcmF3ZXInOiAnLmxheW91dF9fZHJhd2VyJyxcbiAgICAgICAgICAgICdsYXlvdXRfX2hlYWRlcic6ICcubGF5b3V0X19oZWFkZXInLFxuICAgICAgICAgICAgJ2xheW91dF9fb2JmdXNjYXRvcic6ICcubGF5b3V0X19vYmZ1c2NhdG9yJyxcbiAgICAgICAgICAgICdsYXlvdXRfX2RvY3VtZW50JzogJy5sYXlvdXRfX2RvY3VtZW50JyxcblxuICAgICAgICAgICAgJ3dyYXBwZXJfaXNfdXBncmFkZWQnOiAnaXMtdXBncmFkZWQnLFxuICAgICAgICAgICAgJ3dyYXBwZXJfaGFzX2RyYXdlcic6ICdoYXMtZHJhd2VyJyxcbiAgICAgICAgICAgICd3cmFwcGVyX2hhc19zY3JvbGxpbmdfaGVhZGVyJzogJ2hhcy1zY3JvbGxpbmctaGVhZGVyJyxcbiAgICAgICAgICAgICdoZWFkZXJfc2Nyb2xsJzogJ2xheW91dF9faGVhZGVyLS1zY3JvbGwnLFxuICAgICAgICAgICAgJ2hlYWRlcl9pc19jb21wYWN0JzogJ2lzLWNvbXBhY3QnLFxuICAgICAgICAgICAgJ2hlYWRlcl93YXRlcmZhbGwnOiAnbGF5b3V0X19oZWFkZXItLXdhdGVyZmFsbCcsXG4gICAgICAgICAgICAnZHJhd2VyX2lzX3Zpc2libGUnOiAnaXMtdmlzaWJsZScsXG4gICAgICAgICAgICAnb2JmdXNjYXRvcl9pc192aXNpYmxlJzogJ2lzLXZpc2libGUnXG4gICAgICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBJbnN0YW50aWF0ZVxuICAgICAqL1xuICAgIHB1Yi5pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgcmVnaXN0ZXJFdmVudEhhbmRsZXJzKCk7XG4gICAgICAgIHJlZ2lzdGVyQm9vdEV2ZW50SGFuZGxlcnMoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgYm9vdCBldmVudCBoYW5kbGVyc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlZ2lzdGVyQm9vdEV2ZW50SGFuZGxlcnMoKSB7XG5cbiAgICAgICAgLy8gQWRkIGNsYXNzZXMgdG8gZWxlbWVudHNcbiAgICAgICAgYWRkRWxlbWVudENsYXNzZXMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBldmVudCBoYW5kbGVyc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlZ2lzdGVyRXZlbnRIYW5kbGVycygpIHtcblxuICAgICAgICAvLyBUb2dnbGUgZHJhd2VyXG4gICAgICAgICQoJ1tkYXRhLXRvZ2dsZS1kcmF3ZXJdJykuYWRkKCQobGF5b3V0X2NsYXNzZXMubGF5b3V0X19vYmZ1c2NhdG9yKSkub24oJ2NsaWNrIHRvdWNoc3RhcnQnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHZhciAkZWxlbWVudCA9ICQodGhpcyk7XG5cbiAgICAgICAgICAgIHRvZ2dsZURyYXdlcigkZWxlbWVudCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFdhdGVyZmFsbCBoZWFkZXJcbiAgICAgICAgaWYgKCRsYXlvdXRfX2hlYWRlci5oYXNDbGFzcyhsYXlvdXRfY2xhc3Nlcy5oZWFkZXJfd2F0ZXJmYWxsKSkge1xuXG4gICAgICAgICAgICAkbGF5b3V0X19kb2N1bWVudC5vbigndG91Y2htb3ZlIHNjcm9sbCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyICRkb2N1bWVudCA9ICQodGhpcyk7XG5cbiAgICAgICAgICAgICAgICB3YXRlcmZhbGxIZWFkZXIoJGRvY3VtZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIGRyYXdlclxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRvZ2dsZURyYXdlcigkZWxlbWVudCkge1xuICAgICAgICB2YXIgJHdyYXBwZXIgPSAkZWxlbWVudC5jbG9zZXN0KGxheW91dF9jbGFzc2VzLmxheW91dF9fd3JhcHBlciksXG4gICAgICAgICAgICAkb2JmdXNjYXRvciA9ICR3cmFwcGVyLmNoaWxkcmVuKGxheW91dF9jbGFzc2VzLmxheW91dF9fb2JmdXNjYXRvciksXG4gICAgICAgICAgICAkZHJhd2VyID0gJHdyYXBwZXIuY2hpbGRyZW4obGF5b3V0X2NsYXNzZXMubGF5b3V0X19kcmF3ZXIpO1xuXG4gICAgICAgIC8vIFRvZ2dsZSB2aXNpYmxlIHN0YXRlXG4gICAgICAgICRvYmZ1c2NhdG9yLnRvZ2dsZUNsYXNzKGxheW91dF9jbGFzc2VzLm9iZnVzY2F0b3JfaXNfdmlzaWJsZSk7XG4gICAgICAgICRkcmF3ZXIudG9nZ2xlQ2xhc3MobGF5b3V0X2NsYXNzZXMuZHJhd2VyX2lzX3Zpc2libGUpO1xuXG4gICAgICAgIC8vIEFsdGVyIGFyaWEtaGlkZGVuIHN0YXR1c1xuICAgICAgICAkZHJhd2VyLmF0dHIoJ2FyaWEtaGlkZGVuJywgKCRkcmF3ZXIuaGFzQ2xhc3MobGF5b3V0X2NsYXNzZXMuZHJhd2VyX2lzX3Zpc2libGUpKSA/IGZhbHNlIDogdHJ1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2F0ZXJmYWxsIGhlYWRlclxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHdhdGVyZmFsbEhlYWRlcigkZG9jdW1lbnQpIHtcbiAgICAgICAgdmFyICR3cmFwcGVyID0gJGRvY3VtZW50LmNsb3Nlc3QobGF5b3V0X2NsYXNzZXMubGF5b3V0X193cmFwcGVyKSxcbiAgICAgICAgICAgICRoZWFkZXIgPSAkd3JhcHBlci5jaGlsZHJlbihsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX2hlYWRlciksXG4gICAgICAgICAgICBkaXN0YW5jZSA9ICRkb2N1bWVudC5zY3JvbGxUb3AoKTtcblxuICAgICAgICBpZiAoZGlzdGFuY2UgPiAwKSB7XG4gICAgICAgICAgICAkaGVhZGVyLmFkZENsYXNzKGxheW91dF9jbGFzc2VzLmhlYWRlcl9pc19jb21wYWN0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICRoZWFkZXIucmVtb3ZlQ2xhc3MobGF5b3V0X2NsYXNzZXMuaGVhZGVyX2lzX2NvbXBhY3QpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGNsYXNzZXMgdG8gZWxlbWVudHMsIGJhc2VkIG9uIGF0dGFjaGVkIGNsYXNzZXNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhZGRFbGVtZW50Q2xhc3NlcygpIHtcblxuICAgICAgICAkKGxheW91dF9jbGFzc2VzLmxheW91dF9fd3JhcHBlcikuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyICR3cmFwcGVyID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAkaGVhZGVyID0gJHdyYXBwZXIuY2hpbGRyZW4obGF5b3V0X2NsYXNzZXMubGF5b3V0X19oZWFkZXIpLFxuICAgICAgICAgICAgICAgICRkcmF3ZXIgPSAkd3JhcHBlci5jaGlsZHJlbihsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX2RyYXdlcik7XG5cbiAgICAgICAgICAgIC8vIFNjcm9sbCBoZWFkZXJcbiAgICAgICAgICAgIGlmICgkaGVhZGVyLmhhc0NsYXNzKGxheW91dF9jbGFzc2VzLmhlYWRlcl9zY3JvbGwpKSB7XG4gICAgICAgICAgICAgICAgJHdyYXBwZXIuYWRkQ2xhc3MobGF5b3V0X2NsYXNzZXMud3JhcHBlcl9oYXNfc2Nyb2xsaW5nX2hlYWRlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIERyYXdlclxuICAgICAgICAgICAgaWYgKCRkcmF3ZXIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICR3cmFwcGVyLmFkZENsYXNzKGxheW91dF9jbGFzc2VzLndyYXBwZXJfaGFzX2RyYXdlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVwZ3JhZGVkXG4gICAgICAgICAgICBpZiAoJHdyYXBwZXIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICR3cmFwcGVyLmFkZENsYXNzKGxheW91dF9jbGFzc2VzLndyYXBwZXJfaXNfdXBncmFkZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHViO1xufSkoalF1ZXJ5KTtcbiIsIi8vIERvY3VtZW50IHJlYWR5XG4oZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIEVuYWJsZSBsYXlvdXRcbiAgbGF5b3V0LmluaXQoKTtcblxuICAvLyBTbGlua3lcbiAgJCgnLnNsaW5reS1tZW51JylcbiAgICAgIC5maW5kKCd1bCwgbGksIGEnKVxuICAgICAgLnJlbW92ZUNsYXNzKCk7XG5cbiAgJCgnLnJlZ2lvbi1tb2JpbGUtaGVhZGVyLW5hdmlnYXRpb24gLnNsaW5reS1tZW51Jykuc2xpbmt5KHtcbiAgICB0aXRsZTogdHJ1ZSxcbiAgICBsYWJlbDogJydcbiAgfSk7XG5cbiAgLy8gTm90aWZ5XG4gIHZhciAkbm90aWZpY2F0aW9ucyA9ICQoJy5ub3RpZnknKTtcbiAgaWYgKCRub3RpZmljYXRpb25zLmxlbmd0aCkge1xuXG4gICAgJG5vdGlmaWNhdGlvbnMuZWFjaChmdW5jdGlvbihpbmRleCwgdmFsKSB7XG4gICAgICB2YXIgJGRvY3VtZW50ID0gJCgnLmxheW91dF9fZG9jdW1lbnQnKSxcbiAgICAgICAgICAkcmVnaW9uID0gJCgnLnJlZ2lvbi1ub3RpZnknKSxcbiAgICAgICAgICAkZWxlbWVudCA9ICQodGhpcyksXG4gICAgICAgICAgY29va2llX2lkID0gJ25vdGlmeV9pZF8nICsgJGVsZW1lbnQuYXR0cignaWQnKSxcbiAgICAgICAgICAkY2xvc2UgPSAkZWxlbWVudC5maW5kKCcubm90aWZ5X19jbG9zZScpO1xuXG4gICAgICAvLyBGbGV4IG1hZ2ljIC0gZml4aW5nIGRpc3BsYXk6IGJsb2NrIG9uIGZhZGVJbiAoc2VlOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yODkwNDY5OC9ob3ctZmFkZS1pbi1hLWZsZXgtYm94KVxuICAgICAgJGVsZW1lbnQuY3NzKCdkaXNwbGF5JywgJ2ZsZXgnKS5oaWRlKCk7XG5cbiAgICAgIC8vIE5vIGNvb2tpZSBoYXMgYmVlbiBzZXQgeWV0XG4gICAgICBpZiAoISBDb29raWVzLmdldChjb29raWVfaWQpKSB7XG5cbiAgICAgICAgLy8gRmFkZSB0aGUgZWxlbWVudCBpblxuICAgICAgICAkZWxlbWVudFxuICAgICAgICAgICAgLmRlbGF5KDIwMDApXG4gICAgICAgICAgICAuZmFkZUluKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gJHJlZ2lvbi5vdXRlckhlaWdodCh0cnVlKTtcblxuICAgICAgICAgICAgICAkZG9jdW1lbnQuY3NzKCdwYWRkaW5nLWJvdHRvbScsIGhlaWdodCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2xvc2VkXG4gICAgICAkY2xvc2Uub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgJGVsZW1lbnQuZmFkZU91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAkZG9jdW1lbnQuY3NzKCdwYWRkaW5nLWJvdHRvbScsIDApO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBTZXQgYSBjb29raWUsIHRvIHN0b3AgdGhpcyBub3RpZmljYXRpb24gZnJvbSBiZWluZyBkaXNwbGF5ZWQgYWdhaW5cbiAgICAgICAgQ29va2llcy5zZXQoY29va2llX2lkLCB0cnVlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgJChcIiN0b2dnbGVfbW9iaWxlX21lbnVcIikuY2xpY2soZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgJCgnI21haW4tbWVudScpLnRvZ2dsZUNsYXNzKCdtb2JpbGUtbWVudS1vcGVuJyk7XG4gICAgJCgnLmxheW91dF9fZG9jdW1lbnQnKS50b2dnbGVDbGFzcygnbW9iaWxlLW1lbnUtb3BlbicpO1xuICB9KTtcblxuICAvL1Nob3cgc2VhcmNoIGZvcm0gYmxvY2tcbiAgJChcIi5zZWFyY2gtYnV0dG9uXCIpLmNsaWNrKGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmICgkKFwiI3NlYXJjaC1mb3JtLXBvcG92ZXJcIikuaGFzQ2xhc3MoXCJoaWRkZW5cIikpIHtcbiAgICAgICQoXCIjc2VhcmNoLWZvcm0tcG9wb3ZlclwiKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKFwiLmZvcm0tY29udHJvbFwiKS5mb2N1cygpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy9IaWRlIHNlYXJjaCBmb3JtIGJsb2NrXG4gICQoZG9jdW1lbnQpLmNsaWNrKGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmICghJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJyNzZWFyY2gtZm9ybS1wb3BvdmVyJykubGVuZ3RoICYmICEkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnNlYXJjaC1idXR0b24nKS5sZW5ndGgpIHtcbiAgICAgIGlmICghJChcIiNzZWFyY2gtZm9ybS1wb3BvdmVyXCIpLmhhc0NsYXNzKFwiaGlkZGVuXCIpKSB7XG4gICAgICAgICQoXCIjc2VhcmNoLWZvcm0tcG9wb3ZlclwiKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAvL0ltcHJvdmluZyB1c2FiaWxpdHkgZm9yIG1lbnVkcm9wZG93bnMgZm9yIG1vYmlsZSBkZXZpY2VzXG4gIGlmICghISgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpKSB7Ly9jaGVjayBmb3IgdG91Y2ggZGV2aWNlXG4gICAgJCgnbGkuZHJvcGRvd24ubGF5b3V0LW5hdmlnYXRpb25fX2Ryb3Bkb3duJykuZmluZCgnPiBhJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgIGlmICgkKHRoaXMpLnBhcmVudCgpLmhhc0NsYXNzKFwiZXhwYW5kZWRcIikpIHtcbiAgICAgICAgLy8kKHRoaXMpLnBhcmVudCgpLnJlbW92ZUNsYXNzKFwiZXhwYW5kZWRcIik7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmFkZENsYXNzKFwiZXhwYW5kZWRcIik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgZWxzZSB7Ly9rZWVwaW5nIGl0IGNvbXBhdGlibGUgd2l0aCBkZXNrdG9wIGRldmljZXNcbiAgICAkKCdsaS5kcm9wZG93bi5sYXlvdXQtbmF2aWdhdGlvbl9fZHJvcGRvd24nKS5ob3ZlcihcbiAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKFwiZXhwYW5kZWRcIik7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImV4cGFuZGVkXCIpO1xuICAgICAgICB9XG4gICAgKTtcbiAgfVxuXG4gICQoJy5tb2RhbC1jbG9zZS0tdGhpcy1tb2RhbC1vbmx5Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgJGVsZW1lbnQgPSAkKHRoaXMpLFxuICAgICAgICAkbW9kYWwgPSAkZWxlbWVudC5wYXJlbnRzKCcubW9kYWwnKS5maXJzdCgpO1xuXG4gICAgJG1vZGFsLm1vZGFsKCdoaWRlJyk7XG5cbiAgICAkbW9kYWwub24oJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgIGlmICggISAkKCdib2R5JykuaGFzQ2xhc3MoJ21vZGFsLW9wZW4nKSkge1xuICAgICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ21vZGFsLW9wZW4nKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gVG9nZ2xlclxuICAkKCdbZGF0YS10b2dnbGVyXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciAkZWxlbWVudCA9ICQodGhpcyksXG4gICAgICAgIHRhcmdldCA9ICRlbGVtZW50LmF0dHIoJ2RhdGEtdG9nZ2xlcicpLFxuICAgICAgICAkcGFyZW50ID0gJGVsZW1lbnQucGFyZW50cygnLnRvZ2dsZXInKSxcbiAgICAgICAgJHRhcmdldCA9ICRwYXJlbnQuZmluZCh0YXJnZXQpLFxuICAgICAgICAkYWxsX3RvZ2dsZV9idXR0b25zID0gJHBhcmVudC5maW5kKCdbZGF0YS10b2dnbGVyXScpLFxuICAgICAgICAkdG9nZ2xlX2J1dHRvbiA9ICRwYXJlbnQuZmluZCgnW2RhdGEtdG9nZ2xlcj1cIicgKyB0YXJnZXQgKyAnXCJdJyksXG4gICAgICAgICRhbGxfY29udGVudCA9ICRwYXJlbnQuZmluZCgnLnRvZ2dsZXJfX2NvbnRlbnQnKTtcblxuICAgIC8vIFJlbW92ZSBhbGwgYWN0aXZlIHRvZ2dsZXJzXG4gICAgJGFsbF90b2dnbGVfYnV0dG9uc1xuICAgICAgICAucGFyZW50KClcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcblxuICAgICRhbGxfY29udGVudC5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cbiAgICAvLyBTaG93XG4gICAgJHRvZ2dsZV9idXR0b24ucGFyZW50KCkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICR0YXJnZXQuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICB9KTtcblxuICAkKFwiLnRvZ2dsZXJcIikuZWFjaChmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICQodGhpcykuZmluZCgnLnRvZ2dsZXJfX2J1dHRvbicpLmZpcnN0KCkudHJpZ2dlcignY2xpY2snKTtcbiAgfSk7XG5cbn0pKGpRdWVyeSk7XG4iXX0=
