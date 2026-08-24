const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize.cjs');

const id = { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true };
const timestamps = { 
  freezeTableName: true, 
  timestamps: true,
  createdAt: 'cree_le',
  updatedAt: 'mis_a_jour_le'
};
const tableNames = {
  User: 'utilisateurs', Client: 'clients', Company: 'entreprises', Category: 'categories', Product: 'produits',
  Tariff: 'tarifs', Vehicle: 'vehicules', Cart: 'paniers', CartItem: 'articles_panier', Quote: 'devis',
  QuoteItem: 'articles_devis', QuoteRequest: 'demandes_devis', Reservation: 'reservations', Notification: 'notifications',
  Promotion: 'promotions', ProductRequest: 'demandes_produits', VehicleRequest: 'demandes_vehicules', StockMovement: 'mouvements_stock',
  Setting: 'parametres', VehicleCompanyPrice: 'vehicule_prix_entreprises',
};
const define = (name, attributes) => sequelize.define(name, attributes, { ...timestamps, tableName: tableNames[name] });

const User = define('User', {
  id,
  email: { type: DataTypes.STRING(254), allowNull: false, unique: true, validate: { isEmail: true } },
  telephone: { type: DataTypes.STRING(32), unique: true, field: 'telephone' },
  mot_de_passe_hash: { type: DataTypes.STRING, allowNull: false, field: 'mot_de_passe_hash' },
  role: { type: DataTypes.ENUM('ADMIN', 'MANAGER', 'CLIENT'), allowNull: false, defaultValue: 'CLIENT' },
  est_actif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'est_actif' },
  avatar_url: { type: DataTypes.STRING, allowNull: true, field: 'avatar_url' },
  derniere_connexion_au: { type: DataTypes.DATE, field: 'derniere_connexion_au' },
}, timestamps);

const Client = define('Client', {
  id,
  utilisateur_id: { type: DataTypes.UUID, allowNull: false, unique: true, field: 'utilisateur_id' },
  type_client: { type: DataTypes.ENUM('PARTICULIER', 'ENTREPRISE', 'ENTREPRISE_CLIENT', 'PARTENAIRE', 'GROSSISTE'), allowNull: false, field: 'type_client' },
  prenom: { type: DataTypes.STRING(100), field: 'prenom' },
  nom: { type: DataTypes.STRING(100), field: 'nom' },
  adresse: { type: DataTypes.TEXT, field: 'adresse' },
  delai_blocage_jours: { type: DataTypes.INTEGER, allowNull: true, field: 'delai_blocage_jours' },
  bloque_le: { type: DataTypes.DATE, allowNull: true, field: 'bloque_le' },
}, timestamps);

const Company = define('Company', {
  id,
  client_id: { type: DataTypes.UUID, allowNull: false, unique: true, field: 'client_id' },
  nom: { type: DataTypes.STRING(180), allowNull: false, field: 'nom' },
  nom_responsable: { type: DataTypes.STRING(180), allowNull: true, field: 'nom_responsable' },
  numero_identification: { type: DataTypes.STRING(100), field: 'numero_identification' },
}, timestamps);

const Category = define('Category', {
  id,
  nom: { type: DataTypes.STRING(150), allowNull: false, unique: true, field: 'nom' },
  slug: { type: DataTypes.STRING(180), allowNull: false, unique: true, field: 'slug' },
  description: { type: DataTypes.TEXT, field: 'description' },
  parent_id: { type: DataTypes.UUID, field: 'parent_id' },
  est_actif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'est_actif' },
}, timestamps);

const Product = define('Product', {
  id,
  categorie_id: { type: DataTypes.UUID, field: 'categorie_id' },
  nom: { type: DataTypes.STRING(180), allowNull: false, field: 'nom' },
  reference: { type: DataTypes.STRING(100), allowNull: false, unique: true, field: 'reference' },
  description: { type: DataTypes.TEXT, field: 'description' },
  image_url: { type: DataTypes.STRING, field: 'image_url' },
  unite: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'unité', field: 'unite' },
  stock: { type: DataTypes.DECIMAL(14, 3), allowNull: false, defaultValue: 0, field: 'stock' },
  seuil_alerte: { type: DataTypes.DECIMAL(14, 3), allowNull: false, defaultValue: 0, field: 'seuil_alerte' },
  statut: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE'), allowNull: false, defaultValue: 'ACTIVE', field: 'statut' },
}, timestamps);

