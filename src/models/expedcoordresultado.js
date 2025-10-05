const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const ExpedcoordresultadoSchema = new Schema({
    desestimar: {
        type: String,
        required: true,
        default: "No",
    },
    fechadesestimado: {
        type: String,
        required: true,
        default: "Sin Datos",
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
    adremaexp: {
        type: String,
        require: false,
        default: "No Posee Información"
    },
    idexpediente: {
        type: String,
        require: false,
        default: "No Posee Información"
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
    resultadoinspeccion: {
        type: String,
        require: false,
        default: "No Posee Información"
    },    
    fechaintimacion: {
        type: Date,
        require: false,
    }, 
    horaintimacion: {
        type: String,
        require: false,
        default: "No Posee Información"
    }, 
    vencimientointimacion: {
        type: Date,
        require: false,        
    }, 
    intimvinculadainfraccion :{
        type: Date,
        require: false,
        default: "No Posee Información"
    }, 
    fechainfraccion: {
        type: Date,
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
    eliminado: {
        type: String,
        require: false,
        default: "No"
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


module.exports = mongoose.model("Expedcoordresultado", ExpedcoordresultadoSchema);