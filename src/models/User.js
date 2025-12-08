const mongoose = require("mongoose");
const { Schema } = mongoose;

const bcrypt = require("bcryptjs");

const AutoIncrement = require('mongoose-sequence')(mongoose);

const UserSchema = new Schema({
  iduser: {
    type: Number,
    unique: true
  },
  numestudio: {
    type: String,
    require: false,
  },
  idestudio: {
    type: String,
    require: false,
  },
  idestudiouser: {
    type: String,
    require: false,
  },
  name: {
    type: String,
    require: false,
  },
  dni: {
    type: String,
    require: false,
  },
  codigousuario: {
    type: String,
    require: false,
    default: "NoPosee",
  },
  funcion: {
    type: String,
    require: false,
    default: "NoPosee",
  },
  rolusuario:
  {
    type: String,
    require: false
  }
  ,
  celular: {
    type: String,
    require: false,
  },
  email: {
    type: String,
    require: false,
  },
  password: { type: String, require: false },
  confirm_password: { type: String, require: false },
  date: {
    type: Date,
    default: Date.now
  },
});

// encriptar las contraseñas con los sig metodos
UserSchema.method.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = bcrypt.hash(password, salt);
  return hash;
};

UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.plugin(AutoIncrement, {
  inc_field: 'iduser', // El nombre del campo a autoincrementar (debe coincidir con el campo definido arriba)
  start_seq: 1,           // Opcional: El número donde empezar el conteo (por defecto es 1)
  reference_fields: [],   // Opcional: Campos para crear secuencias independientes
  id: 'user_seq_counter' // Opcional: Nombre del contador en la colección 'counters' de MongoDB
});

module.exports = mongoose.model("User", UserSchema);
