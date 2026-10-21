# Lavanya Collections — WhatsApp Business Cloud API Integration

WhatsApp is the primary real-time communication channel for Indian boutique retail. Lavanya Collections includes a built-in notification engine configured for the **Meta WhatsApp Cloud API**.

---

## 1. Key Business Use Cases

Automated WhatsApp alerts are triggered for critical customer lifecycle events:
1. **Order Confirmation & Advance Payment Receipt**: Sent immediately after successful checkout and signature verification.
2. **Rental Booking & Pickup Reminder**: Details rental start/return dates and security deposit terms.
3. **Custom Design Quotation Ready**: Alerts the customer that the boutique owner has reviewed their reference photos and submitted a formal quotation.
4. **Order Shipped with Tracking Link**: Sends carrier name and tracking number upon dispatch.
5. **Rental Return Overdue Notice**: Sent when an item has not been returned by the agreed end date.

---

## 2. Technical Architecture

```
[Lavanya Backend]
       │
       ▼
[server/services/whatsappService.js]
       │
       ├──▶ If WHATSAPP_ACCESS_TOKEN is configured:
       │    HTTP POST https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages
       │    Payload: Pre-approved template or interactive session message
       │
       └──▶ If unconfigured (Development / Test Mode):
            In-memory Mock Dispatcher logs the formatted alert to console & DB
            Customer & Admin still receive visible in-app notification bells
```

---

## 3. Pre-Approved Message Templates

When initiating contact outside the 24-hour customer care window, Meta requires pre-approved templates:

### Template 1: `order_confirmation_v1`
```
Namaste {{1}}! 🙏
Thank you for shopping with Lavanya Collections.
Your Order #{{2}} for ₹{{3}} has been confirmed.
Advance Paid: ₹{{4}} | Balance Due: ₹{{5}}
We will notify you as soon as your order is dispatched.
Track your order anytime at: https://lavanyacollections.com/account
```

### Template 2: `custom_quote_ready_v1`
```
Namaste {{1}}! 🙏
Our designer at Lavanya Collections has reviewed your custom design request: "{{2}}".
Quotation: ₹{{3}} (Estimated completion: {{4}} days).
Please review the quotation details and approve your order here:
https://lavanyacollections.com/custom-design
```

### Template 3: `rental_return_reminder_v1`
```
Namaste {{1}}! 🙏
This is a gentle reminder from Lavanya Collections that your rented item "{{2}}" is scheduled for return on {{3}}.
Please ensure the item is returned in its original condition to receive your refundable deposit of ₹{{4}}.
```

---

## 4. Production Setup Guide (Meta Cloud API)

### Step 1: Create a Meta Developer Account
1. Visit [developers.facebook.com](https://developers.facebook.com) and register as a developer.
2. Click **Create App** and select **Business** type.
3. Add the **WhatsApp** product to your app.

### Step 2: Obtain API Credentials
1. Under **WhatsApp > Getting Started**:
   - Note the **Phone Number ID**.
   - Note the **WhatsApp Business Account ID**.
2. For permanent server access, generate a **System User Access Token** in Meta Business Settings with `whatsapp_business_messaging` and `whatsapp_business_management` permissions.

### Step 3: Configure Environment Variables
Update your `server/.env` file:
```env
WHATSAPP_PHONE_NUMBER_ID=109283746592817
WHATSAPP_ACCESS_TOKEN=EAAG...long_permanent_system_user_token...
WHATSAPP_BUSINESS_ACCOUNT_ID=982734918237491
WHATSAPP_CONTACT_NUMBER=+919876543210
```

---

## 5. Floating Storefront WhatsApp Button

The customer storefront includes a floating WhatsApp icon in the bottom right corner configured in `client/src/layouts/CustomerLayout.jsx`. 
- Clicking this button opens a direct chat with the business owner at the phone number configured in `BusinessSettings`.
- It pre-populates a warm greeting:
  `"Hello Lavanya Collections! I have an inquiry regarding your boutique products."`
