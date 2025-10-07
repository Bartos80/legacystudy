const mongoose = require("mongoose");
//import mongoose, { model } from "mongoose";
const { Schema } = mongoose; // aca defino esquema de base de datos

// Hacer el Campo autoincremental - Primary Key
const AutoIncrement = require('mongoose-sequence')(mongoose);

AudienciaSchema = new Schema({
  // Campo Autoincremental
    idaudiencia: { 
        type: Number, // El tipo debe ser Number
        unique: true  // Debe ser único
    },
  borrado: {
    type: String,
    required: false,
    default: "No",
  },
  userborrado: {
    type: String,
    required: false,
    default: "Sin Datos",
  },
  fechaborrado: {
    type: String,
    required: false,
    default: "Sin Datos",
  },
  numAudiencia: {
    type: String,
    require: false,
    default: "No Posee Información",
  },
  tipo: {
    type: String,
    require: false,
    default: "No Posee Información",
  },
  estado: {
    type: String,
    require: false,
    default: "No Posee Información",
  },
  fotoAudiencia: {
    type: String,
    require: false,
    default:
      "https://colonbuenosaires.com.ar/elfaro/wp-content/uploads/2017/09/expe.jpg",
  },
  user: {
    type: String,
    require: false,
    default: "Sin Información",
  },
  name: {
    type: String,
    require: false,
    default: "Sin Información",
  },
  dateaudiencia: {
    type: Date,
    default: Date.now,
  },
  date: {
    type: Date,
    default: Date.now
  },
  filename: {
    type: String,
  },
  path: {
    type: String,
    // default: "/img/Imagen-no-disponible.png"
  }  
});

AudienciaSchema.plugin(AutoIncrement, {
    inc_field: 'idaudiencia', // El nombre del campo a autoincrementar (debe coincidir con el campo definido arriba)
    start_seq: 1,           // Opcional: El número donde empezar el conteo (por defecto es 1)
    reference_fields: [],   // Opcional: Campos para crear secuencias independientes
    id: 'Audiencia_seq_counter' // Opcional: Nombre del contador en la colección 'counters' de MongoDB
});

module.exports = mongoose.model("Audiencia", AudienciaSchema);