<?php

namespace Drupal\vies_valuation\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\taxonomy\TermInterface;

/**
 * Valuation controller.
 */
class ValuationController extends ControllerBase {

  /**
   * Valuation page callback.
   */
  public function page(TermInterface $taxonomy_term) {
    $build = [];
    $build['form'] = $this->formBuilder()->getForm('Drupal\vies_valuation\Form\ValuationForm');

    return $build;
  }

}
