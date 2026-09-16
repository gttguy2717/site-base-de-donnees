const { Sequelize } = require('sequelize');
const environment = require('../config/environment.cjs');

const sequelizeOptions = { charset: 'utf8mb4' };
if (environment.database.ssl) {
  sequelizeOptions.ssl = { require: true, rejectUnauthorized: false };
}

const options = {
  dialect: 'mysql',
  logging: false,
  define: { freezeTableName: true, timestamps: true },
  dialectOptions: sequelizeOptions,
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
