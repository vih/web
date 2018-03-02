<?php

namespace Drupal\vih_subscription\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;

class RedirectionPagesSettingsForm extends ConfigFormBase {

  public static $configName = 'vih_subscription.redirection_pages.settings';

  /**
   * Gets the configuration names that will be editable.
   *
   * @return array
   *   An array of configuration object names that are editable if called in
   *   conjunction with the trait's config() method.
   */
  protected function getEditableConfigNames() {
    return [
      RedirectionPagesSettingsForm::$configName
    ];
  }

  /**
   * Returns a unique string identifying the form.
   *
   * @return string
   *   The unique string identifying the form.
   */
  public function getFormId() {
    return 'vih_subscription_redirection_pages_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config(RedirectionPagesSettingsForm::$configName);
    // Long course
    $form['vih_subscription_redirection_pages_long_course_fs'] = [
      '#type' => 'details',
      '#title' => $this->t('Long course order redirection page'),
      '#open' => FALSE,
    ];

    $form['vih_subscription_redirection_pages_long_course_fs']['vih_subscription_long_course_redirection_page'] = [
      '#type' => 'entity_autocomplete',
      '#target_type' => 'node',
      '#selection_settings' => ['target_bundles' => ['page']],
      '#title' => $this->t('Page'),
      '#default_value' => !empty($config->get('vih_subscription_long_course_redirection_page'))? Node::load($config->get('vih_subscription_long_course_redirection_pages_page')) : NULL,
      '#description' => $this->t("You can use any 'page' node to redirect after order submitted successfully"),
    ];

    // Short course
    $form['vih_subscription_redirection_pages_short_course_fs'] = [
      '#type' => 'details',
      '#title' => $this->t('Short course order redirection page'),
      '#open' => FALSE,
    ];

    $form['vih_subscription_redirection_pages_short_course_fs']['vih_subscription_short_course_redirection_page'] = [
      '#type' => 'entity_autocomplete',
      '#target_type' => 'node',
      '#selection_settings' => ['target_bundles' => ['page']],
      '#title' => $this->t('Page'),
      '#default_value' => !empty($config->get('vih_subscription_short_course_redirection_page'))? Node::load($config->get('vih_subscription_short_course_redirection_page')) : NULL,
      '#description' => $this->t("You can use any 'page' node to redirect after order submitted successfully"),
    ];

    // Events
    $form['vih_subscription_redirection_pages_event_fs'] = [
      '#type' => 'details',
      '#title' => $this->t('Event order redirection page'),
      '#open' => FALSE,
    ];

    $form['vih_subscription_redirection_pages_event_fs']['vih_subscription_event_redirection_page'] = [
      '#type' => 'entity_autocomplete',
      '#target_type' => 'node',
      '#selection_settings' => ['target_bundles' => ['page']],
      '#title' => $this->t('Page'),
      '#default_value' => !empty($config->get('vih_subscription_event_redirection_page'))? Node::load($config->get('vih_subscription_event_redirection_page')) : NULL,
      '#description' => $this->t("You can use any 'page' node to redirect after order submitted successfully"),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $confObject = $this->config(RedirectionPagesSettingsForm::$configName);
    foreach ($form_state->getValues() as $key => $value) {
      $confObject->set($key, $value);
    }
    $confObject->save();

    parent::submitForm($form, $form_state);
  }

}