const Tariff = define('Tariff', {
  id,
  produit_id: { type: DataTypes.UUID, allowNull: false, field: 'produit_id' },
  type_client: { type: DataTypes.ENUM('PARTICULIER', 'ENTREPRISE', 'ENTREPRISE_CLIENT', 'PARTENAIRE', 'GROSSISTE'), allowNull: false, field: 'type_client' },
  entreprise_id: { type: DataTypes.UUID, allowNull: true, field: 'entreprise_id' },
  prix: { type: DataTypes.DECIMAL(14, 2), allowNull: false, validate: { min: 0 }, field: 'prix' },
}, timestamps);

const VehicleCompanyPrice = define('VehicleCompanyPrice', {
  id,
  vehicule_id: { type: DataTypes.UUID, allowNull: false, field: 'vehicule_id' },
  entreprise_id: { type: DataTypes.UUID, allowNull: false, field: 'entreprise_id' },
  prix_journalier: { type: DataTypes.DECIMAL(14, 2), allowNull: false, validate: { min: 0 }, field: 'prix_journalier' },
}, timestamps);

const Vehicle = define('Vehicle', {
  id,
  marque: { type: DataTypes.STRING(100), allowNull: false, field: 'marque' },
  modele: { type: DataTypes.STRING(100), allowNull: false, field: 'modele' },
  categorie: { type: DataTypes.STRING(100), allowNull: false, field: 'categorie' },
  description: { type: DataTypes.TEXT, field: 'description' },
  image_url: { type: DataTypes.STRING, field: 'image_url' },
  places: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 }, field: 'places' },
  carburant: { type: DataTypes.STRING(60), field: 'carburant' },
  transmission: { type: DataTypes.STRING(60), field: 'transmission' },
  prix_journalier_particulier: { type: DataTypes.DECIMAL(14, 2), allowNull: false, validate: { min: 0 }, field: 'prix_journalier_particulier' },
  prix_journalier_entreprise: { type: DataTypes.DECIMAL(14, 2), allowNull: false, validate: { min: 0 }, field: 'prix_journalier_entreprise' },
  prix_journalier_entreprise_client: { type: DataTypes.DECIMAL(14, 2), allowNull: true, validate: { min: 0 }, field: 'prix_journalier_entreprise_client' },
  disponibilite: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'disponibilite' },
  statut: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE'), allowNull: false, defaultValue: 'ACTIVE', field: 'statut' },
}, timestamps);

const Cart = define('Cart', {
  id,
  client_id: { type: DataTypes.UUID, allowNull: false, field: 'client_id' },
  statut: { type: DataTypes.ENUM('ACTIVE', 'CONVERTED', 'ABANDONED'), allowNull: false, defaultValue: 'ACTIVE', field: 'statut' },
}, timestamps);

const CartItem = define('CartItem', {
  id,
  panier_id: { type: DataTypes.UUID, allowNull: false, field: 'panier_id' },
  produit_id: { type: DataTypes.UUID, field: 'produit_id' },
  vehicule_id: { type: DataTypes.UUID, field: 'vehicule_id' },
  quantite: { type: DataTypes.DECIMAL(14, 3), allowNull: false, defaultValue: 1, validate: { min: 0.001 }, field: 'quantite' },
  prix_unitaire: { type: DataTypes.DECIMAL(14, 2), allowNull: false, validate: { min: 0 }, field: 'prix_unitaire' },
  commence_le: { type: DataTypes.DATE, field: 'commence_le' },
  termine_le: { type: DataTypes.DATE, field: 'termine_le' },
}, timestamps);

const Quote = define('Quote', {
  id,
  client_id: { type: DataTypes.UUID, allowNull: false, field: 'client_id' },
  numero: { type: DataTypes.STRING(40), allowNull: false, unique: true, field: 'numero' },
  statut: { type: DataTypes.ENUM('DRAFT', 'ISSUED', 'ACCEPTED', 'REJECTED', 'EXPIRED'), allowNull: false, defaultValue: 'ISSUED', field: 'statut' },
  montant_total: { type: DataTypes.DECIMAL(14, 2), allowNull: false, field: 'montant_total' },
  valide_jusqu_au: { type: DataTypes.DATEONLY, allowNull: false, field: 'valide_jusqu_au' },
  chemin_pdf: { type: DataTypes.STRING, field: 'chemin_pdf' },
  conditions: { type: DataTypes.TEXT, field: 'conditions' },
}, timestamps);

