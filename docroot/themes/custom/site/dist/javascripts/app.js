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
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhYi5qcyIsImNvbGxhcHNlLmpzIiwidHJhbnNpdGlvbi5qcyIsInRvb2x0aXAuanMiLCJwb3BvdmVyLmpzIiwibW9kYWwuanMiLCJqcy5jb29raWUuanMiLCJsYXlvdXQuanMiLCJhcHAuanMiXSwibmFtZXMiOlsiJCIsIlRhYiIsImVsZW1lbnQiLCJWRVJTSU9OIiwiVFJBTlNJVElPTl9EVVJBVElPTiIsInByb3RvdHlwZSIsInNob3ciLCIkdGhpcyIsIiR1bCIsImNsb3Nlc3QiLCJzZWxlY3RvciIsImRhdGEiLCJhdHRyIiwicmVwbGFjZSIsInBhcmVudCIsImhhc0NsYXNzIiwiJHByZXZpb3VzIiwiZmluZCIsImhpZGVFdmVudCIsIkV2ZW50IiwicmVsYXRlZFRhcmdldCIsInNob3dFdmVudCIsInRyaWdnZXIiLCJpc0RlZmF1bHRQcmV2ZW50ZWQiLCIkdGFyZ2V0IiwiYWN0aXZhdGUiLCJ0eXBlIiwiY29udGFpbmVyIiwiY2FsbGJhY2siLCIkYWN0aXZlIiwidHJhbnNpdGlvbiIsInN1cHBvcnQiLCJsZW5ndGgiLCJuZXh0IiwicmVtb3ZlQ2xhc3MiLCJlbmQiLCJhZGRDbGFzcyIsIm9mZnNldFdpZHRoIiwib25lIiwiZW11bGF0ZVRyYW5zaXRpb25FbmQiLCJQbHVnaW4iLCJvcHRpb24iLCJlYWNoIiwib2xkIiwiZm4iLCJ0YWIiLCJDb25zdHJ1Y3RvciIsIm5vQ29uZmxpY3QiLCJjbGlja0hhbmRsZXIiLCJlIiwicHJldmVudERlZmF1bHQiLCJjYWxsIiwiZG9jdW1lbnQiLCJvbiIsImpRdWVyeSIsIkNvbGxhcHNlIiwib3B0aW9ucyIsIiRlbGVtZW50IiwiZXh0ZW5kIiwiREVGQVVMVFMiLCIkdHJpZ2dlciIsImlkIiwidHJhbnNpdGlvbmluZyIsIiRwYXJlbnQiLCJnZXRQYXJlbnQiLCJhZGRBcmlhQW5kQ29sbGFwc2VkQ2xhc3MiLCJ0b2dnbGUiLCJkaW1lbnNpb24iLCJoYXNXaWR0aCIsImFjdGl2ZXNEYXRhIiwiYWN0aXZlcyIsImNoaWxkcmVuIiwic3RhcnRFdmVudCIsImNvbXBsZXRlIiwic2Nyb2xsU2l6ZSIsImNhbWVsQ2FzZSIsImpvaW4iLCJwcm94eSIsImhpZGUiLCJvZmZzZXRIZWlnaHQiLCJpIiwiZ2V0VGFyZ2V0RnJvbVRyaWdnZXIiLCJpc09wZW4iLCJ0b2dnbGVDbGFzcyIsImhyZWYiLCJ0YXJnZXQiLCJ0ZXN0IiwiY29sbGFwc2UiLCJ0cmFuc2l0aW9uRW5kIiwiZWwiLCJjcmVhdGVFbGVtZW50IiwidHJhbnNFbmRFdmVudE5hbWVzIiwiV2Via2l0VHJhbnNpdGlvbiIsIk1velRyYW5zaXRpb24iLCJPVHJhbnNpdGlvbiIsIm5hbWUiLCJzdHlsZSIsInVuZGVmaW5lZCIsImR1cmF0aW9uIiwiY2FsbGVkIiwiJGVsIiwic2V0VGltZW91dCIsImV2ZW50Iiwic3BlY2lhbCIsImJzVHJhbnNpdGlvbkVuZCIsImJpbmRUeXBlIiwiZGVsZWdhdGVUeXBlIiwiaGFuZGxlIiwiaXMiLCJoYW5kbGVPYmoiLCJoYW5kbGVyIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJUb29sdGlwIiwiZW5hYmxlZCIsInRpbWVvdXQiLCJob3ZlclN0YXRlIiwiaW5TdGF0ZSIsImluaXQiLCJhbmltYXRpb24iLCJwbGFjZW1lbnQiLCJ0ZW1wbGF0ZSIsInRpdGxlIiwiZGVsYXkiLCJodG1sIiwidmlld3BvcnQiLCJwYWRkaW5nIiwiZ2V0T3B0aW9ucyIsIiR2aWV3cG9ydCIsImlzRnVuY3Rpb24iLCJjbGljayIsImhvdmVyIiwiZm9jdXMiLCJjb25zdHJ1Y3RvciIsIkVycm9yIiwidHJpZ2dlcnMiLCJzcGxpdCIsImV2ZW50SW4iLCJldmVudE91dCIsImVudGVyIiwibGVhdmUiLCJfb3B0aW9ucyIsImZpeFRpdGxlIiwiZ2V0RGVmYXVsdHMiLCJnZXREZWxlZ2F0ZU9wdGlvbnMiLCJkZWZhdWx0cyIsImtleSIsInZhbHVlIiwib2JqIiwic2VsZiIsImN1cnJlbnRUYXJnZXQiLCJ0aXAiLCJjbGVhclRpbWVvdXQiLCJpc0luU3RhdGVUcnVlIiwiaGFzQ29udGVudCIsImluRG9tIiwiY29udGFpbnMiLCJvd25lckRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwidGhhdCIsIiR0aXAiLCJ0aXBJZCIsImdldFVJRCIsInNldENvbnRlbnQiLCJhdXRvVG9rZW4iLCJhdXRvUGxhY2UiLCJkZXRhY2giLCJjc3MiLCJ0b3AiLCJsZWZ0IiwiZGlzcGxheSIsImFwcGVuZFRvIiwiaW5zZXJ0QWZ0ZXIiLCJwb3MiLCJnZXRQb3NpdGlvbiIsImFjdHVhbFdpZHRoIiwiYWN0dWFsSGVpZ2h0Iiwib3JnUGxhY2VtZW50Iiwidmlld3BvcnREaW0iLCJib3R0b20iLCJyaWdodCIsIndpZHRoIiwiY2FsY3VsYXRlZE9mZnNldCIsImdldENhbGN1bGF0ZWRPZmZzZXQiLCJhcHBseVBsYWNlbWVudCIsInByZXZIb3ZlclN0YXRlIiwib2Zmc2V0IiwiaGVpZ2h0IiwibWFyZ2luVG9wIiwicGFyc2VJbnQiLCJtYXJnaW5MZWZ0IiwiaXNOYU4iLCJzZXRPZmZzZXQiLCJ1c2luZyIsInByb3BzIiwiTWF0aCIsInJvdW5kIiwiZGVsdGEiLCJnZXRWaWV3cG9ydEFkanVzdGVkRGVsdGEiLCJpc1ZlcnRpY2FsIiwiYXJyb3dEZWx0YSIsImFycm93T2Zmc2V0UG9zaXRpb24iLCJyZXBsYWNlQXJyb3ciLCJhcnJvdyIsImdldFRpdGxlIiwicmVtb3ZlQXR0ciIsIiRlIiwiaXNCb2R5IiwidGFnTmFtZSIsImVsUmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImlzU3ZnIiwid2luZG93IiwiU1ZHRWxlbWVudCIsImVsT2Zmc2V0Iiwic2Nyb2xsIiwic2Nyb2xsVG9wIiwiYm9keSIsIm91dGVyRGltcyIsInZpZXdwb3J0UGFkZGluZyIsInZpZXdwb3J0RGltZW5zaW9ucyIsInRvcEVkZ2VPZmZzZXQiLCJib3R0b21FZGdlT2Zmc2V0IiwibGVmdEVkZ2VPZmZzZXQiLCJyaWdodEVkZ2VPZmZzZXQiLCJvIiwicHJlZml4IiwicmFuZG9tIiwiZ2V0RWxlbWVudEJ5SWQiLCIkYXJyb3ciLCJlbmFibGUiLCJkaXNhYmxlIiwidG9nZ2xlRW5hYmxlZCIsImRlc3Ryb3kiLCJvZmYiLCJyZW1vdmVEYXRhIiwidG9vbHRpcCIsIlBvcG92ZXIiLCJjb250ZW50IiwiZ2V0Q29udGVudCIsInBvcG92ZXIiLCJNb2RhbCIsIiRib2R5IiwiJGRpYWxvZyIsIiRiYWNrZHJvcCIsImlzU2hvd24iLCJvcmlnaW5hbEJvZHlQYWQiLCJzY3JvbGxiYXJXaWR0aCIsImlnbm9yZUJhY2tkcm9wQ2xpY2siLCJyZW1vdGUiLCJsb2FkIiwiQkFDS0RST1BfVFJBTlNJVElPTl9EVVJBVElPTiIsImJhY2tkcm9wIiwia2V5Ym9hcmQiLCJfcmVsYXRlZFRhcmdldCIsImNoZWNrU2Nyb2xsYmFyIiwic2V0U2Nyb2xsYmFyIiwiZXNjYXBlIiwicmVzaXplIiwiYWRqdXN0RGlhbG9nIiwiZW5mb3JjZUZvY3VzIiwiaGlkZU1vZGFsIiwiaGFzIiwid2hpY2giLCJoYW5kbGVVcGRhdGUiLCJyZXNldEFkanVzdG1lbnRzIiwicmVzZXRTY3JvbGxiYXIiLCJyZW1vdmVCYWNrZHJvcCIsInJlbW92ZSIsImFuaW1hdGUiLCJkb0FuaW1hdGUiLCJjYWxsYmFja1JlbW92ZSIsIm1vZGFsSXNPdmVyZmxvd2luZyIsInNjcm9sbEhlaWdodCIsImNsaWVudEhlaWdodCIsInBhZGRpbmdMZWZ0IiwiYm9keUlzT3ZlcmZsb3dpbmciLCJwYWRkaW5nUmlnaHQiLCJmdWxsV2luZG93V2lkdGgiLCJpbm5lcldpZHRoIiwiZG9jdW1lbnRFbGVtZW50UmVjdCIsImFicyIsImNsaWVudFdpZHRoIiwibWVhc3VyZVNjcm9sbGJhciIsImJvZHlQYWQiLCJzY3JvbGxEaXYiLCJjbGFzc05hbWUiLCJhcHBlbmQiLCJyZW1vdmVDaGlsZCIsIm1vZGFsIiwiZmFjdG9yeSIsInJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciIsImRlZmluZSIsImFtZCIsImV4cG9ydHMiLCJtb2R1bGUiLCJPbGRDb29raWVzIiwiQ29va2llcyIsImFwaSIsInJlc3VsdCIsImF0dHJpYnV0ZXMiLCJjb252ZXJ0ZXIiLCJwYXRoIiwiZXhwaXJlcyIsIkRhdGUiLCJzZXRNaWxsaXNlY29uZHMiLCJnZXRNaWxsaXNlY29uZHMiLCJ0b1VUQ1N0cmluZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJ3cml0ZSIsImVuY29kZVVSSUNvbXBvbmVudCIsIlN0cmluZyIsImRlY29kZVVSSUNvbXBvbmVudCIsInN0cmluZ2lmaWVkQXR0cmlidXRlcyIsImF0dHJpYnV0ZU5hbWUiLCJjb29raWUiLCJjb29raWVzIiwicmRlY29kZSIsInBhcnRzIiwic2xpY2UiLCJqc29uIiwiY2hhckF0IiwicmVhZCIsInBhcnNlIiwic2V0IiwiZ2V0IiwiZ2V0SlNPTiIsIndpdGhDb252ZXJ0ZXIiLCJsYXlvdXQiLCJwdWIiLCIkbGF5b3V0X19oZWFkZXIiLCIkbGF5b3V0X19kb2N1bWVudCIsImxheW91dF9jbGFzc2VzIiwicmVnaXN0ZXJFdmVudEhhbmRsZXJzIiwicmVnaXN0ZXJCb290RXZlbnRIYW5kbGVycyIsImFkZEVsZW1lbnRDbGFzc2VzIiwiYWRkIiwibGF5b3V0X19vYmZ1c2NhdG9yIiwidG9nZ2xlRHJhd2VyIiwiaGVhZGVyX3dhdGVyZmFsbCIsIiRkb2N1bWVudCIsIndhdGVyZmFsbEhlYWRlciIsIiR3cmFwcGVyIiwibGF5b3V0X193cmFwcGVyIiwiJG9iZnVzY2F0b3IiLCIkZHJhd2VyIiwibGF5b3V0X19kcmF3ZXIiLCJvYmZ1c2NhdG9yX2lzX3Zpc2libGUiLCJkcmF3ZXJfaXNfdmlzaWJsZSIsIiRoZWFkZXIiLCJsYXlvdXRfX2hlYWRlciIsImRpc3RhbmNlIiwiaGVhZGVyX2lzX2NvbXBhY3QiLCJpbmRleCIsImhlYWRlcl9zY3JvbGwiLCJ3cmFwcGVyX2hhc19zY3JvbGxpbmdfaGVhZGVyIiwid3JhcHBlcl9oYXNfZHJhd2VyIiwid3JhcHBlcl9pc191cGdyYWRlZCIsIiRub3RpZmljYXRpb25zIiwidmFsIiwiJHJlZ2lvbiIsImNvb2tpZV9pZCIsIiRjbG9zZSIsImZhZGVJbiIsIm91dGVySGVp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LENBQWtELEtBQWxELEVBQXlEaUgsS0FBekQsQ0FBK0QsVUFBVWpGLENBQVYsRUFBYTtBQUMxRSxVQUFJakQsRUFBRSxJQUFGLEVBQVFjLE1BQVIsR0FBaUJDLFFBQWpCLENBQTBCLFVBQTFCLENBQUosRUFBMkM7QUFDekM7QUFDRCxPQUZELE1BR0s7QUFDSGtDLFVBQUVDLGNBQUY7QUFDQWxELFVBQUUsSUFBRixFQUFRYyxNQUFSLEdBQWlCc0IsUUFBakIsQ0FBMEIsVUFBMUI7QUFDRDtBQUNGLEtBUkQ7QUFTRCxHQVZELE1BV0s7QUFBQztBQUNKcEMsTUFBRSx5Q0FBRixFQUE2Q21JLEtBQTdDLENBQ0ksVUFBVWxGLENBQVYsRUFBYTtBQUNYakQsUUFBRSxJQUFGLEVBQVFvQyxRQUFSLENBQWlCLFVBQWpCO0FBQ0QsS0FITCxFQUdPLFVBQVVhLENBQVYsRUFBYTtBQUNkakQsUUFBRSxJQUFGLEVBQVFrQyxXQUFSLENBQW9CLFVBQXBCO0FBQ0QsS0FMTDtBQU9EOztBQUVEbEMsSUFBRSwrQkFBRixFQUFtQ3FELEVBQW5DLENBQXNDLE9BQXRDLEVBQStDLFVBQVNpRCxLQUFULEVBQWdCO0FBQzdELFFBQUk3QyxXQUFXekQsRUFBRSxJQUFGLENBQWY7QUFBQSxRQUNJK1csU0FBU3RULFNBQVN1VCxPQUFULENBQWlCLFFBQWpCLEVBQTJCQyxLQUEzQixFQURiOztBQUdBRixXQUFPOUUsS0FBUCxDQUFhLE1BQWI7QUFDRCxHQUxEO0FBTUQsQ0EvRkQsRUErRkczTyxNQS9GSCIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEJvb3RzdHJhcDogdGFiLmpzIHYzLjMuN1xuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jdGFic1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4rZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIFRBQiBDTEFTUyBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09XG5cbiAgdmFyIFRhYiA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgLy8ganNjczpkaXNhYmxlIHJlcXVpcmVEb2xsYXJCZWZvcmVqUXVlcnlBc3NpZ25tZW50XG4gICAgdGhpcy5lbGVtZW50ID0gJChlbGVtZW50KVxuICAgIC8vIGpzY3M6ZW5hYmxlIHJlcXVpcmVEb2xsYXJCZWZvcmVqUXVlcnlBc3NpZ25tZW50XG4gIH1cblxuICBUYWIuVkVSU0lPTiA9ICczLjMuNydcblxuICBUYWIuVFJBTlNJVElPTl9EVVJBVElPTiA9IDE1MFxuXG4gIFRhYi5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJHRoaXMgICAgPSB0aGlzLmVsZW1lbnRcbiAgICB2YXIgJHVsICAgICAgPSAkdGhpcy5jbG9zZXN0KCd1bDpub3QoLmRyb3Bkb3duLW1lbnUpJylcbiAgICB2YXIgc2VsZWN0b3IgPSAkdGhpcy5kYXRhKCd0YXJnZXQnKVxuXG4gICAgaWYgKCFzZWxlY3Rvcikge1xuICAgICAgc2VsZWN0b3IgPSAkdGhpcy5hdHRyKCdocmVmJylcbiAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IgJiYgc2VsZWN0b3IucmVwbGFjZSgvLiooPz0jW15cXHNdKiQpLywgJycpIC8vIHN0cmlwIGZvciBpZTdcbiAgICB9XG5cbiAgICBpZiAoJHRoaXMucGFyZW50KCdsaScpLmhhc0NsYXNzKCdhY3RpdmUnKSkgcmV0dXJuXG5cbiAgICB2YXIgJHByZXZpb3VzID0gJHVsLmZpbmQoJy5hY3RpdmU6bGFzdCBhJylcbiAgICB2YXIgaGlkZUV2ZW50ID0gJC5FdmVudCgnaGlkZS5icy50YWInLCB7XG4gICAgICByZWxhdGVkVGFyZ2V0OiAkdGhpc1swXVxuICAgIH0pXG4gICAgdmFyIHNob3dFdmVudCA9ICQuRXZlbnQoJ3Nob3cuYnMudGFiJywge1xuICAgICAgcmVsYXRlZFRhcmdldDogJHByZXZpb3VzWzBdXG4gICAgfSlcblxuICAgICRwcmV2aW91cy50cmlnZ2VyKGhpZGVFdmVudClcbiAgICAkdGhpcy50cmlnZ2VyKHNob3dFdmVudClcblxuICAgIGlmIChzaG93RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkgfHwgaGlkZUV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgIHZhciAkdGFyZ2V0ID0gJChzZWxlY3RvcilcblxuICAgIHRoaXMuYWN0aXZhdGUoJHRoaXMuY2xvc2VzdCgnbGknKSwgJHVsKVxuICAgIHRoaXMuYWN0aXZhdGUoJHRhcmdldCwgJHRhcmdldC5wYXJlbnQoKSwgZnVuY3Rpb24gKCkge1xuICAgICAgJHByZXZpb3VzLnRyaWdnZXIoe1xuICAgICAgICB0eXBlOiAnaGlkZGVuLmJzLnRhYicsXG4gICAgICAgIHJlbGF0ZWRUYXJnZXQ6ICR0aGlzWzBdXG4gICAgICB9KVxuICAgICAgJHRoaXMudHJpZ2dlcih7XG4gICAgICAgIHR5cGU6ICdzaG93bi5icy50YWInLFxuICAgICAgICByZWxhdGVkVGFyZ2V0OiAkcHJldmlvdXNbMF1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIFRhYi5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbiAoZWxlbWVudCwgY29udGFpbmVyLCBjYWxsYmFjaykge1xuICAgIHZhciAkYWN0aXZlICAgID0gY29udGFpbmVyLmZpbmQoJz4gLmFjdGl2ZScpXG4gICAgdmFyIHRyYW5zaXRpb24gPSBjYWxsYmFja1xuICAgICAgJiYgJC5zdXBwb3J0LnRyYW5zaXRpb25cbiAgICAgICYmICgkYWN0aXZlLmxlbmd0aCAmJiAkYWN0aXZlLmhhc0NsYXNzKCdmYWRlJykgfHwgISFjb250YWluZXIuZmluZCgnPiAuZmFkZScpLmxlbmd0aClcblxuICAgIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAkYWN0aXZlXG4gICAgICAgIC5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAgICAgLmZpbmQoJz4gLmRyb3Bkb3duLW1lbnUgPiAuYWN0aXZlJylcbiAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgIC5lbmQoKVxuICAgICAgICAuZmluZCgnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJylcbiAgICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKVxuXG4gICAgICBlbGVtZW50XG4gICAgICAgIC5hZGRDbGFzcygnYWN0aXZlJylcbiAgICAgICAgLmZpbmQoJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXScpXG4gICAgICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxuXG4gICAgICBpZiAodHJhbnNpdGlvbikge1xuICAgICAgICBlbGVtZW50WzBdLm9mZnNldFdpZHRoIC8vIHJlZmxvdyBmb3IgdHJhbnNpdGlvblxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdpbicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdmYWRlJylcbiAgICAgIH1cblxuICAgICAgaWYgKGVsZW1lbnQucGFyZW50KCcuZHJvcGRvd24tbWVudScpLmxlbmd0aCkge1xuICAgICAgICBlbGVtZW50XG4gICAgICAgICAgLmNsb3Nlc3QoJ2xpLmRyb3Bkb3duJylcbiAgICAgICAgICAgIC5hZGRDbGFzcygnYWN0aXZlJylcbiAgICAgICAgICAuZW5kKClcbiAgICAgICAgICAuZmluZCgnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJylcbiAgICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soKVxuICAgIH1cblxuICAgICRhY3RpdmUubGVuZ3RoICYmIHRyYW5zaXRpb24gP1xuICAgICAgJGFjdGl2ZVxuICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBuZXh0KVxuICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoVGFiLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcbiAgICAgIG5leHQoKVxuXG4gICAgJGFjdGl2ZS5yZW1vdmVDbGFzcygnaW4nKVxuICB9XG5cblxuICAvLyBUQUIgUExVR0lOIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKVxuICAgICAgdmFyIGRhdGEgID0gJHRoaXMuZGF0YSgnYnMudGFiJylcblxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy50YWInLCAoZGF0YSA9IG5ldyBUYWIodGhpcykpKVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXG4gICAgfSlcbiAgfVxuXG4gIHZhciBvbGQgPSAkLmZuLnRhYlxuXG4gICQuZm4udGFiICAgICAgICAgICAgID0gUGx1Z2luXG4gICQuZm4udGFiLkNvbnN0cnVjdG9yID0gVGFiXG5cblxuICAvLyBUQUIgTk8gQ09ORkxJQ1RcbiAgLy8gPT09PT09PT09PT09PT09XG5cbiAgJC5mbi50YWIubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLnRhYiA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuXG4gIC8vIFRBQiBEQVRBLUFQSVxuICAvLyA9PT09PT09PT09PT1cblxuICB2YXIgY2xpY2tIYW5kbGVyID0gZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBQbHVnaW4uY2FsbCgkKHRoaXMpLCAnc2hvdycpXG4gIH1cblxuICAkKGRvY3VtZW50KVxuICAgIC5vbignY2xpY2suYnMudGFiLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXScsIGNsaWNrSGFuZGxlcilcbiAgICAub24oJ2NsaWNrLmJzLnRhYi5kYXRhLWFwaScsICdbZGF0YS10b2dnbGU9XCJwaWxsXCJdJywgY2xpY2tIYW5kbGVyKVxuXG59KGpRdWVyeSk7XG4iLCIvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEJvb3RzdHJhcDogY29sbGFwc2UuanMgdjMuMy43XG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNjb2xsYXBzZVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuLyoganNoaW50IGxhdGVkZWY6IGZhbHNlICovXG5cbitmdW5jdGlvbiAoJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gQ09MTEFQU0UgUFVCTElDIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgQ29sbGFwc2UgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgICAgICA9ICQoZWxlbWVudClcbiAgICB0aGlzLm9wdGlvbnMgICAgICAgPSAkLmV4dGVuZCh7fSwgQ29sbGFwc2UuREVGQVVMVFMsIG9wdGlvbnMpXG4gICAgdGhpcy4kdHJpZ2dlciAgICAgID0gJCgnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl1baHJlZj1cIiMnICsgZWxlbWVudC5pZCArICdcIl0sJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl1bZGF0YS10YXJnZXQ9XCIjJyArIGVsZW1lbnQuaWQgKyAnXCJdJylcbiAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSBudWxsXG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnBhcmVudCkge1xuICAgICAgdGhpcy4kcGFyZW50ID0gdGhpcy5nZXRQYXJlbnQoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyh0aGlzLiRlbGVtZW50LCB0aGlzLiR0cmlnZ2VyKVxuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMudG9nZ2xlKSB0aGlzLnRvZ2dsZSgpXG4gIH1cblxuICBDb2xsYXBzZS5WRVJTSU9OICA9ICczLjMuNydcblxuICBDb2xsYXBzZS5UUkFOU0lUSU9OX0RVUkFUSU9OID0gMzUwXG5cbiAgQ29sbGFwc2UuREVGQVVMVFMgPSB7XG4gICAgdG9nZ2xlOiB0cnVlXG4gIH1cblxuICBDb2xsYXBzZS5wcm90b3R5cGUuZGltZW5zaW9uID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBoYXNXaWR0aCA9IHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ3dpZHRoJylcbiAgICByZXR1cm4gaGFzV2lkdGggPyAnd2lkdGgnIDogJ2hlaWdodCdcbiAgfVxuXG4gIENvbGxhcHNlLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnRyYW5zaXRpb25pbmcgfHwgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaW4nKSkgcmV0dXJuXG5cbiAgICB2YXIgYWN0aXZlc0RhdGFcbiAgICB2YXIgYWN0aXZlcyA9IHRoaXMuJHBhcmVudCAmJiB0aGlzLiRwYXJlbnQuY2hpbGRyZW4oJy5wYW5lbCcpLmNoaWxkcmVuKCcuaW4sIC5jb2xsYXBzaW5nJylcblxuICAgIGlmIChhY3RpdmVzICYmIGFjdGl2ZXMubGVuZ3RoKSB7XG4gICAgICBhY3RpdmVzRGF0YSA9IGFjdGl2ZXMuZGF0YSgnYnMuY29sbGFwc2UnKVxuICAgICAgaWYgKGFjdGl2ZXNEYXRhICYmIGFjdGl2ZXNEYXRhLnRyYW5zaXRpb25pbmcpIHJldHVyblxuICAgIH1cblxuICAgIHZhciBzdGFydEV2ZW50ID0gJC5FdmVudCgnc2hvdy5icy5jb2xsYXBzZScpXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKHN0YXJ0RXZlbnQpXG4gICAgaWYgKHN0YXJ0RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxuXG4gICAgaWYgKGFjdGl2ZXMgJiYgYWN0aXZlcy5sZW5ndGgpIHtcbiAgICAgIFBsdWdpbi5jYWxsKGFjdGl2ZXMsICdoaWRlJylcbiAgICAgIGFjdGl2ZXNEYXRhIHx8IGFjdGl2ZXMuZGF0YSgnYnMuY29sbGFwc2UnLCBudWxsKVxuICAgIH1cblxuICAgIHZhciBkaW1lbnNpb24gPSB0aGlzLmRpbWVuc2lvbigpXG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlJylcbiAgICAgIC5hZGRDbGFzcygnY29sbGFwc2luZycpW2RpbWVuc2lvbl0oMClcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcblxuICAgIHRoaXMuJHRyaWdnZXJcbiAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2VkJylcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcblxuICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDFcblxuICAgIHZhciBjb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzaW5nJylcbiAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZSBpbicpW2RpbWVuc2lvbl0oJycpXG4gICAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSAwXG4gICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAgIC50cmlnZ2VyKCdzaG93bi5icy5jb2xsYXBzZScpXG4gICAgfVxuXG4gICAgaWYgKCEkLnN1cHBvcnQudHJhbnNpdGlvbikgcmV0dXJuIGNvbXBsZXRlLmNhbGwodGhpcylcblxuICAgIHZhciBzY3JvbGxTaXplID0gJC5jYW1lbENhc2UoWydzY3JvbGwnLCBkaW1lbnNpb25dLmpvaW4oJy0nKSlcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsICQucHJveHkoY29tcGxldGUsIHRoaXMpKVxuICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKENvbGxhcHNlLlRSQU5TSVRJT05fRFVSQVRJT04pW2RpbWVuc2lvbl0odGhpcy4kZWxlbWVudFswXVtzY3JvbGxTaXplXSlcbiAgfVxuXG4gIENvbGxhcHNlLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnRyYW5zaXRpb25pbmcgfHwgIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJykpIHJldHVyblxuXG4gICAgdmFyIHN0YXJ0RXZlbnQgPSAkLkV2ZW50KCdoaWRlLmJzLmNvbGxhcHNlJylcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoc3RhcnRFdmVudClcbiAgICBpZiAoc3RhcnRFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICB2YXIgZGltZW5zaW9uID0gdGhpcy5kaW1lbnNpb24oKVxuXG4gICAgdGhpcy4kZWxlbWVudFtkaW1lbnNpb25dKHRoaXMuJGVsZW1lbnRbZGltZW5zaW9uXSgpKVswXS5vZmZzZXRIZWlnaHRcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5hZGRDbGFzcygnY29sbGFwc2luZycpXG4gICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlIGluJylcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpXG5cbiAgICB0aGlzLiR0cmlnZ2VyXG4gICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNlZCcpXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKVxuXG4gICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMVxuXG4gICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMFxuICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNpbmcnKVxuICAgICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNlJylcbiAgICAgICAgLnRyaWdnZXIoJ2hpZGRlbi5icy5jb2xsYXBzZScpXG4gICAgfVxuXG4gICAgaWYgKCEkLnN1cHBvcnQudHJhbnNpdGlvbikgcmV0dXJuIGNvbXBsZXRlLmNhbGwodGhpcylcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIFtkaW1lbnNpb25dKDApXG4gICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCAkLnByb3h5KGNvbXBsZXRlLCB0aGlzKSlcbiAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChDb2xsYXBzZS5UUkFOU0lUSU9OX0RVUkFUSU9OKVxuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzW3RoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJykgPyAnaGlkZScgOiAnc2hvdyddKClcbiAgfVxuXG4gIENvbGxhcHNlLnByb3RvdHlwZS5nZXRQYXJlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICQodGhpcy5vcHRpb25zLnBhcmVudClcbiAgICAgIC5maW5kKCdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXVtkYXRhLXBhcmVudD1cIicgKyB0aGlzLm9wdGlvbnMucGFyZW50ICsgJ1wiXScpXG4gICAgICAuZWFjaCgkLnByb3h5KGZ1bmN0aW9uIChpLCBlbGVtZW50KSB7XG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudClcbiAgICAgICAgdGhpcy5hZGRBcmlhQW5kQ29sbGFwc2VkQ2xhc3MoZ2V0VGFyZ2V0RnJvbVRyaWdnZXIoJGVsZW1lbnQpLCAkZWxlbWVudClcbiAgICAgIH0sIHRoaXMpKVxuICAgICAgLmVuZCgpXG4gIH1cblxuICBDb2xsYXBzZS5wcm90b3R5cGUuYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzID0gZnVuY3Rpb24gKCRlbGVtZW50LCAkdHJpZ2dlcikge1xuICAgIHZhciBpc09wZW4gPSAkZWxlbWVudC5oYXNDbGFzcygnaW4nKVxuXG4gICAgJGVsZW1lbnQuYXR0cignYXJpYS1leHBhbmRlZCcsIGlzT3BlbilcbiAgICAkdHJpZ2dlclxuICAgICAgLnRvZ2dsZUNsYXNzKCdjb2xsYXBzZWQnLCAhaXNPcGVuKVxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBpc09wZW4pXG4gIH1cblxuICBmdW5jdGlvbiBnZXRUYXJnZXRGcm9tVHJpZ2dlcigkdHJpZ2dlcikge1xuICAgIHZhciBocmVmXG4gICAgdmFyIHRhcmdldCA9ICR0cmlnZ2VyLmF0dHIoJ2RhdGEtdGFyZ2V0JylcbiAgICAgIHx8IChocmVmID0gJHRyaWdnZXIuYXR0cignaHJlZicpKSAmJiBocmVmLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sICcnKSAvLyBzdHJpcCBmb3IgaWU3XG5cbiAgICByZXR1cm4gJCh0YXJnZXQpXG4gIH1cblxuXG4gIC8vIENPTExBUFNFIFBMVUdJTiBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLmNvbGxhcHNlJylcbiAgICAgIHZhciBvcHRpb25zID0gJC5leHRlbmQoe30sIENvbGxhcHNlLkRFRkFVTFRTLCAkdGhpcy5kYXRhKCksIHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uKVxuXG4gICAgICBpZiAoIWRhdGEgJiYgb3B0aW9ucy50b2dnbGUgJiYgL3Nob3d8aGlkZS8udGVzdChvcHRpb24pKSBvcHRpb25zLnRvZ2dsZSA9IGZhbHNlXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLmNvbGxhcHNlJywgKGRhdGEgPSBuZXcgQ29sbGFwc2UodGhpcywgb3B0aW9ucykpKVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXG4gICAgfSlcbiAgfVxuXG4gIHZhciBvbGQgPSAkLmZuLmNvbGxhcHNlXG5cbiAgJC5mbi5jb2xsYXBzZSAgICAgICAgICAgICA9IFBsdWdpblxuICAkLmZuLmNvbGxhcHNlLkNvbnN0cnVjdG9yID0gQ29sbGFwc2VcblxuXG4gIC8vIENPTExBUFNFIE5PIENPTkZMSUNUXG4gIC8vID09PT09PT09PT09PT09PT09PT09XG5cbiAgJC5mbi5jb2xsYXBzZS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4uY29sbGFwc2UgPSBvbGRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cblxuICAvLyBDT0xMQVBTRSBEQVRBLUFQSVxuICAvLyA9PT09PT09PT09PT09PT09PVxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljay5icy5jb2xsYXBzZS5kYXRhLWFwaScsICdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXG5cbiAgICBpZiAoISR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JykpIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgdmFyICR0YXJnZXQgPSBnZXRUYXJnZXRGcm9tVHJpZ2dlcigkdGhpcylcbiAgICB2YXIgZGF0YSAgICA9ICR0YXJnZXQuZGF0YSgnYnMuY29sbGFwc2UnKVxuICAgIHZhciBvcHRpb24gID0gZGF0YSA/ICd0b2dnbGUnIDogJHRoaXMuZGF0YSgpXG5cbiAgICBQbHVnaW4uY2FsbCgkdGFyZ2V0LCBvcHRpb24pXG4gIH0pXG5cbn0oalF1ZXJ5KTtcbiIsIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiB0cmFuc2l0aW9uLmpzIHYzLjMuN1xuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jdHJhbnNpdGlvbnNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuK2Z1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBDU1MgVFJBTlNJVElPTiBTVVBQT1JUIChTaG91dG91dDogaHR0cDovL3d3dy5tb2Rlcm5penIuY29tLylcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gdHJhbnNpdGlvbkVuZCgpIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdib290c3RyYXAnKVxuXG4gICAgdmFyIHRyYW5zRW5kRXZlbnROYW1lcyA9IHtcbiAgICAgIFdlYmtpdFRyYW5zaXRpb24gOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG4gICAgICBNb3pUcmFuc2l0aW9uICAgIDogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgT1RyYW5zaXRpb24gICAgICA6ICdvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCcsXG4gICAgICB0cmFuc2l0aW9uICAgICAgIDogJ3RyYW5zaXRpb25lbmQnXG4gICAgfVxuXG4gICAgZm9yICh2YXIgbmFtZSBpbiB0cmFuc0VuZEV2ZW50TmFtZXMpIHtcbiAgICAgIGlmIChlbC5zdHlsZVtuYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB7IGVuZDogdHJhbnNFbmRFdmVudE5hbWVzW25hbWVdIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2UgLy8gZXhwbGljaXQgZm9yIGllOCAoICAuXy4pXG4gIH1cblxuICAvLyBodHRwOi8vYmxvZy5hbGV4bWFjY2F3LmNvbS9jc3MtdHJhbnNpdGlvbnNcbiAgJC5mbi5lbXVsYXRlVHJhbnNpdGlvbkVuZCA9IGZ1bmN0aW9uIChkdXJhdGlvbikge1xuICAgIHZhciBjYWxsZWQgPSBmYWxzZVxuICAgIHZhciAkZWwgPSB0aGlzXG4gICAgJCh0aGlzKS5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGZ1bmN0aW9uICgpIHsgY2FsbGVkID0gdHJ1ZSB9KVxuICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uICgpIHsgaWYgKCFjYWxsZWQpICQoJGVsKS50cmlnZ2VyKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCkgfVxuICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIGR1cmF0aW9uKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAkKGZ1bmN0aW9uICgpIHtcbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiA9IHRyYW5zaXRpb25FbmQoKVxuXG4gICAgaWYgKCEkLnN1cHBvcnQudHJhbnNpdGlvbikgcmV0dXJuXG5cbiAgICAkLmV2ZW50LnNwZWNpYWwuYnNUcmFuc2l0aW9uRW5kID0ge1xuICAgICAgYmluZFR5cGU6ICQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxcbiAgICAgIGRlbGVnYXRlVHlwZTogJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLFxuICAgICAgaGFuZGxlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoJChlLnRhcmdldCkuaXModGhpcykpIHJldHVybiBlLmhhbmRsZU9iai5oYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbn0oalF1ZXJ5KTtcbiIsIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiB0b29sdGlwLmpzIHYzLjMuN1xuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jdG9vbHRpcFxuICogSW5zcGlyZWQgYnkgdGhlIG9yaWdpbmFsIGpRdWVyeS50aXBzeSBieSBKYXNvbiBGcmFtZVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4rZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIFRPT0xUSVAgUFVCTElDIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBUb29sdGlwID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLnR5cGUgICAgICAgPSBudWxsXG4gICAgdGhpcy5vcHRpb25zICAgID0gbnVsbFxuICAgIHRoaXMuZW5hYmxlZCAgICA9IG51bGxcbiAgICB0aGlzLnRpbWVvdXQgICAgPSBudWxsXG4gICAgdGhpcy5ob3ZlclN0YXRlID0gbnVsbFxuICAgIHRoaXMuJGVsZW1lbnQgICA9IG51bGxcbiAgICB0aGlzLmluU3RhdGUgICAgPSBudWxsXG5cbiAgICB0aGlzLmluaXQoJ3Rvb2x0aXAnLCBlbGVtZW50LCBvcHRpb25zKVxuICB9XG5cbiAgVG9vbHRpcC5WRVJTSU9OICA9ICczLjMuNydcblxuICBUb29sdGlwLlRSQU5TSVRJT05fRFVSQVRJT04gPSAxNTBcblxuICBUb29sdGlwLkRFRkFVTFRTID0ge1xuICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICBwbGFjZW1lbnQ6ICd0b3AnLFxuICAgIHNlbGVjdG9yOiBmYWxzZSxcbiAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0b29sdGlwXCIgcm9sZT1cInRvb2x0aXBcIj48ZGl2IGNsYXNzPVwidG9vbHRpcC1hcnJvd1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0b29sdGlwLWlubmVyXCI+PC9kaXY+PC9kaXY+JyxcbiAgICB0cmlnZ2VyOiAnaG92ZXIgZm9jdXMnLFxuICAgIHRpdGxlOiAnJyxcbiAgICBkZWxheTogMCxcbiAgICBodG1sOiBmYWxzZSxcbiAgICBjb250YWluZXI6IGZhbHNlLFxuICAgIHZpZXdwb3J0OiB7XG4gICAgICBzZWxlY3RvcjogJ2JvZHknLFxuICAgICAgcGFkZGluZzogMFxuICAgIH1cbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAodHlwZSwgZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuZW5hYmxlZCAgID0gdHJ1ZVxuICAgIHRoaXMudHlwZSAgICAgID0gdHlwZVxuICAgIHRoaXMuJGVsZW1lbnQgID0gJChlbGVtZW50KVxuICAgIHRoaXMub3B0aW9ucyAgID0gdGhpcy5nZXRPcHRpb25zKG9wdGlvbnMpXG4gICAgdGhpcy4kdmlld3BvcnQgPSB0aGlzLm9wdGlvbnMudmlld3BvcnQgJiYgJCgkLmlzRnVuY3Rpb24odGhpcy5vcHRpb25zLnZpZXdwb3J0KSA/IHRoaXMub3B0aW9ucy52aWV3cG9ydC5jYWxsKHRoaXMsIHRoaXMuJGVsZW1lbnQpIDogKHRoaXMub3B0aW9ucy52aWV3cG9ydC5zZWxlY3RvciB8fCB0aGlzLm9wdGlvbnMudmlld3BvcnQpKVxuICAgIHRoaXMuaW5TdGF0ZSAgID0geyBjbGljazogZmFsc2UsIGhvdmVyOiBmYWxzZSwgZm9jdXM6IGZhbHNlIH1cblxuICAgIGlmICh0aGlzLiRlbGVtZW50WzBdIGluc3RhbmNlb2YgZG9jdW1lbnQuY29uc3RydWN0b3IgJiYgIXRoaXMub3B0aW9ucy5zZWxlY3Rvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdgc2VsZWN0b3JgIG9wdGlvbiBtdXN0IGJlIHNwZWNpZmllZCB3aGVuIGluaXRpYWxpemluZyAnICsgdGhpcy50eXBlICsgJyBvbiB0aGUgd2luZG93LmRvY3VtZW50IG9iamVjdCEnKVxuICAgIH1cblxuICAgIHZhciB0cmlnZ2VycyA9IHRoaXMub3B0aW9ucy50cmlnZ2VyLnNwbGl0KCcgJylcblxuICAgIGZvciAodmFyIGkgPSB0cmlnZ2Vycy5sZW5ndGg7IGktLTspIHtcbiAgICAgIHZhciB0cmlnZ2VyID0gdHJpZ2dlcnNbaV1cblxuICAgICAgaWYgKHRyaWdnZXIgPT0gJ2NsaWNrJykge1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKCdjbGljay4nICsgdGhpcy50eXBlLCB0aGlzLm9wdGlvbnMuc2VsZWN0b3IsICQucHJveHkodGhpcy50b2dnbGUsIHRoaXMpKVxuICAgICAgfSBlbHNlIGlmICh0cmlnZ2VyICE9ICdtYW51YWwnKSB7XG4gICAgICAgIHZhciBldmVudEluICA9IHRyaWdnZXIgPT0gJ2hvdmVyJyA/ICdtb3VzZWVudGVyJyA6ICdmb2N1c2luJ1xuICAgICAgICB2YXIgZXZlbnRPdXQgPSB0cmlnZ2VyID09ICdob3ZlcicgPyAnbW91c2VsZWF2ZScgOiAnZm9jdXNvdXQnXG5cbiAgICAgICAgdGhpcy4kZWxlbWVudC5vbihldmVudEluICArICcuJyArIHRoaXMudHlwZSwgdGhpcy5vcHRpb25zLnNlbGVjdG9yLCAkLnByb3h5KHRoaXMuZW50ZXIsIHRoaXMpKVxuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKGV2ZW50T3V0ICsgJy4nICsgdGhpcy50eXBlLCB0aGlzLm9wdGlvbnMuc2VsZWN0b3IsICQucHJveHkodGhpcy5sZWF2ZSwgdGhpcykpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zLnNlbGVjdG9yID9cbiAgICAgICh0aGlzLl9vcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgeyB0cmlnZ2VyOiAnbWFudWFsJywgc2VsZWN0b3I6ICcnIH0pKSA6XG4gICAgICB0aGlzLmZpeFRpdGxlKClcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldERlZmF1bHRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBUb29sdGlwLkRFRkFVTFRTXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMuZ2V0RGVmYXVsdHMoKSwgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpXG5cbiAgICBpZiAob3B0aW9ucy5kZWxheSAmJiB0eXBlb2Ygb3B0aW9ucy5kZWxheSA9PSAnbnVtYmVyJykge1xuICAgICAgb3B0aW9ucy5kZWxheSA9IHtcbiAgICAgICAgc2hvdzogb3B0aW9ucy5kZWxheSxcbiAgICAgICAgaGlkZTogb3B0aW9ucy5kZWxheVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvcHRpb25zXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXREZWxlZ2F0ZU9wdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG9wdGlvbnMgID0ge31cbiAgICB2YXIgZGVmYXVsdHMgPSB0aGlzLmdldERlZmF1bHRzKClcblxuICAgIHRoaXMuX29wdGlvbnMgJiYgJC5lYWNoKHRoaXMuX29wdGlvbnMsIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICBpZiAoZGVmYXVsdHNba2V5XSAhPSB2YWx1ZSkgb3B0aW9uc1trZXldID0gdmFsdWVcbiAgICB9KVxuXG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmVudGVyID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciBzZWxmID0gb2JqIGluc3RhbmNlb2YgdGhpcy5jb25zdHJ1Y3RvciA/XG4gICAgICBvYmogOiAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlKVxuXG4gICAgaWYgKCFzZWxmKSB7XG4gICAgICBzZWxmID0gbmV3IHRoaXMuY29uc3RydWN0b3Iob2JqLmN1cnJlbnRUYXJnZXQsIHRoaXMuZ2V0RGVsZWdhdGVPcHRpb25zKCkpXG4gICAgICAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlLCBzZWxmKVxuICAgIH1cblxuICAgIGlmIChvYmogaW5zdGFuY2VvZiAkLkV2ZW50KSB7XG4gICAgICBzZWxmLmluU3RhdGVbb2JqLnR5cGUgPT0gJ2ZvY3VzaW4nID8gJ2ZvY3VzJyA6ICdob3ZlciddID0gdHJ1ZVxuICAgIH1cblxuICAgIGlmIChzZWxmLnRpcCgpLmhhc0NsYXNzKCdpbicpIHx8IHNlbGYuaG92ZXJTdGF0ZSA9PSAnaW4nKSB7XG4gICAgICBzZWxmLmhvdmVyU3RhdGUgPSAnaW4nXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjbGVhclRpbWVvdXQoc2VsZi50aW1lb3V0KVxuXG4gICAgc2VsZi5ob3ZlclN0YXRlID0gJ2luJ1xuXG4gICAgaWYgKCFzZWxmLm9wdGlvbnMuZGVsYXkgfHwgIXNlbGYub3B0aW9ucy5kZWxheS5zaG93KSByZXR1cm4gc2VsZi5zaG93KClcblxuICAgIHNlbGYudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHNlbGYuaG92ZXJTdGF0ZSA9PSAnaW4nKSBzZWxmLnNob3coKVxuICAgIH0sIHNlbGYub3B0aW9ucy5kZWxheS5zaG93KVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuaXNJblN0YXRlVHJ1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5pblN0YXRlKSB7XG4gICAgICBpZiAodGhpcy5pblN0YXRlW2tleV0pIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5sZWF2ZSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgc2VsZiA9IG9iaiBpbnN0YW5jZW9mIHRoaXMuY29uc3RydWN0b3IgP1xuICAgICAgb2JqIDogJChvYmouY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSlcblxuICAgIGlmICghc2VsZikge1xuICAgICAgc2VsZiA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKG9iai5jdXJyZW50VGFyZ2V0LCB0aGlzLmdldERlbGVnYXRlT3B0aW9ucygpKVxuICAgICAgJChvYmouY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSwgc2VsZilcbiAgICB9XG5cbiAgICBpZiAob2JqIGluc3RhbmNlb2YgJC5FdmVudCkge1xuICAgICAgc2VsZi5pblN0YXRlW29iai50eXBlID09ICdmb2N1c291dCcgPyAnZm9jdXMnIDogJ2hvdmVyJ10gPSBmYWxzZVxuICAgIH1cblxuICAgIGlmIChzZWxmLmlzSW5TdGF0ZVRydWUoKSkgcmV0dXJuXG5cbiAgICBjbGVhclRpbWVvdXQoc2VsZi50aW1lb3V0KVxuXG4gICAgc2VsZi5ob3ZlclN0YXRlID0gJ291dCdcblxuICAgIGlmICghc2VsZi5vcHRpb25zLmRlbGF5IHx8ICFzZWxmLm9wdGlvbnMuZGVsYXkuaGlkZSkgcmV0dXJuIHNlbGYuaGlkZSgpXG5cbiAgICBzZWxmLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChzZWxmLmhvdmVyU3RhdGUgPT0gJ291dCcpIHNlbGYuaGlkZSgpXG4gICAgfSwgc2VsZi5vcHRpb25zLmRlbGF5LmhpZGUpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBlID0gJC5FdmVudCgnc2hvdy5icy4nICsgdGhpcy50eXBlKVxuXG4gICAgaWYgKHRoaXMuaGFzQ29udGVudCgpICYmIHRoaXMuZW5hYmxlZCkge1xuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXG5cbiAgICAgIHZhciBpbkRvbSA9ICQuY29udGFpbnModGhpcy4kZWxlbWVudFswXS5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgdGhpcy4kZWxlbWVudFswXSlcbiAgICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpIHx8ICFpbkRvbSkgcmV0dXJuXG4gICAgICB2YXIgdGhhdCA9IHRoaXNcblxuICAgICAgdmFyICR0aXAgPSB0aGlzLnRpcCgpXG5cbiAgICAgIHZhciB0aXBJZCA9IHRoaXMuZ2V0VUlEKHRoaXMudHlwZSlcblxuICAgICAgdGhpcy5zZXRDb250ZW50KClcbiAgICAgICR0aXAuYXR0cignaWQnLCB0aXBJZClcbiAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1kZXNjcmliZWRieScsIHRpcElkKVxuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmFuaW1hdGlvbikgJHRpcC5hZGRDbGFzcygnZmFkZScpXG5cbiAgICAgIHZhciBwbGFjZW1lbnQgPSB0eXBlb2YgdGhpcy5vcHRpb25zLnBsYWNlbWVudCA9PSAnZnVuY3Rpb24nID9cbiAgICAgICAgdGhpcy5vcHRpb25zLnBsYWNlbWVudC5jYWxsKHRoaXMsICR0aXBbMF0sIHRoaXMuJGVsZW1lbnRbMF0pIDpcbiAgICAgICAgdGhpcy5vcHRpb25zLnBsYWNlbWVudFxuXG4gICAgICB2YXIgYXV0b1Rva2VuID0gL1xccz9hdXRvP1xccz8vaVxuICAgICAgdmFyIGF1dG9QbGFjZSA9IGF1dG9Ub2tlbi50ZXN0KHBsYWNlbWVudClcbiAgICAgIGlmIChhdXRvUGxhY2UpIHBsYWNlbWVudCA9IHBsYWNlbWVudC5yZXBsYWNlKGF1dG9Ub2tlbiwgJycpIHx8ICd0b3AnXG5cbiAgICAgICR0aXBcbiAgICAgICAgLmRldGFjaCgpXG4gICAgICAgIC5jc3MoeyB0b3A6IDAsIGxlZnQ6IDAsIGRpc3BsYXk6ICdibG9jaycgfSlcbiAgICAgICAgLmFkZENsYXNzKHBsYWNlbWVudClcbiAgICAgICAgLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUsIHRoaXMpXG5cbiAgICAgIHRoaXMub3B0aW9ucy5jb250YWluZXIgPyAkdGlwLmFwcGVuZFRvKHRoaXMub3B0aW9ucy5jb250YWluZXIpIDogJHRpcC5pbnNlcnRBZnRlcih0aGlzLiRlbGVtZW50KVxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdpbnNlcnRlZC5icy4nICsgdGhpcy50eXBlKVxuXG4gICAgICB2YXIgcG9zICAgICAgICAgID0gdGhpcy5nZXRQb3NpdGlvbigpXG4gICAgICB2YXIgYWN0dWFsV2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxuICAgICAgdmFyIGFjdHVhbEhlaWdodCA9ICR0aXBbMF0ub2Zmc2V0SGVpZ2h0XG5cbiAgICAgIGlmIChhdXRvUGxhY2UpIHtcbiAgICAgICAgdmFyIG9yZ1BsYWNlbWVudCA9IHBsYWNlbWVudFxuICAgICAgICB2YXIgdmlld3BvcnREaW0gPSB0aGlzLmdldFBvc2l0aW9uKHRoaXMuJHZpZXdwb3J0KVxuXG4gICAgICAgIHBsYWNlbWVudCA9IHBsYWNlbWVudCA9PSAnYm90dG9tJyAmJiBwb3MuYm90dG9tICsgYWN0dWFsSGVpZ2h0ID4gdmlld3BvcnREaW0uYm90dG9tID8gJ3RvcCcgICAgOlxuICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ3RvcCcgICAgJiYgcG9zLnRvcCAgICAtIGFjdHVhbEhlaWdodCA8IHZpZXdwb3J0RGltLnRvcCAgICA/ICdib3R0b20nIDpcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50ID09ICdyaWdodCcgICYmIHBvcy5yaWdodCAgKyBhY3R1YWxXaWR0aCAgPiB2aWV3cG9ydERpbS53aWR0aCAgPyAnbGVmdCcgICA6XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAnbGVmdCcgICAmJiBwb3MubGVmdCAgIC0gYWN0dWFsV2lkdGggIDwgdmlld3BvcnREaW0ubGVmdCAgID8gJ3JpZ2h0JyAgOlxuICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRcblxuICAgICAgICAkdGlwXG4gICAgICAgICAgLnJlbW92ZUNsYXNzKG9yZ1BsYWNlbWVudClcbiAgICAgICAgICAuYWRkQ2xhc3MocGxhY2VtZW50KVxuICAgICAgfVxuXG4gICAgICB2YXIgY2FsY3VsYXRlZE9mZnNldCA9IHRoaXMuZ2V0Q2FsY3VsYXRlZE9mZnNldChwbGFjZW1lbnQsIHBvcywgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodClcblxuICAgICAgdGhpcy5hcHBseVBsYWNlbWVudChjYWxjdWxhdGVkT2Zmc2V0LCBwbGFjZW1lbnQpXG5cbiAgICAgIHZhciBjb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHByZXZIb3ZlclN0YXRlID0gdGhhdC5ob3ZlclN0YXRlXG4gICAgICAgIHRoYXQuJGVsZW1lbnQudHJpZ2dlcignc2hvd24uYnMuJyArIHRoYXQudHlwZSlcbiAgICAgICAgdGhhdC5ob3ZlclN0YXRlID0gbnVsbFxuXG4gICAgICAgIGlmIChwcmV2SG92ZXJTdGF0ZSA9PSAnb3V0JykgdGhhdC5sZWF2ZSh0aGF0KVxuICAgICAgfVxuXG4gICAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiR0aXAuaGFzQ2xhc3MoJ2ZhZGUnKSA/XG4gICAgICAgICR0aXBcbiAgICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBjb21wbGV0ZSlcbiAgICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoVG9vbHRpcC5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XG4gICAgICAgIGNvbXBsZXRlKClcbiAgICB9XG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5hcHBseVBsYWNlbWVudCA9IGZ1bmN0aW9uIChvZmZzZXQsIHBsYWNlbWVudCkge1xuICAgIHZhciAkdGlwICAgPSB0aGlzLnRpcCgpXG4gICAgdmFyIHdpZHRoICA9ICR0aXBbMF0ub2Zmc2V0V2lkdGhcbiAgICB2YXIgaGVpZ2h0ID0gJHRpcFswXS5vZmZzZXRIZWlnaHRcblxuICAgIC8vIG1hbnVhbGx5IHJlYWQgbWFyZ2lucyBiZWNhdXNlIGdldEJvdW5kaW5nQ2xpZW50UmVjdCBpbmNsdWRlcyBkaWZmZXJlbmNlXG4gICAgdmFyIG1hcmdpblRvcCA9IHBhcnNlSW50KCR0aXAuY3NzKCdtYXJnaW4tdG9wJyksIDEwKVxuICAgIHZhciBtYXJnaW5MZWZ0ID0gcGFyc2VJbnQoJHRpcC5jc3MoJ21hcmdpbi1sZWZ0JyksIDEwKVxuXG4gICAgLy8gd2UgbXVzdCBjaGVjayBmb3IgTmFOIGZvciBpZSA4LzlcbiAgICBpZiAoaXNOYU4obWFyZ2luVG9wKSkgIG1hcmdpblRvcCAgPSAwXG4gICAgaWYgKGlzTmFOKG1hcmdpbkxlZnQpKSBtYXJnaW5MZWZ0ID0gMFxuXG4gICAgb2Zmc2V0LnRvcCAgKz0gbWFyZ2luVG9wXG4gICAgb2Zmc2V0LmxlZnQgKz0gbWFyZ2luTGVmdFxuXG4gICAgLy8gJC5mbi5vZmZzZXQgZG9lc24ndCByb3VuZCBwaXhlbCB2YWx1ZXNcbiAgICAvLyBzbyB3ZSB1c2Ugc2V0T2Zmc2V0IGRpcmVjdGx5IHdpdGggb3VyIG93biBmdW5jdGlvbiBCLTBcbiAgICAkLm9mZnNldC5zZXRPZmZzZXQoJHRpcFswXSwgJC5leHRlbmQoe1xuICAgICAgdXNpbmc6IGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICAkdGlwLmNzcyh7XG4gICAgICAgICAgdG9wOiBNYXRoLnJvdW5kKHByb3BzLnRvcCksXG4gICAgICAgICAgbGVmdDogTWF0aC5yb3VuZChwcm9wcy5sZWZ0KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0sIG9mZnNldCksIDApXG5cbiAgICAkdGlwLmFkZENsYXNzKCdpbicpXG5cbiAgICAvLyBjaGVjayB0byBzZWUgaWYgcGxhY2luZyB0aXAgaW4gbmV3IG9mZnNldCBjYXVzZWQgdGhlIHRpcCB0byByZXNpemUgaXRzZWxmXG4gICAgdmFyIGFjdHVhbFdpZHRoICA9ICR0aXBbMF0ub2Zmc2V0V2lkdGhcbiAgICB2YXIgYWN0dWFsSGVpZ2h0ID0gJHRpcFswXS5vZmZzZXRIZWlnaHRcblxuICAgIGlmIChwbGFjZW1lbnQgPT0gJ3RvcCcgJiYgYWN0dWFsSGVpZ2h0ICE9IGhlaWdodCkge1xuICAgICAgb2Zmc2V0LnRvcCA9IG9mZnNldC50b3AgKyBoZWlnaHQgLSBhY3R1YWxIZWlnaHRcbiAgICB9XG5cbiAgICB2YXIgZGVsdGEgPSB0aGlzLmdldFZpZXdwb3J0QWRqdXN0ZWREZWx0YShwbGFjZW1lbnQsIG9mZnNldCwgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodClcblxuICAgIGlmIChkZWx0YS5sZWZ0KSBvZmZzZXQubGVmdCArPSBkZWx0YS5sZWZ0XG4gICAgZWxzZSBvZmZzZXQudG9wICs9IGRlbHRhLnRvcFxuXG4gICAgdmFyIGlzVmVydGljYWwgICAgICAgICAgPSAvdG9wfGJvdHRvbS8udGVzdChwbGFjZW1lbnQpXG4gICAgdmFyIGFycm93RGVsdGEgICAgICAgICAgPSBpc1ZlcnRpY2FsID8gZGVsdGEubGVmdCAqIDIgLSB3aWR0aCArIGFjdHVhbFdpZHRoIDogZGVsdGEudG9wICogMiAtIGhlaWdodCArIGFjdHVhbEhlaWdodFxuICAgIHZhciBhcnJvd09mZnNldFBvc2l0aW9uID0gaXNWZXJ0aWNhbCA/ICdvZmZzZXRXaWR0aCcgOiAnb2Zmc2V0SGVpZ2h0J1xuXG4gICAgJHRpcC5vZmZzZXQob2Zmc2V0KVxuICAgIHRoaXMucmVwbGFjZUFycm93KGFycm93RGVsdGEsICR0aXBbMF1bYXJyb3dPZmZzZXRQb3NpdGlvbl0sIGlzVmVydGljYWwpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5yZXBsYWNlQXJyb3cgPSBmdW5jdGlvbiAoZGVsdGEsIGRpbWVuc2lvbiwgaXNWZXJ0aWNhbCkge1xuICAgIHRoaXMuYXJyb3coKVxuICAgICAgLmNzcyhpc1ZlcnRpY2FsID8gJ2xlZnQnIDogJ3RvcCcsIDUwICogKDEgLSBkZWx0YSAvIGRpbWVuc2lvbikgKyAnJScpXG4gICAgICAuY3NzKGlzVmVydGljYWwgPyAndG9wJyA6ICdsZWZ0JywgJycpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciAkdGlwICA9IHRoaXMudGlwKClcbiAgICB2YXIgdGl0bGUgPSB0aGlzLmdldFRpdGxlKClcblxuICAgICR0aXAuZmluZCgnLnRvb2x0aXAtaW5uZXInKVt0aGlzLm9wdGlvbnMuaHRtbCA/ICdodG1sJyA6ICd0ZXh0J10odGl0bGUpXG4gICAgJHRpcC5yZW1vdmVDbGFzcygnZmFkZSBpbiB0b3AgYm90dG9tIGxlZnQgcmlnaHQnKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuICAgIHZhciAkdGlwID0gJCh0aGlzLiR0aXApXG4gICAgdmFyIGUgICAgPSAkLkV2ZW50KCdoaWRlLmJzLicgKyB0aGlzLnR5cGUpXG5cbiAgICBmdW5jdGlvbiBjb21wbGV0ZSgpIHtcbiAgICAgIGlmICh0aGF0LmhvdmVyU3RhdGUgIT0gJ2luJykgJHRpcC5kZXRhY2goKVxuICAgICAgaWYgKHRoYXQuJGVsZW1lbnQpIHsgLy8gVE9ETzogQ2hlY2sgd2hldGhlciBndWFyZGluZyB0aGlzIGNvZGUgd2l0aCB0aGlzIGBpZmAgaXMgcmVhbGx5IG5lY2Vzc2FyeS5cbiAgICAgICAgdGhhdC4kZWxlbWVudFxuICAgICAgICAgIC5yZW1vdmVBdHRyKCdhcmlhLWRlc2NyaWJlZGJ5JylcbiAgICAgICAgICAudHJpZ2dlcignaGlkZGVuLmJzLicgKyB0aGF0LnR5cGUpXG4gICAgICB9XG4gICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpXG4gICAgfVxuXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXG5cbiAgICBpZiAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICAkdGlwLnJlbW92ZUNsYXNzKCdpbicpXG5cbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiAkdGlwLmhhc0NsYXNzKCdmYWRlJykgP1xuICAgICAgJHRpcFxuICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBjb21wbGV0ZSlcbiAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKFRvb2x0aXAuVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgY29tcGxldGUoKVxuXG4gICAgdGhpcy5ob3ZlclN0YXRlID0gbnVsbFxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmZpeFRpdGxlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciAkZSA9IHRoaXMuJGVsZW1lbnRcbiAgICBpZiAoJGUuYXR0cigndGl0bGUnKSB8fCB0eXBlb2YgJGUuYXR0cignZGF0YS1vcmlnaW5hbC10aXRsZScpICE9ICdzdHJpbmcnKSB7XG4gICAgICAkZS5hdHRyKCdkYXRhLW9yaWdpbmFsLXRpdGxlJywgJGUuYXR0cigndGl0bGUnKSB8fCAnJykuYXR0cigndGl0bGUnLCAnJylcbiAgICB9XG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5oYXNDb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmdldFRpdGxlKClcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFBvc2l0aW9uID0gZnVuY3Rpb24gKCRlbGVtZW50KSB7XG4gICAgJGVsZW1lbnQgICA9ICRlbGVtZW50IHx8IHRoaXMuJGVsZW1lbnRcblxuICAgIHZhciBlbCAgICAgPSAkZWxlbWVudFswXVxuICAgIHZhciBpc0JvZHkgPSBlbC50YWdOYW1lID09ICdCT0RZJ1xuXG4gICAgdmFyIGVsUmVjdCAgICA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgaWYgKGVsUmVjdC53aWR0aCA9PSBudWxsKSB7XG4gICAgICAvLyB3aWR0aCBhbmQgaGVpZ2h0IGFyZSBtaXNzaW5nIGluIElFOCwgc28gY29tcHV0ZSB0aGVtIG1hbnVhbGx5OyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2lzc3Vlcy8xNDA5M1xuICAgICAgZWxSZWN0ID0gJC5leHRlbmQoe30sIGVsUmVjdCwgeyB3aWR0aDogZWxSZWN0LnJpZ2h0IC0gZWxSZWN0LmxlZnQsIGhlaWdodDogZWxSZWN0LmJvdHRvbSAtIGVsUmVjdC50b3AgfSlcbiAgICB9XG4gICAgdmFyIGlzU3ZnID0gd2luZG93LlNWR0VsZW1lbnQgJiYgZWwgaW5zdGFuY2VvZiB3aW5kb3cuU1ZHRWxlbWVudFxuICAgIC8vIEF2b2lkIHVzaW5nICQub2Zmc2V0KCkgb24gU1ZHcyBzaW5jZSBpdCBnaXZlcyBpbmNvcnJlY3QgcmVzdWx0cyBpbiBqUXVlcnkgMy5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2lzc3Vlcy8yMDI4MFxuICAgIHZhciBlbE9mZnNldCAgPSBpc0JvZHkgPyB7IHRvcDogMCwgbGVmdDogMCB9IDogKGlzU3ZnID8gbnVsbCA6ICRlbGVtZW50Lm9mZnNldCgpKVxuICAgIHZhciBzY3JvbGwgICAgPSB7IHNjcm9sbDogaXNCb2R5ID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA6ICRlbGVtZW50LnNjcm9sbFRvcCgpIH1cbiAgICB2YXIgb3V0ZXJEaW1zID0gaXNCb2R5ID8geyB3aWR0aDogJCh3aW5kb3cpLndpZHRoKCksIGhlaWdodDogJCh3aW5kb3cpLmhlaWdodCgpIH0gOiBudWxsXG5cbiAgICByZXR1cm4gJC5leHRlbmQoe30sIGVsUmVjdCwgc2Nyb2xsLCBvdXRlckRpbXMsIGVsT2Zmc2V0KVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0Q2FsY3VsYXRlZE9mZnNldCA9IGZ1bmN0aW9uIChwbGFjZW1lbnQsIHBvcywgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodCkge1xuICAgIHJldHVybiBwbGFjZW1lbnQgPT0gJ2JvdHRvbScgPyB7IHRvcDogcG9zLnRvcCArIHBvcy5oZWlnaHQsICAgbGVmdDogcG9zLmxlZnQgKyBwb3Mud2lkdGggLyAyIC0gYWN0dWFsV2lkdGggLyAyIH0gOlxuICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ3RvcCcgICAgPyB7IHRvcDogcG9zLnRvcCAtIGFjdHVhbEhlaWdodCwgbGVmdDogcG9zLmxlZnQgKyBwb3Mud2lkdGggLyAyIC0gYWN0dWFsV2lkdGggLyAyIH0gOlxuICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ2xlZnQnICAgPyB7IHRvcDogcG9zLnRvcCArIHBvcy5oZWlnaHQgLyAyIC0gYWN0dWFsSGVpZ2h0IC8gMiwgbGVmdDogcG9zLmxlZnQgLSBhY3R1YWxXaWR0aCB9IDpcbiAgICAgICAgLyogcGxhY2VtZW50ID09ICdyaWdodCcgKi8geyB0b3A6IHBvcy50b3AgKyBwb3MuaGVpZ2h0IC8gMiAtIGFjdHVhbEhlaWdodCAvIDIsIGxlZnQ6IHBvcy5sZWZ0ICsgcG9zLndpZHRoIH1cblxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0Vmlld3BvcnRBZGp1c3RlZERlbHRhID0gZnVuY3Rpb24gKHBsYWNlbWVudCwgcG9zLCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KSB7XG4gICAgdmFyIGRlbHRhID0geyB0b3A6IDAsIGxlZnQ6IDAgfVxuICAgIGlmICghdGhpcy4kdmlld3BvcnQpIHJldHVybiBkZWx0YVxuXG4gICAgdmFyIHZpZXdwb3J0UGFkZGluZyA9IHRoaXMub3B0aW9ucy52aWV3cG9ydCAmJiB0aGlzLm9wdGlvbnMudmlld3BvcnQucGFkZGluZyB8fCAwXG4gICAgdmFyIHZpZXdwb3J0RGltZW5zaW9ucyA9IHRoaXMuZ2V0UG9zaXRpb24odGhpcy4kdmlld3BvcnQpXG5cbiAgICBpZiAoL3JpZ2h0fGxlZnQvLnRlc3QocGxhY2VtZW50KSkge1xuICAgICAgdmFyIHRvcEVkZ2VPZmZzZXQgICAgPSBwb3MudG9wIC0gdmlld3BvcnRQYWRkaW5nIC0gdmlld3BvcnREaW1lbnNpb25zLnNjcm9sbFxuICAgICAgdmFyIGJvdHRvbUVkZ2VPZmZzZXQgPSBwb3MudG9wICsgdmlld3BvcnRQYWRkaW5nIC0gdmlld3BvcnREaW1lbnNpb25zLnNjcm9sbCArIGFjdHVhbEhlaWdodFxuICAgICAgaWYgKHRvcEVkZ2VPZmZzZXQgPCB2aWV3cG9ydERpbWVuc2lvbnMudG9wKSB7IC8vIHRvcCBvdmVyZmxvd1xuICAgICAgICBkZWx0YS50b3AgPSB2aWV3cG9ydERpbWVuc2lvbnMudG9wIC0gdG9wRWRnZU9mZnNldFxuICAgICAgfSBlbHNlIGlmIChib3R0b21FZGdlT2Zmc2V0ID4gdmlld3BvcnREaW1lbnNpb25zLnRvcCArIHZpZXdwb3J0RGltZW5zaW9ucy5oZWlnaHQpIHsgLy8gYm90dG9tIG92ZXJmbG93XG4gICAgICAgIGRlbHRhLnRvcCA9IHZpZXdwb3J0RGltZW5zaW9ucy50b3AgKyB2aWV3cG9ydERpbWVuc2lvbnMuaGVpZ2h0IC0gYm90dG9tRWRnZU9mZnNldFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbGVmdEVkZ2VPZmZzZXQgID0gcG9zLmxlZnQgLSB2aWV3cG9ydFBhZGRpbmdcbiAgICAgIHZhciByaWdodEVkZ2VPZmZzZXQgPSBwb3MubGVmdCArIHZpZXdwb3J0UGFkZGluZyArIGFjdHVhbFdpZHRoXG4gICAgICBpZiAobGVmdEVkZ2VPZmZzZXQgPCB2aWV3cG9ydERpbWVuc2lvbnMubGVmdCkgeyAvLyBsZWZ0IG92ZXJmbG93XG4gICAgICAgIGRlbHRhLmxlZnQgPSB2aWV3cG9ydERpbWVuc2lvbnMubGVmdCAtIGxlZnRFZGdlT2Zmc2V0XG4gICAgICB9IGVsc2UgaWYgKHJpZ2h0RWRnZU9mZnNldCA+IHZpZXdwb3J0RGltZW5zaW9ucy5yaWdodCkgeyAvLyByaWdodCBvdmVyZmxvd1xuICAgICAgICBkZWx0YS5sZWZ0ID0gdmlld3BvcnREaW1lbnNpb25zLmxlZnQgKyB2aWV3cG9ydERpbWVuc2lvbnMud2lkdGggLSByaWdodEVkZ2VPZmZzZXRcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGVsdGFcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFRpdGxlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aXRsZVxuICAgIHZhciAkZSA9IHRoaXMuJGVsZW1lbnRcbiAgICB2YXIgbyAgPSB0aGlzLm9wdGlvbnNcblxuICAgIHRpdGxlID0gJGUuYXR0cignZGF0YS1vcmlnaW5hbC10aXRsZScpXG4gICAgICB8fCAodHlwZW9mIG8udGl0bGUgPT0gJ2Z1bmN0aW9uJyA/IG8udGl0bGUuY2FsbCgkZVswXSkgOiAgby50aXRsZSlcblxuICAgIHJldHVybiB0aXRsZVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0VUlEID0gZnVuY3Rpb24gKHByZWZpeCkge1xuICAgIGRvIHByZWZpeCArPSB+fihNYXRoLnJhbmRvbSgpICogMTAwMDAwMClcbiAgICB3aGlsZSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocHJlZml4KSlcbiAgICByZXR1cm4gcHJlZml4XG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS50aXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLiR0aXApIHtcbiAgICAgIHRoaXMuJHRpcCA9ICQodGhpcy5vcHRpb25zLnRlbXBsYXRlKVxuICAgICAgaWYgKHRoaXMuJHRpcC5sZW5ndGggIT0gMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGhpcy50eXBlICsgJyBgdGVtcGxhdGVgIG9wdGlvbiBtdXN0IGNvbnNpc3Qgb2YgZXhhY3RseSAxIHRvcC1sZXZlbCBlbGVtZW50IScpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLiR0aXBcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmFycm93ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAodGhpcy4kYXJyb3cgPSB0aGlzLiRhcnJvdyB8fCB0aGlzLnRpcCgpLmZpbmQoJy50b29sdGlwLWFycm93JykpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUudG9nZ2xlRW5hYmxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVuYWJsZWQgPSAhdGhpcy5lbmFibGVkXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgIGlmIChlKSB7XG4gICAgICBzZWxmID0gJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUpXG4gICAgICBpZiAoIXNlbGYpIHtcbiAgICAgICAgc2VsZiA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKGUuY3VycmVudFRhcmdldCwgdGhpcy5nZXREZWxlZ2F0ZU9wdGlvbnMoKSlcbiAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUsIHNlbGYpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGUpIHtcbiAgICAgIHNlbGYuaW5TdGF0ZS5jbGljayA9ICFzZWxmLmluU3RhdGUuY2xpY2tcbiAgICAgIGlmIChzZWxmLmlzSW5TdGF0ZVRydWUoKSkgc2VsZi5lbnRlcihzZWxmKVxuICAgICAgZWxzZSBzZWxmLmxlYXZlKHNlbGYpXG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYudGlwKCkuaGFzQ2xhc3MoJ2luJykgPyBzZWxmLmxlYXZlKHNlbGYpIDogc2VsZi5lbnRlcihzZWxmKVxuICAgIH1cbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dClcbiAgICB0aGlzLmhpZGUoZnVuY3Rpb24gKCkge1xuICAgICAgdGhhdC4kZWxlbWVudC5vZmYoJy4nICsgdGhhdC50eXBlKS5yZW1vdmVEYXRhKCdicy4nICsgdGhhdC50eXBlKVxuICAgICAgaWYgKHRoYXQuJHRpcCkge1xuICAgICAgICB0aGF0LiR0aXAuZGV0YWNoKClcbiAgICAgIH1cbiAgICAgIHRoYXQuJHRpcCA9IG51bGxcbiAgICAgIHRoYXQuJGFycm93ID0gbnVsbFxuICAgICAgdGhhdC4kdmlld3BvcnQgPSBudWxsXG4gICAgICB0aGF0LiRlbGVtZW50ID0gbnVsbFxuICAgIH0pXG4gIH1cblxuXG4gIC8vIFRPT0xUSVAgUExVR0lOIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy50b29sdGlwJylcbiAgICAgIHZhciBvcHRpb25zID0gdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb25cblxuICAgICAgaWYgKCFkYXRhICYmIC9kZXN0cm95fGhpZGUvLnRlc3Qob3B0aW9uKSkgcmV0dXJuXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLnRvb2x0aXAnLCAoZGF0YSA9IG5ldyBUb29sdGlwKHRoaXMsIG9wdGlvbnMpKSlcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxuICAgIH0pXG4gIH1cblxuICB2YXIgb2xkID0gJC5mbi50b29sdGlwXG5cbiAgJC5mbi50b29sdGlwICAgICAgICAgICAgID0gUGx1Z2luXG4gICQuZm4udG9vbHRpcC5Db25zdHJ1Y3RvciA9IFRvb2x0aXBcblxuXG4gIC8vIFRPT0xUSVAgTk8gQ09ORkxJQ1RcbiAgLy8gPT09PT09PT09PT09PT09PT09PVxuXG4gICQuZm4udG9vbHRpcC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4udG9vbHRpcCA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxufShqUXVlcnkpO1xuIiwiLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBCb290c3RyYXA6IHBvcG92ZXIuanMgdjMuMy43XG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNwb3BvdmVyc1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4rZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIFBPUE9WRVIgUFVCTElDIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBQb3BvdmVyID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmluaXQoJ3BvcG92ZXInLCBlbGVtZW50LCBvcHRpb25zKVxuICB9XG5cbiAgaWYgKCEkLmZuLnRvb2x0aXApIHRocm93IG5ldyBFcnJvcignUG9wb3ZlciByZXF1aXJlcyB0b29sdGlwLmpzJylcblxuICBQb3BvdmVyLlZFUlNJT04gID0gJzMuMy43J1xuXG4gIFBvcG92ZXIuREVGQVVMVFMgPSAkLmV4dGVuZCh7fSwgJC5mbi50b29sdGlwLkNvbnN0cnVjdG9yLkRFRkFVTFRTLCB7XG4gICAgcGxhY2VtZW50OiAncmlnaHQnLFxuICAgIHRyaWdnZXI6ICdjbGljaycsXG4gICAgY29udGVudDogJycsXG4gICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwicG9wb3ZlclwiIHJvbGU9XCJ0b29sdGlwXCI+PGRpdiBjbGFzcz1cImFycm93XCI+PC9kaXY+PGgzIGNsYXNzPVwicG9wb3Zlci10aXRsZVwiPjwvaDM+PGRpdiBjbGFzcz1cInBvcG92ZXItY29udGVudFwiPjwvZGl2PjwvZGl2PidcbiAgfSlcblxuXG4gIC8vIE5PVEU6IFBPUE9WRVIgRVhURU5EUyB0b29sdGlwLmpzXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgUG9wb3Zlci5wcm90b3R5cGUgPSAkLmV4dGVuZCh7fSwgJC5mbi50b29sdGlwLkNvbnN0cnVjdG9yLnByb3RvdHlwZSlcblxuICBQb3BvdmVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBvcG92ZXJcblxuICBQb3BvdmVyLnByb3RvdHlwZS5nZXREZWZhdWx0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUG9wb3Zlci5ERUZBVUxUU1xuICB9XG5cbiAgUG9wb3Zlci5wcm90b3R5cGUuc2V0Q29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJHRpcCAgICA9IHRoaXMudGlwKClcbiAgICB2YXIgdGl0bGUgICA9IHRoaXMuZ2V0VGl0bGUoKVxuICAgIHZhciBjb250ZW50ID0gdGhpcy5nZXRDb250ZW50KClcblxuICAgICR0aXAuZmluZCgnLnBvcG92ZXItdGl0bGUnKVt0aGlzLm9wdGlvbnMuaHRtbCA/ICdodG1sJyA6ICd0ZXh0J10odGl0bGUpXG4gICAgJHRpcC5maW5kKCcucG9wb3Zlci1jb250ZW50JykuY2hpbGRyZW4oKS5kZXRhY2goKS5lbmQoKVsgLy8gd2UgdXNlIGFwcGVuZCBmb3IgaHRtbCBvYmplY3RzIHRvIG1haW50YWluIGpzIGV2ZW50c1xuICAgICAgdGhpcy5vcHRpb25zLmh0bWwgPyAodHlwZW9mIGNvbnRlbnQgPT0gJ3N0cmluZycgPyAnaHRtbCcgOiAnYXBwZW5kJykgOiAndGV4dCdcbiAgICBdKGNvbnRlbnQpXG5cbiAgICAkdGlwLnJlbW92ZUNsYXNzKCdmYWRlIHRvcCBib3R0b20gbGVmdCByaWdodCBpbicpXG5cbiAgICAvLyBJRTggZG9lc24ndCBhY2NlcHQgaGlkaW5nIHZpYSB0aGUgYDplbXB0eWAgcHNldWRvIHNlbGVjdG9yLCB3ZSBoYXZlIHRvIGRvXG4gICAgLy8gdGhpcyBtYW51YWxseSBieSBjaGVja2luZyB0aGUgY29udGVudHMuXG4gICAgaWYgKCEkdGlwLmZpbmQoJy5wb3BvdmVyLXRpdGxlJykuaHRtbCgpKSAkdGlwLmZpbmQoJy5wb3BvdmVyLXRpdGxlJykuaGlkZSgpXG4gIH1cblxuICBQb3BvdmVyLnByb3RvdHlwZS5oYXNDb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmdldFRpdGxlKCkgfHwgdGhpcy5nZXRDb250ZW50KClcbiAgfVxuXG4gIFBvcG92ZXIucHJvdG90eXBlLmdldENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICRlID0gdGhpcy4kZWxlbWVudFxuICAgIHZhciBvICA9IHRoaXMub3B0aW9uc1xuXG4gICAgcmV0dXJuICRlLmF0dHIoJ2RhdGEtY29udGVudCcpXG4gICAgICB8fCAodHlwZW9mIG8uY29udGVudCA9PSAnZnVuY3Rpb24nID9cbiAgICAgICAgICAgIG8uY29udGVudC5jYWxsKCRlWzBdKSA6XG4gICAgICAgICAgICBvLmNvbnRlbnQpXG4gIH1cblxuICBQb3BvdmVyLnByb3RvdHlwZS5hcnJvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKHRoaXMuJGFycm93ID0gdGhpcy4kYXJyb3cgfHwgdGhpcy50aXAoKS5maW5kKCcuYXJyb3cnKSlcbiAgfVxuXG5cbiAgLy8gUE9QT1ZFUiBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLnBvcG92ZXInKVxuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxuXG4gICAgICBpZiAoIWRhdGEgJiYgL2Rlc3Ryb3l8aGlkZS8udGVzdChvcHRpb24pKSByZXR1cm5cbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMucG9wb3ZlcicsIChkYXRhID0gbmV3IFBvcG92ZXIodGhpcywgb3B0aW9ucykpKVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXG4gICAgfSlcbiAgfVxuXG4gIHZhciBvbGQgPSAkLmZuLnBvcG92ZXJcblxuICAkLmZuLnBvcG92ZXIgICAgICAgICAgICAgPSBQbHVnaW5cbiAgJC5mbi5wb3BvdmVyLkNvbnN0cnVjdG9yID0gUG9wb3ZlclxuXG5cbiAgLy8gUE9QT1ZFUiBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT09PT09XG5cbiAgJC5mbi5wb3BvdmVyLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi5wb3BvdmVyID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG59KGpRdWVyeSk7XG4iLCIvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEJvb3RzdHJhcDogbW9kYWwuanMgdjMuMy43XG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNtb2RhbHNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuK2Z1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBNT0RBTCBDTEFTUyBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgTW9kYWwgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyAgICAgICAgICAgICA9IG9wdGlvbnNcbiAgICB0aGlzLiRib2R5ICAgICAgICAgICAgICAgPSAkKGRvY3VtZW50LmJvZHkpXG4gICAgdGhpcy4kZWxlbWVudCAgICAgICAgICAgID0gJChlbGVtZW50KVxuICAgIHRoaXMuJGRpYWxvZyAgICAgICAgICAgICA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLm1vZGFsLWRpYWxvZycpXG4gICAgdGhpcy4kYmFja2Ryb3AgICAgICAgICAgID0gbnVsbFxuICAgIHRoaXMuaXNTaG93biAgICAgICAgICAgICA9IG51bGxcbiAgICB0aGlzLm9yaWdpbmFsQm9keVBhZCAgICAgPSBudWxsXG4gICAgdGhpcy5zY3JvbGxiYXJXaWR0aCAgICAgID0gMFxuICAgIHRoaXMuaWdub3JlQmFja2Ryb3BDbGljayA9IGZhbHNlXG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnJlbW90ZSkge1xuICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAuZmluZCgnLm1vZGFsLWNvbnRlbnQnKVxuICAgICAgICAubG9hZCh0aGlzLm9wdGlvbnMucmVtb3RlLCAkLnByb3h5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2xvYWRlZC5icy5tb2RhbCcpXG4gICAgICAgIH0sIHRoaXMpKVxuICAgIH1cbiAgfVxuXG4gIE1vZGFsLlZFUlNJT04gID0gJzMuMy43J1xuXG4gIE1vZGFsLlRSQU5TSVRJT05fRFVSQVRJT04gPSAzMDBcbiAgTW9kYWwuQkFDS0RST1BfVFJBTlNJVElPTl9EVVJBVElPTiA9IDE1MFxuXG4gIE1vZGFsLkRFRkFVTFRTID0ge1xuICAgIGJhY2tkcm9wOiB0cnVlLFxuICAgIGtleWJvYXJkOiB0cnVlLFxuICAgIHNob3c6IHRydWVcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoX3JlbGF0ZWRUYXJnZXQpIHtcbiAgICByZXR1cm4gdGhpcy5pc1Nob3duID8gdGhpcy5oaWRlKCkgOiB0aGlzLnNob3coX3JlbGF0ZWRUYXJnZXQpXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uIChfcmVsYXRlZFRhcmdldCkge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuICAgIHZhciBlICAgID0gJC5FdmVudCgnc2hvdy5icy5tb2RhbCcsIHsgcmVsYXRlZFRhcmdldDogX3JlbGF0ZWRUYXJnZXQgfSlcblxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxuXG4gICAgaWYgKHRoaXMuaXNTaG93biB8fCBlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgIHRoaXMuaXNTaG93biA9IHRydWVcblxuICAgIHRoaXMuY2hlY2tTY3JvbGxiYXIoKVxuICAgIHRoaXMuc2V0U2Nyb2xsYmFyKClcbiAgICB0aGlzLiRib2R5LmFkZENsYXNzKCdtb2RhbC1vcGVuJylcblxuICAgIHRoaXMuZXNjYXBlKClcbiAgICB0aGlzLnJlc2l6ZSgpXG5cbiAgICB0aGlzLiRlbGVtZW50Lm9uKCdjbGljay5kaXNtaXNzLmJzLm1vZGFsJywgJ1tkYXRhLWRpc21pc3M9XCJtb2RhbFwiXScsICQucHJveHkodGhpcy5oaWRlLCB0aGlzKSlcblxuICAgIHRoaXMuJGRpYWxvZy5vbignbW91c2Vkb3duLmRpc21pc3MuYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGF0LiRlbGVtZW50Lm9uZSgnbW91c2V1cC5kaXNtaXNzLmJzLm1vZGFsJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKCQoZS50YXJnZXQpLmlzKHRoYXQuJGVsZW1lbnQpKSB0aGF0Lmlnbm9yZUJhY2tkcm9wQ2xpY2sgPSB0cnVlXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB0aGlzLmJhY2tkcm9wKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB0cmFuc2l0aW9uID0gJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhhdC4kZWxlbWVudC5oYXNDbGFzcygnZmFkZScpXG5cbiAgICAgIGlmICghdGhhdC4kZWxlbWVudC5wYXJlbnQoKS5sZW5ndGgpIHtcbiAgICAgICAgdGhhdC4kZWxlbWVudC5hcHBlbmRUbyh0aGF0LiRib2R5KSAvLyBkb24ndCBtb3ZlIG1vZGFscyBkb20gcG9zaXRpb25cbiAgICAgIH1cblxuICAgICAgdGhhdC4kZWxlbWVudFxuICAgICAgICAuc2hvdygpXG4gICAgICAgIC5zY3JvbGxUb3AoMClcblxuICAgICAgdGhhdC5hZGp1c3REaWFsb2coKVxuXG4gICAgICBpZiAodHJhbnNpdGlvbikge1xuICAgICAgICB0aGF0LiRlbGVtZW50WzBdLm9mZnNldFdpZHRoIC8vIGZvcmNlIHJlZmxvd1xuICAgICAgfVxuXG4gICAgICB0aGF0LiRlbGVtZW50LmFkZENsYXNzKCdpbicpXG5cbiAgICAgIHRoYXQuZW5mb3JjZUZvY3VzKClcblxuICAgICAgdmFyIGUgPSAkLkV2ZW50KCdzaG93bi5icy5tb2RhbCcsIHsgcmVsYXRlZFRhcmdldDogX3JlbGF0ZWRUYXJnZXQgfSlcblxuICAgICAgdHJhbnNpdGlvbiA/XG4gICAgICAgIHRoYXQuJGRpYWxvZyAvLyB3YWl0IGZvciBtb2RhbCB0byBzbGlkZSBpblxuICAgICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoYXQuJGVsZW1lbnQudHJpZ2dlcignZm9jdXMnKS50cmlnZ2VyKGUpXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoTW9kYWwuVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgICB0aGF0LiRlbGVtZW50LnRyaWdnZXIoJ2ZvY3VzJykudHJpZ2dlcihlKVxuICAgIH0pXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGUpIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgZSA9ICQuRXZlbnQoJ2hpZGUuYnMubW9kYWwnKVxuXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXG5cbiAgICBpZiAoIXRoaXMuaXNTaG93biB8fCBlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgIHRoaXMuaXNTaG93biA9IGZhbHNlXG5cbiAgICB0aGlzLmVzY2FwZSgpXG4gICAgdGhpcy5yZXNpemUoKVxuXG4gICAgJChkb2N1bWVudCkub2ZmKCdmb2N1c2luLmJzLm1vZGFsJylcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5yZW1vdmVDbGFzcygnaW4nKVxuICAgICAgLm9mZignY2xpY2suZGlzbWlzcy5icy5tb2RhbCcpXG4gICAgICAub2ZmKCdtb3VzZXVwLmRpc21pc3MuYnMubW9kYWwnKVxuXG4gICAgdGhpcy4kZGlhbG9nLm9mZignbW91c2Vkb3duLmRpc21pc3MuYnMubW9kYWwnKVxuXG4gICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZmFkZScpID9cbiAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgJC5wcm94eSh0aGlzLmhpZGVNb2RhbCwgdGhpcykpXG4gICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChNb2RhbC5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XG4gICAgICB0aGlzLmhpZGVNb2RhbCgpXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuZW5mb3JjZUZvY3VzID0gZnVuY3Rpb24gKCkge1xuICAgICQoZG9jdW1lbnQpXG4gICAgICAub2ZmKCdmb2N1c2luLmJzLm1vZGFsJykgLy8gZ3VhcmQgYWdhaW5zdCBpbmZpbml0ZSBmb2N1cyBsb29wXG4gICAgICAub24oJ2ZvY3VzaW4uYnMubW9kYWwnLCAkLnByb3h5KGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChkb2N1bWVudCAhPT0gZS50YXJnZXQgJiZcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnRbMF0gIT09IGUudGFyZ2V0ICYmXG4gICAgICAgICAgICAhdGhpcy4kZWxlbWVudC5oYXMoZS50YXJnZXQpLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZm9jdXMnKVxuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSlcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5lc2NhcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuaXNTaG93biAmJiB0aGlzLm9wdGlvbnMua2V5Ym9hcmQpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ2tleWRvd24uZGlzbWlzcy5icy5tb2RhbCcsICQucHJveHkoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS53aGljaCA9PSAyNyAmJiB0aGlzLmhpZGUoKVxuICAgICAgfSwgdGhpcykpXG4gICAgfSBlbHNlIGlmICghdGhpcy5pc1Nob3duKSB7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZigna2V5ZG93bi5kaXNtaXNzLmJzLm1vZGFsJylcbiAgICB9XG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmlzU2hvd24pIHtcbiAgICAgICQod2luZG93KS5vbigncmVzaXplLmJzLm1vZGFsJywgJC5wcm94eSh0aGlzLmhhbmRsZVVwZGF0ZSwgdGhpcykpXG4gICAgfSBlbHNlIHtcbiAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS5icy5tb2RhbCcpXG4gICAgfVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLmhpZGVNb2RhbCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICB0aGlzLiRlbGVtZW50LmhpZGUoKVxuICAgIHRoaXMuYmFja2Ryb3AoZnVuY3Rpb24gKCkge1xuICAgICAgdGhhdC4kYm9keS5yZW1vdmVDbGFzcygnbW9kYWwtb3BlbicpXG4gICAgICB0aGF0LnJlc2V0QWRqdXN0bWVudHMoKVxuICAgICAgdGhhdC5yZXNldFNjcm9sbGJhcigpXG4gICAgICB0aGF0LiRlbGVtZW50LnRyaWdnZXIoJ2hpZGRlbi5icy5tb2RhbCcpXG4gICAgfSlcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5yZW1vdmVCYWNrZHJvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLiRiYWNrZHJvcCAmJiB0aGlzLiRiYWNrZHJvcC5yZW1vdmUoKVxuICAgIHRoaXMuJGJhY2tkcm9wID0gbnVsbFxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLmJhY2tkcm9wID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgdmFyIGFuaW1hdGUgPSB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJykgPyAnZmFkZScgOiAnJ1xuXG4gICAgaWYgKHRoaXMuaXNTaG93biAmJiB0aGlzLm9wdGlvbnMuYmFja2Ryb3ApIHtcbiAgICAgIHZhciBkb0FuaW1hdGUgPSAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiBhbmltYXRlXG5cbiAgICAgIHRoaXMuJGJhY2tkcm9wID0gJChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSlcbiAgICAgICAgLmFkZENsYXNzKCdtb2RhbC1iYWNrZHJvcCAnICsgYW5pbWF0ZSlcbiAgICAgICAgLmFwcGVuZFRvKHRoaXMuJGJvZHkpXG5cbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrLmRpc21pc3MuYnMubW9kYWwnLCAkLnByb3h5KGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICh0aGlzLmlnbm9yZUJhY2tkcm9wQ2xpY2spIHtcbiAgICAgICAgICB0aGlzLmlnbm9yZUJhY2tkcm9wQ2xpY2sgPSBmYWxzZVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGlmIChlLnRhcmdldCAhPT0gZS5jdXJyZW50VGFyZ2V0KSByZXR1cm5cbiAgICAgICAgdGhpcy5vcHRpb25zLmJhY2tkcm9wID09ICdzdGF0aWMnXG4gICAgICAgICAgPyB0aGlzLiRlbGVtZW50WzBdLmZvY3VzKClcbiAgICAgICAgICA6IHRoaXMuaGlkZSgpXG4gICAgICB9LCB0aGlzKSlcblxuICAgICAgaWYgKGRvQW5pbWF0ZSkgdGhpcy4kYmFja2Ryb3BbMF0ub2Zmc2V0V2lkdGggLy8gZm9yY2UgcmVmbG93XG5cbiAgICAgIHRoaXMuJGJhY2tkcm9wLmFkZENsYXNzKCdpbicpXG5cbiAgICAgIGlmICghY2FsbGJhY2spIHJldHVyblxuXG4gICAgICBkb0FuaW1hdGUgP1xuICAgICAgICB0aGlzLiRiYWNrZHJvcFxuICAgICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGNhbGxiYWNrKVxuICAgICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChNb2RhbC5CQUNLRFJPUF9UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XG4gICAgICAgIGNhbGxiYWNrKClcblxuICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNTaG93biAmJiB0aGlzLiRiYWNrZHJvcCkge1xuICAgICAgdGhpcy4kYmFja2Ryb3AucmVtb3ZlQ2xhc3MoJ2luJylcblxuICAgICAgdmFyIGNhbGxiYWNrUmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGF0LnJlbW92ZUJhY2tkcm9wKClcbiAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soKVxuICAgICAgfVxuICAgICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZmFkZScpID9cbiAgICAgICAgdGhpcy4kYmFja2Ryb3BcbiAgICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBjYWxsYmFja1JlbW92ZSlcbiAgICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoTW9kYWwuQkFDS0RST1BfVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgICBjYWxsYmFja1JlbW92ZSgpXG5cbiAgICB9IGVsc2UgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjaygpXG4gICAgfVxuICB9XG5cbiAgLy8gdGhlc2UgZm9sbG93aW5nIG1ldGhvZHMgYXJlIHVzZWQgdG8gaGFuZGxlIG92ZXJmbG93aW5nIG1vZGFsc1xuXG4gIE1vZGFsLnByb3RvdHlwZS5oYW5kbGVVcGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hZGp1c3REaWFsb2coKVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLmFkanVzdERpYWxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbW9kYWxJc092ZXJmbG93aW5nID0gdGhpcy4kZWxlbWVudFswXS5zY3JvbGxIZWlnaHQgPiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0XG5cbiAgICB0aGlzLiRlbGVtZW50LmNzcyh7XG4gICAgICBwYWRkaW5nTGVmdDogICF0aGlzLmJvZHlJc092ZXJmbG93aW5nICYmIG1vZGFsSXNPdmVyZmxvd2luZyA/IHRoaXMuc2Nyb2xsYmFyV2lkdGggOiAnJyxcbiAgICAgIHBhZGRpbmdSaWdodDogdGhpcy5ib2R5SXNPdmVyZmxvd2luZyAmJiAhbW9kYWxJc092ZXJmbG93aW5nID8gdGhpcy5zY3JvbGxiYXJXaWR0aCA6ICcnXG4gICAgfSlcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5yZXNldEFkanVzdG1lbnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuJGVsZW1lbnQuY3NzKHtcbiAgICAgIHBhZGRpbmdMZWZ0OiAnJyxcbiAgICAgIHBhZGRpbmdSaWdodDogJydcbiAgICB9KVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLmNoZWNrU2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmdWxsV2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIGlmICghZnVsbFdpbmRvd1dpZHRoKSB7IC8vIHdvcmthcm91bmQgZm9yIG1pc3Npbmcgd2luZG93LmlubmVyV2lkdGggaW4gSUU4XG4gICAgICB2YXIgZG9jdW1lbnRFbGVtZW50UmVjdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgZnVsbFdpbmRvd1dpZHRoID0gZG9jdW1lbnRFbGVtZW50UmVjdC5yaWdodCAtIE1hdGguYWJzKGRvY3VtZW50RWxlbWVudFJlY3QubGVmdClcbiAgICB9XG4gICAgdGhpcy5ib2R5SXNPdmVyZmxvd2luZyA9IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGggPCBmdWxsV2luZG93V2lkdGhcbiAgICB0aGlzLnNjcm9sbGJhcldpZHRoID0gdGhpcy5tZWFzdXJlU2Nyb2xsYmFyKClcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5zZXRTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGJvZHlQYWQgPSBwYXJzZUludCgodGhpcy4kYm9keS5jc3MoJ3BhZGRpbmctcmlnaHQnKSB8fCAwKSwgMTApXG4gICAgdGhpcy5vcmlnaW5hbEJvZHlQYWQgPSBkb2N1bWVudC5ib2R5LnN0eWxlLnBhZGRpbmdSaWdodCB8fCAnJ1xuICAgIGlmICh0aGlzLmJvZHlJc092ZXJmbG93aW5nKSB0aGlzLiRib2R5LmNzcygncGFkZGluZy1yaWdodCcsIGJvZHlQYWQgKyB0aGlzLnNjcm9sbGJhcldpZHRoKVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLnJlc2V0U2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuJGJvZHkuY3NzKCdwYWRkaW5nLXJpZ2h0JywgdGhpcy5vcmlnaW5hbEJvZHlQYWQpXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUubWVhc3VyZVNjcm9sbGJhciA9IGZ1bmN0aW9uICgpIHsgLy8gdGh4IHdhbHNoXG4gICAgdmFyIHNjcm9sbERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgc2Nyb2xsRGl2LmNsYXNzTmFtZSA9ICdtb2RhbC1zY3JvbGxiYXItbWVhc3VyZSdcbiAgICB0aGlzLiRib2R5LmFwcGVuZChzY3JvbGxEaXYpXG4gICAgdmFyIHNjcm9sbGJhcldpZHRoID0gc2Nyb2xsRGl2Lm9mZnNldFdpZHRoIC0gc2Nyb2xsRGl2LmNsaWVudFdpZHRoXG4gICAgdGhpcy4kYm9keVswXS5yZW1vdmVDaGlsZChzY3JvbGxEaXYpXG4gICAgcmV0dXJuIHNjcm9sbGJhcldpZHRoXG4gIH1cblxuXG4gIC8vIE1PREFMIFBMVUdJTiBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbiwgX3JlbGF0ZWRUYXJnZXQpIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5tb2RhbCcpXG4gICAgICB2YXIgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBNb2RhbC5ERUZBVUxUUywgJHRoaXMuZGF0YSgpLCB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvbilcblxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5tb2RhbCcsIChkYXRhID0gbmV3IE1vZGFsKHRoaXMsIG9wdGlvbnMpKSlcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oX3JlbGF0ZWRUYXJnZXQpXG4gICAgICBlbHNlIGlmIChvcHRpb25zLnNob3cpIGRhdGEuc2hvdyhfcmVsYXRlZFRhcmdldClcbiAgICB9KVxuICB9XG5cbiAgdmFyIG9sZCA9ICQuZm4ubW9kYWxcblxuICAkLmZuLm1vZGFsICAgICAgICAgICAgID0gUGx1Z2luXG4gICQuZm4ubW9kYWwuQ29uc3RydWN0b3IgPSBNb2RhbFxuXG5cbiAgLy8gTU9EQUwgTk8gQ09ORkxJQ1RcbiAgLy8gPT09PT09PT09PT09PT09PT1cblxuICAkLmZuLm1vZGFsLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi5tb2RhbCA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuXG4gIC8vIE1PREFMIERBVEEtQVBJXG4gIC8vID09PT09PT09PT09PT09XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLmJzLm1vZGFsLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cIm1vZGFsXCJdJywgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcbiAgICB2YXIgaHJlZiAgICA9ICR0aGlzLmF0dHIoJ2hyZWYnKVxuICAgIHZhciAkdGFyZ2V0ID0gJCgkdGhpcy5hdHRyKCdkYXRhLXRhcmdldCcpIHx8IChocmVmICYmIGhyZWYucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLywgJycpKSkgLy8gc3RyaXAgZm9yIGllN1xuICAgIHZhciBvcHRpb24gID0gJHRhcmdldC5kYXRhKCdicy5tb2RhbCcpID8gJ3RvZ2dsZScgOiAkLmV4dGVuZCh7IHJlbW90ZTogIS8jLy50ZXN0KGhyZWYpICYmIGhyZWYgfSwgJHRhcmdldC5kYXRhKCksICR0aGlzLmRhdGEoKSlcblxuICAgIGlmICgkdGhpcy5pcygnYScpKSBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICR0YXJnZXQub25lKCdzaG93LmJzLm1vZGFsJywgZnVuY3Rpb24gKHNob3dFdmVudCkge1xuICAgICAgaWYgKHNob3dFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuIC8vIG9ubHkgcmVnaXN0ZXIgZm9jdXMgcmVzdG9yZXIgaWYgbW9kYWwgd2lsbCBhY3R1YWxseSBnZXQgc2hvd25cbiAgICAgICR0YXJnZXQub25lKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICR0aGlzLmlzKCc6dmlzaWJsZScpICYmICR0aGlzLnRyaWdnZXIoJ2ZvY3VzJylcbiAgICAgIH0pXG4gICAgfSlcbiAgICBQbHVnaW4uY2FsbCgkdGFyZ2V0LCBvcHRpb24sIHRoaXMpXG4gIH0pXG5cbn0oalF1ZXJ5KTtcbiIsIi8qIVxuICogSmF2YVNjcmlwdCBDb29raWUgdjIuMi4wXG4gKiBodHRwczovL2dpdGh1Yi5jb20vanMtY29va2llL2pzLWNvb2tpZVxuICpcbiAqIENvcHlyaWdodCAyMDA2LCAyMDE1IEtsYXVzIEhhcnRsICYgRmFnbmVyIEJyYWNrXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuOyhmdW5jdGlvbiAoZmFjdG9yeSkge1xuXHR2YXIgcmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyID0gZmFsc2U7XG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoZmFjdG9yeSk7XG5cdFx0cmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyID0gdHJ1ZTtcblx0fVxuXHRpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdFx0cmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyID0gdHJ1ZTtcblx0fVxuXHRpZiAoIXJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlcikge1xuXHRcdHZhciBPbGRDb29raWVzID0gd2luZG93LkNvb2tpZXM7XG5cdFx0dmFyIGFwaSA9IHdpbmRvdy5Db29raWVzID0gZmFjdG9yeSgpO1xuXHRcdGFwaS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0d2luZG93LkNvb2tpZXMgPSBPbGRDb29raWVzO1xuXHRcdFx0cmV0dXJuIGFwaTtcblx0XHR9O1xuXHR9XG59KGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gZXh0ZW5kICgpIHtcblx0XHR2YXIgaSA9IDA7XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgYXR0cmlidXRlcyA9IGFyZ3VtZW50c1sgaSBdO1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIGF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0cmVzdWx0W2tleV0gPSBhdHRyaWJ1dGVzW2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRmdW5jdGlvbiBpbml0IChjb252ZXJ0ZXIpIHtcblx0XHRmdW5jdGlvbiBhcGkgKGtleSwgdmFsdWUsIGF0dHJpYnV0ZXMpIHtcblx0XHRcdHZhciByZXN1bHQ7XG5cdFx0XHRpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIFdyaXRlXG5cblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRhdHRyaWJ1dGVzID0gZXh0ZW5kKHtcblx0XHRcdFx0XHRwYXRoOiAnLydcblx0XHRcdFx0fSwgYXBpLmRlZmF1bHRzLCBhdHRyaWJ1dGVzKTtcblxuXHRcdFx0XHRpZiAodHlwZW9mIGF0dHJpYnV0ZXMuZXhwaXJlcyA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0XHR2YXIgZXhwaXJlcyA9IG5ldyBEYXRlKCk7XG5cdFx0XHRcdFx0ZXhwaXJlcy5zZXRNaWxsaXNlY29uZHMoZXhwaXJlcy5nZXRNaWxsaXNlY29uZHMoKSArIGF0dHJpYnV0ZXMuZXhwaXJlcyAqIDg2NGUrNSk7XG5cdFx0XHRcdFx0YXR0cmlidXRlcy5leHBpcmVzID0gZXhwaXJlcztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFdlJ3JlIHVzaW5nIFwiZXhwaXJlc1wiIGJlY2F1c2UgXCJtYXgtYWdlXCIgaXMgbm90IHN1cHBvcnRlZCBieSBJRVxuXHRcdFx0XHRhdHRyaWJ1dGVzLmV4cGlyZXMgPSBhdHRyaWJ1dGVzLmV4cGlyZXMgPyBhdHRyaWJ1dGVzLmV4cGlyZXMudG9VVENTdHJpbmcoKSA6ICcnO1xuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0cmVzdWx0ID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuXHRcdFx0XHRcdGlmICgvXltcXHtcXFtdLy50ZXN0KHJlc3VsdCkpIHtcblx0XHRcdFx0XHRcdHZhbHVlID0gcmVzdWx0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZSkge31cblxuXHRcdFx0XHRpZiAoIWNvbnZlcnRlci53cml0ZSkge1xuXHRcdFx0XHRcdHZhbHVlID0gZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyh2YWx1ZSkpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnwzQXwzQ3wzRXwzRHwyRnwzRnw0MHw1Qnw1RHw1RXw2MHw3Qnw3RHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGNvbnZlcnRlci53cml0ZSh2YWx1ZSwga2V5KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGtleSA9IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcoa2V5KSk7XG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC8lKDIzfDI0fDI2fDJCfDVFfDYwfDdDKS9nLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvW1xcKFxcKV0vZywgZXNjYXBlKTtcblxuXHRcdFx0XHR2YXIgc3RyaW5naWZpZWRBdHRyaWJ1dGVzID0gJyc7XG5cblx0XHRcdFx0Zm9yICh2YXIgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdFx0aWYgKCFhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c3RyaW5naWZpZWRBdHRyaWJ1dGVzICs9ICc7ICcgKyBhdHRyaWJ1dGVOYW1lO1xuXHRcdFx0XHRcdGlmIChhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c3RyaW5naWZpZWRBdHRyaWJ1dGVzICs9ICc9JyArIGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIChkb2N1bWVudC5jb29raWUgPSBrZXkgKyAnPScgKyB2YWx1ZSArIHN0cmluZ2lmaWVkQXR0cmlidXRlcyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFJlYWRcblxuXHRcdFx0aWYgKCFrZXkpIHtcblx0XHRcdFx0cmVzdWx0ID0ge307XG5cdFx0XHR9XG5cblx0XHRcdC8vIFRvIHByZXZlbnQgdGhlIGZvciBsb29wIGluIHRoZSBmaXJzdCBwbGFjZSBhc3NpZ24gYW4gZW1wdHkgYXJyYXlcblx0XHRcdC8vIGluIGNhc2UgdGhlcmUgYXJlIG5vIGNvb2tpZXMgYXQgYWxsLiBBbHNvIHByZXZlbnRzIG9kZCByZXN1bHQgd2hlblxuXHRcdFx0Ly8gY2FsbGluZyBcImdldCgpXCJcblx0XHRcdHZhciBjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7ICcpIDogW107XG5cdFx0XHR2YXIgcmRlY29kZSA9IC8oJVswLTlBLVpdezJ9KSsvZztcblx0XHRcdHZhciBpID0gMDtcblxuXHRcdFx0Zm9yICg7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBwYXJ0cyA9IGNvb2tpZXNbaV0uc3BsaXQoJz0nKTtcblx0XHRcdFx0dmFyIGNvb2tpZSA9IHBhcnRzLnNsaWNlKDEpLmpvaW4oJz0nKTtcblxuXHRcdFx0XHRpZiAoIXRoaXMuanNvbiAmJiBjb29raWUuY2hhckF0KDApID09PSAnXCInKSB7XG5cdFx0XHRcdFx0Y29va2llID0gY29va2llLnNsaWNlKDEsIC0xKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0dmFyIG5hbWUgPSBwYXJ0c1swXS5yZXBsYWNlKHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdFx0XHRcdFx0Y29va2llID0gY29udmVydGVyLnJlYWQgP1xuXHRcdFx0XHRcdFx0Y29udmVydGVyLnJlYWQoY29va2llLCBuYW1lKSA6IGNvbnZlcnRlcihjb29raWUsIG5hbWUpIHx8XG5cdFx0XHRcdFx0XHRjb29raWUucmVwbGFjZShyZGVjb2RlLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXG5cdFx0XHRcdFx0aWYgKHRoaXMuanNvbikge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0Y29va2llID0gSlNPTi5wYXJzZShjb29raWUpO1xuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge31cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoa2V5ID09PSBuYW1lKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgPSBjb29raWU7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIWtleSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0W25hbWVdID0gY29va2llO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZSkge31cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cblx0XHRhcGkuc2V0ID0gYXBpO1xuXHRcdGFwaS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRyZXR1cm4gYXBpLmNhbGwoYXBpLCBrZXkpO1xuXHRcdH07XG5cdFx0YXBpLmdldEpTT04gPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gYXBpLmFwcGx5KHtcblx0XHRcdFx0anNvbjogdHJ1ZVxuXHRcdFx0fSwgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcblx0XHR9O1xuXHRcdGFwaS5kZWZhdWx0cyA9IHt9O1xuXG5cdFx0YXBpLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXksIGF0dHJpYnV0ZXMpIHtcblx0XHRcdGFwaShrZXksICcnLCBleHRlbmQoYXR0cmlidXRlcywge1xuXHRcdFx0XHRleHBpcmVzOiAtMVxuXHRcdFx0fSkpO1xuXHRcdH07XG5cblx0XHRhcGkud2l0aENvbnZlcnRlciA9IGluaXQ7XG5cblx0XHRyZXR1cm4gYXBpO1xuXHR9XG5cblx0cmV0dXJuIGluaXQoZnVuY3Rpb24gKCkge30pO1xufSkpO1xuIiwiLy8gfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB8IExheW91dFxuLy8gfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB8XG4vLyB8IFRoaXMgalF1ZXJ5IHNjcmlwdCBpcyB3cml0dGVuIGJ5XG4vLyB8XG4vLyB8IE1vcnRlbiBOaXNzZW5cbi8vIHwgaGplbW1lc2lkZWtvbmdlbi5ka1xuLy8gfFxudmFyIGxheW91dCA9IChmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBwdWIgPSB7fSxcbiAgICAgICAgJGxheW91dF9faGVhZGVyID0gJCgnLmxheW91dF9faGVhZGVyJyksXG4gICAgICAgICRsYXlvdXRfX2RvY3VtZW50ID0gJCgnLmxheW91dF9fZG9jdW1lbnQnKSxcbiAgICAgICAgbGF5b3V0X2NsYXNzZXMgPSB7XG4gICAgICAgICAgICAnbGF5b3V0X193cmFwcGVyJzogJy5sYXlvdXRfX3dyYXBwZXInLFxuICAgICAgICAgICAgJ2xheW91dF9fZHJhd2VyJzogJy5sYXlvdXRfX2RyYXdlcicsXG4gICAgICAgICAgICAnbGF5b3V0X19oZWFkZXInOiAnLmxheW91dF9faGVhZGVyJyxcbiAgICAgICAgICAgICdsYXlvdXRfX29iZnVzY2F0b3InOiAnLmxheW91dF9fb2JmdXNjYXRvcicsXG4gICAgICAgICAgICAnbGF5b3V0X19kb2N1bWVudCc6ICcubGF5b3V0X19kb2N1bWVudCcsXG5cbiAgICAgICAgICAgICd3cmFwcGVyX2lzX3VwZ3JhZGVkJzogJ2lzLXVwZ3JhZGVkJyxcbiAgICAgICAgICAgICd3cmFwcGVyX2hhc19kcmF3ZXInOiAnaGFzLWRyYXdlcicsXG4gICAgICAgICAgICAnd3JhcHBlcl9oYXNfc2Nyb2xsaW5nX2hlYWRlcic6ICdoYXMtc2Nyb2xsaW5nLWhlYWRlcicsXG4gICAgICAgICAgICAnaGVhZGVyX3Njcm9sbCc6ICdsYXlvdXRfX2hlYWRlci0tc2Nyb2xsJyxcbiAgICAgICAgICAgICdoZWFkZXJfaXNfY29tcGFjdCc6ICdpcy1jb21wYWN0JyxcbiAgICAgICAgICAgICdoZWFkZXJfd2F0ZXJmYWxsJzogJ2xheW91dF9faGVhZGVyLS13YXRlcmZhbGwnLFxuICAgICAgICAgICAgJ2RyYXdlcl9pc192aXNpYmxlJzogJ2lzLXZpc2libGUnLFxuICAgICAgICAgICAgJ29iZnVzY2F0b3JfaXNfdmlzaWJsZSc6ICdpcy12aXNpYmxlJ1xuICAgICAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5zdGFudGlhdGVcbiAgICAgKi9cbiAgICBwdWIuaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIHJlZ2lzdGVyRXZlbnRIYW5kbGVycygpO1xuICAgICAgICByZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGJvb3QgZXZlbnQgaGFuZGxlcnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzKCkge1xuXG4gICAgICAgIC8vIEFkZCBjbGFzc2VzIHRvIGVsZW1lbnRzXG4gICAgICAgIGFkZEVsZW1lbnRDbGFzc2VzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWdpc3RlckV2ZW50SGFuZGxlcnMoKSB7XG5cbiAgICAgICAgLy8gVG9nZ2xlIGRyYXdlclxuICAgICAgICAkKCdbZGF0YS10b2dnbGUtZHJhd2VyXScpLmFkZCgkKGxheW91dF9jbGFzc2VzLmxheW91dF9fb2JmdXNjYXRvcikpLm9uKCdjbGljayB0b3VjaHN0YXJ0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICB0b2dnbGVEcmF3ZXIoJGVsZW1lbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBXYXRlcmZhbGwgaGVhZGVyXG4gICAgICAgIGlmICgkbGF5b3V0X19oZWFkZXIuaGFzQ2xhc3MobGF5b3V0X2NsYXNzZXMuaGVhZGVyX3dhdGVyZmFsbCkpIHtcblxuICAgICAgICAgICAgJGxheW91dF9fZG9jdW1lbnQub24oJ3RvdWNobW92ZSBzY3JvbGwnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciAkZG9jdW1lbnQgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgd2F0ZXJmYWxsSGVhZGVyKCRkb2N1bWVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBkcmF3ZXJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0b2dnbGVEcmF3ZXIoJGVsZW1lbnQpIHtcbiAgICAgICAgdmFyICR3cmFwcGVyID0gJGVsZW1lbnQuY2xvc2VzdChsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX3dyYXBwZXIpLFxuICAgICAgICAgICAgJG9iZnVzY2F0b3IgPSAkd3JhcHBlci5jaGlsZHJlbihsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX29iZnVzY2F0b3IpLFxuICAgICAgICAgICAgJGRyYXdlciA9ICR3cmFwcGVyLmNoaWxkcmVuKGxheW91dF9jbGFzc2VzLmxheW91dF9fZHJhd2VyKTtcblxuICAgICAgICAvLyBUb2dnbGUgdmlzaWJsZSBzdGF0ZVxuICAgICAgICAkb2JmdXNjYXRvci50b2dnbGVDbGFzcyhsYXlvdXRfY2xhc3Nlcy5vYmZ1c2NhdG9yX2lzX3Zpc2libGUpO1xuICAgICAgICAkZHJhd2VyLnRvZ2dsZUNsYXNzKGxheW91dF9jbGFzc2VzLmRyYXdlcl9pc192aXNpYmxlKTtcblxuICAgICAgICAvLyBBbHRlciBhcmlhLWhpZGRlbiBzdGF0dXNcbiAgICAgICAgJGRyYXdlci5hdHRyKCdhcmlhLWhpZGRlbicsICgkZHJhd2VyLmhhc0NsYXNzKGxheW91dF9jbGFzc2VzLmRyYXdlcl9pc192aXNpYmxlKSkgPyBmYWxzZSA6IHRydWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGVyZmFsbCBoZWFkZXJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB3YXRlcmZhbGxIZWFkZXIoJGRvY3VtZW50KSB7XG4gICAgICAgIHZhciAkd3JhcHBlciA9ICRkb2N1bWVudC5jbG9zZXN0KGxheW91dF9jbGFzc2VzLmxheW91dF9fd3JhcHBlciksXG4gICAgICAgICAgICAkaGVhZGVyID0gJHdyYXBwZXIuY2hpbGRyZW4obGF5b3V0X2NsYXNzZXMubGF5b3V0X19oZWFkZXIpLFxuICAgICAgICAgICAgZGlzdGFuY2UgPSAkZG9jdW1lbnQuc2Nyb2xsVG9wKCk7XG5cbiAgICAgICAgaWYgKGRpc3RhbmNlID4gMCkge1xuICAgICAgICAgICAgJGhlYWRlci5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy5oZWFkZXJfaXNfY29tcGFjdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAkaGVhZGVyLnJlbW92ZUNsYXNzKGxheW91dF9jbGFzc2VzLmhlYWRlcl9pc19jb21wYWN0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBjbGFzc2VzIHRvIGVsZW1lbnRzLCBiYXNlZCBvbiBhdHRhY2hlZCBjbGFzc2VzXG4gICAgICovXG4gICAgZnVuY3Rpb24gYWRkRWxlbWVudENsYXNzZXMoKSB7XG5cbiAgICAgICAgJChsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX3dyYXBwZXIpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciAkd3JhcHBlciA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgJGhlYWRlciA9ICR3cmFwcGVyLmNoaWxkcmVuKGxheW91dF9jbGFzc2VzLmxheW91dF9faGVhZGVyKSxcbiAgICAgICAgICAgICAgICAkZHJhd2VyID0gJHdyYXBwZXIuY2hpbGRyZW4obGF5b3V0X2NsYXNzZXMubGF5b3V0X19kcmF3ZXIpO1xuXG4gICAgICAgICAgICAvLyBTY3JvbGwgaGVhZGVyXG4gICAgICAgICAgICBpZiAoJGhlYWRlci5oYXNDbGFzcyhsYXlvdXRfY2xhc3Nlcy5oZWFkZXJfc2Nyb2xsKSkge1xuICAgICAgICAgICAgICAgICR3cmFwcGVyLmFkZENsYXNzKGxheW91dF9jbGFzc2VzLndyYXBwZXJfaGFzX3Njcm9sbGluZ19oZWFkZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEcmF3ZXJcbiAgICAgICAgICAgIGlmICgkZHJhd2VyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAkd3JhcHBlci5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy53cmFwcGVyX2hhc19kcmF3ZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVcGdyYWRlZFxuICAgICAgICAgICAgaWYgKCR3cmFwcGVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAkd3JhcHBlci5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy53cmFwcGVyX2lzX3VwZ3JhZGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHB1Yjtcbn0pKGpRdWVyeSk7XG4iLCIvLyBEb2N1bWVudCByZWFkeVxuKGZ1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBFbmFibGUgbGF5b3V0XG4gIGxheW91dC5pbml0KCk7XG5cbiAgLy8gTm90aWZ5XG4gIHZhciAkbm90aWZpY2F0aW9ucyA9ICQoJy5ub3RpZnknKTtcbiAgaWYgKCRub3RpZmljYXRpb25zLmxlbmd0aCkge1xuXG4gICAgJG5vdGlmaWNhdGlvbnMuZWFjaChmdW5jdGlvbihpbmRleCwgdmFsKSB7XG4gICAgICB2YXIgJGRvY3VtZW50ID0gJCgnLmxheW91dF9fZG9jdW1lbnQnKSxcbiAgICAgICAgICAkcmVnaW9uID0gJCgnLnJlZ2lvbi1ub3RpZnknKSxcbiAgICAgICAgICAkZWxlbWVudCA9ICQodGhpcyksXG4gICAgICAgICAgY29va2llX2lkID0gJ25vdGlmeV9pZF8nICsgJGVsZW1lbnQuYXR0cignaWQnKSxcbiAgICAgICAgICAkY2xvc2UgPSAkZWxlbWVudC5maW5kKCcubm90aWZ5X19jbG9zZScpO1xuXG4gICAgICAvLyBGbGV4IG1hZ2ljIC0gZml4aW5nIGRpc3BsYXk6IGJsb2NrIG9uIGZhZGVJbiAoc2VlOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yODkwNDY5OC9ob3ctZmFkZS1pbi1hLWZsZXgtYm94KVxuICAgICAgJGVsZW1lbnQuY3NzKCdkaXNwbGF5JywgJ2ZsZXgnKS5oaWRlKCk7XG5cbiAgICAgIC8vIE5vIGNvb2tpZSBoYXMgYmVlbiBzZXQgeWV0XG4gICAgICBpZiAoISBDb29raWVzLmdldChjb29raWVfaWQpKSB7XG5cbiAgICAgICAgLy8gRmFkZSB0aGUgZWxlbWVudCBpblxuICAgICAgICAkZWxlbWVudFxuICAgICAgICAgICAgLmRlbGF5KDIwMDApXG4gICAgICAgICAgICAuZmFkZUluKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gJHJlZ2lvbi5vdXRlckhlaWdodCh0cnVlKTtcblxuICAgICAgICAgICAgICAkZG9jdW1lbnQuY3NzKCdwYWRkaW5nLWJvdHRvbScsIGhlaWdodCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2xvc2VkXG4gICAgICAkY2xvc2Uub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgJGVsZW1lbnQuZmFkZU91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAkZG9jdW1lbnQuY3NzKCdwYWRkaW5nLWJvdHRvbScsIDApO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBTZXQgYSBjb29raWUsIHRvIHN0b3AgdGhpcyBub3RpZmljYXRpb24gZnJvbSBiZWluZyBkaXNwbGF5ZWQgYWdhaW5cbiAgICAgICAgQ29va2llcy5zZXQoY29va2llX2lkLCB0cnVlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgJChcIiN0b2dnbGVfbW9iaWxlX21lbnVcIikuY2xpY2soZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgJCgnI21haW4tbWVudScpLnRvZ2dsZUNsYXNzKCdtb2JpbGUtbWVudS1vcGVuJyk7XG4gICAgJCgnLmxheW91dF9fZG9jdW1lbnQnKS50b2dnbGVDbGFzcygnbW9iaWxlLW1lbnUtb3BlbicpO1xuICB9KVxuXG4gIC8vU2hvdyBzZWFyY2ggZm9ybSBibG9ja1xuICAkKFwiLnNlYXJjaC1idXR0b25cIikuY2xpY2soZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKCQoXCIjc2VhcmNoLWZvcm0tcG9wb3ZlclwiKS5oYXNDbGFzcyhcImhpZGRlblwiKSkge1xuICAgICAgJChcIiNzZWFyY2gtZm9ybS1wb3BvdmVyXCIpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoXCIuZm9ybS1jb250cm9sXCIpLmZvY3VzKCk7XG4gICAgfVxuICB9KTtcblxuICAvL0hpZGUgc2VhcmNoIGZvcm0gYmxvY2tcbiAgJChkb2N1bWVudCkuY2xpY2soZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKCEkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnI3NlYXJjaC1mb3JtLXBvcG92ZXInKS5sZW5ndGggJiYgISQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcuc2VhcmNoLWJ1dHRvbicpLmxlbmd0aCkge1xuICAgICAgaWYgKCEkKFwiI3NlYXJjaC1mb3JtLXBvcG92ZXJcIikuaGFzQ2xhc3MoXCJoaWRkZW5cIikpIHtcbiAgICAgICAgJChcIiNzZWFyY2gtZm9ybS1wb3BvdmVyXCIpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8vSW1wcm92aW5nIHVzYWJpbGl0eSBmb3IgbWVudWRyb3Bkb3ducyBmb3IgbW9iaWxlIGRldmljZXNcbiAgaWYgKCEhKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykpIHsvL2NoZWNrIGZvciB0b3VjaCBkZXZpY2VcbiAgICAkKCdsaS5kcm9wZG93bi5sYXlvdXQtbmF2aWdhdGlvbl9fZHJvcGRvd24nKS5maW5kKCc+IGEnKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgICAgaWYgKCQodGhpcykucGFyZW50KCkuaGFzQ2xhc3MoXCJleHBhbmRlZFwiKSkge1xuICAgICAgICAvLyQodGhpcykucGFyZW50KCkucmVtb3ZlQ2xhc3MoXCJleHBhbmRlZFwiKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQodGhpcykucGFyZW50KCkuYWRkQ2xhc3MoXCJleHBhbmRlZFwiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBlbHNlIHsvL2tlZXBpbmcgaXQgY29tcGF0aWJsZSB3aXRoIGRlc2t0b3AgZGV2aWNlc1xuICAgICQoJ2xpLmRyb3Bkb3duLmxheW91dC1uYXZpZ2F0aW9uX19kcm9wZG93bicpLmhvdmVyKFxuICAgICAgICBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJleHBhbmRlZFwiKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZXhwYW5kZWRcIik7XG4gICAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgJCgnLm1vZGFsLWNsb3NlLS10aGlzLW1vZGFsLW9ubHknKS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciAkZWxlbWVudCA9ICQodGhpcyksXG4gICAgICAgICRtb2RhbCA9ICRlbGVtZW50LnBhcmVudHMoJy5tb2RhbCcpLmZpcnN0KCk7XG5cbiAgICAkbW9kYWwubW9kYWwoJ2hpZGUnKTtcbiAgfSk7XG59KShqUXVlcnkpO1xuIl19
