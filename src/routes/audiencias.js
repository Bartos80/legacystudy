const express = require('express')
const router = express.Router()
// const bcrypt = require("bcrypt");
// const passport = require ('passport');
// const User =  require ('../models/User')
//const bcrypt = require("bcrypt");
//const mongopagi = require('mongoose-paginate-v2') Paginacion de mongodb

const fs = require('fs').promises
const { isAuthenticated } = require('../helpers/auth')


// *ZONA PDF* //
const pdf = require("html-pdf");
const User = require('../models/User');
var pdfoptionsA4 = { format: 'A4' };

// tengo que requerir los modelos para que mongoose me cree las tablas
const Audiencia = require('../models/audiencia');

// **esto es para agregar campo borrado a todos los q no tienen borrado marcado**
router.put('/audiencia/listadoborradosenno', isAuthenticated, async (req, res) => {
    await Audiencia.update({}, { $set: { borrado: "No" } }, { upsert: false, multi: true })
    req.flash('success_msg', 'Todos las Multas Marcadas')
    res.redirect('/audiencia/listado');
});

router.get('/audiencias/add', isAuthenticated, (req, res) => {
    res.render('notes/audiencias/newaudiencia');
})

router.get('/audiencias/add/:id', isAuthenticated, (req, res) => {
    res.render('notes/audiencias/newaudiencia');
})

router.post('/audiencias/newaudiencia', isAuthenticated, async (req, res) => {
    const { juzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horaaudiencia,
        dateturno, observaciones, user, name, date
    } = req.body;
    const newaudiencia = new Audiencia({
        juzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horaaudiencia,
        dateturno, observaciones, user, name, date
    })
    newaudiencia.user = req.user.id;
    newaudiencia.name = req.user.name;
    await newaudiencia.save();
    req.flash('success_msg', 'Audiencia Agregada Exitosamente');
    res.redirect('/audiencia/listado');
})

// router.post('/notes/newaudiencia/:id', isAuthenticated, async (req, res) => {
//     const { juzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horaaudiencia,
//         dateturno, observaciones, user, name, date } = req.body;
//     const newaudiencia = new Audiencia({
//         juzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horaaudiencia,
//         dateturno, observaciones, user, name, date
//     })
//     newaudiencia.user = req.user.id;
//     newaudiencia.name = req.user.name;
//     await newaudiencia.save();
//     req.flash('success_msg', 'Turno Agregado Exitosamente');
//     res.redirect('/audiencia/listado');
// })
router.post('/notes/newaudiencia/:id', isAuthenticated, async (req, res) => {
    const {
        juzgado, numexpediente, estadoexpediente, caratula, secretaria,
        ultimanotificacion, horaaudiencia, dateturno, observaciones,
        user, name, date
    } = req.body;
    const errors = [];
    if (!juzgado) {
        errors.push({ text: 'Por favor, ingrese el Juzgado.' });
    }
    if (!numexpediente) {
        errors.push({ text: 'Por favor, ingrese el Número de Expediente.' });
    }
    if (!caratula) {
        errors.push({ text: 'Por favor, ingrese la Carátula.' });
    }
    if (!dateturno) {
        errors.push({ text: 'Por favor, ingrese la Fecha del Turno/Audiencia.' });
    }
    if (errors.length > 0) {
        errors.forEach(error => req.flash('error_msg', error.text));
        return res.render('ruta/donde/esta/el/formulario', {
            errors,
            juzgado, numexpediente, estadoexpediente, caratula, secretaria,
            ultimanotificacion, horaaudiencia, dateturno, observaciones
        });
    }
    try {
        const newaudiencia = new Audiencia({
            juzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion,
            horaaudiencia, dateturno, observaciones, user, name, date
        });
        newaudiencia.user = req.user.id;
        newaudiencia.name = req.user.name;
        await newaudiencia.save();
        req.flash('success_msg', 'Turno Agregado Exitosamente');
        res.redirect('/audiencia/listado');
    } catch (error) {
        console.error("Error al guardar la nueva audiencia:", error);
        req.flash('error_msg', 'Error al guardar el turno en la base de datos.');
        res.redirect('back'); // Redirige a la página anterior
    }
});


