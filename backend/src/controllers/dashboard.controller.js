const service = require('../services/dashboard.service');

async function get(req, res, next) {
    try {
        return res.json({ ok: true, data: await service.getDashboard(req.query) });
    } catch (error) {
        return next(error);
    }
}

async function exportData(req, res, next) {
    try {
        return res.json({ ok: true, data: await service.getExportData(req.query) });
    } catch (error) {
        return next(error);
    }
}

module.exports = { get, exportData };
