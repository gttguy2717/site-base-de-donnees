<?php
/**
 * Plugin Name:       WP Articles Showcase Pro
 * Plugin URI:        https://wordpress.org/plugins/wp-articles-showcase/
 * Description:       Affichez vos articles de manière élégante, ultra-rapide et responsive : Grilles dynamiques, Listes magazine, Carrousels tactiles, badges de catégories, temps de lecture estimé et pagination AJAX "Charger plus".
 * Version:           1.0.0
 * Author:            Pro Studio Dev
 * Author URI:        https://wordpress.org/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       wp-articles-showcase
 * Domain Path:       /languages
 * Requires at least: 5.8
 * Requires PHP:      7.4
 */

// Sécurité : interdire l'accès direct aux fichiers
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Constantes globales du plugin
define( 'WAS_VERSION', '1.0.0' );
define( 'WAS_PLUGIN_FILE', __FILE__ );
define( 'WAS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WAS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WAS_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Classe principale d'initialisation du plugin
 */
final class WP_Articles_Showcase {

    /**
     * Instance unique (Singleton)
     */
    private static $instance = null;

    /**
     * Obtenir l'instance unique
     */
    public static function instance() {
        if ( is_null( self::$instance ) ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructeur
     */
    private function __construct() {
        $this->load_dependencies();
        $this->init_hooks();
    }

    /**
     * Charger les fichiers requis
     */
    private function load_dependencies() {
        require_once WAS_PLUGIN_DIR . 'includes/class-was-shortcode.php';
        require_once WAS_PLUGIN_DIR . 'includes/class-was-ajax.php';
        require_once WAS_PLUGIN_DIR . 'includes/elementor/class-was-elementor.php';
        if ( is_admin() ) {
            require_once WAS_PLUGIN_DIR . 'includes/class-was-admin.php';
        }
    }

    /**
     * Initialiser les hooks WordPress
     */
    private function init_hooks() {
        // Chargement du domaine de traduction i18n
        add_action( 'init', array( $this, 'load_textdomain' ) );

        // Enregistrement des scripts et styles publics
        add_action( 'wp_enqueue_scripts', array( $this, 'register_assets' ) );

        // Liens d'action sur la page des extensions WordPress
        add_filter( 'plugin_action_links_' . WAS_PLUGIN_BASENAME, array( $this, 'add_action_links' ) );
    }

    /**
     * Charger les traductions
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'wp-articles-showcase',
            false,
            dirname( WAS_PLUGIN_BASENAME ) . '/languages'
        );
    }

    /**
     * Déclarer les scripts et styles (enregistrés, enqueued sur demande ou selon shortcode)
     */
    public function register_assets() {
        // Style Front-End
        wp_register_style(
            'was-frontend-style',
            WAS_PLUGIN_URL . 'assets/css/frontend.css',
            array(),
            WAS_VERSION
        );

        // Script Front-End
        wp_register_script(
            'was-frontend-script',
            WAS_PLUGIN_URL . 'assets/js/frontend.js',
            array(),
            WAS_VERSION,
            true
        );

        // Données localisées pour le script (AJAX url, nonce, traductions)
        wp_localize_script(
            'was-frontend-script',
            'wasData',
            array(
                'ajaxUrl'  => admin_url( 'admin-ajax.php' ),
                'ajaxNonce'=> wp_create_nonce( 'was_ajax_nonce' ),
                'loading'  => esc_html__( 'Chargement en cours...', 'wp-articles-showcase' ),
                'noMore'   => esc_html__( 'Tous les articles sont affichés', 'wp-articles-showcase' ),
            )
        );
    }

    /**
     * Ajouter un lien vers le générateur de shortcodes dans la liste des extensions
     */
    public function add_action_links( $links ) {
        $settings_link = sprintf(
            '<a href="%s" style="font-weight:600; color:#2271b1;">%s</a>',
            esc_url( admin_url( 'admin.php?page=wp-articles-showcase' ) ),
            esc_html__( 'Générateur de Shortcodes', 'wp-articles-showcase' )
        );
        array_unshift( $links, $settings_link );
        return $links;
    }
}

/**
 * Lancer le plugin
 */
function was_init() {
    return WP_Articles_Showcase::instance();
}
add_action( 'plugins_loaded', 'was_init' );
