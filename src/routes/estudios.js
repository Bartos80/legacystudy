// **** estudios ****
const express = require('express')
const router = express.Router()


// Middleware necesario para leer req.body de formularios HTML
router.use(express.urlencoded({ extended: true }));
router.use(express.json()); // También útil si maneja peticiones JSON
//routerconst bcrypt = require("bcrypt");
// const passport = require ('passport');
// const User =  require ('../models/User')
//const bcrypt = require("bcrypt");
const fs = require('fs').promises
const { isAuthenticated } = require('../helpers/auth')

// tengo que requerir los modelos para que mongoose me cree las tablas
const Estudios = require('../models/estudio') //** SI O SI LLAMAR AL MODEL Q USAMOS EN ESTE ROUTES */

//const Expediente = require('../models/Expediente')
//const Expedentrsalida = require('../models/expedentrsalida')

router.get('/estudios/listado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    if (rolusuario == "Programador") {
        try {            
            const estudios = await Estudios.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
            res.render('notes/estudios/planillalistaestudio', { estudios });
        } catch (error) {
            console.error("Error al obtener el listado de estudios:", error);
            req.flash('error_msg', 'Error al cargar el listado de estudios. Intente nuevamente.');
            return res.redirect('/about');
        }
    } else {
        req.flash('error_msg', 'NO TIENE PERMISO AREA - ESTUDIOS JURIDICOS');
        return res.redirect('/');
    }
});

router.get('/estudios/borradolistado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador") {
        // res.send('Notes from data base');
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const estudios = await Estudios.find({ borrado: "Si" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/estudios/borradoslistestudios', { estudios });
    } else if (rolusuario == "Administrativo") {
        const estudios = await Estudios.find({ borrado: "Si" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/estudios/borradoslistestudios', { estudios });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO/PAPELERA estudios')
        return res.redirect('/');
    }
});

router.get('/estudios/add', isAuthenticated, (req, res) => {
    const rolusuario = req.user.rolusuario;
    if (rolusuario === "Programador") {
        try {
            res.render('notes/estudios/newestudios');
        } catch (error) {
            console.error("Error al Crear Estudio Juridico:", error);
            req.flash('error_msg', 'Error al cargar alta Estudio Jurídico. Intente nuevamente.');
            return res.redirect('/about');
        }
    } else {
        req.flash('error_msg', 'NO TIENE PERMISO AREA - NEW ESTUDIOS JURIDICOS');
        return res.redirect('/');
    }
});

router.post('/estudios/newestudio', isAuthenticated, async (req, res) => {
    
            const { numestudio, direstudio, telestudio, emailestudio, paisestudio,
                provinciaestudio, localidadestudio, observacionesestudio
            } = req.body;
            const newestudios = new Estudios({
                numestudio, direstudio, telestudio, emailestudio, paisestudio,
                provinciaestudio, localidadestudio, observacionesestudio
            })
            newestudios.user = req.user.id;
            newestudios.name = req.user.name;            
            await newestudios.save();
            req.flash('success_msg', 'estudio Agregado Exitosamente');
            res.redirect('/estudios/listado');
        
})

router.get('/estudios/list/:id', isAuthenticated, async (req, res) => {
    const estudios = await Estudios.findById(req.params.id).lean()
    res.render('notes/estudios/listestudio', { estudios })
});

router.put('/estudios/marcadelete/:id', isAuthenticated, async (req, res) => {
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Estudios.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'estudio a Papelera Reciclaje')
    res.redirect('/estudios/listado');
});

router.put('/estudios/marcadeleterestaurar/:id', isAuthenticated, async (req, res) => {
    const borrado = "No";
    const fechaborrado = "Restaurado";
    const userborrado = req.user.name;
    await Estudios.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'estudio Restaurado')
    res.redirect('/estudios/borradolistado');
});


router.get('/estudios/edit/:id', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    if (rolusuario === "Programador") {
        try {
            const estudios = await Estudios.findById(req.params.id).lean()
            res.render('notes/estudios/editestudio', { estudios })
        } catch (error) {
            console.error("Error al obtener el listado de estudios:", error);
            req.flash('error_msg', 'Error al cargar el listado de estudios. Intente nuevamente.');
            return res.redirect('/about');
        }
    } else {
        req.flash('error_msg', 'NO TIENE PERMISO AREA - EDIT ESTUDIOS JURIDICOS');
        return res.redirect('/');
    }
});

router.put('/estudios/editestudio/:id', isAuthenticated, async (req, res) => {
    const { numestudio, direstudio, telestudio, emailestudio, paisestudio,
        provinciaestudio, localidadestudio, observacionesestudio } = req.body
    await Estudios.findByIdAndUpdate(req.params.id, {
        numestudio, direstudio, telestudio, emailestudio, paisestudio,
        provinciaestudio, localidadestudio, observacionesestudio
    });
    req.flash('success_msg', 'estudio actualizado')
    res.redirect('/estudios/listado');
});

// *** SI O SI LOS MODULE EXPLORTS ***
module.exports = router;