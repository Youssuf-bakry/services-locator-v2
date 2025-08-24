const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { body, query } = require('express-validator');
const { getServicesValidator } = require('../middleware/validation');

// Import both models
const Business = require('../models/Business');  // Food businesses
const FoodReview = require('../models/FoodReview');  // Reviews


// Add this for testing - at the top after your imports
router.get('/test', (req, res) => {
  res.json({ message: 'Admin routes are working!' });
});
// ========================================
// FOOD BUSINESS ROUTES 
// ========================================

// Validation for creating food businesses
const createBusinessValidation = [
  body('businessName')
    .notEmpty()
    .withMessage('Business name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2-100 characters'),
    
  body('businessType')
    .notEmpty()
    .withMessage('Business type is required')
    .isIn(['مطعم', 'مقهى', 'مخبزة', 'حلويات', 'وجبات سريعة', 'عصائر', 'كافيتيريا', 'بوفيه مفتوح', 'مطبخ منزلي'])
    .withMessage('Invalid business type'),
    
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),
    
  body('location.coordinates.*')
    .isFloat()
    .withMessage('Coordinates must be valid numbers'),
    
  body('location.city')
    .notEmpty()
    .withMessage('City is required'),
    
  body('location.neighborhood')
    .notEmpty()
    .withMessage('Neighborhood is required'),

  body('contact.phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required'),

  // Optional validations
  body('contact.whatsappNumber')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid WhatsApp number'),
    
  body('serviceInfo.paymentMethods')
    .optional()
    .isArray()
    .withMessage('Payment methods must be an array')
];

// POST /api/admin/businesses - Create new food business
router.post('/businesses', async (req, res) => {
  try {
    console.log('📥 Creating food business:', req.body.businessName);
    console.log('📦 Business data:', req.body);
    
    const businessData = {
      ...req.body,
      owner: req.body.owner || '507f1f77bcf86cd799439011' // Default owner for testing
    };
    
    const business = new Business(businessData);
    const savedBusiness = await business.save();
    
    console.log('✅ Food business created:', savedBusiness._id);
    
    res.status(201).json({
      success: true,
      data: savedBusiness,
      message: 'Food business created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating food business:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create food business',
      error: error.message
    });
  }
});

// GET /api/admin/businesses - List food businesses
router.get('/businesses', async (req, res) => {
  try {
    const { page = 1, limit = 20, businessType, city, isVerified, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter
    const filter = {};
    if (businessType && businessType !== 'all') filter.businessType = businessType;
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (isVerified !== undefined) filter['status.isVerified'] = isVerified === 'true';
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const businesses = await Business.find(filter)
      .select('businessName businessType location ratings status createdAt')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();
    
    const total = await Business.countDocuments(filter);
    
    res.json({
      success: true,
      data: businesses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch businesses',
      error: error.message
    });
  }
});

// GET /api/admin/businesses/:id - Get single business
router.get('/businesses/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    res.json({
      success: true,
      data: business
    });
    
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business',
      error: error.message
    });
  }
});

// PUT /api/admin/businesses/:id - Update business
router.put('/businesses/:id', async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    res.json({
      success: true,
      data: business,
      message: 'Business updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update business',
      error: error.message
    });
  }
});

// DELETE /api/admin/businesses/:id - Delete business
router.delete('/businesses/:id', async (req, res) => {
  try {
    const business = await Business.findByIdAndDelete(req.params.id);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Business deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete business',
      error: error.message
    });
  }
});

