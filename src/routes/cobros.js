const express = require('express')
const router = express.Router()

const fs = require('fs').promises
const { isAuthenticated } = require('../helpers/auth')


// *ZONA PDF* //
const pdf = require("html-pdf");
const User = require('../models/User');
var pdfoptionsA4 = { format: 'A4' };

// tengo que requerir los modelos para que mongoose me cree las tablas
const Cobro = require('../models/cobro');
const Juzgado = require('../models/juzgado');

// **esto es para agregar campo borrado a todos los q no tienen borrado marcado**
router.put('/cobro/listadoborradosenno', isAuthenticated, async (req, res) => {
    await Cobro.update({}, { $set: { borrado: "No" } }, { upsert: false, multi: true })
    req.flash('success_msg', 'Todos las Multas Marcadas')
    res.redirect('/cobro/listado');
});

router.get('/cobros/add', isAuthenticated, async (req, res) => {
    const juzgado = await Juzgado.find({ borrado: "No" }).lean();
    console.log("JKuzgados", juzgado)
    res.render('notes/cobros/newcobro', { juzgado });
})

router.get('/cobros/nuevocobro', isAuthenticated, async (req, res) => {
    const juzgado = await Juzgado.find({ borrado: "No" }).lean();
    //console.log("Juzgados", juzgado)
    res.render('notes/cobros/newcobro', { juzgado });
})


//El Siguiente Paso: Reportes
//Una vez que tengas los cobros, podrías necesitar un Dashboard de Ingresos. 
// Por ejemplo, una consulta en MongoDB que sume todos los cobros del mes:
router.get('/cobros/ingresodelmes/:id', isAuthenticated, async (req, res) => {
    const ingresosMes = await Cobro.aggregate([
        {
            $match: {
                fechaPago: { $gte: inicioMes, $lte: finMes },
                estado: 'Pagado'
            }
        },
        { $group: { _id: null, total: { $sum: "$montoTotal" } } }
    ]);
    res.render('notes/cobros/ingresodelmes', { ingresosMes });
})

//por si necesito saber todo lo q se le cobro a un solo cliente
//Para un estudio jurídico, lo ideal es que el cliente 
// tenga un Estado de Cuenta. 
// Te recomiendo agregar una lógica que sume todos 
// los cobros de un cliente y los reste de un "Presupuesto Inicial".
router.get('/cobros/totalcobrado/:id', isAuthenticated, async (req, res) => {
    const totalCobrado = await Cobro.aggregate([
        { $match: { clienteId: mongoose.Types.ObjectId(id) } },
        { $group: { _id: null, total: { $sum: "$montoTotal" } } }
    ]);
    ;
    res.render('notes/cobros/totalcobrado', { juzgado });
})

router.get('/cobros/add/:id', isAuthenticated, (req, res) => {
    res.render('notes/cobros/newcobro');
})

router.post('/cobros/newcobro', isAuthenticated, async (req, res) => {
    const idestudiouser = req.user.idestudio
    const { idjuzgado, numjuzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horacobro,
        dateturno, observaciones, user, name, date
    } = req.body;
    const newcobro = new Cobro({
        idjuzgado, idestudiouser, numjuzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horacobro,
        dateturno, observaciones, user, name, date
    })
    newcobro.user = req.user.id;
    newcobro.name = req.user.name;
    newcobro.idestudiouser = idestudiouser
    await newcobro.save();
    req.flash('success_msg', 'Cobro Agregada Exitosamente');
    res.redirect('notes/cobro/listado');
})

// router.post('/notes/newcobro/:id', isAuthenticated, async (req, res) => {
//     const { juzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horacobro,
//         dateturno, observaciones, user, name, date } = req.body;
//     const newcobro = new Cobro({
//         juzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horacobro,
//         dateturno, observaciones, user, name, date
//     })
//     newcobro.user = req.user.id;
//     newcobro.name = req.user.name;
//     await newcobro.save();
//     req.flash('success_msg', 'Turno Agregado Exitosamente');
//     res.redirect('/cobro/listado');
// })
router.post('/notes/newcobro/:id', isAuthenticated, async (req, res) => {
    const {
        idjuzgado, numjuzgado, numexpediente, estadoexpediente, caratula, secretaria,
        ultimanotificacion, horacobro, dateturno, observaciones,
        user, name, date
    } = req.body;
    const errors = [];
    if (!idjuzgado) {
        errors.push({ text: 'Por favor, ingrese el Juzgado.' });
    }
    if (!numexpediente) {
        errors.push({ text: 'Por favor, ingrese el Número de Expediente.' });
    }
    if (!caratula) {
        errors.push({ text: 'Por favor, ingrese la Carátula.' });
    }
    if (!dateturno) {
        errors.push({ text: 'Por favor, ingrese la Fecha del Turno/Cobro.' });
    }
    if (errors.length > 0) {
        errors.forEach(error => req.flash('error_msg', error.text));
        return res.render('ruta/donde/esta/el/formulario', {
            errors,
            idjuzgado, numjuzgado, numexpediente, estadoexpediente, caratula, secretaria,
            ultimanotificacion, horacobro, dateturno, observaciones
        });
    }
    try {
        const newcobro = new Cobro({
            idjuzgado, numjuzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion,
            horacobro, dateturno, observaciones, user, name, date
        });
        newcobro.user = req.user.id;
        newcobro.name = req.user.name;
        newcobro.idestudiouser = req.user.idestudiouser
        await newcobro.save();
        req.flash('success_msg', 'Turno Agregado Exitosamente');
        res.redirect('notes/cobro/listado');
    } catch (error) {
        console.error("Error al guardar la nueva cobro:", error);
        req.flash('error_msg', 'Error al guardar el turno en la base de datos.');
        res.redirect('back'); // Redirige a la página anterior
    }
});


