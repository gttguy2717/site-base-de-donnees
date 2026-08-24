const { Op } = require('sequelize');
const { Client, Company, Notification, QuoteRequest, User } = require('../models/index.cjs');
const { sendQuoteRequestEmail } = require('../services/mail.service.cjs');

function createReference() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DMD-${year}-${random}`;
}

async function buildUniqueReference() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reference = createReference();
    const exists = await QuoteRequest.findOne({ where: { reference }, attributes: ['id'] });
    if (!exists) return reference;
  }
  return `DMD-${Date.now()}`;
}

async function createQuoteRequest(request, response, next) {
  try {
    const user = request.auth?.user || null;
    const client = user
      ? await Client.findOne({ where: { utilisateur_id: user.id }, include: [{ model: Company, as: 'entreprise' }] })
      : null;

    const quoteRequest = await QuoteRequest.create({
      reference: await buildUniqueReference(),
      client_id: client?.id || null,
      utilisateur_id: user?.id || null,
      source: client ? 'CLIENT' : 'GUEST',
      service: request.body.service,
      titre: request.body.title.trim(),
      budget: request.body.budget || null,
      delai: request.body.timeline || null,
      description: request.body.description?.trim() || null,
      entreprise: request.body.company?.trim() || client?.entreprise?.nom || null,
      nom: request.body.name.trim(),
      email: request.body.email.trim().toLowerCase(),
      telephone: request.body.phone.trim(),
      lieu: request.body.location.trim(),
    });

    const managers = await User.findAll({ where: { role: ['ADMIN', 'MANAGER'], est_actif: true }, attributes: ['id'] });
    await Promise.all(managers.map((manager) => Notification.create({
      utilisateur_destinataire_id: manager.id,
      type: 'QUOTE_REQUEST_CREATED',
      titre: 'Nouvelle demande de devis',
      message: `${quoteRequest.nom} a envoyé une demande de devis : ${quoteRequest.titre}.`,
      lien: '/admin/quotes',
    })));

    // Notification client si l'utilisateur est connecté
    if (user?.id) {
      await Notification.create({
        utilisateur_destinataire_id: user.id,
        type: 'CART_VALIDATED',
        titre: 'Panier validé - Devis enregistré',
        message: `Votre demande de devis ${quoteRequest.reference} a été enregistrée avec succès. Retrouvez-la dans "Mes devis".`,
        lien: '/client/devis',
      });
    }

    const mail = await sendQuoteRequestEmail({ quoteRequest }).catch((error) => ({ sent: false, reason: error.message }));
    response.status(201).json({ quoteRequest, emailSent: mail.sent });
  } catch (error) {
    next(error);
  }
}

async function getMyQuoteRequests(request, response, next) {
  try {
    const userId = request.auth.user.id;
    const userEmail = request.auth.user.email;

    const quoteRequests = await QuoteRequest.findAll({
      where: {
        [Op.or]: [
          { utilisateur_id: userId },
          { email: userEmail }
        ]
      },
      order: [['cree_le', 'DESC']],
    });

    response.status(200).json({ quoteRequests });
  } catch (error) {
    next(error);
  }
}

async function deleteQuoteRequest(request, response, next) {
  try {
    const userId = request.auth.user.id;
    const { id } = request.params;

    const quoteRequest = await QuoteRequest.findOne({ where: { id } });
    if (!quoteRequest) {
      return response.status(404).json({ error: 'Devis introuvable.' });
    }

    // Seul le propriétaire peut supprimer son devis
    if (quoteRequest.utilisateur_id !== userId) {
      return response.status(403).json({ error: 'Accès refusé.' });
    }

    await quoteRequest.destroy();
    response.status(200).json({ success: true, message: 'Devis supprimé avec succès.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { createQuoteRequest, getMyQuoteRequests, deleteQuoteRequest };
