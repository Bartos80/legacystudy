const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const AutoIncrement = require('mongoose-sequence')(mongoose);

const AudienciaSchema = new Schema({
    idaudiencia: {
        type: Number,
        unique: true,
        sparse: true
    },
    borrado:{
        type: String,
        required: true,
        default:"No",
    },
    userborrado:{
        type: String,
        required: true,
        default:"Sin Datos",
    },
    fechaborrado:{
        type: String,
        required: true,
        default:"Sin Datos",
    }, 
    idjuzgado: {
        type: String,
        require: false,
        default: "No Informó"
    },    
    numjuzgado: {
        type: String,
        require: false,
        default: "No Informó"
    },
    numexpediente: {
        type: String,
        require: false
    },
    estadoexpediente: {
        type: String,
        require: false
    },
    caratula: {
        type: String,
        require: false
    },
    secretaria: {
        type: String,
        require: false
    },
    ultimanotificacion: {
        type: String,
        require: false
    },    
    horaaudiencia:{
        type: String,
        require: false
    }, 
    dateturno: {
        type: String,
        default: Date.now
    },
    observaciones: {
        type: String,
        require: false,
        default: "No Posee"
    },
    user: {
        type: String,
        require: false,
        default: "Administrador"
    },
    name: {
        type: String,
        require: false,
        default: "Administrador"
    },
    date: {
        type: Date, 
        default: Date.now
    },    
    idestudiouser: { 
        type: Number, 
        require: false, 
    }
});

AudienciaSchema.plugin(AutoIncrement, {
  inc_field: 'idaudiencia', // El nombre del campo a autoincrementar (debe coincidir con el campo definido arriba)
  start_seq: 1,           // Opcional: El número donde empezar el conteo (por defecto es 1)
  reference_fields: [],   // Opcional: Campos para crear secuencias independientes
  id: 'audiencia_seq_counter' // Opcional: Nombre del contador en la colección 'counters' de MongoDB
});

module.exports = mongoose.model("Audiencias", AudienciaSchema);


