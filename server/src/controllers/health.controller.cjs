const sequelize = require('../database/sequelize.cjs');

async function getHealth(_request, response, next) {
  try {
    await sequelize.authenticate();
    response.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getHealth };
