const { createTransaction, configured } = require('../services/geniuspay.service.cjs');
const environment = require('../config/environment.cjs');
const { QuoteRequest, Notification, User, Op } = require('../models/index.cjs');

// Initialisation d'un paiement Genius Pay pour une commande
async function initializePayment(request, response, next) {
  try {
    const { amount, reference, description, customerName, customerPhone, channel } = request.body;

    if (!amount || !reference) {
      return response.status(400).json({ message: 'Montant et référence requis.' });
    }

    if (!configured()) {
      return response.status(503).json({
        message: 'Genius Pay n’est pas configuré sur le serveur. Le paiement en ligne est indisponible.',
        disabled: true,
      });
    }

    const result = await createTransaction({
      amount,
      reference,
      currency: 'XOF',
      description,
      customerName,
      customerPhone,
      channel,
    });

    if (!result.checkoutUrl) {
      return response.status(502).json({ message: 'Genius Pay n’a pas retourné d’URL de paiement.', raw: result.raw });
    }

    response.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      paymentToken: result.paymentToken,
      transactionId: result.transactionId,
    });
  } catch (error) {
    next(error);
  }
}

// Vérification / confirmation d'un paiement via callback
async function verifyCallback(request, response, next) {
  try {
    const { reference, status, transaction_id } = request.body || {};
    if (!reference) {
      return response.status(400).json({ message: 'Référence requise.' });
    }

    if (status === 'SUCCESS' || status === 'COMPLETED' || status === 'PAID' || status?.toUpperCase() === 'SUCCESS') {
      // Marquer la demande de devis correspondante comme traitée
      try {
        await QuoteRequest.update({ statut: 'SENT' }, { where: { reference } });
      } catch (e) { console.error('GeniusPay update quote:', e.message); }
    }

    const notifPayload = {
      type: status === 'SUCCESS' || status?.toUpperCase() === 'SUCCESS' ? 'CART_VALIDATED' : 'QUOTE_REQUEST_CREATED',
      titre: status === 'SUCCESS' || status?.toUpperCase() === 'SUCCESS' ? 'Paiement confirmé' : 'Paiement en attente',
      message: `Commande ${reference} : paiement ${status === 'SUCCESS' || status?.toUpperCase() === 'SUCCESS' ? 'confirmé' : 'reçu'} (transaction ${transaction_id || '—'}).`,
      lien: '/client',
      est_lu: false,
    };
    try {
      const user = await User.findOne({ where: { role: 'ADMIN', est_actif: true }, attributes: ['id'] });
      if (user) await Notification.create({ utilisateur_destinataire_id: user.id, ...notifPayload });
    } catch (e) { console.error('GeniusPay notif:', e.message); }

    response.json({ success: true });
  } catch (error) {
    next(error);
  }
}

module.exports = { initializePayment, verifyCallback };