const mongoose = require("mongoose");
const { Schema } = mongoose;
//const bcrypt = require("bcryptjs");
// Hacer el Campo autoincremental - Primary Key
const AutoIncrement = require('mongoose-sequence')(mongoose);

ClientesSchema = new Schema({
  idestudio: {
        type: Number,
        unique: true
    },
  // Campo Autoincremental
  idcliente: {
    type: Number, // El tipo debe ser Number
    // unique: true  // Debe ser único
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
    default: "no-informa",
  },
  provinciacliente: {
    type: String,
    require: false,
    default: "No Posee Info",
  },
  localidadcliente: {
    type: String,
    require: false,
    default: "No Posee Info",
  },
  observacionescliente: {
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

ClientesSchema.plugin(AutoIncrement, {
  inc_field: 'idcliente', // El nombre del campo a autoincrementar (debe coincidir con el campo definido arriba)
  start_seq: 1,           // Opcional: El número donde empezar el conteo (por defecto es 1)
  reference_fields: [],   // Opcional: Campos para crear secuencias independientes
  id: 'iscliente_seq_counter' // Opcional: Nombre del contador en la colección 'counters' de MongoDB
});

module.exports = mongoose.model("Clientes", ClientesSchema);
