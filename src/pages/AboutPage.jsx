import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DevisModal from '../components/DevisModal';
import FadeInSection from '../components/FadeInSection';

export default function AboutPage({ navigateTo, onRequestQuote }) {
  const [isDevisOpen, setIsDevisOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNavClick = (tab) => {
    if (tab === 'about') return;

    if (tab === 'services') {
      navigateTo('services');
      return;
    }

    if (tab === 'projects' || tab === 'careers' || tab === 'contact') {
      navigateTo(tab);
      return;
    }

    navigateTo('home', { section: tab });
  };

  const handleOpenDevis = () => (onRequestQuote || ((openModal) => openModal()))(() => setIsDevisOpen(true));
  const handleCloseDevis = () => setIsDevisOpen(false);

  return (
    <div className="min-h-screen bg-[#f3f7f1] text-[#1a1c1c] flex flex-col font-sans selection:bg-[#265322] selection:text-white">
      <Navbar
        onOpenDevis={handleOpenDevis}
        activeTab="about"
        setActiveTab={handleNavClick}
        navigateTo={navigateTo}
      />

      <main className="flex-grow pt-28">
        <FadeInSection
          as="section"
          immediate
          className="mt-[0.7cm] pt-6 pb-12 sm:pt-8 sm:pb-14 bg-[#f3f7f1]"
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="reveal-stagger grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="reveal-item">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1b4d2e]/10 text-[#1b4d2e] text-xs font-bold uppercase tracking-wider mb-6 border border-[#1b4d2e]/20">
                  <span className="w-2 h-2 rounded-full bg-[#1b4d2e] animate-pulse" />
                  <span>Notre Histoire</span>
                </div>

                <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#111827] leading-[1.12] tracking-tight mb-6">
                  Forger l'Avenir <br />
                  <span className="text-[#1b4d2e]">avec Excellence.</span>
                </h1>

                <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
                  Depuis plus de deux ans, <strong className="text-gray-900 font-semibold">SOUTARAH GROUP</strong> s'impose comme un acteur incontournable dans les secteurs de l'énergie, de la construction et de la technologie. Notre parcours est défini par une quête incessante d'innovation et un engagement profond envers la réussite de nos clients.
                </p>
              </div>

              <div className="reveal-item relative group w-full mt-2 lg:mt-3">
                <div className="absolute -inset-3 bg-gradient-to-tr from-[#1b4d2e]/15 to-emerald-200/25 rounded-[40px] blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
                <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-gray-200/70 aspect-[4/3] max-h-[300px] sm:max-h-[360px] lg:max-h-[420px] w-full">
                  <img
                    src="/team-meeting.jpg"
                    alt="Équipe SOUTARAH GROUP en présentation à Abidjan"
                    className="reveal-media w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>

        <FadeInSection as="section" className="py-12 sm:py-14 bg-[#f4f8f4]" delay={100}>
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 text-center">
            <div className="max-w-xl mx-auto mb-10">
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#111827] mb-3">
                Notre Impact en Chiffres
              </h2>
              <p className="text-sm sm:text-base text-gray-500 font-medium">
                La preuve de notre engagement envers l'excellence opérationnelle.
              </p>
            </div>

            <div className="reveal-stagger grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {[
                { icon: 'sentiment_very_satisfied', value: '608', label: 'CLIENTS SATISFAITS' },
                { icon: 'task_alt', value: '31', label: 'PROJETS RÉALISÉS' },
                { icon: 'engineering', value: '7', label: 'PROFESSIONNELS EXPERTS' },
              ].map(({ icon, value, label }) => (
                <div key={label} className="reveal-item motion-lift bg-white rounded-[24px] p-8 border border-gray-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-default">
                  <div className="w-12 h-12 rounded-2xl bg-[#1b4d2e]/10 text-[#1b4d2e] mx-auto mb-5 flex items-center justify-center group-hover:bg-[#1b4d2e] group-hover:text-white transition-colors duration-300">
                    <span className="material-symbols-outlined text-2xl">{icon}</span>
                  </div>
                  <div className="font-display font-black text-4xl sm:text-5xl text-[#111827] mb-2 tracking-tight">
                    {value}<span className="text-[#1b4d2e]">+</span>
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>

        <FadeInSection as="section" className="py-12 sm:py-14 bg-[#e8f1e6]" delay={100}>
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="reveal-stagger grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
              <div className="reveal-item reveal-stagger lg:col-span-5 flex flex-col gap-6">
                <div className="reveal-item motion-lift bg-[#f9fbf9] rounded-[28px] p-7 border border-gray-200/70 shadow-xs flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#e8f3e6] text-[#1b4d2e] flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">flag</span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-[#111827]">Notre Mission</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Fournir des solutions innovantes et durables qui propulsent la croissance de nos partenaires tout en respectant les plus hauts standards de qualité et de sécurité.
                  </p>
                </div>

                <div className="reveal-item motion-lift bg-[#f9fbf9] rounded-[28px] p-7 border border-gray-200/70 shadow-xs flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#e8f3e6] text-[#1b4d2e] flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">visibility</span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-[#111827]">Notre Vision</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Devenir le leader mondial reconnu pour son ingéniosité dans l'intégration de technologies avancées et de pratiques respectueuses de l'environnement au sein des infrastructures industrielles.
                  </p>
                </div>
              </div>

              <div className="reveal-item lg:col-span-7 bg-[#f4f8f4] rounded-[32px] p-6 sm:p-8 border border-gray-200/60 shadow-xs">
                <h3 className="font-display font-extrabold text-2xl text-[#111827] mb-6">Nos Valeurs Fondamentales</h3>
                <div className="reveal-stagger grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: 'shield', title: 'Intégrité', desc: 'Transparence totale et éthique irréprochable dans toutes nos interactions.' },
                    { icon: 'verified', title: 'Fiabilité', desc: 'Tenir nos promesses avec constance et livrer une qualité sans compromis.' },
                    { icon: 'lightbulb', title: 'Innovation', desc: 'Adopter et créer de nouvelles approches pour résoudre des défis complexes.' },
                    { icon: 'groups', title: 'Engagement', desc: 'Un dévouement total envers la réussite de nos clients.' },
                  ].map(({ icon, title, desc }) => (
                    <div key={title} className="reveal-item motion-lift bg-white rounded-2xl p-5 border border-gray-200/70 shadow-2xs hover:border-[#1b4d2e]/30 transition-colors group">
                      <div className="w-9 h-9 rounded-xl bg-[#e8f3e6] text-[#1b4d2e] flex items-center justify-center mb-3 group-hover:bg-[#1b4d2e] group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">{icon}</span>
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">{title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </main>

      <Footer onNavClick={handleNavClick} />
      <DevisModal isOpen={isDevisOpen} onClose={handleCloseDevis} />
    </div>
  );
}
