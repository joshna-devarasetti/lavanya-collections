const Payment = require('../models/Payment');
const Order = require('../models/Order');
const CustomDesignRequest = require('../models/CustomDesignRequest');
const RentalBooking = require('../models/RentalBooking');
const Product = require('../models/Product');
const BusinessSettings = require('../models/BusinessSettings');
const QRCode = require('qrcode');
const {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature
} = require('../services/razorpayService');
const { notify } = require('../services/notificationService');

// Create Razorpay Order & PhonePe UPI Details for Order or Custom Design Request
const initiatePayment = async (req, res, next) => {
  try {
    const { orderId, customRequestId } = req.body;

    if (!orderId && !customRequestId) {
      return res.status(400).json({
        success: false,
        message: 'Either orderId or customRequestId must be provided.'
      });
    }

    let payableAmountINR = 0;
    let paymentType = 'advance';
    let targetEntity = null;
    let entityType = '';

    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      if (order.paymentStatus === 'fully_paid') {
        return res.status(400).json({ success: false, message: 'This order is already fully paid.' });
      }

      if (order.paymentTypeChosen === 'full') {
        payableAmountINR = order.totalAmount;
        paymentType = 'full';
      } else {
        // Advance payment: sum item advances + shipping
        const itemsAdvance = order.items.reduce((sum, item) => sum + (item.advanceAmount || 0), 0);
        payableAmountINR = itemsAdvance + (order.shippingFee || 0);
        paymentType = 'advance';
      }

      targetEntity = order;
      entityType = 'order';

    } else if (customRequestId) {
      const customReq = await CustomDesignRequest.findById(customRequestId);
      if (!customReq) {
        return res.status(404).json({ success: false, message: 'Custom design request not found.' });
      }

      if (customReq.status !== 'quoted' && customReq.status !== 'quotation_accepted') {
        return res.status(400).json({
          success: false,
          message: 'Quotation has not been issued or is no longer valid for payment.'
        });
      }

      payableAmountINR = customReq.quotation.advanceAmount || Math.round((customReq.quotation.price * (customReq.quotation.advancePercentage || 30)) / 100);
      paymentType = 'advance';
      targetEntity = customReq;
      entityType = 'custom_request';
    }

    if (payableAmountINR <= 0) {
      return res.status(400).json({ success: false, message: 'Payable amount must be greater than zero.' });
    }

    // Fetch PhonePe business settings
    const settings = await BusinessSettings.findOne();
    const phonePeNumber = settings?.paymentSettings?.phonePeNumber || process.env.PHONEPE_NUMBER || '6372556290';
    const upiId = settings?.paymentSettings?.upiId || process.env.PHONEPE_UPI_ID || `${phonePeNumber}@ybl`;
    const upiAccountName = settings?.paymentSettings?.upiAccountName || 'Lavanya Collections';

    const orderRef = entityType === 'order' ? targetEntity.orderNumber : targetEntity.requestNumber;
    const phonepeOrderId = `phonepe_ord_${orderRef}_${Date.now()}`;

    // Save Payment record in DB with PhonePe gateway
    const payment = await Payment.create({
      order: entityType === 'order' ? targetEntity._id : undefined,
      customRequest: entityType === 'custom_request' ? targetEntity._id : undefined,
      customer: req.user ? req.user._id : targetEntity.customer,
      paymentType,
      amount: payableAmountINR,
      amountInPaise: Math.round(payableAmountINR * 100),
      currency: 'INR',
      gateway: 'phonepe',
      phonePeNumber,
      transactionRef: phonepeOrderId,
      razorpayOrderId: phonepeOrderId,
      status: 'created'
    });

    if (entityType === 'order') {
      targetEntity.razorpayOrderId = phonepeOrderId;
      await targetEntity.save();
    }

    // Build standard Indian UPI Intent and PhonePe Deep-link URLs
    const encodedName = encodeURIComponent(upiAccountName);
    const upiIntentUrl = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${payableAmountINR}&cu=INR&tn=Order_${orderRef}`;
    const phonepeIntentUrl = `phonepe://pay?pa=${upiId}&pn=${encodedName}&am=${payableAmountINR}&cu=INR&tn=Order_${orderRef}`;

    // Generate Dynamic Base64 UPI QR Code for instant scanning with PhonePe
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(upiIntentUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 280,
        color: {
          dark: '#3A1E05',
          light: '#FFFFFF'
        }
      });
    } catch (qrErr) {
      console.warn('QR code generation error:', qrErr.message);
    }

    res.json({
      success: true,
      message: 'PhonePe payment initialized.',
      paymentId: payment._id,
      phonepeOrderId,
      razorpayOrderId: phonepeOrderId,
      amount: Math.round(payableAmountINR * 100),
      amountInINR: payableAmountINR,
      currency: 'INR',
      customerDetails: targetEntity.customerDetails,
      phonePe: {
        number: phonePeNumber,
        upiId: upiId,
        accountName: upiAccountName,
        upiIntentUrl,
        phonepeIntentUrl,
        qrCodeDataUrl
      }
    });
  } catch (err) {
    next(err);
  }
};

