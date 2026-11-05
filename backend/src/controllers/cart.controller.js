const service = require('../services/cart.service');

function cartIdentity(req) {
    return { userId: req.user?.id, guestKey: req.headers['x-cart-key'] };
}

async function get(req, res, next) {
    try {
        return res.json({ ok: true, data: await service.getCart(cartIdentity(req)) });
    } catch (error) {
        return next(error);
    }
}

async function add(req, res, next) {
    try {
        const result = await service.addItem({
            ...cartIdentity(req),
            productId: req.body.productId,
            quantity: req.body.quantity,
            selectedSize: req.body.selectedSize
        });
        return res.status(200).json({ ok: true, data: result.items, adjusted: result.adjusted });
    } catch (error) {
        return next(error);
    }
}

async function update(req, res, next) {
    try {
        const data = await service.updateItem({
            ...cartIdentity(req),
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
        const data = await service.removeItem({ ...cartIdentity(req), cartItemId: req.params.itemId });
        return res.json({ ok: true, data });
    } catch (error) {
        return next(error);
    }
}

async function claim(req, res, next) {
    try {
        const data = await service.claimGuestCart(req.user.id, req.headers['x-cart-key']);
        return res.json({ ok: true, data });
    } catch (error) {
        return next(error);
    }
}

module.exports = { get, add, update, remove, claim };
