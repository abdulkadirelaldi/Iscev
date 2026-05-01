const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { protect } = require('../middlewares/auth.middleware');
const { uploadImage } = require('../config/multer');

const router = express.Router();

// Public
router.get('/', getProducts);
router.get('/:id', getProductById);

// Private (Admin)
router.post('/', protect, uploadImage.single('coverImage'), createProduct);
router.put('/:id', protect, uploadImage.single('coverImage'), updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
