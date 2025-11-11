const express = require('express')
const router = express.Router()
// const bcrypt = require("bcrypt");
// const passport = require ('passport');
// const User =  require ('../models/User')
//const bcrypt = require("bcrypt");
//const mongopagi = require('mongoose-paginate-v2') Paginacion de mongodb
const fs = require('fs').promises
const { isAuthenticated } = require('../helpers/auth')

// tengo que requerir los modelos para que mongoose me cree las tablas
const Estadistica = require('../models/estadistica')
const Expediente = require('../models/expediente')
const Expedentrsalida = require('../models/expedentrsalida')

router.get('/estadisticas/list/:id', isAuthenticated, async (req, res) => {
    const estadistica = await Estadistica.findById(req.params.id).lean()
    res.render('notes/listestadistica', { estadistica })
});

router.get('/estadisticas', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        const estadisticas = await Estadistica.find({ borrado: "No" }).lean().sort({ estadisticanum: 'asc' });
        res.render('notes/allestadistica', { estadisticas });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA ESTADISTICAS')
        return res.redirect('/');
    }
    //para que muestre notas de un solo user
    // const estadisticas = await Estadistica.find({user : req.user.id}).lean().sort({estadisticanum:'desc'}); 
});

router.get('/estadisticas/listado', isAuthenticated, async (req, res) => {
    // res.send('Notes from data base');
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        //const estadisticas = await Estadistica.find({ borrado: "No" }).lean().sort({ date: 'asc' });
        //const tablamultas = await Multas.find({ $and: [{ impreso: 'No' }, { apercibimientoprofesional: 'Si' }] }).lean().sort({ propietario: 'desc' });
        //const multas = await Multas.find({ $and: [{ impreso: "No" }, { apercibimientoprofesional: "Si" }] }).lean().sort({ numexpediente: 'desc' }); // temporal poner el d arriba despues
        //const expedientes = await Expediente.find({ borrado: "No" }).lean().limit(100).sort({ date: 'desc' }); //
        // condicional mongo { numexpediente: {$exists: true, $not: {$size: 0}} 
        const expedientesretenidos = await Expediente.find({ $and: [{ numexpediente: { $exists: true } }, { borrado: "No" }, { estado: { $regex: "ent", $options: "i" } }] }).lean().sort({ numexpediente: 'desc' });
        const expedientesentradas = await Expediente.find({ $and: [{ numexpediente: { $exists: true } }, { borrado: "No" }, { estado: { $regex: "p/in", $options: "i" } }] }).lean().sort({ numexpediente: 'desc' });
        //const Expedientes = await Expediente.find({ $and: [{ numexpediente: { $exists: true } }, { borrado: "No" }] }).lean().sort({ numexpediente: 'desc' });
        //const Movimientosexpedientes = await Expedientes.find({ $and: [{ numexpediente: { $exists: true } }, { borrado: "No" }] }).lean().sort({ numexpediente: 'desc' });
        // let tabla = "";
        // for (const pruexpedientesretenidos of expedientesentradas) {
            // Y concatenar las multas
            // if (multas.infraccionoparalizacion == "Infracción/Paralización") {
            //     multas.infraccionoparalizacion = "infrac/paraliz"
            // }
        //     tabla += `${pruexpedientesretenidos.numexpediente},
        //     ${pruexpedientesretenidos.iniciadornomyape}, 
        //     ${pruexpedientesretenidos.domicilio} `;
        // }        
        res.render('notes/estadisticaexp/planillalistaestadexp', { expedientesretenidos, expedientesentradas});

    }
    else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA ESTADISTICAS')
        return res.redirect('/');
    }
    //para que muestre notas de un solo user
    // const estadisticas = await Estadistica.find({user : req.user.id}).lean().sort({estadisticanum:'desc'}); 
});

router.get('/estadisticas/add', isAuthenticated, (req, res) => {
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Jefe-Inspectores") {
        res.render('notes/newestadisticas');
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA ESTADISTICAS')
        return res.redirect('/');
    }
})

