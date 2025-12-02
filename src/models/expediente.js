const mongoose = require("mongoose");
//import mongoose, { model } from "mongoose";
const { Schema } = mongoose; // aca defino esquema de base de datos

const AutoIncrement = require('mongoose-sequence')(mongoose);

ExpedienteSchema = new Schema({
  idexpediente: {
    type: Number,
    unique: true
  },
  idestudio: {
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
  caratula: {
    type: String,
    require: false,
    default: "No Posee Información",
  },
  // Relación N:M con Abogados
  idabogado: [{
    type: String,
    ref: 'Abogado' // Colección 'Abogado'
  }],
  // Relación N:M con Clientes
  idcliente: [{
    type: String,
    ref: 'Cliente' // Colección 'Cliente'
  }],
  // Relación N:1 con Juzgado
  idjuzgado: {
    type: String,
    ref: 'Juzgado' // Colección 'Juzgado'
  },
  // idcliente: {
  //   type: String,
  //   require: false,
  //   default: "No Posee Información",
  // },
  // idabogado: {
  //   type: String,
  //   require: false,
  //   default: "No Posee Información",
  // },
  // idjuzgado: {
  //   type: String,
  //   require: false,
  //   default: "No Posee Información",
  // },
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
  actor: {
    type: String,
    require: false,
    default: "No Posee Información",
  },
  demandado: {
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

ExpedienteSchema.plugin(AutoIncrement, {
  inc_field: 'idexpediente', // El nombre del campo a autoincrementar (debe coincidir con el campo definido arriba)
  start_seq: 1,           // Opcional: El número donde empezar el conteo (por defecto es 1)
  reference_fields: [],   // Opcional: Campos para crear secuencias independientes
  id: 'expediente_seq_counter' // Opcional: Nombre del contador en la colección 'counters' de MongoDB
});

module.exports = mongoose.model("Expediente", ExpedienteSchema);