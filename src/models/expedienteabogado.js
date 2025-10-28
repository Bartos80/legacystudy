const mongoose = require("mongoose");
//import mongoose, { model } from "mongoose";
const { Schema } = mongoose; // aca defino esquema de base de datos

// Hacer el Campo autoincremental - Primary Key
const AutoIncrement = require('mongoose-sequence')(mongoose);

ExpedienteabogadoSchema = new Schema({
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
  idexpedienteabogado: {
    type: Number, 
        unique: true  
  },
  idexpediente: {
    type: String,
    require: false,
    default: "No Posee Información",
  },
  idabogado: {
    type: String,
    require: false,
  },  
  fechaentabogado: {
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
