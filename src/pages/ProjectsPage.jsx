import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import CtaBanner from '../components/CtaBanner';
import Footer from '../components/Footer';
import DevisModal from '../components/DevisModal';
import FadeInSection from '../components/FadeInSection';
import { PROJECT_PRINCIPLES, REALIZED_PROJECTS } from '../data/companyData';

const PROJECT_HERO_IMAGE = 'https://soutarahgroup.ci/img/project.jpeg';
const TECHNICIAN_IMAGE = 'https://soutarahgroup.ci/img/tecg.jpeg';
const TECHNICIAN_DETAIL_IMAGE = 'https://soutarahgroup.ci/img/installatio,.webp';

const PROJECT_REALIZATIONS = [
  {
    category: 'Énergies renouvelables',
    title: 'Solutions solaires',
    text: 'Des études, équipements et installations photovoltaïques pensés pour chaque site.',
    image: 'https://soutarahgroup.ci/img/installation.jpg',
    alt: 'Installation solaire présentée par Soutarah Group',
    icon: 'solar_power',
    layout: 'md:col-span-7 md:row-span-2 min-h-[390px] sm:min-h-[440px]',
    featured: true,
  },
  {
    category: 'Services techniques',
    title: 'Interventions de précision',
    text: 'Installation, maintenance et suivi des équipements techniques.',
    image: TECHNICIAN_DETAIL_IMAGE,
    alt: 'Intervention technique présentée par Soutarah Group',
    icon: 'engineering',
    layout: 'md:col-span-5 min-h-[220px]',
  },
  {
    category: 'Immobilier',
    title: 'Espaces à valoriser',
    text: 'Terrains, rénovation et espaces conçus pour les projets de vie ou d’activité.',
    image: 'https://soutarahgroup.ci/img/immobilier.jpeg',
    alt: 'Projet immobilier présenté par Soutarah Group',
    icon: 'home_work',
    layout: 'md:col-span-5 min-h-[220px]',
  },
  {
    category: 'Mobilité',
    title: 'Mobilité d’entreprise',
    text: 'Une flotte et des formules de déplacement adaptées aux équipes.',
    image: 'https://soutarahgroup.ci/img/carPlay.jpg',
    alt: 'Solution de mobilité présentée par Soutarah Group',
    icon: 'directions_car',
    layout: 'md:col-span-4 min-h-[250px]',
  },
  {
    category: 'Négoce',
    title: 'Approvisionnement ciblé',
    text: 'Des produits et équipements recherchés selon les besoins du projet.',
    image: 'https://soutarahgroup.ci/img/Negoce-ie.jpg',
    alt: 'Activité de négoce présentée par Soutarah Group',
    icon: 'inventory_2',
    layout: 'md:col-span-4 min-h-[250px]',
  },
  {
    category: 'Agropastorale',
    title: 'Production durable',
    text: 'Une approche intégrée qui relie agriculture, élevage et responsabilité.',
    image: 'https://soutarahgroup.ci/img/fermi.jpeg',
    alt: 'Activité agropastorale présentée par Soutarah Group',
    icon: 'agriculture',
    layout: 'md:col-span-4 min-h-[250px]',
  },
];