router.get('/audiencia', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        // res.send('Notes from data base');
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const audiencias = await Audiencia.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/allaudiencia', { audiencias });
    } else if (rolusuario == "Administrador" || rolusuario == "Programador") {
        const audiencias = await Audiencia.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/allaudiencia', { audiencias });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA MESA DE ENTRADA')
        return res.redirect('/');
    }
});

router.post('/audiencia/descargarestadisticamesa', isAuthenticated, async (req, res) => {
    const ubicacionPlantilla = require.resolve("../views/notes/audiencia/audienciaestadisticaimprimir.hbs")
    //const puerto = "172.25.2.215";
    var fstemp = require('fs');
    let tabla = "";
    var contio = 0;
    var contop = 0;
    var contvis = 0;
    var contsub = 0;
    var contador = 0;
    var filtro = "";
    var tipofiltro = "";
    let contenidoHtml = fstemp.readFileSync(ubicacionPlantilla, 'utf8');
    var tablaaudiencia = "" //await Audiencia.find().lean().sort({ date: 'desc' });
    //<td>${multas.fecha}</td> este etaba en tablamultas
    const { nomyape, adrema, juzgado, desde, hasta } = req.body;
    if (nomyape) {
        const dni = nomyape
        tablaaudiencia = await Audiencia.find({ $or: [{ nomyape: { $regex: nomyape, $options: "i" } }, { dni: { $regex: dni, $options: "i" } }] }).lean().sort({ date: 'desc' });
        //tablaaudiencia = await Audiencia.find({ nomyape: { $regex: nomyape, $options: "i" } }).lean();
        filtro = nomyape;
        tipofiltro = "por Nombre y Apellido/DNI"
        //console.log("Multas Estadistica", multas)
        //contador = 0
        // for (let i = 0; i < tablaaudiencia.length; i++) {
        //     contador = i
        // }
    } else if (adrema) {
        const numexpediente = adrema;
        tablaaudiencia = await Audiencia.find({ $or: [{ adrema: { $regex: adrema, $options: "i" } }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ date: 'desc' });
        filtro = adrema;
        tipofiltro = "por Adrema"
        //contador = 0
        // for (let i = 0; i < tablaaudiencia.length; i++) {
        //     contador = i
        // }    
    } else if (desde && hasta) {
        if (sector) {
            filtro = "Sector: " + sector + " - por Fecha: " + desde + " / " + hasta;
            tipofiltro = "Sector con Fecha Desde y Fecha Hasta"
            var o = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
            const hastao = o.setDate(o.getDate() + 1); //HASTAD= 1690243200000
            console.log("HASTAO", hastao)
            console.log("D", o)
            tablaaudiencia = await Audiencia.find({ $and: [{ date: { $gte: desde, $lte: hastao } }, { sector: { $regex: sector, $options: "i" } }] }).lean().sort({ date: 'asc' });
        } else {
            filtro = "por Fecha" + desde + "/" + hasta;
            tipofiltro = "Fecha Desde y Fecha Hasta"
            //contador = 0
            var d = new Date(hasta);
            const hastao = d.setDate(d.getDate() + 1);
            tablaaudiencia = await Audiencia.find({ date: { $gte: desde, $lte: hastao } }).lean().sort({ sector: 'desc' });;
            //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
            //.find({ desde: { $regex: date, $options: "i" } }).lean();            
            // for (let i = 0; i < tablaaudiencia.length; i++) {
            //     contador += 1
        }
    } else if (juzgado) {
        tablaaudiencia = await Audiencia.find({ juzgado: { $regex: juzgado, $options: "i" } }).lean();
        filtro = juzgado;
        tipofiltro = "por Juzgado interviniente"
        ///contador = 0
        // for (let i = 0; i < tablaaudiencia.length; i++) {
        contador += 1
        // }
    }
    for (const audiencia of tablaaudiencia) {
        // Y concatenar las multas 
        if (audiencia.juzgado == "Inspección Obras") {
            contio += 1
        } else if (audiencia.juzgado == "Obras Particulares") {
            contop += 1
        } else if (audiencia.juzgado == "Visado") {
            contvis += 1
        } else if (audiencia.juzgado == "Sub Secretaria") {
            contsub += 1
        }
        contador += 1
        tabla += `<tr>   
        <td>-</td> 
    <td style="text-transform: lowercase;">${audiencia.juzgado}</td>
    <td style="text-transform: lowercase;">${audiencia.numexpediente}</td>
    <td style="text-transform: lowercase;">${audiencia.nomyape}</td>
    <td style="text-transform: lowercase;">${audiencia.dni}</td>
    <td style="text-transform: lowercase;">${audiencia.contacto}</td>
    <td style="text-transform: lowercase;">${audiencia.fechaingreso}</td>
    <td style="text-transform: lowercase;">${audiencia.horaingreso}</td>
    <td>-</td>
    </tr>`;
    }
    contador = contador - 1;
    contenidoHtml = contenidoHtml.replace("{{tablaaudiencia}}", tabla);
    contenidoHtml = contenidoHtml.replace("{{contador}}", contador);
    contenidoHtml = contenidoHtml.replace("{{filtro}}", filtro);
    contenidoHtml = contenidoHtml.replace("{{tipofiltro}}", tipofiltro);
    contenidoHtml = contenidoHtml.replace("{{contio}}", contio);
    contenidoHtml = contenidoHtml.replace("{{contop}}", contop);
    contenidoHtml = contenidoHtml.replace("{{contvis}}", contvis);
    contenidoHtml = contenidoHtml.replace("{{contsub}}", contsub);
    //contenidoHtml = contenidoHtml.replace("{{multas}}");    
    pdf.create(contenidoHtml, pdfoptionsA4).toStream((error, stream) => {
        if (error) {
            res.end("Error creando PDF: " + error)
        } else {
            req.flash('success_msg', 'Mesa Entrada Estadistica impresa')
            res.setHeader("Content-Type", "application/pdf");
            stream.pipe(res);
        }
    });
})

router.get('/audiencia/Estadisticas', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    var contador = 0;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Audiencias" || rolusuario == "Administrador") {
        const audiencia = await Audiencia.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
        for (let i = 0; i < audiencia.length; i++) {
            contador = contador + 1
        }
        res.render('notes/audiencia/estadisticaaudiencia', { audiencia, contador });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.post('/audiencia/sacarestadistica', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { nomyape, adrema, sector, desde, hasta } = req.body;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Audiencias") {
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        var contador = 0;
        if (nomyape) {
            // var dni = "";
            // if (typeof nomyape == 'number') {
            //     dni = parseInt(nomyape)
            // } else {
            //     dni = ""
            // }
            const audiencia = await Audiencia.find({ $or: [{ nomyape: { $regex: nomyape, $options: "i" } }, { dni: nomyape }] }).lean().sort({ date: 'desc' });
            //console.log("Multas Estadistica", multas)
            for (let i = 0; i < audiencia.length; i++) {
                contador = contador + 1
            }
            res.render('notes/audiencia/estadisticaaudiencia', { audiencia, contador });
        } else if (adrema) {
            var numexpediente = adrema;
            const audiencia = await Audiencia.find({ $or: [{ adrema: { $regex: adrema, $options: "i" } }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ date: 'desc' });
            //const audiencia = await Audiencia.find({ adrema: { $regex: adrema, $options: "i" } }).lean().sort({ date: 'desc' });
            for (let i = 0; i < audiencia.length; i++) {
                contador = contador + 1
            }
            res.render('notes/audiencia/estadisticaaudiencia', { audiencia, contador });
        } else if (sector) {
            if ((desde && hasta)) {
                var d = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
                const hastad = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000                     
                const audiencia = await Audiencia.find({ $and: [{ date: { $gte: desde, $lte: hastad } }, { sector: sector }] }).lean().sort({ sector: 'asc' });
                //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
                //.find({ desde: { $regex: date, $options: "i" } }).lean().sort({ date: 'desc' });  

                for (let i = 0; i < audiencia.length; i++) {
                    contador = contador + 1
                }
                res.render('notes/audiencia/estadisticaaudiencia', { audiencia, contador });
            }
        } else {
            const audiencia = await Audiencia.find({ sector: { $regex: sector, $options: "i" } }).lean().sort({ date: 'desc' });
            for (let i = 0; i < audiencia.length; i++) {
                contador = contador + 1
            }
            res.render('notes/audiencia/estadisticaaudiencia', { audiencia, contador });
        }
    } else if (desde && hasta) {
        console.log("DESDE", desde)
        console.log("HASTA", hasta)
        var d = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
        const hastad = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000
        console.log("HASTAD", hastad)
        console.log("D", d)
        const audiencia = await Audiencia.find({ date: { $gte: desde, $lte: hastad } }).lean().sort({ sector: 'desc' });
        //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
        //.find({ desde: { $regex: date, $options: "i" } }).lean().sort({ date: 'desc' });            
        for (let i = 0; i < audiencia.length; i++) {
            contador = contador + 1
        }
        res.render('notes/audiencia/estadisticaaudiencia', { audiencia, contador });
        // } else if ((desde && hasta) && sector) {            
        //     var d = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
        //     const hastad = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000                     
        //     const audiencia = await Audiencia.find({ $and: [{date: { $gte: desde, $lte: hastad }},{sector: sector}]}).lean().sort({ sector: 'asc' });
        //     //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
        //     //.find({ desde: { $regex: date, $options: "i" } }).lean().sort({ date: 'desc' });                      
        //     for (let i = 0; i < audiencia.length; i++) {                
        //         contador = contador + 1
        //     }
        //     res.render('notes/audiencia/estadisticaaudiencia', { audiencia, contador });
        // }
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.get('/audiencia/listado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        const audienciastabla = await Audiencia.find({ borrado: "No" }).limit(30).lean().sort({ horaaudiencia: 'desc' });
        for (var audiencias of audienciastabla) {
            //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
            //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

            // permite mostrar en las tablas la fecha sola y ordenada
            var tipoint = audiencias.dateturno;
            if (tipoint != null) {
                const fecha = new Date(audiencias.dateturno);
                const dia = fecha.getDate() + 1;
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
                audiencias.dateturno = fullyear;
            } else {
                audiencias.dateturno = "----"
            }
            // necesito igualar para que se copie el cambio
            audiencias = audienciastabla
            //console.log("expedcoordresultado", audiencias);
            //console.log("expedcoordresultadotabla", expedcoordresultadotabla);
        }
        //res.render('notes/inspecciones/listexpcordintvenc', { expedcoordresultado });
        res.render('notes/audiencias/planillalistaaudiencia', { audiencias });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA MESA DE ENTRADA')
        return res.redirect('/');
    }
});

router.get('/audiencias/borradolistado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        const audienciastabla = await Audiencia.find({ borrado: "Si" }).limit(30).lean().sort({ horaaudiencia: 'desc' });
        for (var audiencias of audienciastabla) {
            //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
            //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

            // permite mostrar en las tablas la fecha sola y ordenada
            var tipoint = audiencias.dateturno;
            if (tipoint != null) {
                const fecha = new Date(audiencias.dateturno);
                const dia = fecha.getDate() + 1;
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
                audiencias.dateturno = fullyear;
            } else {
                audiencias.dateturno = "----"
            }
            // necesito igualar para que se copie el cambio
            audiencias = audienciastabla
            //console.log("expedcoordresultado", audiencias);
            //console.log("expedcoordresultadotabla", expedcoordresultadotabla);
        }
        for (var audiencias of audienciastabla) {
            //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
            //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

            // permite mostrar en las tablas la fecha sola y ordenada
            var tipoint = audiencias.fechaborrado;
            if (tipoint != null) {
                const fecha = new Date(audiencias.fechaborrado);
                const dia = fecha.getDate() + 1;
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
                audiencias.fechaborrado = fullyear;
            } else {
                audiencias.fechaborrado = "----"
            }
            // necesito igualar para que se copie el cambio
            audiencias = audienciastabla
            //console.log("expedcoordresultado", audiencias);
            //console.log("expedcoordresultadotabla", expedcoordresultadotabla);
        }
        res.render('notes/borrados/borradolistaaudiencias', { audiencias });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO/AREA PAPELERA AUDIENCIAS')
        return res.redirect('/');
    }
});

