import mongoose from 'mongoose';

export const connectDB = async (uri) => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  const c = mongoose.connection;
  console.log('✅ Mongo conectado');
  console.log('🗄️ DB activa:', c.db.databaseName);
  console.log('🌐 Host:', c.host, ' | Estado:', c.readyState); // 1 = conectado
};
