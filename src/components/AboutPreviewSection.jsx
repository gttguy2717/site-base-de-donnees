import React from 'react';
import FadeInSection from './FadeInSection';

export default function AboutPreviewSection({ onLearnMore }) {
  return (
    <FadeInSection as="section" className="py-16 md:py-24 bg-[#eef4eb]" id="about">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Side: Image with Floating Mission Card */}
          <div className="lg:col-span-6 relative group">
            <div className="relative rounded-[28px] overflow-hidden shadow-xl border border-gray-200/60 aspect-[4/3]">
              <img
                src="/team-meeting.jpg"
                alt="Équipe SOUTARAH GROUP en réunion de projet"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Floating Mission Card on Image Bottom-Right */}
            <div className="absolute -bottom-6 -right-2 sm:-bottom-8 sm:-right-4 bg-white/35 backdrop-blur-xl p-4 sm:p-5 rounded-2xl max-w-[270px] shadow-2xl border border-white/50 flex items-start gap-3.5 z-20">
              <div className="w-10 h-10 rounded-full bg-[#1b4d2e] text-white flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-xl">lightbulb</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-gray-900 mb-1">
                  Mission
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Stimuler la croissance grâce à des solutions multi-services fiables.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Title, Paragraph, Vision & Values Cards, Button */}
          <div className="lg:col-span-6">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#111827] leading-tight mb-6">
              L'Excellence au Service de Chaque Secteur
            </h2>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal mb-8">
              Chez SOUTARAH GROUP, nous sommes plus qu'un simple prestataire de services ; nous sommes votre partenaire stratégique pour la croissance et l'excellence opérationnelle. En intégrant des expertises sectorielles diverses, nous proposons des solutions complètes adaptées aux défis uniques des entreprises modernes.
            </p>

            <div className="space-y-4 mb-8">
              {/* Notre Vision */}
              <div className="flex gap-4 items-start p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#1b4d2e]/30 transition-all duration-300 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-[#e8f3e6] text-[#1b4d2e] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <span className="material-symbols-outlined text-xl">verified</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-gray-900 mb-1">
                    Notre Vision
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                    Être la référence mondiale en matière de services d'entreprise intégrés, reconnus pour notre qualité sans compromis et notre approche innovante.
                  </p>
                </div>
              </div>

              {/* Nos Valeurs */}
              <div className="flex gap-4 items-start p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#1b4d2e]/30 transition-all duration-300 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-[#e8f3e6] text-[#1b4d2e] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <span className="material-symbols-outlined text-xl">diamond</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-gray-900 mb-1">
                    Nos Valeurs
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                    L'intégrité, la fiabilité, l'innovation et un engagement sans faille envers la satisfaction client constituent la pierre angulaire de tout ce que nous faisons.
                  </p>
                </div>
              </div>
            </div>

            {/* Green Outline Pill Button */}
            <button
              onClick={onLearnMore}
              className="bg-transparent border-2 border-[#1b4d2e] text-[#1b4d2e] hover:bg-[#1b4d2e] hover:text-white px-8 py-3 rounded-full font-semibold text-sm transition-all duration-300 shadow-xs"
            >
              En Savoir Plus Sur Nous
            </button>
          </div>

        </div>
      </div>
    </FadeInSection>
  );
}
