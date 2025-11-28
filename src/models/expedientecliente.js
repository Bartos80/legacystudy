const mongoose = require("mongoose");
//import mongoose, { model } from "mongoose";
const { Schema } = mongoose; // aca defino esquema de base de datos

// Hacer el Campo autoincremental - Primary Key
const AutoIncrement = require('mongoose-sequence')(mongoose);

ExpedienteclienteSchema = new Schema({
  idestudio: {
    type: Number,
    unique: true
  },
  idexpedientecliente: {
    type: Number,
    // unique: true,
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
  idexpediente: {
    type: String,
    require: false,
    default: "No Posee Información",
  },
  numexpediente: {
    type: String,
    require: true,
  },
  caratula: {
    type: String,
    require: false,
    default: "No Posee Información",
  },
  bajacliente: {
    type: String,
    require: false,
    default: "No",
  },
  idcliente: {
    type: String,
    require: true,
  },
  nyacliente: {
    type: String,
    require: true,
  },
  dnicliente: {
    type: String,
    require: true,
  },
  fechaentradacliente: {
    type: String,
    default: Date.now
  },
  observaciones: {
    type: String,
    require: false,
    default: "Sin Observaciones"
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
