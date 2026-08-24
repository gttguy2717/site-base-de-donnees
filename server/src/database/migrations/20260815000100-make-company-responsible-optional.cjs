'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('entreprises', 'nom_responsable', {
      type: Sequelize.STRING(180),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('entreprises', 'nom_responsable', {
      type: Sequelize.STRING(180),
      allowNull: false,
    });
  },
};