'use strict';

/**
 * Correction des caractères UTF-8 cassés (mojibake) rencontrés dans les données
 * provenant de la base de données (notamment la barre d'annonces défilantes et
 * les paramètres généraux).
 *
 * Le texte type « v├®hicule & Flottes ÔÇö » correspond à des accents encodés
 * deux fois : du texte UTF-8 a été interprété comme du Latin-1 puis re-encodé,
 * produisant des caractères illisibles. Cette fonction rétablit l'encodage
 * correct en remplaçant les séquences connues par leur lettre française.
 */

// Corrections à appliquer (du motif le plus long au plus court pour éviter
// tout chevauchement partiel).
const MOJIBAKE_MAP = [
  ['ÔÇö', '—'], // em-dash —
  ['ÔÇó', '—'], // em-dash —
  ['ÔÇÖ', '’'], // apostrophe droite
  ['├®', 'é'], // é (très fréquent : Mat├®riel, v├®hicule)
  ['├¿', 'è'], // è (succ├¿s)
  ['├┤', 'ô'], // ô (C├┤te)
  ['├½', 'ë'], // ë (Citro├½n)
  ['├á', 'à'], // à (├á son)
  ['├ë', 'É'], // É (├¬quip)
  ['├º', 'ç'], // ç (Fran├ºais)
  ['Ã©', 'é'], // variante UTF-8 lu comme Latin-1 (classique)
  ['Ã¨', 'è'],
  ['Ãª', 'ê'],
  ['Ã®', 'î'],
  ['Ã¼', 'ü'],
  ['Ã¢', 'â'],
  ['Ã´', 'ô'],
  ['Ã§', 'ç'],
];

/**
 * Corrige une chaîne de caractères encodée en UTF-8 cassé.
 * @param {string} str
 * @returns {string}
 */
function repairText(str) {
  if (typeof str !== 'string') return str;
  if (str.indexOf('├') === -1 && str.indexOf('Ô') === -1 && str.indexOf('Ã') === -1) {
    return str;
  }
  let out = str;
  for (const [bad, good] of MOJIBAKE_MAP) {
    if (out.indexOf(bad) !== -1) out = out.split(bad).join(good);
  }
  return out;
}

/**
 * Parcours récursivement un objet / tableau et corrige toutes les chaînes.
 * @param {*} value
 * @returns {*}
 */
function repairRecursive(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(repairRecursive);
  if (typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) out[key] = repairRecursive(value[key]);
    return out;
  }
  if (typeof value === 'string') return repairText(value);
  return value;
}

module.exports = { repairText, repairRecursive };