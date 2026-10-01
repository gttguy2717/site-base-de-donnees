/**
 * SOUTARAH — Alimentation du catalogue véhicules (marché Côte d'Ivoire)
 * ---------------------------------------------------------------------------
 * Usage :  node server/scripts/seed-vehicules-marche-ci.cjs
 *
 * - Upsert idempotent sur (marque, modele) : rejouable sans créer de doublon.
 * - Ne touche PAS aux véhicules qui ne sont pas dans le catalogue source
 *   (le parc officiel de 21 véhicules reste intact).
 * - Chaque véhicule reçoit sa propre image locale dans /public/img/vehicles/.
 * - Tarifs journaliers en FCFA : particulier / entreprise / entreprise client.
 */
const path = require('path');
const fs = require('fs');
const { sequelize } = require('../src/models/index.cjs');
const { Vehicle } = require('../src/models/index.cjs');
const Sequelize = require('sequelize');
const { VEHICULES, OFFICIELS } = require('./catalog-data/catalogue-trip.cjs');
const SequelizeOp = Sequelize.Op;

// Dossier des images du site (le build Vite copie public/ -> dist/).
const IMAGE_ROOTS = [
  path.resolve(__dirname, '../../dist/img/vehicles'),
  path.resolve(__dirname, '../../dist/img/vehicles_trip'),
  path.resolve(__dirname, '../../public/img/vehicles'),
  path.resolve(__dirname, '../../public/img/vehicles_trip'),
];

const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Vérifie que chaque image référencée existe sur le disque avant d'écrire.
 * Retourne la liste des images introuvables (vide si tout est bon).
 */
function findMissingImages() {
  return VEHICULES.filter(
    (v) => !IMAGE_ROOTS.some((root) => fs.existsSync(path.join(root, path.basename(v.image_url))))
  );
}

function reportImages() {
  const missing = findMissingImages();
  if (missing.length) {
    console.error(`❌ ${missing.length} image(s) introuvable(s) :`);
    missing.slice(0, 12).forEach((v) => console.error(`   - ${v.marque} ${v.modele} → ${v.image_url}`));
    if (missing.length > 12) console.error(`   ... et ${missing.length - 12} autres`);
    console.error('   Racines cherchees : ' + IMAGE_ROOTS.join(' | '));
    process.exit(1);
  }
  const uniques = new Set(VEHICULES.map((v) => path.basename(v.image_url)));
  console.log(`✅ ${VEHICULES.length} véhicules — ${uniques.size} images locales, aucune manquante`);
}

async function main() {
  console.log('🚗 SOUTARAH — Catalogue véhicules marché Côte d’Ivoire');
  console.log('─'.repeat(60));

  reportImages();

  const counts = VEHICULES.reduce((acc, v) => {
    acc[v.categorie] = (acc[v.categorie] || 0) + 1;
    return acc;
  }, {});
  console.log('📊 Catégories :', Object.entries(counts).map(([c, n]) => `${c} (${n})`).join(' · '));
  console.log('─'.repeat(60));

  if (DRY_RUN) {
    console.log('\n🔎 MODE DRY-RUN — aucune écriture en base.\n');
    VEHICULES.forEach((v) => {
      console.log(
        `  ${v.categorie.padEnd(12)} | ${(v.marque + ' ' + v.modele).padEnd(30)} | ` +
          `${String(v.prix).padStart(7)} FCFA/j | ${v.image_url}`
      );
    });
    const four = Object.values(counts).reduce((a, b) => a + b, 0);
    console.log(`\n✅ Contrôle terminé : ${four} véhicules valides, prêt pour l'import.`);
    return;
  }

  await sequelize.authenticate();
  console.log('✅ Connexion à la base de données établie\n');

  // --- Purge de l'ancien catalogue de marché --------------------------------
  // On ne supprime PAS les lignes : `reservations.vehicule_id` pointe sur
  // `vehicules.id` (cle etrangere), la suppression echoue. On les DESACTIVE,
  // ce qui suffit : l'API publique ne renvoie que statut='ACTIVE' ET
  // disponibilite=true. C'est la meme methode que soutarah_21_vehicules.sql.
  const [, desactives] = await Vehicle.update(
    { statut: 'INACTIVE', disponibilite: false },
    { where: { statut: { [SequelizeOp.ne]: 'INACTIVE' } } }
  );
  if (desactives) {
    console.log(`🧹 ${desactives} véhicule(s) de l'ancien catalogue désactivés\n`);
  }

  let created = 0;
  let updated = 0;

  for (const v of VEHICULES) {
    const data = {
      marque: v.marque,
      modele: v.modele,
      categorie: v.categorie,
      description: v.description,
      image_url: v.image_url,
      places: v.places,
      carburant: v.carburant,
      transmission: v.transmission,
      prix_journalier_particulier: v.prix,
      prix_journalier_entreprise: v.prix_journalier_entreprise,
      prix_journalier_entreprise_client: v.prix_journalier_entreprise_client,
      disponibilite: true,
      statut: 'ACTIVE',
    };

    const existing = await Vehicle.findOne({ where: { marque: v.marque, modele: v.modele } });

    if (existing) {
      await existing.update(data);
      updated++;
    } else {
      // Les 21 officiels conservent leur identifiant d'origine (lie aux devis
      // / reservations existants) ; les autres reçoivent un nouvel id.
      await Vehicle.create(v.officiel && v.id ? { id: v.id, ...data } : data);
      created++;
    }

    const prix = `${v.prix.toLocaleString('fr-FR')} FCFA/j`;
    console.log(`  ✓ ${v.marque} ${v.modele} — ${v.categorie} — ${prix}`);
  }

  const total = await Vehicle.count();
  console.log('\n' + '─'.repeat(60));
  console.log(`✅ Terminé : ${created} créés, ${updated} mis à jour`);
  console.log(`📦 Total véhicules en base : ${total}`);

  await sequelize.close();
  process.exit(0);
}

main().catch(async (err) => {
  const code = err?.parent?.code ? ` [${err.parent.code}]` : '';
  console.error(`❌ Échec : ${err.name || 'Erreur'}${code} — ${err.message || '(message vide)'}`);
  if (err.name === 'SequelizeConnectionRefusedError') {
    console.error('   → MySQL est injoignable. Démarrez le service MySQL/XAMPP,');
    console.error('     ou importez le fichier SQL généré directement sur le serveur.');
  }
  try { await sequelize.close(); } catch { /* ignore */ }
  process.exit(1);
});
