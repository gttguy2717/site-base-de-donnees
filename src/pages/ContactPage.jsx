import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DevisModal from '../components/DevisModal';
import FadeInSection from '../components/FadeInSection';
import { CONTACT_DETAILS } from '../data/companyData';

const CONTACT_HERO_IMAGE = 'https://soutarahgroup.ci/img/callme.jpeg';

export default function ContactPage({ navigateTo, onRequestQuote }) {
  const [isDevisOpen, setIsDevisOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#eef3ec] text-[#1a1c1c] flex flex-col font-sans selection:bg-primary selection:text-white">
      <Navbar onOpenDevis={() => (onRequestQuote || ((openModal) => openModal()))(() => setIsDevisOpen(true))} activeTab="contact" navigateTo={navigateTo} />

      <main className="flex-grow pt-28">
        <section className="relative overflow-hidden bg-[#f6faf4] py-16 sm:py-20 lg:py-24">
          <div className="absolute -left-20 top-10 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-full w-[42%] bg-[#dcebd8]" />
          <div className="relative mx-auto max-w-[1280px] px-4 sm:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <FadeInSection immediate>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-primary">
                  <span className="material-symbols-outlined text-[16px]">mark_email_unread</span>
                  Contactez-nous
                </div>
                <h1 className="mt-6 max-w-xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-[#111827] sm:text-5xl lg:text-6xl">
                  Parlons de ce qui
                  <span className="block text-primary">compte pour vous.</span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
                  Notre équipe est disponible pour comprendre votre besoin, répondre à vos questions et vous orienter vers la bonne expertise.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href={CONTACT_DETAILS.generalPhone.href} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-[#1b4c00]">
                    <span className="material-symbols-outlined text-base">call</span>
                    Appeler maintenant
                  </a>
                  <a href={CONTACT_DETAILS.emailHref} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#1b4d2e]/20 bg-white px-6 py-3 text-sm font-bold text-[#1b4d2e] transition-colors hover:bg-[#f2f7ef]">
                    Écrire un e-mail
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </a>
                </div>
              </FadeInSection>

              <FadeInSection delay={120}>
                <div className="relative mx-auto max-w-[580px]">
                  <div className="absolute -inset-4 rounded-[38px] bg-primary/10 blur-2xl" />
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] border border-white/80 shadow-2xl shadow-[#1b4d2e]/15">
                    <img src={CONTACT_HERO_IMAGE} alt="Contact Soutarah Group" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09220f]/65 via-transparent to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/15 p-4 text-white backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[310px]">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100">Notre adresse</span>
                      <p className="mt-1 font-display text-base font-bold">{CONTACT_DETAILS.address}</p>
                      <p className="mt-1 text-xs text-emerald-50/85">{CONTACT_DETAILS.city}</p>
                    </div>
                  </div>
                  <div className="absolute right-5 top-5 rounded-2xl border border-white/25 bg-white/15 px-4 py-3 text-white shadow-xl backdrop-blur-md sm:right-6 sm:top-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100">Disponibilités</p>
                    <p className="mt-1 text-sm font-bold text-white">{CONTACT_DETAILS.hours}</p>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        <FadeInSection as="section" className="bg-[#143e22] py-14 text-white sm:py-16">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <a href={CONTACT_DETAILS.generalPhone.href} className="group rounded-[24px] border border-white/10 bg-white/[0.07] p-5 transition-colors hover:bg-white/[0.12] sm:p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#69c33b] text-[#143e22]"><span className="material-symbols-outlined text-[22px]">phone_in_talk</span></span>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200">{CONTACT_DETAILS.generalPhone.label}</p>
                <p className="mt-2 font-display text-xl font-extrabold text-white">{CONTACT_DETAILS.generalPhone.display}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-100">Appeler <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span></span>
              </a>
              <a href={CONTACT_DETAILS.businessPhone.href} className="group rounded-[24px] border border-white/10 bg-white/[0.07] p-5 transition-colors hover:bg-white/[0.12] sm:p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#69c33b] text-[#143e22]"><span className="material-symbols-outlined text-[22px]">support_agent</span></span>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200">{CONTACT_DETAILS.businessPhone.label}</p>
                <p className="mt-2 font-display text-xl font-extrabold text-white">{CONTACT_DETAILS.businessPhone.display}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-100">Échanger <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span></span>
              </a>
              <a href={CONTACT_DETAILS.emailHref} className="group rounded-[24px] border border-white/10 bg-white/[0.07] p-5 transition-colors hover:bg-white/[0.12] sm:p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#69c33b] text-[#143e22]"><span className="material-symbols-outlined text-[22px]">mail</span></span>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200">Adresse e-mail</p>
                <p className="mt-2 break-all font-display text-lg font-extrabold text-white">{CONTACT_DETAILS.email}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-100">Envoyer un message <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span></span>
              </a>
            </div>
          </div>
        </FadeInSection>

        <FadeInSection as="section" className="bg-[#dcebd8] py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Notre emplacement</span>
              <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-[#111827] sm:text-4xl">Une réponse commence par une bonne conversation.</h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-600">
                Retrouvez-nous sur la carte ci-dessous et utilisez nos coordonnées pour nous joindre directement.
              </p>

              <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-xl shadow-[#143e22]/15">
                <div className="relative aspect-[16/10] min-h-[180px] overflow-hidden bg-[#dcebd8]">
                  <iframe
                    title="Localisation de SOUTARAH GROUP à Abidjan"
                    src="https://www.google.com/maps?q=93J2%2BMPW%20SOUTARAH%20GROUP%2C%20Abidjan%2C%20C%C3%B4te%20d%27Ivoire&z=16&output=embed"
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                  <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-white/50 bg-white/85 px-3.5 py-2.5 shadow-lg backdrop-blur-md">
                    <span className="flex items-center gap-2 text-xs font-bold text-[#143e22]">
                      <span className="material-symbols-outlined text-[18px] text-primary">location_on</span>
                      Riviera Palmeraie Saint Viateur, Cité Kimi
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Nous trouver</span>
                    <span className="mt-1 block text-sm font-bold text-[#111827]">Abidjan, Côte d'Ivoire</span>
                  </span>
                  <a href={CONTACT_DETAILS.mapUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1b4c00]">
                    Ouvrir Maps
                    <span className="material-symbols-outlined text-sm">north_east</span>
                  </a>
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

