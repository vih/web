<?php
/**
 * @file
 * Contains \Drupal\vih_subscription\Form\LongCourseOrderForm.
 */

namespace Drupal\vih_subscription\Form;

use Drupal\Core\Field\Plugin\Field\FieldFormatter;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;
use Drupal\node\NodeInterface;
use Drupal\Core\Datetime\DateFormatter;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\paragraphs\Entity\Paragraph;


/**
 * Implements an example form.
 */
class LongCourseOrderForm extends FormBase {

  protected $course;
  protected $courseOrder;

  /**
   * Returns page title
   */
  public function getTitle() {
    return $this->t('Skræddersy dit ophold');
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'vih-subscription-long-course-order-form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, NodeInterface $course = NULL) {
    $this->course = $course;

    //$form['#attached']['library'][] = 'core/drupal.ajax';
    //$form['#attached']['library'][] = 'core/drupal.dialog';
    //$form['#attached']['library'][] = 'core/drupal.dialog.ajax';

    //composing available classes selection per CourseSlot for each CoursePeriod
    foreach ($course->field_vih_course_periods->referencedEntities() as $periodDelta => $coursePeriod) {
      //coursePeriods render helping array
      $form['#coursePeriods'][$periodDelta] = array(
        'title' => $coursePeriod->getTitle(),
        'courseSlots' => array(),
      );

      foreach ($coursePeriod->field_vih_cp_course_slots->referencedEntities() as $slotDelta => $courseSlot) {
        //saving component id for future references
        $availableClassesCid = "course-period-$periodDelta-courseSlot-$slotDelta-availableClasses";

        //courseSlot render helping array
        $form['#coursePeriods'][$periodDelta]['courseSlots'][$slotDelta] = array(
          'title' => $courseSlot->field_vih_cs_title->value,
          'availableClasses' => array(
            'cid' => $availableClassesCid
          )
        );

        //creating real input-ready fields
        $radiosOptions = array();
        $classesRadioSelections = array();
        foreach ($courseSlot->field_vih_cs_classes->referencedEntities() as $class) {
          $radiosOptions[$class->id()] = $this->t('Vælg');
          $classesRadioSelections[$class->id()] = taxonomy_term_view($class, 'radio_selection');
        }

        $form[$availableClassesCid] = array(
          '#type' => 'radios',
          //'#title' => $this->t('Poll status'),
          //'#default_value' => 1,
          '#options' => $radiosOptions,
          '#theme' => 'vih_subscription_class_selection_radios',
          '#classes' => array(
            'radio_selection' => $classesRadioSelections
          )
        );
      }
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
    $form['personalDataLeft']['cpr'] = array(
      '#type' => 'textfield',
      '#placeholder' => $this->t('CPR'),
    );
    $form['personalDataLeft']['telefon'] = array(
      '#type' => 'textfield',
      '#placeholder' => $this->t('Telefon'),
    );
    $form['personalDataLeft']['email'] = array(
      '#type' => 'email',
      '#placeholder' => $this->t('E-mail'),
    );
    $form['personalDataLeft']['nationality'] = array(
      '#type' => 'select',
      '#title' => $this->t('Nationalitet'),
      '#options' => CourseOrderOptionsList::getNationalityList(),
    );

    $form['personalDataLeft']['newsletter'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Tilmeld dig nyhedsbreve'),
    );

    //Personal data - right side
    $form['personalDataRight'] = array(
      '#type' => 'container',
    );
    $form['personalDataRight']['address'] = array(
      '#type' => 'textfield',
      '#placeholder' => $this->t('Adresse'),
    );
    $form['personalDataRight']['house']['houseNumber'] = array(
      '#type' => 'textfield',
      '#placeholder' => $this->t('Hus nr'),
    );
    $form['personalDataRight']['house']['houseLetter'] = array(
      '#type' => 'textfield',
      '#placeholder' => $this->t('Bogstav'),
    );
    $form['personalDataRight']['house']['houseFloor'] = array(
      '#type' => 'textfield',
      '#placeholder' => $this->t('Etage'),
    );
    $form['personalDataRight']['city'] = array(
      '#type' => 'textfield',
      '#placeholder' => $this->t('By'),
    );
    $form['personalDataRight']['zip'] = array(
      '#type' => 'textfield',
      '#placeholder' => $this->t('Postnummer'),
    );
    $form['personalDataRight']['education'] = array(
      '#type' => 'select',
      '#title' => $this->t('Uddanelse'),
      '#options' => CourseOrderOptionsList::getEducationList()
    );
    $form['personalDataRight']['payment'] = array(
      '#type' => 'select',
      '#title' => $this->t('Betaling'),
      '#options' => CourseOrderOptionsList::getPaymentList(),
    );
    $form['personalDataRight']['foundFrom'] = array(
      '#type' => 'select',
      '#title' => $this->t('Hvor kender du os fra?'),
      '#options' => CourseOrderOptionsList::getFoundFromList(),
    );

    $form['message'] = array(
      '#type' => 'textarea',
      '#placeholder' => $this->t('Skriv os en besked...'),
    );

    $form['actions']['submit'] = array(
      '#type' => 'submit',
      '#value' => $this->t('Indsend oplynsinger'),
    );

    $form['#theme'] = 'vih_subscription_long_course_order_form';

    return $form;
  }

  /**grunt
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $orderedCoursePeriods = array();

    //going through the selected classes
    foreach ($form_state->getValues() as $radioKey => $radioValue) {
      if (preg_match('/^course-period-(\d)-courseSlot-(\d)-availableClasses$/', $radioKey, $matches)) {
        $coursePeriodDelta = $matches[1];
        $coursePeriods = $this->course->field_vih_course_periods->referencedEntities();
        $coursePeriod = $coursePeriods[$coursePeriodDelta];

        $courseSlotDelta = $matches[2];
        $courseSlots = $coursePeriod->field_vih_cp_course_slots->referencedEntities();
        $courseSlot = $courseSlots[$courseSlotDelta];

        $orderedCourseSlot = Paragraph::create([
          'type' => 'vih_ordered_course_slot',
          'field_vih_ocs_title' => $courseSlot->field_vih_cs_title->value,
          'field_vih_ocs_class' => $radioValue,
        ]);
        $orderedCourseSlot->isNew();
        $orderedCourseSlot->save();

        $orderedCoursePeriod = null;
        if ($orderedCoursePeriod = $orderedCoursePeriods[$coursePeriod->id()]) {
          $existingOrderedCourseSlots = $orderedCoursePeriod->get('field_vih_ocp_order_course_slots')->getValue();

          $existingOrderedCourseSlots[] = array(
            'target_id' => $orderedCourseSlot->id(),
            'target_revision_id' => $orderedCourseSlot->getRevisionId()
          );

          $orderedCoursePeriod->set('field_vih_ocp_order_course_slots', $existingOrderedCourseSlots);
          $orderedCoursePeriod->save();
          $orderedCoursePeriods[$coursePeriod->id()] = $orderedCoursePeriod;
        } else {
          $orderedCoursePeriod = Paragraph::create([
            'type' => 'vih_ordered_course_period',
            'field_vih_ocp_course_period' => $coursePeriod->id(),
            'field_vih_ocp_order_course_slots' => array(
              'target_id' => $orderedCourseSlot->id(),
              'target_revision_id' => $orderedCourseSlot->getRevisionId()
            ),
          ]);
          $orderedCoursePeriod->isNew();
          $orderedCoursePeriod->save();
          $orderedCoursePeriods[$coursePeriod->id()] = $orderedCoursePeriod;
        }
      }
    }


    $this->courseOrder = Node::create(array(
      'type' => 'vih_long_course_order',
      'status' => 1,
      'title' => $this->course->getTitle() . ' - kursus tilmelding ' . \Drupal::service('date.formatter')->format(time(), 'short'),
      'field_vih_lco_first_name' => $form_state->getValue('firstName'),
      'field_vih_lco_last_name' => $form_state->getValue('lastName'),
      'field_vih_lco_cpr' => $form_state->getValue('cpr'),
      'field_vih_lco_telefon' => $form_state->getValue('telefon'),
      'field_vih_lco_email' => $form_state->getValue('email'),
      'field_vih_lco_nationality' => CourseOrderOptionsList::getNationalityList($form_state->getValue('nationality')),
      'field_vih_lco_newsletter' => $form_state->getValue('newsletter'),
      'field_vih_lco_address' => implode(' ', array(
        $form_state->getValue('address'),
        $form_state->getValue('houseNumber'),
        $form_state->getValue('houseLetter'),
        $form_state->getValue('houseFloor')
      )),
      'field_vih_lco_city' => $form_state->getValue('city'),
      'field_vih_lco_zip' => $form_state->getValue('zip'),
      'field_vih_lco_education' => CourseOrderOptionsList::getEducationList($form_state->getValue('education')),
      'field_vih_lco_payment' => CourseOrderOptionsList::getPaymentList($form_state->getValue('payment')),
      'field_vih_lco_found_from' => CourseOrderOptionsList::getFoundFromList($form_state->getValue('foundFrom')),
      'field_vih_lco_message' => $form_state->getValue('message'),
      'field_vih_lco_course' => $this->course->id(),
      'field_vih_lco_order_course_perio' => array_values($orderedCoursePeriods)//resetting the keys
    ));
    $this->courseOrder->save();

    $form_state->setRedirect('vih_subscription.subscription_redirect');
  }
}