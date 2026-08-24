const { Router } = require('express');
const { body } = require('express-validator');
const { authenticate, optionalAuthenticate } = require('../middlewares/authenticate.cjs');
const validateRequest = require('../middlewares/validate-request.cjs');
const { createQuoteRequest, getMyQuoteRequests, deleteQuoteRequest } = require('../controllers/quote-request.controller.cjs');

const router = Router();

router.get('/my', authenticate, getMyQuoteRequests);

router.post('/', optionalAuthenticate, [
  body('service').isString().trim().isLength({ min: 2, max: 80 }),
  body('title').isString().trim().isLength({ min: 3, max: 180 }),
  body('budget').optional({ values: 'falsy' }).isString().trim().isLength({ max: 80 }),
  body('timeline').optional({ values: 'falsy' }).isString().trim().isLength({ max: 80 }),
  body('description').optional({ values: 'falsy' }).isString().trim().isLength({ max: 3000 }),
  body('company').optional({ values: 'falsy' }).isString().trim().isLength({ max: 180 }),
  body('name').isString().trim().isLength({ min: 2, max: 180 }),
  body('email').isEmail().normalizeEmail(),
  body('phone').isString().trim().isLength({ min: 6, max: 32 }),
  body('location').isString().trim().isLength({ min: 2, max: 180 }),
  validateRequest,
], createQuoteRequest);

router.delete('/:id', authenticate, deleteQuoteRequest);

module.exports = router;
