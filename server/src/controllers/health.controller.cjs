const sequelize = require('../database/sequelize.cjs');

async function getHealth(_request, response, next) {
  try {
    await sequelize.authenticate();
    response.status(200).json({ status: 'ok', database: 'connected', build: '2026-09-16' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getHealth };
