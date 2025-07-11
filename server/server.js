const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Connect to database only if MongoDB URI is provided
if (process.env.MONGODB_URI) {
  const connectDB = require('./config/database');
  connectDB();
} else {
  console.log('⚠️ MongoDB URI not found, running without database');
}

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration - Updated to allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',           // Local development
  'http://localhost:5173',           // Vite dev server
  'https://dawwarli.netlify.app',    // Your Netlify deployment
  process.env.FRONTEND_URL           // Environment variable
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.API_WINDOW_MINUTES || 15) * 60 * 1000,
  max: process.env.API_RATE_LIMIT || 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'City Services API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    allowedOrigins: allowedOrigins
  });
});

// API Routes - only load if files exist
try {
  app.use('/api/services', require('./routes/services'));
  console.log('✅ Services routes loaded');
} catch (error) {
  console.log('⚠️ Services routes not found');
}

try {
  app.use('/api/categories', require('./routes/categories'));
  console.log('✅ Categories routes loaded');
} catch (error) {
  console.log('⚠️ Categories routes not found');
}

try {
  app.use('/api/admin', require('./routes/admin'));
  console.log('✅ Admin routes loaded');
} catch (error) {
  console.log('⚠️ Admin routes not found');
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Allowed origins:`, allowedOrigins);
  
  if (!process.env.MONGODB_URI) {
    console.log('');
    console.log('💡 To enable database features:');
    console.log('   1. Set up MongoDB Atlas');
    console.log('   2. Add MONGODB_URI to your .env file');
    console.log('   3. Restart the server');
  }
});

module.exports = app;