// Verify payment signature and fulfill order idempotently
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentMethod = 'online'
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'razorpay_order_id and razorpay_payment_id are required.'
      });
    }

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found for this Razorpay order.' });
    }

    // Idempotency: If already verified, return success without duplicate processing
    if (payment.status === 'verified') {
      return res.json({
        success: true,
        message: 'Payment already verified and processed.',
        payment
      });
    }

    // Verify official HMAC SHA256 signature
    const isValid = await verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      payment.status = 'failed';
      payment.failureReason = 'Invalid cryptographic payment signature.';
      await payment.save();
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature.'
      });
    }

    // Mark payment as verified
    payment.status = 'verified';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature || '';
    payment.paymentMethod = paymentMethod;
    payment.verifiedAt = new Date();
    await payment.save();

    // Process Order fulfillment
    if (payment.order) {
      const order = await Order.findById(payment.order);
      if (order) {
        order.amountPaid += payment.amount;
        order.balanceAmount = Math.max(0, order.totalAmount - order.amountPaid);
        order.paymentStatus = order.balanceAmount <= 0 ? 'fully_paid' : 'partially_paid';
        order.orderStatus = 'confirmed';
        await order.save();

        // Update rental bookings and adjust product stock/reservations
        for (const item of order.items) {
          if (item.itemType === 'rental' && item.rentalBooking) {
            await RentalBooking.findByIdAndUpdate(item.rentalBooking, {
              status: 'confirmed',
              advancePaid: item.advanceAmount,
              balanceDue: item.remainingAmount
            });
          }

          // Decrement stock for purchase items
          if (item.itemType === 'purchase') {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stockQuantity: -item.quantity }
            });
          }
        }

        // Notify Admin & Customer
        await notify({
          recipientRole: 'admin',
          type: 'payment_verified',
          title: 'Payment Verified',
          message: `Payment of ₹${payment.amount} verified for Order #${order.orderNumber}.`,
          link: `/admin/orders`,
          data: { orderId: order._id, paymentId: payment._id }
        });

        if (order.customerDetails?.phone) {
          await notify({
            recipientRole: 'customer',
            recipientUser: order.customer,
            recipientPhone: order.customerDetails.phone,
            type: 'payment_verified',
            title: 'Payment Received!',
            message: `Thank you! We received your payment of ₹${payment.amount} for Order #${order.orderNumber}. Your order is now confirmed.`,
            link: `/account/orders`,
            data: { orderId: order._id }
          });
        }
      }
    }

    // Process Custom Design Request fulfillment
    if (payment.customRequest) {
      const customReq = await CustomDesignRequest.findById(payment.customRequest);
      if (customReq) {
        customReq.status = 'in_production';
        if (customReq.quotation) {
          customReq.quotation.customerResponse = 'accepted';
          customReq.quotation.customerResponseAt = new Date();
        }
        await customReq.save();

        await notify({
          recipientRole: 'admin',
          type: 'quotation_approved',
          title: 'Custom Quotation Paid & Accepted',
          message: `Customer ${customReq.customerDetails.name} paid advance ₹${payment.amount} for Custom Design #${customReq.requestNumber}. Ready for production!`,
          link: `/admin/custom-requests`,
          data: { customRequestId: customReq._id }
        });
      }
    }

    res.json({
      success: true,
      message: 'Payment verified and confirmed successfully!',
      payment
    });
  } catch (err) {
    next(err);
  }
};