router.get('/cobro', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        // res.send('Notes from data base');
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const cobros = await Cobro.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/allcobro', { cobros });
    } else if (rolusuario == "Administrador" || rolusuario == "Programador") {
        const cobros = await Cobro.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/allcobro', { cobros });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA MESA DE ENTRADA')
        return res.redirect('/');
    }
});

router.post('/cobro/descargarestadisticamesa', isAuthenticated, async (req, res) => {
    const ubicacionPlantilla = require.resolve("../views/notes/cobro/cobroestadisticaimprimir.hbs")
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
    var tablacobro = "" //await Cobro.find().lean().sort({ date: 'desc' });
    //<td>${multas.fecha}</td> este etaba en tablamultas
    const { nomyape, adrema, juzgado, desde, hasta } = req.body;
    if (nomyape) {
        const dni = nomyape
        tablacobro = await Cobro.find({ $or: [{ nomyape: { $regex: nomyape, $options: "i" } }, { dni: { $regex: dni, $options: "i" } }] }).lean().sort({ date: 'desc' });
        //tablacobro = await Cobro.find({ nomyape: { $regex: nomyape, $options: "i" } }).lean();
        filtro = nomyape;
        tipofiltro = "por Nombre y Apellido/DNI"
        //console.log("Multas Estadistica", multas)
        //contador = 0
        // for (let i = 0; i < tablacobro.length; i++) {
        //     contador = i
        // }
    } else if (adrema) {
        const numexpediente = adrema;
        tablacobro = await Cobro.find({ $or: [{ adrema: { $regex: adrema, $options: "i" } }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ date: 'desc' });
        filtro = adrema;
        tipofiltro = "por Adrema"
        //contador = 0
        // for (let i = 0; i < tablacobro.length; i++) {
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
            tablacobro = await Cobro.find({ $and: [{ date: { $gte: desde, $lte: hastao } }, { sector: { $regex: sector, $options: "i" } }] }).lean().sort({ date: 'asc' });
        } else {
            filtro = "por Fecha" + desde + "/" + hasta;
            tipofiltro = "Fecha Desde y Fecha Hasta"
            //contador = 0
            var d = new Date(hasta);
            const hastao = d.setDate(d.getDate() + 1);
            tablacobro = await Cobro.find({ date: { $gte: desde, $lte: hastao } }).lean().sort({ sector: 'desc' });;
            //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
            //.find({ desde: { $regex: date, $options: "i" } }).lean();            
            // for (let i = 0; i < tablacobro.length; i++) {
            //     contador += 1
        }
    } else if (juzgado) {
        tablacobro = await Cobro.find({ numjuzgado: { $regex: juzgado, $options: "i" } }).lean();
        filtro = juzgado;
        tipofiltro = "por Juzgado interviniente"
        ///contador = 0
        // for (let i = 0; i < tablacobro.length; i++) {
        contador += 1
        // }
    }
    for (const cobro of tablacobro) {
        // Y concatenar las multas 
        if (cobro.juzgado == "Inspección Obras") {
            contio += 1
        } else if (cobro.numjuzgado == "Obras Particulares") {
            contop += 1
        } else if (cobro.numjuzgado == "Visado") {
            contvis += 1
        } else if (cobro.numjuzgado == "Sub Secretaria") {
            contsub += 1
        }
        contador += 1
        tabla += `<tr>   
        <td>-</td> 
    <td style="text-transform: lowercase;">${cobro.numjuzgado}</td>
    <td style="text-transform: lowercase;">${cobro.numexpediente}</td>
    <td style="text-transform: lowercase;">${cobro.nomyape}</td>
    <td style="text-transform: lowercase;">${cobro.dni}</td>
    <td style="text-transform: lowercase;">${cobro.contacto}</td>
    <td style="text-transform: lowercase;">${cobro.fechaingreso}</td>
    <td style="text-transform: lowercase;">${cobro.horaingreso}</td>
    <td>-</td>
    </tr>`;
    }
    contador = contador - 1;
    contenidoHtml = contenidoHtml.replace("{{tablacobro}}", tabla);
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

router.get('/cobro/Estadisticas', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    var contador = 0;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Cobros" || rolusuario == "Administrador") {
        const cobro = await Cobro.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
        for (let i = 0; i < cobro.length; i++) {
            contador = contador + 1
        }
        res.render('notes/cobro/estadisticacobro', { cobro, contador });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.post('/cobro/sacarestadistica', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { nomyape, adrema, sector, desde, hasta } = req.body;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Cobros") {
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        var contador = 0;
        if (nomyape) {
            // var dni = "";
            // if (typeof nomyape == 'number') {
            //     dni = parseInt(nomyape)
            // } else {
            //     dni = ""
            // }
            const cobro = await Cobro.find({ $or: [{ nomyape: { $regex: nomyape, $options: "i" } }, { dni: nomyape }] }).lean().sort({ date: 'desc' });
            //console.log("Multas Estadistica", multas)
            for (let i = 0; i < cobro.length; i++) {
                contador = contador + 1
            }
            res.render('notes/cobro/estadisticacobro', { cobro, contador });
        } else if (adrema) {
            var numexpediente = adrema;
            const cobro = await Cobro.find({ $or: [{ adrema: { $regex: adrema, $options: "i" } }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ date: 'desc' });
            //const cobro = await Cobro.find({ adrema: { $regex: adrema, $options: "i" } }).lean().sort({ date: 'desc' });
            for (let i = 0; i < cobro.length; i++) {
                contador = contador + 1
            }
            res.render('notes/cobro/estadisticacobro', { cobro, contador });
        } else if (sector) {
            if ((desde && hasta)) {
                var d = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
                const hastad = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000                     
                const cobro = await Cobro.find({ $and: [{ date: { $gte: desde, $lte: hastad } }, { sector: sector }] }).lean().sort({ sector: 'asc' });
                //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
                //.find({ desde: { $regex: date, $options: "i" } }).lean().sort({ date: 'desc' });  

                for (let i = 0; i < cobro.length; i++) {
                    contador = contador + 1
                }
                res.render('notes/cobro/estadisticacobro', { cobro, contador });
            }
        } else {
            const cobro = await Cobro.find({ sector: { $regex: sector, $options: "i" } }).lean().sort({ date: 'desc' });
            for (let i = 0; i < cobro.length; i++) {
                contador = contador + 1
            }
            res.render('notes/cobro/estadisticacobro', { cobro, contador });
        }
    } else if (desde && hasta) {
        console.log("DESDE", desde)
        console.log("HASTA", hasta)
        var d = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
        const hastad = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000
        console.log("HASTAD", hastad)
        console.log("D", d)
        const cobro = await Cobro.find({ date: { $gte: desde, $lte: hastad } }).lean().sort({ sector: 'desc' });
        //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
        //.find({ desde: { $regex: date, $options: "i" } }).lean().sort({ date: 'desc' });            
        for (let i = 0; i < cobro.length; i++) {
            contador = contador + 1
        }
        res.render('notes/cobro/estadisticacobro', { cobro, contador });
        // } else if ((desde && hasta) && sector) {            
        //     var d = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
        //     const hastad = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000                     
        //     const cobro = await Cobro.find({ $and: [{date: { $gte: desde, $lte: hastad }},{sector: sector}]}).lean().sort({ sector: 'asc' });
        //     //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
        //     //.find({ desde: { $regex: date, $options: "i" } }).lean().sort({ date: 'desc' });                      
        //     for (let i = 0; i < cobro.length; i++) {                
        //         contador = contador + 1
        //     }
        //     res.render('notes/cobro/estadisticacobro', { cobro, contador });
        // }
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.get('/cobro/listado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        const cobrostabla = await Cobro.find({ borrado: "No" })
            .limit(30)
            .lean()
            .sort({ date: 'desc' });

        // Recorremos los resultados para separar los campos
        const cobrosProcesados = cobrostabla.map(cobro => {
            if (cobro.date) {
                const d = new Date(cobro.date);

                // Extraer Fecha (formato DD/MM/YYYY)
                const dia = String(d.getDate()).padStart(2, '0');
                const mes = String(d.getMonth() + 1).padStart(2, '0');
                const anio = d.getFullYear();

                // Extraer Hora (formato HH:mm)
                const horas = String(d.getHours()).padStart(2, '0');
                const minutos = String(d.getMinutes()).padStart(2, '0');

                return {
                    ...cobro,
                    soloFecha: `${dia}/${mes}/${anio}`,
                    soloHora: `${horas}:${minutos} hs`
                };
            }
            return { ...cobro, soloFecha: "---", soloHora: "---" };
        });

        // Ahora envías 'cobrosProcesados' a tu vista
        res.render('notes/cobros/planillalistacobro', { cobros: cobrosProcesados });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA MESA DE ENTRADA')
        return res.redirect('/');
    }
});

router.get('/cobro/listado/vencidas', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Programador") {

        const cobrostabla = await Cobro.find({ borrado: "No" }).limit(30).lean().sort({ dateturno: 'desc' });

        for (var cobross of cobrostabla) {
            var tipoint = cobross.dateturno;
            if (tipoint != null) {
                const fecha = new Date(cobross.dateturno);
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
                cobross.dateturno = fullyear;
            } else {
                cobross.dateturno = "----"
            }
            cobross = cobrostabla
        }

        //const hoy = new Date().toISOString().split('T')[0];
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const parseFecha = (fechaStr) => {
            const [dia, mes, anio] = fechaStr.split('-').map(Number);
            // El mes en JS es de 0 a 11, por eso restamos 1
            return new Date(anio, mes - 1, dia);
        };
        const cobros = "";
        if (cobross) {
            cobros = cobross.filter(a => parseFecha(a.dateturno) <= hoy); // pasadasyHoy
            // cobros.sort((a, b) => parseFecha(a.dateturno) - parseFecha(b.dateturno));
        }

        // console.log("Cobros", cobros)
        res.render('notes/cobros/planillalistacobro', { cobros });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA AUDIENCIAS')
        return res.redirect('/');
    }
});

router.get('/cobro/listado/proximas', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        const cobrostabla = await Cobro.find({ borrado: "No" }).limit(30).lean().sort({ dateturno: 'asc' });

        for (var cobross of cobrostabla) {
            var tipoint = cobross.dateturno;
            if (tipoint != null) {
                const fecha = new Date(cobross.dateturno);
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
                cobross.dateturno = fullyear;
            } else {
                cobross.dateturno = "----"
            }
            cobross = cobrostabla
        }

        //const hoy = new Date().toISOString().split('T')[0];
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const parseFecha = (fechaStr) => {
            const [dia, mes, anio] = fechaStr.split('-').map(Number);
            // El mes en JS es de 0 a 11, por eso restamos 1
            return new Date(anio, mes - 1, dia);
        };
        const cobros = "";
        if (cobross) {
            //const cobros = cobross.filter(a => parseFecha(a.dateturno) <= hoy);
            cobros = cobross.filter(a => parseFecha(a.dateturno) >= hoy); //hoy y futuras
            //cobros.sort((a, b) => parseFecha(a.dateturno) - parseFecha(b.dateturno));
            // cobros.sort((a, b) => parseFecha(a.dateturno) - parseFecha(b.dateturno));
        }

        console.log("Cobros", cobros)
        res.render('notes/cobros/planillalistacobro', { cobros });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA AUDIENCIAS')
        return res.redirect('/');
    }
});


