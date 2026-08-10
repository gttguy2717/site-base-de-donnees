import React, { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import CtaBanner from '../components/CtaBanner';
import Footer from '../components/Footer';
import DevisModal from '../components/DevisModal';
import CarReservationModal from '../components/CarReservationModal';
import FadeInSection from '../components/FadeInSection';
import { SERVICES_DATA } from '../data/servicesData';

function OfficialImage({ src, alt, className = '', loading = 'lazy' }) {
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      onError={(event) => {
        event.currentTarget.style.opacity = '0';
      }}
    />
  );
}

export default function ServiceDetailPage({ service, navigateTo }) {
  const [isDevisOpen, setIsDevisOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [activeFleetCategory, setActiveFleetCategory] = useState('Toutes');
  const fleetCarouselRef = useRef(null);

  const relatedServices = useMemo(
    () => SERVICES_DATA.filter((item) => item.id !== service.id).slice(0, 2),
    [service.id],
  );

  const fleetCategories = useMemo(
    () => ['Toutes', ...new Set(service.rentalVehicles?.map((vehicle) => vehicle.category) ?? [])],
    [service.rentalVehicles],
  );

  const displayedVehicles = useMemo(() => {
    if (!service.rentalVehicles || activeFleetCategory === 'Toutes') return service.rentalVehicles ?? [];
    return service.rentalVehicles.filter((vehicle) => vehicle.category === activeFleetCategory);
  }, [activeFleetCategory, service.rentalVehicles]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedVehicle(null);
    setActiveFleetCategory('Toutes');
  }, [service.id]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      fleetCarouselRef.current?.scrollTo({ left: 0, behavior: 'auto' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeFleetCategory, service.id]);

  const scrollFleet = (direction) => {
    const carousel = fleetCarouselRef.current;
    if (!carousel) return;

    const distance = Math.min(Math.max(carousel.clientWidth * 0.82, 280), 440);
    carousel.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };

  const handleFooterNavigation = (target) => {
    if (target === 'services') {
      navigateTo('services');
      return;
    }

    if (target === 'about') {
      navigateTo('about');
      return;
    }

    if (target === 'projects' || target === 'careers' || target === 'contact') {
      navigateTo(target);
      return;
    }

    navigateTo('home', { section: target });
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex flex-col font-sans selection:bg-primary selection:text-white">
      <Navbar
        onOpenDevis={() => setIsDevisOpen(true)}
        activeTab="services"
        navigateTo={navigateTo}
      />

      <main className="flex-grow pt-20">
        <section className="relative overflow-hidden bg-[#f4f8f4] pb-14 pt-12 sm:pb-20 sm:pt-16">
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-[10%] h-48 w-48 rounded-full bg-[#69c33b]/10 blur-3xl" />

          <div className="relative max-w-[1280px] mx-auto px-4 sm:px-8">
            <FadeInSection immediate>
              <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500 sm:mb-10">
                <button onClick={() => navigateTo('home')} className="transition-colors hover:text-primary">Accueil</button>
                <span className="material-symbols-outlined text-sm text-gray-400">chevron_right</span>
                <button onClick={() => navigateTo('services')} className="transition-colors hover:text-primary">Services</button>
                <span className="material-symbols-outlined text-sm text-gray-400">chevron_right</span>
                <span className="font-bold text-[#1a1c1c]">{service.title}</span>
              </nav>
            </FadeInSection>

            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
              <FadeInSection immediate>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[17px]">{service.icon}</span>
                  {service.eyebrow}
                </div>

                <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-[#111827] sm:text-5xl lg:text-[3.55rem]">
                  {service.title}
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">{service.intro}</p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => setIsDevisOpen(true)}
                    className="shimmer-btn inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-[#1b4c00] hover:shadow-xl active:scale-95"
                  >
                    Demander un devis
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                  <button
                    onClick={() => document.getElementById('prestations')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#1b4d2e]/20 bg-white/80 px-6 py-3 text-sm font-bold text-[#1b4d2e] transition-colors hover:bg-white"
                  >
                    Voir les prestations
                    <span className="material-symbols-outlined text-base">south</span>
                  </button>
                </div>

                <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-[#1b4d2e]/10 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                    <span className="material-symbols-outlined text-xl">verified</span>
                  </span>
                  <div>
                    <p className="font-display text-lg font-extrabold tracking-tight text-[#111827]">{service.stat.value}</p>
                    <p className="text-xs font-semibold text-gray-500">{service.stat.label}</p>
                  </div>
                </div>
              </FadeInSection>

              <FadeInSection delay={120}>
                <div className="relative mx-auto max-w-[620px]">
                  <div className="absolute -inset-4 rounded-[40px] bg-primary/10 blur-2xl" />
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] border border-white/90 bg-white shadow-2xl shadow-[#1b4d2e]/12">
                    <OfficialImage
                      src={service.heroImage}
                      alt={service.title}
                      loading="eager"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/55 via-transparent to-transparent" />
                    <div className="absolute bottom-5 left-5 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1b4d2e] shadow-lg backdrop-blur-md sm:bottom-6 sm:left-6">
                      Visuel officiel · Soutarah Group
                    </div>
                  </div>
                  <div className="absolute -bottom-5 -right-2 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-xl backdrop-blur-sm sm:right-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-xl">{service.icon}</span>
                    </span>
                    <span className="text-xs font-bold leading-tight text-[#111827]">Une solution<br />à votre mesure</span>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        <FadeInSection as="section" className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Notre accompagnement</span>
                <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-[#111827] sm:text-4xl">
                  Concevoir une réponse utile, concrète et durable.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-gray-600">{service.overview}</p>
                <button
                  onClick={() => setIsDevisOpen(true)}
                  className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-bold text-primary transition-colors hover:text-[#1b4c00]"
                >
                  Échangeons sur votre besoin
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:col-span-7 lg:gap-5">
                {service.highlights.map((item) => (
                  <div key={item.title} className="rounded-[24px] border border-gray-200/80 bg-[#f9fbf9] p-5 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 sm:p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                    </div>
                    <h3 className="mt-5 font-display text-base font-bold text-[#111827]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeInSection>

        <FadeInSection as="section" id="prestations" className="scroll-mt-24 bg-[#f4f8f4] py-16 sm:py-20 lg:py-24">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="mb-10 max-w-2xl sm:mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Les prestations</span>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">L’expertise en action.</h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">Des axes d’intervention présentés avec les visuels de l’activité officielle de SOUTARAH GROUP.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {service.offers.map((offer, index) => (
                <article key={offer.title} className="group overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10">
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-200">
                    <OfficialImage
                      src={offer.image}
                      alt={offer.alt}
                      loading={index > 2 ? 'lazy' : 'eager'}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b2211]/65 via-transparent to-transparent" />
                    <span className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-primary shadow-md backdrop-blur-sm">
                      <span className="material-symbols-outlined text-[22px]">{offer.icon}</span>
                    </span>
                    <span className="absolute right-4 top-4 rounded-full border border-white/30 bg-black/20 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">0{index + 1}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-bold text-[#111827] transition-colors group-hover:text-primary">{offer.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{offer.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </FadeInSection>

        {service.information && (
          <FadeInSection as="section" className="bg-white py-16 sm:py-20">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
              <div className="mb-9 max-w-2xl sm:mb-10">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">En détail</span>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">Les informations utiles pour votre projet.</h2>
              </div>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {service.information.map((item) => (
                  <article key={item.title} className="rounded-[28px] border border-gray-200/80 bg-[#f9fbf9] p-6 shadow-sm sm:p-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                    </div>
                    <h3 className="mt-5 font-display text-xl font-bold text-[#111827]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.text}</p>
                    <ul className="mt-5 space-y-2.5 border-t border-gray-200/80 pt-5">
                      {item.points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700">
                          <span className="material-symbols-outlined mt-0.5 text-[17px] text-primary">check_circle</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </FadeInSection>
        )}

        {service.rentalVehicles && (
          <FadeInSection as="section" id="flotte" className="scroll-mt-24 bg-[#f8faf7] py-14 sm:py-18 lg:py-20">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                    <span className="material-symbols-outlined text-[15px]">directions_car</span>
                    La flotte Car Rental
                  </div>
                  <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">Choisissez le véhicule qui vous accompagne.</h2>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-primary/15 bg-white px-4 py-2.5 shadow-sm text-primary">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
                    <span className="material-symbols-outlined text-[18px]">directions_car</span>
                  </span>
                  <span>
                    <strong className="block text-base leading-none font-extrabold">{displayedVehicles.length}</strong>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">véhicules</span>
                  </span>
                </div>
              </div>

              {/* Categorization Filter */}
              <div className="mt-7 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
                {fleetCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveFleetCategory(category)}
                    aria-pressed={activeFleetCategory === category}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                      activeFleetCategory === category
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'border border-gray-200 bg-white text-gray-600 hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Single Line Carousel Slider Container */}
              <div className="relative mt-6">
                {/* Left/Right Directional Arrow Overlays for Desktop */}
                <button
                  type="button"
                  onClick={() => scrollFleet(-1)}
                  aria-label="Précédent"
                  className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-primary shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-primary hover:text-white"
                >
                  <span className="material-symbols-outlined text-2xl">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollFleet(1)}
                  aria-label="Suivant"
                  className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-primary shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-primary hover:text-white"
                >
                  <span className="material-symbols-outlined text-2xl">chevron_right</span>
                </button>

                {/* Left/Right Fading Gradients */}
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#f8faf7] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#f8faf7] to-transparent" />

                {/* Single Row Flex Container */}
                <div
                  ref={fleetCarouselRef}
                  role="region"
                  aria-label="Flotte de véhicules disponibles en carrousel"
                  className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pt-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  {displayedVehicles.map((vehicle, index) => (
                    <article
                      key={vehicle.name}
                      className="group flex w-[290px] sm:w-[340px] md:w-[360px] shrink-0 snap-start flex-col overflow-hidden rounded-[24px] border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#edf1ec]">
                        <OfficialImage
                          src={vehicle.image}
                          alt={vehicle.name}
                          loading={index > 2 ? 'lazy' : 'eager'}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#09220f]/60 via-transparent to-transparent" />
                        <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                          {vehicle.category}
                        </span>
                        <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-extrabold text-primary shadow-sm">
                          Modèle 0{index + 1}
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-display text-lg font-bold text-[#111827] transition-colors group-hover:text-primary">
                          {vehicle.name}
                        </h3>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {vehicle.specs.map((spec, specIndex) => (
                            <span key={spec} className="flex items-center gap-1.5 rounded-xl bg-[#f2f7ef] px-2.5 py-1.5 text-[11px] font-semibold text-gray-700">
                              <span className="material-symbols-outlined text-[14px] text-primary">
                                {['group', 'local_gas_station', 'settings', 'verified_user'][specIndex]}
                              </span>
                              <span className="truncate">{spec}</span>
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => setSelectedVehicle(vehicle)}
                          className="shimmer-btn mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/15 transition-all hover:bg-[#1b4c00] active:scale-95"
                        >
                          Réserver ce véhicule
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </FadeInSection>
        )}

        <FadeInSection as="section" className="bg-white py-14 sm:py-16 lg:py-20">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="rounded-[30px] bg-[#143e22] p-6 text-white shadow-xl sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_2fr] lg:items-center lg:gap-12">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">Un parcours clair</span>
                  <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight sm:text-3xl">Votre projet, étape par étape.</h2>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-emerald-100/85">Une démarche simple pour partir du bon besoin et avancer avec la bonne solution.</p>
                </div>
                <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {service.process.map((step, index) => (
                    <li key={step} className="relative rounded-2xl border border-white/10 bg-white/[0.07] p-4 pl-14">
                      <span className="absolute left-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#69c33b] text-xs font-black text-[#143e22]">{index + 1}</span>
                      <span className="text-sm font-bold leading-snug text-white">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </FadeInSection>

        <FadeInSection as="section" className="bg-[#f9f9f9] py-14 sm:py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Continuer votre exploration</span>
                <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">D’autres expertises à découvrir.</h2>
              </div>
              <button onClick={() => navigateTo('services')} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-[#1b4c00]">
                Voir tous les services
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {relatedServices.map((related) => (
                <button
                  key={related.id}
                  onClick={() => navigateTo('service', { slug: related.id })}
                  className="group flex min-h-[170px] overflow-hidden rounded-[26px] border border-gray-200/80 bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="w-[42%] shrink-0 overflow-hidden">
                    <OfficialImage src={related.image} alt={related.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">{related.eyebrow}</span>
                    <h3 className="mt-2 font-display text-lg font-bold text-[#111827]">{related.title}</h3>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#1b4d2e]">Découvrir <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">arrow_forward</span></span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </FadeInSection>

        <CtaBanner onOpenDevis={() => setIsDevisOpen(true)} />
      </main>

      <Footer onNavClick={handleFooterNavigation} />
      <DevisModal isOpen={isDevisOpen} onClose={() => setIsDevisOpen(false)} />
      <CarReservationModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
    </div>
  );
}
