import React, { useState, useEffect, useRef } from 'react';
import { STATS_DATA } from '../data/servicesData';
import FadeInSection from './FadeInSection';

export default function CounterSection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState(STATS_DATA.map(() => 0));
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounters();
        }
      },
      { threshold: 0.2 }
    );

    const el = sectionRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasAnimated]);

  const animateCounters = () => {
    const duration = 2000; // ms
    const steps = 50;
    const intervalTime = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setCounts(
        STATS_DATA.map((stat) => Math.min(Math.ceil(stat.value * progress), stat.value))
      );

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);
  };

  return (
    <FadeInSection
      as="section"
      className="py-12 bg-white relative z-30 mx-4 sm:mx-8 max-w-[1280px] md:mx-auto rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] border border-gray-100 -mt-16 sm:-mt-20"
    >
      <div ref={sectionRef} className="px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {STATS_DATA.map((stat, idx) => (
          <div key={idx} className="text-center px-4 pt-4 md:pt-0">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-3xl font-variation-fill">
                {stat.icon}
              </span>
            </div>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-on-surface">
              {counts[idx]}
              <span className="text-primary">{stat.suffix}</span>
            </div>
            <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-on-surface-variant mt-2">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </FadeInSection>
  );
}
