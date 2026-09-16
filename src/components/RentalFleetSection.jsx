import React, { useState, useEffect, useRef } from 'react';

const categoryIcons = { Toutes: 'grid_view', Économiques: 'directions_car', Citadine: 'local_taxi', Berline: 'directions_car', SUV: 'airport_shuttle', '4x4': 'terrain', 'Pick-Up': 'local_shipping', Utilitaires: 'inventory_2', Minibus: 'groups' };
const chipSpecs = (vehicle) => {
  const specs = vehicle.specs || [];
  const placesRaw = specs.find((s) => /personne|place/i.test(s))
    || specs.find((s) => /^\d+$/.test(String(s).trim()));
  const places = placesRaw ? (/personne|place/i.test(placesRaw) ? placesRaw : `${String(placesRaw).trim()} personnes`) : '';
  const trans = specs.find((s) => /manuel|automatique/i.test(s)) || '';
  return [
    { label: places, icon: 'group' },
    { label: trans, icon: 'settings' },
  ].filter((chip) => chip.label);
};

export default function RentalFleetSection({ categories, activeCategory, onCategoryChange, searchQuery, onSearchChange, vehicles, onReserve, onDetails, onRequest }) {
  const [navbarHidden, setNavbarHidden] = useState(false);
  const [barHidden, setBarHidden] = useState(false);
  const resultsRef = useRef(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const suppressScrollRef = useRef(0);

  useEffect(() => {
    const handler = (e) => setNavbarHidden(!!e.detail?.hidden || false);
    window.addEventListener('soutarah-navbar-visible', handler);
    return () => window.removeEventListener('soutarah-navbar-visible', handler);
  }, []);

  // Bascule navbar / barre sticky :
  // - swipe vers le bas (descente)  → la barre recherche + onglets apparaît (la navbar se masque)
  // - swipe vers le haut (remontée) → la navbar réapparaît (la barre sticky se masque)
  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          // Pendant le scroll programmé d'un changement de catégorie, on ne touche pas à la barre
          if (Date.now() < suppressScrollRef.current) {
            lastScrollY.current = currentY;
            ticking.current = false;
            return;
          }
          const delta = currentY - lastScrollY.current;
          if (currentY <= 220) {
            setBarHidden(false); // en haut de page : barre visible sous la navbar
          } else if (delta > 3) {
            setBarHidden(false); // descente → barre sticky visible
          } else if (delta < -3) {
            setBarHidden(true); // remontée → la navbar prend le relais
          }
          lastScrollY.current = currentY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCategoryChange = (catId) => {
    onCategoryChange(catId);
    // La barre reste visible pendant le scroll vers les résultats
    suppressScrollRef.current = Date.now() + 1200;
    setBarHidden(false);
    if (resultsRef.current) {
      const offset = navbarHidden ? 140 : 200;
      const top = resultsRef.current.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <section id="flotte" className="scroll-mt-24 bg-[#f7f8f6]">
      {/* ── HERO ── */}
      <div className="relative overflow-hidden bg-[#12251a] px-5 py-12 text-white sm:px-9 sm:py-16">
        <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-[#77d141]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-[35%] h-44 w-80 rounded-full bg-[#58b72b]/20 blur-3xl" />
        <div className="relative mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl"><p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#a6ed7d]">SOUTARAH MOBILITÉ</p><h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">Louez le véhicule qui vous ressemble.</h1><p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">Choisissez un modèle, consultez les détails et réservez en quelques instants.</p></div>
          </div>
        </div>
      </div>

      {/* ── BARRE STICKY (recherche + catégories) ── */}
      <div className={`sticky z-30 border-y-2 border-[#173d23]/45 bg-white shadow-[0_6px_20px_-8px_rgba(23,61,35,0.25)] will-change-transform ${barHidden ? '-translate-y-[110%] scale-[0.99] opacity-0 pointer-events-none' : 'translate-y-0 scale-100 opacity-100'}`} style={{ top: navbarHidden ? 0 : 116.8, transition: 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1), opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), top 460ms cubic-bezier(0.22, 1, 0.36, 1)' }}>
        <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block w-full lg:max-w-xl">
              <span className="sr-only">Rechercher un véhicule</span>
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-primary">search</span>
              <input value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Rechercher une marque, un modèle ou une caractéristique" className="min-h-12 w-full rounded-xl border border-[#e0e8dd] bg-[#f5f8f3] py-2.5 pl-12 pr-4 text-sm font-semibold text-[#1b241d] outline-none transition placeholder:text-[#879088] focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15" />
            </label>
            <button onClick={onRequest} className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-primary/20 bg-[#f2f7ef] px-4 py-3 text-xs font-black text-primary transition hover:bg-primary hover:text-white lg:w-auto"><span className="material-symbols-outlined text-[18px]">support_agent</span>Véhicule non trouvé ?</button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((category) => {
              const active = category.id === activeCategory;
              return <button key={category.id} type="button" onClick={() => handleCategoryChange(category.id)} aria-pressed={active} className={`flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-bold transition ${active ? 'bg-[#172019] text-white shadow-md shadow-[#172019]/30' : 'bg-white text-[#1b241d] ring-1 ring-[#dbe6d6] hover:bg-[#172019] hover:text-white hover:ring-[#172019]'}`}><span className="material-symbols-outlined text-[16px] text-current">{categoryIcons[category.id] || 'directions_car'}</span>{category.label}<span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-black'}`}>{category.count}</span></button>;
            })}
          </div>
        </div>
      </div>
﻿
{/* ── RÉSULTATS ── */}
      <div ref={resultsRef} className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8">
        <div className="flex items-end justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Flotte disponible</p><h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[#172019] sm:text-3xl">{activeCategory === 'Toutes' ? 'Tous les véhicules' : activeCategory}</h2></div><p className="rounded-full border border-[#dbe6d6] bg-white px-3 py-1.5 text-xs font-bold text-[#586258]"><span className="text-primary">{vehicles.length}</span> véhicule{vehicles.length > 1 ? 's' : ''}</p></div>

        {vehicles.length ? <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((vehicle, index) => <article key={`${vehicle.name}-${vehicle.plate || index}`} className="group min-w-0 overflow-hidden rounded-2xl border border-[#e0e6de] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-[#173d23]/10">
            <div className="relative aspect-[4/3] overflow-hidden bg-white"><img src={vehicle.image} alt={vehicle.name} loading={index > 3 ? 'lazy' : 'eager'} className="h-full w-full object-contain p-2 transition duration-700 group-hover:scale-105" onError={(event) => { event.currentTarget.src = '/img/vehicles/dusterAvant.jpg'; }} /><div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" /><span className="absolute left-2.5 top-2.5 rounded-lg bg-white/95 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-primary shadow-sm">{vehicle.category}</span></div>
            <div className="p-3 sm:p-4"><h3 className="line-clamp-2 min-h-10 font-display text-base font-extrabold leading-tight text-[#172019] sm:text-lg">{vehicle.name}</h3>
              {chipSpecs(vehicle).length > 0 && <div className={`mt-2 grid gap-1 rounded-xl bg-[#f7faf5] border border-[#edf0eb] py-2 ${chipSpecs(vehicle).length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>{chipSpecs(vehicle).map((chip) => <div key={chip.label} className="min-w-0 text-center"><span className="material-symbols-outlined block text-[15px] text-primary">{chip.icon}</span><span className="mt-0.5 block truncate text-[8.5px] font-bold text-[#687169] sm:text-[9px]">{chip.label}</span></div>)}</div>}
              <div className="mt-3 grid gap-2"><button type="button" onClick={() => onDetails(vehicle)} className="min-h-10 rounded-xl border border-primary/25 px-2 text-[10px] font-black text-primary transition hover:bg-primary/5 sm:text-xs">Détails</button><button type="button" onClick={() => onReserve(vehicle)} className="inline-flex min-h-10 items-center justify-center gap-1 rounded-xl bg-primary px-2 text-[10px] font-black text-white transition hover:bg-[#173d23] sm:text-xs">Réserver <span className="material-symbols-outlined text-[15px]">arrow_forward</span></button></div>
            </div>
          </article>)}
        </div> : <div className="mt-6 rounded-2xl border border-dashed border-[#cad7c5] bg-white px-6 py-14 text-center"><span className="material-symbols-outlined text-4xl text-primary">search_off</span><h3 className="mt-3 font-display text-xl font-extrabold text-[#172019]">Aucun véhicule trouvé</h3><p className="mt-2 text-sm text-[#687169]">Essayez une autre recherche ou envoyez-nous votre besoin.</p><button type="button" onClick={onRequest} className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-black text-white">Faire une demande</button></div>}
      </div>
    </section>
  );
}

