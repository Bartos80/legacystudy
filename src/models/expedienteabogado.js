const mongoose = require("mongoose");
//import mongoose, { model } from "mongoose";
const { Schema } = mongoose; // aca defino esquema de base de datos

// Hacer el Campo autoincremental - Primary Key
const AutoIncrement = require('mongoose-sequence')(mongoose);

ExpedienteabogadoSchema = new Schema({

  idexpedienteabogado: {
    type: Number,
    unique: true,
    sparse: true
  },
  // idestudio: {
  //   type: String,
  //   require: false,
  // },
  idestudiouser: {
    type: Number,
    required: false,
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
  bajaabogado: {
    type: String,
    require: false,
    default: "No",
  },
  idabogado: {
    type: String,
    require: false,
  },
  nyaabogado: {
    type: String,
    require: true
  },
  dniabogado: {
    type: String,
    require: true
  },
  matriculaabogado: {
    type: String,
    require: true
  },
  fechaentradaabogado: {
    type: String,
    default: Date.now
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

ExpedienteabogadoSchema.plugin(AutoIncrement, {
  inc_field: 'idexpedienteabogado',
  start_seq: 1,
  reference_fields: [],
  id: 'expedienteabogado_seq_counter'
});

module.exports = mongoose.model("Expedienteabogado", ExpedienteabogadoSchema);
