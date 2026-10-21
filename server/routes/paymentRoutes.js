const express = require('express');
const router = express.Router();
const {
  initiatePayment,
  verifyPayment,
  verifyDirectUPI,
  handleWebhook,
  getAdminPayments
} = require('../controllers/paymentController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

// Create payment order (supports guest checkout orders too)
router.post('/create-order', optionalAuth, initiatePayment);

// Verify signature
router.post('/verify', optionalAuth, verifyPayment);

// Verify Direct PhonePe / UPI payment
router.post('/verify-direct-upi', optionalAuth, verifyDirectUPI);

// Razorpay Webhook
router.post('/webhook', handleWebhook);

// Admin payments
router.get('/admin/all', protect, adminOnly, getAdminPayments);

module.exports = router;
