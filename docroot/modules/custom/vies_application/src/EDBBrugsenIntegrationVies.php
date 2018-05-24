<?php

namespace Drupal\vies_application;

/**
 * @file
 * Contains \Drupal\vih_subscription\Misc\EDBBrugsenIntegration.
 */

use Drupal\vih_subscription\Misc\EDBBrugsenIntegration;

/**
 * VIES EDBBrugsen service integration class.
 *
 * Why do we need this? Because when the token API was moved to core we did not
 * reuse the entity type as the base name for taxonomy terms and vocabulary
 * tokens.
 */
class EDBBrugsenIntegrationVies extends EDBBrugsenIntegration {

  /**
   * Converts a long course order node to the registration array, which can later on be added via webservice.
   *
   * @param array $data
   *   Registration data.
   *
   * @return array
   *   Converted registration array.
   */
  public function convertApplicationToRegistration(array $data) {
    $registration = array();

    $registration['Kursus'] = $data['courseTitle'];
    // Student information.
    $registration['Elev.Fornavn'] = $data['firstName'];
    $registration['Elev.Efternavn'] = $data['lastName'];
    $registration['Elev.Adresse'] = $data['address'];
    $registration['Elev.Lokalby'] = $data['city'];
    $registration['Elev.Postnr'] = $data['zip'];
    $registration['Elev.Bynavn'] = $data['city'];
    $registration['Elev.Kommune'] = $data['municipality'];
    $registration['Elev.Fastnet'] = $data['telefon'];
    $registration['Elev.Mobil'] = $data['telefon'];
    $registration['Elev.Email'] = $data['email'];
    $registration['Elev.CprNr'] = $data['cpr'];

    // Adult information.
    $parent = array_shift($data['parents']);
    $registration['Voksen.Fornavn'] = $parent['firstName'];
    $registration['Voksen.Efternavn'] = $parent['lastName'];
    $registration['Voksen.Adresse'] = $parent['address'];
    $registration['Voksen.Lokalby'] = $parent['city'];
    $registration['Voksen.Postnr'] = $parent['zip'];
    $registration['Voksen.Bynavn'] = $parent['city'];
    $registration['Voksen.Kommune'] = $parent['municipality'];
    $registration['Voksen.Fastnet'] = $parent['telefon'];
    $registration['Voksen.Mobil'] = $parent['telefon'];
    $registration['Voksen.Email'] = $parent['email'];
    $registration['Voksen.CprNr'] = $parent['cpr'];

    // Fill in the rest key values;
    $registration += $this->getDefaultRegistrationValues();
    return $registration;
  }

}
