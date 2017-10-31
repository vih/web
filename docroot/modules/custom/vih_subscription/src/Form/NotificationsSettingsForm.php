<?php

namespace Drupal\vih_subscription\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class NotificationsSettingsForm extends ConfigFormBase {
  public static $configName = 'vih_subscription.notifications.settings';

  /**
   * Gets the configuration names that will be editable.
   *
   * @return array
   *   An array of configuration object names that are editable if called in
   *   conjunction with the trait's config() method.
   */
  protected function getEditableConfigNames() {
    return [
      NotificationsSettingsForm::$configName
    ];
  }

  /**
   * Returns a unique string identifying the form.
   *
   * @return string
   *   The unique string identifying the form.
   */
  public function getFormId() {
    return 'vih_subscription_notifications_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function  buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config(NotificationsSettingsForm::$configName);

    // Long course
    $form['vih_subscription_notifications_long_course_fs'] = [
      '#type' => 'details',
      '#title' => $this->t('Long course notifications'),
      '#open' => FALSE,
    ];

    $form['vih_subscription_notifications_long_course_fs']['vih_subscription_long_course_notifications_subject'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Subject'),
      '#default_value' => $config->get('vih_subscription_long_course_notifications_subject'),
    ];

    $form['vih_subscription_notifications_long_course_fs']['vih_subscription_long_course_notifications_body'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Body'),
      '#default_value' => $config->get('vih_subscription_long_course_notifications_body'),
      '#description' => $this->t("You can use the following replacement tokens: <br>
      <b>@subject_name</b> => Name of the course <br> <b>@person_name</b> => Name of the person")
    ];

    // Short course
    $form['vih_subscription_notifications_short_course_fs'] = [
      '#type' => 'details',
      '#title' => $this->t('Short course notifications'),
      '#open' => FALSE,
    ];

    $form['vih_subscription_notifications_short_course_fs']['vih_subscription_short_course_notifications_subject'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Subject'),
      '#default_value' => $config->get('vih_subscription_short_course_notifications_subject'),
    ];

    $form['vih_subscription_notifications_short_course_fs']['vih_subscription_short_course_notifications_body'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Body'),
      '#default_value' => $config->get('vih_subscription_short_course_notifications_body'),
      '#description' => $this->t("You can use the following replacement tokens: <br>
      <b>@subject_name</b> => Name of the course <br> <b>@person_name</b> => Name of the person")
    ];

    // Events
    $form['vih_subscription_notifications_event_fs'] = [
      '#type' => 'details',
      '#title' => $this->t('Event notifications'),
      '#open' => FALSE,
    ];

    $form['vih_subscription_notifications_event_fs']['vih_subscription_event_notifications_subject'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Subject'),
      '#default_value' => $config->get('vih_subscription_event_notifications_subject'),
    ];

    $form['vih_subscription_notifications_event_fs']['vih_subscription_event_notifications_body'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Body'),
      '#default_value' => $config->get('vih_subscription_event_notifications_body'),
      '#description' => $this->t("You can use the following replacement tokens: <br>
      <b>@subject_name</b> => Name of the event <br> <b>@person_name</b> => Name of the person")
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $confObject = $this->config(NotificationsSettingsForm::$configName);
    foreach ($form_state->getValues() as $key => $value) {
      $confObject->set($key, $value);
    }

    $confObject->save();

    parent::submitForm($form, $form_state);
  }
}