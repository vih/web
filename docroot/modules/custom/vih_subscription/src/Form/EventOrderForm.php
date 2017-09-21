<?php
/**
 * @file
 * Contains \Drupal\vih_subscription\Form\EventOrderForm.
 */

namespace Drupal\vih_subscription\Form;

use Drupal\Core\Field\Plugin\Field\FieldFormatter;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;
use Drupal\node\NodeInterface;
use Drupal\paragraphs\Entity\Paragraph;


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
  public function buildForm(array $form, FormStateInterface $form_state, NodeInterface $event = NULL) {
    $this->event = $event;

    $form['#event'] = array(
      'title' => $event->getTitle()
    );

    $personsLimit = $event->field_vih_event_persons_limit->value;
    $personsSubscribed = $this->calculateSubscribedPeopleNumber($event);
    if ($personsLimit == 0) {//unlimited
      $personsLimit = PHP_INT_MAX;
    }

    $participantsCounter = $form_state->get('participantsCounter');
    if (empty($participantsCounter)) {
      $participantsCounter = $form_state->set('participantsCounter', 1);
    }

    $form['#tree'] = TRUE;

    $form['participants_container'] = [
      '#type' => 'container',
      '#prefix' => '<div id="participants-container-wrapper">',
      '#suffix' => '</div>',
    ];

    for ($i = 0; $i < $participantsCounter; $i++) {
      $personHumanCounter = $i+1;//starting from 1, not 0

      if ($personHumanCounter+$personsSubscribed <= $personsLimit) {//not allowing to have more fieldsets that the event have capacity for
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

    if ($personsSubscribed+$participantsCounter < $personsLimit) {//not allowing to have more fieldsets that the event have capacity for
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
    $subscribedPersons = array();
    foreach($form_state->getValue('participants_container') as $participant_fieldset) {
      $participant = $participant_fieldset['participant_fieldset'];
      if ($participant) {
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

    $this->eventOrder = Node::create(array(
      'type' => 'vih_event_order',
      'status' => 1,
      'title' => $this->event->getTitle() . ' - begivenhed tilmelding ' . \Drupal::service('date.formatter')
          ->format(time(), 'short'),
      'field_vih_eo_persons' => $subscribedPersons,
      'field_vih_eo_event' => $this->event->id()
    ));

    $this->eventOrder->save();

    $form_state->setRedirect('vih_subscription.subscription_redirect');
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
   * Calculates the number of people that have already subscribed to this events
   *
   * @param NodeInterface $event
   * @return int
   */
  private function calculateSubscribedPeopleNumber(NodeInterface $event) {
    $eventOrderNids = \Drupal::entityQuery('node')
      ->condition('type', 'vih_event_order')
      ->condition('status', '1')
      ->condition('field_vih_eo_event', $event->id())
      ->execute();

    $eventOrders = Node::loadMultiple($eventOrderNids);
    $subscribedPeopleNumber = 0;
    foreach($eventOrders as $eventOrder) {
      $subscribedPeopleNumber += count($eventOrder->get('field_vih_eo_persons')->getValue());
    }

    return $subscribedPeopleNumber;
  }
}