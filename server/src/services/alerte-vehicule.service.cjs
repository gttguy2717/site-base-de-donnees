/**
 * SOUTARAH — Alerte « véhicule indisponible » vers l'administration
 * ============================================================================
 * Déclenchée à chaque tentative d'ajout au panier d'un véhicule qui n'est pas
 * disponible (retiré du catalogue, désactivé, ou déjà réservé sur la période).
 *
 * ⚠️ NON BLOQUANTE et jamais attendue : c'est la cause du délai vécu par le
 * client. La notification en base et l'email partent en tâche de fond, la
 * réponse HTTP est renvoyée immédiatement. Un échec d'envoi ne doit jamais
 * faire échouer la demande du client.
 */
const { Op } = require('sequelize');
const { User, Client, Notification } = require('../models/index.cjs');
const { sendVehicleUnavailableEmail } = require('./mail.service.cjs');

function signalerVehiculeIndisponible({
  userId = null, clientId = null, clientLabel = null,
  vehicle = null, vehicleId = null, vehicleName = null,
  startDate = null, endDate = null, days = null, withDriver = null,
  raison = 'Véhicule indisponible',
}) {
  // setImmediate : la fonction rend la main tout de suite, le traitement suit
  // après l'envoi de la réponse au client.
  setImmediate(async () => {
    try {
      let client = null;
      let user = null;

      if (userId) {
        user = await User.findByPk(userId, { attributes: ['id', 'email', 'telephone'] });
      }
      if (userId || clientId) {
        client = await Client.findOne({ where: userId ? { utilisateur_id: userId } : { id: clientId } });
      }

      const clientName = clientLabel
        || [client?.prenom, client?.nom].filter(Boolean).join(' ').trim()
        || user?.email
        || 'Client invité';
      const contact = `${user?.telephone || client?.telephone || 'N/A'} / ${user?.email || 'N/A'}`;
      const libelle = vehicleName || (vehicle ? `${vehicle.marque} ${vehicle.modele}` : 'Véhicule inconnu');

      // 1. Notification dans le back-office
      const admins = await User.findAll({
        where: { role: { [Op.in]: ['ADMIN', 'MANAGER'] }, est_actif: true },
        attributes: ['id'],
      });
      if (admins.length) {
        await Notification.create({
          utilisateur_destinataire_id: admins[0].id,
          type: 'VEHICULE_INDISPONIBLE',
          titre: 'Véhicule indisponible demandé',
          message: `${clientName} a tenté de réserver « ${libelle} » du ${startDate || '—'} au ${endDate || '—'} (${days || 1} jour(s), ${withDriver ? 'avec chauffeur' : 'sans chauffeur'}) — ${raison}. Contact : ${contact}`,
          lien: '/admin/clients',
          est_lu: false,
        });
      }

      // 2. Email aux managers
      const mail = await sendVehicleUnavailableEmail({
        clientName,
        contact,
        customerType: client?.type_client || '—',
        vehicleName: libelle,
        vehicleId: vehicle?.id || vehicleId || null,
        startDate,
        endDate,
        days,
        reason: raison,
      });
      console.log(`🚫 Véhicule indisponible demandé par ${clientName} (« ${libelle} ») — email : ${mail.sent ? 'envoyé' : 'non envoyé'}`);
    } catch (error) {
      console.error('Alerte véhicule indisponible non aboutie :', error.message);
    }
  });
}

module.exports = { signalerVehiculeIndisponible };