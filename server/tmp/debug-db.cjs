const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'soutarah_group',
  });

  try {
    // 1. Lister toutes les tables
    const [tables] = await db.execute(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME"
    );
    console.log('=== TABLES ===');
    (tables || []).forEach(t => console.log(' -', t.TABLE_NAME));

    // 2. Chercher une table avec "entreprise" ou "company"
    const [likeTables] = await db.execute(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND (TABLE_NAME LIKE '%nterpr%' OR TABLE_NAME LIKE '%company%')"
    );
    console.log('\n=== Tables avec entreprise/company ===');
    (likeTables || []).forEach(t => console.log(' -', t.TABLE_NAME));

    // 3. Colonnes de la table principale (entreprises)
    const targetTable = likeTables && likeTables.length ? likeTables[0].TABLE_NAME : null;
    if (targetTable) {
      const [cols] = await db.execute(`SHOW COLUMNS FROM \`${targetTable}\``);
      console.log(`\n=== Colonnes de ${targetTable} ===`);
      (cols || []).forEach(c => console.log(' -', c.Field, '|', c.Type, '| NULL:', c.Null, '| DEF:', c.Default, '| KEY:', c.Key));
    }

    // 4. Chercher si verification_status existe dans toutes les tables
    console.log('\n=== Colonnes contenant "verification" dans toutes les tables ===');
    const [allCols] = await db.execute(
      "SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME LIKE '%verification%'"
    );
    (allCols || []).forEach(c => console.log(' -', c.TABLE_NAME, '.', c.COLUMN_NAME, '|', c.COLUMN_TYPE));
    if (!allCols || !allCols.length) {
      console.log('  (aucune colonne "verification" trouvée)');
    }

    await db.end();
    console.log('\n=== Terminé ===');
  } catch (e) {
    console.error('ERREUR:', e.message);
    console.error(e.stack);
    await db.end();
    process.exit(1);
  }
}

main();
