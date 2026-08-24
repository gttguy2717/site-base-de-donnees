import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../lib/api';
import { DESTINATION_ZONES, getVehicleDailyRate, getVehicleRentalTotal } from '../lib/vehiclePricing';
import Vehicle360Viewer from './Vehicle360Viewer';

const FUEL_TYPES = ['Essence', 'Gazole', 'Hybride', 'Diesel'];

const displaySpecs = (vehicle) => (vehicle.specs || []).filter((spec) => !FUEL_TYPES.includes(spec));

const isUtilityVehicle = (vehicle) => {
  if (!vehicle) return false;
  const placesSpec = (vehicle.specs || []).find((spec) => spec.includes('places') || spec.includes('personnes'));
  const numPlaces = placesSpec ? parseInt(placesSpec.match(/\d+/)?.[0] || '0', 10) : 0;
  return numPlaces >= 9 && numPlaces <= 28;
};

export default function CarReservationModal({ vehicle, onClose, navigateTo }) {
  const { user, client, token } = useAuth();
  const isLoggedIn = !!user;
  const [show360, setShow360] = useState(false);

  const availableColors = isUtilityVehicle(vehicle) ? ['Blanc'] : ['Bleu', 'Noir', 'Blanc'];

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    name: '',
    phone: '',
    email: '',
    withDriver: false,
    zoneId: 'abidjan',
    color: '',
  });

  const [availabilityError, setAvailabilityError] = useState('');

  useEffect(() => {
    if (!vehicle) return;

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const name = client?.entreprise?.nom
      || client?.company?.name
      || [client?.prenom || client?.firstName, client?.nom || client?.lastName].filter(Boolean).join(' ')
      || user?.name
      || '';

    const phone = user?.telephone || user?.phone || '';
    const email = user?.email || '';

    setFormData({
      startDate: today,
      endDate: tomorrow,
      name,
      phone,
      email,
      withDriver: false,
      zoneId: 'abidjan',
      color: isUtilityVehicle(vehicle) ? 'Blanc' : '',
    });
  }, [vehicle, user, client]);

  if (!vehicle) return null;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 1;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = end - start;
    if (diffTime <= 0) return 1;
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const days = calculateDays();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAvailabilityError('');

    const unitPrice = getVehicleDailyRate(vehicle, { withDriver: formData.withDriver, zoneId: formData.zoneId });
    const totalPrice = getVehicleRentalTotal(vehicle, { withDriver: formData.withDriver, zoneId: formData.zoneId, days });

    const vehicleUnavailableMessage =
      '🚗 Ce véhicule est déjà réservé sur la période sélectionnée.\n' +
      'Vous pouvez :\n' +
      '• Choisir une autre période (modifier les dates de début et de fin)\n' +
      '• Sélectionner un autre véhicule\n' +
      '• Contacter notre équipe pour une solution alternative.';

    try {
      // Étape 1 : Vérifier la disponibilité du véhicule AVANT d'ajouter au panier
      const availabilityResponse = await apiRequest(`/vehicles/${vehicle.id}/availability?startAt=${encodeURIComponent(formData.startDate)}&endAt=${encodeURIComponent(formData.endDate)}`, { token, retries: 0 });
      if (!availabilityResponse.available) {
        setAvailabilityError(vehicleUnavailableMessage);
        return;
      }
    } catch (availError) {
      // Si l'endpoint de disponibilité échoue, on laisse la validation notify-vehicle s'en charger
      console.warn('Endpoint disponibilité non joignable, vérification via notify-vehicle:', availError.message);
    }

    // Étape 2 : Envoyer la notification au serveur (vérifie à nouveau les conflits)
    try {
      await apiRequest('/cart/notify-vehicle', {
        token,
        method: 'POST',
        body: JSON.stringify({
          vehicleName: vehicle.name,
          startDate: formData.startDate,
          endDate: formData.endDate,
          days,
          withDriver: formData.withDriver,
        }),
      });
    } catch (notifyError) {
      console.error('Vérification disponibilité véhicule:', notifyError.message);
      setAvailabilityError(vehicleUnavailableMessage);
      return;
    }

    // Étape 3 : Si disponible, ajouter au panier (localStorage)
    const rentalItem = {
      id: `rental-${Date.now()}`,
      type: 'vehicle_rental',
      vehicle: {
        name: vehicle.name,
        category: vehicle.category,
        image: vehicle.image,
        specs: vehicle.specs,
        plate: vehicle.plate,
      },
      startDate: formData.startDate,
      endDate: formData.endDate,
      days,
      withDriver: formData.withDriver,
      zoneId: formData.zoneId,
      color: formData.color,
      destination: DESTINATION_ZONES.find((z) => z.id === formData.zoneId)?.label || 'Abidjan',
      unitPrice,
      totalPrice,
      contact: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
      },
      createdAt: new Date().toISOString(),
    };

    try {
      const userId = user?.id || user?.userId || 'guest';
      const cartKey = `soutarah_vehicle_cart_${userId}`;
      const existing = JSON.parse(localStorage.getItem(cartKey) || '[]');
      localStorage.setItem(cartKey, JSON.stringify([...existing, rentalItem]));
      window.dispatchEvent(new Event('soutarah-cart-updated'));
    } catch (e) {
      console.error("Erreur d'enregistrement dans le panier", e);
    }

    // Notifier les composants admin que la liste des notifications a changé
    window.dispatchEvent(new Event('soutarah-notifications-updated'));

    onClose();
    if (navigateTo) navigateTo('cart');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="reservation-title">
      <div className="relative my-auto w-full max-w-3xl overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-md transition-colors hover:bg-gray-100 hover:text-[#111827]"
          aria-label="Fermer la réservation"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[280px] overflow-hidden bg-[#143e22] text-white sm:p-0">
            {show360 ? (
              <>
                <Vehicle360Viewer vehicle={vehicle} />
                <button
                  onClick={() => setShow360(false)}
                  className="absolute right-3 top-3 z-30 flex items-center gap-1.5 rounded-full border border-white/25 bg-black/50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white backdrop-blur-md transition-colors hover:bg-black/70"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                  Fermer
                </button>
              </>
            ) : (
              <div className="relative flex h-full min-h-[280px] w-full flex-col items-center justify-center">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="max-h-[240px] w-auto object-contain drop-shadow-2xl"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/600x400/143e22/ffffff?text=Image+non+disponible';
                  }}
                />
                <button
                  onClick={() => setShow360(true)}
                  className="absolute bottom-[196px] right-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white backdrop-blur-md transition-all hover:bg-black/70 active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">360</span>
                  Aperçu 360°
                </button>
              </div>
            )}

            {/* Informations du véhicule */}
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-[#09220f] via-[#09220f]/85 to-transparent p-5 pt-12 sm:p-6">
              <span className="w-fit rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-sm">{vehicle.category}</span>
              <h2 id="reservation-title" className="mt-3 font-display text-3xl font-extrabold leading-tight">{vehicle.name}</h2>
              <p className="mt-1.5 text-sm text-emerald-100">Choisissez vos dates et options de location.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {displaySpecs(vehicle).map((spec) => (
                  <span key={spec} className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-50 backdrop-blur-sm">{spec}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Location de véhicule</span>
            <h3 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[#111827]">
              {isLoggedIn ? 'Sélectionnez vos dates' : 'Vos dates & coordonnées'}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              {isLoggedIn
                ? 'Vos informations de compte seront utilisées automatiquement.'
                : 'Configurez votre période et saisissez vos coordonnées.'}
            </p>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-[#1a1c1c]">Date de début *</span>
                  <input
                    name="startDate"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.startDate}
                    onChange={handleChange}
                    className="min-h-11 w-full rounded-xl border border-gray-200 bg-[#fafcf9] px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-[#1a1c1c]">Date de fin *</span>
                  <input
                    name="endDate"
                    type="date"
                    required
                    min={formData.startDate || undefined}
                    value={formData.endDate}
                    onChange={handleChange}
                    className="min-h-11 w-full rounded-xl border border-[#fafcf9] bg-[#fafcf9] px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-[#1a1c1c]">Destination *</span>
                <select
                  name="zoneId"
                  value={formData.zoneId}
                  onChange={handleChange}
                  className="min-h-11 w-full rounded-xl border border-gray-200 bg-[#fafcf9] px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  {DESTINATION_ZONES.map((zone) =>
                    <option key={zone.id} value={zone.id}>{zone.label}</option>
                  )}
                </select>
              </label>

              {!isLoggedIn && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-[#1a1c1c]">Nom complet *</span>
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
                    <span className="mb-1 block text-xs font-bold text-[#1a1c1c]">Téléphone *</span>
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
              )}

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-[#1a1c1c]">Couleur du véhicule *</span>
                <div className="grid grid-cols-3 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleChange({ target: { name: 'color', value: color } })}
                      className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-bold transition-all ${
                        formData.color === color
                          ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                          : 'border-gray-200 bg-[#fafcf9] text-gray-600 hover:border-primary/30'
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-black/10"
                        style={{
                          backgroundColor:
                            color === 'Blanc' ? '#ffffff' :
                            color === 'Noir' ? '#111827' :
                            '#1d4ed8',
                        }}
                      />
                      {color}
                    </button>
                  ))}
                </div>
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-primary/15 bg-primary/5 p-3 transition-colors hover:bg-primary/10">
                <div>
                  <span className="block text-sm font-bold text-[#1a1c1c]">Option chauffeur professionnel</span>
                  <span className="text-[11px] text-gray-600">Disponible de 7h à 21h selon conditions SOUTARAH.</span>
                </div>
                <input
                  name="withDriver"
                  type="checkbox"
                  checked={formData.withDriver}
                  onChange={handleChange}
                  className="h-5 w-5 accent-[#296c00]"
                />
              </label>

              <div className="rounded-2xl border border-gray-200 bg-[#fafcf9] p-4 text-sm space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Durée estimée</span>
                  <span className="font-bold text-gray-700">{days} jour{days > 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Message d'explication si le véhicule est déjà réservé */}
              {availabilityError && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-600 text-xl flex-shrink-0 mt-0.5">info</span>
                    <div className="space-y-2 whitespace-pre-line text-amber-900">
                      {availabilityError}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="shimmer-btn flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-[#1b4c00] active:scale-[0.99]"
              >
                Ajouter au panier
                <span className="material-symbols-outlined text-base">shopping_cart</span>
              </button>

              {!isLoggedIn && (
                <p className="text-center text-[11px] text-gray-500">
                  Déjà un compte ?{' '}
                  <button
                    type="button"
                    onClick={() => { onClose(); navigateTo?.('login'); }}
                    className="font-bold text-primary hover:underline"
                  >
                    Connectez-vous pour aller plus vite
                  </button>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}