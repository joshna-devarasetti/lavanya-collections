const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'lavanya_boutique_secure_jwt_secret_key_2026_change_in_production';
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Customer Registration
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, phone number, and password.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: 'customer' // Public registration can NEVER create admin
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// Customer Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// Dedicated Admin Login
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide admin email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials or unauthorized account.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Admin access granted.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get Current User Profile
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// Update Profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user
    });
  } catch (err) {
    next(err);
  }
};

// Add / Update Address
const addAddress = async (req, res, next) => {
  try {
    const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, landmark, isDefault } = req.body;
    const user = await User.findById(req.user.id);

    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    user.addresses.push({
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      landmark,
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully.',
      addresses: user.addresses
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  getMe,
  updateProfile,
  addAddress
};
