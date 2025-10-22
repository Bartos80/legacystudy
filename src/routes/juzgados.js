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
const Juzgados = require('../models/Juzgado') //** SI O SI LLAMAR AL MODEL Q USAMOS EN ESTE ROUTES */

//const Expediente = require('../models/Expediente')
//const Expedentrsalida = require('../models/expedentrsalida')

router.get('/juzgados/listado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    if (rolusuario === "Administrador") {
        try {
            // const juzgados = await Juzgados.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });;            
            // res.render('juzgados/planillalistajuzgado', { juzgados });
            const juzgados = await Juzgados.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
            res.render('notes/juzgados/planillalistajuzgado', { juzgados });
        } catch (error) {
            console.error("Error al obtener el listado de juzgados:", error);
            req.flash('error_msg', 'Error al cargar el listado de Juzgados. Intente nuevamente.');
            return res.redirect('/about');
        }
    } else {
        req.flash('error_msg', 'NO TIENE PERMISO PARA AREA Juzgados');
        return res.redirect('/');
    }
});


router.get('/juzgados/borradolistado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador") {
        // res.send('Notes from data base');
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const juzgados = await Juzgados.find({ borrado: "Si" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/juzgados/borradoslistJuzgados', { juzgados });
    } else if (rolusuario == "Administrativo") {
        const juzgados = await Juzgados.find({ borrado: "Si" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/juzgados/borradoslistJuzgados', { juzgados });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO/PAPELERA Juzgados')
        return res.redirect('/');
    }
});

router.get('/juzgados/add', isAuthenticated, (req, res) => {
    res.render('notes/juzgados/newjuzgados');
});

router.post('/juzgados/newJuzgado', isAuthenticated, async (req, res) => {
    const { numjuzgado, dirjuzgado, teljuzgado, emailjuzgado, paisjuzgado,
        provinciajuzgado, localidadjuzgado, observacionesjuzgado
    } = req.body;
    const newJuzgados = new Juzgados({
        numjuzgado, dirjuzgado, teljuzgado, emailjuzgado, paisjuzgado,
        provinciajuzgado, localidadjuzgado, observacionesjuzgado
    })
    newJuzgados.user = req.user.id;
    newJuzgados.name = req.user.name;
    await newJuzgados.save();
    req.flash('success_msg', 'Juzgado Agregado Exitosamente');
    res.redirect('/juzgados/listado');
})

router.get('/juzgados/list/:id', isAuthenticated, async (req, res) => {
    const Juzgados = await Juzgados.findById(req.params.id).lean()
    res.render('notes/juzgados/planillalistajuzgado', { Juzgados })
});

router.get('/juzgados/edit/:id', isAuthenticated, async (req, res) => {
    const juzgados = await Juzgados.findById(req.params.id).lean()
    res.render('notes/juzgados/editJuzgado', { juzgados })
});

router.put('/juzgados/marcadelete/:id', isAuthenticated, async (req, res) => {
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Juzgados.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Juzgado a Papelera Reciclaje')
    res.redirect('/juzgados/listado');
});

router.put('/juzgados/marcadeleterestaurar/:id', isAuthenticated, async (req, res) => {
    const borrado = "No";
    const fechaborrado = "Restaurado";
    const userborrado = req.user.name;
    await Juzgados.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Juzgado Restaurado')
    res.redirect('/juzgados/borradolistado');
});

router.put('/notes/editJuzgado/:id', isAuthenticated, async (req, res) => {
    const { numjuzgado, dirjuzgado, teljuzgado, emailjuzgado, paisjuzgado,
        provinciajuzgado, localidadjuzgado, observacionesjuzgado } = req.body
    await Juzgados.findByIdAndUpdate(req.params.id, {
        numjuzgado, dirjuzgado, teljuzgado, emailjuzgado, paisjuzgado,
        provinciajuzgado, localidadjuzgado, observacionesjuzgado
    });
    req.flash('success_msg', 'Juzgado actualizado')
    res.redirect('/juzgados/planillalistajuzgado');
});

// *** SI O SI LOS MODULE EXPLORTS ***
module.exports = router;