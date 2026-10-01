/**
 * Migration : ajoute la colonne mode_paiement sur demandes_devis
 * Usage : cd /home/u894599353/site-soutarah && {runner} server/scripts/add-payment-mode.cjs
 */
const { createConnection } = require('mysql2/promise');

// Identifiants lus depuis l'environnement (.env) : ne jamais les écrire en
// dur dans un dépôt, même privé. Lancez le script depuis la racine du serveur
// (le .env y est chargé automatiquement) ou exportez DB_PASSWORD.
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env'), override: false });
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env'), override: false });

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

if (!DB_CONFIG.user || !DB_CONFIG.password || !DB_CONFIG.database) {
  console.error('Variables DB_USER / DB_PASSWORD / DB_NAME absentes : configurez le .env.');
  process.exit(1);
}

(async () => {
  const conn = await createConnection(DB_CONFIG);
  try {
    const [cols] = await conn.query(
      `SELECT 1 FROM information_schema.columns 
       WHERE table_schema = ? AND table_name = 'demandes_devis' AND column_name = 'mode_paiement'`,
      [DB_CONFIG.database]
    );
    if (cols.length === 0) {
      await conn.query(`ALTER TABLE demandes_devis ADD COLUMN mode_paiement VARCHAR(60) DEFAULT NULL`);
      console.log('✅ Colonne mode_paiement ajoutée');
    } else {
      console.log('ℹ️ La colonne mode_paiement existe déjà');
    }
  } catch (err) {
    console.error('❌ Erreur migration:', err.message);
    process.exitCode = 1;
  } finally {
    conn.end();
  }
})();