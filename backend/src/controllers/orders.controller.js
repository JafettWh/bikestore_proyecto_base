const service = require('../services/orders.service');

async function checkout(req, res, next) {
    try {
        const order = await service.createOrder(req.user.id, req.body);
        return res.status(201).json({ ok: true, data: order, message: 'Pago simulado procesado exitosamente' });
    } catch (error) {
        return next(error);
    }
}

async function mine(req, res, next) {
    try {
        return res.json({ ok: true, data: await service.listMyOrders(req.user.id) });
    } catch (error) {
        return next(error);
    }
}

async function listAdminShipments(req, res, next) {
    try {
        return res.json({ ok: true, data: await service.listAllOrders() });
    } catch (error) {
        return next(error);
    }
}

async function updateLogisticsStatus(req, res, next) {
    try {
        const order = await service.updateLogisticsStatus(req.params.id, req.body?.status);
        return res.json({ ok: true, data: order, message: 'Estado del envío actualizado exitosamente' });
    } catch (error) {
        return next(error);
    }
}

module.exports = { checkout, mine, listAdminShipments, updateLogisticsStatus };
