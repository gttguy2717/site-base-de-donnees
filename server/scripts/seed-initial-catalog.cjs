require('dotenv').config();
const { Category, Product, Tariff, sequelize } = require('../src/models/index.cjs');

const catalog = [
  {
    category: { nom: 'Plomberie', slug: 'plomberie', description: 'Tuyaux, raccords et accessoires.' },
    products: [
      { name: 'Tuyau PVC Ø50', reference: 'PVC-050', description: 'Tuyau PVC robuste pour réseaux d’eau et installations de plomberie.', unit: 'unité', stock: 120, alertThreshold: 20, particular: 10000, company: 8500 },
      { name: 'Tube PVC pression Ø32', reference: 'PVC-032P', description: 'Tube PVC pression adapté aux installations durables.', unit: 'unité', stock: 80, alertThreshold: 15, particular: 7500, company: 6500 },
    ],
  },
  {
    category: { nom: 'Matériaux', slug: 'materiaux', description: 'Matériaux et fournitures de chantier.' },
    products: [
      { name: 'Ciment haute résistance', reference: 'MAT-CIM-50', description: 'Sac de ciment pour travaux de construction et de rénovation.', unit: 'sac', stock: 200, alertThreshold: 30, particular: 6500, company: 5900 },
      { name: 'Équipement de protection chantier', reference: 'MAT-EPI-01', description: 'Équipement de protection pour les équipes et interventions terrain.', unit: 'kit', stock: 40, alertThreshold: 10, particular: 18000, company: 15500 },
    ],
  },
];

async function seed() {
  for (const group of catalog) {
    const [category] = await Category.findOrCreate({ where: { slug: group.category.slug }, defaults: group.category });
    for (const entry of group.products) {
      const [product] = await Product.findOrCreate({
        where: { reference: entry.reference },
        defaults: { categorie_id: category.id, nom: entry.name, reference: entry.reference, description: entry.description, unite: entry.unit, stock: entry.stock, seuil_alerte: entry.alertThreshold, statut: 'ACTIVE' },
      });
      await product.update({ categorie_id: category.id, nom: entry.name, description: entry.description, unite: entry.unit, stock: entry.stock, seuil_alerte: entry.alertThreshold, statut: 'ACTIVE' });
      for (const [customerType, price] of [['PARTICULIER', entry.particular], ['ENTREPRISE', entry.company]]) {
        const [tariff] = await Tariff.findOrCreate({ where: { produit_id: product.id, type_client: customerType }, defaults: { produit_id: product.id, type_client: customerType, prix: price } });
        await tariff.update({ prix: price });
      }
    }
  }
  console.log('Catalogue initial et tarifs créés ou mis à jour.');
}

seed().catch((error) => { console.error(`Échec du catalogue initial : ${error.message}`); process.exitCode = 1; }).finally(async () => sequelize.close());
