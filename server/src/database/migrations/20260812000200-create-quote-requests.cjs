'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('demandes_devis', {
      id: { type: Sequelize.CHAR(36), defaultValue: Sequelize.UUIDV4, primaryKey: true },
      reference: { type: Sequelize.STRING(40), allowNull: false, unique: true },
      client_id: { type: Sequelize.CHAR(36), references: { model: 'clients', key: 'id' }, onDelete: 'SET NULL' },
      utilisateur_id: { type: Sequelize.CHAR(36), references: { model: 'utilisateurs', key: 'id' }, onDelete: 'SET NULL' },
      source: { type: Sequelize.ENUM('GUEST', 'CLIENT'), allowNull: false, defaultValue: 'GUEST' },
      service: { type: Sequelize.STRING(80), allowNull: false },
      titre: { type: Sequelize.STRING(180), allowNull: false },
      budget: Sequelize.STRING(80),
      delai: Sequelize.STRING(80),
      description: Sequelize.TEXT,
      entreprise: Sequelize.STRING(180),
      nom: { type: Sequelize.STRING(180), allowNull: false },
      email: { type: Sequelize.STRING(254), allowNull: false },
      telephone: { type: Sequelize.STRING(32), allowNull: false },
      lieu: { type: Sequelize.STRING(180), allowNull: false },
      statut: { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'PENDING' },
      fichier_devis_url: { type: Sequelize.STRING, allowNull: true },
      cree_le: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      mis_a_jour_le: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('demandes_devis', ['statut']);
    await queryInterface.addIndex('demandes_devis', ['cree_le']);
    await queryInterface.addIndex('demandes_devis', ['email']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('demandes_devis');
  },
};
