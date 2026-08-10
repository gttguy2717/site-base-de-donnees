import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import CtaBanner from '../components/CtaBanner';
import Footer from '../components/Footer';
import DevisModal from '../components/DevisModal';
import FadeInSection from '../components/FadeInSection';
import { SERVICES_DATA } from '../data/servicesData';

export default function ServicesPage({ navigateTo }) {
  const [isDevisOpen, setIsDevisOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFooterNavigation = (target) => {
    if (target === 'services') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <section className="relative overflow-hidden bg-[#f4f8f4] pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24">
          <div className="absolute -top-28 right-[8%] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#69c33b]/15 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.13] [background-image:radial-gradient(#296c00_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="relative max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 xl:gap-20 items-center">
              <FadeInSection immediate className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Nos expertises
                </div>

                <h1 className="mt-6 max-w-2xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-[#111827] sm:text-5xl lg:text-6xl">
                  Un partenaire,
                  <span className="block text-primary">plusieurs réponses.</span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-700 sm:text-lg">
                  Découvrez chaque activité, ses prestations et les solutions que notre équipe peut construire avec vous.
                </p>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-500 sm:text-base">
                  SOUTARAH GROUP réunit des expertises complémentaires pour accompagner les projets de mobilité, d’énergie, de commerce, de technique, d’immobilier et d’agropastoral.
                </p>

                <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
                  <button
                    onClick={() => document.getElementById('expertises')?.scrollIntoView({ behavior: 'smooth' })}
                    className="shimmer-btn inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-[#1b4c00] hover:shadow-xl active:scale-95"
                  >
                    Explorer les expertises
                    <span className="material-symbols-outlined text-base">arrow_downward</span>
                  </button>
                  <button
                    onClick={() => setIsDevisOpen(true)}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#1b4d2e]/25 bg-white/70 px-6 py-3 text-sm font-bold text-[#1b4d2e] transition-colors hover:bg-white"
                  >
                    Parler de mon projet
                    <span className="material-symbols-outlined text-base">north_east</span>
                  </button>
                </div>

                <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 border-t border-[#1b4d2e]/10 pt-6 sm:gap-5">
                  {[
                    { value: '6', label: 'domaines d’expertise' },
                    { value: '1', label: 'interlocuteur dédié' },
                    { value: '100%', label: 'approche sur mesure' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="font-display text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">{item.value}</div>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 sm:text-xs">{item.label}</p>
                    </div>
                  ))}
                </div>
              </FadeInSection>

              <FadeInSection delay={120} className="lg:col-span-6">
                <div className="relative mx-auto max-w-[600px] pb-14">
                  <div className="absolute -inset-4 rounded-[38px] bg-primary/15 blur-2xl" />
                  <div className="relative grid h-[320px] grid-cols-[1.15fr_0.85fr] grid-rows-2 gap-2 rounded-[32px] border border-white/30 bg-[#143e22] p-2 shadow-2xl shadow-[#1b4d2e]/20 sm:h-[390px] sm:gap-2.5 sm:p-2.5">
                    {SERVICES_DATA.slice(0, 3).map((service, index) => (
                      <div
                        key={service.id}
                        className={`group relative min-h-0 overflow-hidden rounded-[23px] ${index === 0 ? 'row-span-2' : ''}`}
                      >
                        <img
                          src={service.image}
                          alt={service.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 text-white">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-base backdrop-blur-sm">
                            <span className="material-symbols-outlined text-[18px]">{service.icon}</span>
                          </span>
                          <span className="text-xs font-bold leading-tight sm:text-sm">{service.shortTitle}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-0 left-0 hidden rounded-2xl border border-white/90 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                      <span className="material-symbols-outlined text-xl">hub</span>
                    </span>
                    <span className="text-xs font-bold leading-tight text-[#1a1c1c]">Des solutions reliées<br />à vos priorités.</span>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        <FadeInSection as="section" id="expertises" className="scroll-mt-24 bg-white py-16 sm:py-20 lg:py-24">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Nos domaines d’intervention</span>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">
                  Une expertise adaptée à chaque ambition.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-gray-500 sm:text-base ">
                Parcourez nos savoir-faire et trouvez le bon point de départ pour votre projet.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {SERVICES_DATA.map((service, index) => (
                <article
                  key={service.id}
                  className="group flex min-h-full flex-col overflow-hidden rounded-[28px] border border-gray-200/80 bg-[#fdfefd] shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      loading={index > 2 ? 'lazy' : 'eager'}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b2211]/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-primary shadow-md backdrop-blur-sm">
                      <span className="material-symbols-outlined text-[23px]">{service.icon}</span>
                    </div>
                    <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">0{index + 1}</span>
                  </div>

                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{service.eyebrow}</p>
                    <h3 className="mt-2 font-display text-xl font-bold text-[#111827] transition-colors group-hover:text-primary">{service.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">{service.description}</p>
                    <button
                      onClick={() => navigateTo('service', { slug: service.id })}
                      className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-[#1b4d2e]/15 px-4 py-2 text-sm font-bold text-[#1b4d2e] transition-all hover:border-primary hover:bg-primary hover:text-white"
                    >
                      Découvrir l’expertise
                      <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </FadeInSection>

        <FadeInSection as="section" className="bg-[#f2f7ef] py-14 sm:py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                { icon: 'forum', title: 'Écoute du besoin', text: 'Chaque projet commence par une compréhension précise de vos attentes.' },
                { icon: 'account_tree', title: 'Solution construite', text: 'Nous mobilisons l’expertise la plus pertinente pour votre contexte.' },
                { icon: 'task_alt', title: 'Accompagnement continu', text: 'Nos équipes restent présentes jusqu’aux prochaines étapes du projet.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 rounded-[24px] border border-[#1b4d2e]/10 bg-white/80 p-5 shadow-sm sm:p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-[#111827]">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>

        <CtaBanner onOpenDevis={() => setIsDevisOpen(true)} />
      </main>

      <Footer onNavClick={handleFooterNavigation} />
      <DevisModal isOpen={isDevisOpen} onClose={() => setIsDevisOpen(false)} />
    </div>
  );
}
