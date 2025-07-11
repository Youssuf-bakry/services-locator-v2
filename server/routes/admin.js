const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { body, query } = require('express-validator');

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
router.get('/stats', adminController.getStats);

// GET /api/admin/services - List services with filtering and pagination
router.get('/services', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('status').optional().isIn(['all', 'active', 'pending', 'closed', 'suspended']),
  query('category').optional().isIn(['all', 'pharmacy', 'restaurant', 'grocery', 'hospital', 'gas_station', 'bank', 'mall', 'other']),
  query('sortBy').optional().isIn(['name', 'category', 'createdAt', 'rating', 'status']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], adminController.getServices);

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