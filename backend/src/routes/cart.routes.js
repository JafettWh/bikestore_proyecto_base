const express = require('express');
const controller = require('../controllers/cart.controller');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth.middleware');

const router = express.Router();
router.post('/claim', authenticate, controller.claim);
router.get('/', optionalAuthenticate, controller.get);
router.post('/items', optionalAuthenticate, controller.add);
router.patch('/items/:itemId', optionalAuthenticate, controller.update);
router.delete('/items/:itemId', optionalAuthenticate, controller.remove);

module.exports = router;
