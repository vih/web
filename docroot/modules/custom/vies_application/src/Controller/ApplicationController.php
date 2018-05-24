<?php

namespace Drupal\vies_application\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * An example controller.
 */
class ApplicationController extends ControllerBase {

  /**
   * Success page callback.
   */
  public function success() {
    $build = [
      '#theme' => 'vies_application_submit_message',
      '#title' => $this->t("Thank you for signing up!"),
    ];

    return $build;
  }

  /**
   * Error page callback.
   */
  public function error() {
    $build['page'] = [
      '#theme' => 'vies_application_submit_message',
      '#title' => $this->t("Oh - an error occured!"),
      '#message' => $this->t('Please send your application to us by mail'),
    ];

    return $build;
  }
}
