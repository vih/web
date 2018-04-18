<?php

namespace Drupal\vih_subscription\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;

class LongCourseSubscriptionSettingsForm extends ConfigFormBase {

  public static $configName = 'vih_subscription.long_course_subscription.settings';

  /**
   * Gets the configuration names that will be editable.
   *
   * @return array
   *   An array of configuration object names that are editable if called in
   *   conjunction with the trait's config() method.
   */
  protected function getEditableConfigNames() {
    return [
      LongCourseSubscriptionSettingsForm::$configName
    ];
  }

  /**
   * Returns a unique string identifying the form.
   *
   * @return string
   *   The unique string identifying the form.
   */
  public function getFormId() {
    return 'vih_subscription_long_course_subscription_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config(LongCourseSubscriptionSettingsForm::$configName);
    // Long course
    $form['vih_subscription_long_course_subscription_settings_fs'] = [
      '#type' => 'details',
      '#title' => $this->t('Long course subscription settings'),
      '#open' => TRUE,
    ];

    $form['vih_subscription_long_course_subscription_settings_fs']['vih_subscription_long_course_subscription_enquire_price_page_international'] = [
      '#type' => 'entity_autocomplete',
      '#target_type' => 'node',
      '#selection_settings' => ['target_bundles' => ['page']],
      '#title' => $this->t('Page for price enquiry (international)'),
      '#default_value' => !empty($config->get('vih_subscription_long_course_subscription_enquire_price_page_international'))? Node::load($config->get('vih_subscription_long_course_subscription_enquire_price_page_international')) : NULL,
      '#description' => $this->t('Provide a page, which allows international users to enquiry the price.'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $confObject = $this->config(LongCourseSubscriptionSettingsForm::$configName);
    foreach ($form_state->getValues() as $key => $value) {
      $confObject->set($key, $value);
    }
    $confObject->save();

    parent::submitForm($form, $form_state);
  }

}
