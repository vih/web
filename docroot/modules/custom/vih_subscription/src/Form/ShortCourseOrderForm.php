<?php
/**
 * @file
 * Contains \Drupal\vih_subscription\Form\ShortCourseOrderForm.
 */

namespace Drupal\vih_subscription\Form;

use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\ReplaceCommand;
use Drupal\Core\Field\Plugin\Field\FieldFormatter;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;
use Drupal\node\NodeInterface;
use Drupal\paragraphs\Entity\Paragraph;


/**
 * Implements an example form.
 */
class ShortCourseOrderForm extends FormBase {

  protected $course;
  protected $courseOrder;
  protected $price;

  /**
   * Returns page title
   */
  public function getTitle() {
    return $this->t('Tilmelding');
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'vih-subscription-short-course-order-form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, NodeInterface $course = NULL) {
    $this->course = $course;
    $this->price = $course->field_vih_sc_price->value;

//    $form['#attached']['library'][] = 'core/drupal.ajax';
//    $form['#attached']['library'][] = 'core/drupal.dialog';
//    $form['#attached']['library'][] = 'core/drupal.dialog.ajax';

    $form['price'] = array(
      '#markup' => '<span id="course-price">' . $this->price . '</span>',
    );

    $form['#course'] = array(
      'title' => $course->getTitle()
    );

    foreach ($course->field_vih_sc_option_groups->referencedEntities() as $optionGroupsDelta => $optionGroups) {
      $options = array();
      $suboptions = array();

      $optionGroupCid = "option-group-$optionGroupsDelta-options";
      foreach ($optionGroups->field_vih_og_options->referencedEntities() as $optionDelta => $option) {
        $options[$optionDelta] = $option->field_vih_option_title->value;

        if (!$option->field_vih_option_suboptions->isEmpty()) {
          $suboption_values = array();
          foreach ($option->field_vih_option_suboptions as $suboption) {
            $suboption_values[] = $suboption->value;
          }

          $suboptions[$optionDelta] = array(
            'values' => $suboption_values,
            'condition' => array(
              'visible' => [
                [':input[name="' . $optionGroupCid . '"]' => ['value' => $optionDelta]],
              ]
            ),
            'title' => $option->field_vih_option_title->value,
            'cid' => "option-group-$optionGroupsDelta-option-$optionDelta-suboptions"
          );
        }
      }

      $form[$optionGroupCid] = array(
        '#type' => 'radios',
        '#title' => $optionGroups->field_vih_og_title->value,
        '#options' => $options,
        '#ajax' => [
          'callback' => '::ajaxUpdatePrice',
          'event' => 'change',
          'progress' => array(
            'type' => 'none'
          )
        ],
      );

      if ($suboptions) {
        foreach ($suboptions as $suboptions_set) {
          $form[$suboptions_set['cid']] = array(
            '#type' => 'radios',
            '#title' => $suboptions_set['title'],
            '#options' => $suboptions_set['values'],
            '#states' => $suboptions_set['condition']
          );
        }
      }

      //optionGroups render helping array
      $form['#optionGroups'][$optionGroupsDelta] = array(
        'title' => $optionGroups->field_vih_og_title->value,
        'options' => array(
          'cid' => $optionGroupCid
        ),
        'suboptions' => $suboptions
      );
    }

    //Personal data - left side
    $form['personalDataLeft'] = array(
      '#type' => 'container',
    );
    $form['personalDataLeft']['firstName'] = array(
      '#type' => 'textfield',
      '#placeholder' => $this->t('Fornavn'),
    );
    $form['personalDataLeft']['lastName'] = array(
      '#type' => 'textfield',
      '#placeholder' => $this->t('Efternavn'),
    );
    $form['personalDataLeft']['sambo'] = array(
      '#type' => 'textfield',
      '#placeholder' => $this->t('Sambo'),
    );

    $form['actions']['submit'] = array(
      '#type' => 'submit',
      '#value' => $this->t('Indsend oplynsinger'),
    );

    $form['#theme'] = 'vih_subscription_short_course_order_form';

    return $form;
  }

