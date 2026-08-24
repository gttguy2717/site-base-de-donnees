require('dotenv').config();
const { User, sequelize } = require('../src/models/index.cjs');
const { hashPassword } = require('../src/services/auth.service.cjs');

async function updateAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✓ Connexion à la base de données établie.');

    const newEmail = 'admin@gmail.com';
    const newPassword = 'admin123456';
    const newPhone = '0700000002';

    // Hash du nouveau mot de passe
    const hashedPassword = await hashPassword(newPassword);

    // Chercher le compte admin existant
    const admins = await User.findAll({ where: { role: 'ADMIN' } });

    if (admins.length === 0) {
      // Créer un nouveau compte admin si aucun n'existe
      await User.create({
        email: newEmail,
        telephone: newPhone,
        mot_de_passe_hash: hashedPassword,
        role: 'ADMIN',
        est_actif: true,
      });
      console.log(`✓ Nouveau compte admin créé : ${newEmail}`);
    } else {
      // Mettre à jour le premier admin trouvé
      const admin = admins[0];
      await admin.update({
        email: newEmail,
        telephone: newPhone,
        mot_de_passe_hash: hashedPassword,
        est_actif: true,
      });
      console.log(`✓ Compte admin mis à jour : ${newEmail}`);
    }

    console.log('\n=== IDENTIFIANTS ADMIN ===');
    console.log(`Email    : ${newEmail}`);
    console.log(`Password : ${newPassword}`);
    console.log('==========================\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

updateAdmin();
