/**
 * SOUTARAH — Seed complet du catalogue boutique (négoce)
 * ------------------------------------------------------------------
 * Injecte en base les trois sources du catalogue :
 *   - Nexans  (server/scripts/catalog-data/nexansCatalog.cjs)
 *   - KETE    (server/scripts/catalog-data/keteCatalog.cjs)
 *   - Legrand (server/scripts/catalog-data/legrandCatalog.cjs, 403 articles
 *     dont les 6 tubes orange ICD / Plasticable)
 *
 * IMPORTANT : ce seed ne SUPPRIME rien. L'ancien seed-shop-catalog.cjs
 * effaçait tout produit absent de Nexans+KETE, ce qui supprimait le
 * catalogue Legrand à chaque déploiement.
 *
 * Les tarifs sont à 0 : la tarification négoce se fait sur devis.
 * Usage : node server/scripts/seed-boutique-complete.cjs
 */
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const {
  sequelize, Product, Category, Tariff, CartItem, StockMovement,
} = require('../src/models/index.cjs');

const dataDir = path.join(__dirname, 'catalog-data');

// Les catalogues Nexans / KETE s'auto-déclarent dans globalThis (pas de
// module.exports) : on les évalue comme le fait seed-shop-catalog.cjs.
// Le catalogue Legrand expose un module.exports classique.
function loadEval(file, globalName) {
  const src = fs.readFileSync(path.join(dataDir, file), 'utf8');
  // eslint-disable-next-line no-eval
  (0, eval)(src);
  return globalThis[globalName];
}

function loadModule(file, exportName) {
  return require(path.join(dataDir, file))[exportName];
}

async function main() {
  const nexans = loadEval('nexansCatalog.cjs', 'NEXANS_CATALOG');
  const kete = loadEval('keteCatalog.cjs', 'KETE_CATALOG');
  const legrand = loadModule('legrandCatalog.cjs', 'LEGRAND_CATALOG');
  if (!nexans || !kete || !legrand) throw new Error('Catalogues non chargés');

  await sequelize.authenticate();
  console.log('✅ Connexion établie\n');

  // 1. Catégories : uniquement celles du catalogue Legrand.
  //    Les catégories Nexans / KETE sont purgées en étape 4.
  const categoryRefs = new Map(); // id source -> id en base
  const wanted = new Map();       // nom lisible -> id source
  for (const c of legrand.categories) {
    if (!wanted.has(c.label)) wanted.set(c.label, c.id);
  }
  for (const [label, srcId] of wanted) {
    // Le champ slug est obligatoire (NOT NULL) en base.
    const slug = String(label)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `cat-${srcId}`;
    const [row] = await Category.findOrCreate({
      where: { nom: label },
      defaults: { nom: label, slug, est_actif: true },
    });
    // findOrCreate garde le slug d'origine sur une catégorie déjà créée :
    // on le complète au cas où (null sur les catégories historiques).
    if (!row.slug) await row.update({ slug });
    await row.update({ est_actif: true });
    categoryRefs.set(srcId, row.id);
  }
  console.log(`✅ ${wanted.size} catégories prêtes`);

  // 2. Produits
  //    Catalogue de référence = Legrand uniquement. Les catalogues Nexans et
  //    Les catalogues Nexans et KETE sont retirés du site (demande client) :
  //    rien n'est inséré depuis ces deux sources.
  const allProducts = legrand.products.map((p) => ({ ...p }));

  const refs = new Set();
  let sansCat = 0;

  for (const entry of allProducts) {
    const ref = entry.ref || entry.id;
    refs.add(ref);
    const catId = categoryRefs.get(entry.category);
    if (!catId) {
      sansCat++;
      continue;
    }
    const [product] = await Product.findOrCreate({
      where: { reference: ref },
      defaults: {
        categorie_id: catId,
        nom: entry.name,
        reference: ref,
        description: entry.desc || '',
        image_url: entry.image || null,
        unite: 'unité',
        stock: 100,
        seuil_alerte: 10,
        statut: 'ACTIVE',
      },
    });
    await product.update({
      categorie_id: catId,
      nom: entry.name,
      description: entry.desc || '',
      image_url: entry.image || null,
      statut: 'ACTIVE',
    });

    // Tarifs à 0 : le catalogue négoce est « sur devis ».
    for (const type of ['PARTICULIER', 'ENTREPRISE']) {
      const [t] = await Tariff.findOrCreate({
        where: { produit_id: product.id, type_client: type, entreprise_id: null },
        defaults: { produit_id: product.id, type_client: type, entreprise_id: null, prix: 0 },
      });
      await t.update({ prix: 0 });
    }
  }
  console.log(`✅ ${allProducts.length} produits insérés / réactivés`);
  if (sansCat) console.log(`⚠️  ${sansCat} produits ignorés (catégorie inconnue)`);

  // 3. Suppression définitive des produits Nexans et KETE (retirés du site).
  //    Ils sont identifiés par leur référence, ce qui est stable.
  const retiredRefs = new Set([
    ...nexans.products.map((p) => p.ref),
    ...kete.products.map((p) => p.ref),
  ]);
  const retired = await Product.findAll({
    where: { reference: { [Op.in]: [...retiredRefs] } },
    attributes: ['id', 'reference', 'nom'],
    raw: true,
  });
  if (retired.length) {
    const ids = retired.map((p) => p.id);
    // Nettoyage des lignes enfants (clés étrangères) avant suppression.
    await CartItem.destroy({ where: { produit_id: { [Op.in]: ids } } });
    await StockMovement.destroy({ where: { produit_id: { [Op.in]: ids } } });
    await Tariff.destroy({ where: { produit_id: { [Op.in]: ids } } });
    const supprimes = await Product.destroy({ where: { id: { [Op.in]: ids } } });
    console.log(`🗑️  ${supprimes} produits Nexans/KETE supprimés de la base`);
  } else {
    console.log('ℹ️  Aucun produit Nexans/KETE restant en base');
  }

  // 4. Suppression des catégories devenues vides (Nexans / KETE).
  const retiredCats = new Set([
    ...nexans.categories.map((c) => c.label),
    ...kete.categories.map((c) => c.label),
  ]);
  for (const label of retiredCats) {
    const cat = await Category.findOne({ where: { nom: label } });
    if (!cat) continue;
    const restants = await Product.count({ where: { categorie_id: cat.id } });
    if (restants === 0) {
      await cat.destroy();
      console.log(`🗑️  Catégorie supprimée : ${label}`);
    }
  }

  // 5. Le reste du catalogue : on ne désactive pas, on ne supprime pas.
  const all = await Product.findAll({ attributes: ['id', 'reference'], raw: true });
  const horsCatalogue = all.filter((p) => !refs.has(p.reference));
  if (horsCatalogue.length) {
    for (const p of horsCatalogue) {
      await Product.update({ statut: 'INACTIVE' }, { where: { id: p.id } });
    }
    console.log(`ℹ️  ${horsCatalogue.length} produit(s) hors catalogue désactivés (non supprimés)`);
  }

  const total = await Product.count();
  const actifs = await Product.count({ where: { statut: 'ACTIVE' } });
  console.log(`\n📦 Total en base : ${total} (ACTIVES : ${actifs})`);
  await sequelize.close();
  process.exit(0);
}

main().catch(async (e) => {
  console.error('❌ Echec :', e.message);
  try { await sequelize.close(); } catch { /* ignore */ }
  process.exit(1);
});
