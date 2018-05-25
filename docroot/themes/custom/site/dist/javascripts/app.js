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

/*
 * Slinky
 * A light-weight, responsive, mobile-like navigation menu plugin for jQuery
 * Built by Ali Zahid <ali.zahid@live.com>
 * Published under the MIT license
 */

;(function ($) {
    var lastClick;

    $.fn.slinky = function (options) {
        var settings = $.extend({
            label: 'Back',
            title: false,
            speed: 300,
            resize: true,
            activeClass: 'active',
            headerClass: 'header',
            headingTag: '<h2>',
            backFirst: false
        }, options);

        var menu = $(this),
            root = menu.children().first();

        menu.addClass('slinky-menu');

        var move = function move(depth, callback) {
            var left = Math.round(parseInt(root.get(0).style.left)) || 0;

            root.css('left', left - depth * 100 + '%');

            if (typeof callback === 'function') {
                setTimeout(callback, settings.speed);
            }
        };

        var resize = function resize(content) {
            menu.height(content.outerHeight());
        };

        var transition = function transition(speed) {
            menu.css('transition-duration', speed + 'ms');
            root.css('transition-duration', speed + 'ms');
        };

        transition(settings.speed);

        $('a + ul', menu).prev().addClass('next');

        $('li > ul', menu).prepend('<li class="' + settings.headerClass + '">');

        if (settings.title === true) {
            $('li > ul', menu).each(function () {
                var $link = $(this).parent().find('a').first(),
                    label = $link.text(),
                    title = $('<a>').addClass('title').text(label).attr('href', $link.attr('href'));

                $('> .' + settings.headerClass, this).append(title);
            });
        }

        if (!settings.title && settings.label === true) {
            $('li > ul', menu).each(function () {
                var label = $(this).parent().find('a').first().text(),
                    backLink = $('<a>').text(label).prop('href', '#').addClass('back');

                if (settings.backFirst) {
                    $('> .' + settings.headerClass, this).prepend(backLink);
                } else {
                    $('> .' + settings.headerClass, this).append(backLink);
                }
            });
        } else {
            var backLink = $('<a>').text(settings.label).prop('href', '#').addClass('back');

            if (settings.backFirst) {
                $('.' + settings.headerClass, menu).prepend(backLink);
            } else {
                $('.' + settings.headerClass, menu).append(backLink);
            }
        }

        $('a', menu).on('click', function (e) {
            if (lastClick + settings.speed > Date.now()) {
                return false;
            }

            lastClick = Date.now();

            var a = $(this);

            if (a.hasClass('next') || a.hasClass('back')) {
                e.preventDefault();
            }

            if (a.hasClass('next')) {
                menu.find('.' + settings.activeClass).removeClass(settings.activeClass);

                a.next().show().addClass(settings.activeClass);

                move(1);

                if (settings.resize) {
                    resize(a.next());
                }
            } else if (a.hasClass('back')) {
                move(-1, function () {
                    menu.find('.' + settings.activeClass).removeClass(settings.activeClass);

                    a.parent().parent().hide().parentsUntil(menu, 'ul').first().addClass(settings.activeClass);
                });

                if (settings.resize) {
                    resize(a.parent().parent().parentsUntil(menu, 'ul'));
                }
            }
        });

        this.jump = function (to, animate) {
            to = $(to);

            var active = menu.find('.' + settings.activeClass);

            if (active.length > 0) {
                active = active.parentsUntil(menu, 'ul').length;
            } else {
                active = 0;
            }

            menu.find('ul').removeClass(settings.activeClass).hide();

            var menus = to.parentsUntil(menu, 'ul');

            menus.show();
            to.show().addClass(settings.activeClass);

            if (animate === false) {
                transition(0);
            }

            move(menus.length - active);

            if (settings.resize) {
                resize(to);
            }

            if (animate === false) {
                transition(settings.speed);
            }
        };

        this.home = function (animate) {
            if (animate === false) {
                transition(0);
            }

            var active = menu.find('.' + settings.activeClass),
                count = active.parentsUntil(menu, 'li').length;

            if (count > 0) {
                move(-count, function () {
                    active.removeClass(settings.activeClass);
                });

                if (settings.resize) {
                    resize($(active.parentsUntil(menu, 'li').get(count - 1)).parent());
                }
            }

            if (animate === false) {
                transition(settings.speed);
            }
        };

        this.destroy = function () {
            $('.' + settings.headerClass, menu).remove();
            $('a', menu).removeClass('next').off('click');

            menu.removeClass('slinky-menu').css('transition-duration', '');
            root.css('transition-duration', '');
        };

        var active = menu.find('.' + settings.activeClass);

        if (active.length > 0) {
            active.removeClass(settings.activeClass);

            this.jump(active, false);
        }

        return this;
    };
})(jQuery);
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

  // Flatten structure of modals, so they are not nested.
  // Ex. .modal > .modal > .modal

  var $modals = $('.modal');
  $('body').append($modals);

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhYi5qcyIsImNvbGxhcHNlLmpzIiwidHJhbnNpdGlvbi5qcyIsInRvb2x0aXAuanMiLCJwb3BvdmVyLmpzIiwibW9kYWwuanMiLCJqcy5jb29raWUuanMiLCJjdXN0b20tc2xpbmt5LmpzIiwibGF5b3V0LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIiQiLCJUYWIiLCJlbGVtZW50IiwiVkVSU0lPTiIsIlRSQU5TSVRJT05fRFVSQVRJT04iLCJwcm90b3R5cGUiLCJzaG93IiwiJHRoaXMiLCIkdWwiLCJjbG9zZXN0Iiwic2VsZWN0b3IiLCJkYXRhIiwiYXR0ciIsInJlcGxhY2UiLCJwYXJlbnQiLCJoYXNDbGFzcyIsIiRwcmV2aW91cyIsImZpbmQiLCJoaWRlRXZlbnQiLCJFdmVudCIsInJlbGF0ZWRUYXJnZXQiLCJzaG93RXZlbnQiLCJ0cmlnZ2VyIiwiaXNEZWZhdWx0UHJldmVudGVkIiwiJHRhcmdldCIsImFjdGl2YXRlIiwidHlwZSIsImNvbnRhaW5lciIsImNhbGxiYWNrIiwiJGFjdGl2ZSIsInRyYW5zaXRpb24iLCJzdXBwb3J0IiwibGVuZ3RoIiwibmV4dCIsInJlbW92ZUNsYXNzIiwiZW5kIiwiYWRkQ2xhc3MiLCJvZmZzZXRXaWR0aCIsIm9uZSIsImVtdWxhdGVUcmFuc2l0aW9uRW5kIiwiUGx1Z2luIiwib3B0aW9uIiwiZWFjaCIsIm9sZCIsImZuIiwidGFiIiwiQ29uc3RydWN0b3IiLCJub0NvbmZsaWN0IiwiY2xpY2tIYW5kbGVyIiwiZSIsInByZXZlbnREZWZhdWx0IiwiY2FsbCIsImRvY3VtZW50Iiwib24iLCJqUXVlcnkiLCJDb2xsYXBzZSIsIm9wdGlvbnMiLCIkZWxlbWVudCIsImV4dGVuZCIsIkRFRkFVTFRTIiwiJHRyaWdnZXIiLCJpZCIsInRyYW5zaXRpb25pbmciLCIkcGFyZW50IiwiZ2V0UGFyZW50IiwiYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzIiwidG9nZ2xlIiwiZGltZW5zaW9uIiwiaGFzV2lkdGgiLCJhY3RpdmVzRGF0YSIsImFjdGl2ZXMiLCJjaGlsZHJlbiIsInN0YXJ0RXZlbnQiLCJjb21wbGV0ZSIsInNjcm9sbFNpemUiLCJjYW1lbENhc2UiLCJqb2luIiwicHJveHkiLCJoaWRlIiwib2Zmc2V0SGVpZ2h0IiwiaSIsImdldFRhcmdldEZyb21UcmlnZ2VyIiwiaXNPcGVuIiwidG9nZ2xlQ2xhc3MiLCJocmVmIiwidGFyZ2V0IiwidGVzdCIsImNvbGxhcHNlIiwidHJhbnNpdGlvbkVuZCIsImVsIiwiY3JlYXRlRWxlbWVudCIsInRyYW5zRW5kRXZlbnROYW1lcyIsIldlYmtpdFRyYW5zaXRpb24iLCJNb3pUcmFuc2l0aW9uIiwiT1RyYW5zaXRpb24iLCJuYW1lIiwic3R5bGUiLCJ1bmRlZmluZWQiLCJkdXJhdGlvbiIsImNhbGxlZCIsIiRlbCIsInNldFRpbWVvdXQiLCJldmVudCIsInNwZWNpYWwiLCJic1RyYW5zaXRpb25FbmQiLCJiaW5kVHlwZSIsImRlbGVnYXRlVHlwZSIsImhhbmRsZSIsImlzIiwiaGFuZGxlT2JqIiwiaGFuZGxlciIsImFwcGx5IiwiYXJndW1lbnRzIiwiVG9vbHRpcCIsImVuYWJsZWQiLCJ0aW1lb3V0IiwiaG92ZXJTdGF0ZSIsImluU3RhdGUiLCJpbml0IiwiYW5pbWF0aW9uIiwicGxhY2VtZW50IiwidGVtcGxhdGUiLCJ0aXRsZSIsImRlbGF5IiwiaHRtbCIsInZpZXdwb3J0IiwicGFkZGluZyIsImdldE9wdGlvbnMiLCIkdmlld3BvcnQiLCJpc0Z1bmN0aW9uIiwiY2xpY2siLCJob3ZlciIsImZvY3VzIiwiY29uc3RydWN0b3IiLCJFcnJvciIsInRyaWdnZXJzIiwic3BsaXQiLCJldmVudEluIiwiZXZlbnRPdXQiLCJlbnRlciIsImxlYXZlIiwiX29wdGlvbnMiLCJmaXhUaXRsZSIsImdldERlZmF1bHRzIiwiZ2V0RGVsZWdhdGVPcHRpb25zIiwiZGVmYXVsdHMiLCJrZXkiLCJ2YWx1ZSIsIm9iaiIsInNlbGYiLCJjdXJyZW50VGFyZ2V0IiwidGlwIiwiY2xlYXJUaW1lb3V0IiwiaXNJblN0YXRlVHJ1ZSIsImhhc0NvbnRlbnQiLCJpbkRvbSIsImNvbnRhaW5zIiwib3duZXJEb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsInRoYXQiLCIkdGlwIiwidGlwSWQiLCJnZXRVSUQiLCJzZXRDb250ZW50IiwiYXV0b1Rva2VuIiwiYXV0b1BsYWNlIiwiZGV0YWNoIiwiY3NzIiwidG9wIiwibGVmdCIsImRpc3BsYXkiLCJhcHBlbmRUbyIsImluc2VydEFmdGVyIiwicG9zIiwiZ2V0UG9zaXRpb24iLCJhY3R1YWxXaWR0aCIsImFjdHVhbEhlaWdodCIsIm9yZ1BsYWNlbWVudCIsInZpZXdwb3J0RGltIiwiYm90dG9tIiwicmlnaHQiLCJ3aWR0aCIsImNhbGN1bGF0ZWRPZmZzZXQiLCJnZXRDYWxjdWxhdGVkT2Zmc2V0IiwiYXBwbHlQbGFjZW1lbnQiLCJwcmV2SG92ZXJTdGF0ZSIsIm9mZnNldCIsImhlaWdodCIsIm1hcmdpblRvcCIsInBhcnNlSW50IiwibWFyZ2luTGVmdCIsImlzTmFOIiwic2V0T2Zmc2V0IiwidXNpbmciLCJwcm9wcyIsIk1hdGgiLCJyb3VuZCIsImRlbHRhIiwiZ2V0Vmlld3BvcnRBZGp1c3RlZERlbHRhIiwiaXNWZXJ0aWNhbCIsImFycm93RGVsdGEiLCJhcnJvd09mZnNldFBvc2l0aW9uIiwicmVwbGFjZUFycm93IiwiYXJyb3ciLCJnZXRUaXRsZSIsInJlbW92ZUF0dHIiLCIkZSIsImlzQm9keSIsInRhZ05hbWUiLCJlbFJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJpc1N2ZyIsIndpbmRvdyIsIlNWR0VsZW1lbnQiLCJlbE9mZnNldCIsInNjcm9sbCIsInNjcm9sbFRvcCIsImJvZHkiLCJvdXRlckRpbXMiLCJ2aWV3cG9ydFBhZGRpbmciLCJ2aWV3cG9ydERpbWVuc2lvbnMiLCJ0b3BFZGdlT2Zmc2V0IiwiYm90dG9tRWRnZU9mZnNldCIsImxlZnRFZGdlT2Zmc2V0IiwicmlnaHRFZGdlT2Zmc2V0IiwibyIsInByZWZpeCIsInJhbmRvbSIsImdldEVsZW1lbnRCeUlkIiwiJGFycm93IiwiZW5hYmxlIiwiZGlzYWJsZSIsInRvZ2dsZUVuYWJsZWQiLCJkZXN0cm95Iiwib2ZmIiwicmVtb3ZlRGF0YSIsInRvb2x0aXAiLCJQb3BvdmVyIiwiY29udGVudCIsImdldENvbnRlbnQiLCJwb3BvdmVyIiwiTW9kYWwiLCIkYm9keSIsIiRkaWFsb2ciLCIkYmFja2Ryb3AiLCJpc1Nob3duIiwib3JpZ2luYWxCb2R5UGFkIiwic2Nyb2xsYmFyV2lkdGgiLCJpZ25vcmVCYWNrZHJvcENsaWNrIiwicmVtb3RlIiwibG9hZCIsIkJBQ0tEUk9QX1RSQU5TSVRJT05fRFVSQVRJT04iLCJiYWNrZHJvcCIsImtleWJvYXJkIiwiX3JlbGF0ZWRUYXJnZXQiLCJjaGVja1Njcm9sbGJhciIsInNldFNjcm9sbGJhciIsImVzY2FwZSIsInJlc2l6ZSIsImFkanVzdERpYWxvZyIsImVuZm9yY2VGb2N1cyIsImhpZGVNb2RhbCIsImhhcyIsIndoaWNoIiwiaGFuZGxlVXBkYXRlIiwicmVzZXRBZGp1c3RtZW50cyIsInJlc2V0U2Nyb2xsYmFyIiwicmVtb3ZlQmFja2Ryb3AiLCJyZW1vdmUiLCJhbmltYXRlIiwiZG9BbmltYXRlIiwiY2FsbGJhY2tSZW1vdmUiLCJtb2RhbElzT3ZlcmZsb3dpbmciLCJzY3JvbGxIZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJwYWRkaW5nTGVmdCIsImJvZHlJc092ZXJmbG93aW5nIiwicGFkZGluZ1JpZ2h0IiwiZnVsbFdpbmRvd1dpZHRoIiwiaW5uZXJXaWR0aCIsImRvY3VtZW50RWxlbWVudFJlY3QiLCJhYnMiLCJjbGllbnRXaWR0aCIsIm1lYXN1cmVTY3JvbGxiYXIiLCJib2R5UGFkIiwic2Nyb2xsRGl2IiwiY2xhc3NOYW1lIiwiYXBwZW5kIiwicmVtb3ZlQ2hpbGQiLCJtb2RhbCIsImZhY3RvcnkiLCJyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIiLCJkZWZpbmUiLCJhbWQiLCJleHBvcnRzIiwibW9kdWxlIiwiT2xkQ29va2llcyIsIkNvb2tpZXMiLCJhcGkiLCJyZXN1bHQiLCJhdHRyaWJ1dGVzIiwiY29udmVydGVyIiwicGF0aCIsImV4cGlyZXMiLCJEYXRlIiwic2V0TWlsbGlzZWNvbmRzIiwiZ2V0TWlsbGlzZWNvbmRzIiwidG9VVENTdHJpbmciLCJKU09OIiwic3RyaW5naWZ5Iiwid3JpdGUiLCJlbmNvZGVVUklDb21wb25lbnQiLCJTdHJpbmciLCJkZWNvZGVVUklDb21wb25lbnQiLCJzdHJpbmdpZmllZEF0dHJpYnV0ZXMiLCJhdHRyaWJ1dGVOYW1lIiwiY29va2llIiwiY29va2llcyIsInJkZWNvZGUiLCJwYXJ0cyIsInNsaWNlIiwianNvbiIsImNoYXJBdCIsInJlYWQiLCJwYXJzZSIsInNldCIsImdldCIsImdldEpTT04iLCJ3aXRoQ29udmVydGVyIiwibGFzdENsaWNrIiwic2xpbmt5Iiwic2V0dGluZ3MiLCJsYWJlbCIsInNwZWVkIiwiYWN0aXZlQ2xhc3MiLCJoZWFkZXJDbGFzcyIsImhlYWRpbmdUYWciLCJiYWNrRmlyc3QiLCJtZW51Iiwicm9vdCIsImZpcnN0IiwibW92ZSIsImRlcHRoIiwib3V0ZXJIZWlnaHQiLCJwcmV2IiwicHJlcGVuZCIsIiRsaW5rIiwidGV4dCIsImJhY2tMaW5rIiwicHJvcCIsIm5vdyIsImEiLCJwYXJlbnRzVW50aWwiLCJqdW1wIiwidG8iLCJhY3RpdmUiLCJtZW51cyIsImhvbWUiLCJjb3VudCIsImxheW91dCIsInB1YiIsIiRsYXlvdXRfX2hlYWRlciIsIiRsYXlvdXRfX2RvY3VtZW50IiwibGF5b3V0X2NsYXNzZXMiLCJyZWdpc3RlckV2ZW50SGFuZGxlcnMiLCJyZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzIiwiYWRkRWxlbWVudENsYXNzZXMiLCJhZGQiLCJsYXlvdXRfX29iZnVzY2F0b3IiLCJ0b2dnbGVEcmF3ZXIiLCJoZWFkZXJfd2F0ZXJmYWxsIiwiJGRvY3VtZW50Iiwid2F0ZXJmYWxsSGVhZGVyIiwiJHdyYXBwZXIiLCJsYXlvdXRfX3dyYXBwZXIiLCIkb2JmdXNjYXRvciIsIiRkcmF3ZXIiLCJsYXlvdXRfX2RyYXdlciIsIm9iZnVzY2F0b3JfaXNfdmlzaWJsZSIsImRyYXdlcl9pc192aXNpYmxlIiwiJGhlYWRlciIsImxheW91dF9faGVhZGVyIiwiZGlzdGFuY2UiLCJoZWFkZXJfaXNfY29tcGFjdCIsImluZGV4IiwiaGVhZGVyX3Njcm9sbCIsIndyYXBwZXJfaGFzX3Njcm9sbGluZ19oZWFkZXIiLCJ3cmFwcGVyX2hhc19kcmF3ZXIiLCJ3cmFwcGVyX2lzX3VwZ3JhZGVkIiwiJG1vZGFscyIsIiRub3RpZmljYXRpb25zIiwidmFsIiwiJHJlZ2lvbiIsImNvb2tpZV9pZCIsIiRjbG9zZSIsImZhZGVJbiIsImZhZGVPdXQiLCJwYXJlbnRzIiwiJGFsbF90b2dnbGVfYnV0dG9ucyIsIiR0b2dnbGVfYnV0dG9uIiwiJGFsbF9jb250ZW50IiwiekluZGV4Iiwibm90Il0sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7OztBQVNBLENBQUMsVUFBVUEsQ0FBVixFQUFhO0FBQ1o7O0FBRUE7QUFDQTs7QUFFQSxNQUFJQyxNQUFNLFNBQU5BLEdBQU0sQ0FBVUMsT0FBVixFQUFtQjtBQUMzQjtBQUNBLFNBQUtBLE9BQUwsR0FBZUYsRUFBRUUsT0FBRixDQUFmO0FBQ0E7QUFDRCxHQUpEOztBQU1BRCxNQUFJRSxPQUFKLEdBQWMsT0FBZDs7QUFFQUYsTUFBSUcsbUJBQUosR0FBMEIsR0FBMUI7O0FBRUFILE1BQUlJLFNBQUosQ0FBY0MsSUFBZCxHQUFxQixZQUFZO0FBQy9CLFFBQUlDLFFBQVcsS0FBS0wsT0FBcEI7QUFDQSxRQUFJTSxNQUFXRCxNQUFNRSxPQUFOLENBQWMsd0JBQWQsQ0FBZjtBQUNBLFFBQUlDLFdBQVdILE1BQU1JLElBQU4sQ0FBVyxRQUFYLENBQWY7O0FBRUEsUUFBSSxDQUFDRCxRQUFMLEVBQWU7QUFDYkEsaUJBQVdILE1BQU1LLElBQU4sQ0FBVyxNQUFYLENBQVg7QUFDQUYsaUJBQVdBLFlBQVlBLFNBQVNHLE9BQVQsQ0FBaUIsZ0JBQWpCLEVBQW1DLEVBQW5DLENBQXZCLENBRmEs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LHVCQUFZO0FBQzNCLFVBQUk0VixTQUFTLE9BQVEsS0FBS2paLEVBQUUsZ0JBQUYsRUFBb0JnQyxNQUE5QztBQUNBaEMsUUFBRSxJQUFGLEVBQVF1SyxHQUFSLENBQVksU0FBWixFQUF1QjBPLE1BQXZCO0FBQ0E1UyxpQkFBVyxZQUFZO0FBQ3JCckcsVUFBRSxpQkFBRixFQUFxQmtaLEdBQXJCLENBQXlCLGNBQXpCLEVBQXlDM08sR0FBekMsQ0FBNkMsU0FBN0MsRUFBd0QwTyxTQUFTLENBQWpFLEVBQW9FN1csUUFBcEUsQ0FBNkUsYUFBN0U7QUFDRCxPQUZELEVBRUcsQ0FGSDtBQUdELEtBUFk7QUFRYix1QkFBbUIseUJBQVk7QUFDN0IsVUFBSXBDLEVBQUUsZ0JBQUYsRUFBb0JnQyxNQUFwQixHQUE2QixDQUFqQyxFQUFvQztBQUNsQztBQUNBO0FBQ0FxRSxtQkFBVyxZQUFZO0FBQ3JCckcsWUFBRW9ELFNBQVNxSyxJQUFYLEVBQWlCckwsUUFBakIsQ0FBMEIsWUFBMUI7QUFDRCxTQUZELEVBRUcsQ0FGSDtBQUdEO0FBQ0Y7QUFoQlksR0FBZixFQWlCRyxRQWpCSDtBQW1CRCxDQXhKRCxFQXdKR2tCLE1BeEpIIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiB0YWIuanMgdjMuMy43XG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyN0YWJzXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbitmdW5jdGlvbiAoJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gVEFCIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgVGFiID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAvLyBqc2NzOmRpc2FibGUgcmVxdWlyZURvbGxhckJlZm9yZWpRdWVyeUFzc2lnbm1lbnRcbiAgICB0aGlzLmVsZW1lbnQgPSAkKGVsZW1lbnQpXG4gICAgLy8ganNjczplbmFibGUgcmVxdWlyZURvbGxhckJlZm9yZWpRdWVyeUFzc2lnbm1lbnRcbiAgfVxuXG4gIFRhYi5WRVJTSU9OID0gJzMuMy43J1xuXG4gIFRhYi5UUkFOU0lUSU9OX0RVUkFUSU9OID0gMTUwXG5cbiAgVGFiLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciAkdGhpcyAgICA9IHRoaXMuZWxlbWVudFxuICAgIHZhciAkdWwgICAgICA9ICR0aGlzLmNsb3Nlc3QoJ3VsOm5vdCguZHJvcGRvd24tbWVudSknKVxuICAgIHZhciBzZWxlY3RvciA9ICR0aGlzLmRhdGEoJ3RhcmdldCcpXG5cbiAgICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgICBzZWxlY3RvciA9ICR0aGlzLmF0dHIoJ2hyZWYnKVxuICAgICAgc2VsZWN0b3IgPSBzZWxlY3RvciAmJiBzZWxlY3Rvci5yZXBsYWNlKC8uKig/PSNbXlxcc10qJCkvLCAnJykgLy8gc3RyaXAgZm9yIGllN1xuICAgIH1cblxuICAgIGlmICgkdGhpcy5wYXJlbnQoJ2xpJykuaGFzQ2xhc3MoJ2FjdGl2ZScpKSByZXR1cm5cblxuICAgIHZhciAkcHJldmlvdXMgPSAkdWwuZmluZCgnLmFjdGl2ZTpsYXN0IGEnKVxuICAgIHZhciBoaWRlRXZlbnQgPSAkLkV2ZW50KCdoaWRlLmJzLnRhYicsIHtcbiAgICAgIHJlbGF0ZWRUYXJnZXQ6ICR0aGlzWzBdXG4gICAgfSlcbiAgICB2YXIgc2hvd0V2ZW50ID0gJC5FdmVudCgnc2hvdy5icy50YWInLCB7XG4gICAgICByZWxhdGVkVGFyZ2V0OiAkcHJldmlvdXNbMF1cbiAgICB9KVxuXG4gICAgJHByZXZpb3VzLnRyaWdnZXIoaGlkZUV2ZW50KVxuICAgICR0aGlzLnRyaWdnZXIoc2hvd0V2ZW50KVxuXG4gICAgaWYgKHNob3dFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSB8fCBoaWRlRXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxuXG4gICAgdmFyICR0YXJnZXQgPSAkKHNlbGVjdG9yKVxuXG4gICAgdGhpcy5hY3RpdmF0ZSgkdGhpcy5jbG9zZXN0KCdsaScpLCAkdWwpXG4gICAgdGhpcy5hY3RpdmF0ZSgkdGFyZ2V0LCAkdGFyZ2V0LnBhcmVudCgpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAkcHJldmlvdXMudHJpZ2dlcih7XG4gICAgICAgIHR5cGU6ICdoaWRkZW4uYnMudGFiJyxcbiAgICAgICAgcmVsYXRlZFRhcmdldDogJHRoaXNbMF1cbiAgICAgIH0pXG4gICAgICAkdGhpcy50cmlnZ2VyKHtcbiAgICAgICAgdHlwZTogJ3Nob3duLmJzLnRhYicsXG4gICAgICAgIHJlbGF0ZWRUYXJnZXQ6ICRwcmV2aW91c1swXVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgVGFiLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBjb250YWluZXIsIGNhbGxiYWNrKSB7XG4gICAgdmFyICRhY3RpdmUgICAgPSBjb250YWluZXIuZmluZCgnPiAuYWN0aXZlJylcbiAgICB2YXIgdHJhbnNpdGlvbiA9IGNhbGxiYWNrXG4gICAgICAmJiAkLnN1cHBvcnQudHJhbnNpdGlvblxuICAgICAgJiYgKCRhY3RpdmUubGVuZ3RoICYmICRhY3RpdmUuaGFzQ2xhc3MoJ2ZhZGUnKSB8fCAhIWNvbnRhaW5lci5maW5kKCc+IC5mYWRlJykubGVuZ3RoKVxuXG4gICAgZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICRhY3RpdmVcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICAuZmluZCgnPiAuZHJvcGRvd24tbWVudSA+IC5hY3RpdmUnKVxuICAgICAgICAgIC5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAgICAgLmVuZCgpXG4gICAgICAgIC5maW5kKCdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nKVxuICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpXG5cbiAgICAgIGVsZW1lbnRcbiAgICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgICAgICAuZmluZCgnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJylcbiAgICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXG5cbiAgICAgIGlmICh0cmFuc2l0aW9uKSB7XG4gICAgICAgIGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGggLy8gcmVmbG93IGZvciB0cmFuc2l0aW9uXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2luJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2ZhZGUnKVxuICAgICAgfVxuXG4gICAgICBpZiAoZWxlbWVudC5wYXJlbnQoJy5kcm9wZG93bi1tZW51JykubGVuZ3RoKSB7XG4gICAgICAgIGVsZW1lbnRcbiAgICAgICAgICAuY2xvc2VzdCgnbGkuZHJvcGRvd24nKVxuICAgICAgICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgICAgICAgIC5lbmQoKVxuICAgICAgICAgIC5maW5kKCdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nKVxuICAgICAgICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxuICAgICAgfVxuXG4gICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpXG4gICAgfVxuXG4gICAgJGFjdGl2ZS5sZW5ndGggJiYgdHJhbnNpdGlvbiA/XG4gICAgICAkYWN0aXZlXG4gICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIG5leHQpXG4gICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChUYWIuVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgbmV4dCgpXG5cbiAgICAkYWN0aXZlLnJlbW92ZUNsYXNzKCdpbicpXG4gIH1cblxuXG4gIC8vIFRBQiBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG4gICAgICB2YXIgZGF0YSAgPSAkdGhpcy5kYXRhKCdicy50YWInKVxuXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLnRhYicsIChkYXRhID0gbmV3IFRhYih0aGlzKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgdmFyIG9sZCA9ICQuZm4udGFiXG5cbiAgJC5mbi50YWIgICAgICAgICAgICAgPSBQbHVnaW5cbiAgJC5mbi50YWIuQ29uc3RydWN0b3IgPSBUYWJcblxuXG4gIC8vIFRBQiBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT1cblxuICAkLmZuLnRhYi5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4udGFiID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAgLy8gVEFCIERBVEEtQVBJXG4gIC8vID09PT09PT09PT09PVxuXG4gIHZhciBjbGlja0hhbmRsZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIFBsdWdpbi5jYWxsKCQodGhpcyksICdzaG93JylcbiAgfVxuXG4gICQoZG9jdW1lbnQpXG4gICAgLm9uKCdjbGljay5icy50YWIuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJywgY2xpY2tIYW5kbGVyKVxuICAgIC5vbignY2xpY2suYnMudGFiLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cInBpbGxcIl0nLCBjbGlja0hhbmRsZXIpXG5cbn0oalF1ZXJ5KTtcbiIsIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiBjb2xsYXBzZS5qcyB2My4zLjdcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI2NvbGxhcHNlXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4vKiBqc2hpbnQgbGF0ZWRlZjogZmFsc2UgKi9cblxuK2Z1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBDT0xMQVBTRSBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBDb2xsYXBzZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCAgICAgID0gJChlbGVtZW50KVxuICAgIHRoaXMub3B0aW9ucyAgICAgICA9ICQuZXh0ZW5kKHt9LCBDb2xsYXBzZS5ERUZBVUxUUywgb3B0aW9ucylcbiAgICB0aGlzLiR0cmlnZ2VyICAgICAgPSAkKCdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXVtocmVmPVwiIycgKyBlbGVtZW50LmlkICsgJ1wiXSwnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXVtkYXRhLXRhcmdldD1cIiMnICsgZWxlbWVudC5pZCArICdcIl0nKVxuICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IG51bGxcblxuICAgIGlmICh0aGlzLm9wdGlvbnMucGFyZW50KSB7XG4gICAgICB0aGlzLiRwYXJlbnQgPSB0aGlzLmdldFBhcmVudCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzKHRoaXMuJGVsZW1lbnQsIHRoaXMuJHRyaWdnZXIpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy50b2dnbGUpIHRoaXMudG9nZ2xlKClcbiAgfVxuXG4gIENvbGxhcHNlLlZFUlNJT04gID0gJzMuMy43J1xuXG4gIENvbGxhcHNlLlRSQU5TSVRJT05fRFVSQVRJT04gPSAzNTBcblxuICBDb2xsYXBzZS5ERUZBVUxUUyA9IHtcbiAgICB0b2dnbGU6IHRydWVcbiAgfVxuXG4gIENvbGxhcHNlLnByb3RvdHlwZS5kaW1lbnNpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGhhc1dpZHRoID0gdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnd2lkdGgnKVxuICAgIHJldHVybiBoYXNXaWR0aCA/ICd3aWR0aCcgOiAnaGVpZ2h0J1xuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMudHJhbnNpdGlvbmluZyB8fCB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpbicpKSByZXR1cm5cblxuICAgIHZhciBhY3RpdmVzRGF0YVxuICAgIHZhciBhY3RpdmVzID0gdGhpcy4kcGFyZW50ICYmIHRoaXMuJHBhcmVudC5jaGlsZHJlbignLnBhbmVsJykuY2hpbGRyZW4oJy5pbiwgLmNvbGxhcHNpbmcnKVxuXG4gICAgaWYgKGFjdGl2ZXMgJiYgYWN0aXZlcy5sZW5ndGgpIHtcbiAgICAgIGFjdGl2ZXNEYXRhID0gYWN0aXZlcy5kYXRhKCdicy5jb2xsYXBzZScpXG4gICAgICBpZiAoYWN0aXZlc0RhdGEgJiYgYWN0aXZlc0RhdGEudHJhbnNpdGlvbmluZykgcmV0dXJuXG4gICAgfVxuXG4gICAgdmFyIHN0YXJ0RXZlbnQgPSAkLkV2ZW50KCdzaG93LmJzLmNvbGxhcHNlJylcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoc3RhcnRFdmVudClcbiAgICBpZiAoc3RhcnRFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICBpZiAoYWN0aXZlcyAmJiBhY3RpdmVzLmxlbmd0aCkge1xuICAgICAgUGx1Z2luLmNhbGwoYWN0aXZlcywgJ2hpZGUnKVxuICAgICAgYWN0aXZlc0RhdGEgfHwgYWN0aXZlcy5kYXRhKCdicy5jb2xsYXBzZScsIG51bGwpXG4gICAgfVxuXG4gICAgdmFyIGRpbWVuc2lvbiA9IHRoaXMuZGltZW5zaW9uKClcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2UnKVxuICAgICAgLmFkZENsYXNzKCdjb2xsYXBzaW5nJylbZGltZW5zaW9uXSgwKVxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxuXG4gICAgdGhpcy4kdHJpZ2dlclxuICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzZWQnKVxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxuXG4gICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMVxuXG4gICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNpbmcnKVxuICAgICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNlIGluJylbZGltZW5zaW9uXSgnJylcbiAgICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDBcbiAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgLnRyaWdnZXIoJ3Nob3duLmJzLmNvbGxhcHNlJylcbiAgICB9XG5cbiAgICBpZiAoISQuc3VwcG9ydC50cmFuc2l0aW9uKSByZXR1cm4gY29tcGxldGUuY2FsbCh0aGlzKVxuXG4gICAgdmFyIHNjcm9sbFNpemUgPSAkLmNhbWVsQ2FzZShbJ3Njcm9sbCcsIGRpbWVuc2lvbl0uam9pbignLScpKVxuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgJC5wcm94eShjb21wbGV0ZSwgdGhpcykpXG4gICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoQ29sbGFwc2UuVFJBTlNJVElPTl9EVVJBVElPTilbZGltZW5zaW9uXSh0aGlzLiRlbGVtZW50WzBdW3Njcm9sbFNpemVdKVxuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMudHJhbnNpdGlvbmluZyB8fCAhdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaW4nKSkgcmV0dXJuXG5cbiAgICB2YXIgc3RhcnRFdmVudCA9ICQuRXZlbnQoJ2hpZGUuYnMuY29sbGFwc2UnKVxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihzdGFydEV2ZW50KVxuICAgIGlmIChzdGFydEV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgIHZhciBkaW1lbnNpb24gPSB0aGlzLmRpbWVuc2lvbigpXG5cbiAgICB0aGlzLiRlbGVtZW50W2RpbWVuc2lvbl0odGhpcy4kZWxlbWVudFtkaW1lbnNpb25dKCkpWzBdLm9mZnNldEhlaWdodFxuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLmFkZENsYXNzKCdjb2xsYXBzaW5nJylcbiAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2UgaW4nKVxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSlcblxuICAgIHRoaXMuJHRyaWdnZXJcbiAgICAgIC5hZGRDbGFzcygnY29sbGFwc2VkJylcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpXG5cbiAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSAxXG5cbiAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSAwXG4gICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2luZycpXG4gICAgICAgIC5hZGRDbGFzcygnY29sbGFwc2UnKVxuICAgICAgICAudHJpZ2dlcignaGlkZGVuLmJzLmNvbGxhcHNlJylcbiAgICB9XG5cbiAgICBpZiAoISQuc3VwcG9ydC50cmFuc2l0aW9uKSByZXR1cm4gY29tcGxldGUuY2FsbCh0aGlzKVxuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgW2RpbWVuc2lvbl0oMClcbiAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsICQucHJveHkoY29tcGxldGUsIHRoaXMpKVxuICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKENvbGxhcHNlLlRSQU5TSVRJT05fRFVSQVRJT04pXG4gIH1cblxuICBDb2xsYXBzZS5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXNbdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaW4nKSA/ICdoaWRlJyA6ICdzaG93J10oKVxuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLmdldFBhcmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJCh0aGlzLm9wdGlvbnMucGFyZW50KVxuICAgICAgLmZpbmQoJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdW2RhdGEtcGFyZW50PVwiJyArIHRoaXMub3B0aW9ucy5wYXJlbnQgKyAnXCJdJylcbiAgICAgIC5lYWNoKCQucHJveHkoZnVuY3Rpb24gKGksIGVsZW1lbnQpIHtcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KVxuICAgICAgICB0aGlzLmFkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyhnZXRUYXJnZXRGcm9tVHJpZ2dlcigkZWxlbWVudCksICRlbGVtZW50KVxuICAgICAgfSwgdGhpcykpXG4gICAgICAuZW5kKClcbiAgfVxuXG4gIENvbGxhcHNlLnByb3RvdHlwZS5hZGRBcmlhQW5kQ29sbGFwc2VkQ2xhc3MgPSBmdW5jdGlvbiAoJGVsZW1lbnQsICR0cmlnZ2VyKSB7XG4gICAgdmFyIGlzT3BlbiA9ICRlbGVtZW50Lmhhc0NsYXNzKCdpbicpXG5cbiAgICAkZWxlbWVudC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgaXNPcGVuKVxuICAgICR0cmlnZ2VyXG4gICAgICAudG9nZ2xlQ2xhc3MoJ2NvbGxhcHNlZCcsICFpc09wZW4pXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGlzT3BlbilcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFRhcmdldEZyb21UcmlnZ2VyKCR0cmlnZ2VyKSB7XG4gICAgdmFyIGhyZWZcbiAgICB2YXIgdGFyZ2V0ID0gJHRyaWdnZXIuYXR0cignZGF0YS10YXJnZXQnKVxuICAgICAgfHwgKGhyZWYgPSAkdHJpZ2dlci5hdHRyKCdocmVmJykpICYmIGhyZWYucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLywgJycpIC8vIHN0cmlwIGZvciBpZTdcblxuICAgIHJldHVybiAkKHRhcmdldClcbiAgfVxuXG5cbiAgLy8gQ09MTEFQU0UgUExVR0lOIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMuY29sbGFwc2UnKVxuICAgICAgdmFyIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQ29sbGFwc2UuREVGQVVMVFMsICR0aGlzLmRhdGEoKSwgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pXG5cbiAgICAgIGlmICghZGF0YSAmJiBvcHRpb25zLnRvZ2dsZSAmJiAvc2hvd3xoaWRlLy50ZXN0KG9wdGlvbikpIG9wdGlvbnMudG9nZ2xlID0gZmFsc2VcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuY29sbGFwc2UnLCAoZGF0YSA9IG5ldyBDb2xsYXBzZSh0aGlzLCBvcHRpb25zKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgdmFyIG9sZCA9ICQuZm4uY29sbGFwc2VcblxuICAkLmZuLmNvbGxhcHNlICAgICAgICAgICAgID0gUGx1Z2luXG4gICQuZm4uY29sbGFwc2UuQ29uc3RydWN0b3IgPSBDb2xsYXBzZVxuXG5cbiAgLy8gQ09MTEFQU0UgTk8gQ09ORkxJQ1RcbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cblxuICAkLmZuLmNvbGxhcHNlLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi5jb2xsYXBzZSA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuXG4gIC8vIENPTExBUFNFIERBVEEtQVBJXG4gIC8vID09PT09PT09PT09PT09PT09XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLmJzLmNvbGxhcHNlLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdJywgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcblxuICAgIGlmICghJHRoaXMuYXR0cignZGF0YS10YXJnZXQnKSkgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICB2YXIgJHRhcmdldCA9IGdldFRhcmdldEZyb21UcmlnZ2VyKCR0aGlzKVxuICAgIHZhciBkYXRhICAgID0gJHRhcmdldC5kYXRhKCdicy5jb2xsYXBzZScpXG4gICAgdmFyIG9wdGlvbiAgPSBkYXRhID8gJ3RvZ2dsZScgOiAkdGhpcy5kYXRhKClcblxuICAgIFBsdWdpbi5jYWxsKCR0YXJnZXQsIG9wdGlvbilcbiAgfSlcblxufShqUXVlcnkpO1xuIiwiLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBCb290c3RyYXA6IHRyYW5zaXRpb24uanMgdjMuMy43XG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyN0cmFuc2l0aW9uc1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4rZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIENTUyBUUkFOU0lUSU9OIFNVUFBPUlQgKFNob3V0b3V0OiBodHRwOi8vd3d3Lm1vZGVybml6ci5jb20vKVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiB0cmFuc2l0aW9uRW5kKCkge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Jvb3RzdHJhcCcpXG5cbiAgICB2YXIgdHJhbnNFbmRFdmVudE5hbWVzID0ge1xuICAgICAgV2Via2l0VHJhbnNpdGlvbiA6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAgIE1velRyYW5zaXRpb24gICAgOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICBPVHJhbnNpdGlvbiAgICAgIDogJ29UcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kJyxcbiAgICAgIHRyYW5zaXRpb24gICAgICAgOiAndHJhbnNpdGlvbmVuZCdcbiAgICB9XG5cbiAgICBmb3IgKHZhciBuYW1lIGluIHRyYW5zRW5kRXZlbnROYW1lcykge1xuICAgICAgaWYgKGVsLnN0eWxlW25hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHsgZW5kOiB0cmFuc0VuZEV2ZW50TmFtZXNbbmFtZV0gfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZSAvLyBleHBsaWNpdCBmb3IgaWU4ICggIC5fLilcbiAgfVxuXG4gIC8vIGh0dHA6Ly9ibG9nLmFsZXhtYWNjYXcuY29tL2Nzcy10cmFuc2l0aW9uc1xuICAkLmZuLmVtdWxhdGVUcmFuc2l0aW9uRW5kID0gZnVuY3Rpb24gKGR1cmF0aW9uKSB7XG4gICAgdmFyIGNhbGxlZCA9IGZhbHNlXG4gICAgdmFyICRlbCA9IHRoaXNcbiAgICAkKHRoaXMpLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgZnVuY3Rpb24gKCkgeyBjYWxsZWQgPSB0cnVlIH0pXG4gICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24gKCkgeyBpZiAoIWNhbGxlZCkgJCgkZWwpLnRyaWdnZXIoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kKSB9XG4gICAgc2V0VGltZW91dChjYWxsYmFjaywgZHVyYXRpb24pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gICQoZnVuY3Rpb24gKCkge1xuICAgICQuc3VwcG9ydC50cmFuc2l0aW9uID0gdHJhbnNpdGlvbkVuZCgpXG5cbiAgICBpZiAoISQuc3VwcG9ydC50cmFuc2l0aW9uKSByZXR1cm5cblxuICAgICQuZXZlbnQuc3BlY2lhbC5ic1RyYW5zaXRpb25FbmQgPSB7XG4gICAgICBiaW5kVHlwZTogJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLFxuICAgICAgZGVsZWdhdGVUeXBlOiAkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsXG4gICAgICBoYW5kbGU6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICgkKGUudGFyZ2V0KS5pcyh0aGlzKSkgcmV0dXJuIGUuaGFuZGxlT2JqLmhhbmRsZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxufShqUXVlcnkpO1xuIiwiLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBCb290c3RyYXA6IHRvb2x0aXAuanMgdjMuMy43XG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyN0b29sdGlwXG4gKiBJbnNwaXJlZCBieSB0aGUgb3JpZ2luYWwgalF1ZXJ5LnRpcHN5IGJ5IEphc29uIEZyYW1lXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbitmdW5jdGlvbiAoJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gVE9PTFRJUCBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgdmFyIFRvb2x0aXAgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMudHlwZSAgICAgICA9IG51bGxcbiAgICB0aGlzLm9wdGlvbnMgICAgPSBudWxsXG4gICAgdGhpcy5lbmFibGVkICAgID0gbnVsbFxuICAgIHRoaXMudGltZW91dCAgICA9IG51bGxcbiAgICB0aGlzLmhvdmVyU3RhdGUgPSBudWxsXG4gICAgdGhpcy4kZWxlbWVudCAgID0gbnVsbFxuICAgIHRoaXMuaW5TdGF0ZSAgICA9IG51bGxcblxuICAgIHRoaXMuaW5pdCgndG9vbHRpcCcsIGVsZW1lbnQsIG9wdGlvbnMpXG4gIH1cblxuICBUb29sdGlwLlZFUlNJT04gID0gJzMuMy43J1xuXG4gIFRvb2x0aXAuVFJBTlNJVElPTl9EVVJBVElPTiA9IDE1MFxuXG4gIFRvb2x0aXAuREVGQVVMVFMgPSB7XG4gICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgIHBsYWNlbWVudDogJ3RvcCcsXG4gICAgc2VsZWN0b3I6IGZhbHNlLFxuICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRvb2x0aXBcIiByb2xlPVwidG9vbHRpcFwiPjxkaXYgY2xhc3M9XCJ0b29sdGlwLWFycm93XCI+PC9kaXY+PGRpdiBjbGFzcz1cInRvb2x0aXAtaW5uZXJcIj48L2Rpdj48L2Rpdj4nLFxuICAgIHRyaWdnZXI6ICdob3ZlciBmb2N1cycsXG4gICAgdGl0bGU6ICcnLFxuICAgIGRlbGF5OiAwLFxuICAgIGh0bWw6IGZhbHNlLFxuICAgIGNvbnRhaW5lcjogZmFsc2UsXG4gICAgdmlld3BvcnQ6IHtcbiAgICAgIHNlbGVjdG9yOiAnYm9keScsXG4gICAgICBwYWRkaW5nOiAwXG4gICAgfVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICh0eXBlLCBlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5lbmFibGVkICAgPSB0cnVlXG4gICAgdGhpcy50eXBlICAgICAgPSB0eXBlXG4gICAgdGhpcy4kZWxlbWVudCAgPSAkKGVsZW1lbnQpXG4gICAgdGhpcy5vcHRpb25zICAgPSB0aGlzLmdldE9wdGlvbnMob3B0aW9ucylcbiAgICB0aGlzLiR2aWV3cG9ydCA9IHRoaXMub3B0aW9ucy52aWV3cG9ydCAmJiAkKCQuaXNGdW5jdGlvbih0aGlzLm9wdGlvbnMudmlld3BvcnQpID8gdGhpcy5vcHRpb25zLnZpZXdwb3J0LmNhbGwodGhpcywgdGhpcy4kZWxlbWVudCkgOiAodGhpcy5vcHRpb25zLnZpZXdwb3J0LnNlbGVjdG9yIHx8IHRoaXMub3B0aW9ucy52aWV3cG9ydCkpXG4gICAgdGhpcy5pblN0YXRlICAgPSB7IGNsaWNrOiBmYWxzZSwgaG92ZXI6IGZhbHNlLCBmb2N1czogZmFsc2UgfVxuXG4gICAgaWYgKHRoaXMuJGVsZW1lbnRbMF0gaW5zdGFuY2VvZiBkb2N1bWVudC5jb25zdHJ1Y3RvciAmJiAhdGhpcy5vcHRpb25zLnNlbGVjdG9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BzZWxlY3RvcmAgb3B0aW9uIG11c3QgYmUgc3BlY2lmaWVkIHdoZW4gaW5pdGlhbGl6aW5nICcgKyB0aGlzLnR5cGUgKyAnIG9uIHRoZSB3aW5kb3cuZG9jdW1lbnQgb2JqZWN0IScpXG4gICAgfVxuXG4gICAgdmFyIHRyaWdnZXJzID0gdGhpcy5vcHRpb25zLnRyaWdnZXIuc3BsaXQoJyAnKVxuXG4gICAgZm9yICh2YXIgaSA9IHRyaWdnZXJzLmxlbmd0aDsgaS0tOykge1xuICAgICAgdmFyIHRyaWdnZXIgPSB0cmlnZ2Vyc1tpXVxuXG4gICAgICBpZiAodHJpZ2dlciA9PSAnY2xpY2snKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrLicgKyB0aGlzLnR5cGUsIHRoaXMub3B0aW9ucy5zZWxlY3RvciwgJC5wcm94eSh0aGlzLnRvZ2dsZSwgdGhpcykpXG4gICAgICB9IGVsc2UgaWYgKHRyaWdnZXIgIT0gJ21hbnVhbCcpIHtcbiAgICAgICAgdmFyIGV2ZW50SW4gID0gdHJpZ2dlciA9PSAnaG92ZXInID8gJ21vdXNlZW50ZXInIDogJ2ZvY3VzaW4nXG4gICAgICAgIHZhciBldmVudE91dCA9IHRyaWdnZXIgPT0gJ2hvdmVyJyA/ICdtb3VzZWxlYXZlJyA6ICdmb2N1c291dCdcblxuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKGV2ZW50SW4gICsgJy4nICsgdGhpcy50eXBlLCB0aGlzLm9wdGlvbnMuc2VsZWN0b3IsICQucHJveHkodGhpcy5lbnRlciwgdGhpcykpXG4gICAgICAgIHRoaXMuJGVsZW1lbnQub24oZXZlbnRPdXQgKyAnLicgKyB0aGlzLnR5cGUsIHRoaXMub3B0aW9ucy5zZWxlY3RvciwgJC5wcm94eSh0aGlzLmxlYXZlLCB0aGlzKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm9wdGlvbnMuc2VsZWN0b3IgP1xuICAgICAgKHRoaXMuX29wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCB7IHRyaWdnZXI6ICdtYW51YWwnLCBzZWxlY3RvcjogJycgfSkpIDpcbiAgICAgIHRoaXMuZml4VGl0bGUoKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0RGVmYXVsdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFRvb2x0aXAuREVGQVVMVFNcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5nZXREZWZhdWx0cygpLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucylcblxuICAgIGlmIChvcHRpb25zLmRlbGF5ICYmIHR5cGVvZiBvcHRpb25zLmRlbGF5ID09ICdudW1iZXInKSB7XG4gICAgICBvcHRpb25zLmRlbGF5ID0ge1xuICAgICAgICBzaG93OiBvcHRpb25zLmRlbGF5LFxuICAgICAgICBoaWRlOiBvcHRpb25zLmRlbGF5XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldERlbGVnYXRlT3B0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3B0aW9ucyAgPSB7fVxuICAgIHZhciBkZWZhdWx0cyA9IHRoaXMuZ2V0RGVmYXVsdHMoKVxuXG4gICAgdGhpcy5fb3B0aW9ucyAmJiAkLmVhY2godGhpcy5fb3B0aW9ucywgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgIGlmIChkZWZhdWx0c1trZXldICE9IHZhbHVlKSBvcHRpb25zW2tleV0gPSB2YWx1ZVxuICAgIH0pXG5cbiAgICByZXR1cm4gb3B0aW9uc1xuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZW50ZXIgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIHNlbGYgPSBvYmogaW5zdGFuY2VvZiB0aGlzLmNvbnN0cnVjdG9yID9cbiAgICAgIG9iaiA6ICQob2JqLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUpXG5cbiAgICBpZiAoIXNlbGYpIHtcbiAgICAgIHNlbGYgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihvYmouY3VycmVudFRhcmdldCwgdGhpcy5nZXREZWxlZ2F0ZU9wdGlvbnMoKSlcbiAgICAgICQob2JqLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUsIHNlbGYpXG4gICAgfVxuXG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mICQuRXZlbnQpIHtcbiAgICAgIHNlbGYuaW5TdGF0ZVtvYmoudHlwZSA9PSAnZm9jdXNpbicgPyAnZm9jdXMnIDogJ2hvdmVyJ10gPSB0cnVlXG4gICAgfVxuXG4gICAgaWYgKHNlbGYudGlwKCkuaGFzQ2xhc3MoJ2luJykgfHwgc2VsZi5ob3ZlclN0YXRlID09ICdpbicpIHtcbiAgICAgIHNlbGYuaG92ZXJTdGF0ZSA9ICdpbidcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXQpXG5cbiAgICBzZWxmLmhvdmVyU3RhdGUgPSAnaW4nXG5cbiAgICBpZiAoIXNlbGYub3B0aW9ucy5kZWxheSB8fCAhc2VsZi5vcHRpb25zLmRlbGF5LnNob3cpIHJldHVybiBzZWxmLnNob3coKVxuXG4gICAgc2VsZi50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc2VsZi5ob3ZlclN0YXRlID09ICdpbicpIHNlbGYuc2hvdygpXG4gICAgfSwgc2VsZi5vcHRpb25zLmRlbGF5LnNob3cpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5pc0luU3RhdGVUcnVlID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmluU3RhdGUpIHtcbiAgICAgIGlmICh0aGlzLmluU3RhdGVba2V5XSkgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmxlYXZlID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciBzZWxmID0gb2JqIGluc3RhbmNlb2YgdGhpcy5jb25zdHJ1Y3RvciA/XG4gICAgICBvYmogOiAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlKVxuXG4gICAgaWYgKCFzZWxmKSB7XG4gICAgICBzZWxmID0gbmV3IHRoaXMuY29uc3RydWN0b3Iob2JqLmN1cnJlbnRUYXJnZXQsIHRoaXMuZ2V0RGVsZWdhdGVPcHRpb25zKCkpXG4gICAgICAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlLCBzZWxmKVxuICAgIH1cblxuICAgIGlmIChvYmogaW5zdGFuY2VvZiAkLkV2ZW50KSB7XG4gICAgICBzZWxmLmluU3RhdGVbb2JqLnR5cGUgPT0gJ2ZvY3Vzb3V0JyA/ICdmb2N1cycgOiAnaG92ZXInXSA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKHNlbGYuaXNJblN0YXRlVHJ1ZSgpKSByZXR1cm5cblxuICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXQpXG5cbiAgICBzZWxmLmhvdmVyU3RhdGUgPSAnb3V0J1xuXG4gICAgaWYgKCFzZWxmLm9wdGlvbnMuZGVsYXkgfHwgIXNlbGYub3B0aW9ucy5kZWxheS5oaWRlKSByZXR1cm4gc2VsZi5oaWRlKClcblxuICAgIHNlbGYudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHNlbGYuaG92ZXJTdGF0ZSA9PSAnb3V0Jykgc2VsZi5oaWRlKClcbiAgICB9LCBzZWxmLm9wdGlvbnMuZGVsYXkuaGlkZSlcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGUgPSAkLkV2ZW50KCdzaG93LmJzLicgKyB0aGlzLnR5cGUpXG5cbiAgICBpZiAodGhpcy5oYXNDb250ZW50KCkgJiYgdGhpcy5lbmFibGVkKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcblxuICAgICAgdmFyIGluRG9tID0gJC5jb250YWlucyh0aGlzLiRlbGVtZW50WzBdLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB0aGlzLiRlbGVtZW50WzBdKVxuICAgICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkgfHwgIWluRG9tKSByZXR1cm5cbiAgICAgIHZhciB0aGF0ID0gdGhpc1xuXG4gICAgICB2YXIgJHRpcCA9IHRoaXMudGlwKClcblxuICAgICAgdmFyIHRpcElkID0gdGhpcy5nZXRVSUQodGhpcy50eXBlKVxuXG4gICAgICB0aGlzLnNldENvbnRlbnQoKVxuICAgICAgJHRpcC5hdHRyKCdpZCcsIHRpcElkKVxuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWRlc2NyaWJlZGJ5JywgdGlwSWQpXG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYW5pbWF0aW9uKSAkdGlwLmFkZENsYXNzKCdmYWRlJylcblxuICAgICAgdmFyIHBsYWNlbWVudCA9IHR5cGVvZiB0aGlzLm9wdGlvbnMucGxhY2VtZW50ID09ICdmdW5jdGlvbicgP1xuICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2VtZW50LmNhbGwodGhpcywgJHRpcFswXSwgdGhpcy4kZWxlbWVudFswXSkgOlxuICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2VtZW50XG5cbiAgICAgIHZhciBhdXRvVG9rZW4gPSAvXFxzP2F1dG8/XFxzPy9pXG4gICAgICB2YXIgYXV0b1BsYWNlID0gYXV0b1Rva2VuLnRlc3QocGxhY2VtZW50KVxuICAgICAgaWYgKGF1dG9QbGFjZSkgcGxhY2VtZW50ID0gcGxhY2VtZW50LnJlcGxhY2UoYXV0b1Rva2VuLCAnJykgfHwgJ3RvcCdcblxuICAgICAgJHRpcFxuICAgICAgICAuZGV0YWNoKClcbiAgICAgICAgLmNzcyh7IHRvcDogMCwgbGVmdDogMCwgZGlzcGxheTogJ2Jsb2NrJyB9KVxuICAgICAgICAuYWRkQ2xhc3MocGxhY2VtZW50KVxuICAgICAgICAuZGF0YSgnYnMuJyArIHRoaXMudHlwZSwgdGhpcylcblxuICAgICAgdGhpcy5vcHRpb25zLmNvbnRhaW5lciA/ICR0aXAuYXBwZW5kVG8odGhpcy5vcHRpb25zLmNvbnRhaW5lcikgOiAkdGlwLmluc2VydEFmdGVyKHRoaXMuJGVsZW1lbnQpXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2luc2VydGVkLmJzLicgKyB0aGlzLnR5cGUpXG5cbiAgICAgIHZhciBwb3MgICAgICAgICAgPSB0aGlzLmdldFBvc2l0aW9uKClcbiAgICAgIHZhciBhY3R1YWxXaWR0aCAgPSAkdGlwWzBdLm9mZnNldFdpZHRoXG4gICAgICB2YXIgYWN0dWFsSGVpZ2h0ID0gJHRpcFswXS5vZmZzZXRIZWlnaHRcblxuICAgICAgaWYgKGF1dG9QbGFjZSkge1xuICAgICAgICB2YXIgb3JnUGxhY2VtZW50ID0gcGxhY2VtZW50XG4gICAgICAgIHZhciB2aWV3cG9ydERpbSA9IHRoaXMuZ2V0UG9zaXRpb24odGhpcy4kdmlld3BvcnQpXG5cbiAgICAgICAgcGxhY2VtZW50ID0gcGxhY2VtZW50ID09ICdib3R0b20nICYmIHBvcy5ib3R0b20gKyBhY3R1YWxIZWlnaHQgPiB2aWV3cG9ydERpbS5ib3R0b20gPyAndG9wJyAgICA6XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAndG9wJyAgICAmJiBwb3MudG9wICAgIC0gYWN0dWFsSGVpZ2h0IDwgdmlld3BvcnREaW0udG9wICAgID8gJ2JvdHRvbScgOlxuICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ3JpZ2h0JyAgJiYgcG9zLnJpZ2h0ICArIGFjdHVhbFdpZHRoICA+IHZpZXdwb3J0RGltLndpZHRoICA/ICdsZWZ0JyAgIDpcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50ID09ICdsZWZ0JyAgICYmIHBvcy5sZWZ0ICAgLSBhY3R1YWxXaWR0aCAgPCB2aWV3cG9ydERpbS5sZWZ0ICAgPyAncmlnaHQnICA6XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudFxuXG4gICAgICAgICR0aXBcbiAgICAgICAgICAucmVtb3ZlQ2xhc3Mob3JnUGxhY2VtZW50KVxuICAgICAgICAgIC5hZGRDbGFzcyhwbGFjZW1lbnQpXG4gICAgICB9XG5cbiAgICAgIHZhciBjYWxjdWxhdGVkT2Zmc2V0ID0gdGhpcy5nZXRDYWxjdWxhdGVkT2Zmc2V0KHBsYWNlbWVudCwgcG9zLCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KVxuXG4gICAgICB0aGlzLmFwcGx5UGxhY2VtZW50KGNhbGN1bGF0ZWRPZmZzZXQsIHBsYWNlbWVudClcblxuICAgICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcHJldkhvdmVyU3RhdGUgPSB0aGF0LmhvdmVyU3RhdGVcbiAgICAgICAgdGhhdC4kZWxlbWVudC50cmlnZ2VyKCdzaG93bi5icy4nICsgdGhhdC50eXBlKVxuICAgICAgICB0aGF0LmhvdmVyU3RhdGUgPSBudWxsXG5cbiAgICAgICAgaWYgKHByZXZIb3ZlclN0YXRlID09ICdvdXQnKSB0aGF0LmxlYXZlKHRoYXQpXG4gICAgICB9XG5cbiAgICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoaXMuJHRpcC5oYXNDbGFzcygnZmFkZScpID9cbiAgICAgICAgJHRpcFxuICAgICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGNvbXBsZXRlKVxuICAgICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChUb29sdGlwLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcbiAgICAgICAgY29tcGxldGUoKVxuICAgIH1cbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmFwcGx5UGxhY2VtZW50ID0gZnVuY3Rpb24gKG9mZnNldCwgcGxhY2VtZW50KSB7XG4gICAgdmFyICR0aXAgICA9IHRoaXMudGlwKClcbiAgICB2YXIgd2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxuICAgIHZhciBoZWlnaHQgPSAkdGlwWzBdLm9mZnNldEhlaWdodFxuXG4gICAgLy8gbWFudWFsbHkgcmVhZCBtYXJnaW5zIGJlY2F1c2UgZ2V0Qm91bmRpbmdDbGllbnRSZWN0IGluY2x1ZGVzIGRpZmZlcmVuY2VcbiAgICB2YXIgbWFyZ2luVG9wID0gcGFyc2VJbnQoJHRpcC5jc3MoJ21hcmdpbi10b3AnKSwgMTApXG4gICAgdmFyIG1hcmdpbkxlZnQgPSBwYXJzZUludCgkdGlwLmNzcygnbWFyZ2luLWxlZnQnKSwgMTApXG5cbiAgICAvLyB3ZSBtdXN0IGNoZWNrIGZvciBOYU4gZm9yIGllIDgvOVxuICAgIGlmIChpc05hTihtYXJnaW5Ub3ApKSAgbWFyZ2luVG9wICA9IDBcbiAgICBpZiAoaXNOYU4obWFyZ2luTGVmdCkpIG1hcmdpbkxlZnQgPSAwXG5cbiAgICBvZmZzZXQudG9wICArPSBtYXJnaW5Ub3BcbiAgICBvZmZzZXQubGVmdCArPSBtYXJnaW5MZWZ0XG5cbiAgICAvLyAkLmZuLm9mZnNldCBkb2Vzbid0IHJvdW5kIHBpeGVsIHZhbHVlc1xuICAgIC8vIHNvIHdlIHVzZSBzZXRPZmZzZXQgZGlyZWN0bHkgd2l0aCBvdXIgb3duIGZ1bmN0aW9uIEItMFxuICAgICQub2Zmc2V0LnNldE9mZnNldCgkdGlwWzBdLCAkLmV4dGVuZCh7XG4gICAgICB1c2luZzogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgICR0aXAuY3NzKHtcbiAgICAgICAgICB0b3A6IE1hdGgucm91bmQocHJvcHMudG9wKSxcbiAgICAgICAgICBsZWZ0OiBNYXRoLnJvdW5kKHByb3BzLmxlZnQpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSwgb2Zmc2V0KSwgMClcblxuICAgICR0aXAuYWRkQ2xhc3MoJ2luJylcblxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiBwbGFjaW5nIHRpcCBpbiBuZXcgb2Zmc2V0IGNhdXNlZCB0aGUgdGlwIHRvIHJlc2l6ZSBpdHNlbGZcbiAgICB2YXIgYWN0dWFsV2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxuICAgIHZhciBhY3R1YWxIZWlnaHQgPSAkdGlwWzBdLm9mZnNldEhlaWdodFxuXG4gICAgaWYgKHBsYWNlbWVudCA9PSAndG9wJyAmJiBhY3R1YWxIZWlnaHQgIT0gaGVpZ2h0KSB7XG4gICAgICBvZmZzZXQudG9wID0gb2Zmc2V0LnRvcCArIGhlaWdodCAtIGFjdHVhbEhlaWdodFxuICAgIH1cblxuICAgIHZhciBkZWx0YSA9IHRoaXMuZ2V0Vmlld3BvcnRBZGp1c3RlZERlbHRhKHBsYWNlbWVudCwgb2Zmc2V0LCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KVxuXG4gICAgaWYgKGRlbHRhLmxlZnQpIG9mZnNldC5sZWZ0ICs9IGRlbHRhLmxlZnRcbiAgICBlbHNlIG9mZnNldC50b3AgKz0gZGVsdGEudG9wXG5cbiAgICB2YXIgaXNWZXJ0aWNhbCAgICAgICAgICA9IC90b3B8Ym90dG9tLy50ZXN0KHBsYWNlbWVudClcbiAgICB2YXIgYXJyb3dEZWx0YSAgICAgICAgICA9IGlzVmVydGljYWwgPyBkZWx0YS5sZWZ0ICogMiAtIHdpZHRoICsgYWN0dWFsV2lkdGggOiBkZWx0YS50b3AgKiAyIC0gaGVpZ2h0ICsgYWN0dWFsSGVpZ2h0XG4gICAgdmFyIGFycm93T2Zmc2V0UG9zaXRpb24gPSBpc1ZlcnRpY2FsID8gJ29mZnNldFdpZHRoJyA6ICdvZmZzZXRIZWlnaHQnXG5cbiAgICAkdGlwLm9mZnNldChvZmZzZXQpXG4gICAgdGhpcy5yZXBsYWNlQXJyb3coYXJyb3dEZWx0YSwgJHRpcFswXVthcnJvd09mZnNldFBvc2l0aW9uXSwgaXNWZXJ0aWNhbClcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnJlcGxhY2VBcnJvdyA9IGZ1bmN0aW9uIChkZWx0YSwgZGltZW5zaW9uLCBpc1ZlcnRpY2FsKSB7XG4gICAgdGhpcy5hcnJvdygpXG4gICAgICAuY3NzKGlzVmVydGljYWwgPyAnbGVmdCcgOiAndG9wJywgNTAgKiAoMSAtIGRlbHRhIC8gZGltZW5zaW9uKSArICclJylcbiAgICAgIC5jc3MoaXNWZXJ0aWNhbCA/ICd0b3AnIDogJ2xlZnQnLCAnJylcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnNldENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICR0aXAgID0gdGhpcy50aXAoKVxuICAgIHZhciB0aXRsZSA9IHRoaXMuZ2V0VGl0bGUoKVxuXG4gICAgJHRpcC5maW5kKCcudG9vbHRpcC1pbm5lcicpW3RoaXMub3B0aW9ucy5odG1sID8gJ2h0bWwnIDogJ3RleHQnXSh0aXRsZSlcbiAgICAkdGlwLnJlbW92ZUNsYXNzKCdmYWRlIGluIHRvcCBib3R0b20gbGVmdCByaWdodCcpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgdmFyICR0aXAgPSAkKHRoaXMuJHRpcClcbiAgICB2YXIgZSAgICA9ICQuRXZlbnQoJ2hpZGUuYnMuJyArIHRoaXMudHlwZSlcblxuICAgIGZ1bmN0aW9uIGNvbXBsZXRlKCkge1xuICAgICAgaWYgKHRoYXQuaG92ZXJTdGF0ZSAhPSAnaW4nKSAkdGlwLmRldGFjaCgpXG4gICAgICBpZiAodGhhdC4kZWxlbWVudCkgeyAvLyBUT0RPOiBDaGVjayB3aGV0aGVyIGd1YXJkaW5nIHRoaXMgY29kZSB3aXRoIHRoaXMgYGlmYCBpcyByZWFsbHkgbmVjZXNzYXJ5LlxuICAgICAgICB0aGF0LiRlbGVtZW50XG4gICAgICAgICAgLnJlbW92ZUF0dHIoJ2FyaWEtZGVzY3JpYmVkYnknKVxuICAgICAgICAgIC50cmlnZ2VyKCdoaWRkZW4uYnMuJyArIHRoYXQudHlwZSlcbiAgICAgIH1cbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKClcbiAgICB9XG5cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcblxuICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgICR0aXAucmVtb3ZlQ2xhc3MoJ2luJylcblxuICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmICR0aXAuaGFzQ2xhc3MoJ2ZhZGUnKSA/XG4gICAgICAkdGlwXG4gICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGNvbXBsZXRlKVxuICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoVG9vbHRpcC5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XG4gICAgICBjb21wbGV0ZSgpXG5cbiAgICB0aGlzLmhvdmVyU3RhdGUgPSBudWxsXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZml4VGl0bGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICRlID0gdGhpcy4kZWxlbWVudFxuICAgIGlmICgkZS5hdHRyKCd0aXRsZScpIHx8IHR5cGVvZiAkZS5hdHRyKCdkYXRhLW9yaWdpbmFsLXRpdGxlJykgIT0gJ3N0cmluZycpIHtcbiAgICAgICRlLmF0dHIoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnLCAkZS5hdHRyKCd0aXRsZScpIHx8ICcnKS5hdHRyKCd0aXRsZScsICcnKVxuICAgIH1cbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmhhc0NvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VGl0bGUoKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbiAoJGVsZW1lbnQpIHtcbiAgICAkZWxlbWVudCAgID0gJGVsZW1lbnQgfHwgdGhpcy4kZWxlbWVudFxuXG4gICAgdmFyIGVsICAgICA9ICRlbGVtZW50WzBdXG4gICAgdmFyIGlzQm9keSA9IGVsLnRhZ05hbWUgPT0gJ0JPRFknXG5cbiAgICB2YXIgZWxSZWN0ICAgID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBpZiAoZWxSZWN0LndpZHRoID09IG51bGwpIHtcbiAgICAgIC8vIHdpZHRoIGFuZCBoZWlnaHQgYXJlIG1pc3NpbmcgaW4gSUU4LCBzbyBjb21wdXRlIHRoZW0gbWFudWFsbHk7IHNlZSBodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvaXNzdWVzLzE0MDkzXG4gICAgICBlbFJlY3QgPSAkLmV4dGVuZCh7fSwgZWxSZWN0LCB7IHdpZHRoOiBlbFJlY3QucmlnaHQgLSBlbFJlY3QubGVmdCwgaGVpZ2h0OiBlbFJlY3QuYm90dG9tIC0gZWxSZWN0LnRvcCB9KVxuICAgIH1cbiAgICB2YXIgaXNTdmcgPSB3aW5kb3cuU1ZHRWxlbWVudCAmJiBlbCBpbnN0YW5jZW9mIHdpbmRvdy5TVkdFbGVtZW50XG4gICAgLy8gQXZvaWQgdXNpbmcgJC5vZmZzZXQoKSBvbiBTVkdzIHNpbmNlIGl0IGdpdmVzIGluY29ycmVjdCByZXN1bHRzIGluIGpRdWVyeSAzLlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvaXNzdWVzLzIwMjgwXG4gICAgdmFyIGVsT2Zmc2V0ICA9IGlzQm9keSA/IHsgdG9wOiAwLCBsZWZ0OiAwIH0gOiAoaXNTdmcgPyBudWxsIDogJGVsZW1lbnQub2Zmc2V0KCkpXG4gICAgdmFyIHNjcm9sbCAgICA9IHsgc2Nyb2xsOiBpc0JvZHkgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIDogJGVsZW1lbnQuc2Nyb2xsVG9wKCkgfVxuICAgIHZhciBvdXRlckRpbXMgPSBpc0JvZHkgPyB7IHdpZHRoOiAkKHdpbmRvdykud2lkdGgoKSwgaGVpZ2h0OiAkKHdpbmRvdykuaGVpZ2h0KCkgfSA6IG51bGxcblxuICAgIHJldHVybiAkLmV4dGVuZCh7fSwgZWxSZWN0LCBzY3JvbGwsIG91dGVyRGltcywgZWxPZmZzZXQpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRDYWxjdWxhdGVkT2Zmc2V0ID0gZnVuY3Rpb24gKHBsYWNlbWVudCwgcG9zLCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KSB7XG4gICAgcmV0dXJuIHBsYWNlbWVudCA9PSAnYm90dG9tJyA/IHsgdG9wOiBwb3MudG9wICsgcG9zLmhlaWdodCwgICBsZWZ0OiBwb3MubGVmdCArIHBvcy53aWR0aCAvIDIgLSBhY3R1YWxXaWR0aCAvIDIgfSA6XG4gICAgICAgICAgIHBsYWNlbWVudCA9PSAndG9wJyAgICA/IHsgdG9wOiBwb3MudG9wIC0gYWN0dWFsSGVpZ2h0LCBsZWZ0OiBwb3MubGVmdCArIHBvcy53aWR0aCAvIDIgLSBhY3R1YWxXaWR0aCAvIDIgfSA6XG4gICAgICAgICAgIHBsYWNlbWVudCA9PSAnbGVmdCcgICA/IHsgdG9wOiBwb3MudG9wICsgcG9zLmhlaWdodCAvIDIgLSBhY3R1YWxIZWlnaHQgLyAyLCBsZWZ0OiBwb3MubGVmdCAtIGFjdHVhbFdpZHRoIH0gOlxuICAgICAgICAvKiBwbGFjZW1lbnQgPT0gJ3JpZ2h0JyAqLyB7IHRvcDogcG9zLnRvcCArIHBvcy5oZWlnaHQgLyAyIC0gYWN0dWFsSGVpZ2h0IC8gMiwgbGVmdDogcG9zLmxlZnQgKyBwb3Mud2lkdGggfVxuXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRWaWV3cG9ydEFkanVzdGVkRGVsdGEgPSBmdW5jdGlvbiAocGxhY2VtZW50LCBwb3MsIGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpIHtcbiAgICB2YXIgZGVsdGEgPSB7IHRvcDogMCwgbGVmdDogMCB9XG4gICAgaWYgKCF0aGlzLiR2aWV3cG9ydCkgcmV0dXJuIGRlbHRhXG5cbiAgICB2YXIgdmlld3BvcnRQYWRkaW5nID0gdGhpcy5vcHRpb25zLnZpZXdwb3J0ICYmIHRoaXMub3B0aW9ucy52aWV3cG9ydC5wYWRkaW5nIHx8IDBcbiAgICB2YXIgdmlld3BvcnREaW1lbnNpb25zID0gdGhpcy5nZXRQb3NpdGlvbih0aGlzLiR2aWV3cG9ydClcblxuICAgIGlmICgvcmlnaHR8bGVmdC8udGVzdChwbGFjZW1lbnQpKSB7XG4gICAgICB2YXIgdG9wRWRnZU9mZnNldCAgICA9IHBvcy50b3AgLSB2aWV3cG9ydFBhZGRpbmcgLSB2aWV3cG9ydERpbWVuc2lvbnMuc2Nyb2xsXG4gICAgICB2YXIgYm90dG9tRWRnZU9mZnNldCA9IHBvcy50b3AgKyB2aWV3cG9ydFBhZGRpbmcgLSB2aWV3cG9ydERpbWVuc2lvbnMuc2Nyb2xsICsgYWN0dWFsSGVpZ2h0XG4gICAgICBpZiAodG9wRWRnZU9mZnNldCA8IHZpZXdwb3J0RGltZW5zaW9ucy50b3ApIHsgLy8gdG9wIG92ZXJmbG93XG4gICAgICAgIGRlbHRhLnRvcCA9IHZpZXdwb3J0RGltZW5zaW9ucy50b3AgLSB0b3BFZGdlT2Zmc2V0XG4gICAgICB9IGVsc2UgaWYgKGJvdHRvbUVkZ2VPZmZzZXQgPiB2aWV3cG9ydERpbWVuc2lvbnMudG9wICsgdmlld3BvcnREaW1lbnNpb25zLmhlaWdodCkgeyAvLyBib3R0b20gb3ZlcmZsb3dcbiAgICAgICAgZGVsdGEudG9wID0gdmlld3BvcnREaW1lbnNpb25zLnRvcCArIHZpZXdwb3J0RGltZW5zaW9ucy5oZWlnaHQgLSBib3R0b21FZGdlT2Zmc2V0XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBsZWZ0RWRnZU9mZnNldCAgPSBwb3MubGVmdCAtIHZpZXdwb3J0UGFkZGluZ1xuICAgICAgdmFyIHJpZ2h0RWRnZU9mZnNldCA9IHBvcy5sZWZ0ICsgdmlld3BvcnRQYWRkaW5nICsgYWN0dWFsV2lkdGhcbiAgICAgIGlmIChsZWZ0RWRnZU9mZnNldCA8IHZpZXdwb3J0RGltZW5zaW9ucy5sZWZ0KSB7IC8vIGxlZnQgb3ZlcmZsb3dcbiAgICAgICAgZGVsdGEubGVmdCA9IHZpZXdwb3J0RGltZW5zaW9ucy5sZWZ0IC0gbGVmdEVkZ2VPZmZzZXRcbiAgICAgIH0gZWxzZSBpZiAocmlnaHRFZGdlT2Zmc2V0ID4gdmlld3BvcnREaW1lbnNpb25zLnJpZ2h0KSB7IC8vIHJpZ2h0IG92ZXJmbG93XG4gICAgICAgIGRlbHRhLmxlZnQgPSB2aWV3cG9ydERpbWVuc2lvbnMubGVmdCArIHZpZXdwb3J0RGltZW5zaW9ucy53aWR0aCAtIHJpZ2h0RWRnZU9mZnNldFxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkZWx0YVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0VGl0bGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRpdGxlXG4gICAgdmFyICRlID0gdGhpcy4kZWxlbWVudFxuICAgIHZhciBvICA9IHRoaXMub3B0aW9uc1xuXG4gICAgdGl0bGUgPSAkZS5hdHRyKCdkYXRhLW9yaWdpbmFsLXRpdGxlJylcbiAgICAgIHx8ICh0eXBlb2Ygby50aXRsZSA9PSAnZnVuY3Rpb24nID8gby50aXRsZS5jYWxsKCRlWzBdKSA6ICBvLnRpdGxlKVxuXG4gICAgcmV0dXJuIHRpdGxlXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRVSUQgPSBmdW5jdGlvbiAocHJlZml4KSB7XG4gICAgZG8gcHJlZml4ICs9IH5+KE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwKVxuICAgIHdoaWxlIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwcmVmaXgpKVxuICAgIHJldHVybiBwcmVmaXhcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnRpcCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuJHRpcCkge1xuICAgICAgdGhpcy4kdGlwID0gJCh0aGlzLm9wdGlvbnMudGVtcGxhdGUpXG4gICAgICBpZiAodGhpcy4kdGlwLmxlbmd0aCAhPSAxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0aGlzLnR5cGUgKyAnIGB0ZW1wbGF0ZWAgb3B0aW9uIG11c3QgY29uc2lzdCBvZiBleGFjdGx5IDEgdG9wLWxldmVsIGVsZW1lbnQhJylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuJHRpcFxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuYXJyb3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh0aGlzLiRhcnJvdyA9IHRoaXMuJGFycm93IHx8IHRoaXMudGlwKCkuZmluZCgnLnRvb2x0aXAtYXJyb3cnKSlcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS50b2dnbGVFbmFibGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZW5hYmxlZCA9ICF0aGlzLmVuYWJsZWRcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgaWYgKGUpIHtcbiAgICAgIHNlbGYgPSAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSlcbiAgICAgIGlmICghc2VsZikge1xuICAgICAgICBzZWxmID0gbmV3IHRoaXMuY29uc3RydWN0b3IoZS5jdXJyZW50VGFyZ2V0LCB0aGlzLmdldERlbGVnYXRlT3B0aW9ucygpKVxuICAgICAgICAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSwgc2VsZilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZSkge1xuICAgICAgc2VsZi5pblN0YXRlLmNsaWNrID0gIXNlbGYuaW5TdGF0ZS5jbGlja1xuICAgICAgaWYgKHNlbGYuaXNJblN0YXRlVHJ1ZSgpKSBzZWxmLmVudGVyKHNlbGYpXG4gICAgICBlbHNlIHNlbGYubGVhdmUoc2VsZilcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi50aXAoKS5oYXNDbGFzcygnaW4nKSA/IHNlbGYubGVhdmUoc2VsZikgOiBzZWxmLmVudGVyKHNlbGYpXG4gICAgfVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KVxuICAgIHRoaXMuaGlkZShmdW5jdGlvbiAoKSB7XG4gICAgICB0aGF0LiRlbGVtZW50Lm9mZignLicgKyB0aGF0LnR5cGUpLnJlbW92ZURhdGEoJ2JzLicgKyB0aGF0LnR5cGUpXG4gICAgICBpZiAodGhhdC4kdGlwKSB7XG4gICAgICAgIHRoYXQuJHRpcC5kZXRhY2goKVxuICAgICAgfVxuICAgICAgdGhhdC4kdGlwID0gbnVsbFxuICAgICAgdGhhdC4kYXJyb3cgPSBudWxsXG4gICAgICB0aGF0LiR2aWV3cG9ydCA9IG51bGxcbiAgICAgIHRoYXQuJGVsZW1lbnQgPSBudWxsXG4gICAgfSlcbiAgfVxuXG5cbiAgLy8gVE9PTFRJUCBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLnRvb2x0aXAnKVxuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxuXG4gICAgICBpZiAoIWRhdGEgJiYgL2Rlc3Ryb3l8aGlkZS8udGVzdChvcHRpb24pKSByZXR1cm5cbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMudG9vbHRpcCcsIChkYXRhID0gbmV3IFRvb2x0aXAodGhpcywgb3B0aW9ucykpKVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXG4gICAgfSlcbiAgfVxuXG4gIHZhciBvbGQgPSAkLmZuLnRvb2x0aXBcblxuICAkLmZuLnRvb2x0aXAgICAgICAgICAgICAgPSBQbHVnaW5cbiAgJC5mbi50b29sdGlwLkNvbnN0cnVjdG9yID0gVG9vbHRpcFxuXG5cbiAgLy8gVE9PTFRJUCBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT09PT09XG5cbiAgJC5mbi50b29sdGlwLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi50b29sdGlwID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG59KGpRdWVyeSk7XG4iLCIvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEJvb3RzdHJhcDogcG9wb3Zlci5qcyB2My4zLjdcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI3BvcG92ZXJzXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbitmdW5jdGlvbiAoJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gUE9QT1ZFUiBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgdmFyIFBvcG92ZXIgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuaW5pdCgncG9wb3ZlcicsIGVsZW1lbnQsIG9wdGlvbnMpXG4gIH1cblxuICBpZiAoISQuZm4udG9vbHRpcCkgdGhyb3cgbmV3IEVycm9yKCdQb3BvdmVyIHJlcXVpcmVzIHRvb2x0aXAuanMnKVxuXG4gIFBvcG92ZXIuVkVSU0lPTiAgPSAnMy4zLjcnXG5cbiAgUG9wb3Zlci5ERUZBVUxUUyA9ICQuZXh0ZW5kKHt9LCAkLmZuLnRvb2x0aXAuQ29uc3RydWN0b3IuREVGQVVMVFMsIHtcbiAgICBwbGFjZW1lbnQ6ICdyaWdodCcsXG4gICAgdHJpZ2dlcjogJ2NsaWNrJyxcbiAgICBjb250ZW50OiAnJyxcbiAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJwb3BvdmVyXCIgcm9sZT1cInRvb2x0aXBcIj48ZGl2IGNsYXNzPVwiYXJyb3dcIj48L2Rpdj48aDMgY2xhc3M9XCJwb3BvdmVyLXRpdGxlXCI+PC9oMz48ZGl2IGNsYXNzPVwicG9wb3Zlci1jb250ZW50XCI+PC9kaXY+PC9kaXY+J1xuICB9KVxuXG5cbiAgLy8gTk9URTogUE9QT1ZFUiBFWFRFTkRTIHRvb2x0aXAuanNcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBQb3BvdmVyLnByb3RvdHlwZSA9ICQuZXh0ZW5kKHt9LCAkLmZuLnRvb2x0aXAuQ29uc3RydWN0b3IucHJvdG90eXBlKVxuXG4gIFBvcG92ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUG9wb3ZlclxuXG4gIFBvcG92ZXIucHJvdG90eXBlLmdldERlZmF1bHRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBQb3BvdmVyLkRFRkFVTFRTXG4gIH1cblxuICBQb3BvdmVyLnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciAkdGlwICAgID0gdGhpcy50aXAoKVxuICAgIHZhciB0aXRsZSAgID0gdGhpcy5nZXRUaXRsZSgpXG4gICAgdmFyIGNvbnRlbnQgPSB0aGlzLmdldENvbnRlbnQoKVxuXG4gICAgJHRpcC5maW5kKCcucG9wb3Zlci10aXRsZScpW3RoaXMub3B0aW9ucy5odG1sID8gJ2h0bWwnIDogJ3RleHQnXSh0aXRsZSlcbiAgICAkdGlwLmZpbmQoJy5wb3BvdmVyLWNvbnRlbnQnKS5jaGlsZHJlbigpLmRldGFjaCgpLmVuZCgpWyAvLyB3ZSB1c2UgYXBwZW5kIGZvciBodG1sIG9iamVjdHMgdG8gbWFpbnRhaW4ganMgZXZlbnRzXG4gICAgICB0aGlzLm9wdGlvbnMuaHRtbCA/ICh0eXBlb2YgY29udGVudCA9PSAnc3RyaW5nJyA/ICdodG1sJyA6ICdhcHBlbmQnKSA6ICd0ZXh0J1xuICAgIF0oY29udGVudClcblxuICAgICR0aXAucmVtb3ZlQ2xhc3MoJ2ZhZGUgdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0IGluJylcblxuICAgIC8vIElFOCBkb2Vzbid0IGFjY2VwdCBoaWRpbmcgdmlhIHRoZSBgOmVtcHR5YCBwc2V1ZG8gc2VsZWN0b3IsIHdlIGhhdmUgdG8gZG9cbiAgICAvLyB0aGlzIG1hbnVhbGx5IGJ5IGNoZWNraW5nIHRoZSBjb250ZW50cy5cbiAgICBpZiAoISR0aXAuZmluZCgnLnBvcG92ZXItdGl0bGUnKS5odG1sKCkpICR0aXAuZmluZCgnLnBvcG92ZXItdGl0bGUnKS5oaWRlKClcbiAgfVxuXG4gIFBvcG92ZXIucHJvdG90eXBlLmhhc0NvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VGl0bGUoKSB8fCB0aGlzLmdldENvbnRlbnQoKVxuICB9XG5cbiAgUG9wb3Zlci5wcm90b3R5cGUuZ2V0Q29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJGUgPSB0aGlzLiRlbGVtZW50XG4gICAgdmFyIG8gID0gdGhpcy5vcHRpb25zXG5cbiAgICByZXR1cm4gJGUuYXR0cignZGF0YS1jb250ZW50JylcbiAgICAgIHx8ICh0eXBlb2Ygby5jb250ZW50ID09ICdmdW5jdGlvbicgP1xuICAgICAgICAgICAgby5jb250ZW50LmNhbGwoJGVbMF0pIDpcbiAgICAgICAgICAgIG8uY29udGVudClcbiAgfVxuXG4gIFBvcG92ZXIucHJvdG90eXBlLmFycm93ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAodGhpcy4kYXJyb3cgPSB0aGlzLiRhcnJvdyB8fCB0aGlzLnRpcCgpLmZpbmQoJy5hcnJvdycpKVxuICB9XG5cblxuICAvLyBQT1BPVkVSIFBMVUdJTiBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMucG9wb3ZlcicpXG4gICAgICB2YXIgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uXG5cbiAgICAgIGlmICghZGF0YSAmJiAvZGVzdHJveXxoaWRlLy50ZXN0KG9wdGlvbikpIHJldHVyblxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5wb3BvdmVyJywgKGRhdGEgPSBuZXcgUG9wb3Zlcih0aGlzLCBvcHRpb25zKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgdmFyIG9sZCA9ICQuZm4ucG9wb3ZlclxuXG4gICQuZm4ucG9wb3ZlciAgICAgICAgICAgICA9IFBsdWdpblxuICAkLmZuLnBvcG92ZXIuQ29uc3RydWN0b3IgPSBQb3BvdmVyXG5cblxuICAvLyBQT1BPVkVSIE5PIENPTkZMSUNUXG4gIC8vID09PT09PT09PT09PT09PT09PT1cblxuICAkLmZuLnBvcG92ZXIubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLnBvcG92ZXIgPSBvbGRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbn0oalF1ZXJ5KTtcbiIsIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiBtb2RhbC5qcyB2My4zLjdcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI21vZGFsc1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4rZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIE1PREFMIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBNb2RhbCA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zICAgICAgICAgICAgID0gb3B0aW9uc1xuICAgIHRoaXMuJGJvZHkgICAgICAgICAgICAgICA9ICQoZG9jdW1lbnQuYm9keSlcbiAgICB0aGlzLiRlbGVtZW50ICAgICAgICAgICAgPSAkKGVsZW1lbnQpXG4gICAgdGhpcy4kZGlhbG9nICAgICAgICAgICAgID0gdGhpcy4kZWxlbWVudC5maW5kKCcubW9kYWwtZGlhbG9nJylcbiAgICB0aGlzLiRiYWNrZHJvcCAgICAgICAgICAgPSBudWxsXG4gICAgdGhpcy5pc1Nob3duICAgICAgICAgICAgID0gbnVsbFxuICAgIHRoaXMub3JpZ2luYWxCb2R5UGFkICAgICA9IG51bGxcbiAgICB0aGlzLnNjcm9sbGJhcldpZHRoICAgICAgPSAwXG4gICAgdGhpcy5pZ25vcmVCYWNrZHJvcENsaWNrID0gZmFsc2VcblxuICAgIGlmICh0aGlzLm9wdGlvbnMucmVtb3RlKSB7XG4gICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAgIC5maW5kKCcubW9kYWwtY29udGVudCcpXG4gICAgICAgIC5sb2FkKHRoaXMub3B0aW9ucy5yZW1vdGUsICQucHJveHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignbG9hZGVkLmJzLm1vZGFsJylcbiAgICAgICAgfSwgdGhpcykpXG4gICAgfVxuICB9XG5cbiAgTW9kYWwuVkVSU0lPTiAgPSAnMy4zLjcnXG5cbiAgTW9kYWwuVFJBTlNJVElPTl9EVVJBVElPTiA9IDMwMFxuICBNb2RhbC5CQUNLRFJPUF9UUkFOU0lUSU9OX0RVUkFUSU9OID0gMTUwXG5cbiAgTW9kYWwuREVGQVVMVFMgPSB7XG4gICAgYmFja2Ryb3A6IHRydWUsXG4gICAga2V5Ym9hcmQ6IHRydWUsXG4gICAgc2hvdzogdHJ1ZVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uIChfcmVsYXRlZFRhcmdldCkge1xuICAgIHJldHVybiB0aGlzLmlzU2hvd24gPyB0aGlzLmhpZGUoKSA6IHRoaXMuc2hvdyhfcmVsYXRlZFRhcmdldClcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKF9yZWxhdGVkVGFyZ2V0KSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgdmFyIGUgICAgPSAkLkV2ZW50KCdzaG93LmJzLm1vZGFsJywgeyByZWxhdGVkVGFyZ2V0OiBfcmVsYXRlZFRhcmdldCB9KVxuXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXG5cbiAgICBpZiAodGhpcy5pc1Nob3duIHx8IGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxuXG4gICAgdGhpcy5pc1Nob3duID0gdHJ1ZVxuXG4gICAgdGhpcy5jaGVja1Njcm9sbGJhcigpXG4gICAgdGhpcy5zZXRTY3JvbGxiYXIoKVxuICAgIHRoaXMuJGJvZHkuYWRkQ2xhc3MoJ21vZGFsLW9wZW4nKVxuXG4gICAgdGhpcy5lc2NhcGUoKVxuICAgIHRoaXMucmVzaXplKClcblxuICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrLmRpc21pc3MuYnMubW9kYWwnLCAnW2RhdGEtZGlzbWlzcz1cIm1vZGFsXCJdJywgJC5wcm94eSh0aGlzLmhpZGUsIHRoaXMpKVxuXG4gICAgdGhpcy4kZGlhbG9nLm9uKCdtb3VzZWRvd24uZGlzbWlzcy5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoYXQuJGVsZW1lbnQub25lKCdtb3VzZXVwLmRpc21pc3MuYnMubW9kYWwnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoJChlLnRhcmdldCkuaXModGhhdC4kZWxlbWVudCkpIHRoYXQuaWdub3JlQmFja2Ryb3BDbGljayA9IHRydWVcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIHRoaXMuYmFja2Ryb3AoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHRyYW5zaXRpb24gPSAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGF0LiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJylcblxuICAgICAgaWYgKCF0aGF0LiRlbGVtZW50LnBhcmVudCgpLmxlbmd0aCkge1xuICAgICAgICB0aGF0LiRlbGVtZW50LmFwcGVuZFRvKHRoYXQuJGJvZHkpIC8vIGRvbid0IG1vdmUgbW9kYWxzIGRvbSBwb3NpdGlvblxuICAgICAgfVxuXG4gICAgICB0aGF0LiRlbGVtZW50XG4gICAgICAgIC5zaG93KClcbiAgICAgICAgLnNjcm9sbFRvcCgwKVxuXG4gICAgICB0aGF0LmFkanVzdERpYWxvZygpXG5cbiAgICAgIGlmICh0cmFuc2l0aW9uKSB7XG4gICAgICAgIHRoYXQuJGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGggLy8gZm9yY2UgcmVmbG93XG4gICAgICB9XG5cbiAgICAgIHRoYXQuJGVsZW1lbnQuYWRkQ2xhc3MoJ2luJylcblxuICAgICAgdGhhdC5lbmZvcmNlRm9jdXMoKVxuXG4gICAgICB2YXIgZSA9ICQuRXZlbnQoJ3Nob3duLmJzLm1vZGFsJywgeyByZWxhdGVkVGFyZ2V0OiBfcmVsYXRlZFRhcmdldCB9KVxuXG4gICAgICB0cmFuc2l0aW9uID9cbiAgICAgICAgdGhhdC4kZGlhbG9nIC8vIHdhaXQgZm9yIG1vZGFsIHRvIHNsaWRlIGluXG4gICAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhhdC4kZWxlbWVudC50cmlnZ2VyKCdmb2N1cycpLnRyaWdnZXIoZSlcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChNb2RhbC5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XG4gICAgICAgIHRoYXQuJGVsZW1lbnQudHJpZ2dlcignZm9jdXMnKS50cmlnZ2VyKGUpXG4gICAgfSlcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZSkgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICBlID0gJC5FdmVudCgnaGlkZS5icy5tb2RhbCcpXG5cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcblxuICAgIGlmICghdGhpcy5pc1Nob3duIHx8IGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxuXG4gICAgdGhpcy5pc1Nob3duID0gZmFsc2VcblxuICAgIHRoaXMuZXNjYXBlKClcbiAgICB0aGlzLnJlc2l6ZSgpXG5cbiAgICAkKGRvY3VtZW50KS5vZmYoJ2ZvY3VzaW4uYnMubW9kYWwnKVxuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLnJlbW92ZUNsYXNzKCdpbicpXG4gICAgICAub2ZmKCdjbGljay5kaXNtaXNzLmJzLm1vZGFsJylcbiAgICAgIC5vZmYoJ21vdXNldXAuZGlzbWlzcy5icy5tb2RhbCcpXG5cbiAgICB0aGlzLiRkaWFsb2cub2ZmKCdtb3VzZWRvd24uZGlzbWlzcy5icy5tb2RhbCcpXG5cbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJykgP1xuICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCAkLnByb3h5KHRoaXMuaGlkZU1vZGFsLCB0aGlzKSlcbiAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKE1vZGFsLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcbiAgICAgIHRoaXMuaGlkZU1vZGFsKClcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5lbmZvcmNlRm9jdXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgJChkb2N1bWVudClcbiAgICAgIC5vZmYoJ2ZvY3VzaW4uYnMubW9kYWwnKSAvLyBndWFyZCBhZ2FpbnN0IGluZmluaXRlIGZvY3VzIGxvb3BcbiAgICAgIC5vbignZm9jdXNpbi5icy5tb2RhbCcsICQucHJveHkoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50ICE9PSBlLnRhcmdldCAmJlxuICAgICAgICAgICAgdGhpcy4kZWxlbWVudFswXSAhPT0gZS50YXJnZXQgJiZcbiAgICAgICAgICAgICF0aGlzLiRlbGVtZW50LmhhcyhlLnRhcmdldCkubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdmb2N1cycpXG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpKVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLmVzY2FwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5pc1Nob3duICYmIHRoaXMub3B0aW9ucy5rZXlib2FyZCkge1xuICAgICAgdGhpcy4kZWxlbWVudC5vbigna2V5ZG93bi5kaXNtaXNzLmJzLm1vZGFsJywgJC5wcm94eShmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLndoaWNoID09IDI3ICYmIHRoaXMuaGlkZSgpXG4gICAgICB9LCB0aGlzKSlcbiAgICB9IGVsc2UgaWYgKCF0aGlzLmlzU2hvd24pIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdrZXlkb3duLmRpc21pc3MuYnMubW9kYWwnKVxuICAgIH1cbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuaXNTaG93bikge1xuICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuYnMubW9kYWwnLCAkLnByb3h5KHRoaXMuaGFuZGxlVXBkYXRlLCB0aGlzKSlcbiAgICB9IGVsc2Uge1xuICAgICAgJCh3aW5kb3cpLm9mZigncmVzaXplLmJzLm1vZGFsJylcbiAgICB9XG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuaGlkZU1vZGFsID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuICAgIHRoaXMuJGVsZW1lbnQuaGlkZSgpXG4gICAgdGhpcy5iYWNrZHJvcChmdW5jdGlvbiAoKSB7XG4gICAgICB0aGF0LiRib2R5LnJlbW92ZUNsYXNzKCdtb2RhbC1vcGVuJylcbiAgICAgIHRoYXQucmVzZXRBZGp1c3RtZW50cygpXG4gICAgICB0aGF0LnJlc2V0U2Nyb2xsYmFyKClcbiAgICAgIHRoYXQuJGVsZW1lbnQudHJpZ2dlcignaGlkZGVuLmJzLm1vZGFsJylcbiAgICB9KVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLnJlbW92ZUJhY2tkcm9wID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuJGJhY2tkcm9wICYmIHRoaXMuJGJhY2tkcm9wLnJlbW92ZSgpXG4gICAgdGhpcy4kYmFja2Ryb3AgPSBudWxsXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuYmFja2Ryb3AgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICB2YXIgYW5pbWF0ZSA9IHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2ZhZGUnKSA/ICdmYWRlJyA6ICcnXG5cbiAgICBpZiAodGhpcy5pc1Nob3duICYmIHRoaXMub3B0aW9ucy5iYWNrZHJvcCkge1xuICAgICAgdmFyIGRvQW5pbWF0ZSA9ICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIGFuaW1hdGVcblxuICAgICAgdGhpcy4kYmFja2Ryb3AgPSAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKVxuICAgICAgICAuYWRkQ2xhc3MoJ21vZGFsLWJhY2tkcm9wICcgKyBhbmltYXRlKVxuICAgICAgICAuYXBwZW5kVG8odGhpcy4kYm9keSlcblxuICAgICAgdGhpcy4kZWxlbWVudC5vbignY2xpY2suZGlzbWlzcy5icy5tb2RhbCcsICQucHJveHkoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHRoaXMuaWdub3JlQmFja2Ryb3BDbGljaykge1xuICAgICAgICAgIHRoaXMuaWdub3JlQmFja2Ryb3BDbGljayA9IGZhbHNlXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGUudGFyZ2V0ICE9PSBlLmN1cnJlbnRUYXJnZXQpIHJldHVyblxuICAgICAgICB0aGlzLm9wdGlvbnMuYmFja2Ryb3AgPT0gJ3N0YXRpYydcbiAgICAgICAgICA/IHRoaXMuJGVsZW1lbnRbMF0uZm9jdXMoKVxuICAgICAgICAgIDogdGhpcy5oaWRlKClcbiAgICAgIH0sIHRoaXMpKVxuXG4gICAgICBpZiAoZG9BbmltYXRlKSB0aGlzLiRiYWNrZHJvcFswXS5vZmZzZXRXaWR0aCAvLyBmb3JjZSByZWZsb3dcblxuICAgICAgdGhpcy4kYmFja2Ryb3AuYWRkQ2xhc3MoJ2luJylcblxuICAgICAgaWYgKCFjYWxsYmFjaykgcmV0dXJuXG5cbiAgICAgIGRvQW5pbWF0ZSA/XG4gICAgICAgIHRoaXMuJGJhY2tkcm9wXG4gICAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgY2FsbGJhY2spXG4gICAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKE1vZGFsLkJBQ0tEUk9QX1RSQU5TSVRJT05fRFVSQVRJT04pIDpcbiAgICAgICAgY2FsbGJhY2soKVxuXG4gICAgfSBlbHNlIGlmICghdGhpcy5pc1Nob3duICYmIHRoaXMuJGJhY2tkcm9wKSB7XG4gICAgICB0aGlzLiRiYWNrZHJvcC5yZW1vdmVDbGFzcygnaW4nKVxuXG4gICAgICB2YXIgY2FsbGJhY2tSZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoYXQucmVtb3ZlQmFja2Ryb3AoKVxuICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpXG4gICAgICB9XG4gICAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJykgP1xuICAgICAgICB0aGlzLiRiYWNrZHJvcFxuICAgICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGNhbGxiYWNrUmVtb3ZlKVxuICAgICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChNb2RhbC5CQUNLRFJPUF9UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XG4gICAgICAgIGNhbGxiYWNrUmVtb3ZlKClcblxuICAgIH0gZWxzZSBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrKClcbiAgICB9XG4gIH1cblxuICAvLyB0aGVzZSBmb2xsb3dpbmcgbWV0aG9kcyBhcmUgdXNlZCB0byBoYW5kbGUgb3ZlcmZsb3dpbmcgbW9kYWxzXG5cbiAgTW9kYWwucHJvdG90eXBlLmhhbmRsZVVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFkanVzdERpYWxvZygpXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuYWRqdXN0RGlhbG9nID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBtb2RhbElzT3ZlcmZsb3dpbmcgPSB0aGlzLiRlbGVtZW50WzBdLnNjcm9sbEhlaWdodCA+IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHRcblxuICAgIHRoaXMuJGVsZW1lbnQuY3NzKHtcbiAgICAgIHBhZGRpbmdMZWZ0OiAgIXRoaXMuYm9keUlzT3ZlcmZsb3dpbmcgJiYgbW9kYWxJc092ZXJmbG93aW5nID8gdGhpcy5zY3JvbGxiYXJXaWR0aCA6ICcnLFxuICAgICAgcGFkZGluZ1JpZ2h0OiB0aGlzLmJvZHlJc092ZXJmbG93aW5nICYmICFtb2RhbElzT3ZlcmZsb3dpbmcgPyB0aGlzLnNjcm9sbGJhcldpZHRoIDogJydcbiAgICB9KVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLnJlc2V0QWRqdXN0bWVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy4kZWxlbWVudC5jc3Moe1xuICAgICAgcGFkZGluZ0xlZnQ6ICcnLFxuICAgICAgcGFkZGluZ1JpZ2h0OiAnJ1xuICAgIH0pXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuY2hlY2tTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZ1bGxXaW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgaWYgKCFmdWxsV2luZG93V2lkdGgpIHsgLy8gd29ya2Fyb3VuZCBmb3IgbWlzc2luZyB3aW5kb3cuaW5uZXJXaWR0aCBpbiBJRThcbiAgICAgIHZhciBkb2N1bWVudEVsZW1lbnRSZWN0ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBmdWxsV2luZG93V2lkdGggPSBkb2N1bWVudEVsZW1lbnRSZWN0LnJpZ2h0IC0gTWF0aC5hYnMoZG9jdW1lbnRFbGVtZW50UmVjdC5sZWZ0KVxuICAgIH1cbiAgICB0aGlzLmJvZHlJc092ZXJmbG93aW5nID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCA8IGZ1bGxXaW5kb3dXaWR0aFxuICAgIHRoaXMuc2Nyb2xsYmFyV2lkdGggPSB0aGlzLm1lYXN1cmVTY3JvbGxiYXIoKVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLnNldFNjcm9sbGJhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYm9keVBhZCA9IHBhcnNlSW50KCh0aGlzLiRib2R5LmNzcygncGFkZGluZy1yaWdodCcpIHx8IDApLCAxMClcbiAgICB0aGlzLm9yaWdpbmFsQm9keVBhZCA9IGRvY3VtZW50LmJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0IHx8ICcnXG4gICAgaWYgKHRoaXMuYm9keUlzT3ZlcmZsb3dpbmcpIHRoaXMuJGJvZHkuY3NzKCdwYWRkaW5nLXJpZ2h0JywgYm9keVBhZCArIHRoaXMuc2Nyb2xsYmFyV2lkdGgpXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUucmVzZXRTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy4kYm9keS5jc3MoJ3BhZGRpbmctcmlnaHQnLCB0aGlzLm9yaWdpbmFsQm9keVBhZClcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5tZWFzdXJlU2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkgeyAvLyB0aHggd2Fsc2hcbiAgICB2YXIgc2Nyb2xsRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBzY3JvbGxEaXYuY2xhc3NOYW1lID0gJ21vZGFsLXNjcm9sbGJhci1tZWFzdXJlJ1xuICAgIHRoaXMuJGJvZHkuYXBwZW5kKHNjcm9sbERpdilcbiAgICB2YXIgc2Nyb2xsYmFyV2lkdGggPSBzY3JvbGxEaXYub2Zmc2V0V2lkdGggLSBzY3JvbGxEaXYuY2xpZW50V2lkdGhcbiAgICB0aGlzLiRib2R5WzBdLnJlbW92ZUNoaWxkKHNjcm9sbERpdilcbiAgICByZXR1cm4gc2Nyb2xsYmFyV2lkdGhcbiAgfVxuXG5cbiAgLy8gTU9EQUwgUExVR0lOIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uLCBfcmVsYXRlZFRhcmdldCkge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLm1vZGFsJylcbiAgICAgIHZhciBvcHRpb25zID0gJC5leHRlbmQoe30sIE1vZGFsLkRFRkFVTFRTLCAkdGhpcy5kYXRhKCksIHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uKVxuXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLm1vZGFsJywgKGRhdGEgPSBuZXcgTW9kYWwodGhpcywgb3B0aW9ucykpKVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXShfcmVsYXRlZFRhcmdldClcbiAgICAgIGVsc2UgaWYgKG9wdGlvbnMuc2hvdykgZGF0YS5zaG93KF9yZWxhdGVkVGFyZ2V0KVxuICAgIH0pXG4gIH1cblxuICB2YXIgb2xkID0gJC5mbi5tb2RhbFxuXG4gICQuZm4ubW9kYWwgICAgICAgICAgICAgPSBQbHVnaW5cbiAgJC5mbi5tb2RhbC5Db25zdHJ1Y3RvciA9IE1vZGFsXG5cblxuICAvLyBNT0RBTCBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT09PVxuXG4gICQuZm4ubW9kYWwubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLm1vZGFsID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAgLy8gTU9EQUwgREFUQS1BUElcbiAgLy8gPT09PT09PT09PT09PT1cblxuICAkKGRvY3VtZW50KS5vbignY2xpY2suYnMubW9kYWwuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwibW9kYWxcIl0nLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgIHZhciBocmVmICAgID0gJHRoaXMuYXR0cignaHJlZicpXG4gICAgdmFyICR0YXJnZXQgPSAkKCR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JykgfHwgKGhyZWYgJiYgaHJlZi5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLCAnJykpKSAvLyBzdHJpcCBmb3IgaWU3XG4gICAgdmFyIG9wdGlvbiAgPSAkdGFyZ2V0LmRhdGEoJ2JzLm1vZGFsJykgPyAndG9nZ2xlJyA6ICQuZXh0ZW5kKHsgcmVtb3RlOiAhLyMvLnRlc3QoaHJlZikgJiYgaHJlZiB9LCAkdGFyZ2V0LmRhdGEoKSwgJHRoaXMuZGF0YSgpKVxuXG4gICAgaWYgKCR0aGlzLmlzKCdhJykpIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgJHRhcmdldC5vbmUoJ3Nob3cuYnMubW9kYWwnLCBmdW5jdGlvbiAoc2hvd0V2ZW50KSB7XG4gICAgICBpZiAoc2hvd0V2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm4gLy8gb25seSByZWdpc3RlciBmb2N1cyByZXN0b3JlciBpZiBtb2RhbCB3aWxsIGFjdHVhbGx5IGdldCBzaG93blxuICAgICAgJHRhcmdldC5vbmUoJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHRoaXMuaXMoJzp2aXNpYmxlJykgJiYgJHRoaXMudHJpZ2dlcignZm9jdXMnKVxuICAgICAgfSlcbiAgICB9KVxuICAgIFBsdWdpbi5jYWxsKCR0YXJnZXQsIG9wdGlvbiwgdGhpcylcbiAgfSlcblxufShqUXVlcnkpO1xuIiwiLyohXG4gKiBKYXZhU2NyaXB0IENvb2tpZSB2Mi4yLjBcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qcy1jb29raWUvanMtY29va2llXG4gKlxuICogQ29weXJpZ2h0IDIwMDYsIDIwMTUgS2xhdXMgSGFydGwgJiBGYWduZXIgQnJhY2tcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG47KGZ1bmN0aW9uIChmYWN0b3J5KSB7XG5cdHZhciByZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIgPSBmYWxzZTtcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShmYWN0b3J5KTtcblx0XHRyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIgPSB0cnVlO1xuXHR9XG5cdGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0XHRyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIgPSB0cnVlO1xuXHR9XG5cdGlmICghcmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyKSB7XG5cdFx0dmFyIE9sZENvb2tpZXMgPSB3aW5kb3cuQ29va2llcztcblx0XHR2YXIgYXBpID0gd2luZG93LkNvb2tpZXMgPSBmYWN0b3J5KCk7XG5cdFx0YXBpLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR3aW5kb3cuQ29va2llcyA9IE9sZENvb2tpZXM7XG5cdFx0XHRyZXR1cm4gYXBpO1xuXHRcdH07XG5cdH1cbn0oZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBleHRlbmQgKCkge1xuXHRcdHZhciBpID0gMDtcblx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0Zm9yICg7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBhdHRyaWJ1dGVzID0gYXJndW1lbnRzWyBpIF07XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gYXR0cmlidXRlcykge1xuXHRcdFx0XHRyZXN1bHRba2V5XSA9IGF0dHJpYnV0ZXNba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdGZ1bmN0aW9uIGluaXQgKGNvbnZlcnRlcikge1xuXHRcdGZ1bmN0aW9uIGFwaSAoa2V5LCB2YWx1ZSwgYXR0cmlidXRlcykge1xuXHRcdFx0dmFyIHJlc3VsdDtcblx0XHRcdGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gV3JpdGVcblxuXHRcdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdGF0dHJpYnV0ZXMgPSBleHRlbmQoe1xuXHRcdFx0XHRcdHBhdGg6ICcvJ1xuXHRcdFx0XHR9LCBhcGkuZGVmYXVsdHMsIGF0dHJpYnV0ZXMpO1xuXG5cdFx0XHRcdGlmICh0eXBlb2YgYXR0cmlidXRlcy5leHBpcmVzID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRcdHZhciBleHBpcmVzID0gbmV3IERhdGUoKTtcblx0XHRcdFx0XHRleHBpcmVzLnNldE1pbGxpc2Vjb25kcyhleHBpcmVzLmdldE1pbGxpc2Vjb25kcygpICsgYXR0cmlidXRlcy5leHBpcmVzICogODY0ZSs1KTtcblx0XHRcdFx0XHRhdHRyaWJ1dGVzLmV4cGlyZXMgPSBleHBpcmVzO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gV2UncmUgdXNpbmcgXCJleHBpcmVzXCIgYmVjYXVzZSBcIm1heC1hZ2VcIiBpcyBub3Qgc3VwcG9ydGVkIGJ5IElFXG5cdFx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyA9IGF0dHJpYnV0ZXMuZXhwaXJlcyA/IGF0dHJpYnV0ZXMuZXhwaXJlcy50b1VUQ1N0cmluZygpIDogJyc7XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXN1bHQgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5cdFx0XHRcdFx0aWYgKC9eW1xce1xcW10vLnRlc3QocmVzdWx0KSkge1xuXHRcdFx0XHRcdFx0dmFsdWUgPSByZXN1bHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXG5cdFx0XHRcdGlmICghY29udmVydGVyLndyaXRlKSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKHZhbHVlKSlcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC8lKDIzfDI0fDI2fDJCfDNBfDNDfDNFfDNEfDJGfDNGfDQwfDVCfDVEfDVFfDYwfDdCfDdEfDdDKS9nLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHZhbHVlID0gY29udmVydGVyLndyaXRlKHZhbHVlLCBrZXkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0a2V5ID0gZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhrZXkpKTtcblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoLyUoMjN8MjR8MjZ8MkJ8NUV8NjB8N0MpL2csIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9bXFwoXFwpXS9nLCBlc2NhcGUpO1xuXG5cdFx0XHRcdHZhciBzdHJpbmdpZmllZEF0dHJpYnV0ZXMgPSAnJztcblxuXHRcdFx0XHRmb3IgKHZhciBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0XHRpZiAoIWF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0pIHtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzdHJpbmdpZmllZEF0dHJpYnV0ZXMgKz0gJzsgJyArIGF0dHJpYnV0ZU5hbWU7XG5cdFx0XHRcdFx0aWYgKGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0gPT09IHRydWUpIHtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzdHJpbmdpZmllZEF0dHJpYnV0ZXMgKz0gJz0nICsgYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gKGRvY3VtZW50LmNvb2tpZSA9IGtleSArICc9JyArIHZhbHVlICsgc3RyaW5naWZpZWRBdHRyaWJ1dGVzKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gUmVhZFxuXG5cdFx0XHRpZiAoIWtleSkge1xuXHRcdFx0XHRyZXN1bHQgPSB7fTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVG8gcHJldmVudCB0aGUgZm9yIGxvb3AgaW4gdGhlIGZpcnN0IHBsYWNlIGFzc2lnbiBhbiBlbXB0eSBhcnJheVxuXHRcdFx0Ly8gaW4gY2FzZSB0aGVyZSBhcmUgbm8gY29va2llcyBhdCBhbGwuIEFsc28gcHJldmVudHMgb2RkIHJlc3VsdCB3aGVuXG5cdFx0XHQvLyBjYWxsaW5nIFwiZ2V0KClcIlxuXHRcdFx0dmFyIGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUgPyBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsgJykgOiBbXTtcblx0XHRcdHZhciByZGVjb2RlID0gLyglWzAtOUEtWl17Mn0pKy9nO1xuXHRcdFx0dmFyIGkgPSAwO1xuXG5cdFx0XHRmb3IgKDsgaSA8IGNvb2tpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHBhcnRzID0gY29va2llc1tpXS5zcGxpdCgnPScpO1xuXHRcdFx0XHR2YXIgY29va2llID0gcGFydHMuc2xpY2UoMSkuam9pbignPScpO1xuXG5cdFx0XHRcdGlmICghdGhpcy5qc29uICYmIGNvb2tpZS5jaGFyQXQoMCkgPT09ICdcIicpIHtcblx0XHRcdFx0XHRjb29raWUgPSBjb29raWUuc2xpY2UoMSwgLTEpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR2YXIgbmFtZSA9IHBhcnRzWzBdLnJlcGxhY2UocmRlY29kZSwgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0XHRjb29raWUgPSBjb252ZXJ0ZXIucmVhZCA/XG5cdFx0XHRcdFx0XHRjb252ZXJ0ZXIucmVhZChjb29raWUsIG5hbWUpIDogY29udmVydGVyKGNvb2tpZSwgbmFtZSkgfHxcblx0XHRcdFx0XHRcdGNvb2tpZS5yZXBsYWNlKHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cblx0XHRcdFx0XHRpZiAodGhpcy5qc29uKSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb29raWUgPSBKU09OLnBhcnNlKGNvb2tpZSk7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChrZXkgPT09IG5hbWUpIHtcblx0XHRcdFx0XHRcdHJlc3VsdCA9IGNvb2tpZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICgha2V5KSB7XG5cdFx0XHRcdFx0XHRyZXN1bHRbbmFtZV0gPSBjb29raWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblxuXHRcdGFwaS5zZXQgPSBhcGk7XG5cdFx0YXBpLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdHJldHVybiBhcGkuY2FsbChhcGksIGtleSk7XG5cdFx0fTtcblx0XHRhcGkuZ2V0SlNPTiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBhcGkuYXBwbHkoe1xuXHRcdFx0XHRqc29uOiB0cnVlXG5cdFx0XHR9LCBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuXHRcdH07XG5cdFx0YXBpLmRlZmF1bHRzID0ge307XG5cblx0XHRhcGkucmVtb3ZlID0gZnVuY3Rpb24gKGtleSwgYXR0cmlidXRlcykge1xuXHRcdFx0YXBpKGtleSwgJycsIGV4dGVuZChhdHRyaWJ1dGVzLCB7XG5cdFx0XHRcdGV4cGlyZXM6IC0xXG5cdFx0XHR9KSk7XG5cdFx0fTtcblxuXHRcdGFwaS53aXRoQ29udmVydGVyID0gaW5pdDtcblxuXHRcdHJldHVybiBhcGk7XG5cdH1cblxuXHRyZXR1cm4gaW5pdChmdW5jdGlvbiAoKSB7fSk7XG59KSk7XG4iLCIvKlxuICogU2xpbmt5XG4gKiBBIGxpZ2h0LXdlaWdodCwgcmVzcG9uc2l2ZSwgbW9iaWxlLWxpa2UgbmF2aWdhdGlvbiBtZW51IHBsdWdpbiBmb3IgalF1ZXJ5XG4gKiBCdWlsdCBieSBBbGkgWmFoaWQgPGFsaS56YWhpZEBsaXZlLmNvbT5cbiAqIFB1Ymxpc2hlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuXG47KGZ1bmN0aW9uKCQpXG57XG4gICAgdmFyIGxhc3RDbGljaztcblxuICAgICQuZm4uc2xpbmt5ID0gZnVuY3Rpb24ob3B0aW9ucylcbiAgICB7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9ICQuZXh0ZW5kXG4gICAgICAgICh7XG4gICAgICAgICAgICBsYWJlbDogJ0JhY2snLFxuICAgICAgICAgICAgdGl0bGU6IGZhbHNlLFxuICAgICAgICAgICAgc3BlZWQ6IDMwMCxcbiAgICAgICAgICAgIHJlc2l6ZTogdHJ1ZSxcbiAgICAgICAgICAgIGFjdGl2ZUNsYXNzOiAnYWN0aXZlJyxcbiAgICAgICAgICAgIGhlYWRlckNsYXNzOiAnaGVhZGVyJyxcbiAgICAgICAgICAgIGhlYWRpbmdUYWc6ICc8aDI+JyxcbiAgICAgICAgICAgIGJhY2tGaXJzdDogZmFsc2UsXG4gICAgICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgICAgIHZhciBtZW51ID0gJCh0aGlzKSxcbiAgICAgICAgICAgIHJvb3QgPSBtZW51LmNoaWxkcmVuKCkuZmlyc3QoKTtcblxuICAgICAgICBtZW51LmFkZENsYXNzKCdzbGlua3ktbWVudScpO1xuXG4gICAgICAgIHZhciBtb3ZlID0gZnVuY3Rpb24oZGVwdGgsIGNhbGxiYWNrKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgbGVmdCA9IE1hdGgucm91bmQocGFyc2VJbnQocm9vdC5nZXQoMCkuc3R5bGUubGVmdCkpIHx8IDA7XG5cbiAgICAgICAgICAgIHJvb3QuY3NzKCdsZWZ0JywgbGVmdCAtIChkZXB0aCAqIDEwMCkgKyAnJScpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIHNldHRpbmdzLnNwZWVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgcmVzaXplID0gZnVuY3Rpb24oY29udGVudClcbiAgICAgICAge1xuICAgICAgICAgICAgbWVudS5oZWlnaHQoY29udGVudC5vdXRlckhlaWdodCgpKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IGZ1bmN0aW9uKHNwZWVkKVxuICAgICAgICB7XG4gICAgICAgICAgICBtZW51LmNzcygndHJhbnNpdGlvbi1kdXJhdGlvbicsIHNwZWVkICsgJ21zJyk7XG4gICAgICAgICAgICByb290LmNzcygndHJhbnNpdGlvbi1kdXJhdGlvbicsIHNwZWVkICsgJ21zJyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdHJhbnNpdGlvbihzZXR0aW5ncy5zcGVlZCk7XG5cbiAgICAgICAgJCgnYSArIHVsJywgbWVudSkucHJldigpLmFkZENsYXNzKCduZXh0Jyk7XG5cbiAgICAgICAgJCgnbGkgPiB1bCcsIG1lbnUpLnByZXBlbmQoJzxsaSBjbGFzcz1cIicgKyBzZXR0aW5ncy5oZWFkZXJDbGFzcyArICdcIj4nKTtcblxuICAgICAgICBpZiAoc2V0dGluZ3MudGl0bGUgPT09IHRydWUpXG4gICAgICAgIHtcbiAgICAgICAgICAgICQoJ2xpID4gdWwnLCBtZW51KS5lYWNoKGZ1bmN0aW9uKClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgJGxpbmsgPSAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJ2EnKS5maXJzdCgpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9ICRsaW5rLnRleHQoKSxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSAkKCc8YT4nKS5hZGRDbGFzcygndGl0bGUnKS50ZXh0KGxhYmVsKS5hdHRyKCdocmVmJywgJGxpbmsuYXR0cignaHJlZicpKTtcblxuICAgICAgICAgICAgICAgICQoJz4gLicgKyBzZXR0aW5ncy5oZWFkZXJDbGFzcywgdGhpcykuYXBwZW5kKHRpdGxlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzZXR0aW5ncy50aXRsZSAmJiBzZXR0aW5ncy5sYWJlbCA9PT0gdHJ1ZSlcbiAgICAgICAge1xuICAgICAgICAgICAgJCgnbGkgPiB1bCcsIG1lbnUpLmVhY2goZnVuY3Rpb24oKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9ICQodGhpcykucGFyZW50KCkuZmluZCgnYScpLmZpcnN0KCkudGV4dCgpLFxuICAgICAgICAgICAgICAgICAgICBiYWNrTGluayA9ICQoJzxhPicpLnRleHQobGFiZWwpLnByb3AoJ2hyZWYnLCAnIycpLmFkZENsYXNzKCdiYWNrJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MuYmFja0ZpcnN0KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnPiAuJyArIHNldHRpbmdzLmhlYWRlckNsYXNzLCB0aGlzKS5wcmVwZW5kKGJhY2tMaW5rKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnPiAuJyArIHNldHRpbmdzLmhlYWRlckNsYXNzLCB0aGlzKS5hcHBlbmQoYmFja0xpbmspO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIGJhY2tMaW5rID0gJCgnPGE+JykudGV4dChzZXR0aW5ncy5sYWJlbCkucHJvcCgnaHJlZicsICcjJykuYWRkQ2xhc3MoJ2JhY2snKTtcblxuICAgICAgICAgICAgaWYgKHNldHRpbmdzLmJhY2tGaXJzdClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAkKCcuJyArIHNldHRpbmdzLmhlYWRlckNsYXNzLCBtZW51KS5wcmVwZW5kKGJhY2tMaW5rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAkKCcuJyArIHNldHRpbmdzLmhlYWRlckNsYXNzLCBtZW51KS5hcHBlbmQoYmFja0xpbmspO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgJCgnYScsIG1lbnUpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmICgobGFzdENsaWNrICsgc2V0dGluZ3Muc3BlZWQpID4gRGF0ZS5ub3coKSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhc3RDbGljayA9IERhdGUubm93KCk7XG5cbiAgICAgICAgICAgIHZhciBhID0gJCh0aGlzKTtcblxuICAgICAgICAgICAgaWYgKGEuaGFzQ2xhc3MoJ25leHQnKSB8fCBhLmhhc0NsYXNzKCdiYWNrJykpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYS5oYXNDbGFzcygnbmV4dCcpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG1lbnUuZmluZCgnLicgKyBzZXR0aW5ncy5hY3RpdmVDbGFzcykucmVtb3ZlQ2xhc3Moc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXG4gICAgICAgICAgICAgICAgYS5uZXh0KCkuc2hvdygpLmFkZENsYXNzKHNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblxuICAgICAgICAgICAgICAgIG1vdmUoMSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MucmVzaXplKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzaXplKGEubmV4dCgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhLmhhc0NsYXNzKCdiYWNrJykpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbW92ZSgtMSwgZnVuY3Rpb24oKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbWVudS5maW5kKCcuJyArIHNldHRpbmdzLmFjdGl2ZUNsYXNzKS5yZW1vdmVDbGFzcyhzZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgYS5wYXJlbnQoKS5wYXJlbnQoKS5oaWRlKCkucGFyZW50c1VudGlsKG1lbnUsICd1bCcpLmZpcnN0KCkuYWRkQ2xhc3Moc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnJlc2l6ZSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZShhLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudHNVbnRpbChtZW51LCAndWwnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmp1bXAgPSBmdW5jdGlvbih0bywgYW5pbWF0ZSlcbiAgICAgICAge1xuICAgICAgICAgICAgdG8gPSAkKHRvKTtcblxuICAgICAgICAgICAgdmFyIGFjdGl2ZSA9IG1lbnUuZmluZCgnLicgKyBzZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cbiAgICAgICAgICAgIGlmIChhY3RpdmUubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhY3RpdmUgPSBhY3RpdmUucGFyZW50c1VudGlsKG1lbnUsICd1bCcpLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhY3RpdmUgPSAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtZW51LmZpbmQoJ3VsJykucmVtb3ZlQ2xhc3Moc2V0dGluZ3MuYWN0aXZlQ2xhc3MpLmhpZGUoKTtcblxuICAgICAgICAgICAgdmFyIG1lbnVzID0gdG8ucGFyZW50c1VudGlsKG1lbnUsICd1bCcpO1xuXG4gICAgICAgICAgICBtZW51cy5zaG93KCk7XG4gICAgICAgICAgICB0by5zaG93KCkuYWRkQ2xhc3Moc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXG4gICAgICAgICAgICBpZiAoYW5pbWF0ZSA9PT0gZmFsc2UpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbigwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbW92ZShtZW51cy5sZW5ndGggLSBhY3RpdmUpO1xuXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MucmVzaXplKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJlc2l6ZSh0byk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhbmltYXRlID09PSBmYWxzZSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uKHNldHRpbmdzLnNwZWVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmhvbWUgPSBmdW5jdGlvbihhbmltYXRlKVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAoYW5pbWF0ZSA9PT0gZmFsc2UpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbigwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGFjdGl2ZSA9IG1lbnUuZmluZCgnLicgKyBzZXR0aW5ncy5hY3RpdmVDbGFzcyksXG4gICAgICAgICAgICAgICAgY291bnQgPSBhY3RpdmUucGFyZW50c1VudGlsKG1lbnUsICdsaScpLmxlbmd0aDtcblxuICAgICAgICAgICAgaWYgKGNvdW50ID4gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtb3ZlKC1jb3VudCwgZnVuY3Rpb24oKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlLnJlbW92ZUNsYXNzKHNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5yZXNpemUpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXNpemUoJChhY3RpdmUucGFyZW50c1VudGlsKG1lbnUsICdsaScpLmdldChjb3VudCAtIDEpKS5wYXJlbnQoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYW5pbWF0ZSA9PT0gZmFsc2UpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbihzZXR0aW5ncy5zcGVlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24oKVxuICAgICAgICB7XG4gICAgICAgICAgICAkKCcuJyArIHNldHRpbmdzLmhlYWRlckNsYXNzLCBtZW51KS5yZW1vdmUoKTtcbiAgICAgICAgICAgICQoJ2EnLCBtZW51KS5yZW1vdmVDbGFzcygnbmV4dCcpLm9mZignY2xpY2snKTtcblxuICAgICAgICAgICAgbWVudS5yZW1vdmVDbGFzcygnc2xpbmt5LW1lbnUnKS5jc3MoJ3RyYW5zaXRpb24tZHVyYXRpb24nLCAnJyk7XG4gICAgICAgICAgICByb290LmNzcygndHJhbnNpdGlvbi1kdXJhdGlvbicsICcnKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgYWN0aXZlID0gbWVudS5maW5kKCcuJyArIHNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblxuICAgICAgICBpZiAoYWN0aXZlLmxlbmd0aCA+IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIGFjdGl2ZS5yZW1vdmVDbGFzcyhzZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cbiAgICAgICAgICAgIHRoaXMuanVtcChhY3RpdmUsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG59KGpRdWVyeSkpO1xuIiwiLy8gfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB8IExheW91dFxuLy8gfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB8XG4vLyB8IFRoaXMgalF1ZXJ5IHNjcmlwdCBpcyB3cml0dGVuIGJ5XG4vLyB8XG4vLyB8IE1vcnRlbiBOaXNzZW5cbi8vIHwgaGplbW1lc2lkZWtvbmdlbi5ka1xuLy8gfFxudmFyIGxheW91dCA9IChmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBwdWIgPSB7fSxcbiAgICAgICAgJGxheW91dF9faGVhZGVyID0gJCgnLmxheW91dF9faGVhZGVyJyksXG4gICAgICAgICRsYXlvdXRfX2RvY3VtZW50ID0gJCgnLmxheW91dF9fZG9jdW1lbnQnKSxcbiAgICAgICAgbGF5b3V0X2NsYXNzZXMgPSB7XG4gICAgICAgICAgICAnbGF5b3V0X193cmFwcGVyJzogJy5sYXlvdXRfX3dyYXBwZXInLFxuICAgICAgICAgICAgJ2xheW91dF9fZHJhd2VyJzogJy5sYXlvdXRfX2RyYXdlcicsXG4gICAgICAgICAgICAnbGF5b3V0X19oZWFkZXInOiAnLmxheW91dF9faGVhZGVyJyxcbiAgICAgICAgICAgICdsYXlvdXRfX29iZnVzY2F0b3InOiAnLmxheW91dF9fb2JmdXNjYXRvcicsXG4gICAgICAgICAgICAnbGF5b3V0X19kb2N1bWVudCc6ICcubGF5b3V0X19kb2N1bWVudCcsXG5cbiAgICAgICAgICAgICd3cmFwcGVyX2lzX3VwZ3JhZGVkJzogJ2lzLXVwZ3JhZGVkJyxcbiAgICAgICAgICAgICd3cmFwcGVyX2hhc19kcmF3ZXInOiAnaGFzLWRyYXdlcicsXG4gICAgICAgICAgICAnd3JhcHBlcl9oYXNfc2Nyb2xsaW5nX2hlYWRlcic6ICdoYXMtc2Nyb2xsaW5nLWhlYWRlcicsXG4gICAgICAgICAgICAnaGVhZGVyX3Njcm9sbCc6ICdsYXlvdXRfX2hlYWRlci0tc2Nyb2xsJyxcbiAgICAgICAgICAgICdoZWFkZXJfaXNfY29tcGFjdCc6ICdpcy1jb21wYWN0JyxcbiAgICAgICAgICAgICdoZWFkZXJfd2F0ZXJmYWxsJzogJ2xheW91dF9faGVhZGVyLS13YXRlcmZhbGwnLFxuICAgICAgICAgICAgJ2RyYXdlcl9pc192aXNpYmxlJzogJ2lzLXZpc2libGUnLFxuICAgICAgICAgICAgJ29iZnVzY2F0b3JfaXNfdmlzaWJsZSc6ICdpcy12aXNpYmxlJ1xuICAgICAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5zdGFudGlhdGVcbiAgICAgKi9cbiAgICBwdWIuaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIHJlZ2lzdGVyRXZlbnRIYW5kbGVycygpO1xuICAgICAgICByZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGJvb3QgZXZlbnQgaGFuZGxlcnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzKCkge1xuXG4gICAgICAgIC8vIEFkZCBjbGFzc2VzIHRvIGVsZW1lbnRzXG4gICAgICAgIGFkZEVsZW1lbnRDbGFzc2VzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWdpc3RlckV2ZW50SGFuZGxlcnMoKSB7XG5cbiAgICAgICAgLy8gVG9nZ2xlIGRyYXdlclxuICAgICAgICAkKCdbZGF0YS10b2dnbGUtZHJhd2VyXScpLmFkZCgkKGxheW91dF9jbGFzc2VzLmxheW91dF9fb2JmdXNjYXRvcikpLm9uKCdjbGljayB0b3VjaHN0YXJ0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICB0b2dnbGVEcmF3ZXIoJGVsZW1lbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBXYXRlcmZhbGwgaGVhZGVyXG4gICAgICAgIGlmICgkbGF5b3V0X19oZWFkZXIuaGFzQ2xhc3MobGF5b3V0X2NsYXNzZXMuaGVhZGVyX3dhdGVyZmFsbCkpIHtcblxuICAgICAgICAgICAgJGxheW91dF9fZG9jdW1lbnQub24oJ3RvdWNobW92ZSBzY3JvbGwnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciAkZG9jdW1lbnQgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgd2F0ZXJmYWxsSGVhZGVyKCRkb2N1bWVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBkcmF3ZXJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0b2dnbGVEcmF3ZXIoJGVsZW1lbnQpIHtcbiAgICAgICAgdmFyICR3cmFwcGVyID0gJGVsZW1lbnQuY2xvc2VzdChsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX3dyYXBwZXIpLFxuICAgICAgICAgICAgJG9iZnVzY2F0b3IgPSAkd3JhcHBlci5jaGlsZHJlbihsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX29iZnVzY2F0b3IpLFxuICAgICAgICAgICAgJGRyYXdlciA9ICR3cmFwcGVyLmNoaWxkcmVuKGxheW91dF9jbGFzc2VzLmxheW91dF9fZHJhd2VyKTtcblxuICAgICAgICAvLyBUb2dnbGUgdmlzaWJsZSBzdGF0ZVxuICAgICAgICAkb2JmdXNjYXRvci50b2dnbGVDbGFzcyhsYXlvdXRfY2xhc3Nlcy5vYmZ1c2NhdG9yX2lzX3Zpc2libGUpO1xuICAgICAgICAkZHJhd2VyLnRvZ2dsZUNsYXNzKGxheW91dF9jbGFzc2VzLmRyYXdlcl9pc192aXNpYmxlKTtcblxuICAgICAgICAvLyBBbHRlciBhcmlhLWhpZGRlbiBzdGF0dXNcbiAgICAgICAgJGRyYXdlci5hdHRyKCdhcmlhLWhpZGRlbicsICgkZHJhd2VyLmhhc0NsYXNzKGxheW91dF9jbGFzc2VzLmRyYXdlcl9pc192aXNpYmxlKSkgPyBmYWxzZSA6IHRydWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGVyZmFsbCBoZWFkZXJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB3YXRlcmZhbGxIZWFkZXIoJGRvY3VtZW50KSB7XG4gICAgICAgIHZhciAkd3JhcHBlciA9ICRkb2N1bWVudC5jbG9zZXN0KGxheW91dF9jbGFzc2VzLmxheW91dF9fd3JhcHBlciksXG4gICAgICAgICAgICAkaGVhZGVyID0gJHdyYXBwZXIuY2hpbGRyZW4obGF5b3V0X2NsYXNzZXMubGF5b3V0X19oZWFkZXIpLFxuICAgICAgICAgICAgZGlzdGFuY2UgPSAkZG9jdW1lbnQuc2Nyb2xsVG9wKCk7XG5cbiAgICAgICAgaWYgKGRpc3RhbmNlID4gMCkge1xuICAgICAgICAgICAgJGhlYWRlci5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy5oZWFkZXJfaXNfY29tcGFjdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAkaGVhZGVyLnJlbW92ZUNsYXNzKGxheW91dF9jbGFzc2VzLmhlYWRlcl9pc19jb21wYWN0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBjbGFzc2VzIHRvIGVsZW1lbnRzLCBiYXNlZCBvbiBhdHRhY2hlZCBjbGFzc2VzXG4gICAgICovXG4gICAgZnVuY3Rpb24gYWRkRWxlbWVudENsYXNzZXMoKSB7XG5cbiAgICAgICAgJChsYXlvdXRfY2xhc3Nlcy5sYXlvdXRfX3dyYXBwZXIpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciAkd3JhcHBlciA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgJGhlYWRlciA9ICR3cmFwcGVyLmNoaWxkcmVuKGxheW91dF9jbGFzc2VzLmxheW91dF9faGVhZGVyKSxcbiAgICAgICAgICAgICAgICAkZHJhd2VyID0gJHdyYXBwZXIuY2hpbGRyZW4obGF5b3V0X2NsYXNzZXMubGF5b3V0X19kcmF3ZXIpO1xuXG4gICAgICAgICAgICAvLyBTY3JvbGwgaGVhZGVyXG4gICAgICAgICAgICBpZiAoJGhlYWRlci5oYXNDbGFzcyhsYXlvdXRfY2xhc3Nlcy5oZWFkZXJfc2Nyb2xsKSkge1xuICAgICAgICAgICAgICAgICR3cmFwcGVyLmFkZENsYXNzKGxheW91dF9jbGFzc2VzLndyYXBwZXJfaGFzX3Njcm9sbGluZ19oZWFkZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEcmF3ZXJcbiAgICAgICAgICAgIGlmICgkZHJhd2VyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAkd3JhcHBlci5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy53cmFwcGVyX2hhc19kcmF3ZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVcGdyYWRlZFxuICAgICAgICAgICAgaWYgKCR3cmFwcGVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAkd3JhcHBlci5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy53cmFwcGVyX2lzX3VwZ3JhZGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHB1Yjtcbn0pKGpRdWVyeSk7XG4iLCIvLyBEb2N1bWVudCByZWFkeVxuKGZ1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBGbGF0dGVuIHN0cnVjdHVyZSBvZiBtb2RhbHMsIHNvIHRoZXkgYXJlIG5vdCBuZXN0ZWQuXG4gIC8vIEV4LiAubW9kYWwgPiAubW9kYWwgPiAubW9kYWxcbiAgdmFyICRtb2RhbHMgPSAkKCcubW9kYWwnKTtcbiAgJCgnYm9keScpLmFwcGVuZCgkbW9kYWxzKTtcblxuICAvLyBFbmFibGUgbGF5b3V0XG4gIGxheW91dC5pbml0KCk7XG5cbiAgLy8gU2xpbmt5XG4gICQoJy5zbGlua3ktbWVudScpXG4gICAgICAuZmluZCgndWwsIGxpLCBhJylcbiAgICAgIC5yZW1vdmVDbGFzcygpO1xuXG4gICQoJy5yZWdpb24tbW9iaWxlLWhlYWRlci1uYXZpZ2F0aW9uIC5zbGlua3ktbWVudScpLnNsaW5reSh7XG4gICAgdGl0bGU6IHRydWUsXG4gICAgbGFiZWw6ICcnXG4gIH0pO1xuXG4gIC8vIE5vdGlmeVxuICB2YXIgJG5vdGlmaWNhdGlvbnMgPSAkKCcubm90aWZ5Jyk7XG4gIGlmICgkbm90aWZpY2F0aW9ucy5sZW5ndGgpIHtcblxuICAgICRub3RpZmljYXRpb25zLmVhY2goZnVuY3Rpb24oaW5kZXgsIHZhbCkge1xuICAgICAgdmFyICRkb2N1bWVudCA9ICQoJy5sYXlvdXRfX2RvY3VtZW50JyksXG4gICAgICAgICAgJHJlZ2lvbiA9ICQoJy5yZWdpb24tbm90aWZ5JyksXG4gICAgICAgICAgJGVsZW1lbnQgPSAkKHRoaXMpLFxuICAgICAgICAgIGNvb2tpZV9pZCA9ICdub3RpZnlfaWRfJyArICRlbGVtZW50LmF0dHIoJ2lkJyksXG4gICAgICAgICAgJGNsb3NlID0gJGVsZW1lbnQuZmluZCgnLm5vdGlmeV9fY2xvc2UnKTtcblxuICAgICAgLy8gRmxleCBtYWdpYyAtIGZpeGluZyBkaXNwbGF5OiBibG9jayBvbiBmYWRlSW4gKHNlZTogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjg5MDQ2OTgvaG93LWZhZGUtaW4tYS1mbGV4LWJveClcbiAgICAgICRlbGVtZW50LmNzcygnZGlzcGxheScsICdmbGV4JykuaGlkZSgpO1xuXG4gICAgICAvLyBObyBjb29raWUgaGFzIGJlZW4gc2V0IHlldFxuICAgICAgaWYgKCEgQ29va2llcy5nZXQoY29va2llX2lkKSkge1xuXG4gICAgICAgIC8vIEZhZGUgdGhlIGVsZW1lbnQgaW5cbiAgICAgICAgJGVsZW1lbnRcbiAgICAgICAgICAgIC5kZWxheSgyMDAwKVxuICAgICAgICAgICAgLmZhZGVJbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIGhlaWdodCA9ICRyZWdpb24ub3V0ZXJIZWlnaHQodHJ1ZSk7XG5cbiAgICAgICAgICAgICAgJGRvY3VtZW50LmNzcygncGFkZGluZy1ib3R0b20nLCBoZWlnaHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENsb3NlZFxuICAgICAgJGNsb3NlLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICRlbGVtZW50LmZhZGVPdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJGRvY3VtZW50LmNzcygncGFkZGluZy1ib3R0b20nLCAwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU2V0IGEgY29va2llLCB0byBzdG9wIHRoaXMgbm90aWZpY2F0aW9uIGZyb20gYmVpbmcgZGlzcGxheWVkIGFnYWluXG4gICAgICAgIENvb2tpZXMuc2V0KGNvb2tpZV9pZCwgdHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gICQoXCIjdG9nZ2xlX21vYmlsZV9tZW51XCIpLmNsaWNrKGZ1bmN0aW9uIChldmVudCkge1xuICAgICQoJyNtYWluLW1lbnUnKS50b2dnbGVDbGFzcygnbW9iaWxlLW1lbnUtb3BlbicpO1xuICAgICQoJy5sYXlvdXRfX2RvY3VtZW50JykudG9nZ2xlQ2xhc3MoJ21vYmlsZS1tZW51LW9wZW4nKTtcbiAgfSk7XG5cbiAgLy9TaG93IHNlYXJjaCBmb3JtIGJsb2NrXG4gICQoXCIuc2VhcmNoLWJ1dHRvblwiKS5jbGljayhmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoJChcIiNzZWFyY2gtZm9ybS1wb3BvdmVyXCIpLmhhc0NsYXNzKFwiaGlkZGVuXCIpKSB7XG4gICAgICAkKFwiI3NlYXJjaC1mb3JtLXBvcG92ZXJcIikucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJChcIi5mb3JtLWNvbnRyb2xcIikuZm9jdXMoKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vSGlkZSBzZWFyY2ggZm9ybSBibG9ja1xuICAkKGRvY3VtZW50KS5jbGljayhmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoISQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcjc2VhcmNoLWZvcm0tcG9wb3ZlcicpLmxlbmd0aCAmJiAhJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5zZWFyY2gtYnV0dG9uJykubGVuZ3RoKSB7XG4gICAgICBpZiAoISQoXCIjc2VhcmNoLWZvcm0tcG9wb3ZlclwiKS5oYXNDbGFzcyhcImhpZGRlblwiKSkge1xuICAgICAgICAkKFwiI3NlYXJjaC1mb3JtLXBvcG92ZXJcIikuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgLy9JbXByb3ZpbmcgdXNhYmlsaXR5IGZvciBtZW51ZHJvcGRvd25zIGZvciBtb2JpbGUgZGV2aWNlc1xuICBpZiAoISEoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSkgey8vY2hlY2sgZm9yIHRvdWNoIGRldmljZVxuICAgICQoJ2xpLmRyb3Bkb3duLmxheW91dC1uYXZpZ2F0aW9uX19kcm9wZG93bicpLmZpbmQoJz4gYScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgICBpZiAoJCh0aGlzKS5wYXJlbnQoKS5oYXNDbGFzcyhcImV4cGFuZGVkXCIpKSB7XG4gICAgICAgIC8vJCh0aGlzKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyhcImV4cGFuZGVkXCIpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5hZGRDbGFzcyhcImV4cGFuZGVkXCIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGVsc2Ugey8va2VlcGluZyBpdCBjb21wYXRpYmxlIHdpdGggZGVza3RvcCBkZXZpY2VzXG4gICAgJCgnbGkuZHJvcGRvd24ubGF5b3V0LW5hdmlnYXRpb25fX2Ryb3Bkb3duJykuaG92ZXIoXG4gICAgICAgIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImV4cGFuZGVkXCIpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJleHBhbmRlZFwiKTtcbiAgICAgICAgfVxuICAgICk7XG4gIH1cblxuICAvLyBUb2dnbGVyXG4gICQoJ1tkYXRhLXRvZ2dsZXJdJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyICRlbGVtZW50ID0gJCh0aGlzKSxcbiAgICAgICAgdGFyZ2V0ID0gJGVsZW1lbnQuYXR0cignZGF0YS10b2dnbGVyJyksXG4gICAgICAgICRwYXJlbnQgPSAkZWxlbWVudC5wYXJlbnRzKCcudG9nZ2xlcicpLFxuICAgICAgICAkdGFyZ2V0ID0gJHBhcmVudC5maW5kKHRhcmdldCksXG4gICAgICAgICRhbGxfdG9nZ2xlX2J1dHRvbnMgPSAkcGFyZW50LmZpbmQoJ1tkYXRhLXRvZ2dsZXJdJyksXG4gICAgICAgICR0b2dnbGVfYnV0dG9uID0gJHBhcmVudC5maW5kKCdbZGF0YS10b2dnbGVyPVwiJyArIHRhcmdldCArICdcIl0nKSxcbiAgICAgICAgJGFsbF9jb250ZW50ID0gJHBhcmVudC5maW5kKCcudG9nZ2xlcl9fY29udGVudCcpO1xuXG4gICAgLy8gUmVtb3ZlIGFsbCBhY3RpdmUgdG9nZ2xlcnNcbiAgICAkYWxsX3RvZ2dsZV9idXR0b25zXG4gICAgICAgIC5wYXJlbnQoKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gICAgJGFsbF9jb250ZW50LnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcblxuICAgIC8vIFNob3dcbiAgICAkdG9nZ2xlX2J1dHRvbi5wYXJlbnQoKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgJHRhcmdldC5hZGRDbGFzcygnYWN0aXZlJyk7XG4gIH0pO1xuXG4gICQoXCIudG9nZ2xlclwiKS5lYWNoKGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgJCh0aGlzKS5maW5kKCcudG9nZ2xlcl9fYnV0dG9uJykuZmlyc3QoKS50cmlnZ2VyKCdjbGljaycpO1xuICB9KTtcblxuICAvLyBVc2UgbXVsdGlwbGUgbW9kYWxzIChodHRwOi8vanNmaWRkbGUubmV0L2xpa2hpMS93dGo2bmFjZC8pXG4gICQoZG9jdW1lbnQpLm9uKHtcbiAgICAnc2hvdy5icy5tb2RhbCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB6SW5kZXggPSAxMDQwICsgKDEwICogJCgnLm1vZGFsOnZpc2libGUnKS5sZW5ndGgpO1xuICAgICAgJCh0aGlzKS5jc3MoJ3otaW5kZXgnLCB6SW5kZXgpO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoJy5tb2RhbC1iYWNrZHJvcCcpLm5vdCgnLm1vZGFsLXN0YWNrJykuY3NzKCd6LWluZGV4JywgekluZGV4IC0gMSkuYWRkQ2xhc3MoJ21vZGFsLXN0YWNrJyk7XG4gICAgICB9LCAwKTtcbiAgICB9LFxuICAgICdoaWRkZW4uYnMubW9kYWwnOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoJCgnLm1vZGFsOnZpc2libGUnKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIHJlc3RvcmUgdGhlIG1vZGFsLW9wZW4gY2xhc3MgdG8gdGhlIGJvZHkgZWxlbWVudCwgc28gdGhhdCBzY3JvbGxpbmdcbiAgICAgICAgLy8gd29ya3MgcHJvcGVybHkgYWZ0ZXIgZGUtc3RhY2tpbmcgYSBtb2RhbC5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5hZGRDbGFzcygnbW9kYWwtb3BlbicpO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sICcubW9kYWwnKTtcblxufSkoalF1ZXJ5KTtcbiJdfQ==
