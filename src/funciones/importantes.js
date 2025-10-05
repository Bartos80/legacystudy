const express = require('express');
const router = express.Router();

function ShowName(name) {
    var writtenName = document.getElementById({ name }).value;
    document.getElementById({ name }).value = formatToString(writtenName);
}

function formatToString(writtenName) {
    var tmp = writtenName.split(" ");
    var fullName;
    tmp.forEach(element => {
        if (fullName) {
            fullName = fullName + " " + element.charAt(0).toUpperCase() + element.slice(1).toLocaleLowerCase();
        } else {
            fullName = element.charAt(0).toUpperCase() + element.slice(1).toLocaleLowerCase();
        }
    })
    return fullName;
}

function mostrarContrasena() {
    var tipo = document.getElementById('txtpassword');
    var eye = document.getElementById('eyepassword');
    if (tipo.type == "password") {
        tipo.type = "text";
        eye.class = "btn btn-secondary"
    } else {
        tipo.type = "password";
        eye.class = "btn btn-primary"
    }
}

function ponerminuscula(letraminuscula) {
    return
    let ex = document.getElementById({ letraminuscula });
    ex.value = ex.value.toLowerCase();
}

// ** Ejemplo:
// ** llamo al archivo de funciones
// const funcionesimportantes = require('../funciones/importantes');
//** llamo funciones para nombres mayusculas y fechas ordenadar            
//planiregactuainf.propietario = funcionesimportantes.NombreMayus(planiregactuainf.propietario);
function NombreMayus(valor) {
    var writtenName = valor;
    if (writtenName != null) {
        var tmp = writtenName.split(" ");
        var fullName;
        tmp.forEach(element => {
            if (fullName) {
                fullName = fullName + " " + element.charAt(0).toUpperCase() + element.slice(1).toLocaleLowerCase();
            } else {
                fullName = element.charAt(0).toUpperCase() + element.slice(1).toLocaleLowerCase();
            }
        })
        valor = fullName;
    } else {
        valor = "No posee Datos"
    }
    return fullName;
}

function ordenarfecha(valor) {

    var tipoint = valor;
    const validatedate = (tipoint) => isNaN(Date.parse(tipoint))
    if (validatedate(tipoint) === false) {
        var tipoint = new Date(valor);
        if (tipoint != null) {
            const fecha = new Date(valor);
            const dia = fecha.getDate() + 1;
            var mes = 0
            var fulldate = "";
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
            var fullyear = diastring + mes + ano
            //const fullyear = fecha.toLocaleDateString();
            fulldate = fullyear;


        }
    } else {
        fulldate = tipoint;
    }
    return fulldate;
}



function ordenarfechaalrevez(valor) {
    /// necesito separar todo para ordenar la BUSQUEDAAA HACER MAÑANA
    const authHeader = valor
    const split = authHeader.split('-') // (1) [ 'bearer', 'token' ]
    //const dia = split[0]
    const mes = split[1]
    const ano = split[2]
    if (!authHeader) {
        //console.log("token indefinido")
    } else {// (2) token        
        var fulldate = ano + "-" + mes// + "-" + dia
        //console.log(valor+"fecha invertida")
    }
    return fulldate;
}

// *** SI O SI LOS MODULE EXPLORTS ***
module.exports = { NombreMayus, ordenarfecha, ordenarfechaalrevez };
// module.exports = {ponerminuscula, mostrarContrasena, formatToString, ShowName};
//export {ponerminuscula, mostrarContrasena, formatToString, ShowName}