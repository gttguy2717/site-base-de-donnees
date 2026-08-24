const { Router } = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
  getAllClients,
  createClient,
  updateClientStatus,
  getCompanyPricing,
  saveCompanyVehiclePrice,
  deleteCompanyVehiclePrice,
  saveCompanyProductPrice,
  deleteCompanyProductPrice,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  exportProductPrices,
  importProductPrices,
  getAllVehicles,
  createVehicle,
  exportVehicles,
  importVehicles,
  updateVehicle,
  deleteVehicle,
  getAllReservations,
  updateReservationStatus,
  getAllQuotes,
  updateQuoteStatus,
  uploadSignedQuote,
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getStockMovements,
  addStockMovement,
  getLowStockAlerts,
  getDashboardStats,
  getSettings,
  saveSettings,
  getAnnouncements,
  saveAnnouncements,
} = require('../controllers/admin.controller.cjs');

const {
  getAllNotifications,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notification.controller.cjs');

const adminRouter = Router();

// Dashboard
adminRouter.get('/dashboard/stats', getDashboardStats);

// Clients
adminRouter.get('/clients', getAllClients);
adminRouter.post('/clients', createClient);
adminRouter.put('/clients/:id/status', updateClientStatus);

// Prix par entreprise client
adminRouter.get('/company-pricing', getCompanyPricing);
adminRouter.post('/company-pricing/vehicle', saveCompanyVehiclePrice);
adminRouter.delete('/company-pricing/vehicle/:id', deleteCompanyVehiclePrice);
adminRouter.post('/company-pricing/product', saveCompanyProductPrice);
adminRouter.delete('/company-pricing/product/:id', deleteCompanyProductPrice);

// Produits
adminRouter.get('/products', getAllProducts);
adminRouter.post('/products', createProduct);
adminRouter.put('/products/:id', updateProduct);
adminRouter.delete('/products/:id', deleteProduct);
adminRouter.get('/products/export-prices', exportProductPrices);
adminRouter.post('/products/import-prices', upload.single('file'), importProductPrices);

// Véhicules
adminRouter.get('/vehicles', getAllVehicles);
adminRouter.post('/vehicles', createVehicle);
adminRouter.get('/vehicles/export', exportVehicles);
adminRouter.post('/vehicles/import', upload.single('file'), importVehicles);
adminRouter.put('/vehicles/:id', updateVehicle);
adminRouter.delete('/vehicles/:id', deleteVehicle);

// Réservations
adminRouter.get('/reservations', getAllReservations);
adminRouter.put('/reservations/:id/status', updateReservationStatus);

// Devis
adminRouter.get('/quotes', getAllQuotes);
adminRouter.put('/quotes/:id/status', updateQuoteStatus);
adminRouter.post('/quotes/:id/upload-signed', upload.single('file'), uploadSignedQuote);

// Promotions
adminRouter.get('/promotions', getAllPromotions);
adminRouter.post('/promotions', createPromotion);
adminRouter.put('/promotions/:id', updatePromotion);
adminRouter.delete('/promotions/:id', deletePromotion);

// Stocks
adminRouter.get('/stock/movements', getStockMovements);
adminRouter.post('/stock/movements', addStockMovement);
adminRouter.get('/stock/alerts', getLowStockAlerts);

// Notifications
adminRouter.get('/notifications', getAllNotifications);
adminRouter.put('/notifications/:id/read', markAsRead);
adminRouter.put('/notifications/read-all', markAllAsRead);

// Annonces (barre défilante)
adminRouter.get('/announcements', getAnnouncements);
adminRouter.put('/announcements', saveAnnouncements);

// Paramètres
adminRouter.get('/settings', getSettings);
adminRouter.put('/settings', saveSettings);

module.exports = adminRouter;
