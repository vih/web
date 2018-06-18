<?php

/**
 * @file
 * CustomModalController class.
 */

namespace Drupal\vih_subscription\Controller;

use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\OpenModalDialogCommand;
use Drupal\Core\Controller\ControllerBase;

class SubscriptionModalController extends ControllerBase {

  public function vih_cs_classes($class) {
    $term = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($class);
    $output = \Drupal::entityTypeManager()
        ->getViewBuilder('taxonomy_term')
        ->view($term, 'modal_window');

    return $output;
  }

  public function vih_node_modal($node) {

    $output = \Drupal::entityTypeManager()
        ->getViewBuilder('node')
        ->view($node, 'modal_window');

    return $output;
  }
}
