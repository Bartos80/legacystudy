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
const Mesaentrada = require('../models/mesaentrada')

// **esto es para agregar campo borrado a todos los q no tienen borrado marcado**
router.put('/mesaentrada/listadoborradosenno', isAuthenticated, async (req, res) => {
    await Mesaentrada.update({}, { $set: { borrado: "No" } }, { upsert: false, multi: true })
    req.flash('success_msg', 'Todos las Multas Marcadas')
    res.redirect('/Mesaentrada/listado');
});

router.get('/mesaentradas/add', isAuthenticated, (req, res) => {
    res.render('notes/mesaentrada/newmesaentradas');
})
router.get('/mesaentradas/add/:id', isAuthenticated, (req, res) => {
    res.render('notes/newmesaentradas');
})

router.post('/notes/newmesaentradas', isAuthenticated, async (req, res) => {
    const { sector, nomyapeabogado, fechaingreso, horaingreso, numexpediente, juzgado, nomyape, dni,
        contacto, hora, observaciones, user, name, date
    } = req.body;
    const newMesaentrada = new Mesaentrada({
        sector, nomyapeabogado, fechaingreso, horaingreso, numexpediente,juzgado, nomyape, dni,
        contacto, hora, observaciones, user, name, date
    })
    newMesaentrada.user = req.user.id;
    newMesaentrada.name = req.user.name;
    await newMesaentrada.save();
    req.flash('success_msg', 'Turno Agregado Exitosamente');
    res.redirect('/mesaentrada/listado');
})

router.post('/notes/mesaentrada/newmesaentradas/:id', isAuthenticated, async (req, res) => {
    const { sector, nomyapeabogado, fechaingreso, horaingreso, numexpediente, juzgado, nomyape, dni,
        contacto, hora, observaciones, eliminado, user, name } = req.body;
    const newMesaentrada = new Mesaentrada({
        sector, nomyapeabogado, fechaingreso, horaingreso, numexpediente, juzgado, nomyape, dni,
        contacto, hora, observaciones, eliminado, user, name
    })
    newMesaentrada.user = req.user.id;
    newMesaentrada.name = req.user.name;
    await newMesaentrada.save();
    req.flash('success_msg', 'Turno Agregado Exitosamente');
    res.redirect('/mesaentrada/listado');
})

router.get('/mesaentrada', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Mesa-Entrada") {
        // res.send('Notes from data base');
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        const mesaentradas = await Mesaentrada.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/allmesaentrada', { mesaentradas });
    } else if (rolusuario == "Administrador") {
        const mesaentradas = await Mesaentrada.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
        res.render('notes/mesaentrada/allmesaentrada', { mesaentradas });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA MESA DE ENTRADA')
        return res.redirect('/');
    }
});

