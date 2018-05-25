<?php

namespace Drupal\vies_application;

use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\Core\Url;
use Drupal\vih_subscription\Form\EdbbrugsenSettingsForm;
use Drupal\vih_subscription\Form\NotificationsSettingsForm;
use Drupal\vih_subscription\Misc\VihSubscriptionUtils;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * Application handler.
 */
class ApplicationHandler {
  use StringTranslationTrait;

  /**
   * Application data.
   */
  private $data;

  /**
   * Application node.
   */
  private $application;

  /**
   * About school questions.
   */
  public static $aboutSchool = [
    'schoolFrom'             => 'What school are you from?',
    'schoolHowItsGoing'      => 'How are you going to school?',
    'schoolSubjects'         => 'What subjects do you like and why?',
  ];

  /**
   * After school questions.
   */
  public static $afterSchool = [
    'afterSchoolExpectation' => 'What do you expect from a year after school?',
    'afterSchoolHeardFrom'   => 'Where have you heard of Vejle Idrætsefterskole?',
    'afterSchoolComment'     => 'Comment',
  ];

  /**
   * Construct.
   *
   * @param array $data
   *   Application data.
   */
  public function __construct(array $data) {
    $this->data = $data;
    $this->prepareData();
  }

  /**
   * Full process application function.
   */
  public function process() {
    $this->registerOrder();
    if ($this->saveData()) {
      $this->sendNotification();
      return TRUE;
    }
    return FALSE;
  }

  /**
   * Helper function to prepare data,.
   */
  private function prepareData() {
    $course = Node::load($this->data['course']);
    $this->data['courseTitle'] = $course->getTitle();

    $pattern = '/^course-period-(\d)-courseSlot-(\d)-availableClasses$/';
    $this->data['classes'] = [];
    foreach (preg_grep($pattern, array_keys($this->data)) as $key) {
      $this->data['classes'][] = $this->data[$key];
    }

    $this->data['fullAddress'] = $this->getFullAddress($this->data);
    foreach ($this->data['parents'] as $key => $parent) {
      $this->data['parents'][$key]['fullAddress'] = $this->getFullAddress($parent);
    }

    // Classes questions.
    foreach ($this->data['questions'] as $class_tid => $questions) {
      $class_term = Term::load($class_tid);
      foreach ($questions as $tid => $question) {
        $question_term = Term::load($tid);
        if (!empty($question_term)) {
          $this->data['questions'][$class_tid][$tid] = [
            'class' => $class_term->getName(),
            'question' => $question_term->getName(),
            'answer' => $question,
          ];
        }
      }
    }

    // About school questions.
    foreach (self::$aboutSchool as $key => $question) {
      if (empty($this->data[$key])) {
        continue;
      }
      $this->data[$key] = [
        'question' => $question,
        'answer' => $this->data[$key],
      ];
    }

    // After school questions.
    foreach (self::$afterSchool as $key => $question) {
      if (empty($this->data[$key])) {
        continue;
      }
      $this->data[$key] = [
        'question' => $question,
        'answer' => $this->data[$key],
      ];
    }
  }

  /**
   * Helper function to prepare data,.
   */
  private function getFullAddress($raw_data) {
    $address = empty($raw_data['address']) ? '' : $raw_data['address'];
    foreach (['houseNumber', 'houseLetter', 'houseFloor'] as $key) {
      if (!empty($raw_data[$key])) {
        $address .= ', ' . $raw_data[$key];
      }
    }
    return $address;
  }

  /**
   * Wrapper function register order.
   *
   * Sending notification email, changing order status,
   * registering on EDB system.
   */
  public function registerOrder() {
    // EDBBrugsen Integration.
    $edb_brugsen_config = \Drupal::configFactory()->getEditable(EdbbrugsenSettingsForm::$configName);
    if ($edb_brugsen_config->get('active')) {
      $username = $edb_brugsen_config->get('username');
      $password = $edb_brugsen_config->get('password');
      $school_code = $edb_brugsen_config->get('school_code');
      $book_number = $edb_brugsen_config->get('book_number');

      $edb_brugsen_integration = new EDBBrugsenIntegrationVies($username, $password, $school_code, $book_number);
      $registration = $edb_brugsen_integration->convertApplicationToRegistration($this->data);
      $edb_brugsen_integration->addRegistration($registration);
    }
  }

