// Document ready
(function ($) {
  'use strict';

  // Enable layout
  layout.init();

  // Notify
  var $notifications = $('.notify');
  if ($notifications.length) {

    $notifications.each(function(index, val) {
      var $document = $('.layout__document'),
          $region = $('.region-notify'),
          $element = $(this),
          cookie_id = 'notify_id_' + $element.attr('id'),
          $close = $element.find('.notify__close');

      // Flex magic - fixing display: block on fadeIn (see: https://stackoverflow.com/questions/28904698/how-fade-in-a-flex-box)
      $element.css('display', 'flex').hide();

      // No cookie has been set yet
      if (! Cookies.get(cookie_id)) {

        // Fade the element in
        $element
            .delay(2000)
            .fadeIn(function() {
              var height = $region.outerHeight(true);

              $document.css('padding-bottom', height);
            });
      }

      // Closed
      $close.on('click', function(event) {
        $element.fadeOut(function() {
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
  })

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
  if (!!('ontouchstart' in window)) {//check for touch device
    $('li.dropdown.layout-navigation__dropdown').find('> a').click(function (e) {
      if ($(this).parent().hasClass("expanded")) {
        //$(this).parent().removeClass("expanded");
      }
      else {
        e.preventDefault();
        $(this).parent().addClass("expanded");
      }
    });
  }
  else {//keeping it compatible with desktop devices
    $('li.dropdown.layout-navigation__dropdown').hover(
        function (e) {
          $(this).addClass("expanded");
        }, function (e) {
          $(this).removeClass("expanded");
        }
    );
  }

  $('.modal-close--this-modal-only').on('click', function(event) {
    var $element = $(this),
        $modal = $element.parents('.modal').first();

    $modal.modal('hide');
  });
})(jQuery);
