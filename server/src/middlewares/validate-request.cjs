const { validationResult } = require('express-validator');

function validateRequest(request, _response, next) {
  const result = validationResult(request);
  if (result.isEmpty()) return next();

  const error = new Error('Certaines données sont invalides.');
  error.statusCode = 422;
  error.details = result.array().map(({ path, msg }) => ({ field: path, message: msg }));
  return next(error);
}

module.exports = validateRequest;
