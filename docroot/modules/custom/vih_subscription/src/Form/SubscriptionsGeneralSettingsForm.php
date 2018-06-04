<?php

namespace Drupal\vih_subscription\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;

class SubscriptionsGeneralSettingsForm extends ConfigFormBase {

  public static $configName = 'vih_subscription.general.settings';

  /**
   * Gets the configuration names that will be editable.
   * @return array
   *   An array of configuration object names that are editable if called in
   *   conjunction with the trait's config() method.
   */
  protected function getEditableConfigNames() {
    return [
      SubscriptionsGeneralSettingsForm::$configName
    ];
  }

  /**
   * Returns a unique string identifying the form.
   * @return string
   *   The unique string identifying the form.
   */
  public function getFormId() {
    return 'vih_subscription_subscriptons_general_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config(SubscriptionsGeneralSettingsForm::$configName);
    $notification_description = $this->t("You can use the following replacement tokens: <br>
      <b>@subject_name</b> => Name of the course <br>
      <b>@person_name</b> => Name of the person <br>
      <b>@date</b> => Date of the course <br>
      <b>@url</b> => Link to the course <br>
      <b>@order</b> => Order full information");

    /**
     * Long course start.
     */
    $form['vih_subscription_settings_long_course_fs'] = [
      '#type' => 'details',
      '#title' => $this->t('Long course settings'),
      '#open' => FALSE,
    ];

    // Long course terms and conditions page.
    $form['vih_subscription_settings_long_course_fs']['vih_subscription_long_course_terms_and_conditions_page'] = [
      '#type' => 'entity_autocomplete',
      '#target_type' => 'node',
      '#selection_settings' => ['target_bundles' => ['page']],
      '#title' => $this->t('Terms and conditions page'),
      '#default_value' => !empty($config->get('vih_subscription_long_course_terms_and_conditions_page')) ? Node::load($config->get('vih_subscription_long_course_terms_and_conditions_page')) : NULL,
      '#description' => $this->t("You can use any 'page' node as terms and conditions page"),
    ];

    // Long course redirection settings.
    $form['vih_subscription_settings_long_course_fs']['vih_subscription_long_course_redirection_page'] = [
      '#type' => 'entity_autocomplete',
      '#target_type' => 'node',
      '#selection_settings' => ['target_bundles' => ['page']],
      '#title' => $this->t('Redirection page'),
      '#default_value' => !empty($config->get('vih_subscription_long_course_redirection_page')) ? Node::load($config->get('vih_subscription_long_course_redirection_page')) : NULL,
      '#description' => $this->t("You can use any 'page' node to redirect after order submitted successfully"),
    ];

    // Long course page for price enquiry.
    $form['vih_subscription_settings_long_course_fs']['vih_subscription_long_course_subscription_enquire_price_page_international'] = [
      '#type' => 'entity_autocomplete',
      '#target_type' => 'node',
      '#selection_settings' => ['target_bundles' => ['page']],
      '#title' => $this->t('Page for price enquiry (international)'),
      '#default_value' => !empty($config->get('vih_subscription_long_course_subscription_enquire_price_page_international')) ? Node::load($config->get('vih_subscription_long_course_subscription_enquire_price_page_international')) : NULL,
      '#description' => $this->t('Provide a page, which allows international users to enquiry the price.'),
    ];

    // Long course notification.
    $form['vih_subscription_settings_long_course_fs']['vih_subscription_notifications_long_course_fs'] = [
      '#type' => 'details',
      '#title' => $this->t('Notifications'),
      '#open' => FALSE,
    ];
    $form['vih_subscription_settings_long_course_fs']['vih_subscription_notifications_long_course_fs']['vih_subscription_long_course_notifications_subject'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Subject'),
      '#default_value' => $config->get('vih_subscription_long_course_notifications_subject'),
    ];
    $form['vih_subscription_settings_long_course_fs']['vih_subscription_notifications_long_course_fs']['vih_subscription_long_course_notifications_body'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Body'),
      '#default_value' => $config->get('vih_subscription_long_course_notifications_body'),
      '#description' => $notification_description,
    ];
    /**
     * Long course end.
     */

    /**
     * Short course start.
     */
    $form['vih_subscription_settings_short_course_fs'] = [
      '#type' => 'details',
      '#title' => $this->t('Short course settings'),
      '#open' => FALSE,
    ];

    // Short course terms and conditions page.
    $form['vih_subscription_settings_short_course_fs']['vih_subscription_short_course_terms_and_conditions_page'] = [
      '#type' => 'entity_autocomplete',
      '#target_type' => 'node',
      '#selection_settings' => ['target_bundles' => ['page']],
      '#title' => $this->t('Terms and conditions page'),
      '#default_value' => !empty($config->get('vih_subscription_short_course_terms_and_conditions_page')) ? Node::load($config->get('vih_subscription_short_course_terms_and_conditions_page')) : NULL,
      '#description' => $this->t("You can use any 'page' node as terms and conditions page"),
    ];

    // Short course redirection page.
    $form['vih_subscription_settings_short_course_fs']['vih_subscription_short_course_redirection_page'] = [
      '#type' => 'entity_autocomplete',
      '#target_type' => 'node',
      '#selection_settings' => ['target_bundles' => ['page']],
      '#title' => $this->t('Redirection page'),
      '#default_value' => !empty($config->get('vih_subscription_short_course_redirection_page')) ? Node::load($config->get('vih_subscription_short_course_redirection_page')) : NULL,
      '#description' => $this->t("You can use any 'page' node to redirect after order submitted successfully"),
    ];

    // Short course notification.
    $form['vih_subscription_settings_short_course_fs']['vih_subscription_notifications_short_course_fs'] = [
      '#type' => 'details',
      '#title' => $this->t('Short course notifications'),
      '#open' => FALSE,
    ];
    $form['vih_subscription_settings_short_course_fs']['vih_subscription_notifications_short_course_fs']['vih_subscription_short_course_notifications_subject'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Subject'),
      '#default_value' => $config->get('vih_subscription_short_course_notifications_subject'),
    ];
    $form['vih_subscription_settings_short_course_fs']['vih_subscription_notifications_short_course_fs']['vih_subscription_short_course_notifications_body'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Body'),
      '#default_value' => $config->get('vih_subscription_short_course_notifications_body'),
      '#description' => $notification_description
    ];
    /**
     * Short course end.
     */

    /**
     * Event start.
     */
    $form['vih_subscription_settings_event_fs'] = [
      '#type' => 'details',
      '#title' => $this->t('Event settings'),
      '#open' => FALSE,
    ];

    // Event terms and conditions page.
    $form['vih_subscription_settings_event_fs']['vih_subscription_event_terms_and_conditions_page'] = [
      '#type' => 'entity_autocomplete',
      '#target_type' => 'node',
      '#selection_settings' => ['target_bundles' => ['page']],
      '#title' => $this->t('Terms and conditions page'),
      '#default_value' => !empty($config->get('vih_subscription_event_terms_and_conditions_page')) ? Node::load($config->get('vih_subscription_event_terms_and_conditions_page')) : NULL,
      '#description' => $this->t("You can use any 'page' node as terms and conditions page"),
    ];

    // Event redirection page.
    $form['vih_subscription_settings_event_fs']['vih_subscription_event_redirection_page'] = [
      '#type' => 'entity_autocomplete',
      '#target_type' => 'node',
      '#selection_settings' => ['target_bundles' => ['page']],
      '#title' => $this->t('Redirection page'),
      '#default_value' => !empty($config->get('vih_subscription_event_redirection_page')) ? Node::load($config->get('vih_subscription_event_redirection_page')) : NULL,
      '#description' => $this->t("You can use any 'page' node to redirect after order submitted successfully"),
    ];

    // Event notification settings.
    $form['vih_subscription_settings_event_fs']['vih_subscription_notifications_event_fs'] = [
      '#type' => 'details',
      '#title' => $this->t('Event notifications'),
      '#open' => FALSE,
    ];
    $form['vih_subscription_settings_event_fs']['vih_subscription_notifications_event_fs']['vih_subscription_event_notifications_subject'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Subject'),
      '#default_value' => $config->get('vih_subscription_event_notifications_subject'),
    ];
    $form['vih_subscription_settings_event_fs']['vih_subscription_notifications_event_fs']['vih_subscription_event_notifications_body'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Body'),
      '#default_value' => $config->get('vih_subscription_event_notifications_body'),
      '#description' => $notification_description
    ];
    /**
     * Event end.
     */

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $confObject = $this->config(SubscriptionsGeneralSettingsForm::$configName);
    foreach ($form_state->getValues() as $key => $value) {
      $confObject->set($key, $value);
    }
    $confObject->save();

    parent::submitForm($form, $form_state);
  }

}
