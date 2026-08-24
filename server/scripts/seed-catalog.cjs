require('dotenv').config();
const { Category, Product, Tariff, sequelize } = require('../src/models/index.cjs');

const catalog = [
  {
    category: { nom: 'Quincaillerie', slug: 'quincaillerie', description: 'Vis, boulons, clous, charnieres, serrures et accessoires.' },
    products: [
      { name: 'Vis a bois galvanisees 4x40 (boite de 100)', reference: 'QNC-VIS-4X40', description: 'Vis a bois galvanisees, resistantes a la corrosion.', unit: 'boite', stock: 150, alertThreshold: 20, particular: 2500, company: 2100 },
      { name: 'Boulon hexagonale M8x30 (lot de 50)', reference: 'QNC-BLT-M8X30', description: 'Boulons hexagonaux M8 avec ecrous et rondelles.', unit: 'lot', stock: 100, alertThreshold: 15, particular: 4500, company: 3800 },
      { name: 'Clou acier 60mm (kg)', reference: 'QNC-CLN-60', description: 'Clous en acier doux pour charpente et coffrage.', unit: 'kg', stock: 80, alertThreshold: 10, particular: 1800, company: 1500 },
      { name: 'Charniere inox 100mm (paire)', reference: 'QNC-CHR-INOX', description: 'Charniere en inox 304, usage interieur et exterieur.', unit: 'paire', stock: 60, alertThreshold: 10, particular: 3500, company: 2900 },
      { name: 'Serrure 3 points a cylindre', reference: 'QNC-SER-3PT', description: 'Serrure de securite 3 points avec cylindre europeen.', unit: 'unite', stock: 25, alertThreshold: 5, particular: 25000, company: 21000 },
      { name: 'Cadenas acier 50mm', reference: 'QNC-CDN-50', description: 'Cadenas en acier trempe avec 3 cles.', unit: 'unite', stock: 45, alertThreshold: 8, particular: 6000, company: 5000 },
      { name: 'Cheville universelle 8mm (boite de 50)', reference: 'QNC-CHV-8', description: 'Chevilles universelles nylon pour beton, brique et placoplatre.', unit: 'boite', stock: 120, alertThreshold: 20, particular: 2000, company: 1700 },
      { name: 'Marteau de menuisier 500g', reference: 'QNC-MRT-500', description: 'Marteau de menuisier avec manche en bois.', unit: 'unite', stock: 30, alertThreshold: 5, particular: 8000, company: 6800 },
      { name: 'Tournevis cruciforme set 6 pieces', reference: 'QNC-TRN-6P', description: 'Set de 6 tournevis cruciformes et plats.', unit: 'set', stock: 35, alertThreshold: 5, particular: 12000, company: 10000 },
      { name: 'Pince multiprise 250mm', reference: 'QNC-PNC-250', description: 'Pince multiprise reglable en acier chrome.', unit: 'unite', stock: 28, alertThreshold: 5, particular: 9000, company: 7500 },
    ],
  },
  {
    category: { nom: 'Cables & Electricite', slug: 'cables-electricite', description: 'Cables H200, fils electriques, disjoncteurs et accessoires.' },
    products: [
      { name: 'Cable H200 2x1.5mm2 (rouleau 100m)', reference: 'CBL-H200-2X15', description: 'Cable electrique H200 2 conducteurs 1.5mm2.', unit: 'rouleau', stock: 50, alertThreshold: 8, particular: 35000, company: 29000 },
      { name: 'Cable H200 2x2.5mm2 (rouleau 100m)', reference: 'CBL-H200-2X25', description: 'Cable electrique H200 2 conducteurs 2.5mm2.', unit: 'rouleau', stock: 40, alertThreshold: 8, particular: 45000, company: 38000 },
      { name: 'Cable H200 3x1.5mm2 (rouleau 100m)', reference: 'CBL-H200-3X15', description: 'Cable electrique H200 3 conducteurs 1.5mm2, avec terre.', unit: 'rouleau', stock: 35, alertThreshold: 6, particular: 42000, company: 35000 },
      { name: 'Cable H200 3x2.5mm2 (rouleau 100m)', reference: 'CBL-H200-3X25', description: 'Cable electrique H200 3 conducteurs 2.5mm2.', unit: 'rouleau', stock: 30, alertThreshold: 5, particular: 55000, company: 46000 },
      { name: 'Cable H200 4x6mm2 (rouleau 100m)', reference: 'CBL-H200-4X6', description: 'Cable electrique H200 4 conducteurs 6mm2.', unit: 'rouleau', stock: 20, alertThreshold: 4, particular: 95000, company: 80000 },
      { name: 'Disjoncteur 16A 1P', reference: 'CBL-DIS-16A', description: 'Disjoncteur modulaire 16A unipolaire.', unit: 'unite', stock: 60, alertThreshold: 10, particular: 5000, company: 4200 },
      { name: 'Disjoncteur 32A 2P', reference: 'CBL-DIS-32A', description: 'Disjoncteur modulaire 32A bipolaire.', unit: 'unite', stock: 40, alertThreshold: 8, particular: 12000, company: 10000 },
      { name: 'Interrupteur simple allumage', reference: 'CBL-INT-SIMPLE', description: 'Interrupteur simple allumage encastrable.', unit: 'unite', stock: 80, alertThreshold: 15, particular: 3500, company: 2900 },
      { name: 'Prise de courant 2P+T 16A', reference: 'CBL-PRS-16A', description: 'Prise de courant encastrable 2P+T 16A.', unit: 'unite', stock: 70, alertThreshold: 12, particular: 4000, company: 3300 },
      { name: 'Gaine ICTA 20mm (rouleau 25m)', reference: 'CBL-GNT-20', description: 'Gaine isolante ICTA 20mm pour protection des cables.', unit: 'rouleau', stock: 55, alertThreshold: 10, particular: 8000, company: 6800 },
    ],
  },
  {
    category: { nom: 'Groupes Electrogenes', slug: 'groupes-electrogenes', description: 'Groupes electrogenes essence et diesel.' },
    products: [
      { name: 'Groupe electrogene essence 2.5kVA', reference: 'GRP-ESS-25', description: 'Groupe electrogene essence 2.5kVA, demarrage manuel.', unit: 'unite', stock: 10, alertThreshold: 2, particular: 185000, company: 160000 },
      { name: 'Groupe electrogene essence 3.5kVA', reference: 'GRP-ESS-35', description: 'Groupe electrogene essence 3.5kVA, demarrage manuel.', unit: 'unite', stock: 8, alertThreshold: 2, particular: 250000, company: 215000 },
      { name: 'Groupe electrogene diesel 5kVA', reference: 'GRP-DSL-5', description: 'Groupe electrogene diesel 5kVA, demarrage electrique.', unit: 'unite', stock: 6, alertThreshold: 1, particular: 450000, company: 390000 },
      { name: 'Groupe electrogene diesel 7.5kVA', reference: 'GRP-DSL-75', description: 'Groupe electrogene diesel 7.5kVA, demarrage electrique.', unit: 'unite', stock: 5, alertThreshold: 1, particular: 650000, company: 560000 },
      { name: 'Groupe electrogene diesel 10kVA', reference: 'GRP-DSL-10', description: 'Groupe electrogene diesel 10kVA, demarrage electrique.', unit: 'unite', stock: 4, alertThreshold: 1, particular: 850000, company: 730000 },
      { name: 'Groupe electrogene diesel 15kVA', reference: 'GRP-DSL-15', description: 'Groupe electrogene diesel 15kVA, demarrage electrique.', unit: 'unite', stock: 3, alertThreshold: 1, particular: 1200000, company: 1050000 },
      { name: 'Groupe electrogene diesel 20kVA', reference: 'GRP-DSL-20', description: 'Groupe electrogene diesel 20kVA, demarrage electrique.', unit: 'unite', stock: 2, alertThreshold: 1, particular: 1600000, company: 1400000 },
      { name: 'Groupe electrogene diesel 30kVA', reference: 'GRP-DSL-30', description: 'Groupe electrogene diesel 30kVA, demarrage electrique.', unit: 'unite', stock: 2, alertThreshold: 1, particular: 2500000, company: 2200000 },
    ],
  },
  {
    category: { nom: 'Plomberie', slug: 'plomberie', description: 'Tuyaux, raccords, robinets et accessoires.' },
    products: [
      { name: 'Tuyau PVC 50 (barre 6m)', reference: 'PLB-PVC-50', description: 'Tuyau PVC 50 pour evacuation des eaux usees.', unit: 'barre', stock: 100, alertThreshold: 15, particular: 12000, company: 10000 },
      { name: 'Tuyau PVC 75 (barre 6m)', reference: 'PLB-PVC-75', description: 'Tuyau PVC 75 pour evacuation principale.', unit: 'barre', stock: 80, alertThreshold: 12, particular: 18000, company: 15000 },
      { name: 'Tuyau PVC 100 (barre 6m)', reference: 'PLB-PVC-100', description: 'Tuyau PVC 100 pour evacuation principale.', unit: 'barre', stock: 60, alertThreshold: 10, particular: 25000, company: 21000 },
      { name: 'Raccord PVC 50 (coude 90)', reference: 'PLB-RCD-50', description: 'Coude PVC 50 a 90 pour evacuation.', unit: 'unite', stock: 200, alertThreshold: 30, particular: 1500, company: 1200 },
      { name: 'Raccord PVC 75 (coude 90)', reference: 'PLB-RCD-75', description: 'Coude PVC 75 a 90 pour evacuation.', unit: 'unite', stock: 150, alertThreshold: 25, particular: 2500, company: 2100 },
      { name: 'Raccord PVC 100 (coude 90)', reference: 'PLB-RCD-100', description: 'Coude PVC 100 a 90 pour evacuation.', unit: 'unite', stock: 100, alertThreshold: 15, particular: 4000, company: 3400 },
      { name: 'Robinet arret 1/2', reference: 'PLB-RBN-12', description: 'Robinet arret laiton 1/2 pour alimentation.', unit: 'unite', stock: 90, alertThreshold: 15, particular: 6000, company: 5000 },
      { name: 'Robinet arret 3/4', reference: 'PLB-RBN-34', description: 'Robinet arret laiton 3/4 pour alimentation.', unit: 'unite', stock: 70, alertThreshold: 12, particular: 8000, company: 6800 },
      { name: 'Flexible inox 1/2 x 40cm', reference: 'PLB-FLX-40', description: 'Flexible inox tresse 1/2 pour raccordement sanitaire.', unit: 'unite', stock: 120, alertThreshold: 20, particular: 3500, company: 2900 },
      { name: 'Siphon lavabo PVC', reference: 'PLB-SPH-LAV', description: 'Siphon lavabo PVC avec tube de vidage.', unit: 'unite', stock: 60, alertThreshold: 10, particular: 5000, company: 4200 },
    ],
  },
  {
    category: { nom: 'Peinture & Finition', slug: 'peinture-finition', description: 'Peintures, enduits et accessoires.' },
    products: [
      { name: 'Peinture acrylique blanche 10L', reference: 'PNT-ACR-10', description: 'Peinture acrylique blanche mate pour murs.', unit: 'pot', stock: 40, alertThreshold: 8, particular: 35000, company: 29000 },
      { name: 'Peinture glycerophtalique 5L', reference: 'PNT-GLY-5', description: 'Peinture glycerophtalique sainee pour boiseries.', unit: 'pot', stock: 30, alertThreshold: 6, particular: 28000, company: 24000 },
      { name: 'Enduit de lissage 25kg', reference: 'PNT-END-25', description: 'Enduit de lissage pret a emploi.', unit: 'sac', stock: 50, alertThreshold: 10, particular: 15000, company: 12500 },
      { name: 'Sous-couche universelle 5L', reference: 'PNT-SSC-5', description: 'Sous-couche universelle pour preparer les surfaces.', unit: 'pot', stock: 25, alertThreshold: 5, particular: 20000, company: 17000 },
      { name: 'Rouleau a peindre 25cm', reference: 'PNT-RLP-25', description: 'Rouleau a peindre 25cm avec manche.', unit: 'unite', stock: 45, alertThreshold: 8, particular: 3000, company: 2500 },
      { name: 'Pinceau plat 50mm', reference: 'PNT-PNC-50', description: 'Pinceau plat 50mm pour finitions et angles.', unit: 'unite', stock: 60, alertThreshold: 10, particular: 2000, company: 1700 },
    ],
  },
  {
    category: { nom: 'Materiaux de Construction', slug: 'materiaux-construction', description: 'Ciment, fer, sable, gravier et materiaux.' },
    products: [
      { name: 'Ciment CPJ 42.5 (sac 50kg)', reference: 'MTC-CIM-425', description: 'Ciment CPJ 42.5 pour beton arme et maconnerie.', unit: 'sac', stock: 200, alertThreshold: 30, particular: 6500, company: 5900 },
      { name: 'Fer a beton 8 (barre 12m)', reference: 'MTC-FER-8', description: 'Fer a beton 8 haute adherence, barre de 12m.', unit: 'barre', stock: 150, alertThreshold: 20, particular: 4500, company: 3900 },
      { name: 'Fer a beton 10 (barre 12m)', reference: 'MTC-FER-10', description: 'Fer a beton 10 haute adherence, barre de 12m.', unit: 'barre', stock: 120, alertThreshold: 15, particular: 7000, company: 6100 },
      { name: 'Fer a beton 12 (barre 12m)', reference: 'MTC-FER-12', description: 'Fer a beton 12 haute adherence, barre de 12m.', unit: 'barre', stock: 100, alertThreshold: 15, particular: 10000, company: 8700 },
      { name: 'Sable de riviere (m3)', reference: 'MTC-SBL-1', description: 'Sable de riviere lave pour beton et maconnerie.', unit: 'm3', stock: 30, alertThreshold: 5, particular: 25000, company: 22000 },
      { name: 'Gravier concasse (m3)', reference: 'MTC-GRV-1', description: 'Gravier concasse 15/25 pour beton.', unit: 'm3', stock: 25, alertThreshold: 5, particular: 30000, company: 26000 },
      { name: 'Parpaing creux 15x20x40', reference: 'MTC-PRP-15', description: 'Parpaing creux 15x20x40 pour murs porteurs.', unit: 'unite', stock: 500, alertThreshold: 50, particular: 800, company: 700 },
      { name: 'Tole bac acier 2m', reference: 'MTC-TLE-2', description: 'Tole bac acier galvanisee 2m pour toiture.', unit: 'unite', stock: 80, alertThreshold: 10, particular: 12000, company: 10500 },
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
  console.log('Catalogue enrichi avec succes.');
}

seed().catch((error) => { console.error('Echec du catalogue: ' + error.message); process.exitCode = 1; }).finally(async () => sequelize.close());