const { Notification, User } = require('../src/models/index.cjs');
const { Op } = require('sequelize');

async function testNotifications() {
  try {
    console.log('🔔 Test des notifications admin...\n');

    // Trouver tous les admins
    const admins = await User.findAll({
      where: {
        role: {
          [Op.in]: ['ADMIN', 'MANAGER']
        }
      }
    });

    if (admins.length === 0) {
      console.log('❌ Aucun admin trouvé');
      return;
    }

    console.log(`✅ ${admins.length} admin(s) trouvé(s):`);
    admins.forEach(admin => {
      console.log(`   - ${admin.email} (ID: ${admin.id}, Role: ${admin.role})`);
    });

    console.log('\n📝 Création de notifications de test...\n');

    // Créer quelques notifications de test
    const testNotifications = [
      {
        titre: '🚗 Nouvelle demande de véhicule',
        message: 'Un client a demandé un devis pour un Toyota Hilux.',
        type: 'VEHICLE_REQUEST',
        priorite: 'HAUTE',
      },
      {
        titre: '🛒 Nouvel ajout au panier',
        message: 'Un client a ajouté 50 sacs de ciment Portland au panier.',
        type: 'CART_ITEM_ADDED',
        priorite: 'MOYENNE',
      },
      {
        titre: '📋 Nouvelle demande de devis',
        message: 'Entreprise SARL BTP a demandé un devis pour 100 tonnes de fer à béton.',
        type: 'QUOTE_REQUEST',
        priorite: 'HAUTE',
      },
      {
        titre: '👤 Nouvelle entreprise client',
        message: 'SARL Construction Plus s\'est inscrit en tant qu\'entreprise client.',
        type: 'NEW_CLIENT',
        priorite: 'BASSE',
      },
      {
        titre: '🚚 Réservation urgente',
        message: 'Réservation de camion benne pour demain matin à 7h.',
        type: 'NEW_ORDER',
        priorite: 'HAUTE',
      },
    ];

    for (const admin of admins) {
      for (const notifData of testNotifications) {
        await Notification.create({
          ...notifData,
          utilisateur_id: admin.id,
          est_lu: false,
        });
      }
    }

    console.log(`✅ ${testNotifications.length} notifications créées pour chaque admin`);

    // Compter les notifications
    const totalNotifications = await Notification.count();
    const unreadNotifications = await Notification.count({ where: { est_lu: false } });

    console.log('\n📊 Statistiques:');
    console.log(`   Total notifications: ${totalNotifications}`);
    console.log(`   Non lues: ${unreadNotifications}`);
    console.log(`   Lues: ${totalNotifications - unreadNotifications}`);

    console.log('\n✅ Test terminé avec succès!');
    console.log('\n💡 Connectez-vous en tant qu\'admin pour voir le popup de notifications.');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
}

testNotifications();
