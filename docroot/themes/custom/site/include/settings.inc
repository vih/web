<?php

/**
 * Collect and assemble theme settings.
 *
 * @return array
 */
function _site_collect_theme_settings() {
  $settings = [];

  // Social
  $settings['social']['facebook']['active'] = theme_get_setting('facebook');
  $settings['social']['facebook']['url'] = theme_get_setting('facebook_url');
  $settings['social']['facebook']['tooltip'] = t(theme_get_setting('facebook_tooltip'));
  $settings['social']['twitter']['active'] = theme_get_setting('twitter');
  $settings['social']['twitter']['url'] = theme_get_setting('twitter_url');
  $settings['social']['twitter']['tooltip'] = t(theme_get_setting('twitter_tooltip'));
  $settings['social']['googleplus']['active'] = theme_get_setting('googleplus');
  $settings['social']['googleplus']['url'] = theme_get_setting('googleplus_url');
  $settings['social']['googleplus']['tooltip'] = t(theme_get_setting('googleplus_tooltip'));
  $settings['social']['instagram']['active'] = theme_get_setting('instagram');
  $settings['social']['instagram']['url'] = theme_get_setting('instagram_url');
  $settings['social']['instagram']['tooltip'] = t(theme_get_setting('instagram_tooltip'));
  $settings['social']['linkedin']['active'] = theme_get_setting('linkedin');
  $settings['social']['linkedin']['url'] = theme_get_setting('linkedin_url');
  $settings['social']['linkedin']['tooltip'] = t(theme_get_setting('linkedin_tooltip'));
  $settings['social']['pinterest']['active'] = theme_get_setting('pinterest');
  $settings['social']['pinterest']['url'] = theme_get_setting('pinterest_url');
  $settings['social']['pinterest']['tooltip'] = t(theme_get_setting('pinterest_tooltip'));
  $settings['social']['vimeo']['active'] = theme_get_setting('vimeo');
  $settings['social']['vimeo']['url'] = theme_get_setting('vimeo_url');
  $settings['social']['vimeo']['tooltip'] = t(theme_get_setting('vimeo_tooltip'));
  $settings['social']['youtube']['active'] = theme_get_setting('youtube');
  $settings['social']['youtube']['url'] = theme_get_setting('youtube_url');
  $settings['social']['youtube']['tooltip'] = t(theme_get_setting('youtube_tooltip'));

  return $settings;
}
