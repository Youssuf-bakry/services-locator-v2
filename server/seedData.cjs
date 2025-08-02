const mongoose = require('mongoose');
const FoodCategory = require('./models/FoodCategory');
const Business = require('./models/Business');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-locator');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Food categories based on your Excel classification
const foodCategoriesData = [
  // Main Categories - التصنيفات الأساسية
  {
    nameAr: 'إفطار',
    nameEn: 'Breakfast',
    slug: 'breakfast',
    categoryType: 'main_category',
    mainCategory: 'إفطار',
    description: 'وجبات الإفطار والمخبوزات الصباحية',
    icon: '🍳',
    color: '#FF9800',
    sortOrder: 1
  },
  {
    nameAr: 'وجبة رئيسية',
    nameEn: 'Main Meal',
    slug: 'main-meal',
    categoryType: 'main_category',
    mainCategory: 'وجبة رئيسية',
    description: 'الوجبات الرئيسية للغداء والعشاء',
    icon: '🍽️',
    color: '#4CAF50',
    sortOrder: 2
  },
  {
    nameAr: 'مشروب',
    nameEn: 'Beverage',
    slug: 'beverage',
    categoryType: 'main_category',
    mainCategory: 'مشروب',
    description: 'المشروبات الساخنة والباردة',
    icon: '☕',
    color: '#795548',
    sortOrder: 3
  },
  {
    nameAr: 'حلويات',
    nameEn: 'Desserts',
    slug: 'desserts',
    categoryType: 'main_category',
    mainCategory: 'حلويات',
    description: 'الحلويات والكيك والآيس كريم',
    icon: '🍰',
    color: '#E91E63',
    sortOrder: 4
  },
  {
    nameAr: 'سناك',
    nameEn: 'Snacks',
    slug: 'snacks',
    categoryType: 'main_category',
    mainCategory: 'سناك',
    description: 'الوجبات الخفيفة والتسالي',
    icon: '🍿',
    color: '#FF5722',
    sortOrder: 5
  },

  // Sub Categories - التصنيفات الفرعية
  {
    nameAr: 'مخبوزات',
    nameEn: 'Baked Goods',
    slug: 'baked-goods',
    categoryType: 'sub_category',
    subCategory: 'مخبوزات',
    description: 'الخبز والمعجنات والكيك',
    icon: '🥖',
    color: '#FFC107'
  },
  {
    nameAr: 'لحوم',
    nameEn: 'Meat',
    slug: 'meat',
    categoryType: 'sub_category',
    subCategory: 'لحوم',
    description: 'أطباق اللحوم الحمراء',
    icon: '🥩',
    color: '#8BC34A'
  },
  {
    nameAr: 'دواجن',
    nameEn: 'Poultry',
    slug: 'poultry',
    categoryType: 'sub_category',
    subCategory: 'دواجن',
    description: 'الدجاج والطيور',
    icon: '🍗',
    color: '#CDDC39'
  },
  {
    nameAr: 'أرز/عدس',
    nameEn: 'Rice/Lentils',
    slug: 'rice-lentils',
    categoryType: 'sub_category',
    subCategory: 'أرز/عدس',
    description: 'أطباق الأرز والعدس والحبوب',
    icon: '🍚',
    color: '#8BC34A'
  },
  {
    nameAr: 'ساندوتش',
    nameEn: 'Sandwich',
    slug: 'sandwich',
    categoryType: 'sub_category',
    subCategory: 'ساندوتش',
    description: 'الساندوتشات واللفائف',
    icon: '🥪',
    color: '#FF9800'
  },
  {
    nameAr: 'ساخن',
    nameEn: 'Hot Drinks',
    slug: 'hot-drinks',
    categoryType: 'sub_category',
    subCategory: 'ساخن',
    description: 'المشروبات الساخنة',
    icon: '☕',
    color: '#795548'
  },
  {
    nameAr: 'بارد',
    nameEn: 'Cold Drinks',
    slug: 'cold-drinks',
    categoryType: 'sub_category',
    subCategory: 'بارد',
    description: 'المشروبات الباردة والعصائر',
    icon: '🥤',
    color: '#2196F3'
  },

  // Dietary Patterns - الأنماط الغذائية
  {
    nameAr: 'عادي',
    nameEn: 'Regular',
    slug: 'regular',
    categoryType: 'dietary_pattern',
    dietaryPattern: 'عادي',
    description: 'طعام عادي بدون قيود غذائية',
    icon: '🍽️',
    color: '#9E9E9E'
  },
  {
    nameAr: 'صحي',
    nameEn: 'Healthy',
    slug: 'healthy',
    categoryType: 'dietary_pattern',
    dietaryPattern: 'صحي',
    description: 'طعام صحي قليل السعرات',
    icon: '🥗',
    color: '#4CAF50'
  },
  {
    nameAr: 'نباتي',
    nameEn: 'Vegetarian',
    slug: 'vegetarian',
    categoryType: 'dietary_pattern',
    dietaryPattern: 'نباتي',
    description: 'طعام نباتي خالي من اللحوم',
    icon: '🌱',
    color: '#8BC34A'
  },

  // Meal Times - أوقات الوجبات
  {
    nameAr: 'صباح',
    nameEn: 'Morning',
    slug: 'morning',
    categoryType: 'meal_time',
    mealTime: 'صباح',
    description: 'وجبات الصباح والإفطار',
    icon: '🌅',
    color: '#FF9800'
  },
  {
    nameAr: 'غداء',
    nameEn: 'Lunch',
    slug: 'lunch',
    categoryType: 'meal_time',
    mealTime: 'غداء',
    description: 'وجبات الغداء',
    icon: '🌞',
    color: '#FFC107'
  },
  {
    nameAr: 'عشاء',
    nameEn: 'Dinner',
    slug: 'dinner',
    categoryType: 'meal_time',
    mealTime: 'عشاء',
    description: 'وجبات العشاء',
    icon: '🌙',
    color: '#3F51B5'
  },
  {
    nameAr: 'أي وقت',
    nameEn: 'Anytime',
    slug: 'anytime',
    categoryType: 'meal_time',
    mealTime: 'أي وقت',
    description: 'متاح في أي وقت',
    icon: '⏰',
    color: '#607D8B'
  }
];

