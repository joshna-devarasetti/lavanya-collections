const Order = require('../models/Order');
const RentalBooking = require('../models/RentalBooking');
const CustomDesignRequest = require('../models/CustomDesignRequest');
const Payment = require('../models/Payment');
const Product = require('../models/Product');

const getDashboardMetrics = async (req, res, next) => {
  try {
    const today = new Date();
    const in3Days = new Date();
    in3Days.setDate(today.getDate() + 3);

    // Parallel metric retrieval
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      completedOrders,
      totalRentals,
      activeRentals,
      upcomingReturns,
      pendingCustomRequests,
      revenueResult,
      balanceResult,
      lowStockProducts,
      recentOrders,
      recentCustomRequests
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending_payment' }),
      Order.countDocuments({ orderStatus: { $in: ['confirmed', 'processing', 'packed', 'shipped'] } }),
      Order.countDocuments({ orderStatus: 'completed' }),
      RentalBooking.countDocuments(),
      RentalBooking.countDocuments({ status: { $in: ['confirmed', 'dispatched', 'rented_out'] } }),
      RentalBooking.countDocuments({
        status: { $in: ['confirmed', 'dispatched', 'rented_out'] },
        endDate: { $gte: today, $lte: in3Days }
      }),
      CustomDesignRequest.countDocuments({ status: { $in: ['submitted', 'under_review', 'quoted'] } }),
      // Verified revenue
      Payment.aggregate([
        { $match: { status: 'verified' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Outstanding balances on active orders
      Order.aggregate([
        { $match: { orderStatus: { $nin: ['cancelled', 'pending_payment'] }, balanceAmount: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$balanceAmount' } } }
      ]),
      // Low stock items (stock <= 2)
      Product.find({ isActive: true, stockQuantity: { $lte: 2 } })
        .select('name stockQuantity price availabilityType images')
        .limit(5),
      // Recent orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select('orderNumber customerDetails totalAmount paymentTypeChosen paymentStatus orderStatus createdAt'),
      // Recent custom requests
      CustomDesignRequest.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('requestNumber title customerDetails status quotation createdAt')
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const totalOutstandingBalance = balanceResult[0]?.total || 0;

    res.json({
      success: true,
      metrics: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        completedOrders,
        totalRentals,
        activeRentals,
        upcomingReturns,
        pendingCustomRequests,
        totalRevenue,
        totalOutstandingBalance,
        lowStockCount: lowStockProducts.length
      },
      lowStockProducts,
      recentOrders,
      recentCustomRequests
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardMetrics };
