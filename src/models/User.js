const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const UserSchema = new Schema({
  estudioempresa: {
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
  { type: String, 
    require: false }
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

module.exports = mongoose.model("User", UserSchema);
