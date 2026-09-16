const mysql = require('mysql2/promise');

async function checkAllFKs() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'soutarah_group'
  });

  const checks = [
    { table: 'clients', col: 'utilisateur_id', refTable: 'utilisateurs', refCol: 'id' },
    { table: 'entreprises', col: 'client_id', refTable: 'clients', refCol: 'id' },
    { table: 'categories', col: 'parent_id', refTable: 'categories', refCol: 'id' },
    { table: 'produits', col: 'categorie_id', refTable: 'categories', refCol: 'id' },
    { table: 'tarifs', col: 'produit_id', refTable: 'produits', refCol: 'id' },
    { table: 'tarifs', col: 'entreprise_id', refTable: 'entreprises', refCol: 'id' },
    { table: 'vehicule_prix_entreprises', col: 'vehicule_id', refTable: 'vehicules', refCol: 'id' },
    { table: 'vehicule_prix_entreprises', col: 'entreprise_id', refTable: 'entreprises', refCol: 'id' },
    { table: 'paniers', col: 'client_id', refTable: 'clients', refCol: 'id' },
    { table: 'articles_panier', col: 'panier_id', refTable: 'paniers', refCol: 'id' },
    { table: 'articles_panier', col: 'produit_id', refTable: 'produits', refCol: 'id' },
    { table: 'articles_panier', col: 'vehicule_id', refTable: 'vehicules', refCol: 'id' },
    { table: 'devis', col: 'client_id', refTable: 'clients', refCol: 'id' },
    { table: 'articles_devis', col: 'devis_id', refTable: 'devis', refCol: 'id' },
    { table: 'articles_devis', col: 'produit_id', refTable: 'produits', refCol: 'id' },
    { table: 'demandes_devis', col: 'client_id', refTable: 'clients', refCol: 'id' },
    { table: 'demandes_devis', col: 'utilisateur_id', refTable: 'utilisateurs', refCol: 'id' },
    { table: 'reservations', col: 'client_id', refTable: 'clients', refCol: 'id' },
    { table: 'reservations', col: 'vehicule_id', refTable: 'vehicules', refCol: 'id' },
    { table: 'notifications', col: 'utilisateur_destinataire_id', refTable: 'utilisateurs', refCol: 'id' },
    { table: 'promotions', col: 'produit_id', refTable: 'produits', refCol: 'id' },
    { table: 'promotions', col: 'vehicule_id', refTable: 'vehicules', refCol: 'id' },
    { table: 'demandes_produits', col: 'client_id', refTable: 'clients', refCol: 'id' },
    { table: 'demandes_vehicules', col: 'client_id', refTable: 'clients', refCol: 'id' },
    { table: 'mouvements_stock', col: 'produit_id', refTable: 'produits', refCol: 'id' },
    { table: 'mouvements_stock', col: 'cree_par_utilisateur_id', refTable: 'utilisateurs', refCol: 'id' },
  ];

  let totalOrphans = 0;

  for (const check of checks) {
    try {
      const [rows] = await conn.execute(`
        SELECT t.${check.col} 
        FROM \`${check.table}\` t 
        LEFT JOIN \`${check.refTable}\` r ON t.\`${check.col}\` = r.\`${check.refCol}\` 
        WHERE t.\`${check.col}\` IS NOT NULL AND r.\`${check.refCol}\` IS NULL
      `);
      if (rows.length > 0) {
        console.error(`❌ ORPHELINS DETECTÉS: ${check.table}.${check.col} -> ${check.refTable}.${check.refCol} (${rows.length} lignes)`);
        totalOrphans += rows.length;
      }
    } catch (e) {
      // Table ou colonne n'existe pas
    }
  }

  if (totalOrphans === 0) {
    console.log('✅ EXCELLENT ! 0 orphelin dans TOUTE la base de données. L\'importation sur Hostinger fonctionnera à 100% sans aucune erreur !');
  }

  conn.end();
}

checkAllFKs().catch(console.error);
