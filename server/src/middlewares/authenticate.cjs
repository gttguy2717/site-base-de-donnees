const { User } = require('../models/index.cjs');
const { verifyAccessToken } = require('../services/auth.service.cjs');

async function authenticate(request, _response, next) {
  try {
    const authorization = request.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      const error = new Error('Authentification requise.');
      error.statusCode = 401;
      throw error;
    }

    const payload = verifyAccessToken(authorization.slice(7));
    const user = await User.findByPk(payload.sub, { attributes: { exclude: ['mot_de_passe_hash'] } });
    if (!user || !user.est_actif) {
      const error = new Error('Session invalide ou compte désactivé.');
      error.statusCode = 401;
      throw error;
    }

    request.auth = { user, token: payload };
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') error.statusCode = 401;
    return next(error);
  }
}

function authorize(...roles) {
  return (request, _response, next) => {
    if (!request.auth || !roles.includes(request.auth.user.role)) {
      const error = new Error('Permissions insuffisantes.');
      error.statusCode = 403;
      return next(error);
    }
    return next();
  };
}

async function optionalAuthenticate(request, _response, next) {
  const authorization = request.get('authorization');
  if (!authorization) return next();
  return authenticate(request, _response, next);
}

module.exports = { authenticate, authorize, optionalAuthenticate };
