const express = require('express');
const router = express.Router();
const {
  getAdminRentals,
  updateRentalStatus,
  recordRentalReturn
} = require('../controllers/rentalController');
const { protect, adminOnly } = require('../middleware/auth');

// Admin rental management
router.get('/admin/all', protect, adminOnly, getAdminRentals);
router.put('/admin/:id/status', protect, adminOnly, updateRentalStatus);
router.put('/admin/:id/return', protect, adminOnly, recordRentalReturn);

module.exports = router;
