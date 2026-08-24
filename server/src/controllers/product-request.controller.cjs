const { Client, Company, Notification, ProductRequest, User } = require('../models/index.cjs');
const { sendProductRequestEmail } = require('../services/mail.service.cjs');

async function createProductRequest(request, response, next) {
  try {
    const client = await Client.findOne({ where: { utilisateur_id: request.auth.user.id }, include: [{ model: Company, as: 'entreprise' }] });
    if (!client) {
      const error = new Error('Un profil client est requis pour envoyer une demande.');
      error.statusCode = 403;
      throw error;
    }
    const productRequest = await ProductRequest.create({
      client_id: client.id,
      nom_produit: request.body.productName.trim(),
      categorie: request.body.category?.trim() || null,
      description: request.body.description?.trim() || null,
      quantite_souhaitee: request.body.desiredQuantity || null,
      commentaire: request.body.comment?.trim() || null,
    });
    const managers = await User.findAll({ where: { role: ['ADMIN', 'MANAGER'], est_actif: true }, attributes: ['id'] });
    await Promise.all(managers.map((manager) => Notification.create({
      utilisateur_destinataire_id: manager.id,
      type: 'PRODUCT_REQUEST_CREATED',
      titre: 'Nouvelle demande de produit',
      message: `${client.entreprise?.nom || `${client.prenom || ''} ${client.nom || ''}`.trim() || request.auth.user.email} recherche : ${productRequest.nom_produit}.`,
      lien: '/admin/product-requests',
    })));
    const requester = client.entreprise?.nom || `${client.prenom || ''} ${client.nom || ''}`.trim() || request.auth.user.email;
    const mail = await sendProductRequestEmail({ requester, productRequest }).catch((error) => ({ sent: false, reason: error.message }));
    response.status(201).json({ productRequest, emailSent: mail.sent });
  } catch (error) { next(error); }
}

module.exports = { createProductRequest };
