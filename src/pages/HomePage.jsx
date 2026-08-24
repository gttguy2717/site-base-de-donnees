import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import CounterSection from '../components/CounterSection';
import AboutPreviewSection from '../components/AboutPreviewSection';
import ServicesSection from '../components/ServicesSection';
import PartnersSection from '../components/PartnersSection';
import CtaBanner from '../components/CtaBanner';
import Footer from '../components/Footer';
import DevisModal from '../components/DevisModal';
import FadeInSection from '../components/FadeInSection';

const heroSlides = [
  {
    id: 'home',
    image: '/fond-home.png',
    fallbackImage: 'https://soutarahgroup.ci/img/tecg.jpeg',
    alt: 'Technicien sur une installation solaire, expertise de SOUTARAH GROUP',
  },
  {
    id: 'energie',
    eyebrow: 'Énergies renouvelables',
    title: 'Des solutions solaires pensées pour durer',
    description:
      'Études, équipements photovoltaïques et installations clé en main pour résidences, bâtiments, écoles, lieux de culte et projets de pompage solaire.',
    image: 'https://soutarahgroup.ci/img/energie.png',
    fallbackImage: 'https://soutarahgroup.ci/img/energ.jpeg',
    alt: 'Installation solaire et énergie renouvelable',
    points: ['Études & dimensionnement', 'Vente d’équipements', 'Installation clé en main'],
  },
  {
    id: 'vehicules',
    eyebrow: 'Location de véhicules',
    title: 'Une mobilité fiable pour vos missions',
    description:
      'Citadines, SUV, utilitaires, véhicules de prestige et solutions avec chauffeur pour les besoins professionnels ou personnels.',
    image: 'https://soutarahgroup.ci/img/carRe.jpeg',
    fallbackImage: 'https://soutarahgroup.ci/img/carRe.jpeg',
    alt: 'Véhicule de location SOUTARAH GROUP',
    points: ['Courte ou longue durée', 'Avec chauffeur', 'Flotte entretenue'],
  },
  {
    id: 'technique',
    eyebrow: 'Services techniques',
    title: 'Installer et maintenir vos équipements',
    description:
      'Des interventions sur les équipements électriques, domestiques et industriels, avec maintenance préventive, corrective et prédictive.',
    image: 'https://soutarahgroup.ci/img/tecg.jpeg',
    fallbackImage: 'https://soutarahgroup.ci/img/tecg.jpeg',
    alt: 'Intervention technique SOUTARAH GROUP',
    points: ['Maintenance', 'Installations électriques', 'Entretien de sites'],
  },
  {
    id: 'immobilier',
    eyebrow: 'Immobilier',
    title: 'Projets immobiliers accompagnés',
    description:
      'Lotissement, terrains à vendre, rénovation, résidences meublées, bureaux et locaux pour habiter, investir ou développer une activité.',
    image: 'https://soutarahgroup.ci/img/immobilier.jpeg',
    fallbackImage: 'https://soutarahgroup.ci/img/immobilier.jpeg',
    alt: 'Projet immobilier SOUTARAH GROUP',
    points: ['Terrains & lotissements', 'Rénovation', 'Bureaux & locaux'],
  },
];

