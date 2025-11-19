const express = require('express');
const router = express.Router();

const fs = require('fs').promises;
const { isAuthenticated } = require('../helpers/auth');

const Users = require('../models/User');
const Clientes = require('../models/clientes')
const Expediente = require('../models/expediente');
const Juzgados = require('../models/juzgado')
//const Expedentrsalida = require('../models/expedentrsalida');
const Abogados = require('../models/abogados');
const Expedientecliente = require('../models/expedientecliente');
const Expedienteabogado = require('../models/expedienteabogado');
const Expedientejuzgado = require('../models/expedientejuzgado');
// const Expedinspeccion = require('../models/expedinspeccion');
// const Expedticket = require('../models/Expedticket')
// const Expedticketentrainsp = require('../models/Expedticketentrainsp')
// const Expedcoordinado = require('../models/expedcoordinado');
// const Expedcoordresultado = require('../models/expedcoordresultado');
// const Inspectores = require('../models/inspectores');

//** ver tema NOTE */
const Note = require('../models/Note');

// *ZONA PDF* //
// const expedinspeccion = require('../models/expedinspeccion');
const pdf = require("html-pdf");
const User = require('../models/User');
const expedientejuzgado = require('../models/expedientejuzgado');
var pdfoptionsA4 = { format: 'A4' };

// **esto es para agregar campo borrado a todos los q no tienen borrado marcado**
router.put('/expedientes/listadoborradosenno', isAuthenticated, async (req, res) => {
    await Expediente.update({}, { $set: { borrado: "No" } }, { upsert: false, multi: true })
    req.flash('success_msg', 'Todos los Expedientes Marcados')
    res.redirect('/expedientes/listado');
});

router.get('/expedientes/listado', isAuthenticated, async (req, res) => {
    try {
        const rolusuario = req.user.rolusuario;
        if (rolusuario === "Administrador") {
            // **1. Optimización con .populate('idcliente')**
            var expedientestabla = await Expediente.find({ borrado: "No" })
                .lean()
                .limit()
                .sort({ date: 'desc' });
            if (!expedientestabla) {
                return res.status(404).send('Expediente no encontrado');
            }
            var expedientes = [];
            for (expedientes of expedientestabla) {

                // Formato de Fecha Corregido y Limpiado
                if (expedientes.ultimanotificacion) {
                    const fecha = new Date(expedientes.ultimanotificacion);
                    // Uso de .padStart para formato DD-MM-YYYY limpio
                    const dia = String(fecha.getDate() + 1).padStart(2, '0'); // +1 día puede deberse a la conversión de zona horaria
                    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                    const ano = fecha.getFullYear();
                    expedientes.ultimanotificacion = `${dia}-${mes}-${ano}`;
                    expedientes.idcliente = expedientes.idcliente[0.1]

                } else {
                    expedientes.ultimanotificacion = "----";
                }
                if (expedientes.idjuzgado) {
                    const juzgadoData = await Juzgados.findById(expedientes.idjuzgado).lean();
                    if (juzgadoData) {
                        expedientes.idjuzgado = juzgadoData.numjuzgado;
                    } else {
                        expedientes.idjuzgado = "----";
                    }
                }

                expedientes = expedientestabla;
            }

            res.render('notes/expedientes/planillalistaexpedientes', { expedientes: expedientestabla });

        } else {
            req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
            return res.redirect('/');
        }
    } catch (error) {
        console.error("Error al obtener el listado de expedientes:", error);
        res.status(500).send("Error interno del servidor");
    }
});

