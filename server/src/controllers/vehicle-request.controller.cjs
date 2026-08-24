const { VehicleRequest, User, Client, Notification } = require('../models/index.cjs');

// Créer une demande de véhicule
async function createVehicleRequest(request, response, next) {
  try {
    const { nom_vehicule, description, nom, telephone, email } = request.body;
    const userId = request.auth?.user?.id || null;
    const clientId = request.auth?.client?.id || null;

    // Créer la demande
    const vehicleRequest = await VehicleRequest.create({
      client_id: clientId,
      utilisateur_id: userId,
      nom_vehicule,
      description: description || null,
      nom,
      telephone,
      email,
      statut: 'PENDING',
    });

    // Créer notification pour tous les admins
    try {
      const { Op } = require('sequelize');
      const admins = await User.findAll({
        where: { 
          role: { [Op.in]: ['ADMIN', 'MANAGER'] },
          est_actif: true 
        },
      });

      console.log(`📧 Envoi notifications à ${admins.length} admin(s)...`);

      const notificationPromises = admins.map(admin =>
        Notification.create({
          utilisateur_destinataire_id: admin.id,
          type: 'VEHICLE_REQUEST',
          titre: `Nouvelle demande de véhicule`,
          message: `${nom} recherche: ${nom_vehicule}. Contact: ${telephone} / ${email}`,
          lien: `/admin/vehicle-requests`,
          est_lu: false,
        })
      );

      await Promise.all(notificationPromises);
      console.log(`✅ ${admins.length} notification(s) admin envoyée(s)`);
    } catch (notifError) {
      console.error('❌ Erreur notification admin:', notifError);
    }

    // Créer notification de confirmation pour le client si connecté
    if (userId) {
      try {
        await Notification.create({
          utilisateur_destinataire_id: userId,
          type: 'VEHICLE_REQUEST_CONFIRMATION',
          titre: `Demande de véhicule reçue`,
          message: `Votre demande pour "${nom_vehicule}" a bien été reçue. Notre équipe vous contactera sous peu.`,
          lien: `/profile/requests`,
          est_lu: false,
        });
        console.log('✅ Notification confirmation client envoyée');
      } catch (notifError) {
        console.error('❌ Erreur notification client:', notifError);
      }
    }

    response.status(201).json({ vehicleRequest, message: 'Demande envoyée avec succès' });
  } catch (error) {
    next(error);
  }
}

// Récupérer toutes les demandes (admin)
async function getAllVehicleRequests(request, response, next) {
  try {
    const requests = await VehicleRequest.findAll({
      include: [
        { model: Client, as: 'client', required: false },
      ],
      order: [['cree_le', 'DESC']],
    });

    response.json({ requests });
  } catch (error) {
    next(error);
  }
}

// Mettre à jour le statut d'une demande
async function updateVehicleRequestStatus(request, response, next) {
  try {
    const { id } = request.params;
    const { statut, reponse_admin } = request.body;

    const vehicleRequest = await VehicleRequest.findByPk(id);
    if (!vehicleRequest) {
      return response.status(404).json({ message: 'Demande non trouvée' });
    }

    await vehicleRequest.update({ statut, reponse_admin });

    // Notifier le client si userId existe
    if (vehicleRequest.utilisateur_id && reponse_admin) {
      await Notification.create({
        utilisateur_destinataire_id: vehicleRequest.utilisateur_id,
        type: 'VEHICLE_REQUEST_RESPONSE',
        titre: 'Réponse à votre demande de véhicule',
        message: reponse_admin,
        est_lu: false,
      });
    }

    response.json({ vehicleRequest, message: 'Statut mis à jour' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createVehicleRequest,
  getAllVehicleRequests,
  updateVehicleRequestStatus,
};