router.get('/audiencia/add/:id', isAuthenticated, async (req, res) => {
    const audiencia = await Audiencia.findById(req.params.id).lean()
    res.render('notes/newaudiencias', { audiencia })
});

router.get('/audiencia/edit/:id', isAuthenticated, async (req, res) => {
    const audiencia = await Audiencia.findById(req.params.id).lean()

    var tipoint = audiencia.dateturno;
            if (tipoint != null) {
                const fecha = new Date(audiencia.dateturno);
                const dia = fecha.getDate() + 1;
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
                audiencia.dateturno = fullyear;
            } else {
                audiencia.dateturno = "----"
            }
    res.render('notes/audiencias/editaudiencia', { audiencia })
});

router.put('/notes/editaudiencia/:id', isAuthenticated, async (req, res) => {
    const { juzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horaaudiencia,
        dateturno, observaciones } = req.body;

    await Audiencia.findByIdAndUpdate(req.params.id, {
        juzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horaaudiencia,
        dateturno, observaciones
    });
    req.flash('success_msg', 'Audiencia actualizada')
    res.redirect('/Audiencia/listado');
});

router.get('/audiencia/list/:id', isAuthenticated, async (req, res) => {
    const audiencia = await Audiencia.findById(req.params.id).lean()

    var tipoint = audiencia.dateturno;
    if (tipoint != null) {
        const fecha = new Date(audiencia.dateturno);
        const dia = fecha.getDate() + 1;
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
        audiencia.dateturno = fullyear;
    } else {
        audiencia.dateturno = "----"
    }
    res.render('notes/audiencias/listaudiencia', { audiencia })
});
router.get('/audiencia/borradolist/:id', isAuthenticated, async (req, res) => {
    const audiencia = await Audiencia.findById(req.params.id).lean()
    // console.log(note.date);
    res.render('notes/borrados/borradolistaudiencia', { audiencia })
});

