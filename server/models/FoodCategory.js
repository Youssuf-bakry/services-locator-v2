const mongoose = require('mongoose');

// Food Categories Schema based on your classification
const foodCategorySchema = new mongoose.Schema({
  // Category Basic Info - معلومات الفئة الأساسية
  nameAr: { // الاسم بالعربية
    type: String,
    required: true,
    trim: true
  },
  nameEn: { // الاسم بالإنجليزية (optional)
    type: String,
    trim: true
  },
  slug: { // رابط مختصر للفئة
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  
  // Category Type - نوع الفئة
  categoryType: {
    type: String,
    enum: [
      'main_category',    // التصنيف الأساسي
      'sub_category',     // التصنيف الفرعي  
      'dietary_pattern',  // نمط غذائي
      'meal_time',        // وقت الوجبة
      'tag'              // وسم إضافي
    ],
    required: true
  },
  
  // Parent-Child Relationship - العلاقة الهرمية
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodCategory',
    default: null
  },
  
  // Category Classification - تصنيف الفئة
  mainCategory: { // التصنيف الأساسي
    type: String,
    enum: [
      'إفطار',           // Breakfast
      'وجبة رئيسية',     // Main meal
      'مشروب',           // Beverage
      'نمط غذائي',       // Dietary pattern
      'حلويات',          // Desserts
      'سناك'             // Snacks
    ]
  },
  
  subCategory: { // التصنيف الفرعي
    type: String,
    enum: [
      'مخبوزات',         // Baked goods
      'لحوم',            // Meat
      'دواجن',           // Poultry
      'أرز/عدس',         // Rice/Lentils
      'ساندوتش',         // Sandwich
      'ساخن',            // Hot
      'بارد',            // Cold
      'متنوع'            // Mixed
    ]
  },
  
  dietaryPattern: { // نمط غذائي
    type: String,
    enum: [
      'عادي',            // Regular
      'صحي',             // Healthy
      'نباتي',           // Vegetarian
      'خالي من الجلوتين', // Gluten-free
      'قليل الدسم',       // Low-fat
      'كيتو'             // Keto
    ]
  },
  
  mealTime: { // وقت الوجبة
    type: String,
    enum: [
      'صباح',            // Morning
      'غداء',            // Lunch
      'عشاء',            // Dinner
      'سناك',            // Snack
      'صباح/سناك',       // Morning/Snack
      'غداء/عشاء',       // Lunch/Dinner
      'أي وقت'           // Anytime
    ]
  },
  
  // Display Properties - خصائص العرض
  description: String, // وصف الفئة
  icon: String,        // أيقونة الفئة
  image: String,       // صورة الفئة
  color: {             // لون الفئة
    type: String,
    default: '#2196F3'
  },
  
  // Category Settings - إعدادات الفئة
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  
  // Statistics - الإحصائيات
  itemCount: { // عدد العناصر في هذه الفئة
    type: Number,
    default: 0
  },
  
  // Additional Tags - الوسوم الإضافية
  additionalTags: [{
    type: String,
    enum: [
      'حلويات',          // Sweets
      'غربي',            // Western
      'عربي',            // Arabic
      'شعبي',            // Popular/Traditional
      'مصري',            // Egyptian
      'إيطالي',          // Italian
      'آسيوي',           // Asian
      'دايت',            // Diet
      'خفيف',            // Light
      'منبه',            // Stimulant
      'مشبع',            // Filling
      'سريع',            // Fast
      'مقلي',            // Fried
      'مشويات',          // Grilled
      'لفائف'            // Wraps
    ]
  }],
  
  // SEO - تحسين محركات البحث
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  
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
foodCategorySchema.index({ categoryType: 1, isActive: 1 });
foodCategorySchema.index({ mainCategory: 1, subCategory: 1 });
foodCategorySchema.index({ parentCategory: 1 });
foodCategorySchema.index({ nameAr: 'text' });
foodCategorySchema.index({ slug: 1 });

// Methods - الطرق
foodCategorySchema.methods.getChildren = function() {
  return mongoose.model('FoodCategory').find({ 
    parentCategory: this._id, 
    isActive: true 
  }).sort({ sortOrder: 1 });
};

foodCategorySchema.methods.getFullPath = async function() {
  let path = [this.nameAr];
  let current = this;
  
  while (current.parentCategory) {
    current = await mongoose.model('FoodCategory').findById(current.parentCategory);
    if (current) {
      path.unshift(current.nameAr);
    }
  }
  
  return path.join(' > ');
};

// Pre-save middleware
foodCategorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FoodCategory', foodCategorySchema);