<?php

namespace Drupal\vies_application\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;

/**
 * Class ApplicationForm.
 */
class ApplicationForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'application_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['#attached']['library'][] = 'vih_subscription/vih-subscription-accordion-class-selection';
    $form['#attached']['library'][] = 'vih_subscription/vih-subscription-terms-and-conditions-modal';
    $form['#theme'] = 'vies_application_form';

    $nids = \Drupal::entityQuery('node')->condition('type', 'vih_long_cource')->execute();
    $options = [];
    foreach (Node::loadMultiple($nids) as $node) {
      $options[$node->id()] = $node->getTitle();
    }

    $default_value = $form_state->getValue('course');
    if (empty($default_value)) {
      $default_value = empty($options) ? NULL : key($options);
    }
    $form['course'] = [
      '#type' => 'select',
      '#title' => $this->t('Recording year'),
      '#options' => $options,
      '#empty_label' => 'None',
      '#default_value' => $default_value,
      '#required' => TRUE,
      '#ajax' => [
        'callback' => '::updateAvailablePeriods',
        'wrapper' => 'availablePeriods',
      ],
    ];
    $nid = $default_value;

    // Empty wrapper for periords.
    $form['periodsWrapper'] = [
      '#type' => 'container',
      '#attributes' => ['id' => 'availablePeriods'],
    ];

    if (empty($nid)) {
      return $form;
    }

    // Reset form when course has been changed.
    if ($form_state->get('course') != $nid) {
      $this->removeInputValue('periods', $form_state);
    }
    $form_state->set('course', $nid);
    $course = Node::load($nid);
    $periods = $course->field_vih_course_periods->referencedEntities();
    $options = [];
    foreach ($periods as $period) {
      $options[$period->id()] = $period->getTitle();
    }

    $periods_default_value = $form_state->getValue('periods');
    if (empty($periods_default_value)) {
      $periods_default_value = empty($options) ? NULL : key($options);
    }
    $form['periodsWrapper']['periods'] = [
      '#type' => 'select',
      '#title' => $this->t('Year'),
      '#options' => $options,
      '#empty_label' => 'None',
      '#default_value' => $periods_default_value,
      '#required' => TRUE,
      '#ajax' => [
        'callback' => '::updateCoursesPeriods',
        'wrapper' => 'coursePeriods',
      ],
    ];

    $form['periodsWrapper']['coursePeriods'] = [
      '#type' => 'container',
      '#theme' => 'vies_application_periods',
      '#attributes' => ['id' => 'coursePeriods'],
      // Empty wrapper for questions.
      'questions' => [
        '#type' => 'container',
        '#attributes' => ['id' => 'questions'],
        '#tree' => TRUE,
      ],
    ];

    $nid = $periods_default_value;
    $reset_periods = FALSE;
    if (!empty($nid)) {
      if ($form_state->get('period') != $nid) {
        $reset_periods = TRUE;
      }
      $form_state->set('period', $nid);
      $course_period = Node::load($nid);
      $period_delta = 0;
      // Composing available classes selection per CourseSlot for each
      // CoursePeriod.
      // CoursePeriods render helping array.
      $form['periodsWrapper']['coursePeriods']['#coursePeriods'][$period_delta] = [
        'title' => $course_period->getTitle(),
        'courseSlots' => [],
      ];

      $not_mandatory_course_slots = [];
      foreach ($course_period->field_vih_cp_course_slots->referencedEntities() as $course_slot) {
        // Adding only not mandatory course slots.
        if (!$course_slot->field_vih_cs_mandatory->value) {
          $not_mandatory_course_slots[] = $course_slot;
        }
      }

      foreach ($not_mandatory_course_slots as $slot_delta => $course_slot) {
        // Saving component id for future references.
        $available_classes_cid = "course-period-$period_delta-courseSlot-$slot_delta-availableClasses";

        // Reset previous selection if preiod has been changed.
        if ($reset_periods) {
          $this->removeInputValue($available_classes_cid, $form_state);
        }

        // CourseSlot render helping array.
        $form['periodsWrapper']['coursePeriods']['#coursePeriods'][$period_delta]['courseSlots'][$slot_delta] = [
          'title' => $course_slot->field_vih_cs_title->value,
          'availableClasses' => [
            'cid' => $available_classes_cid,
          ],
        ];

        // Creating real input-ready fields.
        $radios_options = [];
        $classes_radio_selections = [];
        foreach ($course_slot->field_vih_cs_classes->referencedEntities() as $class) {
          // Title is being handled in css depending on button
          // state and active language: see _radio-selection/_vih-class.scss
          $radios_options[$class->id()] = '';

          $classes_radio_selections[$class->id()] = taxonomy_term_view($class, 'radio_selection');
        }

        $form['periodsWrapper']['coursePeriods']['classes'][$available_classes_cid] = [
          '#type' => 'radios',
          '#options' => $radios_options,
          '#theme' => 'vih_subscription_class_selection_radios',
          '#classes' => ['radio_selection' => $classes_radio_selections],
          '#ajax' => [
            'callback' => '::updateQuestion',
            'wrapper' => 'questions',
          ],
        ];
      }

      // Load questions from classes terms.
      $values = $form_state->getValues();
      $pattern = '/^course-period-(\d)-courseSlot-(\d)-availableClasses$/';
      foreach (preg_grep($pattern, array_keys($values)) as $radio_key) {
        if (empty($values[$radio_key])) {
          continue;
        }
        $class = Term::load($values[$radio_key]);
        $class_questions = $class->field_questions->referencedEntities();
        $questions = [];
        foreach ($class_questions as $class_question) {
          $questions[$class_question->id()] = [
            '#type' => 'textfield',
            '#title' => $class_question->getName(),
            '#required' => TRUE,
          ];
        }
        if (!empty($questions)) {
          $form['periodsWrapper']['coursePeriods']['questions'][$class->id()] = array_merge([
            '#type' => 'container',
            '#theme' => 'vies_application_questions',
            '#title' => $this->t('@class_name questions', ['@class_name' => $class->getName()]),
          ], $questions);
        }
      }
    }

    $this->buildApplicationFormElements($form, $form_state);

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Submit'),
    ];
    $form_state->setCached(FALSE);

    return $form;
  }

  /**
   * Ajax callback for the Courses.
   */
  public function updateCoursesPeriods(array $form, FormStateInterface $form_state) {
    return $form['periodsWrapper']['coursePeriods'];
  }

  /**
   * Ajax callback for the Periods dropdown.
   */
  public function updateAvailablePeriods(array $form, FormStateInterface $form_state) {
    return $form['periodsWrapper'];
  }

  /**
   * Ajax callback for the Periods dropdown.
   */
  public function updateQuestion(array $form, FormStateInterface $form_state) {
    return $form['periodsWrapper']['coursePeriods']['questions'];
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // Display result.
    foreach ($form_state->getValues() as $key => $value) {
      drupal_set_message($key . ': ' . $value);
    }

  }

  /**
   * Callback for selects and returns the container with the parents in it.
   */
  public function addmoreParentCallback(array &$form, FormStateInterface $form_state) {
    return $form['parentsWrapper']['parents'];
  }

  /**
   * Submit handler for the "add-one-more" button.
   *
   * Increments the max counter and causes a rebuild.
   */
  public function addOneParent(array &$form, FormStateInterface $form_state) {
    $parents_field = $form_state->get('num_parents');
    $add_button = $parents_field + 1;
    $form_state->set('num_parents', $add_button);
    $form_state->setRebuild();
  }

  /**
   * Submit handler for the "remove one" button.
   *
   * Decrements the max counter and causes a form rebuild.
   */
  public function removeParentCallback(array &$form, FormStateInterface $form_state) {
    $parents_field = $form_state->get('num_parents');
    if ($parents_field > 1) {
      $remove_button = $parents_field - 1;
      $form_state->set('num_parents', $remove_button);
    }
    $form_state->setRebuild();
  }


  /**
   * Helper function to remove value from user input.
   *
   * @param string $key
   *   The remove value key.
   * @param FormStateInterface $form_state
   *   Form state object.
   */
  private function removeInputValue($key, FormStateInterface $form_state) {
    $input = $form_state->getUserInput();
    if (!empty($input[$key])) {
      unset($input[$key]);
    }
    $form_state->setUserInput($input);
    $form_state->unsetValue($key);
  }

  /**
   * Helper function to build application form elements.
   *
   * @param array $form
   *   The form array.
   * @param FormStateInterface $form_state
   *   Form state object.
   */
  private function buildApplicationFormElements(array &$form, FormStateInterface $form_state) {
    // Personal data - left side.
    $form['personalDataWrapper'] = [
      '#type' => 'container',
      '#title' => $this->t('About you'),
      '#theme' => 'vies_application_section',
    ];
    $personal_data = $this->getPersonalDataForm();
    $personal_data['left']['sex'] = [
      '#type' => 'select',
      '#title' => $this->t('Sex'),
      '#options' => [
        'm' => $this->t('Male'),
        'f' => $this->t('Female'),
      ],
      '#empty_label' => 'None',
      '#required' => TRUE,
    ];

    $form['personalDataWrapper']['data'] = $personal_data;

    $about_school = [
      'schoolFrom' => [
        '#type' => 'textarea',
        '#title' => $this->t('What school are you from?'),
        '#wrapper_attributes' => ['class' => ['col-md-12']],
      ],
      'schoolHowItsGoing' => [
        '#type' => 'textarea',
        '#title' => $this->t('How are you going to school?'),
        '#wrapper_attributes' => ['class' => ['col-md-12']],
      ],
      'schoolSubjects' => [
        '#type' => 'textarea',
        '#title' => $this->t('What subjects do you like and why?'),
        '#wrapper_attributes' => ['class' => ['col-md-12']],
      ]
    ];
    $form['aboutSchool'] = [
      '#type' => 'container',
      '#title' => $this->t('About to go to school'),
      '#theme' => 'vies_application_section',
      'questions' => $about_school,
    ];

    $form['parentsWrapper'] = [
      '#type' => 'container',
      '#title' => $this->t('Parents'),
      '#theme' => 'vies_application_section',
    ];

    // Gather the number of parents in the form already.
    $num_parents = $form_state->get('num_parents');
    // We have to ensure that there is at least one name field.
    if ($num_parents === NULL) {
      $form_state->set('num_parents', 1);
      $num_parents = 1;
    }

    $form['parentsWrapper']['#tree'] = TRUE;
    $form['parentsWrapper']['parents'] = [
      '#type' => 'container',
      '#prefix' => '<div id="parents-wrapper">',
      '#suffix' => '</div>',
    ];

    for ($i = 0; $i < $num_parents; $i++) {
      $form['parentsWrapper']['parents'][$i] = $this->getPersonalDataForm($i == 0) +
      ['#attributes' => ['class' => ['clearfix']]];
    }

    $form['parentsWrapper']['parents']['actions'] = [
      '#type' => 'actions',
      '#attributes' => ['class' => ['col-md-12']],
    ];
    $form['parentsWrapper']['parents']['actions']['add_parent'] = [
      '#type' => 'submit',
      '#value' => t('Add parent'),
      '#submit' => ['::addOneParent'],
      '#ajax' => [
        'callback' => '::addmoreParentCallback',
        'wrapper' => 'parents-wrapper',
      ],
    ];
    // If there is more than one parent, add the remove button.
    if ($num_parents > 1) {
      $form['parentsWrapper']['parents']['actions']['remove_parent'] = [
        '#type' => 'submit',
        '#value' => t('Remove parent'),
        '#submit' => ['::removeParentCallback'],
        '#ajax' => [
          'callback' => '::addmoreParentCallback',
          'wrapper' => 'parents-wrapper',
        ],
      ];
    }

    $after_school = [
      'afterSchoolExpectation' => [
        '#type' => 'textarea',
        '#title' => $this->t('What do you expect from a year after school?'),
        '#wrapper_attributes' => ['class' => ['col-md-12']],
      ],
      'afterSchoolHeardFrom' => [
        '#type' => 'textarea',
        '#title' => $this->t('Where have you heard of Vejle Idrætsefterskole?'),
        '#wrapper_attributes' => ['class' => ['col-md-12']],
      ],
      'afterSchoolComment' => [
        '#type' => 'textarea',
        '#title' => $this->t('Comment'),
        '#wrapper_attributes' => ['class' => ['col-md-12']],
      ]
    ];
    $form['afterSchool'] = [
      '#type' => 'container',
      '#title' => $this->t('You in efteskole'),
      '#theme' => 'vies_application_section',
      'questions' => $after_school,
    ];

  }

  /**
   * Helper function to build personal form elements.
   */
  private function getPersonalDataForm($required = TRUE) {
    $personal_data = [
      '#type' => 'container',
      '#theme' => 'vies_application_personal_data',
    ];
    $personal_data['left'] = [
      '#type' => 'container',
    ];
    $personal_data['left']['firstName'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Firstname'),
      '#placeholder' => $this->t('Firstname'),
      '#required' => $required,
    ];
    $personal_data['left']['lastName'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Lastname'),
      '#placeholder' => $this->t('Lastname'),
      '#required' => $required,
    ];
    $personal_data['left']['cpr'] = [
      '#type' => 'textfield',
      '#title' => $this->t('CPR'),
      '#placeholder' => $this->t('CPR'),
      '#required' => $required,
    ];
    $personal_data['left']['telefon'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Phone'),
      '#placeholder' => $this->t('Phone'),
      '#required' => $required,
    ];
    $personal_data['left']['email'] = [
      '#type' => 'email',
      '#title' => $this->t('E-mail address'),
      '#placeholder' => $this->t('E-mail address'),
      '#required' => $required,
    ];
    $personal_data['left']['newsletter'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Get updates from the school'),
      '#weight' => 100,
    ];

    // Personal data - right side.
    $personal_data['right'] = [
      '#type' => 'container',
    ];
    $personal_data['right']['address'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Address'),
      '#placeholder' => $this->t('Address'),
      '#required' => $required,
    ];
    $personal_data['right']['house']['houseNumber'] = [
      '#type' => 'textfield',
      '#title' => $this->t('House no.'),
      '#placeholder' => $this->t('House no.'),
      '#required' => $required,
    ];
    $personal_data['right']['house']['houseLetter'] = [
      '#type' => 'textfield',
      '#title' => $this->t('House letter'),
      '#placeholder' => $this->t('House letter'),
    ];
    $personal_data['right']['house']['houseFloor'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Floor'),
      '#placeholder' => $this->t('Floor'),
    ];
    $personal_data['right']['city'] = [
      '#type' => 'textfield',
      '#title' => $this->t('City'),
      '#placeholder' => $this->t('City'),
      '#required' => $required,
    ];
    $personal_data['right']['municipality'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Municipality'),
      '#placeholder' => $this->t('Municipality'),
      '#required' => $required,
    ];
    $personal_data['right']['zip'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Zipcode'),
      '#placeholder' => $this->t('Zipcode'),
      '#required' => $required,
    ];

    return $personal_data;
  }
}
