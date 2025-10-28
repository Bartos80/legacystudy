const mongoose = require("mongoose");
//import mongoose, { model } from "mongoose";
const { Schema } = mongoose; // aca defino esquema de base de datos

// Hacer el Campo autoincremental - Primary Key
const AutoIncrement = require('mongoose-sequence')(mongoose);

ExpedienteclienteSchema = new Schema({
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
  idexpedientecliente:{
    type: Number,
    unique: true,
  },
  idexpediente: {
    type: String,
    require: false,
    default: "No Posee Información",
  },
  fechaentcliente: {
    type: String,
    default: Date.now
  },
  idcliente: {
    type: String,
    require: true,
  },
  observaciones: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
    dateexp: {
    type: Date,
    default: Date.now
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

ExpedienteSchema.plugin(AutoIncrement, {
    inc_field: 'idexpedientecliente', // El nombre del campo a autoincrementar (debe coincidir con el campo definido arriba)
    start_seq: 1,           // Opcional: El número donde empezar el conteo (por defecto es 1)
    reference_fields: [],   // Opcional: Campos para crear secuencias independientes
    id: 'ExpedienteCliente_seq_counter' // Opcional: Nombre del contador en la colección 'counters' de MongoDB
});

module.exports = mongoose.model("Expedientecliente", ExpedienteclienteSchema);
