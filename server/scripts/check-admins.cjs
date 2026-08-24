#!/usr/bin/env node
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { sequelize } = require('../src/models/index.cjs');

(async () => {
  try {
    await sequelize.authenticate();
    
    console.log('👥 Vérification des utilisateurs admin...\n');
    
    const [admins] = await sequelize.query(`
      SELECT id, email, role, est_actif 
      FROM utilisateurs 
      WHERE role IN ('ADMIN', 'MANAGER')
      ORDER BY role, email
    `);
    
    if (admins.length === 0) {
      console.log('❌ AUCUN ADMIN TROUVÉ !');
      console.log('\n💡 Créons un compte admin...\n');
      
      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash('admin123456', 12);
      
      await sequelize.query(`
        INSERT INTO utilisateurs (id, email, mot_de_passe_hash, role, est_actif, email_verifie, cree_le, mis_a_jour_le)
        VALUES (gen_random_uuid(), 'admin@soutarah.com', $1, 'ADMIN', true, true, NOW(), NOW())
        RETURNING id, email, role
      `, {
        bind: [passwordHash]
      });
      
      console.log('✅ Compte admin créé !');
      console.log('   Email: admin@soutarah.com');
      console.log('   Mot de passe: admin123456');
    } else {
      console.log(`✅ ${admins.length} admin(s) trouvé(s):\n`);
      
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.email}`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Rôle: ${admin.role}`);
        console.log(`   Actif: ${admin.est_actif ? 'Oui' : 'Non'}`);
        console.log('');
      });
    }
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
})();
