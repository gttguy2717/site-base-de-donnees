/**
 * ============================================================
 *  BACKEND — RÉSERVATIONS DE VÉHICULES
 * ============================================================
 *  Contrôleur complet pour la gestion des réservations de
 *  véhicules : disponibilité, création, listing admin et
 *  mise à jour de statut.
 *
 *  Fichier extrait et dédié aux réservations de véhicules.
 * ============================================================
 */
const { Op } = require('sequelize');
const {
  sequelize,
  User,
  Client,
  Company,
  Vehicle,
  Reservation,
  Notification,
  QuoteRequest,
} = require('../models/index.cjs');
const { getVehicleDailyPrice } = require('../services/pricing.service.cjs');
const { sendCartNotificationEmail, sendReservationEmail } = require('../services/mail.service.cjs');

/**
 * Vérifie si un véhicule est disponible sur une période donnée.
 * GET /api/catalog/vehicles/:vehicleId/availability
 */
async function getVehicleAvailability(request, response, next) {
  try {
    const { startAt, endAt } = request.query;
    if (!startAt || !endAt || Number.isNaN(Date.parse(startAt)) || Number.isNaN(Date.parse(endAt)) || new Date(startAt) >= new Date(endAt)) {
      const error = new Error('Les dates de début et de fin sont obligatoires et doivent être cohérentes.');
      error.statusCode = 422;
      throw error;
    }
    const vehicle = await Vehicle.findByPk(request.params.vehicleId);
    if (!vehicle || vehicle.statut !== 'ACTIVE' || !vehicle.disponibilite) {
      return response.status(404).json({ available: false, message: 'Véhicule indisponible.' });
    }
    const overlappingReservation = await Reservation.findOne({
      where: {
        vehicule_id: vehicle.id,
        statut: { [Op.in]: ['PENDING', 'CONFIRMED'] },
        commence_le: { [Op.lt]: new Date(endAt) },
        termine_le: { [Op.gt]: new Date(startAt) },
      },
    });
    response.json({ available: !overlappingReservation });
  } catch (error) {
    next(error);
  }
}

/**
 * Crée une réservation de véhicule (client connecté).
 * POST /api/reservations
 */
