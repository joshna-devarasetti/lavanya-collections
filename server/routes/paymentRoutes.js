const express = require('express');
const router = express.Router();
const {
  initiatePayment,
  verifyPayment,
  handleWebhook,
  getAdminPayments
} = require('../controllers/paymentController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

// Create payment order (supports guest checkout orders too)
router.post('/create-order', optionalAuth, initiatePayment);

// Verify signature
router.post('/verify', optionalAuth, verifyPayment);

// Razorpay Webhook
router.post('/webhook', handleWebhook);

// Admin payments
router.get('/admin/all', protect, adminOnly, getAdminPayments);

module.exports = router;
