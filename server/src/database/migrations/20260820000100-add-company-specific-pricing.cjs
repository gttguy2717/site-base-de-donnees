'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Ajouter entreprise_id aux tarifs produits (prix spécifique par entreprise client)
    await queryInterface.addColumn('tarifs', 'entreprise_id', {
      type: Sequelize.CHAR(36),
      allowNull: true,
      references: { model: 'entreprises', key: 'id' },
      onDelete: 'CASCADE',
    });

    // 2. Table des prix véhicules par entreprise client
    await queryInterface.createTable('vehicule_prix_entreprises', {
      id: { type: Sequelize.CHAR(36), defaultValue: Sequelize.UUIDV4, primaryKey: true },
      vehicule_id: { type: Sequelize.CHAR(36), allowNull: false, references: { model: 'vehicules', key: 'id' }, onDelete: 'CASCADE' },
      entreprise_id: { type: Sequelize.CHAR(36), allowNull: false, references: { model: 'entreprises', key: 'id' }, onDelete: 'CASCADE' },
      prix_journalier: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
      cree_le: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      mis_a_jour_le: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('vehicule_prix_entreprises', ['vehicule_id', 'entreprise_id'], { unique: true });

    // 3. Délai de blocage automatique pour les entreprises clients
    await queryInterface.addColumn('clients', 'delai_blocage_jours', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn('clients', 'bloque_le', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('clients', 'bloque_le');
    await queryInterface.removeColumn('clients', 'delai_blocage_jours');
    await queryInterface.dropTable('vehicule_prix_entreprises');
    await queryInterface.removeColumn('tarifs', 'entreprise_id');
  }
};