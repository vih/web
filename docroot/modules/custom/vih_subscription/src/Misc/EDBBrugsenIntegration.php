<?php

/**
 * @file
 * Contains \Drupal\vih_subscription\Misc\EDBBrugsenIntegration.
 */

namespace Drupal\vih_subscription\Misc;

use Drupal\node\NodeInterface;
use EDBBrugs\Client;
use EDBBrugs\Credentials;
use EDBBrugs\RegistrationRepository;

class EDBBrugsenIntegration {

  public $registration_repository;
  public $soapWsdlUrl = 'https://www.webtilmeldinger.dk/TilmeldingsFormularV2Ws/Service.asmx?wsdl';

  /**
   * Creates EDBBrugsenIntegration object.
   *
   * @param $username
   * @param $password
   * @param $school_code
   * @param $book_number
   */
  public function __construct($username, $password, $school_code, $book_number) {
    $this->book_number = $book_number;

    $soap = new \SoapClient($this->soapWsdlUrl, array('trace' => 1));
    $credentials = new Credentials($username, $password, $school_code);
    $client = new Client($credentials, $soap);

    $this->registration_repository = new RegistrationRepository($client);
  }

  /**
   * Converts a course order node (both long and short) to the registration array, which can later on be added via webservice.
   *
   * @param NodeInterface $longCourse
   * @return array
   */
  public function convertLongCourseToRegistration(NodeInterface $longCourse) {
    $registration = array();

    if ($longCourse->getType() == 'vih_long_course_order') {
      $registration['Kursus'] = $longCourse->get('field_vih_lco_course')->entity->getTitle();

      //student = elev information
      $registration['Elev.Fornavn'] = $longCourse->get('field_vih_lco_first_name')->value;
      $registration['Elev.Efternavn'] = $longCourse->get('field_vih_lco_last_name')->value;
      $registration['Elev.Adresse'] = $longCourse->get('field_vih_lco_address')->value;
      $registration['Elev.Lokalby'] = $longCourse->get('field_vih_lco_city')->value;
      $registration['Elev.Postnr'] = $longCourse->get('field_vih_lco_zip')->value;
      $registration['Elev.Bynavn'] = $longCourse->get('field_vih_lco_city')->value;
      $registration['Elev.Fastnet']  = $longCourse->get('field_vih_lco_telefon')->value;
      $registration['Elev.Mobil'] = $longCourse->get('field_vih_lco_telefon')->value;
      $registration['Elev.Email'] = $longCourse->get('field_vih_lco_email')->value;
      $registration['Elev.Land'] = (string) $longCourse->get('field_vih_lco_nationality')->value;
      $registration['Elev.Notat'] = $longCourse->get('field_vih_lco_message')->value;

      // adult = voksen information
      $registration['Voksen.Fornavn'] = $longCourse->get('field_vih_lco_adult_first_name')->value;
      $registration['Voksen.Efternavn'] = $longCourse->get('field_vih_lco_adult_last_name')->value;
      $registration['Voksen.Adresse'] = $longCourse->get('field_vih_lco_adult_address')->value;
      $registration['Voksen.Lokalby'] = $longCourse->get('field_vih_lco_adult_city')->value;
      $registration['Voksen.Postnr'] = $longCourse->get('field_vih_lco_adult_zip')->value;
      $registration['Voksen.Bynavn'] = $longCourse->get('field_vih_lco_adult_city')->value;
      $registration['Voksen.Fastnet']  = $longCourse->get('field_vih_lco_adult_telefon')->value;
      $registration['Voksen.Mobil'] = $longCourse->get('field_vih_lco_adult_telefon')->value;
      $registration['Voksen.Email'] = $longCourse->get('field_vih_lco_adult_email')->value;
      $registration['Voksen.Land'] = (string) $longCourse->get('field_vih_lco_adult_nationality')->value;

      $registration += $this->getDefaultRegistrationValues();
    } elseif ($longCourse->getType() == 'vih_short_course_order') {
      $registration += $this->getDefaultRegistrationValues();
    }

    return $registration;
  }

  /**
   * Functions that add student's CPR number to the registration array
   *
   * @param $registration
   * @param $cpr
   */
  public function addStudentCprNr($registration, $cpr) {
    $registration['Elev.CprNr'] = $cpr;

    return $registration;
  }

  /**
   * Adds the registration via webservice.
   *
   * @param $registration
   */
  public function addRegistration($registration) {
    if (!empty($registration)) {
      $this->registration_repository->addRegistrations(array($registration));
    }
  }

  /**
   * Provides default values for registration array
   *
   * @return array
   */
  private function getDefaultRegistrationValues() {
    return array(
      'Kartotek' => $this->book_number,
      'Kursus' => 'Vinterkursus 18/19',
      // The following is available for Elev, Mor, Far, Voksen
      'Elev.Fornavn' => 'Svend Aage',
      'Elev.Efternavn' => 'Thomsen',
      'Elev.Adresse' => 'Ørnebjergvej 28',
      'Elev.Lokalby' => 'Grejs',
      'Elev.Postnr' => '7100',
      'Elev.Bynavn' => 'Vejle',
      'Elev.CprNr' => '010119421942',
      'Elev.Fastnet' => '75820811',
      'Elev.FastnetBeskyttet' => 0, // 0 = No, 1 = Yes
      'Elev.Mobil' => '75820811',
      'Elev.MobilBeskyttet' => 0, // 0 = No, 1 = Yes
      'Elev.Email' => 'kontor@vih.dk',
      'Elev.Land' => 'Danmark',
      'Elev.Notat' => 'Svend Aage Thomsen er skolens grundlægger',
      // Specific for student
      'Elev.Linje' => 'Fodbold',//there is not specific course track that student is subscribing, instead each subscription is a set several of course trackes
      'Voksen.Fornavn' => 'Svend Aage',
      'Voksen.Efternavn' => 'Thomsen',
      'Voksen.Adresse' => 'Ørnebjergvej 28',
      'Voksen.Lokalby' => 'Grejs',
      'Voksen.Postnr' => '7100',
      'Voksen.Bynavn' => 'Vejle',
      'Voksen.Fastnet' => '75820811',
      'Voksen.FastnetBeskyttet' => 0, // 0 = No, 1 = Yes
      'Voksen.Mobil' => '75820811',
      'Voksen.MobilBeskyttet' => 0, // 0 = No, 1 = Yes
      'Voksen.Email' => 'kontor@vih.dk',
      'Voksen.Land' => 'Danmark',
    );
  }
}