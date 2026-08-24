const { Sequelize } = require('sequelize');
const environment = require('../config/environment.cjs');

const options = {
  dialect: 'mysql',
  logging: false,
  define: { freezeTableName: true, timestamps: true },
  dialectOptions: environment.database.ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
};

const sequelize = environment.databaseUrl
  ? new Sequelize(environment.databaseUrl, options)
  : new Sequelize(
    environment.database.name,
    environment.database.username,
    environment.database.password,
    { ...options, host: environment.database.host, port: environment.database.port },
  );

module.exports = sequelize;
