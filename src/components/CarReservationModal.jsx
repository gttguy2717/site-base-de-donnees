import React, { useEffect, useState } from 'react';

export default function CarReservationModal({ vehicle, onClose }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reference, setReference] = useState('');
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    name: '',
    phone: '',
    email: '',
    withDriver: false,
  });

  useEffect(() => {
    if (!vehicle) return;

    setIsSubmitted(false);
    setReference('');
    setFormData({
      startDate: '',
      endDate: '',
      name: '',
      phone: '',
      email: '',
      withDriver: false,
    });
  }, [vehicle]);

  if (!vehicle) return null;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setReference(`RES-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="reservation-title">
      <div className="relative my-8 w-full max-w-3xl overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-md transition-colors hover:bg-gray-100 hover:text-[#111827]"
          aria-label="Fermer la réservation"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {!isSubmitted ? (
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[260px] overflow-hidden bg-[#143e22] p-6 text-white sm:p-8">
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="absolute inset-0 h-full w-full object-cover opacity-45"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09220f] via-[#143e22]/75 to-[#143e22]/50" />
              <div className="relative flex h-full flex-col justify-end">
                <span className="w-fit rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-sm">{vehicle.category}</span>
                <h2 id="reservation-title" className="mt-4 font-display text-3xl font-extrabold leading-tight">{vehicle.name}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {vehicle.specs.map((spec) => (
                    <span key={spec} className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-50 backdrop-blur-sm">{spec}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Réservation de véhicule</span>
              <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-[#111827]">Préparez votre demande.</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">Indiquez vos dates et vos coordonnées. L’équipe vous recontactera pour confirmer la disponibilité et les modalités.</p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-[#1a1c1c]">Date de début *</span>
                    <input
                      name="startDate"
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={handleChange}
                      className="min-h-11 w-full rounded-xl border border-gray-200 bg-[#fafcf9] px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-[#1a1c1c]">Date de fin *</span>
                    <input
                      name="endDate"
                      type="date"
                      required
                      min={formData.startDate || undefined}
                      value={formData.endDate}
                      onChange={handleChange}
                      className="min-h-11 w-full rounded-xl border border-gray-200 bg-[#fafcf9] px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-[#1a1c1c]">Nom complet *</span>
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Votre nom"
                      className="min-h-11 w-full rounded-xl border border-gray-200 bg-[#fafcf9] px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-[#1a1c1c]">Téléphone *</span>
                    <input
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="00225…"
                      className="min-h-11 w-full rounded-xl border border-gray-200 bg-[#fafcf9] px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-[#1a1c1c]">E-mail</span>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@exemple.com"
                    className="min-h-11 w-full rounded-xl border border-gray-200 bg-[#fafcf9] px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-primary/15 bg-primary/5 p-3.5 transition-colors hover:bg-primary/10">
                  <span>
                    <span className="block text-sm font-bold text-[#1a1c1c]">Ajouter un chauffeur</span>
                    <span className="mt-0.5 block text-xs text-gray-600">Indiquez-nous si vous souhaitez cette option.</span>
                  </span>
                  <input
                    name="withDriver"
                    type="checkbox"
                    checked={formData.withDriver}
                    onChange={handleChange}
                    className="h-5 w-5 accent-[#296c00]"
                  />
                </label>

                <button type="submit" className="shimmer-btn flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-[#1b4c00] active:scale-[0.99]">
                  Envoyer ma demande de réservation
                  <span className="material-symbols-outlined text-base">send</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="px-6 py-14 text-center sm:px-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <span className="mt-6 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">Demande préparée</span>
            <h2 className="mt-3 font-display text-2xl font-extrabold text-[#111827] sm:text-3xl">Merci, {formData.name || 'votre demande est enregistrée'}.</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-gray-600">Votre demande de réservation pour <strong className="font-bold text-[#1a1c1c]">{vehicle.name}</strong> a été transmise. L’équipe vous contactera pour confirmer la disponibilité.</p>
            <div className="mx-auto mt-6 w-fit rounded-2xl border border-gray-200 bg-[#fafcf9] px-5 py-3 text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Référence de demande</p>
              <p className="mt-1 font-mono text-lg font-bold text-primary">{reference}</p>
            </div>
            <button onClick={onClose} className="mt-7 min-h-11 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1b4c00]">Fermer</button>
          </div>
        )}
      </div>
    </div>
  );
}