router.post('/mesaentrada/descargarestadisticamesa', isAuthenticated, async (req, res) => {
    const ubicacionPlantilla = require.resolve("../views/notes/mesaentrada/mesaentradaestadisticaimprimir.hbs")
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
    var tablamesaentrada = "" //await Mesaentrada.find().lean().sort({ date: 'desc' });
    //<td>${multas.fecha}</td> este etaba en tablamultas
    const { nomyape, adrema, juzgado, desde, hasta } = req.body;
    if (nomyape) {
        const dni = nomyape
        tablamesaentrada = await Mesaentrada.find({ $or: [{ nomyape: { $regex: nomyape, $options: "i" } }, { dni: { $regex: dni, $options: "i" } }] }).lean().sort({ date: 'desc' });
        //tablamesaentrada = await Mesaentrada.find({ nomyape: { $regex: nomyape, $options: "i" } }).lean();
        filtro = nomyape;
        tipofiltro = "por Nombre y Apellido/DNI"
        //console.log("Multas Estadistica", multas)
        //contador = 0
        // for (let i = 0; i < tablamesaentrada.length; i++) {
        //     contador = i
        // }
    } else if (adrema) {
        const numexpediente = adrema;
        tablamesaentrada = await Mesaentrada.find({ $or: [{ adrema: { $regex: adrema, $options: "i" } }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ date: 'desc' });
        filtro = adrema;
        tipofiltro = "por Adrema"
        //contador = 0
        // for (let i = 0; i < tablamesaentrada.length; i++) {
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
            tablamesaentrada = await Mesaentrada.find({ $and: [{ date: { $gte: desde, $lte: hastao } }, { sector: { $regex: sector, $options: "i" } }] }).lean().sort({ date: 'asc' });
        } else {
            filtro = "por Fecha" + desde + "/" + hasta;
            tipofiltro = "Fecha Desde y Fecha Hasta"
            //contador = 0
            var d = new Date(hasta);
            const hastao = d.setDate(d.getDate() + 1);
            tablamesaentrada = await Mesaentrada.find({ date: { $gte: desde, $lte: hastao } }).lean().sort({ sector: 'desc' });;
            //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
            //.find({ desde: { $regex: date, $options: "i" } }).lean();            
            // for (let i = 0; i < tablamesaentrada.length; i++) {
            //     contador += 1
        }
    } else if (juzgado) {
        tablamesaentrada = await Mesaentrada.find({ juzgado: { $regex: juzgado, $options: "i" } }).lean();
        filtro = juzgado;
        tipofiltro = "por Juzgado interviniente"
        ///contador = 0
        // for (let i = 0; i < tablamesaentrada.length; i++) {
        contador += 1
        // }
    }
    for (const mesaentrada of tablamesaentrada) {
        // Y concatenar las multas 
        if (mesaentrada.juzgado == "Inspección Obras") {
            contio += 1
        } else if (mesaentrada.juzgado == "Obras Particulares") {
            contop += 1
        } else if (mesaentrada.juzgado == "Visado") {
            contvis += 1
        } else if (mesaentrada.juzgado == "Sub Secretaria") {
            contsub += 1
        }
        contador += 1
        tabla += `<tr>   
        <td>-</td> 
    <td style="text-transform: lowercase;">${mesaentrada.juzgado}</td>
    <td style="text-transform: lowercase;">${mesaentrada.numexpediente}</td>
    <td style="text-transform: lowercase;">${mesaentrada.nomyape}</td>
    <td style="text-transform: lowercase;">${mesaentrada.dni}</td>
    <td style="text-transform: lowercase;">${mesaentrada.contacto}</td>
    <td style="text-transform: lowercase;">${mesaentrada.fechaingreso}</td>
    <td style="text-transform: lowercase;">${mesaentrada.horaingreso}</td>
    <td>-</td>
    </tr>`;
    }
    contador = contador-1;
    contenidoHtml = contenidoHtml.replace("{{tablamesaentrada}}", tabla);
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

router.get('/mesaentrada/Estadisticas', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    var contador = 0;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Mesa-Entrada" || rolusuario == "Administrador") {
        const mesaentrada = await Mesaentrada.find({ borrado: "No" }).lean().limit(30).sort({ date: 'desc' });
        for (let i = 0; i < mesaentrada.length; i++) {
            contador = contador + 1
        }
        res.render('notes/mesaentrada/estadisticamesaentrada', { mesaentrada, contador });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.post('/mesaentrada/sacarestadistica', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { nomyape, adrema, sector, desde, hasta } = req.body;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador" || rolusuario == "Mesa-Entrada") {
        // const notes = await Note.find({user : req.user.id}).lean().sort({numinspeccion:'desc'}); //para que muestre notas de un solo user
        var contador = 0;
        if (nomyape) {
            // var dni = "";
            // if (typeof nomyape == 'number') {
            //     dni = parseInt(nomyape)
            // } else {
            //     dni = ""
            // }
            const mesaentrada = await Mesaentrada.find({ $or: [{ nomyape: { $regex: nomyape, $options: "i" } }, { dni: nomyape }] }).lean().sort({ date: 'desc' });
            //console.log("Multas Estadistica", multas)
            for (let i = 0; i < mesaentrada.length; i++) {
                contador = contador + 1
            }
            res.render('notes/mesaentrada/estadisticamesaentrada', { mesaentrada, contador });
        } else if (adrema) {
            var numexpediente = adrema;
            const mesaentrada = await Mesaentrada.find({ $or: [{ adrema: { $regex: adrema, $options: "i" } }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ date: 'desc' });
            //const mesaentrada = await Mesaentrada.find({ adrema: { $regex: adrema, $options: "i" } }).lean().sort({ date: 'desc' });
            for (let i = 0; i < mesaentrada.length; i++) {
                contador = contador + 1
            }
            res.render('notes/mesaentrada/estadisticamesaentrada', { mesaentrada, contador });
        } else if (sector) {
            if ((desde && hasta)) {
                var d = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
                const hastad = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000                     
                const mesaentrada = await Mesaentrada.find({ $and: [{ date: { $gte: desde, $lte: hastad } }, { sector: sector }] }).lean().sort({ sector: 'asc' });
                //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
                //.find({ desde: { $regex: date, $options: "i" } }).lean().sort({ date: 'desc' });  

                for (let i = 0; i < mesaentrada.length; i++) {
                    contador = contador + 1
                }
                res.render('notes/mesaentrada/estadisticamesaentrada', { mesaentrada, contador });
            }
        } else {
            const mesaentrada = await Mesaentrada.find({ sector: { $regex: sector, $options: "i" } }).lean().sort({ date: 'desc' });
            for (let i = 0; i < mesaentrada.length; i++) {
                contador = contador + 1
            }
            res.render('notes/mesaentrada/estadisticamesaentrada', { mesaentrada, contador });
        }
    } else if (desde && hasta) {
        console.log("DESDE", desde)
        console.log("HASTA", hasta)
        var d = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
        const hastad = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000
        console.log("HASTAD", hastad)
        console.log("D", d)
        const mesaentrada = await Mesaentrada.find({ date: { $gte: desde, $lte: hastad } }).lean().sort({ sector: 'desc' });
        //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
        //.find({ desde: { $regex: date, $options: "i" } }).lean().sort({ date: 'desc' });            
        for (let i = 0; i < mesaentrada.length; i++) {
            contador = contador + 1
        }
        res.render('notes/mesaentrada/estadisticamesaentrada', { mesaentrada, contador });
        // } else if ((desde && hasta) && sector) {            
        //     var d = new Date(hasta); //D= 2023-07-25T00:00:00.000Z
        //     const hastad = d.setDate(d.getDate() + 1); //HASTAD= 1690243200000                     
        //     const mesaentrada = await Mesaentrada.find({ $and: [{date: { $gte: desde, $lte: hastad }},{sector: sector}]}).lean().sort({ sector: 'asc' });
        //     //.find( "SelectedDate": {'$gte': SelectedDate1,'$lt': SelectedDate2}})
        //     //.find({ desde: { $regex: date, $options: "i" } }).lean().sort({ date: 'desc' });                      
        //     for (let i = 0; i < mesaentrada.length; i++) {                
        //         contador = contador + 1
        //     }
        //     res.render('notes/mesaentrada/estadisticamesaentrada', { mesaentrada, contador });
        // }
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA TASAS/MULTAS')
        return res.redirect('/');
    }
});

router.get('/mesaentrada/listado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Mesa-Entrada" || rolusuario == "Administrador") {
        const mesaentradastabla = await Mesaentrada.find({ borrado: "No" }).limit(30).lean().sort({ dateturno: 'desc' });
        for (var mesaentradas of mesaentradastabla) {
            //var fechaintimacion = expedcoordresultadotabla.fechaintimacion;
            //expedcoordresultado.fechaintimacion = expedcoordresultadotabla.fechaintimacion;       

            // permite mostrar en las tablas la fecha sola y ordenada
            var tipoint = mesaentradas.fechaingreso;
            if (tipoint != null) {
                const fecha = new Date(mesaentradas.fechaingreso);
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
                mesaentradas.fechaingreso = fullyear;
            } else {
                mesaentradas.fechaingreso = "----"
            }  
            // necesito igualar para que se copie el cambio
            mesaentradas = mesaentradastabla
            //console.log("expedcoordresultado", mesaentradas);
            //console.log("expedcoordresultadotabla", expedcoordresultadotabla);
        }
        //res.render('notes/inspecciones/listexpcordintvenc', { expedcoordresultado });
        res.render('notes/mesaentrada/planillalistaturnero', { mesaentradas });    
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO PARA AREA MESA DE ENTRADA')
        return res.redirect('/');
    }
});