export default function ProjectsPage({ navigateTo, onRequestQuote }) {
  const [isDevisOpen, setIsDevisOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [selectedRealizedProject, setSelectedRealizedProject] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFooterNavigation = (target) => {
    if (target === 'home') {
      navigateTo('home', { section: 'home' });
      return;
    }

    navigateTo(target);
  };

  const categories = ['Tous', 'Énergie', 'Mobilité', 'Immobilier', 'Technique', 'Négoce', 'Agropastoral'];

  const filteredProjects = activeCategory === 'Tous'
    ? REALIZED_PROJECTS
    : REALIZED_PROJECTS.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#eef3ec] text-[#1a1c1c] flex flex-col font-sans selection:bg-primary selection:text-white">
      <Navbar onOpenDevis={() => (onRequestQuote || ((openModal) => openModal()))(() => setIsDevisOpen(true))} activeTab="projects" navigateTo={navigateTo} />

      <main className="flex-grow pt-28">
        <section className="relative isolate flex min-h-[calc(100svh-5rem)] flex-col justify-center overflow-hidden bg-[#143e22] pb-14 pt-10 text-white sm:pb-16 sm:pt-12 lg:pb-20 lg:pt-14">
          <img src={PROJECT_HERO_IMAGE} alt="Galerie projets Soutarah Group" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#102f1a] via-[#143e22]/95 to-[#143e22]/65" />
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#69c33b]/20 blur-3xl" />
          <div className="absolute bottom-0 left-[30%] h-40 w-80 rounded-full bg-[#296c00]/50 blur-3xl" />

          <div className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
              <FadeInSection immediate className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/25 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-emerald-100 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  Projets & Réalisations
                </div>
                <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.35rem]">
                  Des idées d'envergure,
                  <span className="block text-[#9de873]">des projets livrés avec succès.</span>
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/85 sm:text-lg">
                  Découvrez les réalisations emblématiques de SOUTARAH GROUP dans l'énergie solaire, la mobilité d'entreprise, les services techniques et l'immobilier.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={() => document.getElementById('galerie-realisations')?.scrollIntoView({ behavior: 'smooth' })} className="shimmer-btn inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#143e22] shadow-lg transition-colors hover:bg-emerald-50">
                    Explorer les réalisations
                    <span className="material-symbols-outlined text-base">south</span>
                  </button>
                  <button onClick={() => (onRequestQuote || ((openModal) => openModal()))(() => setIsDevisOpen(true))} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/15">
                    Proposer un projet
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </FadeInSection>

              <FadeInSection delay={120} className="lg:col-span-5">
                <div className="relative mx-auto max-w-[465px]">
                  <div className="absolute -inset-4 rounded-[36px] bg-[#69c33b]/20 blur-2xl" />
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[30px] border border-white/20 bg-[#143e22] shadow-2xl">
                    <img src={TECHNICIAN_IMAGE} alt="Technicien au travail" className="h-full w-full object-cover object-center" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#102f1a]/80 via-[#102f1a]/10 to-transparent" />
                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#143e22]/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-50 backdrop-blur-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#9de873]" />
                      Des résultats vérifiés
                    </div>
                    <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200">Portfolio Certifié</p>
                      <p className="mt-1 font-display text-lg font-extrabold text-white">Des performances mesurables sur le terrain.</p>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        <FadeInSection as="section" className="bg-[#dcebd8] py-12 sm:py-14">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {PROJECT_PRINCIPLES.map((item) => (
                <article key={item.title} className="rounded-[24px] border border-white/70 bg-white/75 p-6 shadow-sm backdrop-blur-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  </span>
                  <h2 className="mt-4 font-display text-lg font-bold text-[#111827]">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </FadeInSection>

        <FadeInSection as="section" id="galerie-realisations" className="scroll-mt-24 overflow-hidden bg-[#f4f8f2] py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Projets Réalisés</span>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">
                  Les réalisations concrètes de l'entreprise.
                </h2>
                <p className="mt-3 text-base leading-relaxed text-gray-600">
                  Découvrez nos références chantiers, installations solaires, livraisons de flottes et aménagements en Côte d'Ivoire.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                      activeCategory === cat
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'border border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <article
                  key={project.id}
                  className="group flex flex-col overflow-hidden rounded-[28px] border border-gray-200/90 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    
                    <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-black/30 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                      {project.categoryLabel}
                    </span>

                    <span className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold text-[#143e22] shadow-sm">
                      {project.year}
                    </span>

                    <div className="absolute bottom-3 left-4 right-4">
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-emerald-200">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {project.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h3 className="font-display text-xl font-bold text-[#111827] group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-3">
                        {project.summary}
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
                      {project.metrics.map((metric) => (
                        <div key={metric.label} className="rounded-xl bg-[#f4f8f4] p-2 text-center">
                          <span className="block font-display text-sm font-extrabold text-primary">{metric.value}</span>
                          <span className="block text-[9px] font-bold text-gray-500 truncate">{metric.label}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedRealizedProject(project)}
                      className="shimmer-btn mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-[#f2f7ef] px-4 py-2.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-white"
                    >
                      Détails de la réalisation
                      <span className="material-symbols-outlined text-sm">visibility</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </FadeInSection>

        {selectedRealizedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/20 bg-white p-6 sm:p-8 text-[#111827] shadow-2xl">
              <button
                type="button"
                onClick={() => setSelectedRealizedProject(null)}
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-primary hover:text-white transition"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>

              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100 mb-6">
                <img src={selectedRealizedProject.image} alt={selectedRealizedProject.title} className="h-full w-full object-cover" />
                <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-md">
                  {selectedRealizedProject.categoryLabel}
                </span>
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-primary">{selectedRealizedProject.client} · {selectedRealizedProject.year}</span>
              <h3 className="mt-1 font-display text-2xl font-extrabold text-[#111827]">{selectedRealizedProject.title}</h3>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-gray-500">
                <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                {selectedRealizedProject.location}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-gray-700 border-t border-gray-100 pt-4">
                {selectedRealizedProject.details}
              </p>

              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Indicateurs d'impact</h4>
                <div className="grid grid-cols-3 gap-3">
                  {selectedRealizedProject.metrics.map((m) => (
                    <div key={m.label} className="rounded-2xl border border-primary/20 bg-[#f4f8f4] p-3 text-center">
                      <span className="block font-display text-lg font-black text-primary">{m.value}</span>
                      <span className="block text-[10px] font-bold text-gray-600">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {selectedRealizedProject.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={() => setSelectedRealizedProject(null)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-900"
                >
                  Fermer
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRealizedProject(null);
                    (onRequestQuote || ((openModal) => openModal()))(() => setIsDevisOpen(true));
                  }}
                  className="rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#1b4c00]"
                >
                  Demander un projet similaire
                </button>
              </div>
            </div>
          </div>
        )}

        <FadeInSection as="section" id="univers-projets" className="scroll-mt-24 bg-[#f7faf6] py-16 sm:py-20 lg:py-24">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="mb-10 max-w-2xl sm:mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Notre manière de faire</span>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">Faire avancer une idée jusqu’à son impact.</h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">La page officielle met en avant l’innovation, l’excellence et l’engagement de l’équipe. Ici, ces principes prennent la forme d’un parcours projet simple et lisible.</p>
            </div>

            <div className="grid grid-cols-1 overflow-hidden rounded-[32px] border border-[#d8e7d5] bg-white shadow-xl shadow-[#1b4d2e]/10 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-h-[320px] overflow-hidden lg:min-h-full">
                <img src={PROJECT_HERO_IMAGE} alt="Projet Soutarah Group" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09220f]/85 via-[#143e22]/35 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur-md sm:bottom-8 sm:left-8 sm:right-8 sm:p-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100">Une approche collective</span>
                  <p className="mt-2 font-display text-xl font-extrabold leading-tight">La qualité se construit dans les détails.</p>
                </div>
              </div>

              <div className="p-6 sm:p-8 lg:p-10">
                <ol className="space-y-3">
                  {[
                    { number: '01', icon: 'forum', title: 'Comprendre l’enjeu', text: 'Écouter le besoin, son contexte et l’objectif à atteindre.' },
                    { number: '02', icon: 'account_tree', title: 'Réunir les bonnes expertises', text: 'Mobiliser les compétences utiles autour d’une direction claire.' },
                    { number: '03', icon: 'construction', title: 'Faire progresser la solution', text: 'Organiser les actions avec attention, méthode et réactivité.' },
                    { number: '04', icon: 'eco', title: 'Viser un impact durable', text: 'Chercher une réponse fiable qui reste pertinente dans le temps.' },
                  ].map((step) => (
                    <li key={step.number} className="group flex gap-4 rounded-2xl border border-transparent p-3 transition-colors hover:border-primary/15 hover:bg-[#f2f7ef] sm:p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><span className="material-symbols-outlined text-[20px]">{step.icon}</span></span>
                      <span className="flex-1"><span className="flex items-center gap-2"><span className="text-[10px] font-black tracking-[0.14em] text-primary">{step.number}</span><span className="font-display text-base font-bold text-[#111827]">{step.title}</span></span><span className="mt-1 block text-sm leading-relaxed text-gray-600">{step.text}</span></span>
                    </li>
                  ))}
                </ol>
                <button onClick={() => (onRequestQuote || ((openModal) => openModal()))(() => setIsDevisOpen(true))} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/15 transition-colors hover:bg-[#1b4c00]">Échanger sur un projet <span className="material-symbols-outlined text-base">arrow_forward</span></button>
              </div>
            </div>
          </div>
        </FadeInSection>

        <FadeInSection as="section" className="bg-[#143e22] py-16 text-white sm:py-20">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">Les compétences au cœur des projets</span>
                <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">Concrétiser avec maîtrise, attention et méthode.</h2>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-emerald-50/80">Les interventions techniques illustrent la volonté de transformer une intention en solution opérationnelle, avec un regard attentif sur la qualité et la durabilité.</p>
                <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { icon: 'engineering', label: 'Savoir-faire' },
                    { icon: 'shield', label: 'Fiabilité' },
                    { icon: 'task_alt', label: 'Suivi' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 text-center sm:p-4"><span className="material-symbols-outlined text-xl text-[#9de873]">{item.icon}</span><p className="mt-2 text-[11px] font-bold text-emerald-50">{item.label}</p></div>
                  ))}
                </div>
              </div>
              <div className="relative overflow-hidden rounded-[30px] border border-white/10 shadow-2xl">
                <img src={TECHNICIAN_DETAIL_IMAGE} alt="Intervention technique Soutarah Group" className="aspect-[16/10] h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09220f]/75 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-6 sm:left-6 sm:right-6">
                  <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-50 backdrop-blur-md">Intervention technique</span>
                  <span className="hidden text-right text-xs font-semibold text-emerald-50/90 sm:block">L’exigence se voit<br />dans chaque détail.</span>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>

        <CtaBanner onOpenDevis={() => (onRequestQuote || ((openModal) => openModal()))(() => setIsDevisOpen(true))} />
      </main>

      <Footer onNavClick={handleFooterNavigation} />
      <DevisModal isOpen={isDevisOpen} onClose={() => setIsDevisOpen(false)} />
    </div>
  );
}