// Sample menu items based on your Excel data
const sampleMenuItems = [
  {
    name: 'وافل',
    description: 'وافل طازج مع العسل والفواكه',
    category: { mainCategory: 'إفطار', subCategory: 'مخبوزات' },
    dietaryPattern: 'عادي',
    mealTime: 'صباح',
    additionalTags: ['حلويات', 'غربي'],
    price: 25
  },
  {
    name: 'قهوة عربية',
    description: 'قهوة عربية أصيلة مع الهيل',
    category: { mainCategory: 'مشروب', subCategory: 'ساخن' },
    dietaryPattern: 'عادي',
    mealTime: 'صباح/سناك',
    additionalTags: ['منبه', 'عربي'],
    price: 8
  },
  {
    name: 'كشري',
    description: 'كشري مصري تقليدي مع الصلصة',
    category: { mainCategory: 'وجبة رئيسية', subCategory: 'أرز/عدس' },
    dietaryPattern: 'نباتي',
    mealTime: 'غداء',
    additionalTags: ['شعبي', 'مصري'],
    price: 18
  },
  {
    name: 'مشاوي مشكلة',
    description: 'مشاوي لحم وكفتة ودجاج',
    category: { mainCategory: 'وجبة رئيسية', subCategory: 'لحوم' },
    dietaryPattern: 'عادي',
    mealTime: 'غداء/عشاء',
    additionalTags: ['مشويات', 'عربي'],
    price: 45
  },
  {
    name: 'شاورما دجاج',
    description: 'شاورما دجاج مع الخضار والثوم',
    category: { mainCategory: 'وجبة رئيسية', subCategory: 'دواجن' },
    dietaryPattern: 'عادي',
    mealTime: 'غداء/عشاء',
    additionalTags: ['عربي', 'لفائف'],
    price: 15
  },
  {
    name: 'برجر لحم',
    description: 'برجر لحم طازج مع البطاطس',
    category: { mainCategory: 'وجبة رئيسية', subCategory: 'ساندوتش' },
    dietaryPattern: 'عادي',
    mealTime: 'غداء/عشاء',
    additionalTags: ['سريع', 'غربي'],
    price: 28
  },
  {
    name: 'بيتزا مارجريتا',
    description: 'بيتزا إيطالية كلاسيكية',
    category: { mainCategory: 'وجبة رئيسية', subCategory: 'مخبوزات' },
    dietaryPattern: 'عادي',
    mealTime: 'غداء/عشاء',
    additionalTags: ['إيطالي'],
    price: 35
  }
];

