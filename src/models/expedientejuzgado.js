const mongoose = require("mongoose");
//import mongoose, { model } from "mongoose";
const { Schema } = mongoose; // aca defino esquema de base de datos

// Hacer el Campo autoincremental - Primary Key
const AutoIncrement = require('mongoose-sequence')(mongoose);

ExpedientejuzgadoSchema = new Schema({
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
  // Campo Autoincremental
  idexpedientejuzgado: {
    type: Number,
    unique: true
  },
  idjuzgado: {
  type: String,
    require: false,
    default: "No Posee Información"
  },
  idexpediente:{
    type: String,
    require: false,
    default: "No Posee Información",
  },   
  estado: {
    type: String,
    require: false,
    default: "No Posee Información",
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
  date: {
    type: Date,
    default: Date.now
  }  
});

ExpedientejuzgadoSchema.plugin(AutoIncrement, {
  inc_field: 'idexpedientejuzgado', // El nombre del campo a autoincrementar (debe coincidir con el campo definido arriba)
  start_seq: 1,           // Opcional: El número donde empezar el conteo (por defecto es 1)
  reference_fields: [],   // Opcional: Campos para crear secuencias independientes
  id: 'idexpedientejuzgado_seq_counter' // Opcional: Nombre del contador en la colección 'counters' de MongoDB
});

module.exports = mongoose.model("Expedientejuzgado", ExpedientejuzgadoSchema);