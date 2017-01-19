<?php

/**
 * @file
 */
namespace Drupal\foobarblk\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Foobar' Block
 * @Block(
 * id = "block_foobarblk",
 * admin_label = @Translation("Foo Bar block"),
 * )
 */
class FoobarblkBlock extends BlockBase {

	/**
	 * {@inheritdoc}
	 */
	public function build() {
		return array (
			'#type' => 'markup',
      		'#markup' => '<img id="logo-frontpage" src="https://i.imgsafe.org/0b26821929.png">',
		);
	}

}



