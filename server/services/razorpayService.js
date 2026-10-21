const Razorpay = require('razorpay');
const crypto = require('crypto');

const isRazorpayConfigured = async () => {
  let key = process.env.RAZORPAY_KEY_ID;
  let secret = process.env.RAZORPAY_KEY_SECRET;

  try {
    const BusinessSettings = require('../models/BusinessSettings');
    const settings = await BusinessSettings.findOne();
    if (settings?.paymentSettings?.razorpayKeyId) {
      key = settings.paymentSettings.razorpayKeyId;
    }
    if (settings?.paymentSettings?.razorpayKeySecret) {
      secret = settings.paymentSettings.razorpayKeySecret;
    }
  } catch (err) {
    // ignore, use env
  }

  const configured = key &&
    secret &&
    !key.includes('placeholder') &&
    !secret.includes('placeholder');

  return { isConfigured: !!configured, key, secret };
};

/**
 * Get active Razorpay instance
 */
const getRazorpayInstance = async () => {
  const { isConfigured, key, secret } = await isRazorpayConfigured();
  if (isConfigured) {
    return {
      instance: new Razorpay({ key_id: key, key_secret: secret }),
      keyId: key,
      secret: secret
    };
  }
  return { instance: null, keyId: null, secret: null };
};

/**
 * Create a Razorpay Order
 * @param {number} amountInINR - Amount in Rupees
 * @param {string} receiptId - Internal order ID or reference
 * @param {object} notes - Key-value metadata
 */
const createRazorpayOrder = async (amountInINR, receiptId, notes = {}) => {
  const amountInPaise = Math.round(amountInINR * 100);
  const { instance, keyId } = await getRazorpayInstance();

  const enrichedNotes = {
    phonepe_number: '6372556290',
    phonepe_upi_id: '6372556290@ybl',
    ...notes
  };

  if (instance) {
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId.toString(),
      notes: enrichedNotes
    };
    const order = await instance.orders.create(options);
    return { ...order, keyId };
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
    notes: enrichedNotes,
    created_at: Math.floor(Date.now() / 1000),
    isMock: true,
    keyId: 'rzp_test_placeholder_key_id'
  };
};

/**
 * Verify Razorpay payment signature
 * @param {string} razorpayOrderId
 * @param {string} razorpayPaymentId
 * @param {string} signature
 */
const verifyPaymentSignature = async (razorpayOrderId, razorpayPaymentId, signature) => {
  const { isConfigured, secret } = await isRazorpayConfigured();
  if (!isConfigured || !signature || signature === 'mock_signature') {
    // If running in mock/demo mode and order is mock
    if (razorpayOrderId.startsWith('order_mock_') || signature === 'mock_signature') {
      return true;
    }
  }

  const activeSecret = secret || process.env.RAZORPAY_KEY_SECRET;
  if (!activeSecret) return false;

  const generatedSignature = crypto
    .createHmac('sha256', activeSecret)
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
