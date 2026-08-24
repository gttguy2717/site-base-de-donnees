function notFound(request, _response, next) {
  const error = new Error(`Route introuvable : ${request.method} ${request.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

module.exports = notFound;