  /**
   * Updated the price value
   *
   * @param array $form
   *   Render array representing from.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   Current form state.
   *
   * @return \Drupal\Core\Ajax\AjaxResponse
   *   Array of ajax commands to execute on submit of the modal form.
   */
  public function ajaxUpdatePrice(array &$form, FormStateInterface $form_state) {
    $response = new AjaxResponse();
    $response->addCommand(new ReplaceCommand('#course-price', '<span id="course-price">' . number_format($this->calculatePrice($form_state),2) . '</span>'));
    return $response;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $orderedOptionTargets = array();

    //going through the selected options
    foreach ($form_state->getValues() as $radioKey => $radioValue) {
      //option found
      if (preg_match('/^option\-group\-(\d)\-options$/', $radioKey, $matches)) {
        $optionGroupDelta = $matches[1];

        $optionGroups = $this->course->field_vih_sc_option_groups->referencedEntities();
        $optionGroup = $optionGroups[$optionGroupDelta];

        $options = $optionGroup->field_vih_og_options->referencedEntities();
        $option = $options[$radioValue];

        //Do we have a suboption?
        $suboptionDelta = $form_state->getValue("option-group-$optionGroupDelta-option-$radioValue-suboptions");
        if (is_numeric($suboptionDelta)) {
          $suboption = NULL;
          if (!empty($option->field_vih_option_suboptions[$suboptionDelta])) {
            $suboption = $option->field_vih_option_suboptions[$suboptionDelta]->value;
          }
        }

        $orderedOption = Paragraph::create([
          'type' => 'vih_ordered_option',
          'field_vih_oo_group_name' => $optionGroup->field_vih_og_title->value,
          'field_vih_oo_option_name' => $option->field_vih_option_title->value,
          'field_vih_oo_price_addition' => $option->field_vih_option_price_addition->value,
          'field_vih_oo_suboption' => $suboption
        ]);
        $orderedOption->isNew();
        $orderedOption->save();

        $orderedOptionTargets[] = array(
          'target_id' => $orderedOption->id(),
          'target_revision_id' => $orderedOption->getRevisionId(),
        );
      }
    }

    $this->courseOrder = Node::create(array(
      'type' => 'vih_short_course_order',
      'status' => 1,
      'title' => $this->course->getTitle() . ' - kursus tilmelding ' . \Drupal::service('date.formatter')
          ->format(time(), 'short'),
      'field_vih_sco_first_name' => $form_state->getValue('firstName'),
      'field_vih_sco_last_name' => $form_state->getValue('lastName'),
      'field_vih_sco_sambo' => $form_state->getValue('sambo'),
      'field_vih_sco_ordered_options' => $orderedOptionTargets,
      'field_vih_sco_course' => $this->course->id()
    ));

    $this->courseOrder->save();

    $form_state->setRedirect('vih_subscription.subscription_redirect');
  }

  /**
   * Traverses through the selected options and calculates the total price for the course.
   *
   * @param FormStateInterface $form_state
   * @return mixed
   */
  private function calculatePrice(FormStateInterface $form_state) {
    $base_price = $this->course->field_vih_sc_price->value;

    //calculate options price
    foreach ($form_state->getValues() as $radioKey => $radioValue) {
      //option found
      if (preg_match('/^option\-group\-(\d)\-options$/', $radioKey, $matches)) {
        $optionGroupDelta = $matches[1];

        $optionGroups = $this->course->field_vih_sc_option_groups->referencedEntities();
        $optionGroup = $optionGroups[$optionGroupDelta];

        $options = $optionGroup->field_vih_og_options->referencedEntities();
        $option = $options[$radioValue];

        $base_price += $option->field_vih_option_price_addition->value;
      }
    }

    $this->price = $base_price;
    return $this->price;
  }
}