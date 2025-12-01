const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
//const mongopagi = require('mongoose-paginate-v2') Paginacion de mongodb
// tengo que requerir los modelos para que mongoose me cree las tablas
// const Expediente = require('../models/Expediente')
const Note = require('../models/Note')
// const Intimacion = require('../models/Intimacion')
// const Infraccion = require('../models/Infraccion')
//const Estadistica = require('../models/Estadistica')
// const Ticket = require('../models/Ticket')
// const Ticketcoordresultado = require('../models/ticketcoordresultado');
const Users = require('../models/User')
// const Inspectores = require('../models/inspectores')
// const Planiregactuainf = require('../models/planiregactuainf')
//const Cicloinspeccion = require('../models/cicloinspeccion')
const fs = require('fs').promises
const { isAuthenticated } = require('../helpers/auth')
const funcionesimportantes = require('../funciones/importantes');

// *ZONA PDF* //
const pdf = require("html-pdf");
const User = require('../models/User');
const { redirect } = require('react-router-dom');
var pdfoptionsA4 = { format: 'A4' };

//**** sector de recuperacoin de borrados a bases de datos no preparadas *****/
router.get('/marcarborradosennoall', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador") {
        const infraccions = await Infraccion.find().lean().sort({ date: 'desc' });
        res.render('notes/borrados/marcarborradosennoall');
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA ESTE AREA')
        return res.redirect('/');
    }
});

router.get('/tickets/add', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Programador") {
        const usuarios = await Users.find().lean().sort({ date: 'desc' });
        res.render('notes/newtickets');
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TICKETS')
        return res.redirect('/');
    }
});

router.get('/notes/add', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Programador") {
        const usuarios = await Users.find().lean().sort({ date: 'desc' });
        res.render('notes/inspecciones/newnotes');
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INSPECCIONES')
        return res.redirect('/');
    }
});

router.get('/intimaciones/add', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Programador") {
        const usuarios = await Users.find().lean().sort({ date: 'desc' });
        res.render('notes/newintimaciones');
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INTIMACIONES')
        return res.redirect('/');
    }
});

router.get('/intimaciones/add/:id', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Programador") {
        const intimacion = await Intimacion.findById(req.params.id).lean();
        res.render('notes/newintimaciones', { intimacion });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INTIMACIONES')
        return res.redirect('/');
    }
})

router.get('/infracciones/add', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Programador") {
        const usuarios = await Users.find().lean().sort({ date: 'desc' });
        res.render('notes/newinfracciones');
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INFRACCIONES')
        return res.redirect('/');
    }
})

// router.get('/estadisticas/add', isAuthenticated, (req, res) => {
//     const rolusuario = req.user.rolusuario;
//     if (rolusuario == "Administrador" || rolusuario == "Programador") {
//         res.render('notes/newestadisticas');
//     } else {
//         req.flash('success_msg', 'NO TIENE PERMISO PARA AREA ESTADISTICAS')
//         return res.redirect('/');
//     }
// })

router.post('/notes/newtickets', isAuthenticated, async (req, res) => {

    const {
        plataforma, numticket, iniciador, ubicacion, celular, email,
        adrema, directordeobra, destinodeobra, superficieterreno, superficieaconstruir,
        supsubptabja, supsubptaaltaymas, zona, observaciones, permisoobra, actainfraccion,
        fechaentradainspecciones, documentacion, inspeccionfecha, inspeccioninspector, intimaciones,
        infracciones, cantintimaciones, cantinfracciones, pasea, fechapasea, user, name
    } = req.body;

    const newTicket = new Ticket({
        plataforma, numticket, iniciador, ubicacion, celular, email,
        adrema, directordeobra, destinodeobra, superficieterreno, superficieaconstruir,
        supsubptabja, supsubptaaltaymas, zona, observaciones, permisoobra, actainfraccion,
        fechaentradainspecciones, documentacion, inspeccionfecha, inspeccioninspector, intimaciones,
        infracciones, cantintimaciones, cantinfracciones, pasea, fechapasea, user, name
    })
    const mayu = iniciador.replace(/\b\w/g, l => l.toUpperCase())
    newTicket.iniciador = mayu
    newTicket.user = req.user.id;
    newTicket.name = req.user.name;
    await newTicket.save();
    req.flash('success_msg', 'Ticket Agregado Exitosamente');
    res.redirect('/ticket/listado');
});

router.post('/notes/newnotes', isAuthenticated, async (req, res) => {
    const newNote = new Note();
    newNote.origeninspeccion = req.body.origeninspeccion;
    newNote.numinspeccion = req.body.numinspeccion;
    newNote.expediente = req.body.expediente;
    newNote.oficio = req.body.oficio;
    newNote.acta = req.body.acta;
    newNote.adrema = req.body.adrema;
    newNote.date = req.body.date;
    newNote.inspuser = req.body.inspuser;
    newNote.informeinspnum = req.body.informeinspnum;
    newNote.fechaentradinspec = req.body.fechaentradinspec;
    newNote.inspecfecha = req.body.inspecfecha;
    newNote.inspector = req.body.inspector;
    newNote.paseanumdestino = req.body.paseanumdestino;
    newNote.pasea = req.body.pasea;
    newNote.fechapasea = req.body.fechapasea
    if (req.files[0]) {
        newNote.filename = req.files[0].filename;
        newNote.path = '/img/uploads/' + req.files[0].filename;
    }
    if (req.files[1]) {
        newNote.filenamedos = req.files[1].filename;
        newNote.pathdos = '/img/uploads/' + req.files[1].filename;
    }
    if (req.files[2]) {
        newNote.filenametres = req.files[2].filename;
        newNote.pathtres = '/img/uploads/' + req.files[2].filename;
    }
    if (req.files[3]) {
        newNote.filenamecuatro = req.files[3].filename;
        newNote.pathcuatro = '/img/uploads/' + req.files[3].filename;
    }
    if (req.files[4]) {
        newNote.filenamecinco = req.files[4].filename;
        newNote.pathcinco = '/img/uploads/' + req.files[4].filename;
    }
    if (req.files[5]) {
        newNote.filenameseis = req.files[5].filename;
        newNote.pathseis = '/img/uploads/' + req.files[5].filename;
    }
    if (req.files[6]) {
        newNote.filenamesiete = req.files[6].filename;
        newNote.pathsiete = '/img/uploads/' + req.files[6].filename;
    }
    if (req.files[7]) {
        newNote.filenameocho = req.files[7].filename;
        newNote.pathocho = '/img/uploads/' + req.files[7].filename;
    }
    newNote.user = req.user.id;
    newNote.name = req.user.name;
    await newNote.save();
    req.flash('success_msg', 'Inspección Agregado Exitosamente');
    // console.log (newNote)
    res.redirect('/notes');
    // res.send('ok');
    // }
})

router.post('/notes/newintimaciones', isAuthenticated, async (req, res) => {
    //console.log(req.body)
    const { boletaintnum, numexpedienteint, adremaint, senorsenora,
        domiciliopart, lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, user, name
    } = req.body;

    const newIntimacion = new Intimacion({
        boletaintnum, numexpedienteint, adremaint, senorsenora,
        domiciliopart, lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, user, name
    })

    if (req.files[0]) {
        newIntimacion.filename = req.files[0].filename;
        newIntimacion.path = '/img/uploads/' + req.files[0].filename;
    }
    if (req.files[1]) {
        newIntimacion.filenamedos = req.files[1].filename;
        newIntimacion.pathdos = '/img/uploads/' + req.files[1].filename;
    }
    if (req.files[2]) {
        newIntimacion.filenametres = req.files[2].filename;
        newIntimacion.pathtres = '/img/uploads/' + req.files[2].filename;
    }
    if (req.files[3]) {
        newIntimacion.filenamecuatro = req.files[3].filename;
        newIntimacion.pathcuatro = '/img/uploads/' + req.files[3].filename;
    }
    if (req.files[4]) {
        newIntimacion.filenamecinco = req.files[4].filename;
        newIntimacion.pathcinco = '/img/uploads/' + req.files[4].filename;
    }
    if (req.files[5]) {
        newIntimacion.filenameseis = req.files[5].filename;
        newIntimacion.pathseis = '/img/uploads/' + req.files[5].filename;
    }
    if (req.files[6]) {
        newIntimacion.filenamesiete = req.files[6].filename;
        newIntimacion.pathsiete = '/img/uploads/' + req.files[6].filename;
    }
    if (req.files[7]) {
        newIntimacion.filenameocho = req.files[7].filename;
        newIntimacion.pathocho = '/img/uploads/' + req.files[7].filename;
    }
    newIntimacion.user = req.user.id;
    newIntimacion.name = req.user.name;
    await newIntimacion.save();
    req.flash('success_msg', 'Intimación Agregada Exitosamente');
    res.redirect('/intimaciones');
})

router.post('/notes/newintimaciones/:id', isAuthenticated, async (req, res) => {
    //console.log(req.body)
    const { boletaintnum, numexpedienteint, adremaint, senorsenora,
        domiciliopart, lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, eliminado, user, name
    } = req.body;

    const newIntimacion = new Intimacion({
        boletaintnum, numexpedienteint, adremaint, senorsenora,
        domiciliopart, lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, eliminado, user, name
    })

    if (req.files[0]) {
        newIntimacion.filename = req.files[0].filename;
        newIntimacion.path = '/img/uploads/' + req.files[0].filename;
    }
    if (req.files[1]) {
        newIntimacion.filenamedos = req.files[1].filename;
        newIntimacion.pathdos = '/img/uploads/' + req.files[1].filename;
    }
    if (req.files[2]) {
        newIntimacion.filenametres = req.files[2].filename;
        newIntimacion.pathtres = '/img/uploads/' + req.files[2].filename;
    }
    if (req.files[3]) {
        newIntimacion.filenamecuatro = req.files[3].filename;
        newIntimacion.pathcuatro = '/img/uploads/' + req.files[3].filename;
    }
    if (req.files[4]) {
        newIntimacion.filenamecinco = req.files[4].filename;
        newIntimacion.pathcinco = '/img/uploads/' + req.files[4].filename;
    }
    if (req.files[5]) {
        newIntimacion.filenameseis = req.files[5].filename;
        newIntimacion.pathseis = '/img/uploads/' + req.files[5].filename;
    }
    if (req.files[6]) {
        newIntimacion.filenamesiete = req.files[6].filename;
        newIntimacion.pathsiete = '/img/uploads/' + req.files[6].filename;
    }
    if (req.files[7]) {
        newIntimacion.filenameocho = req.files[7].filename;
        newIntimacion.pathocho = '/img/uploads/' + req.files[7].filename;
    }
    newIntimacion.user = req.user.id;
    newIntimacion.name = req.user.name;
    await newIntimacion.save();
    req.flash('success_msg', 'Intimación Agregada Exitosamente');
    res.redirect('/intimaciones');
})

