const mysql = require('mysql2/promise');

(async () => {
  const c = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'soutarah_group'
  });

  console.log('=== Ajout des colonnes manquantes à la table entreprises ===\n');

  const alterations = [
    `ALTER TABLE entreprises ADD COLUMN verification_status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'APPROVED' AFTER numero_identification`,
    `ALTER TABLE entreprises ADD COLUMN documents JSON NULL AFTER verification_status`,
    `ALTER TABLE entreprises ADD COLUMN note_verification VARCHAR(255) NULL AFTER documents`,
    `ALTER TABLE entreprises ADD COLUMN verifie_le DATETIME NULL AFTER note_verification`,
  ];

  const existingCols = new Set();
  const [rows] = await c.execute('SHOW COLUMNS FROM entreprises');
  rows.forEach(r => existingCols.add(r.Field));
  console.log('Colonnes existantes :', [...existingCols].join(', '));

  for (const sql of alterations) {
    try {
      await c.execute(sql);
      console.log('OK :', sql.split('ADD COLUMN')[1].trim().split(' ')[0], '...');
    } catch (e) {
      if (e.message.includes('Duplicate') || e.message.includes('already exists')) {
        console.log('Déjà présent :', sql.split('ADD COLUMN')[1].trim().split(' ')[0]);
      } else {
        console.error('ERREUR :', e.message);
      }
    }
  }

  console.log('\n=== Vérification finale ===');
  const [finalRows] = await c.execute('SHOW COLUMNS FROM entreprises');
  finalRows.forEach(r => console.log(' -', r.Field, '|', r.Type, '| NULL:', r.Null, '| DEFAULT:', r.Default));

  await c.end();
  console.log('\n=== Terminé ===');
})().catch(e => console.error('ERREUR FATALE :', e.message));
