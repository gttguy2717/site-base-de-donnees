const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const environment = require('../config/environment.cjs');

const SALT_ROUNDS = 12;

function ensureJwtSecret() {
  if (!environment.jwt.secret || environment.jwt.secret.startsWith('replace_with_')) {
    const error = new Error('JWT_SECRET doit être défini avec une valeur longue et aléatoire avant d’utiliser l’authentification.');
    error.statusCode = 500;
    throw error;
  }
  return environment.jwt.secret;
}

function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    ensureJwtSecret(),
    { expiresIn: environment.jwt.expiresIn, issuer: 'soutarah-group', audience: 'soutarah-platform' },
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, ensureJwtSecret(), { issuer: 'soutarah-group', audience: 'soutarah-platform' });
}

function publicUser(user) {
  const source = typeof user.toJSON === 'function' ? user.toJSON() : user;
  const safeUser = { ...source };
  delete safeUser.mot_de_passe_hash;
  return safeUser;
}

module.exports = { hashPassword, comparePassword, signAccessToken, verifyAccessToken, publicUser };
