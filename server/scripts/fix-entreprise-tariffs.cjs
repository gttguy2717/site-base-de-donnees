/**
 * Aligne les tarifs génériques ENTREPRISE sur les tarifs PARTICULIER.
 * Règle métier : particulier et entreprise (simple) ont le MÊME prix ;
 * seules les ENTREPRISES CLIENTES (tarifs avec entreprise_id dédié, ex. SUCAF)
 * peuvent avoir leurs propres prix.
 * Usage : node server/scripts/fix-entreprise-tariffs.cjs [--dry-run]
 */
require('dotenv').config();
const { sequelize, Op, Product, Tariff } = require('../src/models/index.cjs');

const DRY_RUN = process.argv.includes('--dry-run');

async function run() {
  try {
    const products = await Product.findAll({
      where: { statut: 'ACTIVE' },
      include: [{ model: Tariff, as: 'tarifs' }],
    });

    let aligned = 0;
    let missingParticulier = 0;

    for (const product of products) {
      const particulier = product.tarifs?.find((t) => t.type_client === 'PARTICULIER' && !t.entreprise_id);
      if (!particulier) {
        missingParticulier += 1;
        continue;
      }
      const entreprise = product.tarifs?.find((t) => t.type_client === 'ENTREPRISE' && !t.entreprise_id);
      const prix = Number(particulier.prix) || 0;

      if (!entreprise) {
        if (!DRY_RUN) {
          await Tariff.create({ produit_id: product.id, type_client: 'ENTREPRISE', entreprise_id: null, prix });
        }
        aligned += 1;
        console.log(`  + ${product.reference} : tarif ENTREPRISE créé à ${prix}`);
      } else if (Number(entreprise.prix) !== prix) {
        if (!DRY_RUN) {
          await entreprise.update({ prix });
        }
        aligned += 1;
        console.log(`  ~ ${product.reference} : ENTREPRISE ${Number(entreprise.prix)} -> ${prix}`);
      }
    }

    console.log(`\n✅ ${aligned} tarif(s) générique(s) ENTREPRISE aligné(s) sur PARTICULIER`);
    if (missingParticulier > 0) console.log(`⚠️  ${missingParticulier} produit(s) sans tarif PARTICULIER (ignorés)`);
  } catch (err) {
    console.error('Echec:', err.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
