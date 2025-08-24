const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const businessRoutes = require('./routes/routes');
require('dotenv').config();

const app = express();
app.use(morgan('dev'));
// Connect to database only if MongoDB URI is provided
if (process.env.MONGODB_URI) {
  const connectDB = require('./config/database');
  connectDB();
} else {
  console.log('⚠️ MongoDB URI not found, running without database');
}

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',           // Local development
  'http://localhost:5173',           // Vite dev server
  'https://dawwarli.netlify.app',    // Your Netlify deployment
  process.env.FRONTEND_URL,          // Environment variable
  /^https:\/\/.*\.netlify\.app$/,    // All Netlify preview URLs
  /^https:\/\/.*\.ngrok\.io$/        // Allow ngrok for testing
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check exact matches
    if (allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    })) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// Rate limiting - more restrictive in production
const limiter = rateLimit({
  windowMs: (process.env.API_WINDOW_MINUTES || 15) * 60 * 1000,
  max: process.env.API_RATE_LIMIT || 200, // Increased for mobile testing
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint - important for Render
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Dawwarli API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    database: process.env.MONGODB_URI ? 'Connected' : 'Not configured',
    allowedOrigins: allowedOrigins.length
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Dawwarli City Services API 🇸🇦',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      services: '/api/services',
      categories: '/api/categories',
      admin: '/api/admin'
    },
    features: [
      'October City Location Support',
      'Arabic Search',
      'Mobile Optimized',
      'Real-time Location Detection'
    ]
  });
});

// API Routes
try {
  app.use('/api/services', require('./routes/services'));
  console.log('✅ Services routes loaded');
} catch (error) {
  console.log('⚠️ Services routes not found:', error.message);
}

try {
  app.use('/api/categories', require('./routes/categories'));
  console.log('✅ Categories routes loaded');
} catch (error) {
  console.log('⚠️ Categories routes not found:', error.message);
}

try {
  app.use('/api/admin', require('./routes/admin'));
  console.log('✅ Admin routes loaded');
} catch (error) {
  console.log('⚠️ Admin routes not found:', error.message);
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(isDevelopment && { 
      stack: error.stack,
      details: error 
    })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Dawwarli Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 CORS origins: ${allowedOrigins.length} configured`);
  
  if (!process.env.MONGODB_URI) {
    console.log('⚠️ MongoDB URI missing - set MONGODB_URI environment variable');
  }
});

module.exports = app;