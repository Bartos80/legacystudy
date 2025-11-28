const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const { Schema } = mongoose; // aca defino esquema de base de datos

ExpedentrsalidaSchema = new Schema({
  idestudio: {
    type: Number,
    unique: true
  },
  borrado: {
    type: String,
    required: true,
    default: "No",
  },
  userborrado: {
    type: String,
    required: true,
    default: "Sin Datos",
  },
  fechaborrado: {
    type: String,
    required: true,
    default: "Sin Datos",
  },
  estado: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  motivoentsal: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  fechaentsal: {
    type: Date,
    default: Date.now
  },
  numexpediente: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  iniciadornomyape: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  domicilio: {
    type: String,
    require: false,
    default: "No Posee Información"
  },
  adremaexp: {
    type: String,
    require: false,
    default: "No Posee Información"
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
})

module.exports = mongoose.model("Expedentrsalida", ExpedentrsalidaSchema)