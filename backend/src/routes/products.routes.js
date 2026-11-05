const express = require('express');
const controller = require('../controllers/products.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { uploadProductImage } = require('../middlewares/upload.middleware');

const router = express.Router();
router.get('/categories', controller.categories);
router.get('/manage', authenticate, authorize('admin'), controller.listManaged);
router.post('/', authenticate, authorize('admin'), uploadProductImage, controller.create);
router.put('/:id', authenticate, authorize('admin'), uploadProductImage, controller.update);
router.patch('/:id/deactivate', authenticate, authorize('admin'), controller.deactivate);
router.get('/', controller.list);
router.get('/:id', controller.getById);

module.exports = router;
