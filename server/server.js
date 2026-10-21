require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const customRequestRoutes = require('./routes/customRequestRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const businessSettingsRoutes = require('./routes/businessSettingsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev/demo environments
    }
  },
  credentials: true
}));

// Body parser with rawBody capture for Razorpay webhook signature verification
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging in development
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static upload files directory
const uploadDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));

// Rate limiters for authentication endpoints to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/admin-login', authLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Lavanya Collections API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/custom-requests', customRequestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', businessSettingsRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve client static bundle if built (Production / Render deployment)
const clientDistPath = path.join(__dirname, '../client/dist');
const fs = require('fs');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized error handler
app.use(errorHandler);

const { seedData } = require('./seed/seed');
const Product = require('./models/Product');

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed initial catalog if database is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[Server] Database is empty. Seeding initial boutique catalog & admin...');
      await seedData();
    }

    serverInstance = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🌸 LAVANYA COLLECTIONS API SERVER RUNNING`);
      console.log(`🚀 Port: ${PORT}`);
      console.log(`🌐 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });

    return serverInstance;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Start when not required by test runner
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
