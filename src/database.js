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

    