router.post('/notes/newinfracciones', isAuthenticated, async (req, res) => {
    //console.log(req.body)
    const newInfraccion = new Infraccion();
    newInfraccion.actainfnum = req.body.actainfnum;
    newInfraccion.zona = req.body.zona;
    newInfraccion.fechainfraccion = req.body.fechainfraccion;
    newInfraccion.horainfraccion = req.body.horainfraccion;
    newInfraccion.numexpedienteinf = req.body.numexpedienteinf;
    newInfraccion.adremainf = req.body.adremainf;
    newInfraccion.apellidonombrepropietarioinf = req.body.apellidonombrepropietarioinf;
    newInfraccion.domiciliopropietarioinf = req.body.domiciliopropietarioinf;
    newInfraccion.dnipropietarioinf = req.body.dnipropietarioinf;
    newInfraccion.cuilpropietarioinf = req.body.cuilpropietarioinf;
    newInfraccion.lugardeconstitucioninf = req.body.lugardeconstitucioninf;
    newInfraccion.causasinf = req.body.causasinf;
    newInfraccion.ordenanzanum = req.body.ordenanzanum;
    newInfraccion.notificadoinf = req.body.notificadoinf;
    newInfraccion.incisonum = req.body.incisonum;
    newInfraccion.observacion = req.body.observacion;
    newInfraccion.apellidonombretestigoinf = req.body.apellidonombretestigoinf;
    newInfraccion.inspectorinf = req.body.inspectorinf;
    newInfraccion.inspectorcod = req.body.inspectorcod;
    newInfraccion.detallegeneral = req.body.detallegeneral;
    newInfraccion.informeinspecnum = req.body.informeinspecnum;
    newInfraccion.inforinspecobsevaciones = req.body.inforinspecobsevaciones;

    if (req.files[0]) {
        newInfraccion.filename = req.files[0].filename;
        newInfraccion.path = '/img/uploads/' + req.files[0].filename;
    }
    if (req.files[1]) {
        newInfraccion.filenamedos = req.files[1].filename;
        newInfraccion.pathdos = '/img/uploads/' + req.files[1].filename;
    }
    if (req.files[2]) {
        newInfraccion.filenametres = req.files[2].filename;
        newInfraccion.pathtres = '/img/uploads/' + req.files[2].filename;
    }
    if (req.files[3]) {
        newInfraccion.filenamecuatro = req.files[3].filename;
        newInfraccion.pathcuatro = '/img/uploads/' + req.files[3].filename;
    }
    if (req.files[4]) {
        newInfraccion.filenamecinco = req.files[4].filename;
        newInfraccion.pathcinco = '/img/uploads/' + req.files[4].filename;
    }
    if (req.files[5]) {
        newInfraccion.filenameseis = req.files[5].filename;
        newInfraccion.pathseis = '/img/uploads/' + req.files[5].filename;
    }
    if (req.files[6]) {
        newInfraccion.filenamesiete = req.files[6].filename;
        newInfraccion.pathsiete = '/img/uploads/' + req.files[6].filename;
    }
    if (req.files[7]) {
        newInfraccion.filenameocho = req.files[7].filename;
        newInfraccion.pathocho = '/img/uploads/' + req.files[7].filename;
    }
    newInfraccion.user = req.user.id;
    newInfraccion.name = req.user.name;
    await newInfraccion.save();
    req.flash('success_msg', 'Infracción Agregada Exitosamente');
    // console.log (newNote)
    res.redirect('/infracciones');
    // res.send('ok');
    // }
})

// *** DESACTIVADO TEMPORALMENTE ESTADISTICA ****
// router.post('/notes/newestadisticas', isAuthenticated, async (req, res) => {
//     //console.log(req.body)
//     const {  estadisticanum, fechaestadistica, horaestadistica, user ,name
//     } = req.body;
//     const errors = [];
//     if (!estadisticanum) {
//         errors.push({ text: "Ingrese Nº Estadistica" })
//     }
//     if (!fechaestadistica) {
//         errors.push({ text: "Ingrese Fecha Actual" })
//     }
//     // if (!inspector){
//     //     errors.push({text: "Ingrese Nombre Inspector/Usuario"})
//     // }
//     console.log(errors)
//     if (errors.length > 0) {
//         res.render('notes/newestadisticas', {
//             errors,
//             estadisticanum, fechaestadistica, horaestadistica
//         })
//     } else {
//         const newEstadistica = new Estadistica({
//             estadisticanum, fechaestadistica, horaestadistica, user ,name
//         })
//         newEstadistica.user = req.user.id;
//         newEstadistica.name = req.user.name;
//         await newEstadistica.save();
//         req.flash('success_msg', 'Estadistica Creada Exitosamente');
//         // console.log (newNote)
//         res.redirect('/estadisticas');
//         // res.send('ok');
//     }
// })

// aca llama los expedientes de la bd, pero si necesito que llame solo de usuarios especificos debo especificar en find
//
router.get('/usuarios', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        const usuarios = await Users.find().lean().sort({ date: 'desc' });
        res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA USUARIOS')
        return res.redirect('/');
    }
});

router.get('/Inspectores', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador") {
        const inspectores = await Inspectores.find().lean().sort({ date: 'desc' });
        res.render('notes/allinspectoresadm', { inspectores });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA USUARIOS')
        return res.redirect('/');
    }
});

router.get('/ticket/listado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Inspector") {
        const ticket = await Ticket.find().limit(500).lean().sort({ date: 'desc' });;
        res.render('notes/planillalistaticket', { ticket });
    } else if (rolusuario == "Administrador" || rolusuario == "Programador") {
        const ticket = await Ticket.find().limit(500).lean().sort({ date: 'desc' });
        res.render('notes/planillalistaticketadm', { ticket });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA MESA DE ENTRADA')
        return res.redirect('/');
    }
});

router.get('/movimientoticketcoord/add/:id', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const ticket = await Ticket.findById(req.params.id).lean();
    const inspectorestabla = await Inspectores.find({ borrado: "No" }).lean().sort();
    const usuarios = await Users.find().lean().sort({ date: 'desc' });
    var inspectoresname = []
    var inspectorescodigo = []
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Programador") {
        for (var inspectores of inspectorestabla) {
            inspectoresname.push(inspectores.name)
            inspectorescodigo.push(inspectores.codigoinspector)
        }
        res.render('notes/inspecciones/expticket/movimientoticketcood.hbs', { ticket, inspectoresname, inspectorescodigo });;
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TICKETs')
        return res.redirect('/');
    }
});

router.get('/ticket/coordinados/listresultado/:id', isAuthenticated, async (req, res) => {
    var ticketcoordinado = await Ticket.findById(req.params.id).lean()
    var idticket = ticketcoordinado._id
    var ticketcoordresultadotabla = await Ticketcoordresultado.find({ $and: [{ borrado: "No" }, { idticket: idticket }] }).lean().sort({ date: 'desc' });

    for (var ticketcoordresultado of ticketcoordresultadotabla) {
        //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
        //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;    

        // permite mostrar en las tablas la fecha sola y ordenada
        var tipoint = ticketcoordresultado.fechaintimacion;
        if (tipoint != null) {
            const fecha = new Date(ticketcoordresultado.fechaintimacion);
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
            ticketcoordresultado.fechaintimacion = fullyear;
        } else {
            ticketcoordresultado.fechaintimacion = "----"
        }

        var tipoinf = ticketcoordresultado.fechainfraccion;
        if (tipoinf != null) {
            const fecha = new Date(ticketcoordresultado.fechainfraccion);
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
            ticketcoordresultado.fechainfraccion = fullyear;
        } else {
            ticketcoordresultado.fechainfraccion = "----"
        }
        // fechaActual.toString() = expedcoordresultado.fechaintimacion.slice(0, 10); //.slice(inicioTrozo[, finTrozo])
        // expedcoordresultado.fechaintimacion = parseInt(fechaActual);
        // necesito igualar para que se copie el cambio
        ticketcoordresultado = ticketcoordresultadotabla
        //console.log("expedcoordresultado", expedcoordresultado);
        //console.log("expedcoordresultadotabla", expedcoordresultadotabla);
    }
    res.render('notes/infracciones/listaticketcoordmov', { ticketcoordresultado, ticketcoordinado })
});

router.get('/notes', isAuthenticated, async (req, res) => { // (INSPECCIONES)
    // res.send('Notes from data base');
    // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        const notes = await Note.find().lean().sort({ numinspeccion: 'desc' });
        res.render('notes/inspecciones/allnotesadm', { notes });
    } else if (rolusuario == "Inspector") {
        const notes = await Note.find().lean().sort({ numinspeccion: 'desc' });
        res.render('notes/inspecciones/allnotes', { notes });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INSPECCIONES')
        return res.redirect('/');
    }
});

