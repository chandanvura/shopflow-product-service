const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, seedProducts } = require('../controllers/productController');
const { cacheMiddleware } = require('../middleware/cache');
const { protect } = require('../middleware/auth');

router.get('/', cacheMiddleware(300), getProducts);
router.get('/:id', cacheMiddleware(300), getProduct);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.post('/seed/data', seedProducts);

module.exports = router;