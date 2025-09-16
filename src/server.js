import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './db.js';
import productoRoutes from './routes/producto.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Archivos estáticos (frontend)
app.use(express.static('public'));

// Rutas API (prefijo /api)
app.use('/api', productoRoutes);

// Healthcheck
app.get('/health', (_req, res) => res.json({ ok: true, status: 'up' }));

// Manejo de errores
app.use(errorHandler);

// Init
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

connectDB(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Error conectando a MongoDB:', err);
    process.exit(1);
  });
