const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const EstadisticaSchema = new Schema({
        idestadistica: {
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
        estadisticanum: {
                type: String,
                require: true,
        },
        fechaestadistica: {
                type: String,
                require: false,
                default: Date.now
        },
        numexpediente: {
                type: String,
                require: false,
        },
        iniciadornomyape: {
                type: String,
                require: false,
        },
        domicilio: {
                type: String,
                require: false,
        },
        filename: {
                type: String
        },
        path: {
                type: String,
                // default: "/img/Imagen-no-disponible.png"
        },
        filenamedos: {
                type: String
        },
        pathdos: {
                type: String,
                // default: "/img/Imagen-no-disponible.png"
        },
        filenametres: {
                type: String
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
                type: String
        },
        pathsiete: {
                type: String,
                // default: "/img/Imagen-no-disponible.png"
        },
        filenameocho: {
                type: String
        },
        pathocho: {
                type: String,
                // default: "/img/Imagen-no-disponible.png"
        },
        // originalname: {
        //         type: String
        // },
        // mimetype: {
        //         type: String
        // },
        // size: { 
        //         type: Number
        // },
        // este user sirve para vincular las cuentas
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

})

module.exports = mongoose.model("Estadistica", EstadisticaSchema)