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
    
//    $options = [
//      'dialogClass' => 'popup-dialog-class',
//      'width' => '50%',
//    ];
//    
//    $content['#markup'] = 'text';
//    $content['#attached']['library'][] = 'core/drupal.dialog.ajax';
//    $title = '<div>ttt</div>Here is your content in modal';
//    $response = new AjaxResponse();
//    $response->addCommand(new OpenModalDialogCommand($title, $content, $options));
//    return $response;
    
    $output = \Drupal::entityTypeManager()
                    ->getViewBuilder('taxonomy_term')
                    ->view($term, 'modal_window');
    
    return $output;
    
    
  }
}