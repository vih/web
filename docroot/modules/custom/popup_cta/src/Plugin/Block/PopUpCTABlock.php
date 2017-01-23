<?php

/**
 * @file
 */
namespace Drupal\popup_cta\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Foobar' Block
 * @Block(
 * id = "popup_cta",
 * admin_label = @Translation("Foo Bar block"),
 * )
 */
class PopUpCTABlock extends BlockBase {

	/**
	 * {@inheritdoc}
	 */
	public function build() {
		return array (
			'#type' => 'markup',
      		'#markup' => '<div id="pc-title"><h5>Lige nu</h5></div><div id="pc-description"><p>Der er stadig pladser at få <span id="spacing">&#8212;</span></p><a href="#">Tilmeld dig nu</a></div><span class="close">&times;</span>',
		);
	}

}



