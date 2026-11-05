const express = require('express');
const controller = require('../controllers/orders.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate);
router.get('/mine', authorize('cliente', 'admin'), controller.mine);
router.post('/', authorize('cliente'), controller.checkout);

module.exports = router;
