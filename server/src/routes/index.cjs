const { Router } = require('express');
const { getHealth } = require('../controllers/health.controller.cjs');
const authRouter = require('./auth.routes.cjs');
const catalogRouter = require('./catalog.routes.cjs');
const cartRouter = require('./cart.routes.cjs');
const productRequestRouter = require('./product-request.routes.cjs');
const quoteRequestRouter = require('./quote-request.routes.cjs');
const notificationRouter = require('./notification.routes.cjs');
const adminRouter = require('./admin.routes.cjs');
const vehicleRequestRouter = require('./vehicle-request.routes.cjs');
const reservationRouter = require('./reservation.routes.cjs');
const aiAssistantRouter = require('./ai-assistant.routes.cjs');
const { authenticate } = require('../middlewares/authenticate.cjs');

const { Setting } = require('../models/index.cjs');

const apiRouter = Router();

async function getPublicAnnouncements(_request, response, next) {
  try {
    const setting = await Setting.findOne({ where: { cle: 'announcements' } });
    const raw = setting?.valeur;

    // Ancien format : tableau simple d'annonces
    if (Array.isArray(raw)) {
      return response.json({ announcements: raw, barHeight: 34 });
    }

    // Nouveau format : { items: [...], barHeight: 34 }
    return response.json({
      announcements: raw?.items || [],
      barHeight: Number(raw?.barHeight) || 34,
    });
  } catch (error) {
    next(error);
  }
}

apiRouter.get('/health', getHealth);
apiRouter.get('/announcements', getPublicAnnouncements);
apiRouter.use('/auth', authRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/product-requests', productRequestRouter);
apiRouter.use('/quote-requests', quoteRequestRouter);
apiRouter.use('/vehicle-requests', vehicleRequestRouter);
apiRouter.use('/reservations', reservationRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/ai-assistant', aiAssistantRouter);
apiRouter.use('/admin', authenticate, adminRouter); // Routes admin protégées
apiRouter.use('/', catalogRouter);

module.exports = apiRouter;
