/* ------------------------------------------------------------------ *
 *  Service d'intégration Genius Pay (Côte d'Ivoire)                   *
 *  Point d'entrée : https://geniuspay.ci/api/v1/merchant              *
 *  Les clés sont lues depuis l'environnement (jamais côté frontend).  *
 * ------------------------------------------------------------------ */
const environment = require('../config/environment.cjs');

function configured() {
  const cfg = environment.geniusPay;
  return cfg.enabled && cfg.apiKey && cfg.merchantKey;
}

/**
 * Crée une transaction de paiement Genius Pay.
 * @param {Object} params
 * @param {number} params.amount     Montant en FCFA (XOF)
 * @param {string} params.reference  Référence de commande/devis
 * @param {string} params.currency   Devise (XOF par défaut)
 * @param {string} params.customerName
 * @param {string} params.customerPhone
 * @param {string} params.description
 * @returns {Promise<{ checkoutUrl: string, paymentToken: string, transactionId: string }>}
 */
async function createTransaction({ amount, reference, currency = 'XOF', customerName = '', customerPhone = '', description = '', channel = '' }) {
  if (!configured()) {
    const error = new Error('Genius Pay n’est pas configuré sur le serveur.');
    error.statusCode = 503;
    throw error;
  }

  const cfg = environment.geniusPay;

  // Corps standard des passerelles de paiement CI (Genius Pay)
  const body = {
    amount: Number(amount),
    currency,
    reference,
    description: description || `Commande SOUTARAH ${reference}`,
    customer: {
      name: customerName,
      phone: customerPhone,
    },
    channel: channel || undefined,
    callback_url: cfg.callbackUrl,
    return_url: cfg.returnUrl,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  // curl.exe plutôt que fetch natif : sur certains réseaux Windows, undici
  // (fetch Node) échoue en timeout vers geniuspay.ci alors que curl passe.
  const { execFile } = require('node:child_process');
  // Windows : curl.exe (fetch/undici en timeout sur certains réseaux Windows)
  // Linux (production Hostinger) : curl standard
  const curlBin = process.platform === 'win32' ? 'curl.exe' : 'curl';
  const curlArgs = [
    '-s', '-m', '25', '-X', 'POST', `${cfg.baseUrl}/payments`,
    '-H', 'Content-Type: application/json',
    '-H', `X-Api-Key: ${cfg.apiKey}`,
    '-H', `X-Merchant-Key: ${cfg.merchantKey}`,
    '-d', JSON.stringify(body),
  ];

  let rawText;
  try {
    rawText = await new Promise((resolve, reject) => {
      execFile(curlBin, curlArgs, { timeout: 28000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
        if (err) return reject(new Error(`Impossible de joindre Genius Pay : ${stderr || err.message}`));
        resolve(String(stdout || ''));
      });
    });
  } catch (e) {
    clearTimeout(timeout);
    const error = new Error(e.message);
    error.statusCode = 502;
    throw error;
  }
  clearTimeout(timeout);

  let data;
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch (e) {
    data = {};
  }

  const apiError =
    data?.error?.message || data?.error?.code || data?.message || null;
  if (apiError || data?.success === false) {
    const error = new Error(
      typeof apiError === 'string' ? apiError : `Genius Pay a retourné une erreur (${JSON.stringify(apiError).slice(0, 200)})`
    );
    error.statusCode = 502;
    error.raw = data;
    throw error;
  }

  // Différentes formes de réponse selon la version de l'API
  const checkoutUrl =
    data.checkout_url ||
    data.checkoutUrl ||
    data.redirect_url ||
    data.payment_url ||
    data.paymentUrl ||
    (data.payment_token ? `${cfg.baseUrl}/payment/${data.payment_token}` : null);

  return {
    checkoutUrl,
    paymentToken: data.payment_token || data.paymentToken || data.token || null,
    transactionId: data.transaction_id || data.transactionId || data.id || null,
    raw: data,
  };
}

module.exports = { createTransaction, configured };