/* 
 * Migration : ajout de la vérification d'entreprise (documents d'inscription).
 * - Ajoute les colonnes verification_status, documents, note_verification, verifie_le sur la table entreprises.
 * - À exécuter avec : node server/scripts/add-company-verification.cjs
 * Requiert le .env pointant vers la base cible (config database).
 */
require('dotenv').config();
const { sequelize, Company, QueryTypes } = require('../src/models/index.cjs');

async function run() {
  const checks = [
    { col: 'verification_status', ddl: "ALTER TABLE `entreprises` ADD COLUMN `verification_status` ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'APPROVED'" },
    { col: 'documents', ddl: "ALTER TABLE `entreprises` ADD COLUMN `documents` JSON NULL" },
    { col: 'note_verification', ddl: "ALTER TABLE `entreprises` ADD COLUMN `note_verification` VARCHAR(255) NULL" },
    { col: 'verifie_le', ddl: "ALTER TABLE `entreprises` ADD COLUMN `verifie_le` DATETIME NULL" },
  ];

  for (const { col, ddl } of checks) {
    try {
      const rows = await sequelize.query(`SHOW COLUMNS FROM entreprises LIKE '${col}'`, { type: QueryTypes.SELECT });
      if (rows.length === 0) {
        await sequelize.query(ddl);
        console.log(`✅ Colonne ${col} ajoutée`);
      } else {
        console.log(`ℹ️  Colonne ${col} existe déjà`);
      }
    } catch (e) {
      // Table ou base non compatible : on essaie quand même le DDL direct
      try {
        await sequelize.query(ddl);
        console.log(`✅ Colonne ${col} ajoutée (via DDL direct)`);
      } catch (e2) {
        console.log(`⚠️  Impossible d'ajouter ${col}: ${e2.message}`);
      }
    }
  }

  // Valeur par défaut pour les entreprises existantes : APPROVED
  await sequelize.query("UPDATE entreprises SET verification_status='APPROVED' WHERE verification_status IS NULL OR verification_status=''");
  console.log('Migration de vérification des entreprises terminée.');
  await sequelize.close();
}

run().catch((e) => { console.error(e.message); process.exitCode = 1; });