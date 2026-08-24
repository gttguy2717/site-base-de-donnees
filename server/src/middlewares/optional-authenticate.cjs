const jwt = require('jsonwebtoken');
const { User, Client } = require('../models/index.cjs');

/**
 * Middleware d'authentification optionnelle
 * Attache user et client si un token valide est présent, sinon continue sans erreur
 */
async function optionalAuthenticate(request, _response, next) {
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Pas de token, on continue sans auth
    request.auth = { user: null, client: null };
    return next();
  }

  const token = authHeader.slice(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'une_longue_valeur_aleatoire');
    
    const user = await User.findByPk(decoded.userId, { 
      attributes: { exclude: ['mot_de_passe_hash'] } 
    });
    
    if (!user) {
      request.auth = { user: null, client: null };
      return next();
    }

    const client = await Client.findOne({ 
      where: { utilisateur_id: user.id } 
    });

    request.auth = { user, client };
    next();
  } catch (error) {
    // Token invalide, on continue sans auth
    request.auth = { user: null, client: null };
    next();
  }
}

module.exports = { optionalAuthenticate };
