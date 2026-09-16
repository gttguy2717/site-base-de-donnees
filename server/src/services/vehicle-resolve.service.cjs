/**
 * Résout le véhicule réel à partir du snapshot d'un devis (panier).
 * Priorité : ID du véhicule stocké dans le panier → correspondance exacte
 * marque+modèle → correspondance partielle. JAMAIS de fallback « premier
 * véhicule actif » (source du bug Toyota Tacoma).
 */
function parseSnapshot(snapshot) {
  if (!snapshot) return [];
  try {
    const parsed = typeof snapshot === 'string' ? JSON.parse(snapshot) : snapshot;
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.items)) return parsed.items;
    return [];
  } catch (e) {
    return [];
  }
}

function itemVehicleName(item) {
  return String(
    item?.vehicleName
    || item?.vehicle?.name
    || item?.vehicle?.marque
    || item?.name
    || '',
  ).trim();
}

async function resolveVehicleFromSnapshot(snapshot, extraText = '') {
  const { Vehicle } = require('../models/index.cjs');
  const items = parseSnapshot(snapshot);

  // 1) ID direct du véhicule enregistré dans le panier
  for (const item of items) {
    const rawId = item?.vehicleId || item?.vehicle?.id || item?.vehicle_id || item?.vehicule_id;
    if (rawId) {
      const byId = await Vehicle.findByPk(rawId);
      if (byId) return byId;
    }
  }

  // 2) Correspondance par nom (marque + modèle) sur les items véhicule
  const names = items
    .filter((item) => item?.type === 'vehicle_rental' || String(item?.type || '').startsWith('vehicle') || item?.type === 'location' || item?.vehicle || item?.vehicleName)
    .map(itemVehicleName)
    .filter(Boolean);
  if (extraText) names.push(String(extraText));

  for (const name of names) {
    const cleaned = name.toLowerCase().trim();
    if (!cleaned) continue;
    const all = await Vehicle.findAll({ where: { statut: 'ACTIVE' } });
    // Correspondance exacte « marque modele »
    const exact = all.find((v) => `${v.marque} ${v.modele}`.toLowerCase().trim() === cleaned)
      || all.find((v) => String(v.modele || '').toLowerCase().trim() === cleaned)
      || all.find((v) => String(v.marque || '').toLowerCase().trim() === cleaned);
    if (exact) return exact;
    // Correspondance par mots (tous les mots significatifs du nom présents)
    const words = cleaned.split(/[^a-z0-9]+/).filter((w) => w.length > 2);
    if (words.length) {
      const partial = all.find((v) => {
        const vehicleName = `${v.marque} ${v.modele}`.toLowerCase();
        return words.every((w) => vehicleName.includes(w));
      });
      if (partial) return partial;
    }
  }

  return null;
}

module.exports = { resolveVehicleFromSnapshot, parseSnapshot, itemVehicleName };
