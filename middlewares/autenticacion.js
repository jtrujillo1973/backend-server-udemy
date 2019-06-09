var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// ==========================
// verificar token
// ==========================

exports.verificaToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto!!!',
            errors: err
        });
        req.usuario = decoded.usuario;
        next();

    });
}

// ==========================
// verificar admin role
// ==========================

exports.verificaAdminRole = function(req, res, next) {
    var usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'No es administrador!!!',
            errors: { message: 'No es usuario administrador' }
        });

    }
}

// ==========================
// verificar admin role o mismo usuario
// ==========================

exports.verificaAdminRoleOmismo = function(req, res, next) {
    var usuario = req.usuario;
    var id = req.params.id;
    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'No es administrador!!!',
            errors: { message: 'No es usuario administrador' }
        });

    }
}