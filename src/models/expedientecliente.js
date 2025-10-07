const mongoose = require("mongoose");
//import mongoose, { model } from "mongoose";
const { Schema } = mongoose; // aca defino esquema de base de datos

ExpedienteClienteSchema = new Schema({
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
  idcliente: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("ExpedienteCliente", ExpedienteClienteSchema);