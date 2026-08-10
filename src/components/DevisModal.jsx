import React, { useState } from 'react';

export default function DevisModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: 'energies',
    title: '',
    budget: '',
    timeline: '',
    description: '',
    company: '',
    name: '',
    email: '',
    phone: '',
  });
  const [submittedRef, setSubmittedRef] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const randomRef = 'DEV-2026-' + Math.floor(1000 + Math.random() * 9000);
    setSubmittedRef(randomRef);
  };

  const resetAndClose = () => {
    setStep(1);
    setSubmittedRef(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl border border-gray-100 relative my-8">
        {/* Close Button */}
        <button
          onClick={resetAndClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {!submittedRef ? (
          <div>
            {/* Modal Header */}
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                Formulaire en Ligne
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-on-surface mt-2">
                Demande de Devis Personnalisé
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Recevez une estimation détaillée sous 48h par notre équipe dédiée.
              </p>

              {/* Progress Bar */}
              <div className="flex items-center gap-2 mt-6">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                      step >= s ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Select Service */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-lg text-on-surface flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
                    Choisissez le secteur d'activité
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                      { id: 'energies', title: 'Énergies Renouvelables', icon: 'solar_power', desc: 'Solaire, audits, durabilité' },
                      { id: 'vehicules', title: 'Location de Véhicules', icon: 'directions_car', desc: 'Flotte VIP & utilitaires' },
                      { id: 'btp', title: 'Services Techniques / BTP', icon: 'build', desc: 'Maintenance & infrastructure' },
                      { id: 'autre', title: 'Autre Service / Négoce', icon: 'more_horiz', desc: 'Import-export, agropastorale' },
                    ].map((item) => (
                      <label
                        key={item.id}
                        onClick={() => setFormData({ ...formData, service: item.id })}
                        className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${
                          formData.service === item.id
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-2xl ${formData.service === item.id ? 'text-primary' : 'text-gray-400'}`}>
                          {item.icon}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-on-surface">{item.title}</div>
                          <div className="text-xs text-on-surface-variant mt-0.5">{item.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-primary hover:bg-[#1b4c00] text-white px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 shadow-md shimmer-btn"
                    >
                      <span>Suivant</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Project Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-lg text-on-surface flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</span>
                    Détails de votre projet
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">Titre / Nature du projet</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Ex: Équipement solaire site industriel"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-sm bg-gray-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">Budget Estimatif</label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-sm bg-gray-50/50"
                      >
                        <option value="">Sélectionner</option>
                        <option value="under_5m">Moins de 5 000 000 FCFA</option>
                        <option value="5m_25m">5M FCFA - 25M FCFA</option>
                        <option value="over_25m">Plus de 25M FCFA</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">Délai Souhaité</label>
                      <select
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-sm bg-gray-50/50"
                      >
                        <option value="">Sélectionner</option>
                        <option value="urgent">Urgent (&lt; 1 mois)</option>
                        <option value="1_3m">1 à 3 mois</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">Description des besoins</label>
                    <textarea
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Décrivez brièvement vos attentes..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-sm bg-gray-50/50 resize-none"
                    ></textarea>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-2.5 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="bg-primary hover:bg-[#1b4c00] text-white px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 shadow-md shimmer-btn"
                    >
                      <span>Suivant</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Info */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-lg text-on-surface flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">3</span>
                    Vos coordonnées
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">Nom de l'Entreprise</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Société / Organisation"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary text-sm bg-gray-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">Nom Complet *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary text-sm bg-gray-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@exemple.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary text-sm bg-gray-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">Téléphone *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="00225..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary text-sm bg-gray-50/50"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      className="bg-primary hover:bg-[#1b4c00] text-white px-8 py-3 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shimmer-btn"
                    >
                      <span>Envoyer la Demande</span>
                      <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        ) : (
          /* Confirmation state */
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h3 className="font-display font-bold text-2xl text-on-surface mb-2">
              Demande transmise avec succès !
            </h3>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto mb-6">
              Merci <span className="font-semibold text-on-surface">{formData.name}</span>. Notre équipe commerciale étudie votre dossier et vous recontactera très rapidement.
            </p>
            <div className="bg-gray-50 p-4 rounded-2xl inline-block text-left mb-6 border border-gray-200">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Référence de dossier :</div>
              <div className="font-mono text-lg font-bold text-primary">{submittedRef}</div>
            </div>
            <div>
              <button
                onClick={resetAndClose}
                className="bg-primary text-white px-8 py-3 rounded-full text-sm font-semibold shadow-md"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
