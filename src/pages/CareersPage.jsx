import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DevisModal from '../components/DevisModal';
import FadeInSection from '../components/FadeInSection';
import { SERVICES_DATA } from '../data/servicesData';
import { CONTACT_DETAILS, PROJECT_PRINCIPLES } from '../data/companyData';

const TECHNICIAN_IMAGE = 'https://soutarahgroup.ci/img/tecg.jpeg';

const initialApplication = {
  name: '',
  email: '',
  phone: '',
  field: '',
  message: '',
};

export default function CareersPage({ navigateTo }) {
  const [isDevisOpen, setIsDevisOpen] = useState(false);
  const [application, setApplication] = useState(initialApplication);
  const [isPrepared, setIsPrepared] = useState(false);

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setApplication((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const subject = `Candidature spontanée — ${application.name}`;
    const body = [
      `Nom : ${application.name}`,
      `E-mail : ${application.email}`,
      `Téléphone : ${application.phone}`,
      `Domaine d’intérêt : ${application.field || 'Non précisé'}`,
      '',
      application.message,
      '',
      'CV à joindre à cet e-mail.',
    ].join('\n');

    setIsPrepared(true);
    window.location.href = `${CONTACT_DETAILS.emailHref}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-[#f3f7f1] text-[#1a1c1c] flex flex-col font-sans selection:bg-primary selection:text-white">
      <Navbar onOpenDevis={() => setIsDevisOpen(true)} activeTab="careers" navigateTo={navigateTo} />

      <main className="flex-grow pt-20">
        <section className="relative flex min-h-[calc(100svh-5rem)] flex-col justify-center overflow-hidden bg-[#253f22] py-12 text-white sm:py-14 lg:py-16">
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(#9de873_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#69c33b]/25 blur-3xl" />
          <div className="absolute -bottom-28 left-[10%] h-64 w-64 rounded-full bg-primary/50 blur-3xl" />

          <div className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
              <FadeInSection immediate className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-emerald-100 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[16px]">diversity_3</span>
                  Carrières
                </div>
                <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.35rem]">
                  Faites grandir vos talents
                  <span className="block text-[#9de873]">avec des projets qui comptent.</span>
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/85 sm:text-lg">SOUTARAH GROUP rassemble des expertises complémentaires, de la mobilité à l’énergie, du technique à l’immobilier. Nous accueillons les profils motivés qui souhaitent contribuer à des projets utiles et durables.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={() => document.getElementById('candidature')?.scrollIntoView({ behavior: 'smooth' })} className="shimmer-btn inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#253f22] shadow-lg transition-colors hover:bg-emerald-50">
                    Envoyer ma candidature
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                  <button onClick={() => navigateTo('services')} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/15">
                    Découvrir les expertises
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </FadeInSection>

              <FadeInSection delay={120} className="lg:col-span-5">
                <div className="relative mx-auto max-w-[465px]">
                  <div className="absolute -inset-4 rounded-[36px] bg-[#69c33b]/20 blur-2xl" />
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[30px] border border-white/20 bg-[#143e22] shadow-2xl">
                    <img src={TECHNICIAN_IMAGE} alt="Technicien au travail" className="h-full w-full object-cover object-center" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#102f1a]/85 via-[#102f1a]/15 to-transparent" />
                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#143e22]/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-50 backdrop-blur-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#9de873]" />
                      Le terrain, au cœur du métier
                    </div>
                    <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200">Une culture de l’action</p>
                      <p className="mt-1 font-display text-lg font-extrabold text-white">Mettre la précision et l’énergie au service de chaque mission.</p>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        <FadeInSection as="section" className="bg-[#dbead7] py-14 sm:py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {PROJECT_PRINCIPLES.map((item) => (
                <div key={item.title} className="flex gap-4 rounded-[24px] border border-white/70 bg-white/75 p-5 shadow-sm sm:p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><span className="material-symbols-outlined text-[22px]">{item.icon}</span></span>
                  <div><h2 className="font-display text-base font-bold text-[#111827]">{item.title}</h2><p className="mt-1.5 text-sm leading-relaxed text-gray-600">{item.text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>

        <FadeInSection as="section" id="candidature" className="scroll-mt-24 bg-[#eef4eb] py-16 sm:py-20 lg:py-24">
          <div className="max-w-[1040px] mx-auto px-4 sm:px-8">
            <div className="overflow-hidden rounded-[32px] border border-[#cadcc6] bg-white shadow-2xl shadow-[#1b4d2e]/10">
              <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="bg-[#143e22] p-7 text-white sm:p-9">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#69c33b] text-[#143e22]"><span className="material-symbols-outlined text-2xl">send</span></span>
                  <span className="mt-6 block text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">Candidature spontanée</span>
                  <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight">Votre prochain défi peut commencer ici.</h2>
                  <p className="mt-4 text-sm leading-relaxed text-emerald-50/85">Le site officiel ne publie pas d’offre ouverte dans une rubrique dédiée. Vous pouvez toutefois présenter votre profil et votre domaine d’intérêt à l’équipe.</p>
                  <div className="mt-8 border-t border-white/10 pt-6"><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">Adresse de candidature</p><a href={CONTACT_DETAILS.emailHref} className="mt-2 block break-all font-display text-lg font-bold text-white hover:text-[#9de873]">{CONTACT_DETAILS.email}</a><p className="mt-3 text-xs leading-relaxed text-emerald-50/70">Pensez à joindre votre CV lorsque votre messagerie s’ouvrira.</p></div>
                </div>

                <div className="p-6 sm:p-8">
                  {!isPrepared ? (
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-[#1a1c1c]">Nom complet *</span><input name="name" required value={application.name} onChange={handleChange} placeholder="Votre nom et prénom" className="min-h-12 w-full rounded-xl border border-gray-200 bg-[#fafcf9] px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" /></label>
                        <label><span className="mb-1.5 block text-xs font-bold text-[#1a1c1c]">E-mail *</span><input name="email" type="email" required value={application.email} onChange={handleChange} placeholder="email@exemple.com" className="min-h-12 w-full rounded-xl border border-gray-200 bg-[#fafcf9] px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" /></label>
                        <label><span className="mb-1.5 block text-xs font-bold text-[#1a1c1c]">Téléphone *</span><input name="phone" type="tel" required value={application.phone} onChange={handleChange} placeholder="00225…" className="min-h-12 w-full rounded-xl border border-gray-200 bg-[#fafcf9] px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" /></label>
                      </div>
                      <label className="mt-4 block"><span className="mb-1.5 block text-xs font-bold text-[#1a1c1c]">Domaine qui vous intéresse</span><select name="field" value={application.field} onChange={handleChange} className="min-h-12 w-full rounded-xl border border-gray-200 bg-[#fafcf9] px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"><option value="">Sélectionner un domaine</option>{SERVICES_DATA.map((service) => <option key={service.id} value={service.title}>{service.title}</option>)}</select></label>
                      <label className="mt-4 block"><span className="mb-1.5 block text-xs font-bold text-[#1a1c1c]">Présentez-vous *</span><textarea name="message" rows="6" required value={application.message} onChange={handleChange} placeholder="Votre expérience, vos compétences et ce que vous souhaitez apporter…" className="w-full resize-none rounded-xl border border-gray-200 bg-[#fafcf9] px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" /></label>
                      <button type="submit" className="shimmer-btn mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-[#1b4c00]">Préparer ma candidature <span className="material-symbols-outlined text-base">send</span></button>
                    </form>
                  ) : (
                    <div className="flex min-h-[430px] flex-col items-center justify-center text-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><span className="material-symbols-outlined text-4xl">mark_email_read</span></span><span className="mt-6 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">Candidature préparée</span><h3 className="mt-3 font-display text-2xl font-extrabold text-[#111827]">Merci, {application.name}.</h3><p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-600">Votre messagerie s’ouvre pour envoyer votre candidature à l’adresse officielle. N’oubliez pas de joindre votre CV.</p><a href={CONTACT_DETAILS.emailHref} className="mt-5 text-sm font-bold text-primary hover:underline">{CONTACT_DETAILS.email}</a><button onClick={() => { setIsPrepared(false); setApplication(initialApplication); }} className="mt-7 rounded-full border border-primary/20 px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white">Nouvelle candidature</button></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </main>

      <Footer onNavClick={handleFooterNavigation} />
      <DevisModal isOpen={isDevisOpen} onClose={() => setIsDevisOpen(false)} />
    </div>
  );
}
