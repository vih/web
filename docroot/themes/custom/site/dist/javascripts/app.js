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
        $element.fadeOut();

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
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhYi5qcyIsImNvbGxhcHNlLmpzIiwidHJhbnNpdGlvbi5qcyIsInRvb2x0aXAuanMiLCJwb3BvdmVyLmpzIiwibW9kYWwuanMiLCJqcy5jb29raWUuanMiLCJsYXlvdXQuanMiLCJhcHAuanMiXSwibmFtZXMiOlsiJCIsIlRhYiIsImVsZW1lbnQiLCJWRVJTSU9OIiwiVFJBTlNJVElPTl9EVVJBVElPTiIsInByb3RvdHlwZSIsInNob3ciLCIkdGhpcyIsIiR1bCIsImNsb3Nlc3QiLCJzZWxlY3RvciIsImRhdGEiLCJhdHRyIiwicmVwbGFjZSIsInBhcmVudCIsImhhc0NsYXNzIiwiJHByZXZpb3VzIiwiZmluZCIsImhpZGVFdmVudCIsIkV2ZW50IiwicmVsYXRlZFRhcmdldCIsInNob3dFdmVudCIsInRyaWdnZXIiLCJpc0RlZmF1bHRQcmV2ZW50ZWQiLCIkdGFyZ2V0IiwiYWN0aXZhdGUiLCJ0eXBlIiwiY29udGFpbmVyIiwiY2FsbGJhY2siLCIkYWN0aXZlIiwidHJhbnNpdGlvbiIsInN1cHBvcnQiLCJsZW5ndGgiLCJuZXh0IiwicmVtb3ZlQ2xhc3MiLCJlbmQiLCJhZGRDbGFzcyIsIm9mZnNldFdpZHRoIiwib25lIiwiZW11bGF0ZVRyYW5zaXRpb25FbmQiLCJQbHVnaW4iLCJvcHRpb24iLCJlYWNoIiwib2xkIiwiZm4iLCJ0YWIiLCJDb25zdHJ1Y3RvciIsIm5vQ29uZmxpY3QiLCJjbGlja0hhbmRsZXIiLCJlIiwicHJldmVudERlZmF1bHQiLCJjYWxsIiwiZG9jdW1lbnQiLCJvbiIsImpRdWVyeSIsIkNvbGxhcHNlIiwib3B0aW9ucyIsIiRlbGVtZW50IiwiZXh0ZW5kIiwiREVGQVVMVFMiLCIkdHJpZ2dlciIsImlkIiwidHJhbnNpdGlvbmluZyIsIiRwYXJlbnQiLCJnZXRQYXJlbnQiLCJhZGRBcmlhQW5kQ29sbGFwc2VkQ2xhc3MiLCJ0b2dnbGUiLCJkaW1lbnNpb24iLCJoYXNXaWR0aCIsImFjdGl2ZXNEYXRhIiwiYWN0aXZlcyIsImNoaWxkcmVuIiwic3RhcnRFdmVudCIsImNvbXBsZXRlIiwic2Nyb2xsU2l6ZSIsImNhbWVsQ2FzZSIsImpvaW4iLCJwcm94eSIsImhpZGUiLCJvZmZzZXRIZWlnaHQiLCJpIiwiZ2V0VGFyZ2V0RnJvbVRyaWdnZXIiLCJpc09wZW4iLCJ0b2dnbGVDbGFzcyIsImhyZWYiLCJ0YXJnZXQiLCJ0ZXN0IiwiY29sbGFwc2UiLCJ0cmFuc2l0aW9uRW5kIiwiZWwiLCJjcmVhdGVFbGVtZW50IiwidHJhbnNFbmRFdmVudE5hbWVzIiwiV2Via2l0VHJhbnNpdGlvbiIsIk1velRyYW5zaXRpb24iLCJPVHJhbnNpdGlvbiIsIm5hbWUiLCJzdHlsZSIsInVuZGVmaW5lZCIsImR1cmF0aW9uIiwiY2FsbGVkIiwiJGVsIiwic2V0VGltZW91dCIsImV2ZW50Iiwic3BlY2lhbCIsImJzVHJhbnNpdGlvbkVuZCIsImJpbmRUeXBlIiwiZGVsZWdhdGVUeXBlIiwiaGFuZGxlIiwiaXMiLCJoYW5kbGVPYmoiLCJoYW5kbGVyIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJUb29sdGlwIiwiZW5hYmxlZCIsInRpbWVvdXQiLCJob3ZlclN0YXRlIiwiaW5TdGF0ZSIsImluaXQiLCJhbmltYXRpb24iLCJwbGFjZW1lbnQiLCJ0ZW1wbGF0ZSIsInRpdGxlIiwiZGVsYXkiLCJodG1sIiwidmlld3BvcnQiLCJwYWRkaW5nIiwiZ2V0T3B0aW9ucyIsIiR2aWV3cG9ydCIsImlzRnVuY3Rpb24iLCJjbGljayIsImhvdmVyIiwiZm9jdXMiLCJjb25zdHJ1Y3RvciIsIkVycm9yIiwidHJpZ2dlcnMiLCJzcGxpdCIsImV2ZW50SW4iLCJldmVudE91dCIsImVudGVyIiwibGVhdmUiLCJfb3B0aW9ucyIsImZpeFRpdGxlIiwiZ2V0RGVmYXVsdHMiLCJnZXREZWxlZ2F0ZU9wdGlvbnMiLCJkZWZhdWx0cyIsImtleSIsInZhbHVlIiwib2JqIiwic2VsZiIsImN1cnJlbnRUYXJnZXQiLCJ0aXAiLCJjbGVhclRpbWVvdXQiLCJpc0luU3RhdGVUcnVlIiwiaGFzQ29udGVudCIsImluRG9tIiwiY29udGFpbnMiLCJvd25lckRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwidGhhdCIsIiR0aXAiLCJ0aXBJZCIsImdldFVJRCIsInNldENvbnRlbnQiLCJhdXRvVG9rZW4iLCJhdXRvUGxhY2UiLCJkZXRhY2giLCJjc3MiLCJ0b3AiLCJsZWZ0IiwiZGlzcGxheSIsImFwcGVuZFRvIiwiaW5zZXJ0QWZ0ZXIiLCJwb3MiLCJnZXRQb3NpdGlvbiIsImFjdHVhbFdpZHRoIiwiYWN0dWFsSGVpZ2h0Iiwib3JnUGxhY2VtZW50Iiwidmlld3BvcnREaW0iLCJib3R0b20iLCJyaWdodCIsIndpZHRoIiwiY2FsY3VsYXRlZE9mZnNldCIsImdldENhbGN1bGF0ZWRPZmZzZXQiLCJhcHBseVBsYWNlbWVudCIsInByZXZIb3ZlclN0YXRlIiwib2Zmc2V0IiwiaGVpZ2h0IiwibWFyZ2luVG9wIiwicGFyc2VJbnQiLCJtYXJnaW5MZWZ0IiwiaXNOYU4iLCJzZXRPZmZzZXQiLCJ1c2luZyIsInByb3BzIiwiTWF0aCIsInJvdW5kIiwiZGVsdGEiLCJnZXRWaWV3cG9ydEFkanVzdGVkRGVsdGEiLCJpc1ZlcnRpY2FsIiwiYXJyb3dEZWx0YSIsImFycm93T2Zmc2V0UG9zaXRpb24iLCJyZXBsYWNlQXJyb3ciLCJhcnJvdyIsImdldFRpdGxlIiwicmVtb3ZlQXR0ciIsIiRlIiwiaXNCb2R5IiwidGFnTmFtZSIsImVsUmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImlzU3ZnIiwid2luZG93IiwiU1ZHRWxlbWVudCIsImVsT2Zmc2V0Iiwic2Nyb2xsIiwic2Nyb2xsVG9wIiwiYm9keSIsIm91dGVyRGltcyIsInZpZXdwb3J0UGFkZGluZyIsInZpZXdwb3J0RGltZW5zaW9ucyIsInRvcEVkZ2VPZmZzZXQiLCJib3R0b21FZGdlT2Zmc2V0IiwibGVmdEVkZ2VPZmZzZXQiLCJyaWdodEVkZ2VPZmZzZXQiLCJvIiwicHJlZml4IiwicmFuZG9tIiwiZ2V0RWxlbWVudEJ5SWQiLCIkYXJyb3ciLCJlbmFibGUiLCJkaXNhYmxlIiwidG9nZ2xlRW5hYmxlZCIsImRlc3Ryb3kiLCJvZmYiLCJyZW1vdmVEYXRhIiwidG9vbHRpcCIsIlBvcG92ZXIiLCJjb250ZW50IiwiZ2V0Q29udGVudCIsInBvcG92ZXIiLCJNb2RhbCIsIiRib2R5IiwiJGRpYWxvZyIsIiRiYWNrZHJvcCIsImlzU2hvd24iLCJvcmlnaW5hbEJvZHlQYWQiLCJzY3JvbGxiYXJXaWR0aCIsImlnbm9yZUJhY2tkcm9wQ2xpY2siLCJyZW1vdGUiLCJsb2FkIiwiQkFDS0RST1BfVFJBTlNJVElPTl9EVVJBVElPTiIsImJhY2tkcm9wIiwia2V5Ym9hcmQiLCJfcmVsYXRlZFRhcmdldCIsImNoZWNrU2Nyb2xsYmFyIiwic2V0U2Nyb2xsYmFyIiwiZXNjYXBlIiwicmVzaXplIiwiYWRqdXN0RGlhbG9nIiwiZW5mb3JjZUZvY3VzIiwiaGlkZU1vZGFsIiwiaGFzIiwid2hpY2giLCJoYW5kbGVVcGRhdGUiLCJyZXNldEFkanVzdG1lbnRzIiwicmVzZXRTY3JvbGxiYXIiLCJyZW1vdmVCYWNrZHJvcCIsInJlbW92ZSIsImFuaW1hdGUiLCJkb0FuaW1hdGUiLCJjYWxsYmFja1JlbW92ZSIsIm1vZGFsSXNPdmVyZmxvd2luZyIsInNjcm9sbEhlaWdodCIsImNsaWVudEhlaWdodCIsInBhZGRpbmdMZWZ0IiwiYm9keUlzT3ZlcmZsb3dpbmciLCJwYWRkaW5nUmlnaHQiLCJmdWxsV2luZG93V2lkdGgiLCJpbm5lcldpZHRoIiwiZG9jdW1lbnRFbGVtZW50UmVjdCIsImFicyIsImNsaWVudFdpZHRoIiwibWVhc3VyZVNjcm9sbGJhciIsImJvZHlQYWQiLCJzY3JvbGxEaXYiLCJjbGFzc05hbWUiLCJhcHBlbmQiLCJyZW1vdmVDaGlsZCIsIm1vZGFsIiwiZmFjdG9yeSIsInJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciIsImRlZmluZSIsImFtZCIsImV4cG9ydHMiLCJtb2R1bGUiLCJPbGRDb29raWVzIiwiQ29va2llcyIsImFwaSIsInJlc3VsdCIsImF0dHJpYnV0ZXMiLCJjb252ZXJ0ZXIiLCJwYXRoIiwiZXhwaXJlcyIsIkRhdGUiLCJzZXRNaWxsaXNlY29uZHMiLCJnZXRNaWxsaXNlY29uZHMiLCJ0b1VUQ1N0cmluZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJ3cml0ZSIsImVuY29kZVVSSUNvbXBvbmVudCIsIlN0cmluZyIsImRlY29kZVVSSUNvbXBvbmVudCIsInN0cmluZ2lmaWVkQXR0cmlidXRlcyIsImF0dHJpYnV0ZU5hbWUiLCJjb29raWUiLCJjb29raWVzIiwicmRlY29kZSIsInBhcnRzIiwic2xpY2UiLCJqc29uIiwiY2hhckF0IiwicmVhZCIsInBhcnNlIiwic2V0IiwiZ2V0IiwiZ2V0SlNPTiIsIndpdGhDb252ZXJ0ZXIiLCJsYXlvdXQiLCJwdWIiLCIkbGF5b3V0X19oZWFkZXIiLCIkbGF5b3V0X19kb2N1bWVudCIsImxheW91dF9jbGFzc2VzIiwicmVnaXN0ZXJFdmVudEhhbmRsZXJzIiwicmVnaXN0ZXJCb290RXZlbnRIYW5kbGVycyIsImFkZEVsZW1lbnRDbGFzc2VzIiwiYWRkIiwibGF5b3V0X19vYmZ1c2NhdG9yIiwidG9nZ2xlRHJhd2VyIiwiaGVhZGVyX3dhdGVyZmFsbCIsIiRkb2N1bWVudCIsIndhdGVyZmFsbEhlYWRlciIsIiR3cmFwcGVyIiwibGF5b3V0X193cmFwcGVyIiwiJG9iZnVzY2F0b3IiLCIkZHJhd2VyIiwibGF5b3V0X19kcmF3ZXIiLCJvYmZ1c2NhdG9yX2lzX3Zpc2libGUiLCJkcmF3ZXJfaXNfdmlzaWJsZSIsIiRoZWFkZXIiLCJsYXlvdXRfX2hlYWRlciIsImRpc3RhbmNlIiwiaGVhZGVyX2lzX2NvbXBhY3QiLCJpbmRleCIsImhlYWRlcl9zY3JvbGwiLCJ3cmFwcGVyX2hhc19zY3JvbGxpbmdfaGVhZGVyIiwid3JhcHBlcl9oYXNfZHJhd2VyIiwid3JhcHBlcl9pc191cGdyYWRlZCIsIiRub3RpZmljYXRpb25zIiwidmFsIiwiJHJlZ2lvbiIsImNvb2tpZV9pZCIsIiRjbG9zZSIsImZhZGVJbiIsIm91dGVySGVp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QUFqQixDQUEwQixVQUExQixDQUFKLEVBQTJDO0FBQ3pDO0FBQ0QsT0FGRCxNQUdLO0FBQ0hrQyxVQUFFQyxjQUFGO0FBQ0FsRCxVQUFFLElBQUYsRUFBUWMsTUFBUixHQUFpQnNCLFFBQWpCLENBQTBCLFVBQTFCO0FBQ0Q7QUFDRixLQVJEO0FBU0QsR0FWRCxNQVdLO0FBQUM7QUFDSnBDLE1BQUUseUNBQUYsRUFBNkNtSSxLQUE3QyxDQUNJLFVBQVVsRixDQUFWLEVBQWE7QUFDWGpELFFBQUUsSUFBRixFQUFRb0MsUUFBUixDQUFpQixVQUFqQjtBQUNELEtBSEwsRUFHTyxVQUFVYSxDQUFWLEVBQWE7QUFDZGpELFFBQUUsSUFBRixFQUFRa0MsV0FBUixDQUFvQixVQUFwQjtBQUNELEtBTEw7QUFPRDtBQUVGLENBdkZELEVBdUZHb0IsTUF2RkgiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBCb290c3RyYXA6IHRhYi5qcyB2My4zLjdcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI3RhYnNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuK2Z1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBUQUIgQ0xBU1MgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBUYWIgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIC8vIGpzY3M6ZGlzYWJsZSByZXF1aXJlRG9sbGFyQmVmb3JlalF1ZXJ5QXNzaWdubWVudFxuICAgIHRoaXMuZWxlbWVudCA9ICQoZWxlbWVudClcbiAgICAvLyBqc2NzOmVuYWJsZSByZXF1aXJlRG9sbGFyQmVmb3JlalF1ZXJ5QXNzaWdubWVudFxuICB9XG5cbiAgVGFiLlZFUlNJT04gPSAnMy4zLjcnXG5cbiAgVGFiLlRSQU5TSVRJT05fRFVSQVRJT04gPSAxNTBcblxuICBUYWIucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICR0aGlzICAgID0gdGhpcy5lbGVtZW50XG4gICAgdmFyICR1bCAgICAgID0gJHRoaXMuY2xvc2VzdCgndWw6bm90KC5kcm9wZG93bi1tZW51KScpXG4gICAgdmFyIHNlbGVjdG9yID0gJHRoaXMuZGF0YSgndGFyZ2V0JylcblxuICAgIGlmICghc2VsZWN0b3IpIHtcbiAgICAgIHNlbGVjdG9yID0gJHRoaXMuYXR0cignaHJlZicpXG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yICYmIHNlbGVjdG9yLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sICcnKSAvLyBzdHJpcCBmb3IgaWU3XG4gICAgfVxuXG4gICAgaWYgKCR0aGlzLnBhcmVudCgnbGknKS5oYXNDbGFzcygnYWN0aXZlJykpIHJldHVyblxuXG4gICAgdmFyICRwcmV2aW91cyA9ICR1bC5maW5kKCcuYWN0aXZlOmxhc3QgYScpXG4gICAgdmFyIGhpZGVFdmVudCA9ICQuRXZlbnQoJ2hpZGUuYnMudGFiJywge1xuICAgICAgcmVsYXRlZFRhcmdldDogJHRoaXNbMF1cbiAgICB9KVxuICAgIHZhciBzaG93RXZlbnQgPSAkLkV2ZW50KCdzaG93LmJzLnRhYicsIHtcbiAgICAgIHJlbGF0ZWRUYXJnZXQ6ICRwcmV2aW91c1swXVxuICAgIH0pXG5cbiAgICAkcHJldmlvdXMudHJpZ2dlcihoaWRlRXZlbnQpXG4gICAgJHRoaXMudHJpZ2dlcihzaG93RXZlbnQpXG5cbiAgICBpZiAoc2hvd0V2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpIHx8IGhpZGVFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICB2YXIgJHRhcmdldCA9ICQoc2VsZWN0b3IpXG5cbiAgICB0aGlzLmFjdGl2YXRlKCR0aGlzLmNsb3Nlc3QoJ2xpJyksICR1bClcbiAgICB0aGlzLmFjdGl2YXRlKCR0YXJnZXQsICR0YXJnZXQucGFyZW50KCksIGZ1bmN0aW9uICgpIHtcbiAgICAgICRwcmV2aW91cy50cmlnZ2VyKHtcbiAgICAgICAgdHlwZTogJ2hpZGRlbi5icy50YWInLFxuICAgICAgICByZWxhdGVkVGFyZ2V0OiAkdGhpc1swXVxuICAgICAgfSlcbiAgICAgICR0aGlzLnRyaWdnZXIoe1xuICAgICAgICB0eXBlOiAnc2hvd24uYnMudGFiJyxcbiAgICAgICAgcmVsYXRlZFRhcmdldDogJHByZXZpb3VzWzBdXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBUYWIucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRhaW5lciwgY2FsbGJhY2spIHtcbiAgICB2YXIgJGFjdGl2ZSAgICA9IGNvbnRhaW5lci5maW5kKCc+IC5hY3RpdmUnKVxuICAgIHZhciB0cmFuc2l0aW9uID0gY2FsbGJhY2tcbiAgICAgICYmICQuc3VwcG9ydC50cmFuc2l0aW9uXG4gICAgICAmJiAoJGFjdGl2ZS5sZW5ndGggJiYgJGFjdGl2ZS5oYXNDbGFzcygnZmFkZScpIHx8ICEhY29udGFpbmVyLmZpbmQoJz4gLmZhZGUnKS5sZW5ndGgpXG5cbiAgICBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgJGFjdGl2ZVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgIC5maW5kKCc+IC5kcm9wZG93bi1tZW51ID4gLmFjdGl2ZScpXG4gICAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICAuZW5kKClcbiAgICAgICAgLmZpbmQoJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXScpXG4gICAgICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSlcblxuICAgICAgZWxlbWVudFxuICAgICAgICAuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgIC5maW5kKCdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nKVxuICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcblxuICAgICAgaWYgKHRyYW5zaXRpb24pIHtcbiAgICAgICAgZWxlbWVudFswXS5vZmZzZXRXaWR0aCAvLyByZWZsb3cgZm9yIHRyYW5zaXRpb25cbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaW4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnZmFkZScpXG4gICAgICB9XG5cbiAgICAgIGlmIChlbGVtZW50LnBhcmVudCgnLmRyb3Bkb3duLW1lbnUnKS5sZW5ndGgpIHtcbiAgICAgICAgZWxlbWVudFxuICAgICAgICAgIC5jbG9zZXN0KCdsaS5kcm9wZG93bicpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICAgLmVuZCgpXG4gICAgICAgICAgLmZpbmQoJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXScpXG4gICAgICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXG4gICAgICB9XG5cbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKClcbiAgICB9XG5cbiAgICAkYWN0aXZlLmxlbmd0aCAmJiB0cmFuc2l0aW9uID9cbiAgICAgICRhY3RpdmVcbiAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgbmV4dClcbiAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKFRhYi5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XG4gICAgICBuZXh0KClcblxuICAgICRhY3RpdmUucmVtb3ZlQ2xhc3MoJ2luJylcbiAgfVxuXG5cbiAgLy8gVEFCIFBMVUdJTiBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcylcbiAgICAgIHZhciBkYXRhICA9ICR0aGlzLmRhdGEoJ2JzLnRhYicpXG5cbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMudGFiJywgKGRhdGEgPSBuZXcgVGFiKHRoaXMpKSlcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxuICAgIH0pXG4gIH1cblxuICB2YXIgb2xkID0gJC5mbi50YWJcblxuICAkLmZuLnRhYiAgICAgICAgICAgICA9IFBsdWdpblxuICAkLmZuLnRhYi5Db25zdHJ1Y3RvciA9IFRhYlxuXG5cbiAgLy8gVEFCIE5PIENPTkZMSUNUXG4gIC8vID09PT09PT09PT09PT09PVxuXG4gICQuZm4udGFiLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi50YWIgPSBvbGRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cblxuICAvLyBUQUIgREFUQS1BUElcbiAgLy8gPT09PT09PT09PT09XG5cbiAgdmFyIGNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgUGx1Z2luLmNhbGwoJCh0aGlzKSwgJ3Nob3cnKVxuICB9XG5cbiAgJChkb2N1bWVudClcbiAgICAub24oJ2NsaWNrLmJzLnRhYi5kYXRhLWFwaScsICdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nLCBjbGlja0hhbmRsZXIpXG4gICAgLm9uKCdjbGljay5icy50YWIuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwicGlsbFwiXScsIGNsaWNrSGFuZGxlcilcblxufShqUXVlcnkpO1xuIiwiLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBCb290c3RyYXA6IGNvbGxhcHNlLmpzIHYzLjMuN1xuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jY29sbGFwc2VcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbi8qIGpzaGludCBsYXRlZGVmOiBmYWxzZSAqL1xuXG4rZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIENPTExBUFNFIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgdmFyIENvbGxhcHNlID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ICAgICAgPSAkKGVsZW1lbnQpXG4gICAgdGhpcy5vcHRpb25zICAgICAgID0gJC5leHRlbmQoe30sIENvbGxhcHNlLkRFRkFVTFRTLCBvcHRpb25zKVxuICAgIHRoaXMuJHRyaWdnZXIgICAgICA9ICQoJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdW2hyZWY9XCIjJyArIGVsZW1lbnQuaWQgKyAnXCJdLCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdW2RhdGEtdGFyZ2V0PVwiIycgKyBlbGVtZW50LmlkICsgJ1wiXScpXG4gICAgdGhpcy50cmFuc2l0aW9uaW5nID0gbnVsbFxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5wYXJlbnQpIHtcbiAgICAgIHRoaXMuJHBhcmVudCA9IHRoaXMuZ2V0UGFyZW50KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hZGRBcmlhQW5kQ29sbGFwc2VkQ2xhc3ModGhpcy4kZWxlbWVudCwgdGhpcy4kdHJpZ2dlcilcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnRvZ2dsZSkgdGhpcy50b2dnbGUoKVxuICB9XG5cbiAgQ29sbGFwc2UuVkVSU0lPTiAgPSAnMy4zLjcnXG5cbiAgQ29sbGFwc2UuVFJBTlNJVElPTl9EVVJBVElPTiA9IDM1MFxuXG4gIENvbGxhcHNlLkRFRkFVTFRTID0ge1xuICAgIHRvZ2dsZTogdHJ1ZVxuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLmRpbWVuc2lvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaGFzV2lkdGggPSB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCd3aWR0aCcpXG4gICAgcmV0dXJuIGhhc1dpZHRoID8gJ3dpZHRoJyA6ICdoZWlnaHQnXG4gIH1cblxuICBDb2xsYXBzZS5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy50cmFuc2l0aW9uaW5nIHx8IHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJykpIHJldHVyblxuXG4gICAgdmFyIGFjdGl2ZXNEYXRhXG4gICAgdmFyIGFjdGl2ZXMgPSB0aGlzLiRwYXJlbnQgJiYgdGhpcy4kcGFyZW50LmNoaWxkcmVuKCcucGFuZWwnKS5jaGlsZHJlbignLmluLCAuY29sbGFwc2luZycpXG5cbiAgICBpZiAoYWN0aXZlcyAmJiBhY3RpdmVzLmxlbmd0aCkge1xuICAgICAgYWN0aXZlc0RhdGEgPSBhY3RpdmVzLmRhdGEoJ2JzLmNvbGxhcHNlJylcbiAgICAgIGlmIChhY3RpdmVzRGF0YSAmJiBhY3RpdmVzRGF0YS50cmFuc2l0aW9uaW5nKSByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgc3RhcnRFdmVudCA9ICQuRXZlbnQoJ3Nob3cuYnMuY29sbGFwc2UnKVxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihzdGFydEV2ZW50KVxuICAgIGlmIChzdGFydEV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgIGlmIChhY3RpdmVzICYmIGFjdGl2ZXMubGVuZ3RoKSB7XG4gICAgICBQbHVnaW4uY2FsbChhY3RpdmVzLCAnaGlkZScpXG4gICAgICBhY3RpdmVzRGF0YSB8fCBhY3RpdmVzLmRhdGEoJ2JzLmNvbGxhcHNlJywgbnVsbClcbiAgICB9XG5cbiAgICB2YXIgZGltZW5zaW9uID0gdGhpcy5kaW1lbnNpb24oKVxuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzZScpXG4gICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNpbmcnKVtkaW1lbnNpb25dKDApXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXG5cbiAgICB0aGlzLiR0cmlnZ2VyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlZCcpXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXG5cbiAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSAxXG5cbiAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2luZycpXG4gICAgICAgIC5hZGRDbGFzcygnY29sbGFwc2UgaW4nKVtkaW1lbnNpb25dKCcnKVxuICAgICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMFxuICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAudHJpZ2dlcignc2hvd24uYnMuY29sbGFwc2UnKVxuICAgIH1cblxuICAgIGlmICghJC5zdXBwb3J0LnRyYW5zaXRpb24pIHJldHVybiBjb21wbGV0ZS5jYWxsKHRoaXMpXG5cbiAgICB2YXIgc2Nyb2xsU2l6ZSA9ICQuY2FtZWxDYXNlKFsnc2Nyb2xsJywgZGltZW5zaW9uXS5qb2luKCctJykpXG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCAkLnByb3h5KGNvbXBsZXRlLCB0aGlzKSlcbiAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChDb2xsYXBzZS5UUkFOU0lUSU9OX0RVUkFUSU9OKVtkaW1lbnNpb25dKHRoaXMuJGVsZW1lbnRbMF1bc2Nyb2xsU2l6ZV0pXG4gIH1cblxuICBDb2xsYXBzZS5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy50cmFuc2l0aW9uaW5nIHx8ICF0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpbicpKSByZXR1cm5cblxuICAgIHZhciBzdGFydEV2ZW50ID0gJC5FdmVudCgnaGlkZS5icy5jb2xsYXBzZScpXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKHN0YXJ0RXZlbnQpXG4gICAgaWYgKHN0YXJ0RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxuXG4gICAgdmFyIGRpbWVuc2lvbiA9IHRoaXMuZGltZW5zaW9uKClcblxuICAgIHRoaXMuJGVsZW1lbnRbZGltZW5zaW9uXSh0aGlzLiRlbGVtZW50W2RpbWVuc2lvbl0oKSlbMF0ub2Zmc2V0SGVpZ2h0XG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNpbmcnKVxuICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzZSBpbicpXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKVxuXG4gICAgdGhpcy4kdHJpZ2dlclxuICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZWQnKVxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSlcblxuICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDFcblxuICAgIHZhciBjb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDBcbiAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzaW5nJylcbiAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZScpXG4gICAgICAgIC50cmlnZ2VyKCdoaWRkZW4uYnMuY29sbGFwc2UnKVxuICAgIH1cblxuICAgIGlmICghJC5zdXBwb3J0LnRyYW5zaXRpb24pIHJldHVybiBjb21wbGV0ZS5jYWxsKHRoaXMpXG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICBbZGltZW5zaW9uXSgwKVxuICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgJC5wcm94eShjb21wbGV0ZSwgdGhpcykpXG4gICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoQ29sbGFwc2UuVFJBTlNJVElPTl9EVVJBVElPTilcbiAgfVxuXG4gIENvbGxhcHNlLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpc1t0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpbicpID8gJ2hpZGUnIDogJ3Nob3cnXSgpXG4gIH1cblxuICBDb2xsYXBzZS5wcm90b3R5cGUuZ2V0UGFyZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAkKHRoaXMub3B0aW9ucy5wYXJlbnQpXG4gICAgICAuZmluZCgnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl1bZGF0YS1wYXJlbnQ9XCInICsgdGhpcy5vcHRpb25zLnBhcmVudCArICdcIl0nKVxuICAgICAgLmVhY2goJC5wcm94eShmdW5jdGlvbiAoaSwgZWxlbWVudCkge1xuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpXG4gICAgICAgIHRoaXMuYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzKGdldFRhcmdldEZyb21UcmlnZ2VyKCRlbGVtZW50KSwgJGVsZW1lbnQpXG4gICAgICB9LCB0aGlzKSlcbiAgICAgIC5lbmQoKVxuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLmFkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyA9IGZ1bmN0aW9uICgkZWxlbWVudCwgJHRyaWdnZXIpIHtcbiAgICB2YXIgaXNPcGVuID0gJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJylcblxuICAgICRlbGVtZW50LmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBpc09wZW4pXG4gICAgJHRyaWdnZXJcbiAgICAgIC50b2dnbGVDbGFzcygnY29sbGFwc2VkJywgIWlzT3BlbilcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgaXNPcGVuKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VGFyZ2V0RnJvbVRyaWdnZXIoJHRyaWdnZXIpIHtcbiAgICB2YXIgaHJlZlxuICAgIHZhciB0YXJnZXQgPSAkdHJpZ2dlci5hdHRyKCdkYXRhLXRhcmdldCcpXG4gICAgICB8fCAoaHJlZiA9ICR0cmlnZ2VyLmF0dHIoJ2hyZWYnKSkgJiYgaHJlZi5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLCAnJykgLy8gc3RyaXAgZm9yIGllN1xuXG4gICAgcmV0dXJuICQodGFyZ2V0KVxuICB9XG5cblxuICAvLyBDT0xMQVBTRSBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5jb2xsYXBzZScpXG4gICAgICB2YXIgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBDb2xsYXBzZS5ERUZBVUxUUywgJHRoaXMuZGF0YSgpLCB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvbilcblxuICAgICAgaWYgKCFkYXRhICYmIG9wdGlvbnMudG9nZ2xlICYmIC9zaG93fGhpZGUvLnRlc3Qob3B0aW9uKSkgb3B0aW9ucy50b2dnbGUgPSBmYWxzZVxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5jb2xsYXBzZScsIChkYXRhID0gbmV3IENvbGxhcHNlKHRoaXMsIG9wdGlvbnMpKSlcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxuICAgIH0pXG4gIH1cblxuICB2YXIgb2xkID0gJC5mbi5jb2xsYXBzZVxuXG4gICQuZm4uY29sbGFwc2UgICAgICAgICAgICAgPSBQbHVnaW5cbiAgJC5mbi5jb2xsYXBzZS5Db25zdHJ1Y3RvciA9IENvbGxhcHNlXG5cblxuICAvLyBDT0xMQVBTRSBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxuXG4gICQuZm4uY29sbGFwc2Uubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLmNvbGxhcHNlID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAgLy8gQ09MTEFQU0UgREFUQS1BUElcbiAgLy8gPT09PT09PT09PT09PT09PT1cblxuICAkKGRvY3VtZW50KS5vbignY2xpY2suYnMuY29sbGFwc2UuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl0nLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuXG4gICAgaWYgKCEkdGhpcy5hdHRyKCdkYXRhLXRhcmdldCcpKSBlLnByZXZlbnREZWZhdWx0KClcblxuICAgIHZhciAkdGFyZ2V0ID0gZ2V0VGFyZ2V0RnJvbVRyaWdnZXIoJHRoaXMpXG4gICAgdmFyIGRhdGEgICAgPSAkdGFyZ2V0LmRhdGEoJ2JzLmNvbGxhcHNlJylcbiAgICB2YXIgb3B0aW9uICA9IGRhdGEgPyAndG9nZ2xlJyA6ICR0aGlzLmRhdGEoKVxuXG4gICAgUGx1Z2luLmNhbGwoJHRhcmdldCwgb3B0aW9uKVxuICB9KVxuXG59KGpRdWVyeSk7XG4iLCIvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEJvb3RzdHJhcDogdHJhbnNpdGlvbi5qcyB2My4zLjdcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI3RyYW5zaXRpb25zXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbitmdW5jdGlvbiAoJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gQ1NTIFRSQU5TSVRJT04gU1VQUE9SVCAoU2hvdXRvdXQ6IGh0dHA6Ly93d3cubW9kZXJuaXpyLmNvbS8pXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIHRyYW5zaXRpb25FbmQoKSB7XG4gICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYm9vdHN0cmFwJylcblxuICAgIHZhciB0cmFuc0VuZEV2ZW50TmFtZXMgPSB7XG4gICAgICBXZWJraXRUcmFuc2l0aW9uIDogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxuICAgICAgTW96VHJhbnNpdGlvbiAgICA6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgIE9UcmFuc2l0aW9uICAgICAgOiAnb1RyYW5zaXRpb25FbmQgb3RyYW5zaXRpb25lbmQnLFxuICAgICAgdHJhbnNpdGlvbiAgICAgICA6ICd0cmFuc2l0aW9uZW5kJ1xuICAgIH1cblxuICAgIGZvciAodmFyIG5hbWUgaW4gdHJhbnNFbmRFdmVudE5hbWVzKSB7XG4gICAgICBpZiAoZWwuc3R5bGVbbmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4geyBlbmQ6IHRyYW5zRW5kRXZlbnROYW1lc1tuYW1lXSB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlIC8vIGV4cGxpY2l0IGZvciBpZTggKCAgLl8uKVxuICB9XG5cbiAgLy8gaHR0cDovL2Jsb2cuYWxleG1hY2Nhdy5jb20vY3NzLXRyYW5zaXRpb25zXG4gICQuZm4uZW11bGF0ZVRyYW5zaXRpb25FbmQgPSBmdW5jdGlvbiAoZHVyYXRpb24pIHtcbiAgICB2YXIgY2FsbGVkID0gZmFsc2VcbiAgICB2YXIgJGVsID0gdGhpc1xuICAgICQodGhpcykub25lKCdic1RyYW5zaXRpb25FbmQnLCBmdW5jdGlvbiAoKSB7IGNhbGxlZCA9IHRydWUgfSlcbiAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7IGlmICghY2FsbGVkKSAkKCRlbCkudHJpZ2dlcigkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQpIH1cbiAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCBkdXJhdGlvbilcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgJChmdW5jdGlvbiAoKSB7XG4gICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gPSB0cmFuc2l0aW9uRW5kKClcblxuICAgIGlmICghJC5zdXBwb3J0LnRyYW5zaXRpb24pIHJldHVyblxuXG4gICAgJC5ldmVudC5zcGVjaWFsLmJzVHJhbnNpdGlvbkVuZCA9IHtcbiAgICAgIGJpbmRUeXBlOiAkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsXG4gICAgICBkZWxlZ2F0ZVR5cGU6ICQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxcbiAgICAgIGhhbmRsZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKCQoZS50YXJnZXQpLmlzKHRoaXMpKSByZXR1cm4gZS5oYW5kbGVPYmouaGFuZGxlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG59KGpRdWVyeSk7XG4iLCIvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEJvb3RzdHJhcDogdG9vbHRpcC5qcyB2My4zLjdcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI3Rvb2x0aXBcbiAqIEluc3BpcmVkIGJ5IHRoZSBvcmlnaW5hbCBqUXVlcnkudGlwc3kgYnkgSmFzb24gRnJhbWVcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuK2Z1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBUT09MVElQIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgVG9vbHRpcCA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy50eXBlICAgICAgID0gbnVsbFxuICAgIHRoaXMub3B0aW9ucyAgICA9IG51bGxcbiAgICB0aGlzLmVuYWJsZWQgICAgPSBudWxsXG4gICAgdGhpcy50aW1lb3V0ICAgID0gbnVsbFxuICAgIHRoaXMuaG92ZXJTdGF0ZSA9IG51bGxcbiAgICB0aGlzLiRlbGVtZW50ICAgPSBudWxsXG4gICAgdGhpcy5pblN0YXRlICAgID0gbnVsbFxuXG4gICAgdGhpcy5pbml0KCd0b29sdGlwJywgZWxlbWVudCwgb3B0aW9ucylcbiAgfVxuXG4gIFRvb2x0aXAuVkVSU0lPTiAgPSAnMy4zLjcnXG5cbiAgVG9vbHRpcC5UUkFOU0lUSU9OX0RVUkFUSU9OID0gMTUwXG5cbiAgVG9vbHRpcC5ERUZBVUxUUyA9IHtcbiAgICBhbmltYXRpb246IHRydWUsXG4gICAgcGxhY2VtZW50OiAndG9wJyxcbiAgICBzZWxlY3RvcjogZmFsc2UsXG4gICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidG9vbHRpcFwiIHJvbGU9XCJ0b29sdGlwXCI+PGRpdiBjbGFzcz1cInRvb2x0aXAtYXJyb3dcIj48L2Rpdj48ZGl2IGNsYXNzPVwidG9vbHRpcC1pbm5lclwiPjwvZGl2PjwvZGl2PicsXG4gICAgdHJpZ2dlcjogJ2hvdmVyIGZvY3VzJyxcbiAgICB0aXRsZTogJycsXG4gICAgZGVsYXk6IDAsXG4gICAgaHRtbDogZmFsc2UsXG4gICAgY29udGFpbmVyOiBmYWxzZSxcbiAgICB2aWV3cG9ydDoge1xuICAgICAgc2VsZWN0b3I6ICdib2R5JyxcbiAgICAgIHBhZGRpbmc6IDBcbiAgICB9XG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKHR5cGUsIGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmVuYWJsZWQgICA9IHRydWVcbiAgICB0aGlzLnR5cGUgICAgICA9IHR5cGVcbiAgICB0aGlzLiRlbGVtZW50ICA9ICQoZWxlbWVudClcbiAgICB0aGlzLm9wdGlvbnMgICA9IHRoaXMuZ2V0T3B0aW9ucyhvcHRpb25zKVxuICAgIHRoaXMuJHZpZXdwb3J0ID0gdGhpcy5vcHRpb25zLnZpZXdwb3J0ICYmICQoJC5pc0Z1bmN0aW9uKHRoaXMub3B0aW9ucy52aWV3cG9ydCkgPyB0aGlzLm9wdGlvbnMudmlld3BvcnQuY2FsbCh0aGlzLCB0aGlzLiRlbGVtZW50KSA6ICh0aGlzLm9wdGlvbnMudmlld3BvcnQuc2VsZWN0b3IgfHwgdGhpcy5vcHRpb25zLnZpZXdwb3J0KSlcbiAgICB0aGlzLmluU3RhdGUgICA9IHsgY2xpY2s6IGZhbHNlLCBob3ZlcjogZmFsc2UsIGZvY3VzOiBmYWxzZSB9XG5cbiAgICBpZiAodGhpcy4kZWxlbWVudFswXSBpbnN0YW5jZW9mIGRvY3VtZW50LmNvbnN0cnVjdG9yICYmICF0aGlzLm9wdGlvbnMuc2VsZWN0b3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYHNlbGVjdG9yYCBvcHRpb24gbXVzdCBiZSBzcGVjaWZpZWQgd2hlbiBpbml0aWFsaXppbmcgJyArIHRoaXMudHlwZSArICcgb24gdGhlIHdpbmRvdy5kb2N1bWVudCBvYmplY3QhJylcbiAgICB9XG5cbiAgICB2YXIgdHJpZ2dlcnMgPSB0aGlzLm9wdGlvbnMudHJpZ2dlci5zcGxpdCgnICcpXG5cbiAgICBmb3IgKHZhciBpID0gdHJpZ2dlcnMubGVuZ3RoOyBpLS07KSB7XG4gICAgICB2YXIgdHJpZ2dlciA9IHRyaWdnZXJzW2ldXG5cbiAgICAgIGlmICh0cmlnZ2VyID09ICdjbGljaycpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vbignY2xpY2suJyArIHRoaXMudHlwZSwgdGhpcy5vcHRpb25zLnNlbGVjdG9yLCAkLnByb3h5KHRoaXMudG9nZ2xlLCB0aGlzKSlcbiAgICAgIH0gZWxzZSBpZiAodHJpZ2dlciAhPSAnbWFudWFsJykge1xuICAgICAgICB2YXIgZXZlbnRJbiAgPSB0cmlnZ2VyID09ICdob3ZlcicgPyAnbW91c2VlbnRlcicgOiAnZm9jdXNpbidcbiAgICAgICAgdmFyIGV2ZW50T3V0ID0gdHJpZ2dlciA9PSAnaG92ZXInID8gJ21vdXNlbGVhdmUnIDogJ2ZvY3Vzb3V0J1xuXG4gICAgICAgIHRoaXMuJGVsZW1lbnQub24oZXZlbnRJbiAgKyAnLicgKyB0aGlzLnR5cGUsIHRoaXMub3B0aW9ucy5zZWxlY3RvciwgJC5wcm94eSh0aGlzLmVudGVyLCB0aGlzKSlcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vbihldmVudE91dCArICcuJyArIHRoaXMudHlwZSwgdGhpcy5vcHRpb25zLnNlbGVjdG9yLCAkLnByb3h5KHRoaXMubGVhdmUsIHRoaXMpKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMub3B0aW9ucy5zZWxlY3RvciA/XG4gICAgICAodGhpcy5fb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIHsgdHJpZ2dlcjogJ21hbnVhbCcsIHNlbGVjdG9yOiAnJyB9KSkgOlxuICAgICAgdGhpcy5maXhUaXRsZSgpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXREZWZhdWx0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gVG9vbHRpcC5ERUZBVUxUU1xuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0T3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCB0aGlzLmdldERlZmF1bHRzKCksIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKVxuXG4gICAgaWYgKG9wdGlvbnMuZGVsYXkgJiYgdHlwZW9mIG9wdGlvbnMuZGVsYXkgPT0gJ251bWJlcicpIHtcbiAgICAgIG9wdGlvbnMuZGVsYXkgPSB7XG4gICAgICAgIHNob3c6IG9wdGlvbnMuZGVsYXksXG4gICAgICAgIGhpZGU6IG9wdGlvbnMuZGVsYXlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb3B0aW9uc1xuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0RGVsZWdhdGVPcHRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBvcHRpb25zICA9IHt9XG4gICAgdmFyIGRlZmF1bHRzID0gdGhpcy5nZXREZWZhdWx0cygpXG5cbiAgICB0aGlzLl9vcHRpb25zICYmICQuZWFjaCh0aGlzLl9vcHRpb25zLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgaWYgKGRlZmF1bHRzW2tleV0gIT0gdmFsdWUpIG9wdGlvbnNba2V5XSA9IHZhbHVlXG4gICAgfSlcblxuICAgIHJldHVybiBvcHRpb25zXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5lbnRlciA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgc2VsZiA9IG9iaiBpbnN0YW5jZW9mIHRoaXMuY29uc3RydWN0b3IgP1xuICAgICAgb2JqIDogJChvYmouY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSlcblxuICAgIGlmICghc2VsZikge1xuICAgICAgc2VsZiA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKG9iai5jdXJyZW50VGFyZ2V0LCB0aGlzLmdldERlbGVnYXRlT3B0aW9ucygpKVxuICAgICAgJChvYmouY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSwgc2VsZilcbiAgICB9XG5cbiAgICBpZiAob2JqIGluc3RhbmNlb2YgJC5FdmVudCkge1xuICAgICAgc2VsZi5pblN0YXRlW29iai50eXBlID09ICdmb2N1c2luJyA/ICdmb2N1cycgOiAnaG92ZXInXSA9IHRydWVcbiAgICB9XG5cbiAgICBpZiAoc2VsZi50aXAoKS5oYXNDbGFzcygnaW4nKSB8fCBzZWxmLmhvdmVyU3RhdGUgPT0gJ2luJykge1xuICAgICAgc2VsZi5ob3ZlclN0YXRlID0gJ2luJ1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY2xlYXJUaW1lb3V0KHNlbGYudGltZW91dClcblxuICAgIHNlbGYuaG92ZXJTdGF0ZSA9ICdpbidcblxuICAgIGlmICghc2VsZi5vcHRpb25zLmRlbGF5IHx8ICFzZWxmLm9wdGlvbnMuZGVsYXkuc2hvdykgcmV0dXJuIHNlbGYuc2hvdygpXG5cbiAgICBzZWxmLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChzZWxmLmhvdmVyU3RhdGUgPT0gJ2luJykgc2VsZi5zaG93KClcbiAgICB9LCBzZWxmLm9wdGlvbnMuZGVsYXkuc2hvdylcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmlzSW5TdGF0ZVRydWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMuaW5TdGF0ZSkge1xuICAgICAgaWYgKHRoaXMuaW5TdGF0ZVtrZXldKSByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUubGVhdmUgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIHNlbGYgPSBvYmogaW5zdGFuY2VvZiB0aGlzLmNvbnN0cnVjdG9yID9cbiAgICAgIG9iaiA6ICQob2JqLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUpXG5cbiAgICBpZiAoIXNlbGYpIHtcbiAgICAgIHNlbGYgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihvYmouY3VycmVudFRhcmdldCwgdGhpcy5nZXREZWxlZ2F0ZU9wdGlvbnMoKSlcbiAgICAgICQob2JqLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUsIHNlbGYpXG4gICAgfVxuXG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mICQuRXZlbnQpIHtcbiAgICAgIHNlbGYuaW5TdGF0ZVtvYmoudHlwZSA9PSAnZm9jdXNvdXQnID8gJ2ZvY3VzJyA6ICdob3ZlciddID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoc2VsZi5pc0luU3RhdGVUcnVlKCkpIHJldHVyblxuXG4gICAgY2xlYXJUaW1lb3V0KHNlbGYudGltZW91dClcblxuICAgIHNlbGYuaG92ZXJTdGF0ZSA9ICdvdXQnXG5cbiAgICBpZiAoIXNlbGYub3B0aW9ucy5kZWxheSB8fCAhc2VsZi5vcHRpb25zLmRlbGF5LmhpZGUpIHJldHVybiBzZWxmLmhpZGUoKVxuXG4gICAgc2VsZi50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc2VsZi5ob3ZlclN0YXRlID09ICdvdXQnKSBzZWxmLmhpZGUoKVxuICAgIH0sIHNlbGYub3B0aW9ucy5kZWxheS5oaWRlKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZSA9ICQuRXZlbnQoJ3Nob3cuYnMuJyArIHRoaXMudHlwZSlcblxuICAgIGlmICh0aGlzLmhhc0NvbnRlbnQoKSAmJiB0aGlzLmVuYWJsZWQpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxuXG4gICAgICB2YXIgaW5Eb20gPSAkLmNvbnRhaW5zKHRoaXMuJGVsZW1lbnRbMF0ub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHRoaXMuJGVsZW1lbnRbMF0pXG4gICAgICBpZiAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSB8fCAhaW5Eb20pIHJldHVyblxuICAgICAgdmFyIHRoYXQgPSB0aGlzXG5cbiAgICAgIHZhciAkdGlwID0gdGhpcy50aXAoKVxuXG4gICAgICB2YXIgdGlwSWQgPSB0aGlzLmdldFVJRCh0aGlzLnR5cGUpXG5cbiAgICAgIHRoaXMuc2V0Q29udGVudCgpXG4gICAgICAkdGlwLmF0dHIoJ2lkJywgdGlwSWQpXG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtZGVzY3JpYmVkYnknLCB0aXBJZClcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbmltYXRpb24pICR0aXAuYWRkQ2xhc3MoJ2ZhZGUnKVxuXG4gICAgICB2YXIgcGxhY2VtZW50ID0gdHlwZW9mIHRoaXMub3B0aW9ucy5wbGFjZW1lbnQgPT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgIHRoaXMub3B0aW9ucy5wbGFjZW1lbnQuY2FsbCh0aGlzLCAkdGlwWzBdLCB0aGlzLiRlbGVtZW50WzBdKSA6XG4gICAgICAgIHRoaXMub3B0aW9ucy5wbGFjZW1lbnRcblxuICAgICAgdmFyIGF1dG9Ub2tlbiA9IC9cXHM/YXV0bz9cXHM/L2lcbiAgICAgIHZhciBhdXRvUGxhY2UgPSBhdXRvVG9rZW4udGVzdChwbGFjZW1lbnQpXG4gICAgICBpZiAoYXV0b1BsYWNlKSBwbGFjZW1lbnQgPSBwbGFjZW1lbnQucmVwbGFjZShhdXRvVG9rZW4sICcnKSB8fCAndG9wJ1xuXG4gICAgICAkdGlwXG4gICAgICAgIC5kZXRhY2goKVxuICAgICAgICAuY3NzKHsgdG9wOiAwLCBsZWZ0OiAwLCBkaXNwbGF5OiAnYmxvY2snIH0pXG4gICAgICAgIC5hZGRDbGFzcyhwbGFjZW1lbnQpXG4gICAgICAgIC5kYXRhKCdicy4nICsgdGhpcy50eXBlLCB0aGlzKVxuXG4gICAgICB0aGlzLm9wdGlvbnMuY29udGFpbmVyID8gJHRpcC5hcHBlbmRUbyh0aGlzLm9wdGlvbnMuY29udGFpbmVyKSA6ICR0aXAuaW5zZXJ0QWZ0ZXIodGhpcy4kZWxlbWVudClcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaW5zZXJ0ZWQuYnMuJyArIHRoaXMudHlwZSlcblxuICAgICAgdmFyIHBvcyAgICAgICAgICA9IHRoaXMuZ2V0UG9zaXRpb24oKVxuICAgICAgdmFyIGFjdHVhbFdpZHRoICA9ICR0aXBbMF0ub2Zmc2V0V2lkdGhcbiAgICAgIHZhciBhY3R1YWxIZWlnaHQgPSAkdGlwWzBdLm9mZnNldEhlaWdodFxuXG4gICAgICBpZiAoYXV0b1BsYWNlKSB7XG4gICAgICAgIHZhciBvcmdQbGFjZW1lbnQgPSBwbGFjZW1lbnRcbiAgICAgICAgdmFyIHZpZXdwb3J0RGltID0gdGhpcy5nZXRQb3NpdGlvbih0aGlzLiR2aWV3cG9ydClcblxuICAgICAgICBwbGFjZW1lbnQgPSBwbGFjZW1lbnQgPT0gJ2JvdHRvbScgJiYgcG9zLmJvdHRvbSArIGFjdHVhbEhlaWdodCA+IHZpZXdwb3J0RGltLmJvdHRvbSA/ICd0b3AnICAgIDpcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50ID09ICd0b3AnICAgICYmIHBvcy50b3AgICAgLSBhY3R1YWxIZWlnaHQgPCB2aWV3cG9ydERpbS50b3AgICAgPyAnYm90dG9tJyA6XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAncmlnaHQnICAmJiBwb3MucmlnaHQgICsgYWN0dWFsV2lkdGggID4gdmlld3BvcnREaW0ud2lkdGggID8gJ2xlZnQnICAgOlxuICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ2xlZnQnICAgJiYgcG9zLmxlZnQgICAtIGFjdHVhbFdpZHRoICA8IHZpZXdwb3J0RGltLmxlZnQgICA/ICdyaWdodCcgIDpcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50XG5cbiAgICAgICAgJHRpcFxuICAgICAgICAgIC5yZW1vdmVDbGFzcyhvcmdQbGFjZW1lbnQpXG4gICAgICAgICAgLmFkZENsYXNzKHBsYWNlbWVudClcbiAgICAgIH1cblxuICAgICAgdmFyIGNhbGN1bGF0ZWRPZmZzZXQgPSB0aGlzLmdldENhbGN1bGF0ZWRPZmZzZXQocGxhY2VtZW50LCBwb3MsIGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpXG5cbiAgICAgIHRoaXMuYXBwbHlQbGFjZW1lbnQoY2FsY3VsYXRlZE9mZnNldCwgcGxhY2VtZW50KVxuXG4gICAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwcmV2SG92ZXJTdGF0ZSA9IHRoYXQuaG92ZXJTdGF0ZVxuICAgICAgICB0aGF0LiRlbGVtZW50LnRyaWdnZXIoJ3Nob3duLmJzLicgKyB0aGF0LnR5cGUpXG4gICAgICAgIHRoYXQuaG92ZXJTdGF0ZSA9IG51bGxcblxuICAgICAgICBpZiAocHJldkhvdmVyU3RhdGUgPT0gJ291dCcpIHRoYXQubGVhdmUodGhhdClcbiAgICAgIH1cblxuICAgICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhpcy4kdGlwLmhhc0NsYXNzKCdmYWRlJykgP1xuICAgICAgICAkdGlwXG4gICAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgY29tcGxldGUpXG4gICAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKFRvb2x0aXAuVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgICBjb21wbGV0ZSgpXG4gICAgfVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuYXBwbHlQbGFjZW1lbnQgPSBmdW5jdGlvbiAob2Zmc2V0LCBwbGFjZW1lbnQpIHtcbiAgICB2YXIgJHRpcCAgID0gdGhpcy50aXAoKVxuICAgIHZhciB3aWR0aCAgPSAkdGlwWzBdLm9mZnNldFdpZHRoXG4gICAgdmFyIGhlaWdodCA9ICR0aXBbMF0ub2Zmc2V0SGVpZ2h0XG5cbiAgICAvLyBtYW51YWxseSByZWFkIG1hcmdpbnMgYmVjYXVzZSBnZXRCb3VuZGluZ0NsaWVudFJlY3QgaW5jbHVkZXMgZGlmZmVyZW5jZVxuICAgIHZhciBtYXJnaW5Ub3AgPSBwYXJzZUludCgkdGlwLmNzcygnbWFyZ2luLXRvcCcpLCAxMClcbiAgICB2YXIgbWFyZ2luTGVmdCA9IHBhcnNlSW50KCR0aXAuY3NzKCdtYXJnaW4tbGVmdCcpLCAxMClcblxuICAgIC8vIHdlIG11c3QgY2hlY2sgZm9yIE5hTiBmb3IgaWUgOC85XG4gICAgaWYgKGlzTmFOKG1hcmdpblRvcCkpICBtYXJnaW5Ub3AgID0gMFxuICAgIGlmIChpc05hTihtYXJnaW5MZWZ0KSkgbWFyZ2luTGVmdCA9IDBcblxuICAgIG9mZnNldC50b3AgICs9IG1hcmdpblRvcFxuICAgIG9mZnNldC5sZWZ0ICs9IG1hcmdpbkxlZnRcblxuICAgIC8vICQuZm4ub2Zmc2V0IGRvZXNuJ3Qgcm91bmQgcGl4ZWwgdmFsdWVzXG4gICAgLy8gc28gd2UgdXNlIHNldE9mZnNldCBkaXJlY3RseSB3aXRoIG91ciBvd24gZnVuY3Rpb24gQi0wXG4gICAgJC5vZmZzZXQuc2V0T2Zmc2V0KCR0aXBbMF0sICQuZXh0ZW5kKHtcbiAgICAgIHVzaW5nOiBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgJHRpcC5jc3Moe1xuICAgICAgICAgIHRvcDogTWF0aC5yb3VuZChwcm9wcy50b3ApLFxuICAgICAgICAgIGxlZnQ6IE1hdGgucm91bmQocHJvcHMubGVmdClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9LCBvZmZzZXQpLCAwKVxuXG4gICAgJHRpcC5hZGRDbGFzcygnaW4nKVxuXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHBsYWNpbmcgdGlwIGluIG5ldyBvZmZzZXQgY2F1c2VkIHRoZSB0aXAgdG8gcmVzaXplIGl0c2VsZlxuICAgIHZhciBhY3R1YWxXaWR0aCAgPSAkdGlwWzBdLm9mZnNldFdpZHRoXG4gICAgdmFyIGFjdHVhbEhlaWdodCA9ICR0aXBbMF0ub2Zmc2V0SGVpZ2h0XG5cbiAgICBpZiAocGxhY2VtZW50ID09ICd0b3AnICYmIGFjdHVhbEhlaWdodCAhPSBoZWlnaHQpIHtcbiAgICAgIG9mZnNldC50b3AgPSBvZmZzZXQudG9wICsgaGVpZ2h0IC0gYWN0dWFsSGVpZ2h0XG4gICAgfVxuXG4gICAgdmFyIGRlbHRhID0gdGhpcy5nZXRWaWV3cG9ydEFkanVzdGVkRGVsdGEocGxhY2VtZW50LCBvZmZzZXQsIGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpXG5cbiAgICBpZiAoZGVsdGEubGVmdCkgb2Zmc2V0LmxlZnQgKz0gZGVsdGEubGVmdFxuICAgIGVsc2Ugb2Zmc2V0LnRvcCArPSBkZWx0YS50b3BcblxuICAgIHZhciBpc1ZlcnRpY2FsICAgICAgICAgID0gL3RvcHxib3R0b20vLnRlc3QocGxhY2VtZW50KVxuICAgIHZhciBhcnJvd0RlbHRhICAgICAgICAgID0gaXNWZXJ0aWNhbCA/IGRlbHRhLmxlZnQgKiAyIC0gd2lkdGggKyBhY3R1YWxXaWR0aCA6IGRlbHRhLnRvcCAqIDIgLSBoZWlnaHQgKyBhY3R1YWxIZWlnaHRcbiAgICB2YXIgYXJyb3dPZmZzZXRQb3NpdGlvbiA9IGlzVmVydGljYWwgPyAnb2Zmc2V0V2lkdGgnIDogJ29mZnNldEhlaWdodCdcblxuICAgICR0aXAub2Zmc2V0KG9mZnNldClcbiAgICB0aGlzLnJlcGxhY2VBcnJvdyhhcnJvd0RlbHRhLCAkdGlwWzBdW2Fycm93T2Zmc2V0UG9zaXRpb25dLCBpc1ZlcnRpY2FsKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUucmVwbGFjZUFycm93ID0gZnVuY3Rpb24gKGRlbHRhLCBkaW1lbnNpb24sIGlzVmVydGljYWwpIHtcbiAgICB0aGlzLmFycm93KClcbiAgICAgIC5jc3MoaXNWZXJ0aWNhbCA/ICdsZWZ0JyA6ICd0b3AnLCA1MCAqICgxIC0gZGVsdGEgLyBkaW1lbnNpb24pICsgJyUnKVxuICAgICAgLmNzcyhpc1ZlcnRpY2FsID8gJ3RvcCcgOiAnbGVmdCcsICcnKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuc2V0Q29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJHRpcCAgPSB0aGlzLnRpcCgpXG4gICAgdmFyIHRpdGxlID0gdGhpcy5nZXRUaXRsZSgpXG5cbiAgICAkdGlwLmZpbmQoJy50b29sdGlwLWlubmVyJylbdGhpcy5vcHRpb25zLmh0bWwgPyAnaHRtbCcgOiAndGV4dCddKHRpdGxlKVxuICAgICR0aXAucmVtb3ZlQ2xhc3MoJ2ZhZGUgaW4gdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0JylcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICB2YXIgJHRpcCA9ICQodGhpcy4kdGlwKVxuICAgIHZhciBlICAgID0gJC5FdmVudCgnaGlkZS5icy4nICsgdGhpcy50eXBlKVxuXG4gICAgZnVuY3Rpb24gY29tcGxldGUoKSB7XG4gICAgICBpZiAodGhhdC5ob3ZlclN0YXRlICE9ICdpbicpICR0aXAuZGV0YWNoKClcbiAgICAgIGlmICh0aGF0LiRlbGVtZW50KSB7IC8vIFRPRE86IENoZWNrIHdoZXRoZXIgZ3VhcmRpbmcgdGhpcyBjb2RlIHdpdGggdGhpcyBgaWZgIGlzIHJlYWxseSBuZWNlc3NhcnkuXG4gICAgICAgIHRoYXQuJGVsZW1lbnRcbiAgICAgICAgICAucmVtb3ZlQXR0cignYXJpYS1kZXNjcmliZWRieScpXG4gICAgICAgICAgLnRyaWdnZXIoJ2hpZGRlbi5icy4nICsgdGhhdC50eXBlKVxuICAgICAgfVxuICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soKVxuICAgIH1cblxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxuXG4gICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxuXG4gICAgJHRpcC5yZW1vdmVDbGFzcygnaW4nKVxuXG4gICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgJHRpcC5oYXNDbGFzcygnZmFkZScpID9cbiAgICAgICR0aXBcbiAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgY29tcGxldGUpXG4gICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChUb29sdGlwLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcbiAgICAgIGNvbXBsZXRlKClcblxuICAgIHRoaXMuaG92ZXJTdGF0ZSA9IG51bGxcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5maXhUaXRsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJGUgPSB0aGlzLiRlbGVtZW50XG4gICAgaWYgKCRlLmF0dHIoJ3RpdGxlJykgfHwgdHlwZW9mICRlLmF0dHIoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnKSAhPSAnc3RyaW5nJykge1xuICAgICAgJGUuYXR0cignZGF0YS1vcmlnaW5hbC10aXRsZScsICRlLmF0dHIoJ3RpdGxlJykgfHwgJycpLmF0dHIoJ3RpdGxlJywgJycpXG4gICAgfVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuaGFzQ29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRUaXRsZSgpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRQb3NpdGlvbiA9IGZ1bmN0aW9uICgkZWxlbWVudCkge1xuICAgICRlbGVtZW50ICAgPSAkZWxlbWVudCB8fCB0aGlzLiRlbGVtZW50XG5cbiAgICB2YXIgZWwgICAgID0gJGVsZW1lbnRbMF1cbiAgICB2YXIgaXNCb2R5ID0gZWwudGFnTmFtZSA9PSAnQk9EWSdcblxuICAgIHZhciBlbFJlY3QgICAgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGlmIChlbFJlY3Qud2lkdGggPT0gbnVsbCkge1xuICAgICAgLy8gd2lkdGggYW5kIGhlaWdodCBhcmUgbWlzc2luZyBpbiBJRTgsIHNvIGNvbXB1dGUgdGhlbSBtYW51YWxseTsgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9pc3N1ZXMvMTQwOTNcbiAgICAgIGVsUmVjdCA9ICQuZXh0ZW5kKHt9LCBlbFJlY3QsIHsgd2lkdGg6IGVsUmVjdC5yaWdodCAtIGVsUmVjdC5sZWZ0LCBoZWlnaHQ6IGVsUmVjdC5ib3R0b20gLSBlbFJlY3QudG9wIH0pXG4gICAgfVxuICAgIHZhciBpc1N2ZyA9IHdpbmRvdy5TVkdFbGVtZW50ICYmIGVsIGluc3RhbmNlb2Ygd2luZG93LlNWR0VsZW1lbnRcbiAgICAvLyBBdm9pZCB1c2luZyAkLm9mZnNldCgpIG9uIFNWR3Mgc2luY2UgaXQgZ2l2ZXMgaW5jb3JyZWN0IHJlc3VsdHMgaW4galF1ZXJ5IDMuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9pc3N1ZXMvMjAyODBcbiAgICB2YXIgZWxPZmZzZXQgID0gaXNCb2R5ID8geyB0b3A6IDAsIGxlZnQ6IDAgfSA6IChpc1N2ZyA/IG51bGwgOiAkZWxlbWVudC5vZmZzZXQoKSlcbiAgICB2YXIgc2Nyb2xsICAgID0geyBzY3JvbGw6IGlzQm9keSA/IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgOiAkZWxlbWVudC5zY3JvbGxUb3AoKSB9XG4gICAgdmFyIG91dGVyRGltcyA9IGlzQm9keSA/IHsgd2lkdGg6ICQod2luZG93KS53aWR0aCgpLCBoZWlnaHQ6ICQod2luZG93KS5oZWlnaHQoKSB9IDogbnVsbFxuXG4gICAgcmV0dXJuICQuZXh0ZW5kKHt9LCBlbFJlY3QsIHNjcm9sbCwgb3V0ZXJEaW1zLCBlbE9mZnNldClcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldENhbGN1bGF0ZWRPZmZzZXQgPSBmdW5jdGlvbiAocGxhY2VtZW50LCBwb3MsIGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpIHtcbiAgICByZXR1cm4gcGxhY2VtZW50ID09ICdib3R0b20nID8geyB0b3A6IHBvcy50b3AgKyBwb3MuaGVpZ2h0LCAgIGxlZnQ6IHBvcy5sZWZ0ICsgcG9zLndpZHRoIC8gMiAtIGFjdHVhbFdpZHRoIC8gMiB9IDpcbiAgICAgICAgICAgcGxhY2VtZW50ID09ICd0b3AnICAgID8geyB0b3A6IHBvcy50b3AgLSBhY3R1YWxIZWlnaHQsIGxlZnQ6IHBvcy5sZWZ0ICsgcG9zLndpZHRoIC8gMiAtIGFjdHVhbFdpZHRoIC8gMiB9IDpcbiAgICAgICAgICAgcGxhY2VtZW50ID09ICdsZWZ0JyAgID8geyB0b3A6IHBvcy50b3AgKyBwb3MuaGVpZ2h0IC8gMiAtIGFjdHVhbEhlaWdodCAvIDIsIGxlZnQ6IHBvcy5sZWZ0IC0gYWN0dWFsV2lkdGggfSA6XG4gICAgICAgIC8qIHBsYWNlbWVudCA9PSAncmlnaHQnICovIHsgdG9wOiBwb3MudG9wICsgcG9zLmhlaWdodCAvIDIgLSBhY3R1YWxIZWlnaHQgLyAyLCBsZWZ0OiBwb3MubGVmdCArIHBvcy53aWR0aCB9XG5cbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFZpZXdwb3J0QWRqdXN0ZWREZWx0YSA9IGZ1bmN0aW9uIChwbGFjZW1lbnQsIHBvcywgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodCkge1xuICAgIHZhciBkZWx0YSA9IHsgdG9wOiAwLCBsZWZ0OiAwIH1cbiAgICBpZiAoIXRoaXMuJHZpZXdwb3J0KSByZXR1cm4gZGVsdGFcblxuICAgIHZhciB2aWV3cG9ydFBhZGRpbmcgPSB0aGlzLm9wdGlvbnMudmlld3BvcnQgJiYgdGhpcy5vcHRpb25zLnZpZXdwb3J0LnBhZGRpbmcgfHwgMFxuICAgIHZhciB2aWV3cG9ydERpbWVuc2lvbnMgPSB0aGlzLmdldFBvc2l0aW9uKHRoaXMuJHZpZXdwb3J0KVxuXG4gICAgaWYgKC9yaWdodHxsZWZ0Ly50ZXN0KHBsYWNlbWVudCkpIHtcbiAgICAgIHZhciB0b3BFZGdlT2Zmc2V0ICAgID0gcG9zLnRvcCAtIHZpZXdwb3J0UGFkZGluZyAtIHZpZXdwb3J0RGltZW5zaW9ucy5zY3JvbGxcbiAgICAgIHZhciBib3R0b21FZGdlT2Zmc2V0ID0gcG9zLnRvcCArIHZpZXdwb3J0UGFkZGluZyAtIHZpZXdwb3J0RGltZW5zaW9ucy5zY3JvbGwgKyBhY3R1YWxIZWlnaHRcbiAgICAgIGlmICh0b3BFZGdlT2Zmc2V0IDwgdmlld3BvcnREaW1lbnNpb25zLnRvcCkgeyAvLyB0b3Agb3ZlcmZsb3dcbiAgICAgICAgZGVsdGEudG9wID0gdmlld3BvcnREaW1lbnNpb25zLnRvcCAtIHRvcEVkZ2VPZmZzZXRcbiAgICAgIH0gZWxzZSBpZiAoYm90dG9tRWRnZU9mZnNldCA+IHZpZXdwb3J0RGltZW5zaW9ucy50b3AgKyB2aWV3cG9ydERpbWVuc2lvbnMuaGVpZ2h0KSB7IC8vIGJvdHRvbSBvdmVyZmxvd1xuICAgICAgICBkZWx0YS50b3AgPSB2aWV3cG9ydERpbWVuc2lvbnMudG9wICsgdmlld3BvcnREaW1lbnNpb25zLmhlaWdodCAtIGJvdHRvbUVkZ2VPZmZzZXRcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGxlZnRFZGdlT2Zmc2V0ICA9IHBvcy5sZWZ0IC0gdmlld3BvcnRQYWRkaW5nXG4gICAgICB2YXIgcmlnaHRFZGdlT2Zmc2V0ID0gcG9zLmxlZnQgKyB2aWV3cG9ydFBhZGRpbmcgKyBhY3R1YWxXaWR0aFxuICAgICAgaWYgKGxlZnRFZGdlT2Zmc2V0IDwgdmlld3BvcnREaW1lbnNpb25zLmxlZnQpIHsgLy8gbGVmdCBvdmVyZmxvd1xuICAgICAgICBkZWx0YS5sZWZ0ID0gdmlld3BvcnREaW1lbnNpb25zLmxlZnQgLSBsZWZ0RWRnZU9mZnNldFxuICAgICAgfSBlbHNlIGlmIChyaWdodEVkZ2VPZmZzZXQgPiB2aWV3cG9ydERpbWVuc2lvbnMucmlnaHQpIHsgLy8gcmlnaHQgb3ZlcmZsb3dcbiAgICAgICAgZGVsdGEubGVmdCA9IHZpZXdwb3J0RGltZW5zaW9ucy5sZWZ0ICsgdmlld3BvcnREaW1lbnNpb25zLndpZHRoIC0gcmlnaHRFZGdlT2Zmc2V0XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlbHRhXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRUaXRsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGl0bGVcbiAgICB2YXIgJGUgPSB0aGlzLiRlbGVtZW50XG4gICAgdmFyIG8gID0gdGhpcy5vcHRpb25zXG5cbiAgICB0aXRsZSA9ICRlLmF0dHIoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnKVxuICAgICAgfHwgKHR5cGVvZiBvLnRpdGxlID09ICdmdW5jdGlvbicgPyBvLnRpdGxlLmNhbGwoJGVbMF0pIDogIG8udGl0bGUpXG5cbiAgICByZXR1cm4gdGl0bGVcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFVJRCA9IGZ1bmN0aW9uIChwcmVmaXgpIHtcbiAgICBkbyBwcmVmaXggKz0gfn4oTWF0aC5yYW5kb20oKSAqIDEwMDAwMDApXG4gICAgd2hpbGUgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHByZWZpeCkpXG4gICAgcmV0dXJuIHByZWZpeFxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUudGlwID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy4kdGlwKSB7XG4gICAgICB0aGlzLiR0aXAgPSAkKHRoaXMub3B0aW9ucy50ZW1wbGF0ZSlcbiAgICAgIGlmICh0aGlzLiR0aXAubGVuZ3RoICE9IDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRoaXMudHlwZSArICcgYHRlbXBsYXRlYCBvcHRpb24gbXVzdCBjb25zaXN0IG9mIGV4YWN0bHkgMSB0b3AtbGV2ZWwgZWxlbWVudCEnKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy4kdGlwXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5hcnJvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKHRoaXMuJGFycm93ID0gdGhpcy4kYXJyb3cgfHwgdGhpcy50aXAoKS5maW5kKCcudG9vbHRpcC1hcnJvdycpKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZW5hYmxlZCA9IHRydWVcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2VcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnRvZ2dsZUVuYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbmFibGVkID0gIXRoaXMuZW5hYmxlZFxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICBpZiAoZSkge1xuICAgICAgc2VsZiA9ICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlKVxuICAgICAgaWYgKCFzZWxmKSB7XG4gICAgICAgIHNlbGYgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihlLmN1cnJlbnRUYXJnZXQsIHRoaXMuZ2V0RGVsZWdhdGVPcHRpb25zKCkpXG4gICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlLCBzZWxmKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlKSB7XG4gICAgICBzZWxmLmluU3RhdGUuY2xpY2sgPSAhc2VsZi5pblN0YXRlLmNsaWNrXG4gICAgICBpZiAoc2VsZi5pc0luU3RhdGVUcnVlKCkpIHNlbGYuZW50ZXIoc2VsZilcbiAgICAgIGVsc2Ugc2VsZi5sZWF2ZShzZWxmKVxuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLnRpcCgpLmhhc0NsYXNzKCdpbicpID8gc2VsZi5sZWF2ZShzZWxmKSA6IHNlbGYuZW50ZXIoc2VsZilcbiAgICB9XG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpXG4gICAgdGhpcy5oaWRlKGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoYXQuJGVsZW1lbnQub2ZmKCcuJyArIHRoYXQudHlwZSkucmVtb3ZlRGF0YSgnYnMuJyArIHRoYXQudHlwZSlcbiAgICAgIGlmICh0aGF0LiR0aXApIHtcbiAgICAgICAgdGhhdC4kdGlwLmRldGFjaCgpXG4gICAgICB9XG4gICAgICB0aGF0LiR0aXAgPSBudWxsXG4gICAgICB0aGF0LiRhcnJvdyA9IG51bGxcbiAgICAgIHRoYXQuJHZpZXdwb3J0ID0gbnVsbFxuICAgICAgdGhhdC4kZWxlbWVudCA9IG51bGxcbiAgICB9KVxuICB9XG5cblxuICAvLyBUT09MVElQIFBMVUdJTiBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMudG9vbHRpcCcpXG4gICAgICB2YXIgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uXG5cbiAgICAgIGlmICghZGF0YSAmJiAvZGVzdHJveXxoaWRlLy50ZXN0KG9wdGlvbikpIHJldHVyblxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy50b29sdGlwJywgKGRhdGEgPSBuZXcgVG9vbHRpcCh0aGlzLCBvcHRpb25zKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgdmFyIG9sZCA9ICQuZm4udG9vbHRpcFxuXG4gICQuZm4udG9vbHRpcCAgICAgICAgICAgICA9IFBsdWdpblxuICAkLmZuLnRvb2x0aXAuQ29uc3RydWN0b3IgPSBUb29sdGlwXG5cblxuICAvLyBUT09MVElQIE5PIENPTkZMSUNUXG4gIC8vID09PT09PT09PT09PT09PT09PT1cblxuICAkLmZuLnRvb2x0aXAubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLnRvb2x0aXAgPSBvbGRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbn0oalF1ZXJ5KTtcbiIsIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiBwb3BvdmVyLmpzIHYzLjMuN1xuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jcG9wb3ZlcnNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuK2Z1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBQT1BPVkVSIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgUG9wb3ZlciA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5pbml0KCdwb3BvdmVyJywgZWxlbWVudCwgb3B0aW9ucylcbiAgfVxuXG4gIGlmICghJC5mbi50b29sdGlwKSB0aHJvdyBuZXcgRXJyb3IoJ1BvcG92ZXIgcmVxdWlyZXMgdG9vbHRpcC5qcycpXG5cbiAgUG9wb3Zlci5WRVJTSU9OICA9ICczLjMuNydcblxuICBQb3BvdmVyLkRFRkFVTFRTID0gJC5leHRlbmQoe30sICQuZm4udG9vbHRpcC5Db25zdHJ1Y3Rvci5ERUZBVUxUUywge1xuICAgIHBsYWNlbWVudDogJ3JpZ2h0JyxcbiAgICB0cmlnZ2VyOiAnY2xpY2snLFxuICAgIGNvbnRlbnQ6ICcnLFxuICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBvcG92ZXJcIiByb2xlPVwidG9vbHRpcFwiPjxkaXYgY2xhc3M9XCJhcnJvd1wiPjwvZGl2PjxoMyBjbGFzcz1cInBvcG92ZXItdGl0bGVcIj48L2gzPjxkaXYgY2xhc3M9XCJwb3BvdmVyLWNvbnRlbnRcIj48L2Rpdj48L2Rpdj4nXG4gIH0pXG5cblxuICAvLyBOT1RFOiBQT1BPVkVSIEVYVEVORFMgdG9vbHRpcC5qc1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIFBvcG92ZXIucHJvdG90eXBlID0gJC5leHRlbmQoe30sICQuZm4udG9vbHRpcC5Db25zdHJ1Y3Rvci5wcm90b3R5cGUpXG5cbiAgUG9wb3Zlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQb3BvdmVyXG5cbiAgUG9wb3Zlci5wcm90b3R5cGUuZ2V0RGVmYXVsdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFBvcG92ZXIuREVGQVVMVFNcbiAgfVxuXG4gIFBvcG92ZXIucHJvdG90eXBlLnNldENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICR0aXAgICAgPSB0aGlzLnRpcCgpXG4gICAgdmFyIHRpdGxlICAgPSB0aGlzLmdldFRpdGxlKClcbiAgICB2YXIgY29udGVudCA9IHRoaXMuZ2V0Q29udGVudCgpXG5cbiAgICAkdGlwLmZpbmQoJy5wb3BvdmVyLXRpdGxlJylbdGhpcy5vcHRpb25zLmh0bWwgPyAnaHRtbCcgOiAndGV4dCddKHRpdGxlKVxuICAgICR0aXAuZmluZCgnLnBvcG92ZXItY29udGVudCcpLmNoaWxkcmVuKCkuZGV0YWNoKCkuZW5kKClbIC8vIHdlIHVzZSBhcHBlbmQgZm9yIGh0bWwgb2JqZWN0cyB0byBtYWludGFpbiBqcyBldmVudHNcbiAgICAgIHRoaXMub3B0aW9ucy5odG1sID8gKHR5cGVvZiBjb250ZW50ID09ICdzdHJpbmcnID8gJ2h0bWwnIDogJ2FwcGVuZCcpIDogJ3RleHQnXG4gICAgXShjb250ZW50KVxuXG4gICAgJHRpcC5yZW1vdmVDbGFzcygnZmFkZSB0b3AgYm90dG9tIGxlZnQgcmlnaHQgaW4nKVxuXG4gICAgLy8gSUU4IGRvZXNuJ3QgYWNjZXB0IGhpZGluZyB2aWEgdGhlIGA6ZW1wdHlgIHBzZXVkbyBzZWxlY3Rvciwgd2UgaGF2ZSB0byBkb1xuICAgIC8vIHRoaXMgbWFudWFsbHkgYnkgY2hlY2tpbmcgdGhlIGNvbnRlbnRzLlxuICAgIGlmICghJHRpcC5maW5kKCcucG9wb3Zlci10aXRsZScpLmh0bWwoKSkgJHRpcC5maW5kKCcucG9wb3Zlci10aXRsZScpLmhpZGUoKVxuICB9XG5cbiAgUG9wb3Zlci5wcm90b3R5cGUuaGFzQ29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRUaXRsZSgpIHx8IHRoaXMuZ2V0Q29udGVudCgpXG4gIH1cblxuICBQb3BvdmVyLnByb3RvdHlwZS5nZXRDb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciAkZSA9IHRoaXMuJGVsZW1lbnRcbiAgICB2YXIgbyAgPSB0aGlzLm9wdGlvbnNcblxuICAgIHJldHVybiAkZS5hdHRyKCdkYXRhLWNvbnRlbnQnKVxuICAgICAgfHwgKHR5cGVvZiBvLmNvbnRlbnQgPT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgICBvLmNvbnRlbnQuY2FsbCgkZVswXSkgOlxuICAgICAgICAgICAgby5jb250ZW50KVxuICB9XG5cbiAgUG9wb3Zlci5wcm90b3R5cGUuYXJyb3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh0aGlzLiRhcnJvdyA9IHRoaXMuJGFycm93IHx8IHRoaXMudGlwKCkuZmluZCgnLmFycm93JykpXG4gIH1cblxuXG4gIC8vIFBPUE9WRVIgUExVR0lOIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5wb3BvdmVyJylcbiAgICAgIHZhciBvcHRpb25zID0gdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb25cblxuICAgICAgaWYgKCFkYXRhICYmIC9kZXN0cm95fGhpZGUvLnRlc3Qob3B0aW9uKSkgcmV0dXJuXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLnBvcG92ZXInLCAoZGF0YSA9IG5ldyBQb3BvdmVyKHRoaXMsIG9wdGlvbnMpKSlcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxuICAgIH0pXG4gIH1cblxuICB2YXIgb2xkID0gJC5mbi5wb3BvdmVyXG5cbiAgJC5mbi5wb3BvdmVyICAgICAgICAgICAgID0gUGx1Z2luXG4gICQuZm4ucG9wb3Zlci5Db25zdHJ1Y3RvciA9IFBvcG92ZXJcblxuXG4gIC8vIFBPUE9WRVIgTk8gQ09ORkxJQ1RcbiAgLy8gPT09PT09PT09PT09PT09PT09PVxuXG4gICQuZm4ucG9wb3Zlci5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4ucG9wb3ZlciA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxufShqUXVlcnkpO1xuIiwiLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBCb290c3RyYXA6IG1vZGFsLmpzIHYzLjMuN1xuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jbW9kYWxzXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbitmdW5jdGlvbiAoJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gTU9EQUwgQ0xBU1MgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09XG5cbiAgdmFyIE1vZGFsID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgICAgICAgICAgICAgPSBvcHRpb25zXG4gICAgdGhpcy4kYm9keSAgICAgICAgICAgICAgID0gJChkb2N1bWVudC5ib2R5KVxuICAgIHRoaXMuJGVsZW1lbnQgICAgICAgICAgICA9ICQoZWxlbWVudClcbiAgICB0aGlzLiRkaWFsb2cgICAgICAgICAgICAgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5tb2RhbC1kaWFsb2cnKVxuICAgIHRoaXMuJGJhY2tkcm9wICAgICAgICAgICA9IG51bGxcbiAgICB0aGlzLmlzU2hvd24gICAgICAgICAgICAgPSBudWxsXG4gICAgdGhpcy5vcmlnaW5hbEJvZHlQYWQgICAgID0gbnVsbFxuICAgIHRoaXMuc2Nyb2xsYmFyV2lkdGggICAgICA9IDBcbiAgICB0aGlzLmlnbm9yZUJhY2tkcm9wQ2xpY2sgPSBmYWxzZVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5yZW1vdGUpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgLmZpbmQoJy5tb2RhbC1jb250ZW50JylcbiAgICAgICAgLmxvYWQodGhpcy5vcHRpb25zLnJlbW90ZSwgJC5wcm94eShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdsb2FkZWQuYnMubW9kYWwnKVxuICAgICAgICB9LCB0aGlzKSlcbiAgICB9XG4gIH1cblxuICBNb2RhbC5WRVJTSU9OICA9ICczLjMuNydcblxuICBNb2RhbC5UUkFOU0lUSU9OX0RVUkFUSU9OID0gMzAwXG4gIE1vZGFsLkJBQ0tEUk9QX1RSQU5TSVRJT05fRFVSQVRJT04gPSAxNTBcblxuICBNb2RhbC5ERUZBVUxUUyA9IHtcbiAgICBiYWNrZHJvcDogdHJ1ZSxcbiAgICBrZXlib2FyZDogdHJ1ZSxcbiAgICBzaG93OiB0cnVlXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKF9yZWxhdGVkVGFyZ2V0KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNTaG93biA/IHRoaXMuaGlkZSgpIDogdGhpcy5zaG93KF9yZWxhdGVkVGFyZ2V0KVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoX3JlbGF0ZWRUYXJnZXQpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICB2YXIgZSAgICA9ICQuRXZlbnQoJ3Nob3cuYnMubW9kYWwnLCB7IHJlbGF0ZWRUYXJnZXQ6IF9yZWxhdGVkVGFyZ2V0IH0pXG5cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcblxuICAgIGlmICh0aGlzLmlzU2hvd24gfHwgZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICB0aGlzLmlzU2hvd24gPSB0cnVlXG5cbiAgICB0aGlzLmNoZWNrU2Nyb2xsYmFyKClcbiAgICB0aGlzLnNldFNjcm9sbGJhcigpXG4gICAgdGhpcy4kYm9keS5hZGRDbGFzcygnbW9kYWwtb3BlbicpXG5cbiAgICB0aGlzLmVzY2FwZSgpXG4gICAgdGhpcy5yZXNpemUoKVxuXG4gICAgdGhpcy4kZWxlbWVudC5vbignY2xpY2suZGlzbWlzcy5icy5tb2RhbCcsICdbZGF0YS1kaXNtaXNzPVwibW9kYWxcIl0nLCAkLnByb3h5KHRoaXMuaGlkZSwgdGhpcykpXG5cbiAgICB0aGlzLiRkaWFsb2cub24oJ21vdXNlZG93bi5kaXNtaXNzLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuICAgICAgdGhhdC4kZWxlbWVudC5vbmUoJ21vdXNldXAuZGlzbWlzcy5icy5tb2RhbCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICgkKGUudGFyZ2V0KS5pcyh0aGF0LiRlbGVtZW50KSkgdGhhdC5pZ25vcmVCYWNrZHJvcENsaWNrID0gdHJ1ZVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5iYWNrZHJvcChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdHJhbnNpdGlvbiA9ICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoYXQuJGVsZW1lbnQuaGFzQ2xhc3MoJ2ZhZGUnKVxuXG4gICAgICBpZiAoIXRoYXQuJGVsZW1lbnQucGFyZW50KCkubGVuZ3RoKSB7XG4gICAgICAgIHRoYXQuJGVsZW1lbnQuYXBwZW5kVG8odGhhdC4kYm9keSkgLy8gZG9uJ3QgbW92ZSBtb2RhbHMgZG9tIHBvc2l0aW9uXG4gICAgICB9XG5cbiAgICAgIHRoYXQuJGVsZW1lbnRcbiAgICAgICAgLnNob3coKVxuICAgICAgICAuc2Nyb2xsVG9wKDApXG5cbiAgICAgIHRoYXQuYWRqdXN0RGlhbG9nKClcblxuICAgICAgaWYgKHRyYW5zaXRpb24pIHtcbiAgICAgICAgdGhhdC4kZWxlbWVudFswXS5vZmZzZXRXaWR0aCAvLyBmb3JjZSByZWZsb3dcbiAgICAgIH1cblxuICAgICAgdGhhdC4kZWxlbWVudC5hZGRDbGFzcygnaW4nKVxuXG4gICAgICB0aGF0LmVuZm9yY2VGb2N1cygpXG5cbiAgICAgIHZhciBlID0gJC5FdmVudCgnc2hvd24uYnMubW9kYWwnLCB7IHJlbGF0ZWRUYXJnZXQ6IF9yZWxhdGVkVGFyZ2V0IH0pXG5cbiAgICAgIHRyYW5zaXRpb24gP1xuICAgICAgICB0aGF0LiRkaWFsb2cgLy8gd2FpdCBmb3IgbW9kYWwgdG8gc2xpZGUgaW5cbiAgICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGF0LiRlbGVtZW50LnRyaWdnZXIoJ2ZvY3VzJykudHJpZ2dlcihlKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKE1vZGFsLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcbiAgICAgICAgdGhhdC4kZWxlbWVudC50cmlnZ2VyKCdmb2N1cycpLnRyaWdnZXIoZSlcbiAgICB9KVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlKSBlLnByZXZlbnREZWZhdWx0KClcblxuICAgIGUgPSAkLkV2ZW50KCdoaWRlLmJzLm1vZGFsJylcblxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxuXG4gICAgaWYgKCF0aGlzLmlzU2hvd24gfHwgZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICB0aGlzLmlzU2hvd24gPSBmYWxzZVxuXG4gICAgdGhpcy5lc2NhcGUoKVxuICAgIHRoaXMucmVzaXplKClcblxuICAgICQoZG9jdW1lbnQpLm9mZignZm9jdXNpbi5icy5tb2RhbCcpXG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAucmVtb3ZlQ2xhc3MoJ2luJylcbiAgICAgIC5vZmYoJ2NsaWNrLmRpc21pc3MuYnMubW9kYWwnKVxuICAgICAgLm9mZignbW91c2V1cC5kaXNtaXNzLmJzLm1vZGFsJylcblxuICAgIHRoaXMuJGRpYWxvZy5vZmYoJ21vdXNlZG93bi5kaXNtaXNzLmJzLm1vZGFsJylcblxuICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2ZhZGUnKSA/XG4gICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsICQucHJveHkodGhpcy5oaWRlTW9kYWwsIHRoaXMpKVxuICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoTW9kYWwuVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgdGhpcy5oaWRlTW9kYWwoKVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLmVuZm9yY2VGb2N1cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAkKGRvY3VtZW50KVxuICAgICAgLm9mZignZm9jdXNpbi5icy5tb2RhbCcpIC8vIGd1YXJkIGFnYWluc3QgaW5maW5pdGUgZm9jdXMgbG9vcFxuICAgICAgLm9uKCdmb2N1c2luLmJzLm1vZGFsJywgJC5wcm94eShmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoZG9jdW1lbnQgIT09IGUudGFyZ2V0ICYmXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50WzBdICE9PSBlLnRhcmdldCAmJlxuICAgICAgICAgICAgIXRoaXMuJGVsZW1lbnQuaGFzKGUudGFyZ2V0KS5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2ZvY3VzJylcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcykpXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuZXNjYXBlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmlzU2hvd24gJiYgdGhpcy5vcHRpb25zLmtleWJvYXJkKSB7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdrZXlkb3duLmRpc21pc3MuYnMubW9kYWwnLCAkLnByb3h5KGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUud2hpY2ggPT0gMjcgJiYgdGhpcy5oaWRlKClcbiAgICAgIH0sIHRoaXMpKVxuICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNTaG93bikge1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ2tleWRvd24uZGlzbWlzcy5icy5tb2RhbCcpXG4gICAgfVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5pc1Nob3duKSB7XG4gICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5icy5tb2RhbCcsICQucHJveHkodGhpcy5oYW5kbGVVcGRhdGUsIHRoaXMpKVxuICAgIH0gZWxzZSB7XG4gICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuYnMubW9kYWwnKVxuICAgIH1cbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5oaWRlTW9kYWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgdGhpcy4kZWxlbWVudC5oaWRlKClcbiAgICB0aGlzLmJhY2tkcm9wKGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoYXQuJGJvZHkucmVtb3ZlQ2xhc3MoJ21vZGFsLW9wZW4nKVxuICAgICAgdGhhdC5yZXNldEFkanVzdG1lbnRzKClcbiAgICAgIHRoYXQucmVzZXRTY3JvbGxiYXIoKVxuICAgICAgdGhhdC4kZWxlbWVudC50cmlnZ2VyKCdoaWRkZW4uYnMubW9kYWwnKVxuICAgIH0pXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUucmVtb3ZlQmFja2Ryb3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy4kYmFja2Ryb3AgJiYgdGhpcy4kYmFja2Ryb3AucmVtb3ZlKClcbiAgICB0aGlzLiRiYWNrZHJvcCA9IG51bGxcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5iYWNrZHJvcCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuICAgIHZhciBhbmltYXRlID0gdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZmFkZScpID8gJ2ZhZGUnIDogJydcblxuICAgIGlmICh0aGlzLmlzU2hvd24gJiYgdGhpcy5vcHRpb25zLmJhY2tkcm9wKSB7XG4gICAgICB2YXIgZG9BbmltYXRlID0gJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgYW5pbWF0ZVxuXG4gICAgICB0aGlzLiRiYWNrZHJvcCA9ICQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpXG4gICAgICAgIC5hZGRDbGFzcygnbW9kYWwtYmFja2Ryb3AgJyArIGFuaW1hdGUpXG4gICAgICAgIC5hcHBlbmRUbyh0aGlzLiRib2R5KVxuXG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdjbGljay5kaXNtaXNzLmJzLm1vZGFsJywgJC5wcm94eShmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAodGhpcy5pZ25vcmVCYWNrZHJvcENsaWNrKSB7XG4gICAgICAgICAgdGhpcy5pZ25vcmVCYWNrZHJvcENsaWNrID0gZmFsc2VcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAoZS50YXJnZXQgIT09IGUuY3VycmVudFRhcmdldCkgcmV0dXJuXG4gICAgICAgIHRoaXMub3B0aW9ucy5iYWNrZHJvcCA9PSAnc3RhdGljJ1xuICAgICAgICAgID8gdGhpcy4kZWxlbWVudFswXS5mb2N1cygpXG4gICAgICAgICAgOiB0aGlzLmhpZGUoKVxuICAgICAgfSwgdGhpcykpXG5cbiAgICAgIGlmIChkb0FuaW1hdGUpIHRoaXMuJGJhY2tkcm9wWzBdLm9mZnNldFdpZHRoIC8vIGZvcmNlIHJlZmxvd1xuXG4gICAgICB0aGlzLiRiYWNrZHJvcC5hZGRDbGFzcygnaW4nKVxuXG4gICAgICBpZiAoIWNhbGxiYWNrKSByZXR1cm5cblxuICAgICAgZG9BbmltYXRlID9cbiAgICAgICAgdGhpcy4kYmFja2Ryb3BcbiAgICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBjYWxsYmFjaylcbiAgICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoTW9kYWwuQkFDS0RST1BfVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgICBjYWxsYmFjaygpXG5cbiAgICB9IGVsc2UgaWYgKCF0aGlzLmlzU2hvd24gJiYgdGhpcy4kYmFja2Ryb3ApIHtcbiAgICAgIHRoaXMuJGJhY2tkcm9wLnJlbW92ZUNsYXNzKCdpbicpXG5cbiAgICAgIHZhciBjYWxsYmFja1JlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhhdC5yZW1vdmVCYWNrZHJvcCgpXG4gICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKClcbiAgICAgIH1cbiAgICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2ZhZGUnKSA/XG4gICAgICAgIHRoaXMuJGJhY2tkcm9wXG4gICAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgY2FsbGJhY2tSZW1vdmUpXG4gICAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKE1vZGFsLkJBQ0tEUk9QX1RSQU5TSVRJT05fRFVSQVRJT04pIDpcbiAgICAgICAgY2FsbGJhY2tSZW1vdmUoKVxuXG4gICAgfSBlbHNlIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2soKVxuICAgIH1cbiAgfVxuXG4gIC8vIHRoZXNlIGZvbGxvd2luZyBtZXRob2RzIGFyZSB1c2VkIHRvIGhhbmRsZSBvdmVyZmxvd2luZyBtb2RhbHNcblxuICBNb2RhbC5wcm90b3R5cGUuaGFuZGxlVXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYWRqdXN0RGlhbG9nKClcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5hZGp1c3REaWFsb2cgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG1vZGFsSXNPdmVyZmxvd2luZyA9IHRoaXMuJGVsZW1lbnRbMF0uc2Nyb2xsSGVpZ2h0ID4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodFxuXG4gICAgdGhpcy4kZWxlbWVudC5jc3Moe1xuICAgICAgcGFkZGluZ0xlZnQ6ICAhdGhpcy5ib2R5SXNPdmVyZmxvd2luZyAmJiBtb2RhbElzT3ZlcmZsb3dpbmcgPyB0aGlzLnNjcm9sbGJhcldpZHRoIDogJycsXG4gICAgICBwYWRkaW5nUmlnaHQ6IHRoaXMuYm9keUlzT3ZlcmZsb3dpbmcgJiYgIW1vZGFsSXNPdmVyZmxvd2luZyA/IHRoaXMuc2Nyb2xsYmFyV2lkdGggOiAnJ1xuICAgIH0pXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUucmVzZXRBZGp1c3RtZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLiRlbGVtZW50LmNzcyh7XG4gICAgICBwYWRkaW5nTGVmdDogJycsXG4gICAgICBwYWRkaW5nUmlnaHQ6ICcnXG4gICAgfSlcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5jaGVja1Njcm9sbGJhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZnVsbFdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICBpZiAoIWZ1bGxXaW5kb3dXaWR0aCkgeyAvLyB3b3JrYXJvdW5kIGZvciBtaXNzaW5nIHdpbmRvdy5pbm5lcldpZHRoIGluIElFOFxuICAgICAgdmFyIGRvY3VtZW50RWxlbWVudFJlY3QgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGZ1bGxXaW5kb3dXaWR0aCA9IGRvY3VtZW50RWxlbWVudFJlY3QucmlnaHQgLSBNYXRoLmFicyhkb2N1bWVudEVsZW1lbnRSZWN0LmxlZnQpXG4gICAgfVxuICAgIHRoaXMuYm9keUlzT3ZlcmZsb3dpbmcgPSBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoIDwgZnVsbFdpbmRvd1dpZHRoXG4gICAgdGhpcy5zY3JvbGxiYXJXaWR0aCA9IHRoaXMubWVhc3VyZVNjcm9sbGJhcigpXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuc2V0U2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBib2R5UGFkID0gcGFyc2VJbnQoKHRoaXMuJGJvZHkuY3NzKCdwYWRkaW5nLXJpZ2h0JykgfHwgMCksIDEwKVxuICAgIHRoaXMub3JpZ2luYWxCb2R5UGFkID0gZG9jdW1lbnQuYm9keS5zdHlsZS5wYWRkaW5nUmlnaHQgfHwgJydcbiAgICBpZiAodGhpcy5ib2R5SXNPdmVyZmxvd2luZykgdGhpcy4kYm9keS5jc3MoJ3BhZGRpbmctcmlnaHQnLCBib2R5UGFkICsgdGhpcy5zY3JvbGxiYXJXaWR0aClcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5yZXNldFNjcm9sbGJhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLiRib2R5LmNzcygncGFkZGluZy1yaWdodCcsIHRoaXMub3JpZ2luYWxCb2R5UGFkKVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLm1lYXN1cmVTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7IC8vIHRoeCB3YWxzaFxuICAgIHZhciBzY3JvbGxEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHNjcm9sbERpdi5jbGFzc05hbWUgPSAnbW9kYWwtc2Nyb2xsYmFyLW1lYXN1cmUnXG4gICAgdGhpcy4kYm9keS5hcHBlbmQoc2Nyb2xsRGl2KVxuICAgIHZhciBzY3JvbGxiYXJXaWR0aCA9IHNjcm9sbERpdi5vZmZzZXRXaWR0aCAtIHNjcm9sbERpdi5jbGllbnRXaWR0aFxuICAgIHRoaXMuJGJvZHlbMF0ucmVtb3ZlQ2hpbGQoc2Nyb2xsRGl2KVxuICAgIHJldHVybiBzY3JvbGxiYXJXaWR0aFxuICB9XG5cblxuICAvLyBNT0RBTCBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24sIF9yZWxhdGVkVGFyZ2V0KSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMubW9kYWwnKVxuICAgICAgdmFyIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgTW9kYWwuREVGQVVMVFMsICR0aGlzLmRhdGEoKSwgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pXG5cbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMubW9kYWwnLCAoZGF0YSA9IG5ldyBNb2RhbCh0aGlzLCBvcHRpb25zKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKF9yZWxhdGVkVGFyZ2V0KVxuICAgICAgZWxzZSBpZiAob3B0aW9ucy5zaG93KSBkYXRhLnNob3coX3JlbGF0ZWRUYXJnZXQpXG4gICAgfSlcbiAgfVxuXG4gIHZhciBvbGQgPSAkLmZuLm1vZGFsXG5cbiAgJC5mbi5tb2RhbCAgICAgICAgICAgICA9IFBsdWdpblxuICAkLmZuLm1vZGFsLkNvbnN0cnVjdG9yID0gTW9kYWxcblxuXG4gIC8vIE1PREFMIE5PIENPTkZMSUNUXG4gIC8vID09PT09PT09PT09PT09PT09XG5cbiAgJC5mbi5tb2RhbC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4ubW9kYWwgPSBvbGRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cblxuICAvLyBNT0RBTCBEQVRBLUFQSVxuICAvLyA9PT09PT09PT09PT09PVxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljay5icy5tb2RhbC5kYXRhLWFwaScsICdbZGF0YS10b2dnbGU9XCJtb2RhbFwiXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXG4gICAgdmFyIGhyZWYgICAgPSAkdGhpcy5hdHRyKCdocmVmJylcbiAgICB2YXIgJHRhcmdldCA9ICQoJHRoaXMuYXR0cignZGF0YS10YXJnZXQnKSB8fCAoaHJlZiAmJiBocmVmLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sICcnKSkpIC8vIHN0cmlwIGZvciBpZTdcbiAgICB2YXIgb3B0aW9uICA9ICR0YXJnZXQuZGF0YSgnYnMubW9kYWwnKSA/ICd0b2dnbGUnIDogJC5leHRlbmQoeyByZW1vdGU6ICEvIy8udGVzdChocmVmKSAmJiBocmVmIH0sICR0YXJnZXQuZGF0YSgpLCAkdGhpcy5kYXRhKCkpXG5cbiAgICBpZiAoJHRoaXMuaXMoJ2EnKSkgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAkdGFyZ2V0Lm9uZSgnc2hvdy5icy5tb2RhbCcsIGZ1bmN0aW9uIChzaG93RXZlbnQpIHtcbiAgICAgIGlmIChzaG93RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVybiAvLyBvbmx5IHJlZ2lzdGVyIGZvY3VzIHJlc3RvcmVyIGlmIG1vZGFsIHdpbGwgYWN0dWFsbHkgZ2V0IHNob3duXG4gICAgICAkdGFyZ2V0Lm9uZSgnaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkdGhpcy5pcygnOnZpc2libGUnKSAmJiAkdGhpcy50cmlnZ2VyKCdmb2N1cycpXG4gICAgICB9KVxuICAgIH0pXG4gICAgUGx1Z2luLmNhbGwoJHRhcmdldCwgb3B0aW9uLCB0aGlzKVxuICB9KVxuXG59KGpRdWVyeSk7XG4iLCIvKiFcbiAqIEphdmFTY3JpcHQgQ29va2llIHYyLjIuMFxuICogaHR0cHM6Ly9naXRodWIuY29tL2pzLWNvb2tpZS9qcy1jb29raWVcbiAqXG4gKiBDb3B5cmlnaHQgMjAwNiwgMjAxNSBLbGF1cyBIYXJ0bCAmIEZhZ25lciBCcmFja1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbjsoZnVuY3Rpb24gKGZhY3RvcnkpIHtcblx0dmFyIHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IGZhbHNlO1xuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0ZGVmaW5lKGZhY3RvcnkpO1xuXHRcdHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IHRydWU7XG5cdH1cblx0aWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRcdHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IHRydWU7XG5cdH1cblx0aWYgKCFyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIpIHtcblx0XHR2YXIgT2xkQ29va2llcyA9IHdpbmRvdy5Db29raWVzO1xuXHRcdHZhciBhcGkgPSB3aW5kb3cuQ29va2llcyA9IGZhY3RvcnkoKTtcblx0XHRhcGkubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHdpbmRvdy5Db29raWVzID0gT2xkQ29va2llcztcblx0XHRcdHJldHVybiBhcGk7XG5cdFx0fTtcblx0fVxufShmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIGV4dGVuZCAoKSB7XG5cdFx0dmFyIGkgPSAwO1xuXHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGF0dHJpYnV0ZXMgPSBhcmd1bWVudHNbIGkgXTtcblx0XHRcdGZvciAodmFyIGtleSBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdHJlc3VsdFtrZXldID0gYXR0cmlidXRlc1trZXldO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdCAoY29udmVydGVyKSB7XG5cdFx0ZnVuY3Rpb24gYXBpIChrZXksIHZhbHVlLCBhdHRyaWJ1dGVzKSB7XG5cdFx0XHR2YXIgcmVzdWx0O1xuXHRcdFx0aWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBXcml0ZVxuXG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0YXR0cmlidXRlcyA9IGV4dGVuZCh7XG5cdFx0XHRcdFx0cGF0aDogJy8nXG5cdFx0XHRcdH0sIGFwaS5kZWZhdWx0cywgYXR0cmlidXRlcyk7XG5cblx0XHRcdFx0aWYgKHR5cGVvZiBhdHRyaWJ1dGVzLmV4cGlyZXMgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdFx0dmFyIGV4cGlyZXMgPSBuZXcgRGF0ZSgpO1xuXHRcdFx0XHRcdGV4cGlyZXMuc2V0TWlsbGlzZWNvbmRzKGV4cGlyZXMuZ2V0TWlsbGlzZWNvbmRzKCkgKyBhdHRyaWJ1dGVzLmV4cGlyZXMgKiA4NjRlKzUpO1xuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyA9IGV4cGlyZXM7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBXZSdyZSB1c2luZyBcImV4cGlyZXNcIiBiZWNhdXNlIFwibWF4LWFnZVwiIGlzIG5vdCBzdXBwb3J0ZWQgYnkgSUVcblx0XHRcdFx0YXR0cmlidXRlcy5leHBpcmVzID0gYXR0cmlidXRlcy5leHBpcmVzID8gYXR0cmlidXRlcy5leHBpcmVzLnRvVVRDU3RyaW5nKCkgOiAnJztcblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHJlc3VsdCA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcblx0XHRcdFx0XHRpZiAoL15bXFx7XFxbXS8udGVzdChyZXN1bHQpKSB7XG5cdFx0XHRcdFx0XHR2YWx1ZSA9IHJlc3VsdDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cblx0XHRcdFx0aWYgKCFjb252ZXJ0ZXIud3JpdGUpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcodmFsdWUpKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoLyUoMjN8MjR8MjZ8MkJ8M0F8M0N8M0V8M0R8MkZ8M0Z8NDB8NUJ8NUR8NUV8NjB8N0J8N0R8N0MpL2csIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBjb252ZXJ0ZXIud3JpdGUodmFsdWUsIGtleSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRrZXkgPSBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKGtleSkpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnw1RXw2MHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoL1tcXChcXCldL2csIGVzY2FwZSk7XG5cblx0XHRcdFx0dmFyIHN0cmluZ2lmaWVkQXR0cmlidXRlcyA9ICcnO1xuXG5cdFx0XHRcdGZvciAodmFyIGF0dHJpYnV0ZU5hbWUgaW4gYXR0cmlidXRlcykge1xuXHRcdFx0XHRcdGlmICghYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSkge1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHN0cmluZ2lmaWVkQXR0cmlidXRlcyArPSAnOyAnICsgYXR0cmlidXRlTmFtZTtcblx0XHRcdFx0XHRpZiAoYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHN0cmluZ2lmaWVkQXR0cmlidXRlcyArPSAnPScgKyBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAoZG9jdW1lbnQuY29va2llID0ga2V5ICsgJz0nICsgdmFsdWUgKyBzdHJpbmdpZmllZEF0dHJpYnV0ZXMpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBSZWFkXG5cblx0XHRcdGlmICgha2V5KSB7XG5cdFx0XHRcdHJlc3VsdCA9IHt9O1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBUbyBwcmV2ZW50IHRoZSBmb3IgbG9vcCBpbiB0aGUgZmlyc3QgcGxhY2UgYXNzaWduIGFuIGVtcHR5IGFycmF5XG5cdFx0XHQvLyBpbiBjYXNlIHRoZXJlIGFyZSBubyBjb29raWVzIGF0IGFsbC4gQWxzbyBwcmV2ZW50cyBvZGQgcmVzdWx0IHdoZW5cblx0XHRcdC8vIGNhbGxpbmcgXCJnZXQoKVwiXG5cdFx0XHR2YXIgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZSA/IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOyAnKSA6IFtdO1xuXHRcdFx0dmFyIHJkZWNvZGUgPSAvKCVbMC05QS1aXXsyfSkrL2c7XG5cdFx0XHR2YXIgaSA9IDA7XG5cblx0XHRcdGZvciAoOyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcGFydHMgPSBjb29raWVzW2ldLnNwbGl0KCc9Jyk7XG5cdFx0XHRcdHZhciBjb29raWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCc9Jyk7XG5cblx0XHRcdFx0aWYgKCF0aGlzLmpzb24gJiYgY29va2llLmNoYXJBdCgwKSA9PT0gJ1wiJykge1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvb2tpZS5zbGljZSgxLCAtMSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHZhciBuYW1lID0gcGFydHNbMF0ucmVwbGFjZShyZGVjb2RlLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvbnZlcnRlci5yZWFkID9cblx0XHRcdFx0XHRcdGNvbnZlcnRlci5yZWFkKGNvb2tpZSwgbmFtZSkgOiBjb252ZXJ0ZXIoY29va2llLCBuYW1lKSB8fFxuXHRcdFx0XHRcdFx0Y29va2llLnJlcGxhY2UocmRlY29kZSwgZGVjb2RlVVJJQ29tcG9uZW50KTtcblxuXHRcdFx0XHRcdGlmICh0aGlzLmpzb24pIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGNvb2tpZSA9IEpTT04ucGFyc2UoY29va2llKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGtleSA9PT0gbmFtZSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0ID0gY29va2llO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCFrZXkpIHtcblx0XHRcdFx0XHRcdHJlc3VsdFtuYW1lXSA9IGNvb2tpZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXG5cdFx0YXBpLnNldCA9IGFwaTtcblx0XHRhcGkuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0cmV0dXJuIGFwaS5jYWxsKGFwaSwga2V5KTtcblx0XHR9O1xuXHRcdGFwaS5nZXRKU09OID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGFwaS5hcHBseSh7XG5cdFx0XHRcdGpzb246IHRydWVcblx0XHRcdH0sIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG5cdFx0fTtcblx0XHRhcGkuZGVmYXVsdHMgPSB7fTtcblxuXHRcdGFwaS5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5LCBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRhcGkoa2V5LCAnJywgZXh0ZW5kKGF0dHJpYnV0ZXMsIHtcblx0XHRcdFx0ZXhwaXJlczogLTFcblx0XHRcdH0pKTtcblx0XHR9O1xuXG5cdFx0YXBpLndpdGhDb252ZXJ0ZXIgPSBpbml0O1xuXG5cdFx0cmV0dXJuIGFwaTtcblx0fVxuXG5cdHJldHVybiBpbml0KGZ1bmN0aW9uICgpIHt9KTtcbn0pKTtcbiIsIi8vIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gfCBMYXlvdXRcbi8vIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gfFxuLy8gfCBUaGlzIGpRdWVyeSBzY3JpcHQgaXMgd3JpdHRlbiBieVxuLy8gfFxuLy8gfCBNb3J0ZW4gTmlzc2VuXG4vLyB8IGhqZW1tZXNpZGVrb25nZW4uZGtcbi8vIHxcbnZhciBsYXlvdXQgPSAoZnVuY3Rpb24gKCQpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgcHViID0ge30sXG4gICAgICAgICRsYXlvdXRfX2hlYWRlciA9ICQoJy5sYXlvdXRfX2hlYWRlcicpLFxuICAgICAgICAkbGF5b3V0X19kb2N1bWVudCA9ICQoJy5sYXlvdXRfX2RvY3VtZW50JyksXG4gICAgICAgIGxheW91dF9jbGFzc2VzID0ge1xuICAgICAgICAgICAgJ2xheW91dF9fd3JhcHBlcic6ICcubGF5b3V0X193cmFwcGVyJyxcbiAgICAgICAgICAgICdsYXlvdXRfX2RyYXdlcic6ICcubGF5b3V0X19kcmF3ZXInLFxuICAgICAgICAgICAgJ2xheW91dF9faGVhZGVyJzogJy5sYXlvdXRfX2hlYWRlcicsXG4gICAgICAgICAgICAnbGF5b3V0X19vYmZ1c2NhdG9yJzogJy5sYXlvdXRfX29iZnVzY2F0b3InLFxuICAgICAgICAgICAgJ2xheW91dF9fZG9jdW1lbnQnOiAnLmxheW91dF9fZG9jdW1lbnQnLFxuXG4gICAgICAgICAgICAnd3JhcHBlcl9pc191cGdyYWRlZCc6ICdpcy11cGdyYWRlZCcsXG4gICAgICAgICAgICAnd3JhcHBlcl9oYXNfZHJhd2VyJzogJ2hhcy1kcmF3ZXInLFxuICAgICAgICAgICAgJ3dyYXBwZXJfaGFzX3Njcm9sbGluZ19oZWFkZXInOiAnaGFzLXNjcm9sbGluZy1oZWFkZXInLFxuICAgICAgICAgICAgJ2hlYWRlcl9zY3JvbGwnOiAnbGF5b3V0X19oZWFkZXItLXNjcm9sbCcsXG4gICAgICAgICAgICAnaGVhZGVyX2lzX2NvbXBhY3QnOiAnaXMtY29tcGFjdCcsXG4gICAgICAgICAgICAnaGVhZGVyX3dhdGVyZmFsbCc6ICdsYXlvdXRfX2hlYWRlci0td2F0ZXJmYWxsJyxcbiAgICAgICAgICAgICdkcmF3ZXJfaXNfdmlzaWJsZSc6ICdpcy12aXNpYmxlJyxcbiAgICAgICAgICAgICdvYmZ1c2NhdG9yX2lzX3Zpc2libGUnOiAnaXMtdmlzaWJsZSdcbiAgICAgICAgfTtcblxuICAgIC8qKlxuICAgICAqIEluc3RhbnRpYXRlXG4gICAgICovXG4gICAgcHViLmluaXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICByZWdpc3RlckV2ZW50SGFuZGxlcnMoKTtcbiAgICAgICAgcmVnaXN0ZXJCb290RXZlbnRIYW5kbGVycygpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBib290IGV2ZW50IGhhbmRsZXJzXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVnaXN0ZXJCb290RXZlbnRIYW5kbGVycygpIHtcblxuICAgICAgICAvLyBBZGQgY2xhc3NlcyB0byBlbGVtZW50c1xuICAgICAgICBhZGRFbGVtZW50Q2xhc3NlcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGV2ZW50IGhhbmRsZXJzXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVnaXN0ZXJFdmVudEhhbmRsZXJzKCkge1xuXG4gICAgICAgIC8vIFRvZ2dsZSBkcmF3ZXJcbiAgICAgICAgJCgnW2RhdGEtdG9nZ2xlLWRyYXdlcl0nKS5hZGQoJChsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX29iZnVzY2F0b3IpKS5vbignY2xpY2sgdG91Y2hzdGFydCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdmFyICRlbGVtZW50ID0gJCh0aGlzKTtcblxuICAgICAgICAgICAgdG9nZ2xlRHJhd2VyKCRlbGVtZW50KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gV2F0ZXJmYWxsIGhlYWRlclxuICAgICAgICBpZiAoJGxheW91dF9faGVhZGVyLmhhc0NsYXNzKGxheW91dF9jbGFzc2VzLmhlYWRlcl93YXRlcmZhbGwpKSB7XG5cbiAgICAgICAgICAgICRsYXlvdXRfX2RvY3VtZW50Lm9uKCd0b3VjaG1vdmUgc2Nyb2xsJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgJGRvY3VtZW50ID0gJCh0aGlzKTtcblxuICAgICAgICAgICAgICAgIHdhdGVyZmFsbEhlYWRlcigkZG9jdW1lbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgZHJhd2VyXG4gICAgICovXG4gICAgZnVuY3Rpb24gdG9nZ2xlRHJhd2VyKCRlbGVtZW50KSB7XG4gICAgICAgIHZhciAkd3JhcHBlciA9ICRlbGVtZW50LmNsb3Nlc3QobGF5b3V0X2NsYXNzZXMubGF5b3V0X193cmFwcGVyKSxcbiAgICAgICAgICAgICRvYmZ1c2NhdG9yID0gJHdyYXBwZXIuY2hpbGRyZW4obGF5b3V0X2NsYXNzZXMubGF5b3V0X19vYmZ1c2NhdG9yKSxcbiAgICAgICAgICAgICRkcmF3ZXIgPSAkd3JhcHBlci5jaGlsZHJlbihsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX2RyYXdlcik7XG5cbiAgICAgICAgLy8gVG9nZ2xlIHZpc2libGUgc3RhdGVcbiAgICAgICAgJG9iZnVzY2F0b3IudG9nZ2xlQ2xhc3MobGF5b3V0X2NsYXNzZXMub2JmdXNjYXRvcl9pc192aXNpYmxlKTtcbiAgICAgICAgJGRyYXdlci50b2dnbGVDbGFzcyhsYXlvdXRfY2xhc3Nlcy5kcmF3ZXJfaXNfdmlzaWJsZSk7XG5cbiAgICAgICAgLy8gQWx0ZXIgYXJpYS1oaWRkZW4gc3RhdHVzXG4gICAgICAgICRkcmF3ZXIuYXR0cignYXJpYS1oaWRkZW4nLCAoJGRyYXdlci5oYXNDbGFzcyhsYXlvdXRfY2xhc3Nlcy5kcmF3ZXJfaXNfdmlzaWJsZSkpID8gZmFsc2UgOiB0cnVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXYXRlcmZhbGwgaGVhZGVyXG4gICAgICovXG4gICAgZnVuY3Rpb24gd2F0ZXJmYWxsSGVhZGVyKCRkb2N1bWVudCkge1xuICAgICAgICB2YXIgJHdyYXBwZXIgPSAkZG9jdW1lbnQuY2xvc2VzdChsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX3dyYXBwZXIpLFxuICAgICAgICAgICAgJGhlYWRlciA9ICR3cmFwcGVyLmNoaWxkcmVuKGxheW91dF9jbGFzc2VzLmxheW91dF9faGVhZGVyKSxcbiAgICAgICAgICAgIGRpc3RhbmNlID0gJGRvY3VtZW50LnNjcm9sbFRvcCgpO1xuXG4gICAgICAgIGlmIChkaXN0YW5jZSA+IDApIHtcbiAgICAgICAgICAgICRoZWFkZXIuYWRkQ2xhc3MobGF5b3V0X2NsYXNzZXMuaGVhZGVyX2lzX2NvbXBhY3QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgJGhlYWRlci5yZW1vdmVDbGFzcyhsYXlvdXRfY2xhc3Nlcy5oZWFkZXJfaXNfY29tcGFjdCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgY2xhc3NlcyB0byBlbGVtZW50cywgYmFzZWQgb24gYXR0YWNoZWQgY2xhc3Nlc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFkZEVsZW1lbnRDbGFzc2VzKCkge1xuXG4gICAgICAgICQobGF5b3V0X2NsYXNzZXMubGF5b3V0X193cmFwcGVyKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgJHdyYXBwZXIgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgICRoZWFkZXIgPSAkd3JhcHBlci5jaGlsZHJlbihsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX2hlYWRlciksXG4gICAgICAgICAgICAgICAgJGRyYXdlciA9ICR3cmFwcGVyLmNoaWxkcmVuKGxheW91dF9jbGFzc2VzLmxheW91dF9fZHJhd2VyKTtcblxuICAgICAgICAgICAgLy8gU2Nyb2xsIGhlYWRlclxuICAgICAgICAgICAgaWYgKCRoZWFkZXIuaGFzQ2xhc3MobGF5b3V0X2NsYXNzZXMuaGVhZGVyX3Njcm9sbCkpIHtcbiAgICAgICAgICAgICAgICAkd3JhcHBlci5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy53cmFwcGVyX2hhc19zY3JvbGxpbmdfaGVhZGVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRHJhd2VyXG4gICAgICAgICAgICBpZiAoJGRyYXdlci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgJHdyYXBwZXIuYWRkQ2xhc3MobGF5b3V0X2NsYXNzZXMud3JhcHBlcl9oYXNfZHJhd2VyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXBncmFkZWRcbiAgICAgICAgICAgIGlmICgkd3JhcHBlci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgJHdyYXBwZXIuYWRkQ2xhc3MobGF5b3V0X2NsYXNzZXMud3JhcHBlcl9pc191cGdyYWRlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBwdWI7XG59KShqUXVlcnkpO1xuIiwiLy8gRG9jdW1lbnQgcmVhZHlcbihmdW5jdGlvbiAoJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gRW5hYmxlIGxheW91dFxuICBsYXlvdXQuaW5pdCgpO1xuXG4gIC8vIE5vdGlmeVxuICB2YXIgJG5vdGlmaWNhdGlvbnMgPSAkKCcubm90aWZ5Jyk7XG4gIGlmICgkbm90aWZpY2F0aW9ucy5sZW5ndGgpIHtcblxuICAgICRub3RpZmljYXRpb25zLmVhY2goZnVuY3Rpb24oaW5kZXgsIHZhbCkge1xuICAgICAgdmFyICRkb2N1bWVudCA9ICQoJy5sYXlvdXRfX2RvY3VtZW50JyksXG4gICAgICAgICAgJHJlZ2lvbiA9ICQoJy5yZWdpb24tbm90aWZ5JyksXG4gICAgICAgICAgJGVsZW1lbnQgPSAkKHRoaXMpLFxuICAgICAgICAgIGNvb2tpZV9pZCA9ICdub3RpZnlfaWRfJyArICRlbGVtZW50LmF0dHIoJ2lkJyksXG4gICAgICAgICAgJGNsb3NlID0gJGVsZW1lbnQuZmluZCgnLm5vdGlmeV9fY2xvc2UnKTtcblxuICAgICAgLy8gRmxleCBtYWdpYyAtIGZpeGluZyBkaXNwbGF5OiBibG9jayBvbiBmYWRlSW4gKHNlZTogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjg5MDQ2OTgvaG93LWZhZGUtaW4tYS1mbGV4LWJveClcbiAgICAgICRlbGVtZW50LmNzcygnZGlzcGxheScsICdmbGV4JykuaGlkZSgpO1xuXG4gICAgICAvLyBObyBjb29raWUgaGFzIGJlZW4gc2V0IHlldFxuICAgICAgaWYgKCEgQ29va2llcy5nZXQoY29va2llX2lkKSkge1xuXG4gICAgICAgIC8vIEZhZGUgdGhlIGVsZW1lbnQgaW5cbiAgICAgICAgJGVsZW1lbnRcbiAgICAgICAgICAgIC5kZWxheSgyMDAwKVxuICAgICAgICAgICAgLmZhZGVJbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIGhlaWdodCA9ICRyZWdpb24ub3V0ZXJIZWlnaHQodHJ1ZSk7XG5cbiAgICAgICAgICAgICAgJGRvY3VtZW50LmNzcygncGFkZGluZy1ib3R0b20nLCBoZWlnaHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENsb3NlZFxuICAgICAgJGNsb3NlLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICRlbGVtZW50LmZhZGVPdXQoKTtcblxuICAgICAgICAvLyBTZXQgYSBjb29raWUsIHRvIHN0b3AgdGhpcyBub3RpZmljYXRpb24gZnJvbSBiZWluZyBkaXNwbGF5ZWQgYWdhaW5cbiAgICAgICAgQ29va2llcy5zZXQoY29va2llX2lkLCB0cnVlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgJChcIiN0b2dnbGVfbW9iaWxlX21lbnVcIikuY2xpY2soZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgJCgnI21haW4tbWVudScpLnRvZ2dsZUNsYXNzKCdtb2JpbGUtbWVudS1vcGVuJyk7XG4gICAgJCgnLmxheW91dF9fZG9jdW1lbnQnKS50b2dnbGVDbGFzcygnbW9iaWxlLW1lbnUtb3BlbicpO1xuICB9KVxuXG4gIC8vU2hvdyBzZWFyY2ggZm9ybSBibG9ja1xuICAkKFwiLnNlYXJjaC1idXR0b25cIikuY2xpY2soZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKCQoXCIjc2VhcmNoLWZvcm0tcG9wb3ZlclwiKS5oYXNDbGFzcyhcImhpZGRlblwiKSkge1xuICAgICAgJChcIiNzZWFyY2gtZm9ybS1wb3BvdmVyXCIpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoXCIuZm9ybS1jb250cm9sXCIpLmZvY3VzKCk7XG4gICAgfVxuICB9KTtcblxuICAvL0hpZGUgc2VhcmNoIGZvcm0gYmxvY2tcbiAgJChkb2N1bWVudCkuY2xpY2soZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKCEkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnI3NlYXJjaC1mb3JtLXBvcG92ZXInKS5sZW5ndGggJiYgISQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcuc2VhcmNoLWJ1dHRvbicpLmxlbmd0aCkge1xuICAgICAgaWYgKCEkKFwiI3NlYXJjaC1mb3JtLXBvcG92ZXJcIikuaGFzQ2xhc3MoXCJoaWRkZW5cIikpIHtcbiAgICAgICAgJChcIiNzZWFyY2gtZm9ybS1wb3BvdmVyXCIpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8vSW1wcm92aW5nIHVzYWJpbGl0eSBmb3IgbWVudWRyb3Bkb3ducyBmb3IgbW9iaWxlIGRldmljZXNcbiAgaWYgKCEhKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykpIHsvL2NoZWNrIGZvciB0b3VjaCBkZXZpY2VcbiAgICAkKCdsaS5kcm9wZG93bi5sYXlvdXQtbmF2aWdhdGlvbl9fZHJvcGRvd24nKS5maW5kKCc+IGEnKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgICAgaWYgKCQodGhpcykucGFyZW50KCkuaGFzQ2xhc3MoXCJleHBhbmRlZFwiKSkge1xuICAgICAgICAvLyQodGhpcykucGFyZW50KCkucmVtb3ZlQ2xhc3MoXCJleHBhbmRlZFwiKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQodGhpcykucGFyZW50KCkuYWRkQ2xhc3MoXCJleHBhbmRlZFwiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBlbHNlIHsvL2tlZXBpbmcgaXQgY29tcGF0aWJsZSB3aXRoIGRlc2t0b3AgZGV2aWNlc1xuICAgICQoJ2xpLmRyb3Bkb3duLmxheW91dC1uYXZpZ2F0aW9uX19kcm9wZG93bicpLmhvdmVyKFxuICAgICAgICBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJleHBhbmRlZFwiKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZXhwYW5kZWRcIik7XG4gICAgICAgIH1cbiAgICApO1xuICB9XG5cbn0pKGpRdWVyeSk7XG4iXX0=
