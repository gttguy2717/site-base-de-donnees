import React, { useState, useEffect, useRef } from 'react';
import { downloadFicheTechnique } from '../lib/ficheTechnique';

export default function NexansCatalogSection({ categories, products, onRequestQuote, onAddToCart }) {
  const [activeCat, setActiveCat] = useState('all');

  // Si la catégorie active disparaît (chargement DB), repartir sur « Tous ».
  useEffect(() => {
    if (activeCat !== 'all' && Array.isArray(categories) && categories.length && !categories.some((c) => c.id === activeCat)) {
      setActiveCat('all');
    }
  }, [categories, activeCat]);
  const [query, setQuery] = useState('');
  const [navbarHidden, setNavbarHidden] = useState(false);
  const [barHidden, setBarHidden] = useState(false);
  const productsRef = useRef(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const suppressScrollRef = useRef(0);

  useEffect(() => {
    const handler = (e) => {
      setNavbarHidden(!!e.detail?.hidden || false);
    };
    window.addEventListener('soutarah-navbar-visible', handler);
    return () => window.removeEventListener('soutarah-navbar-visible', handler);
  }, []);

  // Bascule navbar / barre sticky :
  // - swipe vers le bas (descente)  → la barre recherche + onglets apparaît (la navbar se masque)
  // - swipe vers le haut (remontée) → la navbar réapparaît (la barre sticky se masque)
  // Seuil de 3px pour éviter le frémissement sur les micro-scrolls.
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

  const handleAddToCart = (product) => {
    if (!onAddToCart) return;
    // Panier invité autorisé (comme les véhicules) : la connexion
    // n'est exigée qu'à la validation du devis, pas à l'ajout.
    onAddToCart(product);
  };

  const handleCategoryChange = (catId) => {
    setActiveCat(catId);
    // La barre reste visible pendant le scroll vers les produits
    suppressScrollRef.current = Date.now() + 1200;
    setBarHidden(false);
    if (productsRef.current) {
      const offset = navbarHidden ? 140 : 200;
      const top = productsRef.current.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const filtered = products.filter((p) => {
    if (activeCat !== 'all' && p.category !== activeCat) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (p.name || '').toLowerCase().includes(q) || (p.ref || '').toLowerCase().includes(q) || (p.desc || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <section id="nexans-catalogue" className="bg-[#f6f8f5]">
      {/* ── HERO ── */}
      <div className="relative overflow-hidden bg-[#12251a] px-5 py-12 text-white sm:px-9 sm:py-16">
        <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-[#77d141]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-[35%] h-44 w-80 rounded-full bg-[#58b72b]/20 blur-3xl" />
        <div className="relative mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl"><p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#a6ed7d]">SOUTARAH NÉGOCE</p><h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">Trouvez le produit qui vous convient.</h1><p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">Choisissez un modèle, consultez les fiches techniques et demandez votre devis en quelques instants.</p></div>
          </div>
        </div>
      </div>

      {/* BARRE STICKY */}
      <div className={`sticky z-30 border-y-2 border-[#173d23]/45 bg-white shadow-[0_6px_20px_-8px_rgba(23,61,35,0.25)] will-change-transform ${barHidden ? '-translate-y-[110%] scale-[0.99] opacity-0 pointer-events-none' : 'translate-y-0 scale-100 opacity-100'}`} style={{ top: navbarHidden ? 0 : 116.8, transition: 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1), opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), top 460ms cubic-bezier(0.22, 1, 0.36, 1)' }}>
        <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block w-full lg:max-w-xl">
              <span className="sr-only">Rechercher un produit</span>
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-primary">search</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un câble, une transformateur, une référence…" className="min-h-12 w-full rounded-xl border border-[#e0e8dd] bg-[#f5f8f3] py-2.5 pl-12 pr-4 text-sm font-semibold text-[#1b241d] outline-none transition placeholder:text-[#879088] focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15" />
            </label>
            <button onClick={onRequestQuote} className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-primary/20 bg-[#f2f7ef] px-4 py-3 text-xs font-black text-primary transition hover:bg-primary hover:text-white lg:w-auto"><span className="material-symbols-outlined text-[18px]">support_agent</span>Produit non trouvé ?</button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button type="button" onClick={() => handleCategoryChange('all')} aria-pressed={activeCat === 'all'} className={`flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-bold transition ${activeCat === 'all' ? 'bg-[#172019] text-white shadow-md shadow-[#172019]/30' : 'bg-white text-[#1b241d] ring-1 ring-[#dbe6d6] hover:bg-[#172019] hover:text-white hover:ring-[#172019]'}`}><span className="material-symbols-outlined text-[16px] text-current">grid_view</span>Tous<span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeCat === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-black'}`}>{products.length}</span></button>
            {categories.map((cat) => (
              <button key={cat.id} type="button" onClick={() => handleCategoryChange(cat.id)} aria-pressed={activeCat === cat.id} className={`flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-bold transition ${activeCat === cat.id ? 'bg-[#172019] text-white shadow-md shadow-[#172019]/30' : 'bg-white text-[#1b241d] ring-1 ring-[#dbe6d6] hover:bg-[#172019] hover:text-white hover:ring-[#172019]'}`}><span className="material-symbols-outlined text-[16px] text-current">{cat.icon}</span>{cat.label}<span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeCat === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-black'}`}>{products.filter((p) => p.category === cat.id).length}</span></button>
            ))}
          </div>
        </div>
      </div>
{/* RÉSULTATS */}
      <div ref={productsRef} className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Catalogue produits</p><h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[#172019] sm:text-3xl">{activeCat === 'all' ? 'Tous' : (categories.find((c) => c.id === activeCat)?.label || 'Produits')}</h2></div>
          <p className="rounded-full border border-[#dbe6d6] bg-white px-3 py-1.5 text-xs font-bold text-[#586258]"><span className="text-primary">{filtered.length}</span> produit{filtered.length > 1 ? 's' : ''}</p>
        </div>

        {filtered.length ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => {
              const cat = categories.find((c) => c.id === p.category);
              return (
                <article key={p.id} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e0e6de] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-[#173d23]/10">
                  <div className="relative aspect-[4/3] overflow-hidden bg-white"><img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-contain p-2 transition duration-700 group-hover:scale-105" onError={(e) => { e.currentTarget.src = '/img/nexans/cable_04_v_jpg.jpg'; }} /><span className="absolute left-2.5 top-2.5 rounded-lg bg-white/95 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-primary shadow-sm">{cat?.label || 'Négoce'}</span></div>
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{p.ref}</p>
                    <h3 className="mt-1 line-clamp-2 font-display text-sm font-extrabold leading-tight text-[#172019] sm:text-base">{p.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-[#687169]">{p.desc}</p>
                    <div className="mt-2">
                      <p className="text-base font-extrabold text-[#173d23]">{p.prixMarche ? new Intl.NumberFormat('fr-FR').format(p.prixMarche) : ''} FCFA</p>
                    </div>
                    <div className="mt-auto flex flex-col gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => downloadFicheTechnique({ product: p, categories })}
                        className="inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-lg border border-primary/25 px-2 text-[10px] font-black text-primary transition hover:bg-primary/5 sm:text-xs"
                        title={`Télécharger la fiche technique de ${p.name}`}
                      >
                        <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>Télécharger la fiche
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(p)}
                        className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-2 py-2 text-[11px] font-black text-white shadow-md shadow-primary/15 transition hover:bg-[#173d23] active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-[15px]" style={{ fontSize: 15 }}>shopping_cart</span>
                        Ajouter au panier
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-[#cad7c5] bg-white px-6 py-14 text-center"><span className="material-symbols-outlined text-4xl text-primary">search_off</span><h3 className="mt-3 font-display text-xl font-extrabold text-[#172019]">Aucun produit trouvé</h3><p className="mt-2 text-sm text-[#687169]">Essayez une autre recherche ou contactez-nous.</p><button type="button" onClick={onRequestQuote} className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-black text-white">Demander ce produit</button></div>
        )}
      </div>
    </section>
  );
}