router.get('/expedientes/add', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador") {
        //const usuarios = await Users.find().lean().sort({ date: 'desc' });
        const juzgados = await Juzgados.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
        const abogados = await Abogados.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
        const clientes = await Clientes.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/expedientes/newexpedientes', { clientes, abogados, juzgados });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/expedientes/add/:id', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador") {
        const clientes = await Clientes.findById(req.params.id).lean()
        res.render('notes/expedientes/newexpedientes', { clientes });
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/informeinspeccion/add/:id', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const notes = await Note.findById(req.params.id).lean();
    const expedientes = await Expediente.findById(req.params.id).lean();
    //const usuarios = await Users.find().lean().sort({ date: 'desc' });
    if (rolusuario == "Administrador") {
        res.render('notes/newinformeinspeccion', { notes, expedientes });;
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/movimientoexpediente/add/:id', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const expedientes = await Expediente.findById(req.params.id).lean();
    //const usuarios = await Users.find().lean().sort({ date: 'desc' });
    if (rolusuario == "Administrador") {
        res.render('notes/inspecciones/movimientoexped', { expedientes });;
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

// Cambio el estado del expediente y agendo el estado nuevo en la base de datos expedentrsalida.js
// anda con 2 tablas y en una crea nuevo y en otra actualiza
router.put('/notes/newestadoexpediente', isAuthenticated, async (req, res) => {
    // new estado expediente
    const { borrado, userborrado, fechaborrado, juzgado, secretaria, numexpediente, tipo, ultimanotificacion, partes, actor, demandado, estado, motivoentsal, user, name
    } = req.body;
    const newExpedentrsalida = new Expedentrsalida({
        borrado, userborrado, fechaborrado, juzgado, secretaria, numexpediente, tipo, ultimanotificacion, partes, actor, demandado, estado, motivoentsal, user, name
    })
    newExpedentrsalida.user = req.user.id;
    newExpedentrsalida.name = req.user.name;
    await newExpedentrsalida.save();
    await Expediente.update({ numexpediente: numexpediente }, { $set: { estado: estado } }, { upsert: false, multi: true })
    req.flash('success_msg', 'Estado de Expediente Modificado Exitosamente');
    res.redirect('/expedientes/listado');
});

router.get('/expedientes/movimientosestadosexpedientes/:id', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    //var id = req.params.id;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        //const mesaentrada = await Mesaentrada.findById(req.params.id).lean() 
        const expediente = await Expediente.findById(req.params.id).lean()
        //const expedientes = await Expediente.findById(id).lean().sort({ numexpediente: 'desc' });
        var numexpediente = expediente.numexpediente
        const expedentrsalida = await Expedentrsalida.find({ numexpediente: numexpediente }).lean().sort({ date: 'desc' });
        res.render('notes/inspecciones/planillamovestados', { expedentrsalida, expediente });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/notes/add/:id', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const notes = await Note.findById(req.params.id).lean();
    const expedientes = await Expediente.findById(req.params.id).lean();
    //const usuarios = await Users.find().lean().sort({ date: 'desc' });
    if (rolusuario == "Administrador") {
        res.render('notes/inspecciones/newnotes', { notes, expedientes });
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INSPECCIONES')
        return res.redirect('/');
    }
});

router.post('/notes/newexpedientes', isAuthenticated, async (req, res) => {
    const { borrado, userborrado, fechaborrado, juzgado, secretaria, numexpediente,
        caratula, tipo, ultimanotificacion, partes, actor, demandado, estado, user, name, fotoexpediente,
        idcliente, idabogado, idjuzgado
    } = req.body;
    const newExpediente = new Expediente({
        borrado, userborrado, fechaborrado, juzgado, secretaria, numexpediente,
        caratula, tipo, ultimanotificacion, partes, actor, demandado, estado, user, name, fotoexpediente,
        idcliente, idabogado, idjuzgado
    })
    newExpediente.user = req.user.id;
    newExpediente.name = req.user.name;
    await newExpediente.save();
    req.flash('success_msg', 'Expediente Agregado Exitosamente');
    res.redirect('/expedientes/listado');
});



router.get('/expedientes/coordinados', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const expedcoordinado = await Expedcoordinado.find({ borrado: "No" }).lean().limit(200).sort({ date: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/inspecciones/listaexpcoordinadm', { expedcoordinado });
    } else if (rolusuario == "Inspector") {
        const expedcoordinado = await Expedcoordinado.find({ borrado: "No" }).lean().limit(200).sort({ date: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/inspecciones/listaexpcoordininsp', { expedcoordinado });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES COORDINADOS')
        return res.redirect('/');
    }
});

router.get('/expedientes/coordinados/intimacionesvencidas', isAuthenticated, async (req, res) => {
    // buscar por fecha
    //const { fechaingreso } = req.body;
    //const expedcoordinado = await Expedcoordinado.find({ $and: [{ borrado: "No" }, { fechaingreso: { $regex: fechaingreso, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })    
    const rolusuario = req.user.rolusuario;
    // Obtén la fecha actual
    //var miArray = String(new Date());
    // Comparar fechas usando $gte y $lt
    var d = new Date(); // Obtener la fecha actual
    const fechaActual = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        //console.log("HASTAD", fechaActual)
        console.log("D", d)
        const expedcoordresultadotabla = await Expedcoordresultado.find({ $and: [{ borrado: "No" }, { desestimar: "No" }, { vencimientointimacion: { $lte: fechaActual } }] }).lean().sort({ vencimientointimacion: 'desc' });
        //console.log("Expedientes Coordinados", expedcoordresultado)
        for (var expedcoordresultado of expedcoordresultadotabla) {
            //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
            //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;   
            // permite mostrar en las tablas la fecha sola y ordenada
            var tipoint = expedcoordresultado.vencimientointimacion;
            if (tipoint != null) {
                const fecha = new Date(expedcoordresultado.vencimientointimacion);
                const dia = fecha.getDate()
                var mes = 0
                const calcmes = fecha.getMonth() + 1
                if (calcmes < 10) {
                    mes = "0" + calcmes + "-"
                } else {
                    mes = calcmes + "-"
                }
                if (dia > 0 && dia < 10) {
                    var diastring = "0" + dia + "-"
                } else {
                    var diastring = dia + "-"
                }
                const ano = fecha.getFullYear()
                //const fullyear = fecha.toLocaleDateString();
                const fullyear = diastring + mes + ano
                //const fullyear = fecha.toLocaleDateString();
                expedcoordresultado.vencimientointimacion = fullyear;
            } else {
                expedcoordresultado.vencimientointimacion = "----"
            }
            // fechaActual.toString() = expedcoordresultado.fechaintimacion.slice(0, 10); //.slice(inicioTrozo[, finTrozo])
            // expedcoordresultado.fechaintimacion = parseInt(fechaActual);
            // necesito igualar para que se copie el cambio
            expedcoordresultado = expedcoordresultadotabla
            console.log("expedcoordresultado", expedcoordresultado);
            console.log("expedcoordresultadotabla", expedcoordresultadotabla);
        }
        res.render('notes/inspecciones/listexpcordintvenc', { expedcoordresultado });
    } else if (rolusuario == "Inspector") {
        const expedcoordresultado = await Expedcoordresultado.find({ borrado: "No" }).lean().limit(200).sort({ numexpediente: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/inspecciones/listexpcordintvenc', { expedcoordresultado });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES COORDINADOS')
        return res.redirect('/');
    }
});

router.get('/expedientes/coordinados/intiminfracdesestimados', isAuthenticated, async (req, res) => {
    // buscar por fecha
    //const { fechaingreso } = req.body;
    //const expedcoordinado = await Expedcoordinado.find({ $and: [{ borrado: "No" }, { fechaingreso: { $regex: fechaingreso, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })    
    const rolusuario = req.user.rolusuario;
    // Obtén la fecha actual
    //var miArray = String(new Date());
    // Comparar fechas usando $gte y $lt
    var d = new Date(); // Obtener la fecha actual
    const fechaActual = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        //console.log("HASTAD", fechaActual)
        console.log("D", d)
        const expedcoordresultadotabla = await Expedcoordresultado.find({ $and: [{ borrado: "No" }, { desestimar: "Si" }, { vencimientointimacion: { $lte: fechaActual } }] }).lean().sort({ vencimientointimacion: 'desc' });
        //console.log("Expedientes Coordinados", expedcoordresultado)
        for (var expedcoordresultado of expedcoordresultadotabla) {
            //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
            //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

            // permite mostrar en las tablas la fecha sola y ordenada
            var tipoint = expedcoordresultado.vencimientointimacion;
            if (tipoint != null) {
                const fecha = new Date(expedcoordresultado.vencimientointimacion);
                const dia = fecha.getDate()
                var mes = 0
                const calcmes = fecha.getMonth() + 1
                if (calcmes < 10) {
                    mes = "0" + calcmes + "-"
                } else {
                    mes = calcmes + "-"
                }
                if (dia > 0 && dia < 10) {
                    var diastring = "0" + dia + "-"
                } else {
                    var diastring = dia + "-"
                }
                const ano = fecha.getFullYear()
                //const fullyear = fecha.toLocaleDateString();
                const fullyear = diastring + mes + ano
                //const fullyear = fecha.toLocaleDateString();
                expedcoordresultado.vencimientointimacion = fullyear;
            } else {
                expedcoordresultado.vencimientointimacion = "----"
            }

            // fechaActual.toString() = expedcoordresultado.fechaintimacion.slice(0, 10); //.slice(inicioTrozo[, finTrozo])

            // expedcoordresultado.fechaintimacion = parseInt(fechaActual);
            // necesito igualar para que se copie el cambio
            expedcoordresultado = expedcoordresultadotabla
            console.log("expedcoordresultado", expedcoordresultado);
            console.log("expedcoordresultadotabla", expedcoordresultadotabla);
        }
        res.render('notes/inspecciones/listexpcordintvencdes', { expedcoordresultado });
    } else if (rolusuario == "Inspector") {
        const expedcoordresultado = await Expedcoordresultado.find({ borrado: "No" }).lean().limit(200).sort({ numexpediente: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/inspecciones/listexpcordintvencdes', { expedcoordresultado });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES COORDINADOS')
        return res.redirect('/');
    }
});

router.get('/expedientes/coordinados/inspectolres/list', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador") {
        //const usuarios = await Users.find().lean().sort({ numorden: 'desc' });
        const inspectores = await Inspectores.find().lean()
        res.render('notes/inspecciones/listinspectorescoord', { inspectores });
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/expedientes/coordinados/inspectolagreresult/list', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador") {
        //const usuarios = await Users.find().lean().sort({ numorden: 'desc' });
        const inspectores = await Inspectores.find().lean()
        res.render('notes/inspecciones/listinspectoresresult', { inspectores });
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/expedientes/coordinados/add/:id', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    // const expedcoordinado = await Expedcoordinado.findById(req.params.id).lean()
    // res.render('notes/inspecciones/editexpedcood', { expedcoordinado })    //
    if (rolusuario == "Administrador") {
        //const usuarios = await Users.find().lean().sort({ numorden: 'desc' });
        const inspectores = await Inspectores.findById(req.params.id).lean()
        res.render('notes/inspecciones/newexpcoordin', { inspectores });
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/expedientes/coordinados/list/:id', isAuthenticated, async (req, res) => {
    const expedcoordinado = await Expedcoordinado.findById(req.params.id).lean()
    res.render('notes/inspecciones/listexpedcood', { expedcoordinado })
});

router.get('/expedcoordin/intimacionesvencidas/list/:id', isAuthenticated, async (req, res) => {
    const expedcoordresultado = await Expedcoordresultado.findById(req.params.id).lean()
    res.render('notes/inspecciones/listexpedcoodvenc', { expedcoordresultado })
});

router.get('/expedientes/coordinados/listresultado/:id', isAuthenticated, async (req, res) => {
    var expedcoordinado = await Expedcoordinado.findById(req.params.id).lean()
    //const expedientes = await Expediente.findById(id).lean().sort({ numexpediente: 'desc' });
    var idexpediente = expedcoordinado._id
    var expedcoordresultadotabla = await Expedcoordresultado.find({ $and: [{ borrado: "No" }, { idexpediente: idexpediente }] }).lean().sort({ date: 'desc' });

    for (var expedcoordresultado of expedcoordresultadotabla) {
        //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
        //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

        // permite mostrar en las tablas la fecha sola y ordenada
        var tipoint = expedcoordresultado.fechaintimacion;
        if (tipoint != null) {
            const fecha = new Date(expedcoordresultado.fechaintimacion);
            const dia = fecha.getDate()
            var mes = 0
            const calcmes = fecha.getMonth() + 1
            if (calcmes < 10) {
                mes = "0" + calcmes + "-"
            } else {
                mes = calcmes + "-"
            }
            if (dia > 0 && dia < 10) {
                var diastring = "0" + dia + "-"
            } else {
                var diastring = dia + "-"
            }
            const ano = fecha.getFullYear()
            //const fullyear = fecha.toLocaleDateString();
            const fullyear = diastring + mes + ano
            //const fullyear = fecha.toLocaleDateString();
            expedcoordresultado.fechaintimacion = fullyear;
        } else {
            expedcoordresultado.fechaintimacion = "----"
        }

        var tipoinf = expedcoordresultado.fechainfraccion;
        if (tipoinf != null) {
            const fecha = new Date(expedcoordresultado.fechainfraccion);
            const dia = fecha.getDate()
            var mes = 0
            const calcmes = fecha.getMonth() + 1
            if (calcmes < 10) {
                mes = "0" + calcmes + "-"
            } else {
                mes = calcmes + "-"
            }
            if (dia > 0 && dia < 10) {
                var diastring = "0" + dia + "-"
            } else {
                var diastring = dia + "-"
            }
            const ano = fecha.getFullYear()
            //const fullyear = fecha.toLocaleDateString();
            const fullyear = diastring + mes + ano
            //const fullyear = fecha.toLocaleDateString();
            expedcoordresultado.fechainfraccion = fullyear;
        } else {
            expedcoordresultado.fechainfraccion = "----"
        }

        // fechaActual.toString() = expedcoordresultado.fechaintimacion.slice(0, 10); //.slice(inicioTrozo[, finTrozo])

        // expedcoordresultado.fechaintimacion = parseInt(fechaActual);
        // necesito igualar para que se copie el cambio
        expedcoordresultado = expedcoordresultadotabla
        //console.log("expedcoordresultado", expedcoordresultado);
        //console.log("expedcoordresultadotabla", expedcoordresultadotabla);
    }
    res.render('notes/inspecciones/listaexpedcoordmov', { expedcoordresultado, expedcoordinado })
});

// *** BUSCAR EXPEDIENTES COORDINADOS - LISTADO *** SECTOR BUSQUEDAS
router.post('/expedientes/coordinados/find', isAuthenticated, async (req, res) => {
    const { numexpediente } = req.body;
    const expedcoordinado = await Expedcoordinado.find({ $and: [{ borrado: "No" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ fechainicioentrada: 'desc' });;
    if (!expedcoordinado) {
        req.flash('success_msg', 'cargue un Nº de expediente')
        return res.render("notes/inspecciones/listaexpcoordinadm");
    } else {
        res.render('notes/inspecciones/listaexpcoordinadm', { expedcoordinado })
    }
});

router.post('/expedientes/coordinados/findadrema', isAuthenticated, async (req, res) => {
    const { adremaexp } = req.body;
    const expedcoordinado = await Expedcoordinado.find({ $and: [{ borrado: "No" }, { adremaexp: { $regex: adremaexp, $options: "i" } }] }).lean().sort({ adremaexp: 'desc' });;
    if (!expedcoordinado) {
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/inspecciones/listaexpcoordinadm");
    } else {
        res.render('notes/inspecciones/listaexpcoordinadm', { expedcoordinado })
    }
});

router.post('/expedientes/coordinados/findiniciador', isAuthenticated, async (req, res) => {
    const { iniciadornomyape } = req.body;
    const expedcoordinado = await Expedcoordinado.find({ $and: [{ borrado: "No" }, { iniciadornomyape: { $regex: iniciadornomyape, $options: "i" } }] }).lean().sort({ iniciadornomyape: 'desc' });;
    if (!expedcoordinado) {
        req.flash('success_msg', 'cargue un Iniciador (N y A)')
        return res.render("notes/inspecciones/listaexpcoordinadm");
    } else {
        res.render('notes/inspecciones/listaexpcoordinadm', { expedcoordinado })
    }
});

router.post('/expedientes/coordinados/findestado', isAuthenticated, async (req, res) => {
    const { estado } = req.body;
    const expedcoordinado = await Expedcoordinado.find({ $and: [{ borrado: "No" }, { estado: { $regex: estado, $options: "i" } }] }).lean().sort({ iniciadornomyape: 'desc' });
    if (!expedcoordinado) {
        req.flash('success_msg', 'cargue estado (N y A)')
        return res.render("notes/inspecciones/listaexpcoordinadm");
    } else {
        res.render('notes/inspecciones/listaexpcoordinadm', { expedcoordinado })
    }
});

// busqueda lista intimaciones vencida - lisexpcordintvenc.hbs

router.post('/expedientes/coordinados/intimacionesvencidas/find', isAuthenticated, async (req, res) => {
    const { numexpediente } = req.body;
    var d = new Date(); // Obtener la fecha actual
    const fechaActual = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000
    //const expedcoordresultadotabla = await Expedcoordresultado.find({ vencimientointimacion: { $lte: fechaActual } }).lean().sort({ vencimientointimacion: 'desc' });
    const expedcoordresultadotabla = await Expedcoordresultado.find({ $and: [{ borrado: "No" }, { vencimientointimacion: { $lte: fechaActual } }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ vencimientointimacion: 'desc' });
    for (var expedcoordresultado of expedcoordresultadotabla) {
        //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
        //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

        // permite mostrar en las tablas la fecha sola y ordenada
        var tipoint = expedcoordresultado.vencimientointimacion;
        if (tipoint != null) {
            const fecha = new Date(expedcoordresultado.vencimientointimacion);
            const dia = fecha.getDate()
            var mes = 0
            const calcmes = fecha.getMonth() + 1
            if (calcmes < 10) {
                mes = "0" + calcmes + "-"
            } else {
                mes = calcmes + "-"
            }
            if (dia > 0 && dia < 10) {
                var diastring = "0" + dia + "-"
            } else {
                var diastring = dia + "-"
            }
            const ano = fecha.getFullYear()
            //const fullyear = fecha.toLocaleDateString();
            const fullyear = diastring + mes + ano
            //const fullyear = fecha.toLocaleDateString();
            expedcoordresultado.vencimientointimacion = fullyear;
        } else {
            expedcoordresultado.vencimientointimacion = "----"
        }

        // fechaActual.toString() = expedcoordresultado.fechaintimacion.slice(0, 10); //.slice(inicioTrozo[, finTrozo])

        // expedcoordresultado.fechaintimacion = parseInt(fechaActual);
        // necesito igualar para que se copie el cambio
        expedcoordresultado = expedcoordresultadotabla
        console.log("expedcoordresultado", expedcoordresultado);
        console.log("expedcoordresultadotabla", expedcoordresultadotabla);
    }
    if (!expedcoordresultado) {
        req.flash('success_msg', 'cargue estado (N y A)')
        return res.render("notes/inspecciones/listexpcordintvenc");
    } else {
        res.render('notes/inspecciones/listexpcordintvenc', { expedcoordresultado })
    }
});

router.post('/expedientes/coordinados/intimacionesvencidas/findadrema', isAuthenticated, async (req, res) => {
    const { adremaexp } = req.body;
    var d = new Date(); // Obtener la fecha actual
    const fechaActual = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000
    //const expedcoordresultadotabla = await Expedcoordresultado.find({ vencimientointimacion: { $lte: fechaActual } }).lean().sort({ vencimientointimacion: 'desc' });
    const expedcoordresultadotabla = await Expedcoordresultado.find({ $and: [{ borrado: "No" }, { vencimientointimacion: { $lte: fechaActual } }, { adremaexp: { $regex: adremaexp, $options: "i" } }] }).lean().sort({ vencimientointimacion: 'desc' });
    for (var expedcoordresultado of expedcoordresultadotabla) {
        //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
        //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

        // permite mostrar en las tablas la fecha sola y ordenada
        var tipoint = expedcoordresultado.vencimientointimacion;
        if (tipoint != null) {
            const fecha = new Date(expedcoordresultado.vencimientointimacion);
            const dia = fecha.getDate()
            var mes = 0
            const calcmes = fecha.getMonth() + 1
            if (calcmes < 10) {
                mes = "0" + calcmes + "-"
            } else {
                mes = calcmes + "-"
            }
            if (dia > 0 && dia < 10) {
                var diastring = "0" + dia + "-"
            } else {
                var diastring = dia + "-"
            }
            const ano = fecha.getFullYear()
            //const fullyear = fecha.toLocaleDateString();
            const fullyear = diastring + mes + ano
            //const fullyear = fecha.toLocaleDateString();
            expedcoordresultado.vencimientointimacion = fullyear;
        } else {
            expedcoordresultado.vencimientointimacion = "----"
        }

        // fechaActual.toString() = expedcoordresultado.fechaintimacion.slice(0, 10); //.slice(inicioTrozo[, finTrozo])

        // expedcoordresultado.fechaintimacion = parseInt(fechaActual);
        // necesito igualar para que se copie el cambio
        expedcoordresultado = expedcoordresultadotabla
        console.log("expedcoordresultado", expedcoordresultado);
        console.log("expedcoordresultadotabla", expedcoordresultadotabla);
    }
    if (!expedcoordresultado) {
        req.flash('success_msg', 'cargue estado (N y A)')
        return res.render("notes/inspecciones/listexpcordintvenc");
    } else {
        res.render('notes/inspecciones/listexpcordintvenc', { expedcoordresultado })
    }
});

router.post('/expedientes/coordinados/intimacionesvencidas/findiniciador', isAuthenticated, async (req, res) => {
    const { iniciadornomyape } = req.body;
    var d = new Date(); // Obtener la fecha actual
    const fechaActual = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000
    //const expedcoordresultadotabla = await Expedcoordresultado.find({ vencimientointimacion: { $lte: fechaActual } }).lean().sort({ vencimientointimacion: 'desc' });
    const expedcoordresultadotabla = await Expedcoordresultado.find({ $and: [{ borrado: "No" }, { vencimientointimacion: { $lte: fechaActual } }, { iniciadornomyape: { $regex: iniciadornomyape, $options: "i" } }] }).lean().sort({ vencimientointimacion: 'desc' });
    for (var expedcoordresultado of expedcoordresultadotabla) {
        //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
        //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

        // permite mostrar en las tablas la fecha sola y ordenada
        var tipoint = expedcoordresultado.vencimientointimacion;
        if (tipoint != null) {
            const fecha = new Date(expedcoordresultado.vencimientointimacion);
            const dia = fecha.getDate()
            var mes = 0
            const calcmes = fecha.getMonth() + 1
            if (calcmes < 10) {
                mes = "0" + calcmes + "-"
            } else {
                mes = calcmes + "-"
            }
            if (dia > 0 && dia < 10) {
                var diastring = "0" + dia + "-"
            } else {
                var diastring = dia + "-"
            }
            const ano = fecha.getFullYear()
            //const fullyear = fecha.toLocaleDateString();
            const fullyear = diastring + mes + ano
            //const fullyear = fecha.toLocaleDateString();
            expedcoordresultado.vencimientointimacion = fullyear;
        } else {
            expedcoordresultado.vencimientointimacion = "----"
        }

        // fechaActual.toString() = expedcoordresultado.fechaintimacion.slice(0, 10); //.slice(inicioTrozo[, finTrozo])

        // expedcoordresultado.fechaintimacion = parseInt(fechaActual);
        // necesito igualar para que se copie el cambio
        expedcoordresultado = expedcoordresultadotabla
        console.log("expedcoordresultado", expedcoordresultado);
        console.log("expedcoordresultadotabla", expedcoordresultadotabla);
    }
    if (!expedcoordresultado) {
        req.flash('success_msg', 'cargue estado (N y A)')
        return res.render("notes/inspecciones/listexpcordintvenc");
    } else {
        res.render('notes/inspecciones/listexpcordintvenc', { expedcoordresultado })
    }
});

router.post('/expedientes/coordinados/intimacionesvencidas/findinspector', isAuthenticated, async (req, res) => {
    const { inspector } = req.body;
    var d = new Date(); // Obtener la fecha actual
    const fechaActual = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000
    //const expedcoordresultadotabla = await Expedcoordresultado.find({ vencimientointimacion: { $lte: fechaActual } }).lean().sort({ vencimientointimacion: 'desc' });
    const expedcoordresultadotabla = await Expedcoordresultado.find({ $and: [{ borrado: "No" }, { vencimientointimacion: { $lte: fechaActual } }, { inspector: { $regex: inspector, $options: "i" } }] }).lean().sort({ vencimientointimacion: 'desc' });
    for (var expedcoordresultado of expedcoordresultadotabla) {
        //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
        //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

        // permite mostrar en las tablas la fecha sola y ordenada
        var tipoint = expedcoordresultado.vencimientointimacion;
        if (tipoint != null) {
            const fecha = new Date(expedcoordresultado.vencimientointimacion);
            const dia = fecha.getDate()
            var mes = 0
            const calcmes = fecha.getMonth() + 1
            if (calcmes < 10) {
                mes = "0" + calcmes + "-"
            } else {
                mes = calcmes + "-"
            }
            if (dia > 0 && dia < 10) {
                var diastring = "0" + dia + "-"
            } else {
                var diastring = dia + "-"
            }
            const ano = fecha.getFullYear()
            //const fullyear = fecha.toLocaleDateString();
            const fullyear = diastring + mes + ano
            //const fullyear = fecha.toLocaleDateString();
            expedcoordresultado.vencimientointimacion = fullyear;
        } else {
            expedcoordresultado.vencimientointimacion = "----"
        }

        // fechaActual.toString() = expedcoordresultado.fechaintimacion.slice(0, 10); //.slice(inicioTrozo[, finTrozo])

        // expedcoordresultado.fechaintimacion = parseInt(fechaActual);
        // necesito igualar para que se copie el cambio
        expedcoordresultado = expedcoordresultadotabla
        console.log("expedcoordresultado", expedcoordresultado);
        console.log("expedcoordresultadotabla", expedcoordresultadotabla);
    }
    if (!expedcoordresultado) {
        req.flash('success_msg', 'cargue estado (N y A)')
        return res.render("notes/inspecciones/listexpcordintvenc");
    } else {
        res.render('notes/inspecciones/listexpcordintvenc', { expedcoordresultado })
    }
});
// *** FIN DEL SECTOR BUSCAR BUSQUEDA FIND ///

// **** SECTOR NEW ALTAS NUEVOS ******
router.post('/notes/newexpedcoordin', isAuthenticated, async (req, res) => {
    const { borrado, userborrado, fechaborrado, adremaexp, numexpediente, estado, fechainspeccion, horainspeccion, resultadoinspeccion, fechaintimacion, horaintimacion,
        vencimientointimacion, fechainfraccion, horainfraccion, descripcionintimacion, descripcioninfraccion, codigoinspector, inspector,
        iniciadornomyape, domicilio, motivoinspeccion,
        eliminado, user, name, date } = req.body;
    const newexpedcoordin = new Expedcoordinado({
        borrado, userborrado, fechaborrado, adremaexp, numexpediente, fechainspeccion, horainspeccion, estado, resultadoinspeccion, fechaintimacion, horaintimacion,
        vencimientointimacion, fechainfraccion, horainfraccion, descripcionintimacion, descripcioninfraccion, codigoinspector, inspector,
        iniciadornomyape, domicilio, motivoinspeccion,
        eliminado, user, name, date
    })
    Expedcoordinado.user = req.user.id;
    Expedcoordinado.name = req.user.name;
    await newexpedcoordin.save();
    req.flash('success_msg', 'Expediente Coordinado Agregado Exitosamente');
    res.redirect('/expedientes/coordinados');
});

router.post('/notes/newexpedcoordinresult', isAuthenticated, async (req, res) => {
    const { borrado, userborrado, fechaborrado, adremaexp, idexpediente, numexpediente, estado, resultadoinspeccion, fechaintimacion, horaintimacion,
        vencimientointimacion, intimvinculadainfraccion, fechainfraccion, horainfraccion, descripcionintimacion, descripcioninfraccion, codigoinspector, inspector,
        iniciadornomyape, domicilio, fechainspeccion, horainspeccion, motivoinspeccion,
        eliminado, user, name, date } = req.body;
    const newexpedcoordresultado = new Expedcoordresultado({
        borrado, userborrado, fechaborrado, adremaexp, idexpediente, numexpediente, estado, resultadoinspeccion, fechaintimacion, horaintimacion,
        vencimientointimacion, intimvinculadainfraccion, fechainfraccion, horainfraccion, descripcionintimacion, descripcioninfraccion, codigoinspector, inspector,
        iniciadornomyape, domicilio, fechainspeccion, horainspeccion, motivoinspeccion,
        eliminado, user, name, date
    })
    Expedcoordresultado.user = req.user.id;
    Expedcoordresultado.name = req.user.name;
    await newexpedcoordresultado.save();
    await Expedcoordinado.update({ $set: { estado: estado } })
    req.flash('success_msg', 'Resultado de Expediente Coordinado Agregado');
    res.redirect('/expedientes/coordinados');
});

router.get('/movimientoexpedientecoord/add/:id', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const expedcoordinado = await Expedcoordinado.findById(req.params.id).lean();
    const inspectorestabla = await Inspectores.find({ borrado: "No" }).lean().sort();
    //const usuarios = await Users.find().lean().sort({ date: 'desc' });
    var inspectoresname = []
    var inspectorescodigo = []
    if (rolusuario == "Administrador") {
        for (var inspectores of inspectorestabla) {
            inspectoresname.push(inspectores.name)
            inspectorescodigo.push(inspectores.codigoinspector)
        }
        res.render('notes/inspecciones/movimientoexpedcoord', { expedcoordinado, inspectoresname, inspectorescodigo });;
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.put('/expedcoordin/marcadelete/:id', isAuthenticated, async (req, res) => {
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Expedcoordinado.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    const idexpediente = req.params.id
    await Expedcoordresultado.updateMany({ idexpediente: idexpediente, borrado: "No" }, {
        borrado: borrado, fechaborrado: fechaborrado, userborrado: userborrado
    });
    req.flash('success_msg', 'Expediente y sus Movimientos a Papelera Reciclaje')
    //res.render('notes/inspecciones/listexpcordintvenc');
    res.redirect('/expedientes/coordinados');
});

router.put('/expedcoordinmov/marcadelete/:id', isAuthenticated, async (req, res) => {
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Expedcoordresultado.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Expediente a Papelera Reciclaje')
    res.render('notes/inspecciones/listexpcordintvenc');
    //res.redirect('/expedientes/coordinados');
});

router.put('/expedcoordinmovdes/marcadelete/:id', isAuthenticated, async (req, res) => {
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Expedcoordresultado.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Intimación a Papelera Reciclaje')
    res.render('notes/inspecciones/listexpcordintvenc');
    //res.redirect('/expedientes/coordinados');
});

router.delete('/expedcoordin/delete/:id', isAuthenticated, async (req, res) => {
    await Expedcoordinado.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'expediente Eliminado')
    res.redirect('/expedientes/coordinados')
});

router.put('/expedcoordinmov/marcadesestimar/:id', isAuthenticated, async (req, res) => {
    const desestimar = "Si";
    const fechadesestimado = new Date();
    await Expedcoordresultado.findByIdAndUpdate(req.params.id, {
        desestimar, fechadesestimado
    });
    req.flash('success_msg', 'Intimación Desestimada')
    res.render('notes/inspecciones/listexpcordintvenc');
});


router.put('/expedcoordinmov/borrarmarcadesestimar/:id', isAuthenticated, async (req, res) => {
    const desestimar = "No";
    const fechadesestimado = new Date();
    await Expedcoordresultado.findByIdAndUpdate(req.params.id, {
        desestimar, fechadesestimado
    });
    req.flash('success_msg', 'Intimación Recuperada de Desestimación')
    res.render('notes/inspecciones/listexpcordintvenc');
});


router.get('/expedcoordin/edit/:id', isAuthenticated, async (req, res) => {
    const expedcoordinado = await Expedcoordinado.findById(req.params.id).lean()
    res.render('notes/inspecciones/editexpedcood', { expedcoordinado })
});

router.put('/notes/expedcoordin/:id', isAuthenticated, async (req, res) => {
    const { borrado, userborrado, fechaborrado, adremaexp, numexpediente, estado, resultadoinspeccion, fechaintimacion, horaintimacion,
        vencimientointimacion, fechainfraccion, horainfraccion, descripcionintimacion, descripcioninfraccion, codigoinspector, inspector,
        iniciadornomyape, domicilio, fechainspeccion, horainspeccion, motivoinspeccion,
        eliminado, user, name, date } = req.body
    await Expedcoordinado.findByIdAndUpdate(req.params.id, {
        borrado, userborrado, fechaborrado, numexpediente, estado, resultadoinspeccion, fechaintimacion, horaintimacion,
        vencimientointimacion, fechainfraccion, horainfraccion, descripcionintimacion, descripcioninfraccion, codigoinspector, inspector,
        iniciadornomyape, domicilio, adremaexp, fechainspeccion, horainspeccion, motivoinspeccion,
        eliminado, user, name, date
    });
    req.flash('success_msg', 'Coordinación actualizada')
    res.redirect('/expedientes/coordinados');
});



router.get('/expedientes', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const expedientes = await Expediente.find({ borrado: "No" }).lean().limit(200).sort({ numexpediente: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/allexpedientesadm', { expedientes });
    } else if (rolusuario == "Inspector") {
        const expedientes = await Expediente.find({ borrado: "No" }).lean().limit(200).sort({ numexpediente: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/allexpedientes', { expedientes });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/expedientes/borradolistado', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador") {
        const expedientes = await Expediente.find({ $or: [{ borrado: "Si" }, { borrado: "" }] }).lean().limit(100).sort({ date: 'desc' }); //
        // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        res.render('notes/borrados/borradolistexpedientes', { expedientes });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO/AREA PAPELERA DE EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/expedientes/infoborradolist/:id', isAuthenticated, async (req, res) => {
    const expediente = await Expediente.findById(req.params.id).lean()
    // console.log(note.date);
    res.render('notes/borrados/infoborradoexpediente', { expediente })
});

router.put('/expedientes/recuperarlistado', isAuthenticated, async (req, res) => {
    //await Multas.updateMany({ borrado: "Si", fechaborrado: new Date(), userborrado:req.user.name});    
    await Expediente.updateMany({ borrado: 'Si' }, { borrado: "No", fechaborrado: "Recuperado" });
    //await Expediente.update({},{$set:{borrado: "No"}},{upsert:false,multi:true})
    req.flash('success_msg', 'todos los Expedientes recuperados')
    res.redirect('/expedientes/borradolistado');
});

// **esto es para agregar campo borrado a todos los q no tienen borrado marcado**
router.put('/expedientes/listadoborradosenno', isAuthenticated, async (req, res) => {
    await Expediente.update({}, { $set: { borrado: "No" } }, { upsert: false, multi: true })
    req.flash('success_msg', 'Todos los Expedientes Marcados')
    res.redirect('/expedientes/borradolistado');
});


router.get('/expedientes/expedconinformeinspeccion/:id', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    var id = req.params.id;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores" || rolusuario == "Inspector") {
        //const mesaentrada = await Mesaentrada.findById(req.params.id).lean() 
        const expediente = await Expediente.findById(req.params.id).lean()
        //const expedientes = await Expediente.findById(id).lean().sort({ numexpediente: 'desc' });
        var idexpediente = expediente._id
        const expedisnpeccion = await Expedinspeccion.find({ $and: [{ idexpediente: idexpediente }, { fechaentradainspeccion: { $exists: true } }] }).lean().sort({ date: 'desc' }); //
        res.render('notes/inspecciones/planillalistaexpconinformes', { expedisnpeccion, expediente });
        // } else if (rolusuario == "Inspector") {
        //     const expedisnpeccion = await Expedinspeccion.find().lean().limit(100).sort({ date: 'desc' }); //
        //     // const expedientes = await Expediente.paginate({},{paginadoexpedientes}).lean().sort({ numexpediente: 'desc' });
        //     res.render('notes/inspecciones/planillalistainformeexped', { expedisnpeccion });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA EXPEDIENTES')
        return res.redirect('/');
    }
});

router.get('/expedientes/edit/:id', isAuthenticated, async (req, res) => {
    const expediente = await Expediente.findById(req.params.id).lean()
    res.render('notes/expedientes/editexpediente', { expediente })
});

router.get('/expedientes/list/:id', isAuthenticated, async (req, res) => {
    const expediente = await Expediente.findById(req.params.id).lean()
    const idexpediente = expediente.idexpediente;
    const expedientejuzgado = await Expedientejuzgado.find({ $and: [{ idexpediente: idexpediente }, { borrado: "No" }] }).lean()    
    const expedienteabogado = await Expedienteabogado.find({ $and: [{ idexpediente: idexpediente }, { borrado: "No" }] }).lean()
    const expedientecliente = await Expedientecliente.find({ $and: [{ idexpediente: idexpediente }, { borrado: "No" }] }).lean()
    res.render('notes/expedientes/listexpediente', { expediente, expedientejuzgado, expedienteabogado, expedientecliente })
});

// *** BUSCAR EXPEDIENTES (NOTES) - LISTADO ***
router.post('/expedientes/findcliente', isAuthenticated, async (req, res) => {
    const { cliente } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "No" }, { cliente: { $regex: cliente, $options: "i" } }] }).lean().sort({ fechainicioentrada: 'desc' });
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Nº de expediente')
        return res.render("notes/inspecciones/planillalistaexpedientes");
    } else {
        res.render('notes/expedientes/planillalistaexpedientes', { expedientes })
    }
});

router.post('/expedientes/findjuzgado', isAuthenticated, async (req, res) => {
    const { juzgado } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "No" }, { juzgado: { $regex: juzgado, $options: "i" } }] }).lean().sort({ juzgado: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Juzgado')
        return res.render("notes/expedientes/planillalistaexpedientes");
    } else {
        res.render('notes/expedientes/planillalistaexpedientes', { expedientes })
    }
});

