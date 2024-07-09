<?php
/**
 * Plugin Name:       Bluepic Embed
 * Description:       A block to embed Bluepic templates into your webiste.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            FellowBlue GmbH
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       bluepic-embed
 *
 * @package CreateBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function create_block_bluepic_embed_block_init() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'create_block_bluepic_embed_block_init' );



function bluepic_add_oauth_button() {

	$access_token = get_user_meta(get_current_user_id(), 'bluepic_access_token', true);
	?>
	<div class="wrap">
			<h1>Bluepic Settings</h1>
			<p>
				<span style="font-family: monospace;">
					<?php echo $access_token ? 'Authenticated' : 'Not authenticated'; ?>
				</span>
			</p>🏳️‍🌈
			<p>
				<details>
					<summary>Access Token</summary>
					<pre><?php echo $access_token; ?></pre>
				</details>
			</p>
			<a href="<?php echo admin_url('admin-ajax.php?action=bluepic_oauth_redirect'); ?>" class="button button-primary">Authenticate with Bluepic</a>
	</div>
	<?php
}
add_action('admin_menu', function() {
	add_menu_page('Bluepic Settings', 'Bluepic Settings', 'manage_options', 'bluepic-settings', 'bluepic_add_oauth_button');
});

// OAuth-Redirect-Handling
function bluepic_oauth_redirect() {
	$client_id = 'rbTMPrN8E-j6FK6mNqtkS';
	$redirect_uri = urlencode(admin_url('admin-ajax.php?action=bluepic_oauth_callback'));
	$oauth_url = "https://id.staging.bluepic.io/pages/oauth2/authorize?response_type=code&client_id=$client_id&redirect_uri=$redirect_uri";
	
	// Debugging: Überprüfen Sie, ob die URL korrekt ist
	error_log("Redirecting to: " . $oauth_url);
	
	// Weiterleitung zu Bluepic OAuth URL
	wp_redirect($oauth_url);
	exit;
}
add_action('wp_ajax_bluepic_oauth_redirect', 'bluepic_oauth_redirect');

// OAuth-Callback-Handling
function bluepic_oauth_callback() {
	$client_id = 'rbTMPrN8E-j6FK6mNqtkS';
	$client_secret = 'YOUR_BLUEPIC_CLIENT_SECRET';
	$code = $_GET['code'];
	$redirect_uri = admin_url('admin-ajax.php?action=bluepic_oauth_callback');


	$response = wp_remote_post("https://bluepic-oauth2.bluepic.workers.dev/api/v1/authorizationRequest/$code/authorize", array(
			'body' => array(
					'grant_type' => 'authorization_code',
					'client_id' => $client_id,
					'client_secret' => $client_secret,
					'code' => $code,
					'redirect_uri' => $redirect_uri,
			),
	));

	if (is_wp_error($response)) {
			wp_die('Error during authentication.');
	}

	$body = json_decode(wp_remote_retrieve_body($response), true);
	$access_token = $body['signedJWT'];

	update_user_meta(get_current_user_id(), 'bluepic_access_token', $access_token);
	wp_redirect(admin_url());
	exit;
}
add_action('wp_ajax_bluepic_oauth_callback', 'bluepic_oauth_callback');

// Bluepic-Projekte über WP REST API abrufen
function get_bluepic_projects() {
	$access_token = get_user_meta(get_current_user_id(), 'bluepic_access_token', true);

	if (!$access_token) {
			return new WP_Error('no_token', 'No access token available', array('status' => 401));
	}

	$response = wp_remote_get('https://api.bluepic.com/projects', array(
			'headers' => array(
					'Authorization' => 'Bearer ' . $access_token,
			),
	));

	if (is_wp_error($response)) {
			return new WP_Error('bluepic_error', 'Could not retrieve projects', array('status' => 500));
	}

	$projects = json_decode(wp_remote_retrieve_body($response), true);
	return rest_ensure_response($projects);
}

add_action('rest_api_init', function () {
	register_rest_route('bluepic/v1', '/projects', array(
			'methods' => 'GET',
			'callback' => 'get_bluepic_projects',
			'permission_callback' => function () {
					return current_user_can('edit_posts');
			}
	));
});