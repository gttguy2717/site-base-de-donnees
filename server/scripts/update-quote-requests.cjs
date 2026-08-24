/**
 * Script de mise à jour de la table demandes_devis
 * - Ajoute la colonne fichier_devis_url
 * - Étend le type ENUM statut pour APPROVED, REJECTED, SENT
 * - À exécuter avec : node server/scripts/update-quote-requests.cjs
 */
const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || 'soutarah_group',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

async function run() {
  let connection;
  try {
    console.log('🔌 Connexion à MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log(`✅ Connecté à ${DB_CONFIG.database} sur ${DB_CONFIG.host}:${DB_CONFIG.port}`);

    // 1. Ajouter la colonne fichier_devis_url si elle n'existe pas
    console.log('\n🔧 Vérification de la colonne fichier_devis_url...');
    const [columnExists] = await connection.query(
      `SELECT 1 FROM information_schema.columns 
       WHERE table_schema = ? AND table_name = 'demandes_devis' AND column_name = 'fichier_devis_url'`,
      [DB_CONFIG.database]
    );

    if (columnExists.length === 0) {
      await connection.query(
        `ALTER TABLE demandes_devis ADD COLUMN fichier_devis_url VARCHAR(255)`
      );
      console.log('✅ Colonne fichier_devis_url ajoutée');
    } else {
      console.log('ℹ️ La colonne fichier_devis_url existe déjà');
    }

    // 2. Étendre l'ENUM statut
    console.log('\n🔧 Mise à jour du type ENUM statut...');
    try {
      await connection.query(`
        ALTER TABLE demandes_devis 
        MODIFY COLUMN statut ENUM('PENDING', 'CONTACTED', 'CONVERTED', 'CANCELLED', 'APPROVED', 'REJECTED', 'SENT') DEFAULT 'PENDING' NOT NULL
      `);
      console.log('✅ Enum statut étendu avec APPROVED, REJECTED, SENT');
    } catch (enumError) {
      console.log(`ℹ️ Enum statut : ${enumError.message}`);
    }

    // 3. Vérifier le résultat
    console.log('\n📋 Vérification de la structure finale :');
    const [columns] = await connection.query(
      `SELECT column_name, data_type, is_nullable 
       FROM information_schema.columns 
       WHERE table_schema = ? AND table_name = 'demandes_devis' 
       ORDER BY ordinal_position`,
      [DB_CONFIG.database]
    );
    columns.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));

    const [count] = await connection.query(`SELECT COUNT(*) as total FROM demandes_devis`);
    console.log(`\n📊 Total devis en base : ${count[0].total}`);

    console.log('\n✅ Migration terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exitCode = 1;
  } finally {
    if (connection) await connection.end().catch(() => {});
  }
}

run();