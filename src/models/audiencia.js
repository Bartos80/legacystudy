const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const AutoIncrement = require('mongoose-sequence')(mongoose);

const AudienciaSchema = new Schema({
    idaudiencia: {
        type: Number,
        unique: true
    },
    idestudio: { 
        type: Number, 
        require: false, 
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
    
    juzgado: {
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
});

AudienciaSchema.plugin(AutoIncrement, {
    inc_field: 'idaudiencia', 
    start_seq: 1,           
    reference_fields: [],   
    id: 'audiencia_seq_counter' 
});

module.exports = mongoose.model("Audiencias", AudienciaSchema);


