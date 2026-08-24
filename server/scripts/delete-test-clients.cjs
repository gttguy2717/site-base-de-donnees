require('dotenv').config();
const { Op } = require('sequelize');
const { sequelize, User, Client, Company, QuoteRequest, Reservation, Cart, CartItem, Quote, QuoteItem, ProductRequest, VehicleRequest, Notification } = require('../src/models/index.cjs');

async function run() {
  await sequelize.authenticate();
  console.log('🔌 Connecté à la base de données.');

  // Mots-clés à rechercher
  const keywords = ['sucaf', 'dada', 'test entreprise'];

  // 1. Trouver les entreprises correspondant aux noms de test
  const companies = await Company.findAll({
    where: {
      [Op.or]: keywords.map(keyword => ({
        nom: { [Op.like]: `%${keyword}%` },
      })),
    },
  });

  console.log(`\n🔍 ${companies.length} entreprise(s) de test trouvée(s) :`);
  companies.forEach(c => console.log(`   - ${c.nom} (ID: ${c.id})`));

  const companyClientIds = companies.map(c => c.client_id);

  // 2. Trouver les clients (entreprises et clients directs avec noms de test)
  const clientConditions = {
    [Op.or]: [
      // Clients liés aux entreprises de test
      { id: { [Op.in]: companyClientIds } },
      // Clients dont le prénom ou nom contient les mots-clés
      ...keywords.flatMap(keyword => [
        { prenom: { [Op.like]: `%${keyword}%` } },
        { nom: { [Op.like]: `%${keyword}%` } },
      ]),
    ],
  };

  const clients = await Client.findAll({ where: clientConditions });
  console.log(`\n🔍 ${clients.length} client(s) trouvé(s).`);
  clients.forEach(c => console.log(`   - ${c.prenom || ''} ${c.nom || ''} (ID: ${c.id})`));

  const allClientIds = clients.map(c => c.id);
  const userIds = clients.map(c => c.utilisateur_id);

  // 3. Trouver les utilisateurs avec email/téléphone de test
  const testUsers = await User.findAll({
    where: {
      [Op.or]: keywords.flatMap(keyword => [
        { email: { [Op.like]: `%${keyword}%` } },
        { telephone: { [Op.like]: `%${keyword}%` } },
      ]),
    },
  });

  const allUserIds = [...new Set([...userIds, ...testUsers.map(u => u.id)])];
  console.log(`\n🔍 ${allUserIds.length} utilisateur(s) à supprimer.`);

  if (allClientIds.length === 0 && allUserIds.length === 0) {
    console.log('\n🎉 Aucune donnée de test trouvée. Rien à supprimer !');
    return;
  }

  // 4. Supprimer toutes les données liées dans le bon ordre
  
  // 4.1 Supprimer les réservations liées aux clients
  if (allClientIds.length > 0) {
    await Reservation.destroy({ where: { client_id: { [Op.in]: allClientIds } } });
    console.log('✅ Réservations supprimées.');
  }

  // 4.2 Supprimer les demandes de devis liées
  if (allUserIds.length > 0) {
    await QuoteRequest.destroy({ where: { utilisateur_id: { [Op.in]: allUserIds } } });
    console.log('✅ Demandes de devis supprimées.');
  }

  // 4.3 Supprimer les demandes de produits liées
  if (allClientIds.length > 0) {
    await ProductRequest.destroy({ where: { client_id: { [Op.in]: allClientIds } } });
    console.log('✅ Demandes de produits supprimées.');
  }

  // 4.4 Supprimer les demandes de véhicules liées
  if (allClientIds.length > 0 || allUserIds.length > 0) {
    await VehicleRequest.destroy({
      where: {
        [Op.or]: [
          { client_id: { [Op.in]: allClientIds } },
          { utilisateur_id: { [Op.in]: allUserIds } },
        ],
      },
    });
    console.log('✅ Demandes de véhicules supprimées.');
  }

  // 4.5 Supprimer les notifications destinées aux utilisateurs
  if (allUserIds.length > 0) {
    await Notification.destroy({ where: { utilisateur_destinataire_id: { [Op.in]: allUserIds } } });
    console.log('✅ Notifications supprimées.');
  }

  // 4.6 Supprimer les paniers et leurs articles
  const carts = await Cart.findAll({ where: { client_id: { [Op.in]: allClientIds } } });
  const cartIds = carts.map(c => c.id);
  if (cartIds.length > 0) {
    await CartItem.destroy({ where: { panier_id: { [Op.in]: cartIds } } });
    await Cart.destroy({ where: { id: { [Op.in]: cartIds } } });
    console.log('✅ Paniers et articles supprimés.');
  }

  // 4.7 Supprimer les devis et leurs articles
  const quotes = await Quote.findAll({ where: { client_id: { [Op.in]: allClientIds } } });
  const quoteIds = quotes.map(q => q.id);
  if (quoteIds.length > 0) {
    await QuoteItem.destroy({ where: { devis_id: { [Op.in]: quoteIds } } });
    await Quote.destroy({ where: { id: { [Op.in]: quoteIds } } });
    console.log('✅ Devis et articles supprimés.');
  }

  // 4.8 Supprimer les entreprises
  if (companies.length > 0) {
    await Company.destroy({ where: { id: { [Op.in]: companies.map(c => c.id) } } });
    console.log('✅ Entreprises supprimées.');
  }

  // 4.9 Supprimer les clients
  if (allClientIds.length > 0) {
    await Client.destroy({ where: { id: { [Op.in]: allClientIds } } });
    console.log('✅ Clients supprimés.');
  }

  // 4.10 Supprimer les utilisateurs
  if (allUserIds.length > 0) {
    await User.destroy({ where: { id: { [Op.in]: allUserIds } } });
    console.log('✅ Utilisateurs supprimés.');
  }

  console.log('\n🎉 Nettoyage terminé avec succès !');
}

run()
  .catch((error) => { console.error(`\n❌ Échec du nettoyage : ${error.message}`); process.exitCode = 1; })
  .finally(async () => { await sequelize.close(); });