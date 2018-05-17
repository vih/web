<?php

namespace Drupal\vies_application\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;

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

    $periods_default_value = $form_state->getValue('periods');
    $reset_classes = FALSE;
    if (!empty($nid)) {
      $storage = $form_state->getStorage();
      if (isset($storage['course']) && $storage['course'] != $nid) {
        $reset_classes = TRUE;
      }
      $storage['course'] = $nid;
      $form_state->setStorage($storage);
      $course = Node::load($nid);
      $periods = $course->field_vih_course_periods->referencedEntities();
      $options = [];
      foreach ($periods as $period) {
        $options[$period->id()] = $period->getTitle();
      }

      if (empty($periods_default_value) || $reset_classes) {
        $periods_default_value = empty($options) ? NULL : key($options);
        $reset_classes = FALSE;
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
    }

    $form['periodsWrapper']['coursePeriods'] = [
      '#type' => 'container',
      '#theme' => 'vies_application_periods',
      '#attributes' => ['id' => 'coursePeriods'],
    ];

    $nid = $periods_default_value;
    if (!empty($periods_default_value) && !$reset_classes) {
      $selected_periods = Node::loadMultiple([$nid]);
      // Composing available classes selection per CourseSlot for each
      // CoursePeriod.
      foreach ($selected_periods as $period_delta => $course_period) {
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

          $form['periodsWrapper']['coursePeriods']['classes'][$available_classes_cid] = array(
            '#type' => 'radios',
            '#options' => $radios_options,
            '#theme' => 'vih_subscription_class_selection_radios',
            '#classes' => array(
              'radio_selection' => $classes_radio_selections,
            ),
          );
        }
      }
    }

    $form['#theme'] = 'vies_application_form';

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

}
