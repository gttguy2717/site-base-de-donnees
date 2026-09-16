/**
 * Calculs devis conformes au modèle officiel SOUTARAH :
 *  - TVA 18 %        : facturée, incluse dans le TTC
 *  - TDT 2,5 %       : facturée UNIQUEMENT sur les véhicules (locations), incluse dans le TTC
 *  - FRAIS DE CARBURANT / PEAGE / STATIONNEMENT : NON facturés (supprimés du devis client)
 *  - TTC             = MONTANT HT + TVA + TDT (TDT uniquement si véhicules)
 */
export const TVA_RATE = 0.18;
export const TDT_RATE = 0.025; // Taxe de Développement Territorial (2,5 %)

/**
 * Calcule les totaux d'un devis selon le modèle officiel SOUTARAH.
 *
 * @param {number} amountHT        Montant HT total du devis
 * @param {number|boolean} [vehicleHT]  Montant HT des véhicules (locations). La TDT
 *                                 est calculée sur CE montant uniquement, jamais sur
 *                                 les articles négoce. (Un booléen true est accepté
 *                                 par compatibilité, mais on utilise sa valeur réelle
 *                                 lorsqu'un nombre est fourni.)
 * @param {{carburant?: number, peage?: number, fuel?: number, toll?: number}} [fees]
 *                                 Frais annexes facturés au client
 * @returns {{ht: number, tva: number, tdt: number, carburant: number, peage: number, ttc: number}}
 */
export function computeQuoteTotals(amountHT, vehicleHT = false, fees = {}) {
  const ht = Math.round(Number(amountHT) || 0);

  // Base de la TDT = montant HT des véhicules uniquement (jamais le négoce)
  const vehicleBase = typeof vehicleHT === 'boolean'
    ? (vehicleHT ? ht : 0)
    : (Math.round(Number(vehicleHT) || 0));

  const tva = Math.round(ht * TVA_RATE);
  // TDT uniquement sur les véhicules (locations), pas sur les articles négoce
  const tdt = Math.round(vehicleBase * TDT_RATE);

  // FRAIS DE CARBURANT / PEAGE / STATIONNEMENT : non facturés au client
  const carburant = 0;
  const peage = 0;

  // Le Montant TTC inclut la TVA et la TDT (les frais de carburant/péage sont
  // volontairement exclus du calcul du TTC).
  const ttc = ht + tva + tdt;

  return { ht, tva, tdt, carburant, peage, ttc };
}
