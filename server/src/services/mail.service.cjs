const nodemailer = require('nodemailer');
const environment = require('../config/environment.cjs');

function mailIsConfigured() {
  const { host, user, password, from, managerEmails } = environment.mail;
  return Boolean(host && user && password && from && managerEmails.length > 0);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: environment.mail.host,
    port: environment.mail.port,
    secure: environment.mail.secure,
    auth: { user: environment.mail.user, pass: environment.mail.password },
    // Augmente la fiabilité de la connexion SMTP
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });
}

// Objet expéditeur professionnel (améliore la délivrabilité dans Gmail)
function senderFrom() {
  return { name: 'SOUTARAH GROUP', address: environment.mail.from };
}

async function sendProductRequestEmail({ requester, productRequest }) {
  if (!mailIsConfigured()) return { sent: false, reason: 'SMTP non configuré' };
  const transporter = createTransporter();
  const subject = `📦 Nouvelle demande de produit — ${productRequest.productName}`;
  const textBody = [
    'NOUVELLE DEMANDE DE PRODUIT — SOUTARAH GROUP',
    '================================================',
    '',
    `Client : ${requester}`,
    `Produit : ${productRequest.productName}`,
    `Catégorie : ${productRequest.category || 'Non précisée'}`,
    `Quantité : ${productRequest.desiredQuantity || 'Non précisée'}`,
    `Description : ${productRequest.description || 'Non précisée'}`,
    `Commentaire : ${productRequest.comment || 'Non précisé'}`,
    '',
    '================================================',
    'Ceci est un email automatique depuis le site SOUTARAH GROUP.',
  ].join('\n');

  await transporter.sendMail({
    from: senderFrom(),
    to: environment.mail.managerEmails,
    replyTo: environment.mail.managerEmails[0],
    subject,
    text: textBody,
    headers: {
      'X-Mailer': 'SOUTARAH GROUP Notification System',
      'X-Priority': 'normal',
    },
  });
  return { sent: true };
}

async function sendCartNotificationEmail(data) {
  const {
    clientName,
    contact,
    itemType,
    details,
    productName,
    quantity,
    unitPrice,
    lineTotal,
    cartTotal,
    customerType,
    days,
    startDate,
    endDate,
    withDriver,
  } = data;

  if (!mailIsConfigured()) return { sent: false, reason: 'SMTP non configuré' };

  const transporter = createTransporter();
  const subject = itemType === 'vehicle'
    ? `🚗 Location ajoutée au panier — ${clientName}`
    : `🛒 Produit ajouté au panier — ${clientName}`;

  const price = (v) => v != null && !Number.isNaN(Number(v)) ? `${Number(v).toLocaleString('fr-FR')} FCFA` : '—';

  const lines = [
    'NOUVELLE ACTIVITÉ PANIER — SOUTARAH GROUP',
    '================================================',
    '',
    `Client : ${clientName || '—'}`,
    `Type de client : ${customerType || '—'}`,
    `Contact : ${contact || '—'}`,
    '',
    '--- DÉTAIL DE L\'AJOUT ---',
  ];

  if (itemType === 'vehicle') {
    lines.push(
      `Véhicule : ${details || '—'}`,
      `Dates : ${startDate || '—'} → ${endDate || '—'}`,
      `Durée : ${days || 1} jour(s)`,
      `Chauffeur : ${withDriver ? 'Oui' : 'Non'}`,
    );
  } else {
    lines.push(
      `Produit : ${productName || details || '—'}`,
      `Quantité : ${quantity || 1}`,
      `Prix unitaire : ${price(unitPrice)}`,
      `Total ligne : ${price(lineTotal)}`,
    );
  }

  lines.push(
    '',
    `TOTAL PANIER ACTUEL : ${price(cartTotal)}`,
    '',
    '================================================',
    'Ceci est un email automatique depuis le site SOUTARAH GROUP.',
  );

  const textBody = lines.join('\n');

  await transporter.sendMail({
    from: senderFrom(),
    to: environment.mail.managerEmails,
    replyTo: environment.mail.managerEmails[0],
    subject,
    text: textBody,
    headers: {
      'X-Mailer': 'SOUTARAH GROUP Notification System',
      'X-Priority': 'normal',
    },
  });
  return { sent: true };
}

async function sendNewAccountEmail({ client }) {
  if (!mailIsConfigured()) return { sent: false, reason: 'SMTP non configuré' };
  const transporter = createTransporter();

  const clientName = client.type_client === 'ENTREPRISE'
    ? (client.entreprise?.nom || client.prenom || '—')
    : [client.prenom, client.nom].filter(Boolean).join(' ') || '—';
  const typeLabel = client.type_client === 'PARTICULIER'
    ? 'Particulier'
    : client.type_client === 'ENTREPRISE'
      ? 'Entreprise'
      : 'Entreprise Client';

  const subject = `👤 Nouveau compte créé — ${clientName}`;
  const textBody = [
    'NOUVEAU COMPTE CLIENT — SOUTARAH GROUP',
    '================================================',
    '',
    `Nom : ${clientName}`,
    `Type de client : ${typeLabel}`,
    `Email : ${client.user?.email || client.email || '—'}`,
    `Téléphone : ${client.user?.telephone || '—'}`,
    `Adresse : ${client.adresse || 'Non précisée'}`,
    client.entreprise?.nom ? `Entreprise : ${client.entreprise.nom}` : '',
    client.entreprise?.nom_responsable ? `Responsable : ${client.entreprise.nom_responsable}` : '',
    client.entreprise?.numero_identification ? `RCCM : ${client.entreprise.numero_identification}` : '',
    '',
    '================================================',
    'Ceci est un email automatique depuis le site SOUTARAH GROUP.',
  ].filter(Boolean).join('\n');

  await transporter.sendMail({
    from: senderFrom(),
    to: environment.mail.managerEmails,
    replyTo: environment.mail.managerEmails[0],
    subject,
    text: textBody,
    headers: {
      'X-Mailer': 'SOUTARAH GROUP Notification System',
      'X-Priority': 'normal',
    },
  });
  return { sent: true };
}

