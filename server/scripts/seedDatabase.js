const mongoose = require('mongoose');
require('dotenv').config();

const Service = require('../models/Service');
const Category = require('../models/Category');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'city_services'
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedCategories = async () => {
  const categories = [
    {
      name: 'pharmacy',
      displayName: { en: 'Pharmacies', ar: 'صيدليات' },
      description: { en: 'Pharmacies and drug stores', ar: 'الصيدليات ومحلات الأدوية' },
      icon: '💊',
      color: '#4CAF50',
      searchKeywords: ['pharmacy', 'drug', 'medicine', 'صيدلية', 'دواء'],
      sortOrder: 1
    },
    {
      name: 'restaurant',
      displayName: { en: 'Restaurants', ar: 'مطاعم' },
      description: { en: 'Restaurants and food services', ar: 'المطاعم وخدمات الطعام' },
      icon: '🍽️',
      color: '#FF9800',
      searchKeywords: ['restaurant', 'food', 'eat', 'مطعم', 'طعام'],
      sortOrder: 2
    },
    {
      name: 'grocery',
      displayName: { en: 'Grocery Stores', ar: 'بقالات' },
      description: { en: 'Grocery stores and supermarkets', ar: 'البقالات والسوبر ماركت' },
      icon: '🛒',
      color: '#2196F3',
      searchKeywords: ['grocery', 'supermarket', 'store', 'بقالة', 'سوبر ماركت'],
      sortOrder: 3
    },
    {
      name: 'hospital',
      displayName: { en: 'Hospitals', ar: 'مستشفيات' },
      description: { en: 'Hospitals and medical centers', ar: 'المستشفيات والمراكز الطبية' },
      icon: '🏥',
      color: '#F44336',
      searchKeywords: ['hospital', 'medical', 'health', 'مستشفى', 'طبي'],
      sortOrder: 4
    },
    {
      name: 'gas_station',
      displayName: { en: 'Gas Stations', ar: 'محطات بنزين' },
      description: { en: 'Gas stations and fuel services', ar: 'محطات البنزين وخدمات الوقود' },
      icon: '⛽',
      color: '#9C27B0',
      searchKeywords: ['gas', 'fuel', 'petrol', 'بنزين', 'وقود'],
      sortOrder: 5
    },
    {
      name: 'bank',
      displayName: { en: 'Banks', ar: 'بنوك' },
      description: { en: 'Banks and ATMs', ar: 'البنوك وأجهزة الصراف' },
      icon: '🏦',
      color: '#607D8B',
      searchKeywords: ['bank', 'atm', 'financial', 'بنك', 'صراف'],
      sortOrder: 6
    },
    {
      name: 'mall',
      displayName: { en: 'Shopping Malls', ar: 'مولات' },
      description: { en: 'Shopping malls and centers', ar: 'المولات ومراكز التسوق' },
      icon: '🏬',
      color: '#795548',
      searchKeywords: ['mall', 'shopping', 'center', 'مول', 'تسوق'],
      sortOrder: 7
    }
  ];

  for (const categoryData of categories) {
    await Category.findOneAndUpdate(
      { name: categoryData.name },
      categoryData,
      { upsert: true, new: true }
    );
  }
  
  console.log('✅ Categories seeded successfully');
};

