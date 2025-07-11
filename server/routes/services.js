const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { query } = require('express-validator');

// GET /api/services/nearby?lat=29.9792&lng=30.9754&radius=5000&category=pharmacy
router.get('/nearby', [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  query('radius').optional().isInt({ min: 100, max: 50000 }).withMessage('Radius must be between 100-50000 meters'),
  query('category').optional().isIn(['pharmacy', 'restaurant', 'grocery', 'hospital', 'gas_station', 'bank', 'mall', 'all']),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100')
], serviceController.getNearbyServices);

// GET /api/services/search?q=pharmacy&lat=29.9792&lng=30.9754
router.get('/search', [
  query('q').isLength({ min: 1 }).withMessage('Search query is required'),
  query('lat').optional().isFloat({ min: -90, max: 90 }),
  query('lng').optional().isFloat({ min: -180, max: 180 }),
  query('radius').optional().isInt({ min: 100, max: 50000 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], serviceController.searchServices);

// GET /api/services/category/pharmacy?lat=29.9792&lng=30.9754
router.get('/category/:category', [
  query('lat').optional().isFloat({ min: -90, max: 90 }),
  query('lng').optional().isFloat({ min: -180, max: 180 }),
  query('radius').optional().isInt({ min: 100, max: 50000 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], serviceController.getServicesByCategory);

// GET /api/services/:id - Get single service
router.get('/:id', serviceController.getService);

module.exports = router;