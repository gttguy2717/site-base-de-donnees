<?php
/**
 * Gestionnaire de shortcode pour WP Articles Showcase
 *
 * @package WP_Articles_Showcase
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class WAS_Shortcode {

    /**
     * Initialisation du shortcode
     */
    public static function init() {
        add_shortcode( 'wp_articles', array( __CLASS__, 'render_shortcode' ) );
        add_shortcode( 'articles_showcase', array( __CLASS__, 'render_shortcode' ) );
    }

    /**
     * Rendu du shortcode [wp_articles]
     *
     * @param array $atts Attributs utilisateur du shortcode
     * @return string HTML généré
     */
    public static function render_shortcode( $atts ) {
        // Enqueue assets uniquement lorsque le shortcode est présent sur la page
        wp_enqueue_style( 'was-frontend-style' );
        wp_enqueue_script( 'was-frontend-script' );

        // Valeurs par défaut combinées avec les attributs utilisateur
        $args = shortcode_atts(
            array(
                'layout'            => 'grid',          // grid, list, slider, masonry
                'posts_per_page'    => 6,
                'columns'           => 3,               // 1, 2, 3, 4, 5, 6
                'category'          => '',              // slug(s) séparés par virgule
                'tag'               => '',              // slug(s)
                'author'            => '',              // ID ou login
                'offset'            => 0,
                'exclude'           => '',
                'orderby'           => 'date',          // date, title, comment_count, rand, modified
                'order'             => 'DESC',          // DESC, ASC
                'post_type'         => 'post',
                'title_tag'         => 'h3',
                'show_image'        => 'true',
                'image_size'        => 'medium_large',
                'hover_effect'      => 'zoom-in',
                'show_category'     => 'true',
                'badge_position'    => 'top-left',
                'show_date'         => 'true',
                'show_author'       => 'true',
                'show_avatar'       => 'true',
                'avatar_size'       => 32,
                'show_reading_time' => 'true',
                'show_comments'     => 'false',
                'show_excerpt'      => 'true',
                'excerpt_length'    => 20,
                'show_readmore'     => 'true',
                'readmore_text'     => __( 'Lire l’article', 'wp-articles-showcase' ),
                'pagination'        => 'none',          // none, numeric, load_more
                'theme'             => 'modern',        // modern, card-glass, minimal
                'equal_height'      => 'false',
                'slider_autoplay'   => 'false',
                'slider_speed'      => 4000,
                'class'             => '',
            ),
            $atts,
            'wp_articles'
        );

        // Nettoyage et typage strict
        $posts_per_page = intval( $args['posts_per_page'] );
        if ( $posts_per_page <= 0 ) {
            $posts_per_page = 6;
        }

        $columns = intval( $args['columns'] );
        if ( $columns < 1 || $columns > 6 ) {
            $columns = 3;
        }

        $layout = in_array( $args['layout'], array( 'grid', 'list', 'slider', 'masonry' ), true ) ? $args['layout'] : 'grid';
        $theme  = in_array( $args['theme'], array( 'modern', 'card-glass', 'minimal' ), true ) ? $args['theme'] : 'modern';

        // Construction de la requête WP_Query
        $paged = 1;
        if ( 'numeric' === $args['pagination'] ) {
            $paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : ( ( get_query_var( 'page' ) ) ? get_query_var( 'page' ) : 1 );
        }

        $query_args = array(
            'post_type'           => sanitize_key( $args['post_type'] ),
            'post_status'         => 'publish',
            'posts_per_page'      => $posts_per_page,
            'paged'               => $paged,
            'orderby'             => sanitize_key( $args['orderby'] ),
            'order'               => strtoupper( $args['order'] ) === 'ASC' ? 'ASC' : 'DESC',
            'ignore_sticky_posts' => true,
        );

        // Offset
        if ( ! empty( $args['offset'] ) && intval( $args['offset'] ) > 0 ) {
            $query_args['offset'] = intval( $args['offset'] );
        }

        // Exclusion d'articles
        if ( ! empty( $args['exclude'] ) ) {
            $exclude_ids = array_map( 'absint', explode( ',', $args['exclude'] ) );
            $query_args['post__not_in'] = $exclude_ids;
        }

        // Auteur
        if ( ! empty( $args['author'] ) ) {
            $query_args['author_name'] = sanitize_text_field( $args['author'] );
        }

        // Filtre Catégorie
        if ( ! empty( $args['category'] ) ) {
            $categories = array_map( 'trim', explode( ',', $args['category'] ) );
            $query_args['category_name'] = implode( ',', $categories );
        }

        // Filtre Tag
        if ( ! empty( $args['tag'] ) ) {
            $tags = array_map( 'trim', explode( ',', $args['tag'] ) );
            $query_args['tag'] = implode( ',', $tags );
        }

        // Exécution de WP_Query
        $articles_query = new WP_Query( $query_args );

        if ( ! $articles_query->have_posts() ) {
            return '<div class="was-no-posts">' . esc_html__( 'Aucun article trouvé pour le moment.', 'wp-articles-showcase' ) . '</div>';
        }

        // ID unique pour le conteneur du showcase
        $instance_id = 'was-' . wp_generate_uuid4();

        // Classes CSS du conteneur
        $container_classes = array(
            'was-showcase-container',
            'was-layout-' . esc_attr( $layout ),
            'was-theme-' . esc_attr( $theme ),
            'was-cols-' . esc_attr( $columns ),
        );
        if ( 'true' === $args['equal_height'] ) {
            $container_classes[] = 'was-equal-height';
        }
        if ( ! empty( $args['class'] ) ) {
            $container_classes[] = sanitize_html_class( $args['class'] );
        }

        // Attributs pour le Slider ou AJAX
        $data_attrs = array();
        if ( 'slider' === $layout ) {
            $data_attrs[] = 'data-autoplay="' . esc_attr( $args['slider_autoplay'] ) . '"';
            $data_attrs[] = 'data-speed="' . esc_attr( intval( $args['slider_speed'] ) ) . '"';
            $data_attrs[] = 'data-columns="' . esc_attr( $columns ) . '"';
        }

        if ( 'load_more' === $args['pagination'] ) {
            // Encode les paramètres de requête en JSON sécurisé pour l'AJAX
            $safe_ajax_params = array(
                'query_args' => $query_args,
                'display'    => array(
                    'layout'            => $layout,
                    'theme'             => $theme,
                    'columns'           => $columns,
                    'title_tag'         => $args['title_tag'],
                    'show_image'        => $args['show_image'],
                    'image_size'        => $args['image_size'],
                    'hover_effect'      => $args['hover_effect'],
                    'show_category'     => $args['show_category'],
                    'badge_position'    => $args['badge_position'],
                    'show_date'         => $args['show_date'],
                    'show_author'       => $args['show_author'],
                    'show_avatar'       => $args['show_avatar'],
                    'avatar_size'       => $args['avatar_size'],
                    'show_reading_time' => $args['show_reading_time'],
                    'show_comments'     => $args['show_comments'],
                    'show_excerpt'      => $args['show_excerpt'],
                    'excerpt_length'    => intval( $args['excerpt_length'] ),
                    'show_readmore'     => $args['show_readmore'],
                    'readmore_text'     => $args['readmore_text'],
                ),
            );
            $data_attrs[] = 'data-ajax-params="' . esc_attr( wp_json_encode( $safe_ajax_params ) ) . '"';
            $data_attrs[] = 'data-paged="1"';
            $data_attrs[] = 'data-max-pages="' . esc_attr( $articles_query->max_num_pages ) . '"';
        }

        ob_start();
        ?>
        <div id="<?php echo esc_attr( $instance_id ); ?>" class="<?php echo esc_attr( implode( ' ', $container_classes ) ); ?>" <?php echo implode( ' ', $data_attrs ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
            
            <?php if ( 'slider' === $layout ) : ?>
                <div class="was-slider-viewport">
                    <div class="was-slider-track">
            <?php else : ?>
                <div class="was-items-grid">
            <?php endif; ?>

            <?php
            while ( $articles_query->have_posts() ) :
                $articles_query->the_post();
                self::render_article_card( $args, $layout );
            endwhile;
            ?>

            <?php if ( 'slider' === $layout ) : ?>
                    </div><!-- .was-slider-track -->
                </div><!-- .was-slider-viewport -->

                <!-- Slider Controls -->
                <div class="was-slider-controls">
                    <button type="button" class="was-slider-btn was-slider-prev" aria-label="<?php esc_attr_e( 'Article précédent', 'wp-articles-showcase' ); ?>">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <div class="was-slider-dots"></div>
                    <button type="button" class="was-slider-btn was-slider-next" aria-label="<?php esc_attr_e( 'Article suivant', 'wp-articles-showcase' ); ?>">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            <?php else : ?>
                </div><!-- .was-items-grid -->
            <?php endif; ?>

            <?php
            // Pagination Numeric
            if ( 'numeric' === $args['pagination'] && $articles_query->max_num_pages > 1 ) :
                $big = 999999999;
                $pagination_links = paginate_links( array(
                    'base'      => str_replace( $big, '%#%', esc_url( get_pagenum_link( $big ) ) ),
                    'format'    => '?paged=%#%',
                    'current'   => max( 1, $paged ),
                    'total'     => $articles_query->max_num_pages,
                    'prev_text' => '&laquo; ' . esc_html__( 'Précédent', 'wp-articles-showcase' ),
                    'next_text' => esc_html__( 'Suivant', 'wp-articles-showcase' ) . ' &raquo;',
                    'type'      => 'list',
                ) );
                if ( $pagination_links ) :
                    echo '<nav class="was-pagination-numeric" aria-label="' . esc_attr__( 'Navigation des articles', 'wp-articles-showcase' ) . '">' . $pagination_links . '</nav>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                endif;
            endif;

            // Pagination AJAX "Charger plus"
            if ( 'load_more' === $args['pagination'] && $articles_query->max_num_pages > 1 ) :
                ?>
                <div class="was-load-more-wrapper">
                    <button type="button" class="was-btn-load-more" data-target="#<?php echo esc_attr( $instance_id ); ?>">
                        <span class="was-btn-text"><?php esc_html_e( 'Charger plus d’articles', 'wp-articles-showcase' ); ?></span>
                        <span class="was-spinner" aria-hidden="true"></span>
                    </button>
                </div>
                <?php
            endif;
            ?>

        </div><!-- #<?php echo esc_attr( $instance_id ); ?> -->
        <?php

        // Réinitialisation de la variable globale $post
        wp_reset_postdata();

        return ob_get_clean();
    }

    /**
     * Rendu d'une carte d'article individuelle
     *
     * @param array  $args   Attributs d'affichage
     * @param string $layout Style de disposition
     */
    public static function render_article_card( $args, $layout = 'grid' ) {
        $post_id         = get_the_ID();
        $permalink       = get_permalink();
        $title           = get_the_title();
        $has_thumbnail   = has_post_thumbnail( $post_id );
        $image_size      = ! empty( $args['image_size'] ) ? sanitize_key( $args['image_size'] ) : 'medium_large';
        $excerpt_length  = isset( $args['excerpt_length'] ) ? intval( $args['excerpt_length'] ) : 20;
        $readmore_text   = ! empty( $args['readmore_text'] ) ? $args['readmore_text'] : __( 'Lire l’article', 'wp-articles-showcase' );

        // Calcul du temps de lecture estimé (base 200 mots/min)
        $reading_time = self::get_estimated_reading_time( get_the_content() );

        // Récupération de la première catégorie
        $category_name = '';
        $category_link = '';
        $categories    = get_the_category( $post_id );
        if ( ! empty( $categories ) ) {
            $category_name = $categories[0]->name;
            $category_link = get_category_link( $categories[0]->term_id );
        }

        // Template selector
        $template_file = WAS_PLUGIN_DIR . 'includes/templates/item-' . ( 'list' === $layout ? 'list.php' : 'grid.php' );
        if ( file_exists( $template_file ) ) {
            include $template_file;
        }
    }

    /**
     * Estimer le temps de lecture
     *
     * @param string $content Contenu complet du post
     * @return string
     */
    public static function get_estimated_reading_time( $content ) {
        $clean_content = wp_strip_all_tags( $content );
        $word_count    = count( preg_split( '/\s+/', trim( $clean_content ) ) );
        $minutes       = max( 1, (int) ceil( $word_count / 200 ) );
        return sprintf(
            /* translators: %d: nombre de minutes */
            _n( '%d min de lecture', '%d min de lecture', $minutes, 'wp-articles-showcase' ),
            $minutes
        );
    }
}

WAS_Shortcode::init();
