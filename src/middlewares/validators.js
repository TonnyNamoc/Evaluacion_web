import { body, param } from 'express-validator';
import { CATEGORIAS } from '../models/Producto.js';  // <- corregida la ruta

export const validarIdParam = [
  param('id').isMongoId().withMessage('ID inválido')
];

export const validarProductoBody = [
  body('nombre')
    .isString().withMessage('nombre debe ser string')
    .trim().isLength({ min: 2 }).withMessage('nombre mínimo 2 caracteres'),
  body('descripcion')
    .isString().withMessage('descripcion debe ser string')
    .trim().isLength({ min: 5 }).withMessage('descripcion mínimo 5 caracteres'),
  body('precio')
    .isFloat({ min: 0 }).withMessage('precio debe ser número >= 0'),
  body('stock')
    .isInt({ min: 0 }).withMessage('stock debe ser entero >= 0'),
  body('categoria')
    .isString().withMessage('categoria debe ser string')
    .isIn(CATEGORIAS).withMessage(`categoria debe ser una de: ${CATEGORIAS.join(', ')}`)
];

export const validarProductoBodyParcial = [
  body('nombre').optional().isString().trim().isLength({ min: 2 }),
  body('descripcion').optional().isString().trim().isLength({ min: 5 }),
  body('precio').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('categoria').optional().isString().isIn(CATEGORIAS)
];