const QuoteItem = define('QuoteItem', {
  id,
  devis_id: { type: DataTypes.UUID, allowNull: false, field: 'devis_id' },
  produit_id: { type: DataTypes.UUID, field: 'produit_id' },
  libelle: { type: DataTypes.STRING(255), allowNull: false, field: 'libelle' },
  quantite: { type: DataTypes.DECIMAL(14, 3), allowNull: false, field: 'quantite' },
  prix_unitaire: { type: DataTypes.DECIMAL(14, 2), allowNull: false, field: 'prix_unitaire' },
  prix_total: { type: DataTypes.DECIMAL(14, 2), allowNull: false, field: 'prix_total' },
}, timestamps);

const QuoteRequest = define('QuoteRequest', {
  id,
  reference: { type: DataTypes.STRING(40), allowNull: false, unique: true, field: 'reference' },
  client_id: { type: DataTypes.UUID, field: 'client_id' },
  utilisateur_id: { type: DataTypes.UUID, field: 'utilisateur_id' },
  source: { type: DataTypes.ENUM('GUEST', 'CLIENT'), allowNull: false, defaultValue: 'GUEST', field: 'source' },
  service: { type: DataTypes.STRING(80), allowNull: false, field: 'service' },
  titre: { type: DataTypes.STRING(180), allowNull: false, field: 'titre' },
  budget: { type: DataTypes.STRING(80), field: 'budget' },
  delai: { type: DataTypes.STRING(80), field: 'delai' },
  description: { type: DataTypes.TEXT, field: 'description' },
  entreprise: { type: DataTypes.STRING(180), field: 'entreprise' },
  nom: { type: DataTypes.STRING(180), allowNull: false, field: 'nom' },
  email: { type: DataTypes.STRING(254), allowNull: false, validate: { isEmail: true }, field: 'email' },
  telephone: { type: DataTypes.STRING(32), allowNull: false, field: 'telephone' },
  lieu: { type: DataTypes.STRING(180), allowNull: false, field: 'lieu' },
  fichier_devis_url: { type: DataTypes.STRING, field: 'fichier_devis_url' },
  statut: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'PENDING', field: 'statut' },
}, timestamps);

const Reservation = define('Reservation', {
  id,
  client_id: { type: DataTypes.UUID, allowNull: false, field: 'client_id' },
  vehicule_id: { type: DataTypes.UUID, allowNull: false, field: 'vehicule_id' },
  reference: { type: DataTypes.STRING(40), allowNull: false, unique: true, field: 'reference' },
  commence_le: { type: DataTypes.DATE, allowNull: false, field: 'commence_le' },
  termine_le: { type: DataTypes.DATE, allowNull: false, field: 'termine_le' },
  statut: { type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'REJECTED', 'EXPIRED', 'CANCELLED'), allowNull: false, defaultValue: 'PENDING', field: 'statut' },
  prix_journalier: { type: DataTypes.DECIMAL(14, 2), allowNull: false, field: 'prix_journalier' },
  montant_total: { type: DataTypes.DECIMAL(14, 2), allowNull: false, field: 'montant_total' },
  avec_chauffeur: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'avec_chauffeur' },
  expire_le: { type: DataTypes.DATE, allowNull: false, field: 'expire_le' },
  note_gestionnaire: { type: DataTypes.TEXT, field: 'note_gestionnaire' },
}, timestamps);

const Notification = define('Notification', {
  id,
  utilisateur_destinataire_id: { type: DataTypes.UUID, field: 'utilisateur_destinataire_id' },
  type: { type: DataTypes.STRING(80), allowNull: false, field: 'type' },
  titre: { type: DataTypes.STRING(180), allowNull: false, field: 'titre' },
  message: { type: DataTypes.TEXT, allowNull: false, field: 'message' },
  lien: { type: DataTypes.STRING, field: 'lien' },
  est_lu: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'est_lu' },
  lu_le: { type: DataTypes.DATE, field: 'lu_le' },
}, timestamps);

