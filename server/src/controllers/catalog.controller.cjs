const { Op } = require('sequelize');
const { Client, Company, Category, Product, Vehicle, Reservation } = require('../models/index.cjs');
const { getProductPrice, getVehicleDailyPrice } = require('../services/pricing.service.cjs');

async function resolveCustomerType(utilisateur_id) {
  if (!utilisateur_id) return null;
  const client = await Client.findOne({ where: { utilisateur_id } });
  return client?.type_client || null;
}

async function resolveCompanyId(utilisateur_id) {
  if (!utilisateur_id) return null;
  const client = await Client.findOne({ where: { utilisateur_id } });
  if (!client) return null;
  const company = await Company.findOne({ where: { client_id: client.id } });
  return company?.id || null;
}

async function listCategories(_request, response, next) {
  try {
    const categories = await Category.findAll({ where: { est_actif: true }, order: [['nom', 'ASC']] });
    response.json({ categories });
  } catch (error) { next(error); }
}

async function listProducts(request, response, next) {
  try {
    const where = { statut: 'ACTIVE' };
    if (request.query.categoryId) where.categorie_id = request.query.categoryId;
    if (request.query.search) where.nom = { [Op.like]: `%${request.query.search.trim()}%` };
    const userId = request.auth?.user?.id || null;
    const [type_client, entreprise_id, products] = await Promise.all([
      resolveCustomerType(userId),
      resolveCompanyId(userId),
      Product.findAll({ where, include: [{ model: Category, as: 'categorie' }], order: [['nom', 'ASC']] }),
    ]);
    const payload = await Promise.all(products.map(async (product) => ({
      ...product.toJSON(),
      price: await getProductPrice(product.id, type_client, entreprise_id),
    })));
    response.json({ products: payload, customerType: type_client });
  } catch (error) { next(error); }
}

async function listVehicles(request, response, next) {
  try {
    const userId = request.auth?.user?.id || null;
    const [type_client, entreprise_id] = await Promise.all([
      resolveCustomerType(userId),
      resolveCompanyId(userId),
    ]);
    const vehicles = await Vehicle.findAll({ where: { statut: 'ACTIVE', disponibilite: true }, order: [['marque', 'ASC'], ['modele', 'ASC']] });
    const payload = await Promise.all(vehicles.map(async (vehicle) => ({
      ...vehicle.toJSON(),
      dailyPrice: await getVehicleDailyPrice(vehicle, type_client, entreprise_id),
    })));
    response.json({
      customerType: type_client,
      vehicles: payload,
    });
  } catch (error) { next(error); }
}

async function getVehicleAvailability(request, response, next) {
  try {
    const { startAt, endAt } = request.query;
    if (!startAt || !endAt || Number.isNaN(Date.parse(startAt)) || Number.isNaN(Date.parse(endAt)) || new Date(startAt) >= new Date(endAt)) {
      const error = new Error('Les dates de début et de fin sont obligatoires et doivent être cohérentes.');
      error.statusCode = 422;
      throw error;
    }
    const vehicle = await Vehicle.findByPk(request.params.vehicleId);
    if (!vehicle || vehicle.statut !== 'ACTIVE' || !vehicle.disponibilite) return response.status(404).json({ available: false, message: 'Véhicule indisponible.' });
    const overlappingReservation = await Reservation.findOne({ where: { vehicule_id: vehicle.id, statut: { [Op.in]: ['PENDING', 'CONFIRMED'] }, commence_le: { [Op.lt]: new Date(endAt) }, termine_le: { [Op.gt]: new Date(startAt) } } });
    response.json({ available: !overlappingReservation });
  } catch (error) { next(error); }
}

module.exports = { listCategories, listProducts, listVehicles, getVehicleAvailability, resolveCustomerType, resolveCompanyId };
