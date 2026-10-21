const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  images: [{
    type: String,
    required: true
  }],
  price: {
    type: Number,
    required: [true, 'Sale price is required'],
    min: [0, 'Price must be positive']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price must be positive'],
    validate: {
      validator: function(val) {
        if (!val) return true;
        return val < this.price;
      },
      message: 'Discount price must be less than regular price'
    }
  },
  // Availability mode: buy_only, rent_only, both
  availabilityType: {
    type: String,
    enum: ['buy_only', 'rent_only', 'both'],
    required: true,
    default: 'both'
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 1
  },
  reservedQuantity: {
    type: Number,
    min: 0,
    default: 0
  },
  // Product-specific payment options
  paymentMode: {
    type: String,
    enum: ['advance_only', 'full_only', 'both'],
    default: 'both',
    required: true
  },
  advancePercentage: {
    type: Number,
    min: [5, 'Advance percentage must be at least 5%'],
    max: [100, 'Advance percentage cannot exceed 100%'],
    default: 20
  },
  // Rental specific settings
  rentalPrice: {
    type: Number,
    min: [0, 'Rental price must be positive'],
    default: 0
  },
  rentalPeriodDays: {
    type: Number,
    min: [1, 'Rental period must be at least 1 day'],
    default: 3
  },
  securityDeposit: {
    type: Number,
    min: 0,
    default: 0 // Optional, remains 0 until owner configures
  },
  rentalTerms: {
    type: String,
    default: 'Careful handling expected. Item must be returned clean and in original condition by the due date.'
  },
  maxRentalDays: {
    type: Number,
    default: 14
  },
  specifications: [{
    key: { type: String, required: true },
    value: { type: String, required: true }
  }],
  tags: [String],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-generate slug
productSchema.pre('validate', function(next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
  }
  next();
});

// Virtual for available stock (for purchasing)
productSchema.virtual('availableStock').get(function() {
  return Math.max(0, this.stockQuantity - this.reservedQuantity);
});

// Virtual for effective purchase price
productSchema.virtual('effectivePrice').get(function() {
  return this.discountPrice && this.discountPrice > 0 ? this.discountPrice : this.price;
});

// Indexes for high performance searching and filtering
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ availabilityType: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1, isNewArrival: 1 });

module.exports = mongoose.model('Product', productSchema);
