require('dotenv').config(); 
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);


const MONGODB_URI = process.env.MONGODB_URI 
const opts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000
};

mongoose.connect(MONGODB_URI, opts)
  .then(db => console.log('Base de Datos Conectada:', db.connection.host || MONGODB_URI))
  .catch(err => {
    console.error('ERROR DE CONEXIÓN A MONGODB:', err.message);
  });

mongoose.connection.on('connected', () => console.log('Mongoose conectado'));
mongoose.connection.on('error', (err) => console.error('Mongoose error:', err));
mongoose.connection.on('disconnected', () => console.warn('Mongoose desconectado'));

module.exports = mongoose;
