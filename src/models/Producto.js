import mongoose from 'mongoose';

const categoriasPermitidas = ['Electrónica', 'Ropa', 'Alimentos'];

const ProductoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres']
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      minlength: [5, 'La descripción debe tener al menos 5 caracteres']
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo']
    },
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio'],
      min: [0, 'El stock no puede ser negativo'],
      validate: {
        validator: Number.isInteger,
        message: 'El stock debe ser un entero'
      }
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: {
        values: categoriasPermitidas,
        message: 'Categoría inválida (permitidas: Electrónica, Ropa, Alimentos)'
      }
    }
  },
  { timestamps: true }
);

export const Producto = mongoose.model('Producto', ProductoSchema);
export const CATEGORIAS = categoriasPermitidas;
