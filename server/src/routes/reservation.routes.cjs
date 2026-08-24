const { Router } = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../middlewares/authenticate.cjs');
const validateRequest = require('../middlewares/validate-request.cjs');
const { createReservation, getMyReservations } = require('../controllers/reservation.controller.cjs');

const router = Router();

// Toutes les routes de réservation nécessitent un client connecté
router.use(authenticate);

// POST /api/reservations — Créer une nouvelle réservation
router.post(
  '/',
  [
    body('vehiculeId').isUUID().withMessage('ID du véhicule requis.'),
    body('startDate').isISO8601().withMessage('Date de début valide requise.'),
    body('endDate').isISO8601().withMessage('Date de fin valide requise.'),
    body('withDriver').optional().isBoolean().withMessage('withDriver doit être un booléen.'),
    body('pickupLocation').optional().isString().trim().isLength({ max: 255 }),
    body('destination').optional().isString().trim().isLength({ max: 255 }),
    body('notes').optional().isString().trim().isLength({ max: 2000 }),
    validateRequest,
  ],
  createReservation
);

// GET /api/reservations/mine — Réservations du client connecté
router.get('/mine', getMyReservations);

module.exports = router;