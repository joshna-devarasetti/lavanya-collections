const Product = require('../models/Product');
const RentalBooking = require('../models/RentalBooking');
const { uploadImage } = require('../services/cloudinaryService');

// Public: Get all products with rich filtering, search, sorting, and pagination
const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      availabilityType, // 'buy_only', 'rent_only', 'both'
      minPrice,
      maxPrice,
      search,
      inStock,
      isFeatured,
      isNewArrival,
      isPopular,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (availabilityType) {
      if (availabilityType === 'buy') {
        query.availabilityType = { $in: ['buy_only', 'both'] };
      } else if (availabilityType === 'rent') {
        query.availabilityType = { $in: ['rent_only', 'both'] };
      } else {
        query.availabilityType = availabilityType;
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (inStock === 'true') {
      query.stockQuantity = { $gt: 0 };
    }

    if (isFeatured === 'true') query.isFeatured = true;
    if (isNewArrival === 'true') query.isNewArrival = true;
    if (isPopular === 'true') query.isPopular = true;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'popular') sortOption = { isPopular: -1, createdAt: -1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: products.length,
      total: totalProducts,
      totalPages: Math.ceil(totalProducts / limitNum),
      currentPage: pageNum,
      products
    });
  } catch (err) {
    next(err);
  }
};

// Public: Get single product by ID or Slug
const getProductBySlugOrId = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    let product;

    if (slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(slugOrId).populate('category', 'name slug');
    } else {
      product = await Product.findOne({ slug: slugOrId }).populate('category', 'name slug');
    }

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (err) {
    next(err);
  }
};

// Public: Check rental availability for specified date range
const checkRentalAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both startDate and endDate.'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format.'
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date.'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Rental start date cannot be in the past.'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.availabilityType === 'buy_only') {
      return res.status(400).json({
        success: false,
        message: 'This product is only available for purchase, not for rent.'
      });
    }

    // Check overlapping bookings in active statuses
    const activeOverlapBookings = await RentalBooking.countDocuments({
      product: id,
      status: {
        $nin: ['cancelled', 'returned', 'inspected_complete']
      },
      // Overlap condition:
      startDate: { $lte: end },
      endDate: { $gte: start }
    });

    const isAvailable = activeOverlapBookings < product.stockQuantity;
    const diffTime = Math.abs(end - start);
    const rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate rental price based on configured rental price and period
    const ratePerDay = product.rentalPrice > 0 ? (product.rentalPrice / (product.rentalPeriodDays || 3)) : 0;
    const estimatedRentalPrice = Math.round(ratePerDay * rentalDays);
    const advanceAmount = Math.round((estimatedRentalPrice * (product.advancePercentage || 20)) / 100);
    const balanceAmount = estimatedRentalPrice - advanceAmount;

    res.json({
      success: true,
      isAvailable,
      totalUnits: product.stockQuantity,
      overlappingBookings: activeOverlapBookings,
      rentalDays,
      dailyRate: Math.round(ratePerDay),
      estimatedRentalPrice,
      advancePercentage: product.advancePercentage,
      advanceAmount,
      balanceAmount,
      securityDeposit: product.securityDeposit || 0,
      rentalTerms: product.rentalTerms
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get all products
const getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Create product
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      images,
      price,
      discountPrice,
      availabilityType,
      stockQuantity,
      paymentMode,
      advancePercentage,
      rentalPrice,
      rentalPeriodDays,
      securityDeposit,
      rentalTerms,
      maxRentalDays,
      specifications,
      tags,
      isFeatured,
      isNewArrival,
      isPopular
    } = req.body;

    const product = await Product.create({
      name,
      description,
      category,
      images: Array.isArray(images) && images.length ? images : ['/uploads/placeholder-product.jpg'],
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      availabilityType: availabilityType || 'both',
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 1,
      paymentMode: paymentMode || 'both',
      advancePercentage: advancePercentage !== undefined ? Number(advancePercentage) : 20,
      rentalPrice: rentalPrice ? Number(rentalPrice) : 0,
      rentalPeriodDays: rentalPeriodDays ? Number(rentalPeriodDays) : 3,
      securityDeposit: securityDeposit ? Number(securityDeposit) : 0,
      rentalTerms,
      maxRentalDays: maxRentalDays ? Number(maxRentalDays) : 14,
      specifications: Array.isArray(specifications) ? specifications : [],
      tags: Array.isArray(tags) ? tags : [],
      isFeatured: !!isFeatured,
      isNewArrival: !!isNewArrival,
      isPopular: !!isPopular
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Update product
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Assign allowed updates
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        product[key] = updateData[key];
      }
    });

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Delete (soft archive) product
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product archived successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Upload image
const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
    }

    const imageUrl = await uploadImage(req.file.path, 'lavanya-collections/products');

    res.json({
      success: true,
      message: 'Image uploaded successfully.',
      imageUrl
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductBySlugOrId,
  checkRentalAvailability,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
};
