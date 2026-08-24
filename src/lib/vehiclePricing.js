/** Grille tarifaire 2026 — zones et calcul journalier */
export const DESTINATION_ZONES = [
  { id: 'abidjan', label: 'Abidjan' },
  { id: 'interieur', label: 'Intérieur' },
];

export function getVehicleDailyRate(vehicle, { withDriver = false, zoneId = 'abidjan' } = {}) {
  // Priorité au prix dynamique calculé par l'API selon le profil client (base de données)
  if (vehicle.dynamicPricePerDay != null && Number(vehicle.dynamicPricePerDay) > 0) return Number(vehicle.dynamicPricePerDay);
  const zone = vehicle.tariffs?.[zoneId] || vehicle.tariffs?.abidjan;
  if (zone) return withDriver ? Number(zone.withDriver) : Number(zone.withoutDriver);
  if (vehicle.pricePerDay) return Number(vehicle.pricePerDay);
  return null;
}

export function getVehicleRentalTotal(vehicle, { withDriver, zoneId, days }) {
  const daily = getVehicleDailyRate(vehicle, { withDriver, zoneId });
  if (!daily || !days) return null;
  return daily * Math.max(1, Number(days));
}

export function getZoneLabel(zoneId) {
  return DESTINATION_ZONES.find((z) => z.id === zoneId)?.label || 'Abidjan';
}