// GET /api/admin/business-categories - Get food business categories
router.get('/business-categories', async (req, res) => {
  try {
    const businessTypes = [
      { value: 'مطعم', label: 'مطعم - Restaurant', icon: '🍽️' },
      { value: 'مقهى', label: 'مقهى - Cafe', icon: '☕' },
      { value: 'مخبزة', label: 'مخبزة - Bakery', icon: '🥖' },
      { value: 'حلويات', label: 'حلويات - Sweets', icon: '🍰' },
      { value: 'وجبات سريعة', label: 'وجبات سريعة - Fast Food', icon: '🍔' },
      { value: 'عصائر', label: 'عصائر - Juice Bar', icon: '🥤' },
      { value: 'كافيتيريا', label: 'كافيتيريا - Cafeteria', icon: '🍴' },
      { value: 'بوفيه مفتوح', label: 'بوفيه مفتوح - Buffet', icon: '🍽️' },
      { value: 'مطبخ منزلي', label: 'مطبخ منزلي - Home Kitchen', icon: '🏠' }
    ];

    const foodCategories = {
      mainCategories: ['إفطار', 'وجبة رئيسية', 'مشروب', 'حلويات', 'سناك'],
      subCategories: ['مخبوزات', 'لحوم', 'دواجن', 'أرز/عدس', 'ساندوتش', 'ساخن', 'بارد', 'متنوع'],
      cuisineStyles: ['عربي', 'شعبي', 'غربي', 'إيطالي', 'آسيوي', 'مصري', 'لبناني', 'تركي', 'هندي', 'مكسيكي'],
      dietaryOptions: ['عادي', 'صحي', 'نباتي', 'خالي من الجلوتين', 'قليل الدسم', 'كيتو'],
      mealTimes: ['صباح', 'غداء', 'عشاء', 'سناك', 'صباح/سناك', 'غداء/عشاء', 'أي وقت'],
      foodTags: ['حلويات', 'دايت', 'خفيف', 'منبه', 'مشبع', 'سريع', 'مقلي', 'مشويات', 'لفائف', 'طازج', 'منزلي', 'فاخر']
    };

    res.json({
      success: true,
      data: {
        businessTypes,
        foodCategories
      }
    });

  } catch (error) {
    console.error('Error fetching business categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// ========================================
// ORIGINAL SERVICE ROUTES (Keep existing)
// ========================================

// Validation middleware for creating services
const createServiceValidation = [
  body('name')
    .notEmpty()
    .withMessage('Service name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2-100 characters'),
    
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['pharmacy', 'restaurant', 'grocery', 'hospital', 'gas_station', 'bank', 'mall', 'other'])
    .withMessage('Invalid category'),
    
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
    
  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
    
  body('address.full')
    .notEmpty()
    .withMessage('Full address is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Address must be between 5-500 characters'),

  // Optional validations
  body('contact.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
    
  body('contact.phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
    
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0-5'),
    
  body('priceLevel')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Price level must be between 1-4')
];

// GET /api/admin/stats - Enhanced statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalBusinesses,
      totalReviews,
      businessesByType,
      topRatedBusinesses,
      reviewsByRating
    ] = await Promise.all([
      Business.countDocuments({ 'status.isVerified': true }),
      FoodReview.countDocuments({ status: 'approved' }),
      Business.aggregate([
        { $match: { 'status.isVerified': true } },
        { $group: { _id: '$businessType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Business.find({ 'status.isVerified': true })
        .select('businessName businessType ratings')
        .sort({ 'ratings.averageRating': -1 })
        .limit(10)
        .lean(),
      FoodReview.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$overallRating', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalBusinesses,
        totalReviews,
        businessesByType,
        topRatedBusinesses,
        reviewsByRating
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإحصائيات',
      error: error.message
    });
  }
});

// GET /api/admin/services - List services with filtering and pagination
router.get('/services', getServicesValidator, adminController.getServices);

// POST /api/admin/services - Create new service
router.post('/services', createServiceValidation, adminController.createService);

// PUT /api/admin/services/:id - Update service
router.put('/services/:id', [
  body('name').optional().isLength({ min: 2, max: 100 }),
  body('category').optional().isIn(['pharmacy', 'restaurant', 'grocery', 'hospital', 'gas_station', 'bank', 'mall', 'other']),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('rating').optional().isFloat({ min: 0, max: 5 }),
  body('priceLevel').optional().isInt({ min: 1, max: 4 })
], adminController.updateService);

// DELETE /api/admin/services/:id - Delete service
router.delete('/services/:id', adminController.deleteService);

// GET /api/admin/services/:id - Get single service for editing
router.get('/services/:id', async (req, res) => {
  try {
    const Service = require('../models/Service');
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Transform for frontend
    const responseService = {
      ...service.toObject(),
      latitude: service.location.coordinates[1],
      longitude: service.location.coordinates[0]
    };
    
    delete responseService.location;
    delete responseService.__v;

    res.json({
      success: true,
      data: responseService
    });

  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching service'
    });
  }
});

// GET /api/admin/categories - Get all categories for admin dropdowns
router.get('/categories', async (req, res) => {
  try {
    // Return the categories from your Service model enum
    const categories = [
      { value: 'pharmacy', label: 'Pharmacy / صيدلية', icon: '💊' },
      { value: 'restaurant', label: 'Restaurant / مطعم', icon: '🍽️' },
      { value: 'grocery', label: 'Grocery Store / بقالة', icon: '🛒' },
      { value: 'hospital', label: 'Hospital / مستشفى', icon: '🏥' },
      { value: 'gas_station', label: 'Gas Station / محطة وقود', icon: '⛽' },
      { value: 'bank', label: 'Bank / بنك', icon: '🏦' },
      { value: 'mall', label: 'Mall / مركز تجاري', icon: '🏬' },
      { value: 'other', label: 'Other / أخرى', icon: '📍' }
    ];

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// GET /api/admin/bulk - Bulk operations endpoint (for future use)
router.post('/bulk-actions', async (req, res) => {
  try {
    const { action, serviceIds } = req.body;
    const Service = require('../models/Service');

    let result;
    switch (action) {
      case 'activate':
        result = await Service.updateMany(
          { _id: { $in: serviceIds } },
          { status: 'active' }
        );
        break;
      case 'deactivate':
        result = await Service.updateMany(
          { _id: { $in: serviceIds } },
          { status: 'pending' }
        );
        break;
      case 'delete':
        result = await Service.deleteMany({ _id: { $in: serviceIds } });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid bulk action'
        });
    }

    res.json({
      success: true,
      message: `Bulk ${action} completed`,
      affectedCount: result.modifiedCount || result.deletedCount
    });

  } catch (error) {
    console.error('Error in bulk operation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk operation'
    });
  }
});

module.exports = router;