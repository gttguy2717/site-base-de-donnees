const { Client, User, Company, sequelize } = require('./src/models/index.cjs');

(async () => {
  try {
    console.log('=== Test 1: FindOne avec include imbriqué (comme login) ===');
    const user = await User.findOne({
      where: { email: 'sorhodavid31@gmail.com' },
      include: [{
        model: Client,
        as: 'client',
        include: [{
          model: Company,
          as: 'entreprise'
        }]
      }],
      logging: (sql) => console.log('SQL:', sql)
    });
    console.log('Utilisateur trouvé:', user ? user.id : 'null');
    console.log('Client:', user?.client?.id || 'null');
    console.log('Entreprise:', user?.client?.entreprise?.nom || 'null');
    console.log('Verification status:', user?.client?.entreprise?.verification_status || 'null');

    console.log('\n=== Test 2: findByPk avec include imbriqué (comme me()) ===');
    const user2 = await User.findByPk('896bee84-2144-4912-a5c6-1e4120a23589', {
      attributes: { exclude: ['mot_de_passe_hash'] },
      include: [{
        model: Client,
        as: 'client',
        include: [{
          model: Company,
          as: 'entreprise'
        }]
      }],
      logging: (sql) => console.log('SQL:', sql)
    });
    console.log('Utilisateur trouvé:', user2 ? user2.id : 'null');
    console.log('Client:', user2?.client?.id || 'null');
    console.log('Entreprise:', user2?.client?.entreprise?.nom || 'null');

    await sequelize.close();
    console.log('\n=== Tests terminés avec succès ===');
  } catch (e) {
    console.error('ERREUR:', e.message);
    console.error(e.stack);
    await sequelize.close();
    process.exit(1);
  }
})();
