var express = require('express');
var bcrypt = require('bcrypt');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// ==========================
// obtener todos los medicos
// ==========================

app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) res.status(500).json({
                    ok: true,
                    mensaje: 'Error cargando medicos!!!'
                });
                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                })
            })
});

// ==========================
// obtener un medico
// ==========================

app.get('/:id', (req, res) => {
    var id = req.params.id;
    Medico.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec((err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar medico!!!',
                    errors: err
                });
            }

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico con el id ' + id + ' no existe !!!',
                    errors: { message: 'NO existe medico con ese id' }
                });
            }
            res.status(200).json({
                ok: true,
                medico: medico
            });
        })
});

// ==========================
// actualizar medico
// ==========================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medicos!!!',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe !!!',
                errors: { message: 'NO existe medico con ese id' }
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) res.status(400).json({
                ok: false,
                mensaje: 'Error al actualizar medicos!!!',
                errors: err
            });

            medicoGuardado.password = '*************';
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        })
    });
});

// ==========================
// crear nuevo medico
// ==========================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    medico.save((err, medicoGuardado) => {
        if (err) res.status(400).json({
            ok: false,
            mensaje: 'Error al crear medicos!!!',
            errors: err
        });

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    })
});


// ==========================
// borrar medico
// ==========================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medicos!!!',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe !!!',
                errors: { message: 'NO existe medico con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    })
});


module.exports = app;