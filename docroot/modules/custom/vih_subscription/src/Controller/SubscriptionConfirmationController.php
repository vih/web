<?php

namespace Drupal\vih_subscription\Controller;


use Drupal\bellcom_quickpay_integration\Misc\BellcomQuickpayClient;
use Drupal\Component\Utility\Crypt;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Drupal\node\NodeInterface;
use Drupal\vih_subscription\Misc\VihSubscriptionUtils;

class SubscriptionConfirmationController extends ControllerBase{

  /**
   * {@inheritdoc}
   */
  public function content(NodeInterface $subject, NodeInterface $order, $checksum) {
    if (Crypt::hashEquals($checksum, VihSubscriptionUtils::generateChecksum($subject, $order))) {

      $orderPrice = null;
      $backLink = null;

      if ($subject->getType() == 'vih_long_cource') {

      } elseif ($subject->getType() == 'vih_short_course') {
        $orderPrice = $order->field_vih_sco_price->value;
        $backLink = Url::fromRoute('vih_subscription.short_course_order_create', [
          'course' => $subject->id(),
          'order' => $order->id(),
          'checksum' => $checksum
        ]);
      } elseif ($subject->getType() == 'event') {
        $orderPrice = $order->field_vih_eo_price->value;
        $backLink = Url::fromRoute('vih_subscription.event_order_create', [
          'event' => $subject->id(),
          'order' => $order->id(),
          'checksum' => $checksum
        ]);
      }

      //generating URL needed for quickpay
      $successUrl = Url::fromRoute('vih_subscription.subscription_successful_redirect', [
        'subject' => $subject->id(),
        'order' => $order->id(),
        'checksum' => VihSubscriptionUtils::generateChecksum($subject, $order)
      ]);
      $successUrl->setAbsolute();

      $cancelUrl = Url::fromRoute('vih_subscription.subscription_cancelled_redirect');
      $cancelUrl->setAbsolute();

      $client = new BellcomQuickpayClient();
      $paymentLink = $client->getPaymentLink($order, $subject, $orderPrice, $successUrl->toString(), $cancelUrl->toString());

      //the actual content comes from template file: templates/vih_subscription_confirmation_page.html.twig
      $build = array(
        '#theme' => 'vih_subscription_confirmation_page',
        '#paymentLink' => $paymentLink,
        '#backLink' => $backLink->setAbsolute()->toString(),
        '#order' => node_view($order),
      );

      return $build;
    } else {
      return $this->redirect('vih_subscription.subscription_error_redirect');
    }
  }

  public function getTitle() {
    return $this->t('Bekræft venligst din ordre');
  }
} 