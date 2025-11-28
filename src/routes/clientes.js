// **** CLIENTES ****
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
const Clientes = require('../models/clientes') //** SI O SI LLAMAR AL MODEL Q USAMOS EN ESTE ROUTES */

//const Expediente = require('../models/Expediente')
const Expedentrsalida = require('../models/expedentrsalida')

router.get('/clientes/listado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario === "Administrador" || rolusuario === "Programador") {
        // res.send('Notes from data base');
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const clientes = await Clientes.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/clientes/planillalistaclientes', { clientes });
    } else if (rolusuario == "Administrativo") {
        const clientes = await Clientes.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/clientes/planillalistaclientes', { clientes });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA CLIENTES')
        return res.redirect('/');
    }
});

router.get('/clientes/borradolistado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador") {
        // res.send('Notes from data base');
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const clientes = await Clientes.find({ borrado: "Si" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/clientes/borradoslistclientes', { clientes });
    } else if (rolusuario == "Administrativo") {
        const clientes = await Clientes.find({ borrado: "Si" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/clientes/borradoslistclientes', { clientes });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO/PAPELERA CLIENTES')
        return res.redirect('/');
    }
});

router.get('/clientes/add', isAuthenticated, (req, res) => {
    res.render('notes/clientes/newclientes');
});

router.post('/clientes/newcliente', isAuthenticated, async (req, res) => {
    const { nyacliente, dnicliente, domiciliocliente, provinciacliente, localidadcliente, telefonocliente, 
        emailcliente, observacionescliente, numerocarpetaopcionalcliente, correovinculadoclienteestudio
    } = req.body;
    const newClientes = new Clientes({
        nyacliente, dnicliente, domiciliocliente, provinciacliente, localidadcliente, telefonocliente, 
        emailcliente, observacionescliente, numerocarpetaopcionalcliente, correovinculadoclienteestudio
    })
    newClientes.user = req.user.id;
    newClientes.name = req.user.name;
    await newClientes.save();
    req.flash('success_msg', 'Cliente Agregado Exitosamente');
    res.redirect('/clientes/listado');
})

router.get('/clientes/list/:id', isAuthenticated, async (req, res) => {
    const clientes = await Clientes.findById(req.params.id).lean()
    res.render('notes/clientes/listcliente', { clientes })
});

router.get('/clientes/edit/:id', isAuthenticated, async (req, res) => {
    const clientes = await Clientes.findById(req.params.id).lean()
    res.render('notes/clientes/editcliente', { clientes })
});

router.put('/clientes/marcadelete/:id', isAuthenticated, async (req, res) => {
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Clientes.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Cliente a Papelera Reciclaje')
    res.redirect('/clientes/listado');
});

router.put('/clientes/marcadeleterestaurar/:id', isAuthenticated, async (req, res) => {
    const borrado = "No";
    const fechaborrado = "Restaurado";
    const userborrado = req.user.name;
    await Clientes.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Cliente Restaurado')
    res.redirect('/clientes/borradolistado');
});

router.delete('/clientes/delete/:id', isAuthenticated, async (req, res) => {
    await Clientes.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Cliente Eliminado')
    res.redirect('/clientes/listado')
});

router.put('/notes/editcliente/:id', isAuthenticated, async (req, res) => {
    const { nyacliente, dnicliente, domiciliocliente, provinciacliente, localidadcliente, telefonocliente, 
        emailcliente, observacionescliente, numerocarpetaopcionalcliente, correovinculadoclienteestudio } = req.body
    await Clientes.findByIdAndUpdate(req.params.id, {
        nyacliente, dnicliente, domiciliocliente, provinciacliente, localidadcliente, telefonocliente, 
        emailcliente, observacionescliente, numerocarpetaopcionalcliente, correovinculadoclienteestudio
    });
    req.flash('success_msg', 'Cliente actualizado')
    res.redirect('/clientes/listado');
});

router.post('/clientes/findnombrecliente', isAuthenticated, async (req, res) => {    
    const { nyacliente } = req.body;
    //const clientes = await Clientes.find({ $and: [{ borrado: "No" }, { nyacliente: { $regex: nyacliente, $options: "i" } }] }).lean().sort({ nyacliente: 'desc' })
    const clientes = await Clientes.find({ $and: [{ borrado: "No" }, { nyacliente: { $regex: nyacliente, $options: "i" } }] }).lean().sort({ date: 'desc' });
    if (!clientes) {
        //req.flash('success_msg', 'cargue un Cliente')
        return res.render("notes/clientes/planillalistaclientes");
    } else {
        res.render('notes/clientes/planillalistaclientes', { clientes })
    }    
});

router.post('/clientes/finddnicliente', isAuthenticated, async (req, res) => {    
    const { dnicliente } = req.body;
    const clientes = await Clientes.find({ $and: [{ borrado: "No" }, { dnicliente: { $regex: dnicliente, $options: "i" } }] }).lean().sort({ date: 'desc' });
    if (!clientes) {
        //req.flash('success_msg', 'cargue un Cliente')
        return res.render("notes/clientes/planillalistaclientes");
    } else {
        res.render('notes/clientes/planillalistaclientes', { clientes })
    }    
});

router.post('/clientes/findprovinciacliente', isAuthenticated, async (req, res) => {    
    const { provinciacliente } = req.body;
    const clientes = await Clientes.find({ $and: [{ borrado: "No" }, { provinciacliente: { $regex: provinciacliente, $options: "i" } }] }).lean().sort({ date: 'desc' });
    if (!clientes) {
        //req.flash('success_msg', 'cargue un Cliente')
        return res.render("notes/clientes/planillalistaclientes");
    } else {
        res.render('notes/clientes/planillalistaclientes', { clientes })
    }    
});

router.post('/clientes/findlocalidadcliente', isAuthenticated, async (req, res) => {    
    const { localidadcliente } = req.body;
    const clientes = await Clientes.find({ $and: [{ borrado: "No" }, { localidadcliente: { $regex: localidadcliente, $options: "i" } }] }).lean().sort({ date: 'desc' });
    if (!clientes) {
        //req.flash('success_msg', 'cargue un Cliente')
        return res.render("notes/clientes/planillalistaclientes");
    } else {
        res.render('notes/clientes/planillalistaclientes', { clientes })
    }    
});

// *** SI O SI LOS MODULE EXPLORTS ***
module.exports = router;