router.get('/cobro/notificaciones', isAuthenticated, async (req, res) => {
    try {
        const rolusuario = req.user.rolusuario;

        if (rolusuario === "Administrador" || rolusuario === "Programador") {
            // Obtenemos la fecha de hoy en formato YYYY-MM-DD
            const hoyObj = new Date();
            const hoyString = hoyObj.toISOString().split('T')[0]; // "2025-12-26" (ejemplo)           

            // 1. Buscamos cobros no borradas cuya fecha sea de hoy en adelante
            // Nota: Es mejor filtrar directamente en la consulta de MongoDB por rendimiento
            // Buscamos cobros desde hoy en adelante
            // Si dateturno es String, la comparación de strings "2026-01-12" >= "2025-12-26" funciona perfecto
            const cobros = await Cobro.find({
                borrado: "No",
                dateturno: { $gte: hoyString }
            })
                .sort({ dateturno: 1 })
                .limit(5)
                .lean();

            // 2. Formateamos la fecha para que el frontend la lea fácil (DD-MM-YYYY)
            // ... dentro de tu ruta /api/cobros/notificaciones
            const cobrosFormateadas = cobros.map(a => {
                // Invertimos de YYYY-MM-DD a DD-MM-YYYY para el usuario
                const partes = a.dateturno.split('-');
                const fechaLegible = `${partes[2]}-${partes[1]}-${partes[0]}`;

                return {
                    ...a,
                    fechaFormateada: fechaLegible,
                    esHoy: a.dateturno === hoyString // Comparación directa de strings
                };
            });
            res.json(cobrosFormateadas);
        } else {
            res.status(403).json({ mensaje: "No autorizado" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// routes/cobros.js
router.post('/cobros/nuevo', isAuthenticated, async (req, res) => {
    const { clienteId, montoTotal, concepto, metodoPago, notas } = req.body;
    try {
        const nuevoCobro = new Cobro({
            clienteId,
            montoTotal,
            concepto,
            metodoPago,
            notas,
            fechaPago: new Date(), // Usando la fecha actual
            creadoPor: req.user._id // Guardamos quién hizo el registro
        });
        await nuevoCobro.save();
        req.flash('success_msg', 'Cobro registrado correctamente');
        res.redirect('/cobro/listado');
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'No se pudo registrar el cobro' });
    }
});

router.get('/cobros/cajadiaria', isAuthenticated, async (req, res) => {
    try {
        // Obtenemos la fecha del filtro o usamos la de hoy
        // El formato esperado del input date es "YYYY-MM-DD"
        const fechaFiltroenglish = req.query.fecha || new Date().toISOString().split('T')[0];

        // Definimos el rango del día (desde las 00:00:00 hasta las 23:59:59)
        const inicioDia = new Date(fechaFiltroenglish + 'T00:00:00');
        const finDia = new Date(fechaFiltroenglish + 'T23:59:59');

        const cobros = await Cobro.find({ borrado: "No" })
            .sort({ fechaPago: -1 })
            .lean();
        // 2. Calculamos los totales por método de pago para el resumen
        const resumen = {
            total: 0,
            efectivo: 0,
            transferencia: 0,
            otros: 0
        };

        cobros.forEach(c => {
            resumen.total += c.montoTotal;
            if (c.metodoPago === 'Efectivo') resumen.efectivo += c.montoTotal;
            else if (c.metodoPago === 'Transferencia') resumen.transferencia += c.montoTotal;
            else resumen.otros += c.montoTotal;
        });

        const [año, mes, dia] = fechaFiltroenglish.split('-');
        const fechaFiltro = `${dia}/${mes}/${año}`;
        console.log("cobros", cobros)
        res.render('notes/cobros/cajadiaria', { cobros, resumen, fechaFiltro });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});

router.get('/cobros/borradolistado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        const cobrostabla = await Cobro.find({ borrado: "Si" }).limit(30).lean().sort({ horacobro: 'desc' });
        for (var cobros of cobrostabla) {
            //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
            //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

            // permite mostrar en las tablas la fecha sola y ordenada
            var tipoint = cobros.dateturno;
            if (tipoint != null) {
                const fecha = new Date(cobros.dateturno);
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
                cobros.dateturno = fullyear;
            } else {
                cobros.dateturno = "----"
            }
            // necesito igualar para que se copie el cambio
            cobros = cobrostabla
            //console.log("expedcoordresultado", cobros);
            //console.log("expedcoordresultadotabla", expedcoordresultadotabla);
        }
        for (var cobros of cobrostabla) {
            //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
            //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

            // permite mostrar en las tablas la fecha sola y ordenada
            var tipoint = cobros.fechaborrado;
            if (tipoint != null) {
                const fecha = new Date(cobros.fechaborrado);
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
                cobros.fechaborrado = fullyear;
            } else {
                cobros.fechaborrado = "----"
            }
            // necesito igualar para que se copie el cambio
            cobros = cobrostabla
            //console.log("expedcoordresultado", cobros);
            //console.log("expedcoordresultadotabla", expedcoordresultadotabla);
        }
        res.render('notes/borrados/borradolistacobros', { cobros });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO/AREA PAPELERA AUDIENCIAS')
        return res.redirect('/');
    }
});

router.get('/cobro/add/:id', isAuthenticated, async (req, res) => {
    const cobro = await Cobro.findById(req.params.id).lean()
    res.render('notes/newcobros', { cobro })
});

router.get('/cobro/edit/:id', isAuthenticated, async (req, res) => {
    const cobro = await Cobro.findById(req.params.id).lean()

    var tipoint = cobro.dateturno;
    if (tipoint != null) {
        const fecha = new Date(cobro.dateturno);
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
        cobro.dateturno = fullyear;
    } else {
        cobro.dateturno = "----"
    }
    res.render('notes/cobros/editcobro', { cobro })
});

router.put('/notes/editcobro/:id', isAuthenticated, async (req, res) => {
    const { idjuzgado, numjuzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horacobro,
        dateturno, observaciones } = req.body;

    await Cobro.findByIdAndUpdate(req.params.id, {
        idjuzgado, numjuzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horacobro,
        dateturno, observaciones
    });
    req.flash('success_msg', 'Cobro actualizada')
    res.redirect('/Cobro/listado');
});

router.get('/cobro/list/:id', isAuthenticated, async (req, res) => {

    //const cobrostabla = await Cobro.findById(req.params.id).lean()
    const cobrostabla = await Cobro.findById({ borrado: "No" })            
            .lean()
            .sort({ date: 'desc' });
    const cobrosProcesados = cobrostabla.map(cobro => {
            if (cobro.date) {
                const d = new Date(cobro.date);
                // Extraer Fecha (formato DD/MM/YYYY)
                const dia = String(d.getDate()).padStart(2, '0');
                const mes = String(d.getMonth() + 1).padStart(2, '0');
                const anio = d.getFullYear();
                // Extraer Hora (formato HH:mm)
                const horas = String(d.getHours()).padStart(2, '0');
                const minutos = String(d.getMinutes()).padStart(2, '0');

                return {
                    ...cobro,
                    soloFecha: `${dia}/${mes}/${anio}`,
                    soloHora: `${horas}:${minutos} hs`
                };
            }
            return { ...cobro, soloFecha: "---", soloHora: "---" };
        });
    res.render('notes/cobros/listcobro', { cobro : cobrosProcesados })
});

router.get('/cobro/borradolist/:id', isAuthenticated, async (req, res) => {
    const cobro = await Cobro.findById(req.params.id).lean()
    // console.log(note.date);
    res.render('notes/borrados/borradolistcobro', { cobro })
});

router.get('/cobro/infoborradolist/:id', isAuthenticated, async (req, res) => {
    const cobro = await Cobro.findById(req.params.id).lean()
    // console.log(note.date);
    res.render('notes/borrados/infoborradocobro', { cobro })
});

// *** SECTOR BUSQUEDA ***
router.post('/cobro/findsector', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { sector } = req.body;
    const cobros = await Cobro.find({ $and: [{ borrado: "No" }, { sector: { $regex: sector, $options: "i" } }] }).lean().sort({ horacobro: 'desc' })
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!cobros) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allcobro");
        } else {
            res.render('notes/findcobro', { cobros })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!cobros) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allcobro");
        } else {
            res.render('notes/findcobroadm', { cobros })
        }
    } else {
        res.render('notes/findcobro', { cobros })
    }
});

