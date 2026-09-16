/**
 * Estimation des frais annexes liés aux locations de véhicules,
 * conformément au modèle officiel de devis SOUTARAH :
 *  - « FRAIS DE CARBURANT » : estimés selon la consommation du véhicule
 *  - « FRAIS DE PEAGE ET STATIONNEMENT » : forfait fixe dès qu'il y a une location
 */

export const FUEL_PRICE_ESSENCE = 650; // FCFA / litre
export const FUEL_PRICE_GAZOLE = 600;  // FCFA / litre
export const KM_PER_DAY = 100;         // km estimés par jour de location

/** Forfait péage + stationnement (identique au modèle officiel : 5 500 FCFA) */
export const PARKING_TOLL_FEE = 5500;

/** Consommation L/100 km par famille de véhicule (mots-clés du nom, minuscule) */
const CONSUMPTION_RULES = [
  { keywords: ['dzire', 'vitz', 'micra', 'swift'], consumption: 6, diesel: false },
  { keywords: ['kicks', 'vitara', 'fronx', 'duster'], consumption: 8, diesel: false },
  { keywords: ['kadjar', 'koleos', 'rush'], consumption: 9, diesel: false },
  { keywords: ['pajero', 'highlander', 'montero', 'fortuner'], consumption: 12, diesel: false },
  { keywords: ['d-max', 'dmax', 'l200', 'tacoma', 'friday'], consumption: 10, diesel: true },
  { keywords: ['land cruiser', 'cruiser'], consumption: 15, diesel: false },
  { keywords: ['jumper', 'dokker', 'express', 'transit', 'oroch'], consumption: 9, diesel: true },
  { keywords: ['urvan', 'hiace', 'hyundai'], consumption: 11, diesel: true },
];

const DEFAULT_RULE = { consumption: 8, diesel: false };

function findRule(vehicleName) {
  const name = String(vehicleName || '').toLowerCase();
  return CONSUMPTION_RULES.find((rule) => rule.keywords.some((kw) => name.includes(kw))) || DEFAULT_RULE;
}

/**
 * Estime le coût du carburant pour une location.
 *
 * @param {string} vehicleName Nom (ou modèle) du véhicule
 * @param {number} days        Nombre de jours de location
 * @returns {number} Montant estimé en FCFA
 */
export function estimateFuelCost(vehicleName, days) {
  const rule = findRule(vehicleName);
  const nbDays = Math.max(1, Number(days) || 1);
  const litres = (KM_PER_DAY * nbDays * rule.consumption) / 100;
  return Math.round(litres * (rule.diesel ? FUEL_PRICE_GAZOLE : FUEL_PRICE_ESSENCE));
}

/**
 * Calcule les frais carburant / péage d'un panier ou d'une liste d'articles.
 *
 * @param {Array<{type?: string, vehicle?: {name?: string}, vehicleName?: string, vehicleType?: string, days?: number, duration?: number}>} items
 * @returns {{carburant: number, peage: number, hasVehicles: boolean}}
 */
export function estimateVehicleFees(items = []) {
  let carburant = 0;
  let hasVehicles = false;

  for (const item of items) {
    const type = String(item?.type || '');
    if (!type.startsWith('vehicle')) continue;

    hasVehicles = true;
    const vehicleName = item.vehicle?.name || item.vehicleName || item.vehicleType || '';
    carburant += estimateFuelCost(vehicleName, item.days || item.duration || 1);
  }

  return { carburant, peage: hasVehicles ? PARKING_TOLL_FEE : 0, hasVehicles };
}
