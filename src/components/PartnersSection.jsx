import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PARTNERS_DATA } from '../data/servicesData';
import FadeInSection from './FadeInSection';

export default function PartnersSection() {
  const total = PARTNERS_DATA.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const lockRef = useRef(false);

  const go = useCallback((dir) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + dir + total) % total);
    setTimeout(() => {
      lockRef.current = false;
      setIsAnimating(false);
    }, 600);
  }, [total]);

  // Auto-advance every 4.5s
  useEffect(() => {
    const t = setInterval(() => go(1), 4500);
    return () => clearInterval(t);
  }, [go]);

  const getCard = (offset) => {
    const idx = (activeIndex + offset + total) % total;
    return PARTNERS_DATA[idx];
  };

  // Slots: position, scale, opacity, depth
  const slots = [
    { offset: -2, scale: 0.62, opacity: 0.28, zIndex: 1, tx: -320, blur: 1.5 },
    { offset: -1, scale: 0.80, opacity: 0.65, zIndex: 3, tx: -168, blur: 0   },
    { offset:  0, scale: 1.05, opacity: 1.00, zIndex: 5, tx:    0, blur: 0, active: true },
    { offset:  1, scale: 0.80, opacity: 0.65, zIndex: 3, tx:  168, blur: 0   },
    { offset:  2, scale: 0.62, opacity: 0.28, zIndex: 1, tx:  320, blur: 1.5 },
  ];

  return (
    <FadeInSection
      as="section"
      className="py-20 md:py-24 relative overflow-hidden bg-[#edf3ec] border-t border-[#d9e6d7]"
      id="partners"
    >
      {/* Subtle ambient light from center */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #d4edd4 0%, transparent 70%)' }}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 relative">
        {/* Header */}
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4 border border-primary/20">
            <span className="material-symbols-outlined text-sm">handshake</span>
            <span>Réseau & Confiance</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-on-surface mb-3 leading-tight">
            Ils Nous Font <span className="text-primary">Confiance</span>
          </h2>
          <p className="text-base text-on-surface-variant leading-relaxed">
            Ils nous font confiance pour la réalisation de leurs projets stratégiques.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-[1100px] mx-auto h-[300px] flex items-center justify-center select-none">

          {/* LEFT Arrow */}
          <button
            onClick={() => go(-1)}
            aria-label="Précédent"
            disabled={isAnimating}
            className="absolute left-0 sm:left-4 z-20 w-11 h-11 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/80 active:scale-95 transition-all duration-200 disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-2xl">chevron_left</span>
          </button>

          {/* Cards */}
          {slots.map(({ offset, scale, opacity, zIndex, tx, blur, active }) => {
            const partner = getCard(offset);
            return (
              <div
                key={partner.name}
                onClick={() => !active && go(offset)}
                style={{
                  position: 'absolute',
                  zIndex,
                  cursor: active ? 'default' : 'pointer',
                  width: '210px',
                  // Smooth fluid sliding transition for image cards
                  transform: `translateX(${tx}px) scale(${scale})`,
                  opacity,
                  filter: blur ? `blur(${blur}px)` : 'none',
                  transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                  willChange: 'transform, opacity',
                }}
              >
                <div
                  className={`bg-white rounded-2xl p-6 flex flex-col items-center text-center ${
                    active ? 'shadow-2xl border-2 border-gray-100' : 'shadow-md border border-gray-200'
                  }`}
                  style={{
                    height: '226px',
                    transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
                  }}
                >
                  {/* Logo */}
                  <div className="w-full h-28 flex items-center justify-center flex-1">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="object-contain transition-all duration-500"
                      style={{
                        maxHeight: '80px',
                        maxWidth: '160px',
                        filter: active ? 'none' : 'grayscale(80%) opacity(0.7)',
                        transform: active ? 'scale(1.05)' : 'scale(1)',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-primary">domain</span>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="pt-3 border-t border-gray-100 w-full mt-2">
                    <span
                      className="text-xs font-bold uppercase tracking-wider block leading-tight"
                      style={{
                        color: active ? '#1a1a1a' : '#888',
                        transition: 'color 0.4s ease',
                      }}
                    >
                      {partner.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* RIGHT Arrow */}
          <button
            onClick={() => go(1)}
            aria-label="Suivant"
            disabled={isAnimating}
            className="absolute right-0 sm:right-4 z-20 w-11 h-11 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/80 active:scale-95 transition-all duration-200 disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-2xl">chevron_right</span>
          </button>
        </div>

        {/* Dot Indicators - Simple round dots like original reference */}
        <div className="flex items-center justify-center gap-2.5 mt-8">
          {PARTNERS_DATA.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (lockRef.current || i === activeIndex) return;
                setActiveIndex(i);
              }}
              aria-label={`Partenaire ${i + 1}`}
              className={`w-3 h-3 rounded-full border-none p-0 cursor-pointer transition-all duration-300 ${
                i === activeIndex ? 'bg-primary scale-110 shadow-xs' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </FadeInSection>
  );
}