router.post('/expedientes/findnumexpediente', isAuthenticated, async (req, res) => {
    const { numexpediente } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "No" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ date: 'desc' });
    if (!expedientes) {
        req.flash('success_msg', 'cargue Expediente')
        return res.render("notes/expedientes/planillalistaexpedientes");
    } else {
        res.render('notes/expedientes/planillalistaexpedientes', { expedientes })
    }
});

router.post('/expedientes/findestado', isAuthenticated, async (req, res) => {
    const { estado } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "No" }, { estado: { $regex: estado, $options: "i" } }] }).lean().sort({ iniciadornomyape: 'desc' });
    if (!expedientes) {
        req.flash('success_msg', 'cargue estado (N y A)')
        return res.render("notes/inspecciones/planillalistaexpedientesadm");
    } else {
        res.render('notes/expedientes/planillalistaexpedientes', { expedientes })
    }
});

// *** BUSCAR EXPEDIENTES (NOTES) - CARTAS ***
router.post('/notes/find', isAuthenticated, async (req, res) => {
    const { numexpediente } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "No" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ fechainicioentrada: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Nº de expediente')
        return res.render("notes/allexpedientes");
    } else {
        res.render('notes/findexpediente', { expedientes })
    }
});

router.post('/notes/findultimanotificacion', isAuthenticated, async (req, res) => {
    const { ultimanotificacion } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "No" }, { ultimanotificacion: { $regex: ultimanotificacion, $options: "i" } }] }).lean().sort({ ultimanotificacion: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue Ultima Notificación')
        return res.render("notes/allexpedientes");
    } else {
        res.render('notes/findexpediente', { expedientes })
    }
});

