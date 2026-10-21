# Lavanya Collections — Payment Gateway & Transaction Architecture

Lavanya Collections integrates with **Razorpay**, India's leading payment gateway, supporting UPI (Google Pay, PhonePe, Paytm), Netbanking, Credit/Debit Cards, and Wallets.

---

## 1. Core Architectural Principles

### 1.1 Integer Paise Precision
In JavaScript, floating-point math can result in fractional precision bugs (e.g. `0.1 + 0.2 = 0.30000000000000004`). In financial calculations, this is strictly forbidden.
- All amounts in backend API exchanges with Razorpay are converted to integer paise:
  ```javascript
  const amountInPaise = Math.round(inrAmount * 100);
  ```
- Razorpay returns transactions in paise, which are safely converted back to INR before persisting to MongoDB.

### 1.2 Granular Advance & Balance Rules
Boutique items have differing cash flow requirements:
1. **`advance_only`**: Requires an upfront advance deposit (e.g. 20% or 50% for customized jewelry or bridal frocks). The remaining balance is payable upon delivery or fitting.
2. **`full_only`**: Fast-moving decorative items or small gifts requiring 100% upfront settlement.
3. **`both`**: Gives the customer the choice during checkout:
   - Pay Full Amount (100% now)
   - Pay Advance (e.g. 20% now, balance on delivery)

---

## 2. Payment Execution Flow

```
[Customer Browser]               [Express API]               [Razorpay Gateway]
        |                              |                              |
        |--- 1. POST /api/orders ----->|                              |
        |<-- 2. Returns Order ID ------|                              |
        |                              |                              |
        |--- 3. POST /payments/create->|                              |
        |                              |--- 4. orders.create() ------>|
        |                              |<-- 5. { id: rzp_order_123 } -|
        |<-- 6. Returns RZP details ---|                              |
        |                                                             |
        |=== 7. Launch Razorpay Modal (UPI / Card / Netbanking) =====|
        |=== 8. Customer completes authentication ===================|
        |<== 9. Success: { payment_id, order_id, signature } ========|
        |                                                             |
        |--- 10. POST /payments/verify ------------------------------>|
        |    { payment_id, order_id, signature }                      |
        |                              |-- 11. HMAC SHA-256 Check ----|
        |                              |-- 12. Update DB status ------|
        |                              |-- 13. Trigger Notifications -|
        |<-- 14. Confirmation --------|                              |
```

---

## 3. Cryptographic Signature Verification

To prevent payment tampering, the server recalculates the cryptographic signature using Node's native `crypto` module:

```javascript
const crypto = require('crypto');

function verifyRazorpaySignature(orderId, paymentId, receivedSignature, secret) {
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === receivedSignature;
}
```

If the signature matches, the order state transitions from `pending_payment` to `processing`, and `paymentStatus` is marked `advance_paid` or `fully_paid`.

---

## 4. Development & Test Mode Simulator

For local evaluation without live bank credentials, the platform includes a **built-in interactive payment simulator**:
1. When `RAZORPAY_KEY_ID` or `RAZORPAY_KEY_SECRET` are not set or set to mock keys, the server creates a mock order.
2. The client checkout page detects test mode and opens the **Lavanya Test Mode Simulator** modal.
3. Testers can simulate:
   - **Simulate Successful Payment**: Generates valid mock transaction IDs and posts to the actual `/api/payments/verify` endpoint.
   - **Simulate Payment Failure**: Tests failure notifications and retry options.
   - **Dismiss/Cancel**: Verifies abandoned order states.

---

## 5. Webhook Handling

For asynchronous events (such as delayed UPI bank confirmations), the server exposes an idempotent webhook listener at:
`POST /api/payments/webhook`

Headers:
- `x-razorpay-signature`: Cryptographic HMAC of the webhook body.

Supported Events:
- `payment.captured`: Confirms payment and updates order state.
- `payment.failed`: Records failed transaction log and alerts customer.
- `order.paid`: Handles full settlement.

---

## 6. Offline Balance Collection & Settlement

For orders with an outstanding balance (e.g. 80% remaining on custom frock or bridal jewelry):
1. In the **Admin Dashboard > Orders**, the administrator can view `Balance Due (₹)`.
2. When the customer settles via cash, POS machine, or direct UPI upon delivery/pickup, the administrator clicks **Record Balance**.
3. The system logs the offline transaction, sets `balanceDue: 0`, and updates `paymentStatus: 'fully_paid'`.

---

## 7. Production Checklist (Going Live)

1. Register and complete Business KYC on the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Generate **Live API Keys** in Settings > API Keys.
3. Configure the following environment variables on your production server:
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=yyyyyyyyyyyyyyyyyyyyyyyy
   RAZORPAY_WEBHOOK_SECRET=zzzzzzzzzzzzzzzzzzzz
   ```
4. Set Webhook URL in Razorpay Dashboard to:
   `https://your-domain.com/api/payments/webhook`
   with events: `payment.captured`, `payment.failed`.
