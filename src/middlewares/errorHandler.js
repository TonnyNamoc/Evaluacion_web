
// Manejo centralizado de errores
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    const detalles = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ ok: false, error: 'Validación fallida', detalles });
  }

  // CastError (ObjectId inválido)
  if (err.name === 'CastError' && err.path === '_id') {
    return res.status(400).json({ ok: false, error: 'ID de producto inválido' });
  }

  // Otros
  const status = err.status || 500;
  return res.status(status).json({ ok: false, error: err.message || 'Error interno del servidor' });
};
