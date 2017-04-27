<?php
/**
 * Created by PhpStorm.
 * User: stan
 * Date: 27/04/17
 * Time: 16:10
 */

namespace Drupal\vih_subscription\Form;

use Drupal\Core\Locale\CountryManager;

class CourseOrderOptionsList {

  /**
   * Returns list of countries mapped by country code
   * if key is used then the values for that key is returned.
   *
   * @param $key
   * @return array
   */
  public static function getNationalityList($key = null) {
    $list = CountryManager::getStandardList();
    if ($key) {
      return $list[$key];
    }
    return $list;
  }

  /**
   * Returns list of educations
   * if key is used then the values for that key is returned.
   *
   * @param $key
   * @return array
   */
  public static function getEducationList($key = null) {
    $list = array(
      'folkeskole' => \Drupal::translation()->translate('Folkeskole'),
      'gymnasium' => \Drupal::translation()->translate('Gymnasium'),
      'hf' => \Drupal::translation()->translate('HF'),
      'handelsskole' => \Drupal::translation()->translate('Handelsskole'),
      'andet' => \Drupal::translation()->translate('Andet')
    );
    if ($key) {
      return $list[$key];
    }
    return $list;
  }

  /**
   * Returns list of available payment methods
   * if key is used then the values for that key is returned.
   *
   * @param $key
   * @return array
   */
  public static function getPaymentList($key = null) {
    $list = array(
      'egne' => \Drupal::translation()->translate('Egne midler / forældres'),
      'arbejdsloskasse' => \Drupal::translation()->translate('Arbejdsløshedskasse'),
      'kontanthjaelp' => \Drupal::translation()->translate('Kontanthjælp'),
      'integrationsydelse' => \Drupal::translation()->translate('Integrationsydelse'),
      'andet' => \Drupal::translation()->translate('Andet')
    );
    if ($key) {
      return $list[$key];
    }
    return $list;
  }

  /**
   * Returns list of where customer found from about the service
   * if key is used then the values for that key is returned.
   *
   * @param $key
   * @return array
   */
  public static function getFoundFromList($key = null) {
    $list = array(
      '1' => \Drupal::translation()->translate('One'),
      '2' => array(
        '2.1' => \Drupal::translation()->translate('Two point one'),
        '2.2' => \Drupal::translation()->translate('Two point two'),
      ),
      '3' => \Drupal::translation()->translate('Three'),
    );
    if ($key) {
      return $list[$key];
    }
    return $list;
  }

} 