export default function HomePage({ navigateTo, onRequestQuote }) {
  const [isDevisOpen, setIsDevisOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  const handleOpenDevis = () => (onRequestQuote || ((openModal) => openModal()))(() => setIsDevisOpen(true));
  const handleCloseDevis = () => setIsDevisOpen(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  const handleSelectService = (service) => {
    navigateTo('service', { slug: service.id });
  };

  const handleScrollToSection = (id) => {
    if (id === 'services') return navigateTo('services');
    if (id === 'about') return navigateTo('about');
    if (id === 'projects' || id === 'careers' || id === 'contact') return navigateTo(id);

    setActiveTab(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleHeroImageError = (event, fallbackImage) => {
    if (!fallbackImage || event.currentTarget.src === fallbackImage) return;
    event.currentTarget.src = fallbackImage;
  };

  const activeHero = heroSlides[activeHeroSlide];
  const isHomeHero = activeHero.id === 'home';

  const previousSlide = () => setActiveHeroSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length);
  const nextSlide = () => setActiveHeroSlide((current) => (current + 1) % heroSlides.length);

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-on-surface flex flex-col font-sans selection:bg-primary selection:text-white">
      <Navbar onOpenDevis={handleOpenDevis} activeTab={activeTab} setActiveTab={setActiveTab} navigateTo={navigateTo} />

      <main className="flex-grow">
        <section className="relative flex items-start min-h-[720px] lg:min-h-[770px] overflow-hidden" id="home">
          <div className="absolute inset-0 z-0">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  index === activeHeroSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="home-hero-media absolute inset-0 h-full w-full object-cover object-[68%_center]"
                  onError={(event) => handleHeroImageError(event, slide.fallbackImage)}
                />
              </div>
            ))}
            
            {/* Panneau blanc opaque sur le côté gauche pour la lisibilité des textes */}
            <div className="absolute inset-y-0 left-0 z-10 w-full md:w-[65%] lg:w-[58%] bg-gradient-to-r from-white via-white to-transparent" />
            
            {/* Dégradé supplémentaire pour transition douce */}
            <div
              className={`absolute inset-0 z-[12] bg-gradient-to-r ${
                isHomeHero
                  ? 'from-[#f8fcf6]/95 via-[#f8fcf6]/60 via-[50%] to-transparent'
                  : 'from-white/85 via-white/45 via-[48%] to-transparent'
              }`}
            />
            
            {/* Dégradé du bas */}
            <div className="absolute inset-0 z-[15] bg-gradient-to-t from-[#f9f9f9] via-transparent to-transparent" />
          </div>

          <FadeInSection immediate className="relative z-20 w-full max-w-[1280px] mx-auto px-4 sm:px-8 pt-24 pb-20">
            <div className={`max-w-2xl lg:max-w-3xl ${isHomeHero ? 'mt-[83px]' : 'mt-[45px]'}`}>
              {isHomeHero ? (
                <>
                  <div className="inline-block px-4 py-1.5 rounded-full bg-primary/15 text-primary font-semibold text-xs sm:text-sm mb-5 border border-primary/30 shadow-xs">
                    Solutions d'Entreprise Multi-Services
                  </div>

                  <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#1a1c1c] mb-5 leading-[1.12] tracking-tight">
                    Bâtir des Solutions <br />
                    <span className="text-primary">Fiables</span> pour Divers <br />
                    Secteurs d'Activités
                  </h1>

                  <p className="text-base sm:text-lg text-[#404a39] mb-8 max-w-2xl leading-relaxed">
                    SOUTARAH GROUP accompagne les entreprises, les institutions et les particuliers à travers des solutions multi-services innovantes, fiables et de haute qualité.
                  </p>

                  <div className="flex flex-wrap gap-4 items-center">
                    <button
                      onClick={handleOpenDevis}
                      className="bg-primary hover:bg-[#1b4c00] text-white px-8 py-3.5 rounded-full font-bold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 shimmer-btn flex items-center gap-2"
                    >
                      <span>Demander un Devis</span>
                      <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                    </button>

                    <button
                      onClick={() => navigateTo('services')}
                      className="bg-transparent border border-[#1a1c1c] text-[#1a1c1c] hover:bg-[#1a1c1c]/5 px-8 py-3.5 rounded-full font-bold text-sm sm:text-base transition-all duration-300 service-card-hover"
                    >
                      Explorer nos Services
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="max-w-[560px] px-0 py-0">
                    <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-primary font-semibold text-xs sm:text-sm mb-5">
                      {activeHero.eyebrow}
                    </div>

                    <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#1a1c1c] mb-5 leading-[1.12] tracking-tight">
                      {activeHero.id === 'technique' ? (
                        <>
                          Installer et maintenir <br />
                          vos équipements
                        </>
                      ) : activeHero.id === 'immobilier' ? (
                        <>
                          Projets immobiliers <br />
                          accompagnés
                        </>
                      ) : (
                        activeHero.title
                      )}
                    </h1>

                    <p className="text-base sm:text-lg text-[#364236] mb-5 max-w-2xl leading-relaxed">
                      {activeHero.description}
                    </p>

                    <div className="mb-6 flex flex-wrap gap-2">
                      {activeHero.points.map((point) => (
                        <span key={point} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#1a1c1c] shadow-sm">
                          {point}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                      <button
                        onClick={() => navigateTo('service', { slug: activeHero.id })}
                        className="bg-primary hover:bg-[#1b4c00] text-white px-8 py-3.5 rounded-full font-bold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 shimmer-btn flex items-center gap-2"
                      >
                        <span>Voir la page du service</span>
                        <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                      </button>

                      <button
                        onClick={() => navigateTo('services')}
                        className="bg-transparent border border-[#1a1c1c] text-[#1a1c1c] hover:bg-[#1a1c1c]/5 px-8 py-3.5 rounded-full font-bold text-sm sm:text-base transition-all duration-300 service-card-hover"
                      >
                        Tous les Services
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </FadeInSection>

          <button
            type="button"
            onClick={previousSlide}
            aria-label="Slide précédente"
            className="absolute left-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-primary opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white hover:opacity-100 focus:opacity-100"
          >
            <span className="material-symbols-outlined text-[30px]">chevron_left</span>
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Slide suivante"
            className="absolute right-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-primary opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white hover:opacity-100 focus:opacity-100"
          >
            <span className="material-symbols-outlined text-[30px]">chevron_right</span>
          </button>
        </section>

        <CounterSection />
        <ServicesSection onSelectService={handleSelectService} />
        <PartnersSection />
        <CtaBanner onOpenDevis={handleOpenDevis} />
      </main>

      <Footer onNavClick={handleScrollToSection} />
      <DevisModal isOpen={isDevisOpen} onClose={handleCloseDevis} />
    </div>
  );
}
