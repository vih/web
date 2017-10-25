<?php

namespace Drupal\vih_subscription\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * An example controller.
 */
class SubscriptionErrorController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  public function content() {
    $build = array(
      '#theme' => 'vih_subscription_error_page'
    );

    //the actual content comes from template file: templates/vih_subscription_error_page.html.twig

    return $build;
  }

  public function getTitle() {
    return $this->t('Noget gik galt');
  }
}