const mongoose = require("mongoose");
// import mongoose, { model } from "mongoose";
const { Schema } = mongoose; // aca defino esquema de base de datos

// Hacer el Campo autoincremental - Primary Key
const AutoIncrement = require('mongoose-sequence')(mongoose);

ExpedientejuzgadoSchema = new Schema({

  // Campo Autoincremental
  idexpedientejuzgado: {
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
  bajajuzgado: {
    type: String,
    require: false,
    default: "No",
  },
  fechabaja: {
    type: String,
    require: false,
    default: "No",
  },
  idjuzgado: {
    type: String,
    require: false,
  },
  numjuzgado: {
    type: String,
    require: false,
    default: "NoPosee"
  },
  paisjuzgado: {
    type: String,
    require: true,
    default: "No Declarado"
  },
  provinciajuzgado: {
    type: String,
    require: true,
    default: "No Declarado"
  },
  localidadjuzgado: {
    type: String,
    require: true,
    default: "No Declarado"
  },
  estado: {
    type: String,
    require: false,
    default: "No Definió Estado",
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
  fechaentradajuzgado: {
    type: Date,
    default: Date.now
  },
  date: {
    type: Date,
    default: Date.now
  }
});

ExpedientejuzgadoSchema.plugin(AutoIncrement, {
  inc_field: 'idexpedientejuzgado',
  start_seq: 1,
  reference_fields: [],
  id: 'expedientejuzgado_seq_counter'
});

module.exports = mongoose.model("Expedientejuzgado", ExpedientejuzgadoSchema);