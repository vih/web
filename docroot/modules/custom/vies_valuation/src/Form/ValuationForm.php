<?php

namespace Drupal\vies_valuation\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;
use Drupal\Component\Render\FormattableMarkup;
use Drupal\Core\Url;
use Drupal\taxonomy\TermInterface;
use Drupal\vies_application\ApplicationHandler;

/**
 * Class ValuationForm.
 */
class ValuationForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'valuation_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, TermInterface $class = NULL) {
    $form['#prefix'] = '<div id="valuation-form-wrapper">';
    $form['#suffix'] = '</div>';

    $applications = \Drupal::entityQuery('node')
      ->condition('type', 'vies_application_form')
      ->condition('field_vies_class', $class->id())
      ->notExists('field_vies_label')
      ->notExists('field_vies_status')
      ->execute();

    if (empty($class) || empty($applications)) {
      $form[] = [
        '#markup' => 'Der er ingen ansøgning at vise',
      ];
      return $form;
    }

    $form['filters'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['row']],
    ];

    $available_period = [];
    $available_courses = [];
    foreach (Node::loadMultiple($applications) as $application) {
      $course = $application->field_vies_course->referencedEntities()[0];
      $available_courses[$course->id()] = $course->getTitle();

      $period = $application->field_vies_period->referencedEntities()[0];
      $available_period[$period->id()] = $period->getTitle();
    }

    $course_options = $available_courses;
    $course_default_value = $form_state->getValue('course');
    if (count($course_options) > 1) {
      $course_options = ['' => 'Årgang'] + $course_options;
    }
    $form['filters']['course'] = [
      '#type' => 'select',
      '#options' => $course_options,
      '#placeholder' => 'Årgang',
      '#default_value' => $course_default_value,
      '#ajax' => [
        'callback' => '::ajaxUpdate',
        'wrapper' => 'valuation-form-wrapper',
      ],
      '#wrapper_attributes' => ['class' => ['col-md-4']],
    ];

    // Reset form when course has been changed.
    if ($form_state->get('course') != $course_default_value) {
      $this->removeInputValue('period', $form_state);
    }
    $form_state->set('course', $course_default_value);

    $period_options = $available_period;

    if (!empty($course_default_value)) {
      $period_options = [];
      $course = Node::load($course_default_value);
      $periods = $course->field_vih_course_periods->referencedEntities();

      foreach ($periods as $period) {
        $period_options[$period->id()] = $period->getTitle();
      }
    }

    $periods_default_value = $form_state->getValue('period');
    if (count($period_options) > 1) {
      $period_options = ['' => 'Klassetrin'] + $period_options;
    }
    $form['filters']['period'] = [
      '#type' => 'select',
      '#options' => $period_options,
      '#placeholder' => 'Klassetrin',
      '#default_value' => $periods_default_value,
      '#ajax' => [
        'callback' => '::ajaxUpdate',
        'wrapper' => 'valuation-form-wrapper',
      ],
      '#wrapper_attributes' => ['class' => ['col-md-4']],
    ];

    $gender_default_value = $form_state->getValue('gender');
    $form['filters']['gender'] = [
      '#type' => 'select',
      '#options' => ['' => 'Køn'] + ApplicationHandler::$gender,
      '#placeholder' => 'Køn',
      '#default_value' => $gender_default_value,
      '#ajax' => [
        'callback' => '::ajaxUpdate',
        'wrapper' => 'valuation-form-wrapper',
      ],
      '#wrapper_attributes' => ['class' => ['col-md-4']],
    ];

    $headers = ['Navn'];
    $questions = $class->field_questions->referencedEntities();

    foreach ($questions as $question) {
      $headers[] = $question->getName();
    }
    $rows = [];

    foreach (Node::loadMultiple($applications) as $application) {
      if (!empty($course_default_value)
        && $course_default_value !=
        $application->field_vies_course->getValue()[0]['target_id']) {
        continue;
      }

      if (!empty($periods_default_value)
        && $periods_default_value != $application->field_vies_period->getValue()[0]['target_id']) {
        continue;
      }

      if (!empty($gender_default_value)
        && $gender_default_value != $application->field_vies_gender->getValue()[0]['value']) {
        continue;
      }

      $row = [];
      $row[] = new FormattableMarkup('@firstname @lastname', [
        '@firstname' => $application->field_vies_first_name->getValue()[0]['value'],
        '@lastname' => $application->field_vies_last_name->getValue()[0]['value'],
      ]);

      foreach ($application->field_vies_class_questions->referencedEntities() as $class_questions) {
        $question_reference = $class_questions->field_question_reference->getValue();
        if (empty($question_reference[0]['target_id'])) {
          continue;
        }
        $answers[$question_reference[0]['target_id']] = $class_questions->field_answer->getValue()[0]['value'];
      }

      foreach ($questions as $question) {
        $answer = '';
        if (isset($answers[$question->id()])) {
          $answer = $answers[$question->id()];
        }
        $row[] = $answer;
      }

      $row[] = \Drupal::l('Sæt labels og status', Url::fromRoute(
        'entity.node.edit_form',
        ['node' => $application->id()],
        ['query' => ['destination' => '/taxonomy/term/' . $class->id(). '/valuation']]
      ));

      $rows[] = $row;

    }

    $headers[] = 'Handlinger';

    $form['applications'] = [
      '#type' => 'table',
      '#attributes' => ['id' => 'studentsWrapper'],
      '#header' => $headers,
      '#rows' => $rows,
      '#empty' => 'Der er ingen ansøgning til denne klasse',
    ];
    return $form;
  }

  /**
   * Ajax callback.
   */
  public function ajaxUpdate(array $form, FormStateInterface $form_state) {
    return $form;
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
