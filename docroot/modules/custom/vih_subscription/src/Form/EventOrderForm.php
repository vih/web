<?php
/**
 * @file
 * Contains \Drupal\vih_subscription\Form\EventOrderForm.
 */

namespace Drupal\vih_subscription\Form;

use Drupal\bellcom_quickpay_integration\Misc\BellcomQuickpayClient;
use Drupal\Component\Utility\Crypt;
use Drupal\Core\Field\Plugin\Field\FieldFormatter;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Url;
use Drupal\node\Entity\Node;
use Drupal\node\NodeInterface;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\vih_subscription\Misc\VihSubscriptionUtils;

/**
 * Implements an example form.
 */
class EventOrderForm extends FormBase {

  protected $event;
  protected $eventOrder;

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
    return 'vih-subscription-event-order-form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, NodeInterface $event = NULL, NodeInterface $order = NULL, $checksum = NULL) {
    $this->event = $event;

    if ($order != NULL) {
      if (Crypt::hashEquals($checksum, VihSubscriptionUtils::generateChecksum($event, $order))) {
        $this->eventOrder = $order;
      }
    }

    $form['#event'] = array(
      'title' => $event->getTitle()
    );

    $personsLimit = $event->field_vih_event_persons_limit->value;
    $personsSubscribed = VihSubscriptionUtils::calculateSubscribedPeopleNumber($event);
    if ($personsLimit == 0) { //unlimited
      $personsLimit = PHP_INT_MAX;
    }

    $participantsCounter = $form_state->get('participantsCounter');
    if (empty($participantsCounter)) {
      if ($this->eventOrder != NULL) {
        $participantsCounter = count($this->eventOrder->get('field_vih_eo_persons')->getValue());
      } else {
        $participantsCounter = 1;
      }

      $form_state->set('participantsCounter', $participantsCounter);
    }

    $form['#tree'] = TRUE;

    $form['participants_container'] = [
      '#type' => 'container',
      '#prefix' => '<div id="participants-container-wrapper">',
      '#suffix' => '</div>',
    ];

    for ($i = 0; $i < $participantsCounter; $i++) {
      $personHumanCounter = $i + 1; //starting from 1, not 0

      if ($personHumanCounter + $personsSubscribed <= $personsLimit) { //not allowing to have more fieldsets that the event have capacity for
        $form['participants_container'][$i]['participant_fieldset'] = [
          '#type' => 'fieldset',
          '#title' => $this->t('Person') . ' ' . $personHumanCounter
        ];
        $form['participants_container'][$i]['participant_fieldset']['firstName'] = array(
          '#type' => 'textfield',
          '#placeholder' => $this->t('Fornavn'),
          '#required' => TRUE,
        );
        $form['participants_container'][$i]['participant_fieldset']['lastName'] = array(
          '#type' => 'textfield',
          '#placeholder' => $this->t('Efternavn'),
          '#required' => TRUE,
        );
        $form['participants_container'][$i]['participant_fieldset']['email'] = array(
          '#type' => 'textfield',
          '#placeholder' => $this->t('Email'),
          '#required' => TRUE,
        );
      }
    }

    if ($personsSubscribed + $participantsCounter < $personsLimit) { //not allowing to have more fieldsets that the event have capacity for
      $form['participants_container']['actions']['add_participant'] = [
        '#type' => 'submit',
        '#value' => t('Tilføj flere'),
        '#submit' => array('::addOne'),
        '#ajax' => [
          'callback' => '::addmoreCallback',
          'wrapper' => 'participants-container-wrapper',
        ],
        '#limit_validation_errors' => array()
      ];
    }
    if ($participantsCounter > 1) {
      $form['participants_container']['actions']['remove_participant'] = [
        '#type' => 'submit',
        '#value' => t('Fjern den sidste'),
        '#submit' => array('::removeCallback'),
        '#ajax' => [
          'callback' => '::addmoreCallback',
          'wrapper' => 'participants-container-wrapper',
        ],
        '#limit_validation_errors' => array()
      ];
    }

    if ($personsLimit > $personsSubscribed) {
      $form['actions'] = [
        '#type' => 'actions',
      ];
      $form['actions']['submit'] = array(
        '#type' => 'submit',
        '#value' => $this->t('Indsend oplynsinger'),
      );
    } else {
      $form['message'] = array(
        '#markup' => $this->t('Denne begivenhed kan ikke allokere flere deltagere')
      );
    }

    //preloading data
    if ($this->eventOrder != NULL) {
      $this->populateData($this->eventOrder, $form);
    }

    $form['#theme'] = 'vih_subscription_event_order_form';
    $form_state->setCached(FALSE);

