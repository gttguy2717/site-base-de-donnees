const { Op } = require('sequelize');
const { Client, Company, Notification, QuoteRequest, Reservation, User, Vehicle } = require('../models/index.cjs');
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
      // Snapshot des articles détaillés (négoce + locations) pour régénérer le même PDF
      snapshot: Array.isArray(request.body.items) && request.body.items.length > 0
        ? JSON.stringify(request.body.items).slice(0, 60000)
        : null,
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

    // Parser le snapshot JSON pour que le client puisse régénérer le même devis PDF
    const formatted = quoteRequests.map((q) => {
      const json = q.toJSON();
      let snapshot = null;
      if (json.snapshot) {
        try {
          snapshot = JSON.parse(json.snapshot);
        } catch (e) {
          snapshot = null;
        }
      }
      return { ...json, snapshot };
    });

    response.status(200).json({ quoteRequests: formatted });
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

// ─── Télécharger le PDF officiel d'un devis (client propriétaire ou admin) ──
async function downloadQuotePdf(request, response, next) {
  try {
    const user = request.auth.user;
    const isStaff = user.role === 'ADMIN' || user.role === 'MANAGER';
    const { reference } = request.params;

    const quoteRequest = await QuoteRequest.findOne({ where: { reference: String(reference).trim() } });
    if (!quoteRequest) {
      return response.status(404).json({ error: { message: 'Devis introuvable.' } });
    }

    const isOwner = quoteRequest.utilisateur_id === user.id || quoteRequest.email === user.email;
    if (!isStaff && !isOwner) {
      return response.status(403).json({ error: { message: 'Accès refusé.' } });
    }

    const { generateQuotePdf } = require('../services/quotePdf.service.cjs');
    const pdfBytes = await generateQuotePdf(quoteRequest);

    const fileName = `Devis-${quoteRequest.reference || 'SOUTARAH'}.pdf`;
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    response.setHeader('Content-Length', String(pdfBytes.length));
    response.status(200).send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('[downloadQuotePdf] Erreur:', error.message);
    next(error);
  }
}

async function confirmQuoteRequest(request, response, next) {
  try {
    const { reference, paymentMethod } = request.body;
    const user = request.auth?.user || null;

    if (!reference) {
      return response.status(400).json({ error: 'Référence du devis manquante.' });
    }

    const quoteRequest = await QuoteRequest.findOne({
      where: { reference: String(reference).trim() },
      include: [{ model: Client, as: 'client', include: [{ model: User, as: 'user' }] }],
    });
    if (!quoteRequest) {
      return response.status(404).json({ error: 'Devis introuvable avec cette référence.' });
    }

    // Vérification du propriétaire du devis
    const isOwner = user
      ? quoteRequest.utilisateur_id === user.id
        || String(quoteRequest.email || '').toLowerCase() === String(user.email || '').toLowerCase()
      : false;
    if (!isOwner) {
      return response.status(403).json({ error: 'Accès refusé : ce devis ne vous appartient pas.' });
    }

    if (paymentMethod) {
      await quoteRequest.update({ mode_paiement: String(paymentMethod).slice(0, 60) });
    }

    // Passe le devis à « Validé » (SENT) — idempotent : on ne revalide pas un devis déjà validé/traité
    const dejaValide = ['SENT', 'CONVERTED', 'APPROVED', 'REJECTED', 'CANCELLED'];
    if (!dejaValide.includes(quoteRequest.statut)) {
      await quoteRequest.update({ statut: 'SENT' });
    }

    // Notification client
    if (quoteRequest.utilisateur_id) {
      await Notification.create({
        utilisateur_destinataire_id: quoteRequest.utilisateur_id,
        type: 'QUOTE_APPROVED',
        titre: 'Commande validée !',
        message: `Votre commande ${quoteRequest.reference} a été confirmée. Le devis est validé, vous pouvez le retrouver dans « Mes devis ».`,
        lien: '/client/devis',
      });
    }

    // Notification aux administrateurs
    const managers = await User.findAll({
      where: { role: ['ADMIN', 'MANAGER'], est_actif: true },
      attributes: ['id'],
    });
    await Promise.all(managers.map((manager) => Notification.create({
      utilisateur_destinataire_id: manager.id,
      type: 'CART_VALIDATED',
      titre: 'Commande payée',
      message: `${quoteRequest.nom} a confirmé la commande ${quoteRequest.reference}. Devis validé automatiquement au paiement.`,
      lien: '/admin/quotes',
    })));

    // Réservation automatique si le devis concerne une location de véhicule
    try {
      const libelle = `${quoteRequest.titre || ''} ${quoteRequest.description || ''} ${quoteRequest.service || ''}`.toLowerCase();
      const concerneVehicule = /location|v[eé]hicule|voiture|chauffeur/.test(libelle);
      if (concerneVehicule && quoteRequest.client_id) {
        // Résoudre le VRAI véhicule : ID du snapshot du panier → nom → sinon
        // aucune réservation (jamais de fallback « premier véhicule actif »).
        const { resolveVehicleFromSnapshot } = require('../services/vehicle-resolve.service.cjs');
        const vehicle = await resolveVehicleFromSnapshot(quoteRequest.snapshot, libelle);

        const reservationRef = `RES-${quoteRequest.reference || Date.now()}`;
        const existing = await Reservation.findOne({ where: { reference: reservationRef } });
        if (!existing && vehicle) {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 3);
          await Reservation.create({
            client_id: quoteRequest.client_id,
            vehicule_id: vehicle.id,
            reference: reservationRef,
            commence_le: startDate,
            termine_le: endDate,
            statut: 'CONFIRMED',
            prix_journalier: vehicle.prix_journalier_particulier || 0,
            montant_total: Number(vehicle.prix_journalier_particulier || 0) * 3,
            avec_chauffeur: false,
            expire_le: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            note_gestionnaire: `Devis ${quoteRequest.reference} validé au paiement - ${quoteRequest.titre || ''}`.trim(),
          });
        }
      }
    } catch (resError) {
      console.error('Erreur création réservation auto:', resError.message);
    }

    response.status(200).json({ success: true, quoteRequest });
  } catch (error) {
    next(error);
  }
}

module.exports = { createQuoteRequest, getMyQuoteRequests, deleteQuoteRequest, confirmQuoteRequest, downloadQuotePdf };