router.post('/cobro/findiniciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { nomyape } = req.body;
    const cobros = await Cobro.find({ $and: [{ borrado: "No" }, { nomyape: { $regex: nomyape, $options: "i" } }] }).lean().sort({ horacobro: 'desc' })
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!cobros) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allcobro");
        } else {
            res.render('notes/findcobro', { cobros })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!cobros) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allcobro");
        } else {
            res.render('notes/findcobroadm', { cobros })
        }
    } else {
        res.render('notes/findcobro', { cobros })
    }
});

router.post('/cobro/findlistasector', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { sector } = req.body;
    const cobros = await Cobro.find({ $and: [{ borrado: "No" }, { sector: { $regex: sector, $options: "i" } }] }).lean().sort({ horacobro: 'desc' })
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!cobros) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allcobro");
        } else {
            res.render('notes/cobros/planillalistacobro', { cobros })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!cobros) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allcobro");
        } else {
            res.render('notes/cobros/planillalistacobro', { cobros })
        }
    } else {
        res.render('notes/cobros/planillalistacobro', { cobros })
    }
});

router.post('/cobro/findlistainiciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { nomyape } = req.body;
    const cobros = await Cobro.find({ $and: [{ borrado: "No" }, { nomyape: { $regex: nomyape, $options: "i" } }] }).lean().sort({ horacobro: 'desc' })
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!cobros) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allcobro");
        } else {
            res.render('notes/cobros/planillalistacobro', { cobros })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!cobros) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allcobro");
        } else {
            res.render('notes/cobros/planillalistacobro', { cobros })
        }
    } else {
        res.render('notes/cobros/planillalistacobro', { cobros })
    }
});

