const { getCartForUser, addProductToCart, updateCartItem, removeCartItem, clearCart } = require('../services/cart.service.cjs');
const { Cart, CartItem, Client, Company, Product, Vehicle, User, QuoteRequest, Notification } = require('../models/index.cjs');
const { Op } = require('sequelize');
const { sendQuoteRequestEmail, sendCartNotificationEmail } = require('../services/mail.service.cjs');

function makeRef() {
  return `DMD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}
async function buildUniqueRef() {
  for (let i = 0; i < 5; i++) {
    const ref = makeRef();
    if (!await QuoteRequest.findOne({ where: { reference: ref }, attributes: ['id'] })) return ref;
  }
  return `DMD-${Date.now()}`;
}

async function getCart(request, response, next) {
  try { response.json({ cart: await getCartForUser(request.auth.user.id) }); } catch (error) { next(error); }
}

async function addProduct(request, response, next) {
  try {
    const cart = await addProductToCart(request.auth.user.id, request.body.productId, request.body.quantity);

    // Envoyer un email de notification admin à l'ajout d'un produit au panier
    try {
      const { getProductPrice } = require('../services/pricing.service.cjs');
      const user = await User.findByPk(request.auth.user.id);
      const client = await Client.findOne({ where: { utilisateur_id: request.auth.user.id } });
      const company = client ? await Company.findOne({ where: { client_id: client.id } }) : null;
      const product = await Product.findByPk(request.body.productId);
      const clientName = [client?.prenom, client?.nom].filter(Boolean).join(' ').trim() || user?.email || 'Client';
      const contact = `${user?.telephone || 'N/A'} / ${user?.email || 'N/A'}`;
      const quantity = Number(request.body.quantity || 1);
      const unitPrice = client ? await getProductPrice(product?.id, client.type_client, company?.id || null) : null;
      const lineTotal = unitPrice != null ? unitPrice * quantity : null;
      const cartTotal = cart?.total || 0;
      const details = `"${product?.nom || 'Produit'}" x${quantity}`;

      const mail = await sendCartNotificationEmail({
        clientName,
        contact,
        customerType: client?.type_client || 'N/A',
        itemType: 'product',
        details,
        productName: product?.nom || 'Produit',
        quantity,
        unitPrice,
        lineTotal,
        cartTotal,
      });
      console.log(`✅ Email ajout panier envoyé à ${mail.sent ? 'managers' : 'N/A'}`);
    } catch (mailError) {
      console.error('❌ Erreur envoi email ajout panier:', mailError.message);
    }

    response.status(201).json({ cart });
  } catch (error) { next(error); }
}

async function updateItem(request, response, next) {
  try { response.json({ cart: await updateCartItem(request.auth.user.id, request.params.itemId, request.body.quantity) }); } catch (error) { next(error); }
}

async function removeItem(request, response, next) {
  try { response.json({ cart: await removeCartItem(request.auth.user.id, request.params.itemId) }); } catch (error) { next(error); }
}

async function clearCartHandler(request, response, next) {
  try { response.json({ cart: await clearCart(request.auth.user.id) }); } catch (error) { next(error); }
}

async function notifyVehicleAdded(request, response, next) {
  try {
    const userId = request.auth.user.id;
    const { vehicleName, startDate, endDate, days, withDriver } = request.body || {};

    // Vérifier si le véhicule est déjà réservé sur la période demandée
    if (vehicleName && startDate && endDate) {
      const { Vehicle, Reservation } = require('../models/index.cjs');
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
              message: `Ce véhicule est déjà réservé sur cette période. Choisissez une autre période ou un autre véhicule.`,
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

    // Envoyer un email de notification admin à l'ajout d'une location au panier
    try {
      const { getVehicleDailyPrice } = require('../services/pricing.service.cjs');
      const company = client ? await Company.findOne({ where: { client_id: client.id } }) : null;
      const vehicle = vehicleName ? await Vehicle.findOne({ where: { [Op.or]: [{ marque: vehicleName }, { modele: vehicleName }, { marque: { [Op.like]: `%${vehicleName.split(' ')[0] || ''}%` } }] } }) : null;
      const unitPrice = vehicle && client ? await getVehicleDailyPrice(vehicle, client.type_client, company?.id || null) : null;
      const duration = Number(days || 1);
      const lineTotal = unitPrice != null ? unitPrice * duration : null;
      const cartTotal = 0; // Le panier de location est géré côté localStorage — estimé avec la ligne
      
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

async function validateCartHandler(request, response, next) {
  try {
    const userId = request.auth.user.id;
    const userRecord = request.auth.user; // User complet depuis middleware
    const userEmail = userRecord.email;
    const clientRec = await Client.findOne({ where: { utilisateur_id: userId } });
    if (!clientRec) return response.status(403).json({ error: 'Profil client requis.' });
    const companyRec = await Company.findOne({ where: { client_id: clientRec.id } });

    // Récupérer les articles du panier actif
    const cart = await Cart.findOne({
      where: { client_id: clientRec.id, statut: 'ACTIVE' },
      include: [{ model: CartItem, as: 'articles', include: [{ model: Product, as: 'produit' }, { model: Vehicle, as: 'vehicule' }] }],
    });
    const items = cart?.articles || [];
    const vehicleItems = Array.isArray(request.body.vehicleItems) ? request.body.vehicleItems : [];
    const allItemsCount = items.length + vehicleItems.length;
    if (allItemsCount === 0) return response.status(422).json({ error: { message: 'Panier vide. Ajoutez des articles avant de valider.' } });

    // Construire la description
    const productLines = items.map(i => `${i.produit?.nom || 'Article'} x${Number(i.quantite)}`);
    const vehicleLines = vehicleItems.map(v => `Location ${v.vehicleName || 'Vehicule'} (${v.duration || v.days || 1}j)`);
    const description = [...productLines, ...vehicleLines].join(' | ');

    // Calculer le budget estimé (total du panier)
    const { getProductPrice, getVehicleDailyPrice } = require('../services/pricing.service.cjs');
    let estimatedBudget = 0;
    for (const item of items) {
      if (item.produit) {
        const price = await getProductPrice(item.produit_id, clientRec.type_client, companyRec?.id || null);
        if (price != null) estimatedBudget += Number(price) * Number(item.quantite);
      }
      if (item.vehicule) {
        const price = await getVehicleDailyPrice(item.vehicule, clientRec.type_client, companyRec?.id || null);
        const duration = Math.max(1, Math.ceil((new Date(item.termine_le) - new Date(item.commence_le)) / 86400000));
        if (price != null) estimatedBudget += Number(price) * duration;
      }
    }
    for (const v of vehicleItems) {
      const duration = Number(v.days || v.duration || 1);
      const price = Number(v.unitPrice || v.pricePerDay || 0);
      estimatedBudget += price * duration;
    }

    const reference = await buildUniqueRef();

    // phone : User.telephone > body.phone > N/A
    const telephone = userRecord.telephone || request.body.phone || 'N/A';
    // name : client prenom+nom > email
    const name = [clientRec.prenom, clientRec.nom].filter(Boolean).join(' ').trim() || userEmail;
    // location : adresse client > defaut
    const location = (clientRec.adresse || '').trim() || 'Abidjan';
    // titre ASCII uniquement
    const title = `Devis panier - ${reference}`;

    const quoteRequest = await QuoteRequest.create({
      reference,
      client_id: clientRec.id,
      utilisateur_id: userId,
      source: 'CLIENT',
      service: 'Panier client',
      titre: title,
      description: description.slice(0, 3000) || null,
      nom: name.slice(0, 180),
      email: userEmail,
      telephone: telephone.slice(0, 32),
      lieu: location.slice(0, 180),
      budget: estimatedBudget > 0 ? String(estimatedBudget) : null,
      statut: 'PENDING',
    });

    // Notification pour le client
    await Notification.create({
      utilisateur_destinataire_id: userId,
      type: 'CART_VALIDATED',
      titre: 'Panier validé - Devis en cours',
      message: `Votre devis ${reference} a été créé avec succès. Un conseiller SOUTARAH vous contactera sous peu.`,
      lien: '/client/devis',
    });

    // Notifications pour les managers/admins
    const managers = await User.findAll({ where: { role: ['ADMIN', 'MANAGER'], est_actif: true }, attributes: ['id'] });
    await Promise.all(managers.map(m => Notification.create({
      utilisateur_destinataire_id: m.id,
      type: 'QUOTE_REQUEST_CREATED',
      titre: 'Nouveau devis panier client',
      message: `Un client a validé son panier. Référence : ${reference}.`,
      lien: '/admin/quotes',
    })));

    // Envoyer l'email de notification aux managers (vérifié même avec des véhicules)
    try {
      const mail = await sendQuoteRequestEmail({ quoteRequest });
      console.log(`✅ Email devis panier envoyé à ${mail.sent ? 'managers' : 'N/A (SMTP non configuré)'} — Réf ${reference}`);
    } catch (mailError) {
      console.error('❌ Erreur envoi email devis panier:', mailError.message);
    }

    response.status(201).json({ quoteRequest });
  } catch (error) {
    console.error('[validateCartHandler] Erreur:', error.message, error.errors?.map(e => e.message));
    next(error);
  }
}

module.exports = { getCart, addProduct, updateItem, removeItem, clearCartHandler, validateCartHandler, notifyVehicleAdded };
