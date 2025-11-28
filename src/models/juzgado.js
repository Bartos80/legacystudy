const mongoose = require('mongoose');
const { Schema } = mongoose;

const AutoIncrement = require('mongoose-sequence')(mongoose);

const JuzgadoSchema = new Schema({
    idestudio: {
        type: Number,
        unique: true
    },
    idjuzgado: {
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
    //matricula seria el id unico
    numjuzgado: {
        type: String,
        require: false,
        default: "NoPosee"
    },
    dirjuzgado: {
        type: String,
        require: true
    },
    teljuzgado: {
        type: String,
        require: true
    },
    emailjuzgado: {
        type: String,
        require: false
    },
    paisjuzgado: {
        type: String,
        require: true,
        default: "No Declarado"
    },
    provinciajuzgado: {
        type: String,
        require: true,
        default: "No Declarado"
    },
    localidadjuzgado: {
        type: String,
        require: true,
        default: "No Declarado"
    },
    observacionesjuzgado: {
        type: String,
        require: true,
        default: "No Declarado"
    },
    date: {
        type: Date,
        default: Date.now
    }
});

JuzgadoSchema.plugin(AutoIncrement, {
    inc_field: 'idjuzgado', // El nombre del campo a autoincrementar (debe coincidir con el campo definido arriba)
    start_seq: 1,           // Opcional: El número donde empezar el conteo (por defecto es 1)
    reference_fields: [],   // Opcional: Campos para crear secuencias independientes
    id: 'juzgado_seq_counter' // Opcional: Nombre del contador en la colección 'counters' de MongoDB
});

module.exports = mongoose.model("Juzgado", JuzgadoSchema);