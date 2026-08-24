const { Op } = require('sequelize');
const { Tariff, VehicleCompanyPrice } = require('../models/index.cjs');

async function getProductPrice(produit_id, type_client, entreprise_id = null, transaction) {
  if (!type_client) return null;

  // Pour ENTREPRISE_CLIENT : chercher d'abord un tarif spécifique à l'entreprise
  if (type_client === 'ENTREPRISE_CLIENT' && entreprise_id) {
    const companyTariff = await Tariff.findOne({
      where: { produit_id, type_client, entreprise_id },
      transaction,
    });
    if (companyTariff) return Number(companyTariff.prix);
  }

  // Sinon tarif générique du type de client
  const tariff = await Tariff.findOne({ where: { produit_id, type_client, entreprise_id: null }, transaction });
  if (tariff) return Number(tariff.prix);

  // Fallback : utiliser le tarif ENTREPRISE ou PARTICULIER
  const fallbackTariff = await Tariff.findOne({
    where: { produit_id, type_client: { [Op.in]: ['ENTREPRISE', 'PARTICULIER'] }, entreprise_id: null },
    order: [['type_client', 'ASC']],
    transaction,
  });
  return fallbackTariff ? Number(fallbackTariff.prix) : null;
}

async function getVehicleDailyPrice(vehicle, type_client, entreprise_id = null) {
  if (!type_client) return null;

  // Pour ENTREPRISE_CLIENT : chercher d'abord un prix spécifique à l'entreprise
  if (type_client === 'ENTREPRISE_CLIENT' && entreprise_id) {
    const companyPrice = await VehicleCompanyPrice.findOne({
      where: { vehicule_id: vehicle.id, entreprise_id },
    });
    if (companyPrice) return Number(companyPrice.prix_journalier);
  }

  if (type_client === 'ENTREPRISE_CLIENT') {
    return Number(vehicle.prix_journalier_entreprise_client ?? vehicle.prix_journalier_particulier);
  }
  return Number(type_client === 'ENTREPRISE' ? vehicle.prix_journalier_entreprise : vehicle.prix_journalier_particulier);
}

module.exports = { getProductPrice, getVehicleDailyPrice };