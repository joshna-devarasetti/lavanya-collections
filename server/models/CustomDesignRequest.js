const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  price: {
    type: Number,
    min: [0, 'Quotation price must be positive']
  },
  advancePercentage: {
    type: Number,
    min: [5, 'Advance percentage must be at least 5%'],
    max: [100, 'Advance percentage cannot exceed 100%'],
    default: 30
  },
  advanceAmount: {
    type: Number,
    default: 0
  },
  balanceAmount: {
    type: Number,
    default: 0
  },
  estimatedDeliveryDate: Date,
  validUntil: Date,
  terms: {
    type: String,
    default: 'Handmade custom designs require specified production time. Non-refundable once work begins.'
  },
  quotedAt: Date,
  customerResponse: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  customerResponseAt: Date,
  declineReason: String
}, { _id: false });

const customDesignRequestSchema = new mongoose.Schema({
  requestNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String }
  },
  title: {
    type: String,
    required: [true, 'Idea title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Detailed description is required'],
    trim: true
  },
  category: {
    type: String,
    default: 'Custom Jewellery / Gifts'
  },
  referenceImages: [{
    type: String
  }],
  dimensions: String,
  preferredMaterials: String,
  budgetRange: String,
  requiredDate: Date,
  deliveryMethod: {
    type: String,
    enum: ['courier', 'store_pickup'],
    default: 'courier'
  },
  deliveryAddress: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String
  },
  additionalNotes: String,
  status: {
    type: String,
    enum: [
      'submitted',
      'under_review',
      'additional_info_needed',
      'quoted',
      'quotation_accepted',
      'quotation_declined',
      'advance_paid',
      'in_production',
      'completed',
      'delivered',
      'rejected'
    ],
    default: 'submitted'
  },
  quotation: quotationSchema,
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  transactionId: {
    type: String,
    default: ''
  },
  adminNotes: String
}, {
  timestamps: true
});

// Auto-generate request number
customDesignRequestSchema.pre('validate', function(next) {
  if (!this.requestNumber) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.requestNumber = `CUST-${dateStr}-${rand}`;
  }
  next();
});

customDesignRequestSchema.index({ customer: 1 });
customDesignRequestSchema.index({ status: 1 });
customDesignRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CustomDesignRequest', customDesignRequestSchema);
