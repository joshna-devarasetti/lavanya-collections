const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: { type: String, required: true },
  productImage: { type: String },
  categoryName: { type: String },
  itemType: {
    type: String,
    enum: ['purchase', 'rental', 'custom'],
    default: 'purchase'
  },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  subtotal: { type: Number, required: true },
  
  // Snapshots of payment terms at time of order
  paymentMode: { type: String, default: 'both' },
  advancePercentage: { type: Number, default: 20 },
  advanceAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },

  // Rental specific snapshots
  rentalStartDate: Date,
  rentalEndDate: Date,
  rentalDays: Number,
  securityDeposit: { type: Number, default: 0 },
  rentalBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RentalBooking'
  }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  customerDetails: {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    landmark: String
  },
  orderType: {
    type: String,
    enum: ['purchase', 'rental', 'custom_design', 'mixed'],
    default: 'purchase'
  },
  items: [orderItemSchema],
  deliveryMethod: {
    type: String,
    enum: ['courier', 'store_pickup'],
    default: 'courier'
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount must be positive']
  },
  paymentTypeChosen: {
    type: String,
    enum: ['advance', 'full'],
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  balanceAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partially_paid', 'fully_paid', 'refunded', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: [
      'pending_payment',
      'confirmed',
      'processing',
      'packed',
      'shipped',
      'ready_for_pickup',
      'delivered',
      'collected',
      'completed',
      'cancelled'
    ],
    default: 'pending_payment'
  },
  trackingInfo: {
    courierName: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    trackingUrl: { type: String, default: '' },
    estimatedDeliveryDate: Date,
    dispatchedAt: Date
  },
  adminNotes: {
    type: String,
    default: ''
  },
  customerNotes: {
    type: String,
    default: ''
  },
  razorpayOrderId: String,
  policyAccepted: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto-generate order number
orderSchema.pre('validate', function(next) {
  if (!this.orderNumber) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `LAV-${dateStr}-${rand}`;
  }
  next();
});

orderSchema.index({ customer: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