const seedServices = async () => {
  const sampleServices = [
    {
      name: 'صيدلية العزبي - 6 أكتوبر',
      category: 'pharmacy',
      subcategory: 'general_pharmacy',
      description: 'فرع صيدلية العزبي بمدينة 6 أكتوبر - خدمات دوائية شاملة',
      location: {
        type: 'Point',
        coordinates: [30.9754, 29.9792] // [longitude, latitude] October City
      },
      address: {
        full: 'شارع الفردوس، الحي الأول، مدينة 6 أكتوبر، الجيزة',
        street: 'شارع الفردوس',
        district: 'الحي الأول',
        city: 'مدينة 6 أكتوبر',
        governorate: 'محافظة الجيزة',
        postalCode: '12573',
        country: 'مصر'
      },
      contact: {
        phone: '+20-2-3837-1234',
        mobile: '+20-10-123-4567',
        whatsapp: '+20-11-123-4567'
      },
      hours: {
        monday: { open: '08:00', close: '24:00', closed: false },
        tuesday: { open: '08:00', close: '24:00', closed: false },
        wednesday: { open: '08:00', close: '24:00', closed: false },
        thursday: { open: '08:00', close: '24:00', closed: false },
        friday: { open: '08:00', close: '24:00', closed: false },
        saturday: { open: '08:00', close: '24:00', closed: false },
        sunday: { open: '08:00', close: '24:00', closed: false }
      },
      rating: 4.2,
      reviewCount: 156,
      priceLevel: 2,
      features: ['parking', 'wheelchair_accessible', 'delivery'],
      paymentMethods: ['cash', 'visa', 'mastercard', 'fawry'],
      languages: ['arabic', 'english'],
      verified: true,
      status: 'active',
      source: 'admin_added'
    },
    {
      name: 'مطعم أبو شقرة',
      category: 'restaurant',
      subcategory: 'traditional',
      description: 'مطعم شرقي أصيل - مشاوي وأكلات شرقية',
      location: {
        type: 'Point',
        coordinates: [30.9804, 29.9822] // [longitude, latitude]
      },
      address: {
        full: 'شارع المشتل، الحي الثاني، مدينة 6 أكتوبر، الجيزة',
        street: 'شارع المشتل',
        district: 'الحي الثاني',
        city: 'مدينة 6 أكتوبر',
        governorate: 'محافظة الجيزة',
        postalCode: '12573',
        country: 'مصر'
      },
      contact: {
        phone: '+20-2-3837-5678',
        mobile: '+20-12-345-6789',
        whatsapp: '+20-12-345-6789'
      },
      hours: {
        monday: { open: '12:00', close: '02:00', closed: false },
        tuesday: { open: '12:00', close: '02:00', closed: false },
        wednesday: { open: '12:00', close: '02:00', closed: false },
        thursday: { open: '12:00', close: '02:00', closed: false },
        friday: { open: '12:00', close: '02:00', closed: false },
        saturday: { open: '12:00', close: '02:00', closed: false },
        sunday: { open: '12:00', close: '02:00', closed: false }
      },
      rating: 4.5,
      reviewCount: 89,
      priceLevel: 3,
      features: ['parking', 'delivery', 'outdoor_seating'],
      paymentMethods: ['cash', 'visa', 'mastercard'],
      languages: ['arabic'],
      verified: true,
      status: 'active',
      source: 'admin_added'
    },
    {
      name: 'سوبر ماركت خير زمان',
      category: 'grocery',
      subcategory: 'supermarket',
      description: 'سوبر ماركت شامل - جميع احتياجاتك اليومية',
      location: {
        type: 'Point',
        coordinates: [30.9734, 29.9812]
      },
      address: {
        full: 'شارع الحصري، الحي الثالث، مدينة 6 أكتوبر، الجيزة',
        street: 'شارع الحصري',
        district: 'الحي الثالث',
        city: 'مدينة 6 أكتوبر',
        governorate: 'محافظة الجيزة',
        postalCode: '12573',
        country: 'مصر'
      },
      contact: {
        phone: '+20-2-3837-9999',
        mobile: '+20-15-555-6666'
      },
      hours: {
        monday: { open: '07:00', close: '23:00', closed: false },
        tuesday: { open: '07:00', close: '23:00', closed: false },
        wednesday: { open: '07:00', close: '23:00', closed: false },
        thursday: { open: '07:00', close: '23:00', closed: false },
        friday: { open: '07:00', close: '23:00', closed: false },
        saturday: { open: '07:00', close: '23:00', closed: false },
        sunday: { open: '07:00', close: '23:00', closed: false }
      },
      rating: 4.0,
      reviewCount: 45,
      priceLevel: 2,
      features: ['parking', 'delivery'],
      paymentMethods: ['cash', 'visa', 'mastercard', 'fawry'],
      languages: ['arabic'],
      verified: true,
      status: 'active',
      source: 'admin_added'
    }
  ];

  for (const serviceData of sampleServices) {
    await Service.findOneAndUpdate(
      { 
        name: serviceData.name,
        'location.coordinates': serviceData.location.coordinates 
      },
      serviceData,
      { upsert: true, new: true }
    );
  }
  
  console.log('✅ Sample services seeded successfully');
};

const runSeed = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...');
    
    await seedCategories();
    await seedServices();
    
    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('📊 Seeded Data:');
    console.log('   - 7 Categories (pharmacy, restaurant, grocery, etc.)');
    console.log('   - 3 Sample Services in October City, Egypt');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('   1. Start server: npm run dev');
    console.log('   2. Test API: http://localhost:5000/health');
    console.log('   3. View categories: http://localhost:5000/api/categories');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeed();