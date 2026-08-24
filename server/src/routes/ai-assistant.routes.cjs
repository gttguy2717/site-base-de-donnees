const { Router } = require('express');
const { optionalAuthenticate } = require('../middlewares/authenticate.cjs');
const { chat } = require('../controllers/ai-assistant.controller.cjs');

const router = Router();

router.post('/chat', optionalAuthenticate, chat);

module.exports = router;