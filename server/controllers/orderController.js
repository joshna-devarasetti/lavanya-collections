const Order = require('../models/Order');
const Product = require('../models/Product');
const RentalBooking = require('../models/RentalBooking');
const BusinessSettings = require('../models/BusinessSettings');
const { notify } = require('../services/notificationService');

/**
 * Validate and calculate order totals from fresh DB product records
 * Prevents client-side price/percentage manipulation
 */
const calculateOrderTotals = async (items, deliveryMethod = 'courier', paymentTypeChosen = 'advance') => {
  const settings = await BusinessSettings.findOne() || {};
  let totalOrderValue = 0;
  let totalAdvanceDue = 0;
  const processedItems = [];

  for (const rawItem of items) {
    const product = await Product.findById(rawItem.productId || rawItem.product);
    if (!product || !product.isActive) {
      throw new Error(`Product not found or inactive: ${rawItem.productId}`);
    }

    const qty = Math.max(1, parseInt(rawItem.quantity || 1, 10));
    const isRental = rawItem.itemType === 'rental';

    if (isRental) {
      if (product.availabilityType === 'buy_only') {
        throw new Error(`Product "${product.name}" is only available for purchase, not rental.`);
      }

      if (!rawItem.rentalStartDate || !rawItem.rentalEndDate) {
        throw new Error(`Rental dates required for "${product.name}".`);
      }

      const start = new Date(rawItem.rentalStartDate);
      const end = new Date(rawItem.rentalEndDate);
      if (start >= end) {
        throw new Error(`Invalid rental dates for "${product.name}".`);
      }

      // Check overlapping bookings
      const overlapCount = await RentalBooking.countDocuments({
        product: product._id,
        status: { $nin: ['cancelled', 'returned', 'inspected_complete'] },
        startDate: { $lte: end },
        endDate: { $gte: start }
      });

      if (overlapCount + qty > product.stockQuantity) {
        throw new Error(`Item "${product.name}" is fully booked for the selected dates (${rawItem.rentalStartDate} to ${rawItem.rentalEndDate}).`);
      }

      const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
      const ratePerDay = product.rentalPrice > 0 ? (product.rentalPrice / (product.rentalPeriodDays || 3)) : 0;
      const unitRentalPrice = Math.round(ratePerDay * diffDays);
      const subtotal = unitRentalPrice * qty;

      const advancePct = product.advancePercentage || 20;
      const itemAdvance = Math.round((subtotal * advancePct) / 100);
      const itemBalance = subtotal - itemAdvance;

      totalOrderValue += subtotal;
      totalAdvanceDue += itemAdvance;

      processedItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.images[0] || '',
        categoryName: product.category?.name || 'Rental',
        itemType: 'rental',
        unitPrice: unitRentalPrice,
        quantity: qty,
        subtotal,
        paymentMode: product.paymentMode,
        advancePercentage: advancePct,
        advanceAmount: itemAdvance,
        remainingAmount: itemBalance,
        rentalStartDate: start,
        rentalEndDate: end,
        rentalDays: diffDays,
        securityDeposit: (product.securityDeposit || 0) * qty
      });

    } else {
      // Purchase item
      if (product.availabilityType === 'rent_only') {
        throw new Error(`Product "${product.name}" is only available for rental, not purchase.`);
      }

      const availableStock = product.stockQuantity - (product.reservedQuantity || 0);
      if (qty > availableStock) {
        throw new Error(`Only ${availableStock} units available for "${product.name}".`);
      }

      const unitPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
      const subtotal = unitPrice * qty;

      const advancePct = product.advancePercentage || 20;
      const itemAdvance = Math.round((subtotal * advancePct) / 100);
      const itemBalance = subtotal - itemAdvance;

      totalOrderValue += subtotal;
      totalAdvanceDue += itemAdvance;

      processedItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.images[0] || '',
        categoryName: product.category?.name || 'Product',
        itemType: 'purchase',
        unitPrice,
        quantity: qty,
        subtotal,
        paymentMode: product.paymentMode,
        advancePercentage: advancePct,
        advanceAmount: itemAdvance,
        remainingAmount: itemBalance
      });
    }
  }

  // Calculate shipping fee
  let shippingFee = 0;
  if (deliveryMethod === 'courier') {
    const freeShippingThreshold = settings.freeShippingThreshold || 1999;
    shippingFee = totalOrderValue >= freeShippingThreshold ? 0 : (settings.flatShippingRate || 99);
  }

  const grandTotal = totalOrderValue + shippingFee;
  let payableNow = 0;
  let balanceAmount = 0;

  if (paymentTypeChosen === 'full') {
    payableNow = grandTotal;
    balanceAmount = 0;
  } else {
    // Advance payment
    payableNow = totalAdvanceDue + shippingFee;
    balanceAmount = grandTotal - payableNow;
  }

  return {
    processedItems,
    totalOrderValue,
    shippingFee,
    grandTotal,
    payableNow,
    balanceAmount,
    totalAdvanceDue
  };
};