router.post('/notes/findiniciador', isAuthenticated, async (req, res) => {
    const { iniciadornomyape } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "No" }, { iniciadornomyape: { $regex: iniciadornomyape, $options: "i" } }] }).lean().sort({ iniciadornomyape: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Iniciador (N y A)')
        return res.render("notes/allexpedientes");
    } else {
        res.render('notes/findexpediente', { expedientes })
    }
});

router.post('/notes/findexpediente', isAuthenticated, async (req, res) => {
    const { expediente } = req.body;
    const notes = await Note.find({ $and: [{ borrado: "No" }, { expediente: { $regex: expediente, $options: "i" } }] }).lean().sort({ expediente: 'desc' });;
    if (!notes) {
        req.flash('success_msg', 'cargue un Nº de expediente')
        return res.render("notes/inspecciones/allnotes");
    } else {
        res.render('notes/findinspeccion', { notes })
    }
});

// *** BUSCAR EXPEDIENTES BORRADOS (NOTES) - LISTADO ***
router.post('/expedientes/borradofind', isAuthenticated, async (req, res) => {
    const { numexpediente } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "Si" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ fechainicioentrada: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Nº de expediente')
        return res.render("notes/borrados/borradolistexpedientes");
    } else {
        res.render('notes/borrados/borradolistexpedientes', { expedientes })
    }
});

