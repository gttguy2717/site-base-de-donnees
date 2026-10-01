<?php
/**
 * Interface d'administration et Générateur de Shortcode
 *
 * @package WP_Articles_Showcase
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class WAS_Admin {

    /**
     * Initialisation
     */
    public static function init() {
        add_action( 'admin_menu', array( __CLASS__, 'add_admin_menu' ) );
        add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_admin_assets' ) );
        add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
        add_action( 'wp_head', array( __CLASS__, 'output_custom_css' ), 99 );
    }

    /**
     * Ajouter la page dans le menu latéral WordPress
     */
    public static function add_admin_menu() {
        add_menu_page(
            __( 'Articles Showcase', 'wp-articles-showcase' ),
            __( 'Articles Showcase', 'wp-articles-showcase' ),
            'manage_options',
            'wp-articles-showcase',
            array( __CLASS__, 'render_admin_page' ),
            'dashicons-grid-view',
            26
        );
    }

    /**
     * Déclarer les réglages sauvegardables
     */
    public static function register_settings() {
        register_setting( 'was_settings_group', 'was_custom_css', array(
            'type'              => 'string',
            'sanitize_callback' => 'wp_strip_all_tags',
            'default'           => '',
        ) );
        register_setting( 'was_settings_group', 'was_primary_color', array(
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_hex_color',
            'default'           => '#3b82f6',
        ) );
    }

    /**
     * Charger les styles et scripts de l'administration
     */
    public static function enqueue_admin_assets( $hook ) {
        if ( 'toplevel_page_wp-articles-showcase' !== $hook ) {
            return;
        }

        wp_enqueue_style(
            'was-admin-style',
            WAS_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            WAS_VERSION
        );

        wp_enqueue_script(
            'was-admin-script',
            WAS_PLUGIN_URL . 'assets/js/admin.js',
            array( 'jquery' ),
            WAS_VERSION,
            true
        );
    }

    /**
     * Injecter le CSS personnalisé dans le frontend
     */
    public static function output_custom_css() {
        $custom_css = get_option( 'was_custom_css', '' );
        $primary    = get_option( 'was_primary_color', '#3b82f6' );

        echo "<style id='was-inline-dynamic-css'>\n";
        if ( ! empty( $primary ) ) {
            echo ":root { --was-primary: " . esc_attr( $primary ) . "; --was-primary-hover: " . esc_attr( $primary ) . "ee; }\n";
        }
        if ( ! empty( $custom_css ) ) {
            echo wp_strip_all_tags( $custom_css ) . "\n";
        }
        echo "</style>\n";
    }

    /**
     * Rendu de la page d'administration
     */
    public static function render_admin_page() {
        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }

        // Récupérer les catégories existantes du site pour le sélecteur
        $categories = get_categories( array( 'hide_empty' => false ) );
        $primary_color = get_option( 'was_primary_color', '#3b82f6' );
        $custom_css    = get_option( 'was_custom_css', '' );
        ?>
        <div class="wrap was-admin-wrap">
            <div class="was-admin-header">
                <div class="was-header-brand">
                    <span class="was-logo-badge">PRO</span>
                    <h1><?php esc_html_e( 'WP Articles Showcase', 'wp-articles-showcase' ); ?></h1>
                    <span class="was-version">v<?php echo esc_html( WAS_VERSION ); ?></span>
                </div>
                <p class="was-header-desc">
                    <?php esc_html_e( 'Créez facilement des affichages d’articles ultra-modernes pour votre site (Grilles, Listes, Carrousels). Configurez les options ci-dessous et copiez votre shortcode en un clic.', 'wp-articles-showcase' ); ?>
                </p>
            </div>

            <!-- Onglets de navigation -->
            <div class="was-nav-tabs">
                <button type="button" class="was-tab-btn was-active" data-tab="generator">
                    <span class="dashicons dashicons-forms"></span> <?php esc_html_e( 'Générateur de Shortcodes', 'wp-articles-showcase' ); ?>
                </button>
                <button type="button" class="was-tab-btn" data-tab="settings">
                    <span class="dashicons dashicons-admin-generic"></span> <?php esc_html_e( 'Design & Couleurs', 'wp-articles-showcase' ); ?>
                </button>
                <button type="button" class="was-tab-btn" data-tab="docs">
                    <span class="dashicons dashicons-book"></span> <?php esc_html_e( 'Documentation & Exemples', 'wp-articles-showcase' ); ?>
                </button>
            </div>

            <!-- TAB 1 : GENERATEUR -->
            <div id="was-tab-generator" class="was-tab-content was-active">
                <div class="was-builder-layout">
                    
                    <!-- Colonne gauche : Options -->
                    <div class="was-builder-controls">
                        
                        <!-- Disposition -->
                        <div class="was-control-group">
                            <label class="was-group-title"><?php esc_html_e( 'Disposition (Layout)', 'wp-articles-showcase' ); ?></label>
                            <div class="was-radio-cards">
                                <label class="was-radio-card was-selected">
                                    <input type="radio" name="layout" value="grid" checked>
                                    <span class="dashicons dashicons-grid-view"></span>
                                    <span class="was-card-text"><?php esc_html_e( 'Grille (Grid)', 'wp-articles-showcase' ); ?></span>
                                </label>
                                <label class="was-radio-card">
                                    <input type="radio" name="layout" value="list">
                                    <span class="dashicons dashicons-list-view"></span>
                                    <span class="was-card-text"><?php esc_html_e( 'Liste (List)', 'wp-articles-showcase' ); ?></span>
                                </label>
                                <label class="was-radio-card">
                                    <input type="radio" name="layout" value="slider">
                                    <span class="dashicons dashicons-images-alt2"></span>
                                    <span class="was-card-text"><?php esc_html_e( 'Carrousel (Slider)', 'wp-articles-showcase' ); ?></span>
                                </label>
                            </div>
                        </div>

                        <!-- Paramètres de grille -->
                        <div class="was-control-grid">
                            <div class="was-control-field">
                                <label for="was-ctrl-cols"><?php esc_html_e( 'Nombre de colonnes :', 'wp-articles-showcase' ); ?></label>
                                <select id="was-ctrl-cols" name="columns">
                                    <option value="1">1 <?php esc_html_e( 'Colonne', 'wp-articles-showcase' ); ?></option>
                                    <option value="2">2 <?php esc_html_e( 'Colonnes', 'wp-articles-showcase' ); ?></option>
                                    <option value="3" selected>3 <?php esc_html_e( 'Colonnes (Recommandé)', 'wp-articles-showcase' ); ?></option>
                                    <option value="4">4 <?php esc_html_e( 'Colonnes', 'wp-articles-showcase' ); ?></option>
                                </select>
                            </div>

                            <div class="was-control-field">
                                <label for="was-ctrl-count"><?php esc_html_e( 'Nombre d’articles à afficher :', 'wp-articles-showcase' ); ?></label>
                                <input type="number" id="was-ctrl-count" name="posts_per_page" value="6" min="1" max="50">
                            </div>

                            <div class="was-control-field">
                                <label for="was-ctrl-category"><?php esc_html_e( 'Filtrer par catégorie :', 'wp-articles-showcase' ); ?></label>
                                <select id="was-ctrl-category" name="category">
                                    <option value=""><?php esc_html_e( 'Toutes les catégories', 'wp-articles-showcase' ); ?></option>
                                    <?php foreach ( $categories as $cat ) : ?>
                                        <option value="<?php echo esc_attr( $cat->slug ); ?>"><?php echo esc_html( $cat->name ); ?> (<?php echo esc_html( $cat->count ); ?>)</option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="was-control-field">
                                <label for="was-ctrl-orderby"><?php esc_html_e( 'Trier par :', 'wp-articles-showcase' ); ?></label>
                                <select id="was-ctrl-orderby" name="orderby">
                                    <option value="date" selected><?php esc_html_e( 'Date de publication (Plus récent)', 'wp-articles-showcase' ); ?></option>
                                    <option value="title"><?php esc_html_e( 'Titre alphabétique', 'wp-articles-showcase' ); ?></option>
                                    <option value="comment_count"><?php esc_html_e( 'Populaires (Nb de commentaires)', 'wp-articles-showcase' ); ?></option>
                                    <option value="rand"><?php esc_html_e( 'Aléatoire (Random)', 'wp-articles-showcase' ); ?></option>
                                </select>
                            </div>

                            <div class="was-control-field">
                                <label for="was-ctrl-pagination"><?php esc_html_e( 'Pagination :', 'wp-articles-showcase' ); ?></label>
                                <select id="was-ctrl-pagination" name="pagination">
                                    <option value="none" selected><?php esc_html_e( 'Aucune', 'wp-articles-showcase' ); ?></option>
                                    <option value="load_more"><?php esc_html_e( 'Bouton AJAX "Charger plus"', 'wp-articles-showcase' ); ?></option>
                                    <option value="numeric"><?php esc_html_e( 'Pagination classique (1, 2, 3...)', 'wp-articles-showcase' ); ?></option>
                                </select>
                            </div>

                            <div class="was-control-field">
                                <label for="was-ctrl-readmore-text"><?php esc_html_e( 'Texte du bouton "Lire" :', 'wp-articles-showcase' ); ?></label>
                                <input type="text" id="was-ctrl-readmore-text" name="readmore_text" value="Lire l’article">
                            </div>
                        </div>

                        <!-- Eléments à afficher (Switches) -->
                        <div class="was-control-group">
                            <label class="was-group-title"><?php esc_html_e( 'Éléments de contenu à afficher', 'wp-articles-showcase' ); ?></label>
                            <div class="was-switches-grid">
                                <label class="was-switch-label">
                                    <input type="checkbox" name="show_image" value="true" checked>
                                    <span class="was-switch-slider"></span>
                                    <span><?php esc_html_e( 'Image à la une', 'wp-articles-showcase' ); ?></span>
                                </label>
                                <label class="was-switch-label">
                                    <input type="checkbox" name="show_category" value="true" checked>
                                    <span class="was-switch-slider"></span>
                                    <span><?php esc_html_e( 'Badge catégorie', 'wp-articles-showcase' ); ?></span>
                                </label>
                                <label class="was-switch-label">
                                    <input type="checkbox" name="show_date" value="true" checked>
                                    <span class="was-switch-slider"></span>
                                    <span><?php esc_html_e( 'Date de publication', 'wp-articles-showcase' ); ?></span>
                                </label>
                                <label class="was-switch-label">
                                    <input type="checkbox" name="show_reading_time" value="true" checked>
                                    <span class="was-switch-slider"></span>
                                    <span><?php esc_html_e( 'Temps de lecture estimé', 'wp-articles-showcase' ); ?></span>
                                </label>
                                <label class="was-switch-label">
                                    <input type="checkbox" name="show_author" value="true" checked>
                                    <span class="was-switch-slider"></span>
                                    <span><?php esc_html_e( 'Auteur & Avatar', 'wp-articles-showcase' ); ?></span>
                                </label>
                                <label class="was-switch-label">
                                    <input type="checkbox" name="show_excerpt" value="true" checked>
                                    <span class="was-switch-slider"></span>
                                    <span><?php esc_html_e( 'Extrait du texte', 'wp-articles-showcase' ); ?></span>
                                </label>
                                <label class="was-switch-label">
                                    <input type="checkbox" name="show_readmore" value="true" checked>
                                    <span class="was-switch-slider"></span>
                                    <span><?php esc_html_e( 'Bouton "Lire l’article"', 'wp-articles-showcase' ); ?></span>
                                </label>
                            </div>
                        </div>

                    </div><!-- .was-builder-controls -->

                    <!-- Colonne droite : Aperçu du Shortcode & Copie rapide -->
                    <div class="was-builder-sidebar">
                        <div class="was-shortcode-card">
                            <h3><?php esc_html_e( 'Votre Shortcode Prêt à l’Emploi', 'wp-articles-showcase' ); ?></h3>
                            <p class="was-card-help">
                                <?php esc_html_e( 'Collez ce code dans n’importe quelle Page, Article, Widget, ou constructeur (Elementor, Divi, Gutenberg) :', 'wp-articles-showcase' ); ?>
                            </p>
                            
                            <div class="was-code-box">
                                <textarea id="was-generated-shortcode" readonly rows="4">[wp_articles layout="grid" columns="3" posts_per_page="6"]</textarea>
                                <button type="button" id="was-btn-copy" class="button button-primary button-hero">
                                    <span class="dashicons dashicons-clipboard"></span> <?php esc_html_e( 'Copier le Shortcode', 'wp-articles-showcase' ); ?>
                                </button>
                            </div>

                            <div class="was-quick-tips">
                                <h4><?php esc_html_e( '💡 Astuce d’intégration :', 'wp-articles-showcase' ); ?></h4>
                                <ul>
                                    <li><strong>Gutenberg :</strong> Ajoutez un bloc <code>Shortcode</code> ou <code>Code court</code> et collez.</li>
                                    <li><strong>Elementor :</strong> Utilisez le widget <code>Shortcode</code>.</li>
                                    <li><strong>PHP dans vos thèmes :</strong><br>
                                        <code>&lt;?php echo do_shortcode('[wp_articles]'); ?&gt;</code>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div><!-- .was-builder-layout -->
            </div><!-- #was-tab-generator -->

            <!-- TAB 2 : REGLAGES GLOBAUX -->
            <div id="was-tab-settings" class="was-tab-content">
                <form method="post" action="options.php" class="was-settings-form">
                    <?php settings_fields( 'was_settings_group' ); ?>
                    
                    <div class="was-settings-card">
                        <h3><?php esc_html_e( 'Personnalisation Graphique Globale', 'wp-articles-showcase' ); ?></h3>
                        
                        <table class="form-table" role="presentation">
                            <tbody>
                                <tr>
                                    <th scope="row">
                                        <label for="was_primary_color"><?php esc_html_e( 'Couleur Principale (Accent) :', 'wp-articles-showcase' ); ?></label>
                                    </th>
                                    <td>
                                        <input type="color" id="was_primary_color" name="was_primary_color" value="<?php echo esc_attr( $primary_color ); ?>" style="height: 38px; width: 60px; vertical-align: middle; cursor: pointer;">
                                        <span class="description"><?php esc_html_e( 'Utilisée pour les badges, boutons et animations au survol.', 'wp-articles-showcase' ); ?></span>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        <label for="was_custom_css"><?php esc_html_e( 'CSS Personnalisé :', 'wp-articles-showcase' ); ?></label>
                                    </th>
                                    <td>
                                        <textarea id="was_custom_css" name="was_custom_css" rows="8" class="large-text code" placeholder=".was-article-card { border-radius: 16px; }"><?php echo esc_textarea( $custom_css ); ?></textarea>
                                        <p class="description"><?php esc_html_e( 'Ajoutez vos propres règles CSS pour ajuster la typographie, l’espacement ou les ombres.', 'wp-articles-showcase' ); ?></p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <?php submit_button( __( 'Enregistrer les modifications', 'wp-articles-showcase' ) ); ?>
                    </div>
                </form>
            </div><!-- #was-tab-settings -->

            <!-- TAB 3 : DOCUMENTATION -->
            <div id="was-tab-docs" class="was-tab-content">
                <div class="was-docs-card">
                    <h3><?php esc_html_e( 'Guide Complet des Attributs du Shortcode', 'wp-articles-showcase' ); ?></h3>
                    <p><?php esc_html_e( 'Voici tous les attributs disponibles que vous pouvez personnaliser manuellement :', 'wp-articles-showcase' ); ?></p>
                    
                    <table class="widefat striped">
                        <thead>
                            <tr>
                                <th><?php esc_html_e( 'Attribut', 'wp-articles-showcase' ); ?></th>
                                <th><?php esc_html_e( 'Valeurs possibles', 'wp-articles-showcase' ); ?></th>
                                <th><?php esc_html_e( 'Défaut', 'wp-articles-showcase' ); ?></th>
                                <th><?php esc_html_e( 'Description', 'wp-articles-showcase' ); ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>layout</code></td>
                                <td><code>grid</code>, <code>list</code>, <code>slider</code></td>
                                <td><code>grid</code></td>
                                <td>Type de présentation visuelle.</td>
                            </tr>
                            <tr>
                                <td><code>columns</code></td>
                                <td><code>1</code>, <code>2</code>, <code>3</code>, <code>4</code></td>
                                <td><code>3</code></td>
                                <td>Nombre de colonnes sur ordinateur.</td>
                            </tr>
                            <tr>
                                <td><code>posts_per_page</code></td>
                                <td>Nombre entier (ex: <code>6</code>, <code>12</code>)</td>
                                <td><code>6</code></td>
                                <td>Nombre total d'articles chargés par page.</td>
                            </tr>
                            <tr>
                                <td><code>category</code></td>
                                <td>Slug de catégorie (ex: <code>tech,lifestyle</code>)</td>
                                <td><code>vide</code> (Toutes)</td>
                                <td>Filtre les articles d'une ou plusieurs catégories.</td>
                            </tr>
                            <tr>
                                <td><code>pagination</code></td>
                                <td><code>none</code>, <code>load_more</code>, <code>numeric</code></td>
                                <td><code>none</code></td>
                                <td>Active le bouton AJAX "Charger plus" ou la pagination standard.</td>
                            </tr>
                            <tr>
                                <td><code>show_reading_time</code></td>
                                <td><code>true</code>, <code>false</code></td>
                                <td><code>true</code></td>
                                <td>Affiche le temps de lecture estimé automatique.</td>
                            </tr>
                            <tr>
                                <td><code>readmore_text</code></td>
                                <td>Texte personnalisé</td>
                                <td><code>Lire l’article</code></td>
                                <td>Texte affiché sur le bouton d'action.</td>
                            </tr>
                            <tr>
                                <td><code>slider_autoplay</code></td>
                                <td><code>true</code>, <code>false</code></td>
                                <td><code>false</code></td>
                                <td>Défilement automatique pour le mode carrousel.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div><!-- #was-tab-docs -->

        </div><!-- .was-admin-wrap -->
        <?php
    }
}

WAS_Admin::init();
