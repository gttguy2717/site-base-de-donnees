function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode || 500;
  console.error(`[ERROR ${statusCode}]`, error.message, error.errors?.map?.(e => e.message) || '');
  response.status(statusCode).json({
    error: {
      message: error.message || 'Une erreur interne est survenue.',
      ...(error.details ? { details: error.details } : {}),
    },
  });
}

module.exports = errorHandler;
