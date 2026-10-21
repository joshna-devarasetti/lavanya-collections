const mongoose = require('mongoose');

const businessSettingsSchema = new mongoose.Schema({
  storeName: {
    type: String,
    default: 'Lavanya Collections'
  },
  tagline: {
    type: String,
    default: 'Traditional Jewellery, Photoshoot Frocks & Customized Gifts'
  },
  contactNumber: {
    type: String,
    default: '+91 98765 43210'
  },
  whatsappNumber: {
    type: String,
    default: '+919876543210'
  },
  email: {
    type: String,
    default: 'contact@lavanyacollections.com'
  },
  address: {
    street: { type: String, default: '12-4/A, Boutique Street, Jubilee Hills' },
    city: { type: String, default: 'Hyderabad' },
    state: { type: String, default: 'Telangana' },
    postalCode: { type: String, default: '500033' },
    country: { type: String, default: 'India' }
  },
  currency: {
    type: String,
    default: 'INR'
  },
  currencySymbol: {
    type: String,
    default: '₹'
  },
  defaultAdvancePercentage: {
    type: Number,
    default: 20
  },
  flatShippingRate: {
    type: Number,
    default: 99
  },
  freeShippingThreshold: {
    type: Number,
    default: 1999
  },
  socialLinks: {
    instagram: { type: String, default: 'https://instagram.com/lavanyacollections' },
    facebook: { type: String, default: 'https://facebook.com/lavanyacollections' },
    youtube: { type: String, default: '' },
    pinterest: { type: String, default: '' }
  },
  policies: {
    returnPolicy: {
      type: String,
      default: 'Due to the custom and delicate nature of jewellery and handmade items, returns are accepted within 3 days of delivery only in cases of verified transit damage. Contact support with unboxing video proof.'
    },
    rentalPolicy: {
      type: String,
      default: 'Rental items must be handled with utmost care. Do not wash, dry clean, or alter the garments/jewellery. Please return items in the provided protective boxes by the agreed return date. Late returns may incur daily charges.'
    },
    customDesignPolicy: {
      type: String,
      default: 'Custom orders require advance confirmation. Once raw materials are cut or jewelry components are assembled, advance payments are non-refundable. Delivery timelines are estimates and subject to craftsmanship complexity.'
    },
    termsOfService: {
      type: String,
      default: 'By placing an order or rental booking with Lavanya Collections, you agree to our terms, rental agreements, and payment schedules.'
    },
    privacyPolicy: {
      type: String,
      default: 'Lavanya Collections respects your privacy. We collect customer names, phone numbers, and delivery addresses strictly for order fulfillment and notification purposes.'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BusinessSettings', businessSettingsSchema);
