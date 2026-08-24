#!/usr/bin/env node
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { sequelize } = require('../src/models/index.cjs');

(async () => {
  try {
    await sequelize.authenticate();
    
    console.log('🔔 Vérification des notifications...\n');
    
    const [notifs] = await sequelize.query(`
      SELECT * FROM notifications 
      WHERE type IN ('VEHICLE_REQUEST', 'CART_ITEM_ADDED') 
      ORDER BY cree_le DESC 
      LIMIT 10
    `);
    
    console.log(`📊 ${notifs.length} notifications trouvées:\n`);
    
    notifs.forEach((notif, index) => {
      console.log(`${index + 1}. [${notif.type}] ${notif.titre}`);
      console.log(`   Message: ${notif.message}`);
      console.log(`   Créée: ${notif.cree_le}`);
      console.log(`   Lu: ${notif.est_lu ? 'Oui' : 'Non'}`);
      console.log('');
    });
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
})();
