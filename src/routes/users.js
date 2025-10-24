const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const User =  require ('../models/User');
const passport = require ('passport');
const { isAuthenticated } = require('../helpers/auth')

router.get('/users/signin', (req, res) => {
    res.render('users/signin');
});

router.post('/users/signin', passport.authenticate('local',{
    successRedirect: '/about',
    failureRedirect: '/users/signin',
    failureFlash: true
}));

// --- Configuración del Admin Inicial ---
const ADMIN_EMAIL = 'admin@admin.com';
// const ADMIN_PASSWORD_RAW = 'Admin';
const ADMIN_NAME = 'Admin Principal';
const ADMIN_ROLE = 'Administrador';
const SALT_ROUNDS = 10; // Nivel de seguridad del hashing

//createAdminIfNoUsers(); // Llamar a la función al cargar este módulo

async function createAdminIfNoUsers() {
    console.log('--- Iniciando verificación de usuarios en MongoDB ---');
    try {
        // 1. Contar el número de documentos en la colección 'users'
        const userCount = await User.countDocuments({});
        if (userCount === 0) {
            console.log('¡Colección de usuarios vacía! Creando usuario Administrador por defecto...');
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD_RAW, SALT_ROUNDS);
            // 3. Crear (Insertar) el nuevo usuario Administrador usando el modelo Mongoose
            const newUser = await User.create({
                estudioempresa: RD-IT,
                rolusuario: Administrador,
                name: Administrador,
                celular: "000-0000",
                email: "admin@admin.com",
                dni: "00000000",
                codigousuario: "000",                
                date: new Date()
            });

            if (newUser) {
                console.log(`✅ Usuario Administrador '${ADMIN_EMAIL}' creado exitosamente en MongoDB.`);
            } else {
                // Esta rama es poco probable si la inserción fue exitosa, pero es un buen control.
                console.error('❌ Error al insertar el usuario Administrador en MongoDB.');
            }

        } else {
            console.log(`La colección de usuarios tiene ${userCount} registro(s). El administrador por defecto NO fue creado.`);
        }
    } catch (error) {
        // Este error puede ocurrir si la conexión a MongoDB no está lista o si hay problemas de validación del esquema.
        console.error('🛑 ERROR en la inicialización de la base de datos (createAdminIfNoUsers):', error.message);
    }
}

// router.get ('/users/signup', (req, res) => {
router.get ('/users/11vvsOpmo90W', isAuthenticated,  (req, res) => {    
    const rolusuario = req.user.rolusuario;
    //console.log ("ROL USUARIO",rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Programador" ) {
        // res.send('Notes from data base');
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        res.render ('users/signup');
    } else {        
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA ADMIN')
        return res.redirect('/');
    }
});

// *** cuando se borra el registro admin **
router.get ('/users/11vvsOpmo90W-MAD', (req, res) => {
    res.render ('users/signup');
});

router.post('/users/signup', isAuthenticated, async (req, res) =>{
    const { estudioempresa, rolusuario, name, celular, email, dni, codigousuario, funcion, password, confirm_password, date} = req.body;
    const errors = [];
    if(rolusuario.length<=0 || name.length<=0 || email.length<=0 || dni.length<=0 || password.length<=0 || confirm_password.length<=0){
        errors.push({text:'Todos los Datos deben ser Cargados'})
    }
    if (password != confirm_password){
        errors.push({text: "Las contraseñas deben ser iguales"});
    }
    if (password.length < 4 ){
        errors.push({text: "Contraseña debe tener mas de 4 caracteres"});
    }
    if (errors.length>0){
        res.render('users/signup', {errors, estudioempresa, name, dni, codigousuario, funcion, rolusuario, celular, email, password, confirm_password, date});
    } else {
        const emailUser = await User.findOne({ email: email });
        if (emailUser) {
                // req.flash('error_msg', 'El Correo ya esta en Uso!');
                req.flash('success_msg', 'El Correo está en Uso. Pruebe ingresando un Correo Distinto')
                return res.redirect("/users/11vvsOpmo90W");
                // res.render('users/signup', {errors, name, email, password, confirm_password});
        }
        const newUser = new User({rolusuario, estudioempresa, name, dni, codigousuario, funcion, rolusuario, celular, email, password, date});
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password, salt);
        // newUser.password = await newUser.EncryptPassword(password); //NOSE PORQUE NO ANDA
        await newUser.save();
        req.flash('success_msg', 'Nuevo Usuario Registrado');
        res.redirect('/usuarios');        
}});

router.get('/users/logout', function (req, res, next) {
    req.logout(function(err) {
      if (err) { 
        return next(err); 
        }
      res.redirect('/');
    });
  });

module.exports = router;