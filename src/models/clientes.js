const mongoose = require("mongoose");
const { Schema } = mongoose;
//const bcrypt = require("bcryptjs");

ClientesSchema = new Schema({
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
  nyacliente: {
    type: String,
    require: true,
  },
  namecliente: {
    type: String,
    require: false,
  },
  lastnamecliente: {
    type: String,
    require: false,
  },
  dnicliente: {
    type: String,
    require: true,
  },
  domiciliocliente: {
    type: String,
    require: false,
    default: "NoInformó",
  },
  telefonocliente: {
    type: String,
    require: false,
    default: "NoPosee",
  },
  emailcliente: {
    type: String,
    require: false,
    default: "NoInformó",
  },
  numerocarpetaopcionalcliente: {
    type: String,
    require: false,
    default: "NoInformó",
  },
  numexpedientecliente: {
    type: String,
    require: false,
    default: "No Posee Información",
  },
  caratulaexpedientecliente: {
    type: String,
    require: false,
    default: "No Posee Info",
  },
  juzgadoexpedientecliente: {
    type: String,
    require: false,
    default: "No Posee Infor",
  },
  localidadcliente: {
    type: String,
    require: false,
    default: "No Posee Info",
  },
  actuacionjudicialconfechacliente: {
    type: String,
    require: false,
    default: "No Posee Info",
  },
  observacionescliente: {
    type: String,
    require: false,
    default: "No Posee Info",
  },
  fechaaudienciacliente: {
    type: String,
    require: false,
    default: "No Posee Info",
  },
  actosprocesalescliente: {
    type: String,
    require: false,
    default: "No Posee Info",
  },
  correovinculadoclienteestudio: {
    type: String,
    require: false,
    default: "no-informa",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  rolusuario: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("Clientes", ClientesSchema);
