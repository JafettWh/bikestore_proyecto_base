const express = require('express');
const controller = require('../controllers/products.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { uploadProductImages } = require('../middlewares/upload.middleware');

const router = express.Router();
router.get('/categories', controller.categories);
router.get('/images', authenticate, authorize('admin'), controller.availableImages);
router.get('/manage', authenticate, authorize('admin'), controller.listManaged);
router.post('/', authenticate, authorize('admin'), uploadProductImages, controller.create);
router.put('/:id', authenticate, authorize('admin'), uploadProductImages, controller.update);
router.patch('/:id/deactivate', authenticate, authorize('admin'), controller.deactivate);
router.patch('/:id/reactivate', authenticate, authorize('admin'), controller.reactivate);
router.get('/', controller.list);
router.get('/:id', controller.getById);

module.exports = router;
