<?php

namespace Drupal\vih_subscription\Controller;

use Drupal\Component\Utility\Crypt;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Site\Settings;
use Drupal\node\NodeInterface;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\vih_subscription\Form\NotificationsSettingsForm;
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
      $this->sendNotificationEmail($subject, $order);

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
   * Wrapper function to conveniently send the email notification
   *
   * @param NodeInterface $subject
   * @param NodeInterface $order
   */
  private function sendNotificationEmail(NodeInterface $subject, NodeInterface $order) {
    //Send email
    $notificationsConfig = \Drupal::configFactory()->getEditable(NotificationsSettingsForm::$configName);
    $message = array();
    $token = ['@subject_name', '@person_name'];

    if ($subject->getType() == 'vih_long_cource') {
      $message = [
        'to' => $order->field_vih_lco_email->value,
        'subject' => $notificationsConfig->get('vih_subscription_long_course_notifications_subject'),
        'body' => $notificationsConfig->get('vih_subscription_long_course_notifications_body')
      ];

      $replacement = [
        $subject->getTitle(),
        $order->field_vih_lco_first_name->value . ' ' . $order->field_vih_lco_last_name->value
      ];

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

        $message = [
          'to' => $email,
          'subject' => $notificationsConfig->get('vih_subscription_short_course_notifications_subject'),
          'body' => $notificationsConfig->get('vih_subscription_short_course_notifications_body')
        ];

        $replacement = [
          $subject->getTitle(),
          $firstName . ' ' . $lastName
        ];
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

        $message = [
          'to' => $email,
          'subject' => $notificationsConfig->get('vih_subscription_event_notifications_subject'),
          'body' => $notificationsConfig->get('vih_subscription_event_notifications_body')
        ];

        $replacement = [
          $subject->getTitle(),
          $firstName . ' ' . $lastName
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