const Promotion = define('Promotion', {
  id,
  produit_id: { type: DataTypes.UUID, field: 'produit_id' },
  vehicule_id: { type: DataTypes.UUID, field: 'vehicule_id' },
  titre: { type: DataTypes.STRING(180), allowNull: false, field: 'titre' },
  description: { type: DataTypes.TEXT, field: 'description' },
  image_url: { type: DataTypes.STRING, field: 'image_url' },
  prix_normal: { type: DataTypes.DECIMAL(14, 2), field: 'prix_normal' },
  prix_promotionnel: { type: DataTypes.DECIMAL(14, 2), allowNull: false, field: 'prix_promotionnel' },
  commence_le: { type: DataTypes.DATE, allowNull: false, field: 'commence_le' },
  termine_le: { type: DataTypes.DATE, allowNull: false, field: 'termine_le' },
  statut: { type: DataTypes.ENUM('DRAFT', 'ACTIVE', 'INACTIVE'), allowNull: false, defaultValue: 'DRAFT', field: 'statut' },
}, timestamps);

const ProductRequest = define('ProductRequest', {
  id,
  client_id: { type: DataTypes.UUID, allowNull: false, field: 'client_id' },
  nom_produit: { type: DataTypes.STRING(180), allowNull: false, field: 'nom_produit' },
  description: { type: DataTypes.TEXT, field: 'description' },
  quantite_souhaitee: { type: DataTypes.DECIMAL(14, 3), field: 'quantite_souhaitee' },
  categorie: { type: DataTypes.STRING(100), field: 'categorie' },
  photo_url: { type: DataTypes.STRING, field: 'photo_url' },
  commentaire: { type: DataTypes.TEXT, field: 'commentaire' },
  statut: { type: DataTypes.ENUM('PENDING', 'ANSWERED', 'ACCEPTED', 'REJECTED', 'CONVERTED'), allowNull: false, defaultValue: 'PENDING', field: 'statut' },
  reponse_admin: { type: DataTypes.TEXT, field: 'reponse_admin' },
}, timestamps);

const VehicleRequest = define('VehicleRequest', {
  id,
  client_id: { type: DataTypes.UUID, field: 'client_id' },
  utilisateur_id: { type: DataTypes.UUID, field: 'utilisateur_id' },
  nom_vehicule: { type: DataTypes.STRING(180), allowNull: false, field: 'nom_vehicule' },
  description: { type: DataTypes.TEXT, field: 'description' },
  nom: { type: DataTypes.STRING(180), allowNull: false, field: 'nom' },
  telephone: { type: DataTypes.STRING(32), allowNull: false, field: 'telephone' },
  email: { type: DataTypes.STRING(254), allowNull: false, field: 'email' },
  statut: { type: DataTypes.ENUM('PENDING', 'CONTACTED', 'CONVERTED', 'REJECTED'), allowNull: false, defaultValue: 'PENDING', field: 'statut' },
  reponse_admin: { type: DataTypes.TEXT, field: 'reponse_admin' },
}, timestamps);

const StockMovement = define('StockMovement', {
  id,
  produit_id: { type: DataTypes.UUID, allowNull: false, field: 'produit_id' },
  cree_par_utilisateur_id: { type: DataTypes.UUID, field: 'cree_par_utilisateur_id' },
  type: { type: DataTypes.ENUM('IN', 'OUT', 'ADJUSTMENT'), allowNull: false, field: 'type' },
  quantite: { type: DataTypes.DECIMAL(14, 3), allowNull: false, field: 'quantite' },
  motif: { type: DataTypes.STRING(255), field: 'motif' },
  reference: { type: DataTypes.STRING(100), field: 'reference' },
}, timestamps);

const Setting = define('Setting', {
  id,
  cle: { type: DataTypes.STRING(100), allowNull: false, unique: true, field: 'cle' },
  valeur: { type: DataTypes.JSON, allowNull: false, field: 'valeur' },
}, timestamps);

