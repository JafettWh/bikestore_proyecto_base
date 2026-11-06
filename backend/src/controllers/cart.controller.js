const service = require('../services/cart.service');

async function get(req, res, next) {
    try {
        return res.json({ ok: true, data: await service.getCart(req.user.id) });
    } catch (error) {
        return next(error);
    }
}

async function add(req, res, next) {
    try {
        const result = await service.addItem({
            userId: req.user.id,
            productId: req.body.productId,
            quantity: req.body.quantity,
            selectedSize: req.body.selectedSize
        });
        return res.status(200).json({ ok: true, data: result.items, adjusted: result.adjusted });
    } catch (error) {
        return next(error);
    }
}

async function importGuestItems(req, res, next) {
    try {
        const result = await service.importGuestItems(req.user.id, req.body.items, req.body.importId);
        return res.json({ ok: true, data: result.items, adjusted: result.adjusted, skipped: result.skipped });
    } catch (error) {
        return next(error);
    }
}

async function update(req, res, next) {
    try {
        const data = await service.updateItem({
            userId: req.user.id,
            cartItemId: req.params.itemId,
            quantity: req.body.quantity
        });
        return res.json({ ok: true, data });
    } catch (error) {
        return next(error);
    }
}

async function remove(req, res, next) {
    try {
        const data = await service.removeItem({ userId: req.user.id, cartItemId: req.params.itemId });
        return res.json({ ok: true, data });
    } catch (error) {
        return next(error);
    }
}

module.exports = { get, add, importGuestItems, update, remove };
