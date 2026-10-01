<?php
/**
 * Gestionnaire des requêtes AJAX
 *
 * @package WP_Articles_Showcase
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class WAS_Ajax {

    /**
     * Initialisation des écouteurs AJAX
     */
    public static function init() {
        add_action( 'wp_ajax_was_load_more', array( __CLASS__, 'handle_load_more' ) );
        add_action( 'wp_ajax_nopriv_was_load_more', array( __CLASS__, 'handle_load_more' ) );
    }

    /**
     * Traitement de la requête "Charger plus"
     */
    public static function handle_load_more() {
        // Vérification de sécurité du Nonce
        check_ajax_referer( 'was_ajax_nonce', 'nonce' );

        $paged = isset( $_POST['paged'] ) ? absint( $_POST['paged'] ) : 1;
        $next_paged = $paged + 1;

        if ( empty( $_POST['params'] ) ) {
            wp_send_json_error( array( 'message' => esc_html__( 'Paramètres invalides', 'wp-articles-showcase' ) ) );
        }

        // Décoder les paramètres transmis
        $raw_params = wp_unslash( $_POST['params'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
        $params = json_decode( $raw_params, true );

        if ( ! is_array( $params ) || empty( $params['query_args'] ) || empty( $params['display'] ) ) {
            wp_send_json_error( array( 'message' => esc_html__( 'Structure de données invalide', 'wp-articles-showcase' ) ) );
        }

        $query_args = $params['query_args'];
        $display    = $params['display'];

        // Mise à jour de la page demandée
        $query_args['paged'] = $next_paged;

        // Sécuriser les arguments autorisés dans WP_Query
        $allowed_query_keys = array( 'post_type', 'post_status', 'posts_per_page', 'paged', 'orderby', 'order', 'ignore_sticky_posts', 'category_name', 'tag' );
        $sanitized_query_args = array();
        foreach ( $allowed_query_keys as $key ) {
            if ( isset( $query_args[ $key ] ) ) {
                if ( is_int( $query_args[ $key ] ) ) {
                    $sanitized_query_args[ $key ] = absint( $query_args[ $key ] );
                } else {
                    $sanitized_query_args[ $key ] = sanitize_text_field( $query_args[ $key ] );
                }
            }
        }
        $sanitized_query_args['post_status'] = 'publish';

        $query = new WP_Query( $sanitized_query_args );

        if ( ! $query->have_posts() ) {
            wp_send_json_success( array(
                'html'     => '',
                'has_more' => false,
                'paged'    => $paged,
            ) );
        }

        $layout = isset( $display['layout'] ) ? sanitize_key( $display['layout'] ) : 'grid';

        ob_start();
        while ( $query->have_posts() ) {
            $query->the_post();
            WAS_Shortcode::render_article_card( $display, $layout );
        }
        $html = ob_get_clean();
        wp_reset_postdata();

        $has_more = ( $next_paged < $query->max_num_pages );

        wp_send_json_success( array(
            'html'      => $html,
            'has_more'  => $has_more,
            'paged'     => $next_paged,
            'max_pages' => $query->max_num_pages,
        ) );
    }
}

WAS_Ajax::init();