router.get('/audiencia/infoborradolist/:id', isAuthenticated, async (req, res) => {
    const audiencia = await Audiencia.findById(req.params.id).lean()
    // console.log(note.date);
    res.render('notes/borrados/infoborradoaudiencia', { audiencia })
});

// *** SECTOR BUSQUEDA ***
router.post('/audiencia/findsector', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { sector } = req.body;
    const audiencias = await Audiencia.find({ $and: [{ borrado: "No" }, { sector: { $regex: sector, $options: "i" } }] }).lean().sort({ horaaudiencia: 'desc' })
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!audiencias) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allaudiencia");
        } else {
            res.render('notes/findaudiencia', { audiencias })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!audiencias) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allaudiencia");
        } else {
            res.render('notes/findaudienciaadm', { audiencias })
        }
    } else {
        res.render('notes/findaudiencia', { audiencias })
    }
});

router.post('/audiencia/findiniciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { nomyape } = req.body;
    const audiencias = await Audiencia.find({ $and: [{ borrado: "No" }, { nomyape: { $regex: nomyape, $options: "i" } }] }).lean().sort({ horaaudiencia: 'desc' })
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!audiencias) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allaudiencia");
        } else {
            res.render('notes/findaudiencia', { audiencias })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!audiencias) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allaudiencia");
        } else {
            res.render('notes/findaudienciaadm', { audiencias })
        }
    } else {
        res.render('notes/findaudiencia', { audiencias })
    }
});

