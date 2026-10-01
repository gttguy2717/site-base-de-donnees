/**
 * SOUTARAH — Purge du catalogue hors flotte officielle
 * ---------------------------------------------------------------------------
 * Usage :  node server/scripts/clean-vehicle-catalog.cjs [--dry-run] [--restore]
 *
 * Le client a validé une liste blanche : TOUT ce qui n'y figure pas est
 * SUPPRIMÉ de la base. Les autocars de 25 et 32 places sont toujours conservés.
 *
 * Suppression réelle et non simple désactivation. Les contraintes de clé
 * étrangère sont traitées du plus dépendant au moins dépendant :
 *   1. promotions / vehicule_prix_entreprises  (ON DELETE CASCADE)
 *   2. articles_panier                          (RESTRICT)  → supprimées
 *   3. reservations                             (RESTRICT, NOT NULL) → voir ci-dessous
 *
 * ⚠️ Les réservations sont l'historique commercial : elles ne sont JAMAIS
 * supprimées. Un véhicule encore réservé est seulement neutralisé
 * (INACTIVE + indisponible) : il disparaît du site et de l'app, mais la
 * traçabilité des devis et des factures déjà émises est préservée.
 *
 * Options :
 *   (aucune)     rapport uniquement, aucune écriture (par défaut)
 *   --restore    applique réellement la purge
 */
const { sequelize, Vehicle, Reservation, CartItem } = require('../src/models/index.cjs');
const { estDansLaFlotte, CONFIG } = require('../src/services/flotte-officielle.service.cjs');

const DRY_RUN = !process.argv.includes('--restore');

async function main() {
  console.log('🚗 SOUTARAH — Purge du catalogue hors flotte officielle');
  console.log('─'.repeat(66));
  console.log(`   Liste blanche : ${CONFIG.vehicules.length} modèles + variantes + autocars ${CONFIG.placesToujoursGardes.join('/')} places`);
  console.log('─'.repeat(66));

  await sequelize.authenticate();
  console.log('✅ Connexion à la base de données établie\n');

  const vehicles = await Vehicle.findAll({ order: [['marque', 'ASC'], ['modele', 'ASC']] });

  const aGarder = [];
  const aSupprimer = [];
  for (const vehicle of vehicles) {
    (estDansLaFlotte(vehicle) ? aGarder : aSupprimer).push(vehicle);
  }

  console.log(`📦 Total en base             : ${vehicles.length}`);
  console.log(`✅ Gardés (flotte officielle): ${aGarder.length}`);
  console.log(`🗑️  À supprimer              : ${aSupprimer.length}\n`);

  // État des dépendances : suppression possible, ou neutralisation obligatoire.
  const etats = [];
  for (const vehicle of aSupprimer) {
    /* eslint-disable no-await-in-loop */
    const [reservations, panier] = await Promise.all([
      Reservation.count({ where: { vehicule_id: vehicle.id } }),
      CartItem.count({ where: { vehicule_id: vehicle.id } }),
    ]);
    etats.push({ vehicle, reservations, panier });
  }

  const avecReservations = etats.filter((e) => e.reservations > 0);
  const supprimables = etats.filter((e) => e.reservations === 0);
  const avecPanier = etats.filter((e) => e.panier > 0);

  console.log(`🗑️  Suppression possible      : ${supprimables.length}`);
  console.log(`🔒 Neutralisés (réservés)    : ${avecReservations.length}`);
  console.log(`🧹 Lignes de panier à purger : ${avecPanier.reduce((s, e) => s + e.panier, 0)}\n`);

  if (avecReservations.length) {
    console.log('🔒 Véhicules avec réservations — retirés de la vente, conservés en base :');
    avecReservations.forEach(({ vehicle, reservations, panier }) => {
      console.log(`   - ${vehicle.marque} ${vehicle.modele} (${reservations} réservation(s)${panier ? `, ${panier} ligne(s) de panier` : ''})`);
    });
    console.log('');
  }

  if (DRY_RUN) {
    console.log('🔎 MODE DRY-RUN — aucune écriture.');
    console.log('   Relancez avec --restore pour appliquer la purge.\n');
    await sequelize.close();
    return;
  }

  // 1. Panier : les lignes de véhicules retirés sont supprimées ────────
  let lignesPanier = 0;
  if (avecPanier.length) {
    lignesPanier = await CartItem.destroy({
      where: { vehicule_id: avecPanier.map((e) => e.vehicle.id) },
    });
    console.log(`🧹 ${lignesPanier} ligne(s) de panier supprimée(s)`);
  }

  // 2. Purge des véhicules réellement supprimables ─────────────────────
  // promotions et vehicule_prix_entreprises sont en ON DELETE CASCADE.
  let supprimes = 0;
  for (const { vehicle } of supprimables) {
    try {
      /* eslint-disable no-await-in-loop */
      await vehicle.destroy();
      supprimes += 1;
    } catch (error) {
      // Filet de sécurité : une contrainte non anticipée ne doit pas
      // interrompre la purge. On neutralise le véhicule dans ce cas.
      /* eslint-disable no-await-in-loop */
      await vehicle.update({ statut: 'INACTIVE', disponibilite: false });
      console.log(`   ⚠️  ${vehicle.marque} ${vehicle.modele} — suppression bloquée (${error.name}), neutralisé`);
    }
  }

  // 3. Neutralisation des véhicules encore réservés ───────────────────
  let neutralises = 0;
  for (const { vehicle } of avecReservations) {
    /* eslint-disable no-await-in-loop */
    await vehicle.update({ statut: 'INACTIVE', disponibilite: false });
    neutralises += 1;
  }

  // 4. Réactivation : la liste du client fait foi ──────────────────────
  let reactives = 0;
  for (const vehicle of aGarder) {
    if (vehicle.statut !== 'ACTIVE' || vehicle.disponibilite === false) {
      /* eslint-disable no-await-in-loop */
      await vehicle.update({ statut: 'ACTIVE', disponibilite: true });
      reactives += 1;
      console.log(`   ↻ ${vehicle.marque} ${vehicle.modele} — réactivé`);
    }
  }

  const restant = await Vehicle.count();
  const actifs = await Vehicle.count({ where: { statut: 'ACTIVE', disponibilite: true } });

  console.log('\n' + '─'.repeat(66));
  console.log(`🗑️  ${supprimes} véhicule(s) supprimé(s) de la base`);
  console.log(`🔒 ${neutralises} véhicule(s) neutralisé(s) (réservation en cours)`);
  console.log(`🧹 ${lignesPanier} ligne(s) de panier purgée(s)`);
  console.log(`↻ ${reactives} véhicule(s) réactivé(s)`);
  console.log(`📦 Flotte publique : ${actifs} modèle(s) actif(s) / ${restant} en base`);

  await sequelize.close();
  process.exit(0);
}

main().catch(async (error) => {
  console.error('❌ Échec :', error.name || 'Erreur', '—', error.message || '(message vide)');
  if (error.name === 'SequelizeConnectionRefusedError') {
    console.error('   → MySQL est injoignable. Démarrez le service MySQL/XAMPP.');
  }
  try { await sequelize.close(); } catch { /* ignore */ }
  process.exit(1);
});