// Calculate order preview (Public / Authenticated)
const previewOrderCalculation = async (req, res, next) => {
  try {
    const { items, deliveryMethod, paymentTypeChosen } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty.' });
    }

    const calc = await calculateOrderTotals(items, deliveryMethod, paymentTypeChosen);

    res.json({
      success: true,
      calculation: calc
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Create New Order (Guest or Customer)
const createOrder = async (req, res, next) => {
  try {
    const {
      customerDetails,
      items,
      deliveryMethod,
      paymentTypeChosen,
      customerNotes,
      policyAccepted
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    if (!customerDetails || !customerDetails.name || !customerDetails.phone || !customerDetails.addressLine1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, phone number, and delivery address.'
      });
    }

    const calc = await calculateOrderTotals(items, deliveryMethod, paymentTypeChosen);

    // Determine overall order type
    const hasRental = calc.processedItems.some(i => i.itemType === 'rental');
    const hasPurchase = calc.processedItems.some(i => i.itemType === 'purchase');
    let orderType = 'purchase';
    if (hasRental && hasPurchase) orderType = 'mixed';
    else if (hasRental) orderType = 'rental';

    const order = await Order.create({
      customer: req.user ? req.user._id : null,
      isGuest: !req.user,
      customerDetails: {
        name: customerDetails.name,
        email: customerDetails.email || '',
        phone: customerDetails.phone,
        addressLine1: customerDetails.addressLine1,
        addressLine2: customerDetails.addressLine2 || '',
        city: customerDetails.city || '',
        state: customerDetails.state || '',
        postalCode: customerDetails.postalCode || '',
        landmark: customerDetails.landmark || ''
      },
      orderType,
      items: calc.processedItems,
      deliveryMethod: deliveryMethod || 'courier',
      shippingFee: calc.shippingFee,
      totalAmount: calc.grandTotal,
      paymentTypeChosen: paymentTypeChosen || 'advance',
      amountPaid: 0,
      balanceAmount: calc.balanceAmount,
      paymentStatus: 'pending',
      orderStatus: 'pending_payment',
      customerNotes: customerNotes || '',
      policyAccepted: !!policyAccepted
    });

    // Create corresponding rental booking records for rental items
    for (const item of order.items) {
      if (item.itemType === 'rental') {
        const rentalBooking = await RentalBooking.create({
          product: item.product,
          customer: req.user ? req.user._id : null,
          customerDetails: {
            name: customerDetails.name,
            phone: customerDetails.phone,
            email: customerDetails.email || '',
            address: `${customerDetails.addressLine1}, ${customerDetails.city || ''}`,
            city: customerDetails.city || '',
            postalCode: customerDetails.postalCode || ''
          },
          order: order._id,
          startDate: item.rentalStartDate,
          endDate: item.rentalEndDate,
          totalDays: item.rentalDays,
          dailyRate: Math.round(item.unitPrice / (item.rentalDays || 1)),
          rentalPrice: item.subtotal,
          securityDeposit: item.securityDeposit || 0,
          advancePercentage: item.advancePercentage,
          advancePaid: 0,
          balanceDue: item.subtotal,
          status: 'pending_payment'
        });
        item.rentalBooking = rentalBooking._id;
      }
    }
    await order.save();

    // Notify Admin of new order
    await notify({
      recipientRole: 'admin',
      type: 'new_order',
      title: 'New Order Received',
      message: `Order #${order.orderNumber} placed by ${customerDetails.name} for ₹${order.totalAmount} (${order.paymentTypeChosen} payment).`,
      link: `/admin/orders`,
      data: { orderId: order._id, orderNumber: order.orderNumber }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Ready for payment.',
      order,
      payableNow: calc.payableNow
    });
  } catch (err) {
    next(err);
  }
};

// Customer: Get my orders
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    next(err);
  }
};