router.post('/audiencia/findlistasector', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { sector } = req.body;
    const audiencias = await Audiencia.find({ $and: [{ borrado: "No" }, { sector: { $regex: sector, $options: "i" } }] }).lean().sort({ horaaudiencia: 'desc' })
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!audiencias) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allaudiencia");
        } else {
            res.render('notes/audiencias/planillalistaaudiencia', { audiencias })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!audiencias) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allaudiencia");
        } else {
            res.render('notes/audiencias/planillalistaaudiencia', { audiencias })
        }
    } else {
        res.render('notes/audiencias/planillalistaaudiencia', { audiencias })
    }
});

router.post('/audiencia/findlistainiciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { nomyape } = req.body;
    const audiencias = await Audiencia.find({ $and: [{ borrado: "No" }, { nomyape: { $regex: nomyape, $options: "i" } }] }).lean().sort({ horaaudiencia: 'desc' })
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!audiencias) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allaudiencia");
        } else {
            res.render('notes/audiencias/planillalistaaudiencia', { audiencias })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!audiencias) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allaudiencia");
        } else {
            res.render('notes/audiencias/planillalistaaudiencia', { audiencias })
        }
    } else {
        res.render('notes/audiencias/planillalistaaudiencia', { audiencias })
    }
});

router.post('/audiencia/findcaratula', isAuthenticated, async (req, res) => {
    const { caratula } = req.body;
    const audienciastabla = await Audiencia.find({ $and: [{ borrado: "No" }, { caratula: { $regex: caratula, $options: "i" } }] }).lean().sort({ horaaudiencia: 'desc' })
    for (var audiencias of audienciastabla) {
        var tipoint = audiencias.dateturno;
        if (tipoint != null) {
            const fecha = new Date(audiencias.dateturno);
            const dia = fecha.getDate() + 1;
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
            const fullyear = diastring + mes + ano
            audiencias.dateturno = fullyear;
        } else {
            audiencias.dateturno = "----"
        }
        audiencias = audienciastabla
    }
    if (!audiencias) {
        req.flash('success_msg', 'cargue un Número de DNI')
        return res.render("notes/audiencias/planillalistaaudiencia");
    } else {
        res.render('notes/audiencias/planillalistaaudiencia', { audiencias })
    }
});

