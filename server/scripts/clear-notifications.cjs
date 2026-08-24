const { Notification } = require('../src/models/index.cjs');

async function clearNotifications() {
  try {
    console.log('🗑️  Suppression de toutes les notifications...\n');

    const count = await Notification.count();
    console.log(`📊 ${count} notification(s) trouvée(s)`);

    if (count > 0) {
      await Notification.destroy({ where: {}, truncate: true });
      console.log('✅ Toutes les notifications ont été supprimées');
    } else {
      console.log('ℹ️  Aucune notification à supprimer');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
}

clearNotifications();
