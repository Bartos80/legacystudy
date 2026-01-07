const mongoose = require('mongoose');

const { Schema } = mongoose; // aca defino esquema de base de datos

const AutoIncrement = require('mongoose-sequence')(mongoose);

const CobroSchema = new Schema({
    idcobro: {
        type: Number,
        unique: true,
        sparse: true
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
    // const CobroSchema = new Schema({
    clienteId: {
        //type: Schema.Types.ObjectId, 
        type: String,
        ref: 'Cliente',
        required: true
    },
    expedienteId: {
        type: String,
        ref: 'Expediente'
    }, // Opcional si es una consulta general
    montoTotal: {
        type: Number,
        required: true
    },
    moneda: {
        type: String,
        default: 'ARS'
    }, // O tu moneda local
    concepto: {
        type: String,
        enum: ['Honorarios', 'Gastos Judiciales', 'Consulta', 'Otros'],
        required: true
    },
    metodoPago: {
        type: String,
        enum: ['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque'],
        required: true
    },
    estado: {
        type: String,
        enum: ['Pendiente', 'Pagado', 'Parcial', 'Anulado'],
        default: 'Pagado'
    },
    fechaPago: { type: Date, default: Date.now },
    notas: String,
    creadoPor: { type: Schema.Types.ObjectId, ref: 'Usuario' }, // }); // Quién registró el cobro 
    abonos: [{
        fecha: Date,
        monto: Number,
        metodo: String
    }],
    idjuzgado: {
        type: String,
        require: false,
        default: "No Informó"
    },
    numjuzgado: {
        type: String,
        require: false,
        default: "No Informó"
    },
    numexpediente: {
        type: String,
        require: false
    },
    caratula: {
        type: String,
        require: false
    },
    ultimanotificacion: {
        type: String,
        require: false
    },
    montocobrado: {
        type: String,
        require: false
    },
    montototal: {
        type: String,
        require: false
    },
    horacobro: {
        type: String,
        require: false
    },
    dateturno: {
        type: String,
        default: Date.now
    },
    observaciones: {
        type: String,
        require: false,
        default: "No Posee"
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
    idestudiouser: {
        type: Number,
        require: false,
    }
});

CobroSchema.plugin(AutoIncrement, {
    inc_field: 'idcobro', // El nombre del campo a autoincrementar (debe coincidir con el campo definido arriba)
    start_seq: 1,           // Opcional: El número donde empezar el conteo (por defecto es 1)
    reference_fields: [],   // Opcional: Campos para crear secuencias independientes
    id: 'cobro_seq_counter' // Opcional: Nombre del contador en la colección 'counters' de MongoDB
});

module.exports = mongoose.model("Cobros", CobroSchema);