router.get('/mesaentrada/borradolistado', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    //console.log("ROL USUARIO", rolusuario) //Inspector
    if (rolusuario == "Administrador") {
        const mesaentradas = await Mesaentrada.find({ borrado: "Si" }).limit(30).lean().sort({ dateturno: 'desc' });
        res.render('notes/borrados/borradolistmesaentrada', { mesaentradas });
    } else {
        req.flash('success_msg', 'NO TIENE PERMISO/AREA PAPELERA MESA DE ENTRADA')
        return res.redirect('/');
    }
});

router.get('/mesaentrada/add/:id', isAuthenticated, async (req, res) => {
    const mesaentrada = await Mesaentrada.findById(req.params.id).lean()
    res.render('notes/newmesaentradas', { mesaentrada })
});

router.get('/mesaentrada/edit/:id', isAuthenticated, async (req, res) => {
    const mesaentrada = await Mesaentrada.findById(req.params.id).lean()
    res.render('notes/editmesaentrada', { mesaentrada })
});

router.get('/mesaentrada/list/:id', isAuthenticated, async (req, res) => {
    const mesaentrada = await Mesaentrada.findById(req.params.id).lean()
    // console.log(note.date);
    res.render('notes/listmesaentrada', { mesaentrada })
});
router.get('/mesaentrada/borradolist/:id', isAuthenticated, async (req, res) => {
    const mesaentrada = await Mesaentrada.findById(req.params.id).lean()
    // console.log(note.date);
    res.render('notes/borrados/borradolistmesaentrada', { mesaentrada })
});

