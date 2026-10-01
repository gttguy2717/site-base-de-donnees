import React, { useState, useEffect, useMemo, useRef } from 'react';
import { downloadFicheTechnique } from '../lib/ficheTechnique';
import VariantSelectorModal from './VariantSelectorModal';
import { groupProducts } from '../lib/variantGroups';
import { resetBarMode, showBar, showNavbar, showNavbarAtTop, useBarMode, BAR_MODE } from '../lib/stickyBarMode';

// Menus déroulants : chaque menu regroupe plusieurs catégories ; au clic,
// le panneau révèle les sous-sections dedans (barre d'onglets allégée).
const CATEGORY_MENUS = [
  { id: 'menu-cables', label: 'Câbles & cheminement', icon: 'cable', items: ['cables', 'gaines'] },
  { id: 'menu-appareillage', label: 'Appareillage', icon: 'toggle_on', items: ['interrupteurs'] },
  { id: 'menu-eclairage', label: 'Éclairage & protection', icon: 'lightbulb', items: ['luminaires', 'disjoncteurs'] },
  { id: 'menu-chantier', label: 'Chantier & industriel', icon: 'factory', items: ['rallonges', 'produits-industriels'] },
];

// Recherche applicable à une fiche (produit simple ou groupe de variantes).
function matchesQuery(item, q) {
  if (!q) return true;
  if (item.type === 'single') {
    const p = item.product;
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.ref || '').toLowerCase().includes(q) ||
      (p.desc || '').toLowerCase().includes(q)
    );
  }
  if (item.genericName.toLowerCase().includes(q)) return true;
  if ((item.desc || '').toLowerCase().includes(q)) return true;
  return item.variants.some(
    (v) =>
      (v.product.name || '').toLowerCase().includes(q) ||
      (v.product.ref || '').toLowerCase().includes(q) ||
      Object.values(v.chars).some((val) => String(val).toLowerCase().includes(q))
  );
}

