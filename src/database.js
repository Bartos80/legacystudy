const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

// mongoose.connect('mongodb://localhost/inspecobras', {
    // mongoose.connect('mongodb://localhost/notes-db-app',{ // ANDA EN WIN7 8 Y 10
    // mongoose.connect('mongodb://127.0.0.1:27017/Inspecobrasctes', 
    mongoose.connect('mongodb://127.0.0.1:27017/EstudiosJuridicos', 
    // mongoose.connect(process.env.MONGODB_URI, { 
    // useCreateIndex: true,
    {useNewUrlParser: true},
    // useFindAndModify: false
    )
    .then(db => console.log('Base de Datos Conectada',db.connection.host))
    .catch(err => console.error("ERROR DE CONECCION",err));

    


// require('dotenv').config(); 
// const mongoose = require('mongoose');
// mongoose.set('strictQuery', false);


// const MONGODB_URI = process.env.MONGODB_URI 
// const opts = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverSelectionTimeoutMS: 10000,
//   connectTimeoutMS: 10000
// };

// mongoose.connect(MONGODB_URI, opts)
//   .then(db => console.log('Base de Datos Conectada:', db.connection.host || MONGODB_URI))
//   .catch(err => {
//     console.error('ERROR DE CONEXIÓN A MONGODB:', err.message);
//   });

// mongoose.connection.on('connected', () => console.log('Mongoose conectado'));
// mongoose.connection.on('error', (err) => console.error('Mongoose error:', err));
// mongoose.connection.on('disconnected', () => console.warn('Mongoose desconectado'));

// module.exports = mongoose;
