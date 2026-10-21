const express = require('express');
const router = express.Router();
const {
  getCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');

// Public
router.get('/', getCategories);

// Admin Only
router.get('/admin/all', protect, adminOnly, getAdminCategories);
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
