import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import CtaBanner from '../components/CtaBanner';
import Footer from '../components/Footer';
import DevisModal from '../components/DevisModal';
import FadeInSection from '../components/FadeInSection';
import { CONTACT_DETAILS, TEAM_MEMBERS } from '../data/companyData';

const TEAM_LINKEDIN_PROFILES = {
  'Koffi Marthe': 'https://ci.linkedin.com/in/marthe-ble-epse-koffi-ba957a30a',
};

export default function AboutPage({ navigateTo }) {
  const [isDevisOpen, setIsDevisOpen] = useState(false);
  const [activeDepartment, setActiveDepartment] = useState('Tous');
  const [selectedMember, setSelectedMember] = useState(null);

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

  const handleOpenDevis = () => setIsDevisOpen(true);
  const handleCloseDevis = () => setIsDevisOpen(false);

  const departments = ['Tous', 'Direction', 'Mobilité', 'Technique & Énergie'];

  const filteredTeam = activeDepartment === 'Tous'
    ? TEAM_MEMBERS
    : TEAM_MEMBERS.filter((m) => m.department === activeDepartment);

  return (
    <div className="min-h-screen bg-[#f3f7f1] text-[#1a1c1c] flex flex-col font-sans selection:bg-[#265322] selection:text-white">
      {/* Navbar */}
      <Navbar
        onOpenDevis={handleOpenDevis}
        activeTab="about"
        setActiveTab={handleNavClick}
        navigateTo={navigateTo}
      />

      <main className="flex-grow pt-20">

        {/* ==================== 1. HERO / FORGER L'AVENIR ==================== */}
        <FadeInSection
          as="section"
          immediate
          className="mt-[0.7cm] pt-6 pb-12 sm:pt-8 sm:pb-14 bg-[#f3f7f1]"
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="reveal-stagger grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left: Headline & Text */}
              <div className="reveal-item">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1b4d2e]/10 text-[#1b4d2e] text-xs font-bold uppercase tracking-wider mb-6 border border-[#1b4d2e]/20">
                  <span className="w-2 h-2 rounded-full bg-[#1b4d2e] animate-pulse"></span>
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

              {/* Right: Team Meeting Image */}
              <div className="reveal-item relative group w-full mt-2 lg:mt-3">
                <div className="absolute -inset-3 bg-gradient-to-tr from-[#1b4d2e]/15 to-emerald-200/25 rounded-[40px] blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-500"></div>
                <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-gray-200/70 aspect-[4/3] max-h-[300px] sm:max-h-[360px] lg:max-h-[420px] w-full">
                  <img
                    src="/team-meeting.jpg"
                    alt="Équipe SOUTARAH GROUP en présentation à Abidjan"
                    className="reveal-media w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* ==================== 2. NOTRE IMPACT EN CHIFFRES ==================== */}
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

        {/* ==================== 3. MISSION, VISION & VALEURS ==================== */}
        <FadeInSection as="section" className="py-12 sm:py-14 bg-[#e8f1e6]" delay={100}>
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="reveal-stagger grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">

              {/* Left: Mission & Vision stacked */}
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

              {/* Right: Values grid */}
              <div className="reveal-item lg:col-span-7 bg-[#f4f8f4] rounded-[32px] p-6 sm:p-8 border border-gray-200/60 shadow-xs">
                <h3 className="font-display font-extrabold text-2xl text-[#111827] mb-6">Nos Valeurs Fondamentales</h3>
                <div className="reveal-stagger grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: 'shield', title: 'Intégrité', desc: 'Transparence totale et éthique irréprochable dans toutes nos interactions.', color: 'text-[#1b4d2e]' },
                    { icon: 'verified', title: 'Fiabilité', desc: 'Tenir nos promesses avec constance et livrer une qualité sans compromis.', color: 'text-[#1b4d2e]' },
                    { icon: 'lightbulb', title: 'Innovation', desc: 'Adopter et créer de nouvelles approches pour résoudre des défis complexes.', color: 'text-[#1b4d2e]' },
                    { icon: 'groups', title: 'Engagement', desc: 'Un dévouement total envers la réussite de nos clients et le bien-être de nos équipes.', color: 'text-[#1b4d2e]' },
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

        {/* ==================== 4. LES VISAGES DE SOUTARAH ==================== */}
        <FadeInSection as="section" className="relative overflow-hidden bg-[#143e22] py-16 sm:py-20 lg:py-24" delay={100}>
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#70b84b]/20 blur-3xl"></div>
          <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl"></div>

          <div className="relative mx-auto max-w-[1280px] px-4 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/25 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-100 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-base">groups</span>
                  L'Équipe SOUTARAH GROUP
                </div>
                <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                  Rencontrez nos experts et leaders d'activités.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-emerald-50/80 sm:text-base">
                  Une équipe dynamique, passionnée et dédiée à concrétiser chacun de vos projets avec les plus hauts standards.
                </p>
              </div>

              {/* Department Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setActiveDepartment(dept)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                      activeDepartment === dept
                        ? 'bg-[#9de873] text-[#143e22] shadow-md'
                        : 'border border-white/20 bg-white/10 text-emerald-50 hover:bg-white/20'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredTeam.map((member, index) => (
                <article
                  key={member.id || member.name}
                  className="group relative isolate flex flex-col overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.08] backdrop-blur-md shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#9de873]/50 hover:shadow-2xl hover:shadow-[#9de873]/10"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[4/4.5] overflow-hidden bg-black/20">
                    <img
                      src={member.image}
                      alt={`${member.name}, ${member.role}`}
                      className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-108"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d2f1b] via-[#0d2f1b]/20 to-transparent" />

                    <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                      {member.department}
                    </span>

                    {/* Member Name & Role Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#9de873]">
                        {member.role}
                      </p>
                      <h3 className="mt-1 font-display text-xl font-extrabold text-white">
                        {member.name}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content & Social Network Links */}
                  <div className="flex flex-1 flex-col justify-between p-5 bg-[#0e311b]/80">
                    <p className="text-xs leading-relaxed text-emerald-50/80 line-clamp-3">
                      {member.bio}
                    </p>

                    {/* Social Media Buttons Row */}
                    <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {member.socials?.linkedin && (
                          <a
                            href={member.socials.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:scale-110 hover:bg-[#0a66c2] hover:border-[#0a66c2]"
                            title="LinkedIn"
                            aria-label={`LinkedIn de ${member.name}`}
                          >
                            <span className="text-xs font-black">in</span>
                          </a>
                        )}

                        {member.socials?.whatsapp && (
                          <a
                            href={member.socials.whatsapp}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:scale-110 hover:bg-[#25D366] hover:border-[#25D366]"
                            title="WhatsApp"
                            aria-label={`WhatsApp avec ${member.name}`}
                          >
                            <span className="material-symbols-outlined text-[17px]">chat</span>
                          </a>
                        )}

                        {member.socials?.email && (
                          <a
                            href={member.socials.email}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:scale-110 hover:bg-white hover:text-[#143e22]"
                            title="Email"
                            aria-label={`Envoyer un mail à ${member.name}`}
                          >
                            <span className="material-symbols-outlined text-[17px]">mail</span>
                          </a>
                        )}

                        {member.socials?.phone && (
                          <a
                            href={member.socials.phone}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:scale-110 hover:bg-[#9de873] hover:text-[#143e22]"
                            title="Téléphone"
                            aria-label={`Appeler ${member.name}`}
                          >
                            <span className="material-symbols-outlined text-[17px]">call</span>
                          </a>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedMember(member)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#9de873]/30 bg-[#9de873]/15 px-3 py-1.5 text-[11px] font-bold text-[#9de873] transition-all hover:bg-[#9de873] hover:text-[#143e22]"
                      >
                        Profil
                        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </FadeInSection>

        {/* Member Profile Modal */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/20 bg-[#143e22] p-6 sm:p-8 text-white shadow-2xl">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                aria-label="Fermer la modal"
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>

              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  className="h-28 w-28 rounded-2xl object-cover border-2 border-[#9de873] shadow-lg shrink-0"
                />
                <div>
                  <span className="rounded-full bg-[#9de873]/20 px-3 py-1 text-[10px] font-bold uppercase text-[#9de873]">
                    {selectedMember.department}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-extrabold">{selectedMember.name}</h3>
                  <p className="text-sm font-semibold text-emerald-200">{selectedMember.role}</p>
                </div>
              </div>

              <p className="mt-6 text-sm leading-relaxed text-emerald-50/90 border-t border-white/15 pt-5">
                {selectedMember.bio}
              </p>

              {selectedMember.specialities && (
                <div className="mt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#9de873] mb-2">Domaines d'Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.specialities.map((spec) => (
                      <span key={spec} className="rounded-xl border border-white/15 bg-white/10 px-3 py-1 text-xs text-white">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6">
                <div className="flex items-center gap-3">
                  {selectedMember.socials?.linkedin && (
                    <a href={selectedMember.socials.linkedin} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a66c2] text-white hover:opacity-90">
                      <span className="text-sm font-black">in</span>
                    </a>
                  )}
                  {selectedMember.socials?.whatsapp && (
                    <a href={selectedMember.socials.whatsapp} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white hover:opacity-90">
                      <span className="material-symbols-outlined text-lg">chat</span>
                    </a>
                  )}
                  {selectedMember.socials?.email && (
                    <a href={selectedMember.socials.email} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#143e22] hover:bg-emerald-100">
                      <span className="material-symbols-outlined text-lg">mail</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMember(null);
                    handleOpenDevis();
                  }}
                  className="rounded-full bg-[#9de873] px-6 py-2.5 text-xs font-bold text-[#143e22] shadow-md transition hover:bg-white"
                >
                  Planifier un échange
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 5. L'EXCELLENCE PAR L'ÉQUIPE ==================== */}
        <FadeInSection as="section" className="py-12 sm:py-14 bg-[#f9fbf9]" delay={100}>
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="reveal-stagger grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left: Team Meeting Image with glass badge */}
              <div className="reveal-item relative group">
                <div className="absolute -inset-4 bg-primary/10 rounded-[40px] blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-500"></div>
                <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-gray-200/70 aspect-[4/3]">
                  <img
                    src="/team-meeting.jpg"
                    alt="L'excellence par l'équipe SOUTARAH GROUP"
                    className="reveal-media w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                  {/* Floating Glass Badge */}
                  <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-white/80 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#1b4d2e] text-white flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-lg">workspace_premium</span>
                    </div>
                    <span className="font-display font-bold text-sm text-gray-900">Excellence</span>
                  </div>
                </div>
              </div>

              {/* Right: Text */}
              <div className="reveal-item">
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#111827] leading-tight mb-6">
                  L'Excellence par l'Équipe
                </h2>

                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-5">
                  Notre force réside dans notre équipe pluridisciplinaire. Composée d'ingénieurs chevronnés, de techniciens experts et de stratégistes visionnaires, chaque membre apporte une perspective unique et une <strong className="text-gray-900 font-semibold">rigueur technique absolue</strong>.
                </p>

                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-8">
                  Nous cultivons un environnement où l'excellence opérationnelle n'est pas seulement un objectif, mais une habitude quotidienne. La formation continue et la collaboration transversale assurent que nous restons à la pointe de l'industrie pour répondre aux exigences les plus strictes de nos clients corporatifs.
                </p>

                <button
                  onClick={handleOpenDevis}
                  className="bg-[#1b4d2e] hover:bg-[#143e22] text-white px-8 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 shimmer-btn active:scale-95 flex items-center gap-2"
                >
                  <span>Rencontrer nos Experts</span>
                  <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* CTA Banner */}
        <CtaBanner onOpenDevis={handleOpenDevis} />
      </main>

      {/* Footer */}
      <Footer onNavClick={handleNavClick} />

      {/* Devis Modal */}
      <DevisModal isOpen={isDevisOpen} onClose={handleCloseDevis} />
    </div>
  );
}
