const { Router } = require('express');
const { query, param } = require('express-validator');
const { listCategories, listProducts, listVehicles, getVehicleAvailability } = require('../controllers/catalog.controller.cjs');
const { optionalAuthenticate } = require('../middlewares/authenticate.cjs');
const validateRequest = require('../middlewares/validate-request.cjs');

const router = Router();

router.get('/categories', listCategories);
router.get('/products', optionalAuthenticate, [query('categoryId').optional().isUUID(), query('search').optional().isString().trim().isLength({ max: 120 }), validateRequest], listProducts);
router.get('/vehicles', optionalAuthenticate, listVehicles);
// optionalAuthenticate : la route reste publique (visiteur non connecté), mais
// si un jeton est présent on connaît le client et l'alerte « véhicule
// indisponible » peut le nommer dans l'email à l'administrateur.
router.get('/vehicles/:vehicleId/availability', optionalAuthenticate, [param('vehicleId').isUUID(), query('startAt').isISO8601(), query('endAt').isISO8601(), validateRequest], getVehicleAvailability);

module.exports = router;
