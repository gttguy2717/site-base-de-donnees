import React, { useEffect, useMemo, useState } from 'react';
import { PackageSearch, ShoppingCart } from 'lucide-react';
import Navbar from '../components/Navbar';
import CtaBanner from '../components/CtaBanner';
import Footer from '../components/Footer';
import DevisModal from '../components/DevisModal';
import CarReservationModal from '../components/CarReservationModal';
import VehicleRequestModal from '../components/VehicleRequestModal';
import ReqModal from '../components/ReqModal';
import { useAuth } from '../hooks/useAuth';
import FadeInSection from '../components/FadeInSection';
import { SERVICES_DATA } from '../data/servicesData';
import { apiRequest } from '../lib/api';

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

const money = (value) => new Intl.NumberFormat('fr-CI', { maximumFractionDigits: 0 }).format(value || 0);
const vehicleCategoryGroups = [
  { id: 'Toutes', label: 'Toutes', match: () => true },
  { id: 'Citadines', label: 'Citadines', match: (category) => category.includes('Citadines') },
  { id: 'SUV', label: 'SUV', match: (category) => category.includes('SUV') },
  { id: '4x4', label: '4x4', match: (category) => category.includes('4x4') },
  { id: 'Pick-Up', label: 'Pick-Up', match: (category) => category.includes('Pick-Up') },
  { id: 'Utilitaires', label: 'Utilitaires', match: (category) => category.includes('Utilitaires') },
  { id: 'Minibus', label: 'Minibus & Autocars', match: (category) => category.includes('Minibus') || category.includes('Autocar') },
];

