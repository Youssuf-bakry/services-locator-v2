const mongoose = require('mongoose');

// Business Schema - مخطط النشاط التجاري
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
    // required: true
  },
  subBusinessType: { // نوع النشاط الفرعي
    type: String
  },
  entityType: { // نوع الكيان (محل، فرد)
    type: String,
    enum: ['shop', 'individual', 'company'],
    default: 'shop'
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
    coordinates: { // إحداثيات الموقع
      type: [Number], // [longitude, latitude]
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
    website: { // رابط الموقع الإلكتروني
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
      openTime: String, // ساعات العمل
      closeTime: String
    }],
    holidayDays: [String], // أيام العطلة
    deliveryHours: { // ساعات التوصيل
      start: String,
      end: String
    }
  },

  // Service Information - معلومات الخدمة
  serviceInfo: {
    serviceType: { // نوع الخدمة
      type: String,
      required: false
    },
    serviceTags: [String], // وسوم الخدمات
    diningType: { // صالة ولا سفري
      type: String,
      enum: ['dine_in', 'takeaway', 'both'],
      default: 'both'
    },
    diningRoomType: String, // نوع الصالة
    paymentMethods: [{ // طرق الدفع المتاحة
      type: String,
      enum: ['cash', 'card', 'digital_wallet', 'bank_transfer','mada', 'visa', 'mastercard', 'apple_pay', 'google_pay']
    }]
  },

  // Delivery Information - معلومات التوصيل
  delivery: {
    deliveryFees: { // رسوم التوصيل
      type: Number,
      default: 0
    },
    deliveryDuration: { // مدة التوصيل
      min: Number, // بالدقائق
      max: Number
    }
  },

  // Media and Images - الوسائط والصور
  media: {
    logo: String, // شعار النشاط
    exteriorImages: [String], // صورة النشاط من الخارج
    interiorImages: [String], // صور النشاط من الداخل
    productImages: [String] // صور المنتجات
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
    businessStartDate: { // تاريخ بداية النشاط
      type: Date
    }
  },

  // Administrative Data - البيانات الإدارية
  administrative: {
    dataSource: String, // مصدر البيانات
    previousViolations: [{ // مخالفات سابقة للنشاط
      violation: String,
      date: Date,
      resolved: Boolean
    }],
    branches: [{ // الفروع
      name: String,
      location: String,
      contact: String
    }]
  },

  // Tags and Categories - الوسوم والفئات
  tags: {
    locationTags: [String], // وسوم المكان
    generalTags: [String] // وسوم عامة
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
businessSchema.index({ mainBusinessType: 1 });
businessSchema.index({ 'location.city': 1, 'location.neighborhood': 1 });
businessSchema.index({ 'ratings.averageRating': -1 });
businessSchema.index({ businessName: 'text', businessDescription: 'text' });

// Update the updatedAt field before saving
businessSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Business', businessSchema);