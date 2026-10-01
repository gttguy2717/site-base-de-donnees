/**
 * WP Articles Showcase - Admin Script
 */

(function ($) {
    'use strict';

    $(document).ready(function () {
        initTabs();
        initShortcodeGenerator();
    });

    /**
     * 1. Navigation par onglets
     */
    function initTabs() {
        $('.was-tab-btn').on('click', function () {
            var tabId = $(this).data('tab');

            $('.was-tab-btn').removeClass('was-active');
            $(this).addClass('was-active');

            $('.was-tab-content').removeClass('was-active');
            $('#was-tab-' + tabId).addClass('was-active');
        });
    }

    /**
     * 2. Générateur interactif de Shortcode
     */
    function initShortcodeGenerator() {
        var $form = $('.was-builder-controls');
        var $textarea = $('#was-generated-shortcode');
        var $copyBtn = $('#was-btn-copy');

        // Cartes Radio (Layout)
        $('.was-radio-card').on('click', function () {
            $('.was-radio-card').removeClass('was-selected');
            $(this).addClass('was-selected');
            $(this).find('input[type="radio"]').prop('checked', true);
            updateShortcode();
        });

        // Tous les inputs / selects / checkboxes
        $form.on('input change', 'select, input', function () {
            updateShortcode();
        });

        function updateShortcode() {
            var layout = $('input[name="layout"]:checked').val() || 'grid';
            var columns = $('#was-ctrl-cols').val() || '3';
            var count = $('#was-ctrl-count').val() || '6';
            var category = $('#was-ctrl-category').val() || '';
            var orderby = $('#was-ctrl-orderby').val() || 'date';
            var pagination = $('#was-ctrl-pagination').val() || 'none';
            var readmoreText = $('#was-ctrl-readmore-text').val() || 'Lire l’article';

            // Checkboxes
            var showImage = $('input[name="show_image"]').is(':checked');
            var showCat = $('input[name="show_category"]').is(':checked');
            var showDate = $('input[name="show_date"]').is(':checked');
            var showReading = $('input[name="show_reading_time"]').is(':checked');
            var showAuthor = $('input[name="show_author"]').is(':checked');
            var showExcerpt = $('input[name="show_excerpt"]').is(':checked');
            var showReadmore = $('input[name="show_readmore"]').is(':checked');

            var parts = ['wp_articles'];

            // Layout
            if (layout !== 'grid') {
                parts.push('layout="' + layout + '"');
            }

            // Columns (si pertinent)
            if (layout === 'grid' || layout === 'slider') {
                if (columns !== '3') {
                    parts.push('columns="' + columns + '"');
                }
            }

            // Nombre de posts
            if (count && count !== '6') {
                parts.push('posts_per_page="' + count + '"');
            }

            // Catégorie
            if (category) {
                parts.push('category="' + category + '"');
            }

            // Orderby
            if (orderby !== 'date') {
                parts.push('orderby="' + orderby + '"');
            }

            // Pagination
            if (pagination !== 'none') {
                parts.push('pagination="' + pagination + '"');
            }

            // Visibilités si décochées (car true par défaut)
            if (!showImage) parts.push('show_image="false"');
            if (!showCat) parts.push('show_category="false"');
            if (!showDate) parts.push('show_date="false"');
            if (!showReading) parts.push('show_reading_time="false"');
            if (!showAuthor) parts.push('show_author="false"');
            if (!showExcerpt) parts.push('show_excerpt="false"');
            if (!showReadmore) {
                parts.push('show_readmore="false"');
            } else if (readmoreText && readmoreText !== 'Lire l’article') {
                parts.push('readmore_text="' + readmoreText.replace(/"/g, '') + '"');
            }

            var shortcodeStr = '[' + parts.join(' ') + ']';
            $textarea.val(shortcodeStr);
        }

        // Copier dans le presse-papier
        $copyBtn.on('click', function () {
            var text = $textarea.val();
            if (!text) return;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () {
                    showCopySuccess();
                });
            } else {
                $textarea.select();
                document.execCommand('copy');
                showCopySuccess();
            }
        });

        function showCopySuccess() {
            var originalText = $copyBtn.html();
            $copyBtn.html('<span class="dashicons dashicons-yes"></span> Shortcode Copié !');
            $copyBtn.css('background', '#16a34a').css('border-color', '#15803d');

            setTimeout(function () {
                $copyBtn.html(originalText);
                $copyBtn.css('background', '').css('border-color', '');
            }, 2500);
        }

        // Déclenchement initial
        updateShortcode();
    }

})(jQuery);
