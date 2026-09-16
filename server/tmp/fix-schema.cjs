const mysql = require('mysql2/promise');

const SQLS = [
  `ALTER TABLE entreprises ADD COLUMN verification_status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'APPROVED' AFTER numero_identification`,
  `ALTER TABLE entreprises ADD COLUMN documents JSON NULL AFTER verification_status`,
  `ALTER TABLE entreprises ADD COLUMN note_verification VARCHAR(255) NULL AFTER documents`,
  `ALTER TABLE entreprises ADD COLUMN verifie_le DATETIME NULL AFTER note_verification`,
];

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'soutarah_group'
  });

  console.log('Colonnes existantes avant correction:');
  const [before] = await conn.execute('SHOW COLUMNS FROM entreprises');
  before.forEach(c => console.log('  -', c.Field, '|', c.Type, '|', c.Null, '|', c.Default));

  for (const sql of SQLS) {
    try {
      await conn.execute(sql);
      console.log('\nAJOUTÉ:', sql.split('ADD COLUMN')[1].trim().split(' ')[0]);
    } catch (e) {
      if (e.message.includes('Duplicate') || e.message.includes('already exists')) {
        console.log('\nDéjà présent:', sql.split('ADD COLUMN')[1].trim().split(' ')[0]);
      } else {
        console.log('\nERREUR:', e.message);
      }
    }
  }

  console.log('\nColonnes après correction:');
  const [after] = await conn.execute('SHOW COLUMNS FROM entreprises');
  after.forEach(c => console.log('  -', c.Field, '|', c.Type, '|', c.Null, '|', c.Default));

  await conn.end();
  console.log('\n=== Correction terminée ===');
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
