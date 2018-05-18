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

    // Get form state storage.
    $storage = $form_state->getStorage();

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

    $form['periodsWrapper'] = [
      '#type' => 'container',
      '#attributes' => ['id' => 'availablePeriods'],
    ];

    if (empty($nid)) {
      return $form;
    }

    if (isset($storage['course']) && $storage['course'] != $nid) {
      $this->removeInputValue('periods', $form_state);
    }
    $storage['course'] = $nid;
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
      'questions' => [
        '#type' => 'container',
        '#attributes' => ['id' => 'questions'],
        '#tree' => TRUE,
      ],
    ];

    $nid = $periods_default_value;
    $reset_periods = FALSE;
    if (!empty($nid)) {
      if (isset($storage['period']) && $storage['period'] != $nid) {
        $reset_periods = TRUE;
      }
      $storage['period'] = $nid;
      $course_period = Node::load($nid);
      $period_delta = 0;
      // Composing available classes selection per CourseSlot for each
      // CoursePeriod.
      // CoursePeriods render helping array.
      $form['periodsWrapper']['coursePeriods']['#coursePeriods'][$period_delta] = array(
        'title' => $course_period->getTitle(),
        'courseSlots' => array(),
      );

      $not_mandatory_course_slots = array();
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
        $form['periodsWrapper']['coursePeriods']['#coursePeriods'][$period_delta]['courseSlots'][$slot_delta] = array(
          'title' => $course_slot->field_vih_cs_title->value,
          'availableClasses' => array(
            'cid' => $available_classes_cid,
          ),
        );

        // Creating real input-ready fields.
        $radios_options = array();
        $classes_radio_selections = array();
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
            '#type' => 'details',
            '#open' => TRUE,
            '#title' => $class->getName(),
          ], $questions);
        }
      }
    }

    // Set form_state storage.
    $form_state->setStorage($storage);

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Submit'),
    ];

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

}
