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
  function registerBootEventHandlers() {
  }

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
      $("#block-popup-cta .close").click(function () {
        $("#block-popup-cta").hide();
      });
    }
  }

  $("#block-popup-cta .close").click(function () {
    $.cookie('no_thanks', 'true', {
      expires: 36500, path: '/'
    });
  });

  if ($.cookie("no_thanks") !== true) {
    $("#block-popup-cta").hide();
  }

  return pub;
})(jQuery);
