function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Datos inválidos.',
      detalles: err.errors?.map((e) => e.message) || [err.message],
    });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno del servidor.' });
}

module.exports = errorHandler;
