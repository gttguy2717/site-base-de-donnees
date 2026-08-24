'use strict';

// MySQL-compatible : pas de UUID() natif comme defaultValue dans Sequelize pour MySQL
// On utilise CHAR(36) + defaultValue gérée par l'application (UUIDV4)
const uuid = (Sequelize) => ({
  type: Sequelize.CHAR(36),
  defaultValue: Sequelize.UUIDV4,
  primaryKey: true,
});

const auditColumns = (Sequelize) => ({
  cree_le: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  mis_a_jour_le: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
});

const customerTypes = ['PARTICULIER', 'ENTREPRISE', 'PARTENAIRE', 'GROSSISTE'];

module.exports = {
  async up(queryInterface, Sequelize) {
    const id = uuid(Sequelize);
    const audit = auditColumns(Sequelize);

    // Note: pgcrypto et btree_gist sont des extensions PostgreSQL, pas nécessaires sous MySQL

    await queryInterface.createTable('utilisateurs', {
      id,
      email: { type: Sequelize.STRING(254), allowNull: false, unique: true },
      telephone: { type: Sequelize.STRING(32), unique: true },
      mot_de_passe_hash: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.ENUM('ADMIN', 'MANAGER', 'CLIENT'), allowNull: false, defaultValue: 'CLIENT' },
      est_actif: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      derniere_connexion_au: Sequelize.DATE,
      ...audit,
    });

    await queryInterface.createTable('clients', {
      id,
      utilisateur_id: { type: Sequelize.CHAR(36), allowNull: false, unique: true, references: { model: 'utilisateurs', key: 'id' }, onDelete: 'CASCADE' },
      type_client: { type: Sequelize.ENUM(...customerTypes), allowNull: false },
      prenom: Sequelize.STRING(100),
      nom: Sequelize.STRING(100),
      adresse: Sequelize.TEXT,
      ...audit,
    });

    await queryInterface.createTable('entreprises', {
      id,
      client_id: { type: Sequelize.CHAR(36), allowNull: false, unique: true, references: { model: 'clients', key: 'id' }, onDelete: 'CASCADE' },
      nom: { type: Sequelize.STRING(180), allowNull: false },
      nom_responsable: { type: Sequelize.STRING(180), allowNull: false },
      numero_identification: Sequelize.STRING(100),
      ...audit,
    });

    await queryInterface.createTable('categories', {
      id,
      nom: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      slug: { type: Sequelize.STRING(180), allowNull: false, unique: true },
      description: Sequelize.TEXT,
      parent_id: { type: Sequelize.CHAR(36), references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL' },
      est_actif: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      ...audit,
    });

    await queryInterface.createTable('produits', {
      id,
      categorie_id: { type: Sequelize.CHAR(36), references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL' },
      nom: { type: Sequelize.STRING(180), allowNull: false },
      reference: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      description: Sequelize.TEXT,
      image_url: Sequelize.STRING,
      unite: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'unité' },
      stock: { type: Sequelize.DECIMAL(14, 3), allowNull: false, defaultValue: 0 },
      seuil_alerte: { type: Sequelize.DECIMAL(14, 3), allowNull: false, defaultValue: 0 },
      statut: { type: Sequelize.ENUM('ACTIVE', 'INACTIVE'), allowNull: false, defaultValue: 'ACTIVE' },
      ...audit,
    });

    await queryInterface.createTable('tarifs', {
      id,
      produit_id: { type: Sequelize.CHAR(36), allowNull: false, references: { model: 'produits', key: 'id' }, onDelete: 'CASCADE' },
      type_client: { type: Sequelize.ENUM(...customerTypes), allowNull: false },
      prix: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
      ...audit,
    });
    await queryInterface.addConstraint('tarifs', {
      fields: ['produit_id', 'type_client'],
      type: 'unique',
      name: 'tarifs_produit_client_type_unique',
    });

    await queryInterface.createTable('vehicules', {
      id,
      marque: { type: Sequelize.STRING(100), allowNull: false },
      modele: { type: Sequelize.STRING(100), allowNull: false },
      categorie: { type: Sequelize.STRING(100), allowNull: false },
      description: Sequelize.TEXT,
      image_url: Sequelize.STRING,
      places: { type: Sequelize.INTEGER, allowNull: false },
      carburant: Sequelize.STRING(60),
      transmission: Sequelize.STRING(60),
      prix_journalier_particulier: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
      prix_journalier_entreprise: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
      disponibilite: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      statut: { type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE'), allowNull: false, defaultValue: 'ACTIVE' },
      ...audit,
    });

    await queryInterface.createTable('paniers', {
      id,
      client_id: { type: Sequelize.CHAR(36), allowNull: false, references: { model: 'clients', key: 'id' }, onDelete: 'CASCADE' },
      statut: { type: Sequelize.ENUM('ACTIVE', 'CONVERTED', 'ABANDONED'), allowNull: false, defaultValue: 'ACTIVE' },
      ...audit,
    });
    // MySQL : pas d'index partiel natif. La contrainte d'un seul panier actif par client est gérée au niveau applicatif.

    await queryInterface.createTable('articles_panier', {
      id,
      panier_id: { type: Sequelize.CHAR(36), allowNull: false, references: { model: 'paniers', key: 'id' }, onDelete: 'CASCADE' },
      produit_id: { type: Sequelize.CHAR(36), references: { model: 'produits', key: 'id' }, onDelete: 'RESTRICT' },
      vehicule_id: { type: Sequelize.CHAR(36), references: { model: 'vehicules', key: 'id' }, onDelete: 'RESTRICT' },
      quantite: { type: Sequelize.DECIMAL(14, 3), allowNull: false, defaultValue: 1 },
      prix_unitaire: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
      commence_le: Sequelize.DATE,
      termine_le: Sequelize.DATE,
      ...audit,
    });
    // MySQL ne supporte pas le CHECK multi-colonne de la même façon, la vérification est applicative

    await queryInterface.createTable('devis', {
      id,
      client_id: { type: Sequelize.CHAR(36), allowNull: false, references: { model: 'clients', key: 'id' }, onDelete: 'RESTRICT' },
      numero: { type: Sequelize.STRING(40), allowNull: false, unique: true },
      statut: { type: Sequelize.ENUM('DRAFT', 'ISSUED', 'ACCEPTED', 'REJECTED', 'EXPIRED'), allowNull: false, defaultValue: 'ISSUED' },
      montant_total: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
      valide_jusqu_au: { type: Sequelize.DATEONLY, allowNull: false },
      chemin_pdf: Sequelize.STRING,
      conditions: Sequelize.TEXT,
      ...audit,
    });

    await queryInterface.createTable('articles_devis', {
      id,
      devis_id: { type: Sequelize.CHAR(36), allowNull: false, references: { model: 'devis', key: 'id' }, onDelete: 'CASCADE' },
      produit_id: { type: Sequelize.CHAR(36), references: { model: 'produits', key: 'id' }, onDelete: 'SET NULL' },
      libelle: { type: Sequelize.STRING(255), allowNull: false },
      quantite: { type: Sequelize.DECIMAL(14, 3), allowNull: false },
      prix_unitaire: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
      prix_total: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
      ...audit,
    });

    await queryInterface.createTable('reservations', {
      id,
      client_id: { type: Sequelize.CHAR(36), allowNull: false, references: { model: 'clients', key: 'id' }, onDelete: 'RESTRICT' },
      vehicule_id: { type: Sequelize.CHAR(36), allowNull: false, references: { model: 'vehicules', key: 'id' }, onDelete: 'RESTRICT' },
      reference: { type: Sequelize.STRING(40), allowNull: false, unique: true },
      commence_le: { type: Sequelize.DATE, allowNull: false },
      termine_le: { type: Sequelize.DATE, allowNull: false },
      statut: { type: Sequelize.ENUM('PENDING', 'CONFIRMED', 'REJECTED', 'EXPIRED', 'CANCELLED'), allowNull: false, defaultValue: 'PENDING' },
      prix_journalier: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
      montant_total: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
      avec_chauffeur: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      expire_le: { type: Sequelize.DATE, allowNull: false },
      note_gestionnaire: Sequelize.TEXT,
      ...audit,
    });
    // Note: MySQL ne supporte pas EXCLUDE USING gist.
    // La vérification de non-chevauchement des réservations est assurée au niveau applicatif (API).

    await queryInterface.createTable('notifications', {
      id,
      utilisateur_destinataire_id: { type: Sequelize.CHAR(36), references: { model: 'utilisateurs', key: 'id' }, onDelete: 'CASCADE' },
      type: { type: Sequelize.STRING(80), allowNull: false },
      titre: { type: Sequelize.STRING(180), allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      lien: Sequelize.STRING,
      est_lu: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      lu_le: Sequelize.DATE,
      ...audit,
    });

    await queryInterface.createTable('promotions', {
      id,
      produit_id: { type: Sequelize.CHAR(36), references: { model: 'produits', key: 'id' }, onDelete: 'CASCADE' },
      vehicule_id: { type: Sequelize.CHAR(36), references: { model: 'vehicules', key: 'id' }, onDelete: 'CASCADE' },
      titre: { type: Sequelize.STRING(180), allowNull: false },
      description: Sequelize.TEXT,
      image_url: Sequelize.STRING,
      prix_normal: Sequelize.DECIMAL(14, 2),
      prix_promotionnel: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
      commence_le: { type: Sequelize.DATE, allowNull: false },
      termine_le: { type: Sequelize.DATE, allowNull: false },
      statut: { type: Sequelize.ENUM('DRAFT', 'ACTIVE', 'INACTIVE'), allowNull: false, defaultValue: 'DRAFT' },
      ...audit,
    });

    await queryInterface.createTable('demandes_produits', {
      id,
      client_id: { type: Sequelize.CHAR(36), allowNull: false, references: { model: 'clients', key: 'id' }, onDelete: 'CASCADE' },
      nom_produit: { type: Sequelize.STRING(180), allowNull: false },
      description: Sequelize.TEXT,
      quantite_souhaitee: Sequelize.DECIMAL(14, 3),
      categorie: Sequelize.STRING(100),
      photo_url: Sequelize.STRING,
      commentaire: Sequelize.TEXT,
      statut: { type: Sequelize.ENUM('PENDING', 'ANSWERED', 'ACCEPTED', 'REJECTED', 'CONVERTED'), allowNull: false, defaultValue: 'PENDING' },
      reponse_admin: Sequelize.TEXT,
      ...audit,
    });

    await queryInterface.createTable('mouvements_stock', {
      id,
      produit_id: { type: Sequelize.CHAR(36), allowNull: false, references: { model: 'produits', key: 'id' }, onDelete: 'RESTRICT' },
      cree_par_utilisateur_id: { type: Sequelize.CHAR(36), references: { model: 'utilisateurs', key: 'id' }, onDelete: 'SET NULL' },
      type: { type: Sequelize.ENUM('IN', 'OUT', 'ADJUSTMENT'), allowNull: false },
      quantite: { type: Sequelize.DECIMAL(14, 3), allowNull: false },
      motif: Sequelize.STRING(255),
      reference: Sequelize.STRING(100),
      ...audit,
    });

    await queryInterface.addIndex('produits', ['categorie_id', 'statut']);
    await queryInterface.addIndex('reservations', ['vehicule_id', 'statut', 'commence_le', 'termine_le']);
    await queryInterface.addIndex('notifications', ['utilisateur_destinataire_id', 'est_lu', 'cree_le']);
    await queryInterface.addIndex('demandes_produits', ['statut', 'cree_le']);
  },

  async down(queryInterface) {
    const tables = [
      'mouvements_stock', 'demandes_produits', 'promotions', 'notifications', 'reservations',
      'articles_devis', 'devis', 'articles_panier', 'paniers', 'vehicules', 'tarifs',
      'produits', 'categories', 'entreprises', 'clients', 'utilisateurs',
    ];
    for (const table of tables) {
      await queryInterface.dropTable(table).catch(() => {});
    }
  },
};