  /**
   * Wrapper function to save data.
   */
  public function saveData() {
    $application_node = [
      'type' => 'vies_application_form',
      // We restrict direct access to the node in site_preprocess_node hook.
      'status' => 1,
      'title' => $this->t('Application form: @course - @firstName @lastName @date', [
        '@course' => $this->data['courseTitle'],
        '@firstName' => $this->data['firstName'],
        '@lastName' => $this->data['lastName'],
        '@date' => \Drupal::service('date.formatter')->format(time(), 'short'),
      ]),
      // Application references.
      'field_vih_lco_course' => $this->data['course'],
      'field_vies_period' => $this->data['period'],
      'field_vies_class' => $this->data['classes'],
      // Student information.
      'field_vih_lco_first_name' => $this->data['firstName'],
      'field_vih_lco_last_name' => $this->data['lastName'],
      'field_vih_lco_telefon' => $this->data['telefon'],
      'field_vih_lco_email' => $this->data['email'],
      'field_vih_lco_newsletter' => $this->data['newsletter'],
      'field_vih_lco_address' => $this->data['fullAddress'],
      'field_vih_lco_city' => $this->data['city'],
      'field_vih_lco_municipality' => $this->data['municipality'],
      'field_vih_lco_zip' => $this->data['zip'],
      'field_vies_sex' => $this->data['sex'],
    ];

    // Parents information.
    foreach ($this->data['parents'] as $parent_data) {
      $parent = Paragraph::create([
        'type' => 'parent',
        'field_parent_first_name' => $parent_data['firstName'],
        'field_parent_last_name' => $parent_data['lastName'],
        'field_parent_telefon' => $parent_data['telefon'],
        'field_parent_email' => $parent_data['email'],
        'field_parent_newsletter' => $parent_data['newsletter'],
        'field_parent_address' => $parent_data['fullAddress'],
        'field_parent_city' => $parent_data['city'],
        'field_parent_municipality' => $parent_data['municipality'],
        'field_parent_zip' => $this->data['zip'],
      ]);
      $parent->isNew();
      $parent->save();
      $application_node['field_vies_parents'][$parent->id()] = $parent;

      // Parents Mailchimp subscription.
      if ($parent_data['newsletter']) {
        VihSubscriptionUtils::subscribeToMailchimp($parent_data['firstName'], $parent_data['lastName'], $parent_data['email']);
      }
    }

    // Classes questions.
    foreach ($this->data['questions'] as $questions_data) {
      foreach ($questions_data as $question_data) {
        $question = Paragraph::create([
          'type' => 'app_answer',
          'field_question' => $question_data['question'],
          'field_answer' => $question_data['answer'],
        ]);
        $question->isNew();
        $question->save();
        $application_node['field_vies_class_questions'][$question->id()] = $question;
      }
    }

    // About school questions.
    foreach (self::$aboutSchool as $key) {
      $question_data = $this->data[$key];
      if (empty($question_data)) {
        continue;
      }
      $question = Paragraph::create([
        'type' => 'app_answer',
        'field_question' => $question_data['question'],
        'field_answer' => $question_data['answer'],
      ]);
      $question->isNew();
      $question->save();
      $application_node['field_vies_about_school'][$question->id()] = $question;

    }

    // After school questions.
    foreach (self::$afterSchool as $key) {
      $question_data = $this->data[$key];
      if (empty($question_data)) {
        continue;
      }
      $question = Paragraph::create([
        'type' => 'app_answer',
        'field_question' => $question_data['question'],
        'field_answer' => $question_data['answer'],
      ]);
      $question->isNew();
      $question->save();
      $application_node['field_vies_afterschool'][$question->id()] = $question;
    }
    // Student Mailchimp subscription.
    if ($this->data['newsletter']) {
      VihSubscriptionUtils::subscribeToMailchimp($this->data['firstName'], $this->data['lastName'], $this->data['email']);
    }

    // Saving the application.
    $this->application = Node::create($application_node);
    $this->application->isNew();
    return $this->application->save();
  }

  /**
   * Wrapper function to send notifications.
   */
  public function sendNotification() {
    // Send email.
    $notifications_config = \Drupal::configFactory()->getEditable(NotificationsSettingsForm::$configName);
    $node_view = node_view($this->application, 'email_teaser');
    $application_rendered = render($node_view)->__toString();

    $logo = '<div style="background-color:#009bec; width:100%; text-align:center">'
      . '<img src="'
      . \Drupal::request()->getSchemeAndHttpHost()
      . '/themes/custom/site/dist/images/layout-header-logo.png" alt="VIH" />'
      . '</div><br>';

    $token = ['@subject_name', '@person_name', '@date', '@url', '@order'];

    $message = [
      'to' => $this->application->field_vih_lco_email->value,
      'subject' => $notifications_config->get('vih_subscription_long_course_notifications_subject'),
      'body' => $notifications_config->get('vih_subscription_long_course_notifications_body')
    ];

    // Getting the start and end date for long course START
    // FIXME: that is a copy paste from site.theme preprocess_node function, consider refactoring
    $start_course_date = '';
    $end_course_date = '';
    $period = Node::load($this->data['period']);
    if (!empty($period->field_vih_cp_start_date->getValue()[0])) {
      if (is_array($period->field_vih_cp_start_date->getValue()[0])) {
        $curr_start_date = array_pop($period->field_vih_cp_start_date->getValue()[0]);
      }
    }
    if (!empty($period->field_vih_cp_end_date->getValue()[0])) {
      if (is_array($period->field_vih_cp_end_date->getValue()[0])) {
        $curr_end_date = array_pop($period->field_vih_cp_end_date->getValue()[0]);
      }
    }
    if ($start_course_date) {
      if (strtotime($curr_start_date) < strtotime($start_course_date)) {
        $start_course_date = $curr_start_date;
      }
    }
    else {
      $start_course_date = $curr_start_date;
    }
    if ($end_course_date) {
      if (strtotime($curr_end_date) > strtotime($end_course_date)) {
        $end_course_date = $curr_end_date;
      }
    }
    else {
      $end_course_date = $curr_end_date;
    }

    // Getting start/end dates for the long course.
    $course_date = [];
    if ($start_course_date) {
      $course_date[] = \Drupal::service('date.formatter')->format(strtotime($start_course_date), "long");
    }
    if ($end_course_date) {
      $course_date[] .= \Drupal::service('date.formatter')->format(strtotime($end_course_date), "long");
    }

    $application_url = Url::fromRoute('vies_application.application_form')->setAbsolute()->toString();
    $replacement = [
      $this->data['courseTitle'],
      $this->application->field_vih_lco_first_name->value . ' ' .
      $this->application->field_vih_lco_last_name->value,
      !empty($course_date) ? mb_strtolower(implode(' - ', $course_date)) : '',
      '<a href="' . $application_url . '"target=_blank >' . $application_url . '</a>',
      $application_rendered,
    ];

    // Add logo to message body.
    $message['body'] = $logo . $message['body'];

    if (!empty($message)) {
      VihSubscriptionUtils::makeReplacements($message, $token, $replacement);
      VihSubscriptionUtils::sendMail($message);
    }
  }
}
