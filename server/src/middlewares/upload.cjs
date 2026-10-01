const multer = require('multer');
const path = require('node:path');

/**
 * Configuration centralisée des téléversements.
 *
 * Objectif : empêcher qu'un fichier de n'importe quel type soit déposé sur le
 * serveur. Un fichier accepté sans contrôle peut servir à héberger une page de
 * phishing ou un script sur le domaine, ce qui déclenche un avertissement
 * « Site dangereux / trompeur » dans les navigateurs (Google Safe Browsing).
 */

const TAILLE_MAX_OCTETS = 10 * 1024 * 1024; // 10 Mo par fichier
const NOMBRE_MAX_FICHIERS = 8;

const TYPES_AUTORISES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/csv',
  'application/octet-stream', // certains clients mobiles n'annoncent pas le type réel
]);

const EXTENSIONS_AUTORISEES = new Set([
  '.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.doc', '.docx', '.xls', '.xlsx', '.csv',
]);

function fileFilter(_request, fichier, callback) {
  const extension = path.extname(fichier.originalname || '').toLowerCase();
  const type = (fichier.mimetype || '').toLowerCase();
  const typeAccepte = TYPES_AUTORISES.has(type);
  const extensionAcceptee = EXTENSIONS_AUTORISEES.has(extension);

  // Le nom original doit avoir une extension autorisée, ET le type doit être
  // autorisé (le type "octet-stream" est toléré si l'extension est correcte).
  if (extensionAcceptee && typeAccepte) return callback(null, true);

  const error = new Error(
    "Type de fichier non autorisé. Formats acceptés : PDF, images, Word, Excel, CSV.",
  );
  error.statusCode = 400;
  return callback(error);
}

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: TAILLE_MAX_OCTETS, files: NOMBRE_MAX_FICHIERS },
  fileFilter,
});

module.exports = { upload, TAILLE_MAX_OCTETS, TYPES_AUTORISES };
