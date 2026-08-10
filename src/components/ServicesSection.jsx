import React from 'react';
import { SERVICES_DATA } from '../data/servicesData';
import FadeInSection from './FadeInSection';

export default function ServicesSection({ onSelectService }) {
  return (
    <FadeInSection as="section" className="py-20 md:py-28 bg-[#e7f1e5]" id="services">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-block px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4 border border-primary/20">
            Nos Domaines d'Intervention
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-on-surface mb-4">
            Nos Services Principaux
          </h2>
          <p className="text-base text-on-surface-variant leading-relaxed">
            Fournir des solutions de classe mondiale dans de nombreux secteurs pour répondre aux besoins clés de votre entreprise.
          </p>
        </div>

        {/* 6 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES_DATA.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80 service-card-hover flex flex-col justify-between group"
            >
              <div>
                {/* Image Preview */}
                <div className="aspect-[16/10] w-full mb-6 rounded-2xl overflow-hidden bg-gray-100 relative">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                  <span className="material-symbols-outlined text-3xl font-variation-fill">
                    {service.icon}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-display font-bold text-xl text-on-surface mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  {service.description}
                </p>
              </div>

              {/* Action */}
              <button
                onClick={() => onSelectService(service)}
                className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all pt-2 border-t border-gray-100 w-full"
              >
                <span>En savoir plus</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </FadeInSection>
  );
}
