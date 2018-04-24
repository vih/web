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
  });

  // Use multiple modals (https://stackoverflow.com/questions/19305821/multiple-modals-overlay)
  $(document).on('show.bs.modal', '.modal', function () {
    var zIndex = 1040 + 10 * $('.modal:visible').length;

    $(this).css('z-index', zIndex);

    setTimeout(function () {
      $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
    }, 0);
  });

  $(document).on('hidden.bs.modal', '.modal', function () {
    $('.modal:visible').length && $(document.body).addClass('modal-open');
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhYi5qcyIsImNvbGxhcHNlLmpzIiwidHJhbnNpdGlvbi5qcyIsInRvb2x0aXAuanMiLCJwb3BvdmVyLmpzIiwibW9kYWwuanMiLCJqcy5jb29raWUuanMiLCJqcXVlcnkuc2xpbmt5LmpzIiwibGF5b3V0LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIiQiLCJUYWIiLCJlbGVtZW50IiwiVkVSU0lPTiIsIlRSQU5TSVRJT05fRFVSQVRJT04iLCJwcm90b3R5cGUiLCJzaG93IiwiJHRoaXMiLCIkdWwiLCJjbG9zZXN0Iiwic2VsZWN0b3IiLCJkYXRhIiwiYXR0ciIsInJlcGxhY2UiLCJwYXJlbnQiLCJoYXNDbGFzcyIsIiRwcmV2aW91cyIsImZpbmQiLCJoaWRlRXZlbnQiLCJFdmVudCIsInJlbGF0ZWRUYXJnZXQiLCJzaG93RXZlbnQiLCJ0cmlnZ2VyIiwiaXNEZWZhdWx0UHJldmVudGVkIiwiJHRhcmdldCIsImFjdGl2YXRlIiwidHlwZSIsImNvbnRhaW5lciIsImNhbGxiYWNrIiwiJGFjdGl2ZSIsInRyYW5zaXRpb24iLCJzdXBwb3J0IiwibGVuZ3RoIiwibmV4dCIsInJlbW92ZUNsYXNzIiwiZW5kIiwiYWRkQ2xhc3MiLCJvZmZzZXRXaWR0aCIsIm9uZSIsImVtdWxhdGVUcmFuc2l0aW9uRW5kIiwiUGx1Z2luIiwib3B0aW9uIiwiZWFjaCIsIm9sZCIsImZuIiwidGFiIiwiQ29uc3RydWN0b3IiLCJub0NvbmZsaWN0IiwiY2xpY2tIYW5kbGVyIiwiZSIsInByZXZlbnREZWZhdWx0IiwiY2FsbCIsImRvY3VtZW50Iiwib24iLCJqUXVlcnkiLCJDb2xsYXBzZSIsIm9wdGlvbnMiLCIkZWxlbWVudCIsImV4dGVuZCIsIkRFRkFVTFRTIiwiJHRyaWdnZXIiLCJpZCIsInRyYW5zaXRpb25pbmciLCIkcGFyZW50IiwiZ2V0UGFyZW50IiwiYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzIiwidG9nZ2xlIiwiZGltZW5zaW9uIiwiaGFzV2lkdGgiLCJhY3RpdmVzRGF0YSIsImFjdGl2ZXMiLCJjaGlsZHJlbiIsInN0YXJ0RXZlbnQiLCJjb21wbGV0ZSIsInNjcm9sbFNpemUiLCJjYW1lbENhc2UiLCJqb2luIiwicHJveHkiLCJoaWRlIiwib2Zmc2V0SGVpZ2h0IiwiaSIsImdldFRhcmdldEZyb21UcmlnZ2VyIiwiaXNPcGVuIiwidG9nZ2xlQ2xhc3MiLCJocmVmIiwidGFyZ2V0IiwidGVzdCIsImNvbGxhcHNlIiwidHJhbnNpdGlvbkVuZCIsImVsIiwiY3JlYXRlRWxlbWVudCIsInRyYW5zRW5kRXZlbnROYW1lcyIsIldlYmtpdFRyYW5zaXRpb24iLCJNb3pUcmFuc2l0aW9uIiwiT1RyYW5zaXRpb24iLCJuYW1lIiwic3R5bGUiLCJ1bmRlZmluZWQiLCJkdXJhdGlvbiIsImNhbGxlZCIsIiRlbCIsInNldFRpbWVvdXQiLCJldmVudCIsInNwZWNpYWwiLCJic1RyYW5zaXRpb25FbmQiLCJiaW5kVHlwZSIsImRlbGVnYXRlVHlwZSIsImhhbmRsZSIsImlzIiwiaGFuZGxlT2JqIiwiaGFuZGxlciIsImFwcGx5IiwiYXJndW1lbnRzIiwiVG9vbHRpcCIsImVuYWJsZWQiLCJ0aW1lb3V0IiwiaG92ZXJTdGF0ZSIsImluU3RhdGUiLCJpbml0IiwiYW5pbWF0aW9uIiwicGxhY2VtZW50IiwidGVtcGxhdGUiLCJ0aXRsZSIsImRlbGF5IiwiaHRtbCIsInZpZXdwb3J0IiwicGFkZGluZyIsImdldE9wdGlvbnMiLCIkdmlld3BvcnQiLCJpc0Z1bmN0aW9uIiwiY2xpY2siLCJob3ZlciIsImZvY3VzIiwiY29uc3RydWN0b3IiLCJFcnJvciIsInRyaWdnZXJzIiwic3BsaXQiLCJldmVudEluIiwiZXZlbnRPdXQiLCJlbnRlciIsImxlYXZlIiwiX29wdGlvbnMiLCJmaXhUaXRsZSIsImdldERlZmF1bHRzIiwiZ2V0RGVsZWdhdGVPcHRpb25zIiwiZGVmYXVsdHMiLCJrZXkiLCJ2YWx1ZSIsIm9iaiIsInNlbGYiLCJjdXJyZW50VGFyZ2V0IiwidGlwIiwiY2xlYXJUaW1lb3V0IiwiaXNJblN0YXRlVHJ1ZSIsImhhc0NvbnRlbnQiLCJpbkRvbSIsImNvbnRhaW5zIiwib3duZXJEb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsInRoYXQiLCIkdGlwIiwidGlwSWQiLCJnZXRVSUQiLCJzZXRDb250ZW50IiwiYXV0b1Rva2VuIiwiYXV0b1BsYWNlIiwiZGV0YWNoIiwiY3NzIiwidG9wIiwibGVmdCIsImRpc3BsYXkiLCJhcHBlbmRUbyIsImluc2VydEFmdGVyIiwicG9zIiwiZ2V0UG9zaXRpb24iLCJhY3R1YWxXaWR0aCIsImFjdHVhbEhlaWdodCIsIm9yZ1BsYWNlbWVudCIsInZpZXdwb3J0RGltIiwiYm90dG9tIiwicmlnaHQiLCJ3aWR0aCIsImNhbGN1bGF0ZWRPZmZzZXQiLCJnZXRDYWxjdWxhdGVkT2Zmc2V0IiwiYXBwbHlQbGFjZW1lbnQiLCJwcmV2SG92ZXJTdGF0ZSIsIm9mZnNldCIsImhlaWdodCIsIm1hcmdpblRvcCIsInBhcnNlSW50IiwibWFyZ2luTGVmdCIsImlzTmFOIiwic2V0T2Zmc2V0IiwidXNpbmciLCJwcm9wcyIsIk1hdGgiLCJyb3VuZCIsImRlbHRhIiwiZ2V0Vmlld3BvcnRBZGp1c3RlZERlbHRhIiwiaXNWZXJ0aWNhbCIsImFycm93RGVsdGEiLCJhcnJvd09mZnNldFBvc2l0aW9uIiwicmVwbGFjZUFycm93IiwiYXJyb3ciLCJnZXRUaXRsZSIsInJlbW92ZUF0dHIiLCIkZSIsImlzQm9keSIsInRhZ05hbWUiLCJlbFJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJpc1N2ZyIsIndpbmRvdyIsIlNWR0VsZW1lbnQiLCJlbE9mZnNldCIsInNjcm9sbCIsInNjcm9sbFRvcCIsImJvZHkiLCJvdXRlckRpbXMiLCJ2aWV3cG9ydFBhZGRpbmciLCJ2aWV3cG9ydERpbWVuc2lvbnMiLCJ0b3BFZGdlT2Zmc2V0IiwiYm90dG9tRWRnZU9mZnNldCIsImxlZnRFZGdlT2Zmc2V0IiwicmlnaHRFZGdlT2Zmc2V0IiwibyIsInByZWZpeCIsInJhbmRvbSIsImdldEVsZW1lbnRCeUlkIiwiJGFycm93IiwiZW5hYmxlIiwiZGlzYWJsZSIsInRvZ2dsZUVuYWJsZWQiLCJkZXN0cm95Iiwib2ZmIiwicmVtb3ZlRGF0YSIsInRvb2x0aXAiLCJQb3BvdmVyIiwiY29udGVudCIsImdldENvbnRlbnQiLCJwb3BvdmVyIiwiTW9kYWwiLCIkYm9keSIsIiRkaWFsb2ciLCIkYmFja2Ryb3AiLCJpc1Nob3duIiwib3JpZ2luYWxCb2R5UGFkIiwic2Nyb2xsYmFyV2lkdGgiLCJpZ25vcmVCYWNrZHJvcENsaWNrIiwicmVtb3RlIiwibG9hZCIsIkJBQ0tEUk9QX1RSQU5TSVRJT05fRFVSQVRJT04iLCJiYWNrZHJvcCIsImtleWJvYXJkIiwiX3JlbGF0ZWRUYXJnZXQiLCJjaGVja1Njcm9sbGJhciIsInNldFNjcm9sbGJhciIsImVzY2FwZSIsInJlc2l6ZSIsImFkanVzdERpYWxvZyIsImVuZm9yY2VGb2N1cyIsImhpZGVNb2RhbCIsImhhcyIsIndoaWNoIiwiaGFuZGxlVXBkYXRlIiwicmVzZXRBZGp1c3RtZW50cyIsInJlc2V0U2Nyb2xsYmFyIiwicmVtb3ZlQmFja2Ryb3AiLCJyZW1vdmUiLCJhbmltYXRlIiwiZG9BbmltYXRlIiwiY2FsbGJhY2tSZW1vdmUiLCJtb2RhbElzT3ZlcmZsb3dpbmciLCJzY3JvbGxIZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJwYWRkaW5nTGVmdCIsImJvZHlJc092ZXJmbG93aW5nIiwicGFkZGluZ1JpZ2h0IiwiZnVsbFdpbmRvd1dpZHRoIiwiaW5uZXJXaWR0aCIsImRvY3VtZW50RWxlbWVudFJlY3QiLCJhYnMiLCJjbGllbnRXaWR0aCIsIm1lYXN1cmVTY3JvbGxiYXIiLCJib2R5UGFkIiwic2Nyb2xsRGl2IiwiY2xhc3NOYW1lIiwiYXBwZW5kIiwicmVtb3ZlQ2hpbGQiLCJtb2RhbCIsImZhY3RvcnkiLCJyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIiLCJkZWZpbmUiLCJhbWQiLCJleHBvcnRzIiwibW9kdWxlIiwiT2xkQ29va2llcyIsIkNvb2tpZXMiLCJhcGkiLCJyZXN1bHQiLCJhdHRyaWJ1dGVzIiwiY29udmVydGVyIiwicGF0aCIsImV4cGlyZXMiLCJEYXRlIiwic2V0TWlsbGlzZWNvbmRzIiwiZ2V0TWlsbGlzZWNvbmRzIiwidG9VVENTdHJpbmciLCJKU09OIiwic3RyaW5naWZ5Iiwid3JpdGUiLCJlbmNvZGVVUklDb21wb25lbnQiLCJTdHJpbmciLCJkZWNvZGVVUklDb21wb25lbnQiLCJzdHJpbmdpZmllZEF0dHJpYnV0ZXMiLCJhdHRyaWJ1dGVOYW1lIiwiY29va2llIiwiY29va2llcyIsInJkZWNvZGUiLCJwYXJ0cyIsInNsaWNlIiwianNvbiIsImNoYXJBdCIsInJlYWQiLCJwYXJzZSIsInNldCIsImdldCIsImdldEpTT04iLCJ3aXRoQ29udmVydGVyIiwidCIsInNsaW5reSIsImEiLCJzIiwibGFiZWwiLCJzcGVlZCIsIm4iLCJmaXJzdCIsInIiLCJsIiwib3V0ZXJIZWlnaHQiLCJkIiwicHJldiIsInByZXBlbmQiLCJ0ZXh0IiwicHJvcCIsIm5vdyIsInBhcmVudHNVbnRpbCIsImp1bXAiLCJob21lIiwiYyIsImxheW91dCIsInB1YiIsIiRsYXlvdXRfX2hlYWRlciIsIiRsYXlvdXRfX2RvY3VtZW50IiwibGF5b3V0X2NsYXNzZXMiLCJyZWdpc3RlckV2ZW50SGFuZGxlcnMiLCJyZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzIiwiYWRkRWxlbWVudENsYXNzZXMiLCJhZGQiLCJsYXlvdXRfX29iZnVzY2F0b3IiLCJ0b2dnbGVEcmF3ZXIiLCJoZWFkZXJfd2F0ZXJmYWxsIiwiJGRvY3VtZW50Iiwid2F0ZXJmYWxsSGVhZGVyIiwiJHdyYXBwZXIiLCJsYXlvdXRfX3dyYXBwZXIiLCIkb2JmdXNjYXRvciIsIiRkcmF3ZXIiLCJsYXlvdXRfX2RyYXdlciIsIm9iZnVzY2F0b3JfaXNfdmlzaWJsZSIsImRyYXdlcl9pc192aXNpYmxlIiwiJGhlYWRlciIsImxheW91dF9faGVhZGVyIiwiZGlzdGFuY2UiLCJoZWFkZXJfaXNfY29tcGFjdCIsImluZGV4IiwiaGVhZGVyX3Njcm9sbCIsIndyYXBwZXJfaGFzX3Njcm9sbGluZ19oZWFkZXIiLCJ3cmFwcGVyX2hhc19kcmF3ZXIiLCJ3cmFwcGVyX2lzX3VwZ3JhZGVkIiwiJG5vdGlmaWNhdGlvbnMiLCJ2YWwiLCIkcmVnaW9uIiwiY29va2llX2lkIiwiJGNsb3NlIiwiZmFkZUluIiwiZmFkZU91dCIsIiRtb2RhbCIsInBhcmVudHMiLCJ6SW5kZXgiLCJub3QiLCIkYWxsX3RvZ2dsZV9idXR0b25zIiwiJHRvZ2dsZV9idXR0b24iLCIkYWxsX2NvbnRlbnQiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7O0FBU0EsQ0FBQyxVQUFVQSxDQUFWLEVBQWE7QUFDWjs7QUFFQTtBQUNBOztBQUVBLE1BQUlDLE1BQU0sU0FBTkEsR0FBTSxDQUFVQyxPQUFWLEVBQW1CO0FBQzNCO0FBQ0EsU0FBS0EsT0FBTCxHQUFlRixFQUFFRSxPQUFGLENBQWY7QUFDQTtBQUNELEdBSkQ7O0FBTUFELE1BQUlFLE9BQUosR0FBYyxPQUFkOztBQUVBRixNQUFJRyxtQkFBSixHQUEwQixHQUExQjs7QUFFQUgsTUFBSUksU0FBSixDQUFjQyxJQUFkLEdBQXFCLFlBQVk7QUFDL0IsUUFBSUMsUUFBVyxLQUFLTCxPQUFwQjtBQUNBLFFBQUlNLE1BQVdELE1BQU1FLE9BQU4sQ0FBYyx3QkFBZCxDQUFmO0FBQ0EsUUFBSUMsV0FBV0gsTUFBTUksSUFBTixDQUFXLFFBQVgsQ0FBZjs7QUFFQSxRQUFJLENBQUNELFFBQUwsRUFBZTtBQUNiQSxpQkFBV0gsTUFBTUssSUFBTixDQUFXLE1BQVgsQ0FBWDtBQUNBRixpQkFBV0EsWUFBWUEsU0FBU0csT0FBVCxDQUFpQixnQkFBakIsRUFBbUMsRUFBbkMsQ0FBdkIsQ0FGYSxDQUVpRDtBQUMvRDs7QUFFRCxRQUFJTixNQUFNTyxNQUFOLENBQWEsSUFBYixFQUFtQkMsUUFBbkIsQ0FBNEIsUUFBNUIsQ0FBSixFQUEyQzs7QUFFM0MsUUFBSUMsWUFBWVIsSUFBSVMsSUFBSixDQUFTLGdCQUFULENBQWhC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OUMsSUFBUixDQUFhLGdCQUFiLENBSjFCO0FBQUEsUUFLSXVYLGlCQUFpQnpVLFFBQVE5QyxJQUFSLENBQWEsb0JBQW9Cb0UsTUFBcEIsR0FBNkIsSUFBMUMsQ0FMckI7QUFBQSxRQU1Jb1QsZUFBZTFVLFFBQVE5QyxJQUFSLENBQWEsbUJBQWIsQ0FObkI7O0FBUUE7QUFDQXNYLHdCQUNLelgsTUFETCxHQUVLb0IsV0FGTCxDQUVpQixRQUZqQjs7QUFJQXVXLGlCQUFhdlcsV0FBYixDQUF5QixRQUF6Qjs7QUFFQTtBQUNBc1csbUJBQWUxWCxNQUFmLEdBQXdCc0IsUUFBeEIsQ0FBaUMsUUFBakM7QUFDQVosWUFBUVksUUFBUixDQUFpQixRQUFqQjtBQUNELEdBckJEOztBQXVCQXBDLElBQUUsVUFBRixFQUFjMEMsSUFBZCxDQUFtQixVQUFVNlUsS0FBVixFQUFpQjtBQUNoQ3ZYLE1BQUUsSUFBRixFQUFRaUIsSUFBUixDQUFhLGtCQUFiLEVBQWlDK1QsS0FBakMsR0FBeUMxVCxPQUF6QyxDQUFpRCxPQUFqRDtBQUNILEdBRkQ7QUFJRCxDQXJKRCxFQXFKR2dDLE1BckpIIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiB0YWIuanMgdjMuMy43XG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyN0YWJzXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbitmdW5jdGlvbiAoJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gVEFCIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgVGFiID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAvLyBqc2NzOmRpc2FibGUgcmVxdWlyZURvbGxhckJlZm9yZWpRdWVyeUFzc2lnbm1lbnRcbiAgICB0aGlzLmVsZW1lbnQgPSAkKGVsZW1lbnQpXG4gICAgLy8ganNjczplbmFibGUgcmVxdWlyZURvbGxhckJlZm9yZWpRdWVyeUFzc2lnbm1lbnRcbiAgfVxuXG4gIFRhYi5WRVJTSU9OID0gJzMuMy43J1xuXG4gIFRhYi5UUkFOU0lUSU9OX0RVUkFUSU9OID0gMTUwXG5cbiAgVGFiLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciAkdGhpcyAgICA9IHRoaXMuZWxlbWVudFxuICAgIHZhciAkdWwgICAgICA9ICR0aGlzLmNsb3Nlc3QoJ3VsOm5vdCguZHJvcGRvd24tbWVudSknKVxuICAgIHZhciBzZWxlY3RvciA9ICR0aGlzLmRhdGEoJ3RhcmdldCcpXG5cbiAgICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgICBzZWxlY3RvciA9ICR0aGlzLmF0dHIoJ2hyZWYnKVxuICAgICAgc2VsZWN0b3IgPSBzZWxlY3RvciAmJiBzZWxlY3Rvci5yZXBsYWNlKC8uKig/PSNbXlxcc10qJCkvLCAnJykgLy8gc3RyaXAgZm9yIGllN1xuICAgIH1cblxuICAgIGlmICgkdGhpcy5wYXJlbnQoJ2xpJykuaGFzQ2xhc3MoJ2FjdGl2ZScpKSByZXR1cm5cblxuICAgIHZhciAkcHJldmlvdXMgPSAkdWwuZmluZCgnLmFjdGl2ZTpsYXN0IGEnKVxuICAgIHZhciBoaWRlRXZlbnQgPSAkLkV2ZW50KCdoaWRlLmJzLnRhYicsIHtcbiAgICAgIHJlbGF0ZWRUYXJnZXQ6ICR0aGlzWzBdXG4gICAgfSlcbiAgICB2YXIgc2hvd0V2ZW50ID0gJC5FdmVudCgnc2hvdy5icy50YWInLCB7XG4gICAgICByZWxhdGVkVGFyZ2V0OiAkcHJldmlvdXNbMF1cbiAgICB9KVxuXG4gICAgJHByZXZpb3VzLnRyaWdnZXIoaGlkZUV2ZW50KVxuICAgICR0aGlzLnRyaWdnZXIoc2hvd0V2ZW50KVxuXG4gICAgaWYgKHNob3dFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSB8fCBoaWRlRXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxuXG4gICAgdmFyICR0YXJnZXQgPSAkKHNlbGVjdG9yKVxuXG4gICAgdGhpcy5hY3RpdmF0ZSgkdGhpcy5jbG9zZXN0KCdsaScpLCAkdWwpXG4gICAgdGhpcy5hY3RpdmF0ZSgkdGFyZ2V0LCAkdGFyZ2V0LnBhcmVudCgpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAkcHJldmlvdXMudHJpZ2dlcih7XG4gICAgICAgIHR5cGU6ICdoaWRkZW4uYnMudGFiJyxcbiAgICAgICAgcmVsYXRlZFRhcmdldDogJHRoaXNbMF1cbiAgICAgIH0pXG4gICAgICAkdGhpcy50cmlnZ2VyKHtcbiAgICAgICAgdHlwZTogJ3Nob3duLmJzLnRhYicsXG4gICAgICAgIHJlbGF0ZWRUYXJnZXQ6ICRwcmV2aW91c1swXVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgVGFiLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBjb250YWluZXIsIGNhbGxiYWNrKSB7XG4gICAgdmFyICRhY3RpdmUgICAgPSBjb250YWluZXIuZmluZCgnPiAuYWN0aXZlJylcbiAgICB2YXIgdHJhbnNpdGlvbiA9IGNhbGxiYWNrXG4gICAgICAmJiAkLnN1cHBvcnQudHJhbnNpdGlvblxuICAgICAgJiYgKCRhY3RpdmUubGVuZ3RoICYmICRhY3RpdmUuaGFzQ2xhc3MoJ2ZhZGUnKSB8fCAhIWNvbnRhaW5lci5maW5kKCc+IC5mYWRlJykubGVuZ3RoKVxuXG4gICAgZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICRhY3RpdmVcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICAuZmluZCgnPiAuZHJvcGRvd24tbWVudSA+IC5hY3RpdmUnKVxuICAgICAgICAgIC5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAgICAgLmVuZCgpXG4gICAgICAgIC5maW5kKCdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nKVxuICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpXG5cbiAgICAgIGVsZW1lbnRcbiAgICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgICAgICAuZmluZCgnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJylcbiAgICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXG5cbiAgICAgIGlmICh0cmFuc2l0aW9uKSB7XG4gICAgICAgIGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGggLy8gcmVmbG93IGZvciB0cmFuc2l0aW9uXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2luJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2ZhZGUnKVxuICAgICAgfVxuXG4gICAgICBpZiAoZWxlbWVudC5wYXJlbnQoJy5kcm9wZG93bi1tZW51JykubGVuZ3RoKSB7XG4gICAgICAgIGVsZW1lbnRcbiAgICAgICAgICAuY2xvc2VzdCgnbGkuZHJvcGRvd24nKVxuICAgICAgICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgICAgICAgIC5lbmQoKVxuICAgICAgICAgIC5maW5kKCdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nKVxuICAgICAgICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxuICAgICAgfVxuXG4gICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpXG4gICAgfVxuXG4gICAgJGFjdGl2ZS5sZW5ndGggJiYgdHJhbnNpdGlvbiA/XG4gICAgICAkYWN0aXZlXG4gICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIG5leHQpXG4gICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChUYWIuVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgbmV4dCgpXG5cbiAgICAkYWN0aXZlLnJlbW92ZUNsYXNzKCdpbicpXG4gIH1cblxuXG4gIC8vIFRBQiBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG4gICAgICB2YXIgZGF0YSAgPSAkdGhpcy5kYXRhKCdicy50YWInKVxuXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLnRhYicsIChkYXRhID0gbmV3IFRhYih0aGlzKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgdmFyIG9sZCA9ICQuZm4udGFiXG5cbiAgJC5mbi50YWIgICAgICAgICAgICAgPSBQbHVnaW5cbiAgJC5mbi50YWIuQ29uc3RydWN0b3IgPSBUYWJcblxuXG4gIC8vIFRBQiBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT1cblxuICAkLmZuLnRhYi5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4udGFiID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAgLy8gVEFCIERBVEEtQVBJXG4gIC8vID09PT09PT09PT09PVxuXG4gIHZhciBjbGlja0hhbmRsZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIFBsdWdpbi5jYWxsKCQodGhpcyksICdzaG93JylcbiAgfVxuXG4gICQoZG9jdW1lbnQpXG4gICAgLm9uKCdjbGljay5icy50YWIuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJywgY2xpY2tIYW5kbGVyKVxuICAgIC5vbignY2xpY2suYnMudGFiLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cInBpbGxcIl0nLCBjbGlja0hhbmRsZXIpXG5cbn0oalF1ZXJ5KTtcbiIsIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiBjb2xsYXBzZS5qcyB2My4zLjdcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI2NvbGxhcHNlXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4vKiBqc2hpbnQgbGF0ZWRlZjogZmFsc2UgKi9cblxuK2Z1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBDT0xMQVBTRSBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBDb2xsYXBzZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCAgICAgID0gJChlbGVtZW50KVxuICAgIHRoaXMub3B0aW9ucyAgICAgICA9ICQuZXh0ZW5kKHt9LCBDb2xsYXBzZS5ERUZBVUxUUywgb3B0aW9ucylcbiAgICB0aGlzLiR0cmlnZ2VyICAgICAgPSAkKCdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXVtocmVmPVwiIycgKyBlbGVtZW50LmlkICsgJ1wiXSwnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXVtkYXRhLXRhcmdldD1cIiMnICsgZWxlbWVudC5pZCArICdcIl0nKVxuICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IG51bGxcblxuICAgIGlmICh0aGlzLm9wdGlvbnMucGFyZW50KSB7XG4gICAgICB0aGlzLiRwYXJlbnQgPSB0aGlzLmdldFBhcmVudCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzKHRoaXMuJGVsZW1lbnQsIHRoaXMuJHRyaWdnZXIpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy50b2dnbGUpIHRoaXMudG9nZ2xlKClcbiAgfVxuXG4gIENvbGxhcHNlLlZFUlNJT04gID0gJzMuMy43J1xuXG4gIENvbGxhcHNlLlRSQU5TSVRJT05fRFVSQVRJT04gPSAzNTBcblxuICBDb2xsYXBzZS5ERUZBVUxUUyA9IHtcbiAgICB0b2dnbGU6IHRydWVcbiAgfVxuXG4gIENvbGxhcHNlLnByb3RvdHlwZS5kaW1lbnNpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGhhc1dpZHRoID0gdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnd2lkdGgnKVxuICAgIHJldHVybiBoYXNXaWR0aCA/ICd3aWR0aCcgOiAnaGVpZ2h0J1xuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMudHJhbnNpdGlvbmluZyB8fCB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpbicpKSByZXR1cm5cblxuICAgIHZhciBhY3RpdmVzRGF0YVxuICAgIHZhciBhY3RpdmVzID0gdGhpcy4kcGFyZW50ICYmIHRoaXMuJHBhcmVudC5jaGlsZHJlbignLnBhbmVsJykuY2hpbGRyZW4oJy5pbiwgLmNvbGxhcHNpbmcnKVxuXG4gICAgaWYgKGFjdGl2ZXMgJiYgYWN0aXZlcy5sZW5ndGgpIHtcbiAgICAgIGFjdGl2ZXNEYXRhID0gYWN0aXZlcy5kYXRhKCdicy5jb2xsYXBzZScpXG4gICAgICBpZiAoYWN0aXZlc0RhdGEgJiYgYWN0aXZlc0RhdGEudHJhbnNpdGlvbmluZykgcmV0dXJuXG4gICAgfVxuXG4gICAgdmFyIHN0YXJ0RXZlbnQgPSAkLkV2ZW50KCdzaG93LmJzLmNvbGxhcHNlJylcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoc3RhcnRFdmVudClcbiAgICBpZiAoc3RhcnRFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICBpZiAoYWN0aXZlcyAmJiBhY3RpdmVzLmxlbmd0aCkge1xuICAgICAgUGx1Z2luLmNhbGwoYWN0aXZlcywgJ2hpZGUnKVxuICAgICAgYWN0aXZlc0RhdGEgfHwgYWN0aXZlcy5kYXRhKCdicy5jb2xsYXBzZScsIG51bGwpXG4gICAgfVxuXG4gICAgdmFyIGRpbWVuc2lvbiA9IHRoaXMuZGltZW5zaW9uKClcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2UnKVxuICAgICAgLmFkZENsYXNzKCdjb2xsYXBzaW5nJylbZGltZW5zaW9uXSgwKVxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxuXG4gICAgdGhpcy4kdHJpZ2dlclxuICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzZWQnKVxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxuXG4gICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMVxuXG4gICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNpbmcnKVxuICAgICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNlIGluJylbZGltZW5zaW9uXSgnJylcbiAgICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDBcbiAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgLnRyaWdnZXIoJ3Nob3duLmJzLmNvbGxhcHNlJylcbiAgICB9XG5cbiAgICBpZiAoISQuc3VwcG9ydC50cmFuc2l0aW9uKSByZXR1cm4gY29tcGxldGUuY2FsbCh0aGlzKVxuXG4gICAgdmFyIHNjcm9sbFNpemUgPSAkLmNhbWVsQ2FzZShbJ3Njcm9sbCcsIGRpbWVuc2lvbl0uam9pbignLScpKVxuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgJC5wcm94eShjb21wbGV0ZSwgdGhpcykpXG4gICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoQ29sbGFwc2UuVFJBTlNJVElPTl9EVVJBVElPTilbZGltZW5zaW9uXSh0aGlzLiRlbGVtZW50WzBdW3Njcm9sbFNpemVdKVxuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMudHJhbnNpdGlvbmluZyB8fCAhdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaW4nKSkgcmV0dXJuXG5cbiAgICB2YXIgc3RhcnRFdmVudCA9ICQuRXZlbnQoJ2hpZGUuYnMuY29sbGFwc2UnKVxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihzdGFydEV2ZW50KVxuICAgIGlmIChzdGFydEV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgIHZhciBkaW1lbnNpb24gPSB0aGlzLmRpbWVuc2lvbigpXG5cbiAgICB0aGlzLiRlbGVtZW50W2RpbWVuc2lvbl0odGhpcy4kZWxlbWVudFtkaW1lbnNpb25dKCkpWzBdLm9mZnNldEhlaWdodFxuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLmFkZENsYXNzKCdjb2xsYXBzaW5nJylcbiAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2UgaW4nKVxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSlcblxuICAgIHRoaXMuJHRyaWdnZXJcbiAgICAgIC5hZGRDbGFzcygnY29sbGFwc2VkJylcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpXG5cbiAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSAxXG5cbiAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSAwXG4gICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2luZycpXG4gICAgICAgIC5hZGRDbGFzcygnY29sbGFwc2UnKVxuICAgICAgICAudHJpZ2dlcignaGlkZGVuLmJzLmNvbGxhcHNlJylcbiAgICB9XG5cbiAgICBpZiAoISQuc3VwcG9ydC50cmFuc2l0aW9uKSByZXR1cm4gY29tcGxldGUuY2FsbCh0aGlzKVxuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgW2RpbWVuc2lvbl0oMClcbiAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsICQucHJveHkoY29tcGxldGUsIHRoaXMpKVxuICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKENvbGxhcHNlLlRSQU5TSVRJT05fRFVSQVRJT04pXG4gIH1cblxuICBDb2xsYXBzZS5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXNbdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaW4nKSA/ICdoaWRlJyA6ICdzaG93J10oKVxuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLmdldFBhcmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJCh0aGlzLm9wdGlvbnMucGFyZW50KVxuICAgICAgLmZpbmQoJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdW2RhdGEtcGFyZW50PVwiJyArIHRoaXMub3B0aW9ucy5wYXJlbnQgKyAnXCJdJylcbiAgICAgIC5lYWNoKCQucHJveHkoZnVuY3Rpb24gKGksIGVsZW1lbnQpIHtcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KVxuICAgICAgICB0aGlzLmFkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyhnZXRUYXJnZXRGcm9tVHJpZ2dlcigkZWxlbWVudCksICRlbGVtZW50KVxuICAgICAgfSwgdGhpcykpXG4gICAgICAuZW5kKClcbiAgfVxuXG4gIENvbGxhcHNlLnByb3RvdHlwZS5hZGRBcmlhQW5kQ29sbGFwc2VkQ2xhc3MgPSBmdW5jdGlvbiAoJGVsZW1lbnQsICR0cmlnZ2VyKSB7XG4gICAgdmFyIGlzT3BlbiA9ICRlbGVtZW50Lmhhc0NsYXNzKCdpbicpXG5cbiAgICAkZWxlbWVudC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgaXNPcGVuKVxuICAgICR0cmlnZ2VyXG4gICAgICAudG9nZ2xlQ2xhc3MoJ2NvbGxhcHNlZCcsICFpc09wZW4pXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGlzT3BlbilcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFRhcmdldEZyb21UcmlnZ2VyKCR0cmlnZ2VyKSB7XG4gICAgdmFyIGhyZWZcbiAgICB2YXIgdGFyZ2V0ID0gJHRyaWdnZXIuYXR0cignZGF0YS10YXJnZXQnKVxuICAgICAgfHwgKGhyZWYgPSAkdHJpZ2dlci5hdHRyKCdocmVmJykpICYmIGhyZWYucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLywgJycpIC8vIHN0cmlwIGZvciBpZTdcblxuICAgIHJldHVybiAkKHRhcmdldClcbiAgfVxuXG5cbiAgLy8gQ09MTEFQU0UgUExVR0lOIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMuY29sbGFwc2UnKVxuICAgICAgdmFyIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQ29sbGFwc2UuREVGQVVMVFMsICR0aGlzLmRhdGEoKSwgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pXG5cbiAgICAgIGlmICghZGF0YSAmJiBvcHRpb25zLnRvZ2dsZSAmJiAvc2hvd3xoaWRlLy50ZXN0KG9wdGlvbikpIG9wdGlvbnMudG9nZ2xlID0gZmFsc2VcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuY29sbGFwc2UnLCAoZGF0YSA9IG5ldyBDb2xsYXBzZSh0aGlzLCBvcHRpb25zKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgdmFyIG9sZCA9ICQuZm4uY29sbGFwc2VcblxuICAkLmZuLmNvbGxhcHNlICAgICAgICAgICAgID0gUGx1Z2luXG4gICQuZm4uY29sbGFwc2UuQ29uc3RydWN0b3IgPSBDb2xsYXBzZVxuXG5cbiAgLy8gQ09MTEFQU0UgTk8gQ09ORkxJQ1RcbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cblxuICAkLmZuLmNvbGxhcHNlLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi5jb2xsYXBzZSA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuXG4gIC8vIENPTExBUFNFIERBVEEtQVBJXG4gIC8vID09PT09PT09PT09PT09PT09XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLmJzLmNvbGxhcHNlLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdJywgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcblxuICAgIGlmICghJHRoaXMuYXR0cignZGF0YS10YXJnZXQnKSkgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICB2YXIgJHRhcmdldCA9IGdldFRhcmdldEZyb21UcmlnZ2VyKCR0aGlzKVxuICAgIHZhciBkYXRhICAgID0gJHRhcmdldC5kYXRhKCdicy5jb2xsYXBzZScpXG4gICAgdmFyIG9wdGlvbiAgPSBkYXRhID8gJ3RvZ2dsZScgOiAkdGhpcy5kYXRhKClcblxuICAgIFBsdWdpbi5jYWxsKCR0YXJnZXQsIG9wdGlvbilcbiAgfSlcblxufShqUXVlcnkpO1xuIiwiLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBCb290c3RyYXA6IHRyYW5zaXRpb24uanMgdjMuMy43XG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyN0cmFuc2l0aW9uc1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4rZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIENTUyBUUkFOU0lUSU9OIFNVUFBPUlQgKFNob3V0b3V0OiBodHRwOi8vd3d3Lm1vZGVybml6ci5jb20vKVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiB0cmFuc2l0aW9uRW5kKCkge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Jvb3RzdHJhcCcpXG5cbiAgICB2YXIgdHJhbnNFbmRFdmVudE5hbWVzID0ge1xuICAgICAgV2Via2l0VHJhbnNpdGlvbiA6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAgIE1velRyYW5zaXRpb24gICAgOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICBPVHJhbnNpdGlvbiAgICAgIDogJ29UcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kJyxcbiAgICAgIHRyYW5zaXRpb24gICAgICAgOiAndHJhbnNpdGlvbmVuZCdcbiAgICB9XG5cbiAgICBmb3IgKHZhciBuYW1lIGluIHRyYW5zRW5kRXZlbnROYW1lcykge1xuICAgICAgaWYgKGVsLnN0eWxlW25hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHsgZW5kOiB0cmFuc0VuZEV2ZW50TmFtZXNbbmFtZV0gfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZSAvLyBleHBsaWNpdCBmb3IgaWU4ICggIC5fLilcbiAgfVxuXG4gIC8vIGh0dHA6Ly9ibG9nLmFsZXhtYWNjYXcuY29tL2Nzcy10cmFuc2l0aW9uc1xuICAkLmZuLmVtdWxhdGVUcmFuc2l0aW9uRW5kID0gZnVuY3Rpb24gKGR1cmF0aW9uKSB7XG4gICAgdmFyIGNhbGxlZCA9IGZhbHNlXG4gICAgdmFyICRlbCA9IHRoaXNcbiAgICAkKHRoaXMpLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgZnVuY3Rpb24gKCkgeyBjYWxsZWQgPSB0cnVlIH0pXG4gICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24gKCkgeyBpZiAoIWNhbGxlZCkgJCgkZWwpLnRyaWdnZXIoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kKSB9XG4gICAgc2V0VGltZW91dChjYWxsYmFjaywgZHVyYXRpb24pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gICQoZnVuY3Rpb24gKCkge1xuICAgICQuc3VwcG9ydC50cmFuc2l0aW9uID0gdHJhbnNpdGlvbkVuZCgpXG5cbiAgICBpZiAoISQuc3VwcG9ydC50cmFuc2l0aW9uKSByZXR1cm5cblxuICAgICQuZXZlbnQuc3BlY2lhbC5ic1RyYW5zaXRpb25FbmQgPSB7XG4gICAgICBiaW5kVHlwZTogJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLFxuICAgICAgZGVsZWdhdGVUeXBlOiAkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsXG4gICAgICBoYW5kbGU6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICgkKGUudGFyZ2V0KS5pcyh0aGlzKSkgcmV0dXJuIGUuaGFuZGxlT2JqLmhhbmRsZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxufShqUXVlcnkpO1xuIiwiLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBCb290c3RyYXA6IHRvb2x0aXAuanMgdjMuMy43XG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyN0b29sdGlwXG4gKiBJbnNwaXJlZCBieSB0aGUgb3JpZ2luYWwgalF1ZXJ5LnRpcHN5IGJ5IEphc29uIEZyYW1lXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbitmdW5jdGlvbiAoJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gVE9PTFRJUCBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgdmFyIFRvb2x0aXAgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMudHlwZSAgICAgICA9IG51bGxcbiAgICB0aGlzLm9wdGlvbnMgICAgPSBudWxsXG4gICAgdGhpcy5lbmFibGVkICAgID0gbnVsbFxuICAgIHRoaXMudGltZW91dCAgICA9IG51bGxcbiAgICB0aGlzLmhvdmVyU3RhdGUgPSBudWxsXG4gICAgdGhpcy4kZWxlbWVudCAgID0gbnVsbFxuICAgIHRoaXMuaW5TdGF0ZSAgICA9IG51bGxcblxuICAgIHRoaXMuaW5pdCgndG9vbHRpcCcsIGVsZW1lbnQsIG9wdGlvbnMpXG4gIH1cblxuICBUb29sdGlwLlZFUlNJT04gID0gJzMuMy43J1xuXG4gIFRvb2x0aXAuVFJBTlNJVElPTl9EVVJBVElPTiA9IDE1MFxuXG4gIFRvb2x0aXAuREVGQVVMVFMgPSB7XG4gICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgIHBsYWNlbWVudDogJ3RvcCcsXG4gICAgc2VsZWN0b3I6IGZhbHNlLFxuICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRvb2x0aXBcIiByb2xlPVwidG9vbHRpcFwiPjxkaXYgY2xhc3M9XCJ0b29sdGlwLWFycm93XCI+PC9kaXY+PGRpdiBjbGFzcz1cInRvb2x0aXAtaW5uZXJcIj48L2Rpdj48L2Rpdj4nLFxuICAgIHRyaWdnZXI6ICdob3ZlciBmb2N1cycsXG4gICAgdGl0bGU6ICcnLFxuICAgIGRlbGF5OiAwLFxuICAgIGh0bWw6IGZhbHNlLFxuICAgIGNvbnRhaW5lcjogZmFsc2UsXG4gICAgdmlld3BvcnQ6IHtcbiAgICAgIHNlbGVjdG9yOiAnYm9keScsXG4gICAgICBwYWRkaW5nOiAwXG4gICAgfVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICh0eXBlLCBlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5lbmFibGVkICAgPSB0cnVlXG4gICAgdGhpcy50eXBlICAgICAgPSB0eXBlXG4gICAgdGhpcy4kZWxlbWVudCAgPSAkKGVsZW1lbnQpXG4gICAgdGhpcy5vcHRpb25zICAgPSB0aGlzLmdldE9wdGlvbnMob3B0aW9ucylcbiAgICB0aGlzLiR2aWV3cG9ydCA9IHRoaXMub3B0aW9ucy52aWV3cG9ydCAmJiAkKCQuaXNGdW5jdGlvbih0aGlzLm9wdGlvbnMudmlld3BvcnQpID8gdGhpcy5vcHRpb25zLnZpZXdwb3J0LmNhbGwodGhpcywgdGhpcy4kZWxlbWVudCkgOiAodGhpcy5vcHRpb25zLnZpZXdwb3J0LnNlbGVjdG9yIHx8IHRoaXMub3B0aW9ucy52aWV3cG9ydCkpXG4gICAgdGhpcy5pblN0YXRlICAgPSB7IGNsaWNrOiBmYWxzZSwgaG92ZXI6IGZhbHNlLCBmb2N1czogZmFsc2UgfVxuXG4gICAgaWYgKHRoaXMuJGVsZW1lbnRbMF0gaW5zdGFuY2VvZiBkb2N1bWVudC5jb25zdHJ1Y3RvciAmJiAhdGhpcy5vcHRpb25zLnNlbGVjdG9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BzZWxlY3RvcmAgb3B0aW9uIG11c3QgYmUgc3BlY2lmaWVkIHdoZW4gaW5pdGlhbGl6aW5nICcgKyB0aGlzLnR5cGUgKyAnIG9uIHRoZSB3aW5kb3cuZG9jdW1lbnQgb2JqZWN0IScpXG4gICAgfVxuXG4gICAgdmFyIHRyaWdnZXJzID0gdGhpcy5vcHRpb25zLnRyaWdnZXIuc3BsaXQoJyAnKVxuXG4gICAgZm9yICh2YXIgaSA9IHRyaWdnZXJzLmxlbmd0aDsgaS0tOykge1xuICAgICAgdmFyIHRyaWdnZXIgPSB0cmlnZ2Vyc1tpXVxuXG4gICAgICBpZiAodHJpZ2dlciA9PSAnY2xpY2snKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrLicgKyB0aGlzLnR5cGUsIHRoaXMub3B0aW9ucy5zZWxlY3RvciwgJC5wcm94eSh0aGlzLnRvZ2dsZSwgdGhpcykpXG4gICAgICB9IGVsc2UgaWYgKHRyaWdnZXIgIT0gJ21hbnVhbCcpIHtcbiAgICAgICAgdmFyIGV2ZW50SW4gID0gdHJpZ2dlciA9PSAnaG92ZXInID8gJ21vdXNlZW50ZXInIDogJ2ZvY3VzaW4nXG4gICAgICAgIHZhciBldmVudE91dCA9IHRyaWdnZXIgPT0gJ2hvdmVyJyA/ICdtb3VzZWxlYXZlJyA6ICdmb2N1c291dCdcblxuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKGV2ZW50SW4gICsgJy4nICsgdGhpcy50eXBlLCB0aGlzLm9wdGlvbnMuc2VsZWN0b3IsICQucHJveHkodGhpcy5lbnRlciwgdGhpcykpXG4gICAgICAgIHRoaXMuJGVsZW1lbnQub24oZXZlbnRPdXQgKyAnLicgKyB0aGlzLnR5cGUsIHRoaXMub3B0aW9ucy5zZWxlY3RvciwgJC5wcm94eSh0aGlzLmxlYXZlLCB0aGlzKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm9wdGlvbnMuc2VsZWN0b3IgP1xuICAgICAgKHRoaXMuX29wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCB7IHRyaWdnZXI6ICdtYW51YWwnLCBzZWxlY3RvcjogJycgfSkpIDpcbiAgICAgIHRoaXMuZml4VGl0bGUoKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0RGVmYXVsdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFRvb2x0aXAuREVGQVVMVFNcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5nZXREZWZhdWx0cygpLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucylcblxuICAgIGlmIChvcHRpb25zLmRlbGF5ICYmIHR5cGVvZiBvcHRpb25zLmRlbGF5ID09ICdudW1iZXInKSB7XG4gICAgICBvcHRpb25zLmRlbGF5ID0ge1xuICAgICAgICBzaG93OiBvcHRpb25zLmRlbGF5LFxuICAgICAgICBoaWRlOiBvcHRpb25zLmRlbGF5XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldERlbGVnYXRlT3B0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3B0aW9ucyAgPSB7fVxuICAgIHZhciBkZWZhdWx0cyA9IHRoaXMuZ2V0RGVmYXVsdHMoKVxuXG4gICAgdGhpcy5fb3B0aW9ucyAmJiAkLmVhY2godGhpcy5fb3B0aW9ucywgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgIGlmIChkZWZhdWx0c1trZXldICE9IHZhbHVlKSBvcHRpb25zW2tleV0gPSB2YWx1ZVxuICAgIH0pXG5cbiAgICByZXR1cm4gb3B0aW9uc1xuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZW50ZXIgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIHNlbGYgPSBvYmogaW5zdGFuY2VvZiB0aGlzLmNvbnN0cnVjdG9yID9cbiAgICAgIG9iaiA6ICQob2JqLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUpXG5cbiAgICBpZiAoIXNlbGYpIHtcbiAgICAgIHNlbGYgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihvYmouY3VycmVudFRhcmdldCwgdGhpcy5nZXREZWxlZ2F0ZU9wdGlvbnMoKSlcbiAgICAgICQob2JqLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUsIHNlbGYpXG4gICAgfVxuXG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mICQuRXZlbnQpIHtcbiAgICAgIHNlbGYuaW5TdGF0ZVtvYmoudHlwZSA9PSAnZm9jdXNpbicgPyAnZm9jdXMnIDogJ2hvdmVyJ10gPSB0cnVlXG4gICAgfVxuXG4gICAgaWYgKHNlbGYudGlwKCkuaGFzQ2xhc3MoJ2luJykgfHwgc2VsZi5ob3ZlclN0YXRlID09ICdpbicpIHtcbiAgICAgIHNlbGYuaG92ZXJTdGF0ZSA9ICdpbidcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXQpXG5cbiAgICBzZWxmLmhvdmVyU3RhdGUgPSAnaW4nXG5cbiAgICBpZiAoIXNlbGYub3B0aW9ucy5kZWxheSB8fCAhc2VsZi5vcHRpb25zLmRlbGF5LnNob3cpIHJldHVybiBzZWxmLnNob3coKVxuXG4gICAgc2VsZi50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc2VsZi5ob3ZlclN0YXRlID09ICdpbicpIHNlbGYuc2hvdygpXG4gICAgfSwgc2VsZi5vcHRpb25zLmRlbGF5LnNob3cpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5pc0luU3RhdGVUcnVlID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmluU3RhdGUpIHtcbiAgICAgIGlmICh0aGlzLmluU3RhdGVba2V5XSkgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmxlYXZlID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciBzZWxmID0gb2JqIGluc3RhbmNlb2YgdGhpcy5jb25zdHJ1Y3RvciA/XG4gICAgICBvYmogOiAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlKVxuXG4gICAgaWYgKCFzZWxmKSB7XG4gICAgICBzZWxmID0gbmV3IHRoaXMuY29uc3RydWN0b3Iob2JqLmN1cnJlbnRUYXJnZXQsIHRoaXMuZ2V0RGVsZWdhdGVPcHRpb25zKCkpXG4gICAgICAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlLCBzZWxmKVxuICAgIH1cblxuICAgIGlmIChvYmogaW5zdGFuY2VvZiAkLkV2ZW50KSB7XG4gICAgICBzZWxmLmluU3RhdGVbb2JqLnR5cGUgPT0gJ2ZvY3Vzb3V0JyA/ICdmb2N1cycgOiAnaG92ZXInXSA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKHNlbGYuaXNJblN0YXRlVHJ1ZSgpKSByZXR1cm5cblxuICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXQpXG5cbiAgICBzZWxmLmhvdmVyU3RhdGUgPSAnb3V0J1xuXG4gICAgaWYgKCFzZWxmLm9wdGlvbnMuZGVsYXkgfHwgIXNlbGYub3B0aW9ucy5kZWxheS5oaWRlKSByZXR1cm4gc2VsZi5oaWRlKClcblxuICAgIHNlbGYudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHNlbGYuaG92ZXJTdGF0ZSA9PSAnb3V0Jykgc2VsZi5oaWRlKClcbiAgICB9LCBzZWxmLm9wdGlvbnMuZGVsYXkuaGlkZSlcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGUgPSAkLkV2ZW50KCdzaG93LmJzLicgKyB0aGlzLnR5cGUpXG5cbiAgICBpZiAodGhpcy5oYXNDb250ZW50KCkgJiYgdGhpcy5lbmFibGVkKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcblxuICAgICAgdmFyIGluRG9tID0gJC5jb250YWlucyh0aGlzLiRlbGVtZW50WzBdLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB0aGlzLiRlbGVtZW50WzBdKVxuICAgICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkgfHwgIWluRG9tKSByZXR1cm5cbiAgICAgIHZhciB0aGF0ID0gdGhpc1xuXG4gICAgICB2YXIgJHRpcCA9IHRoaXMudGlwKClcblxuICAgICAgdmFyIHRpcElkID0gdGhpcy5nZXRVSUQodGhpcy50eXBlKVxuXG4gICAgICB0aGlzLnNldENvbnRlbnQoKVxuICAgICAgJHRpcC5hdHRyKCdpZCcsIHRpcElkKVxuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWRlc2NyaWJlZGJ5JywgdGlwSWQpXG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYW5pbWF0aW9uKSAkdGlwLmFkZENsYXNzKCdmYWRlJylcblxuICAgICAgdmFyIHBsYWNlbWVudCA9IHR5cGVvZiB0aGlzLm9wdGlvbnMucGxhY2VtZW50ID09ICdmdW5jdGlvbicgP1xuICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2VtZW50LmNhbGwodGhpcywgJHRpcFswXSwgdGhpcy4kZWxlbWVudFswXSkgOlxuICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2VtZW50XG5cbiAgICAgIHZhciBhdXRvVG9rZW4gPSAvXFxzP2F1dG8/XFxzPy9pXG4gICAgICB2YXIgYXV0b1BsYWNlID0gYXV0b1Rva2VuLnRlc3QocGxhY2VtZW50KVxuICAgICAgaWYgKGF1dG9QbGFjZSkgcGxhY2VtZW50ID0gcGxhY2VtZW50LnJlcGxhY2UoYXV0b1Rva2VuLCAnJykgfHwgJ3RvcCdcblxuICAgICAgJHRpcFxuICAgICAgICAuZGV0YWNoKClcbiAgICAgICAgLmNzcyh7IHRvcDogMCwgbGVmdDogMCwgZGlzcGxheTogJ2Jsb2NrJyB9KVxuICAgICAgICAuYWRkQ2xhc3MocGxhY2VtZW50KVxuICAgICAgICAuZGF0YSgnYnMuJyArIHRoaXMudHlwZSwgdGhpcylcblxuICAgICAgdGhpcy5vcHRpb25zLmNvbnRhaW5lciA/ICR0aXAuYXBwZW5kVG8odGhpcy5vcHRpb25zLmNvbnRhaW5lcikgOiAkdGlwLmluc2VydEFmdGVyKHRoaXMuJGVsZW1lbnQpXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2luc2VydGVkLmJzLicgKyB0aGlzLnR5cGUpXG5cbiAgICAgIHZhciBwb3MgICAgICAgICAgPSB0aGlzLmdldFBvc2l0aW9uKClcbiAgICAgIHZhciBhY3R1YWxXaWR0aCAgPSAkdGlwWzBdLm9mZnNldFdpZHRoXG4gICAgICB2YXIgYWN0dWFsSGVpZ2h0ID0gJHRpcFswXS5vZmZzZXRIZWlnaHRcblxuICAgICAgaWYgKGF1dG9QbGFjZSkge1xuICAgICAgICB2YXIgb3JnUGxhY2VtZW50ID0gcGxhY2VtZW50XG4gICAgICAgIHZhciB2aWV3cG9ydERpbSA9IHRoaXMuZ2V0UG9zaXRpb24odGhpcy4kdmlld3BvcnQpXG5cbiAgICAgICAgcGxhY2VtZW50ID0gcGxhY2VtZW50ID09ICdib3R0b20nICYmIHBvcy5ib3R0b20gKyBhY3R1YWxIZWlnaHQgPiB2aWV3cG9ydERpbS5ib3R0b20gPyAndG9wJyAgICA6XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAndG9wJyAgICAmJiBwb3MudG9wICAgIC0gYWN0dWFsSGVpZ2h0IDwgdmlld3BvcnREaW0udG9wICAgID8gJ2JvdHRvbScgOlxuICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ3JpZ2h0JyAgJiYgcG9zLnJpZ2h0ICArIGFjdHVhbFdpZHRoICA+IHZpZXdwb3J0RGltLndpZHRoICA/ICdsZWZ0JyAgIDpcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50ID09ICdsZWZ0JyAgICYmIHBvcy5sZWZ0ICAgLSBhY3R1YWxXaWR0aCAgPCB2aWV3cG9ydERpbS5sZWZ0ICAgPyAncmlnaHQnICA6XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudFxuXG4gICAgICAgICR0aXBcbiAgICAgICAgICAucmVtb3ZlQ2xhc3Mob3JnUGxhY2VtZW50KVxuICAgICAgICAgIC5hZGRDbGFzcyhwbGFjZW1lbnQpXG4gICAgICB9XG5cbiAgICAgIHZhciBjYWxjdWxhdGVkT2Zmc2V0ID0gdGhpcy5nZXRDYWxjdWxhdGVkT2Zmc2V0KHBsYWNlbWVudCwgcG9zLCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KVxuXG4gICAgICB0aGlzLmFwcGx5UGxhY2VtZW50KGNhbGN1bGF0ZWRPZmZzZXQsIHBsYWNlbWVudClcblxuICAgICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcHJldkhvdmVyU3RhdGUgPSB0aGF0LmhvdmVyU3RhdGVcbiAgICAgICAgdGhhdC4kZWxlbWVudC50cmlnZ2VyKCdzaG93bi5icy4nICsgdGhhdC50eXBlKVxuICAgICAgICB0aGF0LmhvdmVyU3RhdGUgPSBudWxsXG5cbiAgICAgICAgaWYgKHByZXZIb3ZlclN0YXRlID09ICdvdXQnKSB0aGF0LmxlYXZlKHRoYXQpXG4gICAgICB9XG5cbiAgICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoaXMuJHRpcC5oYXNDbGFzcygnZmFkZScpID9cbiAgICAgICAgJHRpcFxuICAgICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGNvbXBsZXRlKVxuICAgICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChUb29sdGlwLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcbiAgICAgICAgY29tcGxldGUoKVxuICAgIH1cbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmFwcGx5UGxhY2VtZW50ID0gZnVuY3Rpb24gKG9mZnNldCwgcGxhY2VtZW50KSB7XG4gICAgdmFyICR0aXAgICA9IHRoaXMudGlwKClcbiAgICB2YXIgd2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxuICAgIHZhciBoZWlnaHQgPSAkdGlwWzBdLm9mZnNldEhlaWdodFxuXG4gICAgLy8gbWFudWFsbHkgcmVhZCBtYXJnaW5zIGJlY2F1c2UgZ2V0Qm91bmRpbmdDbGllbnRSZWN0IGluY2x1ZGVzIGRpZmZlcmVuY2VcbiAgICB2YXIgbWFyZ2luVG9wID0gcGFyc2VJbnQoJHRpcC5jc3MoJ21hcmdpbi10b3AnKSwgMTApXG4gICAgdmFyIG1hcmdpbkxlZnQgPSBwYXJzZUludCgkdGlwLmNzcygnbWFyZ2luLWxlZnQnKSwgMTApXG5cbiAgICAvLyB3ZSBtdXN0IGNoZWNrIGZvciBOYU4gZm9yIGllIDgvOVxuICAgIGlmIChpc05hTihtYXJnaW5Ub3ApKSAgbWFyZ2luVG9wICA9IDBcbiAgICBpZiAoaXNOYU4obWFyZ2luTGVmdCkpIG1hcmdpbkxlZnQgPSAwXG5cbiAgICBvZmZzZXQudG9wICArPSBtYXJnaW5Ub3BcbiAgICBvZmZzZXQubGVmdCArPSBtYXJnaW5MZWZ0XG5cbiAgICAvLyAkLmZuLm9mZnNldCBkb2Vzbid0IHJvdW5kIHBpeGVsIHZhbHVlc1xuICAgIC8vIHNvIHdlIHVzZSBzZXRPZmZzZXQgZGlyZWN0bHkgd2l0aCBvdXIgb3duIGZ1bmN0aW9uIEItMFxuICAgICQub2Zmc2V0LnNldE9mZnNldCgkdGlwWzBdLCAkLmV4dGVuZCh7XG4gICAgICB1c2luZzogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgICR0aXAuY3NzKHtcbiAgICAgICAgICB0b3A6IE1hdGgucm91bmQocHJvcHMudG9wKSxcbiAgICAgICAgICBsZWZ0OiBNYXRoLnJvdW5kKHByb3BzLmxlZnQpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSwgb2Zmc2V0KSwgMClcblxuICAgICR0aXAuYWRkQ2xhc3MoJ2luJylcblxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiBwbGFjaW5nIHRpcCBpbiBuZXcgb2Zmc2V0IGNhdXNlZCB0aGUgdGlwIHRvIHJlc2l6ZSBpdHNlbGZcbiAgICB2YXIgYWN0dWFsV2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxuICAgIHZhciBhY3R1YWxIZWlnaHQgPSAkdGlwWzBdLm9mZnNldEhlaWdodFxuXG4gICAgaWYgKHBsYWNlbWVudCA9PSAndG9wJyAmJiBhY3R1YWxIZWlnaHQgIT0gaGVpZ2h0KSB7XG4gICAgICBvZmZzZXQudG9wID0gb2Zmc2V0LnRvcCArIGhlaWdodCAtIGFjdHVhbEhlaWdodFxuICAgIH1cblxuICAgIHZhciBkZWx0YSA9IHRoaXMuZ2V0Vmlld3BvcnRBZGp1c3RlZERlbHRhKHBsYWNlbWVudCwgb2Zmc2V0LCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KVxuXG4gICAgaWYgKGRlbHRhLmxlZnQpIG9mZnNldC5sZWZ0ICs9IGRlbHRhLmxlZnRcbiAgICBlbHNlIG9mZnNldC50b3AgKz0gZGVsdGEudG9wXG5cbiAgICB2YXIgaXNWZXJ0aWNhbCAgICAgICAgICA9IC90b3B8Ym90dG9tLy50ZXN0KHBsYWNlbWVudClcbiAgICB2YXIgYXJyb3dEZWx0YSAgICAgICAgICA9IGlzVmVydGljYWwgPyBkZWx0YS5sZWZ0ICogMiAtIHdpZHRoICsgYWN0dWFsV2lkdGggOiBkZWx0YS50b3AgKiAyIC0gaGVpZ2h0ICsgYWN0dWFsSGVpZ2h0XG4gICAgdmFyIGFycm93T2Zmc2V0UG9zaXRpb24gPSBpc1ZlcnRpY2FsID8gJ29mZnNldFdpZHRoJyA6ICdvZmZzZXRIZWlnaHQnXG5cbiAgICAkdGlwLm9mZnNldChvZmZzZXQpXG4gICAgdGhpcy5yZXBsYWNlQXJyb3coYXJyb3dEZWx0YSwgJHRpcFswXVthcnJvd09mZnNldFBvc2l0aW9uXSwgaXNWZXJ0aWNhbClcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnJlcGxhY2VBcnJvdyA9IGZ1bmN0aW9uIChkZWx0YSwgZGltZW5zaW9uLCBpc1ZlcnRpY2FsKSB7XG4gICAgdGhpcy5hcnJvdygpXG4gICAgICAuY3NzKGlzVmVydGljYWwgPyAnbGVmdCcgOiAndG9wJywgNTAgKiAoMSAtIGRlbHRhIC8gZGltZW5zaW9uKSArICclJylcbiAgICAgIC5jc3MoaXNWZXJ0aWNhbCA/ICd0b3AnIDogJ2xlZnQnLCAnJylcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnNldENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICR0aXAgID0gdGhpcy50aXAoKVxuICAgIHZhciB0aXRsZSA9IHRoaXMuZ2V0VGl0bGUoKVxuXG4gICAgJHRpcC5maW5kKCcudG9vbHRpcC1pbm5lcicpW3RoaXMub3B0aW9ucy5odG1sID8gJ2h0bWwnIDogJ3RleHQnXSh0aXRsZSlcbiAgICAkdGlwLnJlbW92ZUNsYXNzKCdmYWRlIGluIHRvcCBib3R0b20gbGVmdCByaWdodCcpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgdmFyICR0aXAgPSAkKHRoaXMuJHRpcClcbiAgICB2YXIgZSAgICA9ICQuRXZlbnQoJ2hpZGUuYnMuJyArIHRoaXMudHlwZSlcblxuICAgIGZ1bmN0aW9uIGNvbXBsZXRlKCkge1xuICAgICAgaWYgKHRoYXQuaG92ZXJTdGF0ZSAhPSAnaW4nKSAkdGlwLmRldGFjaCgpXG4gICAgICBpZiAodGhhdC4kZWxlbWVudCkgeyAvLyBUT0RPOiBDaGVjayB3aGV0aGVyIGd1YXJkaW5nIHRoaXMgY29kZSB3aXRoIHRoaXMgYGlmYCBpcyByZWFsbHkgbmVjZXNzYXJ5LlxuICAgICAgICB0aGF0LiRlbGVtZW50XG4gICAgICAgICAgLnJlbW92ZUF0dHIoJ2FyaWEtZGVzY3JpYmVkYnknKVxuICAgICAgICAgIC50cmlnZ2VyKCdoaWRkZW4uYnMuJyArIHRoYXQudHlwZSlcbiAgICAgIH1cbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKClcbiAgICB9XG5cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcblxuICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgICR0aXAucmVtb3ZlQ2xhc3MoJ2luJylcblxuICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmICR0aXAuaGFzQ2xhc3MoJ2ZhZGUnKSA/XG4gICAgICAkdGlwXG4gICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGNvbXBsZXRlKVxuICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoVG9vbHRpcC5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XG4gICAgICBjb21wbGV0ZSgpXG5cbiAgICB0aGlzLmhvdmVyU3RhdGUgPSBudWxsXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZml4VGl0bGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICRlID0gdGhpcy4kZWxlbWVudFxuICAgIGlmICgkZS5hdHRyKCd0aXRsZScpIHx8IHR5cGVvZiAkZS5hdHRyKCdkYXRhLW9yaWdpbmFsLXRpdGxlJykgIT0gJ3N0cmluZycpIHtcbiAgICAgICRlLmF0dHIoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnLCAkZS5hdHRyKCd0aXRsZScpIHx8ICcnKS5hdHRyKCd0aXRsZScsICcnKVxuICAgIH1cbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmhhc0NvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VGl0bGUoKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbiAoJGVsZW1lbnQpIHtcbiAgICAkZWxlbWVudCAgID0gJGVsZW1lbnQgfHwgdGhpcy4kZWxlbWVudFxuXG4gICAgdmFyIGVsICAgICA9ICRlbGVtZW50WzBdXG4gICAgdmFyIGlzQm9keSA9IGVsLnRhZ05hbWUgPT0gJ0JPRFknXG5cbiAgICB2YXIgZWxSZWN0ICAgID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBpZiAoZWxSZWN0LndpZHRoID09IG51bGwpIHtcbiAgICAgIC8vIHdpZHRoIGFuZCBoZWlnaHQgYXJlIG1pc3NpbmcgaW4gSUU4LCBzbyBjb21wdXRlIHRoZW0gbWFudWFsbHk7IHNlZSBodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvaXNzdWVzLzE0MDkzXG4gICAgICBlbFJlY3QgPSAkLmV4dGVuZCh7fSwgZWxSZWN0LCB7IHdpZHRoOiBlbFJlY3QucmlnaHQgLSBlbFJlY3QubGVmdCwgaGVpZ2h0OiBlbFJlY3QuYm90dG9tIC0gZWxSZWN0LnRvcCB9KVxuICAgIH1cbiAgICB2YXIgaXNTdmcgPSB3aW5kb3cuU1ZHRWxlbWVudCAmJiBlbCBpbnN0YW5jZW9mIHdpbmRvdy5TVkdFbGVtZW50XG4gICAgLy8gQXZvaWQgdXNpbmcgJC5vZmZzZXQoKSBvbiBTVkdzIHNpbmNlIGl0IGdpdmVzIGluY29ycmVjdCByZXN1bHRzIGluIGpRdWVyeSAzLlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvaXNzdWVzLzIwMjgwXG4gICAgdmFyIGVsT2Zmc2V0ICA9IGlzQm9keSA/IHsgdG9wOiAwLCBsZWZ0OiAwIH0gOiAoaXNTdmcgPyBudWxsIDogJGVsZW1lbnQub2Zmc2V0KCkpXG4gICAgdmFyIHNjcm9sbCAgICA9IHsgc2Nyb2xsOiBpc0JvZHkgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIDogJGVsZW1lbnQuc2Nyb2xsVG9wKCkgfVxuICAgIHZhciBvdXRlckRpbXMgPSBpc0JvZHkgPyB7IHdpZHRoOiAkKHdpbmRvdykud2lkdGgoKSwgaGVpZ2h0OiAkKHdpbmRvdykuaGVpZ2h0KCkgfSA6IG51bGxcblxuICAgIHJldHVybiAkLmV4dGVuZCh7fSwgZWxSZWN0LCBzY3JvbGwsIG91dGVyRGltcywgZWxPZmZzZXQpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRDYWxjdWxhdGVkT2Zmc2V0ID0gZnVuY3Rpb24gKHBsYWNlbWVudCwgcG9zLCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KSB7XG4gICAgcmV0dXJuIHBsYWNlbWVudCA9PSAnYm90dG9tJyA/IHsgdG9wOiBwb3MudG9wICsgcG9zLmhlaWdodCwgICBsZWZ0OiBwb3MubGVmdCArIHBvcy53aWR0aCAvIDIgLSBhY3R1YWxXaWR0aCAvIDIgfSA6XG4gICAgICAgICAgIHBsYWNlbWVudCA9PSAndG9wJyAgICA/IHsgdG9wOiBwb3MudG9wIC0gYWN0dWFsSGVpZ2h0LCBsZWZ0OiBwb3MubGVmdCArIHBvcy53aWR0aCAvIDIgLSBhY3R1YWxXaWR0aCAvIDIgfSA6XG4gICAgICAgICAgIHBsYWNlbWVudCA9PSAnbGVmdCcgICA/IHsgdG9wOiBwb3MudG9wICsgcG9zLmhlaWdodCAvIDIgLSBhY3R1YWxIZWlnaHQgLyAyLCBsZWZ0OiBwb3MubGVmdCAtIGFjdHVhbFdpZHRoIH0gOlxuICAgICAgICAvKiBwbGFjZW1lbnQgPT0gJ3JpZ2h0JyAqLyB7IHRvcDogcG9zLnRvcCArIHBvcy5oZWlnaHQgLyAyIC0gYWN0dWFsSGVpZ2h0IC8gMiwgbGVmdDogcG9zLmxlZnQgKyBwb3Mud2lkdGggfVxuXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRWaWV3cG9ydEFkanVzdGVkRGVsdGEgPSBmdW5jdGlvbiAocGxhY2VtZW50LCBwb3MsIGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpIHtcbiAgICB2YXIgZGVsdGEgPSB7IHRvcDogMCwgbGVmdDogMCB9XG4gICAgaWYgKCF0aGlzLiR2aWV3cG9ydCkgcmV0dXJuIGRlbHRhXG5cbiAgICB2YXIgdmlld3BvcnRQYWRkaW5nID0gdGhpcy5vcHRpb25zLnZpZXdwb3J0ICYmIHRoaXMub3B0aW9ucy52aWV3cG9ydC5wYWRkaW5nIHx8IDBcbiAgICB2YXIgdmlld3BvcnREaW1lbnNpb25zID0gdGhpcy5nZXRQb3NpdGlvbih0aGlzLiR2aWV3cG9ydClcblxuICAgIGlmICgvcmlnaHR8bGVmdC8udGVzdChwbGFjZW1lbnQpKSB7XG4gICAgICB2YXIgdG9wRWRnZU9mZnNldCAgICA9IHBvcy50b3AgLSB2aWV3cG9ydFBhZGRpbmcgLSB2aWV3cG9ydERpbWVuc2lvbnMuc2Nyb2xsXG4gICAgICB2YXIgYm90dG9tRWRnZU9mZnNldCA9IHBvcy50b3AgKyB2aWV3cG9ydFBhZGRpbmcgLSB2aWV3cG9ydERpbWVuc2lvbnMuc2Nyb2xsICsgYWN0dWFsSGVpZ2h0XG4gICAgICBpZiAodG9wRWRnZU9mZnNldCA8IHZpZXdwb3J0RGltZW5zaW9ucy50b3ApIHsgLy8gdG9wIG92ZXJmbG93XG4gICAgICAgIGRlbHRhLnRvcCA9IHZpZXdwb3J0RGltZW5zaW9ucy50b3AgLSB0b3BFZGdlT2Zmc2V0XG4gICAgICB9IGVsc2UgaWYgKGJvdHRvbUVkZ2VPZmZzZXQgPiB2aWV3cG9ydERpbWVuc2lvbnMudG9wICsgdmlld3BvcnREaW1lbnNpb25zLmhlaWdodCkgeyAvLyBib3R0b20gb3ZlcmZsb3dcbiAgICAgICAgZGVsdGEudG9wID0gdmlld3BvcnREaW1lbnNpb25zLnRvcCArIHZpZXdwb3J0RGltZW5zaW9ucy5oZWlnaHQgLSBib3R0b21FZGdlT2Zmc2V0XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBsZWZ0RWRnZU9mZnNldCAgPSBwb3MubGVmdCAtIHZpZXdwb3J0UGFkZGluZ1xuICAgICAgdmFyIHJpZ2h0RWRnZU9mZnNldCA9IHBvcy5sZWZ0ICsgdmlld3BvcnRQYWRkaW5nICsgYWN0dWFsV2lkdGhcbiAgICAgIGlmIChsZWZ0RWRnZU9mZnNldCA8IHZpZXdwb3J0RGltZW5zaW9ucy5sZWZ0KSB7IC8vIGxlZnQgb3ZlcmZsb3dcbiAgICAgICAgZGVsdGEubGVmdCA9IHZpZXdwb3J0RGltZW5zaW9ucy5sZWZ0IC0gbGVmdEVkZ2VPZmZzZXRcbiAgICAgIH0gZWxzZSBpZiAocmlnaHRFZGdlT2Zmc2V0ID4gdmlld3BvcnREaW1lbnNpb25zLnJpZ2h0KSB7IC8vIHJpZ2h0IG92ZXJmbG93XG4gICAgICAgIGRlbHRhLmxlZnQgPSB2aWV3cG9ydERpbWVuc2lvbnMubGVmdCArIHZpZXdwb3J0RGltZW5zaW9ucy53aWR0aCAtIHJpZ2h0RWRnZU9mZnNldFxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkZWx0YVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0VGl0bGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRpdGxlXG4gICAgdmFyICRlID0gdGhpcy4kZWxlbWVudFxuICAgIHZhciBvICA9IHRoaXMub3B0aW9uc1xuXG4gICAgdGl0bGUgPSAkZS5hdHRyKCdkYXRhLW9yaWdpbmFsLXRpdGxlJylcbiAgICAgIHx8ICh0eXBlb2Ygby50aXRsZSA9PSAnZnVuY3Rpb24nID8gby50aXRsZS5jYWxsKCRlWzBdKSA6ICBvLnRpdGxlKVxuXG4gICAgcmV0dXJuIHRpdGxlXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRVSUQgPSBmdW5jdGlvbiAocHJlZml4KSB7XG4gICAgZG8gcHJlZml4ICs9IH5+KE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwKVxuICAgIHdoaWxlIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwcmVmaXgpKVxuICAgIHJldHVybiBwcmVmaXhcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnRpcCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuJHRpcCkge1xuICAgICAgdGhpcy4kdGlwID0gJCh0aGlzLm9wdGlvbnMudGVtcGxhdGUpXG4gICAgICBpZiAodGhpcy4kdGlwLmxlbmd0aCAhPSAxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0aGlzLnR5cGUgKyAnIGB0ZW1wbGF0ZWAgb3B0aW9uIG11c3QgY29uc2lzdCBvZiBleGFjdGx5IDEgdG9wLWxldmVsIGVsZW1lbnQhJylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuJHRpcFxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuYXJyb3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh0aGlzLiRhcnJvdyA9IHRoaXMuJGFycm93IHx8IHRoaXMudGlwKCkuZmluZCgnLnRvb2x0aXAtYXJyb3cnKSlcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS50b2dnbGVFbmFibGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZW5hYmxlZCA9ICF0aGlzLmVuYWJsZWRcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgaWYgKGUpIHtcbiAgICAgIHNlbGYgPSAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSlcbiAgICAgIGlmICghc2VsZikge1xuICAgICAgICBzZWxmID0gbmV3IHRoaXMuY29uc3RydWN0b3IoZS5jdXJyZW50VGFyZ2V0LCB0aGlzLmdldERlbGVnYXRlT3B0aW9ucygpKVxuICAgICAgICAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSwgc2VsZilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZSkge1xuICAgICAgc2VsZi5pblN0YXRlLmNsaWNrID0gIXNlbGYuaW5TdGF0ZS5jbGlja1xuICAgICAgaWYgKHNlbGYuaXNJblN0YXRlVHJ1ZSgpKSBzZWxmLmVudGVyKHNlbGYpXG4gICAgICBlbHNlIHNlbGYubGVhdmUoc2VsZilcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi50aXAoKS5oYXNDbGFzcygnaW4nKSA/IHNlbGYubGVhdmUoc2VsZikgOiBzZWxmLmVudGVyKHNlbGYpXG4gICAgfVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KVxuICAgIHRoaXMuaGlkZShmdW5jdGlvbiAoKSB7XG4gICAgICB0aGF0LiRlbGVtZW50Lm9mZignLicgKyB0aGF0LnR5cGUpLnJlbW92ZURhdGEoJ2JzLicgKyB0aGF0LnR5cGUpXG4gICAgICBpZiAodGhhdC4kdGlwKSB7XG4gICAgICAgIHRoYXQuJHRpcC5kZXRhY2goKVxuICAgICAgfVxuICAgICAgdGhhdC4kdGlwID0gbnVsbFxuICAgICAgdGhhdC4kYXJyb3cgPSBudWxsXG4gICAgICB0aGF0LiR2aWV3cG9ydCA9IG51bGxcbiAgICAgIHRoYXQuJGVsZW1lbnQgPSBudWxsXG4gICAgfSlcbiAgfVxuXG5cbiAgLy8gVE9PTFRJUCBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLnRvb2x0aXAnKVxuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxuXG4gICAgICBpZiAoIWRhdGEgJiYgL2Rlc3Ryb3l8aGlkZS8udGVzdChvcHRpb24pKSByZXR1cm5cbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMudG9vbHRpcCcsIChkYXRhID0gbmV3IFRvb2x0aXAodGhpcywgb3B0aW9ucykpKVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXG4gICAgfSlcbiAgfVxuXG4gIHZhciBvbGQgPSAkLmZuLnRvb2x0aXBcblxuICAkLmZuLnRvb2x0aXAgICAgICAgICAgICAgPSBQbHVnaW5cbiAgJC5mbi50b29sdGlwLkNvbnN0cnVjdG9yID0gVG9vbHRpcFxuXG5cbiAgLy8gVE9PTFRJUCBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT09PT09XG5cbiAgJC5mbi50b29sdGlwLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi50b29sdGlwID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG59KGpRdWVyeSk7XG4iLCIvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEJvb3RzdHJhcDogcG9wb3Zlci5qcyB2My4zLjdcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI3BvcG92ZXJzXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbitmdW5jdGlvbiAoJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gUE9QT1ZFUiBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgdmFyIFBvcG92ZXIgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuaW5pdCgncG9wb3ZlcicsIGVsZW1lbnQsIG9wdGlvbnMpXG4gIH1cblxuICBpZiAoISQuZm4udG9vbHRpcCkgdGhyb3cgbmV3IEVycm9yKCdQb3BvdmVyIHJlcXVpcmVzIHRvb2x0aXAuanMnKVxuXG4gIFBvcG92ZXIuVkVSU0lPTiAgPSAnMy4zLjcnXG5cbiAgUG9wb3Zlci5ERUZBVUxUUyA9ICQuZXh0ZW5kKHt9LCAkLmZuLnRvb2x0aXAuQ29uc3RydWN0b3IuREVGQVVMVFMsIHtcbiAgICBwbGFjZW1lbnQ6ICdyaWdodCcsXG4gICAgdHJpZ2dlcjogJ2NsaWNrJyxcbiAgICBjb250ZW50OiAnJyxcbiAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJwb3BvdmVyXCIgcm9sZT1cInRvb2x0aXBcIj48ZGl2IGNsYXNzPVwiYXJyb3dcIj48L2Rpdj48aDMgY2xhc3M9XCJwb3BvdmVyLXRpdGxlXCI+PC9oMz48ZGl2IGNsYXNzPVwicG9wb3Zlci1jb250ZW50XCI+PC9kaXY+PC9kaXY+J1xuICB9KVxuXG5cbiAgLy8gTk9URTogUE9QT1ZFUiBFWFRFTkRTIHRvb2x0aXAuanNcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBQb3BvdmVyLnByb3RvdHlwZSA9ICQuZXh0ZW5kKHt9LCAkLmZuLnRvb2x0aXAuQ29uc3RydWN0b3IucHJvdG90eXBlKVxuXG4gIFBvcG92ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUG9wb3ZlclxuXG4gIFBvcG92ZXIucHJvdG90eXBlLmdldERlZmF1bHRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBQb3BvdmVyLkRFRkFVTFRTXG4gIH1cblxuICBQb3BvdmVyLnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciAkdGlwICAgID0gdGhpcy50aXAoKVxuICAgIHZhciB0aXRsZSAgID0gdGhpcy5nZXRUaXRsZSgpXG4gICAgdmFyIGNvbnRlbnQgPSB0aGlzLmdldENvbnRlbnQoKVxuXG4gICAgJHRpcC5maW5kKCcucG9wb3Zlci10aXRsZScpW3RoaXMub3B0aW9ucy5odG1sID8gJ2h0bWwnIDogJ3RleHQnXSh0aXRsZSlcbiAgICAkdGlwLmZpbmQoJy5wb3BvdmVyLWNvbnRlbnQnKS5jaGlsZHJlbigpLmRldGFjaCgpLmVuZCgpWyAvLyB3ZSB1c2UgYXBwZW5kIGZvciBodG1sIG9iamVjdHMgdG8gbWFpbnRhaW4ganMgZXZlbnRzXG4gICAgICB0aGlzLm9wdGlvbnMuaHRtbCA/ICh0eXBlb2YgY29udGVudCA9PSAnc3RyaW5nJyA/ICdodG1sJyA6ICdhcHBlbmQnKSA6ICd0ZXh0J1xuICAgIF0oY29udGVudClcblxuICAgICR0aXAucmVtb3ZlQ2xhc3MoJ2ZhZGUgdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0IGluJylcblxuICAgIC8vIElFOCBkb2Vzbid0IGFjY2VwdCBoaWRpbmcgdmlhIHRoZSBgOmVtcHR5YCBwc2V1ZG8gc2VsZWN0b3IsIHdlIGhhdmUgdG8gZG9cbiAgICAvLyB0aGlzIG1hbnVhbGx5IGJ5IGNoZWNraW5nIHRoZSBjb250ZW50cy5cbiAgICBpZiAoISR0aXAuZmluZCgnLnBvcG92ZXItdGl0bGUnKS5odG1sKCkpICR0aXAuZmluZCgnLnBvcG92ZXItdGl0bGUnKS5oaWRlKClcbiAgfVxuXG4gIFBvcG92ZXIucHJvdG90eXBlLmhhc0NvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VGl0bGUoKSB8fCB0aGlzLmdldENvbnRlbnQoKVxuICB9XG5cbiAgUG9wb3Zlci5wcm90b3R5cGUuZ2V0Q29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJGUgPSB0aGlzLiRlbGVtZW50XG4gICAgdmFyIG8gID0gdGhpcy5vcHRpb25zXG5cbiAgICByZXR1cm4gJGUuYXR0cignZGF0YS1jb250ZW50JylcbiAgICAgIHx8ICh0eXBlb2Ygby5jb250ZW50ID09ICdmdW5jdGlvbicgP1xuICAgICAgICAgICAgby5jb250ZW50LmNhbGwoJGVbMF0pIDpcbiAgICAgICAgICAgIG8uY29udGVudClcbiAgfVxuXG4gIFBvcG92ZXIucHJvdG90eXBlLmFycm93ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAodGhpcy4kYXJyb3cgPSB0aGlzLiRhcnJvdyB8fCB0aGlzLnRpcCgpLmZpbmQoJy5hcnJvdycpKVxuICB9XG5cblxuICAvLyBQT1BPVkVSIFBMVUdJTiBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMucG9wb3ZlcicpXG4gICAgICB2YXIgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uXG5cbiAgICAgIGlmICghZGF0YSAmJiAvZGVzdHJveXxoaWRlLy50ZXN0KG9wdGlvbikpIHJldHVyblxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5wb3BvdmVyJywgKGRhdGEgPSBuZXcgUG9wb3Zlcih0aGlzLCBvcHRpb25zKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgdmFyIG9sZCA9ICQuZm4ucG9wb3ZlclxuXG4gICQuZm4ucG9wb3ZlciAgICAgICAgICAgICA9IFBsdWdpblxuICAkLmZuLnBvcG92ZXIuQ29uc3RydWN0b3IgPSBQb3BvdmVyXG5cblxuICAvLyBQT1BPVkVSIE5PIENPTkZMSUNUXG4gIC8vID09PT09PT09PT09PT09PT09PT1cblxuICAkLmZuLnBvcG92ZXIubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLnBvcG92ZXIgPSBvbGRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbn0oalF1ZXJ5KTtcbiIsIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiBtb2RhbC5qcyB2My4zLjdcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI21vZGFsc1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4rZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIE1PREFMIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBNb2RhbCA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zICAgICAgICAgICAgID0gb3B0aW9uc1xuICAgIHRoaXMuJGJvZHkgICAgICAgICAgICAgICA9ICQoZG9jdW1lbnQuYm9keSlcbiAgICB0aGlzLiRlbGVtZW50ICAgICAgICAgICAgPSAkKGVsZW1lbnQpXG4gICAgdGhpcy4kZGlhbG9nICAgICAgICAgICAgID0gdGhpcy4kZWxlbWVudC5maW5kKCcubW9kYWwtZGlhbG9nJylcbiAgICB0aGlzLiRiYWNrZHJvcCAgICAgICAgICAgPSBudWxsXG4gICAgdGhpcy5pc1Nob3duICAgICAgICAgICAgID0gbnVsbFxuICAgIHRoaXMub3JpZ2luYWxCb2R5UGFkICAgICA9IG51bGxcbiAgICB0aGlzLnNjcm9sbGJhcldpZHRoICAgICAgPSAwXG4gICAgdGhpcy5pZ25vcmVCYWNrZHJvcENsaWNrID0gZmFsc2VcblxuICAgIGlmICh0aGlzLm9wdGlvbnMucmVtb3RlKSB7XG4gICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAgIC5maW5kKCcubW9kYWwtY29udGVudCcpXG4gICAgICAgIC5sb2FkKHRoaXMub3B0aW9ucy5yZW1vdGUsICQucHJveHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignbG9hZGVkLmJzLm1vZGFsJylcbiAgICAgICAgfSwgdGhpcykpXG4gICAgfVxuICB9XG5cbiAgTW9kYWwuVkVSU0lPTiAgPSAnMy4zLjcnXG5cbiAgTW9kYWwuVFJBTlNJVElPTl9EVVJBVElPTiA9IDMwMFxuICBNb2RhbC5CQUNLRFJPUF9UUkFOU0lUSU9OX0RVUkFUSU9OID0gMTUwXG5cbiAgTW9kYWwuREVGQVVMVFMgPSB7XG4gICAgYmFja2Ryb3A6IHRydWUsXG4gICAga2V5Ym9hcmQ6IHRydWUsXG4gICAgc2hvdzogdHJ1ZVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uIChfcmVsYXRlZFRhcmdldCkge1xuICAgIHJldHVybiB0aGlzLmlzU2hvd24gPyB0aGlzLmhpZGUoKSA6IHRoaXMuc2hvdyhfcmVsYXRlZFRhcmdldClcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKF9yZWxhdGVkVGFyZ2V0KSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgdmFyIGUgICAgPSAkLkV2ZW50KCdzaG93LmJzLm1vZGFsJywgeyByZWxhdGVkVGFyZ2V0OiBfcmVsYXRlZFRhcmdldCB9KVxuXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXG5cbiAgICBpZiAodGhpcy5pc1Nob3duIHx8IGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxuXG4gICAgdGhpcy5pc1Nob3duID0gdHJ1ZVxuXG4gICAgdGhpcy5jaGVja1Njcm9sbGJhcigpXG4gICAgdGhpcy5zZXRTY3JvbGxiYXIoKVxuICAgIHRoaXMuJGJvZHkuYWRkQ2xhc3MoJ21vZGFsLW9wZW4nKVxuXG4gICAgdGhpcy5lc2NhcGUoKVxuICAgIHRoaXMucmVzaXplKClcblxuICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrLmRpc21pc3MuYnMubW9kYWwnLCAnW2RhdGEtZGlzbWlzcz1cIm1vZGFsXCJdJywgJC5wcm94eSh0aGlzLmhpZGUsIHRoaXMpKVxuXG4gICAgdGhpcy4kZGlhbG9nLm9uKCdtb3VzZWRvd24uZGlzbWlzcy5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoYXQuJGVsZW1lbnQub25lKCdtb3VzZXVwLmRpc21pc3MuYnMubW9kYWwnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoJChlLnRhcmdldCkuaXModGhhdC4kZWxlbWVudCkpIHRoYXQuaWdub3JlQmFja2Ryb3BDbGljayA9IHRydWVcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIHRoaXMuYmFja2Ryb3AoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHRyYW5zaXRpb24gPSAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGF0LiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJylcblxuICAgICAgaWYgKCF0aGF0LiRlbGVtZW50LnBhcmVudCgpLmxlbmd0aCkge1xuICAgICAgICB0aGF0LiRlbGVtZW50LmFwcGVuZFRvKHRoYXQuJGJvZHkpIC8vIGRvbid0IG1vdmUgbW9kYWxzIGRvbSBwb3NpdGlvblxuICAgICAgfVxuXG4gICAgICB0aGF0LiRlbGVtZW50XG4gICAgICAgIC5zaG93KClcbiAgICAgICAgLnNjcm9sbFRvcCgwKVxuXG4gICAgICB0aGF0LmFkanVzdERpYWxvZygpXG5cbiAgICAgIGlmICh0cmFuc2l0aW9uKSB7XG4gICAgICAgIHRoYXQuJGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGggLy8gZm9yY2UgcmVmbG93XG4gICAgICB9XG5cbiAgICAgIHRoYXQuJGVsZW1lbnQuYWRkQ2xhc3MoJ2luJylcblxuICAgICAgdGhhdC5lbmZvcmNlRm9jdXMoKVxuXG4gICAgICB2YXIgZSA9ICQuRXZlbnQoJ3Nob3duLmJzLm1vZGFsJywgeyByZWxhdGVkVGFyZ2V0OiBfcmVsYXRlZFRhcmdldCB9KVxuXG4gICAgICB0cmFuc2l0aW9uID9cbiAgICAgICAgdGhhdC4kZGlhbG9nIC8vIHdhaXQgZm9yIG1vZGFsIHRvIHNsaWRlIGluXG4gICAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhhdC4kZWxlbWVudC50cmlnZ2VyKCdmb2N1cycpLnRyaWdnZXIoZSlcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChNb2RhbC5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XG4gICAgICAgIHRoYXQuJGVsZW1lbnQudHJpZ2dlcignZm9jdXMnKS50cmlnZ2VyKGUpXG4gICAgfSlcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZSkgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICBlID0gJC5FdmVudCgnaGlkZS5icy5tb2RhbCcpXG5cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcblxuICAgIGlmICghdGhpcy5pc1Nob3duIHx8IGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxuXG4gICAgdGhpcy5pc1Nob3duID0gZmFsc2VcblxuICAgIHRoaXMuZXNjYXBlKClcbiAgICB0aGlzLnJlc2l6ZSgpXG5cbiAgICAkKGRvY3VtZW50KS5vZmYoJ2ZvY3VzaW4uYnMubW9kYWwnKVxuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLnJlbW92ZUNsYXNzKCdpbicpXG4gICAgICAub2ZmKCdjbGljay5kaXNtaXNzLmJzLm1vZGFsJylcbiAgICAgIC5vZmYoJ21vdXNldXAuZGlzbWlzcy5icy5tb2RhbCcpXG5cbiAgICB0aGlzLiRkaWFsb2cub2ZmKCdtb3VzZWRvd24uZGlzbWlzcy5icy5tb2RhbCcpXG5cbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJykgP1xuICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCAkLnByb3h5KHRoaXMuaGlkZU1vZGFsLCB0aGlzKSlcbiAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKE1vZGFsLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcbiAgICAgIHRoaXMuaGlkZU1vZGFsKClcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5lbmZvcmNlRm9jdXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgJChkb2N1bWVudClcbiAgICAgIC5vZmYoJ2ZvY3VzaW4uYnMubW9kYWwnKSAvLyBndWFyZCBhZ2FpbnN0IGluZmluaXRlIGZvY3VzIGxvb3BcbiAgICAgIC5vbignZm9jdXNpbi5icy5tb2RhbCcsICQucHJveHkoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50ICE9PSBlLnRhcmdldCAmJlxuICAgICAgICAgICAgdGhpcy4kZWxlbWVudFswXSAhPT0gZS50YXJnZXQgJiZcbiAgICAgICAgICAgICF0aGlzLiRlbGVtZW50LmhhcyhlLnRhcmdldCkubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdmb2N1cycpXG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpKVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLmVzY2FwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5pc1Nob3duICYmIHRoaXMub3B0aW9ucy5rZXlib2FyZCkge1xuICAgICAgdGhpcy4kZWxlbWVudC5vbigna2V5ZG93bi5kaXNtaXNzLmJzLm1vZGFsJywgJC5wcm94eShmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLndoaWNoID09IDI3ICYmIHRoaXMuaGlkZSgpXG4gICAgICB9LCB0aGlzKSlcbiAgICB9IGVsc2UgaWYgKCF0aGlzLmlzU2hvd24pIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdrZXlkb3duLmRpc21pc3MuYnMubW9kYWwnKVxuICAgIH1cbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuaXNTaG93bikge1xuICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuYnMubW9kYWwnLCAkLnByb3h5KHRoaXMuaGFuZGxlVXBkYXRlLCB0aGlzKSlcbiAgICB9IGVsc2Uge1xuICAgICAgJCh3aW5kb3cpLm9mZigncmVzaXplLmJzLm1vZGFsJylcbiAgICB9XG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuaGlkZU1vZGFsID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuICAgIHRoaXMuJGVsZW1lbnQuaGlkZSgpXG4gICAgdGhpcy5iYWNrZHJvcChmdW5jdGlvbiAoKSB7XG4gICAgICB0aGF0LiRib2R5LnJlbW92ZUNsYXNzKCdtb2RhbC1vcGVuJylcbiAgICAgIHRoYXQucmVzZXRBZGp1c3RtZW50cygpXG4gICAgICB0aGF0LnJlc2V0U2Nyb2xsYmFyKClcbiAgICAgIHRoYXQuJGVsZW1lbnQudHJpZ2dlcignaGlkZGVuLmJzLm1vZGFsJylcbiAgICB9KVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLnJlbW92ZUJhY2tkcm9wID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuJGJhY2tkcm9wICYmIHRoaXMuJGJhY2tkcm9wLnJlbW92ZSgpXG4gICAgdGhpcy4kYmFja2Ryb3AgPSBudWxsXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuYmFja2Ryb3AgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICB2YXIgYW5pbWF0ZSA9IHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2ZhZGUnKSA/ICdmYWRlJyA6ICcnXG5cbiAgICBpZiAodGhpcy5pc1Nob3duICYmIHRoaXMub3B0aW9ucy5iYWNrZHJvcCkge1xuICAgICAgdmFyIGRvQW5pbWF0ZSA9ICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIGFuaW1hdGVcblxuICAgICAgdGhpcy4kYmFja2Ryb3AgPSAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKVxuICAgICAgICAuYWRkQ2xhc3MoJ21vZGFsLWJhY2tkcm9wICcgKyBhbmltYXRlKVxuICAgICAgICAuYXBwZW5kVG8odGhpcy4kYm9keSlcblxuICAgICAgdGhpcy4kZWxlbWVudC5vbignY2xpY2suZGlzbWlzcy5icy5tb2RhbCcsICQucHJveHkoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHRoaXMuaWdub3JlQmFja2Ryb3BDbGljaykge1xuICAgICAgICAgIHRoaXMuaWdub3JlQmFja2Ryb3BDbGljayA9IGZhbHNlXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGUudGFyZ2V0ICE9PSBlLmN1cnJlbnRUYXJnZXQpIHJldHVyblxuICAgICAgICB0aGlzLm9wdGlvbnMuYmFja2Ryb3AgPT0gJ3N0YXRpYydcbiAgICAgICAgICA/IHRoaXMuJGVsZW1lbnRbMF0uZm9jdXMoKVxuICAgICAgICAgIDogdGhpcy5oaWRlKClcbiAgICAgIH0sIHRoaXMpKVxuXG4gICAgICBpZiAoZG9BbmltYXRlKSB0aGlzLiRiYWNrZHJvcFswXS5vZmZzZXRXaWR0aCAvLyBmb3JjZSByZWZsb3dcblxuICAgICAgdGhpcy4kYmFja2Ryb3AuYWRkQ2xhc3MoJ2luJylcblxuICAgICAgaWYgKCFjYWxsYmFjaykgcmV0dXJuXG5cbiAgICAgIGRvQW5pbWF0ZSA/XG4gICAgICAgIHRoaXMuJGJhY2tkcm9wXG4gICAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgY2FsbGJhY2spXG4gICAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKE1vZGFsLkJBQ0tEUk9QX1RSQU5TSVRJT05fRFVSQVRJT04pIDpcbiAgICAgICAgY2FsbGJhY2soKVxuXG4gICAgfSBlbHNlIGlmICghdGhpcy5pc1Nob3duICYmIHRoaXMuJGJhY2tkcm9wKSB7XG4gICAgICB0aGlzLiRiYWNrZHJvcC5yZW1vdmVDbGFzcygnaW4nKVxuXG4gICAgICB2YXIgY2FsbGJhY2tSZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoYXQucmVtb3ZlQmFja2Ryb3AoKVxuICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpXG4gICAgICB9XG4gICAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJykgP1xuICAgICAgICB0aGlzLiRiYWNrZHJvcFxuICAgICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGNhbGxiYWNrUmVtb3ZlKVxuICAgICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChNb2RhbC5CQUNLRFJPUF9UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XG4gICAgICAgIGNhbGxiYWNrUmVtb3ZlKClcblxuICAgIH0gZWxzZSBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrKClcbiAgICB9XG4gIH1cblxuICAvLyB0aGVzZSBmb2xsb3dpbmcgbWV0aG9kcyBhcmUgdXNlZCB0byBoYW5kbGUgb3ZlcmZsb3dpbmcgbW9kYWxzXG5cbiAgTW9kYWwucHJvdG90eXBlLmhhbmRsZVVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFkanVzdERpYWxvZygpXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuYWRqdXN0RGlhbG9nID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBtb2RhbElzT3ZlcmZsb3dpbmcgPSB0aGlzLiRlbGVtZW50WzBdLnNjcm9sbEhlaWdodCA+IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHRcblxuICAgIHRoaXMuJGVsZW1lbnQuY3NzKHtcbiAgICAgIHBhZGRpbmdMZWZ0OiAgIXRoaXMuYm9keUlzT3ZlcmZsb3dpbmcgJiYgbW9kYWxJc092ZXJmbG93aW5nID8gdGhpcy5zY3JvbGxiYXJXaWR0aCA6ICcnLFxuICAgICAgcGFkZGluZ1JpZ2h0OiB0aGlzLmJvZHlJc092ZXJmbG93aW5nICYmICFtb2RhbElzT3ZlcmZsb3dpbmcgPyB0aGlzLnNjcm9sbGJhcldpZHRoIDogJydcbiAgICB9KVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLnJlc2V0QWRqdXN0bWVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy4kZWxlbWVudC5jc3Moe1xuICAgICAgcGFkZGluZ0xlZnQ6ICcnLFxuICAgICAgcGFkZGluZ1JpZ2h0OiAnJ1xuICAgIH0pXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuY2hlY2tTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZ1bGxXaW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgaWYgKCFmdWxsV2luZG93V2lkdGgpIHsgLy8gd29ya2Fyb3VuZCBmb3IgbWlzc2luZyB3aW5kb3cuaW5uZXJXaWR0aCBpbiBJRThcbiAgICAgIHZhciBkb2N1bWVudEVsZW1lbnRSZWN0ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBmdWxsV2luZG93V2lkdGggPSBkb2N1bWVudEVsZW1lbnRSZWN0LnJpZ2h0IC0gTWF0aC5hYnMoZG9jdW1lbnRFbGVtZW50UmVjdC5sZWZ0KVxuICAgIH1cbiAgICB0aGlzLmJvZHlJc092ZXJmbG93aW5nID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCA8IGZ1bGxXaW5kb3dXaWR0aFxuICAgIHRoaXMuc2Nyb2xsYmFyV2lkdGggPSB0aGlzLm1lYXN1cmVTY3JvbGxiYXIoKVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLnNldFNjcm9sbGJhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYm9keVBhZCA9IHBhcnNlSW50KCh0aGlzLiRib2R5LmNzcygncGFkZGluZy1yaWdodCcpIHx8IDApLCAxMClcbiAgICB0aGlzLm9yaWdpbmFsQm9keVBhZCA9IGRvY3VtZW50LmJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0IHx8ICcnXG4gICAgaWYgKHRoaXMuYm9keUlzT3ZlcmZsb3dpbmcpIHRoaXMuJGJvZHkuY3NzKCdwYWRkaW5nLXJpZ2h0JywgYm9keVBhZCArIHRoaXMuc2Nyb2xsYmFyV2lkdGgpXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUucmVzZXRTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy4kYm9keS5jc3MoJ3BhZGRpbmctcmlnaHQnLCB0aGlzLm9yaWdpbmFsQm9keVBhZClcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5tZWFzdXJlU2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkgeyAvLyB0aHggd2Fsc2hcbiAgICB2YXIgc2Nyb2xsRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBzY3JvbGxEaXYuY2xhc3NOYW1lID0gJ21vZGFsLXNjcm9sbGJhci1tZWFzdXJlJ1xuICAgIHRoaXMuJGJvZHkuYXBwZW5kKHNjcm9sbERpdilcbiAgICB2YXIgc2Nyb2xsYmFyV2lkdGggPSBzY3JvbGxEaXYub2Zmc2V0V2lkdGggLSBzY3JvbGxEaXYuY2xpZW50V2lkdGhcbiAgICB0aGlzLiRib2R5WzBdLnJlbW92ZUNoaWxkKHNjcm9sbERpdilcbiAgICByZXR1cm4gc2Nyb2xsYmFyV2lkdGhcbiAgfVxuXG5cbiAgLy8gTU9EQUwgUExVR0lOIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uLCBfcmVsYXRlZFRhcmdldCkge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLm1vZGFsJylcbiAgICAgIHZhciBvcHRpb25zID0gJC5leHRlbmQoe30sIE1vZGFsLkRFRkFVTFRTLCAkdGhpcy5kYXRhKCksIHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uKVxuXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLm1vZGFsJywgKGRhdGEgPSBuZXcgTW9kYWwodGhpcywgb3B0aW9ucykpKVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXShfcmVsYXRlZFRhcmdldClcbiAgICAgIGVsc2UgaWYgKG9wdGlvbnMuc2hvdykgZGF0YS5zaG93KF9yZWxhdGVkVGFyZ2V0KVxuICAgIH0pXG4gIH1cblxuICB2YXIgb2xkID0gJC5mbi5tb2RhbFxuXG4gICQuZm4ubW9kYWwgICAgICAgICAgICAgPSBQbHVnaW5cbiAgJC5mbi5tb2RhbC5Db25zdHJ1Y3RvciA9IE1vZGFsXG5cblxuICAvLyBNT0RBTCBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT09PVxuXG4gICQuZm4ubW9kYWwubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLm1vZGFsID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAgLy8gTU9EQUwgREFUQS1BUElcbiAgLy8gPT09PT09PT09PT09PT1cblxuICAkKGRvY3VtZW50KS5vbignY2xpY2suYnMubW9kYWwuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwibW9kYWxcIl0nLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgIHZhciBocmVmICAgID0gJHRoaXMuYXR0cignaHJlZicpXG4gICAgdmFyICR0YXJnZXQgPSAkKCR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JykgfHwgKGhyZWYgJiYgaHJlZi5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLCAnJykpKSAvLyBzdHJpcCBmb3IgaWU3XG4gICAgdmFyIG9wdGlvbiAgPSAkdGFyZ2V0LmRhdGEoJ2JzLm1vZGFsJykgPyAndG9nZ2xlJyA6ICQuZXh0ZW5kKHsgcmVtb3RlOiAhLyMvLnRlc3QoaHJlZikgJiYgaHJlZiB9LCAkdGFyZ2V0LmRhdGEoKSwgJHRoaXMuZGF0YSgpKVxuXG4gICAgaWYgKCR0aGlzLmlzKCdhJykpIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgJHRhcmdldC5vbmUoJ3Nob3cuYnMubW9kYWwnLCBmdW5jdGlvbiAoc2hvd0V2ZW50KSB7XG4gICAgICBpZiAoc2hvd0V2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm4gLy8gb25seSByZWdpc3RlciBmb2N1cyByZXN0b3JlciBpZiBtb2RhbCB3aWxsIGFjdHVhbGx5IGdldCBzaG93blxuICAgICAgJHRhcmdldC5vbmUoJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHRoaXMuaXMoJzp2aXNpYmxlJykgJiYgJHRoaXMudHJpZ2dlcignZm9jdXMnKVxuICAgICAgfSlcbiAgICB9KVxuICAgIFBsdWdpbi5jYWxsKCR0YXJnZXQsIG9wdGlvbiwgdGhpcylcbiAgfSlcblxufShqUXVlcnkpO1xuIiwiLyohXG4gKiBKYXZhU2NyaXB0IENvb2tpZSB2Mi4yLjBcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qcy1jb29raWUvanMtY29va2llXG4gKlxuICogQ29weXJpZ2h0IDIwMDYsIDIwMTUgS2xhdXMgSGFydGwgJiBGYWduZXIgQnJhY2tcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG47KGZ1bmN0aW9uIChmYWN0b3J5KSB7XG5cdHZhciByZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIgPSBmYWxzZTtcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShmYWN0b3J5KTtcblx0XHRyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIgPSB0cnVlO1xuXHR9XG5cdGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0XHRyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIgPSB0cnVlO1xuXHR9XG5cdGlmICghcmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyKSB7XG5cdFx0dmFyIE9sZENvb2tpZXMgPSB3aW5kb3cuQ29va2llcztcblx0XHR2YXIgYXBpID0gd2luZG93LkNvb2tpZXMgPSBmYWN0b3J5KCk7XG5cdFx0YXBpLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR3aW5kb3cuQ29va2llcyA9IE9sZENvb2tpZXM7XG5cdFx0XHRyZXR1cm4gYXBpO1xuXHRcdH07XG5cdH1cbn0oZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBleHRlbmQgKCkge1xuXHRcdHZhciBpID0gMDtcblx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0Zm9yICg7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBhdHRyaWJ1dGVzID0gYXJndW1lbnRzWyBpIF07XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gYXR0cmlidXRlcykge1xuXHRcdFx0XHRyZXN1bHRba2V5XSA9IGF0dHJpYnV0ZXNba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdGZ1bmN0aW9uIGluaXQgKGNvbnZlcnRlcikge1xuXHRcdGZ1bmN0aW9uIGFwaSAoa2V5LCB2YWx1ZSwgYXR0cmlidXRlcykge1xuXHRcdFx0dmFyIHJlc3VsdDtcblx0XHRcdGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gV3JpdGVcblxuXHRcdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdGF0dHJpYnV0ZXMgPSBleHRlbmQoe1xuXHRcdFx0XHRcdHBhdGg6ICcvJ1xuXHRcdFx0XHR9LCBhcGkuZGVmYXVsdHMsIGF0dHJpYnV0ZXMpO1xuXG5cdFx0XHRcdGlmICh0eXBlb2YgYXR0cmlidXRlcy5leHBpcmVzID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRcdHZhciBleHBpcmVzID0gbmV3IERhdGUoKTtcblx0XHRcdFx0XHRleHBpcmVzLnNldE1pbGxpc2Vjb25kcyhleHBpcmVzLmdldE1pbGxpc2Vjb25kcygpICsgYXR0cmlidXRlcy5leHBpcmVzICogODY0ZSs1KTtcblx0XHRcdFx0XHRhdHRyaWJ1dGVzLmV4cGlyZXMgPSBleHBpcmVzO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gV2UncmUgdXNpbmcgXCJleHBpcmVzXCIgYmVjYXVzZSBcIm1heC1hZ2VcIiBpcyBub3Qgc3VwcG9ydGVkIGJ5IElFXG5cdFx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyA9IGF0dHJpYnV0ZXMuZXhwaXJlcyA/IGF0dHJpYnV0ZXMuZXhwaXJlcy50b1VUQ1N0cmluZygpIDogJyc7XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXN1bHQgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5cdFx0XHRcdFx0aWYgKC9eW1xce1xcW10vLnRlc3QocmVzdWx0KSkge1xuXHRcdFx0XHRcdFx0dmFsdWUgPSByZXN1bHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXG5cdFx0XHRcdGlmICghY29udmVydGVyLndyaXRlKSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKHZhbHVlKSlcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC8lKDIzfDI0fDI2fDJCfDNBfDNDfDNFfDNEfDJGfDNGfDQwfDVCfDVEfDVFfDYwfDdCfDdEfDdDKS9nLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHZhbHVlID0gY29udmVydGVyLndyaXRlKHZhbHVlLCBrZXkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0a2V5ID0gZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhrZXkpKTtcblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoLyUoMjN8MjR8MjZ8MkJ8NUV8NjB8N0MpL2csIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9bXFwoXFwpXS9nLCBlc2NhcGUpO1xuXG5cdFx0XHRcdHZhciBzdHJpbmdpZmllZEF0dHJpYnV0ZXMgPSAnJztcblxuXHRcdFx0XHRmb3IgKHZhciBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0XHRpZiAoIWF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0pIHtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzdHJpbmdpZmllZEF0dHJpYnV0ZXMgKz0gJzsgJyArIGF0dHJpYnV0ZU5hbWU7XG5cdFx0XHRcdFx0aWYgKGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0gPT09IHRydWUpIHtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzdHJpbmdpZmllZEF0dHJpYnV0ZXMgKz0gJz0nICsgYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gKGRvY3VtZW50LmNvb2tpZSA9IGtleSArICc9JyArIHZhbHVlICsgc3RyaW5naWZpZWRBdHRyaWJ1dGVzKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gUmVhZFxuXG5cdFx0XHRpZiAoIWtleSkge1xuXHRcdFx0XHRyZXN1bHQgPSB7fTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVG8gcHJldmVudCB0aGUgZm9yIGxvb3AgaW4gdGhlIGZpcnN0IHBsYWNlIGFzc2lnbiBhbiBlbXB0eSBhcnJheVxuXHRcdFx0Ly8gaW4gY2FzZSB0aGVyZSBhcmUgbm8gY29va2llcyBhdCBhbGwuIEFsc28gcHJldmVudHMgb2RkIHJlc3VsdCB3aGVuXG5cdFx0XHQvLyBjYWxsaW5nIFwiZ2V0KClcIlxuXHRcdFx0dmFyIGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUgPyBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsgJykgOiBbXTtcblx0XHRcdHZhciByZGVjb2RlID0gLyglWzAtOUEtWl17Mn0pKy9nO1xuXHRcdFx0dmFyIGkgPSAwO1xuXG5cdFx0XHRmb3IgKDsgaSA8IGNvb2tpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHBhcnRzID0gY29va2llc1tpXS5zcGxpdCgnPScpO1xuXHRcdFx0XHR2YXIgY29va2llID0gcGFydHMuc2xpY2UoMSkuam9pbignPScpO1xuXG5cdFx0XHRcdGlmICghdGhpcy5qc29uICYmIGNvb2tpZS5jaGFyQXQoMCkgPT09ICdcIicpIHtcblx0XHRcdFx0XHRjb29raWUgPSBjb29raWUuc2xpY2UoMSwgLTEpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR2YXIgbmFtZSA9IHBhcnRzWzBdLnJlcGxhY2UocmRlY29kZSwgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0XHRjb29raWUgPSBjb252ZXJ0ZXIucmVhZCA/XG5cdFx0XHRcdFx0XHRjb252ZXJ0ZXIucmVhZChjb29raWUsIG5hbWUpIDogY29udmVydGVyKGNvb2tpZSwgbmFtZSkgfHxcblx0XHRcdFx0XHRcdGNvb2tpZS5yZXBsYWNlKHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cblx0XHRcdFx0XHRpZiAodGhpcy5qc29uKSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb29raWUgPSBKU09OLnBhcnNlKGNvb2tpZSk7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChrZXkgPT09IG5hbWUpIHtcblx0XHRcdFx0XHRcdHJlc3VsdCA9IGNvb2tpZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICgha2V5KSB7XG5cdFx0XHRcdFx0XHRyZXN1bHRbbmFtZV0gPSBjb29raWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblxuXHRcdGFwaS5zZXQgPSBhcGk7XG5cdFx0YXBpLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdHJldHVybiBhcGkuY2FsbChhcGksIGtleSk7XG5cdFx0fTtcblx0XHRhcGkuZ2V0SlNPTiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBhcGkuYXBwbHkoe1xuXHRcdFx0XHRqc29uOiB0cnVlXG5cdFx0XHR9LCBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuXHRcdH07XG5cdFx0YXBpLmRlZmF1bHRzID0ge307XG5cblx0XHRhcGkucmVtb3ZlID0gZnVuY3Rpb24gKGtleSwgYXR0cmlidXRlcykge1xuXHRcdFx0YXBpKGtleSwgJycsIGV4dGVuZChhdHRyaWJ1dGVzLCB7XG5cdFx0XHRcdGV4cGlyZXM6IC0xXG5cdFx0XHR9KSk7XG5cdFx0fTtcblxuXHRcdGFwaS53aXRoQ29udmVydGVyID0gaW5pdDtcblxuXHRcdHJldHVybiBhcGk7XG5cdH1cblxuXHRyZXR1cm4gaW5pdChmdW5jdGlvbiAoKSB7fSk7XG59KSk7XG4iLCIhZnVuY3Rpb24oZSl7dmFyIHQ7ZS5mbi5zbGlua3k9ZnVuY3Rpb24oYSl7dmFyIHM9ZS5leHRlbmQoe2xhYmVsOlwiQmFja1wiLHRpdGxlOiExLHNwZWVkOjMwMCxyZXNpemU6ITB9LGEpLGk9ZSh0aGlzKSxuPWkuY2hpbGRyZW4oKS5maXJzdCgpO2kuYWRkQ2xhc3MoXCJzbGlua3ktbWVudVwiKTt2YXIgcj1mdW5jdGlvbihlLHQpe3ZhciBhPU1hdGgucm91bmQocGFyc2VJbnQobi5nZXQoMCkuc3R5bGUubGVmdCkpfHwwO24uY3NzKFwibGVmdFwiLGEtMTAwKmUrXCIlXCIpLFwiZnVuY3Rpb25cIj09dHlwZW9mIHQmJnNldFRpbWVvdXQodCxzLnNwZWVkKX0sbD1mdW5jdGlvbihlKXtpLmhlaWdodChlLm91dGVySGVpZ2h0KCkpfSxkPWZ1bmN0aW9uKGUpe2kuY3NzKFwidHJhbnNpdGlvbi1kdXJhdGlvblwiLGUrXCJtc1wiKSxuLmNzcyhcInRyYW5zaXRpb24tZHVyYXRpb25cIixlK1wibXNcIil9O2lmKGQocy5zcGVlZCksZShcImEgKyB1bFwiLGkpLnByZXYoKS5hZGRDbGFzcyhcIm5leHRcIiksZShcImxpID4gdWxcIixpKS5wcmVwZW5kKCc8bGkgY2xhc3M9XCJoZWFkZXJcIj4nKSxzLnRpdGxlPT09ITAmJmUoXCJsaSA+IHVsXCIsaSkuZWFjaChmdW5jdGlvbigpe3ZhciB0PWUodGhpcykucGFyZW50KCkuZmluZChcImFcIikuZmlyc3QoKS50ZXh0KCksYT1lKFwiPGgyPlwiKS50ZXh0KHQpO2UoXCI+IC5oZWFkZXJcIix0aGlzKS5hcHBlbmQoYSl9KSxzLnRpdGxlfHxzLmxhYmVsIT09ITApe3ZhciBvPWUoXCI8YT5cIikudGV4dChzLmxhYmVsKS5wcm9wKFwiaHJlZlwiLFwiI1wiKS5hZGRDbGFzcyhcImJhY2tcIik7ZShcIi5oZWFkZXJcIixpKS5hcHBlbmQobyl9ZWxzZSBlKFwibGkgPiB1bFwiLGkpLmVhY2goZnVuY3Rpb24oKXt2YXIgdD1lKHRoaXMpLnBhcmVudCgpLmZpbmQoXCJhXCIpLmZpcnN0KCkudGV4dCgpLGE9ZShcIjxhPlwiKS50ZXh0KHQpLnByb3AoXCJocmVmXCIsXCIjXCIpLmFkZENsYXNzKFwiYmFja1wiKTtlKFwiPiAuaGVhZGVyXCIsdGhpcykuYXBwZW5kKGEpfSk7ZShcImFcIixpKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oYSl7aWYoISh0K3Muc3BlZWQ+RGF0ZS5ub3coKSkpe3Q9RGF0ZS5ub3coKTt2YXIgbj1lKHRoaXMpOy8jLy50ZXN0KHRoaXMuaHJlZikmJmEucHJldmVudERlZmF1bHQoKSxuLmhhc0NsYXNzKFwibmV4dFwiKT8oaS5maW5kKFwiLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSxuLm5leHQoKS5zaG93KCkuYWRkQ2xhc3MoXCJhY3RpdmVcIikscigxKSxzLnJlc2l6ZSYmbChuLm5leHQoKSkpOm4uaGFzQ2xhc3MoXCJiYWNrXCIpJiYocigtMSxmdW5jdGlvbigpe2kuZmluZChcIi5hY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIiksbi5wYXJlbnQoKS5wYXJlbnQoKS5oaWRlKCkucGFyZW50c1VudGlsKGksXCJ1bFwiKS5maXJzdCgpLmFkZENsYXNzKFwiYWN0aXZlXCIpfSkscy5yZXNpemUmJmwobi5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnRzVW50aWwoaSxcInVsXCIpKSl9fSksdGhpcy5qdW1wPWZ1bmN0aW9uKHQsYSl7dD1lKHQpO3ZhciBuPWkuZmluZChcIi5hY3RpdmVcIik7bj1uLmxlbmd0aD4wP24ucGFyZW50c1VudGlsKGksXCJ1bFwiKS5sZW5ndGg6MCxpLmZpbmQoXCJ1bFwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKS5oaWRlKCk7dmFyIG89dC5wYXJlbnRzVW50aWwoaSxcInVsXCIpO28uc2hvdygpLHQuc2hvdygpLmFkZENsYXNzKFwiYWN0aXZlXCIpLGE9PT0hMSYmZCgwKSxyKG8ubGVuZ3RoLW4pLHMucmVzaXplJiZsKHQpLGE9PT0hMSYmZChzLnNwZWVkKX0sdGhpcy5ob21lPWZ1bmN0aW9uKHQpe3Q9PT0hMSYmZCgwKTt2YXIgYT1pLmZpbmQoXCIuYWN0aXZlXCIpLG49YS5wYXJlbnRzVW50aWwoaSxcImxpXCIpLmxlbmd0aDtuPjAmJihyKC1uLGZ1bmN0aW9uKCl7YS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKX0pLHMucmVzaXplJiZsKGUoYS5wYXJlbnRzVW50aWwoaSxcImxpXCIpLmdldChuLTEpKS5wYXJlbnQoKSkpLHQ9PT0hMSYmZChzLnNwZWVkKX0sdGhpcy5kZXN0cm95PWZ1bmN0aW9uKCl7ZShcIi5oZWFkZXJcIixpKS5yZW1vdmUoKSxlKFwiYVwiLGkpLnJlbW92ZUNsYXNzKFwibmV4dFwiKS5vZmYoXCJjbGlja1wiKSxpLnJlbW92ZUNsYXNzKFwic2xpbmt5LW1lbnVcIikuY3NzKFwidHJhbnNpdGlvbi1kdXJhdGlvblwiLFwiXCIpLG4uY3NzKFwidHJhbnNpdGlvbi1kdXJhdGlvblwiLFwiXCIpfTt2YXIgYz1pLmZpbmQoXCIuYWN0aXZlXCIpO3JldHVybiBjLmxlbmd0aD4wJiYoYy5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSx0aGlzLmp1bXAoYywhMSkpLHRoaXN9fShqUXVlcnkpOyIsIi8vIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gfCBMYXlvdXRcbi8vIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gfFxuLy8gfCBUaGlzIGpRdWVyeSBzY3JpcHQgaXMgd3JpdHRlbiBieVxuLy8gfFxuLy8gfCBNb3J0ZW4gTmlzc2VuXG4vLyB8IGhqZW1tZXNpZGVrb25nZW4uZGtcbi8vIHxcbnZhciBsYXlvdXQgPSAoZnVuY3Rpb24gKCQpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgcHViID0ge30sXG4gICAgICAgICRsYXlvdXRfX2hlYWRlciA9ICQoJy5sYXlvdXRfX2hlYWRlcicpLFxuICAgICAgICAkbGF5b3V0X19kb2N1bWVudCA9ICQoJy5sYXlvdXRfX2RvY3VtZW50JyksXG4gICAgICAgIGxheW91dF9jbGFzc2VzID0ge1xuICAgICAgICAgICAgJ2xheW91dF9fd3JhcHBlcic6ICcubGF5b3V0X193cmFwcGVyJyxcbiAgICAgICAgICAgICdsYXlvdXRfX2RyYXdlcic6ICcubGF5b3V0X19kcmF3ZXInLFxuICAgICAgICAgICAgJ2xheW91dF9faGVhZGVyJzogJy5sYXlvdXRfX2hlYWRlcicsXG4gICAgICAgICAgICAnbGF5b3V0X19vYmZ1c2NhdG9yJzogJy5sYXlvdXRfX29iZnVzY2F0b3InLFxuICAgICAgICAgICAgJ2xheW91dF9fZG9jdW1lbnQnOiAnLmxheW91dF9fZG9jdW1lbnQnLFxuXG4gICAgICAgICAgICAnd3JhcHBlcl9pc191cGdyYWRlZCc6ICdpcy11cGdyYWRlZCcsXG4gICAgICAgICAgICAnd3JhcHBlcl9oYXNfZHJhd2VyJzogJ2hhcy1kcmF3ZXInLFxuICAgICAgICAgICAgJ3dyYXBwZXJfaGFzX3Njcm9sbGluZ19oZWFkZXInOiAnaGFzLXNjcm9sbGluZy1oZWFkZXInLFxuICAgICAgICAgICAgJ2hlYWRlcl9zY3JvbGwnOiAnbGF5b3V0X19oZWFkZXItLXNjcm9sbCcsXG4gICAgICAgICAgICAnaGVhZGVyX2lzX2NvbXBhY3QnOiAnaXMtY29tcGFjdCcsXG4gICAgICAgICAgICAnaGVhZGVyX3dhdGVyZmFsbCc6ICdsYXlvdXRfX2hlYWRlci0td2F0ZXJmYWxsJyxcbiAgICAgICAgICAgICdkcmF3ZXJfaXNfdmlzaWJsZSc6ICdpcy12aXNpYmxlJyxcbiAgICAgICAgICAgICdvYmZ1c2NhdG9yX2lzX3Zpc2libGUnOiAnaXMtdmlzaWJsZSdcbiAgICAgICAgfTtcblxuICAgIC8qKlxuICAgICAqIEluc3RhbnRpYXRlXG4gICAgICovXG4gICAgcHViLmluaXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICByZWdpc3RlckV2ZW50SGFuZGxlcnMoKTtcbiAgICAgICAgcmVnaXN0ZXJCb290RXZlbnRIYW5kbGVycygpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBib290IGV2ZW50IGhhbmRsZXJzXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVnaXN0ZXJCb290RXZlbnRIYW5kbGVycygpIHtcblxuICAgICAgICAvLyBBZGQgY2xhc3NlcyB0byBlbGVtZW50c1xuICAgICAgICBhZGRFbGVtZW50Q2xhc3NlcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGV2ZW50IGhhbmRsZXJzXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVnaXN0ZXJFdmVudEhhbmRsZXJzKCkge1xuXG4gICAgICAgIC8vIFRvZ2dsZSBkcmF3ZXJcbiAgICAgICAgJCgnW2RhdGEtdG9nZ2xlLWRyYXdlcl0nKS5hZGQoJChsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX29iZnVzY2F0b3IpKS5vbignY2xpY2sgdG91Y2hzdGFydCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdmFyICRlbGVtZW50ID0gJCh0aGlzKTtcblxuICAgICAgICAgICAgdG9nZ2xlRHJhd2VyKCRlbGVtZW50KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gV2F0ZXJmYWxsIGhlYWRlclxuICAgICAgICBpZiAoJGxheW91dF9faGVhZGVyLmhhc0NsYXNzKGxheW91dF9jbGFzc2VzLmhlYWRlcl93YXRlcmZhbGwpKSB7XG5cbiAgICAgICAgICAgICRsYXlvdXRfX2RvY3VtZW50Lm9uKCd0b3VjaG1vdmUgc2Nyb2xsJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgJGRvY3VtZW50ID0gJCh0aGlzKTtcblxuICAgICAgICAgICAgICAgIHdhdGVyZmFsbEhlYWRlcigkZG9jdW1lbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgZHJhd2VyXG4gICAgICovXG4gICAgZnVuY3Rpb24gdG9nZ2xlRHJhd2VyKCRlbGVtZW50KSB7XG4gICAgICAgIHZhciAkd3JhcHBlciA9ICRlbGVtZW50LmNsb3Nlc3QobGF5b3V0X2NsYXNzZXMubGF5b3V0X193cmFwcGVyKSxcbiAgICAgICAgICAgICRvYmZ1c2NhdG9yID0gJHdyYXBwZXIuY2hpbGRyZW4obGF5b3V0X2NsYXNzZXMubGF5b3V0X19vYmZ1c2NhdG9yKSxcbiAgICAgICAgICAgICRkcmF3ZXIgPSAkd3JhcHBlci5jaGlsZHJlbihsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX2RyYXdlcik7XG5cbiAgICAgICAgLy8gVG9nZ2xlIHZpc2libGUgc3RhdGVcbiAgICAgICAgJG9iZnVzY2F0b3IudG9nZ2xlQ2xhc3MobGF5b3V0X2NsYXNzZXMub2JmdXNjYXRvcl9pc192aXNpYmxlKTtcbiAgICAgICAgJGRyYXdlci50b2dnbGVDbGFzcyhsYXlvdXRfY2xhc3Nlcy5kcmF3ZXJfaXNfdmlzaWJsZSk7XG5cbiAgICAgICAgLy8gQWx0ZXIgYXJpYS1oaWRkZW4gc3RhdHVzXG4gICAgICAgICRkcmF3ZXIuYXR0cignYXJpYS1oaWRkZW4nLCAoJGRyYXdlci5oYXNDbGFzcyhsYXlvdXRfY2xhc3Nlcy5kcmF3ZXJfaXNfdmlzaWJsZSkpID8gZmFsc2UgOiB0cnVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXYXRlcmZhbGwgaGVhZGVyXG4gICAgICovXG4gICAgZnVuY3Rpb24gd2F0ZXJmYWxsSGVhZGVyKCRkb2N1bWVudCkge1xuICAgICAgICB2YXIgJHdyYXBwZXIgPSAkZG9jdW1lbnQuY2xvc2VzdChsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX3dyYXBwZXIpLFxuICAgICAgICAgICAgJGhlYWRlciA9ICR3cmFwcGVyLmNoaWxkcmVuKGxheW91dF9jbGFzc2VzLmxheW91dF9faGVhZGVyKSxcbiAgICAgICAgICAgIGRpc3RhbmNlID0gJGRvY3VtZW50LnNjcm9sbFRvcCgpO1xuXG4gICAgICAgIGlmIChkaXN0YW5jZSA+IDApIHtcbiAgICAgICAgICAgICRoZWFkZXIuYWRkQ2xhc3MobGF5b3V0X2NsYXNzZXMuaGVhZGVyX2lzX2NvbXBhY3QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgJGhlYWRlci5yZW1vdmVDbGFzcyhsYXlvdXRfY2xhc3Nlcy5oZWFkZXJfaXNfY29tcGFjdCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgY2xhc3NlcyB0byBlbGVtZW50cywgYmFzZWQgb24gYXR0YWNoZWQgY2xhc3Nlc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFkZEVsZW1lbnRDbGFzc2VzKCkge1xuXG4gICAgICAgICQobGF5b3V0X2NsYXNzZXMubGF5b3V0X193cmFwcGVyKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgJHdyYXBwZXIgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgICRoZWFkZXIgPSAkd3JhcHBlci5jaGlsZHJlbihsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX2hlYWRlciksXG4gICAgICAgICAgICAgICAgJGRyYXdlciA9ICR3cmFwcGVyLmNoaWxkcmVuKGxheW91dF9jbGFzc2VzLmxheW91dF9fZHJhd2VyKTtcblxuICAgICAgICAgICAgLy8gU2Nyb2xsIGhlYWRlclxuICAgICAgICAgICAgaWYgKCRoZWFkZXIuaGFzQ2xhc3MobGF5b3V0X2NsYXNzZXMuaGVhZGVyX3Njcm9sbCkpIHtcbiAgICAgICAgICAgICAgICAkd3JhcHBlci5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy53cmFwcGVyX2hhc19zY3JvbGxpbmdfaGVhZGVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRHJhd2VyXG4gICAgICAgICAgICBpZiAoJGRyYXdlci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgJHdyYXBwZXIuYWRkQ2xhc3MobGF5b3V0X2NsYXNzZXMud3JhcHBlcl9oYXNfZHJhd2VyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXBncmFkZWRcbiAgICAgICAgICAgIGlmICgkd3JhcHBlci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgJHdyYXBwZXIuYWRkQ2xhc3MobGF5b3V0X2NsYXNzZXMud3JhcHBlcl9pc191cGdyYWRlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBwdWI7XG59KShqUXVlcnkpO1xuIiwiLy8gRG9jdW1lbnQgcmVhZHlcbihmdW5jdGlvbiAoJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gRW5hYmxlIGxheW91dFxuICBsYXlvdXQuaW5pdCgpO1xuXG4gIC8vIFNsaW5reVxuICAkKCcuc2xpbmt5LW1lbnUnKVxuICAgICAgLmZpbmQoJ3VsLCBsaSwgYScpXG4gICAgICAucmVtb3ZlQ2xhc3MoKTtcblxuICAkKCcucmVnaW9uLW1vYmlsZS1oZWFkZXItbmF2aWdhdGlvbiAuc2xpbmt5LW1lbnUnKS5zbGlua3koe1xuICAgIHRpdGxlOiB0cnVlLFxuICAgIGxhYmVsOiAnJ1xuICB9KTtcblxuICAvLyBOb3RpZnlcbiAgdmFyICRub3RpZmljYXRpb25zID0gJCgnLm5vdGlmeScpO1xuICBpZiAoJG5vdGlmaWNhdGlvbnMubGVuZ3RoKSB7XG5cbiAgICAkbm90aWZpY2F0aW9ucy5lYWNoKGZ1bmN0aW9uKGluZGV4LCB2YWwpIHtcbiAgICAgIHZhciAkZG9jdW1lbnQgPSAkKCcubGF5b3V0X19kb2N1bWVudCcpLFxuICAgICAgICAgICRyZWdpb24gPSAkKCcucmVnaW9uLW5vdGlmeScpLFxuICAgICAgICAgICRlbGVtZW50ID0gJCh0aGlzKSxcbiAgICAgICAgICBjb29raWVfaWQgPSAnbm90aWZ5X2lkXycgKyAkZWxlbWVudC5hdHRyKCdpZCcpLFxuICAgICAgICAgICRjbG9zZSA9ICRlbGVtZW50LmZpbmQoJy5ub3RpZnlfX2Nsb3NlJyk7XG5cbiAgICAgIC8vIEZsZXggbWFnaWMgLSBmaXhpbmcgZGlzcGxheTogYmxvY2sgb24gZmFkZUluIChzZWU6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI4OTA0Njk4L2hvdy1mYWRlLWluLWEtZmxleC1ib3gpXG4gICAgICAkZWxlbWVudC5jc3MoJ2Rpc3BsYXknLCAnZmxleCcpLmhpZGUoKTtcblxuICAgICAgLy8gTm8gY29va2llIGhhcyBiZWVuIHNldCB5ZXRcbiAgICAgIGlmICghIENvb2tpZXMuZ2V0KGNvb2tpZV9pZCkpIHtcblxuICAgICAgICAvLyBGYWRlIHRoZSBlbGVtZW50IGluXG4gICAgICAgICRlbGVtZW50XG4gICAgICAgICAgICAuZGVsYXkoMjAwMClcbiAgICAgICAgICAgIC5mYWRlSW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciBoZWlnaHQgPSAkcmVnaW9uLm91dGVySGVpZ2h0KHRydWUpO1xuXG4gICAgICAgICAgICAgICRkb2N1bWVudC5jc3MoJ3BhZGRpbmctYm90dG9tJywgaGVpZ2h0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBDbG9zZWRcbiAgICAgICRjbG9zZS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAkZWxlbWVudC5mYWRlT3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRkb2N1bWVudC5jc3MoJ3BhZGRpbmctYm90dG9tJywgMCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFNldCBhIGNvb2tpZSwgdG8gc3RvcCB0aGlzIG5vdGlmaWNhdGlvbiBmcm9tIGJlaW5nIGRpc3BsYXllZCBhZ2FpblxuICAgICAgICBDb29raWVzLnNldChjb29raWVfaWQsIHRydWUpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAkKFwiI3RvZ2dsZV9tb2JpbGVfbWVudVwiKS5jbGljayhmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAkKCcjbWFpbi1tZW51JykudG9nZ2xlQ2xhc3MoJ21vYmlsZS1tZW51LW9wZW4nKTtcbiAgICAkKCcubGF5b3V0X19kb2N1bWVudCcpLnRvZ2dsZUNsYXNzKCdtb2JpbGUtbWVudS1vcGVuJyk7XG4gIH0pO1xuXG4gIC8vU2hvdyBzZWFyY2ggZm9ybSBibG9ja1xuICAkKFwiLnNlYXJjaC1idXR0b25cIikuY2xpY2soZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKCQoXCIjc2VhcmNoLWZvcm0tcG9wb3ZlclwiKS5oYXNDbGFzcyhcImhpZGRlblwiKSkge1xuICAgICAgJChcIiNzZWFyY2gtZm9ybS1wb3BvdmVyXCIpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoXCIuZm9ybS1jb250cm9sXCIpLmZvY3VzKCk7XG4gICAgfVxuICB9KTtcblxuICAvL0hpZGUgc2VhcmNoIGZvcm0gYmxvY2tcbiAgJChkb2N1bWVudCkuY2xpY2soZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKCEkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnI3NlYXJjaC1mb3JtLXBvcG92ZXInKS5sZW5ndGggJiYgISQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcuc2VhcmNoLWJ1dHRvbicpLmxlbmd0aCkge1xuICAgICAgaWYgKCEkKFwiI3NlYXJjaC1mb3JtLXBvcG92ZXJcIikuaGFzQ2xhc3MoXCJoaWRkZW5cIikpIHtcbiAgICAgICAgJChcIiNzZWFyY2gtZm9ybS1wb3BvdmVyXCIpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8vSW1wcm92aW5nIHVzYWJpbGl0eSBmb3IgbWVudWRyb3Bkb3ducyBmb3IgbW9iaWxlIGRldmljZXNcbiAgaWYgKCEhKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykpIHsvL2NoZWNrIGZvciB0b3VjaCBkZXZpY2VcbiAgICAkKCdsaS5kcm9wZG93bi5sYXlvdXQtbmF2aWdhdGlvbl9fZHJvcGRvd24nKS5maW5kKCc+IGEnKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgICAgaWYgKCQodGhpcykucGFyZW50KCkuaGFzQ2xhc3MoXCJleHBhbmRlZFwiKSkge1xuICAgICAgICAvLyQodGhpcykucGFyZW50KCkucmVtb3ZlQ2xhc3MoXCJleHBhbmRlZFwiKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQodGhpcykucGFyZW50KCkuYWRkQ2xhc3MoXCJleHBhbmRlZFwiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBlbHNlIHsvL2tlZXBpbmcgaXQgY29tcGF0aWJsZSB3aXRoIGRlc2t0b3AgZGV2aWNlc1xuICAgICQoJ2xpLmRyb3Bkb3duLmxheW91dC1uYXZpZ2F0aW9uX19kcm9wZG93bicpLmhvdmVyKFxuICAgICAgICBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJleHBhbmRlZFwiKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZXhwYW5kZWRcIik7XG4gICAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgJCgnLm1vZGFsLWNsb3NlLS10aGlzLW1vZGFsLW9ubHknKS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciAkZWxlbWVudCA9ICQodGhpcyksXG4gICAgICAgICRtb2RhbCA9ICRlbGVtZW50LnBhcmVudHMoJy5tb2RhbCcpLmZpcnN0KCk7XG5cbiAgICAkbW9kYWwubW9kYWwoJ2hpZGUnKTtcbiAgfSk7XG5cbiAgLy8gVXNlIG11bHRpcGxlIG1vZGFscyAoaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTkzMDU4MjEvbXVsdGlwbGUtbW9kYWxzLW92ZXJsYXkpXG4gICQoZG9jdW1lbnQpLm9uKCdzaG93LmJzLm1vZGFsJywgJy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgekluZGV4ID0gMTA0MCArICgxMCAqICQoJy5tb2RhbDp2aXNpYmxlJykubGVuZ3RoKTtcblxuICAgICQodGhpcykuY3NzKCd6LWluZGV4JywgekluZGV4KTtcblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkKCcubW9kYWwtYmFja2Ryb3AnKS5ub3QoJy5tb2RhbC1zdGFjaycpLmNzcygnei1pbmRleCcsIHpJbmRleCAtIDEpLmFkZENsYXNzKCdtb2RhbC1zdGFjaycpO1xuICAgIH0sIDApO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignaGlkZGVuLmJzLm1vZGFsJywgJy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAkKCcubW9kYWw6dmlzaWJsZScpLmxlbmd0aCAmJiAkKGRvY3VtZW50LmJvZHkpLmFkZENsYXNzKCdtb2RhbC1vcGVuJyk7XG4gIH0pO1xuXG4gIC8vIFRvZ2dsZXJcbiAgJCgnW2RhdGEtdG9nZ2xlcl0nKS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgJGVsZW1lbnQgPSAkKHRoaXMpLFxuICAgICAgICB0YXJnZXQgPSAkZWxlbWVudC5hdHRyKCdkYXRhLXRvZ2dsZXInKSxcbiAgICAgICAgJHBhcmVudCA9ICRlbGVtZW50LnBhcmVudHMoJy50b2dnbGVyJyksXG4gICAgICAgICR0YXJnZXQgPSAkcGFyZW50LmZpbmQodGFyZ2V0KSxcbiAgICAgICAgJGFsbF90b2dnbGVfYnV0dG9ucyA9ICRwYXJlbnQuZmluZCgnW2RhdGEtdG9nZ2xlcl0nKSxcbiAgICAgICAgJHRvZ2dsZV9idXR0b24gPSAkcGFyZW50LmZpbmQoJ1tkYXRhLXRvZ2dsZXI9XCInICsgdGFyZ2V0ICsgJ1wiXScpLFxuICAgICAgICAkYWxsX2NvbnRlbnQgPSAkcGFyZW50LmZpbmQoJy50b2dnbGVyX19jb250ZW50Jyk7XG5cbiAgICAvLyBSZW1vdmUgYWxsIGFjdGl2ZSB0b2dnbGVyc1xuICAgICRhbGxfdG9nZ2xlX2J1dHRvbnNcbiAgICAgICAgLnBhcmVudCgpXG4gICAgICAgIC5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cbiAgICAkYWxsX2NvbnRlbnQucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gICAgLy8gU2hvd1xuICAgICR0b2dnbGVfYnV0dG9uLnBhcmVudCgpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAkdGFyZ2V0LmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgfSk7XG5cbiAgJChcIi50b2dnbGVyXCIpLmVhY2goZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAkKHRoaXMpLmZpbmQoJy50b2dnbGVyX19idXR0b24nKS5maXJzdCgpLnRyaWdnZXIoJ2NsaWNrJyk7XG4gIH0pO1xuXG59KShqUXVlcnkpO1xuIl19
