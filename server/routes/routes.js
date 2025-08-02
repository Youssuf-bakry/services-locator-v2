const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const FoodCategory = require('../models/FoodCategory');
const FoodReview = require('../models/FoodReview');

// ==== BUSINESS ROUTES ====

// Get all businesses with filtering
router.get('/businesses', async (req, res) => {
  try {
    const {
      city,           // المدينة
      neighborhood,   // الحي
      businessType,   // نوع النشاط
      cuisineStyle,   // نمط المأكولات
      mainCategory,   // الفئة الأساسية
      dietaryPattern, // النمط الغذائي
      mealTime,       // وقت الوجبة
      minRating,      // أقل تقييم
      delivery,       // يوجد توصيل
      page = 1,       // رقم الصفحة
      limit = 20,     // عدد النتائج
      sortBy = 'ratings.averageRating', // ترتيب حسب
      sortOrder = -1  // ترتيب تنازلي
    } = req.query;

    // Build filter query
    const filter = {
      'status.isVerified': true,
      'status.isOpen': true
    };

    if (city) filter['location.city'] = city;
    if (neighborhood) filter['location.neighborhood'] = neighborhood;
    if (businessType) filter.businessType = businessType;
    if (cuisineStyle) filter['foodCategories.cuisineStyle'] = cuisineStyle;
    if (mainCategory) filter['foodCategories.mainCategories'] = mainCategory;
    if (dietaryPattern) filter['foodCategories.dietaryOptions'] = dietaryPattern;
    if (mealTime) filter['foodCategories.mealTimes'] = mealTime;
    if (minRating) filter['ratings.averageRating'] = { $gte: parseFloat(minRating) };
    if (delivery === 'true') filter['delivery.isAvailable'] = true;

    // Execute query with pagination
    const businesses = await Business.find(filter)
      .select('businessName businessType foodCategories location ratings media contact delivery')
      .sort({ [sortBy]: parseInt(sortOrder) })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Get total count for pagination
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
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الأنشطة التجارية',
      error: error.message
    });
  }
});

// Get business by ID with full details
router.get('/businesses/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate('owner', 'name email')
      .lean();

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'النشاط التجاري غير موجود'
      });
    }

    // Increment view count
    await Business.findByIdAndUpdate(req.params.id, {
      $inc: { 'analytics.views': 1 },
      'analytics.lastViewDate': new Date()
    });

    res.json({
      success: true,
      data: business
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب تفاصيل النشاط',
      error: error.message
    });
  }
});

// Search businesses by location (geospatial)
router.get('/businesses/near/:lng/:lat', async (req, res) => {
  try {
    const { lng, lat } = req.params;
    const { maxDistance = 5000, limit = 20 } = req.query; // 5km default

    const businesses = await Business.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      'status.isVerified': true,
      'status.isOpen': true
    })
    .select('businessName businessType location ratings distance')
    .limit(parseInt(limit))
    .lean();

    res.json({
      success: true,
      data: businesses,
      searchCenter: { lng: parseFloat(lng), lat: parseFloat(lat) },
      maxDistance: parseInt(maxDistance)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث الجغرافي',
      error: error.message
    });
  }
});

// Search businesses by text
router.get('/businesses/search', async (req, res) => {
  try {
    const { q, city, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'مطلوب كلمة البحث'
      });
    }

    const filter = {
      $text: { $search: q },
      'status.isVerified': true,
      'status.isOpen': true
    };

    if (city) filter['location.city'] = city;

    const businesses = await Business.find(filter, {
      score: { $meta: 'textScore' }
    })
    .select('businessName businessType location ratings foodCategories')
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit))
    .lean();

    res.json({
      success: true,
      data: businesses,
      searchQuery: q
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث النصي',
      error: error.message
    });
  }
});

// ==== CATEGORIES ROUTES ====

// Get all food categories
router.get('/categories', async (req, res) => {
  try {
    const { type, parentId } = req.query;

    const filter = { isActive: true };
    if (type) filter.categoryType = type;
    if (parentId) filter.parentCategory = parentId;

    const categories = await FoodCategory.find(filter)
      .sort({ sortOrder: 1, nameAr: 1 })
      .lean();

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الفئات',
      error: error.message
    });
  }
});

// Get category hierarchy
router.get('/categories/hierarchy', async (req, res) => {
  try {
    const mainCategories = await FoodCategory.find({
      categoryType: 'main_category',
      isActive: true
    }).sort({ sortOrder: 1 }).lean();

    const hierarchy = await Promise.all(
      mainCategories.map(async (mainCat) => {
        const subCategories = await FoodCategory.find({
          categoryType: 'sub_category',
          isActive: true
        }).sort({ sortOrder: 1 }).lean();

        return {
          ...mainCat,
          subCategories
        };
      })
    );

    res.json({
      success: true,
      data: hierarchy
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التسلسل الهرمي للفئات',
      error: error.message
    });
  }
});

// ==== REVIEWS ROUTES ====

// Get reviews for a business
router.get('/businesses/:businessId/reviews', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt',
      sortOrder = -1,
      minRating,
      verified = false
    } = req.query;

    const filter = {
      business: businessId,
      status: 'approved'
    };

    if (minRating) filter.overallRating = { $gte: parseInt(minRating) };
    if (verified === 'true') filter['verification.isVerifiedVisit'] = true;

    const reviews = await FoodReview.find(filter)
      .populate('reviewer', 'name avatar')
      .sort({ [sortBy]: parseInt(sortOrder) })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await FoodReview.countDocuments(filter);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المراجعات',
      error: error.message
    });
  }
});

// Create a new review
router.post('/businesses/:businessId/reviews', async (req, res) => {
  try {
    const { businessId } = req.params;
    const reviewData = {
      ...req.body,
      business: businessId,
      reviewer: req.user.id // من middleware المصادقة
    };

    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'النشاط التجاري غير موجود'
      });
    }

    // Check if user already reviewed this business
    const existingReview = await FoodReview.findOne({
      business: businessId,
      reviewer: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'لقد قمت بمراجعة هذا النشاط من قبل'
      });
    }

    const review = new FoodReview(reviewData);
    await review.save();

    // Populate reviewer info for response
    await review.populate('reviewer', 'name avatar');

    res.status(201).json({
      success: true,
      data: review,
      message: 'تم إضافة المراجعة بنجاح'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إضافة المراجعة',
      error: error.message
    });
  }
});

// Vote on review helpfulness
router.post('/reviews/:reviewId/vote', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { helpful } = req.body; // true for helpful, false for not helpful
    const userId = req.user.id;

    const review = await FoodReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'المراجعة غير موجودة'
      });
    }

    // Remove previous vote if exists
    review.interactions.helpfulVotes.users = review.interactions.helpfulVotes.users.filter(
      id => id.toString() !== userId
    );
    review.interactions.notHelpfulVotes.users = review.interactions.notHelpfulVotes.users.filter(
      id => id.toString() !== userId
    );

    // Add new vote
    if (helpful) {
      review.interactions.helpfulVotes.users.push(userId);
      review.interactions.helpfulVotes.count = review.interactions.helpfulVotes.users.length;
    } else {
      review.interactions.notHelpfulVotes.users.push(userId);
      review.interactions.notHelpfulVotes.count = review.interactions.notHelpfulVotes.users.length;
    }

    await review.save();

    res.json({
      success: true,
      message: helpful ? 'تم تسجيل إعجابك بالمراجعة' : 'تم تسجيل عدم إعجابك بالمراجعة'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في التصويت',
      error: error.message
    });
  }
});


module.exports = router;