import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import CtaBanner from '../components/CtaBanner';
import Footer from '../components/Footer';
import DevisModal from '../components/DevisModal';
import CarReservationModal from '../components/CarReservationModal';
import VehicleRequestModal from '../components/VehicleRequestModal';
import ReqModal from '../components/ReqModal';
import { useAuth } from '../hooks/useAuth';
import { openDevisByAuth } from '../lib/quoteGate';
import FadeInSection from '../components/FadeInSection';
import { SERVICES_DATA } from '../data/servicesData';
import { apiRequest } from '../lib/api';
import RentalFleetSection from '../components/RentalFleetSection';
import VehicleDetailModal from '../components/VehicleDetailModal';
import NexansCatalogSection from '../components/NexansCatalogSection';

const FUEL_TYPES = ['Essence', 'Gazole', 'Hybride', 'Diesel'];
const displaySpecs = (vehicle) => (vehicle.specs || []).filter((spec) => !FUEL_TYPES.includes(spec));

function OfficialImage({ src, alt, className = '', loading = 'lazy' }) {
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      onError={(event) => {
        event.currentTarget.style.opacity = '0';
      }}
    />
  );
}

const vehicleCategoryGroups = [
  { id: 'Toutes', label: 'Toutes', match: () => true },
  { id: 'Économiques', label: 'Économiques', match: (category) => category.includes('Économiques') },
  { id: 'SUV', label: 'SUV', match: (category) => category.includes('SUV') },
  { id: '4x4', label: '4x4', match: (category) => category.includes('4x4') },
  { id: 'Pick-Up', label: 'Pick-Up', match: (category) => category.includes('Pick-Up') },
  { id: 'Utilitaires', label: 'Utilitaires', match: (category) => category.includes('Utilitaires') },
  { id: 'Minibus', label: 'Minibus & Autocars', match: (category) => category.includes('Minibus') || category.includes('Autocar') || category.includes('Autocars') },
];

