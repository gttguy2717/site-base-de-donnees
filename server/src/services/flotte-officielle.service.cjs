/**
 * SOUTARAH — Flotte officielle (source de vérité unique)
 * ============================================================================
 * Le client a fourni une liste blanche de véhicules : SEULS ceux-là doivent
 * rester sur le site et dans l'application mobile. Tout le reste doit
 * disparaître du catalogue public.
 *
 * Règles :
 *  1. Un véhicule est proposé si son nom (marque + modèle) figure dans
 *     `vehicules`, ou si ce nom commence par une entrée de
 *     `variantesPrefixe` (« Suzuki Grand Vitara » couvre « Grand Vitara 932 »,
 *     « Isuzu D-Max » couvre « D-Max 2024 »…).
 *  2. `variantesExclues` gagne toujours : « Mazda CX-30 » ne doit PAS être
 *     confondu avec « Mazda CX-3 » (modèle différent).
 *  3. Les autocars de groupe (20/22/25/30/32 places) et les cars de transport du
 *     personnel (Toyota Coaster, Hyundai County, Higer, King Long, Golden
 *     Dragon, Yutong — photos Wikimedia Commons) sont TOUJOURS conservés, même
 *     absents de la liste (consigne explicite du client). Ils sont déclarés
 *     dans shared/autocars-officiels.json et shared/cars-officiels.json.
 *
 * Ce module est voluntarily sans dépendance Sequelize : il sert aussi bien
 * aux contrôleurs API qu'au script de nettoyage de la base.
 */
const path = require('path');

const CONFIG = require(path.resolve(__dirname, '../../../shared/flotte-officielle.json'));

/** Minuscules, sans accent, ponctuation réduite à des espaces. */
function normaliser(valeur) {
  return String(valeur == null ? '' : valeur)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const NOMS_AUTORISES = new Set((CONFIG.vehicules || []).map(normaliser));

// Les listes « toujours gardées » sont explicitement approuvées par le client :
// on injecte leurs noms dans la liste blanche pour qu'ils passent le filtre.
const AUTOCARS_OFFICIELS = require(path.resolve(__dirname, '../../../shared/autocars-officiels.json'));
const CARS_OFFICIELS = require(path.resolve(__dirname, '../../../shared/cars-officiels.json'));
for (const v of [...(AUTOCARS_OFFICIELS.vehicules || []), ...(CARS_OFFICIELS.vehicules || [])]) {
  const nom = normaliser(`${v.marque} ${v.modele}`);
  if (nom) NOMS_AUTORISES.add(nom);
}
const PREFIXES_AUTORISES = (CONFIG.variantesPrefixe || []).map(normaliser).sort((a, b) => b.length - a.length);
const NOMS_EXCLUS = new Set((CONFIG.variantesExclues || []).map(normaliser));
const PLACES_GARDEES = new Set((CONFIG.placesToujoursGardes || []).map(Number));
// Le même modèle porte parfois un nom différent selon la source (« Range Rover »
// sur une fiche statique, « Land Rover Range Rover » en base). `equivalents`
// rapproche ces écritures du nom de référence de la liste blanche.
const EQUIVALENTS = new Map(
  Object.entries(CONFIG.equivalents || {}).map(([alias, reference]) => [normaliser(alias), normaliser(reference)]),
);

/** Message unique affiché au client quand son véhicule n'est pas au catalogue. */
const MESSAGE_INDISPONIBLE = "Ce véhicule n'est pas disponible à la location pour le moment. Vous pouvez choisir un autre véhicule ou nous contacter.";

function nomComplet(vehicule) {
  if (!vehicule) return '';
  // Un nom simple (« Range Rover ») est déjà le libellé complet.
  if (typeof vehicule === 'string') return normaliser(vehicule);
  const marque = vehicule.marque ?? vehicule.brand ?? '';
  const modele = vehicule.modele ?? vehicule.model ?? vehicule.name ?? vehicule.nom ?? '';
  return normaliser(`${marque} ${modele}`) || normaliser(modele);
}

/**
 * @param {object|string} vehicule  Instance Sequelize, objet { marque, modele, places } ou nom.
 * @returns {boolean} true si le véhicule fait partie de la flotte officielle.
 */
function estDansLaFlotte(vehicule) {
  if (!vehicule) return false;

  // Règle 3 : les autocars 25 / 32 places sont toujours conservés.
  const places = Number(vehicule.places);
  if (Number.isFinite(places) && PLACES_GARDEES.has(places)) return true;

  const nom = nomComplet(vehicule);
  if (!nom) return false;

  // Règle 2 : exclusion prioritaire (« Mazda CX-30 » ≠ « Mazda CX-3 »).
  if (NOMS_EXCLUS.has(nom)) return false;

  // Règle 1a : correspondance exacte.
  if (NOMS_AUTORISES.has(nom)) return true;

  // Même modèle, autre écriture : on substitut le nom de référence.
  const reference = EQUIVALENTS.get(nom);
  if (reference && NOMS_AUTORISES.has(reference)) return true;

  // Règle 1b : variante de finition / génération, y compris le nom exact d'un
  // préfixe autorisé (« Suzuki Grand Vitara » vs « Grand Vitara 932 »).
  return PREFIXES_AUTORISES.some((prefixe) => nom === prefixe || nom.startsWith(`${prefixe} `));
}

/** Garde-fou utilisé par les contrôleurs avant d'ajouter au panier. */
function vehiculeDisponible(vehicule) {
  if (!estDansLaFlotte(vehicule)) return false;
  if (vehicule.statut && vehicule.statut !== 'ACTIVE') return false;
  if (vehicule.disponibilite === false) return false;
  return true;
}

module.exports = {
  CONFIG,
  MESSAGE_INDISPONIBLE,
  normaliser,
  estDansLaFlotte,
  vehiculeDisponible,
};