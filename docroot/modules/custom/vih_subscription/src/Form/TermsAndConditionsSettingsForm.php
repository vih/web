<?php

namespace Drupal\vih_subscription\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;

class TermsAndConditionsSettingsForm extends ConfigFormBase {

  public static $configName = 'vih_subscription.terms_and_conditions.settings';

  /**
   * Gets the configuration names that will be editable.
   *
   * @return array
   *   An array of configuration object names that are editable if called in
   *   conjunction with the trait's config() method.
   */
  protected function getEditableConfigNames() {
    return [
      TermsAndConditionsSettingsForm::$configName
    ];
  }

  /**
   * Returns a unique string identifying the form.
   *
   * @return string
   *   The unique string identifying the form.
   */
  public function getFormId() {
    return 'vih_subscription_terms_and_conditions_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config(TermsAndConditionsSettingsForm::$configName);
    // Long course
    $form['vih_subscription_terms_and_conditions_long_course_fs'] = [
      '#type' => 'details',
      '#title' => $this->t('Long course terms and conditions page'),
      '#open' => FALSE,
    ];

    $form['vih_subscription_terms_and_conditions_long_course_fs']['vih_subscription_long_course_terms_and_conditions_page'] = [
      '#type' => 'entity_autocomplete',
      '#target_type' => 'node',
      '#selection_settings' => ['target_bundles' => ['page']],
      '#title' => $this->t('Page'),
      '#default_value' => !empty($config->get('vih_subscription_long_course_terms_and_conditions_page'))? Node::load($config->get('vih_subscription_long_course_terms_and_conditions_page')) : NULL,
      '#description' => $this->t("You can use any 'page' node as terms and conditions page"),
    ];

    // Short course
    $form['vih_subscription_terms_and_conditions_short_course_fs'] = [
      '#type' => 'details',
      '#title' => $this->t('Short course terms and conditions page'),
      '#open' => FALSE,
    ];

    $form['vih_subscription_terms_and_conditions_short_course_fs']['vih_subscription_short_course_terms_and_conditions_page'] = [
      '#type' => 'entity_autocomplete',
      '#target_type' => 'node',
      '#selection_settings' => ['target_bundles' => ['page']],
      '#title' => $this->t('Page'),
      '#default_value' => !empty($config->get('vih_subscription_short_course_terms_and_conditions_page'))? Node::load($config->get('vih_subscription_short_course_terms_and_conditions_page')) : NULL,
      '#description' => $this->t("You can use any 'page' node as terms and conditions page"),
    ];

    // Events
    $form['vih_subscription_terms_and_conditions_event_fs'] = [
      '#type' => 'details',
      '#title' => $this->t('Event terms and conditions page'),
      '#open' => FALSE,
    ];

    $form['vih_subscription_terms_and_conditions_event_fs']['vih_subscription_event_terms_and_conditions_page'] = [
      '#type' => 'entity_autocomplete',
      '#target_type' => 'node',
      '#selection_settings' => ['target_bundles' => ['page']],
      '#title' => $this->t('Page'),
      '#default_value' => !empty($config->get('vih_subscription_event_terms_and_conditions_page'))? Node::load($config->get('vih_subscription_event_terms_and_conditions_page')) : NULL,
      '#description' => $this->t("You can use any 'page' node as terms and conditions page"),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $confObject = $this->config(TermsAndConditionsSettingsForm::$configName);
    foreach ($form_state->getValues() as $key => $value) {
      $confObject->set($key, $value);
    }
    $confObject->save();

    parent::submitForm($form, $form_state);
  }

}
