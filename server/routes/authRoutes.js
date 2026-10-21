const express = require('express');
const router = express.Router();
const {
  register,
  login,
  adminLogin,
  getMe,
  updateProfile,
  addAddress
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/addresses', protect, addAddress);

module.exports = router;
