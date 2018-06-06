<?php

namespace Drupal\vies_valuation\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\taxonomy\TermInterface;
use Drupal\views\Views;

/**
 * Valuation controller.
 */
class ValuationController extends ControllerBase {

  /**
   * Valuation page callback.
   */
  public function page(TermInterface $taxonomy_term) {
    $build = ['#theme' => 'region_sectioned_fluid'];

    // Applications to valuate.
    $build['to_valuate'] = $this->formBuilder()->getForm('Drupal\vies_valuation\Form\ValuationForm', $taxonomy_term);

    // Load valuated aplpication.
    $args = [$taxonomy_term->id()];
    $view = Views::getView('vies_valuated_application');
    $view->setArguments($args);
    $view->setDisplay('default');
    $view->preExecute();
    $view->execute();
    $build['valuated'] = $view->render();

    return $build;
  }

}
