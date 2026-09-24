const authService = require('../services/auth.service');

async function register(req, res,next) {
    try {
        const { id_usuario } = await authService.registerUser(req.body);
        
        return res.status(201).json({
            ok: true,
            message: 'Usuario registrado', 
            id_usuario
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res,next) {
    try {
        const { token, user } = await authService.loginUser(req.body);
        return res.status(200).json({ ok: true,user, token });
    } catch (error) {
        next(error);
    }
}

module.exports = { register,login };
