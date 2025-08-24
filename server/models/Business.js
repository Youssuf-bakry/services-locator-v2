const mongoose = require('mongoose');

// Business Schema - مخطط النشاط التجاري (All Service Types)
const businessSchema = new mongoose.Schema({
  // Basic Business Info - بيانات النشاط الأساسية
  businessName: { // اسم النشاط
    type: String,
    required: true,
    trim: true
  },
  businessDescription: { // وصف النشاط
    type: String,
    trim: true
  },
  
  // Business Classification - تصنيف النشاط
  mainBusinessType: { // نوع النشاط الرئيسي
    type: String,
    required: true,
    enum: [
      'الطعام والمشروبات',     // Food & Beverages
      'الخدمات الطبية',        // Medical Services
      'الخدمات المنزلية',      // Home Services
      'الخدمات المِهنية',      // Professional Services
      'المرافق العامة'         // Public Facilities
    ]
  },
  subBusinessType: { // نوع النشاط الفرعي
    type: String,
    required: true
  },
  entityType: { // نوع الكيان
    type: String,
    enum: ['shop', 'individual', 'company', 'clinic', 'facility'],
    default: 'shop'
  },

  // Service Categories - فئات الخدمة
  serviceCategories: {
    // For Food & Beverages
    foodCategories: {
      mainCategories: [String],     // إفطار، وجبة رئيسية، مشروب، حلويات، سناك
      subCategories: [String],      // مخبوزات، لحوم، دواجن، أرز/عدس، ساندوتش، ساخن، بارد
      dietaryOptions: [String],     // عادي، صحي، نباتي، خالي من الجلوتين، قليل الدسم، كيتو
      mealTimes: [String],          // صباح، غداء، عشاء، سناك، أي وقت
      cuisineStyle: [String],       // عربي، شعبي، غربي، إيطالي، آسيوي، مصري
      foodTags: [String]            // حلويات، دايت، خفيف، مشويات، مقلي، طازج
    },
    
    // For Medical Services
    medicalCategories: {
      specializations: [String],    // أسنان، أطفال، نساء وولادة، عظام، قلب
      serviceTypes: [String],       // استشارة، فحص، عملية، تحاليل، أشعة
      insuranceAccepted: [String],  // التأمين المقبول
      emergencyServices: Boolean    // خدمات طوارئ
    },
    
    // For Professional Services
    professionalCategories: {
      serviceType: [String],        // صيانة، إصلاح، تركيب، تنظيف، نقل
      skills: [String],             // المهارات المطلوبة
      tools: [String],              // الأدوات المستخدمة
      certification: [String]      // الشهادات والتراخيص
    },
    
    // Generic service tags
    generalTags: [String]           // وسوم عامة تنطبق على جميع الأنواع
  },

  // Location Data - بيانات الموقع
  location: {
    province: { // اسم المحافظة
      type: String,
      required: true
    },
    city: { // اسم المدينة
      type: String,
      required: true
    },
    neighborhood: { // اسم الحي
      type: String,
      required: true
    },
    street: { // اسم الشارع
      type: String
    },
    mallName: { // اسم المول
      type: String
    },
    shopNumber: { // رقم المحل
      type: String
    },
    buildingNumber: { // رقم المبنى
      type: String
    },
    floor: { // الطابق
      type: String
    },
    coordinates: { // إحداثيات الموقع
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },

  // Contact Information - بيانات التواصل
  contact: {
    phoneNumber: { // رقم الاتصال
      type: String,
      required: true
    },
    whatsappNumber: { // رقم الوتساب
      type: String
    },
    deliveryNumber: { // رقم الدليفري
      type: String
    },
    emergencyNumber: { // رقم الطوارئ
      type: String
    },
    website: { // رابط الموقع الإلكتروني
      type: String
    },
    email: { // البريد الإلكتروني
      type: String
    },
    socialMediaLinks: [{ // روابط وسائل التواصل
      platform: String,
      url: String
    }]
  },

  // Operating Hours - ساعات العمل
  operatingHours: {
    workingDays: [{ // أيام العمل
      day: {
        type: String,
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      openTime: String, // ساعة الفتح
      closeTime: String, // ساعة الإغلاق
      isOpen: { // هل يعمل في هذا اليوم
        type: Boolean,
        default: true
      }
    }],
    holidayDays: [String], // أيام العطلة
    emergencyHours: { // ساعات الطوارئ (للخدمات الطبية والطوارئ)
      available24_7: Boolean,
      emergencyStart: String,
      emergencyEnd: String
    },
    appointmentOnly: { // بالمواعيد فقط
      type: Boolean,
      default: false
    }
  },

  // Service Information - معلومات الخدمة
  serviceInfo: {
    serviceType: { // نوع الخدمة العام
      type: String,
      required: false
    },
    serviceTags: [String], // وسوم الخدمات
    
    // For Food Services
    diningType: { // صالة ولا سفري
      type: String,
      enum: ['dine_in', 'takeaway', 'both', 'delivery_only'],
      default: 'both'
    },
    diningRoomType: String, // نوع الصالة
    
    // For Medical Services
    consultationType: { // نوع الاستشارة
      type: String,
      enum: ['in_person', 'online', 'both', 'emergency']
    },
    
    // For Professional Services
    serviceLocation: { // مكان تقديم الخدمة
      type: String,
      enum: ['on_site', 'customer_location', 'both']
    },
    
    // Payment Methods
    paymentMethods: [{ // طرق الدفع المتاحة
      type: String,
      enum: [
        'cash', 'card', 'digital_wallet', 'bank_transfer',
        'mada', 'visa', 'mastercard', 'apple_pay', 'google_pay',
        'stc_pay', 'insurance', 'installments'
      ]
    }],
    
    // Features and Amenities
    features: [String], // المميزات (واي فاي، موقف سيارات، إلخ)
    accessibility: [String], // مناسب للمعاقين، مدخل خاص، إلخ
    languages: [String] // اللغات المتاحة
  },

  // Delivery and Transportation - التوصيل والنقل
  delivery: {
    isAvailable: { // متاح التوصيل
      type: Boolean,
      default: false
    },
    deliveryFees: { // رسوم التوصيل
      type: Number,
      default: 0
    },
    minimumOrder: { // الحد الأدنى للطلب
      type: Number,
      default: 0
    },
    deliveryAreas: [String], // مناطق التوصيل
    deliveryDuration: { // مدة التوصيل
      min: Number, // بالدقائق
      max: Number
    },
    vehicleTypes: [String] // أنواع المركبات المتاحة
  },

  // Professional Service Specific - خاص بالخدمات المهنية
  professionalService: {
    experienceYears: Number, // سنوات الخبرة
    certifications: [String], // الشهادات
    portfolio: [String], // أعمال سابقة (صور/روابط)
    teamSize: Number, // حجم الفريق
    equipmentOwned: [String], // المعدات المملوكة
    serviceRadius: Number, // نطاق الخدمة بالكيلومتر
    emergencyService: Boolean, // خدمة طوارئ
    warranty: { // الضمان
      offered: Boolean,
      duration: String, // مدة الضمان
      terms: String // شروط الضمان
    }
  },

  // Medical Service Specific - خاص بالخدمات الطبية
  medicalService: {
    licenseNumber: String, // رقم الترخيص
    specializations: [String], // التخصصات
    doctorNames: [String], // أسماء الأطباء
    insuranceNetworks: [String], // شبكات التأمين
    medicalEquipment: [String], // المعدات الطبية
    emergencyServices: Boolean, // خدمات طوارئ
    appointmentBooking: { // حجز المواعيد
      online: Boolean,
      phone: Boolean,
      walkIn: Boolean
    }
  },

  // Menu/Service List - قائمة الخدمات/المنتجات
  menuItems: [{
    name: String, // اسم الخدمة/المنتج
    description: String, // الوصف
    price: Number, // السعر
    category: String, // الفئة
    image: String, // صورة
    availability: Boolean, // متاح
    preparationTime: Number, // وقت التحضير (بالدقائق)
    tags: [String] // وسوم
  }],

  // Media and Images - الوسائط والصور
  media: {
    logo: String, // شعار النشاط
    exteriorImages: [String], // صورة النشاط من الخارج
    interiorImages: [String], // صور النشاط من الداخل
    productImages: [String], // صور المنتجات/الخدمات
    certificateImages: [String], // صور الشهادات والتراخيص
    portfolioImages: [String] // صور الأعمال السابقة
  },

  // Ratings and Reviews - التقييمات والمراجعات
  ratings: {
    averageRating: { // تقييم النشاط من 5
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: { // عدد التقييمات
      type: Number,
      default: 0
    },
    ratingBreakdown: { // تفصيل التقييمات
      service: Number,
      quality: Number,
      price: Number,
      location: Number,
      cleanliness: Number
    }
  },

  // Business Status - حالة النشاط
  status: {
    isVerified: { // شارة التحقق من النشاط
      type: Boolean,
      default: false
    },
    isOpen: { // شارة (مفتوح / مغلق)
      type: Boolean,
      default: true
    },
    temporarilyClosed: { // مغلق مؤقتاً
      type: Boolean,
      default: false
    },
    closureReason: String, // سبب الإغلاق
    businessStartDate: { // تاريخ بداية النشاط
      type: Date
    },
    lastUpdated: { // آخر تحديث للبيانات
      type: Date,
      default: Date.now
    }
  },

  // Administrative Data - البيانات الإدارية
  administrative: {
    dataSource: String, // مصدر البيانات
    owner: { // مالك النشاط
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    commercialRegister: String, // السجل التجاري
    taxId: String, // الرقم الضريبي
    previousViolations: [{ // مخالفات سابقة للنشاط
      violation: String,
      date: Date,
      resolved: Boolean,
      fine: Number
    }],
    branches: [{ // الفروع
      name: String,
      location: String,
      contact: String,
      managerId: mongoose.Schema.Types.ObjectId
    }],
    inspectionHistory: [{ // تاريخ التفتيش
      date: Date,
      inspector: String,
      result: String,
      notes: String
    }]
  },

  // Tags and Categories - الوسوم والفئات
  tags: {
    locationTags: [String], // وسوم المكان
    serviceTypeTags: [String], // وسوم نوع الخدمة
    generalTags: [String] // وسوم عامة
  },

  // SEO and Search - تحسين محركات البحث
  seo: {
    keywords: [String], // كلمات مفتاحية للبحث
    metaDescription: String, // وصف للبحث
    searchBoost: { // تعزيز نتائج البحث
      type: Number,
      default: 1
    }
  },

  // Timestamps - الطوابع الزمنية
  createdAt: { // تاريخ إضافة النشاط
    type: Date,
    default: Date.now
  },
  updatedAt: { // تاريخ آخر تحديث للبيانات
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
businessSchema.index({ 'location.coordinates': '2dsphere' });
businessSchema.index({ mainBusinessType: 1, subBusinessType: 1 });
businessSchema.index({ 'location.city': 1, 'location.neighborhood': 1 });
businessSchema.index({ 'ratings.averageRating': -1 });
businessSchema.index({ businessName: 'text', businessDescription: 'text' });
businessSchema.index({ 'status.isOpen': 1, 'status.isVerified': 1 });
businessSchema.index({ 'serviceCategories.generalTags': 1 });
businessSchema.index({ 'tags.serviceTypeTags': 1 });

// Virtual for full business type path
businessSchema.virtual('fullBusinessType').get(function() {
  return `${this.mainBusinessType} > ${this.subBusinessType}`;
});

// Method to check if business is currently open
businessSchema.methods.isCurrentlyOpen = function() {
  if (!this.status.isOpen || this.status.temporarilyClosed) {
    return false;
  }
  
  const now = new Date();
  const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
  
  const todayHours = this.operatingHours.workingDays.find(day => day.day === currentDay);
  if (!todayHours || !todayHours.isOpen) {
    return false;
  }
  
  const [openHour, openMin] = todayHours.openTime.split(':').map(Number);
  const [closeHour, closeMin] = todayHours.closeTime.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  return currentTime >= openTime && currentTime <= closeTime;
};

// Method to get available services based on business type
businessSchema.methods.getAvailableServices = function() {
  switch(this.mainBusinessType) {
    case 'الطعام والمشروبات':
      return this.serviceCategories.foodCategories;
    case 'الخدمات الطبية':
      return this.serviceCategories.medicalCategories;
    case 'الخدمات المِهنية':
      return this.serviceCategories.professionalCategories;
    default:
      return this.serviceCategories.generalTags;
  }
};

// Update the updatedAt field before saving
businessSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.status.lastUpdated = Date.now();
  next();
});

// Post-save middleware to update search indexes
businessSchema.post('save', function(doc) {
  // Here you could trigger search index updates
  console.log(`Business ${doc.businessName} saved successfully`);
});

module.exports = mongoose.model('Business', businessSchema);