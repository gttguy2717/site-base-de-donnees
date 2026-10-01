/**
 * WP Articles Showcase - Frontend Scripts
 * Pure Vanilla JavaScript (No jQuery dependency required)
 */

(function () {
    'use strict';

    // Initialisation au chargement du DOM
    document.addEventListener('DOMContentLoaded', function () {
        initSliders();
        initLoadMore();
    });

    /* ==========================================================================
       1. Gestionnaire de Carrousels / Sliders
       ========================================================================== */
    function initSliders() {
        var sliders = document.querySelectorAll('.was-layout-slider');
        if (!sliders.length) return;

        sliders.forEach(function (slider) {
            var track = slider.querySelector('.was-slider-track');
            var cards = track ? track.querySelectorAll('.was-article-card') : [];
            var prevBtn = slider.querySelector('.was-slider-prev');
            var nextBtn = slider.querySelector('.was-slider-next');
            var dotsContainer = slider.querySelector('.was-slider-dots');

            if (!track || cards.length === 0) return;

            var autoplay = slider.getAttribute('data-autoplay') === 'true';
            var speed = parseInt(slider.getAttribute('data-speed'), 10) || 4000;
            var maxCols = parseInt(slider.getAttribute('data-columns'), 10) || 3;

            var currentIndex = 0;
            var autoPlayTimer = null;
            var touchStartX = 0;
            var touchEndX = 0;

            function getVisibleCols() {
                var width = slider.clientWidth;
                if (width < 640) return 1;
                if (width < 1024) return Math.min(2, maxCols);
                return maxCols;
            }

            function getMaxIndex() {
                var cols = getVisibleCols();
                return Math.max(0, cards.length - cols);
            }

            function updateCardWidths() {
                var cols = getVisibleCols();
                var gap = 24; // Marge définie en CSS
                var containerWidth = slider.querySelector('.was-slider-viewport').clientWidth;
                var cardWidth = (containerWidth - (gap * (cols - 1))) / cols;

                cards.forEach(function (card) {
                    card.style.width = cardWidth + 'px';
                });

                buildDots();
                goToSlide(currentIndex, false);
            }

            function buildDots() {
                if (!dotsContainer) return;
                dotsContainer.innerHTML = '';
                var max = getMaxIndex();
                if (max <= 0) return;

                for (var i = 0; i <= max; i++) {
                    (function (idx) {
                        var dot = document.createElement('span');
                        dot.className = 'was-slider-dot' + (idx === currentIndex ? ' was-dot-active' : '');
                        dot.setAttribute('data-index', idx);
                        dot.addEventListener('click', function () {
                            goToSlide(idx);
                            resetAutoplay();
                        });
                        dotsContainer.appendChild(dot);
                    })(i);
                }
            }

            function goToSlide(index, animate) {
                if (animate === undefined) animate = true;
                var max = getMaxIndex();
                currentIndex = Math.max(0, Math.min(index, max));

                var cols = getVisibleCols();
                var gap = 24;
                var containerWidth = slider.querySelector('.was-slider-viewport').clientWidth;
                var cardWidth = (containerWidth - (gap * (cols - 1))) / cols;
                var offset = (cardWidth + gap) * currentIndex;

                track.style.transition = animate ? 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
                track.style.transform = 'translateX(-' + offset + 'px)';

                // Mise à jour de l'état des dots
                if (dotsContainer) {
                    var dots = dotsContainer.querySelectorAll('.was-slider-dot');
                    dots.forEach(function (dot, i) {
                        if (i === currentIndex) {
                            dot.classList.add('was-dot-active');
                        } else {
                            dot.classList.remove('was-dot-active');
                        }
                    });
                }
            }

            function nextSlide() {
                var max = getMaxIndex();
                if (currentIndex >= max) {
                    goToSlide(0);
                } else {
                    goToSlide(currentIndex + 1);
                }
            }

            function prevSlide() {
                var max = getMaxIndex();
                if (currentIndex <= 0) {
                    goToSlide(max);
                } else {
                    goToSlide(currentIndex - 1);
                }
            }

            // Écouteurs sur les boutons
            if (nextBtn) {
                nextBtn.addEventListener('click', function () {
                    nextSlide();
                    resetAutoplay();
                });
            }
            if (prevBtn) {
                prevBtn.addEventListener('click', function () {
                    prevSlide();
                    resetAutoplay();
                });
            }

            // Gestion tactile (Swipe mobile)
            track.addEventListener('touchstart', function (e) {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            track.addEventListener('touchend', function (e) {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });

            function handleSwipe() {
                var threshold = 45;
                if (touchStartX - touchEndX > threshold) {
                    nextSlide();
                    resetAutoplay();
                } else if (touchEndX - touchStartX > threshold) {
                    prevSlide();
                    resetAutoplay();
                }
            }

            // Autoplay
            function startAutoplay() {
                if (!autoplay) return;
                autoPlayTimer = setInterval(nextSlide, speed);
            }

            function stopAutoplay() {
                if (autoPlayTimer) clearInterval(autoPlayTimer);
            }

            function resetAutoplay() {
                stopAutoplay();
                startAutoplay();
            }

            slider.addEventListener('mouseenter', stopAutoplay);
            slider.addEventListener('mouseleave', startAutoplay);

            // Redimensionnement de la fenêtre
            var resizeDebounce;
            window.addEventListener('resize', function () {
                clearTimeout(resizeDebounce);
                resizeDebounce = setTimeout(updateCardWidths, 150);
            });

            // Initialisation immédiate
            updateCardWidths();
            startAutoplay();
        });
    }

    /* ==========================================================================
       2. Gestionnaire AJAX "Charger Plus" (Load More)
       ========================================================================== */
    function initLoadMore() {
        var buttons = document.querySelectorAll('.was-btn-load-more');
        if (!buttons.length) return;

        buttons.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();

                var targetSelector = btn.getAttribute('data-target');
                var container = document.querySelector(targetSelector);
                if (!container) return;

                var grid = container.querySelector('.was-items-grid');
                var paged = parseInt(container.getAttribute('data-paged'), 10) || 1;
                var maxPages = parseInt(container.getAttribute('data-max-pages'), 10) || 1;
                var rawParams = container.getAttribute('data-ajax-params');

                if (!grid || !rawParams || paged >= maxPages) return;

                // Afficher le spinner et désactiver le bouton
                btn.classList.add('was-loading');
                btn.disabled = true;

                var formData = new FormData();
                formData.append('action', 'was_load_more');
                formData.append('nonce', wasData.ajaxNonce);
                formData.append('paged', paged);
                formData.append('params', rawParams);

                fetch(wasData.ajaxUrl, {
                    method: 'POST',
                    body: formData
                })
                .then(function (response) {
                    return response.json();
                })
                .then(function (res) {
                    btn.classList.remove('was-loading');
                    btn.disabled = false;

                    if (res.success && res.data && res.data.html) {
                        // Créer un conteneur temporaire pour animer les nouveaux articles
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = res.data.html;
                        
                        var newCards = Array.from(tempDiv.children);
                        newCards.forEach(function (card) {
                            card.style.opacity = '0';
                            card.style.transform = 'translateY(15px)';
                            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                            grid.appendChild(card);

                            setTimeout(function () {
                                card.style.opacity = '1';
                                card.style.transform = 'translateY(0)';
                            }, 50);
                        });

                        // Mettre à jour la page actuelle
                        container.setAttribute('data-paged', res.data.paged);

                        // Si plus aucun article à charger
                        if (!res.data.has_more || res.data.paged >= res.data.max_pages) {
                            btn.parentElement.innerHTML = '<span class="was-no-more-text" style="color:var(--was-text-meta); font-size:0.9rem; font-weight:500;">' + wasData.noMore + '</span>';
                        }
                    } else {
                        btn.parentElement.innerHTML = '<span class="was-no-more-text" style="color:var(--was-text-meta); font-size:0.9rem;">' + wasData.noMore + '</span>';
                    }
                })
                .catch(function (err) {
                    console.error('WAS Error:', err);
                    btn.classList.remove('was-loading');
                    btn.disabled = false;
                });
            });
        });
    }

})();
