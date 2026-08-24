const { Router } = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../middlewares/authenticate.cjs');
const validateRequest = require('../middlewares/validate-request.cjs');
const { getCart, addProduct, updateItem, removeItem, clearCartHandler, validateCartHandler, notifyVehicleAdded } = require('../controllers/cart.controller.cjs');

const router = Router();
router.use(authenticate);
router.get('/', getCart);
router.delete('/', clearCartHandler);
router.post('/validate', validateCartHandler);
router.post('/notify-vehicle', notifyVehicleAdded);
router.post('/items', [body('productId').isUUID(), body('quantity').optional().isFloat({ min: 0.001 }), validateRequest], addProduct);
router.patch('/items/:itemId', [param('itemId').isUUID(), body('quantity').isFloat({ min: 0.001 }), validateRequest], updateItem);
router.delete('/items/:itemId', [param('itemId').isUUID(), validateRequest], removeItem);

module.exports = router;