// Sample businesses
const sampleBusinesses = [
  {
    businessName: 'مطعم الأصالة',
    businessDescription: 'مطعم تراثي يقدم الأكلات الشعبية الأصيلة',
    businessType: 'مطعم',
    foodCategories: {
      mainCategories: ['وجبة رئيسية', 'مشروب'],
      subCategories: ['لحوم', 'أرز/عدس', 'ساخن'],
      dietaryOptions: ['عادي', 'نباتي'],
      mealTimes: ['غداء', 'عشاء'],
      cuisineStyle: ['عربي', 'شعبي'],
      foodTags: ['مشويات', 'طازج', 'منزلي']
    },
    location: {
      province: 'الرياض',
      city: 'الرياض',
      neighborhood: 'العليا',
      street: 'شارع الملك فهد',
      coordinates: [46.6753, 24.6877]
    },
    contact: {
      phoneNumber: '0112345678',
      whatsappNumber: '966112345678'
    },
    menuItems: sampleMenuItems.filter(item => 
      ['كشري', 'مشاوي مشكلة', 'قهوة عربية'].includes(item.name)
    )
  },
  {
    businessName: 'كافيه الصباح',
    businessDescription: 'كافيه متخصص في القهوة والإفطار',
    businessType: 'مقهى',
    foodCategories: {
      mainCategories: ['إفطار', 'مشروب'],
      subCategories: ['مخبوزات', 'ساخن', 'بارد'],
      dietaryOptions: ['عادي'],
      mealTimes: ['صباح', 'سناك'],
      cuisineStyle: ['غربي'],
      foodTags: ['منبه', 'حلويات']
    },
    location: {
      province: 'الرياض',
      city: 'الرياض',
      neighborhood: 'الحمراء',
      street: 'شارع العروبة',
      coordinates: [46.7219, 24.7136]
    },
    contact: {
      phoneNumber: '0112345679',
      whatsappNumber: '966112345679'
    },
    menuItems: sampleMenuItems.filter(item => 
      ['وافل', 'قهوة عربية'].includes(item.name)
    )
  },
  {
    businessName: 'برجر هاوس',
    businessDescription: 'مطعم وجبات سريعة متخصص في البرجر',
    businessType: 'وجبات سريعة',
    foodCategories: {
      mainCategories: ['وجبة رئيسية'],
      subCategories: ['ساندوتش'],
      dietaryOptions: ['عادي'],
      mealTimes: ['غداء', 'عشاء'],
      cuisineStyle: ['غربي'],
      foodTags: ['سريع']
    },
    location: {
      province: 'الرياض',
      city: 'الرياض',
      neighborhood: 'السليمانية',
      street: 'شارع التخصصي',
      coordinates: [46.6863, 24.7136]
    },
    contact: {
      phoneNumber: '0112345680',
      whatsappNumber: '966112345680'
    },
    delivery: {
      isAvailable: true,
      deliveryFees: 10,
      minimumOrder: 30,
      deliveryAreas: ['السليمانية', 'الحمراء', 'العليا']
    },
    menuItems: sampleMenuItems.filter(item => 
      ['برجر لحم'].includes(item.name)
    )
  }
];

// Seed functions
async function seedFoodCategories() {
  try {
    console.log('🌱 Seeding food categories...');
    
    // Clear existing categories
    await FoodCategory.deleteMany({});
    
    // Insert new categories
    const categories = await FoodCategory.insertMany(foodCategoriesData);
    console.log(`✅ Created ${categories.length} food categories`);
    
    return categories;
  } catch (error) {
    console.error('❌ Error seeding food categories:', error);
    throw error;
  }
}

async function seedBusinesses() {
  try {
    console.log('🌱 Seeding businesses...');
    
    // Clear existing businesses
    await Business.deleteMany({});
    
    // Create sample owner (you'll need to create User model for this)
    const sampleOwnerId = new mongoose.Types.ObjectId();
    
    // Add owner to businesses
    const businessesWithOwner = sampleBusinesses.map(business => ({
      ...business,
      owner: sampleOwnerId,
      operatingHours: {
        workingDays: [
          { day: 'Sunday', openTime: '08:00', closeTime: '23:00', isOpen: true },
          { day: 'Monday', openTime: '08:00', closeTime: '23:00', isOpen: true },
          { day: 'Tuesday', openTime: '08:00', closeTime: '23:00', isOpen: true },
          { day: 'Wednesday', openTime: '08:00', closeTime: '23:00', isOpen: true },
          { day: 'Thursday', openTime: '08:00', closeTime: '23:00', isOpen: true },
          { day: 'Friday', openTime: '14:00', closeTime: '23:00', isOpen: true },
          { day: 'Saturday', openTime: '08:00', closeTime: '23:00', isOpen: true }
        ]
      },
      serviceInfo: {
        serviceType: 'fast_food',
        diningOptions: {
          dineIn: true,
          takeaway: true,
          delivery: true
        },
       paymentMethods: ['cash', 'visa', 'mada'],
      },
      status: {
        isVerified: true,
        isOpen: true
      }
    }));
    
    const businesses = await Business.insertMany(businessesWithOwner);
    console.log(`✅ Created ${businesses.length} businesses`);
    
    return businesses;
  } catch (error) {
    console.error('❌ Error seeding businesses:', error);
    throw error;
  }
}

// Main seeding function
async function seedAll() {
  try {
    await connectDB();
    
    console.log('🚀 Starting data seeding...');
    
    await seedFoodCategories();
    await seedBusinesses();
    
    console.log('✅ Data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Data seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
}

// Individual seeding functions for specific data
async function seedCategoriesOnly() {
  await connectDB();
  await seedFoodCategories();
  await mongoose.connection.close();
}

async function seedBusinessesOnly() {
  await connectDB();
  await seedBusinesses();
  await mongoose.connection.close();
}

// Export functions
module.exports = {
  seedAll,
  seedCategoriesOnly,
  seedBusinessesOnly,
  seedFoodCategories,
  seedBusinesses,
  foodCategoriesData,
  sampleMenuItems,
  sampleBusinesses
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedAll();
}