/**
 * Suppression DEFINITIVE des anciens produits (quincaillerie, boulons, cadenas, etc.)
 * qui ne font pas partie du catalogue boutique (Nexans + KETE).
 *  - Le seed-shop-catalog les désactivait seulement (statut INACTIVE) -> ils restaient visibles
 *    dans le catalogue admin (getAllProducts ne filtre pas le statut).
 *  - Ce script les supprime réellement, avec nettoyage des dépendances :
 *      articles_panier, mouvements_stock (sans cascade), tarifs/promotions (cascade auto).
 * Usage : node server/scripts/delete-quincaillerie.cjs [--dry-run]
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize, Product, Tariff, StockMovement, CartItem } = require('../src/models/index.cjs');
const { Op } = require('sequelize');

const DRY_RUN = process.argv.includes('--dry-run');

function loadCatalog(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  // eslint-disable-next-line no-eval
  (0, eval)(src);
}

async function run() {
  try {
    const dataDir = path.join(__dirname, 'catalog-data');
    loadCatalog(path.join(dataDir, 'nexansCatalog.cjs'));
    loadCatalog(path.join(dataDir, 'keteCatalog.cjs'));
    const nexans = globalThis.NEXANS_CATALOG;
    const kete = globalThis.KETE_CATALOG;
    if (!nexans || !kete) throw new Error('Catalogues non chargés');

    const allowedRefs = new Set([...nexans.products, ...kete.products].map((p) => String(p.ref)));
    console.log(`Catalogue boutique : ${allowedRefs.size} références autorisées (Nexans + KETE)`);

    const allProducts = await Product.findAll();
    const doomed = allProducts.filter((p) => !allowedRefs.has(String(p.reference)));
    console.log(`Produits en base : ${allProducts.length} | À supprimer : ${doomed.length}`);

    if (doomed.length === 0) {
      console.log('Rien à supprimer : la base ne contient que les produits du catalogue boutique.');
      return;
    }

    if (DRY_RUN) {
      doomed.forEach((p) => console.log(`  [DRY] ${p.reference} — ${p.nom} (${p.statut})`));
      return;
    }

    const ids = doomed.map((p) => p.id);
    let cartDeleted = 0;
    let movesDeleted = 0;

    // 1. Dépendances sans cascade : articles_panier
    cartDeleted = await CartItem.destroy({ where: { produit_id: { [Op.in]: ids } } });

    // 2. Dépendances sans cascade : mouvements_stock
    movesDeleted = await StockMovement.destroy({ where: { produit_id: { [Op.in]: ids } } });

    // 3. Suppression des produits (tarifs + promotions en CASCADE automatique)
    const productsDeleted = await Product.destroy({ where: { id: { [Op.in]: ids } } });

    console.log(`✅ ${productsDeleted} produits supprimés (quincaillerie/anciens)`);
    console.log(`✅ ${cartDeleted} lignes de panier nettoyées`);
    console.log(`✅ ${movesDeleted} mouvements de stock nettoyés`);
  } catch (err) {
    console.error('Echec de la suppression:', err.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
