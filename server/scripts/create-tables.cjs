#!/usr/bin/env node
/**
 * Script pour créer les tables manquantes dans la base de données
 * Usage: node scripts/create-tables.cjs
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { sequelize } = require('../src/models/index.cjs');

async function createTables() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion réussie');

    console.log('\n🔄 Création des tables manquantes...');
    
    // Créer la table demandes_vehicules
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS demandes_vehicules (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        client_id CHAR(36),
        utilisateur_id CHAR(36),
        nom_vehicule VARCHAR(180) NOT NULL,
        description TEXT,
        nom VARCHAR(180) NOT NULL,
        telephone VARCHAR(32) NOT NULL,
        email VARCHAR(254) NOT NULL,
        statut VARCHAR(20) DEFAULT 'PENDING' CHECK (statut IN ('PENDING', 'CONTACTED', 'CONVERTED', 'REJECTED')),
        reponse_admin TEXT,
        cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        mis_a_jour_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table demandes_vehicules créée/vérifiée');

    // Créer les indexes
    await sequelize.query(`CREATE INDEX idx_demandes_vehicules_client ON demandes_vehicules(client_id);`).catch(() => {});
    await sequelize.query(`CREATE INDEX idx_demandes_vehicules_user ON demandes_vehicules(utilisateur_id);`).catch(() => {});
    await sequelize.query(`CREATE INDEX idx_demandes_vehicules_statut ON demandes_vehicules(statut);`).catch(() => {});
    await sequelize.query(`CREATE INDEX idx_demandes_vehicules_cree ON demandes_vehicules(cree_le);`).catch(() => {});
    console.log('✅ Indexes créés/vérifiés');

    // Vérifier la table notifications
    const [notifications] = await sequelize.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = 'notifications'
    `);
    
    if (notifications[0].count === 0) {
      await sequelize.query(`
        CREATE TABLE notifications (
          id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
          utilisateur_destinataire_id CHAR(36),
          type VARCHAR(80) NOT NULL,
          titre VARCHAR(180) NOT NULL,
          message TEXT NOT NULL,
          lien VARCHAR(255),
          est_lu BOOLEAN DEFAULT FALSE,
          lu_le TIMESTAMP NULL,
          cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          mis_a_jour_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `);
      
      await sequelize.query(`CREATE INDEX idx_notifications_user ON notifications(utilisateur_destinataire_id);`).catch(() => {});
      await sequelize.query(`CREATE INDEX idx_notifications_lu ON notifications(est_lu);`).catch(() => {});
      await sequelize.query(`CREATE INDEX idx_notifications_cree ON notifications(cree_le);`).catch(() => {});
      
      console.log('✅ Table notifications créée');
    } else {
      console.log('✅ Table notifications existe déjà');
    }

    // Afficher le résumé
    console.log('\n📊 Résumé des tables:');
    const [vehicleCount] = await sequelize.query('SELECT COUNT(*) as count FROM demandes_vehicules');
    const [notifCount] = await sequelize.query('SELECT COUNT(*) as count FROM notifications');
    
    console.log(`  - demandes_vehicules: ${vehicleCount[0].count} enregistrements`);
    console.log(`  - notifications: ${notifCount[0].count} enregistrements`);

    console.log('\n✅ Toutes les tables sont prêtes !');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
    console.error('\n💡 Vérifiez que:');
    console.error('  1. MySQL est démarré');
    console.error('  2. La base "soutarah_group" existe');
    console.error('  3. Les credentials dans .env sont corrects');
    process.exit(1);
  }
}

createTables();
