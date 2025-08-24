const mongoose = require('mongoose');

// Universal Service Category Schema - مخطط فئات الخدمات الشامل
const categorySchema = new mongoose.Schema({
  // Category Basic Info - معلومات الفئة الأساسية
  nameAr: { // الاسم بالعربية
    type: String,
    required: true,
    trim: true
  },
  nameEn: { // الاسم بالإنجليزية
    type: String,
    trim: true
  },
  slug: { // رابط مختصر للفئة
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  
  // Category Classification - تصنيف الفئة
  categoryType: {
    type: String,
    enum: [
      'main_category',      // التصنيف الأساسي
      'sub_category',       // التصنيف الفرعي  
      'service_tag',        // وسم خدمة
      'location_tag',       // وسم موقع
      'feature_tag'         // وسم ميزة
    ],
    required: true
  },
  
  // Main Business Type Association - ربط نوع النشاط الأساسي
  mainBusinessType: {
    type: String,
    enum: [
      'الطعام والمشروبات',     // Food & Beverages
      'الخدمات الطبية',        // Medical Services
      'الخدمات المنزلية',      // Home Services
      'الخدمات المِهنية',      // Professional Services
      'المرافق العامة',        // Public Facilities
      'all'                   // متاح لجميع الأنواع
    ],
    default: 'all'
  },
  
  // Parent-Child Relationship - العلاقة الهرمية
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  
  // Display Properties - خصائص العرض
  displayName: {
    ar: { type: String, required: true },
    en: String
  },
  
  description: {
    ar: String,
    en: String
  },
  
  icon: {
    type: String,
    required: true
  },
  
  image: String, // صورة الفئة
  
  color: {
    type: String,
    default: '#2196F3'
  },
  
  // Category Properties - خصائص الفئة
  properties: {
    // For Food Categories
    foodProperties: {
      dietaryType: { // نوع غذائي
        type: String,
        enum: ['عادي', 'صحي', 'نباتي', 'خالي من الجلوتين', 'قليل الدسم', 'كيتو']
      },
      mealTime: { // وقت الوجبة
        type: String,
        enum: ['صباح', 'غداء', 'عشاء', 'سناك', 'صباح/سناك', 'غداء/عشاء', 'أي وقت']
      },
      cuisineStyle: { // نمط الطبخ
        type: String,
        enum: ['عربي', 'شعبي', 'غربي', 'إيطالي', 'آسيوي', 'مصري', 'لبناني', 'تركي', 'هندي', 'مكسيكي']
      },
      preparationMethod: { // طريقة التحضير
        type: String,
        enum: ['مقلي', 'مشويات', 'مطبوخ', 'طازج', 'مخبوز', 'مجمد']
      }
    },
    
    // For Medical Categories
    medicalProperties: {
      specialization: String, // التخصص الطبي
      serviceType: { // نوع الخدمة الطبية
        type: String,
        enum: ['استشارة', 'فحص', 'عملية', 'تحاليل', 'أشعة', 'علاج طبيعي', 'طوارئ']
      },
      urgencyLevel: { // مستوى الإلحاح
        type: String,
        enum: ['عادي', 'عاجل', 'طوارئ']
      },
      ageGroup: { // الفئة العمرية
        type: String,
        enum: ['أطفال', 'بالغين', 'كبار السن', 'جميع الأعمار']
      }
    },
    
    // For Professional Service Categories
    professionalProperties: {
      serviceType: { // نوع الخدمة المهنية
        type: String,
        enum: ['صيانة', 'إصلاح', 'تركيب', 'تنظيف', 'نقل', 'استشارة', 'تصميم', 'إنشاء']
      },
      skillLevel: { // مستوى المهارة المطلوب
        type: String,
        enum: ['مبتدئ', 'متوسط', 'متقدم', 'خبير']
      },
      equipmentRequired: Boolean, // يتطلب معدات
      locationFlexibility: { // مرونة المكان
        type: String,
        enum: ['في الموقع فقط', 'في موقع العميل فقط', 'كلا الموقعين']
      },
      emergencyAvailable: Boolean // متاح للطوارئ
    },
    
    // For Home Service Categories
    homeServiceProperties: {
      roomType: [String], // نوع الغرفة (مطبخ، حمام، صالة، إلخ)
      cleaningType: String, // نوع التنظيف
      maintenanceType: String // نوع الصيانة
    }
  },
  
  // Search and Filtering - البحث والتصفية
  searchKeywords: [String], // كلمات مفتاحية للبحث
  
  relatedCategories: [{ // فئات مرتبطة
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  
  // Category Settings - إعدادات الفئة
  isActive: {
    type: Boolean,
    default: true
  },
  
  isPopular: { // فئة شائعة
    type: Boolean,
    default: false
  },
  
  sortOrder: {
    type: Number,
    default: 0
  },
  
  // Usage Statistics - إحصائيات الاستخدام
  stats: {
    businessCount: { // عدد الأنشطة في هذه الفئة
      type: Number,
      default: 0
    },
    searchCount: { // عدد مرات البحث
      type: Number,
      default: 0
    },
    popularityScore: { // نقاط الشعبية
      type: Number,
      default: 0
    }
  },
  
  // Business Rules - قواعد العمل
  businessRules: {
    requiresLicense: Boolean, // يتطلب ترخيص
    requiresInsurance: Boolean, // يتطلب تأمين
    requiresCertification: Boolean, // يتطلب شهادة
    minimumAge: Number, // الحد الأدنى للعمر
    workingHoursRestrictions: String, // قيود على ساعات العمل
    locationRestrictions: [String] // قيود على المواقع
  },
  
  // SEO Properties - خصائص تحسين محركات البحث
  seo: {
    metaTitle: {
      ar: String,
      en: String
    },
    metaDescription: {
      ar: String,
      en: String
    },
    keywords: [String],
    canonicalUrl: String
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
categorySchema.index({ categoryType: 1, mainBusinessType: 1, isActive: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ nameAr: 'text', 'displayName.ar': 'text', searchKeywords: 'text' });
categorySchema.index({ slug: 1 });
categorySchema.index({ isPopular: -1, 'stats.popularityScore': -1 });
categorySchema.index({ sortOrder: 1 });

// Virtual for full category path
categorySchema.virtual('fullPath').get(function() {
  // This will be populated by the getFullPath method
  return this._fullPath || this.displayName.ar;
});

// Methods - الطرق

// Get all children categories
categorySchema.methods.getChildren = function() {
  return mongoose.model('Category').find({ 
    parentCategory: this._id, 
    isActive: true 
  }).sort({ sortOrder: 1 });
};

// Get full category path
categorySchema.methods.getFullPath = async function() {
  let path = [this.displayName.ar];
  let current = this;
  
  while (current.parentCategory) {
    current = await mongoose.model('Category').findById(current.parentCategory);
    if (current) {
      path.unshift(current.displayName.ar);
    }
  }
  
  this._fullPath = path.join(' > ');
  return this._fullPath;
};

// Get all businesses in this category
categorySchema.methods.getBusinesses = function(limit = 50) {
  const Business = mongoose.model('Business');
  return Business.find({
    $or: [
      { subBusinessType: this.nameAr },
      { mainBusinessType: this.nameAr },
      { 'serviceCategories.generalTags': this.nameAr },
      { 'tags.serviceTypeTags': this.nameAr }
    ],
    'status.isActive': true
  }).limit(limit);
};

// Update popularity score
categorySchema.methods.updatePopularity = async function() {
  const businessCount = await this.getBusinesses(1000).countDocuments();
  this.stats.businessCount = businessCount;
  this.stats.popularityScore = (businessCount * 0.7) + (this.stats.searchCount * 0.3);
  await this.save();
};

// Increment search count
categorySchema.methods.incrementSearchCount = async function() {
  this.stats.searchCount += 1;
  await this.save();
};

// Static Methods - الطرق الثابتة

// Get categories by business type
categorySchema.statics.getByBusinessType = function(businessType, categoryType = null) {
  const query = {
    $or: [
      { mainBusinessType: businessType },
      { mainBusinessType: 'all' }
    ],
    isActive: true
  };
  
  if (categoryType) {
    query.categoryType = categoryType;
  }
  
  return this.find(query).sort({ sortOrder: 1, 'displayName.ar': 1 });
};

// Get popular categories
categorySchema.statics.getPopular = function(limit = 10) {
  return this.find({ 
    isActive: true, 
    isPopular: true 
  })
  .sort({ 'stats.popularityScore': -1, sortOrder: 1 })
  .limit(limit);
};

// Search categories
categorySchema.statics.searchCategories = function(searchTerm, businessType = null) {
  const query = {
    $text: { $search: searchTerm },
    isActive: true
  };
  
  if (businessType) {
    query.$or = [
      { mainBusinessType: businessType },
      { mainBusinessType: 'all' }
    ];
  }
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

// Pre-save middleware
categorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-generate slug if not provided
  if (!this.slug && this.nameAr) {
    this.slug = this.nameAr
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-أ-ي]/g, '');
  }
  
  next();
});

// Post-save middleware to update related statistics
categorySchema.post('save', function(doc) {
  // Update parent category statistics if this is a subcategory
  if (doc.parentCategory) {
    mongoose.model('Category').findById(doc.parentCategory)
      .then(parent => {
        if (parent) {
          parent.updatePopularity();
        }
      });
  }
});

module.exports = mongoose.model('Category', categorySchema);