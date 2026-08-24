const app = require('./app.cjs');
const environment = require('./config/environment.cjs');
const sequelize = require('./database/sequelize.cjs');
require('./models/index.cjs');

async function start() {
  try {
    await sequelize.authenticate();
    app.listen(environment.port, '0.0.0.0', () => {
      console.log(`API SOUTARAH disponible sur http://localhost:${environment.port}/api`);
      console.log(`API SOUTARAH accessible sur le réseau local (0.0.0.0:${environment.port})`);
    });
  } catch (error) {
    console.error('Connexion MySQL impossible. Vérifiez votre fichier .env et exécutez les migrations.', error.message);
    process.exitCode = 1;
  }
}

start();
