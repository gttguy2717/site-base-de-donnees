import React, { useEffect, useRef, useState } from 'react';

const REVEAL_VARIANTS = new Set(['up', 'down', 'left', 'right', 'scale', 'none']);

function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

/**
 * Reusable entrance wrapper for sections and content blocks.
 *
 * `variant` controls the initial direction. Put `reveal-stagger` on a child
 * grid and `reveal-item` on its direct children to animate a sequence after
 * this wrapper becomes visible. `stagger` customises that sequence in ms.
 */
export default function FadeInSection({
  children,
  className = '',
  delay = 0,
  immediate = false,
  threshold = 0.12,
  rootMargin = '0px 0px -8% 0px',
  variant = 'up',
  once = true,
  stagger,
  as: Tag = 'div',
  style,
  ...rest
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const revealVariant = REVEAL_VARIANTS.has(variant) ? variant : 'up';

  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      setIsVisible(true);
      return undefined;
    }

    if (immediate) {
      const frame = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const el = ref.current;
    if (!el) return undefined;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return undefined;
    }

    let hasRevealed = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hasRevealed = true;
          setIsVisible(true);

          if (once) observer.disconnect();
          return;
        }

        if (!once && hasRevealed) setIsVisible(false);
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    // Covers elements that are already on screen before the observer callback.
    const fallbackTimer = window.setTimeout(() => {
      if (isInViewport(el)) {
        hasRevealed = true;
        setIsVisible(true);
        if (once) observer.disconnect();
      }
    }, 80);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
    };
  }, [immediate, once, rootMargin, threshold]);

  const motionStyle = {
    ...style,
    '--fade-delay': `${delay}ms`,
    ...(stagger ? { '--reveal-stagger': `${stagger}ms` } : {}),
  };

  return (
    <Tag
      ref={ref}
      className={`fade-in-section fade-in-section--${revealVariant} ${isVisible ? 'is-visible' : ''} ${className}`.trim()}
      style={motionStyle}
      {...rest}
    >
      {children}
    </Tag>
  );
}