// Customer: Get single order detail
const getMyOrderDetail = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user.id
    }).populate('items.product', 'name images slug');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({
      success: true,
      order
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get all orders with status/type filters & pagination
const getAdminOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, orderType, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (orderType) query.orderType = orderType;

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerDetails.name': { $regex: search, $options: 'i' } },
        { 'customerDetails.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: orders.length,
      total: totalOrders,
      totalPages: Math.ceil(totalOrders / limitNum),
      currentPage: pageNum,
      orders
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get single order detail
const getAdminOrderDetail = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('items.rentalBooking');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({
      success: true,
      order
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Update Order Status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const validStatuses = [
      'pending_payment',
      'confirmed',
      'processing',
      'packed',
      'shipped',
      'ready_for_pickup',
      'delivered',
      'collected',
      'completed',
      'cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status transition.' });
    }

    order.orderStatus = status;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;
    await order.save();

    // Notify customer
    if (order.customerDetails?.phone) {
      await notify({
        recipientRole: 'customer',
        recipientUser: order.customer,
        recipientPhone: order.customerDetails.phone,
        type: 'order_status_update',
        title: `Order Status Update: #${order.orderNumber}`,
        message: `Your Lavanya Collections order #${order.orderNumber} is now: ${status.replace(/_/g, ' ').toUpperCase()}.`,
        link: `/account/orders`,
        data: { orderId: order._id, status }
      });
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}.`,
      order
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Update manual courier and tracking info
const updateTrackingInfo = async (req, res, next) => {
  try {
    const { courierName, trackingNumber, trackingUrl, estimatedDeliveryDate } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.trackingInfo = {
      courierName: courierName || order.trackingInfo.courierName,
      trackingNumber: trackingNumber || order.trackingInfo.trackingNumber,
      trackingUrl: trackingUrl || order.trackingInfo.trackingUrl,
      estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : order.trackingInfo.estimatedDeliveryDate,
      dispatchedAt: new Date()
    };

    if (order.orderStatus === 'processing' || order.orderStatus === 'packed') {
      order.orderStatus = 'shipped';
    }

    await order.save();

    // Notify customer
    if (order.customerDetails?.phone) {
      await notify({
        recipientRole: 'customer',
        recipientUser: order.customer,
        recipientPhone: order.customerDetails.phone,
        type: 'order_status_update',
        title: `Order Dispatched: #${order.orderNumber}`,
        message: `Your order #${order.orderNumber} has been dispatched via ${courierName || 'Courier'}. Tracking Number: ${trackingNumber || 'Available in account'}.`,
        link: `/account/orders`,
        data: { orderId: order._id, trackingNumber }
      });
    }

    res.json({
      success: true,
      message: 'Tracking details updated and customer notified.',
      order
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  calculateOrderTotals,
  previewOrderCalculation,
  createOrder,
  getMyOrders,
  getMyOrderDetail,
  getAdminOrders,
  getAdminOrderDetail,
  updateOrderStatus,
  updateTrackingInfo
};
