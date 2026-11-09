const service = require('../services/products.service');

async function list(req, res, next) {
    try {
        return res.json({ ok: true, data: await service.listProducts(req.query) });
    } catch (error) {
        return next(error);
    }
}

async function listManaged(req, res, next) {
    try {
        return res.json({ ok: true, data: await service.listProducts(req.query, true) });
    } catch (error) {
        return next(error);
    }
}

async function getById(req, res, next) {
    try {
        return res.json({ ok: true, data: await service.getProduct(req.params.id) });
    } catch (error) {
        return next(error);
    }
}

async function categories(req, res, next) {
    try {
        return res.json({ ok: true, data: await service.listCategories() });
    } catch (error) {
        return next(error);
    }
}

async function availableImages(req, res, next) {
    try {
        return res.json({ ok: true, data: await service.listAvailableImages() });
    } catch (error) {
        return next(error);
    }
}

async function create(req, res, next) {
    try {
        const data = await service.createProduct(req.body, (req.files || []).map((file) => file.filename));
        return res.status(201).json({ ok: true, data });
    } catch (error) {
        return next(error);
    }
}

async function update(req, res, next) {
    try {
        const data = await service.updateProduct(req.params.id, req.body, (req.files || []).map((file) => file.filename));
        return res.json({ ok: true, data });
    } catch (error) {
        return next(error);
    }
}

async function deactivate(req, res, next) {
    try {
        const data = await service.deactivateProduct(req.params.id, req.body.reason);
        return res.json({ ok: true, data, message: 'Producto inactivado exitosamente' });
    } catch (error) {
        return next(error);
    }
}

async function reactivate(req, res, next) {
    try {
        const data = await service.reactivateProduct(req.params.id);
        return res.json({ ok: true, data, message: 'Producto reactivado exitosamente' });
    } catch (error) {
        return next(error);
    }
}

module.exports = { list, listManaged, getById, categories, availableImages, create, update, deactivate, reactivate };
