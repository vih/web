<?php

/*
 * Sidebar classes
 */
function _bellcom_sidebar_classes($viewmode) {
  $classes = array();

  // Settings
  $enabled = theme_get_setting('sidebar_left_' . $viewmode . '_enabled');
  $state = theme_get_setting('sidebar_left_' . $viewmode . '_state');
  $content_effect = theme_get_setting('sidebar_left_' . $viewmode . '_content_effect');

  // Enabled
  if (!isset($enabled) or !$enabled or $enabled == 0) {
    return array();
  }

  $classes[] = 'sidebar-left-enabled-' . $viewmode;

  // State
  if ($state == 'expanded') {
    $classes[] = 'sidebar-left-expanded-' . $viewmode;
  }
  elseif ($state == 'collapsed') {
    $classes[] = 'sidebar-left-collapsed-' . $viewmode;
  }
  elseif ($state == 'hidden') {
    $classes[] = 'sidebar-left-hidden-' . $viewmode;
  }

  // Content effect
  if ($content_effect == 'shrink' && $state == 'hidden') {
    $classes[] = 'sidebar-left-content-shrink-' . $viewmode;
  }
  elseif ($content_effect == 'push') {
    $classes[] = 'sidebar-left-content-push-' . $viewmode;
  }

  return $classes;
}