router.get('/notes/listado', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        const inspeccions = await Note.find().lean().sort({ date: 'desc' });
        res.render('notes/inspecciones/planillalistainspeccionadm', { inspeccions });
    } else if (rolusuario == "Inspector") {
        const inspeccions = await Note.find().lean().sort({ date: 'desc' });
        res.render('notes/inspecciones/planillalistainspeccionusr', { inspeccions });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INTIMACIONES')
        return res.redirect('/');
    }
});

router.get('/intimaciones', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        const intimacions = await Intimacion.find().lean().sort({ date: 'desc' });
        res.render('notes/allintimadm', { intimacions });
    } else if (rolusuario == "Inspector") {
        const intimacions = await Intimacion.find().lean().sort({ date: 'desc' });
        res.render('notes/allintim', { intimacions });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INTIMACIONES')
        return res.redirect('/');
    }
});

router.get('/intimaciones/listado', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        const intimacions = await Intimacion.find().lean().sort({ date: 'desc' });
        res.render('notes/planillalistaintimacion', { intimacions });
    } else if (rolusuario == "Inspector") {
        const intimacions = await Intimacion.find().lean().sort({ date: 'desc' });
        res.render('notes/planillalistaintimacion', { intimacions });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INTIMACIONES')
        return res.redirect('/');
    }
});

router.get('/infracciones', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        const infraccions = await Infraccion.find().lean().sort({ date: 'desc' });
        res.render('notes/allinfraccadm', { infraccions });
    } else if (rolusuario == "Inspector") {
        const infraccions = await Infraccion.find().lean().sort({ date: 'desc' });
        res.render('notes/allinfracc', { infraccions });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INFRACCIONES')
        return res.redirect('/');
    }
});

router.get('/infracciones/listado', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        const infracciones = await Infraccion.find().lean().sort({ date: 'desc' });
        res.render('notes/planillalistainfraccion', { infracciones });
    } else if (rolusuario == "Inspector") {
        const infracciones = await Infraccion.find().lean().sort({ date: 'desc' });
        res.render('notes/planillalistainfraccion', { infracciones });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INFRACCIONES')
        return res.redirect('/');
    }
});

// router.get('/estadisticas', isAuthenticated, async (req, res) => {
//     // res.send('Notes from data base');
//     const rolusuario = req.user.rolusuario;
//     if (rolusuario == "Administrador" || rolusuario == "Programador") {
//         const estadisticas = await Estadistica.find().lean().sort({ estadisticanum: 'asc' });
//         res.render('notes/allestadistica', { estadisticas });
//     } else {
//         req.flash('success_msg', 'NO TIENE PERMISO PARA AREA ESTADISTICAS')
//         return res.redirect('/');
//     }
//     //para que muestre notas de un solo user
//     // const estadisticas = await Estadistica.find({user : req.user.id}).lean().sort({estadisticanum:'desc'}); 
// });

router.get('/usuarios', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador") {
        const infracciones = await Infraccion.find().lean().sort({ date: 'desc' });
        res.render('notes/allusuariosadm', { infracciones });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA USUARIOS')
        return res.redirect('/');
    }
});

// ***** Aca los GET para EDITAR ******

router.get('/usuario/edit/:id', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Programador") {
        const usuarios = await Users.findById(req.params.id).lean();
        res.render('users/editusuarios', { usuarios })
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO AREA EDIT USUARIOS')
        return res.redirect('/usuarios');
    }
});

router.get('/tickets/edit/:id', isAuthenticated, async (req, res) => {
    const ticket = await Ticket.findById(req.params.id).lean()
    res.render('notes/editticket', { ticket })
});

router.get('/notes/edit/:id', isAuthenticated, async (req, res) => {
    const note = await Note.findById(req.params.id).lean()
    res.render('notes/inspecciones/editnote', { note })
});

router.get('/intimaciones/edit/:id', isAuthenticated, async (req, res) => {
    const intimacion = await Intimacion.findById(req.params.id).lean()
    res.render('notes/editintimacion', { intimacion })
});

router.get('/infracciones/edit/:id', isAuthenticated, async (req, res) => {
    const infraccion = await Infraccion.findById(req.params.id).lean()
    res.render('notes/editinfraccion', { infraccion })
});

// router.get('/estadisticas/edit/:id', isAuthenticated, async (req, res) => {
//     const estadistica = await Estadistica.findById(req.params.id).lean()
//     res.render('notes/editestadistica', { estadistica })
// });

// ***** informacion de cada dato ****** LISTADOS
router.get('/usuario/list', isAuthenticated, async (req, res) => {
    const email = req.user.email;
    const users = await Users.find({ email: email }).lean()
    res.render('notes/listusuarioactual', { users })
});

router.get('/usuario/list/:id', isAuthenticated, async (req, res) => {
    const _id = req.params.id
    const users = await Users.find({ _id: _id }).lean()
    res.render('notes/listusuario', { users })
});

router.get('/ticket/list/:id', isAuthenticated, async (req, res) => {
    const ticket = await Ticket.findById(req.params.id).lean()
    res.render('notes/listticket', { ticket })
});

router.get('/notes/list/:id', isAuthenticated, async (req, res) => {
    const note = await Note.findById(req.params.id).lean()
    res.render('notes/inspecciones/listnote', { note })
});

router.get('/intimaciones/list/:id', isAuthenticated, async (req, res) => {
    const intimacion = await Intimacion.findById(req.params.id).lean()
    res.render('notes/listintimacion', { intimacion })
});

router.get('/infracciones/list/:id', isAuthenticated, async (req, res) => {
    const infraccion = await Infraccion.findById(req.params.id).lean()
    res.render('notes/listinfraccion', { infraccion })
});

// router.get('/estadisticas/list/:id', isAuthenticated, async (req, res) => {
//     const estadistica = await Estadistica.findById(req.params.id).lean()
//     res.render('notes/listestadistica', { estadistica })
// });

//  ***** SECTOR BUSQUEDA *****

// *** BUSCAR EN TICKET ***
router.post('/ticket/findlistaticket', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { numticket } = req.body;
    const ticket = await Ticket.find({ numticket: { $regex: numticket, $options: "i" } }).lean().sort({ date: 'desc' })
    if (rolusuario == "Programador") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticket");
        } else {
            res.render('notes/planillalistaticket', { ticket })
        }
    } else if (rolusuario == "Administrador") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticketadm");
        } else {
            res.render('notes/planillalistaticketadm', { ticket })
        }
    } else {
        res.render('notes/planillalistaticket', { ticket })
    }
});

router.post('/ticket/findlistainiciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { iniciador } = req.body;
    const ticket = await Ticket.find({ iniciador: { $regex: iniciador, $options: "i" } }).lean().sort({ date: 'desc' })
    if (rolusuario == "Inspector") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticket");
        } else {
            res.render('notes/planillalistaticket', { ticket })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticketadm");
        } else {
            res.render('notes/planillalistaticketadm', { ticket })
        }
    } else {
        res.render('notes/planillalistaticket', { ticket })
    }
});

router.post('/ticket/findlistaadrema', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { adrema } = req.body;
    const ticket = await Ticket.find({ adrema: { $regex: adrema, $options: "i" } }).lean().sort({ date: 'desc' })
    if (rolusuario == "Inspector") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticket");
        } else {
            res.render('notes/planillalistaticket', { ticket })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticketadm");
        } else {
            res.render('notes/planillalistaticketadm', { ticket })
        }
    } else {
        res.render('notes/planillalistaticket', { ticket })
    }
});

router.post('/ticket/findlistadireccion', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { ubicacion } = req.body;
    const ticket = await Ticket.find({ ubicacion: { $regex: ubicacion, $options: "i" } }).lean().sort({ date: 'desc' })
    if (rolusuario == "Inspector") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticket");
        } else {
            res.render('notes/planillalistaticket', { ticket })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticketadm");
        } else {
            res.render('notes/planillalistaticketadm', { ticket })
        }
    } else {
        res.render('notes/planillalistaticket', { ticket })
    }
});

router.post('/ticket/findlistafechainsp', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { inspeccionfecha } = req.body;
    const ticket = await Ticket.find({ inspeccionfecha: { $regex: inspeccionfecha, $options: "i" } }).lean().sort({ date: 'desc' })
    if (rolusuario == "Inspector") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticket");
        } else {
            res.render('notes/planillalistaticket', { ticket })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!ticket) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/planillalistaticketadm");
        } else {
            res.render('notes/planillalistaticketadm', { ticket })
        }
    } else {
        res.render('notes/planillalistaticket', { ticket })
    }
});



// *** BUSCAR INSPECCIONES ***
router.post('/notes/findinspeccion', isAuthenticated, async (req, res) => {
    const { numinspeccion } = req.body;
    const notes = await Note.find({ numinspeccion: { $regex: numinspeccion, $options: "i" } }).lean().sort({ numinspeccion: 'desc' });;
    if (!notes) {
        req.flash('success_msg', 'cargue un Nº de expediente')
        return res.render("notes/inspecciones/allnotes");
    } else {
        res.render('notes/findinspeccion', { notes })
    }
});


router.post('/notes/findadrema', isAuthenticated, async (req, res) => {
    const { adrema } = req.body;
    const notes = await Note.find({ adrema: { $regex: adrema, $options: "i" } }).lean().sort({ adrema: 'desc' });;
    if (!notes) {
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/inspecciones/allnotes");
    } else {
        res.render('notes/findinspeccion', { notes })
    }
});

router.post('/notes/findinspector', isAuthenticated, async (req, res) => {
    const { inspector } = req.body;
    const notes = await Note.find({ inspector: { $regex: inspector, $options: "i" } }).lean().sort({ inspector: 'desc' });;
    if (!notes) {
        req.flash('success_msg', 'cargue un Inspector')
        return res.render("notes/inspecciones/allnotes");
    } else {
        res.render('notes/findinspeccion', { notes })
    }
});

