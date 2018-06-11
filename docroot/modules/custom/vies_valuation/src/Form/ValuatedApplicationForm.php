<?php

namespace Drupal\vies_valuation\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;
use Drupal\Component\Render\FormattableMarkup;
use Drupal\Core\Url;
use Drupal\taxonomy\Entity\Term;
use Drupal\taxonomy\TermInterface;

/**
 * Class ValuationForm.
 */
class ValuatedApplicationForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'valuated_application_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, TermInterface $class = NULL) {
    $form['#prefix'] = '<div id="valuated-application-form-wrapper">';
    $form['#suffix'] = '</div>';


    $query = \Drupal::entityQuery('node');
    $group = $query->orConditionGroup()
      ->exists('field_vies_label')
      ->exists('field_vies_status');
    $applications = $query->condition('type', 'vies_application_form')
      ->condition('field_vies_class', $class->id())
      ->condition($group)->execute();

    if (empty($applications)) {
      $form[] = [
        '#markup' => 'Der er ingen ansøgning at vise',
      ];
      return $form;
    }

    // Used to show checkboxes options.
    $available_labels = [];
    $available_statuses = [];

    // Used for filter applications.
    $availability_labels = [];
    $availability_statuses = [];
    foreach (Node::loadMultiple($applications) as $application) {
      $labels = $application->field_vies_label->getValue();
      foreach ($labels as $val) {
        $availability_labels[$val['target_id']][] = $application->id();
        if (isset($available_labels[$val['target_id']])) {
          continue;
        }
        $term = Term::load($val['target_id']);
        $available_labels[$term->id()] = $term->getName();

      }

      $statuses = $application->field_vies_status->getValue();
      foreach ($statuses as $val) {
        $availability_statuses[$val['target_id']][] = $application->id();
        if (isset($available_statuses[$val['target_id']])) {
          continue;
        }
        $term = Term::load($val['target_id']);
        $available_statuses[$term->id()] = $term->getName();
      }
    }

    $form['filters'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['row', 'container-inline']],
    ];

    $labels_default_value = $form_state->getValue('labels');
    if (count($available_labels) > 1) {
      $form['filters']['labels'] = [
        '#type' => 'checkboxes',
        '#title' => 'Labels',
        '#options' => $available_labels,
        '#default_value' => empty($labels_default_value) ? [] : $labels_default_value,
        '#ajax' => [
          'callback' => '::ajaxUpdate',
          'wrapper' => 'valuated-application-form-wrapper',
        ],
        '#prefix' => '<div class="col-md-4">',
        '#suffix' => '</div>',
      ];
    }

    $statuses_default_value = $form_state->getValue('statuses');
    if (count($available_statuses) > 1) {
      $form['filters']['statuses'] = [
        '#type' => 'checkboxes',
        '#title' => 'Statuses',
        '#options' => $available_statuses,
        '#default_value' => empty($statuses_default_value) ? [] : $statuses_default_value,
        '#ajax' => [
          'callback' => '::ajaxUpdate',
          'wrapper' => 'valuated-application-form-wrapper',
        ],
        '#prefix' => '<div class="col-md-4">',
        '#suffix' => '</div>',
      ];
    }

    $headers = ['Navn'];

    // Use first question as label.
    $questions = $class->field_questions->referencedEntities();
    $question = array_shift($questions);
    $headers[] = $question->getName();

    $headers[] = 'Labels';
    $headers[] = 'Status';
    $headers[] = 'Handlinger';

    $rows = [];

    foreach (Node::loadMultiple($applications) as $application) {
      $excluded = FALSE;
      if (!empty($labels_default_value)) {
        foreach ($labels_default_value as $label) {
          if ($label !== 0 && !in_array($application->id(), $availability_labels[$label])) {
            $excluded = TRUE;
          }
        }
      }

      if (!empty($statuses_default_value)) {
        foreach ($statuses_default_value as $status) {
          if ($status !== 0 && !in_array($application->id(), $availability_statuses[$status])) {
            $excluded = TRUE;
          }
        }
      }

      if ($excluded) {
        continue;
      }

      $row = [];
      $row[] = new FormattableMarkup('@firstname @lastname', [
        '@firstname' => $application->field_vies_first_name->getValue()[0]['value'],
        '@lastname' => $application->field_vies_last_name->getValue()[0]['value'],
      ]);

      $answer = '';
      foreach ($application->field_vies_class_questions->referencedEntities() as $class_questions) {
        $question_reference = $class_questions->field_question_reference->getValue();
        if (empty($question_reference[0]['target_id']) || $question_reference[0]['target_id'] != $question->id()) {
          continue;
        }
        $answer = $class_questions->field_answer->getValue()[0]['value'];
      }
      $row[] = $answer;

      $labels = [];
      foreach ($application->field_vies_label->getValue() as $val) {
        $labels[] = $available_labels[$val['target_id']];
      }
      $row[] = implode(', ', $labels);

      $statuses = [];
      foreach ($application->field_vies_status->getValue() as $val) {
        $statuses[] = $available_statuses[$val['target_id']];
      }
      $row[] = implode(', ', $statuses);
      $row[] = \Drupal::l($this->t('Edit'), Url::fromRoute(
        'entity.node.edit_form',
        ['node' => $application->id()],
        ['query' => ['destination' => '/taxonomy/term/' . $class->id(). '/valuation']]
      ));

      $rows[] = $row;

    }

    $form['applications'] = [
      '#type' => 'table',
      '#attributes' => ['class' => ['valuated-applications']],
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
  public function submitForm(array &$form, FormStateInterface $form_state) {
  }
}