router.post('/expedientes/borradofindadrema', isAuthenticated, async (req, res) => {
    const { adremaexp } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "Si" }, { adremaexp: { $regex: adremaexp, $options: "i" } }] }).lean().sort({ adremaexp: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/borrados/borradolistexpedientes");
    } else {
        res.render('notes/borrados/borradolistexpedientes', { expedientes })
    }
});

router.post('/expedientes/borradofindiniciador', isAuthenticated, async (req, res) => {
    const { iniciadornomyape } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "Si" }, { iniciadornomyape: { $regex: iniciadornomyape, $options: "i" } }] }).lean().sort({ iniciadornomyape: 'desc' });;
    if (!expedientes) {
        req.flash('success_msg', 'cargue un Iniciador (N y A)')
        return res.render("notes/borrados/borradolistexpedientes");
    } else {
        res.render('notes/borrados/borradolistexpedientes', { expedientes })
    }
});

router.post('/expedientes/borradofindestado', isAuthenticated, async (req, res) => {
    const { estado } = req.body;
    const expedientes = await Expediente.find({ $and: [{ borrado: "Si" }, { estado: { $regex: estado, $options: "i" } }] }).lean().sort({ iniciadornomyape: 'desc' });
    if (!expedientes) {
        req.flash('success_msg', 'cargue estado (N y A)')
        return res.render("notes/borrados/borradolistexpedientes");
    } else {
        res.render('notes/borrados/borradolistexpedientes', { expedientes })
    }
});