// *** BUSCAR INTIMACIONES ***
router.post('/notes/findintimacion', isAuthenticated, async (req, res) => {
    const { boletaintnum } = req.body;
    const intimacions = await Intimacion.find({ boletaintnum: { $regex: boletaintnum, $options: "i" } }).lean().sort({ numinspeccion: 'desc' });;
    if (!intimacions) {
        req.flash('success_msg', 'cargue una Boleta Intimación')
        return res.render("notes/allintimaciones");
    } else {
        res.render('notes/findintimacion', { intimacions })
    }
});

router.post('/notes/findexpedienteintimacion', isAuthenticated, async (req, res) => {
    const { numexpedienteint } = req.body;
    const intimacions = await Intimacion.find({ numexpedienteint: { $regex: numexpedienteint, $options: "i" } }).lean().sort({ numexpedienteint: 'desc' });;
    if (!intimacions) {
        req.flash('success_msg', 'cargue una Boleta Intimación')
        return res.render("notes/allintimaciones");
    } else {
        res.render('notes/findintimacion', { intimacions })
    }
});

router.post('/notes/findadremaintim', isAuthenticated, async (req, res) => {
    const { adrema } = req.body;
    const intimacions = await Intimacion.find({ adrema: { $regex: adrema, $options: "i" } }).lean().sort({ adrema: 'desc' });;
    if (!intimacions) {
        req.flash('success_msg', 'cargue un Adrema')
        return res.render("notes/allintimaciones");
    } else {
        res.render('notes/findintimacion', { intimacions })
    }
});

router.post('/notes/findinspectorintim', isAuthenticated, async (req, res) => {
    const { inspectorint } = req.body;
    const intimacions = await Intimacion.find({ inspectorint: { $regex: inspectorint, $options: "i" } }).lean().sort({ inspectorint: 'desc' });;
    if (!intimacions) {
        req.flash('success_msg', 'cargue un Inspector')
        return res.render("notes/allintimaciones");
    } else {
        res.render('notes/findintimacion', { intimacions })
    }
});

// *** BUSCAR INFRACCIONES - CARTAS ***
router.post('/notes/findinfraccion', isAuthenticated, async (req, res) => {

    const { actainfnum } = req.body;
    const infraccions = await Infraccion.find({ actainfnum: { $regex: actainfnum, $options: "i" } }).lean().sort({ actainfnum: 'desc' });;
    if (!infraccions) {
        req.flash('success_msg', 'cargue una Boleta Intimación')
        return res.render("notes/allinfracciones");
    } else {
        res.render('notes/findinfraccion', { infraccions })
    }
});

router.post('/notes/findexpedienteinf', isAuthenticated, async (req, res) => {
    const { numexpedienteinf } = req.body;
    const infraccions = await Infraccion.find({ numexpedienteinf: { $regex: numexpedienteinf, $options: "i" } }).lean().sort({ numexpedienteinf: 'desc' });;
    if (!infraccions) {
        req.flash('success_msg', 'cargue un Nº Expediente')
        return res.render("notes/allinfracciones");
    } else {
        res.render('notes/findinfraccion', { infraccions })
    }
});
router.post('/notes/findadremainf', isAuthenticated, async (req, res) => {
    const { adremainf } = req.body;
    const infraccions = await Infraccion.find({ adremainf: { $regex: adremainf, $options: "i" } }).lean().sort({ adremainf: 'desc' });;
    if (!infraccions) {
        req.flash('success_msg', 'cargue un Nº Expediente')
        return res.render("notes/allinfracciones");
    } else {
        res.render('notes/findinfraccion', { infraccions })
    }
});

router.post('/notes/findpropietainf', isAuthenticated, async (req, res) => {
    const { apellidonombrepropietarioinf } = req.body;
    const infraccions = await Infraccion.find({ apellidonombrepropietarioinf: { $regex: apellidonombrepropietarioinf, $options: "i" } }).lean().sort({ apellidonombrepropietarioinf: 'desc' });;
    if (!infraccions) {
        req.flash('success_msg', 'cargue un Nº Expediente')
        return res.render("notes/allinfracciones");
    } else {
        res.render('notes/findinfraccion', { infraccions })
    }
});

// *** BUSCAR INFRACCIONES - LISTADO ***
router.post('/infracciones/findinfraccion', isAuthenticated, async (req, res) => {
    const { actainfnum } = req.body;
    const infracciones = await Infraccion.find({ actainfnum: { $regex: actainfnum, $options: "i" } }).lean().sort({ actainfnum: 'desc' });;
    if (!infracciones) {
        req.flash('success_msg', 'cargue una Boleta Intimación')
        return res.render("notes/planillalistainfraccion");
    } else {
        res.render('notes/planillalistainfraccion', { infracciones })
    }
});

router.post('/infracciones/findexpedienteinf', isAuthenticated, async (req, res) => {
    const { numexpedienteinf } = req.body;
    const infracciones = await Infraccion.find({ numexpedienteinf: { $regex: numexpedienteinf, $options: "i" } }).lean().sort({ numexpedienteinf: 'desc' });;
    if (!infracciones) {
        req.flash('success_msg', 'cargue un Nº Expediente')
        return res.render("notes/planillalistainfraccion");
    } else {
        res.render('notes/planillalistainfraccion', { infracciones })
    }
});

router.post('/infracciones/dniinf', isAuthenticated, async (req, res) => {
    const { dnipropietarioinf } = req.body;
    const infracciones = await Infraccion.find({ dnipropietarioinf: { $regex: dnipropietarioinf, $options: "i" } }).lean().sort({ dnipropietarioinf: 'desc' });;
    if (!infracciones) {
        req.flash('success_msg', 'cargue un Nº D.N.I.')
        return res.render("notes/planillalistainfraccion");
    } else {
        res.render('notes/planillalistainfraccion', { infracciones })
    }
});

router.post('/infracciones/findlistaadrema', isAuthenticated, async (req, res) => {
    const { adremainf } = req.body;
    const infracciones = await Infraccion.find({ adremainf: { $regex: adremainf, $options: "i" } }).lean().sort({ adremainf: 'desc' });;
    if (!infracciones) {
        req.flash('success_msg', 'cargue un Nº Expediente')
        return res.render("notes/planillalistainfraccion");
    } else {
        res.render('notes/planillalistainfraccion', { infracciones })
    }
});

router.post('/infracciones/findpropietainf', isAuthenticated, async (req, res) => {
    const { apellidonombrepropietarioinf } = req.body;
    const infracciones = await Infraccion.find({ apellidonombrepropietarioinf: { $regex: apellidonombrepropietarioinf, $options: "i" } }).lean().sort({ apellidonombrepropietarioinf: 'desc' });;
    if (!infracciones) {
        req.flash('success_msg', 'cargue un Nombre y Apellido')
        return res.render("notes/planillalistainfraccion");
    } else {
        res.render('notes/planillalistainfraccion', { infracciones })
    }
});

router.post('/infracciones/findlistafechaentrada', isAuthenticated, async (req, res) => {
    const { fechainfraccion } = req.body;
    const infracciones = await Infraccion.find({ fechainfraccion: { $regex: fechainfraccion, $options: "i" } }).lean().sort({ fechainfraccion: 'desc' });;
    if (!infracciones) {
        req.flash('success_msg', 'cargue una Fecha')
        return res.render("notes/planillalistainfraccion");
    } else {
        res.render('notes/planillalistainfraccion', { infracciones })
    }
});

// *** BUSCAR ESTADISTICAS - CARTAS ***
router.post('/notes/findnumestadistica', isAuthenticated, async (req, res) => {
    const { estadisticanum } = req.body;
    const estadisticas = await Estadistica.find({ estadisticanum: { $regex: estadisticanum, $options: "i" } }).lean().sort({ estadisticanum: 'desc' });;
    if (!estadisticas) {
        req.flash('success_msg', 'cargue un Nº Estadistica')
        return res.render("notes/allestadistica");
    } else {
        res.render('notes/findestadistica', { estadisticas })
    }
});
router.post('/notes/findfechaestadistica', isAuthenticated, async (req, res) => {
    // const numexpediente = req.query.id;
    // ({"name": /desarrolladores/i})
    const { fechaestadistica } = req.body;
    const estadisticas = await Estadistica.find({ fechaestadistica: { $regex: fechaestadistica, $options: "i" } }).lean().sort({ fechaestadistica: 'desc' });;
    if (!estadisticas) {
        req.flash('success_msg', 'cargue una Fecha Valida')
        return res.render("notes/allestadistica");
    } else {
        res.render('notes/findestadistica', { estadisticas })
    }
});

// **** AGREGAR OTRA INTIMACION A MISMA PERSONA****
router.put('/notes/editaddintimacion/:id', isAuthenticated, async (req, res) => {
    const { boletaintnum, numexpedienteint, adremaint, senorsenora, domiciliopart,
        lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, fotoint } = req.body
    await Intimacion.findByIdAndUpdate(req.params.id, {
        boletaintnum, numexpedienteint, adremaint,
        senorsenora, domiciliopart, lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, fotoint
    });
    req.flash('success_msg', 'Nueva Intimación Agregada')
    res.redirect('/intimaciones');
});

// **** SECTOR EDITAR ****

router.put('/users/editusuarios/:id', isAuthenticated, async (req, res) => {
    // const { name, dni, codigoinspector, funcion, email, rolusuario } = req.body
    const { idestudio, numestudio, rolusuario, name, celular, email, dni, codigousuario, funcion}  = req.body
    await Users.findByIdAndUpdate(req.params.id, {
         idestudio, numestudio, rolusuario, name, celular, email, dni, codigousuario, funcion
    });
    req.flash('success_msg', 'Usuario Actualizado')
    res.redirect('/usuarios');
});

