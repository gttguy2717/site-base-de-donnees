/**
 * Calculs devis conformes au modèle officiel SOUTARAH (mêmes règles que le site) :
 *  - TVA 18 %        : facturée, incluse dans le TTC
 *  - TDT 2,5 %       : facturée UNIQUEMENT sur les véhicules (locations), incluse dans le TTC
 *  - FRAIS DE CARBURANT / PEAGE / STATIONNEMENT : NON facturés (supprimés du devis client)
 *  - TTC             = MONTANT HT + TVA + TDT (TDT uniquement si véhicules)
 */

export const TVA_RATE = 0.18;
export const TDT_RATE = 0.025; // Taxe de Développement Territorial (2,5 %)

export interface QuoteTotals {
  ht: number;
  tva: number;
  tdt: number;
  carburant: number;
  peage: number;
  ttc: number;
}

/**
 * Calcule les totaux d'un devis selon le modèle officiel SOUTARAH.
 *
 * @param {number} amountHT   Montant HT total du devis
 * @param {number} [vehicleHT] Montant HT des véhicules (locations). La TDT est
 *                             calculée sur CE montant uniquement, jamais sur le négoce.
 */
export function computeQuoteTotals(amountHT: number, vehicleHT: number | boolean = false): QuoteTotals {
  const ht = Math.round(Number(amountHT) || 0);

  // Base de la TDT = montant HT des véhicules uniquement
  const vehicleBase =
    typeof vehicleHT === 'boolean'
      ? (vehicleHT ? ht : 0)
      : Math.round(Number(vehicleHT) || 0);

  const tva = Math.round(ht * TVA_RATE);
  const tdt = Math.round(vehicleBase * TDT_RATE);

  // Carburant / péage non facturés au client
  const carburant = 0;
  const peage = 0;

  const ttc = ht + tva + tdt;

  return { ht, tva, tdt, carburant, peage, ttc };
}