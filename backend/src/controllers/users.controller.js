const service = require('../services/users.service');

async function list(req, res, next) {
    try {
        return res.json({ ok: true, data: await service.listUsers(req.query) });
    } catch (error) {
        return next(error);
    }
}

async function create(req, res, next) {
    try {
        const data = await service.createUser(req.body);
        return res.status(201).json({ ok: true, data, message: 'Usuario creado exitosamente' });
    } catch (error) {
        return next(error);
    }
}

async function update(req, res, next) {
    try {
        const data = await service.updateUser(req.params.id, req.body);
        return res.json({ ok: true, data, message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        return next(error);
    }
}

async function deactivate(req, res, next) {
    try {
        const data = await service.deactivateUser(req.params.id);
        return res.json({ ok: true, data, message: 'Usuario inactivado exitosamente' });
    } catch (error) {
        return next(error);
    }
}

async function reactivate(req, res, next) {
    try {
        const data = await service.reactivateUser(req.params.id);
        return res.json({ ok: true, data, message: 'Usuario reactivado exitosamente' });
    } catch (error) {
        return next(error);
    }
}

module.exports = { list, create, update, deactivate, reactivate };
