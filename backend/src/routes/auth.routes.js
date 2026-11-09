const express = require('express');
const controller = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/password/forgot', controller.requestRecovery);
router.post('/password/verify', controller.verifyRecovery);
router.post('/password/reset', controller.resetPassword);
router.get('/me', authenticate, controller.me);
router.patch('/me', authenticate, controller.updateMe);

module.exports = router;
