const mongoose = require("mongoose");

const { Schema } = mongoose; // aca defino esquema de base de datos

const NoteSchema = new Schema({
        // idestudio: {
        //         type: String,
        //         require: false,
        // },
        idestudiouser: {
                type: Number,
                required: false,
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
        origeninspeccion: {
                type: String,
                require: true,
                default: "Anónimo"
        },
        numinspeccion: {
                type: String,
                require: true,
                default: "No Posee Información"
        },
        expediente: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        oficio: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        acta: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        adrema: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        date: {
                type: String,
                require: false,
                default: "No Posee, por favor Cargar Fecha"
        },
        inspuser: {
                type: String,
                require: false,
                default: "Visitante"
        },
        informeinspnum: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        // numexp: {
        //         type: String,
        //         require: false,
        //         default: "No Posee Información"
        // },
        fechaentradinspec: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        // inspecfecha: {
        //         type: String,
        //         require: false,
        //         default: "No Posee Información"
        // },
        inspector: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        filename: {    // pidio doc en macro para excel y coloco aca tambien
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
        // filename: {
        //         type: String
        // },
        // path: {
        //         type: String
        // },
        // originalname: {
        //         type: String
        // },
        // mimetype: {
        //         type: String
        // },
        // size: { 
        //         type: Number
        // },
        intimacion: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        infraccion: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        observacion: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        paseanumdestino: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        pasea: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        fechapasea: {
                type: String,
                require: false,
                default: "No Posee Información"
        },
        // este user sirve para vincular las cuentas
        user: {
                type: String,
                require: false
        },
        name: {
                type: String,
                require: false
        },
        dateinsp: {
                type: Date,
                default: Date.now
        }
})

module.exports = mongoose.model("Note", NoteSchema)