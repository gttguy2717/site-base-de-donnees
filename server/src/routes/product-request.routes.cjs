const { Router } = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middlewares/authenticate.cjs');
const validateRequest = require('../middlewares/validate-request.cjs');
const { createProductRequest, getAllProductRequests } = require('../controllers/product-request.controller.cjs');

const router = Router();
// Route admin : liste des demandes de produits
router.get('/', authenticate, getAllProductRequests);
router.post('/', authenticate, [
  body('productName').isString().trim().isLength({ min: 2, max: 180 }),
  body('category').optional().isString().trim().isLength({ max: 100 }),
  body('description').optional().isString().trim().isLength({ max: 3000 }),
  body('desiredQuantity').optional({ values: 'falsy' }).isFloat({ min: 0.001 }),
  body('comment').optional().isString().trim().isLength({ max: 3000 }),
  validateRequest,
], createProductRequest);
module.exports = router;
