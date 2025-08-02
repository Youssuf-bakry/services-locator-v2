const mongoose = require('mongoose');

// Food Reviews Schema
const foodReviewSchema = new mongoose.Schema({
  // Review Basic Info - معلومات المراجعة الأساسية
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  
  // Overall Rating - التقييم العام
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Detailed Food Ratings - تقييمات الطعام التفصيلية
  detailedRatings: {
    foodQuality: { // جودة الطعام
      type: Number,
      min: 1,
      max: 5
    },
    taste: { // الطعم
      type: Number,
      min: 1,
      max: 5
    },
    presentation: { // التقديم
      type: Number,
      min: 1,
      max: 5
    },
    portionSize: { // حجم الوجبة
      type: Number,
      min: 1,
      max: 5
    },
    valueForMoney: { // قيمة مقابل السعر
      type: Number,
      min: 1,
      max: 5
    },
    serviceSpeed: { // سرعة الخدمة
      type: Number,
      min: 1,
      max: 5
    },
    staffFriendliness: { // لطف الموظفين
      type: Number,
      min: 1,
      max: 5
    },
    cleanliness: { // النظافة
      type: Number,
      min: 1,
      max: 5
    },
    ambiance: { // الأجواء
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Review Content - محتوى المراجعة
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Items Reviewed - العناصر المراجعة
  reviewedItems: [{
    itemName: { // اسم الطبق
      type: String,
      required: true
    },
    itemRating: { // تقييم الطبق
      type: Number,
      min: 1,
      max: 5
    },
    itemPrice: Number, // سعر الطبق
    itemCategory: { // فئة الطبق
      mainCategory: String,
      subCategory: String
    },
    itemNotes: String, // ملاحظات على الطبق
    recommendItem: { // هل تنصح بالطبق
      type: Boolean,
      default: true
    }
  }],
  
  // Visit Information - معلومات الزيارة
  visitInfo: {
    visitDate: { // تاريخ الزيارة
      type: Date,
      required: true
    },
    visitType: { // نوع الزيارة
      type: String,
      enum: ['dine_in', 'takeaway', 'delivery'],
      required: true
    },
    mealTime: { // وقت الوجبة
      type: String,
      enum: ['صباح', 'غداء', 'عشاء', 'سناك', 'أي وقت']
    },
    groupSize: { // عدد الأشخاص
      type: Number,
      min: 1,
      default: 1
    },
    totalBill: Number, // إجمالي الفاتورة
    waitTime: Number, // وقت الانتظار بالدقائق
    wasReservation: { // هل كان حجز مسبق
      type: Boolean,
      default: false
    }
  },
  
  // Review Media - وسائط المراجعة
  media: {
    images: [String], // صور الطعام
    videos: [String] // فيديوهات
  },
  
  // Review Categories - فئات المراجعة
  reviewCategories: {
    cuisineStyle: { // نمط المأكولات المُراجع
      type: String,
      enum: ['عربي', 'شعبي', 'غربي', 'إيطالي', 'آسيوي', 'مصري', 'لبناني', 'تركي', 'هندي', 'مكسيكي']
    },
    dietaryPattern: { // النمط الغذائي المُراجع
      type: String,
      enum: ['عادي', 'صحي', 'نباتي', 'خالي من الجلوتين', 'قليل الدسم', 'كيتو']
    },
    foodTags: [{ // وسوم الطعام المُراجع
      type: String,
      enum: ['حلويات', 'دايت', 'خفيف', 'منبه', 'مشبع', 'سريع', 'مقلي', 'مشويات', 'لفائف', 'طازج', 'منزلي', 'فاخر']
    }]
  },
  
  // Reviewer Preferences - تفضيلات المراجع
  reviewerPreferences: {
    preferredCuisine: [String], // المأكولات المفضلة
    dietaryRestrictions: [String], // القيود الغذائية
    spiceLevel: { // مستوى الحرارة المفضل
      type: String,
      enum: ['خفيف', 'متوسط', 'حار', 'حار جداً']
    },
    budgetRange: { // النطاق السعري المفضل
      type: String,
      enum: ['اقتصادي', 'متوسط', 'مرتفع', 'فاخر']
    }
  },
  
  // Review Status - حالة المراجعة
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  
  // Verification - التحقق
  verification: {
    isVerifiedVisit: { // زيارة محققة
      type: Boolean,
      default: false
    },
    verificationMethod: { // طريقة التحقق
      type: String,
      enum: ['receipt', 'location', 'photo', 'manual']
    },
    receiptImage: String // صورة الفاتورة
  },
  
  // Interaction Data - بيانات التفاعل
  interactions: {
    helpfulVotes: {
      count: {
        type: Number,
        default: 0
      },
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    notHelpfulVotes: {
      count: {
        type: Number,
        default: 0
      },
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  
  // Business Response - رد صاحب النشاط
  businessResponse: {
    content: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isOwnerResponse: {
      type: Boolean,
      default: true
    }
  },
  
  // Review Analytics - تحليلات المراجعة
  analytics: {
    helpfulnessScore: { // درجة الفائدة
      type: Number,
      default: 0
    },
    influenceScore: { // درجة التأثير
      type: Number,
      default: 0
    },
    qualityScore: { // درجة الجودة
      type: Number,
      default: 0
    }
  },
  
  // Moderation - الإشراف
  moderation: {
    flagReasons: [{
      reason: {
        type: String,
        enum: ['spam', 'inappropriate', 'fake', 'offensive', 'other']
      },
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reportedAt: Date
    }],
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    moderationNotes: String
  },
  
  // Language and Localization - اللغة والترجمة
  language: {
    type: String,
    enum: ['ar', 'en'],
    default: 'ar'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
foodReviewSchema.index({ business: 1, createdAt: -1 });
foodReviewSchema.index({ reviewer: 1, createdAt: -1 });
foodReviewSchema.index({ overallRating: -1 });
foodReviewSchema.index({ status: 1 });
foodReviewSchema.index({ business: 1, status: 1, overallRating: -1 });
foodReviewSchema.index({ 'visitInfo.visitDate': -1 });
foodReviewSchema.index({ 'reviewCategories.cuisineStyle': 1 });
foodReviewSchema.index({ 'verification.isVerifiedVisit': 1 });

// Compound indexes for complex queries
foodReviewSchema.index({ 
  business: 1, 
  status: 1, 
  'visitInfo.visitDate': -1 
});

foodReviewSchema.index({
  'reviewCategories.cuisineStyle': 1,
  overallRating: -1,
  status: 1
});

// Methods - الطرق
foodReviewSchema.methods.calculateAverageDetailedRating = function() {
  const ratings = this.detailedRatings;
  const validRatings = Object.values(ratings).filter(r => r && r > 0);
  
  if (validRatings.length === 0) return this.overallRating;
  
  const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / validRatings.length) * 10) / 10;
};

foodReviewSchema.methods.calculateHelpfulnessScore = function() {
  const totalVotes = this.interactions.helpfulVotes.count + this.interactions.notHelpfulVotes.count;
  
  if (totalVotes === 0) return 0;
  
  return Math.round((this.interactions.helpfulVotes.count / totalVotes) * 100);
};

foodReviewSchema.methods.isHelpfulToUser = function(userId) {
  return this.interactions.helpfulVotes.users.includes(userId);
};

// Pre-save middleware
foodReviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate helpfulness score
  this.analytics.helpfulnessScore = this.calculateHelpfulnessScore();
  
  // Calculate quality score based on content length and details
  let qualityScore = 0;
  
  if (this.content.length > 50) qualityScore += 20;
  if (this.content.length > 200) qualityScore += 20;
  if (this.reviewedItems.length > 0) qualityScore += 20;
  if (this.media.images.length > 0) qualityScore += 20;
  if (Object.keys(this.detailedRatings).some(key => this.detailedRatings[key] > 0)) qualityScore += 20;
  
  this.analytics.qualityScore = qualityScore;
  
  next();
});

// Update business rating when review is saved or updated
foodReviewSchema.post('save', async function() {
  if (this.status === 'approved') {
    const Business = mongoose.model('Business');
    const business = await Business.findById(this.business);
    
    if (business) {
      await business.updateRating();
    }
  }
});

// Update business rating when review is deleted
foodReviewSchema.post('remove', async function() {
  const Business = mongoose.model('Business');
  const business = await Business.findById(this.business);
  
  if (business) {
    await business.updateRating();
  }
});

module.exports = mongoose.model('FoodReview', foodReviewSchema);