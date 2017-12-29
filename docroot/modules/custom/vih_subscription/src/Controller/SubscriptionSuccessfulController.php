<?php

namespace Drupal\vih_subscription\Controller;

use Drupal\Component\Utility\Crypt;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Datetime\DateFormatter;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Site\Settings;
use Drupal\node\NodeInterface;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\vih_subscription\Form\EdbbrugsenSettingsForm;
use Drupal\vih_subscription\Form\NotificationsSettingsForm;
use Drupal\vih_subscription\Misc\EDBBrugsenIntegration;
use Drupal\vih_subscription\Misc\VihSubscriptionUtils;

/**
 * An example controller.
 */
class SubscriptionSuccessfulController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  public function content(NodeInterface $subject, NodeInterface $order, $checksum) {
    if (Crypt::hashEquals($checksum, VihSubscriptionUtils::generateChecksum($subject, $order))) {
      $this->registerOrder($subject, $order);

      //the actual content comes from template file: templates/vih_subscription_thank_you_page.html.twig
      $build = array(
        '#theme' => 'vih_subscription_thank_you_page'
      );
      return $build;
    } else {
      return $this->redirect('vih_subscription.subscription_error_redirect');
    }
  }

  public function getTitle() {
    return $this->t('Tak for din tilmelding');
  }

  /**
   * Wrapper function register order:
   * Sending notification email, changing order status, registering on EDB system
   *
   * @param NodeInterface $subject
   * @param NodeInterface $order
   */
  private function registerOrder(NodeInterface $subject, NodeInterface $order) {
    //Send email
    $notificationsConfig = \Drupal::configFactory()->getEditable(NotificationsSettingsForm::$configName);
    $message = array();
    $node_view = node_view($order, 'email_teaser');
    $order_rendered = render($node_view)->__toString();
    //HTML string cleanup
    $order_rendered = strip_tags($order_rendered, '<p><div><h1><h2><h3><h4><h5><span>');
    $order_rendered = preg_replace("#(</?\w+)(?:\s(?:[^<>/]|/[^<>])*)?(/?>)#ui", '$1$2', $order_rendered);
    
    $token = ['@subject_name', '@person_name', '@date', '@url', '@order'];

    if ($subject->getType() == 'vih_long_cource') {
      $message = [
        'to' => $order->field_vih_lco_email->value,
        'subject' => $notificationsConfig->get('vih_subscription_long_course_notifications_subject'),
        'body' => $notificationsConfig->get('vih_subscription_long_course_notifications_body')
      ];

      //getting the start and end date for long course START
      // FIXME: that is a copy paste from site.theme preprocess_node function, consider refactoring
      $start_course_date = '';
      $end_course_date = '';
      foreach ($subject->field_vih_course_periods->referencedEntities() as $period) {
        if (is_array($period->field_vih_cp_start_date->getValue()[0])) {
          $curr_start_date = array_pop($period->field_vih_cp_start_date->getValue()[0]);
        }
        if (is_array($period->field_vih_cp_end_date->getValue()[0])) {
          $curr_end_date = array_pop($period->field_vih_cp_end_date->getValue()[0]);
        }

        if ($start_course_date) {
          if (strtotime($curr_start_date) < strtotime($start_course_date)) {
            $start_course_date = $curr_start_date;
          }
        } else {
          $start_course_date = $curr_start_date;
        }
        if ($end_course_date) {
          if (strtotime($curr_end_date) > strtotime($end_course_date)) {
            $end_course_date = $curr_end_date;
          }
        } else {
          $end_course_date = $curr_end_date;
        }
      }
      // getting start and end date for the long course END

      // course date
      $courseDate = NULL;
      if ($start_course_date) {
        $courseDate = \Drupal::service('date.formatter')->format(strtotime($start_course_date), "default_medium_date_without_time");
      }
      if ($end_course_date) {
        if (!(empty($courseDate))) {
          $courseDate .= ' - ';
        }
        $courseDate .= \Drupal::service('date.formatter')->format(strtotime($end_course_date), "default_medium_date_without_time");
      }

      $replacement = [
        $subject->getTitle(),
        $order->field_vih_lco_first_name->value . ' ' . $order->field_vih_lco_last_name->value,
        !empty($courseDate) ? $courseDate : '',
        $subject->toUrl()->setAbsolute()->toString(),
        $order_rendered,
      ];

      // Mailchimp integration
      if ($order->field_vih_lco_newsletter->value) {
        $email = $order->field_vih_lco_email->value;
        $firstName = $order->field_vih_lco_first_name->value;
        $lastName = $order->field_vih_lco_last_name->value;

        VihSubscriptionUtils::subscribeToMailchimp($firstName, $lastName, $email);
      }

      //EDBBrugsen Integration
      $edbBrugsenConfig = \Drupal::configFactory()->getEditable(EdbbrugsenSettingsForm::$configName);
      if ($edbBrugsenConfig->get('active')) {
        $username = $edbBrugsenConfig->get('username');
        $password = $edbBrugsenConfig->get('password');
        $school_code = $edbBrugsenConfig->get('school_code');
        $book_number = $edbBrugsenConfig->get('book_number');

        $edbBrugsenIntegration = new EDBBrugsenIntegration($username, $password, $school_code, $book_number);
        $registration = $edbBrugsenIntegration->convertLongCourseToRegistration($order);
        $registration = $edbBrugsenIntegration->addStudentCprNr($registration, $studentCpr);
        $edbBrugsenIntegration->addRegistration($registration);
      }
      
      //updating course order status
      $order->set('field_vih_lco_status', 'confirmed');
      //deleting CPR from order
      $studentCpr = $order->field_vih_lco_cpr->value;
      $order->set('field_vih_lco_cpr', '');
      $order->save();
      
    } elseif ($subject->getType() == 'vih_short_course') {
      $allParticipants = $order->get('field_vih_sco_persons')->getValue();
      if (!empty($allParticipants)) {
        //getting first participant
        $firstParticipantTargetId = $allParticipants[0]['target_id'];
        $firstParticipantParagraph = Paragraph ::load($firstParticipantTargetId);

        // first participant values
        $firstName = $firstParticipantParagraph->field_vih_ocp_first_name->value;
        $lastName = $firstParticipantParagraph->field_vih_ocp_last_name->value;
        $email = $firstParticipantParagraph->field_vih_ocp_email->value;

        //course date
        $courseDate = NULL;
        if ($subject->field_vih_sc_start_date->value) {
          $courseDate = \Drupal::service('date.formatter')->format(strtotime($subject->field_vih_sc_start_date->value), "default_medium_date_without_time");
        }
        if ($subject->field_vih_sc_end_date->value) {
          if (!(empty($courseDate))) {
            $courseDate .= ' - ';
          }
          $courseDate .= \Drupal::service('date.formatter')->format(strtotime($subject->field_vih_sc_end_date->value), "default_medium_date_without_time");
        }

        $message = [
          'to' => $email,
          'subject' => $notificationsConfig->get('vih_subscription_short_course_notifications_subject'),
          'body' => $notificationsConfig->get('vih_subscription_short_course_notifications_body'),
        ];

        $replacement = [
          $subject->getTitle(),
          $firstName . ' ' . $lastName,
          !empty($orderDate) ? $orderDate : '',
          $subject->toUrl()->setAbsolute()->toString(),
          $order_rendered,
        ];
      }

      $order_persons = $order->field_vih_sco_persons->referencedEntities();
      $order_data = array();
      foreach ($order_persons as $order_person) {

        //EDBBrugsen Integration
        $edbBrugsenConfig = \Drupal::configFactory()->getEditable(EdbbrugsenSettingsForm::$configName);
        if ($edbBrugsenConfig->get('active')) {
          $username = $edbBrugsenConfig->get('username');
          $password = $edbBrugsenConfig->get('password');
          $school_code = $edbBrugsenConfig->get('school_code');
          $book_number = $edbBrugsenConfig->get('book_number');

          $edbBrugsenIntegration = new EDBBrugsenIntegration($username, $password, $school_code, $book_number);
          $registration = $edbBrugsenIntegration->convertShortCourseToRegistration($order_person);
          if(!empty($order_person->field_vih_ocp_cpr->getValue()[0]['value'])){
            $registration = $edbBrugsenIntegration->addStudentCprNr($registration, $order_person->field_vih_ocp_cpr->getValue()[0]['value']); 
          }
          $registration = $edbBrugsenIntegration->addCourseName($registration, $order->get('field_vih_sco_course')->entity->getTitle());
          $edbBrugsenIntegration->addRegistration($registration);

          //deleting CPR from order person
          $order_person->set('field_vih_ocp_cpr', '');
          $order_person->save();
        }
      }

      //updating course order status
      $order->set('field_vih_sco_status', 'confirmed');
      $order->save();
      
      
    } elseif ($subject->getType() == 'event') {
      $allParticipants = $order->get('field_vih_eo_persons')->getValue();
      if (!empty($allParticipants)) {
        //getting first participant
        $firstParticipantTargetId = $allParticipants[0]['target_id'];
        $firstParticipantParagraph = Paragraph ::load($firstParticipantTargetId);

        // first participant values
        $firstName = $firstParticipantParagraph->field_vih_oe_first_name->value;
        $lastName = $firstParticipantParagraph->field_vih_oe_last_name->value;
        $email = $firstParticipantParagraph->field_vih_oe_email->value;

        //event date
        $eventDate = NULL;
        if ($subject->field_event_start_date->value) {
          $eventDate = \Drupal::service('date.formatter')->format(strtotime($subject->field_event_start_date->value), "default_medium_date_without_time");
        }
        if ($subject->field_event_end_date->value) {
          if (!(empty($eventDate))) {
            $eventDate .= ' - ';
          }
          $eventDate .= \Drupal::service('date.formatter')->format(strtotime($subject->field_event_end_date->value), "default_medium_date_without_time");
        }

        $message = [
          'to' => $email,
          'subject' => $notificationsConfig->get('vih_subscription_event_notifications_subject'),
          'body' => $notificationsConfig->get('vih_subscription_event_notifications_body')
        ];

        $replacement = [
          $subject->getTitle(),
          $firstName . ' ' . $lastName,
          !empty($eventDate) ? $eventDate : '',
          $subject->toUrl()->setAbsolute()->toString(),
          $order_rendered,
        ];
      }

      //updating event order status
      $order->set('field_vih_eo_status', 'confirmed');
      $order->save();
    }

    if (!empty($message)) {
      VihSubscriptionUtils::makeReplacements($message, $token, $replacement);
      VihSubscriptionUtils::sendMail($message);
    }
  }
}