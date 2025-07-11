const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET /api/categories - Get all active categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.json({
      success: true,
      count: categories.length,
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

// GET /api/categories/:name - Get category by name
router.get('/:name', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      name: req.params.name.toLowerCase(),
      isActive: true 
    }).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category'
    });
  }
});

module.exports = router;