export default function ServiceDetailPage({ service, navigateTo, onRequestQuote }) {
  const { user, token } = useAuth();
  const [isDevisOpen, setIsDevisOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [detailVehicle, setDetailVehicle] = useState(null);
  const [showVehicleRequestModal, setShowVehicleRequestModal] = useState(false);
  const [showProductRequestModal, setShowProductRequestModal] = useState(false);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [dynamicVehicles, setDynamicVehicles] = useState([]);
  const [dbProducts, setDbProducts] = useState([]);
  const [cartToast, setCartToast] = useState('');
  const [navbarHidden, setNavbarHidden] = useState(false);

  // Suit l'état masqué/visible de la navbar pour que les barres collantes puissent prendre sa place.
  useEffect(() => {
    const handler = (e) => setNavbarHidden(!!e.detail?.hidden || false);
    window.addEventListener('soutarah-navbar-visible', handler);
    return () => window.removeEventListener('soutarah-navbar-visible', handler);
  }, []);

  // Sur négoce/location, la navbar reste toujours visible (seule la barre sticky se masque)
  useEffect(() => {
    if (service.id === 'negoce' || service.id === 'vehicules') {
      document.body.dataset.keepNavbar = 'true';
      return () => { delete document.body.dataset.keepNavbar; };
    }
  }, [service.id]);

  // Bandeau de confirmation « ajouté au panier »
  useEffect(() => {
    if (!cartToast) return;
    const t = window.setTimeout(() => setCartToast(''), 2600);
    return () => window.clearTimeout(t);
  }, [cartToast]);

  const handleOpenDevis = () => openDevisByAuth({ user, navigateTo, onAuthed: () => setIsDevisOpen(true) });

  const handleVehicleReservation = (vehicle) => {
    if (!user) {
      window.sessionStorage.setItem('soutarah_pending_vehicle', JSON.stringify(vehicle));
      // Retour automatique sur cette page après connexion : le modal de
      // réservation s'ouvrira pour choisir les préférences (dates, chauffeur...)
      window.sessionStorage.setItem('soutarah_return_route', JSON.stringify({ page: 'service', slug: 'vehicules' }));
      if (navigateTo) navigateTo('login');
      return;
    }

    setSelectedVehicle(vehicle);
  };

  const addToNegoceCart = (product) => {
    try {
      const userId = user?.id || user?.userId || 'guest';
      const cartKey = `soutarah_negoce_cart_${userId}`;
      const existing = JSON.parse(localStorage.getItem(cartKey) || '[]');
      const alreadyAdded = existing.some((item) => item.id === product.id);
      if (!alreadyAdded) {
        existing.push({
          id: product.id,
          name: product.name || product.nom || (product.produit?.nom) || 'Article',
          ref: product.ref || product.reference || '',
          desc: product.desc || product.description || '',
          image: product.image || product.image_url || '/img/nexans/cable_04_v_jpg.jpg',
          pdf: product.pdf || '',
          category: product.category || product.categorie?.nom || 'Négoce',
          quantity: 1,
          price: Number(product.prixMarche ?? product.price ?? product.prix_unitaire ?? product.tarifs?.[0]?.prix) || 0,
          unitPrice: Number(product.prixMarche ?? product.price ?? product.prix_unitaire ?? product.tarifs?.[0]?.prix) || 0,
        });
        localStorage.setItem(cartKey, JSON.stringify(existing));
        window.dispatchEvent(new Event('soutarah-cart-updated'));
        setCartToast(`✓ « ${product.name || product.nom} » a été ajouté au panier.`);
      } else {
        setCartToast('Ce produit est déjà dans votre panier.');
      }
    } catch (e) {
      console.warn('Impossible d\u2019ajouter au panier négoce', e);
    }
  };

  const handleAddNexansToCart = (product) => {
    // Commander un produit exige un compte : le visiteur est envoyé vers le
    // login / création de compte, puis ramené sur cette page où son produit
    // est automatiquement ajouté au panier.
    if (!user) {
      try {
        window.sessionStorage.setItem('soutarah_pending_product', JSON.stringify(product));
        window.sessionStorage.setItem('soutarah_return_route', JSON.stringify({ page: 'service', slug: 'negoce' }));
      } catch (storageError) { /* sessionStorage indisponible */ }
      if (navigateTo) navigateTo('login');
      return;
    }
    addToNegoceCart(product);
  };
  const [activeFleetCategory, setActiveFleetCategory] = useState('Toutes');

  const relatedServices = useMemo(
    () => SERVICES_DATA.filter((item) => item.id !== service.id).slice(0, 2),
    [service.id],
  );

  const fleetCategories = useMemo(() => {
    const vehicles = service.rentalVehicles ?? [];
    return vehicleCategoryGroups
      .map((group) => ({
        ...group,
        count: vehicles.filter((vehicle) => group.match(vehicle.category || '')).length,
      }))
      .filter((group) => group.id === 'Toutes' || group.count > 0);
  }, [service.rentalVehicles]);

  // Charger les véhicules avec les prix dynamiques selon le profil client (base de données)
  useEffect(() => {
    if (service.id !== 'vehicules') return undefined;
    let active = true;
    apiRequest('/vehicles', { token }).then((res) => {
      if (!active) return;
      setDynamicVehicles(res.vehicles || []);
    }).catch(() => {
      if (active) setDynamicVehicles([]);
    });
    return () => { active = false; };
  }, [service.id, token]);

  // Charger les VRAIS produits de négoce depuis la base de données (comme l'admin)
  useEffect(() => {
    if (service.id !== 'negoce') return undefined;
    let active = true;
    apiRequest('/products', { token }).then((res) => {
      if (!active) return;
      setDbProducts(res.products || []);
    }).catch(() => {
      if (active) setDbProducts([]);
    });
    return () => { active = false; };
  }, [service.id, token]);

  const displayedVehicles = useMemo(() => {
    // Si des véhicules dynamiques (base de données) sont chargés, on les utilise DIRECTEMENT
    // pour que le client voie exactement les mêmes véhicules que dans l'admin.
    if (dynamicVehicles.length > 0) {
      let vehicles = dynamicVehicles.map((v) => ({
        id: v.id,
        name: `${v.marque || ''} ${v.modele || ''}`.trim() || 'Véhicule',
        category: v.categorie || 'Véhicule',
        specs: [v.places ? `${v.places} personnes` : '', v.transmission || ''].filter(Boolean),
        image: v.image_url || '/img/vehicles/dusterAvant.jpg',
        pricePerDay: Number(v.dailyPrice) || 0,
        dynamicPricePerDay: Number(v.dailyPrice) || 0,
        plate: v.immatriculation || v.plaque || '',
        ...v,
      }));

      // Filtre par catégorie
      if (activeFleetCategory !== 'Toutes') {
        const group = fleetCategories.find((item) => item.id === activeFleetCategory);
        if (group) {
          vehicles = vehicles.filter((vehicle) => group.match(vehicle.category || ''));
        }
      }
      // Filtre par recherche
      if (vehicleSearchQuery.trim()) {
        const query = vehicleSearchQuery.toLowerCase();
        vehicles = vehicles.filter((vehicle) =>
          vehicle.name?.toLowerCase().includes(query) ||
          vehicle.category?.toLowerCase().includes(query) ||
          String(vehicle.specs || []).toLowerCase().includes(query)
        );
      }
      return vehicles;
    }

    // Fallback : les fiches statiques illustrées par une image locale (uniquement si l'API ne répond pas)
    const usedImages = new Set();
    let vehicles = (service.rentalVehicles ?? []).filter((vehicle) => {
      const image = vehicle.image || '';
      if (!image.startsWith('/img/vehicles/') || usedImages.has(image)) return false;
      usedImages.add(image);
      return true;
    });

    // Filtre par catégorie
    if (activeFleetCategory !== 'Toutes') {
      const group = fleetCategories.find((item) => item.id === activeFleetCategory);
      if (group) {
        vehicles = vehicles.filter((vehicle) => group.match(vehicle.category || ''));
      }
    }
    // Filtre par recherche
    if (vehicleSearchQuery.trim()) {
      const query = vehicleSearchQuery.toLowerCase();
      vehicles = vehicles.filter((vehicle) =>
        vehicle.name?.toLowerCase().includes(query) ||
        vehicle.category?.toLowerCase().includes(query) ||
        vehicle.specs?.some((spec) => spec.toLowerCase().includes(query))
      );
    }

    return vehicles;
  }, [activeFleetCategory, vehicleSearchQuery, service.rentalVehicles, fleetCategories, dynamicVehicles]);


  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveFleetCategory('Toutes');
    setVehicleSearchQuery('');
  }, [service.id]);

  useEffect(() => {
    if (user && service.id === 'vehicules') {
      const pendingRaw = window.sessionStorage.getItem('soutarah_pending_vehicle');
      if (pendingRaw) {
        window.sessionStorage.removeItem('soutarah_pending_vehicle');
        try {
          const vehicle = JSON.parse(pendingRaw);
          if (vehicle && vehicle.name) {
            setSelectedVehicle(vehicle);
          }
        } catch (e) {
          console.error('Erreur lecture location vehicule en attente', e);
        }
      }
    }
  }, [user, service.id]);

  // Après connexion : reprise automatique côté négoce — le produit mis de côté
  // avant le login est ajouté au panier (le visiteur est ramené sur cette page).
  useEffect(() => {
    if (user && service.id === 'negoce') {
      const pendingRaw = window.sessionStorage.getItem('soutarah_pending_product');
      if (pendingRaw) {
        window.sessionStorage.removeItem('soutarah_pending_product');
        try {
          const product = JSON.parse(pendingRaw);
          if (product && (product.id || product.ref)) {
            addToNegoceCart(product);
          }
        } catch (e) {
          console.error('Erreur lecture produit en attente', e);
        }
      }
    }
  }, [user, service.id]);

  const handleFooterNavigation = (target) => {
    if (target === 'services') {
      navigateTo('services');
      return;
    }

    if (target === 'about') {
      navigateTo('about');
      return;
    }

    if (target === 'projects' || target === 'careers' || target === 'contact') {
      navigateTo(target);
      return;
    }

    navigateTo('home', { section: target });
  };

  const showLegacyFleet = service.id === '__legacy_fleet__';

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex flex-col font-sans selection:bg-primary selection:text-white">
      <Navbar
        onOpenDevis={handleOpenDevis}
        activeTab="services"
        navigateTo={navigateTo}
        forceSolid={service.id === 'negoce' || service.id === 'vehicules'}
      />

      <main className="flex-grow pt-28">
        <section className={`relative overflow-hidden bg-[#f4f8f4] pb-14 pt-12 sm:pb-20 sm:pt-16 ${service.id === 'vehicules' || service.id === 'negoce' ? 'hidden' : ''}`}>
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-[10%] h-48 w-48 rounded-full bg-[#69c33b]/10 blur-3xl" />

          <div className="relative max-w-[1280px] mx-auto px-4 sm:px-8">
            <FadeInSection immediate>
              <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500 sm:mb-10">
                <button onClick={() => navigateTo('home')} className="transition-colors hover:text-primary">Accueil</button>
                <span className="material-symbols-outlined text-sm text-gray-400">chevron_right</span>
                <button onClick={() => navigateTo('services')} className="transition-colors hover:text-primary">Services</button>
                <span className="material-symbols-outlined text-sm text-gray-400">chevron_right</span>
                <span className="font-bold text-[#1a1c1c]">{service.title}</span>
              </nav>
            </FadeInSection>

            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
              <FadeInSection immediate>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[17px]">{service.icon}</span>
                  {service.eyebrow}
                </div>

                <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-[#111827] sm:text-5xl lg:text-[3.55rem]">
                  {service.title}
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">{service.intro}</p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={handleOpenDevis}
                    className="shimmer-btn inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-[#1b4c00] hover:shadow-xl active:scale-95"
                  >
                    Demander un devis
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                  <button
                    onClick={() => document.getElementById('prestations')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#1b4d2e]/20 bg-white/80 px-6 py-3 text-sm font-bold text-[#1b4d2e] transition-colors hover:bg-white"
                  >
                    Voir les prestations
                    <span className="material-symbols-outlined text-base">south</span>
                  </button>
                </div>

                <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-[#1b4d2e]/10 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                    <span className="material-symbols-outlined text-xl">verified</span>
                  </span>
                  <div>
                    <p className="font-display text-lg font-extrabold tracking-tight text-[#111827]">{service.stat.value}</p>
                    <p className="text-xs font-semibold text-gray-500">{service.stat.label}</p>
                  </div>
                </div>
              </FadeInSection>

              <FadeInSection delay={120}>
                <div className="relative mx-auto max-w-[620px]">
                  <div className="absolute -inset-4 rounded-[40px] bg-primary/10 blur-2xl" />
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] border border-white/90 bg-white shadow-2xl shadow-[#1b4d2e]/12">
                    <OfficialImage
                      src={service.heroImage}
                      alt={service.title}
                      loading="eager"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/55 via-transparent to-transparent" />
                    <div className="absolute bottom-5 left-5 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1b4d2e] shadow-lg backdrop-blur-md sm:bottom-6 sm:left-6">
                      Visuel officiel · Soutarah Group
                    </div>
                  </div>
                  <div className="absolute -bottom-5 -right-2 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-xl backdrop-blur-sm sm:right-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-xl">{service.icon}</span>
                    </span>
                    <span className="text-xs font-bold leading-tight text-[#111827]">Une solution<br />à votre mesure</span>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        <FadeInSection immediate as="section" className={`bg-white py-8 sm:py-10 ${service.id === 'vehicules' || service.id === 'negoce' ? 'hidden' : ''}`}>
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center lg:gap-10">
              <div className="lg:col-span-5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Notre accompagnement</span>
                <h2 className="mt-1 font-display text-xl font-extrabold text-[#111827] sm:text-2xl">
                  Concevoir une réponse utile, concrète et durable.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-3">{service.overview}</p>
                <button
                  onClick={handleOpenDevis}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary transition-colors hover:text-[#1b4c00]"
                >
                  Échangeons sur votre besoin
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:col-span-7">
                {service.highlights.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-gray-200/80 bg-[#f9fbf9] p-4 transition-all hover:border-primary/20 hover:shadow-md">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    </div>
                    <h3 className="mt-3 font-display text-sm font-bold text-[#111827]">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeInSection>

        {service.rentalVehicles && (
          <RentalFleetSection
            categories={fleetCategories}
            activeCategory={activeFleetCategory}
            onCategoryChange={setActiveFleetCategory}
            searchQuery={vehicleSearchQuery}
            onSearchChange={setVehicleSearchQuery}
            vehicles={displayedVehicles}
            onReserve={handleVehicleReservation}
            onDetails={setDetailVehicle}
            onRequest={() => setShowVehicleRequestModal(true)}
          />
        )}

        {showLegacyFleet && service.rentalVehicles && (
          <FadeInSection immediate as="section" id="flotte" className="scroll-mt-24 bg-[#f8faf7] py-14 sm:py-18 lg:py-20">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                    <span className="material-symbols-outlined text-[15px]">directions_car</span>
                    La flotte Car Rental
                  </div>
                  <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">Choisissez le véhicule qui vous accompagne.</h2>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-primary/15 bg-white px-4 py-2.5 shadow-sm text-primary">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
                    <span className="material-symbols-outlined text-[18px]">directions_car</span>
                  </span>
                  <span>
                    <strong className="block text-base leading-none font-extrabold">{displayedVehicles.length}</strong>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">véhicules</span>
                  </span>
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
                <aside className="self-start rounded-[24px] border border-primary/10 bg-white p-3 shadow-sm shadow-[#143e22]/5 lg:sticky" style={{ top: navbarHidden ? '0.75rem' : '8rem' }}>
                  <div className="border-b border-gray-100 px-2 pb-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Types de véhicules</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-gray-500">Sélectionnez une catégorie.</p>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                    {fleetCategories.map((group) => {
                      const isActive = activeFleetCategory === group.id;

                      return (
                        <button
                          key={group.id}
                          onClick={() => setActiveFleetCategory(group.id)}
                          aria-pressed={isActive}
                          className={`group flex min-h-12 items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-left text-xs font-extrabold transition-all ${
                            isActive
                              ? 'bg-primary text-white shadow-lg shadow-primary/20'
                              : 'border border-gray-100 bg-[#f8faf7] text-[#30343b] hover:border-primary/25 hover:bg-white hover:text-primary hover:shadow-md'
                          }`}
                        >
                          <span className="leading-snug">{group.label}</span>
                          <span className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[10px] ${
                            isActive ? 'bg-white/20 text-white' : 'bg-white text-primary ring-1 ring-primary/10'
                          }`}>
                            {group.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </aside>

                <div className="min-w-0">
                  {/* Barre de recherche collante : prend la place de la navbar quand elle se masque */}
                  <div
                                                                                className="sticky z-20 mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white px-3 py-2 shadow-[0_4px_18px_-6px_rgba(23,61,35,0.12)]"
                    style={{ top: navbarHidden ? 8 : 116.8 }}
                  >
                    <div className="relative flex-1 min-w-[240px]">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        search
                      </span>
                      <input
                        type="text"
                        placeholder="Rechercher un véhicule..."
                        value={vehicleSearchQuery}
                        onChange={(e) => setVehicleSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-primary/10 bg-white/80 px-4 py-3 shadow-sm">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{activeFleetCategory}</p>
                      <p className="mt-0.5 text-xs font-semibold text-gray-500">{displayedVehicles.length} véhicule{displayedVehicles.length > 1 ? 's' : ''} affiché{displayedVehicles.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {displayedVehicles.length === 0 ? (
                    <div className="mt-8 rounded-[24px] border border-[#1b4c00] bg-[#1b4c00] px-6 py-12 text-center">
                      <span className="material-symbols-outlined text-5xl text-emerald-300">search_off</span>
                      <h3 className="mt-3 font-display text-lg font-bold text-white">Véhicule recherché</h3>
                      <p className="mt-1 text-sm text-emerald-200">Essayez une autre recherche ou faites-nous part de votre besoin.</p>
                      <button
                        onClick={() => setShowVehicleRequestModal(true)}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#1b4c00] hover:bg-emerald-50 transition"
                      >
                        <span className="material-symbols-outlined text-base">help</span>
                        Demander ce véhicule
                      </button>
                    </div>
                  ) : (
                  <div
                    role="region"
                    aria-label="Flotte de vehicules disponibles"
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  >
                    {displayedVehicles.map((vehicle, index) => (
                      <article
                        key={vehicle.name}
                        className="group flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-[#edf1ec]">
                          <OfficialImage
                            src={vehicle.image}
                            alt={vehicle.name}
                            loading={index > 2 ? 'lazy' : 'eager'}
                            className="h-full w-full object-contain p-2 transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#09220f]/60 via-transparent to-transparent" />
                          <span className="absolute bottom-2.5 left-2.5 max-w-[82%] rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[9px] font-bold text-white backdrop-blur-sm">
                            {vehicle.category}
                          </span>
                          <span className="absolute top-2.5 right-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-extrabold text-primary shadow-sm">
                            Modele 0{index + 1}
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col p-3.5">
                          <h3 className="font-display text-base font-extrabold leading-snug text-[#111827] transition-colors group-hover:text-primary">
                            {vehicle.name}
                          </h3>

                          <div className="mt-3 grid grid-cols-2 gap-1.5">
                            {displaySpecs(vehicle).map((spec, specIndex) => (
                              <span key={spec} className="flex min-h-8 items-center gap-1.5 rounded-xl bg-[#f2f7ef] px-2 py-1 text-[10px] font-bold text-gray-700">
                                <span className="material-symbols-outlined text-[13px] text-primary">
                                  {['group', 'local_gas_station', 'settings', 'verified_user'][specIndex]}
                                </span>
                                <span className="truncate">{spec}</span>
                              </span>
                            ))}
                          </div>

                          <div className="mt-3">
                            <button
                              onClick={() => handleVehicleReservation(vehicle)}
                              className="shimmer-btn inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-[11px] font-black text-white shadow-md shadow-primary/15 transition-all hover:bg-[#1b4c00] active:scale-95"
                            >
                              Réserver ce véhicule
                              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  )}
                </div>
              </div>
            </div>
          </FadeInSection>
        )}

        {service.id === 'negoce' && (
          <NexansCatalogSection
            categories={[
              ...(Array.isArray(dbProducts) ? [...new Set(dbProducts.map((p) => p.categorie?.nom).filter(Boolean))].map((catName) => ({
                id: catName,
                label: catName,
                icon: {
                  'Câbles de bâtiments': 'home_work',
                  'Câbles basse tension': 'bolt',
                  'Câbles moyenne tension': 'power',
                  'Lignes aériennes': 'air',
                  'Transformateurs': 'transform',
                  'Cellules HTA': 'electrical_services',
                  'Infrastructures Télécom': 'router',
                  'Accessoires d’énergie': 'settings',
                  'Postes préfabriqués': 'home_work',
                }[catName] || 'category',
                image: '/img/nexans/cable_04_v_jpg.jpg',
              })) : []),
            ]}
            products={(Array.isArray(dbProducts) ? dbProducts : []).map((p) => ({
              id: p.id,
              name: p.nom,
              ref: p.reference || '',
              desc: p.description || '',
              image: p.image_url || '/img/nexans/cable_04_v_jpg.jpg',
              pdf: '',
              category: p.categorie?.nom || 'Négoce',
              prixMarche: Number(p.price ?? p.tarifs?.[0]?.prix) || 0,
            }))}
            onRequestQuote={() => setShowProductRequestModal(true)}
            onAddToCart={handleAddNexansToCart}
          />
        )}
<FadeInSection immediate as="section" className="bg-[#f9f9f9] py-14 sm:py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Continuer votre exploration</span>
                <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">D’autres expertises à découvrir.</h2>
              </div>
              <button onClick={() => navigateTo('services')} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-[#1b4c00]">
                Voir tous les services
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {relatedServices.map((related) => (
                <button
                  key={related.id}
                  onClick={() => navigateTo('service', { slug: related.id })}
                  className="group flex min-h-[170px] overflow-hidden rounded-[26px] border border-gray-200/80 bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="w-[42%] shrink-0 overflow-hidden">
                    <OfficialImage src={related.image} alt={related.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">{related.eyebrow}</span>
                    <h3 className="mt-2 font-display text-lg font-bold text-[#111827]">{related.title}</h3>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#1b4d2e]">Découvrir <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">arrow_forward</span></span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </FadeInSection>

        <CtaBanner onOpenDevis={handleOpenDevis} />
      </main>

      <Footer onNavClick={handleFooterNavigation} />
      <DevisModal isOpen={isDevisOpen} onClose={() => setIsDevisOpen(false)} />
      <CarReservationModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} navigateTo={navigateTo} />
      <VehicleDetailModal vehicle={detailVehicle} onClose={() => setDetailVehicle(null)} onReserve={(vehicle) => { setDetailVehicle(null); handleVehicleReservation(vehicle); }} />
      {showVehicleRequestModal && (
        <VehicleRequestModal onClose={() => setShowVehicleRequestModal(false)} navigateTo={navigateTo} />
      )}
      {showProductRequestModal && (
        <ReqModal onClose={() => setShowProductRequestModal(false)} navigateTo={navigateTo} />
      )}
      {cartToast && (
        <div className="fixed bottom-6 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-fadeIn">
          <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-[#12251a] px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/20">
            <span className="material-symbols-outlined text-[20px] text-[#88e05a]">check_circle</span>
            <span className="min-w-0">{cartToast}</span>
            <button onClick={() => setCartToast('')} className="ml-auto text-white/50 transition hover:text-white" aria-label="Fermer">×</button>
          </div>
        </div>
      )}
    </div>
  );
}
