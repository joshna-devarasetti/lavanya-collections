const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientRole: {
    type: String,
    enum: ['admin', 'customer'],
    required: true
  },
  recipientUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'new_order',
      'new_rental',
      'new_custom_request',
      'quotation_approved',
      'quotation_ready',
      'payment_verified',
      'rental_return_reminder',
      'order_status_update',
      'low_stock',
      'system'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: String,
  data: mongoose.Schema.Types.Mixed,
  isRead: {
    type: Boolean,
    default: false
  },
  whatsappStatus: {
    type: String,
    enum: ['not_sent', 'queued', 'sent', 'failed'],
    default: 'not_sent'
  },
  whatsappError: String,
  whatsappMessageId: String
}, {
  timestamps: true
});

notificationSchema.index({ recipientRole: 1, isRead: 1 });
notificationSchema.index({ recipientUser: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
