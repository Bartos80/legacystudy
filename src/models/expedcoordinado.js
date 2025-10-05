const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const ExpedcoordinadoSchema = new Schema({
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
    adremaexp: {
        type: String,
        require: false,
        default: "No Posee Información"
    },
    idexpediente: {
        type: String,
        require: false,
        default: ""
    },
    numexpediente: {
        type: String,
        require: false,
        default: "No Posee Información"
    },
    estado: {
        type: String,
        require: false,
        default: "Pendiente"
    },
    fechainspeccion: {
        type: Date,
        require: false,
        default: "No Posee Información"
    },
    horainspeccion: {
        type: String,
        require: false
    },
    resultadoinspeccion: {
        type: String,
        require: false,
        default: "Pendiente"
    },    
    fechaintimacion: {
        type: Date,
        require: false,
        default: "No Posee Información"
    }, 
    horaintimacion: {
        type: String,
        require: false,
        default: "No Posee Información"
    }, 
    vencimientointimacion: {
        type: Date,
        require: false,
        default: "No Posee Información"
    }, 
    fechainfraccion: {
        type: String,
        require: false,
        default: "No Posee Información"
    }, 
    horainfraccion: {
        type: String,
        require: false,
        default: "No Posee Información"
    },
    descripcionintimacion: {
        type: String,
        require: false,
        default: "No Posee Información"
    },
    descripcioninfraccion: {
        type: String,
        require: false,
        default: "No Posee Información"
    },
    codigoinspector: {
        type: String,
        require: false,
        default: "No Posee Información"
    },
    inspector: {
        type: String,
        require: false,
        default: "No Posee Información"
    },
    iniciadornomyape: {
        type: String,
        require: false,
        default: "No Posee Información"
    },
    domicilio: {
        type: String,
        require: false,
        default: "No Informó"
    },
    fechainspeccion: {
        type: Date,
        require: false,
        default: "No Posee Información"
    },
    horainspeccion: {
        type: String,
        require: false
    },
    motivoinspeccion: {
        type: String,
        require: false
    },
    resultadoinspeccion: {
        type: String,
        require: false,
        default: "No Realizado"
    },
    user: {
        type: String,
        require: false,
        default: "Administrador"
    },
    name: {
        type: String,
        require: false,
        default: "Administrador"
    },
    date: {
        type: Date,
        default: Date.now
    },
});

// FECHA ENTR INSP	INSPECCION	INTIMACION	INFRACCION	INFORME	DESTINO/PASE	FECHA SALIDA


module.exports = mongoose.model("Expedcoordinado", ExpedcoordinadoSchema);