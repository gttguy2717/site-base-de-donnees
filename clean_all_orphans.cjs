const mysql = require('mysql2/promise');

async function cleanAllOrphans() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'soutarah_group'
  });

  console.log('Nettoyage des orphelins...');

  // 1. Produits avec categorie_id invalide -> NULL
  const [r1] = await conn.execute(`
    UPDATE produits p 
    LEFT JOIN categories c ON p.categorie_id = c.id 
    SET p.categorie_id = NULL 
    WHERE p.categorie_id IS NOT NULL AND c.id IS NULL
  `);
  console.log('✅ produits.categorie_id nettoyés:', r1.affectedRows);

  // 2. Tarifs avec produit_id invalide -> suppression
  const [r2] = await conn.execute(`
    DELETE t FROM tarifs t 
    LEFT JOIN produits p ON t.produit_id = p.id 
    WHERE t.produit_id IS NOT NULL AND p.id IS NULL
  `);
  console.log('✅ tarifs.produit_id nettoyés:', r2.affectedRows);

  // 3. Notifications avec utilisateur_destinataire_id invalide -> suppression
  const [r3] = await conn.execute(`
    DELETE n FROM notifications n 
    LEFT JOIN utilisateurs u ON n.utilisateur_destinataire_id = u.id 
    WHERE n.utilisateur_destinataire_id IS NOT NULL AND u.id IS NULL
  `);
  console.log('✅ notifications.utilisateur_destinataire_id nettoyés:', r3.affectedRows);

  conn.end();
}

cleanAllOrphans().catch(console.error);
