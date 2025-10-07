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
  idexpediente: {
    type: String,
    require: false,
    default: "No Posee Información",
  },
  idabogado: {
    type: String,
    require: false,
  },

});

ExpedienteabogadoSchema.plugin(AutoIncrement, {
    inc_field: 'idabogado', 
    start_seq: 1,           
    reference_fields: [],   
    id: 'abogado_seq_counter'
});

module.exports = mongoose.model("Expedienteabogado", ExpedienteabogadoSchema);