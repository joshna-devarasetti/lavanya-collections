require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB, closeDB } = require('../config/db');

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const RentalBooking = require('../models/RentalBooking');
const CustomDesignRequest = require('../models/CustomDesignRequest');
const Payment = require('../models/Payment');
const BusinessSettings = require('../models/BusinessSettings');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    console.log('[Seed] Starting Lavanya Collections database seed...');

    // Clear existing collections safely
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      RentalBooking.deleteMany({}),
      CustomDesignRequest.deleteMany({}),
      Payment.deleteMany({}),
      BusinessSettings.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('[Seed] Cleaned existing collections.');

    // 1. Seed Business Settings
    const settings = await BusinessSettings.create({
      storeName: 'Lavanya Collections',
      tagline: 'Traditional Jewellery, Photoshoot Frocks & Customized Gifts',
      contactNumber: '+91 98765 43210',
      whatsappNumber: '+919876543210',
      email: 'contact@lavanyacollections.com',
      address: {
        street: 'Plot 42, Traditional Enclave, Jubilee Hills Road No. 36',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500033',
        country: 'India'
      },
      currency: 'INR',
      currencySymbol: '₹',
      defaultAdvancePercentage: 20,
      flatShippingRate: 99,
      freeShippingThreshold: 1999,
      socialLinks: {
        instagram: 'https://instagram.com/lavanyacollections',
        facebook: 'https://facebook.com/lavanyacollections',
        youtube: 'https://youtube.com/@lavanyacollections'
      },
      policies: {
        returnPolicy: 'Due to the custom and delicate nature of jewellery and handmade items, returns are accepted within 3 days of delivery only in cases of verified transit damage. Contact support with unboxing video proof.',
        rentalPolicy: 'Rental items must be handled with utmost care. Do not wash, dry clean, or alter the garments/jewellery. Please return items in the provided protective boxes by the agreed return date. Late returns may incur daily charges.',
        customDesignPolicy: 'Custom orders require advance confirmation. Once raw materials are cut or jewelry components are assembled, advance payments are non-refundable. Delivery timelines are estimates and subject to craftsmanship complexity.',
        termsOfService: 'By placing an order or rental booking with Lavanya Collections, you agree to our terms, rental agreements, and payment schedules.',
        privacyPolicy: 'Lavanya Collections respects your privacy. We collect customer names, phone numbers, and delivery addresses strictly for order fulfillment and notification purposes.'
      }
    });

    // 2. Seed Users
    const adminUser = await User.create({
      name: process.env.ADMIN_NAME || 'Lavanya Admin',
      email: process.env.ADMIN_EMAIL || 'lavanyacollections@gmail.com',
      phone: process.env.ADMIN_PHONE || '+919876543210',
      password: process.env.ADMIN_PASSWORD || 'lavanyacollect',
      role: 'admin'
    });

    const customerUser = await User.create({
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+919876501234',
      password: 'Customer@2026!',
      role: 'customer',
      addresses: [{
        fullName: 'Priya Sharma',
        phone: '+919876501234',
        addressLine1: 'Flat 302, Green View Apartments, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500033',
        landmark: 'Near Durgam Cheruvu Metro',
        isDefault: true
      }]
    });

    console.log('[Seed] Admin and Customer users seeded.');

    // 3. Seed Categories
    const categoriesData = [
      {
        name: 'Jewellery',
        slug: 'jewellery',
        description: 'Authentic South Indian temple jewellery, antique kundan chokers, guttapusalu, and bridal sets.',
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
        displayOrder: 1
      },
      {
        name: 'Photoshoot Frocks',
        slug: 'photoshoot-frocks',
        description: 'Exquisite designer frocks and traditional ethnic dresses for birthday and maternity photoshoots.',
        imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
        displayOrder: 2
      },
      {
        name: 'Doll Sets',
        slug: 'doll-sets',
        description: 'Traditional handcrafted wooden Marapachi dolls, Navratri Golu sets, and bridal doll arrangements.',
        imageUrl: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&fit=crop&w=800&q=80',
        displayOrder: 3
      },
      {
        name: 'Decorative Items',
        slug: 'decorative-items',
        description: 'Brass urlis, handcrafted pichwai stands, lotus candle holders, and festive puja decor.',
        imageUrl: 'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80',
        displayOrder: 4
      },
      {
        name: 'Wedding & Marriage Decorations',
        slug: 'wedding-decorations',
        description: 'Grand floral backdrops, pellikuthuru decorative sets, and ceremonial backdrop rentals.',
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        displayOrder: 5
      },
      {
        name: 'Handmade Gifts',
        slug: 'handmade-gifts',
        description: 'Personalized resin keepsakes, customized return gift hampers, and artisanal treasures.',
        imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
        displayOrder: 6
      },
      {
        name: 'Customized Products',
        slug: 'customized-products',
        description: 'Bespoke designs crafted exactly according to your dimensions, themes, and personal styles.',
        imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        displayOrder: 7
      }
    ];

    const seededCategories = await Category.insertMany(categoriesData);
    const catMap = {};
    seededCategories.forEach(c => { catMap[c.slug] = c._id; });
    console.log('[Seed] Categories seeded.');

    // 4. Seed Products
    const productsData = [
      {
        name: 'Kundan Temple Bridal Choker Set',
        slug: 'kundan-temple-bridal-choker-set',
        description: 'Stunning handcrafted antique gold-finish choker set studded with uncut kundan stones, green onyx drops, and delicate pearl clusters. Includes matching chandelier earrings and maang tikka. Ideal for weddings, receptions, and traditional festivities.',
        category: catMap['jewellery'],
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
        ],
        price: 4500,
        discountPrice: 3999,
        availabilityType: 'both', // Buy and Rent
        stockQuantity: 6,
        paymentMode: 'both',
        advancePercentage: 20, // 20% advance
        rentalPrice: 1200,
        rentalPeriodDays: 3,
        securityDeposit: 500,
        rentalTerms: 'Handle with care. Return in original velvet presentation box by due date. Dry cleaning strictly prohibited.',
        specifications: [
          { key: 'Material', value: 'Brass alloy with 22k matte gold plating' },
          { key: 'Stones', value: 'Kundan, Pearls, Synthetic Emeralds' },
          { key: 'Closure', value: 'Adjustable dori' },
          { key: 'Weight', value: '185 grams' }
        ],
        tags: ['jewellery', 'choker', 'kundan', 'bridal', 'temple'],
        isFeatured: true,
        isPopular: true
      },
      {
        name: 'Royal Zari Photoshoot Frock (Peach & Gold)',
        slug: 'royal-zari-photoshoot-frock-peach-gold',
        description: 'Luxurious multi-tier tulle and organza baby photoshoot frock adorned with hand-embroidered zari motifs on the bodice. Soft butter-crepe lining ensures comfortable wear for sensitive skin during special milestones.',
        category: catMap['photoshoot-frocks'],
        images: [
          'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80'
        ],
        price: 2800,
        discountPrice: 2499,
        availabilityType: 'both',
        stockQuantity: 4,
        paymentMode: 'advance_only',
        advancePercentage: 30, // 30% advance
        rentalPrice: 750,
        rentalPeriodDays: 3,
        securityDeposit: 0,
        rentalTerms: 'Gentle handling. Return unwashed in clean box provided.',
        specifications: [
          { key: 'Fabric', value: 'Organza & Soft Tulle with Cotton Lining' },
          { key: 'Age Group', value: '6 to 18 Months' },
          { key: 'Color', value: 'Peach & Soft Gold' }
        ],
        tags: ['frock', 'baby', 'photoshoot', 'organza', 'birthday'],
        isFeatured: true,
        isNewArrival: true
      },
      {
        name: 'Traditional Kolu Golu Wooden Doll Set (Dashavatara)',
        slug: 'traditional-kolu-golu-wooden-doll-set-dashavatara',
        description: 'Complete 10-piece Dashavatara deity set traditionally hand-carved in lightweight Kondapalli wood and painted with eco-friendly organic vegetable pigments. A sacred centerpiece for Navratri Golu displays and heritage home altars.',
        category: catMap['doll-sets'],
        images: [
          'https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&fit=crop&w=800&q=80'
        ],
        price: 6500,
        discountPrice: 5800,
        availabilityType: 'buy_only',
        stockQuantity: 3,
        paymentMode: 'both',
        advancePercentage: 10, // 10% advance
        rentalPrice: 0,
        rentalPeriodDays: 3,
        securityDeposit: 0,
        specifications: [
          { key: 'Craft', value: 'Authentic Kondapalli Wood Carving' },
          { key: 'Finish', value: 'Non-toxic organic lacquer' },
          { key: 'Height', value: '8 to 10 inches per doll' }
        ],
        tags: ['dolls', 'golu', 'navratri', 'dashavatara', 'handmade'],
        isFeatured: true,
        isPopular: true
      },
      {
        name: 'Grand Floral Wedding Backdrop & Urli Stand Set',
        slug: 'grand-floral-wedding-backdrop-urli-stand-set',
        description: 'Opulent decorative backdrop arrangement featuring faux marigold swags, brass-finish layered urli stand, and floral fairy illumination pillars. Perfect for Haldi, Mehendi, Pellikuthuru, and intimate home wedding ceremonies.',
        category: catMap['wedding-decorations'],
        images: [
          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
        ],
        price: 24000,
        availabilityType: 'rent_only',
        stockQuantity: 2,
        paymentMode: 'advance_only',
        advancePercentage: 50, // 50% advance
        rentalPrice: 8500,
        rentalPeriodDays: 3,
        securityDeposit: 3000,
        rentalTerms: 'Local Hyderabad pickup/delivery only. Security deposit refunded post return inspection.',
        specifications: [
          { key: 'Backdrop Size', value: '8ft x 8ft' },
          { key: 'Included Items', value: 'Frame, Fabric Drapes, Urli Bowl, 2 Brass Pillars' }
        ],
        tags: ['wedding', 'haldi', 'backdrop', 'decor', 'rental'],
        isFeatured: true
      },
      {
        name: 'Handcrafted Pichwai Brass Diya Stand with Bells',
        slug: 'handcrafted-pichwai-brass-diya-stand-with-bells',
        description: 'Solid brass handcrafted peacock diya stand with hanging bells and engraved pichwai floral motifs. Enhances any festive puja corner or entrance lobby.',
        category: catMap['decorative-items'],
        images: [
          'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80'
        ],
        price: 1850,
        discountPrice: 1650,
        availabilityType: 'buy_only',
        stockQuantity: 8,
        paymentMode: 'full_only',
        advancePercentage: 100,
        specifications: [
          { key: 'Material', value: '100% Solid Brass' },
          { key: 'Height', value: '12 inches' },
          { key: 'Weight', value: '1.2 kg' }
        ],
        tags: ['brass', 'diya', 'puja', 'festive', 'decor'],
        isPopular: true
      },
      {
        name: 'Personalized Resin Keepsake Flower Frame',
        slug: 'personalized-resin-keepsake-flower-frame',
        description: 'Crystal-clear custom epoxy resin frame preserving real dried wedding garland florals, gold foil leafing, and customized couple calligraphy nameplate. An everlasting heirloom keepsake.',
        category: catMap['handmade-gifts'],
        images: [
          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'
        ],
        price: 1999,
        discountPrice: 1699,
        availabilityType: 'buy_only',
        stockQuantity: 12,
        paymentMode: 'advance_only',
        advancePercentage: 50,
        specifications: [
          { key: 'Dimensions', value: '9 x 9 inches square' },
          { key: 'Material', value: 'UV-resistant epoxy resin, preserved florals' }
        ],
        tags: ['resin', 'gifts', 'custom', 'keepsake', 'anniversary'],
        isNewArrival: true
      }
    ];

    const seededProducts = await Product.insertMany(productsData);
    console.log('[Seed] Products seeded.');

    // 5. Seed a Sample Order for Immediate Dashboard Demonstration
    const sampleProduct = seededProducts[0];
    const sampleOrder = await Order.create({
      orderNumber: 'LAV-2026-1001',
      customer: customerUser._id,
      isGuest: false,
      customerDetails: {
        name: 'Priya Sharma',
        phone: '+919876501234',
        email: 'priya.sharma@example.com',
        addressLine1: 'Flat 302, Green View Apartments, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500033'
      },
      orderType: 'purchase',
      items: [{
        product: sampleProduct._id,
        productName: sampleProduct.name,
        productImage: sampleProduct.images[0],
        categoryName: 'Jewellery',
        itemType: 'purchase',
        unitPrice: sampleProduct.effectivePrice,
        quantity: 1,
        subtotal: sampleProduct.effectivePrice,
        paymentMode: sampleProduct.paymentMode,
        advancePercentage: sampleProduct.advancePercentage,
        advanceAmount: Math.round((sampleProduct.effectivePrice * sampleProduct.advancePercentage) / 100),
        remainingAmount: sampleProduct.effectivePrice - Math.round((sampleProduct.effectivePrice * sampleProduct.advancePercentage) / 100)
      }],
      deliveryMethod: 'courier',
      shippingFee: 0,
      totalAmount: sampleProduct.effectivePrice,
      paymentTypeChosen: 'advance',
      amountPaid: Math.round((sampleProduct.effectivePrice * sampleProduct.advancePercentage) / 100),
      balanceAmount: sampleProduct.effectivePrice - Math.round((sampleProduct.effectivePrice * sampleProduct.advancePercentage) / 100),
      paymentStatus: 'partially_paid',
      orderStatus: 'confirmed',
      trackingInfo: {
        courierName: 'DTDC Express',
        trackingNumber: 'DTDC-HYD-98214',
        trackingUrl: 'https://www.dtdc.in/tracking.asp',
        estimatedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
      }
    });

    // Seed Verified Payment for that order
    await Payment.create({
      order: sampleOrder._id,
      customer: customerUser._id,
      paymentType: 'advance',
      amount: sampleOrder.amountPaid,
      amountInPaise: sampleOrder.amountPaid * 100,
      currency: 'INR',
      gateway: 'razorpay',
      razorpayOrderId: 'order_seed_demo_001',
      razorpayPaymentId: 'pay_seed_demo_001',
      razorpaySignature: 'mock_signature',
      status: 'verified',
      verifiedAt: new Date()
    });

    // 6. Seed a Sample Rental Booking
    const rentalProd = seededProducts[1];
    const rentalStart = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const rentalEnd = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    await RentalBooking.create({
      bookingNumber: 'RNT-2026-2001',
      product: rentalProd._id,
      customer: customerUser._id,
      customerDetails: {
        name: 'Priya Sharma',
        phone: '+919876501234',
        email: 'priya.sharma@example.com',
        address: 'Flat 302, Green View Apartments, Jubilee Hills',
        city: 'Hyderabad',
        postalCode: '500033'
      },
      startDate: rentalStart,
      endDate: rentalEnd,
      totalDays: 3,
      dailyRate: 250,
      rentalPrice: 750,
      advancePercentage: 30,
      advancePaid: 225,
      balanceDue: 525,
      status: 'confirmed',
      expectedReturnDate: rentalEnd
    });

    // 7. Seed a Sample Custom Design Request
    await CustomDesignRequest.create({
      requestNumber: 'CUST-2026-3001',
      customer: customerUser._id,
      customerDetails: {
        name: 'Priya Sharma',
        phone: '+919876501234',
        email: 'priya.sharma@example.com'
      },
      title: 'Customized Mango Mala Necklace with Ruby Embellishment',
      description: 'Looking for a traditional South Indian Mango (Maanga) Mala necklace with antique gold finish, paired with synthetic rubies and green beads at the bottom. Looking for 20 inches length.',
      category: 'Custom Jewellery / Gifts',
      budgetRange: '₹5,000 - ₹8,000',
      requiredDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      deliveryMethod: 'courier',
      status: 'quoted',
      quotation: {
        price: 6200,
        advancePercentage: 30,
        advanceAmount: 1860,
        balanceAmount: 4340,
        estimatedDeliveryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        terms: 'Handcrafted customized jewelry. 30% advance required to source ruby beads and cast pendants.',
        quotedAt: new Date(),
        customerResponse: 'pending'
      }
    });

    // 8. Seed Notification for Admin
    await Notification.create({
      recipientRole: 'admin',
      type: 'new_order',
      title: 'Order Confirmed',
      message: `Sample Order #LAV-2026-1001 confirmed with 20% advance received.`,
      link: '/admin/orders',
      isRead: false
    });

    console.log('[Seed] Database seeding completed successfully!');
    console.log(`[Seed] Admin login: lavanyacollections@gmail.com / lavanyacollect`);
    console.log(`[Seed] Customer login: priya.sharma@example.com / Customer@2026!`);

    return true;
  } catch (err) {
    console.error('[Seed Error]:', err);
    throw err;
  }
};

if (require.main === module) {
  seedData()
    .then(async () => {
      await closeDB();
      process.exit(0);
    })
    .catch(() => process.exit(1));
}

module.exports = { seedData };