router.put('/notes/editticket/:id', isAuthenticated, async (req, res) => {
    const { plataforma, numticket, iniciador, ubicacion, celular, email,
        adrema, directordeobra, destinodeobra, superficieterreno, superficieaconstruir,
        supsubptabja, supsubptaaltaymas, zona, observaciones, permisoobra, actainfraccion,
        fechaentradainspecciones, documentacion, inspeccionfecha, inspeccioninspector, intimaciones,
        infracciones, cantintimaciones, cantinfracciones, pasea, fechapasea, user, name
    } = req.body
    await Ticket.findByIdAndUpdate(req.params.id, {
        plataforma, numticket, iniciador, ubicacion, celular, email,
        adrema, directordeobra, destinodeobra, superficieterreno, superficieaconstruir,
        supsubptabja, supsubptaaltaymas, zona, observaciones, permisoobra, actainfraccion,
        fechaentradainspecciones, documentacion, inspeccionfecha, inspeccioninspector, intimaciones,
        infracciones, cantintimaciones, cantinfracciones, pasea, fechapasea, user, name
    });
    req.flash('success_msg', 'Ticket Actualizado')
    res.redirect('/ticket/listado');
});

router.put('/notes/inspecciones/editnote/:id', isAuthenticated, async (req, res) => {
    const { numinspeccion, expediente, oficio, acta, adrema, date, inspuser,
        informeinspnum, fechaentradinspec, inspecfecha, inspector,
        fotoinspeccion, intimacion, infraccion, observacion, paseanumdestino,
        pasea, fechapasea } = req.body
    await Note.findByIdAndUpdate(req.params.id, {
        numinspeccion, expediente, oficio, acta, adrema, date, inspuser,
        informeinspnum, fechaentradinspec, inspecfecha, inspector,
        fotoinspeccion, intimacion, infraccion, observacion, paseanumdestino,
        pasea, fechapasea
    });
    req.flash('success_msg', 'Inspección actualizada')
    res.redirect('/notes/listado');
});

router.put('/notes/editintimacion/:id', isAuthenticated, async (req, res) => {
    const { boletaintnum, numexpedienteint, adremaint, senorsenora, domiciliopart,
        lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, fotoint } = req.body
    await Intimacion.findByIdAndUpdate(req.params.id, {
        boletaintnum, numexpedienteint, adremaint,
        senorsenora, domiciliopart, lugaractuacion, otorgaplazode, paracumplimientoa,
        fechaintimacion, horaintimacion, vencimientoint, notificadoint, aclaracion,
        numcodigoint, inspectorint, fotoint
    });
    req.flash('success_msg', 'Intimación actualizada')
    res.redirect('/intimaciones');
});

router.put('/notes/editinfraccion/:id', isAuthenticated, async (req, res) => {
    const { actainfnum, fechainfraccion, horainfraccion, numexpedienteinf, adremainf,
        apellidonombrepropietarioinf, domiciliopropietarioinf, dnipropietarioinf, cuilpropietarioinf,
        lugardeconstitucioninf, causasinf, ordenanzanum, notificadoinf, incisonum,
        observacion, apellidonombretestigoinf, inspectorinf, inspectorcod, detallegeneral,
        informeinspecnum, inforinspecobsevaciones, fotoinf } = req.body
    await Infraccion.findByIdAndUpdate(req.params.id, {
        actainfnum, fechainfraccion, horainfraccion, numexpedienteinf, adremainf,
        apellidonombrepropietarioinf, domiciliopropietarioinf, dnipropietarioinf, cuilpropietarioinf,
        lugardeconstitucioninf, causasinf, ordenanzanum, notificadoinf, incisonum,
        observacion, apellidonombretestigoinf, inspectorinf, inspectorcod, detallegeneral,
        informeinspecnum, inforinspecobsevaciones, fotoinf
    });
    req.flash('success_msg', 'Infraccion actualizada')
    res.redirect('/infracciones');
});

// **** SECTOR DELETE ****

// router.delete('/usuarios/delete/:id', isAuthenticated, async (req, res) => {

//     var usuarios = await Users.find().lean().sort();
//     if (usuarios.length > 1) {
//         await Users.findByIdAndDelete(req.params.id);
//         req.flash('success_msg', 'Usuario Eliminado')
//         res.redirect('/usuarios')
//     }
//     else {
//         req.flash('success_msg', 'No puede eliminar usuario único')
//         res.redirect('/usuarios')
//     }
// });

router.delete('/usuarios/delete/:id', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    var usuarios = await User.find().lean().sort();
    if (rolusuario === "Programador" && usuarios.length > 1) {

        // if (usuarios.length > 1) {
        await Users.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Usuario Eliminado Definitivamente')
        res.redirect('/usuarios')
        // }
        // else {
        //     req.flash('success_msg', 'No puede eliminar usuario único')
        //     res.redirect('/usuarios')
        // }
    } else {
        req.flash('success_msg', 'No tiene permiso para Eliminar Usuario - Contacte al Programador');
        return res.redirect('/usuarios');
    }
});

router.delete('/tickets/delete/:id', isAuthenticated, async (req, res) => {
    await Ticket.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Ticket Eliminado')
    res.redirect('/ticket/listado')
});

//NOTES es inspecciones
router.delete('/notes/delete/:id', isAuthenticated, async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Inspección Eliminada')
    res.redirect('/notes/listado')
});

router.delete('/intimaciones/delete/:id', isAuthenticated, async (req, res) => {
    await Intimacion.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Intimación Eliminada')
    res.redirect('/intimaciones')
});

router.delete('/infracciones/delete/:id', isAuthenticated, async (req, res) => {
    await Infraccion.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Infracción Eliminada')
    res.redirect('/infracciones')
});

//*  SECTOR ESTADISTICAS *//
router.get('/infracciones/Estadistica', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    var contador = 0;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Programador" || rolusuario == "Administrador") {
        const infracciones = await Infraccion.find().lean().sort({ date: 'desc' });
        for (let i = 0; i < infracciones.length; i++) {
            contador = contador + 1
        }
        res.render('notes/inspecciones/infracciones/estadisticainfraccion', { infracciones, contador });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

//** SECTOR DE BASE DATOS INFRACCIONES E INTIMACIONES QUE CARGA ALEJANDRO */

router.get('/actuaciones/listado', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    var planiregactuainftabla = {};
    if (rolusuario == "Administrador" || rolusuario == "Programador" || rolusuario == "Inspectores") {
        planiregactuainftabla = await Planiregactuainf.find({ borrado: { $ne: 'Si' } }).limit(150).lean().sort({ fechainiciotramite: 'desc' });
        for (var planiregactuainf of planiregactuainftabla) {
            //llamo funciones para nombres mayusculas y fechas ordenadar            
            planiregactuainf.propietario = funcionesimportantes.NombreMayus(planiregactuainf.propietario);
            planiregactuainf.fechainiciotramite = funcionesimportantes.ordenarfecha(planiregactuainf.fechainiciotramite);
            planiregactuainf.inspector = funcionesimportantes.NombreMayus(planiregactuainf.inspector);
            planiregactuainf.direccion = funcionesimportantes.NombreMayus(planiregactuainf.direccion);
        }
        // necesito igualar para que se copie el cambio
        planiregactuainf = planiregactuainftabla
        //console.log(planiregactuainf)
        res.render('notes/inspecciones/infracciones/planillaactuacionesadm', { planiregactuainf });
    } else if (rolusuario == "Inspector") {
        planiregactuainftabla = await Planiregactuainf.find().lean().sort({ date: 'desc' });
        res.render('notes/inspecciones/infracciones/planillaactuacionesusr', { planiregactuainf });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INTIMACIONES')
        return res.redirect('/');
    }
});

router.get('/actuaciones/listadonombre', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    var planiregactuainftabla = {};
    if (rolusuario == "Administrador" || rolusuario == "Programador" || rolusuario == "Inspectores") {
        planiregactuainftabla = await Planiregactuainf.find({ borrado: { $ne: 'Si' } }).limit(150).lean().sort({ propietario: 'asc' });
        for (var planiregactuainf of planiregactuainftabla) {
            //llamo funciones para nombres mayusculas y fechas ordenadar            
            planiregactuainf.propietario = funcionesimportantes.NombreMayus(planiregactuainf.propietario);
            planiregactuainf.fechainiciotramite = funcionesimportantes.ordenarfecha(planiregactuainf.fechainiciotramite);
            planiregactuainf.inspector = funcionesimportantes.NombreMayus(planiregactuainf.inspector);
            planiregactuainf.direccion = funcionesimportantes.NombreMayus(planiregactuainf.direccion);
        }
        // necesito igualar para que se copie el cambio
        planiregactuainf = planiregactuainftabla
        //console.log(planiregactuainf)
        res.render('notes/inspecciones/infracciones/planillaactuacionesadm', { planiregactuainf });
    } else if (rolusuario == "Inspector") {
        planiregactuainftabla = await Planiregactuainf.find().lean().sort({ date: 'desc' });
        res.render('notes/inspecciones/infracciones/planillaactuacionesusr', { planiregactuainf });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INTIMACIONES')
        return res.redirect('/');
    }
});

router.get('/actuaciones/listadocreacion', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    var planiregactuainftabla = {};
    if (rolusuario == "Administrador" || rolusuario == "Programador" || rolusuario == "Inspectores") {
        planiregactuainftabla = await Planiregactuainf.find({ borrado: { $ne: 'Si' } }).limit(150).lean().sort({ date: 'desc' });
        for (var planiregactuainf of planiregactuainftabla) {
            //llamo funciones para nombres mayusculas y fechas ordenadar            
            planiregactuainf.propietario = funcionesimportantes.NombreMayus(planiregactuainf.propietario);
            planiregactuainf.fechainiciotramite = funcionesimportantes.ordenarfecha(planiregactuainf.fechainiciotramite);
            planiregactuainf.inspector = funcionesimportantes.NombreMayus(planiregactuainf.inspector);
            planiregactuainf.direccion = funcionesimportantes.NombreMayus(planiregactuainf.direccion);
        }
        // necesito igualar para que se copie el cambio
        planiregactuainf = planiregactuainftabla
        //console.log(planiregactuainf)
        res.render('notes/inspecciones/infracciones/planillaactuacionesadm', { planiregactuainf });
    } else if (rolusuario == "Inspector") {
        planiregactuainftabla = await Planiregactuainf.find().lean().sort({ date: 'desc' });
        res.render('notes/inspecciones/infracciones/planillaactuacionesusr', { planiregactuainf });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INTIMACIONES')
        return res.redirect('/');
    }
});

