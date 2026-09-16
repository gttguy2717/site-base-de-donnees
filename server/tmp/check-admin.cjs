const mysql = require('mysql2/promise');

(async () => {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'soutarah_group'
    });

    console.log('=== Recherche admin ===');
    const [rows] = await conn.execute(
      "SELECT id, email, telephone, mot_de_passe_hash, est_actif FROM utilisateurs WHERE email='sorhodavid31@gmail.com' OR telephone='0700000002'"
    );

    if (rows.length === 0) {
      console.log('Aucun admin trouvé avec ces identifiants');
      process.exit(1);
    }

    console.log('Admin trouvé :', JSON.stringify(rows[0], null, 2));

    const bcrypt = require('bcrypt');
    const hash = rows[0].mot_de_passe_hash;
    const testPw = 'admin123456';
    const ok = await bcrypt.compare(testPw, hash);
    console.log('Mot de passe admin123456 valide ?', ok);
    process.exit(ok ? 0 : 1);
  } catch (e) {
    console.error('ERREUR:', e.message);
    console.error(e.stack);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
