const { Cart, CartItem, Client, Company, Product, Vehicle, Category, User, Notification } = require('../models/index.cjs');
const { getProductPrice, getVehicleDailyPrice } = require('./pricing.service.cjs');

async function requireClient(utilisateur_id) {
  const client = await Client.findOne({ where: { utilisateur_id } });
  if (!client) {
    const error = new Error('Un profil client est requis pour utiliser le panier.');
    error.statusCode = 403;
    throw error;
  }
  return client;
}

async function activeCartFor(client_id) {
  const [cart] = await Cart.findOrCreate({ where: { client_id, statut: 'ACTIVE' }, defaults: { client_id, statut: 'ACTIVE' } });
  return cart;
}

async function serializeCart(cart, type_client, entreprise_id = null) {
  const items = await CartItem.findAll({
    where: { panier_id: cart.id },
    include: [
      { model: Product, as: 'produit', include: [{ model: Category, as: 'categorie' }] },
      { model: Vehicle, as: 'vehicule' },
    ],
    order: [['cree_le', 'DESC']],
  });

  const serializedItems = await Promise.all(items.map(async (item) => {
    const source = item.toJSON();
    let prix_unitaire = Number(item.prix_unitaire);
    let total = prix_unitaire * Number(item.quantite);

    if (item.produit) {
      prix_unitaire = Number(await getProductPrice(item.produit_id, type_client, entreprise_id));
      total = prix_unitaire * Number(item.quantite);
    }

    if (item.vehicule) {
      prix_unitaire = Number(await getVehicleDailyPrice(item.vehicule, type_client, entreprise_id));
      const duration = Math.max(1, Math.ceil((new Date(item.termine_le) - new Date(item.commence_le)) / 86400000));
      total = prix_unitaire * duration;
      source.days = duration;
    }

    return { ...source, prix_unitaire, total };
  }));

  return {
    id: cart.id,
    statut: cart.statut,
    items: serializedItems,
    itemCount: serializedItems.length,
    total: serializedItems.reduce((sum, item) => sum + item.total, 0),
  };
}

async function getCartForUser(utilisateur_id) {
  const client = await requireClient(utilisateur_id);
  const company = await Company.findOne({ where: { client_id: client.id } });
  const cart = await activeCartFor(client.id);
  return serializeCart(cart, client.type_client, company?.id || null);
}

