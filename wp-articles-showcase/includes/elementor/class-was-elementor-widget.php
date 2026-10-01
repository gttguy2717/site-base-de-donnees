<?php
/**
 * Widget Elementor Avancé - Articles Showcase Pro
 * Contrôle visuel total de la disposition, de la requête et de tous les styles graphiques.
 *
 * @package WP_Articles_Showcase
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

use Elementor\Widget_Base;
use Elementor\Controls_Manager;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Background;

class WAS_Elementor_Articles_Widget extends Widget_Base {

    /**
     * Identifiant unique du widget
     */
    public function get_name() {
        return 'was_articles_showcase';
    }

    /**
     * Titre dans Elementor
     */
    public function get_title() {
        return esc_html__( 'Articles Showcase Pro', 'wp-articles-showcase' );
    }

    /**
     * Icône du widget
     */
    public function get_icon() {
        return 'eicon-posts-grid';
    }

    /**
     * Catégorie dans le panneau Elementor
     */
    public function get_categories() {
        return array( 'was-elements', 'general' );
    }

    /**
     * Mots-clés de recherche
     */
    public function get_keywords() {
        return array( 'articles', 'posts', 'blog', 'grille', 'slider', 'carrousel', 'showcase', 'news', 'magazine' );
    }

    /**
     * Liste dynamique des catégories
     */
    private function get_post_categories() {
        $options = array( '' => esc_html__( 'Toutes les catégories', 'wp-articles-showcase' ) );
        $categories = get_categories( array( 'hide_empty' => false ) );
        if ( ! empty( $categories ) && ! is_wp_error( $categories ) ) {
            foreach ( $categories as $category ) {
                $options[ $category->slug ] = $category->name . ' (' . $category->count . ')';
            }
        }
        return $options;
    }

    /**
     * Liste dynamique des types de publication publics
     */
    private function get_public_post_types() {
        $options = array( 'post' => esc_html__( 'Articles (post)', 'wp-articles-showcase' ) );
        $post_types = get_post_types( array( 'public' => true ), 'objects' );
        foreach ( $post_types as $pt ) {
            if ( ! in_array( $pt->name, array( 'attachment', 'elementor_library' ), true ) ) {
                $options[ $pt->name ] = $pt->label . ' (' . $pt->name . ')';
            }
        }
        return $options;
    }

    /**
     * Déclaration de l'ensemble des contrôles (Contenu + Style)
     */
    protected function register_controls() {

        /* ==========================================================================
           1. ONGLET CONTENU : DISPOSITION & COLONNES RESPONSIVES
           ========================================================================== */
        $this->start_controls_section(
            'section_layout',
            array(
                'label' => esc_html__( 'Mise en page (Layout)', 'wp-articles-showcase' ),
                'tab'   => Controls_Manager::TAB_CONTENT,
            )
        );

        $this->add_control(
            'layout',
            array(
                'label'   => esc_html__( 'Type de disposition', 'wp-articles-showcase' ),
                'type'    => Controls_Manager::SELECT,
                'default' => 'grid',
                'options' => array(
                    'grid'   => esc_html__( 'Grille moderne (Grid)', 'wp-articles-showcase' ),
                    'list'   => esc_html__( 'Liste magazine (List)', 'wp-articles-showcase' ),
                    'slider' => esc_html__( 'Carrousel tactile (Slider)', 'wp-articles-showcase' ),
                ),
            )
        );

        // Colonnes Responsives avec injection CSS directe
        $this->add_responsive_control(
            'columns',
            array(
                'label'          => esc_html__( 'Nombre de colonnes', 'wp-articles-showcase' ),
                'type'           => Controls_Manager::SELECT,
                'default'        => '3',
                'tablet_default' => '2',
                'mobile_default' => '1',
                'options'        => array(
                    '1' => '1 ' . esc_html__( 'Colonne', 'wp-articles-showcase' ),
                    '2' => '2 ' . esc_html__( 'Colonnes', 'wp-articles-showcase' ),
                    '3' => '3 ' . esc_html__( 'Colonnes', 'wp-articles-showcase' ),
                    '4' => '4 ' . esc_html__( 'Colonnes', 'wp-articles-showcase' ),
                    '5' => '5 ' . esc_html__( 'Colonnes', 'wp-articles-showcase' ),
                    '6' => '6 ' . esc_html__( 'Colonnes', 'wp-articles-showcase' ),
                ),
                'selectors'      => array(
                    '{{WRAPPER}} .was-items-grid' => 'grid-template-columns: repeat({{VALUE}}, 1fr) !important;',
                ),
                'condition'      => array(
                    'layout!' => 'list',
                ),
            )
        );

        // Espacement horizontal (Column Gap)
        $this->add_responsive_control(
            'column_gap',
            array(
                'label'      => esc_html__( 'Espacement des colonnes (Gap)', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::SLIDER,
                'size_units' => array( 'px', 'em', 'rem' ),
                'range'      => array(
                    'px' => array( 'min' => 0, 'max' => 60 ),
                ),
                'default'    => array( 'unit' => 'px', 'size' => 24 ),
                'selectors'  => array(
                    '{{WRAPPER}} .was-items-grid' => 'column-gap: {{SIZE}}{{UNIT}} !important;',
                ),
            )
        );

        // Espacement vertical (Row Gap)
        $this->add_responsive_control(
            'row_gap',
            array(
                'label'      => esc_html__( 'Espacement des lignes (Row Gap)', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::SLIDER,
                'size_units' => array( 'px', 'em', 'rem' ),
                'range'      => array(
                    'px' => array( 'min' => 0, 'max' => 80 ),
                ),
                'default'    => array( 'unit' => 'px', 'size' => 30 ),
                'selectors'  => array(
                    '{{WRAPPER}} .was-items-grid' => 'row-gap: {{SIZE}}{{UNIT}} !important;',
                ),
            )
        );

        // Cartes de même hauteur (Equal Height)
        $this->add_control(
            'equal_height',
            array(
                'label'        => esc_html__( 'Hauteur égale pour toutes les cartes', 'wp-articles-showcase' ),
                'type'         => Controls_Manager::SWITCHER,
                'label_on'     => esc_html__( 'Oui', 'wp-articles-showcase' ),
                'label_off'    => esc_html__( 'Non', 'wp-articles-showcase' ),
                'return_value' => 'true',
                'default'      => 'true',
            )
        );

        $this->end_controls_section();

        /* ==========================================================================
           2. ONGLET CONTENU : REQUÊTE & FILTRES (QUERY)
           ========================================================================== */
        $this->start_controls_section(
            'section_query',
            array(
                'label' => esc_html__( 'Requête & Filtres (Query)', 'wp-articles-showcase' ),
                'tab'   => Controls_Manager::TAB_CONTENT,
            )
        );

        $this->add_control(
            'post_type',
            array(
                'label'   => esc_html__( 'Type de contenu (Post Type)', 'wp-articles-showcase' ),
                'type'    => Controls_Manager::SELECT,
                'default' => 'post',
                'options' => $this->get_public_post_types(),
            )
        );

        $this->add_control(
            'posts_per_page',
            array(
                'label'   => esc_html__( 'Nombre total d’articles à charger', 'wp-articles-showcase' ),
                'type'    => Controls_Manager::NUMBER,
                'min'     => 1,
                'max'     => 100,
                'step'    => 1,
                'default' => 6,
            )
        );

        $this->add_control(
            'category',
            array(
                'label'       => esc_html__( 'Filtrer par catégorie', 'wp-articles-showcase' ),
                'type'        => Controls_Manager::SELECT,
                'options'     => $this->get_post_categories(),
                'default'     => '',
                'description' => esc_html__( 'Laissez vide pour afficher toutes les catégories.', 'wp-articles-showcase' ),
            )
        );

        $this->add_control(
            'offset',
            array(
                'label'       => esc_html__( 'Décalage (Offset)', 'wp-articles-showcase' ),
                'type'        => Controls_Manager::NUMBER,
                'min'         => 0,
                'max'         => 50,
                'default'     => 0,
                'description' => esc_html__( 'Permet d’ignorer les X premiers articles (ex: pour sauter l’article en vedette).', 'wp-articles-showcase' ),
            )
        );

        $this->add_control(
            'orderby',
            array(
                'label'   => esc_html__( 'Trier par', 'wp-articles-showcase' ),
                'type'    => Controls_Manager::SELECT,
                'default' => 'date',
                'options' => array(
                    'date'          => esc_html__( 'Date de publication (Récent)', 'wp-articles-showcase' ),
                    'modified'      => esc_html__( 'Date de dernière modification', 'wp-articles-showcase' ),
                    'title'         => esc_html__( 'Titre alphabétique', 'wp-articles-showcase' ),
                    'comment_count' => esc_html__( 'Popularité (Nb commentaires)', 'wp-articles-showcase' ),
                    'rand'          => esc_html__( 'Ordre aléatoire', 'wp-articles-showcase' ),
                ),
            )
        );

        $this->add_control(
            'order',
            array(
                'label'   => esc_html__( 'Sens du tri', 'wp-articles-showcase' ),
                'type'    => Controls_Manager::SELECT,
                'default' => 'DESC',
                'options' => array(
                    'DESC' => esc_html__( 'Décroissant (DESC)', 'wp-articles-showcase' ),
                    'ASC'  => esc_html__( 'Croissant (ASC)', 'wp-articles-showcase' ),
                ),
            )
        );

        $this->add_control(
            'exclude',
            array(
                'label'       => esc_html__( 'Exclure des articles (IDs)', 'wp-articles-showcase' ),
                'type'        => Controls_Manager::TEXT,
                'placeholder' => '12, 45, 98',
                'description' => esc_html__( 'IDs séparés par des virgules.', 'wp-articles-showcase' ),
            )
        );

        $this->end_controls_section();

        /* ==========================================================================
           3. ONGLET CONTENU : ÉLÉMENTS DE CONTENU
           ========================================================================== */
        $this->start_controls_section(
            'section_elements',
            array(
                'label' => esc_html__( 'Éléments de contenu', 'wp-articles-showcase' ),
                'tab'   => Controls_Manager::TAB_CONTENT,
            )
        );

        // Balise HTML du titre
        $this->add_control(
            'title_tag',
            array(
                'label'   => esc_html__( 'Balise HTML du Titre', 'wp-articles-showcase' ),
                'type'    => Controls_Manager::SELECT,
                'default' => 'h3',
                'options' => array(
                    'h1'   => 'H1',
                    'h2'   => 'H2',
                    'h3'   => 'H3',
                    'h4'   => 'H4',
                    'h5'   => 'H5',
                    'h6'   => 'H6',
                    'div'  => 'div',
                    'span' => 'span',
                    'p'    => 'p',
                ),
            )
        );

        // Image à la une
        $this->add_control(
            'show_image',
            array(
                'label'        => esc_html__( 'Image à la une', 'wp-articles-showcase' ),
                'type'         => Controls_Manager::SWITCHER,
                'label_on'     => esc_html__( 'Oui', 'wp-articles-showcase' ),
                'label_off'    => esc_html__( 'Non', 'wp-articles-showcase' ),
                'return_value' => 'true',
                'default'      => 'true',
            )
        );

        $this->add_control(
            'image_size',
            array(
                'label'     => esc_html__( 'Taille de l’image WP', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::SELECT,
                'default'   => 'medium_large',
                'options'   => array(
                    'thumbnail'    => esc_html__( 'Miniature (Thumbnail)', 'wp-articles-showcase' ),
                    'medium'       => esc_html__( 'Moyenne (Medium)', 'wp-articles-showcase' ),
                    'medium_large' => esc_html__( 'Moyenne supérieure (Medium Large)', 'wp-articles-showcase' ),
                    'large'        => esc_html__( 'Grande (Large)', 'wp-articles-showcase' ),
                    'full'         => esc_html__( 'Taille originale (Full)', 'wp-articles-showcase' ),
                ),
                'condition' => array(
                    'show_image' => 'true',
                ),
            )
        );

        $this->add_control(
            'hover_effect',
            array(
                'label'     => esc_html__( 'Effet de survol de l’image', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::SELECT,
                'default'   => 'zoom-in',
                'options'   => array(
                    'zoom-in'   => esc_html__( 'Zoom avant (Zoom In)', 'wp-articles-showcase' ),
                    'zoom-out'  => esc_html__( 'Zoom arrière (Zoom Out)', 'wp-articles-showcase' ),
                    'grayscale' => esc_html__( 'Noir & Blanc vers Couleur', 'wp-articles-showcase' ),
                    'none'      => esc_html__( 'Aucun effet', 'wp-articles-showcase' ),
                ),
                'condition' => array(
                    'show_image' => 'true',
                ),
            )
        );

        // Badge catégorie
        $this->add_control(
            'show_category',
            array(
                'label'        => esc_html__( 'Badge de catégorie', 'wp-articles-showcase' ),
                'type'         => Controls_Manager::SWITCHER,
                'label_on'     => esc_html__( 'Oui', 'wp-articles-showcase' ),
                'label_off'    => esc_html__( 'Non', 'wp-articles-showcase' ),
                'return_value' => 'true',
                'default'      => 'true',
            )
        );

        $this->add_control(
            'badge_position',
            array(
                'label'     => esc_html__( 'Position du badge', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::SELECT,
                'default'   => 'top-left',
                'options'   => array(
                    'top-left'     => esc_html__( 'En haut à gauche de l’image', 'wp-articles-showcase' ),
                    'top-right'    => esc_html__( 'En haut à droite de l’image', 'wp-articles-showcase' ),
                    'bottom-left'  => esc_html__( 'En bas à gauche de l’image', 'wp-articles-showcase' ),
                    'bottom-right' => esc_html__( 'En bas à droite de l’image', 'wp-articles-showcase' ),
                    'inline'       => esc_html__( 'Au-dessus du titre (Inline)', 'wp-articles-showcase' ),
                ),
                'condition' => array(
                    'show_category' => 'true',
                ),
            )
        );

        // Métadonnées
        $this->add_control(
            'show_date',
            array(
                'label'        => esc_html__( 'Date de publication', 'wp-articles-showcase' ),
                'type'         => Controls_Manager::SWITCHER,
                'label_on'     => esc_html__( 'Oui', 'wp-articles-showcase' ),
                'label_off'    => esc_html__( 'Non', 'wp-articles-showcase' ),
                'return_value' => 'true',
                'default'      => 'true',
            )
        );

        $this->add_control(
            'show_reading_time',
            array(
                'label'        => esc_html__( 'Temps de lecture estimé', 'wp-articles-showcase' ),
                'type'         => Controls_Manager::SWITCHER,
                'label_on'     => esc_html__( 'Oui', 'wp-articles-showcase' ),
                'label_off'    => esc_html__( 'Non', 'wp-articles-showcase' ),
                'return_value' => 'true',
                'default'      => 'true',
            )
        );

        $this->add_control(
            'show_comments',
            array(
                'label'        => esc_html__( 'Nombre de commentaires', 'wp-articles-showcase' ),
                'type'         => Controls_Manager::SWITCHER,
                'label_on'     => esc_html__( 'Oui', 'wp-articles-showcase' ),
                'label_off'    => esc_html__( 'Non', 'wp-articles-showcase' ),
                'return_value' => 'true',
                'default'      => 'false',
            )
        );

        $this->add_control(
            'show_author',
            array(
                'label'        => esc_html__( 'Auteur', 'wp-articles-showcase' ),
                'type'         => Controls_Manager::SWITCHER,
                'label_on'     => esc_html__( 'Oui', 'wp-articles-showcase' ),
                'label_off'    => esc_html__( 'Non', 'wp-articles-showcase' ),
                'return_value' => 'true',
                'default'      => 'true',
            )
        );

        $this->add_control(
            'show_avatar',
            array(
                'label'        => esc_html__( 'Afficher l’avatar de l’auteur', 'wp-articles-showcase' ),
                'type'         => Controls_Manager::SWITCHER,
                'label_on'     => esc_html__( 'Oui', 'wp-articles-showcase' ),
                'label_off'    => esc_html__( 'Non', 'wp-articles-showcase' ),
                'return_value' => 'true',
                'default'      => 'true',
                'condition'    => array(
                    'show_author' => 'true',
                ),
            )
        );

        // Extrait
        $this->add_control(
            'show_excerpt',
            array(
                'label'        => esc_html__( 'Extrait du contenu', 'wp-articles-showcase' ),
                'type'         => Controls_Manager::SWITCHER,
                'label_on'     => esc_html__( 'Oui', 'wp-articles-showcase' ),
                'label_off'    => esc_html__( 'Non', 'wp-articles-showcase' ),
                'return_value' => 'true',
                'default'      => 'true',
            )
        );

        $this->add_control(
            'excerpt_length',
            array(
                'label'     => esc_html__( 'Nombre de mots de l’extrait', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::NUMBER,
                'default'   => 20,
                'min'       => 5,
                'max'       => 100,
                'condition' => array(
                    'show_excerpt' => 'true',
                ),
            )
        );

        // Bouton Lire la suite
        $this->add_control(
            'show_readmore',
            array(
                'label'        => esc_html__( 'Bouton "Lire la suite"', 'wp-articles-showcase' ),
                'type'         => Controls_Manager::SWITCHER,
                'label_on'     => esc_html__( 'Oui', 'wp-articles-showcase' ),
                'label_off'    => esc_html__( 'Non', 'wp-articles-showcase' ),
                'return_value' => 'true',
                'default'      => 'true',
            )
        );

        $this->add_control(
            'readmore_text',
            array(
                'label'     => esc_html__( 'Texte du bouton', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::TEXT,
                'default'   => esc_html__( 'Lire l’article', 'wp-articles-showcase' ),
                'condition' => array(
                    'show_readmore' => 'true',
                ),
            )
        );

        $this->end_controls_section();

        /* ==========================================================================
           4. ONGLET CONTENU : PAGINATION & SLIDER
           ========================================================================== */
        $this->start_controls_section(
            'section_pagination_slider',
            array(
                'label' => esc_html__( 'Pagination & Carrousel', 'wp-articles-showcase' ),
                'tab'   => Controls_Manager::TAB_CONTENT,
            )
        );

        $this->add_control(
            'pagination',
            array(
                'label'     => esc_html__( 'Type de pagination', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::SELECT,
                'default'   => 'none',
                'options'   => array(
                    'none'      => esc_html__( 'Aucune', 'wp-articles-showcase' ),
                    'load_more' => esc_html__( 'Bouton AJAX "Charger plus"', 'wp-articles-showcase' ),
                    'numeric'   => esc_html__( 'Pagination classique (1, 2, 3...)', 'wp-articles-showcase' ),
                ),
                'condition' => array(
                    'layout!' => 'slider',
                ),
            )
        );

        $this->add_control(
            'slider_autoplay',
            array(
                'label'        => esc_html__( 'Défilement automatique (Autoplay)', 'wp-articles-showcase' ),
                'type'         => Controls_Manager::SWITCHER,
                'label_on'     => esc_html__( 'Oui', 'wp-articles-showcase' ),
                'label_off'    => esc_html__( 'Non', 'wp-articles-showcase' ),
                'return_value' => 'true',
                'default'      => 'false',
                'condition'    => array(
                    'layout' => 'slider',
                ),
            )
        );

        $this->add_control(
            'slider_speed',
            array(
                'label'     => esc_html__( 'Vitesse de défilement (ms)', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::NUMBER,
                'default'   => 4000,
                'min'       => 1000,
                'max'       => 10000,
                'step'      => 500,
                'condition' => array(
                    'layout'          => 'slider',
                    'slider_autoplay' => 'true',
                ),
            )
        );

        $this->end_controls_section();

        /* ==========================================================================
           5. ONGLET STYLE : CARTES D'ARTICLES (CARDS)
           ========================================================================== */
        $this->start_controls_section(
            'section_style_card',
            array(
                'label' => esc_html__( 'Cartes d’articles', 'wp-articles-showcase' ),
                'tab'   => Controls_Manager::TAB_STYLE,
            )
        );

        $this->add_responsive_control(
            'card_align',
            array(
                'label'     => esc_html__( 'Alignement du contenu', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::CHOOSE,
                'options'   => array(
                    'left'   => array(
                        'title' => esc_html__( 'Gauche', 'wp-articles-showcase' ),
                        'icon'  => 'eicon-text-align-left',
                    ),
                    'center' => array(
                        'title' => esc_html__( 'Centré', 'wp-articles-showcase' ),
                        'icon'  => 'eicon-text-align-center',
                    ),
                    'right'  => array(
                        'title' => esc_html__( 'Droite', 'wp-articles-showcase' ),
                        'icon'  => 'eicon-text-align-right',
                    ),
                ),
                'selectors' => array(
                    '{{WRAPPER}} .was-card-body'   => 'text-align: {{VALUE}} !important;',
                    '{{WRAPPER}} .was-meta-top'    => 'justify-content: {{VALUE}} !important;',
                    '{{WRAPPER}} .was-card-footer' => 'justify-content: {{VALUE}} !important;',
                ),
            )
        );

        $this->start_controls_tabs( 'tabs_card_style' );

        // Normal
        $this->start_controls_tab(
            'tab_card_normal',
            array(
                'label' => esc_html__( 'Normal', 'wp-articles-showcase' ),
            )
        );

        $this->add_group_control(
            Group_Control_Background::get_type(),
            array(
                'name'     => 'card_bg',
                'types'    => array( 'classic', 'gradient' ),
                'selector' => '{{WRAPPER}} .was-article-card',
            )
        );

        $this->add_group_control(
            Group_Control_Border::get_type(),
            array(
                'name'     => 'card_border',
                'selector' => '{{WRAPPER}} .was-article-card',
            )
        );

        $this->add_group_control(
            Group_Control_Box_Shadow::get_type(),
            array(
                'name'     => 'card_shadow',
                'selector' => '{{WRAPPER}} .was-article-card',
            )
        );

        $this->end_controls_tab();

        // Hover
        $this->start_controls_tab(
            'tab_card_hover',
            array(
                'label' => esc_html__( 'Au Survol (Hover)', 'wp-articles-showcase' ),
            )
        );

        $this->add_group_control(
            Group_Control_Background::get_type(),
            array(
                'name'     => 'card_bg_hover',
                'types'    => array( 'classic', 'gradient' ),
                'selector' => '{{WRAPPER}} .was-article-card:hover',
            )
        );

        $this->add_control(
            'card_border_color_hover',
            array(
                'label'     => esc_html__( 'Couleur de bordure au survol', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-article-card:hover' => 'border-color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_group_control(
            Group_Control_Box_Shadow::get_type(),
            array(
                'name'     => 'card_shadow_hover',
                'selector' => '{{WRAPPER}} .was-article-card:hover',
            )
        );

        $this->add_responsive_control(
            'card_hover_translate_y',
            array(
                'label'      => esc_html__( 'Élévation au survol (Translate Y)', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::SLIDER,
                'size_units' => array( 'px' ),
                'range'      => array(
                    'px' => array( 'min' => -30, 'max' => 10 ),
                ),
                'default'    => array( 'unit' => 'px', 'size' => -4 ),
                'selectors'  => array(
                    '{{WRAPPER}} .was-article-card:hover' => 'transform: translateY({{SIZE}}{{UNIT}}) !important;',
                ),
            )
        );

        $this->end_controls_tab();

        $this->end_controls_tabs();

        $this->add_responsive_control(
            'card_border_radius',
            array(
                'label'      => esc_html__( 'Rayon des coins (Border Radius)', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::DIMENSIONS,
                'size_units' => array( 'px', '%', 'em' ),
                'separator'  => 'before',
                'selectors'  => array(
                    '{{WRAPPER}} .was-article-card' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}} !important;',
                ),
            )
        );

        $this->add_responsive_control(
            'card_padding',
            array(
                'label'      => esc_html__( 'Marge interne (Padding)', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::DIMENSIONS,
                'size_units' => array( 'px', 'em', '%' ),
                'selectors'  => array(
                    '{{WRAPPER}} .was-card-body' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}} !important;',
                ),
            )
        );

        $this->end_controls_section();

        /* ==========================================================================
           6. ONGLET STYLE : IMAGE & SURVOL
           ========================================================================== */
        $this->start_controls_section(
            'section_style_image',
            array(
                'label'     => esc_html__( 'Image à la une', 'wp-articles-showcase' ),
                'tab'       => Controls_Manager::TAB_STYLE,
                'condition' => array(
                    'show_image' => 'true',
                ),
            )
        );

        // Hauteur responsive
        $this->add_responsive_control(
            'image_height',
            array(
                'label'      => esc_html__( 'Hauteur de l’image', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::SLIDER,
                'size_units' => array( 'px', 'vh', '%' ),
                'range'      => array(
                    'px' => array( 'min' => 120, 'max' => 600 ),
                ),
                'selectors'  => array(
                    '{{WRAPPER}} .was-card-media'     => 'padding-top: 0 !important; height: {{SIZE}}{{UNIT}} !important;',
                    '{{WRAPPER}} .was-thumbnail-img' => 'height: 100% !important; object-fit: cover !important;',
                ),
            )
        );

        $this->add_responsive_control(
            'image_border_radius',
            array(
                'label'      => esc_html__( 'Coins arrondis de l’image', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::DIMENSIONS,
                'size_units' => array( 'px', '%' ),
                'selectors'  => array(
                    '{{WRAPPER}} .was-card-media' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}} !important;',
                ),
            )
        );

        $this->add_control(
            'image_overlay_hover',
            array(
                'label'     => esc_html__( 'Voile sombre au survol (Overlay)', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-article-card:hover .was-media-overlay' => 'background-color: {{VALUE}} !important;',
                ),
            )
        );

        $this->end_controls_section();

        /* ==========================================================================
           7. ONGLET STYLE : BADGE DE CATÉGORIE
           ========================================================================== */
        $this->start_controls_section(
            'section_style_badge',
            array(
                'label'     => esc_html__( 'Badge de Catégorie', 'wp-articles-showcase' ),
                'tab'       => Controls_Manager::TAB_STYLE,
                'condition' => array(
                    'show_category' => 'true',
                ),
            )
        );

        $this->add_group_control(
            Group_Control_Typography::get_type(),
            array(
                'name'     => 'badge_typography',
                'selector' => '{{WRAPPER}} .was-category-badge',
            )
        );

        $this->start_controls_tabs( 'tabs_badge_style' );

        $this->start_controls_tab(
            'tab_badge_normal',
            array(
                'label' => esc_html__( 'Normal', 'wp-articles-showcase' ),
            )
        );

        $this->add_control(
            'badge_bg_color',
            array(
                'label'     => esc_html__( 'Couleur d’arrière-plan', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-category-badge' => 'background-color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_control(
            'badge_text_color',
            array(
                'label'     => esc_html__( 'Couleur du texte', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-category-badge' => 'color: {{VALUE}} !important;',
                ),
            )
        );

        $this->end_controls_tab();

        $this->start_controls_tab(
            'tab_badge_hover',
            array(
                'label' => esc_html__( 'Survol', 'wp-articles-showcase' ),
            )
        );

        $this->add_control(
            'badge_bg_color_hover',
            array(
                'label'     => esc_html__( 'Couleur de fond au survol', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-category-badge:hover' => 'background-color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_control(
            'badge_text_color_hover',
            array(
                'label'     => esc_html__( 'Couleur du texte au survol', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-category-badge:hover' => 'color: {{VALUE}} !important;',
                ),
            )
        );

        $this->end_controls_tab();

        $this->end_controls_tabs();

        $this->add_responsive_control(
            'badge_padding',
            array(
                'label'      => esc_html__( 'Marge interne (Padding)', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::DIMENSIONS,
                'size_units' => array( 'px', 'em' ),
                'separator'  => 'before',
                'selectors'  => array(
                    '{{WRAPPER}} .was-category-badge' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}} !important;',
                ),
            )
        );

        $this->add_responsive_control(
            'badge_border_radius',
            array(
                'label'      => esc_html__( 'Arrondi des coins (Radius)', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::DIMENSIONS,
                'size_units' => array( 'px', '%' ),
                'selectors'  => array(
                    '{{WRAPPER}} .was-category-badge' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}} !important;',
                ),
            )
        );

        $this->end_controls_section();

        /* ==========================================================================
           8. ONGLET STYLE : TITRE DE L'ARTICLE
           ========================================================================== */
        $this->start_controls_section(
            'section_style_title',
            array(
                'label' => esc_html__( 'Titre de l’article', 'wp-articles-showcase' ),
                'tab'   => Controls_Manager::TAB_STYLE,
            )
        );

        $this->add_group_control(
            Group_Control_Typography::get_type(),
            array(
                'name'     => 'title_typography',
                'selector' => '{{WRAPPER}} .was-card-title, {{WRAPPER}} .was-card-title a',
            )
        );

        $this->start_controls_tabs( 'tabs_title_style' );

        $this->start_controls_tab(
            'tab_title_normal',
            array(
                'label' => esc_html__( 'Normal', 'wp-articles-showcase' ),
            )
        );

        $this->add_control(
            'title_color',
            array(
                'label'     => esc_html__( 'Couleur du texte', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-card-title a' => 'color: {{VALUE}} !important;',
                ),
            )
        );

        $this->end_controls_tab();

        $this->start_controls_tab(
            'tab_title_hover',
            array(
                'label' => esc_html__( 'Au Survol', 'wp-articles-showcase' ),
            )
        );

        $this->add_control(
            'title_hover_color',
            array(
                'label'     => esc_html__( 'Couleur au survol', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-card-title a:hover' => 'color: {{VALUE}} !important;',
                ),
            )
        );

        $this->end_controls_tab();

        $this->end_controls_tabs();

        $this->add_responsive_control(
            'title_margin_bottom',
            array(
                'label'      => esc_html__( 'Marge sous le titre (Margin Bottom)', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::SLIDER,
                'size_units' => array( 'px', 'em' ),
                'range'      => array(
                    'px' => array( 'min' => 0, 'max' => 50 ),
                ),
                'default'    => array( 'unit' => 'px', 'size' => 14 ),
                'separator'  => 'before',
                'selectors'  => array(
                    '{{WRAPPER}} .was-card-title' => 'margin-bottom: {{SIZE}}{{UNIT}} !important;',
                ),
            )
        );

        $this->end_controls_section();

        /* ==========================================================================
           9. ONGLET STYLE : MÉTADONNÉES (DATE, TEMPS DE LECTURE, COMMENTAIRES)
           ========================================================================== */
        $this->start_controls_section(
            'section_style_meta',
            array(
                'label' => esc_html__( 'Métadonnées (Date, Lecture, Commentaires)', 'wp-articles-showcase' ),
                'tab'   => Controls_Manager::TAB_STYLE,
            )
        );

        $this->add_group_control(
            Group_Control_Typography::get_type(),
            array(
                'name'     => 'meta_typography',
                'selector' => '{{WRAPPER}} .was-meta-top, {{WRAPPER}} .was-meta-item',
            )
        );

        $this->add_control(
            'meta_text_color',
            array(
                'label'     => esc_html__( 'Couleur du texte', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-meta-item' => 'color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_control(
            'meta_icon_color',
            array(
                'label'     => esc_html__( 'Couleur des icônes', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-meta-item svg' => 'color: {{VALUE}} !important; stroke: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_responsive_control(
            'meta_item_gap',
            array(
                'label'      => esc_html__( 'Espacement entre les métadonnées', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::SLIDER,
                'size_units' => array( 'px' ),
                'range'      => array(
                    'px' => array( 'min' => 4, 'max' => 40 ),
                ),
                'selectors'  => array(
                    '{{WRAPPER}} .was-meta-top' => 'gap: {{SIZE}}{{UNIT}} !important;',
                ),
            )
        );

        $this->add_responsive_control(
            'meta_margin_bottom',
            array(
                'label'      => esc_html__( 'Marge sous les métas', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::SLIDER,
                'size_units' => array( 'px' ),
                'range'      => array(
                    'px' => array( 'min' => 0, 'max' => 40 ),
                ),
                'selectors'  => array(
                    '{{WRAPPER}} .was-meta-top' => 'margin-bottom: {{SIZE}}{{UNIT}} !important;',
                ),
            )
        );

        $this->end_controls_section();

        /* ==========================================================================
           10. ONGLET STYLE : EXTRAIT DU TEXTE
           ========================================================================== */
        $this->start_controls_section(
            'section_style_excerpt',
            array(
                'label'     => esc_html__( 'Extrait du texte', 'wp-articles-showcase' ),
                'tab'       => Controls_Manager::TAB_STYLE,
                'condition' => array(
                    'show_excerpt' => 'true',
                ),
            )
        );

        $this->add_group_control(
            Group_Control_Typography::get_type(),
            array(
                'name'     => 'excerpt_typography',
                'selector' => '{{WRAPPER}} .was-card-excerpt, {{WRAPPER}} .was-card-excerpt p',
            )
        );

        $this->add_control(
            'excerpt_color',
            array(
                'label'     => esc_html__( 'Couleur du texte', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-card-excerpt, {{WRAPPER}} .was-card-excerpt p' => 'color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_responsive_control(
            'excerpt_margin_bottom',
            array(
                'label'      => esc_html__( 'Marge inférieure (Margin Bottom)', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::SLIDER,
                'size_units' => array( 'px' ),
                'range'      => array(
                    'px' => array( 'min' => 0, 'max' => 50 ),
                ),
                'default'    => array( 'unit' => 'px', 'size' => 20 ),
                'selectors'  => array(
                    '{{WRAPPER}} .was-card-excerpt' => 'margin-bottom: {{SIZE}}{{UNIT}} !important;',
                ),
            )
        );

        $this->end_controls_section();

        /* ==========================================================================
           11. ONGLET STYLE : AUTEUR & AVATAR
           ========================================================================== */
        $this->start_controls_section(
            'section_style_author',
            array(
                'label'     => esc_html__( 'Auteur & Avatar', 'wp-articles-showcase' ),
                'tab'       => Controls_Manager::TAB_STYLE,
                'condition' => array(
                    'show_author' => 'true',
                ),
            )
        );

        $this->add_group_control(
            Group_Control_Typography::get_type(),
            array(
                'name'     => 'author_typography',
                'selector' => '{{WRAPPER}} .was-author-name',
            )
        );

        $this->add_control(
            'author_color',
            array(
                'label'     => esc_html__( 'Couleur du nom de l’auteur', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-author-name' => 'color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_responsive_control(
            'author_avatar_size',
            array(
                'label'      => esc_html__( 'Taille de l’avatar', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::SLIDER,
                'size_units' => array( 'px' ),
                'range'      => array(
                    'px' => array( 'min' => 20, 'max' => 80 ),
                ),
                'selectors'  => array(
                    '{{WRAPPER}} .was-author-avatar' => 'width: {{SIZE}}{{UNIT}} !important; height: {{SIZE}}{{UNIT}} !important;',
                ),
            )
        );

        $this->add_responsive_control(
            'author_avatar_radius',
            array(
                'label'      => esc_html__( 'Arrondi de l’avatar', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::DIMENSIONS,
                'size_units' => array( 'px', '%' ),
                'selectors'  => array(
                    '{{WRAPPER}} .was-author-avatar' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}} !important;',
                ),
            )
        );

        $this->end_controls_section();

        /* ==========================================================================
           12. ONGLET STYLE : BOUTON "LIRE L'ARTICLE"
           ========================================================================== */
        $this->start_controls_section(
            'section_style_button',
            array(
                'label'     => esc_html__( 'Bouton "Lire l’article"', 'wp-articles-showcase' ),
                'tab'       => Controls_Manager::TAB_STYLE,
                'condition' => array(
                    'show_readmore' => 'true',
                ),
            )
        );

        $this->add_group_control(
            Group_Control_Typography::get_type(),
            array(
                'name'     => 'button_typography',
                'selector' => '{{WRAPPER}} .was-btn-readmore',
            )
        );

        $this->start_controls_tabs( 'tabs_button_style' );

        // Normal
        $this->start_controls_tab(
            'tab_button_normal',
            array(
                'label' => esc_html__( 'Normal', 'wp-articles-showcase' ),
            )
        );

        $this->add_control(
            'button_color',
            array(
                'label'     => esc_html__( 'Couleur du texte & icône', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-btn-readmore' => 'color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_control(
            'button_bg_color',
            array(
                'label'     => esc_html__( 'Couleur d’arrière-plan (Optionnel)', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-btn-readmore' => 'background-color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_group_control(
            Group_Control_Border::get_type(),
            array(
                'name'     => 'button_border',
                'selector' => '{{WRAPPER}} .was-btn-readmore',
            )
        );

        $this->end_controls_tab();

        // Hover
        $this->start_controls_tab(
            'tab_button_hover',
            array(
                'label' => esc_html__( 'Au Survol', 'wp-articles-showcase' ),
            )
        );

        $this->add_control(
            'button_hover_color',
            array(
                'label'     => esc_html__( 'Couleur au survol', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-btn-readmore:hover' => 'color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_control(
            'button_hover_bg_color',
            array(
                'label'     => esc_html__( 'Couleur de fond au survol', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-btn-readmore:hover' => 'background-color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_control(
            'button_hover_border_color',
            array(
                'label'     => esc_html__( 'Couleur de bordure au survol', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-btn-readmore:hover' => 'border-color: {{VALUE}} !important;',
                ),
            )
        );

        $this->end_controls_tab();

        $this->end_controls_tabs();

        $this->add_responsive_control(
            'button_padding',
            array(
                'label'      => esc_html__( 'Marge interne (Padding)', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::DIMENSIONS,
                'size_units' => array( 'px', 'em' ),
                'separator'  => 'before',
                'selectors'  => array(
                    '{{WRAPPER}} .was-btn-readmore' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}} !important;',
                ),
            )
        );

        $this->add_responsive_control(
            'button_border_radius',
            array(
                'label'      => esc_html__( 'Rayon des coins (Border Radius)', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::DIMENSIONS,
                'size_units' => array( 'px', '%' ),
                'selectors'  => array(
                    '{{WRAPPER}} .was-btn-readmore' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}} !important;',
                ),
            )
        );

        $this->end_controls_section();

        /* ==========================================================================
           13. ONGLET STYLE : BOUTON AJAX "CHARGER PLUS"
           ========================================================================== */
        $this->start_controls_section(
            'section_style_loadmore',
            array(
                'label'     => esc_html__( 'Bouton AJAX "Charger plus"', 'wp-articles-showcase' ),
                'tab'       => Controls_Manager::TAB_STYLE,
                'condition' => array(
                    'pagination' => 'load_more',
                ),
            )
        );

        $this->add_group_control(
            Group_Control_Typography::get_type(),
            array(
                'name'     => 'loadmore_typography',
                'selector' => '{{WRAPPER}} .was-btn-load-more',
            )
        );

        $this->start_controls_tabs( 'tabs_loadmore_style' );

        $this->start_controls_tab(
            'tab_loadmore_normal',
            array(
                'label' => esc_html__( 'Normal', 'wp-articles-showcase' ),
            )
        );

        $this->add_control(
            'loadmore_bg_color',
            array(
                'label'     => esc_html__( 'Couleur d’arrière-plan', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-btn-load-more' => 'background-color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_control(
            'loadmore_text_color',
            array(
                'label'     => esc_html__( 'Couleur du texte', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-btn-load-more' => 'color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_group_control(
            Group_Control_Border::get_type(),
            array(
                'name'     => 'loadmore_border',
                'selector' => '{{WRAPPER}} .was-btn-load-more',
            )
        );

        $this->add_group_control(
            Group_Control_Box_Shadow::get_type(),
            array(
                'name'     => 'loadmore_shadow',
                'selector' => '{{WRAPPER}} .was-btn-load-more',
            )
        );

        $this->end_controls_tab();

        $this->start_controls_tab(
            'tab_loadmore_hover',
            array(
                'label' => esc_html__( 'Au Survol', 'wp-articles-showcase' ),
            )
        );

        $this->add_control(
            'loadmore_hover_bg_color',
            array(
                'label'     => esc_html__( 'Couleur de fond au survol', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-btn-load-more:hover' => 'background-color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_control(
            'loadmore_hover_text_color',
            array(
                'label'     => esc_html__( 'Couleur du texte au survol', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-btn-load-more:hover' => 'color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_control(
            'loadmore_hover_border_color',
            array(
                'label'     => esc_html__( 'Couleur de bordure au survol', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-btn-load-more:hover' => 'border-color: {{VALUE}} !important;',
                ),
            )
        );

        $this->end_controls_tab();

        $this->end_controls_tabs();

        $this->add_responsive_control(
            'loadmore_padding',
            array(
                'label'      => esc_html__( 'Marge interne (Padding)', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::DIMENSIONS,
                'size_units' => array( 'px', 'em' ),
                'separator'  => 'before',
                'selectors'  => array(
                    '{{WRAPPER}} .was-btn-load-more' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}} !important;',
                ),
            )
        );

        $this->add_responsive_control(
            'loadmore_border_radius',
            array(
                'label'      => esc_html__( 'Rayon des coins', 'wp-articles-showcase' ),
                'type'       => Controls_Manager::DIMENSIONS,
                'size_units' => array( 'px', '%' ),
                'selectors'  => array(
                    '{{WRAPPER}} .was-btn-load-more' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}} !important;',
                ),
            )
        );

        $this->end_controls_section();

        /* ==========================================================================
           14. ONGLET STYLE : CONTRÔLES DU SLIDER (FLÈCHES & POINTS)
           ========================================================================== */
        $this->start_controls_section(
            'section_style_slider_controls',
            array(
                'label'     => esc_html__( 'Flèches & Points du Carrousel', 'wp-articles-showcase' ),
                'tab'       => Controls_Manager::TAB_STYLE,
                'condition' => array(
                    'layout' => 'slider',
                ),
            )
        );

        $this->add_control(
            'slider_arrow_color',
            array(
                'label'     => esc_html__( 'Couleur des flèches', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-slider-btn' => 'color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_control(
            'slider_arrow_bg',
            array(
                'label'     => esc_html__( 'Fond des flèches', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-slider-btn' => 'background-color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_control(
            'slider_arrow_hover_color',
            array(
                'label'     => esc_html__( 'Flèches au survol (Couleur)', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-slider-btn:hover' => 'color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_control(
            'slider_arrow_hover_bg',
            array(
                'label'     => esc_html__( 'Flèches au survol (Fond)', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-slider-btn:hover' => 'background-color: {{VALUE}} !important; border-color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_control(
            'slider_dot_active_color',
            array(
                'label'     => esc_html__( 'Couleur du point actif (Dot)', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'separator' => 'before',
                'selectors' => array(
                    '{{WRAPPER}} .was-slider-dot.was-dot-active' => 'background-color: {{VALUE}} !important;',
                ),
            )
        );

        $this->add_control(
            'slider_dot_inactive_color',
            array(
                'label'     => esc_html__( 'Couleur des points inactifs', 'wp-articles-showcase' ),
                'type'      => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .was-slider-dot' => 'background-color: {{VALUE}} !important;',
                ),
            )
        );

        $this->end_controls_section();
    }

    /**
     * Rendu HTML du widget sur le frontend et dans l'éditeur Elementor
     */
    protected function render() {
        $settings = $this->get_settings_for_display();

        wp_enqueue_style( 'was-frontend-style' );
        wp_enqueue_script( 'was-frontend-script' );

        // Transformer les réglages Elementor en arguments
        $shortcode_args = array(
            'layout'            => ! empty( $settings['layout'] ) ? $settings['layout'] : 'grid',
            'columns'           => ! empty( $settings['columns'] ) ? $settings['columns'] : '3',
            'posts_per_page'    => ! empty( $settings['posts_per_page'] ) ? $settings['posts_per_page'] : 6,
            'post_type'         => ! empty( $settings['post_type'] ) ? $settings['post_type'] : 'post',
            'category'          => ! empty( $settings['category'] ) ? $settings['category'] : '',
            'offset'            => ! empty( $settings['offset'] ) ? $settings['offset'] : 0,
            'exclude'           => ! empty( $settings['exclude'] ) ? $settings['exclude'] : '',
            'orderby'           => ! empty( $settings['orderby'] ) ? $settings['orderby'] : 'date',
            'order'             => ! empty( $settings['order'] ) ? $settings['order'] : 'DESC',
            'title_tag'         => ! empty( $settings['title_tag'] ) ? $settings['title_tag'] : 'h3',
            'show_image'        => ( isset( $settings['show_image'] ) && 'true' === $settings['show_image'] ) ? 'true' : 'false',
            'image_size'        => ! empty( $settings['image_size'] ) ? $settings['image_size'] : 'medium_large',
            'hover_effect'      => ! empty( $settings['hover_effect'] ) ? $settings['hover_effect'] : 'zoom-in',
            'show_category'     => ( isset( $settings['show_category'] ) && 'true' === $settings['show_category'] ) ? 'true' : 'false',
            'badge_position'    => ! empty( $settings['badge_position'] ) ? $settings['badge_position'] : 'top-left',
            'show_date'         => ( isset( $settings['show_date'] ) && 'true' === $settings['show_date'] ) ? 'true' : 'false',
            'show_reading_time' => ( isset( $settings['show_reading_time'] ) && 'true' === $settings['show_reading_time'] ) ? 'true' : 'false',
            'show_comments'     => ( isset( $settings['show_comments'] ) && 'true' === $settings['show_comments'] ) ? 'true' : 'false',
            'show_author'       => ( isset( $settings['show_author'] ) && 'true' === $settings['show_author'] ) ? 'true' : 'false',
            'show_avatar'       => ( isset( $settings['show_avatar'] ) && 'true' === $settings['show_avatar'] ) ? 'true' : 'false',
            'show_excerpt'      => ( isset( $settings['show_excerpt'] ) && 'true' === $settings['show_excerpt'] ) ? 'true' : 'false',
            'excerpt_length'    => ! empty( $settings['excerpt_length'] ) ? $settings['excerpt_length'] : 20,
            'show_readmore'     => ( isset( $settings['show_readmore'] ) && 'true' === $settings['show_readmore'] ) ? 'true' : 'false',
            'readmore_text'     => ! empty( $settings['readmore_text'] ) ? $settings['readmore_text'] : esc_html__( 'Lire l’article', 'wp-articles-showcase' ),
            'pagination'        => ! empty( $settings['pagination'] ) ? $settings['pagination'] : 'none',
            'equal_height'      => ( isset( $settings['equal_height'] ) && 'true' === $settings['equal_height'] ) ? 'true' : 'false',
            'slider_autoplay'   => ( isset( $settings['slider_autoplay'] ) && 'true' === $settings['slider_autoplay'] ) ? 'true' : 'false',
            'slider_speed'      => ! empty( $settings['slider_speed'] ) ? $settings['slider_speed'] : 4000,
        );

        echo WAS_Shortcode::render_shortcode( $shortcode_args ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

        // Re-déclencher les scripts dans le canevas de prévisualisation en direct d'Elementor
        if ( \Elementor\Plugin::$instance->editor->is_edit_mode() ) {
            ?>
            <script>
            if (typeof initSliders === 'function') {
                initSliders();
            } else {
                document.dispatchEvent(new Event('DOMContentLoaded'));
            }
            </script>
            <?php
        }
    }
}