router.get('/actuaciones/borradolistado', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    var planiregactuainftabla = {};
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        planiregactuainftabla = await Planiregactuainf.find({ borrado: { $ne: 'No' } }).limit(50).lean().sort({ fechainiciotramite: 'desc' });
        for (var planiregactuainf of planiregactuainftabla) {
            //llamo funciones para nombres mayusculas y fechas ordenadar            
            planiregactuainf.propietario = funcionesimportantes.NombreMayus(planiregactuainf.propietario);
            planiregactuainf.fechainiciotramite = funcionesimportantes.ordenarfecha(planiregactuainf.fechainiciotramite);
            planiregactuainf.inspector = funcionesimportantes.NombreMayus(planiregactuainf.inspector);
            planiregactuainf.direccion = funcionesimportantes.NombreMayus(planiregactuainf.direccion);
        }
        // necesito igualar para que se copie el cambio
        planiregactuainf = planiregactuainftabla
        //console.log(planiregactuainf)
        res.render('notes/borrados/borradolistaactuacion', { planiregactuainf });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA INTIMACIONES')
        return res.redirect('/');
    }
});

router.get('/actuaciones/list/:id', isAuthenticated, async (req, res) => {
    const planiregactuainf = await Planiregactuainf.findById(req.params.id).lean()
    res.render('notes/inspecciones/infracciones/listactuaciones', { planiregactuainf })
});

router.post('/actuaciones/findfecha', isAuthenticated, async (req, res) => {
    const { fechainiciotramite } = req.body;
    const fechatramite = funcionesimportantes.ordenarfechaalrevez(fechainiciotramite);
    const planiregactuainftabla = await Planiregactuainf.find({ fechainiciotramite: { $regex: fechatramite, $options: "i" }, borrado: { $ne: 'Si' } }).lean().sort({ date: 'desc' });;
    if (!planiregactuainftabla) {
        req.flash('success_msg', 'cargue una Fecha')
        return res.render("notes/inspecciones/infracciones/listactuacionesadm");
    } else {
        for (var planiregactuainf of planiregactuainftabla) {
            //llamo funciones para nombres mayusculas y fechas ordenadar            
            planiregactuainf.propietario = funcionesimportantes.NombreMayus(planiregactuainf.propietario);
            planiregactuainf.fechainiciotramite = funcionesimportantes.ordenarfecha(planiregactuainf.fechainiciotramite).toString();
            planiregactuainf.inspector = funcionesimportantes.NombreMayus(planiregactuainf.inspector);
            planiregactuainf.direccion = funcionesimportantes.NombreMayus(planiregactuainf.direccion);
        }
        // necesito igualar para que se copie el cambio
        planiregactuainf = planiregactuainftabla
        res.render('notes/inspecciones/infracciones/planillaactuacionesadm', { planiregactuainf })
    }
});

router.post('/actuaciones/findiniciador', isAuthenticated, async (req, res) => {
    const { propietario } = req.body;
    const planiregactuainftabla = await Planiregactuainf.find({ propietario: { $regex: propietario, $options: "i" }, borrado: { $ne: 'Si' } }).lean().sort({ adrema: 'desc' });;
    if (!planiregactuainftabla) {
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/inspecciones/infracciones/listactuacionesadm");
    } else {
        for (var planiregactuainf of planiregactuainftabla) {
            //llamo funciones para nombres mayusculas y fechas ordenadar            
            planiregactuainf.propietario = funcionesimportantes.NombreMayus(planiregactuainf.propietario);
            planiregactuainf.fechainiciotramite = funcionesimportantes.ordenarfecha(planiregactuainf.fechainiciotramite).toString();
            planiregactuainf.inspector = funcionesimportantes.NombreMayus(planiregactuainf.inspector);
            planiregactuainf.direccion = funcionesimportantes.NombreMayus(planiregactuainf.direccion);
        }
        // necesito igualar para que se copie el cambio
        planiregactuainf = planiregactuainftabla
        res.render('notes/inspecciones/infracciones/planillaactuacionesadm', { planiregactuainf })
    }
});

router.post('/actuaciones/borrado/findiniciador', isAuthenticated, async (req, res) => {
    const { propietario } = req.body;
    const planiregactuainftabla = await Planiregactuainf.find({ propietario: { $regex: propietario, $options: "i" }, borrado: { $ne: 'No' } }).lean().sort({ adrema: 'desc' });;
    if (!planiregactuainftabla) {
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/inspecciones/infracciones/listactuacionesadm");
    } else {
        for (var planiregactuainf of planiregactuainftabla) {
            //llamo funciones para nombres mayusculas y fechas ordenadar            
            planiregactuainf.propietario = funcionesimportantes.NombreMayus(planiregactuainf.propietario);
            planiregactuainf.fechainiciotramite = funcionesimportantes.ordenarfecha(planiregactuainf.fechainiciotramite).toString();
            planiregactuainf.inspector = funcionesimportantes.NombreMayus(planiregactuainf.inspector);
            planiregactuainf.direccion = funcionesimportantes.NombreMayus(planiregactuainf.direccion);
        }
        // necesito igualar para que se copie el cambio
        planiregactuainf = planiregactuainftabla
        res.render('notes/borrados/borradolistaactuacion', { planiregactuainf });
    }
});

router.post('/actuaciones/findcuitdni', isAuthenticated, async (req, res) => {
    const { cuitdni } = req.body;
    const planiregactuainftabla = await Planiregactuainf.find({ cuitdni: { $regex: cuitdni, $options: "i" }, borrado: { $ne: 'Si' } }).lean().sort({ adrema: 'desc' });;
    if (!planiregactuainftabla) {
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/inspecciones/infracciones/listactuaciones");
    } else {
        for (var planiregactuainf of planiregactuainftabla) {
            //llamo funciones para nombres mayusculas y fechas ordenadar            
            planiregactuainf.propietario = funcionesimportantes.NombreMayus(planiregactuainf.propietario);
            planiregactuainf.fechainiciotramite = funcionesimportantes.ordenarfecha(planiregactuainf.fechainiciotramite).toString();
            planiregactuainf.inspector = funcionesimportantes.NombreMayus(planiregactuainf.inspector);
            planiregactuainf.direccion = funcionesimportantes.NombreMayus(planiregactuainf.direccion);
        }
        // necesito igualar para que se copie el cambio
        planiregactuainf = planiregactuainftabla
        res.render('notes/inspecciones/infracciones/planillaactuacionesadm', { planiregactuainf })
    }
});

router.post('/actuaciones/borrado/findcuitdni', isAuthenticated, async (req, res) => {
    const { cuitdni } = req.body;
    const planiregactuainftabla = await Planiregactuainf.find({ cuitdni: { $regex: cuitdni, $options: "i" }, borrado: { $ne: 'No' } }).lean().sort({ adrema: 'desc' });;
    if (!planiregactuainftabla) {
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/inspecciones/infracciones/listactuaciones");
    } else {
        for (var planiregactuainf of planiregactuainftabla) {
            //llamo funciones para nombres mayusculas y fechas ordenadar            
            planiregactuainf.propietario = funcionesimportantes.NombreMayus(planiregactuainf.propietario);
            planiregactuainf.fechainiciotramite = funcionesimportantes.ordenarfecha(planiregactuainf.fechainiciotramite).toString();
            planiregactuainf.inspector = funcionesimportantes.NombreMayus(planiregactuainf.inspector);
            planiregactuainf.direccion = funcionesimportantes.NombreMayus(planiregactuainf.direccion);
        }
        // necesito igualar para que se copie el cambio
        planiregactuainf = planiregactuainftabla
        res.render('notes/borrados/borradolistaactuacion', { planiregactuainf });
    }
});


router.post('/actuaciones/findadrema', isAuthenticated, async (req, res) => {
    const { adrema } = req.body;
    const planiregactuainftabla = await Planiregactuainf.find({ adrema: { $regex: adrema, $options: "i" }, borrado: { $ne: 'Si' } }).lean().sort({ adrema: 'desc' });;
    if (!planiregactuainftabla) {
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/inspecciones/infracciones/listactuaciones");
    } else {
        for (var planiregactuainf of planiregactuainftabla) {
            //llamo funciones para nombres mayusculas y fechas ordenadar            
            planiregactuainf.propietario = funcionesimportantes.NombreMayus(planiregactuainf.propietario);
            planiregactuainf.fechainiciotramite = funcionesimportantes.ordenarfecha(planiregactuainf.fechainiciotramite).toString();
            planiregactuainf.inspector = funcionesimportantes.NombreMayus(planiregactuainf.inspector);
            planiregactuainf.direccion = funcionesimportantes.NombreMayus(planiregactuainf.direccion);
        }
        // necesito igualar para que se copie el cambio
        planiregactuainf = planiregactuainftabla
        res.render('notes/inspecciones/infracciones/planillaactuacionesadm', { planiregactuainf })
    }
});

