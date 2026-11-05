const express = require('express');
const controller = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate, authorize('admin'));
router.get('/', controller.get);
router.get('/export', controller.exportData);

module.exports = router;
