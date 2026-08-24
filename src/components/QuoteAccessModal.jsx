import React from 'react';

export default function QuoteAccessModal({ isOpen, onClose, onRegister, onLogin, onContinueGuest }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="quote-access-title">
      <div className="relative my-8 w-full max-w-xl rounded-3xl border border-white/70 bg-white p-5 shadow-2xl sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Demande de devis</p>
        <h2 id="quote-access-title" className="mt-2 pr-10 font-display text-2xl font-extrabold text-[#173d23]">
          Comment souhaitez-vous continuer ?
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Choisissez le mode le plus pratique pour transmettre votre demande a SOUTARAH GROUP.
        </p>

        <div className="mt-6 grid gap-3">
          <ChoiceButton
            icon="person_add"
            title="Creer un compte"
            description="Recommande - retrouvez vos devis, reservations et demandes dans votre espace personnel."
            onClick={onRegister}
          />
          <ChoiceButton
            icon="lock"
            title="Se connecter"
            description="Vous avez deja un compte ? Connectez-vous pour rattacher la demande a votre espace client."
            onClick={onLogin}
          />
          <ChoiceButton
            icon="arrow_forward"
            title="Continuer sans compte"
            description="Votre demande sera traitee par SOUTARAH, mais elle ne sera pas associee a un espace client et vous ne pourrez pas retrouver automatiquement son historique sur le site."
            onClick={onContinueGuest}
          />
        </div>
      </div>
    </div>
  );
}

function ChoiceButton({ icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/5 hover:shadow-lg"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f1f6ef] text-primary transition group-hover:bg-primary group-hover:text-white">
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </span>
      <span className="min-w-0">
        <span className="block font-display text-base font-extrabold text-[#1f2b1f]">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-gray-600">{description}</span>
      </span>
    </button>
  );
}
