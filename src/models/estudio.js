const mongoose = require('mongoose');
const { Schema } = mongoose;

const AutoIncrement = require('mongoose-sequence')(mongoose);

const EstudioSchema = new Schema({
    idestudio: {
        type: Number,
        required: false,
        unique: true,
        sparse: true // <--- ¡Esta es la clave!
    },
    idestudiouser: {
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
    numestudio: {
        type: String,
        require: false,
        default: "NoPosee"
    },
    direstudio: {
        type: String,
        require: true
    },
    telestudio: {
        type: String,
        require: true
    },
    emailestudio: {
        type: String,
        require: false
    },
    paisestudio: {
        type: String,
        require: true,
        default: "No Declarado"
    },
    provinciaestudio: {
        type: String,
        require: true,
        default: "No Declarado"
    },
    localidadestudio: {
        type: String,
        require: true,
        default: "No Declarado"
    },
    observacionesestudio: {
        type: String,
        require: true,
        default: "No Declarado"
    },
    date: {
        type: Date,
        default: Date.now
    }
});

EstudioSchema.plugin(AutoIncrement, {
    inc_field: 'idestudio', // El nombre del campo a autoincrementar (debe coincidir con el campo definido arriba)
    start_seq: 1,           // Opcional: El número donde empezar el conteo (por defecto es 1)
    reference_fields: [],   // Opcional: Campos para crear secuencias independientes
    id: 'estudio_seq_counter' // Opcional: Nombre del contador en la colección 'counters' de MongoDB
});

module.exports = mongoose.model("Estudio", EstudioSchema);