const RentalBooking = require('../models/RentalBooking');
const Product = require('../models/Product');
const { notify } = require('../services/notificationService');

// Admin: Get all rental bookings with status filters
const getAdminRentals = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { bookingNumber: { $regex: search, $options: 'i' } },
        { 'customerDetails.name': { $regex: search, $options: 'i' } },
        { 'customerDetails.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalRentals = await RentalBooking.countDocuments(query);
    const rentals = await RentalBooking.find(query)
      .populate('product', 'name images price rentalPrice stockQuantity')
      .populate('order', 'orderNumber paymentStatus')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limitNum);

    // Identify upcoming returns (next 3 days)
    const today = new Date();
    const in3Days = new Date();
    in3Days.setDate(today.getDate() + 3);

    const upcomingReturns = await RentalBooking.countDocuments({
      status: { $in: ['confirmed', 'dispatched', 'rented_out'] },
      endDate: { $gte: today, $lte: in3Days }
    });

    const overdueRentals = await RentalBooking.countDocuments({
      status: { $in: ['confirmed', 'dispatched', 'rented_out'] },
      endDate: { $lt: today }
    });

    res.json({
      success: true,
      count: rentals.length,
      total: totalRentals,
      upcomingReturnsCount: upcomingReturns,
      overdueCount: overdueRentals,
      rentals
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Update rental status
const updateRentalStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const rental = await RentalBooking.findById(id).populate('product');
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental booking not found.' });
    }

    rental.status = status;
    if (adminNotes !== undefined) rental.adminNotes = adminNotes;

    if (status === 'dispatched') {
      rental.dispatchDate = new Date();
    }

    await rental.save();

    // Notify customer
    if (rental.customerDetails?.phone) {
      await notify({
        recipientRole: 'customer',
        recipientUser: rental.customer,
        recipientPhone: rental.customerDetails.phone,
        type: 'rental_return_reminder',
        title: `Rental Update: #${rental.bookingNumber}`,
        message: `Your rental booking #${rental.bookingNumber} for "${rental.product?.name}" is now: ${status.replace(/_/g, ' ').toUpperCase()}.`,
        data: { rentalId: rental._id, status }
      });
    }

    res.json({
      success: true,
      message: `Rental status updated to ${status}.`,
      rental
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Record Return & Inspection
const recordRentalReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { actualReturnDate, returnInspectionNotes, lateFee = 0 } = req.body;

    const rental = await RentalBooking.findById(id).populate('product');
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental booking not found.' });
    }

    rental.actualReturnDate = actualReturnDate ? new Date(actualReturnDate) : new Date();
    rental.returnInspectionNotes = returnInspectionNotes || 'Item received in good condition.';
    rental.lateFee = Number(lateFee) || 0;
    rental.status = 'returned';

    await rental.save();

    res.json({
      success: true,
      message: 'Rental item return and inspection recorded successfully.',
      rental
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminRentals,
  updateRentalStatus,
  recordRentalReturn
};
