const {body, query } = require('express-validator');

const getServicesValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('status').optional().isIn(['all', 'active', 'pending', 'closed', 'suspended']),
  query('category').optional().isIn([
    'all', 'pharmacy', 'restaurant', 'grocery', 'hospital',
    'gas_station', 'bank', 'mall', 'other'
  ]),
  query('sortBy').optional().isIn(['name', 'category', 'createdAt', 'rating', 'status']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
];

const getbusinessesValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('status').optional().isIn(['all', 'active', 'pending', 'closed', 'suspended']),
  query('category').optional().isIn([
    'all', 'pharmacy', 'restaurant', 'grocery', 'hospital',
    'gas_station', 'bank', 'mall', 'other'
  ]),
  query('sortBy').optional().isIn(['name', 'category', 'createdAt', 'rating', 'status']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
];

module.exports = {
  getServicesValidator,getbusinessesValidator
};
