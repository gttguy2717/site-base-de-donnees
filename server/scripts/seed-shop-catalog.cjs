/**
 * Seed du catalogue BOUTIQUE SOUTARAH :
 *  - Insère les VRAIS produits de négoce visibles sur le site (catalogues Nexans + KETE)
 *  - Désactive tous les autres produits (quincaillerie, boulons, cadenas, etc.)
 * Usage : cd /home/u894599353/site-soutarah && {runner} server/scripts/seed-shop-catalog.cjs
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize, Category, Product, Tariff, CartItem, StockMovement } = require('../src/models/index.cjs');
const { Op } = require('sequelize');

// Icônes / libellés des catégories (identiques à l'affichage public original)
const CATEGORY_META = {
  'cables-batiment': { nom: 'Câbles de bâtiments', icon: 'home_work' },
  'cables-bt': { nom: 'Câbles basse tension', icon: 'bolt' },
  'cables-mt': { nom: 'Câbles moyenne tension', icon: 'power' },
  'lignes-aeriennes': { nom: 'Lignes aériennes', icon: 'air' },
  'transformateurs': { nom: 'Transformateurs', icon: 'transform' },
  'cellules-hta': { nom: 'Cellules HTA', icon: 'electrical_services' },
  'telecom': { nom: 'Infrastructures Télécom', icon: 'router' },
  'accessoires': { nom: 'Accessoires d’énergie', icon: 'settings' },
  'substation': { nom: 'Postes préfabriqués', icon: 'home_work' },
};

// Charge un catalogue (données embarquées dans server/scripts/catalog-data, format CJS évaluable)
function loadCatalog(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  // eslint-disable-next-line no-eval
  (0, eval)(src);
  return null;
}

async function run() {
  try {
    const dataDir = path.join(__dirname, 'catalog-data');
    loadCatalog(path.join(dataDir, 'nexansCatalog.cjs'));
    loadCatalog(path.join(dataDir, 'keteCatalog.cjs'));

    const nexans = globalThis.NEXANS_CATALOG;
    const kete = globalThis.KETE_CATALOG;
    if (!nexans || !kete) throw new Error('Catalogues non chargés');

    const categories = [...nexans.categories, ...kete.categories];
    const categoryRefs = new Map();

    // 1. Créer / mettre à jour les catégories
    for (const cat of categories) {
      const meta = CATEGORY_META[cat.id] || { nom: cat.label, icon: cat.icon || 'category' };
      const slug = String(cat.id).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const [dbCat] = await Category.findOrCreate({
        where: { slug },
        defaults: { nom: meta.nom, slug, description: cat.label, est_actif: true },
      });
      await dbCat.update({ nom: meta.nom, est_actif: true });
      categoryRefs.set(cat.id, dbCat.id);
    }
    console.log(`✅ ${categories.length} catégories prêtes`);

    const allProducts = [...nexans.products, ...kete.products];
    const allowedRefs = new Set();

    // 2. Insérer tous les produits
    for (const entry of allProducts) {
      allowedRefs.add(entry.ref);
      const catId = categoryRefs.get(entry.category);
      if (!catId) {
        console.warn(`  Catégorie inconnue pour ${entry.ref}, ignoré`);
        continue;
      }
      const [product] = await Product.findOrCreate({
        where: { reference: entry.ref },
        defaults: {
          categorie_id: catId,
          nom: entry.name,
          reference: entry.ref,
          description: entry.desc || '',
          image_url: entry.image || null,
          unite: 'unité',
          stock: 100,
          seuil_alerte: 10,
          statut: 'ACTIVE',
        },
      });
      await product.update({ categorie_id: catId, nom: entry.name, image_url: entry.image || null, statut: 'ACTIVE' });

      const price = Number(entry.prixMarche) || 0;
      // Tarif particulier (affichage public)
      const [tP] = await Tariff.findOrCreate({
        where: { produit_id: product.id, type_client: 'PARTICULIER', entreprise_id: null },
        defaults: { produit_id: product.id, type_client: 'PARTICULIER', entreprise_id: null, prix: price },
      });
      await tP.update({ prix: price });
      // Tarif entreprise générique = même prix que particulier.
      // Seules les ENTREPRISES CLIENTES (avec entreprise_id dédié) ont des prix spécifiques.
      const [tE] = await Tariff.findOrCreate({
        where: { produit_id: product.id, type_client: 'ENTREPRISE', entreprise_id: null },
        defaults: { produit_id: product.id, type_client: 'ENTREPRISE', entreprise_id: null, prix: price },
      });
      await tE.update({ prix: price });
    }
    console.log(`✅ ${allProducts.length} produits insérés/réactivés`);

    // 3. Supprimer définitivement tous les produits qui ne font PAS partie du catalogue boutique
    //    (avant : simple désactivation -> les anciens produits restaient visibles dans le catalogue admin)
    const allInDb = await Product.findAll();
    const doomedIds = allInDb.filter((p) => !allowedRefs.has(p.reference)).map((p) => p.id);
    if (doomedIds.length > 0) {
      await CartItem.destroy({ where: { produit_id: { [Op.in]: doomedIds } } });
      await StockMovement.destroy({ where: { produit_id: { [Op.in]: doomedIds } } });
      const deleted = await Product.destroy({ where: { id: { [Op.in]: doomedIds } } });
      console.log(`✅ ${deleted} anciens produits supprimés (quincaillerie, etc.)`);
    } else {
      console.log('✅ Aucun ancien produit à supprimer');
    }

    console.log('Catalogue boutique mis à jour avec succès.');
  } catch (err) {
    console.error('Echec du seed boutique:', err.message, err.errors?.map((e) => e.message));
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();