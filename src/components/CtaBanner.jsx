import React from 'react';
import FadeInSection from './FadeInSection';

export default function CtaBanner({ onOpenDevis }) {
  return (
    <FadeInSection as="section" className="py-12 sm:py-16 bg-[#f2f7ef] relative overflow-hidden" id="contact">
      {/* Decorative leaf / wave background accents matching the reference photo */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#296c00_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      {/* Right Edge Plant/Leaf Visual */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-44 sm:w-64 h-full pointer-events-none opacity-40 lg:opacity-75 overflow-hidden flex items-center justify-end">
        <svg viewBox="0 0 200 200" className="w-full h-full text-primary fill-current">
          <path d="M140,20 C180,60 190,120 150,170 C130,195 90,180 70,150 C50,120 60,70 100,30 C115,15 125,10 140,20 Z" opacity="0.2"/>
          <path d="M160,40 C190,80 180,140 140,175 C110,200 80,165 65,130 C50,95 80,50 120,25 C140,12 150,25 160,40 Z" opacity="0.3"/>
        </svg>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          
          {/* Left Content */}
          <div className="max-w-2xl text-left">
            {/* Uppercase Green Subtitle */}
            <span className="text-xs sm:text-sm font-bold text-primary tracking-wider uppercase block mb-2">
              BESOIN D'UN ACCOMPAGNEMENT SUR-MESURE ?
            </span>

            {/* Main Title */}
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#111827] leading-tight mb-3">
              Contactez nos experts dès aujourd'hui
            </h3>

            {/* Green Underline Line */}
            <div className="w-12 h-1 bg-primary rounded-full mb-4"></div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              Nos équipes sont à votre disposition du Lundi au Samedi de 8h à 18h pour répondre à vos projets d'ingénierie, de véhicule, d'énergie ou d'immobilier.
            </p>
          </div>

          {/* Right Call & Devis Pill Container - Faithful to Reference Photo */}
          <div className="shrink-0 w-full lg:w-auto">
            <div className="bg-white rounded-full p-2.5 sm:p-3 sm:pr-4 border-2 border-primary shadow-xl shadow-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 max-w-xl mx-auto">
              
              {/* Left Phone Section */}
              <div className="flex items-center gap-3 px-3 py-1">
                {/* Green Circle Phone Icon */}
                <a
                  href="tel:+2250718383838"
                  className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-[#1f5300] transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-2xl font-variation-fill">call</span>
                </a>

                {/* Call Text & Phone Number */}
                <div className="text-left">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    APPELEZ-NOUS
                  </span>
                  <a
                    href="tel:+2250718383838"
                    className="font-display font-extrabold text-sm sm:text-base text-primary tracking-wide hover:underline whitespace-nowrap"
                  >
                    00225 07 183 83 838
                  </a>
                </div>
              </div>

              {/* Vertical Divider Line */}
              <div className="hidden sm:block w-[1px] h-10 bg-gray-200"></div>

              {/* Right Devis Button */}
              <button
                onClick={onOpenDevis}
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-[#1b4c00] hover:from-[#215700] hover:to-[#143900] text-white px-6 sm:px-8 py-3.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer shrink-0"
              >
                <span>Demander un Devis</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </FadeInSection>
  );
}
