const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlugOrId,
  checkRentalAvailability,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.get('/', getProducts);
router.get('/:id/rental-availability', checkRentalAvailability);
router.get('/:slugOrId', getProductBySlugOrId);

// Admin
router.get('/admin/all', protect, adminOnly, getAdminProducts);
router.post('/upload-image', protect, adminOnly, upload.single('image'), uploadProductImage);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
