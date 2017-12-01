<?php
/**
 * @file
 * Contains \Drupal\vih_subscription\Form\ShortCourseOrderForm.
 */

namespace Drupal\vih_subscription\Form;

use Drupal\bellcom_quickpay_integration\Misc\BellcomQuickpayClient;
use Drupal\Component\Utility\Crypt;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\HtmlCommand;
use Drupal\Core\Ajax\ReplaceCommand;
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
  public function buildForm(array $form, FormStateInterface $form_state, NodeInterface $course = NULL, NodeInterface $order = NULL, $checksum = NULL) {
    //START VARIABLES INIT //
    $this->course = $course;
    $this->price = $course->field_vih_sc_price->value;

    $optionGroups = array();
    $optionGroupOptions = array();
    $optionGroupOptionsWithPrice = array();
    $optionGroupSuboptions = array();

    foreach ($course->field_vih_sc_option_groups->referencedEntities() as $optionGroupDelta => $optionGroup) {
      $optionGroups[$optionGroupDelta] = $optionGroup->field_vih_og_title->value;

      foreach ($optionGroup->field_vih_og_options->referencedEntities() as $optionDelta => $option) {
        $optionGroupOptions[$optionGroupDelta][$optionDelta] = $option->field_vih_option_title->value;
        $optionGroupOptionsWithPrice[$optionGroupDelta][$optionDelta] = $option->field_vih_option_title->value;

        $additionalPrice = $option->field_vih_option_price_addition->value;
        if (isset($additionalPrice) && floatval($additionalPrice) !== 0.00) {
          $optionGroupOptionsWithPrice[$optionGroupDelta][$optionDelta] .= " (+ kr. $additionalPrice)";
        }

        foreach ($option->field_vih_option_suboptions as $suboptionDelta => $suboption) {
          $optionGroupSuboptions[$optionGroupDelta][$optionDelta][$suboptionDelta] = $suboption->value;
        }

      }
    }
    $form_state->set('optionGroups', $optionGroups);
    $form_state->set('optionGroupOptions', $optionGroupOptions);
    $form_state->set('optionGroupSuboptions', $optionGroupSuboptions);

    $addedParticipants = $form_state->get('addedParticipants');

    if ($order != NULL) {
      if (Crypt::hashEquals($checksum, VihSubscriptionUtils::generateChecksum($course, $order))) {
        $this->courseOrder = $order;
        $this->price = $this->courseOrder->field_vih_sco_price->value;

        if (!isset($addedParticipants)) {
          //preloading data
          $this->populateData($this->courseOrder, $form, $form_state);
          $addedParticipants = $form_state->get('addedParticipants');
        }
      }
    }
    //END VARIABLES INIT //

    //START GENERAL DATA //
    $form['price'] = array(
      '#markup' => 'DKK ' . number_format($this->price, 0, ',', '.'),
    );

    $form['status_messages'] = [
      '#type' => 'status_messages',
      '#weight' => -10,
      '#prefix' => '<div id="messages">',
      '#suffix' => '</div>'
    ];

    $form['#course'] = array(
      'title' => $course->getTitle(),
      'url' => $course->toUrl()
    );
    //END GENERAL DATA //

    //START ADD NEW PARTICIPANT CONTAINER//
    $form['newParticipantContainer'] = [
      '#type' => 'container',
      '#prefix' => '<div id="new-participant-container-wrapper">',
      '#suffix' => '</div>',
      '#tree' => TRUE
    ];

    //checking the limits
    $personsLimit = $course->field_vih_sc_persons_limit->value;
    $personsSubscribed = VihSubscriptionUtils::calculateSubscribedPeopleNumber($course);

    if ($personsLimit == 0) { //unlimited
      $personsLimit = PHP_INT_MAX;
    }

    if (count($addedParticipants) + $personsSubscribed < $personsLimit) { //not allowing to have more fieldsets that the event have capacity for
      $form['newParticipantContainer']['newParticipantFieldset'] = [
        '#type' => 'fieldset',
        '#title' => $this->t('Person')
      ];
      $form['newParticipantContainer']['newParticipantFieldset']['firstName'] = array(
        '#type' => 'textfield',
        '#placeholder' => $this->t('Fornavn'),
        '#required' => TRUE,
      );
      $form['newParticipantContainer']['newParticipantFieldset']['lastName'] = array(
        '#type' => 'textfield',
        '#placeholder' => $this->t('Efternavn'),
        '#required' => TRUE,
      );
      $form['newParticipantContainer']['newParticipantFieldset']['email'] = array(
        '#type' => 'textfield',
        '#placeholder' => $this->t('Email'),
        '#required' => TRUE,
      );

      //START AVAILABLE OPTIONS CONTAINER //
      $form['availableOptionsContainer'] = array(
        '#type' => 'container',
        '#prefix' => '<div id="available-options-container-wrapper" class="form-group">',
        '#suffix' => '</div>',
        '#tree' => TRUE
      );

      foreach ($optionGroups as $optionGroupDelta => $optionGroupName) {
        $form['availableOptionsContainer']['optionGroups'][$optionGroupDelta]['option'] = array(
          '#title' => $optionGroupName,
          '#type' => 'radios',
          '#options' => $optionGroupOptionsWithPrice[$optionGroupDelta],
          '#empty_value' => -1,
          '#required' => TRUE
        );

        //adding suboptions, if any
        foreach ($optionGroupOptions[$optionGroupDelta] as $optionDelta => $optionName) {
          if (isset($optionGroupSuboptions[$optionGroupDelta][$optionDelta])) {
            $form['availableOptionsContainer']['optionGroups'][$optionGroupDelta]['options'][$optionDelta]['suboptions-container'] = array(
              '#type' => 'container',
              '#states' => array(
                'visible' => array(
                  ':input[name="availableOptionsContainer[optionGroups][' . $optionGroupDelta . '][option]"]' => array('value' => $optionDelta),
                ),
              ),
              '#attributes' => array('class' => array('vih-suboptions-container')),
            );

            $form['availableOptionsContainer']['optionGroups'][$optionGroupDelta]['options'][$optionDelta]['suboptions-container']['suboption'] = array(
              '#type' => 'radios',
              '#options' => $optionGroupSuboptions[$optionGroupDelta][$optionDelta],
              '#empty_value' => -1,
              '#default_value' => 0
            );
          }
        }
      }

      $form['availableOptionsContainer']['addParticipantOptions'] = array(
        '#id' => 'add-participant-options',
        '#name' => 'add-participant-options',
        '#type' => 'submit',
        '#value' => $this->t('Add participant and options'),
        '#submit' => array('::addParticipantOptions'),
        '#ajax' => [
          'callback' => '::ajaxAddRemoveParticipantOptionsCallback',
          'progress' => array(
            'type' => 'none'
          )
        ],
      );
    } else {
      $form['availableOptionsContainer'] = array(
        '#type' => 'container',
        '#prefix' => '<div id="available-options-container-wrapper" class="form-group">',
        '#suffix' => '</div>',
        '#tree' => TRUE
      );

      $form['newParticipantContainer']['message'] = array(
        '#markup' => $this->t('Denne begivenhed kan ikke allokere flere deltagere')
      );
    }
    //END AVAILABLE OPTIONS CONTAINER //
    //END ADD NEW PARTICIPANT CONTAINER //

    // START added participants container //
    $form['addedParticipantsContainer'] = array(
      '#type' => 'container',
      '#prefix' => '<div id="added-participants-container-wrapper" class="form-group">',
      '#suffix' => '</div>',
      '#theme' => 'vih_subscription_added_participant',
      '#addedParticipants' => $addedParticipants
    );

    //adding edit/remove buttons
    if ($addedParticipants && is_array($addedParticipants)) {
      foreach ($addedParticipants as $addedParticipantDelta => $addedParticipant) {
        $form['addedParticipantsContainer']['controlButtons']['editButton-' . $addedParticipantDelta] = [
          '#id' => 'edit-participant-options-' . $addedParticipantDelta,
          '#name' => 'edit-participant-options-' . $addedParticipantDelta,
          '#type' => 'submit',
          '#value' => $this->t('Edit participant'),
          '#submit' => array('::editParticipantOptions'),
          '#ajax' => [
            'callback' => '::ajaxAddRemoveParticipantOptionsCallback',
            'progress' => array(
              'type' => 'none'
            )
          ],
          '#participantOptionsDelta' => $addedParticipantDelta,
          '#limit_validation_errors' => array()
        ];

        $form['addedParticipantsContainer']['controlButtons']['removeButton-' . $addedParticipantDelta] = [
          '#id' => 'remove-participant-options-' . $addedParticipantDelta,
          '#name' => 'remove-participant-options-' . $addedParticipantDelta,
          '#type' => 'submit',
          '#value' => $this->t('Remove participant'),
          '#submit' => array('::removeParticipantOptions'),
          '#ajax' => [
            'callback' => '::ajaxAddRemoveParticipantOptionsCallback',
            'progress' => array(
              'type' => 'none'
            )
          ],
          '#participantOptionsDelta' => $addedParticipantDelta,
          '#limit_validation_errors' => array()
        ];
      }
    }
    // END added participants container

    //START FORM CONTROLS //
//    if ($personsLimit > $personsSubscribed) {
    $form['actions'] = [
      '#type' => 'actions',
    ];
    $form['actions']['submit'] = array(
      '#type' => 'submit',
      '#id' => 'vih-course-submit',
      '#value' => $this->t('Indsend oplynsinger'),
      '#limit_validation_errors' => array(
        ['newParticipantContainer', 'newParticipantFieldset', 'firstName'],
        ['newParticipantContainer', 'newParticipantFieldset', 'lastName'],
        ['newParticipantContainer', 'newParticipantFieldset', 'email'],
      ),
      '#submit' => array('::submitForm')
    );
    //} else {
//      $form['message'] = array(
//        '#markup' => $this->t('Denne begivenhed kan ikke allokere flere deltagere')
//      );
//    }
    //END FORM CONTROLS //

    $form['#theme'] = 'vih_subscription_short_course_order_form';
    $form_state->setCached(FALSE);
    return $form;
  }

  /**
   * Callback function that adds participant and the selected options to the participants list.
   *
   * @param array $form
   * @param FormStateInterface $form_state
   */
  public function addParticipantOptions(array &$form, FormStateInterface $form_state) {
    $userInput = $form_state->getUserInput();

    if ($form_state->hasAnyErrors()) {
      $response = new AjaxResponse();
      $response->addCommand(new ReplaceCommand('#status_messages', $form['status_messages']));
      return $response;
    }

    //variables to get option names from
    $optionGroups = $form_state->get('optionGroups');
    $optionGroupOptions = $form_state->get('optionGroupOptions');
    $optionGroupSuboptions = $form_state->get('optionGroupSuboptions');

    //existing list of added participants
    $addedParticipants = $form_state->get('addedParticipants');

    //filling personal information
    $participant = array();
    $participant['firstName'] = $userInput['newParticipantContainer']['newParticipantFieldset']['firstName'];
    $participant['lastName'] = $userInput['newParticipantContainer']['newParticipantFieldset']['lastName'];
    $participant['email'] = $userInput['newParticipantContainer']['newParticipantFieldset']['email'];

    //filling ordered options
    $participant['orderedOptions'] = array();
    foreach ($userInput['availableOptionsContainer']['optionGroups'] as $optionGroupDelta => $optionGroupSelection) {
      $optionDelta = $optionGroupSelection['option'];
      $optionName = NULL;
      $subOptionDelta = NULL;
      $subOptionName = NULL;
      $subOptionDelta = NULL;

      if (isset($optionDelta)) {
        $optionName = $optionGroupOptions[$optionGroupDelta][$optionDelta];
        if (isset($optionGroupSelection['options'][$optionDelta])) {
          $subOptionDelta = $optionGroupSelection['options'][$optionDelta]['suboptions-container']['suboption'];
          if (isset($subOptionDelta)) {
            $subOptionName = $optionGroupSuboptions[$optionGroupDelta][$optionDelta][$subOptionDelta];
          }
        }
      }

      $participant['orderedOptions'][$optionGroupDelta] = array(
        'optionGroup' => [
          'delta' => $optionGroupDelta,
          'name' => $optionGroups[$optionGroupDelta]
        ],
        'option' => [
          'delta' => $optionDelta,
          'name' => $optionName
        ],
        'suboption' => [
          'delta' => $subOptionDelta,
          'name' => $subOptionName
        ]
      );
    }
    $addedParticipants[] = $participant;

    $form_state->set('addedParticipants', $addedParticipants);

    // Clearing form
    $clean_keys = $form_state->getCleanValueKeys();
    $clean_keys[] = 'ajax_page_state';
    foreach ($userInput as $key => $item) {
      if (!in_array($key, $clean_keys) && substr($key, 0, 1) !== '_') {
        unset($userInput[$key]);
      }
    }

    $form_state->setUserInput($userInput);
    $form_state->setRebuild();
  }

  /**
   * Callback function that populates the newParticipant fields with the certain participant values, and removes that participant from the list of added participants.
   *
   * @param array $form
   * @param FormStateInterface $form_state
   */
  function editParticipantOptions(array &$form, FormStateInterface $form_state) {
    $userInput = $form_state->getUserInput();

    //getting triggering element
    $triggeringElement = $form_state->getTriggeringElement();
    $addedParticipants = $form_state->get('addedParticipants');

    $participantToEdit = $addedParticipants[$triggeringElement['#participantOptionsDelta']];

    //unsetting the participant
    unset($addedParticipants[$triggeringElement['#participantOptionsDelta']]);
    $form_state->set('addedParticipants', $addedParticipants);

    //filling personal information
    $userInput['newParticipantContainer']['newParticipantFieldset']['firstName'] = $participantToEdit['firstName'];
    $userInput['newParticipantContainer']['newParticipantFieldset']['lastName'] = $participantToEdit['lastName'];
    $userInput['newParticipantContainer']['newParticipantFieldset']['email'] = $participantToEdit['email'];

    //filling options
    foreach ($participantToEdit['orderedOptions'] as $optionGroupDelta => $orderedOption) {
      $optionDelta = $orderedOption['option']['delta'];
      $subOptionDelta = NULL;
      if (isset($orderedOption['suboption']['delta'])) {
        $subOptionDelta = $orderedOption['suboption']['delta'];
      }

      $userInput['availableOptionsContainer']['optionGroups'][$optionGroupDelta] = [
        'option' => $optionDelta,
        'options' => [
          0 => [
            'suboptions-container' => [
              'suboption' => $subOptionDelta
            ]
          ]
        ]
      ];
    }

    $form_state->setUserInput($userInput);
    $form_state->setRebuild();
  }

  /**
   * Callback function that removes a certain participant from the list of added participants.
   *
   * @param array $form
   * @param FormStateInterface $form_state
   */
  function removeParticipantOptions(array &$form, FormStateInterface $form_state) {
    //getting triggering element
    $triggeringElement = $form_state->getTriggeringElement();
    $addedParticipants = $form_state->get('addedParticipants');
    //unsetting the participant
    unset($addedParticipants[$triggeringElement['#participantOptionsDelta']]);
    $form_state->set('addedParticipants', $addedParticipants);

    //rebuilding form
    $form_state->setRebuild();
  }

  /**
   * Ajax callback function that fetches the refreshed version of added participants with options, resets add new participant form part
   * as well as updated the total course price
   *
   * @param array $form
   * @param FormStateInterface $form_state
   * @return AjaxResponse
   */
  public function ajaxAddRemoveParticipantOptionsCallback(array &$form, FormStateInterface $form_state) {
    $response = new AjaxResponse();

    //checking for any errors
    if ($form_state->hasAnyErrors()) {
      $response->addCommand(new HtmlCommand('#status_messages', $form['status_messages']));
      //redrawing elements
      $response->addCommand(new ReplaceCommand('#new-participant-container-wrapper', $form['newParticipantContainer']));
      $response->addCommand(new ReplaceCommand('#available-options-container-wrapper', $form['availableOptionsContainer']));
      return $response;
    }

    //resetting elements
    $response->addCommand(new ReplaceCommand('#new-participant-container-wrapper', $form['newParticipantContainer']));
    $response->addCommand(new ReplaceCommand('#available-options-container-wrapper', $form['availableOptionsContainer']));

    //updating the price
    $response->addCommand(new HtmlCommand('#vih-course-price', 'DKK ' . number_format($this->calculatePrice($form_state), 0, ',', '.')));

    //updating added participants
    $response->addCommand(new ReplaceCommand('#added-participants-container-wrapper', $form['addedParticipantsContainer']));

    //resetting the error, if any
    $response->addCommand(new HtmlCommand('#status_messages', $form['status_messages']));

    return $response;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    $triggeringElement = $form_state->getTriggeringElement();

    //submit button
    if ($triggeringElement['#id'] == 'vih-course-submit') {
      $form_state->clearErrors();

      $addedParticipants = $form_state->get('addedParticipants');
      //not added participants
      if (!count($addedParticipants)) {
        $form_state->setError($form['newParticipantContainer']['newParticipantFieldset']['firstName'], $this->t('Tilføj venligst mindst én deltager'));
        $form_state->setError($form['newParticipantContainer']['newParticipantFieldset']['lastName'], $this->t('Tilføj venligst mindst én deltager'));
        $form_state->setError($form['newParticipantContainer']['newParticipantFieldset']['email'], $this->t('Tilføj venligst mindst én deltager'));
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    //collection subscribed participants information
    $subscribedParticipants = array();

    $firstParticipantName = '';

    $addedParticipants = $form_state->get('addedParticipants');
    if (isset($addedParticipants) && !empty($addedParticipants)) {
      $optionGroups = $this->course->field_vih_sc_option_groups->referencedEntities();

      foreach ($addedParticipants as $addedParticipant) {
        //going though options
        $orderedOptions = array();
        foreach ($addedParticipant['orderedOptions'] as $optionGroupDelta => $orderedOption) {
          $optionDelta = $orderedOption['option']['delta'];
          $subOptionDelta = NULL;

          //option group
          $optionGroup = $optionGroups[$optionGroupDelta];

          //option
          $options = $optionGroup->field_vih_og_options->referencedEntities();
          $option = $options[$optionDelta];

          //suboption
          $suboption = NULL;
          if ($option && isset($orderedOption['suboption']['delta'])) {
            $suboptions = $option->field_vih_option_suboptions;
            $suboption = $suboptions[$orderedOption['suboption']['delta']]->value;
          }

          $orderedOption = Paragraph::create([
            'type' => 'vih_ordered_option',
            'field_vih_oo_group_name' => $optionGroup->field_vih_og_title->value,
            'field_vih_oo_option_name' => $option->field_vih_option_title->value,
            'field_vih_oo_price_addition' => $option->field_vih_option_price_addition->value,
            'field_vih_oo_suboption' => $suboption,
          ]);
          $orderedOptions[] = $orderedOption;
        }

        //creating participant paragraph
        $subscribedParticipant = Paragraph::create([
          'type' => 'vih_ordered_course_person',
          'field_vih_ocp_first_name' => $addedParticipant['firstName'],
          'field_vih_ocp_last_name' => $addedParticipant['lastName'],
          'field_vih_ocp_email' => $addedParticipant['email'],
          'field_vih_ocp_ordered_options' => $orderedOptions
        ]);
        $subscribedParticipant->save();
        $subscribedParticipants[] = $subscribedParticipant;

        //saving first participant name to use in order title
        if (empty($firstParticipantName)) {
          $firstParticipantName = $addedParticipant['firstName'] . ' ' . $addedParticipant['lastName'];
        }
      }
    }

    //calculating the price
    $orderPrice = $this->calculatePrice($form_state);

    //checking if we need to create a new order or edit the existing
    if ($this->courseOrder == NULL) {
      //creating the Course Order
      $this->courseOrder = Node::create(array(
        'type' => 'vih_short_course_order',
        'status' => 0,
        'title' => $this->course->getTitle() . ' - kursus tilmelding - ' . $firstParticipantName . ' - '
          . \Drupal::service('date.formatter')->format(time(), 'short'),
        'field_vih_sco_persons' => $subscribedParticipants,
        'field_vih_sco_course' => $this->course->id(),
        'field_vih_sco_status' => 'pending',
        'field_vih_sco_price' => $orderPrice
      ));
    } else {
      //removing old participants paragraphs, and replacing with new ones
      $subscribedPersonsIds = $this->courseOrder->get('field_vih_sco_persons')->getValue();
      foreach ($subscribedPersonsIds as $subscribedPersonId) {
        $subscribedPerson = Paragraph::load($subscribedPersonId['target_id']);

        if ($subscribedPerson) {
          //removing added options
          $orderedOptionsIds = $subscribedPerson->get('field_vih_ocp_ordered_options')->getValue();
          foreach ($orderedOptionsIds as $orderedOptionId) {
            $orderedOption = Paragraph::load($orderedOptionId['target_id']);
            if ($orderedOption) {
              $orderedOption->delete;
            }
          }

          //finally removing the subscribed person itself
          $subscribedPerson->delete();
        }
      }
      //adding new participants
      $this->courseOrder->set('field_vih_sco_persons', $subscribedParticipants);

      $this->courseOrder->set('field_vih_sco_price', $orderPrice);
    }

    //saving the order (works for both new/edited)
    $this->courseOrder->save();

    //redirecting to confirmation page
    $form_state->setRedirect('vih_subscription.subscription_confirmation_redirect', [
      'subject' => $this->course->id(),
      'order' => $this->courseOrder->id(),
      'checksum' => VihSubscriptionUtils::generateChecksum($this->course, $this->courseOrder)
    ]);
  }

  /**
   * Traverses through the selected options and calculates the total price for the course.
   *
   * @param FormStateInterface $form_state
   * @return mixed
   */
  private function calculatePrice(FormStateInterface $form_state) {
    $base_price = $this->course->field_vih_sc_price->value;

    $addedParticipants = $form_state->get('addedParticipants');

    if (count($addedParticipants) > 0) {
      //calculating persons
      $base_price *= count($addedParticipants);

      //calculating options
      $optionGroups = $this->course->field_vih_sc_option_groups->referencedEntities();
      foreach ($addedParticipants as $addedParticipant) {
        foreach ($addedParticipant['orderedOptions'] as $orderedOption) {
          if (isset($orderedOption['option']['delta'])) {
            $selectedOptionGroup = $optionGroups[$orderedOption['optionGroup']['delta']];

            $options = $selectedOptionGroup->field_vih_og_options->referencedEntities();
            $selectedOption = $options[$orderedOption['option']['delta']];

            $base_price += $selectedOption->field_vih_option_price_addition->value;
          }
        }
      }
    }

    $this->price = $base_price;
    return $this->price;
  }

  /**
   * Populating the ordered options from form_state
   *
   * @param $form
   * @param $form_state
   */
  private function populateAddedOptions(&$form, $form_state) {
    $optionGroups = $form_state->get('optionGroups');
    $optionGroupOptions = $form_state->get('optionGroupOptions');
    $optionGroupSuboptions = $form_state->get('optionGroupSuboptions');

    $addedOptions = $form_state->get('addedOptions');

    $form['addedOptionsContainer']['added_options_title'] = array(
      '#markup' => $this->t('Added options'),
      '#prefix' => '<h4>',
      '#suffix' => '</h4>',
    );

    foreach ($addedOptions as $addedOptionDelta => $addedOption) {
      $groupOptionName = $optionGroups[$addedOption['optionGroup']];
      $optionName = $optionGroupOptions[$addedOption['optionGroup']][$addedOption['option']];
      $suboptionName = NULL;
      if (!empty($optionGroupSuboptions[$addedOption['optionGroup']][$addedOption['option']][$addedOption['suboption']])) {
        $suboptionName = $optionGroupSuboptions[$addedOption['optionGroup']][$addedOption['option']][$addedOption['suboption']];
      }
      $amount = $addedOption['amount'];

      $form['addedOptionsContainer']['addedOption-' . $addedOptionDelta] = [
        '#markup' => $groupOptionName . ' / ' . $optionName . ' / ' . $suboptionName . ' stk. :' . $amount
      ];

      $form['addedOptionsContainer']['deleteAddedOption-' . $addedOptionDelta] = [
        '#name' => 'deleteAddedOption-' . $addedOptionDelta,
        '#type' => 'submit',
        '#value' => $this->t('Slet'),
        '#submit' => array('::removeOption'),
        '#ajax' => [
          'callback' => '::ajaxAddRemoveOptionCallback',
          'wrapper' => 'added-options-container-wrapper',
          'progress' => array(
            'type' => 'none'
          )
        ],
        '#addedOptionDelta' => $addedOptionDelta,
        '#limit_validation_errors' => array(),
        '#button_type' => 'danger',
      ];

      $form['addedOptionsContainer'][] = [
        '#markup' => '<br/>'
      ];
    }
  }

  /**
   * Populate the data into the form the existing courseOrder
   *
   * @param NodeInterface $courseOrder
   * @param $form
   */
  private function populateData(NodeInterface $courseOrder, &$form, &$form_state) {
    //variables that are used for extracing ordered options information
    $optionGroups = $form_state->get('optionGroups');
    $optionGroupOptions = $form_state->get('optionGroupOptions');
    $optionGroupSuboptions = $form_state->get('optionGroupSuboptions');

    $addedParticipants = array();

    //subscribed persons
    $subscribedPersonsIds = $courseOrder->get('field_vih_sco_persons')->getValue();
    foreach ($subscribedPersonsIds as $index => $subscribedPersonId) {
      $subscribedPerson = Paragraph::load($subscribedPersonId['target_id']);

      //filling personal information
      $participant = array();
      $participant['firstName'] = $subscribedPerson->field_vih_ocp_first_name->value;
      $participant['lastName'] = $subscribedPerson->field_vih_ocp_last_name->value;
      $participant['email'] = $subscribedPerson->field_vih_ocp_email->value;

      //filling ordered options information
      $orderedOptionsIds = $subscribedPerson->get('field_vih_ocp_ordered_options')->getValue();
      foreach ($orderedOptionsIds as $orderedOptionId) {
        $orderedOption = Paragraph::load($orderedOptionId['target_id']);

        $optionGroupId = array_search($orderedOption->field_vih_oo_group_name->value, $optionGroups);
        $optionId = array_search($orderedOption->field_vih_oo_option_name->value, $optionGroupOptions[$optionGroupId]);
        $suboptionId = NULL;
        $suboptionName = NULL;
        if (!empty($optionGroupSuboptions[$optionGroupId][$optionId])) {
          $suboptionId = array_search($orderedOption->field_vih_oo_suboption->value, $optionGroupSuboptions[$optionGroupId][$optionId]);
          $suboptionName = $optionGroupSuboptions[$optionGroupId][$optionId][$suboptionId];
        }

        $participant['orderedOptions'][$optionGroupId] = [
          'optionGroup' => [
            'delta' => $optionGroupId,
            'name' => $optionGroups[$optionGroupId]
          ],
          'option' => [
            'delta' => $optionId,
            'name' => $optionGroupOptions[$optionGroupId][$optionId]
          ],
          'suboption' => [
            'delta' => $suboptionId,
            'name' => $suboptionName
          ]
        ];
      }

      $addedParticipants[] = $participant;
    }

    $form_state->set('addedParticipants', $addedParticipants);
  }
}