async function createReservation(request, response, next) {
  const transaction = await sequelize.transaction();
  try {
    const userId = request.auth.user.id;
    const client = await Client.findOne({ where: { utilisateur_id: userId }, transaction });
    if (!client) {
      const error = new Error('Profil client requis pour réserver un véhicule.');
      error.statusCode = 403;
      throw error;
    }

    const { vehiculeId, startDate, endDate, withDriver = false, pickupLocation, destination, notes } = request.body;
    if (!vehiculeId || !startDate || !endDate) {
      const error = new Error('Véhicule, date de début et date de fin sont obligatoires.');
      error.statusCode = 422;
      throw error;
    }

    const vehicle = await Vehicle.findByPk(vehiculeId, { transaction });
    if (!vehicle || vehicle.statut !== 'ACTIVE' || !vehicle.disponibilite) {
      const error = new Error('Véhicule indisponible.');
      error.statusCode = 404;
      throw error;
    }

    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);
    requestedEnd.setDate(requestedEnd.getDate() + 1); // Inclure la fin de journée

    // Vérifier les conflits de réservation
    const conflict = await Reservation.findOne({
      where: {
        vehicule_id: vehicle.id,
        statut: { [Op.in]: ['PENDING', 'CONFIRMED'] },
        [Op.and]: [
          { commence_le: { [Op.lt]: requestedEnd } },
          { termine_le: { [Op.gt]: requestedStart } },
        ],
      },
      transaction,
    });

    if (conflict) {
      await transaction.rollback();
      return response.status(409).json({
        error: {
          message: 'Ce véhicule est déjà réservé sur cette période. Choisissez une autre période ou un autre véhicule.',
        },
      });
    }

    const days = Math.max(1, Math.ceil((requestedEnd - requestedStart) / 86400000));
    const company = await Company.findOne({ where: { client_id: client.id }, transaction });
    const prixJournalier = Number(await getVehicleDailyPrice(vehicle, client.type_client, company?.id || null) ?? vehicle.prix_journalier_particulier);
    const montantTotal = prixJournalier * days;
    const reference = `RES-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const reservation = await Reservation.create({
      client_id: client.id,
      vehicule_id: vehicle.id,
      reference,
      commence_le: requestedStart,
      termine_le: requestedEnd,
      statut: 'PENDING',
      prix_journalier: prixJournalier,
      montant_total: montantTotal,
      avec_chauffeur: withDriver,
      expire_le: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h pour confirmer
      note_gestionnaire: [pickupLocation ? `Prise en charge: ${pickupLocation}` : '', destination ? `Destination: ${destination}` : '', notes || ''].filter(Boolean).join('\n') || null,
    }, { transaction });

    // Notifier les admins
    const admins = await User.findAll({
      where: { role: { [Op.in]: ['ADMIN', 'MANAGER'] }, est_actif: true },
      attributes: ['id'],
      transaction,
    });
    await Promise.all(admins.map(admin => Notification.create({
      utilisateur_destinataire_id: admin.id,
      type: 'VEHICLE_REQUEST',
      titre: 'Nouvelle réservation de véhicule',
      message: `${client.prenom || ''} ${client.nom || ''} a réservé ${vehicle.marque} ${vehicle.modele} du ${startDate} au ${endDate} (${days}j). Réf: ${reference}`,
      lien: '/admin/reservations',
      est_lu: false,
    }, { transaction })));

    await transaction.commit();

    // Email admin (après commit pour ne pas bloquer la réponse)
    try {
      const mailResult = await sendReservationEmail({
        reservation: reservation.toJSON(),
        vehicle: vehicle.toJSON(),
        client: {
          prenom: client.prenom,
          nom: client.nom,
          user: { email: (await User.findByPk(client.utilisateur_id, { attributes: ['email', 'telephone'] }))?.toJSON() || {} },
        },
        days,
      });
      if (mailResult.sent) console.log(`✅ Email admin réservation ${reference} envoyé`);
    } catch (mailError) {
      console.error('❌ Erreur email admin réservation:', mailError.message);
    }

    response.status(201).json({ reservation });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

/**
 * Liste les réservations du client connecté.
 * GET /api/reservations/mine
 */
async function getMyReservations(request, response, next) {
  try {
    const userId = request.auth.user.id;
    const client = await Client.findOne({ where: { utilisateur_id: userId } });
    if (!client) {
      const error = new Error('Profil client requis.');
      error.statusCode = 403;
      throw error;
    }

    const reservations = await Reservation.findAll({
      where: { client_id: client.id },
      include: [{ model: Vehicle, as: 'vehicule' }],
      order: [['cree_le', 'DESC']],
    });

    response.json({ reservations });
  } catch (error) {
    next(error);
  }
}

/**
 * Notifie l'ajout d'une location de véhicule au panier (client).
 * POST /api/cart/notify-vehicle
 */
async function notifyVehicleAdded(request, response, next) {
  try {
    const userId = request.auth.user.id;
    const { vehicleName, startDate, endDate, days, withDriver } = request.body || {};

    // Vérifier si le véhicule est déjà réservé sur la période demandée
    if (vehicleName && startDate && endDate) {
      const vehicle = await Vehicle.findOne({
        where: {
          [Op.or]: [
            { marque: vehicleName },
            { modele: vehicleName },
            { [Op.and]: [{ marque: { [Op.like]: `%${vehicleName.split(' ')[0] || ''}%` } }, { modele: { [Op.like]: `%${vehicleName.split(' ')[1] || ''}%` } }] },
          ],
        },
      });

      if (vehicle) {
        const requestedStart = new Date(startDate);
        const requestedEnd = new Date(endDate);
        requestedEnd.setDate(requestedEnd.getDate() + 1); // Inclure la fin de journée

        const conflict = await Reservation.findOne({
          where: {
            vehicule_id: vehicle.id,
            statut: { [Op.in]: ['PENDING', 'CONFIRMED'] },
            [Op.and]: [
              { commence_le: { [Op.lt]: requestedEnd } },
              { termine_le: { [Op.gt]: requestedStart } },
            ],
          },
        });

        if (conflict) {
          return response.status(409).json({
            error: {
              message: 'Ce véhicule est déjà réservé sur cette période. Choisissez une autre période ou un autre véhicule.',
            },
          });
        }
      }
    }

    const user = await User.findByPk(userId);
    const client = await Client.findOne({ where: { utilisateur_id: userId } });
    const clientName = [client?.prenom, client?.nom].filter(Boolean).join(' ').trim() || user?.email || 'Client';
    const contact = `${user?.telephone || 'N/A'} / ${user?.email || 'N/A'}`;

    const admins = await User.findAll({
      where: { role: { [Op.in]: ['ADMIN', 'MANAGER'] }, est_actif: true },
      attributes: ['id'],
    });

    const details = [
      vehicleName ? `"${vehicleName}"` : 'un véhicule',
      startDate ? `du ${startDate}` : '',
      endDate ? `au ${endDate}` : '',
      days ? `(${days} jour${days > 1 ? 's' : ''})` : '',
      withDriver ? 'avec chauffeur' : 'sans chauffeur',
    ].filter(Boolean).join(' ');

    await Promise.all(admins.map(admin => Notification.create({
      utilisateur_destinataire_id: admin.id,
      type: 'CART_ITEM_ADDED',
      titre: 'Location ajoutée au panier',
      message: `${clientName} a ajouté la location ${details} à son panier. Contact: ${contact}`,
      lien: '/admin/clients',
      est_lu: false,
    })));

    // Envoyer un email de notification admin
    try {
      const company = client ? await Company.findOne({ where: { client_id: client.id } }) : null;
      const vehicle = vehicleName ? await Vehicle.findOne({ where: { [Op.or]: [{ marque: vehicleName }, { modele: vehicleName }, { marque: { [Op.like]: `%${vehicleName.split(' ')[0] || ''}%` } }] } }) : null;
      const unitPrice = vehicle && client ? await getVehicleDailyPrice(vehicle, client.type_client, company?.id || null) : null;
      const duration = Number(days || 1);
      const lineTotal = unitPrice != null ? unitPrice * duration : null;

      const mail = await sendCartNotificationEmail({
        clientName,
        contact,
        customerType: client?.type_client || 'N/A',
        itemType: 'vehicle',
        details,
        productName: vehicleName || 'Véhicule',
        quantity: 1,
        unitPrice,
        lineTotal,
        cartTotal: lineTotal || 0,
        days: duration,
        startDate,
        endDate,
        withDriver,
      });
      console.log(`✅ Email location ajoutée envoyé à ${mail.sent ? 'managers' : 'N/A'}`);
    } catch (mailError) {
      console.error('❌ Erreur envoi email location ajoutée:', mailError.message);
    }

    response.status(201).json({ ok: true, notified: admins.length });
  } catch (error) {
    console.error('[notifyVehicleAdded] Erreur:', error.message);
    next(error);
  }
}

/**
 * Liste toutes les réservations (admin).
 * GET /api/admin/reservations
 */
async function getAllReservations(_request, response, next) {
  try {
    const reservations = await Reservation.findAll({
      include: [
        { model: Client, as: 'client', include: [{ model: User, as: 'user' }] },
        { model: Vehicle, as: 'vehicule' },
      ],
      order: [['cree_le', 'DESC']],
    });

    response.json({ reservations });
  } catch (error) {
    next(error);
  }
}

/**
 * Met à jour le statut d'une réservation (admin).
 * PUT /api/admin/reservations/:id/status
 */
async function updateReservationStatus(request, response, next) {
  try {
    const { statut, note_gestionnaire } = request.body;
    const reservation = await Reservation.findByPk(request.params.id);

    if (!reservation) {
      return response.status(404).json({ message: 'Réservation non trouvée' });
    }

    await reservation.update({ statut, note_gestionnaire });
    response.json({ reservation });
  } catch (error) {
    next(error);
  }
}

/**
 * Crée automatiquement une réservation CONFIRMED lorsqu'un devis
 * est approuvé (utilisé par updateQuoteStatus).
 */
async function createReservationFromApprovedQuote(quote, vehicle) {
  try {
    const reservation = await Reservation.create({
      client_id: quote.client.id,
      vehicule_id: vehicle?.id || null,
      reference: `RES-${quote.reference || Date.now()}`,
      commence_le: new Date(),
      termine_le: new Date(Date.now() + 3 * 86400000), // 3 jours par défaut
      statut: 'CONFIRMED',
      prix_journalier: vehicle?.prix_journalier_particulier || 0,
      montant_total: vehicle ? Number(vehicle.prix_journalier_particulier) * 3 : 0,
      avec_chauffeur: false,
      expire_le: new Date(Date.now() + 3 * 86400000),
    });
    console.log(`✅ Réservation CONFIRMED créée pour le devis approuvé ${quote.reference}${vehicle ? ` - ${vehicle.marque} ${vehicle.modele}` : ''}`);
    return reservation;
  } catch (error) {
    console.error('❌ Erreur création réservation depuis devis approuvé:', error.message);
    return null;
  }
}

module.exports = {
  getVehicleAvailability,
  createReservation,
  getMyReservations,
  notifyVehicleAdded,
  getAllReservations,
  updateReservationStatus,
  createReservationFromApprovedQuote,
};
