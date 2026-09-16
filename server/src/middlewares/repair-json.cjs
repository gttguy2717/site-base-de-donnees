'use strict';

const { repairText } = require('../utilities/text-encoding.cjs');

/**
 * Middleware qui répare les caractères encodés (UTF-8 cassé / mojibake)
 * dans toutes les réponses JSON de l'API.
 *
 * Le texte en base contient des séquences du type « v├®hicule », « R├®servez »
 * (accents doublement encodés). Ce middleware corrige ces séquences au moment
 * de la réponse, pour que les interfaces (page admin, exports, mobile)
 * affichent des accents corrects.
 *
 * La réparation est appliquée au niveau de la chaîne JSON sérialisée afin de
 * ne jamais altérer les nombres, booléens ou dates (contrairement à une
 * récursion sur des instances Sequelize qui contiennent des Date).
 */
module.exports = function repairJson(req, res, next) {
  const original = res.json.bind(res);
  res.json = function repairJsonResponse(body) {
    try {
      // Si le body n'est pas déjà une chaîne, on le sérialise en JSON.
      const json = typeof body === 'string' ? body : JSON.stringify(body);
      if (json === undefined) return original(body);
      res.set('Content-Type', 'application/json; charset=utf-8');
      return res.send(repairText(json));
    } catch (error) {
      // En cas d'erreur de sérialisation, on retombe sur le comportement par défaut.
      return original(body);
    }
  };
  next();
};