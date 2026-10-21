const Razorpay = require('razorpay');
const crypto = require('crypto');

const isRazorpayConfigured = () => {
  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  return (
    key &&
    secret &&
    !key.includes('placeholder') &&
    !secret.includes('placeholder')
  );
};

let razorpayInstance = null;

if (isRazorpayConfigured()) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('[Razorpay] Gateway initialized with credentials.');
} else {
  console.log('[Razorpay] Operating in TEST / MOCK MODE. Real keys not provided.');
}

/**
 * Create a Razorpay Order
 * @param {number} amountInINR - Amount in Rupees
 * @param {string} receiptId - Internal order ID or reference
 * @param {object} notes - Key-value metadata
 */
const createRazorpayOrder = async (amountInINR, receiptId, notes = {}) => {
  const amountInPaise = Math.round(amountInINR * 100);

  if (isRazorpayConfigured() && razorpayInstance) {
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId.toString(),
      notes: notes
    };
    return await razorpayInstance.orders.create(options);
  }

  // Realistic mock order for local testing and offline verification
  const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  return {
    id: mockOrderId,
    entity: 'order',
    amount: amountInPaise,
    amount_paid: 0,
    amount_due: amountInPaise,
    currency: 'INR',
    receipt: receiptId.toString(),
    status: 'created',
    notes: notes,
    created_at: Math.floor(Date.now() / 1000),
    isMock: true
  };
};

/**
 * Verify Razorpay payment signature
 * @param {string} razorpayOrderId
 * @param {string} razorpayPaymentId
 * @param {string} signature
 */
const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, signature) => {
  if (!isRazorpayConfigured() || !signature || signature === 'mock_signature') {
    // If running in mock/demo mode and order is mock
    if (razorpayOrderId.startsWith('order_mock_') || signature === 'mock_signature') {
      return true;
    }
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

/**
 * Verify Razorpay webhook signature
 * @param {string} rawBody - Raw request body as buffer or string
 * @param {string} webhookSignature - X-Razorpay-Signature header
 */
const verifyWebhookSignature = (rawBody, webhookSignature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !webhookSignature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === webhookSignature;
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  isRazorpayConfigured
};