router.post('/audiencia/findjuzgado', isAuthenticated, async (req, res) => {
    const { juzgado } = req.body;
    const audienciastabla = await Audiencia.find({ $and: [{ borrado: "No" }, { juzgado: { $regex: juzgado, $options: "i" } }] }).lean().sort({ horaaudiencia: 'desc' })
    for (var audiencias of audienciastabla) {
        var tipoint = audiencias.dateturno;
        if (tipoint != null) {
            const fecha = new Date(audiencias.dateturno);
            const dia = fecha.getDate() + 1;
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
            const fullyear = diastring + mes + ano
            audiencias.dateturno = fullyear;
        } else {
            audiencias.dateturno = "----"
        }
        audiencias = audienciastabla
    }
    if (!audiencias) {
        req.flash('success_msg', 'cargue un Juzgado')
        return res.render("notes/audiencias/planillalistaaudiencia");
    } else {
        res.render('notes/audiencias/planillalistaaudiencia', { audiencias })
    }
});

router.post('/audiencia/findexpediente', isAuthenticated, async (req, res) => {
    const { numexpediente } = req.body;
    const audienciastabla = await Audiencia.find({ $and: [{ borrado: "No" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ horaaudiencia: 'desc' })
    //const audienciastabla = await Audiencia.find({ borrado: "Si" }).limit(30).lean().sort({ horaaudiencia: 'desc' });
    for (var audiencias of audienciastabla) {
        //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
        //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

        // permite mostrar en las tablas la fecha sola y ordenada
        var tipoint = audiencias.dateturno;
        if (tipoint != null) {
            const fecha = new Date(audiencias.dateturno);
            const dia = fecha.getDate() + 1;
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
            audiencias.dateturno = fullyear;
        } else {
            audiencias.dateturno = "----"
        }
        // necesito igualar para que se copie el cambio
        audiencias = audienciastabla
        //console.log("expedcoordresultado", audiencias);
        //console.log("expedcoordresultadotabla", expedcoordresultadotabla);
    }
    if (!audiencias) {
        req.flash('success_msg', 'cargue un Número de Expediente')
        return res.render("notes/audiencias/planillalistaaudiencia");
    } else {
        res.render('notes/audiencias/planillalistaaudiencia', { audiencias })
    }
});

router.post('/audiencia/findlistaexpediente', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { numexpediente } = req.body;
    const audiencias = await Audiencia.find({ $and: [{ borrado: "No" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ horaaudiencia: 'desc' })
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!audiencias) {
            req.flash('success_msg', 'cargue Expediente')
            return res.render("notes/audiencias/planillalistaaudiencia");
        } else {
            res.render('notes/audiencias/planillalistaaudiencia', { audiencias })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!audiencias) {
            req.flash('success_msg', 'cargue Expediente')
            return res.render("notes/allaudiencia");
        } else {
            res.render('notes/planillalistaaudiencia', { audiencias })
        }
    } else {
        res.render('notes/planillalistaaudiencia', { audiencias })
    }
});

router.post('/audiencia/findfechaentrada', isAuthenticated, async (req, res) => {
    const { fechaingreso } = req.body;
    const audiencias = await Audiencia.find({ $and: [{ borrado: "No" }, { fechaingreso: { $regex: fechaingreso, $options: "i" } }] }).lean().sort({ horaaudiencia: 'desc' })
    if (!audiencias) {
        req.flash('success_msg', 'cargue Fecha Ingreso')
        return res.render("notes/allaudiencia");
    } else {
        res.render('notes/findaudiencia', { audiencias })
    }
});

router.post('/audiencia/findlistafechaentrada', isAuthenticated, async (req, res) => {
    const { fechaingreso } = req.body;
    const audiencias = await Audiencia.find({ $and: [{ borrado: "No" }, { fechaingreso: { $regex: fechaingreso, $options: "i" } }] }).lean().sort({ horaaudiencia: 'desc' })
    if (!audiencias) {
        req.flash('success_msg', 'cargue Fecha Ingreso')
        return res.render("notes/allaudiencia");
    } else {
        res.render('notes/audiencias/planillalistaaudiencia', { audiencias })
    }
});

// *** SECTOR BUSQUEDA BORRADOS***
router.post('/audiencia/borradofindlistasector', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { sector } = req.body;
    const audiencias = await Audiencia.find({ $and: [{ borrado: "Si" }, { sector: { $regex: sector, $options: "i" } }] }).lean().sort({ horaaudiencia: 'desc' })
    res.render('notes/borrados/borradolistaudiencia', { audiencias })
});

