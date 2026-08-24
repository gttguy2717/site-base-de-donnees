const { Router } = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const { register, login, me, updateProfile, uploadAvatar } = require('../controllers/auth.controller.cjs');
const validateRequest = require('../middlewares/validate-request.cjs');
const { authenticate } = require('../middlewares/authenticate.cjs');

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/register', [
  body('customerType').isString().trim(),
  body('email').isEmail().withMessage('Un email valide est requis.').normalizeEmail(),
  body('phone').isString().trim().isLength({ min: 8, max: 32 }).withMessage('Un numéro de téléphone valide est requis.'),
  body('address').optional().isString().trim().isLength({ max: 1000 }),
  body('password').isString().isLength({ min: 8, max: 128 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.'),
  body('firstName').optional().isString().trim().isLength({ max: 100 }),
  body('lastName').optional().isString().trim().isLength({ max: 100 }),
  body('companyName').optional().isString().trim().isLength({ max: 180 }),
  body('responsibleName').optional().isString().trim().isLength({ max: 180 }),
  body('identificationNumber').optional().isString().trim().isLength({ max: 100 }),
  validateRequest,
], register);

router.post('/login', [
  body('identifier').isString().trim().isLength({ min: 3, max: 254 }).withMessage('Email ou téléphone requis.'),
  body('password').isString().isLength({ min: 1, max: 128 }).withMessage('Mot de passe requis.'),
  validateRequest,
], login);

router.get('/me', authenticate, me);
router.put('/me', authenticate, updateProfile);
router.post('/me/avatar', authenticate, upload.single('avatar'), uploadAvatar);

module.exports = router;
