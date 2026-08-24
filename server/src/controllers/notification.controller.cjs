const { Notification } = require('../models/index.cjs');

async function getAllNotifications(request, response, next) {
  try {
    const limit = parseInt(request.query.limit) || 50;
    const userId = request.auth.user.id;
    const notifications = await Notification.findAll({
      where: { utilisateur_destinataire_id: userId },
      order: [['cree_le', 'DESC']],
      limit,
    });
    response.status(200).json({ notifications });
  } catch (error) {
    next(error);
  }
}

async function getMyNotifications(request, response, next) {
  try {
    const userId = request.auth.user.id;
    const notifications = await Notification.findAll({
      where: { utilisateur_destinataire_id: userId },
      order: [['cree_le', 'DESC']],
    });
    response.status(200).json({ notifications });
  } catch (error) {
    next(error);
  }
}

async function markAsRead(request, response, next) {
  try {
    const userId = request.auth.user.id;
    const { id } = request.params;
    const notification = await Notification.findOne({
      where: { id, utilisateur_destinataire_id: userId }
    });
    if (notification) {
      notification.est_lu = true;
      notification.lu_le = new Date();
      await notification.save();
    }
    response.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
}

async function markAllAsRead(request, response, next) {
  try {
    const userId = request.auth.user.id;
    await Notification.update(
      { est_lu: true, lu_le: new Date() },
      { where: { utilisateur_destinataire_id: userId, est_lu: false } }
    );
    response.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllNotifications, getMyNotifications, markAsRead, markAllAsRead };
