// src/controllers/producto.controller.js
import { validationResult } from 'express-validator';
import { Producto } from '../models/Producto.js'; // <- IMPORT CORRECTO (named import)

const check = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const e = new Error('Validación fallida');
    e.status = 400;
    e.detalles = errors.array().map(x => x.msg);
    throw e;
  }
};

export const crearProducto = async (req, res, next) => {
  try {
    check(req);
    const prod = await Producto.create(req.body);
    res.status(201).json({ ok: true, data: prod });
  } catch (err) {
    if (err.detalles) {
      return res.status(400).json({ ok: false, error: err.message, detalles: err.detalles });
    }
    next(err);
  }
};

export const listarProductos = async (_req, res, next) => {
  try {
    const items = await Producto.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: items });
  } catch (err) {
    next(err);
  }
};

export const obtenerProducto = async (req, res, next) => {
  try {
    check(req);
    const item = await Producto.findById(req.params.id);
    if (!item) return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
    res.json({ ok: true, data: item });
  } catch (err) {
    if (err.detalles) {
      return res.status(400).json({ ok: false, error: err.message, detalles: err.detalles });
    }
    next(err);
  }
};

export const actualizarProducto = async (req, res, next) => {
  try {
    check(req);
    const item = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
    res.json({ ok: true, data: item });
  } catch (err) {
    if (err.detalles) {
      return res.status(400).json({ ok: false, error: err.message, detalles: err.detalles });
    }
    next(err);
  }
};

export const eliminarProducto = async (req, res, next) => {
  try {
    check(req);
    const item = await Producto.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
    res.json({ ok: true, message: 'Producto eliminado' });
  } catch (err) {
    if (err.detalles) {
      return res.status(400).json({ ok: false, error: err.message, detalles: err.detalles });
    }
    next(err);
  }
};
