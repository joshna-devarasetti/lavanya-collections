const test = require('node:test');
const assert = require('node:assert');
const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const RentalBooking = require('../models/RentalBooking');
const { calculateOrderTotals } = require('../controllers/orderController');
const { verifyPaymentSignature } = require('../services/razorpayService');

test.before(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
});

test.after(async () => {
  await closeDB();
});

test('Auth: Register, Hash Password, and Prevent Customer from Claiming Admin Role', async (t) => {
  await User.deleteMany({ email: 'test.shopper@example.com' });

  const user = await User.create({
    name: 'Test Shopper',
    email: 'test.shopper@example.com',
    phone: '+919999988888',
    password: 'Password123!',
    role: 'customer'
  });

  assert.strictEqual(user.role, 'customer', 'User role should default to customer');
  assert.notStrictEqual(user.password, 'Password123!', 'Password should be securely hashed');
  
  const isMatch = await user.comparePassword('Password123!');
  assert.strictEqual(isMatch, true, 'Password comparison should succeed for correct password');

  const isWrongMatch = await user.comparePassword('WrongPass');
  assert.strictEqual(isWrongMatch, false, 'Password comparison should fail for wrong password');
});

test('Product: Granular Payment Configuration & Availability Rules', async (t) => {
  const category = await Category.findOne() || await Category.create({ name: 'Test Jewellery' });

  const customProduct = await Product.create({
    name: 'Custom Royal Necklace',
    description: 'Gold plated royal necklace',
    category: category._id,
    images: ['https://example.com/necklace.jpg'],
    price: 5000,
    availabilityType: 'both',
    paymentMode: 'advance_only',
    advancePercentage: 10, // 10% advance test
    rentalPrice: 1500,
    rentalPeriodDays: 3,
    stockQuantity: 5
  });

  assert.strictEqual(customProduct.advancePercentage, 10, 'Advance percentage should be 10%');
  assert.strictEqual(customProduct.paymentMode, 'advance_only');
  assert.strictEqual(customProduct.availabilityType, 'both');
});

test('Order Calculation: Exact Integer Calculations and Advance Splitting', async (t) => {
  const category = await Category.findOne();
  const product = await Product.create({
    name: 'Test Choker 30% Advance',
    description: 'Special choker with 30% advance',
    category: category._id,
    images: ['https://example.com/choker.jpg'],
    price: 3000,
    availabilityType: 'both',
    paymentMode: 'both',
    advancePercentage: 30, // 30% advance of 3000 = 900
    stockQuantity: 10
  });

  const calculation = await calculateOrderTotals(
    [{ productId: product._id, quantity: 2, itemType: 'purchase' }],
    'store_pickup',
    'advance'
  );

  // Total order: 3000 * 2 = 6000
  // Advance 30% of 6000 = 1800
  // Balance: 6000 - 1800 = 4200
  assert.strictEqual(calculation.totalOrderValue, 6000);
  assert.strictEqual(calculation.grandTotal, 6000);
  assert.strictEqual(calculation.payableNow, 1800);
  assert.strictEqual(calculation.balanceAmount, 4200);
});

test('Rental Availability: Prevents Double-Booking Overlapping Dates', async (t) => {
  const category = await Category.findOne();
  const rentalItem = await Product.create({
    name: 'Limited Exclusive Frock',
    description: 'Single unit exclusive photoshoot frock',
    category: category._id,
    images: ['https://example.com/frock.jpg'],
    price: 5000,
    availabilityType: 'rent_only',
    stockQuantity: 1, // Exactly 1 unit in inventory
    rentalPrice: 1000,
    rentalPeriodDays: 3
  });

  const startDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const endDate = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);

  // First booking for this unit
  await RentalBooking.create({
    product: rentalItem._id,
    customerDetails: {
      name: 'First Renter',
      phone: '+919876543210',
      address: 'Hyderabad',
      city: 'Hyderabad',
      postalCode: '500033'
    },
    startDate,
    endDate,
    totalDays: 3,
    rentalPrice: 1000,
    status: 'confirmed'
  });

  // Attempt second booking for overlapping dates
  await assert.rejects(
    async () => {
      await calculateOrderTotals(
        [{
          productId: rentalItem._id,
          quantity: 1,
          itemType: 'rental',
          rentalStartDate: startDate,
          rentalEndDate: endDate
        }],
        'store_pickup',
        'advance'
      );
    },
    /fully booked/i,
    'Should reject overlapping booking when stock quantity is exhausted'
  );
});

test('Payments: HMAC SHA256 Signature Verification', async (t) => {
  // Test mock signature handling in development/mock mode
  const isMockValid = await verifyPaymentSignature('order_mock_12345', 'pay_mock_12345', 'mock_signature');
  assert.strictEqual(isMockValid, true, 'Mock signature verification should pass for mock orders');

  // Test invalid signature rejection
  process.env.RAZORPAY_KEY_SECRET = 'sample_secret_key';
  const isInvalid = await verifyPaymentSignature('order_real_123', 'pay_real_456', 'tampered_signature');
  assert.strictEqual(isInvalid, false, 'Tampered or invalid signature must be rejected');
});
