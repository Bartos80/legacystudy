// **** abogados ****
const express = require('express')
const router = express.Router()
// const bcrypt = require("bcrypt");
// const passport = require ('passport');
// const User =  require ('../models/User')
//const bcrypt = require("bcrypt");
const fs = require('fs').promises
const { isAuthenticated } = require('../helpers/auth')

// tengo que requerir los modelos para que mongoose me cree las tablas
const Abogados = require('../models/abogados') //** SI O SI LLAMAR AL MODEL Q USAMOS EN ESTE ROUTES */

//const Expediente = require('../models/Expediente')
//const Expedentrsalida = require('../models/expedentrsalida')

router.get('/abogados/listado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Administrador" || rolusuario == "Programador") {        
        const abogados = await Abogados.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/abogados/planillalistaabogados', { abogados });    
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA ABOGADOS')
        return res.redirect('/');
    }
});

router.get('/abogados/borradolistado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        // res.send('Notes from data base');
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const abogados = await Abogados.find({ borrado: "Si" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/abogados/borradoslistabogados', { abogados });
    } else if (rolusuario == "Administrativo") {
        const abogados = await Abogados.find({ borrado: "Si" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/abogados/borradoslistabogados', { abogados });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO/PAPELERA abogados')
        return res.redirect('/');
    }
});

router.get('/abogados/add', isAuthenticated, (req, res) => {
    res.render('notes/abogados/newabogados');
});

router.post('/abogados/newAbogado', isAuthenticated, async (req, res) => {
    const { matriculaabogado, nyaabogado, dniabogado, direccionabogado, celularabogado, 
        emailabogado, provinciaabogado, localidadabogado, emailvinculadoabogadoestudio, observacionesabogado
    } = req.body;
    const newabogados = new Abogados({
        matriculaabogado, nyaabogado, dniabogado, direccionabogado, celularabogado, 
        emailabogado, provinciaabogado, localidadabogado, emailvinculadoabogadoestudio, observacionesabogado
    })
    newabogados.user = req.user.id;
    newabogados.name = req.user.name;
    newabogados.idestudiouser = req.user.idestudiouser;
    await newabogados.save();
    req.flash('success_msg', 'Abogado Agregado Exitosamente');
    res.redirect('/abogados/listado');
})

router.get('/abogados/list/:id', isAuthenticated, async (req, res) => {
    const abogados = await Abogados.findById(req.params.id).lean()
    res.render('notes/abogados/listAbogado', { abogados })
});

router.get('/abogados/edit/:id', isAuthenticated, async (req, res) => {
    const abogados = await Abogados.findById(req.params.id).lean()
    res.render('notes/abogados/editAbogado', { abogados })
});

router.put('/abogados/marcadelete/:id', isAuthenticated, async (req, res) => {
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Abogados.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Abogado a Papelera Reciclaje')
    res.redirect('/abogados/listado');
});

router.put('/abogados/marcadeleterestaurar/:id', isAuthenticated, async (req, res) => {
    const borrado = "No";
    const fechaborrado = "Restaurado";
    const userborrado = req.user.name;
    await Abogados.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Abogado Restaurado')
    res.redirect('/abogados/borradolistado');
});

router.put('/abogados/editAbogado/:id', isAuthenticated, async (req, res) => {
    const { matriculaabogado, nyaabogado, dniabogado, direccionabogado, celularabogado, 
        emailabogado, provinciaabogado, localidadabogado, emailvinculadoabogadoestudio, observacionesabogado } = req.body
    await Abogados.findByIdAndUpdate(req.params.id, {
        matriculaabogado, nyaabogado, dniabogado, direccionabogado, celularabogado, 
        emailabogado, provinciaabogado, localidadabogado, emailvinculadoabogadoestudio, observacionesabogado
    });
    req.flash('success_msg', 'Abogado actualizado')
    res.redirect('/abogados/listado');
});

// *** SI O SI LOS MODULE EXPLORTS ***
module.exports = router;