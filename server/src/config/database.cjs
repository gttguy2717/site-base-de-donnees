const environment = require('./environment.cjs');

const common = {
  dialect: 'mysql',
  logging: false,
  define: {
    freezeTableName: true,
    timestamps: true,
  },
};

function databaseConfig() {
  if (environment.databaseUrl) {
    return {
      use_env_variable: 'DATABASE_URL',
      ...common,
      dialectOptions: environment.database.ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    };
  }

  return {
    database: environment.database.name,
    username: environment.database.username,
    password: environment.database.password,
    host: environment.database.host,
    port: environment.database.port,
    ...common,
    dialectOptions: environment.database.ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  };
}

module.exports = {
  development: databaseConfig(),
  test: databaseConfig(),
  production: databaseConfig(),
};
