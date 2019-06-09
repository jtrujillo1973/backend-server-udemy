var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ==========================================
// busqueda por coleccion
// ==========================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var promesa;
    switch (tabla) {
        case 'usuario':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'hospital':
            promesa = buscarHospitales(busqueda, regex);
            break;
        case 'medico':
            promesa = buscarMedicos(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Tipo de busqueda no permitido',
                error: { message: 'tipo d ecoleccion p tabla no existe' }
            })
            break;
    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        })

    })

});


// ==========================================
// busqueda general
// ==========================================

app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    Promise.all([buscarHospitales(busqueda, regex), buscarMedicos(busqueda, regex), buscarUsuarios(busqueda, regex)])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            })

        })

});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, hospitales) => {
                if (err) {
                    reject('error al cargar hospitales ', err);
                } else {
                    resolve(hospitales);
                }
            });
    });

}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex }, (err, medicos) => {
            if (err) {
                reject('error al cargar medicos ', err);
            } else {
                resolve(medicos);
            }
        });
    });

}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role img')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('error al cargar usuarios ', err);
                } else {
                    resolve(usuarios);
                }
            });
    });

}
module.exports = app;