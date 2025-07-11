const express = require('express');
const router = express.Router();

// GET /api/admin/stats - Basic stats endpoint
router.get('/stats', async (req, res) => {
  try {
    // For now, return mock stats until we have MongoDB working
    const stats = {
      overview: {
        totalServices: 3,
        activeServices: 3,
        pendingServices: 0,
        totalCategories: 7
      },
      servicesByCategory: [
        { _id: 'pharmacy', count: 1 },
        { _id: 'restaurant', count: 1 },
        { _id: 'grocery', count: 1 }
      ]
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// GET /api/admin/services - List services for admin panel
router.get('/services', async (req, res) => {
  try {
    // Mock data for now
    const services = [
      {
        _id: '1',
        name: 'صيدلية العزبي - 6 أكتوبر',
        category: 'pharmacy',
        status: 'active',
        verified: true,
        latitude: 29.9792,
        longitude: 30.9754,
        createdAt: new Date()
      }
    ];

    res.json({
      success: true,
      count: services.length,
      total: services.length,
      page: 1,
      pages: 1,
      data: services
    });

  } catch (error) {
    console.error('Error fetching admin services:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching services'
    });
  }
});

module.exports = router;