<?php

namespace Drupal\bellcom_quickpay_integration\Misc;

use Drupal\bellcom_quickpay_integration\Form\QuickpaySettingsForm;
use Drupal\node\NodeInterface;
use QuickPay\QuickPay;
use Symfony\Component\Config\Definition\Exception\Exception;

class BellcomQuickpayClient {

  public $client;
  public $testMode;
  public $defaultCurrency = 'DKK';

  public function __construct() {
    $config = \Drupal::configFactory()->getEditable(QuickpaySettingsForm::$configName);

    $api_key = $config->get('api_key');

    $this->testMode = $config->get('test_mode');
    $this->client = new QuickPay(":{$api_key}");
  }

  /**
   * Creates a single payment and returns the link for it
   *
   * @param NodeInterface $node
   * @param NodeInterface $subject
   * @param $price
   * @param $successUrl
   * @param $cancelUrl
   *
   * @return string - single payment link
   */
  public function getPaymentLink(NodeInterface $order, NodeInterface $subject, $price, $successUrl, $cancelUrl) {
    $orderUrl = $order->toUrl();
    $orderUrl->setAbsolute();

    $subjectUrl = $subject->toUrl();
    $subjectUrl->setAbsolute();

    $variables = new \stdClass();
    $variables->orderNid = $order->id();
    $variables->order = $orderUrl->toString();
    $variables->subject = $subjectUrl->toString();

    try {
      // Create payment
      $payment_form = array(
        'order_id' => (($this->testMode) ? 'test-' : '') . $subject->id() . '-' . ($order->id()),
        'currency' => $this->defaultCurrency,
        'variables' => $variables
      );

      //creating single payment
      $payment = $this->client->request->post('/payments', $payment_form)->asArray();
      $payment_id = $payment['id'];

      $link = $this->client->request->put("/payments/$payment_id/link",
        [
          'amount' => number_format($price, 2, "", ""),
          'continue_url' => $successUrl,
          'cancel_url' => $cancelUrl
        ]);

      return $link->asArray()['url'];
    } catch (Exception $e) {
      \Drupal::logger('bellcom_quickpay_integration')->error($e->getMessage());
    }
  }
}