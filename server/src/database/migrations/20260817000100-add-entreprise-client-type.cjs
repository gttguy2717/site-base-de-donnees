'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // MySQL : pour modifier un ENUM, on utilise MODIFY COLUMN
    // Ajouter la valeur ENTREPRISE_CLIENT à l'ENUM type_client des clients
    await queryInterface.sequelize.query(
      `ALTER TABLE clients MODIFY COLUMN type_client ENUM('PARTICULIER', 'ENTREPRISE', 'PARTENAIRE', 'GROSSISTE', 'ENTREPRISE_CLIENT') NOT NULL;`
    );
    // Ajouter ENTREPRISE_CLIENT à l'ENUM type_client des tarifs
    await queryInterface.sequelize.query(
      `ALTER TABLE tarifs MODIFY COLUMN type_client ENUM('PARTICULIER', 'ENTREPRISE', 'PARTENAIRE', 'GROSSISTE', 'ENTREPRISE_CLIENT') NOT NULL;`
    );
  },

  async down(queryInterface) {
    // Retirer ENTREPRISE_CLIENT de l'ENUM clients
    await queryInterface.sequelize.query(
      `ALTER TABLE clients MODIFY COLUMN type_client ENUM('PARTICULIER', 'ENTREPRISE', 'PARTENAIRE', 'GROSSISTE') NOT NULL;`
    );
    // Retirer ENTREPRISE_CLIENT de l'ENUM tarifs
    await queryInterface.sequelize.query(
      `ALTER TABLE tarifs MODIFY COLUMN type_client ENUM('PARTICULIER', 'ENTREPRISE', 'PARTENAIRE', 'GROSSISTE') NOT NULL;`
    );
  }
};