export default function ServiceDetailPage({ service, navigateTo, onRequestQuote }) {
  const { user, token } = useAuth();
  const [isDevisOpen, setIsDevisOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleRequestModal, setShowVehicleRequestModal] = useState(false);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [negoceProducts, setNegoceProducts] = useState([]);
  const [negoceCategories, setNegoceCategories] = useState([]);
  const [negoceCategoryId, setNegoceCategoryId] = useState('');
  const [negoceLoading, setNegoceLoading] = useState(false);
  const [addingProductId, setAddingProductId] = useState(null);
  const [negoceNotice, setNegoceNotice] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [showProductRequestModal, setShowProductRequestModal] = useState(false);
  const [dynamicVehicles, setDynamicVehicles] = useState([]);

  const handleVehicleReservation = (vehicle) => {
    if (!user) {
      window.sessionStorage.setItem('soutarah_pending_vehicle', JSON.stringify(vehicle));
      (onRequestQuote || ((openModal) => openModal()))(() => setIsDevisOpen(true));
      return;
    }

    setSelectedVehicle(vehicle);
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

  const displayedProducts = useMemo(() => {
    let products = negoceProducts;
    
    if (productSearchQuery.trim()) {
      const query = productSearchQuery.toLowerCase();
      products = products.filter((product) => 
        (product.nom || product.name || '').toLowerCase().includes(query) ||
        (product.reference || '').toLowerCase().includes(query) ||
        (product.categorie?.nom || product.category?.nom || '').toLowerCase().includes(query) ||
        (product.description || '').toLowerCase().includes(query)
      );
    }
    
    return products;
  }, [negoceProducts, productSearchQuery]);

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

  const displayedVehicles = useMemo(() => {
    let vehicles = service.rentalVehicles ?? [];
    
    // Fusionner les prix dynamiques de la base (selon le profil client) avec les données statiques
    if (dynamicVehicles.length > 0) {
      vehicles = vehicles.map((staticVehicle) => {
        // Essayer de matcher par nom (ex: "Mitsubishi Pajero 13" ↔ marque+modele)
        const matcher = staticVehicle.name.toLowerCase();
        const dynamic = dynamicVehicles.find((v) => {
          const fullName = `${v.marque || ''} ${v.modele || ''}`.toLowerCase();
          const altName = `${v.modele || ''} ${v.marque || ''}`.toLowerCase();
          return fullName.includes(matcher) || altName.includes(matcher) || matcher.includes(fullName);
        });
        if (!dynamic) return staticVehicle;
        // Surcharger le prix de base avec le prix dynamique calculé par l'API selon le profil client
        return {
          ...staticVehicle,
          id: dynamic.id, // ID du véhicule en base (utilisé pour vérifier la disponibilité)
          pricePerDay: dynamic.dailyPrice != null ? Number(dynamic.dailyPrice) : staticVehicle.pricePerDay,
          dynamicPricePerDay: dynamic.dailyPrice != null ? Number(dynamic.dailyPrice) : null,
        };
      });
    }
    
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
        vehicle.specs?.some(spec => spec.toLowerCase().includes(query))
      );
    }
    
    return vehicles;
  }, [activeFleetCategory, vehicleSearchQuery, service.rentalVehicles, fleetCategories, dynamicVehicles]);

  useEffect(() => {
    if (service.id !== 'negoce') return undefined;
    let active = true;
    setNegoceLoading(true);
    Promise.all([
      apiRequest('/categories').catch(() => ({ categories: [] })),
      apiRequest(`/products${negoceCategoryId ? `?categoryId=${encodeURIComponent(negoceCategoryId)}` : ''}`, { token }).catch(() => ({ products: [] })),
    ]).then(([categoriesRes, productsRes]) => {
      if (!active) return;
      setNegoceCategories(categoriesRes.categories || []);
      setNegoceProducts(productsRes.products || []);
    }).finally(() => active && setNegoceLoading(false));
    return () => { active = false; };
  }, [service.id, negoceCategoryId, token]);

  const addNegoceToCart = async (product) => {
    if (!token) {
      navigateTo('login');
      return;
    }
    setAddingProductId(product.id);
    setNegoceNotice('');
    try {
      await apiRequest('/cart/items', { token, method: 'POST', body: JSON.stringify({ productId: product.id, quantity: 1 }) });
      window.dispatchEvent(new Event('soutarah-cart-updated'));
      setNegoceNotice(`${product.nom || product.name} ajouté au panier — consultez votre panier pour voir le tarif.`);
    } catch (e) {
      setNegoceNotice(e.message);
    } finally {
      setAddingProductId(null);
    }
  };


  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveFleetCategory('Toutes');
    setVehicleSearchQuery('');
    setNegoceCategoryId('');
    setNegoceNotice('');
    setProductSearchQuery('');
    setShowProductRequestModal(false);
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

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex flex-col font-sans selection:bg-primary selection:text-white">
      <Navbar
        onOpenDevis={() => setIsDevisOpen(true)}
        activeTab="services"
        navigateTo={navigateTo}
      />

      <main className="flex-grow pt-28">
        <section className="relative overflow-hidden bg-[#f4f8f4] pb-14 pt-12 sm:pb-20 sm:pt-16">
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
                    onClick={() => setIsDevisOpen(true)}
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

        <FadeInSection immediate as="section" className="bg-white py-8 sm:py-10">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center lg:gap-10">
              <div className="lg:col-span-5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Notre accompagnement</span>
                <h2 className="mt-1 font-display text-xl font-extrabold text-[#111827] sm:text-2xl">
                  Concevoir une réponse utile, concrète et durable.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-3">{service.overview}</p>
                <button
                  onClick={() => (onRequestQuote || ((openModal) => openModal()))(() => setIsDevisOpen(true))}
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
                <aside className="self-start rounded-[24px] border border-primary/10 bg-white p-3 shadow-sm shadow-[#143e22]/5 lg:sticky lg:top-32">
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
                  {/* Barre de recherche + Bouton demande véhicule */}
                  <div className="mb-4 flex flex-wrap items-center gap-3">
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
                    
                    <button
                      onClick={() => setShowVehicleRequestModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold text-sm transition-all whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[18px]">help</span>
                      Véhicule non trouvé ?
                    </button>
                  </div>

                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-primary/10 bg-white/80 px-4 py-3 shadow-sm">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{activeFleetCategory}</p>
                      <p className="mt-0.5 text-xs font-semibold text-gray-500">{displayedVehicles.length} vehicule{displayedVehicles.length > 1 ? 's' : ''} affiche{displayedVehicles.length > 1 ? 's' : ''}</p>
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
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                              Reserver ce vehicule
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
          <FadeInSection immediate as="section" id="negoce-produits" className="scroll-mt-24 bg-[#f8faf7] py-14 sm:py-18 lg:py-20">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  <span className="material-symbols-outlined text-[15px]">inventory_2</span>
                  Négoce & import-export
                </div>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">Produits et équipements disponibles</h2>
                <p className="mt-2 text-sm text-gray-600">Ajoutez les articles à votre panier — le tarif s&apos;affiche uniquement dans le panier selon votre profil client.</p>
              </div>

              {negoceNotice && (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                  {negoceNotice}
                </div>
              )}

              <div className="mt-8 grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
                <aside className="self-start rounded-[24px] border border-primary/10 bg-white p-3 shadow-sm shadow-[#143e22]/5 lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto">
                  <div className="border-b border-gray-100 px-2 pb-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Catégories</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-gray-500">Sélectionnez une catégorie.</p>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                    <button
                      onClick={() => setNegoceCategoryId('')}
                      aria-pressed={!negoceCategoryId}
                      className={`group flex min-h-12 items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-left text-xs font-extrabold transition-all ${
                        !negoceCategoryId
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'border border-gray-100 bg-[#f8faf7] text-[#30343b] hover:border-primary/25 hover:bg-white hover:text-primary hover:shadow-md'
                      }`}
                    >
                      <span className="leading-snug">Toutes</span>
                      <span className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[10px] ${
                        !negoceCategoryId ? 'bg-white/20 text-white' : 'bg-white text-primary ring-1 ring-primary/10'
                      }`}>
                        {negoceCategories.reduce((sum, c) => sum + (c._count?.produits || 0), displayedProducts.length) || negoceProducts.length}
                      </span>
                    </button>
                    {negoceCategories.map((category) => {
                      const isActive = negoceCategoryId === category.id;
                      const count = negoceProducts.filter(p => (p.categorie?.id || p.category?.id) === category.id).length;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setNegoceCategoryId(category.id)}
                          aria-pressed={isActive}
                          className={`group flex min-h-12 items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-left text-xs font-extrabold transition-all ${
                            isActive
                              ? 'bg-primary text-white shadow-lg shadow-primary/20'
                              : 'border border-gray-100 bg-[#f8faf7] text-[#30343b] hover:border-primary/25 hover:bg-white hover:text-primary hover:shadow-md'
                          }`}
                        >
                          <span className="leading-snug">{category.nom || category.name}</span>
                          <span className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[10px] ${
                            isActive ? 'bg-white/20 text-white' : 'bg-white text-primary ring-1 ring-primary/10'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </aside>

                <div className="min-w-0">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[240px]">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        search
                      </span>
                      <input
                        type="text"
                        placeholder="Rechercher un produit, une référence..."
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <button
                      onClick={() => setShowProductRequestModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold text-sm transition-all whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[18px]">help</span>
                      Produit non trouvé ?
                    </button>
                    <div className="flex items-center gap-2 rounded-2xl border border-primary/15 bg-white px-4 py-2.5 shadow-sm text-primary">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
                        <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                      </span>
                      <span>
                        <strong className="block text-base leading-none font-extrabold">{displayedProducts.length}</strong>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">produits</span>
                      </span>
                    </div>
                  </div>

                  {negoceLoading ? (
                    <p className="py-14 text-center font-semibold text-gray-500">Chargement des produits…</p>
                  ) : displayedProducts.length ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {displayedProducts.map((product) => (
                        <article key={product.id} className="flex flex-col overflow-hidden rounded-[20px] border border-gray-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
                          <div className="relative h-36 overflow-hidden bg-[#e8f1e5] text-primary">
                            {product.image_url || product.imageUrl ? (
                              <img src={product.image_url || product.imageUrl} alt={product.nom || product.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="grid h-full w-full place-items-center"><PackageSearch size={36} /></div>
                            )}
                            <span className="absolute top-2.5 left-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-extrabold text-primary shadow-sm">
                              {product.categorie?.nom || product.category?.nom || 'Négoce'}
                            </span>
                          </div>
                          <div className="flex flex-1 flex-col p-4">
                            <h3 className="font-display text-base font-extrabold text-[#111827]">{product.nom || product.name}</h3>
                            <p className="mt-1 line-clamp-2 flex-1 text-xs text-gray-600">{product.description || 'Produit disponible sur demande.'}</p>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-400">
                                {product.unite || 'unité'}
                              </span>
                            </div>
                            <button
                              disabled={addingProductId === product.id}
                              onClick={() => addNegoceToCart(product)}
                              className="mt-3 inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-primary px-3 py-2 text-[11px] font-black text-white disabled:bg-gray-300"
                            >
                              <ShoppingCart size={14} />
                              {addingProductId === product.id ? 'Ajout…' : 'Ajouter au panier'}
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-8 rounded-[24px] border border-[#1b4c00] bg-[#1b4c00] px-6 py-12 text-center">
                      <span className="material-symbols-outlined text-5xl text-emerald-300">search_off</span>
                      <h3 className="mt-3 font-display text-lg font-bold text-white">Produit recherché</h3>
                      <p className="mt-1 text-sm text-emerald-200">Essayez une autre recherche ou faites-nous part de votre besoin.</p>
                      <button
                        onClick={() => setShowProductRequestModal(true)}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#1b4c00] hover:bg-emerald-50 transition"
                      >
                        <span className="material-symbols-outlined text-base">help</span>
                        Demander ce produit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FadeInSection>
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

        <CtaBanner onOpenDevis={() => (onRequestQuote || ((openModal) => openModal()))(() => setIsDevisOpen(true))} />
      </main>

      <Footer onNavClick={handleFooterNavigation} />
      <DevisModal isOpen={isDevisOpen} onClose={() => setIsDevisOpen(false)} />
      <CarReservationModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} navigateTo={navigateTo} />
      {showVehicleRequestModal && (
        <VehicleRequestModal onClose={() => setShowVehicleRequestModal(false)} navigateTo={navigateTo} />
      )}
      {showProductRequestModal && (
        <ReqModal onClose={() => setShowProductRequestModal(false)} navigateTo={navigateTo} />
      )}
    </div>
  );
}
