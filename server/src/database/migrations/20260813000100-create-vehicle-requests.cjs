module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('demandes_vehicules', {
      id: {
        type: Sequelize.CHAR(36),
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      client_id: {
        type: Sequelize.CHAR(36),
        references: { model: 'clients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      utilisateur_id: {
        type: Sequelize.CHAR(36),
        references: { model: 'utilisateurs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      nom_vehicule: {
        type: Sequelize.STRING(180),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      nom: {
        type: Sequelize.STRING(180),
        allowNull: false,
      },
      telephone: {
        type: Sequelize.STRING(32),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(254),
        allowNull: false,
      },
      statut: {
        type: Sequelize.ENUM('PENDING', 'CONTACTED', 'CONVERTED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      reponse_admin: {
        type: Sequelize.TEXT,
      },
      cree_le: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      mis_a_jour_le: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('demandes_vehicules', ['client_id']);
    await queryInterface.addIndex('demandes_vehicules', ['utilisateur_id']);
    await queryInterface.addIndex('demandes_vehicules', ['statut']);
    await queryInterface.addIndex('demandes_vehicules', ['cree_le']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('demandes_vehicules');
  },
};
