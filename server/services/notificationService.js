const Notification = require('../models/Notification');
const { sendWhatsAppNotification } = require('./whatsappService');

/**
 * Dispatch an in-app and optional WhatsApp notification
 */
const notify = async ({
  recipientRole,
  recipientUser = null,
  recipientPhone = null,
  type,
  title,
  message,
  link = '',
  data = {}
}) => {
  try {
    let whatsappStatus = 'not_sent';
    let whatsappError = null;
    let whatsappMessageId = null;

    if (recipientPhone) {
      const waResult = await sendWhatsAppNotification(
        recipientPhone,
        `*${title}*\n${message}\n\n- Lavanya Collections`
      );
      whatsappStatus = waResult.status;
      if (!waResult.success) {
        whatsappError = waResult.error;
      } else {
        whatsappMessageId = waResult.messageId;
      }
    }

    const notification = await Notification.create({
      recipientRole,
      recipientUser,
      type,
      title,
      message,
      link,
      data,
      whatsappStatus,
      whatsappError,
      whatsappMessageId
    });

    return notification;
  } catch (err) {
    console.error('[Notification Dispatch Error]:', err.message);
    return null;
  }
};

module.exports = { notify };