router.post('/actuaciones/findinspector', isAuthenticated, async (req, res) => {
    const { inspector } = req.body;
    const planiregactuainftabla = await Planiregactuainf.find({ inspector: { $regex: inspector, $options: "i" }, borrado: { $ne: 'Si' } }).lean().sort({ adrema: 'desc' });;
    if (!planiregactuainftabla) {
        req.flash('success_msg', 'cargue un Nº de Adrema')
        return res.render("notes/inspecciones/infracciones/listactuaciones");
    } else {
        for (var planiregactuainf of planiregactuainftabla) {
            //llamo funciones para nombres mayusculas y fechas ordenadar            
            planiregactuainf.propietario = funcionesimportantes.NombreMayus(planiregactuainf.propietario);
            planiregactuainf.fechainiciotramite = funcionesimportantes.ordenarfecha(planiregactuainf.fechainiciotramite).toString();
            planiregactuainf.inspector = funcionesimportantes.NombreMayus(planiregactuainf.inspector);
            planiregactuainf.direccion = funcionesimportantes.NombreMayus(planiregactuainf.direccion);
        }
        // necesito igualar para que se copie el cambio
        planiregactuainf = planiregactuainftabla
        res.render('notes/inspecciones/infracciones/planillaactuacionesadm', { planiregactuainf })
    }
});

router.get('/actuaciones/add', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Inspector" || rolusuario == "Programador") {
        const usuarios = await Users.find().lean().sort({ date: 'desc' });
        res.render('notes/inspecciones/infracciones/newactuaciones', usuarios);
        //res.render('notes/allusuariosadm', { usuarios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TICKETS')
        return res.redirect('/');
    }
});

router.post('/actuaciones/newactuacion', isAuthenticated, async (req, res) => {
    const { borrado, userborrado, fechaborrado, fechainiciotramite, lugartipo, propietario, cuitdni, direccion, adrema,
        inspector, zona, descripcion, intimacion, numerointimacion,
        tipoacta, observacion, expediente, actareiterada, filename,
        path, filenamedos, pathdos, filenametres, pathtres, filenamecuatro, pathcuatro,
        eliminado, user, name, date
    } = req.body;
    const newActuacion = new Planiregactuainf({
        borrado, userborrado, fechaborrado, fechainiciotramite, lugartipo, propietario, cuitdni, direccion, adrema,
        inspector, zona, descripcion, intimacion, numerointimacion,
        tipoacta, observacion, expediente, actareiterada, filename,
        path, filenamedos, pathdos, filenametres, pathtres, filenamecuatro, pathcuatro,
        eliminado, user, name, date
    })
    const mayu = propietario.replace(/\b\w/g, l => l.toUpperCase())
    newActuacion.propietario = mayu
    if (req.files[0]) {
        newActuacion.filename = req.files[0].filename;
        newActuacion.path = '/img/uploads/' + req.files[0].filename;
    }
    if (req.files[1]) {
        newActuacion.filenamedos = req.files[1].filename;
        newActuacion.pathdos = '/img/uploads/' + req.files[1].filename;
    }
    if (req.files[2]) {
        newActuacion.filenametres = req.files[2].filename;
        newActuacion.pathtres = '/img/uploads/' + req.files[2].filename;
    }
    if (req.files[3]) {
        newActuacion.filenamecuatro = req.files[3].filename;
        newActuacion.pathcuatro = '/img/uploads/' + req.files[3].filename;
    }
    if (req.files[4]) {
        newActuacion.filenamecinco = req.files[4].filename;
        newActuacion.pathcinco = '/img/uploads/' + req.files[4].filename;
    }
    if (req.files[5]) {
        newActuacion.filenameseis = req.files[5].filename;
        newActuacion.pathseis = '/img/uploads/' + req.files[5].filename;
    }
    if (req.files[6]) {
        newActuacion.filenamesiete = req.files[6].filename;
        newActuacion.pathsiete = '/img/uploads/' + req.files[6].filename;
    }
    if (req.files[7]) {
        newActuacion.filenameocho = req.files[7].filename;
        newActuacion.pathocho = '/img/uploads/' + req.files[7].filename;
    }
    newActuacion.user = req.user.id;
    newActuacion.name = req.user.name;
    await newActuacion.save();
    req.flash('success_msg', 'Actuación Agregada Exitosamente');
    res.redirect('/actuaciones/listado');
});

router.put('/actuaciones/marcadelete/:id', isAuthenticated, async (req, res) => {
    //const fechaimpresohoy = new Date();    
    //await Multas.updateMany({ _id: "id" });  
    //Busco el id y le sumo 1 a veces impreso
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Planiregactuainf.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Actuación a Papelera Reciclaje')
    res.redirect('/actuaciones/listado');
    // await Mesaentrada.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/mesaentrada/listado')
});

router.delete('/actuaciones/delete/:id', isAuthenticated, async (req, res) => {
    await Planiregactuainf.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Actuación Eliminado')
    res.redirect('/actuaciones/borradolistado')
});

router.put('/actuacion/marcadeleterestaurar/:id', isAuthenticated, async (req, res) => {
    //Busco el id y le sumo 1 a veces impreso
    const borrado = "No";
    const fechaborrado = "Restaurado";
    const userborrado = req.user.name;
    await Planiregactuainf.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Actuación Restaurada')
    res.redirect('/actuaciones/listado');
    // await Mesaentrada.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/mesaentrada/listado')
});

router.get('/actuaciones/Estadisticas', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    var contador = 0;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Programador" || rolusuario == "Administrador") {
        const planiregactuainftabla = await Planiregactuainf.find().lean().limit(30).sort({ date: 'desc' });
        for (var planiregactuainf of planiregactuainftabla) {
            // permite mostrar en las tablas la fecha sola y ordenada
            var tipoint = planiregactuainf.fechainiciotramite;
            if (tipoint != null) {
                const fecha = new Date(planiregactuainf.fechainiciotramite);
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
                planiregactuainf.fechainiciotramite = fullyear;
            } else {
                planiregactuainf.fechainiciotramite = "00-00-00T00:00:00"
            }
        }
        for (let i = 0; i < planiregactuainf.length; i++) {
            contador = contador + 1
        }
        // necesito igualar para que se copie el cambio
        planiregactuainf = planiregactuainftabla
        res.render('notes/inspecciones/infracciones/estadisticasactuacion', { planiregactuainf, contador });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.post('/actuaciones/sacarestadistica', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { propietario, lugartipo, adrema, inspector, desde, hasta } = req.body;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    var planiregactuainftabla = {};
    var planiregactuainf = {};
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        var contador = 0;
        if (propietario) {
            // var dni = "";
            // if (typeof nomyape == 'number') {
            //     dni = parseInt(nomyape)
            // } else {
            //     dni = ""
            // }
            var cuitdni = propietario;
            planiregactuainftabla = await Planiregactuainf.find({ $or: [{ propietario: { $regex: propietario, $options: "i" } }, { cuitdni: cuitdni }], $and: [{ borrado: { $ne: 'Si' } }] }).lean().sort({ date: 'desc' });
            planiregactuainf = planiregactuainftabla
            for (let i = 0; i < planiregactuainf.length; i++) {
                contador = contador + 1
            }
            //res.render('notes/inspecciones/infracciones/estadisticasactuacion', { planiregactuainf, contador });
        } else if (adrema) {
            var expediente = adrema;
            planiregactuainftabla = await Planiregactuainf.find({ $or: [{ adrema: { $regex: adrema, $options: "i" } }, { expediente: { $regex: expediente, $options: "i" } }], $and: [{ borrado: { $ne: 'Si' } }] }).lean().sort({ date: 'desc' });
            planiregactuainf = planiregactuainftabla
            for (let i = 0; i < planiregactuainf.length; i++) {
                contador = contador + 1
            }
            //res.render('notes/inspecciones/infracciones/estadisticasactuacion', { planiregactuainf, contador });
        } else if (lugartipo) {
            planiregactuainftabla = await Planiregactuainf.find({ lugartipo: { $regex: lugartipo, $options: "i" } }).lean().sort({ date: 'desc' });
            planiregactuainf = planiregactuainftabla
            for (let i = 0; i < planiregactuainf.length; i++) {
                contador = contador + 1
            }
            //res.render('notes/inspecciones/infracciones/estadisticasactuacion', { planiregactuainf, contador });
        } else if (inspector) {
            if ((desde && hasta)) {
                var d = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
                const hastad = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000  
                planiregactuainftabla = await Planiregactuainf.find({ $and: [{ fechainiciotramite: { $gte: desde, $lte: hastad } }, { inspector: { $regex: inspector, $options: "i" } }, { borrado: { $ne: 'Si' } }] }).lean().sort({ date: 'desc' });
                planiregactuainf = planiregactuainftabla
                for (let i = 0; i < planiregactuainf.length; i++) {
                    contador = contador + 1
                }
                //res.render('notes/inspecciones/infracciones/estadisticasactuacion', { planiregactuainf, contador });
            } else {
                planiregactuainftabla = await Planiregactuainf.find({ $and: [{ inspector: { $regex: inspector, $options: "i" } }, { borrado: { $ne: 'Si' } }] }).lean().sort({ date: 'desc' });
                planiregactuainf = planiregactuainftabla
                for (let i = 0; i < planiregactuainf.length; i++) {
                    contador = contador + 1
                }
                //res.render('notes/inspecciones/infracciones/estadisticasactuacion', { planiregactuainf, contador });
            }
        } else if (desde && hasta) {
            // console.log("DESDE", desde)
            // console.log("HASTA", hasta)
            var d = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
            const hastad = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000        
            planiregactuainftabla = await Planiregactuainf.find({ fechainiciotramite: { $gte: desde, $lte: hastad } }, { borrado: { $ne: 'Si' } }).lean().sort({ fechainiciotramite: 'desc' });
            //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
            //.find({ desde: { $regex: date, $options: "i" } }).lean().sort({ date: 'desc' });            
            // necesito igualar para que se copie el cambio
            planiregactuainf = planiregactuainftabla
            for (let i = 0; i < planiregactuainf.length; i++) {
                contador = contador + 1
            }
            //res.render('notes/inspecciones/infracciones/estadisticasactuacion', { planiregactuainf, contador });
        } else {
            req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
            return res.redirect('/');
        }
        for (planiregactuainf of planiregactuainftabla) {
            //llamo funciones para nombres mayusculas y fechas ordenadar            
            planiregactuainf.propietario = funcionesimportantes.NombreMayus(planiregactuainf.propietario);
            planiregactuainf.fechainiciotramite = funcionesimportantes.ordenarfecha(planiregactuainf.fechainiciotramite);
            planiregactuainf.inspector = funcionesimportantes.NombreMayus(planiregactuainf.inspector);
            planiregactuainf.direccion = funcionesimportantes.NombreMayus(planiregactuainf.direccion);
        }
        // necesito igualar para que se copie el cambio
        planiregactuainf = planiregactuainftabla
        res.render('notes/inspecciones/infracciones/estadisticasactuacion', { planiregactuainf, contador });
    }
});

