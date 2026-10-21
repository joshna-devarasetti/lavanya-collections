const express = require('express');
const router = express.Router();
const {
  previewOrderCalculation,
  createOrder,
  getMyOrders,
  getMyOrderDetail,
  getAdminOrders,
  getAdminOrderDetail,
  updateOrderStatus,
  updateTrackingInfo
} = require('../controllers/orderController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

// Public preview calculation
router.post('/calculate', previewOrderCalculation);

// Create order (optionalAuth allows guest or customer)
router.post('/', optionalAuth, createOrder);

// Customer orders
router.get('/my-orders', protect, getMyOrders);
router.get('/my-orders/:id', protect, getMyOrderDetail);

// Admin orders
router.get('/admin/all', protect, adminOnly, getAdminOrders);
router.get('/admin/:id', protect, adminOnly, getAdminOrderDetail);
router.put('/admin/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/admin/:id/tracking', protect, adminOnly, updateTrackingInfo);

module.exports = router;