router.post('/notes/newestadisticas', isAuthenticated, async (req, res) => {
    const newEstadistica = new Estadistica();
    newEstadistica.estadisticanum = req.body.estadisticanum;
    newEstadistica.fechaestadistica = req.body.fechaestadistica;
    newEstadistica.numexpediente = req.body.numexpediente;
    newEstadistica.iniciadornomyape = req.body.iniciadornomyape
    newEstadistica.domicilio = req.body.domicilio
    if (req.files[0]) {
        // const file = req.files[0]        
        // req.files[0].nameest='Estadistica'        
        // console.log('req files 0', req.files[0]);
        newEstadistica.filename = req.files[0].filename;
        newEstadistica.path = '/img/uploads/' + req.files[0].filename;
        // newEstadistica.nameest = req.files[0].nameest;
    }
    if (req.files[1]) {
        newEstadistica.filenamedos = req.files[1].filename;
        newEstadistica.pathdos = '/img/uploads/' + req.files[1].filename;
    }
    if (req.files[2]) {
        newEstadistica.filenametres = req.files[2].filename;
        newEstadistica.pathtres = '/img/uploads/' + req.files[2].filename;
    }
    if (req.files[3]) {
        newEstadistica.filenamecuatro = req.files[3].filename;
        newEstadistica.pathcuatro = '/img/uploads/' + req.files[3].filename;
    }
    if (req.files[4]) {
        newEstadistica.filenamecinco = req.files[4].filename;
        newEstadistica.pathcinco = '/img/uploads/' + req.files[4].filename;
    }
    if (req.files[5]) {
        newEstadistica.filenameseis = req.files[5].filename;
        newEstadistica.pathseis = '/img/uploads/' + req.files[5].filename;
    }
    if (req.files[6]) {
        newEstadistica.filenamesiete = req.files[6].filename;
        newEstadistica.pathsiete = '/img/uploads/' + req.files[6].filename;
    }
    if (req.files[7]) {
        newEstadistica.filenameocho = req.files[7].filename;
        newEstadistica.pathocho = '/img/uploads/' + req.files[7].filename;
    }
    newEstadistica.user = req.user.id;
    newEstadistica.name = req.user.name;
    // newEstadistica.originalname = req.file.originalname;
    // newEstadistica.mimetype = req.file.mimetype;
    // newEstadistica.size = req.file.size;
    // console.log(req.files[2].filename) 
    await newEstadistica.save();
    req.flash('success_msg', 'Estadistica Creada Exitosamente');
    // console.log (newNote)
    res.redirect('/estadisticas/listado');
    // await Estadistica.save();
    // res.redirect('/');
});

router.get('/estadisticas/edit/:id', isAuthenticated, async (req, res) => {
    const estadistica = await Estadistica.findById(req.params.id).lean()
    res.render('notes/editestadistica', { estadistica })
});

router.put('/notes/editestadistica/:id', isAuthenticated, async (req, res) => {
    const { estadisticanum, fechaestadistica, numexpediente, iniciadornomyape, domicilio } = req.body
    await Estadistica.findByIdAndUpdate(req.params.id, {
        estadisticanum, fechaestadistica, numexpediente, iniciadornomyape, domicilio
    });
    req.flash('success_msg', 'Estadistica actualizada')
    res.redirect('/estadisticas/listado');
});

// ** SECTOR DELETE **
router.put('/estadisticas/marcadelete/:id', isAuthenticated, async (req, res) => {
    //const fechaimpresohoy = new Date();    
    //await Multas.updateMany({ _id: "id" });  
    //Busco el id y le sumo 1 a veces impreso
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Estadistica.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Turno a Papelera Reciclaje')
    res.redirect('/estadisticas/listado');
    // await estadistica.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/estadisticas/listado')
});

router.put('/estadisticas/recuperarlistado', isAuthenticated, async (req, res) => {
    //await Multas.updateMany({ borrado: "Si", fechaborrado: new Date(), userborrado:req.user.name});    
    await Estadistica.updateMany({ borrado: 'Si' }, { borrado: "No", fechaborrado: "Recuperado" });
    req.flash('success_msg', 'todos los datos de Mesa de Entradas recuperados')
    res.redirect('/estadisticas/listado');
    // await estadistica.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/estadisticas/listado')
});

router.put('/estadisticas/marcadeleterestaurar/:id', isAuthenticated, async (req, res) => {
    //const fechaimpresohoy = new Date();    
    //await Multas.updateMany({ _id: "id" });  
    //Busco el id y le sumo 1 a veces impreso
    const borrado = "No";
    const fechaborrado = "Restaurado";
    const userborrado = req.user.name;
    await Estadistica.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Turno Restaurado')
    res.redirect('/estadisticas/borradolistado');
    // await estadistica.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/estadisticas/listado')
});

router.delete('/estadisticas/delete/:id', isAuthenticated, async (req, res) => {
    const idfile = req.params.id;
    const datosfile = Estadistica.find({ idfile: { $regex: idfile, $options: "i" } }).lean();
    await Estadistica.findByIdAndDelete(req.params.id);
    // const filenamepru = datosfile[0].filename
    // console.log ('filnamepru', datosfile[0].filename)
    console.log('filenamepru', datosfile)
    // fs.unlink(`./src/public/img/uploads/${filenamepru}`)
    // // fs.unlink('\src\public\img\uploads\',filenamepru)
    //     .then(() => {
    //         console.log('File removed')
    //     }).catch(err => {
    //         console.error('Something wrong happened removing the file', err)
    //     })

    req.flash('success_msg', 'Estadistica Eliminada')
    res.redirect('/estadisticas')
    // console.log(req.params.id)
    // res.send('ok')
});

// *** SI O SI LOS MODULE EXPLORTS ***
module.exports = router;