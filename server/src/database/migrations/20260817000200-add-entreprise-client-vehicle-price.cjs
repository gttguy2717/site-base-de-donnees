'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('vehicules', 'prix_journalier_entreprise_client', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: true,
      validate: { min: 0 },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('vehicules', 'prix_journalier_entreprise_client');
  }
};