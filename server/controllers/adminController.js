const Service = require('../models/Service');
const { validationResult } = require('express-validator');

// POST /api/admin/services - Create a new service
exports.createService = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    console.log('📝 Creating new service:', req.body.name);

    // Extract data from request body
    const {
      name,
      category,
      subcategory,
      description,
      latitude, // Frontend sends separate lat/lng
      longitude,
      address,
      contact,
      hours,
      specialHours,
      is24Hours,
      rating,
      reviewCount,
      priceLevel,
      features,
      paymentMethods,
      languages,
      images,
      verified = false,
      status = 'active'
    } = req.body;

    // Validate required fields
    if (!name || !category || !latitude || !longitude || !address?.full) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, category, latitude, longitude, and address.full are required'
      });
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    // Create service data with proper GeoJSON format
    const serviceData = {
      name: name.trim(),
      category,
      subcategory: subcategory?.trim(),
      description: description?.trim(),
      
      // MongoDB requires GeoJSON format: [longitude, latitude]
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      
      address: {
        full: address.full.trim(),
        street: address.street?.trim(),
        district: address.district?.trim(),
        city: address.city?.trim(),
        governorate: address.governorate?.trim(),
        postalCode: address.postalCode?.trim(),
        country: address.country?.trim() || 'Saudi Arabia'
      },
      
      contact: contact || {},
      hours: hours || {},
      specialHours: specialHours || [],
      is24Hours: Boolean(is24Hours),
      rating: rating ? parseFloat(rating) : 0,
      reviewCount: reviewCount ? parseInt(reviewCount) : 0,
      priceLevel: priceLevel ? parseInt(priceLevel) : 2,
      features: Array.isArray(features) ? features : [],
      paymentMethods: Array.isArray(paymentMethods) ? paymentMethods : [],
      languages: Array.isArray(languages) ? languages : ['arabic', 'english'],
      images: Array.isArray(images) ? images : [],
      verified: Boolean(verified),
      status,
      source: 'admin_added',
      createdBy: req.user?.id || null // If you have authentication
    };

    // Create and save the service
    const service = new Service(serviceData);
    const savedService = await service.save();

    console.log('✅ Service created successfully:', savedService._id);

    // Transform the response to match your frontend format
    const responseService = {
      ...savedService.toObject(),
      latitude: savedService.location.coordinates[1],
      longitude: savedService.location.coordinates[0]
    };
    
    // Clean up internal fields
    delete responseService.location;
    delete responseService.__v;

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: responseService
    });

  } catch (error) {
    console.error('❌ Error creating service:', error);

    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A service with this information already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET /api/admin/services - List services for admin panel (Enhanced)
exports.getServices = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = 'all', 
      category = 'all',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.full': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Execute query
    const [services, total] = await Promise.all([
      Service.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Service.countDocuments(query)
    ]);

    // Transform services for frontend
    const transformedServices = services.map(service => ({
      ...service,
      latitude: service.location.coordinates[1],
      longitude: service.location.coordinates[0]
    }));

    // Clean up internal fields
    transformedServices.forEach(service => {
      delete service.location;
      delete service.__v;
    });

    res.json({
      success: true,
      count: transformedServices.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: transformedServices
    });

  } catch (error) {
    console.error('Error fetching admin services:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching services'
    });
  }
};

// GET /api/admin/stats - Enhanced stats endpoint
exports.getStats = async (req, res) => {
  try {
    // Get basic counts
    const [
      totalServices,
      activeServices,
      pendingServices,
      servicesByCategory
    ] = await Promise.all([
      Service.countDocuments(),
      Service.countDocuments({ status: 'active' }),
      Service.countDocuments({ status: 'pending' }),
      Service.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const stats = {
      overview: {
        totalServices,
        activeServices,
        pendingServices,
        suspendedServices: totalServices - activeServices - pendingServices,
        totalCategories: servicesByCategory.length
      },
      servicesByCategory,
      recentlyAdded: await Service.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name category createdAt')
        .lean()
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
};

// PUT /api/admin/services/:id - Update service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle coordinate updates
    if (updateData.latitude && updateData.longitude) {
      const lat = parseFloat(updateData.latitude);
      const lng = parseFloat(updateData.longitude);
      
      updateData.location = {
        type: 'Point',
        coordinates: [lng, lat]
      };
      
      delete updateData.latitude;
      delete updateData.longitude;
    }

    const service = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Transform response
    const responseService = {
      ...service.toObject(),
      latitude: service.location.coordinates[1],
      longitude: service.location.coordinates[0]
    };
    
    delete responseService.location;
    delete responseService.__v;

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: responseService
    });

  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating service'
    });
  }
};

// DELETE /api/admin/services/:id - Delete service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting service'
    });
  }
};

module.exports = exports;