router.put('/notes/editexpediente/:id', isAuthenticated, async (req, res) => {
    const { borrado, userborrado, fechaborrado, juzgado, secretaria, numexpediente,
        tipo, ultimanotificacion, caratula, dateexp,  partes, actor, demandado, estado, user, name, fotoexpediente, } = req.body
    await Expediente.findByIdAndUpdate(req.params.id, {
        borrado, userborrado, fechaborrado, juzgado, secretaria, numexpediente,
        tipo, ultimanotificacion, partes, actor, demandado, estado, user, name, fotoexpediente, caratula, dateexp,  
    });
    req.flash('success_msg', 'Expediente actualizado')
    res.redirect('/expedientes/listado');
});

router.delete('/expedientes/delete/:id', isAuthenticated, async (req, res) => {
    await Expediente.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'expediente Eliminado')
    res.redirect('/expedientes/borradolistado')
});

router.put('/expedientes/marcadelete/:id', isAuthenticated, async (req, res) => {
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Expediente.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Expediente a Papelera Reciclaje')
    res.redirect('/expedientes/listado');
});

router.put('/expedientes/marcadeleteexpedientesclientes/:id', isAuthenticated, async (req, res) => {
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Expedientecliente.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Cliente Expediente a Papelera')
    res.redirect('/expedientes/listado');
});

