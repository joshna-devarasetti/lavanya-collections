const express = require('express');
const router = express.Router();
const {
  getAdminNotifications,
  getCustomerNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/admin', protect, adminOnly, getAdminNotifications);
router.get('/customer', protect, getCustomerNotifications);
router.put('/mark-all-read', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
