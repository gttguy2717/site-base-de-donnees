import React from 'react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import FadeInSection from './FadeInSection';
import { CONTACT_DETAILS } from '../data/companyData';

const WHATSAPP_NUMBER = '2250718383838';

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.16-8.19 8.16Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

/**
 * Bloc contact direct des services (hors négoce / location) : WhatsApp avec
 * message pré-rempli contextuel au service, appel téléphonique et e-mail.
 */
export default function ServiceContactSection({ service }) {
  const serviceTitle = service?.title || 'votre projet';
  const message = `Bonjour SOUTARAH GROUP, je vous contacte au sujet du service « ${serviceTitle} ». J'aimerais échanger avec un conseiller sur mon besoin.`;
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const emailHref = `mailto:${CONTACT_DETAILS.email}?subject=${encodeURIComponent(`Demande — ${serviceTitle}`)}&body=${encodeURIComponent(message)}`;

  return (
    <FadeInSection immediate as="section" className="bg-[#f9f9f9] py-16 sm:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
        <div id="service-contact" className="relative overflow-hidden rounded-[32px] bg-[#12251a] px-6 py-12 text-white sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-[#77d141]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-[#58b72b]/15 blur-3xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#88e05a]/30 bg-[#88e05a]/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#a6ed7d]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#88e05a] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#88e05a]" />
              </span>
              Conseil &amp; contact
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Parlons de votre besoin</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/70">
              Pour « {serviceTitle} », pas de long formulaire : écrivez-nous sur WhatsApp ou appelez-nous directement.
              Un conseiller SOUTARAH vous répond rapidement et prend le temps de cadrer votre besoin.
            </p>
          </div>


          <div className="relative mx-auto mt-9 grid max-w-3xl gap-3 sm:grid-cols-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl bg-[#25D366] px-4 py-4 text-left shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15 text-white"><WhatsAppIcon /></span>
              <span className="min-w-0">
                <span className="block text-sm font-black text-white">WhatsApp</span>
                <span className="block truncate text-[11px] font-semibold text-white/85">Message pré-rempli · réponse rapide</span>
              </span>
            </a>

            <a
              href={CONTACT_DETAILS.generalPhone.href}
              className="group flex items-center gap-3 rounded-2xl bg-white px-4 py-4 text-left shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Phone size={20} /></span>
              <span className="min-w-0">
                <span className="block text-sm font-black text-[#173d23]">Appeler</span>
                <span className="block truncate text-[11px] font-semibold text-gray-500">{CONTACT_DETAILS.generalPhone.display}</span>
              </span>
            </a>

            <a
              href={emailHref}
              className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-[#a6ed7d]"><Mail size={20} /></span>
              <span className="min-w-0">
                <span className="block text-sm font-black text-white">E-mail</span>
                <span className="block truncate text-[11px] font-semibold text-white/70">{CONTACT_DETAILS.email}</span>
              </span>
            </a>
          </div>

          <div className="relative mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold text-white/55">
            <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {CONTACT_DETAILS.hours}</span>
            <a
              href={CONTACT_DETAILS.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition hover:text-[#a6ed7d]"
            >
              <MapPin size={13} /> {CONTACT_DETAILS.address}, {CONTACT_DETAILS.city}
            </a>
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}