async function sendReservationEmail({ reservation, vehicle, client, days }) {
  if (!mailIsConfigured()) return { sent: false, reason: 'SMTP non configuré' };
  const transporter = createTransporter();

  const clientName = [client?.prenom, client?.nom].filter(Boolean).join(' ') || client?.user?.email || 'Client';
  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  const subject = `🚗 Nouvelle réservation ${reservation.reference} — ${clientName}`;
  const textBody = [
    'NOUVELLE RÉSERVATION DE VÉHICULE — SOUTARAH GROUP',
    '================================================',
    '',
    `Référence : ${reservation.reference}`,
    `Client : ${clientName}`,
    `Contact : ${client?.user?.telephone || '—'} / ${client?.user?.email || '—'}`,
    vehicle ? `Véhicule : ${vehicle.marque} ${vehicle.modele}` : 'Véhicule : —',
    vehicle ? `Catégorie : ${vehicle.categorie}` : '',
    `Date début : ${formatDate(reservation.commence_le)}`,
    `Date fin : ${formatDate(reservation.termine_le)}`,
    `Durée : ${days || 1} jour(s)`,
    `Chauffeur : ${reservation.avec_chauffeur ? 'Oui' : 'Non'}`,
    `Prix journalier : ${Number(reservation.prix_journalier).toLocaleString('fr-FR')} FCFA`,
    `Montant total : ${Number(reservation.montant_total).toLocaleString('fr-FR')} FCFA`,
    reservation.note_gestionnaire ? `Notes : ${reservation.note_gestionnaire}` : '',
    'Statut : En attente de confirmation',
    '',
    '================================================',
    'Ceci est un email automatique depuis le site SOUTARAH GROUP.',
  ].filter(Boolean).join('\n');

  await transporter.sendMail({
    from: senderFrom(),
    to: environment.mail.managerEmails,
    replyTo: environment.mail.managerEmails[0],
    subject,
    text: textBody,
    headers: {
      'X-Mailer': 'SOUTARAH GROUP Notification System',
      'X-Priority': 'normal',
    },
  });
  return { sent: true };
}

async function sendQuoteRequestEmail({ quoteRequest }) {
  if (!mailIsConfigured()) return { sent: false, reason: 'SMTP non configure' };
  const transporter = createTransporter();

  // Formater la description en liste d'articles lisible
  const description = quoteRequest.description || '';
  const items = description
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

  const itemsBlock = items.length > 0
    ? items.map((item, i) => `   ${i + 1}. ${item}`).join('\n')
    : '   (Aucun article détaillé)';

  const budget = quoteRequest.budget
    ? (Number.isNaN(Number(quoteRequest.budget)) ? quoteRequest.budget : `${Number(quoteRequest.budget).toLocaleString('fr-FR')} FCFA`)
    : 'Non précisé';

  // Distinguer validation de panier client vs demande de devis classique
  const isPanierClient = quoteRequest.source === 'CLIENT' && quoteRequest.service === 'Panier client';
  const subject = isPanierClient
    ? `🛒 Panier validé — Articles ajoutés au panier — ${quoteRequest.nom || quoteRequest.name}`
    : `📋 Nouvelle demande de devis - ${quoteRequest.reference}`;
  const headerLine = isPanierClient
    ? 'VALIDATION DE PANIER CLIENT — SOUTARAH GROUP'
    : 'NOUVELLE DEMANDE DE DEVIS — SOUTARAH GROUP';
  const textBody = [
    headerLine,
    '================================================',
    '',
    `Référence : ${quoteRequest.reference}`,
    `Source : ${quoteRequest.source}`,
    `Nom : ${quoteRequest.nom || quoteRequest.name}`,
    `Téléphone : ${quoteRequest.telephone || quoteRequest.phone}`,
    `Email : ${quoteRequest.email}`,
    `Entreprise : ${quoteRequest.entreprise || quoteRequest.company || 'Non précisée'}`,
    `Localisation : ${quoteRequest.lieu || quoteRequest.location}`,
    `Service : ${quoteRequest.service}`,
    isPanierClient ? `Articles ajoutés au panier : ${quoteRequest.titre || ''}` : `Projet : ${quoteRequest.titre || quoteRequest.title}`,
    `Budget estimé : ${budget}`,
    `Délai : ${quoteRequest.delai || quoteRequest.timeline || 'Non précisé'}`,
    '',
    isPanierClient ? '--- PRODUITS AJOUTÉS AU PANIER ---' : '--- ARTICLES COMMANDÉS ---',
    itemsBlock,
    '',
    '================================================',
    'Ceci est un email automatique depuis le site SOUTARAH GROUP.',
  ].join('\n');

  await transporter.sendMail({
    from: senderFrom(),
    to: environment.mail.managerEmails,
    replyTo: environment.mail.managerEmails[0],
    subject,
    text: textBody,
    headers: {
      'X-Mailer': 'SOUTARAH GROUP Notification System',
      'X-Priority': 'normal',
    },
  });
  return { sent: true };
}

module.exports = { sendProductRequestEmail, sendCartNotificationEmail, sendQuoteRequestEmail, sendNewAccountEmail, sendReservationEmail };
