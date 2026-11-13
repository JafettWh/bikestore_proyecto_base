const express = require('express');
const controller = require('../controllers/orders.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate, authorize('admin'));
router.get('/', controller.listAdminShipments);
router.put('/:id/estado', controller.updateLogisticsStatus);

module.exports = router;