export default function NexansCatalogSection({ categories, products, onRequestQuote, onAddToCart }) {
  const [activeCat, setActiveCat] = useState('all');

  // Si la catégorie active disparaît (chargement DB), repartir sur « Tous ».
  useEffect(() => {
    if (activeCat !== 'all' && Array.isArray(categories) && categories.length && !categories.some((c) => c.id === activeCat)) {
      setActiveCat('all');
    }
  }, [categories, activeCat]);
  const [query, setQuery] = useState('');
  const [openMenu, setOpenMenu] = useState(null); // menu déroulant de catégories ouvert
  const [variantGroup, setVariantGroup] = useState(null); // groupe dont la modale est ouverte
  const menusRef = useRef(null);

  // Ferme le menu déroulant si le clic se fait à l'extérieur.
  useEffect(() => {
    if (!openMenu) return undefined;
    const onPointerDown = (e) => {
      if (menusRef.current && !menusRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [openMenu]);
  const [navbarHidden, setNavbarHidden] = useState(false);
  const { mode, pinned } = useBarMode();
  // La barre se masque seulement quand la navbar a été demandée au bouton.
  const barHidden = pinned && mode !== BAR_MODE;
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

  // À l'arrivée sur la page : navbar visible et barre d'onglets affichée.
  // Sans cette remise à zéro, le mode « navbar » choisi sur une autre page
  // restait actif : les onglets disparaissaient et laissaient un vide.
  useEffect(() => {
    resetBarMode();
  }, []);

  // Descendre = les onglets reprennent la main (même après un clic sur
  // « Menu »). Remonter ne change plus rien.
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
          // Revenir tout en haut : la navbar doit réapparaître, sinon il reste
          // un espace vide puisque les onglets la remplacent toujours.
          if (currentY <= 120) {
            showNavbarAtTop();
          } else if (currentY > 220 && delta > 3) {
            showBar();
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
    setOpenMenu(null);
    // La barre reste visible pendant le scroll vers les produits
    suppressScrollRef.current = Date.now() + 1200;
    if (productsRef.current) {
      const offset = navbarHidden ? 140 : 200;
      const top = productsRef.current.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Regroupement en variantes + recherche + filtre catégorie (items d'affichage).
  const q = query.trim().toLowerCase();
  const searchable = useMemo(() => groupProducts(products || []), [products]);
  const queryItems = useMemo(
    () => searchable.filter((item) => matchesQuery(item, q)),
    [searchable, q]
  );
  const filtered = useMemo(
    () =>
      activeCat === 'all'
        ? queryItems
        : queryItems.filter(
            (item) => (item.type === 'single' ? item.product.category : item.category) === activeCat
          ),
    [queryItems, activeCat]
  );
  // Comptage par catégorie sous la recherche courante (affiché dans les panneaux).
  const counts = useMemo(() => {
    const map = {};
    for (const item of queryItems) {
      const cat = item.type === 'single' ? item.product.category : item.category;
      map[cat] = (map[cat] || 0) + 1;
    }
    return map;
  }, [queryItems]);

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
            {/* Bouton « Menu » sur la même ligne que la recherche, juste avant */}
            <div className="flex w-full items-center gap-2 lg:max-w-xl">
              <button
                type="button"
                onClick={showNavbar}
                title="Afficher le menu"
                aria-label="Afficher le menu"
                className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[#e0e8dd] bg-[#f2f7ef] p-3 text-primary transition hover:bg-primary hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>
              <label className="relative block w-full">
                <span className="sr-only">Rechercher un produit</span>
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-primary">search</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un câble, un disjoncteur, une référence…" className="min-h-12 w-full rounded-xl border border-[#e0e8dd] bg-[#f5f8f3] py-2.5 pl-12 pr-4 text-sm font-semibold text-[#1b241d] outline-none transition placeholder:text-[#879088] focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15" />
              </label>
            </div>
            <button onClick={onRequestQuote} className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-primary/20 bg-[#f2f7ef] px-4 py-3 text-xs font-black text-primary transition hover:bg-primary hover:text-white lg:w-auto"><span className="material-symbols-outlined text-[18px]">support_agent</span>Produit non trouvé ?</button>
          </div>
          <div ref={menusRef} className="mt-3 flex flex-wrap gap-2 pb-1">
            <button type="button" onClick={() => handleCategoryChange('all')} aria-pressed={activeCat === 'all'} className={`flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-bold transition ${activeCat === 'all' ? 'bg-[#172019] text-white shadow-md shadow-[#172019]/30' : 'bg-white text-[#1b241d] ring-1 ring-[#dbe6d6] hover:bg-[#172019] hover:text-white hover:ring-[#172019]'}`}><span className="material-symbols-outlined text-[16px] text-current">grid_view</span>Tous<span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeCat === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-black'}`}>{queryItems.length}</span></button>
            {CATEGORY_MENUS.map((menu) => {
              const isOpen = openMenu === menu.id;
              const isActive = menu.items.includes(activeCat);
              const menuCount = menu.items.reduce((sum, id) => sum + (counts[id] || 0), 0);
              return (
                <div key={menu.id} className="relative shrink-0">
                  <button type="button" onClick={() => setOpenMenu(isOpen ? null : menu.id)} aria-expanded={isOpen} aria-haspopup="menu" className={`flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold transition ${isActive || isOpen ? 'bg-[#172019] text-white shadow-md shadow-[#172019]/30' : 'bg-white text-[#1b241d] ring-1 ring-[#dbe6d6] hover:bg-[#172019] hover:text-white hover:ring-[#172019]'}`}>
                      <span className="material-symbols-outlined text-[16px] text-current">{menu.icon}</span>
                      {menu.label}
                      <span className="material-symbols-outlined text-[14px] text-current">{isOpen ? 'expand_less' : 'expand_more'}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${isActive || isOpen ? 'bg-white/20 text-white' : 'bg-gray-100 text-black'}`}>{menuCount}</span>
                    </button>
                    {isOpen && (
                      <div role="menu" className="absolute left-0 top-full z-40 mt-2 w-[min(86vw,330px)] rounded-2xl border border-[#dbe6d6] bg-white p-2 shadow-[0_18px_40px_-12px_rgba(23,61,35,0.35)]">
                        {menu.items.map((catId) => {
                          const cat = categories.find((c) => c.id === catId);
                          if (!cat) return null;
                          const selected = activeCat === catId;
                          return (
                            <button key={catId} type="button" role="menuitem" onClick={() => handleCategoryChange(catId)} className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${selected ? 'bg-[#172019] text-white' : 'text-[#1b241d] hover:bg-[#f2f6f1]'}`}>
                              <span className="material-symbols-outlined text-[16px] text-current">{cat.icon}</span>
                              <span className="flex-1">{cat.label}</span>
                              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${selected ? 'bg-white/20 text-white' : 'bg-gray-100 text-black'}`}>{counts[catId] || 0}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                </div>
              );
            })}
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
            {filtered.map((item) => {
              if (item.type === 'group') {
                const gcat = categories.find((c) => c.id === item.category);
                return (
                  <article key={item.key} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e0e6de] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-[#173d23]/10">
                    <div className="relative aspect-[4/3] overflow-hidden bg-white">
                      <img src={item.image} alt={item.genericName} loading="lazy" className="h-full w-full object-contain p-2 transition duration-700 group-hover:scale-105" onError={(e) => { e.currentTarget.src = '/img/nexans/cable_04_v_jpg.jpg'; }} />
                      <span className="absolute left-2.5 top-2.5 rounded-lg bg-white/95 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-primary shadow-sm">{gcat?.label || 'Négoce'}</span>
                      <span className="absolute right-2.5 top-2.5 rounded-lg bg-[#172019] px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white shadow-sm">{item.variants.length} variantes</span>
                    </div>
                    <div className="flex flex-1 flex-col p-3 sm:p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{item.variants.length} références disponibles</p>
                      <h3 className="mt-1 line-clamp-2 font-display text-sm font-extrabold leading-tight text-[#172019] sm:text-base">{item.genericName}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-[#687169]">{item.desc}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(item.constants || {}).map(([key, c]) => (
                          <span key={`c-${key}`} className="rounded-md bg-[#f5f7f4] px-1.5 py-0.5 text-[10px] font-bold text-[#687169]">{c.label} : {c.value}</span>
                        ))}
                        {item.axes.map((axis) => (
                          <span key={axis.key} className="rounded-md bg-[#f0f4ee] px-1.5 py-0.5 text-[10px] font-bold text-[#586258]">{axis.label} · {axis.values.length} choix</span>
                        ))}
                      </div>
                      <div className="mt-auto flex flex-col gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => downloadFicheTechnique({ product: item.variants[0].product, categories })}
                          className="inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-lg border border-primary/25 px-2 text-[10px] font-black text-primary transition hover:bg-primary/5 sm:text-xs"
                          title={`Télécharger la fiche technique de ${item.genericName}`}
                        >
                          <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>Télécharger la fiche
                        </button>
                        <button
                          type="button"
                          onClick={() => setVariantGroup(item)}
                          className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-2 py-2 text-[11px] font-black text-white shadow-md shadow-primary/15 transition hover:bg-[#173d23] active:scale-[0.98]"
                        >
                          <span className="material-symbols-outlined text-[15px]" style={{ fontSize: 15 }}>tune</span>
                          Choisir ses caractéristiques
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }
              const p = item.product;
              const cat = categories.find((c) => c.id === p.category);
              return (
                <article key={p.id} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e0e6de] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-[#173d23]/10">
                  <div className="relative aspect-[4/3] overflow-hidden bg-white"><img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-contain p-2 transition duration-700 group-hover:scale-105" onError={(e) => { e.currentTarget.src = '/img/nexans/cable_04_v_jpg.jpg'; }} /><span className="absolute left-2.5 top-2.5 rounded-lg bg-white/95 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-primary shadow-sm">{cat?.label || 'Négoce'}</span></div>
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{p.ref}</p>
                    <h3 className="mt-1 line-clamp-2 font-display text-sm font-extrabold leading-tight text-[#172019] sm:text-base">{p.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-[#687169]">{p.desc}</p>
                    <div className="mt-2">
                      {p.prixMarche ? (
                        <p className="text-base font-extrabold text-[#173d23]">{new Intl.NumberFormat('fr-FR').format(p.prixMarche)} FCFA</p>
                      ) : null}
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

      {/* Modale de choix des caractéristiques (articles regroupés) */}
      {variantGroup && (
        <VariantSelectorModal
          group={variantGroup}
          categories={categories}
          onClose={() => setVariantGroup(null)}
          onAddToCart={(product) => {
            setVariantGroup(null);
            handleAddToCart(product);
          }}
        />
      )}
    </section>
  );
}

