const Payment = require('../models/Payment');
const Order = require('../models/Order');
const CustomDesignRequest = require('../models/CustomDesignRequest');
const RentalBooking = require('../models/RentalBooking');
const Product = require('../models/Product');
const {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature
} = require('../services/razorpayService');
const { notify } = require('../services/notificationService');

// Create Razorpay Order for Order or Custom Design Request
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

    // Call Razorpay API to generate order
    const receipt = entityType === 'order' ? targetEntity.orderNumber : targetEntity.requestNumber;
    const rzpOrder = await createRazorpayOrder(payableAmountINR, receipt, {
      entityType,
      entityId: targetEntity._id.toString(),
      paymentType
    });

    // Save Payment record in DB
    const payment = await Payment.create({
      order: entityType === 'order' ? targetEntity._id : undefined,
      customRequest: entityType === 'custom_request' ? targetEntity._id : undefined,
      customer: req.user ? req.user._id : targetEntity.customer,
      paymentType,
      amount: payableAmountINR,
      amountInPaise: rzpOrder.amount,
      currency: 'INR',
      gateway: 'razorpay',
      razorpayOrderId: rzpOrder.id,
      status: 'created'
    });

    if (entityType === 'order') {
      targetEntity.razorpayOrderId = rzpOrder.id;
      await targetEntity.save();
    }

    res.json({
      success: true,
      message: 'Payment order created.',
      paymentId: payment._id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount, // in paise
      amountInINR: payableAmountINR,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id',
      customerDetails: targetEntity.customerDetails,
      isMock: !!rzpOrder.isMock
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
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
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

module.exports = {
  initiatePayment,
  verifyPayment,
  handleWebhook,
  getAdminPayments
};
