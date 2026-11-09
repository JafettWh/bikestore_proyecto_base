const AppError = require('../utils/AppError');

function errorHandler(error, req, res, next) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            ok: false,
            message: error.message
        });
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ ok: false, message: 'La imagen no puede superar 20 MB' });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ ok: false, message: 'El archivo de imagen no es válido' });
    }

    console.error(error);

    return res.status(error.status || 500).json({
        ok: false,
        message: error.status ? error.message : 'Error interno del servidor'
    });
}

module.exports = errorHandler;
