<?php

/**
 * @file
 * Contains Drupal\vih_subscription\Form\CommonFormUtils.
 */

namespace Drupal\vih_subscription\Form;

use Drupal\Core\Url;
use Drupal\Core\Link;

class CommonFormUtils {

  /**
   * Return link to the terms and conditions page by nid
   * 
   * @param int $nid
   * @return string
   */
  static function getTermsAndConditionsLink($nid) {

    $options = [
      'attributes' => [
        'target' => '_blank'
      ]
    ];

    $terms_and_conditions_url = Url::fromRoute('entity.node.canonical', array('node' => $nid), $options);
    $terms_and_conditions_link = Link::fromTextAndUrl(t('terms and conditions'), $terms_and_conditions_url);
    $terms_and_conditions_link = $terms_and_conditions_link->toRenderable();
    $terms_and_conditions_link = render($terms_and_conditions_link);

    return $terms_and_conditions_link;
  }

}