    return $form;
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
    $firstParticipantName = '';
    $subscribedPersons = array();
    foreach ($form_state->getValue('participants_container') as $participant_fieldset) {
      $participant = $participant_fieldset['participant_fieldset'];
      if ($participant) {
        if (empty($firstParticipantName)) {
          $firstParticipantName = $participant['firstName'] . ' ' . $participant['lastName'];
        }

        $subscribedPerson = Paragraph::create([
          'type' => 'vih_ordered_event_person',
          'field_vih_oe_first_name' => $participant['firstName'],
          'field_vih_oe_last_name' => $participant['lastName'],
          'field_vih_oe_email' => $participant['email'],
        ]);
        $subscribedPerson->save();

        $subscribedPersons[] = $subscribedPerson;
      }
    }

    //calculating the price
    $basePrice = $this->event->field_event_price->value;
    $orderPrice = $basePrice * count($subscribedPersons);

    //checking if we need to create a new order or edit the existing
    if ($this->eventOrder == NULL) {
      $this->eventOrder = Node::create(array(
        'type' => 'vih_event_order',
        'status' => 0,
        'title' => $this->event->getTitle() . ' - begivenhed tilmelding - ' . $firstParticipantName . ' - '
          . \Drupal::service('date.formatter')->format(time(), 'short'),
        'field_vih_eo_persons' => $subscribedPersons,
        'field_vih_eo_event' => $this->event->id(),
        'field_vih_eo_status' => 'pending',
        'field_vih_eo_price' => $orderPrice,
      ));
    } else {
      //removing old participants paragraphs, and replacing with new ones
      $subscribedPersonsIds = $this->eventOrder->get('field_vih_eo_persons')->getValue();
      foreach ($subscribedPersonsIds as $subscribedPersonId) {
        $subscribedPerson = Paragraph::load($subscribedPersonId['target_id']);
        if ($subscribedPerson) {
         $subscribedPerson->delete();
        }
      }
      //adding new participants
      $this->eventOrder->set('field_vih_eo_persons', $subscribedPersons);

      $this->eventOrder->set('field_vih_eo_price', $orderPrice);
    }

    //saving the order (works for both new/edited)
    $this->eventOrder->save();

    //redirecting to confirmation page
    $form_state->setRedirect('vih_subscription.subscription_confirmation_redirect', [
      'subject' => $this->event->id(),
      'order' => $this->eventOrder->id(),
      'checksum' => VihSubscriptionUtils::generateChecksum($this->event, $this->eventOrder)
    ]);
  }

  /**
   * Callback function to add more participants fieldset
   *
   * @param array $form
   * @param FormStateInterface $form_state
   */
  public function addOne(array &$form, FormStateInterface $form_state) {
    $participantsCounter = $form_state->get('participantsCounter');
    $participantsCounter = $participantsCounter + 1;
    $form_state->set('participantsCounter', $participantsCounter);
    $form_state->setRebuild();
  }

  /**
   * Ajax callback the returns the participants_container container
   *
   * @param array $form
   * @param FormStateInterface $form_state
   * @return mixed
   */
  public function addmoreCallback(array &$form, FormStateInterface $form_state) {
    return $form['participants_container'];
  }

  /**
   * Callback function to remove the last added participants fieldset
   *
   * @param array $form
   * @param FormStateInterface $form_state
   */
  public function removeCallback(array &$form, FormStateInterface $form_state) {
    $participantsCounter = $form_state->get('participantsCounter');
    if ($participantsCounter > 1) {
      $participantsCounter = $participantsCounter - 1;
      $form_state->set('participantsCounter', $participantsCounter);
    }
    $form_state->setRebuild();
  }

  /**
   * Populate the data into the form the existing eventOrder
   *
   * @param NodeInterface $eventOrder
   * @param $form
   */
  private function populateData(NodeInterface $eventOrder, &$form) {
    $subscribedPersonsIds = $eventOrder->get('field_vih_eo_persons')->getValue();
    foreach ($subscribedPersonsIds as $index => $subscribedPersonId) {
      $subscribedPerson = Paragraph::load($subscribedPersonId['target_id']);

      $form['participants_container'][$index]['participant_fieldset']['firstName']['#default_value'] = $subscribedPerson->field_vih_oe_first_name->value;
      $form['participants_container'][$index]['participant_fieldset']['lastName']['#default_value'] = $subscribedPerson->field_vih_oe_last_name->value;
      $form['participants_container'][$index]['participant_fieldset']['email']['#default_value'] = $subscribedPerson->field_vih_oe_email->value;
    }
  }
}