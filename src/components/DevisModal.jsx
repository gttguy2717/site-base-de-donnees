import React, { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const services = [
  { id: 'energies', title: 'Energies renouvelables', icon: 'solar_power', desc: 'Solaire, audits, equipements et installation.' },
  { id: 'vehicules', title: 'Location de vehicules', icon: 'directions_car', desc: 'Vehicules particuliers, utilitaires et avec chauffeur.' },
  { id: 'btp', title: 'Services techniques / BTP', icon: 'engineering', desc: 'Maintenance, travaux, amenagements et support terrain.' },
  { id: 'negoce', title: 'Negoce / Import-export', icon: 'inventory_2', desc: 'Produits, materiaux, equipements et demandes specifiques.' },
];

const budgets = [
  ['', 'Selectionner'],
  ['under_5m', 'Moins de 5 000 000 FCFA'],
  ['5m_25m', '5M FCFA - 25M FCFA'],
  ['over_25m', 'Plus de 25M FCFA'],
];

const timelines = [
  ['', 'Selectionner'],
  ['urgent', 'Urgent, moins de 1 mois'],
  ['1_3m', '1 a 3 mois'],
  ['flexible', 'Flexible'],
];

function contactDefaults(user, client) {
  return {
    company: client?.company?.name || '',
    name: client?.company?.responsibleName || [client?.firstName, client?.lastName].filter(Boolean).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: client?.address || '',
  };
}

function initialFormData(user, client) {
  return {
    service: 'energies',
    title: '',
    budget: '',
    timeline: '',
    description: '',
    ...contactDefaults(user, client),
  };
}

export default function DevisModal({ isOpen, onClose }) {
  const { user, client, token } = useAuth();
  const [step, setStep] = useState(1);
  const [isGuestRequest, setIsGuestRequest] = useState(false);
  const [formData, setFormData] = useState(() => initialFormData(user, client));
  const [submittedRef, setSubmittedRef] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedService = useMemo(
    () => services.find((service) => service.id === formData.service) || services[0],
    [formData.service],
  );

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setSubmittedRef(null);
    setError('');
    setSubmitting(false);
    setIsGuestRequest(window.sessionStorage.getItem('soutarah_quote_guest_mode') === '1');
    setFormData(initialFormData(user, client));
  }, [isOpen, user, client]);

  if (!isOpen) return null;

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const closeModal = () => {
    window.sessionStorage.removeItem('soutarah_quote_guest_mode');
    setStep(1);
    setSubmittedRef(null);
    setError('');
    setSubmitting(false);
    onClose();
  };

  const submitQuoteRequest = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await apiRequest('/quote-requests', {
        token,
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setSubmittedRef(result.quoteRequest.reference);
      window.sessionStorage.removeItem('soutarah_quote_guest_mode');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const canGoToContact = formData.title.trim().length >= 3;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center overflow-y-auto bg-[#081207]/75 p-2 backdrop-blur-md animate-fadeIn sm:p-4" role="dialog" aria-modal="true" aria-labelledby="quote-title">
      <div className="relative grid max-h-[calc(100vh-1rem)] w-full max-w-4xl overflow-hidden rounded-[24px] bg-white shadow-2xl lg:grid-cols-[280px_1fr]">
        <button
          type="button"
          onClick={closeModal}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-gray-500 shadow-sm transition hover:bg-gray-100 hover:text-gray-900"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <aside className="hidden bg-[#173d23] px-5 py-6 text-white lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">SOUTARAH GROUP</p>
          <h2 id="quote-title" className="mt-2 font-display text-2xl font-extrabold leading-tight">
            Demande de devis
          </h2>
          <p className="mt-2 text-xs leading-5 text-white/75">
            Transmettez votre besoin. L'equipe commerciale recoit la demande et vous recontacte avec les informations utiles.
          </p>

          <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">Service choisi</p>
            <div className="mt-3 flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-primary">
                <span className="material-symbols-outlined text-[22px]">{selectedService.icon}</span>
              </span>
              <div>
                <p className="font-display text-sm font-extrabold">{selectedService.title}</p>
                <p className="mt-1 text-xs leading-4 text-white/70">{selectedService.desc}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <StepPill number="1" label="Secteur" active={step >= 1} />
            <StepPill number="2" label="Projet" active={step >= 2} />
            <StepPill number="3" label="Coordonnees" active={step >= 3} />
          </div>
        </aside>

        <main className="overflow-y-auto px-4 py-5 sm:px-6">
          {!submittedRef ? (
            <>
              <div className="pr-12">
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                  Formulaire commercial
                </span>
                <h3 className="mt-2 font-display text-xl font-extrabold text-[#172217] sm:text-2xl">
                  Comment pouvons-nous vous aider ?
                </h3>
                {isGuestRequest && (
                  <div className="mt-3 rounded-2xl border border-primary/15 bg-[#f2f7ef] p-3 text-xs leading-5 text-[#2f3b2f]">
                    <p className="font-bold text-primary">Continuer sans compte</p>
                    <p className="mt-1">
                      Votre demande sera traitee par SOUTARAH, mais elle ne sera pas associee a un espace client et vous ne pourrez pas retrouver automatiquement son historique sur le site.
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                  <p className="font-bold">La demande n'a pas pu etre envoyee</p>
                  <p className="mt-1">{error}</p>
                </div>
              )}

              <form onSubmit={submitQuoteRequest} className="mt-4">
                {step === 1 && (
                  <section className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {services.map((service) => (
                        <button
                          type="button"
                          key={service.id}
                          onClick={() => setFormData((current) => ({ ...current, service: service.id }))}
                          className={`group rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                            formData.service === service.id
                              ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                              : 'border-gray-200 bg-white hover:border-primary/30'
                          }`}
                        >
                          <span className={`grid h-9 w-9 place-items-center rounded-xl ${
                            formData.service === service.id ? 'bg-primary text-white' : 'bg-[#f1f6ef] text-primary group-hover:bg-primary group-hover:text-white'
                          }`}>
                            <span className="material-symbols-outlined text-[20px]">{service.icon}</span>
                          </span>
                          <span className="mt-3 block font-display text-sm font-extrabold text-[#1f2b1f]">{service.title}</span>
                          <span className="mt-1 block text-xs leading-4 text-gray-600">{service.desc}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <PrimaryButton type="button" onClick={() => setStep(2)} label="Continuer" icon="arrow_forward" />
                    </div>
                  </section>
                )}

                {step === 2 && (
                  <section className="space-y-4">
                    <Field label="Titre / nature du projet *">
                      <input name="title" value={formData.title} onChange={updateField} required placeholder="Ex: Equipement solaire pour un site industriel" className="soutarah-input" />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Budget estimatif">
                        <select name="budget" value={formData.budget} onChange={updateField} className="soutarah-input">
                          {budgets.map(([value, label]) => <option key={value || 'empty'} value={value}>{label}</option>)}
                        </select>
                      </Field>
                      <Field label="Delai souhaite">
                        <select name="timeline" value={formData.timeline} onChange={updateField} className="soutarah-input">
                          {timelines.map(([value, label]) => <option key={value || 'empty'} value={value}>{label}</option>)}
                        </select>
                      </Field>
                    </div>
                    <Field label="Description des besoins">
                      <textarea name="description" value={formData.description} onChange={updateField} rows="3" placeholder="Details, quantites, lieux, contraintes, dates importantes..." className="soutarah-input resize-none" />
                    </Field>
                    <div className="flex items-center justify-between gap-3">
                      <SecondaryButton type="button" onClick={() => setStep(1)} label="Retour" />
                      <PrimaryButton type="button" onClick={() => setStep(3)} disabled={!canGoToContact} label="Coordonnees" icon="arrow_forward" />
                    </div>
                  </section>
                )}

                {step === 3 && (
                  <section className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Nom / prenom *">
                        <input name="name" value={formData.name} onChange={updateField} required placeholder="Votre nom complet" className="soutarah-input" />
                      </Field>
                      <Field label="Telephone *">
                        <input name="phone" value={formData.phone} onChange={updateField} required type="tel" placeholder="00225..." className="soutarah-input" />
                      </Field>
                      <Field label="Email *">
                        <input name="email" value={formData.email} onChange={updateField} required type="email" placeholder="email@exemple.com" className="soutarah-input" />
                      </Field>
                      <Field label="Entreprise">
                        <input name="company" value={formData.company} onChange={updateField} placeholder="Facultatif" className="soutarah-input" />
                      </Field>
                      <Field label="Ville / localisation *" wide>
                        <input name="location" value={formData.location} onChange={updateField} required placeholder="Ex: Abidjan, Cocody" className="soutarah-input" />
                      </Field>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-3 text-xs leading-5 text-gray-600">
                      Ces informations permettent a SOUTARAH de traiter et suivre la demande. Sans compte, l'historique ne sera pas disponible automatiquement dans un espace client.
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <SecondaryButton type="button" onClick={() => setStep(2)} label="Retour" />
                      <PrimaryButton type="submit" disabled={submitting} label={submitting ? 'Envoi en cours...' : 'Envoyer la demande'} icon="send" />
                    </div>
                  </section>
                )}
              </form>
            </>
          ) : (
            <section className="grid min-h-[360px] place-items-center text-center">
              <div>
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <span className="material-symbols-outlined text-5xl">check_circle</span>
                </div>
                <h3 className="mt-6 font-display text-3xl font-extrabold text-[#173d23]">Demande transmise</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
                  Merci {formData.name}. Votre demande est enregistree et l'equipe SOUTARAH va vous recontacter.
                </p>
                <div className="mx-auto mt-6 inline-block rounded-2xl border border-primary/15 bg-[#f2f7ef] px-5 py-4 text-left">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Reference</p>
                  <p className="mt-1 font-mono text-xl font-extrabold text-primary">{submittedRef}</p>
                </div>
                <div className="mt-7">
                  <button onClick={closeModal} className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#1b4c00]">
                    Fermer
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function StepPill({ number, label, active }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl px-3 py-1.5 text-sm font-bold ${active ? 'bg-white/12 text-white' : 'text-white/45'}`}>
      <span className={`grid h-7 w-7 place-items-center rounded-full text-xs ${active ? 'bg-white text-primary' : 'bg-white/10 text-white/60'}`}>{number}</span>
      {label}
    </div>
  );
}

function Field({ label, children, wide = false }) {
  return (
    <label className={wide ? 'sm:col-span-2' : ''}>
      <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.08em] text-gray-600">{label}</span>
      {children}
    </label>
  );
}

function PrimaryButton({ label, icon, ...props }) {
  return (
    <button {...props} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-primary/20 transition hover:bg-[#1b4c00] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none">
      <span>{label}</span>
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
    </button>
  );
}

function SecondaryButton({ label, ...props }) {
  return (
    <button {...props} className="min-h-10 rounded-full px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-100">
      {label}
    </button>
  );
}
