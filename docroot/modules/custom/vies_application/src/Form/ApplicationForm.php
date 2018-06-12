<?php

namespace Drupal\vies_application\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;
use Drupal\vies_application\ApplicationHandler;

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
      '#title' => 'Optagelses år',
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
      $this->removeInputValue('period', $form_state);
    }
    $form_state->set('course', $nid);
    $course = Node::load($nid);
    $periods = $course->field_vih_course_periods->referencedEntities();
    $options = [];
    foreach ($periods as $period) {
      $options[$period->id()] = $period->getTitle();
    }

    $periods_default_value = $form_state->getValue('period');
    if (empty($periods_default_value)) {
      $periods_default_value = empty($options) ? NULL : key($options);
    }
    $form['periodsWrapper']['period'] = [
      '#type' => 'select',
      '#title' => 'Årgang',
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
        $questions = $this->buildApplicationQuestions($class_questions);
        if (!empty($questions)) {
          $form['periodsWrapper']['coursePeriods']['questions'][$class->id()] = [
            '#type' => 'container',
            '#theme' => 'vies_application_questions',
            '#title' => $this->t('@class_name spørgsmål', ['@class_name' => $class->getName()]),
          ] + $questions;
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

    $values = $form_state->getValues();
    $course = Node::load($values['course']);

    // Going through the selected options.
    $pattern = '/^course-period-(\d)-courseSlot-(\d)-availableClasses$/';
    foreach (preg_grep($pattern, array_keys($values)) as $radio_key) {

      preg_match($pattern, $radio_key, $matches);
      $course_period_delta = $matches[1];
      $course_periods = $course->field_vih_course_periods->referencedEntities();
      $course_period = $course_periods[$course_period_delta];

      $course_slot_delta = $matches[2];
      $course_slots = $course_period->field_vih_cp_course_slots->referencedEntities();
      $course_slot = $course_slots[$course_slot_delta];

      if (!is_numeric($values[$radio_key])) {
        $form_state->setErrorByName($radio_key, $this->t('Venligst foretag et valg i %slotName.', array('%slotName' => $course_slot->field_vih_cs_title->value)));
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $values = $form_state->getValues();
    foreach ($values['parents'] as $key => &$parent) {
      $parent = $parent['top'] + $parent['left'] + $parent['right'];
    }

    $application = new ApplicationHandler($values);
    if ($application->process()) {
      $form_state->setRedirect('vies_application.application_form_success');
      return;
    }

    $form_state->setRedirect('vies_application.application_form_error');
  }

  /**
   * Callback for selects and returns the container with the parents in it.
   */
  public function addmoreParentCallback(array &$form, FormStateInterface $form_state) {
    return $form['parentsWrapper'];
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
      '#title' => 'Om dig',
      '#theme' => 'vies_application_section',
    ];
    $personal_data = $this->getPersonalDataForm();
    $personal_data['left']['gender'] = [
      '#type' => 'select',
      '#title' => 'Køn',
      '#options' => ApplicationHandler::$gender,
      '#empty_label' => 'None',
      '#required' => TRUE,
    ];

    $form['personalDataWrapper']['data'] = $personal_data;

    $about_school_questions = ApplicationHandler::$aboutSchool;
    $about_school = [];
    foreach ($about_school_questions as $key => $question) {
      $about_school[$key] = [
        '#type' => 'textarea',
        '#title' => $question,
        '#wrapper_attributes' => ['class' => ['col-md-12']],
        '#required' => TRUE,
      ];
    }

    $form['aboutSchool'] = [
      '#type' => 'container',
      '#title' => 'Om at gå i skole',
      '#theme' => 'vies_application_section',
      'questions' => $about_school,
    ];

    $form['parentsWrapper'] = [
      '#type' => 'container',
      '#title' => 'Forældre',
      '#theme' => 'vies_application_section',
      '#prefix' => '<div id="parents-wrapper">',
      '#suffix' => '</div>',
    ];

    // Gather the number of parents in the form already.
    $num_parents = $form_state->get('num_parents');
    // We have to ensure that there is at least one name field.
    if ($num_parents === NULL) {
      $form_state->set('num_parents', 1);
      $num_parents = 1;
    }

    $form['parentsWrapper']['parents'] = [
      '#type' => 'container',
      '#tree' => TRUE,
    ];

    for ($i = 0; $i < $num_parents; $i++) {
      $form['parentsWrapper']['parents'][$i] = $this->getPersonalDataForm($i == 0) + [
        'top' => [
          '#type' => 'container',
          '#attributes' => ['class' => ['form-inline']],
          'type' => [
            '#type' => 'radios',
            '#options' => ApplicationHandler::$adultType,
            '#weight' => -1,
            '#required' => TRUE,
          ],
        ],
        '#attributes' => ['class' => ['clearfix']],
      ];
    }

    $form['parentsWrapper']['actions'] = [
      '#type' => 'actions',
      '#attributes' => ['class' => ['col-md-12']],
    ];
    $form['parentsWrapper']['actions']['add_parent'] = [
      '#type' => 'submit',
      '#value' => 'Tilføj en forældre',
      '#submit' => ['::addOneParent'],
      '#ajax' => [
        'callback' => '::addmoreParentCallback',
        'wrapper' => 'parents-wrapper',
      ],
      '#attributes' => ['class' => ['btn-success']],
    ];
    // If there is more than one parent, add the remove button.
    if ($num_parents > 1) {
      $form['parentsWrapper']['actions']['remove_parent'] = [
        '#type' => 'submit',
        '#value' => 'Fjern en forældre',
        '#submit' => ['::removeParentCallback'],
        '#ajax' => [
          'callback' => '::addmoreParentCallback',
          'wrapper' => 'parents-wrapper',
        ],
        '#attributes' => ['class' => ['btn-danger']],
      ];
    }

    $after_school_questions = ApplicationHandler::$afterSchool;
    $after_school = [];
    foreach ($after_school_questions as $key => $question) {
      $after_school[$key] = [
        '#type' => 'textarea',
        '#title' => $question,
        '#wrapper_attributes' => ['class' => ['col-md-12']],
      ];
    }

    $form['afterSchool'] = [
      '#type' => 'container',
      '#title' => 'Dig på efterskole',
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
      '#title' => 'Navn',
      '#placeholder' => 'Navn',
      '#required' => $required,
    ];
    $personal_data['left']['lastName'] = [
      '#type' => 'textfield',
      '#title' => 'Efternavn',
      '#placeholder' => 'Efternavn',
      '#required' => $required,
    ];
    $personal_data['left']['cpr'] = [
      '#type' => 'textfield',
      '#title' => 'CPR',
      '#placeholder' => 'CPR',
      '#required' => $required,
    ];
    $personal_data['left']['telefon'] = [
      '#type' => 'textfield',
      '#title' => 'Telefon',
      '#placeholder' => 'Telefon',
      '#required' => $required,
    ];
    $personal_data['left']['email'] = [
      '#type' => 'email',
      '#title' => 'E-mail',
      '#placeholder' => 'E-mail',
      '#required' => $required,
    ];
    $personal_data['left']['newsletter'] = [
      '#type' => 'checkbox',
      '#title' => 'Nyhedsbrev',
      '#weight' => 100,
    ];

    // Personal data - right side.
    $personal_data['right'] = [
      '#type' => 'container',
    ];
    $personal_data['right']['address'] = [
      '#type' => 'textfield',
      '#title' => 'Adresse',
      '#placeholder' => 'Adresse',
      '#required' => $required,
    ];
    $personal_data['right']['houseNumber'] = [
      '#type' => 'textfield',
      '#title' => 'Bygning no.',
      '#placeholder' => 'Bygning no.',
      '#required' => $required,
    ];
    $personal_data['right']['houseLetter'] = [
      '#type' => 'textfield',
      '#title' => 'Bygning brev',
      '#placeholder' => 'Bygning brev',
    ];
    $personal_data['right']['houseFloor'] = [
      '#type' => 'textfield',
      '#title' => 'Sal',
      '#placeholder' => 'Sal',
    ];
    $personal_data['right']['city'] = [
      '#type' => 'textfield',
      '#title' => 'By',
      '#placeholder' => 'By',
      '#required' => $required,
    ];
    $personal_data['right']['municipality'] = [
      '#type' => 'textfield',
      '#title' => 'Kommune',
      '#placeholder' => 'Kommune',
      '#required' => $required,
    ];
    $personal_data['right']['zip'] = [
      '#type' => 'textfield',
      '#title' => 'Zipcode',
      '#placeholder' => 'Zipcode',
      '#required' => $required,
    ];

    return $personal_data;
  }

  /**
   * Helper function to build application questions.
   *
   * @param array $questions_terms
   *   The array of question terms .
   *
   * @return array $questions
   *   Array of question form elements.
   */
  private function buildApplicationQuestions(array $questions_terms) {
    $questions = [];

    foreach ($questions_terms as $term) {
      $type_value = $term->get('field_vies_question_type')->getValue();
      if (empty($type_value)) {
        continue;
      }
      $type = $type_value[0]['value'];
      $question = [
        '#title' => $term->getName(),
        '#required' => TRUE,
        '#type' => $type,
      ];

      switch ($type) {
        case 'select':
        case 'checkboxes':
        case 'radios':
          $options = [];
          $question_options = $term->get('field_vies_answer')->getValue();
          foreach ($question_options as $key => $option) {
            $options[$key] = $option['value'];
          }
          $question['#empty'] = 'None';
          $question['#options'] = $options;
          break;
      }

      $questions[$term->id()] = $question;
    }

    return $questions;
  }

}
