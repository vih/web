<?php

use Drupal\node\Entity\Node;

function site_form_system_theme_settings_alter(
  &$form,
  Drupal\Core\Form\FormStateInterface $form_state
) {
  // Work-around for a core bug affecting admin themes. See issue #943212.
  if (isset($form_id)) {
    return;
  }

  // Provide the necessary default groups.
  $form['bellcom'] = [
    '#type' => 'vertical_tabs',
    '#prefix' => '<h2><small>' . t('Theme settings') . '</small></h2>',
    '#weight' => -10,
  ];

  // Contact URL
  $form['header_bar'] = [
    '#type' => 'details',
    '#title' => t('Header - bar'),
    '#group' => 'bellcom',
  ];
  $form['header_bar']['contact_url'] = [
    '#type' => 'entity_autocomplete',
    '#target_type' => 'node',
    '#selection_settings' => ['target_bundles' => ['page', 'news', 'event']],
    '#title' => t('Contact URL'),
    '#default_value' => !empty(theme_get_setting('contact_url')) ? Node::load(theme_get_setting('contact_url')) : NULL,
  ];
  $form['header_bar']['tour_url'] = [
    '#type' => 'entity_autocomplete',
    '#target_type' => 'node',
    '#selection_settings' => ['target_bundles' => ['page', 'news', 'event']],
    '#title' => t('Tour URL'),
    '#default_value' => !empty(theme_get_setting('tour_url')) ? Node::load(theme_get_setting('tour_url')) : NULL,
  ];

  // Contact information
  $form['contact_information'] = [
    '#type' => 'details',
    '#title' => t('Kontaktinformation'),
    '#group' => 'bellcom',
  ];

  // Business owner name
  $form['contact_information']['business_owner_name'] = [
    '#type' => 'textfield',
    '#title' => t('Navn'),
    '#default_value' => theme_get_setting('business_owner_name'),
  ];

  // Business startup year
  $form['contact_information']['business_startup_year'] = [
    '#type' => 'textfield',
    '#title' => t('Opstartsår'),
    '#description' => t('Det årstal der vises i copyright. <br>Eks. Copyright <strong><u>2011</u></strong> - ' . date('Y')),
    '#default_value' => theme_get_setting('business_startup_year'),
  ];

  // Address
  $form['contact_information']['address'] = [
    '#type' => 'textfield',
    '#title' => t('Adresse'),
    '#default_value' => theme_get_setting('address'),
  ];

  // Zipcode
  $form['contact_information']['zipcode'] = [
    '#type' => 'textfield',
    '#title' => t('Post nr.'),
    '#default_value' => theme_get_setting('zipcode'),
  ];

  // City
  $form['contact_information']['city'] = [
    '#type' => 'textfield',
    '#title' => t('By'),
    '#default_value' => theme_get_setting('city'),
  ];

  // Phone number
  $form['contact_information']['phone_system'] = [
    '#type' => 'textfield',
    '#title' => t('Telefon'),
    '#description' => t('HUSK: uden mellemrum og inkl. +45 f.eks.: +4570260085'),
    '#default_value' => theme_get_setting('phone_system'),
  ];

  // Phone number - readable
  $form['contact_information']['phone_readable'] = [
    '#type' => 'textfield',
    '#title' => t('Vist telefon nummer'),
    '#description' => t('Telefonnummeret vist (brug evt. mellemrum så det er let læseligt)'),
    '#default_value' => theme_get_setting('phone_readable'),
  ];

  // E-mail address
  $form['contact_information']['email'] = [
    '#type' => 'textfield',
    '#title' => t('E-mail'),
    '#default_value' => theme_get_setting('email'),
  ];

  // Working hours
  $form['contact_information']['working_hours'] = [
    '#type' => 'textfield',
    '#title' => t('Åbningstid eller anden info'),
    '#default_value' => theme_get_setting('working_hours'),
  ];

  // Social
  $form['social'] = [
    '#type' => 'details',
    '#title' => t('Sociale tjenester'),
    '#group' => 'bellcom',
  ];

  // Facebook
  $form['social']['facebook'] = [
    '#type' => 'checkbox',
    '#title' => t('Facebook'),
    '#default_value' => theme_get_setting('facebook'),
  ];
  $form['social']['facebook_url'] = [
    '#type' => 'textfield',
    '#title' => t('Facebook URL'),
    '#default_value' => theme_get_setting('facebook_url'),
    '#states' => [
      // Hide the options when the cancel notify checkbox is disabled.
      'visible' => [
        ':input[name="facebook"]' => [
          'checked' => TRUE,
        ],
      ],
    ],
  ];
  $form['social']['facebook_tooltip'] = [
    '#type' => 'textfield',
    '#title' => t('Tekst ved mouse-over'),
    '#default_value' => theme_get_setting('facebook_tooltip'),
    '#states' => [
      // Hide the options when the cancel notify checkbox is disabled.
      'visible' => [
        ':input[name="facebook"]' => [
          'checked' => TRUE,
        ],
      ],
    ],
  ];

  // Twitter
  $form['social']['twitter'] = [
    '#type' => 'checkbox',
    '#title' => t('Twitter'),
    '#default_value' => theme_get_setting('twitter'),
  ];
  $form['social']['twitter_url'] = [
    '#type' => 'textfield',
    '#title' => t('Twitter URL'),
    '#default_value' => theme_get_setting('twitter_url'),
    '#states' => [
      // Hide the options when the cancel notify checkbox is disabled.
      'visible' => [
        ':input[name="twitter"]' => [
          'checked' => TRUE,
        ],
      ],
    ],
  ];
  $form['social']['twitter_tooltip'] = [
    '#type' => 'textfield',
    '#title' => t('Tekst ved mouse-over'),
    '#default_value' => theme_get_setting('twitter_tooltip'),
    '#states' => [
      // Hide the options when the cancel notify checkbox is disabled.
      'visible' => [
        ':input[name="twitter"]' => [
          'checked' => TRUE,
        ],
      ],
    ],
  ];

  // Google plus
  $form['social']['googleplus'] = [
    '#type' => 'checkbox',
    '#title' => t('Google plus'),
    '#default_value' => theme_get_setting('googleplus'),
  ];
  $form['social']['googleplus_url'] = [
    '#type' => 'textfield',
    '#title' => t('Google plus URL'),
    '#default_value' => theme_get_setting('googleplus_url'),
    '#states' => [
      // Hide the options when the cancel notify checkbox is disabled.
      'visible' => [
        ':input[name="googleplus"]' => [
          'checked' => TRUE,
        ],
      ],
    ],
  ];
  $form['social']['googleplus_tooltip'] = [
    '#type' => 'textfield',
    '#title' => t('Tekst ved mouse-over'),
    '#default_value' => theme_get_setting('googleplus_tooltip'),
    '#states' => [
      // Hide the options when the cancel notify checkbox is disabled.
      'visible' => [
        ':input[name="googleplus"]' => [
          'checked' => TRUE,
        ],
      ],
    ],
  ];

  // Instagram
  $form['social']['instagram'] = [
    '#type' => 'checkbox',
    '#title' => t('Instagram'),
    '#default_value' => theme_get_setting('instagram'),
  ];
  $form['social']['instagram_url'] = [
    '#type' => 'textfield',
    '#title' => t('Instagram URL'),
    '#default_value' => theme_get_setting('instagram_url'),
    '#states' => [
      // Hide the options when the cancel notify checkbox is disabled.
      'visible' => [
        ':input[name="instagram"]' => [
          'checked' => TRUE,
        ],
      ],
    ],
  ];
  $form['social']['instagram_tooltip'] = [
    '#type' => 'textfield',
    '#title' => t('Tekst ved mouse-over'),
    '#default_value' => theme_get_setting('instagram_tooltip'),
    '#states' => [
      // Hide the options when the cancel notify checkbox is disabled.
      'visible' => [
        ':input[name="instagram"]' => [
          'checked' => TRUE,
        ],
      ],
    ],
  ];

  // LinkedIn
  $form['social']['linkedin'] = [
    '#type' => 'checkbox',
    '#title' => t('LinkedIn'),
    '#default_value' => theme_get_setting('linkedin'),
  ];
  $form['social']['linkedin_url'] = [
    '#type' => 'textfield',
    '#title' => t('LinkedIn URL'),
    '#default_value' => theme_get_setting('linkedin_url'),
    '#states' => [
      // Hide the options when the cancel notify checkbox is disabled.
      'visible' => [
        ':input[name="linkedin"]' => [
          'checked' => TRUE,
        ],
      ],
    ],
  ];
  $form['social']['linkedin_tooltip'] = [
    '#type' => 'textfield',
    '#title' => t('Tekst ved mouse-over'),
    '#default_value' => theme_get_setting('linkedin_tooltip'),
    '#states' => [
      // Hide the options when the cancel notify checkbox is disabled.
      'visible' => [
        ':input[name="linkedin"]' => [
          'checked' => TRUE,
        ],
      ],
    ],
  ];

  // Pinterest
  $form['social']['pinterest'] = [
    '#type' => 'checkbox',
    '#title' => t('Pinterest'),
    '#default_value' => theme_get_setting('pinterest'),
  ];
  $form['social']['pinterest_url'] = [
    '#type' => 'textfield',
    '#title' => t('Pinterest URL'),
    '#default_value' => theme_get_setting('pinterest_url'),
    '#states' => [
      // Hide the options when the cancel notify checkbox is disabled.
      'visible' => [
        ':input[name="pinterest"]' => [
          'checked' => TRUE,
        ],
      ],
    ],
  ];
  $form['social']['pinterest_tooltip'] = [
    '#type' => 'textfield',
    '#title' => t('Tekst ved mouse-over'),
    '#default_value' => theme_get_setting('pinterest_tooltip'),
    '#states' => [
      // Hide the options when the cancel notify checkbox is disabled.
      'visible' => [
        ':input[name="pinterest"]' => [
          'checked' => TRUE,
        ],
      ],
    ],
  ];

  // Vimeo
  $form['social']['vimeo'] = [
    '#type' => 'checkbox',
    '#title' => t('Vimeo'),
    '#default_value' => theme_get_setting('vimeo'),
  ];
  $form['social']['vimeo_url'] = [
    '#type' => 'textfield',
    '#title' => t('Vimeo URL'),
    '#default_value' => theme_get_setting('vimeo_url'),
    '#states' => [
      // Hide the options when the cancel notify checkbox is disabled.
      'visible' => [
        ':input[name="vimeo"]' => [
          'checked' => TRUE,
        ],
      ],
    ],
  ];
  $form['social']['vimeo_tooltip'] = [
    '#type' => 'textfield',
    '#title' => t('Tekst ved mouse-over'),
    '#default_value' => theme_get_setting('vimeo_tooltip'),
    '#states' => [
      // Hide the options when the cancel notify checkbox is disabled.
      'visible' => [
        ':input[name="vimeo"]' => [
          'checked' => TRUE,
        ],
      ],
    ],
  ];

  // Youtube
  $form['social']['youtube'] = [
    '#type' => 'checkbox',
    '#title' => t('Youtube'),
    '#default_value' => theme_get_setting('youtube'),
  ];
  $form['social']['youtube_url'] = [
    '#type' => 'textfield',
    '#title' => t('Youtube URL'),
    '#default_value' => theme_get_setting('youtube_url'),
    '#states' => [
      // Hide the options when the cancel notify checkbox is disabled.
      'visible' => [
        ':input[name="youtube"]' => [
          'checked' => TRUE,
        ],
      ],
    ],
  ];
  $form['social']['youtube_tooltip'] = [
    '#type' => 'textfield',
    '#title' => t('Tekst ved mouse-over'),
    '#default_value' => theme_get_setting('youtube_tooltip'),
    '#states' => [
      // Hide the options when the cancel notify checkbox is disabled.
      'visible' => [
        ':input[name="youtube"]' => [
          'checked' => TRUE,
        ],
      ],
    ],
  ];
}
