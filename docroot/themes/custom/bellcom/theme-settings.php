<?php
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Theme\ThemeSettings;
use Drupal\system\Form\ThemeSettingsForm;
use Drupal\Core\Form;

function bellcom_form_system_theme_settings_alter(&$form, Drupal\Core\Form\FormStateInterface $form_state) {
  $form['site_settings']['general']['general_startup_year'] = array(
    '#type' => 'number',
    '#title' => t('Startup year'),
    '#description' => t('Enter the year you launched your business. This will result in ex. Copyright 2011-@yearNow', array('@yearNow' => date('Y'))),
    '#default_value' => theme_get_setting('general_startup_year'),
  );
}