// Webhook listener for Razorpay server-to-server events
const handleWebhook = async (req, res, next) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const isValid = verifyWebhookSignature(rawBody, webhookSignature);
    if (!isValid && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment?.entity;
      if (paymentEntity) {
        const payment = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id });
        if (payment && payment.status !== 'verified') {
          payment.status = 'verified';
          payment.razorpayPaymentId = paymentEntity.id;
          payment.rawWebhookData = payload;
          payment.verifiedAt = new Date();
          await payment.save();

          if (payment.order) {
            await Order.findByIdAndUpdate(payment.order, {
              orderStatus: 'confirmed',
              paymentStatus: 'partially_paid'
            });
          }
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[Razorpay Webhook Error]:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
};

// Admin: Get all payment transactions
const getAdminPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 25 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('order', 'orderNumber totalAmount paymentStatus')
      .populate('customRequest', 'requestNumber title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Calculate confirmed revenue
    const confirmedTotal = await Payment.aggregate([
      { $match: { status: 'verified' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      count: payments.length,
      total: totalCount,
      confirmedRevenue: confirmedTotal[0]?.total || 0,
      payments
    });
  } catch (err) {
    next(err);
  }
};

// Verify Direct PhonePe / UPI Payment using UTR / Transaction ID
const verifyDirectUPI = async (req, res, next) => {
  try {
    const { orderId, customRequestId, utr, phonePeNumber = '6372556290' } = req.body;

    if (!orderId && !customRequestId) {
      return res.status(400).json({ success: false, message: 'orderId or customRequestId is required.' });
    }

    let targetEntity = null;
    let entityType = '';
    let payableAmount = 0;

    if (orderId) {
      targetEntity = await Order.findById(orderId);
      if (!targetEntity) return res.status(404).json({ success: false, message: 'Order not found.' });
      entityType = 'order';

      if (targetEntity.paymentStatus === 'fully_paid') {
        return res.status(400).json({ success: false, message: 'This order is already fully paid.' });
      }

      if (targetEntity.paymentTypeChosen === 'full') {
        payableAmount = targetEntity.totalAmount;
      } else {
        const itemsAdvance = targetEntity.items.reduce((sum, item) => sum + (item.advanceAmount || 0), 0);
        payableAmount = itemsAdvance + (targetEntity.shippingFee || 0);
      }
    } else {
      targetEntity = await CustomDesignRequest.findById(customRequestId);
      if (!targetEntity) return res.status(404).json({ success: false, message: 'Custom request not found.' });
      entityType = 'custom_request';
      payableAmount = targetEntity.quotation?.advanceAmount || 0;
    }

    if (!utr || !utr.trim()) {
      return res.status(400).json({
        success: false,
        message: 'PhonePe Transaction ID / UTR is mandatory to verify your payment. Please enter the transaction ID from your PhonePe app.'
      });
    }

    const transactionRef = utr.trim();
    if (transactionRef.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid PhonePe Transaction ID / UTR.'
      });
    }

    // Create or find payment record
    let payment = await Payment.findOne({
      [entityType === 'order' ? 'order' : 'customRequest']: targetEntity._id,
      status: 'created'
    });

    if (!payment) {
      payment = new Payment({
        order: entityType === 'order' ? targetEntity._id : undefined,
        customRequest: entityType === 'custom_request' ? targetEntity._id : undefined,
        customer: req.user ? req.user._id : targetEntity.customer,
        paymentType: targetEntity.paymentTypeChosen || 'advance',
        amount: payableAmount,
        amountInPaise: Math.round(payableAmount * 100),
        currency: 'INR',
        gateway: 'phonepe',
        phonePeNumber,
        transactionRef,
        razorpayOrderId: `phonepe_upi_${Date.now()}`,
        status: 'created'
      });
    }

    payment.status = 'verified';
    payment.gateway = 'phonepe';
    payment.phonePeNumber = phonePeNumber;
    payment.transactionRef = transactionRef;
    payment.paymentMethod = `PhonePe UPI (${phonePeNumber})`;
    payment.razorpayPaymentId = transactionRef;
    payment.verifiedAt = new Date();
    await payment.save();

    // Process Order fulfillment
    if (entityType === 'order') {
      targetEntity.transactionId = transactionRef;
      targetEntity.amountPaid += payableAmount;
      targetEntity.balanceAmount = Math.max(0, targetEntity.totalAmount - targetEntity.amountPaid);
      targetEntity.paymentStatus = targetEntity.balanceAmount <= 0 ? 'fully_paid' : 'partially_paid';
      targetEntity.orderStatus = 'confirmed';
      await targetEntity.save();

      // Update rentals & decrement stock
      for (const item of targetEntity.items) {
        if (item.itemType === 'rental' && item.rentalBooking) {
          await RentalBooking.findByIdAndUpdate(item.rentalBooking, {
            status: 'confirmed',
            advancePaid: item.advanceAmount,
            balanceDue: item.remainingAmount
          });
        }
        if (item.itemType === 'purchase' && item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stockQuantity: -item.quantity }
          });
        }
      }

      // Notify Admin & Customer
      await notify({
        recipientRole: 'admin',
        type: 'payment_verified',
        title: 'PhonePe Payment Received',
        message: `PhonePe payment of ₹${payableAmount} verified for Order #${targetEntity.orderNumber} (Transaction ID: ${transactionRef}, PhonePe: ${phonePeNumber}).`,
        link: '/admin/orders',
        data: { orderId: targetEntity._id, paymentId: payment._id, transactionId: transactionRef }
      });

      if (targetEntity.customerDetails?.phone) {
        await notify({
          recipientRole: 'customer',
          recipientUser: targetEntity.customer,
          recipientPhone: targetEntity.customerDetails.phone,
          type: 'payment_verified',
          title: 'PhonePe Payment Received!',
          message: `Thank you! Your PhonePe payment of ₹${payableAmount} for Order #${targetEntity.orderNumber} is confirmed (Transaction ID: ${transactionRef}).`,
          link: '/account/orders',
          data: { orderId: targetEntity._id, transactionId: transactionRef }
        });
      }
    } else {
      targetEntity.transactionId = transactionRef;
      targetEntity.status = 'in_production';
      if (targetEntity.quotation) {
        targetEntity.quotation.customerResponse = 'accepted';
        targetEntity.quotation.customerResponseAt = new Date();
      }
      await targetEntity.save();

      await notify({
        recipientRole: 'admin',
        type: 'quotation_approved',
        title: 'Custom Quotation Paid via PhonePe',
        message: `Customer ${targetEntity.customerDetails?.name} paid advance ₹${payableAmount} via PhonePe (Transaction ID: ${transactionRef}) for Custom Design #${targetEntity.requestNumber}.`,
        link: '/admin/custom-requests',
        data: { customRequestId: targetEntity._id, transactionId: transactionRef }
      });
    }

    res.json({
      success: true,
      message: 'PhonePe payment confirmed and order placed successfully!',
      order: targetEntity,
      payment
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
  verifyDirectUPI,
  handleWebhook,
  getAdminPayments
};