router.get('/mesaentrada/infoborradolist/:id', isAuthenticated, async (req, res) => {
    const mesaentrada = await Mesaentrada.findById(req.params.id).lean()
    // console.log(note.date);
    res.render('notes/borrados/infoborradomesaentrada', { mesaentrada })
});

// *** SECTOR BUSQUEDA ***
router.post('/mesaentrada/findsector', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { sector } = req.body;
    const mesaentradas = await Mesaentrada.find({ $and: [{ borrado: "No" }, { sector: { $regex: sector, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (rolusuario == "Mesa-Entrada") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/findmesaentrada', { mesaentradas })
        }
    } else if (rolusuario == "Administrador") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/findmesaentradaadm', { mesaentradas })
        }
    } else {
        res.render('notes/findmesaentrada', { mesaentradas })
    }
});

router.post('/mesaentrada/findiniciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { nomyape } = req.body;
    const mesaentradas = await Mesaentrada.find({ $and: [{ borrado: "No" }, { nomyape: { $regex: nomyape, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (rolusuario == "Mesa-Entrada") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/findmesaentrada', { mesaentradas })
        }
    } else if (rolusuario == "Administrador") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/findmesaentradaadm', { mesaentradas })
        }
    } else {
        res.render('notes/findmesaentrada', { mesaentradas })
    }
});

router.post('/mesaentrada/findlistasector', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { sector } = req.body;
    const mesaentradas = await Mesaentrada.find({ $and: [{ borrado: "No" }, { sector: { $regex: sector, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (rolusuario == "Mesa-Entrada") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/planillalistaturnero', { mesaentradas })
        }
    } else if (rolusuario == "Administrador") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/planillalistaturnero', { mesaentradas })
        }
    } else {
        res.render('notes/planillalistaturnero', { mesaentradas })
    }
});

router.post('/mesaentrada/findlistainiciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { nomyape } = req.body;
    const mesaentradas = await Mesaentrada.find({ $and: [{ borrado: "No" }, { nomyape: { $regex: nomyape, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (rolusuario == "Mesa-Entrada") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/planillalistaturnero', { mesaentradas })
        }
    } else if (rolusuario == "Administrador") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Nombre y Apellido')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/planillalistaturnero', { mesaentradas })
        }
    } else {
        res.render('notes/planillalistaturnero', { mesaentradas })
    }
});

