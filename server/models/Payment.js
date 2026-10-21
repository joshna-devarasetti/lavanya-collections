const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  customRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomDesignRequest'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  paymentType: {
    type: String,
    enum: ['advance', 'balance', 'full'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Amount must be greater than 0']
  },
  amountInPaise: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  gateway: {
    type: String,
    enum: ['razorpay', 'manual_upi', 'cash_on_delivery'],
    default: 'razorpay'
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  paymentMethod: {
    type: String,
    default: 'online'
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'verified', 'failed', 'refunded'],
    default: 'created'
  },
  failureReason: String,
  verifiedAt: Date,
  rawWebhookData: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
