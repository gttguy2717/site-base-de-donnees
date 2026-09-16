const { Router } = require('express');
const { initializePayment, verifyCallback } = require('../controllers/payment.controller.cjs');

const paymentRouter = Router();

// Initialisation d'un paiement online (Genius Pay)
paymentRouter.post('/geniuspay/initialize', initializePayment);
// Callback reçu de Genius Pay pour confirmer un paiement
paymentRouter.post('/geniuspay/callback', verifyCallback);

module.exports = paymentRouter;