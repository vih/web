<?php

namespace Drupal\vies_application\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;

/**
 * Application controller.
 */
class ApplicationController extends ControllerBase {

  /**
   * Success page callback.
   */
  public function success() {
    $build = [
      '#theme' => 'vies_application_submit_message',
      '#title' => $this->t("Thank you for signing up!"),
      '#backlink' => [
        '#title' => $this->t('Back to application form'),
        '#type' => 'link',
        '#url' => Url::fromRoute('vies_application.application_form'),
        '#attributes' => ['class' => ['btn', 'btn-primary']],
      ],
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
      '#backlink' => [
        '#title' => $this->t('Back to application form'),
        '#type' => 'link',
        '#url' => Url::fromRoute('vies_application.application_form'),
        '#attributes' => ['class' => ['btn', 'btn-primary']],
      ],
    ];

    return $build;
  }
}
