/**
 * Corrige les réservations existantes dont le véhicule a été mal résolu
 * (bug historique : toutes liées au premier véhicule actif, ex. Toyota Tacoma).
 * Pour chaque réservation née d'un devis (reference RES-<ref>), on retrouve
 * le devis, on résout le VRAI véhicule depuis son snapshot (panier) et on
 * met à jour vehicule_id / prix si nécessaire.
 * Usage : node server/scripts/fix-reservation-vehicles.cjs [--dry-run]
 */
require('dotenv').config();
const { sequelize, Reservation, QuoteRequest } = require('../src/models/index.cjs');
const { resolveVehicleFromSnapshot } = require('../src/services/vehicle-resolve.service.cjs');

const DRY_RUN = process.argv.includes('--dry-run');

async function run() {
  try {
    const reservations = await Reservation.findAll({ order: [['cree_le', 'DESC']] });
    console.log(`Réservations trouvées : ${reservations.length}`);

    let fixed = 0;
    let unresolved = 0;
    let ok = 0;

    for (const res of reservations) {
      const ref = String(res.reference || '');
      if (!ref.startsWith('RES-')) { ok += 1; continue; }
      const quoteRef = ref.slice(4);

      const quote = await QuoteRequest.findOne({ where: { reference: quoteRef } });
      if (!quote) { ok += 1; continue; }

      const vehicle = await resolveVehicleFromSnapshot(quote.snapshot, quote.titre || '');
      if (!vehicle) { unresolved += 1; continue; }

      if (res.vehicule_id === vehicle.id) { ok += 1; continue; }

      const current = res.vehicule_id ? 'autre véhicule (erroné)' : 'aucun véhicule';
      console.log(`  ✏️  ${ref} : ${current} → ${vehicle.marque} ${vehicle.modele}`);

      if (!DRY_RUN) {
        await res.update({
          vehicule_id: vehicle.id,
          prix_journalier: vehicle.prix_journalier_particulier || res.prix_journalier,
        });
      }
      fixed += 1;
    }

    console.log(`\nRésumé : ${fixed} corrigée(s), ${unresolved} non résolue(s), ${ok} déjà correcte(s)${DRY_RUN ? ' (DRY-RUN : aucune modification)' : ''}`);
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await sequelize.close().catch(() => {});
    process.exit(1);
  }
}

run();