const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const requiredInProduction = ['DB_NAME', 'DB_USER', 'DB_PASSWORD'];

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  const missing = requiredInProduction.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Variables d'environnement manquantes : ${missing.join(', ')}`);
  }
}

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error("La variable d'environnement JWT_SECRET est obligatoire en production.");
}

function booleanFromEnv(value, defaultValue = false) {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || 'soutarah_db',
    username: process.env.DB_USER || 'soutarah_user',
    password: process.env.DB_PASSWORD || '',
    ssl: booleanFromEnv(process.env.DB_SSL),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  mail: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: booleanFromEnv(process.env.SMTP_SECURE),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
    managerEmails: (process.env.MANAGER_EMAILS || process.env.MANAGER_EMAIL || '')
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean),
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
};
