// Générer le miroir serveur du catalogue front (ESM -> CommonJS).
// Usage : node server/scripts/build-legrand-mirror.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LEGRAND_CATALOG } from '../../src/data/legrandCatalog.js';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'catalog-data', 'legrandCatalog.cjs');
mkdirSync(dirname(out), { recursive: true });

const body = `/**
 * Miroir serveur du catalogue front (généré — ne pas éditer à la main).
 * Source : src/data/legrandCatalog.js
 * Produit par server/scripts/build-legrand-mirror.mjs
 */
const LEGRAND_CATALOG = ${JSON.stringify(LEGRAND_CATALOG, null, 2)};

module.exports = { LEGRAND_CATALOG };
`;

writeFileSync(out, body, 'utf-8');
console.log('miroir écrit :', out);
console.log('  catégories :', LEGRAND_CATALOG.categories.length);
console.log('  produits   :', LEGRAND_CATALOG.products.length);