router.post('/cobro/findcaratula', isAuthenticated, async (req, res) => {
    const { caratula } = req.body;
    const cobrostabla = await Cobro.find({ $and: [{ borrado: "No" }, { caratula: { $regex: caratula, $options: "i" } }] }).lean().sort({ horacobro: 'desc' })
    for (var cobros of cobrostabla) {
        var tipoint = cobros.dateturno;
        if (tipoint != null) {
            const fecha = new Date(cobros.dateturno);
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
            cobros.dateturno = fullyear;
        } else {
            cobros.dateturno = "----"
        }
        cobros = cobrostabla
    }
    if (!cobros) {
        req.flash('success_msg', 'cargue un Número de DNI')
        return res.render("notes/cobros/planillalistacobro");
    } else {
        res.render('notes/cobros/planillalistacobro', { cobros })
    }
});

router.post('/cobro/findjuzgado', isAuthenticated, async (req, res) => {
    const { numjuzgado } = req.body;
    const cobrostabla = await Cobro.find({ $and: [{ borrado: "No" }, { juzgado: { $regex: numjuzgado, $options: "i" } }] }).lean().sort({ horacobro: 'desc' })
    for (var cobros of cobrostabla) {
        var tipoint = cobros.dateturno;
        if (tipoint != null) {
            const fecha = new Date(cobros.dateturno);
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
            cobros.dateturno = fullyear;
        } else {
            cobros.dateturno = "----"
        }
        cobros = cobrostabla
    }
    if (!cobros) {
        req.flash('success_msg', 'cargue un Juzgado')
        return res.render("notes/cobros/planillalistacobro");
    } else {
        res.render('notes/cobros/planillalistacobro', { cobros })
    }
});

