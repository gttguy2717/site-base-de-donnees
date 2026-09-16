import React from 'react';

const getSpec = (vehicle, pattern, fallback) => vehicle.specs?.find((spec) => pattern.test(spec)) || fallback;

export default function VehicleDetailModal({ vehicle, onClose, onReserve }) {
  if (!vehicle) return null;

  const seats = getSpec(vehicle, /personne|place/i, '5 personnes');
  const transmission = getSpec(vehicle, /manuel|automatique/i, 'Automatique');
  const fuel = getSpec(vehicle, /essence|gazole|diesel|hybride|électrique/i, 'Véhicule à essence');
  const luggage = Number((seats.match(/\d+/) || ['5'])[0]) >= 7 ? '5 sacs' : '4 sacs';
  const features = [
    'Radio stéréo AM/FM',
    'Régulateur de vitesse',
    'Climatisation',
    'Bluetooth',
    fuel.toLowerCase().includes('élect') ? 'Motorisation électrique' : '2 roues motrices',
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#06130b]/80 p-3 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="vehicle-detail-title">
      <div className="relative my-auto w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button onClick={onClose} aria-label="Fermer les détails" className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-gray-600 shadow-lg transition hover:bg-white hover:text-primary">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="grid md:grid-cols-[1fr_1fr]">
          <div className="relative min-h-[200px] overflow-hidden bg-[#eaf1e8] md:min-h-[360px]">
            <img src={vehicle.image} alt={vehicle.name} className="h-full w-full object-contain p-3" onError={(event) => { event.currentTarget.src = '/img/vehicles/dusterAvant.jpg'; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07180d]/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] backdrop-blur-md">{vehicle.category} · modèle ou similaire</span>
              <h2 id="vehicle-detail-title" className="mt-2 font-display text-2xl font-extrabold leading-tight sm:text-3xl">{vehicle.name}</h2>
            </div>
          </div>
          <div className="p-5 sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Location de voiture · Côte d'Ivoire</p>
            <h3 className="mt-2 font-display text-xl font-extrabold leading-tight text-[#111827] sm:text-2xl">{vehicle.name} ou similaire</h3>
            <p className="mt-3 text-sm leading-6 text-gray-600">Louer ce véhicule est pratique si vous avez besoin de confort, d'espace pour les passagers et de rangements pour vos bagages.</p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[['settings', transmission], ['group', seats], ['luggage', luggage]].map(([icon, label]) => <div key={label} className="rounded-2xl bg-[#f3f7f1] p-2.5 text-center"><span className="material-symbols-outlined text-lg text-primary">{icon}</span><span className="mt-0.5 block text-[10px] font-black text-gray-700">{label}</span></div>)}
            </div>

            <h4 className="mt-5 font-display text-lg font-extrabold text-[#111827]">Caractéristiques</h4>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {features.map((feature) => <div key={feature} className="flex items-center gap-2 text-xs font-semibold text-gray-600"><span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>{feature}</div>)}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button onClick={() => onReserve(vehicle)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-[#1b4c00]">Réserver ce véhicule <span className="material-symbols-outlined text-base">arrow_forward</span></button>
              <button onClick={onClose} className="min-h-11 rounded-full border border-gray-200 px-4 text-sm font-bold text-gray-600 transition hover:border-primary hover:text-primary">Retour</button>
            </div>
            <p className="mt-3 text-center text-[10px] text-gray-400">Le tarif final apparaît dans le panier après sélection des dates et des options.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
