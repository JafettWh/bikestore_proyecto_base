const express = require('express');
const controller = require('../controllers/users.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate, authorize('admin'));
router.get('/', controller.list);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id/deactivate', controller.deactivate);
router.patch('/:id/reactivate', controller.reactivate);

module.exports = router;
