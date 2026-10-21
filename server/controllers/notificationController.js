const Notification = require('../models/Notification');

// Admin: Get notifications
const getAdminNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipientRole: 'admin' })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipientRole: 'admin',
      isRead: false
    });

    res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    next(err);
  }
};

// Customer: Get notifications
const getCustomerNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipientRole: 'customer',
      recipientUser: req.user.id
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipientRole: 'customer',
      recipientUser: req.user.id,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    next(err);
  }
};

// Mark single notification as read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (err) {
    next(err);
  }
};

// Mark all as read
const markAllAsRead = async (req, res, next) => {
  try {
    const isCustomer = req.user && req.user.role === 'customer';
    const filter = isCustomer
      ? { recipientRole: 'customer', recipientUser: req.user.id }
      : { recipientRole: 'admin' };

    await Notification.updateMany(filter, { $set: { isRead: true } });

    res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminNotifications,
  getCustomerNotifications,
  markAsRead,
  markAllAsRead
};
