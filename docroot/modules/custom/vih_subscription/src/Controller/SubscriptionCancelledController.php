<?php

namespace Drupal\vih_subscription\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * An example controller.
 */
class SubscriptionCancelledController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  public function content() {
    $build = array(
      '#theme' => 'vih_subscription_cancelled_page'
    );

    //the actual content comes from template file: templates/vih_subscription_cancelled_page.html.twig

    return $build;
  }

  public function getTitle() {
    return $this->t('Din ordre blev annulleret');
  }
}