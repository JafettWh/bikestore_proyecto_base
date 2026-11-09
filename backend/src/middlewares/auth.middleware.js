const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const env = require('../config/env');

async function authenticate(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ ok: false, message: 'Debes iniciar sesión' });
    }

    try {
        const claims = jwt.verify(header.substring(7), env.jwt.secret);
        const [rows] = await pool.execute(
                `SELECT u.id_usuario AS id, u.nombre_usuario AS name, u.correo_usuario AS email,
                    u.estado_usuario AS status, r.nombre_rol AS role
                 FROM usuario u JOIN rol r ON r.id_rol = u.id_rol
                 WHERE u.id_usuario = ?`,
            [claims.id]
        );

        if (!rows.length || rows[0].status !== 'active') {
            return res.status(401).json({ ok: false, message: 'La cuenta está inactiva o no existe' });
        }

        req.user = {
            ...rows[0],
            id_usuario: rows[0].id,
            nombre: rows[0].name,
            rol: rows[0].role
        };
        return next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ ok: false, message: 'Token inválido o expirado' });
        }
        return next(error);
    }
}

function authorize(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                ok: false,
                message: 'No tienes permisos para realizar esta operación'
            });
        }
        return next();
    };
}

function optionalAuthenticate(req, res, next) {
    if (!req.headers.authorization) return next();
    return authenticate(req, res, next);
}

module.exports = { authenticate, authorize, optionalAuthenticate };
