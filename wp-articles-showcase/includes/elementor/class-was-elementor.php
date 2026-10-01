<?php
/**
 * Intégration Elementor pour WP Articles Showcase
 *
 * @package WP_Articles_Showcase
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class WAS_Elementor {

    /**
     * Initialisation
     */
    public static function init() {
        // Enregistrement de la catégorie de widgets
        add_action( 'elementor/elements/categories_registered', array( __CLASS__, 'register_category' ) );

        // Enregistrement du widget pour Elementor 3.5+
        add_action( 'elementor/widgets/register', array( __CLASS__, 'register_widgets' ) );

        // Rétrocompatibilité avec les versions antérieures d'Elementor
        add_action( 'elementor/widgets/widgets_registered', array( __CLASS__, 'register_widgets_legacy' ) );
    }

    /**
     * Ajouter une catégorie dédiée dans le panneau Elementor
     */
    public static function register_category( $elements_manager ) {
        $elements_manager->add_category(
            'was-elements',
            array(
                'title' => esc_html__( 'Articles Showcase Pro', 'wp-articles-showcase' ),
                'icon'  => 'fa fa-plug',
            )
        );
    }

    /**
     * Enregistrer le widget (Elementor 3.5+)
     */
    public static function register_widgets( $widgets_manager ) {
        require_once WAS_PLUGIN_DIR . 'includes/elementor/class-was-elementor-widget.php';
        $widgets_manager->register( new \WAS_Elementor_Articles_Widget() );
    }

    /**
     * Rétrocompatibilité Elementor < 3.5
     */
    public static function register_widgets_legacy( $widgets_manager ) {
        if ( ! method_exists( $widgets_manager, 'register' ) ) {
            require_once WAS_PLUGIN_DIR . 'includes/elementor/class-was-elementor-widget.php';
            $widgets_manager->register_widget_type( new \WAS_Elementor_Articles_Widget() );
        }
    }
}

WAS_Elementor::init();
