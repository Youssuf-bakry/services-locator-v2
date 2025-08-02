const express = require('express');
const router = express.Router();
const Business = require('../models/Business');

// CREATE business endpoint
router.post('/businesses', async (req, res) => {
  try {
    console.log('📥 Received business data:', req.body);
    
    const businessData = {
      ...req.body,
      owner: req.body.owner || '507f1f77bcf86cd799439011' // Default owner ID for testing
    };
    
    const business = new Business(businessData);
    const savedBusiness = await business.save();
    
    console.log('✅ Business created:', savedBusiness._id);
    
    res.status(201).json({
      success: true,
      data: savedBusiness,
      message: 'Business created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating business:', error);
    
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
      message: 'Failed to create business',
      error: error.message
    });
  }
});

// GET all businesses
router.get('/businesses', async (req, res) => {
  try {
    const businesses = await Business.find({})
      .select('businessName businessType location ratings')
      .limit(20);
    
    res.json({
      success: true,
      data: businesses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch businesses',
      error: error.message
    });
  }
});

// GET business by ID
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business',
      error: error.message
    });
  }
});

module.exports = router;