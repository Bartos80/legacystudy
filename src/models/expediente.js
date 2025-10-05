const mongoose = require("mongoose");
//import mongoose, { model } from "mongoose";
const { Schema } = mongoose; // aca defino esquema de base de datos

ExpedienteSchema = new Schema({
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
  numexpediente: {
    type: String,
    require: false,
    default: "No Posee Información",
  },
  tipo: {
    type: String,
    require: false,
    default: "No Posee Información",
  },
  ultimanotificacion: {
    type: String,
    require: false,
    default: "No Posee Información",
  },
  partes: {
    type: String,
    require: false,
    default: "No Posee Información",
  },
  estado: {
    type: String,
    require: false,
    default: "No Posee Información",
  },
  fotoexpediente: {
    type: String,
    require: false,
    default:
      "https://colonbuenosaires.com.ar/elfaro/wp-content/uploads/2017/09/expe.jpg",
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
  dateexp: {
    type: Date,
    default: Date.now,
  },
  date: {
    type: Date,
    default: Date.now
  },
  filename: {
    type: String,
  },
  path: {
    type: String,
    // default: "/img/Imagen-no-disponible.png"
  },
  filenamedos: {
    type: String,
  },
  pathdos: {
    type: String,
    // default: "/img/Imagen-no-disponible.png"
  },
  filenametres: {
    type: String,
  },
  pathtres: {
    type: String,
    // default: "/img/Imagen-no-disponible.png"
  },
  filenamecuatro: {
    type: String,
  },
  pathcuatro: {
    type: String,
    // default: "/img/Imagen-no-disponible.png"
  },
  filenamecinco: {
    type: String,
  },
  pathcinco: {
    type: String,
    // default: "/img/Imagen-no-disponible.png"
  },
  filenameseis: {
    type: String,
  },
  pathseis: {
    type: String,
    // default: "/img/Imagen-no-disponible.png"
  },
  filenamesiete: {
    type: String,
  },
  pathsiete: {
    type: String,
    // default: "/img/Imagen-no-disponible.png"
  },
  filenameocho: {
    type: String,
  },
  pathocho: {
    type: String,
    // default: "/img/Imagen-no-disponible.png"
  }
});

module.exports = mongoose.model("Expediente", ExpedienteSchema);