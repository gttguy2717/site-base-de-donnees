const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const environment = require('./config/environment.cjs');
const apiRouter = require('./routes/index.cjs');
const notFound = require('./middlewares/not-found.cjs');
const errorHandler = require('./middlewares/error-handler.cjs');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin(origin, callback) {
    // Autoriser les requêtes sans origin (apps mobiles natives, Expo Go, Postman)
    if (!origin) return callback(null, true);
    // En développement, autoriser toutes les origins
    if (environment.nodeEnv === 'development') return callback(null, true);
    // En production, vérifier la liste blanche
    if (environment.clientOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origine non autorisée par CORS.'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

if (environment.nodeEnv !== 'test') app.use(morgan(environment.nodeEnv === 'production' ? 'combined' : 'dev'));

// Servir les fichiers statiques des dossiers uploads (server/uploads et uploads racine)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Servir les images publiques du site (public/img/vehicles, public/img, etc.)
app.use('/img', express.static(path.join(__dirname, '../../public/img')));
app.use('/img', express.static(path.join(__dirname, '../../public')));

app.use('/api', apiRouter);

// Servir le frontend React en production (dossier dist/)
if (environment.nodeEnv === 'production') {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));
  // Catch-all : toutes les routes non-API renvoient index.html (React Router)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.use(notFound);
}

app.use(errorHandler);

module.exports = app;
