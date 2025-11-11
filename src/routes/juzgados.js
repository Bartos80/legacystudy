// **** Juzgados ****
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
const Juzgados = require('../models/juzgado') //** SI O SI LLAMAR AL MODEL Q USAMOS EN ESTE ROUTES */
const expedientejuzgado = require('../models/expedientejuzgado')

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
    const juzgados = await Juzgados.findById(req.params.id).lean()
    res.render('notes/juzgados/listjuzgado', { juzgados })
});

router.put('/juzgados/marcabajajuzgado/:id', isAuthenticated, async (req, res) => {
    const idExpedienteRetorno = req.body.idRetorno;
    console.log("id retorno RECIBIDO:", idExpedienteRetorno);
    const juzgadoId = req.params.id;
    try {
        const bajajuzgado = "Si";
        const fechabaja = new Date();
        await expedientejuzgado.findByIdAndUpdate(juzgadoId, {
            bajajuzgado, fechabaja
        });
        req.flash('success_msg', 'Juzgado dado de baja'); // Esto está bien aquí

        if (idExpedienteRetorno) {
            // Construir la URL de retorno: /expedientes/list/68ffe6825453680d456c586e
            const urlRetorno = `/expedientes/list/${idExpedienteRetorno}`;

            // ⭐️ La redirección efectiva 
            res.redirect(urlRetorno);
        } else {
            res.redirect('/expedientes/listado');
        }
    } catch (error) {
        console.error("Error al guardar la vinculación:", error);
        // Si hay un error, puede ser útil redirigir de nuevo al formulario para mostrar el error.
        res.status(500).send("Error al procesar la solicitud. Inténtelo de nuevo.");
    }
});

router.put('/juzgados/desmarcabajajuzgado/:id', isAuthenticated, async (req, res) => {
    const bajajuzgado = "No";
    const fechabaja = new Date();
    await expedientejuzgado.findByIdAndUpdate(req.params.id, {
        bajajuzgado, fechabaja
    });
    req.flash('success_msg', 'Juzgado recuperado')
    res.redirect = '/expedientes/list/';
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


router.get('/juzgados/edit/:id', isAuthenticated, async (req, res) => {
    const juzgados = await Juzgados.findById(req.params.id).lean()
    res.render('notes/juzgados/editjuzgado', { juzgados })
});

router.put('/juzgados/editJuzgado/:id', isAuthenticated, async (req, res) => {
    const { numjuzgado, dirjuzgado, teljuzgado, emailjuzgado, paisjuzgado,
        provinciajuzgado, localidadjuzgado, observacionesjuzgado } = req.body
    await Juzgados.findByIdAndUpdate(req.params.id, {
        numjuzgado, dirjuzgado, teljuzgado, emailjuzgado, paisjuzgado,
        provinciajuzgado, localidadjuzgado, observacionesjuzgado
    });
    req.flash('success_msg', 'Juzgado actualizado')
    res.redirect('/juzgados/listado');
});

// *** SI O SI LOS MODULE EXPLORTS ***
module.exports = router;