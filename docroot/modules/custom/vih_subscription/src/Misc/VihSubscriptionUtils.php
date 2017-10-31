<?php

/**
 * @file
 * Contains \Drupal\vih_subscription\Misc\VihSubscriptionUtils.
 */

namespace Drupal\vih_subscription\Misc;

use Drupal\Component\Utility\Crypt;
use Drupal\Core\Site\Settings;
use Drupal\node\NodeInterface;

class VihSubscriptionUtils {
  /**
   * Simply send mail function
   *
   * @param array $message with keys
   * - to
   * - from
   * - body
   * - sender
   * - subject
   * @return BOOLEAN
   */
  public static function sendMail($message) {
    $send_mail = new \Drupal\Core\Mail\Plugin\Mail\PhpMail();

    if (!isset($message['from'])) {
      $message['from'] = \Drupal::config('system.site')->get('mail');
    }

    if (!isset($message['sender'])) {
      $message['sender'] = \Drupal::config('system.site')->get('name');
    }

    $message['headers'] = array(
      'content-type' => 'text/html; charset=UTF-8; format=flowed; delsp=yes',
      'MIME-Version' => '1.0',
      'reply-to' => $message['from'],
      'from' => $message['sender'] . ' <' . $message['from'] . '>'
    );

    return $send_mail->mail($message);
  }

  /**
   * Replaces the certain text with the provided substitution text in both message subject and body
   *
   * @param $message
   * @param $token
   * @param $replacement
   */
  public static function makeReplacements(&$message, $token, $replacement) {
    $message['subject'] = str_replace($token, $replacement, $message['subject']);
    $message['body'] = str_replace($token, $replacement, $message['body']);
  }

  /**
   * Generates a checksum for a pair of subject-order, can be used to validate that the request is valid.
   *
   * @param NodeInterface $subject
   * @param NodeInterface $order
   * @return string
   */
  public static function generateChecksum(NodeInterface $subject, NodeInterface $order) {
    return Crypt::hashBase64($subject->id() . $order->id() . Settings::getHashSalt());
  }
}