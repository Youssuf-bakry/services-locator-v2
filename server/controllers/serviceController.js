const Service = require('../models/Service');

// GET /api/services/nearby - Get services near a location
exports.getNearbyServices = async (req, res) => {
  try {
    const { lat, lng, radius = 5000, category, limit = 50 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const query = {
      status: 'active',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    };

    // Add category filter if specified
    if (category && category !== 'all') {
      query.category = category;
    }

    const services = await Service.find(query)
      .limit(parseInt(limit))
      .lean();

    // Transform for API response and add distance
    const transformedServices = services.map(service => {
      const transformed = {
        ...service,
        latitude: service.location.coordinates[1],
        longitude: service.location.coordinates[0],
        // Calculate distance
        distance: calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          service.location.coordinates[1],
          service.location.coordinates[0]
        )
      };
      
      delete transformed.location;
      delete transformed.__v;
      
      return transformed;
    });

    res.json({
      success: true,
      count: transformedServices.length,
      data: transformedServices
    });

  } catch (error) {
    console.error('Error fetching nearby services:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching services'
    });
  }
};

// GET /api/services/search - Text search services
exports.searchServices = async (req, res) => {
  try {
    const { q, lat, lng, radius = 10000, limit = 50 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    let query = {
      status: 'active',
      $text: { $search: q }
    };

    // Add location filter if coordinates provided
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    const services = await Service.find(query)
      .limit(parseInt(limit))
      .lean();

    // Transform for API response
    const transformedServices = services.map(service => {
      const transformed = {
        ...service,
        latitude: service.location.coordinates[1],
        longitude: service.location.coordinates[0]
      };
      
      // Add distance if location provided
      if (lat && lng) {
        transformed.distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          service.location.coordinates[1],
          service.location.coordinates[0]
        );
      }
      
      delete transformed.location;
      delete transformed.__v;
      
      return transformed;
    });

    res.json({
      success: true,
      count: transformedServices.length,
      query: q,
      data: transformedServices
    });

  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching services'
    });
  }
};

// GET /api/services/category/:category - Get services by category
exports.getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { lat, lng, radius = 10000, limit = 50 } = req.query;

    let query = {
      status: 'active',
      category: category
    };

    // Add location filter if coordinates provided
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    const services = await Service.find(query)
      .limit(parseInt(limit))
      .lean();

    // Transform for API response
    const transformedServices = services.map(service => {
      const transformed = {
        ...service,
        latitude: service.location.coordinates[1],
        longitude: service.location.coordinates[0]
      };
      
      // Add distance if location provided
      if (lat && lng) {
        transformed.distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          service.location.coordinates[1],
          service.location.coordinates[0]
        );
      }
      
      delete transformed.location;
      delete transformed.__v;
      
      return transformed;
    });

    res.json({
      success: true,
      count: transformedServices.length,
      category: category,
      data: transformedServices
    });

  } catch (error) {
    console.error('Error fetching services by category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching services'
    });
  }
};

// GET /api/services/:id - Get single service
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).lean();
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Transform for API response
    const transformed = {
      ...service,
      latitude: service.location.coordinates[1],
      longitude: service.location.coordinates[0]
    };
    
    delete transformed.location;
    delete transformed.__v;

    res.json({
      success: true,
      data: transformed
    });

  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching service'
    });
  }
};

// Helper function to calculate distance
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = exports;