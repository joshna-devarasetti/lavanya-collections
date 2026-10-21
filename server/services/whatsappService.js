/**
 * WhatsApp Business Cloud API Service
 * Follows Meta Graph API v18.0+ specification
 */

const isWhatsAppConfigured = () => {
  return (
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    !process.env.WHATSAPP_ACCESS_TOKEN.includes('placeholder')
  );
};

/**
 * Format phone number for WhatsApp (E.164 without '+')
 * e.g., '+91 98765 43210' -> '919876543210'
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
};

/**
 * Send WhatsApp message using Meta Cloud API or simulation
 * @param {string} recipientPhone - Recipient phone number
 * @param {string} messageText - Fallback plain text message
 * @param {object} templateOptions - Optional template config { templateName, languageCode, components }
 */
const sendWhatsAppNotification = async (recipientPhone, messageText, templateOptions = null) => {
  const formattedPhone = formatPhoneNumber(recipientPhone);
  
  if (!formattedPhone) {
    return {
      success: false,
      status: 'failed',
      error: 'Invalid recipient phone number'
    };
  }

  // If live Cloud API credentials are configured
  if (isWhatsAppConfigured()) {
    try {
      const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
      
      let payload;
      if (templateOptions && templateOptions.templateName) {
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateOptions.templateName,
            language: { code: templateOptions.languageCode || 'en' },
            components: templateOptions.components || []
          }
        };
      } else {
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: { preview_url: false, body: messageText }
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[WhatsApp API Error]:', data);
        return {
          success: false,
          status: 'failed',
          error: data.error?.message || 'Failed to dispatch WhatsApp message'
        };
      }

      return {
        success: true,
        status: 'sent',
        messageId: data.messages?.[0]?.id,
        isSimulated: false
      };
    } catch (err) {
      console.error('[WhatsApp Dispatch Exception]:', err.message);
      return {
        success: false,
        status: 'failed',
        error: err.message
      };
    }
  }

  // Simulation mode when live credentials are not provided
  console.log(`[WhatsApp Simulated Notification] To: ${formattedPhone}`);
  console.log(`[WhatsApp Content]: ${messageText}`);
  
  return {
    success: true,
    status: 'sent',
    messageId: `wamid.mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    isSimulated: true
  };
};

module.exports = {
  sendWhatsAppNotification,
  isWhatsAppConfigured,
  formatPhoneNumber
};
