<?php
/**
 * Template : Carte Article en Liste horizontale
 *
 * @package WP_Articles_Showcase
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$show_image        = ( 'true' === $args['show_image'] );
$show_category     = ( 'true' === $args['show_category'] && ! empty( $category_name ) );
$badge_position    = ! empty( $args['badge_position'] ) ? sanitize_html_class( $args['badge_position'] ) : 'top-left';
$show_date         = ( 'true' === $args['show_date'] );
$show_reading_time = ( 'true' === $args['show_reading_time'] );
$show_comments     = ( isset( $args['show_comments'] ) && 'true' === $args['show_comments'] );
$show_author       = ( 'true' === $args['show_author'] );
$show_avatar       = ( ! isset( $args['show_avatar'] ) || 'true' === $args['show_avatar'] );
$avatar_size       = ! empty( $args['avatar_size'] ) ? absint( $args['avatar_size'] ) : 28;
$show_excerpt      = ( 'true' === $args['show_excerpt'] );
$show_readmore     = ( 'true' === $args['show_readmore'] );
$title_tag         = ! empty( $args['title_tag'] ) ? tag_escape( $args['title_tag'] ) : 'h3';
$hover_effect      = ! empty( $args['hover_effect'] ) ? sanitize_html_class( $args['hover_effect'] ) : 'zoom-in';

$card_classes = array( 'was-article-card', 'was-card-list', 'was-hover-' . $hover_effect );
?>

<article id="post-<?php echo esc_attr( $post_id ); ?>" class="<?php echo esc_attr( implode( ' ', $card_classes ) ); ?>">
    
    <?php if ( $show_image ) : ?>
        <div class="was-card-media was-list-media">
            <a href="<?php echo esc_url( $permalink ); ?>" class="was-media-link" aria-label="<?php echo esc_attr( $title ); ?>" tabindex="-1">
                <?php if ( $has_thumbnail ) : ?>
                    <?php echo get_the_post_thumbnail( $post_id, $image_size, array( 'class' => 'was-thumbnail-img', 'loading' => 'lazy' ) ); ?>
                <?php else : ?>
                    <div class="was-thumbnail-placeholder">
                        <span class="was-placeholder-icon">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </span>
                    </div>
                <?php endif; ?>
                <div class="was-media-overlay"></div>
            </a>

            <?php if ( $show_category && 'inline' !== $badge_position ) : ?>
                <a href="<?php echo esc_url( $category_link ); ?>" class="was-category-badge was-badge-<?php echo esc_attr( $badge_position ); ?>">
                    <?php echo esc_html( $category_name ); ?>
                </a>
            <?php endif; ?>
        </div>
    <?php endif; ?>

    <div class="was-card-body was-list-body">
        
        <?php if ( $show_category && 'inline' === $badge_position ) : ?>
            <div class="was-badge-inline-wrapper">
                <a href="<?php echo esc_url( $category_link ); ?>" class="was-category-badge was-badge-inline">
                    <?php echo esc_html( $category_name ); ?>
                </a>
            </div>
        <?php endif; ?>

        <?php if ( $show_date || $show_reading_time || $show_comments ) : ?>
            <div class="was-meta-top">
                <?php if ( $show_date ) : ?>
                    <span class="was-meta-item was-meta-date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>">
                            <?php echo esc_html( get_the_date() ); ?>
                        </time>
                    </span>
                <?php endif; ?>

                <?php if ( $show_reading_time ) : ?>
                    <span class="was-meta-item was-meta-reading">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <?php echo esc_html( $reading_time ); ?>
                    </span>
                <?php endif; ?>

                <?php if ( $show_comments ) : ?>
                    <span class="was-meta-item was-meta-comments">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        <?php comments_number( '0', '1', '%' ); ?>
                    </span>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <<?php echo esc_attr( $title_tag ); ?> class="was-card-title">
            <a href="<?php echo esc_url( $permalink ); ?>">
                <?php echo esc_html( $title ); ?>
            </a>
        </<?php echo esc_attr( $title_tag ); ?>>

        <?php if ( $show_excerpt ) : ?>
            <div class="was-card-excerpt">
                <p><?php echo esc_html( wp_trim_words( get_the_excerpt(), $excerpt_length, '...' ) ); ?></p>
            </div>
        <?php endif; ?>

        <?php if ( $show_author || $show_readmore ) : ?>
            <div class="was-card-footer">
                <?php if ( $show_author ) : ?>
                    <div class="was-card-author">
                        <?php if ( $show_avatar ) : ?>
                            <?php echo get_avatar( get_the_author_meta( 'ID' ), $avatar_size, '', '', array( 'class' => 'was-author-avatar' ) ); ?>
                        <?php endif; ?>
                        <span class="was-author-name"><?php echo esc_html( get_the_author() ); ?></span>
                    </div>
                <?php endif; ?>

                <?php if ( $show_readmore ) : ?>
                    <a href="<?php echo esc_url( $permalink ); ?>" class="was-btn-readmore">
                        <span><?php echo esc_html( $readmore_text ); ?></span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </a>
                <?php endif; ?>
            </div>
        <?php endif; ?>

    </div><!-- .was-card-body -->

</article>
