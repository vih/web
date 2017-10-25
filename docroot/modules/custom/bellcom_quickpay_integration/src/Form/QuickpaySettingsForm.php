<?php

namespace Drupal\bellcom_quickpay_integration\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class QuickpaySettingsForm extends ConfigFormBase {
  public static $configName = 'bellcom_quickpay_integration.settings';

  /**
   * Gets the configuration names that will be editable.
   *
   * @return array
   *   An array of configuration object names that are editable if called in
   *   conjunction with the trait's config() method.
   */
  protected function getEditableConfigNames() {
    return [
      QuickpaySettingsForm::$configName
    ];
  }

  /**
   * Returns a unique string identifying the form.
   *
   * @return string
   *   The unique string identifying the form.
   */
  public function getFormId() {
    return 'bellcom_quickpay_integration_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function  buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config(QuickpaySettingsForm::$configName);

    $form['bellcom_quickpay_integration_fieldset'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Bellcom QuickPay integration settings'),
    ];

    $form['bellcom_quickpay_integration_fieldset']['test_mode'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Run in TEST mode?'),
      '#default_value' => $config->get('test_mode'),
    ];

    $form['bellcom_quickpay_integration_fieldset']['api_key'] = [
      '#type' => 'textfield',
      '#title' => $this->t('API Key'),
      '#default_value' => $config->get('api_key'),
    ];
//
//    $form['vih_subscription_edbbrugsen']['password'] = [
//      '#type' => 'textfield',
//      '#title' => $this->t('EDBBrugresen password'),
//      '#default_value' => $config->get('password'),
//      '#states' => [
//        'visible'=> [
//          ':input[name = "active"]' => ['checked' => TRUE]
//        ]
//      ]
//    ];
//
//    $form['vih_subscription_edbbrugsen']['school_code'] = [
//      '#type' => 'textfield',
//      '#title' => $this->t('EDBBrugresen school code'),
//      '#default_value' => $config->get('school_code'),
//      '#states' => [
//        'visible'=> [
//          ':input[name = "active"]' => ['checked' => TRUE]
//        ]
//      ]
//    ];
//
//    $form['vih_subscription_edbbrugsen']['book_number'] = [
//      '#type' => 'textfield',
//      '#title' => $this->t('EDBBrugresen book number'),
//      '#default_value' => $config->get('book_number'),
//      '#states' => [
//        'visible'=> [
//          ':input[name = "active"]' => ['checked' => TRUE]
//        ]
//      ]
//    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $confObject = $this->config(QuickpaySettingsForm::$configName);
    foreach ($form_state->getValues() as $key => $value) {
      $confObject->set($key, $value);
    }

    $confObject->save();

    parent::submitForm($form, $form_state);
  }
}