router.post('/mesaentrada/finddni', isAuthenticated, async (req, res) => {
    const { dni } = req.body;
    const mesaentradas = await Mesaentrada.find({ $and: [{ borrado: "No" }, { dni: { $regex: dni, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (!mesaentradas) {
        req.flash('success_msg', 'cargue un Número de DNI')
        return res.render("notes/allmesaentrada");
    } else {
        res.render('notes/findmesaentrada', { mesaentradas })
    }
});

router.post('/mesaentrada/findlistadni', isAuthenticated, async (req, res) => {
    const { dni } = req.body;
    const mesaentradas = await Mesaentrada.find({ $and: [{ borrado: "No" }, { dni: { $regex: dni, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (!mesaentradas) {
        req.flash('success_msg', 'cargue un Número de DNI')
        return res.render("notes/allmesaentrada");
    } else {
        res.render('notes/planillalistaturnero', { mesaentradas })
    }
});

router.post('/mesaentrada/findexpediente', isAuthenticated, async (req, res) => {
    const { numexpediente } = req.body;
    const mesaentradas = await Mesaentrada.find({ $and: [{ borrado: "No" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (!mesaentradas) {
        req.flash('success_msg', 'cargue un Número de Expediente')
        return res.render("notes/allmesaentrada");
    } else {
        res.render('notes/findmesaentrada', { mesaentradas })
    }
});

router.post('/mesaentrada/findlistaexpediente', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { numexpediente } = req.body;
    const mesaentradas = await Mesaentrada.find({ $and: [{ borrado: "No" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (rolusuario == "Mesa-Entrada") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Expediente')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/planillalistaturnero', { mesaentradas })
        }
    } else if (rolusuario == "Administrador") {
        if (!mesaentradas) {
            req.flash('success_msg', 'cargue Expediente')
            return res.render("notes/allmesaentrada");
        } else {
            res.render('notes/planillalistaturnero', { mesaentradas })
        }
    } else {
        res.render('notes/planillalistaturnero', { mesaentradas })
    }
});

router.post('/mesaentrada/findfechaentrada', isAuthenticated, async (req, res) => {
    const { fechaingreso } = req.body;
    const mesaentradas = await Mesaentrada.find({ $and: [{ borrado: "No" }, { fechaingreso: { $regex: fechaingreso, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (!mesaentradas) {
        req.flash('success_msg', 'cargue Fecha Ingreso')
        return res.render("notes/allmesaentrada");
    } else {
        res.render('notes/findmesaentrada', { mesaentradas })
    }
});

router.post('/mesaentrada/findlistafechaentrada', isAuthenticated, async (req, res) => {
    const { fechaingreso } = req.body;
    const mesaentradas = await Mesaentrada.find({ $and: [{ borrado: "No" }, { fechaingreso: { $regex: fechaingreso, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    if (!mesaentradas) {
        req.flash('success_msg', 'cargue Fecha Ingreso')
        return res.render("notes/allmesaentrada");
    } else {
        res.render('notes/planillalistaturnero', { mesaentradas })
    }
});

// *** SECTOR BUSQUEDA BORRADOS***
router.post('/mesaentrada/borradofindlistasector', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { sector } = req.body;
    const mesaentradas = await Mesaentrada.find({ $and: [{ borrado: "Si" }, { sector: { $regex: sector, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    res.render('notes/borrados/borradolistmesaentrada', { mesaentradas })
});

router.post('/mesaentrada/borradofindlistainiciador', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { nomyape } = req.body;
    const mesaentradas = await Mesaentrada.find({ $and: [{ borrado: "Si" }, { nomyape: { $regex: nomyape, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    res.render('notes/borrados/borradolistmesaentrada', { mesaentradas })
});

router.post('/mesaentrada/borradofindlistadni', isAuthenticated, async (req, res) => {
    const { dni } = req.body;
    const mesaentradas = await Mesaentrada.find({ $and: [{ borrado: "Si" }, { dni: { $regex: dni, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    res.render('notes/borrados/borradolistmesaentrada', { mesaentradas })
});

router.post('/mesaentrada/borradofindlistaexpediente', isAuthenticated, async (req, res) => {
    const rolusuario = req.user.rolusuario;
    const { numexpediente } = req.body;
    const mesaentradas = await Mesaentrada.find({ $and: [{ borrado: "Si" }, { numexpediente: { $regex: numexpediente, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    res.render('notes/borrados/borradolistmesaentrada', { mesaentradas })
});

router.post('/mesaentrada/borradofindlistafechaentrada', isAuthenticated, async (req, res) => {
    const { fechaingreso } = req.body;
    const mesaentradas = await Mesaentrada.find({ $and: [{ borrado: "Si" }, { fechaingreso: { $regex: fechaingreso, $options: "i" } }] }).lean().sort({ dateturno: 'desc' })
    res.render('notes/borrados/borradolistmesaentrada', { mesaentradas })
});

// **** AGREGAR TURNO A CLIENTE HABITUAL ****
router.put('/notes/editaddmesaentrada/:id', isAuthenticated, async (req, res) => {
    const { sector, nomyapeabogado, fechaingreso, horaingreso, numexpediente, juzgado, 
        nomyape, dni, observaciones, contacto, dateturno } = req.body
    await Mesaentrada.findByIdAndUpdate(req.params.id, {
        sector, nomyapeabogado, fechaingreso, horaingreso, numexpediente, juzgado, 
        nomyape, dni, contacto, dateturno
    });
    req.flash('success_msg', 'Turno nuevo Agregado')
    res.redirect('/mesaentrada/listado');
});

// ** SECTOR EDITAR **
router.put('/notes/editmesaentrada/:id', isAuthenticated, async (req, res) => {
    const { sector, nomyapeabogado, fechaingreso, horaingreso, numexpediente, juzgado, 
        nomyape, dni, observaciones, contacto, dateturno } = req.body
    await Mesaentrada.findByIdAndUpdate(req.params.id, {
        sector, nomyapeabogado, fechaingreso, horaingreso, numexpediente, juzgado, 
        nomyape, dni, observaciones,contacto, dateturno
    });
    req.flash('success_msg', 'Turno Actualizado')
    res.redirect('/mesaentrada/listado');
});

// **** SECTOR DELETE ****

router.put('/mesaentrada/marcadelete/:id', isAuthenticated, async (req, res) => {
    //const fechaimpresohoy = new Date();    
    //await Multas.updateMany({ _id: "id" });  
    //Busco el id y le sumo 1 a veces impreso
    const borrado = "Si";
    const fechaborrado = new Date();
    const userborrado = req.user.name;
    await Mesaentrada.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Turno a Papelera Reciclaje')
    res.redirect('/mesaentrada/listado');
    // await Mesaentrada.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/mesaentrada/listado')
});

router.put('/mesaentrada/recuperarlistado', isAuthenticated, async (req, res) => {
    //await Multas.updateMany({ borrado: "Si", fechaborrado: new Date(), userborrado:req.user.name});    
    await Mesaentrada.updateMany({ borrado: 'Si' }, { borrado: "No", fechaborrado: "Recuperado" });
    req.flash('success_msg', 'todos los datos de Mesa de Entradas recuperados')
    res.redirect('/mesaentrada/listado');
    // await Mesaentrada.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/mesaentrada/listado')
});

router.put('/mesaentrada/marcadeleterestaurar/:id', isAuthenticated, async (req, res) => {
    //const fechaimpresohoy = new Date();    
    //await Multas.updateMany({ _id: "id" });  
    //Busco el id y le sumo 1 a veces impreso
    const borrado = "No";
    const fechaborrado = "Restaurado";
    const userborrado = req.user.name;
    await Mesaentrada.findByIdAndUpdate(req.params.id, {
        borrado, fechaborrado, userborrado
    });
    req.flash('success_msg', 'Turno Restaurado')
    res.redirect('/mesaentrada/borradolistado');
    // await Mesaentrada.findByIdAndDelete(req.params.id);
    // req.flash('success_msg', 'Turno Eliminado')
    // res.redirect('/mesaentrada/listado')
});

router.delete('/mesaentrada/delete/:id', isAuthenticated, async (req, res) => {
    await Mesaentrada.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Turno Eliminado')
    res.redirect('/mesaentrada/listado')
});

// *** SI O SI LOS MODULE EXPLORTS ***
module.exports = router;