router.post('/cobro/findexpediente', isAuthenticated, async (req, res) => {
    const { numexpediente } = req.body;
    const cobrostabla = await Cobro.find({ $and: [{ borrado: "No" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ horacobro: 'desc' })
    //const cobrostabla = await Cobro.find({ borrado: "Si" }).limit(30).lean().sort({ horacobro: 'desc' });
    for (var cobros of cobrostabla) {
        //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
        //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

        // permite mostrar en las tablas la fecha sola y ordenada
        var tipoint = cobros.dateturno;
        if (tipoint != null) {
            const fecha = new Date(cobros.dateturno);
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
            cobros.dateturno = fullyear;
        } else {
            cobros.dateturno = "----"
        }
        // necesito igualar para que se copie el cambio
        cobros = cobrostabla
        //console.log("expedcoordresultado", cobros);
        //console.log("expedcoordresultadotabla", expedcoordresultadotabla);
    }
    if (!cobros) {
        req.flash('success_msg', 'cargue un Número de Expediente')
        return res.render("notes/cobros/planillalistacobro");
    } else {
        res.render('notes/cobros/planillalistacobro', { cobros })
    }
});

router.post('/cobro/findlistaexpediente', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { numexpediente } = req.body;
    const cobros = await Cobro.find({ $and: [{ borrado: "No" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ horacobro: 'desc' })
    if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!cobros) {
            req.flash('success_msg', 'cargue Expediente')
            return res.render("notes/cobros/planillalistacobro");
        } else {
            res.render('notes/cobros/planillalistacobro', { cobros })
        }
    } else if (rolusuario == "Administrador" || rolusuario == "Programador") {
        if (!cobros) {
            req.flash('success_msg', 'cargue Expediente')
            return res.render("notes/allcobro");
        } else {
            res.render('notes/planillalistacobro', { cobros })
        }
    } else {
        res.render('notes/planillalistacobro', { cobros })
    }
});

router.post('/cobro/findfecha', isAuthenticated, async (req, res) => {
    var { dateturno } = req.body;
    var fechaRevertida = dateturno.split('-').reverse().join('-');
    const cobrostabla = await Cobro.find({ $and: [{ borrado: "No" }, { dateturno: { $regex: fechaRevertida, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    for (var cobros of cobrostabla) {
        //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
        //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

        // permite mostrar en las tablas la fecha sola y ordenada
        var tipoint = cobros.dateturno;
        if (tipoint != null) {
            const fecha = new Date(cobros.dateturno);
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
            cobros.dateturno = fullyear;
        } else {
            cobros.dateturno = "----"
        }
        // necesito igualar para que se copie el cambio
        cobros = cobrostabla
        //console.log("expedcoordresultado", cobros);
        //console.log("expedcoordresultadotabla", expedcoordresultadotabla);
    }
    if (!cobros) {
        req.flash('success_msg', 'cargue Fecha Ingreso')
        return res.render('notes/cobros/planillalistacobro')
    } else {
        res.render('notes/cobros/planillalistacobro', { cobros })
    }
});

router.post('/cobro/findlistafechaentrada', isAuthenticated, async (req, res) => {
    const { fechaingreso } = req.body;
    const cobros = await Cobro.find({ $and: [{ borrado: "No" }, { fechaingreso: { $regex: fechaingreso, $options: "i" } }] }).lean().sort({ horacobro: 'desc' })
    if (!cobros) {
        req.flash('success_msg', 'cargue Fecha Ingreso')
        return res.render("notes/allcobro");
    } else {
        res.render('notes/cobros/planillalistacobro', { cobros })
    }
});

// *** SECTOR BUSQUEDA BORRADOS***
router.post('/cobro/borradofindlistasector', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { sector } = req.body;
    const cobros = await Cobro.find({ $and: [{ borrado: "Si" }, { sector: { $regex: sector, $options: "i" } }] }).lean().sort({ horacobro: 'desc' })
    res.render('notes/borrados/borradolistcobro', { cobros })
});

router.post('/cobro/borradofindlistainiciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { nomyape } = req.body;
    const cobros = await Cobro.find({ $and: [{ borrado: "Si" }, { nomyape: { $regex: nomyape, $options: "i" } }] }).lean().sort({ horacobro: 'desc' })
    res.render('notes/borrados/borradolistcobro', { cobros })
});

router.post('/cobro/borradofindlistadni', isAuthenticated, async (req, res) => {
    const { dni } = req.body;
    const cobros = await Cobro.find({ $and: [{ borrado: "Si" }, { dni: { $regex: dni, $options: "i" } }] }).lean().sort({ horacobro: 'desc' })
    res.render('notes/borrados/borradolistcobro', { cobros })
});

router.post('/cobro/borradofindlistaexpediente', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { numexpediente } = req.body;
    const cobros = await Cobro.find({ $and: [{ borrado: "Si" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ horacobro: 'desc' })
    res.render('notes/borrados/borradolistcobro', { cobros })
});

router.post('/cobro/borradofindlistafechaentrada', isAuthenticated, async (req, res) => {
    const { fechaingreso } = req.body;
    const cobros = await Cobro.find({ $and: [{ borrado: "Si" }, { fechaingreso: { $regex: fechaingreso, $options: "i" } }] }).lean().sort({ horacobro: 'desc' })
    res.render('notes/borrados/borradolistcobro', { cobros })
});

// **** AGREGAR TURNO A CLIENTE HABITUAL ****
router.put('/notes/editaddcobro/:id', isAuthenticated, async (req, res) => {
    const { idjuzgado, numjuzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horacobro,
        dateturno, observaciones } = req.body
    await Cobro.findByIdAndUpdate(req.params.id, {
        idjuzgado, numjuzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horacobro,
        dateturno, observaciones
    });
    req.flash('success_msg', 'Cobro nuevo Agregada')
    res.redirect('/cobro/listado');
});

// ** SECTOR EDITAR **
// router.put('/notes/editcobro/:id', isAuthenticated, async (req, res) => {
//     const { juzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horacobro,
//         dateturno, observaciones } = req.body
//     await Cobro.findByIdAndUpdate(req.params.id, {
//         juzgado, numexpediente, estadoexpediente, caratula, secretaria, ultimanotificacion, horacobro,
//         dateturno, observaciones
//     });
//     req.flash('success_msg', 'Cobro Actualizada')
//     res.redirect('/cobro/listado');
// });

// **** SECTOR DELETE ****

router.put('/cobro/marcadelete/:id', isAuthenticated, async (req, res) => {
    //const fechaimpresohoy = new Date();    
    //await Multas.updateMany({ _id: "id" });  
    //Busco el id y le sumo 1 a veces impreso
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Cobro.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Cobro a Papelera Reciclaje')
    res.redirect('/cobro/listado');
    // await Cobro.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/cobro/listado')
});

router.put('/cobro/recuperarlistado', isAuthenticated, async (req, res) => {
    //await Multas.updateMany({ borrado: "Si", fechaborrado: new Date(), userborrado:req.user.name});    
    await Cobro.updateMany({ borrado: 'Si' }, { borrado: "No", fechaborrado: "Recuperado" });
    req.flash('success_msg', 'todos los datos de Mesa de Entradas recuperados')
    res.redirect('/cobro/listado');
    // await Cobro.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/cobro/listado')
});

router.put('/cobro/marcadeleterestaurar/:id', isAuthenticated, async (req, res) => {
    //const fechaimpresohoy = new Date();    
    //await Multas.updateMany({ _id: "id" });  
    //Busco el id y le sumo 1 a veces impreso
    const borrado = "No";
    const fechaborrado = "Restaurado";
    const userborrado = req.user.name;
    await Cobro.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Cobro Restaurada de Papelera Reciclaje')
    res.redirect('/cobros/borradolistado');
    // await Cobro.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/cobro/listado')
});

router.delete('/cobro/delete/:id', isAuthenticated, async (req, res) => {
    await Cobro.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Cobro Eliminada')
    res.redirect('/cobros/borradolistado')
});



// *** SI O SI LOS MODULE EXPLORTS ***
module.exports = router;