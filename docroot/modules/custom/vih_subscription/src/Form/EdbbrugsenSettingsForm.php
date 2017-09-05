<?php

namespace Drupal\vih_subscription\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class EdbbrugsenSettingsForm extends ConfigFormBase {
  public static $configName = 'vih_subscription.edbbrugsen.settings';

  /**
   * Gets the configuration names that will be editable.
   *
   * @return array
   *   An array of configuration object names that are editable if called in
   *   conjunction with the trait's config() method.
   */
  protected function getEditableConfigNames() {
    return [
      $this->$configName
    ];
  }

  /**
   * Returns a unique string identifying the form.
   *
   * @return string
   *   The unique string identifying the form.
   */
  public function getFormId() {
    return 'vih_subscription_edbbrugsen_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function  buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config($this->configName);

    $form['vih_subscription_edbbrugsen'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('EDBBrugresen integration settings'),
    ];

    $form['vih_subscription_edbbrugsen']['active'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Activate EDBBrugresen integration'),
      '#default_value' => $config->get('active'),
    ];

    $form['vih_subscription_edbbrugsen']['username'] = [
      '#type' => 'textfield',
      '#title' => $this->t('EDBBrugresen username'),
      '#default_value' => $config->get('username'),
      '#states' => [
        'visible'=> [
          ':input[name = "active"]' => ['checked' => TRUE]
        ]
      ]
    ];

    $form['vih_subscription_edbbrugsen']['password'] = [
      '#type' => 'textfield',
      '#title' => $this->t('EDBBrugresen password'),
      '#default_value' => $config->get('password'),
      '#states' => [
        'visible'=> [
          ':input[name = "active"]' => ['checked' => TRUE]
        ]
      ]
    ];

    $form['vih_subscription_edbbrugsen']['school_code'] = [
      '#type' => 'textfield',
      '#title' => $this->t('EDBBrugresen school code'),
      '#default_value' => $config->get('school_code'),
      '#states' => [
        'visible'=> [
          ':input[name = "active"]' => ['checked' => TRUE]
        ]
      ]
    ];

    $form['vih_subscription_edbbrugsen']['book_number'] = [
      '#type' => 'textfield',
      '#title' => $this->t('EDBBrugresen book number'),
      '#default_value' => $config->get('book_number'),
      '#states' => [
        'visible'=> [
          ':input[name = "active"]' => ['checked' => TRUE]
        ]
      ]
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $confObject = $this->config($this->configName);
    foreach ($form_state->getValues() as $key => $value) {
      $confObject->set($key, $value);
    }

    $confObject->save();

    parent::submitForm($form, $form_state);
  }
}