router.post('/actuaciones/descargarestadisticaactu', isAuthenticated, async (req, res) => {
    const ubicacionPlantilla = require.resolve("../views/notes/inspecciones/infracciones/actuacionesestadisticaimprimir.hbs")
    //const puerto = "172.25.2.215";
    var fstemp = require('fs');
    let tabla = "";
    // var contio = 0;
    // var contop = 0;
    // var contvis = 0;
    // var contsub = 0;
    var contador = 0;
    var filtro = "";
    var tipofiltro = "";
    let contenidoHtml = fstemp.readFileSync(ubicacionPlantilla, 'utf8');
    var tablaactuaciones = "" //await Mesaentrada.find().lean().sort({ date: 'desc' });
    //<td>${multas.fecha}</td> este etaba en tablamultas
    const { propietario, adrema, inspector, desde, hasta, lugartipo } = req.body;
    if (propietario) {
        const cuitdni = propietario
        tablaactuaciones = await Planiregactuainf.find({ $or: [{ propietario: { $regex: propietario, $options: "i" } }, { cuitdni: { $regex: cuitdni, $options: "i" } }] }).lean().sort({ date: 'desc' });
        //tablamesaentrada = await Mesaentrada.find({ nomyape: { $regex: nomyape, $options: "i" } }).lean();        
        filtro = propietario;
        tipofiltro = "por Propietario/Dni"
    } else if (adrema) {
        const expediente = adrema;
        tablaactuaciones = await Planiregactuainf.find({ $or: [{ adrema: { $regex: adrema, $options: "i" } }, { expediente: { $regex: expediente, $options: "i" } }] }).lean().sort({ date: 'desc' });
        filtro = adrema;
        tipofiltro = "por Expediente/Adrema"
        contador = 0
        //for (let i = 0; i < tablaactuaciones.length; i++) {
        //contador = i
        //}
    } else if (desde && hasta) {
        if (inspector) {
            var tipoint = desde;
            if (tipoint != null) {
                const fecha = new Date(desde);
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
                const ano = fecha.getFullYear(

                )
                //const fullyear = fecha.toLocaleDateString();
                const fullyear = diastring + mes + ano
                //const fullyear = fecha.toLocaleDateString();
                var desdebien = fullyear;
            }
            var tipoint = hasta;
            if (tipoint != null) {
                const fecha = new Date(hasta);
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
                var hastabien = fullyear;
            }
            //filtro = "por Fecha: " + desdebien + " / " + hastabien;
            filtro = "Inspector: " + inspector + " - por Fecha: " + desdebien + " / " + hastabien;
            tipofiltro = "Inspector con Fecha Desde y Fecha Hasta"
            var o = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
            const hastao = o.setDate(o.getDate() + 1); //HASTAD= 1690243200000
            //console.log("HASTAO", hastao)
            //console.log("D", o)
            tablaactuaciones = await Planiregactuainf.find({ $and: [{ fechainiciotramite: { $gte: desde, $lte: hastao } }, { inspector: { $regex: inspector, $options: "i" } }] }).lean().sort({ date: 'desc' });
        } else {
            var tipoint = desde;
            if (tipoint != null) {
                const fecha = new Date(desde);
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
                var desdebien = fullyear;
            }
            var tipoint = hasta;
            if (tipoint != null) {
                const fecha = new Date(hasta);
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
                var hastabien = fullyear;
            }
            filtro = "por Fecha: " + desdebien + " / " + hastabien;
            tipofiltro = "Fecha Desde y Fecha Hasta"
            contador = 0
            var d = new Date(hasta);
            const hastao = d.setDate(d.getDate() + 1);
            tablaactuaciones = await Planiregactuainf.find({ fechainiciotramite: { $gte: desde, $lte: hastao } }).lean().sort({ fechainiciotramite: 'desc' });;
            //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
            //.find({ desde: { $regex: date, $options: "i" } }).lean();            
            //for (let i = 0; i < tablaactuaciones.length; i++) {
            //contador += 1
            //}
        }
    } else if (inspector) {
        tablaactuaciones = await Planiregactuainf.find({ inspector: { $regex: inspector, $options: "i" } }).lean();
        filtro = inspector;
        tipofiltro = "por Inspector"
        contador = 0
        //for (let i = 0; i < tablaactuaciones.length; i++) {
        //contador += 1
        //}
    } else if (lugartipo) {
        tablaactuaciones = await Planiregactuainf.find({ lugartipo: { $regex: lugartipo, $options: "i" } }).lean().sort({ date: 'desc' });
        filtro = lugartipo;
        tipofiltro = "por Lugar/Tipo"
        contador = 0
    }
    for (const actuaciones of tablaactuaciones) {
        // Y concatenar las multas    
        var fechainiciotramite = "";
        // permite mostrar en las tablas la fecha sola y ordenada
        var tipoint = actuaciones.fechainiciotramite;
        if (tipoint != null) {
            const fecha = new Date(actuaciones.fechainiciotramite);
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
            fechainiciotramite = fullyear;
        } else {
            fechainiciotramite = "00/00/00"
        }
        // necesito igualar para que se copie el cambio
        actuaciones.fechainiciotramite = fechainiciotramite

        //para q en la impresion no salga undefined
        if (actuaciones.fechainiciotramite == undefined) {
            actuaciones.fechainiciotramite = "----"
        }
        // if (actuaciones.propietario == undefined) {
        //     actuaciones.propietario = "----"
        // }
        if (actuaciones.cuitdni == undefined) {
            actuaciones.cuitdni = "----"
        }
        if (actuaciones.direccion == undefined) {
            actuaciones.direccion = "----"
        }
        if (actuaciones.adrema == undefined) {
            actuaciones.adrema = "----"
        }
        if (actuaciones.inspector == undefined) {
            actuaciones.inspector = "No-Definido"
        }
        if (actuaciones.actareiterada == undefined) {
            actuaciones.actareiterada = "----"
        }
        // permite mostrar en Mayuscula los nombres
        actuaciones.propietario = funcionesimportantes.NombreMayus(actuaciones.propietario);
        //actuaciones.fechainiciotramite = funcionesimportantes.ordenarfecha(actuaciones.fechainiciotramite).toString();
        actuaciones.inspector = funcionesimportantes.NombreMayus(actuaciones.inspector);
        actuaciones.direccion = funcionesimportantes.NombreMayus(actuaciones.direccion);
        contador += 1
        tabla += `<tr>   
        <td>-</td> 
    <td style="text-transform: lowercase;  font-weight: bold;">${actuaciones.fechainiciotramite}</td>
    <td style="">${actuaciones.propietario}</td>
    <td style="text-transform: lowercase;">${actuaciones.cuitdni}</td>
    <td style="">${actuaciones.direccion}</td>
    <td style="text-transform: uppercase;">${actuaciones.adrema}</td>
    <td style="">${actuaciones.inspector}</td>
    <td style="text-transform: lowercase;">${actuaciones.actareiterada}</td>
    <td>-</td>
    </tr>`;
    }
    //contador = contador - 2;
    if (contador <= 0) {
        contador = "No existen datos para Mostrar/Contar"
    }
    contenidoHtml = contenidoHtml.replace("{{tablaactuaciones}}", tabla);
    contenidoHtml = contenidoHtml.replace("{{contador}}", contador);
    contenidoHtml = contenidoHtml.replace("{{filtro}}", filtro);
    contenidoHtml = contenidoHtml.replace("{{tipofiltro}}", tipofiltro);
    //contenidoHtml = contenidoHtml.replace("{{multas}}");    
    pdf.create(contenidoHtml, pdfoptionsA4).toStream((error, stream) => {
        if (error) {
            res.end("Error creando PDF: " + error)
        } else {
            req.flash('success_msg', 'Actuaciones Estadistica Impresa')
            res.setHeader("Content-Type", "application/pdf");
            stream.pipe(res);
        }
    });
})

router.get('/actuaciones/edit/:id', isAuthenticated, async (req, res) => {
    const planiregactuainf = await Planiregactuainf.findById(req.params.id).lean()
    res.render('notes/inspecciones/infracciones/editactuacion', { planiregactuainf })
});

router.put('/actuacion/editactuacion/:id', isAuthenticated, async (req, res) => {
    const { borrado, userborrado, fechaborrado, fechainiciotramite, lugartipo, propietario, cuitdni, direccion, adrema,
        inspector, zona, descripcion, intimacion, numerointimacion,
        tipoacta, observacion, expediente, actareiterada, filename,
        path, filenamedos, pathdos, filenametres, pathtres, filenamecuatro, pathcuatro,
        eliminado, user, name, date
    } = req.body
    await Planiregactuainf.findByIdAndUpdate(req.params.id, {
        borrado, userborrado, fechaborrado, fechainiciotramite, lugartipo, propietario, cuitdni, direccion, adrema,
        inspector, zona, descripcion, intimacion, numerointimacion,
        tipoacta, observacion, expediente, actareiterada, filename,
        path, filenamedos, pathdos, filenametres, pathtres, filenamecuatro, pathcuatro,
        eliminado, user, name, date
    });
    req.flash('success_msg', 'Actuación Actualizada')
    res.redirect('/actuaciones/listado');
});

module.exports = router;