router.put('/expedientes/marcadeleteexpedientesjuzgado/:id', isAuthenticated, async (req, res) => {
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Expedientejuzgado.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Juzgado Expediente a Papelera')
    res.redirect('/expedientes/listado');
});


router.put('/expedientes/recuperarlistado', isAuthenticated, async (req, res) => {
    //await Multas.updateMany({ borrado: "Si", fechaborrado: new Date(), userborrado:req.user.name});    
    await Expediente.updateMany({ borrado: 'Si' }, { borrado: "No", fechaborrado: "Recuperado" });
    req.flash('success_msg', 'todos los datos de Expedientes recuperados')
    res.redirect('/expedientes/listado');
});

router.put('/expedientes/marcadeleterestaurar/:id', isAuthenticated, async (req, res) => {
    const borrado = "No";
    const fechaborrado = "Restaurado";
    const userborrado = req.user.name;
    await Expediente.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Expediente Restaurado')
    res.redirect('/expedientes/borradolistado');
});

router.get('/expedientes/expedientejuzgado/add/:id', isAuthenticated, async (req, res) => {
    const expediente = await Expediente.findById(req.params.id).lean()
    const juzgado = await Juzgados.find({ borrado: "No" }).lean()
    //const expedientejuzgado = await Expedientejuzgado.find({ borrado: "No" },{ idexpediente: req.params.id}).lean().limit().sort({ date: 'desc' }); 
    res.render('notes/expedientes/newjuzgadoexpediente.hbs', { expediente, juzgado })
});

