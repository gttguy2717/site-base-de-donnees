require('dotenv').config();
const { User, Client, sequelize } = require('../src/models/index.cjs');
const { hashPassword } = require('../src/services/auth.service.cjs');

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`La variable ${name} est requise dans le fichier .env.`);
  return value;
}

async function createOrUpdateUser({ email, telephone, password, role, client }) {
  const mot_de_passe_hash = await hashPassword(password);
  const [user, created] = await User.findOrCreate({
    where: { email },
    defaults: { email, telephone, mot_de_passe_hash, role, est_actif: true },
  });

  if (!created) {
    await user.update({ telephone, mot_de_passe_hash, role, est_actif: true });
  }

  if (client) {
    const [profile, profileCreated] = await Client.findOrCreate({
      where: { utilisateur_id: user.id },
      defaults: { utilisateur_id: user.id, ...client },
    });
    if (!profileCreated) await profile.update(client);
  }

  return created ? 'créé' : 'mis à jour';
}

async function run() {
  const clientEmail = requiredEnv('SEED_CLIENT_EMAIL').toLowerCase();
  const clientPhone = requiredEnv('SEED_CLIENT_PHONE');
  const clientPassword = requiredEnv('SEED_CLIENT_PASSWORD');
  const adminEmail = requiredEnv('SEED_ADMIN_EMAIL').toLowerCase();
  const adminPhone = requiredEnv('SEED_ADMIN_PHONE');
  const adminPassword = requiredEnv('SEED_ADMIN_PASSWORD');

  if (clientPassword.length < 8 || adminPassword.length < 8) {
    throw new Error('Les mots de passe des comptes de démonstration doivent contenir au moins 8 caractères.');
  }

  await sequelize.authenticate();
  const clientStatus = await createOrUpdateUser({
    email: clientEmail,
    telephone: clientPhone,
    password: clientPassword,
    role: 'CLIENT',
    client: { type_client: 'PARTICULIER', prenom: 'Client', nom: 'Soutarah', adresse: 'Abidjan, Côte d’Ivoire' },
  });
  const adminStatus = await createOrUpdateUser({
    email: adminEmail,
    telephone: adminPhone,
    password: adminPassword,
    role: 'ADMIN',
  });

  console.log(`Compte client ${clientStatus} : ${clientEmail}`);
  console.log(`Compte administrateur ${adminStatus} : ${adminEmail}`);
  console.log('Les mots de passe ont été chiffrés avant leur enregistrement.');
}

run()
  .catch((error) => { console.error(`Échec du seed : ${error.message}`); process.exitCode = 1; })
  .finally(async () => { await sequelize.close(); });
