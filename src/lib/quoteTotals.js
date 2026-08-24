/** Calculs devis alignés sur la grille SOUTARAH (TVA 18 %, TDT 2.5 %) */
export const TVA_RATE = 0.18;
export const TDT_RATE = 0.025;

export function computeQuoteTotals(amountHT) {
  const ht = Math.round(Number(amountHT) || 0);
  const tva = Math.round(ht * TVA_RATE);
  const tdt = Math.round(ht * TDT_RATE);
  const ttc = ht + tva + tdt;
  return { ht, tva, tdt, ttc };
}