User.hasOne(Client, { foreignKey: 'utilisateur_id', as: 'client', onDelete: 'CASCADE' });
Client.belongsTo(User, { foreignKey: 'utilisateur_id', as: 'user' });
Client.hasOne(Company, { foreignKey: 'client_id', as: 'entreprise', onDelete: 'CASCADE' });
Company.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });
Category.hasMany(Category, { foreignKey: 'parent_id', as: 'enfants' });
Category.hasMany(Product, { foreignKey: 'categorie_id', as: 'produits' });
Product.belongsTo(Category, { foreignKey: 'categorie_id', as: 'categorie' });
Product.hasMany(Tariff, { foreignKey: 'produit_id', as: 'tarifs', onDelete: 'CASCADE' });
Tariff.belongsTo(Product, { foreignKey: 'produit_id', as: 'produit' });
Client.hasMany(Cart, { foreignKey: 'client_id', as: 'paniers' });
Cart.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
Cart.hasMany(CartItem, { foreignKey: 'panier_id', as: 'articles', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'panier_id', as: 'panier' });
Product.hasMany(CartItem, { foreignKey: 'produit_id', as: 'articlesPanier' });
CartItem.belongsTo(Product, { foreignKey: 'produit_id', as: 'produit' });
Vehicle.hasMany(CartItem, { foreignKey: 'vehicule_id', as: 'articlesPanier' });
CartItem.belongsTo(Vehicle, { foreignKey: 'vehicule_id', as: 'vehicule' });
Client.hasMany(Quote, { foreignKey: 'client_id', as: 'devis' });
Quote.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
Quote.hasMany(QuoteItem, { foreignKey: 'devis_id', as: 'articles', onDelete: 'CASCADE' });
QuoteItem.belongsTo(Quote, { foreignKey: 'devis_id', as: 'devis' });
Product.hasMany(QuoteItem, { foreignKey: 'produit_id', as: 'articlesDevis' });
QuoteItem.belongsTo(Product, { foreignKey: 'produit_id', as: 'produit' });
Client.hasMany(QuoteRequest, { foreignKey: 'client_id', as: 'demandesDevis' });
QuoteRequest.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
User.hasMany(QuoteRequest, { foreignKey: 'utilisateur_id', as: 'demandesDevis' });
QuoteRequest.belongsTo(User, { foreignKey: 'utilisateur_id', as: 'user' });
Client.hasMany(Reservation, { foreignKey: 'client_id', as: 'reservations' });
Reservation.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
Vehicle.hasMany(Reservation, { foreignKey: 'vehicule_id', as: 'reservations' });
Reservation.belongsTo(Vehicle, { foreignKey: 'vehicule_id', as: 'vehicule' });
User.hasMany(Notification, { foreignKey: 'utilisateur_destinataire_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'utilisateur_destinataire_id', as: 'destinataire' });
Product.hasMany(Promotion, { foreignKey: 'produit_id', as: 'promotions' });
Promotion.belongsTo(Product, { foreignKey: 'produit_id', as: 'produit' });
Vehicle.hasMany(Promotion, { foreignKey: 'vehicule_id', as: 'promotions' });
Promotion.belongsTo(Vehicle, { foreignKey: 'vehicule_id', as: 'vehicule' });
Vehicle.hasMany(VehicleCompanyPrice, { foreignKey: 'vehicule_id', as: 'prixEntreprises', onDelete: 'CASCADE' });
VehicleCompanyPrice.belongsTo(Vehicle, { foreignKey: 'vehicule_id', as: 'vehicule' });
Company.hasMany(VehicleCompanyPrice, { foreignKey: 'entreprise_id', as: 'prixVehicules', onDelete: 'CASCADE' });
VehicleCompanyPrice.belongsTo(Company, { foreignKey: 'entreprise_id', as: 'entreprise' });
Tariff.belongsTo(Company, { foreignKey: 'entreprise_id', as: 'entreprise' });
Company.hasMany(Tariff, { foreignKey: 'entreprise_id', as: 'tarifs' });
Client.hasMany(ProductRequest, { foreignKey: 'client_id', as: 'demandesProduits' });
ProductRequest.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
Client.hasMany(VehicleRequest, { foreignKey: 'client_id', as: 'demandesVehicules' });
VehicleRequest.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
User.hasMany(VehicleRequest, { foreignKey: 'utilisateur_id', as: 'demandesVehicules' });
VehicleRequest.belongsTo(User, { foreignKey: 'utilisateur_id', as: 'user' });
Product.hasMany(StockMovement, { foreignKey: 'produit_id', as: 'mouvementsStock' });
StockMovement.belongsTo(Product, { foreignKey: 'produit_id', as: 'produit' });
User.hasMany(StockMovement, { foreignKey: 'cree_par_utilisateur_id', as: 'mouvementsStock' });
StockMovement.belongsTo(User, { foreignKey: 'cree_par_utilisateur_id', as: 'creePar' });

module.exports = { sequelize, User, Client, Company, Category, Product, Tariff, Vehicle, VehicleCompanyPrice, Cart, CartItem, Quote, QuoteItem, QuoteRequest, Reservation, Notification, Promotion, ProductRequest, VehicleRequest, StockMovement, Setting };
