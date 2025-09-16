import { Router } from 'express';
import {
  crearProducto,
  listarProductos,
  obtenerProducto,
  actualizarProducto,
  eliminarProducto
} from '../controllers/producto.controller.js';
import {
  validarIdParam,
  validarProductoBody,
  validarProductoBodyParcial
} from '../middlewares/validators.js';

const router = Router();

// CRUD
router.post('/productos', validarProductoBody, crearProducto);
router.get('/productos', listarProductos);
router.get('/productos/:id', validarIdParam, obtenerProducto);
router.put('/productos/:id', validarIdParam, validarProductoBodyParcial, actualizarProducto);
router.delete('/productos/:id', validarIdParam, eliminarProducto);

export default router;
