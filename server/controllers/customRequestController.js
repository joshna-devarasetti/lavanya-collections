const CustomDesignRequest = require('../models/CustomDesignRequest');
const { notify } = require('../services/notificationService');

// Customer: Submit Custom Design Request
const submitCustomRequest = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      referenceImages,
      dimensions,
      preferredMaterials,
      budgetRange,
      requiredDate,
      deliveryMethod,
      deliveryAddress,
      additionalNotes,
      customerDetails
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a title and detailed description for your design idea.'
      });
    }

    const customerInfo = {
      name: customerDetails?.name || req.user?.name || 'Customer',
      phone: customerDetails?.phone || req.user?.phone || '',
      email: customerDetails?.email || req.user?.email || ''
    };

    if (!customerInfo.phone) {
      return res.status(400).json({
        success: false,
        message: 'A contact phone number is required.'
      });
    }

    const customRequest = await CustomDesignRequest.create({
      customer: req.user ? req.user._id : null,
      customerDetails: customerInfo,
      title,
      description,
      category: category || 'Custom Jewellery / Gifts',
      referenceImages: Array.isArray(referenceImages) ? referenceImages : [],
      dimensions,
      preferredMaterials,
      budgetRange,
      requiredDate: requiredDate ? new Date(requiredDate) : undefined,
      deliveryMethod: deliveryMethod || 'courier',
      deliveryAddress,
      additionalNotes,
      status: 'submitted'
    });

    // Notify Admin of new custom design request
    await notify({
      recipientRole: 'admin',
      type: 'new_custom_request',
      title: 'New Custom Design Request',
      message: `New custom request #${customRequest.requestNumber} ("${title}") submitted by ${customerInfo.name}.`,
      link: `/admin/custom-requests`,
      data: { customRequestId: customRequest._id, requestNumber: customRequest.requestNumber }
    });

    res.status(201).json({
      success: true,
      message: 'Your custom design idea has been submitted! Our team will review it and provide a quotation.',
      customRequest
    });
  } catch (err) {
    next(err);
  }
};

// Customer: Get my custom requests
const getMyCustomRequests = async (req, res, next) => {
  try {
    const requests = await CustomDesignRequest.find({ customer: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (err) {
    next(err);
  }
};

// Customer: Get single request
const getMyCustomRequestDetail = async (req, res, next) => {
  try {
    const request = await CustomDesignRequest.findOne({
      _id: req.params.id,
      customer: req.user.id
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Custom design request not found.' });
    }

    res.json({
      success: true,
      request
    });
  } catch (err) {
    next(err);
  }
};

// Customer: Accept or Decline Quotation
const respondToQuotation = async (req, res, next) => {
  try {
    const { response, declineReason } = req.body; // 'accepted' or 'declined'
    const request = await CustomDesignRequest.findOne({
      _id: req.params.id,
      customer: req.user.id
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Custom design request not found.' });
    }

    if (request.status !== 'quoted') {
      return res.status(400).json({ success: false, message: 'This request does not have an active quotation to respond to.' });
    }

    if (!request.quotation || !request.quotation.price) {
      return res.status(400).json({ success: false, message: 'No valid quotation exists.' });
    }

    if (request.quotation.validUntil && new Date() > new Date(request.quotation.validUntil)) {
      return res.status(400).json({ success: false, message: 'This quotation has expired. Please contact us to refresh it.' });
    }

    if (response === 'accepted') {
      request.status = 'quotation_accepted';
      request.quotation.customerResponse = 'accepted';
      request.quotation.customerResponseAt = new Date();

      await notify({
        recipientRole: 'admin',
        type: 'quotation_approved',
        title: 'Quotation Accepted by Customer',
        message: `Customer ${request.customerDetails.name} accepted quotation of ₹${request.quotation.price} for #${request.requestNumber}. Awaiting advance payment.`,
        link: `/admin/custom-requests`,
        data: { customRequestId: request._id }
      });

    } else if (response === 'declined') {
      request.status = 'quotation_declined';
      request.quotation.customerResponse = 'declined';
      request.quotation.customerResponseAt = new Date();
      request.quotation.declineReason = declineReason || 'Customer declined quotation.';

      await notify({
        recipientRole: 'admin',
        type: 'system',
        title: 'Quotation Declined',
        message: `Customer ${request.customerDetails.name} declined quotation for #${request.requestNumber}. Reason: ${request.quotation.declineReason}`,
        link: `/admin/custom-requests`,
        data: { customRequestId: request._id }
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid response. Must be "accepted" or "declined".' });
    }

    await request.save();

    res.json({
      success: true,
      message: `Quotation ${response} successfully.`,
      request
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get all custom design requests
const getAdminCustomRequests = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { requestNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { 'customerDetails.name': { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalRequests = await CustomDesignRequest.countDocuments(query);
    const requests = await CustomDesignRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: requests.length,
      total: totalRequests,
      requests
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Issue Quotation
const issueQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      price,
      advancePercentage = 30,
      estimatedDeliveryDate,
      validUntil,
      terms,
      adminNotes
    } = req.body;

    if (!price || Number(price) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid quotation price.' });
    }

    const request = await CustomDesignRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Custom design request not found.' });
    }

    const quotedPrice = Number(price);
    const advPct = Number(advancePercentage);
    const advanceAmount = Math.round((quotedPrice * advPct) / 100);
    const balanceAmount = quotedPrice - advanceAmount;

    // Default expiry 7 days if not provided
    const expiry = validUntil ? new Date(validUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    request.quotation = {
      price: quotedPrice,
      advancePercentage: advPct,
      advanceAmount,
      balanceAmount,
      estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : undefined,
      validUntil: expiry,
      terms: terms || 'Handmade customized orders require advance confirmation. Production starts upon advance payment.',
      quotedAt: new Date(),
      customerResponse: 'pending'
    };

    request.status = 'quoted';
    if (adminNotes !== undefined) request.adminNotes = adminNotes;

    await request.save();

    // Notify customer
    if (request.customerDetails?.phone) {
      await notify({
        recipientRole: 'customer',
        recipientUser: request.customer,
        recipientPhone: request.customerDetails.phone,
        type: 'quotation_ready',
        title: `Quotation Ready for #${request.requestNumber}`,
        message: `We have reviewed your custom design idea "${request.title}" and prepared a quotation of ₹${quotedPrice} (Advance: ₹${advanceAmount}). Please review and approve in your account.`,
        link: `/account/custom-requests`,
        data: { customRequestId: request._id, price: quotedPrice }
      });
    }

    res.json({
      success: true,
      message: 'Quotation issued and sent to customer.',
      request
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Update Status
const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const request = await CustomDesignRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Custom design request not found.' });
    }

    request.status = status;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;
    await request.save();

    // Notify customer
    if (request.customerDetails?.phone) {
      await notify({
        recipientRole: 'customer',
        recipientUser: request.customer,
        recipientPhone: request.customerDetails.phone,
        type: 'system',
        title: `Update on Custom Design #${request.requestNumber}`,
        message: `Your custom request "${request.title}" status has been updated to: ${status.replace(/_/g, ' ').toUpperCase()}.`,
        link: `/account/custom-requests`,
        data: { customRequestId: request._id, status }
      });
    }

    res.json({
      success: true,
      message: `Request status updated to ${status}.`,
      request
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitCustomRequest,
  getMyCustomRequests,
  getMyCustomRequestDetail,
  respondToQuotation,
  getAdminCustomRequests,
  issueQuotation,
  updateRequestStatus
};