async function addProductToCart(utilisateur_id, produit_id, quantite) {
  const client = await requireClient(utilisateur_id);
  const product = await Product.findOne({ where: { id: produit_id, statut: 'ACTIVE' } });
  if (!product) {
    const error = new Error('Produit introuvable ou indisponible.');
    error.statusCode = 404;
    throw error;
  }

  const amount = Number(quantite);
  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error('La quantité doit être supérieure à zéro.');
    error.statusCode = 422;
    throw error;
  }

  const cart = await activeCartFor(client.id);
  const currentItem = await CartItem.findOne({ where: { panier_id: cart.id, produit_id, vehicule_id: null } });
  const nextQuantity = amount + Number(currentItem?.quantite || 0);
  if (nextQuantity > Number(product.stock)) {
    const error = new Error('La quantité demandée dépasse le stock disponible.');
    error.statusCode = 422;
    throw error;
  }

  const company = await Company.findOne({ where: { client_id: client.id } });
  const prix_unitaire = await getProductPrice(product.id, client.type_client, company?.id || null);
  if (prix_unitaire === null) {
    const error = new Error('Aucun tarif n’est configuré pour ce type de client.');
    error.statusCode = 422;
    throw error;
  }
  if (currentItem) {
    await currentItem.update({ quantite: nextQuantity, prix_unitaire });
    
    // Notification aussi lors de l'augmentation de quantité
    try {
      const { Op } = require('sequelize');
      const user = await User.findByPk(client.utilisateur_id);
      const clientName = [client.prenom, client.nom].filter(Boolean).join(' ') || user?.email || 'Client';
      const admins = await User.findAll({
        where: { 
          role: { [Op.in]: ['ADMIN', 'MANAGER'] },
          est_actif: true 
        },
        attributes: ['id'],
      });

      console.log(`🛒 Envoi notifications modification panier à ${admins.length} admin(s)...`);

      const notificationPromises = admins.map(admin =>
        Notification.create({
          utilisateur_destinataire_id: admin.id,
          type: 'CART_ITEM_ADDED',
          titre: `Panier mis à jour`,
          message: `${clientName} a modifié la quantité de "${product.nom}" (maintenant x${nextQuantity}). Contact: ${user?.telephone || 'N/A'} / ${user?.email || 'N/A'}`,
          lien: `/admin/clients`,
          est_lu: false,
        })
      );

      await Promise.all(notificationPromises);
      console.log(`✅ ${admins.length} notification(s) modification panier envoyée(s)`);
    } catch (notifError) {
      console.error('❌ Erreur notification admin panier:', notifError);
    }
  } else {
    await CartItem.create({ panier_id: cart.id, produit_id: product.id, quantite: amount, prix_unitaire });
    
    // Notification immédiate pour les admins
    try {
      const { Op } = require('sequelize');
      const user = await User.findByPk(client.utilisateur_id);
      const clientName = [client.prenom, client.nom].filter(Boolean).join(' ') || user?.email || 'Client';
      const admins = await User.findAll({
        where: { 
          role: { [Op.in]: ['ADMIN', 'MANAGER'] },
          est_actif: true 
        },
        attributes: ['id'],
      });

      console.log(`🛒 Envoi notifications panier à ${admins.length} admin(s)...`);

      const notificationPromises = admins.map(admin =>
        Notification.create({
          utilisateur_destinataire_id: admin.id,
          type: 'CART_ITEM_ADDED',
          titre: `Article ajouté au panier`,
          message: `${clientName} a ajouté "${product.nom}" (x${amount}) à son panier. Contact: ${user?.telephone || 'N/A'} / ${user?.email || 'N/A'}`,
          lien: `/admin/clients`,
          est_lu: false,
        })
      );

      await Promise.all(notificationPromises);
      console.log(`✅ ${admins.length} notification(s) panier envoyée(s)`);
    } catch (notifError) {
      console.error('❌ Erreur notification admin panier:', notifError);
    }
  }
  return getCartForUser(utilisateur_id);
}

async function updateCartItem(utilisateur_id, itemId, quantite) {
  const client = await requireClient(utilisateur_id);
  const cart = await activeCartFor(client.id);
  const item = await CartItem.findOne({ where: { id: itemId, panier_id: cart.id }, include: [{ model: Product, as: 'produit' }] });
  if (!item) {
    const error = new Error('Article du panier introuvable.');
    error.statusCode = 404;
    throw error;
  }

  const amount = Number(quantite);
  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error('La quantité doit être supérieure à zéro.');
    error.statusCode = 422;
    throw error;
  }
  if (item.produit && amount > Number(item.produit.stock)) {
    const error = new Error('La quantité demandée dépasse le stock disponible.');
    error.statusCode = 422;
    throw error;
  }

  const company = await Company.findOne({ where: { client_id: client.id } });
  const prix_unitaire = item.produit ? await getProductPrice(item.produit_id, client.type_client, company?.id || null) : item.prix_unitaire;
  await item.update({ quantite: amount, prix_unitaire });
  return getCartForUser(utilisateur_id);
}

async function removeCartItem(utilisateur_id, itemId) {
  const client = await requireClient(utilisateur_id);
  const cart = await activeCartFor(client.id);
  const item = await CartItem.findOne({ where: { id: itemId, panier_id: cart.id } });
  if (!item) {
    const error = new Error('Article du panier introuvable.');
    error.statusCode = 404;
    throw error;
  }
  await item.destroy();
  return getCartForUser(utilisateur_id);
}

async function clearCart(utilisateur_id) {
  const client = await requireClient(utilisateur_id);
  const cart = await activeCartFor(client.id);
  await CartItem.destroy({ where: { panier_id: cart.id } });
  return getCartForUser(utilisateur_id);
}

module.exports = { getCartForUser, addProductToCart, updateCartItem, removeCartItem, clearCart };
