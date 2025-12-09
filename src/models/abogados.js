const mongoose = require('mongoose');
const { Schema } = mongoose;

// Hacer el Campo autoincremental - Primary Key
const AutoIncrement = require('mongoose-sequence')(mongoose);

const AbogadosSchema = new Schema({
    idabogado: {
        type: Number,
        unique: true,
        sparse: true // <--- ¡Esta es la clave!
    },
    // idestudio: {
    //     type: String,
    //     require: false,
    // },
    // Campo Autoincremental
    idestudiouser: {
        type: Number, // El tipo debe ser Number
        required: false  // Debe ser único
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
    //matricula seria el id unico
    matriculaabogado: {
        type: String,
        require: false,
        default: "NoPosee"
    },
    nyaabogado: {
        type: String,
        require: true
    },
    dniabogado: {
        type: String,
        require: true
    },
    direccionabogado: {
        type: String,
        require: false
    },
    celularabogado: {
        type: String,
        require: true,
        default: "No Declarado"
    },
    emailabogado: {
        type: String,
        require: true,
        default: "No Declarado"
    },
    provinciaabogado: {
        type: String,
        require: true,
        default: "No Declarado"
    },
    localidadabogado: {
        type: String,
        require: true,
        default: "No Declarado"
    },
    emailvinculadoabogadoestudio: {
        type: String,
        require: true,
        default: "No Declarado"
    },
    observacionesabogado: {
        type: String,
        require: true,
        default: "No Declarado"
    },
    date: {
        type: Date,
        default: Date.now
    }
});

AbogadosSchema.plugin(AutoIncrement, {
    inc_field: 'idabogado',
    start_seq: 1,
    reference_fields: [],
    id: 'abogado_seq_counter'
});

module.exports = mongoose.model("Abogados", AbogadosSchema);