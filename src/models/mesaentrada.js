const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

// Hacer el Campo autoincremental - Primary Key
const AutoIncrement = require('mongoose-sequence')(mongoose);

const MesaentradaSchema = new Schema({
    idmesaentrada: {
        type: Number,
        unique: true
    },
    idestudio: {
        type: String,
        required: true,
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
    idmesaentrada: { 
        type: Number, // El tipo debe ser Number
        unique: true  // Debe ser único
    },
    nomyapeabogado: {
        type: String,
        require: false
    },
    numturno: {
        type: String,
        require: false
    },
    fechaingreso: {
        type: String,
        require: false
    },
    horaingreso:{
        type: String,
        require: false
    },
    numexpediente: {
        type: String,
        require: false,
        default: "No Informó"
    },
    juzgado: {
        type: String,
        require: false,
        default: "No Informó"
    },
    nomyape: {
        type: String,
        require: false,
        default: "No Informó"
    },
    dni: {
        type: String,
        require: false,
        default: "No Informó"
    },
    contacto: {
        type: String,
        require: false,
        default: "No Informó"
    },
    dateturno: {
        type: Date,
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

MesaentradaSchema.plugin(AutoIncrement, {
    inc_field: 'idmesaentrada', // El nombre del campo a autoincrementar (debe coincidir con el campo definido arriba)
    start_seq: 1,           // Opcional: El número donde empezar el conteo (por defecto es 1)
    reference_fields: [],   // Opcional: Campos para crear secuencias independientes
    id: 'mesaentrada_seq_counter' // Opcional: Nombre del contador en la colección 'counters' de MongoDB
});

module.exports = mongoose.model("Mesaentrada", MesaentradaSchema);


