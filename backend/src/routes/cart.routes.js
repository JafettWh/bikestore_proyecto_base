const express = require('express');
const controller = require('../controllers/cart.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate, authorize('cliente'));
router.get('/', controller.get);
router.post('/items', controller.add);
router.post('/import', controller.importGuestItems);
router.patch('/items/:itemId', controller.update);
router.delete('/items/:itemId', controller.remove);

module.exports = router;