router.post('/audiencia/borradofindlistainiciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { nomyape } = req.body;
    const audiencias = await Audiencia.find({ $and: [{ borrado: "Si" }, { nomyape: { $regex: nomyape, $options: "i" } }] }).lean().sort({ horaaudiencia: 'desc' })
    res.render('notes/borrados/borradolistaudiencia', { audiencias })
});

router.post('/audiencia/borradofindlistadni', isAuthenticated, async (req, res) => {
    const { dni } = req.body;
    const audiencias = await Audiencia.find({ $and: [{ borrado: "Si" }, { dni: { $regex: dni, $options: "i" } }] }).lean().sort({ horaaudiencia: 'desc' })
    res.render('notes/borrados/borradolistaudiencia', { audiencias })
});

router.post('/audiencia/borradofindlistaexpediente', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { numexpediente } = req.body;
    const audiencias = await Audiencia.find({ $and: [{ borrado: "Si" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ horaaudiencia: 'desc' })
    res.render('notes/borrados/borradolistaudiencia', { audiencias })
});

router.post('/audiencia/borradofindlistafechaentrada', isAuthenticated, async (req, res) => {
    const { fechaingreso } = req.body;
    const audiencias = await Audiencia.find({ $and: [{ borrado: "Si" }, { fechaingreso: { $regex: fechaingreso, $options: "i" } }] }).lean().sort({ horaaudiencia: 'desc' })
    res.render('notes/borrados/borradolistaudiencia', { audiencias })
});

// **** AGREGAR TURNO A CLIENTE HABITUAL ****
router.put('/notes/editaddaudiencia/:id', isAuthenticated, async (req, res) => {
    const { juzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horaaudiencia,
        dateturno, observaciones } = req.body
    await Audiencia.findByIdAndUpdate(req.params.id, {
        juzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horaaudiencia,
        dateturno, observaciones
    });
    req.flash('success_msg', 'Audiencia nuevo Agregada')
    res.redirect('/audiencia/listado');
});

// ** SECTOR EDITAR **
// router.put('/notes/editaudiencia/:id', isAuthenticated, async (req, res) => {
//     const { juzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horaaudiencia,
//         dateturno, observaciones } = req.body
//     await Audiencia.findByIdAndUpdate(req.params.id, {
//         juzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horaaudiencia,
//         dateturno, observaciones
//     });
//     req.flash('success_msg', 'Audiencia Actualizada')
//     res.redirect('/audiencia/listado');
// });

// **** SECTOR DELETE ****

router.put('/audiencia/marcadelete/:id', isAuthenticated, async (req, res) => {
    //const fechaimpresohoy = new Date();    
    //await Multas.updateMany({ _id: "id" });  
    //Busco el id y le sumo 1 a veces impreso
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Audiencia.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Audiencia a Papelera Reciclaje')
    res.redirect('/audiencia/listado');
    // await Audiencia.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/audiencia/listado')
});

router.put('/audiencia/recuperarlistado', isAuthenticated, async (req, res) => {
    //await Multas.updateMany({ borrado: "Si", fechaborrado: new Date(), userborrado:req.user.name});    
    await Audiencia.updateMany({ borrado: 'Si' }, { borrado: "No", fechaborrado: "Recuperado" });
    req.flash('success_msg', 'todos los datos de Mesa de Entradas recuperados')
    res.redirect('/audiencia/listado');
    // await Audiencia.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/audiencia/listado')
});

router.put('/audiencia/marcadeleterestaurar/:id', isAuthenticated, async (req, res) => {
    //const fechaimpresohoy = new Date();    
    //await Multas.updateMany({ _id: "id" });  
    //Busco el id y le sumo 1 a veces impreso
    const borrado = "No";
    const fechaborrado = "Restaurado";
    const userborrado = req.user.name;
    await Audiencia.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Audiencia Restaurada de Papelera Reciclaje')
    res.redirect('/audiencias/borradolistado');
    // await Audiencia.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/audiencia/listado')
});

router.delete('/audiencia/delete/:id', isAuthenticated, async (req, res) => {
    await Audiencia.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Audiencia Eliminada')
    res.redirect('/audiencias/borradolistado')
});



// *** SI O SI LOS MODULE EXPLORTS ***
module.exports = router;