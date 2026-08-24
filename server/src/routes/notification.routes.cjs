const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate.cjs');
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notification.controller.cjs');

const router = Router();

router.get('/my', authenticate, getMyNotifications);
router.patch('/:id/read', authenticate, markAsRead);
router.post('/read-all', authenticate, markAllAsRead);

module.exports = router;
