const mongoose = require('mongoose');
const { Schema } = mongoose;

// Hacer el Campo autoincremental - Primary Key
const AutoIncrement = require('mongoose-sequence')(mongoose);


const AbogadosSchema = new Schema ({
    // Campo Autoincremental
    idabogado: { 
        type: Number, // El tipo debe ser Number
        unique: true  // Debe ser único
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
    matriculaabogado:{
        type: String, 
        require: false, 
        default:"NoPosee"
    },
    nyaabogado: {
        type: String, 
        require: true},
    dniabogado:{
        type: String, 
        require: true
    },
    direccionabogado:{
        type: String, 
        require: false
    },    
    celularabogado: {
        type: String, 
        require: true,
        default:"No Declarado"
    },         
    emailabogado: {
        type: String, 
        require: true,
        default:"No Declarado"
    },  
    localidadabogado: {
        type: String, 
        require: true,
        default:"No Declarado"
    }, 
    emailvinculadoabogadoestudio: {
        type: String, 
        require: true,
        default:"No Declarado"
    }, 
    observacionesabogado: {
        type: String, 
        require: true,
        default:"No Declarado"
    }, 
    date: {
        type: Date, 
        default: Date.now
    }
});

AbogadosSchema.plugin(AutoIncrement, {
    inc_field: 'idabogado', // El nombre del campo a autoincrementar (debe coincidir con el campo definido arriba)
    start_seq: 1,           // Opcional: El número donde empezar el conteo (por defecto es 1)
    reference_fields: [],   // Opcional: Campos para crear secuencias independientes
    id: 'abogado_seq_counter' // Opcional: Nombre del contador en la colección 'counters' de MongoDB
});

module.exports = mongoose.model("abogados", AbogadosSchema);