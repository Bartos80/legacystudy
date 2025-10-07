// **** Juzgados ****
const express = require('express')
const router = express.Router()
// const bcrypt = require("bcrypt");
// const passport = require ('passport');
// const User =  require ('../models/User')
//const bcrypt = require("bcrypt");
const fs = require('fs').promises
const { isAuthenticated } = require('../helpers/auth')

// tengo que requerir los modelos para que mongoose me cree las tablas
const Juzgados = require('../models/Juzgados') //** SI O SI LLAMAR AL MODEL Q USAMOS EN ESTE ROUTES */

//const Expediente = require('../models/Expediente')
//const Expedentrsalida = require('../models/expedentrsalida')

router.get('/Juzgados/listado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Juzgado") {        
        const Juzgados = await Juzgados.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/Juzgados/planillalistaJuzgados', { Juzgados });    
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA JuzgadoS')
        return res.redirect('/');
    }
});

router.get('/Juzgados/borradolistado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador") {
        // res.send('Notes from data base');
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const Juzgados = await Juzgados.find({ borrado: "Si" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/Juzgados/borradoslistJuzgados', { Juzgados });
    } else if (rolusuario == "Administrativo") {
        const Juzgados = await Juzgados.find({ borrado: "Si" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/Juzgados/borradoslistJuzgados', { Juzgados });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO/PAPELERA Juzgados')
        return res.redirect('/');
    }
});

router.get('/Juzgados/add', isAuthenticated, (req, res) => {
    res.render('notes/Juzgados/newJuzgados');
});

router.post('/Juzgados/newJuzgado', isAuthenticated, async (req, res) => {
    const { matriculaJuzgado, nyaJuzgado, dniJuzgado, direccionJuzgado, celularJuzgado, 
        emailJuzgado, localidadJuzgado, emailvinculadoJuzgadoestudio, observacionesJuzgado
    } = req.body;
    const newJuzgados = new Juzgados({
        matriculaJuzgado, nyaJuzgado, dniJuzgado, direccionJuzgado, celularJuzgado, 
        emailJuzgado, localidadJuzgado, emailvinculadoJuzgadoestudio, observacionesJuzgado
    })
    newJuzgados.user = req.user.id;
    newJuzgados.name = req.user.name;
    await newJuzgados.save();
    req.flash('success_msg', 'Juzgado Agregado Exitosamente');
    res.redirect('notes/Juzgados/listado');
})

router.get('/Juzgados/list/:id', isAuthenticated, async (req, res) => {
    const Juzgados = await Juzgados.findById(req.params.id).lean()
    res.render('notes/Juzgados/listJuzgado', { Juzgados })
});

router.get('/Juzgados/edit/:id', isAuthenticated, async (req, res) => {
    const Juzgados = await Juzgados.findById(req.params.id).lean()
    res.render('notes/Juzgados/editJuzgado', { Juzgados })
});

router.put('/Juzgados/marcadelete/:id', isAuthenticated, async (req, res) => {
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Juzgados.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Juzgado a Papelera Reciclaje')
    res.redirect('/Juzgados/listado');
});

router.put('/Juzgados/marcadeleterestaurar/:id', isAuthenticated, async (req, res) => {
    const borrado = "No";
    const fechaborrado = "Restaurado";
    const userborrado = req.user.name;
    await Juzgados.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Juzgado Restaurado')
    res.redirect('/Juzgados/borradolistado');
});

router.put('/notes/editJuzgado/:id', isAuthenticated, async (req, res) => {
    const { matriculaJuzgado, nyaJuzgado, dniJuzgado, direccionJuzgado, celularJuzgado, 
        emailJuzgado, localidadJuzgado, emailvinculadoJuzgadoestudio, observacionesJuzgado } = req.body
    await Juzgados.findByIdAndUpdate(req.params.id, {
        matriculaJuzgado, nyaJuzgado, dniJuzgado, direccionJuzgado, celularJuzgado, 
        emailJuzgado, localidadJuzgado, emailvinculadoJuzgadoestudio, observacionesJuzgado
    });
    req.flash('success_msg', 'Juzgado actualizado')
    res.redirect('/Juzgados/listado');
});

// *** SI O SI LOS MODULE EXPLORTS ***
module.exports = router;