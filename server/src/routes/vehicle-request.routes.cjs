const { Router } = require('express');
const {
  createVehicleRequest,
  getAllVehicleRequests,
  updateVehicleRequestStatus,
} = require('../controllers/vehicle-request.controller.cjs');
const { authenticate } = require('../middlewares/authenticate.cjs');
const { optionalAuthenticate } = require('../middlewares/optional-authenticate.cjs');

const vehicleRequestRouter = Router();

// Routes publiques/authentifiées (authentification optionnelle)
vehicleRequestRouter.post('/', optionalAuthenticate, createVehicleRequest);

// Routes admin
vehicleRequestRouter.get('/', authenticate, getAllVehicleRequests);
vehicleRequestRouter.put('/:id/status', authenticate, updateVehicleRequestStatus);

module.exports = vehicleRequestRouter;
