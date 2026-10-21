const mongoose = require('mongoose');

const rentalBookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  startDate: {
    type: Date,
    required: [true, 'Rental start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'Rental end date is required']
  },
  totalDays: {
    type: Number,
    required: true,
    min: [1, 'Rental must be for at least 1 day']
  },
  dailyRate: {
    type: Number,
    required: true,
    default: 0
  },
  rentalPrice: {
    type: Number,
    required: true,
    min: [0, 'Rental price must be positive']
  },
  securityDeposit: {
    type: Number,
    default: 0
  },
  advancePercentage: {
    type: Number,
    default: 20
  },
  advancePaid: {
    type: Number,
    default: 0
  },
  balanceDue: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: [
      'pending_payment',
      'confirmed',
      'dispatched',
      'rented_out',
      'return_pending',
      'returned',
      'inspected_complete',
      'cancelled'
    ],
    default: 'pending_payment'
  },
  dispatchDate: Date,
  expectedReturnDate: Date,
  actualReturnDate: Date,
  returnInspectionNotes: String,
  lateFee: {
    type: Number,
    default: 0
  },
  adminNotes: String
}, {
  timestamps: true
});

// Auto-generate booking number
rentalBookingSchema.pre('validate', function(next) {
  if (!this.bookingNumber) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.bookingNumber = `RNT-${dateStr}-${rand}`;
  }
  next();
});

// Indexes for querying active dates for a product
rentalBookingSchema.index({ product: 1, startDate: 1, endDate: 1, status: 1 });
rentalBookingSchema.index({ customer: 1 });
rentalBookingSchema.index({ status: 1 });

module.exports = mongoose.model('RentalBooking', rentalBookingSchema);