router.post('/notes/newexpedientejuzgado', isAuthenticated, async (req, res) => {
    const { borrado, userborrado, fechaborrado, idjuzgadoexpediente, bajajuzgado, idjuzgado, numjuzgado, paisjuzgado, provinciajuzgado, 
        localidadjuzgado, idexpediente, numexpediente, caratula, estado
    } = req.body;
    const newExpedientejuzgado = new Expedientejuzgado({
        borrado, userborrado, fechaborrado, idjuzgadoexpediente, bajajuzgado, idjuzgado, numjuzgado, paisjuzgado, provinciajuzgado, 
        localidadjuzgado, idexpediente, numexpediente, caratula, estado
    });
    newExpedientejuzgado.user = req.user.id;
    newExpedientejuzgado.name = req.user.name;
    await newExpedientejuzgado.save();
    req.flash('success_msg', 'Juzgado agregado al Expediente');
    res.redirect('/expedientes/listado');
});

router.get('/expedientes/expedienteabogado/add/:id', isAuthenticated, async (req, res) => {
    const expediente = await Expediente.findById(req.params.id).lean()
    const abogado = await Abogados.find({ borrado: "No" }).lean()
    //const expedientejuzgado = await Expedientejuzgado.find({ borrado: "No" },{ idexpediente: req.params.id}).lean().limit().sort({ date: 'desc' }); 
    res.render('notes/expedientes/newabogadoexpediente.hbs', { expediente, abogado })
});

router.post('/notes/newexpedienteabogado', isAuthenticated, async (req, res) => {
    const { borrado, userborrado, fechaborrado, bajaabogado, idabogado, nyaabogado, dniabogado, matriculaabogado, 
        idexpediente, numexpediente, caratula, estado } = req.body;
    const newExpedienteabogado = new Expedienteabogado({
        borrado, userborrado, fechaborrado, bajaabogado, idabogado, nyaabogado, dniabogado, matriculaabogado, 
        idexpediente, numexpediente, caratula, estado
    });
    newExpedienteabogado.user = req.user.id;
    newExpedienteabogado.name = req.user.name;
    await newExpedienteabogado.save();
    req.flash('success_msg', 'Abogado agregado al Expediente');
    res.redirect('/expedientes/listado');
});

router.get('/expedientes/expedientecliente/add/:id', isAuthenticated, async (req, res) => {
    const expediente = await Expediente.findById(req.params.id).lean()
    const cliente = await Clientes.find({ borrado: "No" }).lean()
    //const expedientejuzgado = await Expedientejuzgado.find({ borrado: "No" },{ idexpediente: req.params.id}).lean().limit().sort({ date: 'desc' });       
    res.render('notes/expedientes/newclienteexpediente.hbs', { expediente, cliente })
});

router.post('/notes/newexpedientecliente', isAuthenticated, async (req, res) => {
    const { borrado, userborrado, fechaborrado, bajacliente, idcliente, nyacliente, dnicliente,
        idexpediente, numexpediente, caratula, estado
    } = req.body;
    const newExpedientecliente = new Expedientecliente({
        borrado, userborrado, fechaborrado, bajacliente, idcliente, nyacliente, dnicliente,
        idexpediente, numexpediente, caratula, estado
    });
    newExpedientecliente.user = req.user.id;
    newExpedientecliente.name = req.user.name;
    await newExpedientecliente.save();
    req.flash('success_msg', 'Cliente agregado al Expediente');
    res.redirect('/expedientes/listado');
});

// *** SI O SI LOS MODULE EXPLORTS ***
module.exports = router;
