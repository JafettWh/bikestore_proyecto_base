const authService = require('../services/auth.service');

async function register(req, res, next) {
    try {
        const data = await authService.registerUser(req.body);
        return res.status(201).json({ ok: true, message: 'Usuario registrado', data });
    } catch (error) {
        return next(error);
    }
}

async function login(req, res, next) {
    try {
        const data = await authService.loginUser(req.body);
        return res.status(200).json({ ok: true, ...data });
    } catch (error) {
        return next(error);
    }
}

async function me(req, res, next) {
    try {
        const user = await authService.findUserById(req.user.id);
        return res.json({ ok: true, user: authService.publicUser(user) });
    } catch (error) {
        return next(error);
    }
}

async function updateMe(req, res, next) {
    try {
        const user = await authService.updateOwnProfile(req.user.id, req.body);
        return res.json({ ok: true, user });
    } catch (error) {
        return next(error);
    }
}

async function requestRecovery(req, res, next) {
    try {
        const data = await authService.requestPasswordRecovery(req.body.email);
        return res.json({ ok: true, ...data });
    } catch (error) {
        return next(error);
    }
}

async function verifyRecovery(req, res, next) {
    try {
        const data = await authService.verifyRecoveryCode(req.body);
        return res.json({ ok: true, ...data });
    } catch (error) {
        return next(error);
    }
}

async function resetPassword(req, res, next) {
    try {
        const data = await authService.resetPassword(req.body);
        return res.json({ ok: true, ...data });
    } catch (error) {
        return next(error);
    }
}

module.exports = { register, login, me, updateMe, requestRecovery, verifyRecovery, resetPassword };
