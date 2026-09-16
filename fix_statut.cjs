const mysql = require('mysql2/promise');

async function go() {
  const conn = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'soutarah_group'
  });
  const [r] = await conn.query("UPDATE demandes_devis SET statut='SENT' WHERE statut='APPROVED'");
  console.log('APPROVED converti en SENT:', r.affectedRows, 'lignes');
  const [rows] = await conn.execute("SELECT COUNT(*) as total FROM demandes_devis WHERE statut='SENT'");
  console.log('Total devis SENT en base:', rows[0].total);
  conn.end();
}
go().catch(console.error);
