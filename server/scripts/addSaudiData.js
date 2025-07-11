const mongoose = require('mongoose');
require('dotenv').config();

const Service = require('../models/Service');

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

const saudiServices = [
  {
    name: "صيدلية النهدي - الخبر",
    category: "pharmacy",
    subcategory: "general_pharmacy",
    description: "صيدلية النهدي - فرع الخبر - خدمات دوائية شاملة على مدار الساعة",
    location: {
      type: "Point",
      coordinates: [50.2081, 26.3006] // Near your GPS location
    },
    address: {
      full: "شارع الملك فهد، الخبر، المنطقة الشرقية، المملكة العربية السعودية",
      street: "شارع الملك فهد",
      district: "الخبر",
      city: "الخبر",
      governorate: "المنطقة الشرقية",
      postalCode: "31952",
      country: "المملكة العربية السعودية"
    },
    contact: {
      phone: "+966-13-123-4567",
      mobile: "+966-50-123-4567",
      whatsapp: "+966-50-123-4567",
      website: "https://www.nahdi.sa"
    },
    hours: {
      monday: { open: "00:00", close: "23:59", closed: false },
      tuesday: { open: "00:00", close: "23:59", closed: false },
      wednesday: { open: "00:00", close: "23:59", closed: false },
      thursday: { open: "00:00", close: "23:59", closed: false },
      friday: { open: "00:00", close: "23:59", closed: false },
      saturday: { open: "00:00", close: "23:59", closed: false },
      sunday: { open: "00:00", close: "23:59", closed: false }
    },
    is24Hours: true,
    rating: 4.3,
    reviewCount: 234,
    priceLevel: 2,
    features: ["parking", "wheelchair_accessible", "delivery", "drive_through"],
    paymentMethods: ["cash", "visa", "mastercard", "stc_pay", "apple_pay"],
    languages: ["arabic", "english"],
    verified: true,
    status: "active",
    source: "admin_added"
  },
  {
    name: "مطعم البيك - الخبر",
    category: "restaurant",
    subcategory: "fast_food",
    description: "مطعم البيك للوجبات السريعة - برجر وفراخ طازجة",
    location: {
      type: "Point",
      coordinates: [50.2145, 26.2987]
    },
    address: {
      full: "طريق الملك فهد، الخبر، المنطقة الشرقية، المملكة العربية السعودية",
      street: "طريق الملك فهد",
      district: "الخبر",
      city: "الخبر",
      governorate: "المنطقة الشرقية",
      postalCode: "31952",
      country: "المملكة العربية السعودية"
    },
    contact: {
      phone: "+966-13-234-5678",
      mobile: "+966-55-234-5678",
      whatsapp: "+966-55-234-5678"
    },
    hours: {
      monday: { open: "06:00", close: "02:00", closed: false },
      tuesday: { open: "06:00", close: "02:00", closed: false },
      wednesday: { open: "06:00", close: "02:00", closed: false },
      thursday: { open: "06:00", close: "02:00", closed: false },
      friday: { open: "06:00", close: "02:00", closed: false },
      saturday: { open: "06:00", close: "02:00", closed: false },
      sunday: { open: "06:00", close: "02:00", closed: false }
    },
    rating: 4.5,
    reviewCount: 456,
    priceLevel: 2,
    features: ["parking", "drive_through", "delivery"],
    paymentMethods: ["cash", "visa", "mastercard", "stc_pay"],
    languages: ["arabic", "english"],
    verified: true,
    status: "active",
    source: "admin_added"
  },
  {
    name: "هايبر بنده - الخبر",
    category: "grocery",
    subcategory: "hypermarket",
    description: "هايبر بنده - سوبر ماركت شامل لجميع احتياجاتك",
    location: {
      type: "Point",
      coordinates: [50.1987, 26.3024]
    },
    address: {
      full: "شارع الأمير فيصل بن فهد، الخبر، المنطقة الشرقية، المملكة العربية السعودية",
      street: "شارع الأمير فيصل بن فهد",
      district: "الخبر",
      city: "الخبر",
      governorate: "المنطقة الشرقية",
      postalCode: "31952",
      country: "المملكة العربية السعودية"
    },
    contact: {
      phone: "+966-13-345-6789",
      website: "https://www.panda.com.sa"
    },
    hours: {
      monday: { open: "08:00", close: "24:00", closed: false },
      tuesday: { open: "08:00", close: "24:00", closed: false },
      wednesday: { open: "08:00", close: "24:00", closed: false },
      thursday: { open: "08:00", close: "24:00", closed: false },
      friday: { open: "08:00", close: "24:00", closed: false },
      saturday: { open: "08:00", close: "24:00", closed: false },
      sunday: { open: "08:00", close: "24:00", closed: false }
    },
    rating: 4.1,
    reviewCount: 189,
    priceLevel: 2,
    features: ["parking", "wheelchair_accessible", "pharmacy_inside"],
    paymentMethods: ["cash", "visa", "mastercard", "stc_pay", "apple_pay"],
    languages: ["arabic", "english"],
    verified: true,
    status: "active",
    source: "admin_added"
  },
  {
    name: "مستشفى الموسى التخصصي",
    category: "hospital",
    subcategory: "private_hospital",
    description: "مستشفى الموسى التخصصي - خدمات طبية متقدمة",
    location: {
      type: "Point",
      coordinates: [50.2034, 26.2965]
    },
    address: {
      full: "طريق الملك فهد، الخبر، المنطقة الشرقية، المملكة العربية السعودية",
      street: "طريق الملك فهد",
      district: "الخبر",
      city: "الخبر",
      governorate: "المنطقة الشرقية",
      postalCode: "31952",
      country: "المملكة العربية السعودية"
    },
    contact: {
      phone: "+966-13-456-7890",
      mobile: "+966-50-456-7890",
      website: "https://www.almoussa.com.sa"
    },
    hours: {
      monday: { open: "00:00", close: "23:59", closed: false },
      tuesday: { open: "00:00", close: "23:59", closed: false },
      wednesday: { open: "00:00", close: "23:59", closed: false },
      thursday: { open: "00:00", close: "23:59", closed: false },
      friday: { open: "00:00", close: "23:59", closed: false },
      saturday: { open: "00:00", close: "23:59", closed: false },
      sunday: { open: "00:00", close: "23:59", closed: false }
    },
    is24Hours: true,
    rating: 4.4,
    reviewCount: 312,
    priceLevel: 3,
    features: ["parking", "wheelchair_accessible", "emergency", "valet_parking"],
    paymentMethods: ["cash", "visa", "mastercard", "insurance"],
    languages: ["arabic", "english"],
    verified: true,
    status: "active",
    source: "admin_added"
  },
  {
    name: "محطة أرامكو للوقود",
    category: "gas_station",
    subcategory: "aramco_station",
    description: "محطة أرامكو للوقود - وقود عالي الجودة وخدمات متنوعة",
    location: {
      type: "Point",
      coordinates: [50.2156, 26.3045]
    },
    address: {
      full: "طريق الدمام السريع، الخبر، المنطقة الشرقية، المملكة العربية السعودية",
      street: "طريق الدمام السريع",
      district: "الخبر",
      city: "الخبر",
      governorate: "المنطقة الشرقية",
      postalCode: "31952",
      country: "المملكة العربية السعودية"
    },
    contact: {
      phone: "+966-13-567-8901"
    },
    hours: {
      monday: { open: "00:00", close: "23:59", closed: false },
      tuesday: { open: "00:00", close: "23:59", closed: false },
      wednesday: { open: "00:00", close: "23:59", closed: false },
      thursday: { open: "00:00", close: "23:59", closed: false },
      friday: { open: "00:00", close: "23:59", closed: false },
      saturday: { open: "00:00", close: "23:59", closed: false },
      sunday: { open: "00:00", close: "23:59", closed: false }
    },
    is24Hours: true,
    rating: 4.0,
    reviewCount: 87,
    priceLevel: 2,
    features: ["car_wash", "convenience_store", "atm"],
    paymentMethods: ["cash", "visa", "mastercard", "stc_pay"],
    languages: ["arabic", "english"],
    verified: true,
    status: "active",
    source: "admin_added"
  },
  {
    name: "الراشد مول",
    category: "mall",
    subcategory: "shopping_center",
    description: "الراشد مول - مركز تسوق شامل بالخبر",
    location: {
      type: "Point",
      coordinates: [50.1923, 26.3087]
    },
    address: {
      full: "طريق الملك عبدالعزيز، الخبر، المنطقة الشرقية، المملكة العربية السعودية",
      street: "طريق الملك عبدالعزيز",
      district: "الخبر",
      city: "الخبر",
      governorate: "المنطقة الشرقية",
      postalCode: "31952",
      country: "المملكة العربية السعودية"
    },
    contact: {
      phone: "+966-13-678-9012",
      website: "https://www.alrashidmall.com"
    },
    hours: {
      monday: { open: "10:00", close: "22:00", closed: false },
      tuesday: { open: "10:00", close: "22:00", closed: false },
      wednesday: { open: "10:00", close: "22:00", closed: false },
      thursday: { open: "10:00", close: "24:00", closed: false },
      friday: { open: "10:00", close: "24:00", closed: false },
      saturday: { open: "10:00", close: "24:00", closed: false },
      sunday: { open: "10:00", close: "22:00", closed: false }
    },
    rating: 4.2,
    reviewCount: 523,
    priceLevel: 3,
    features: ["parking", "wheelchair_accessible", "food_court", "cinema"],
    paymentMethods: ["cash", "visa", "mastercard", "stc_pay", "apple_pay"],
    languages: ["arabic", "english"],
    verified: true,
    status: "active",
    source: "admin_added"
  },
  {
    name: "بنك الراجحي - فرع الخبر",
    category: "bank",
    subcategory: "islamic_bank",
    description: "بنك الراجحي - خدمات مصرفية إسلامية",
    location: {
      type: "Point",
      coordinates: [50.2067, 26.2998]
    },
    address: {
      full: "شارع الملك فيصل، الخبر، المنطقة الشرقية، المملكة العربية السعودية",
      street: "شارع الملك فيصل",
      district: "الخبر",
      city: "الخبر",
      governorate: "المنطقة الشرقية",
      postalCode: "31952",
      country: "المملكة العربية السعودية"
    },
    contact: {
      phone: "+966-13-789-0123",
      website: "https://www.alrajhibank.com.sa"
    },
    hours: {
      monday: { open: "08:00", close: "16:00", closed: false },
      tuesday: { open: "08:00", close: "16:00", closed: false },
      wednesday: { open: "08:00", close: "16:00", closed: false },
      thursday: { open: "08:00", close: "16:00", closed: false },
      friday: { open: "00:00", close: "00:00", closed: true },
      saturday: { open: "08:00", close: "16:00", closed: false },
      sunday: { open: "08:00", close: "16:00", closed: false }
    },
    rating: 3.8,
    reviewCount: 156,
    priceLevel: 1,
    features: ["atm", "wheelchair_accessible", "parking"],
    paymentMethods: ["bank_services"],
    languages: ["arabic", "english"],
    verified: true,
    status: "active",
    source: "admin_added"
  }
];

const addSaudiServices = async () => {
  try {
    console.log('🇸🇦 Adding Saudi services near your location...');
    
    for (const serviceData of saudiServices) {
      await Service.findOneAndUpdate(
        { 
          name: serviceData.name,
          'location.coordinates': serviceData.location.coordinates 
        },
        serviceData,
        { upsert: true, new: true }
      );
    }
    
    console.log(`✅ Added ${saudiServices.length} Saudi services successfully!`);
    
    // Show summary
    const categoryCounts = saudiServices.reduce((acc, service) => {
      acc[service.category] = (acc[service.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Added services by category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} services`);
    });
    
    console.log(`\n📍 All services added near coordinates: 26.30, 50.20`);
    console.log('🧪 You can now test with your real GPS location!');
    
  } catch (error) {
    console.error('❌ Error adding Saudi services:', error);
  }
};

const runAddSaudiData = async () => {
  try {
    await connectDB();
    await addSaudiServices();
    
    console.log('\n🎯 Next steps:');
    console.log('1. Test your app with real GPS location');
    console.log('2. Search for: صيدلية، مطعم، بنده');
    console.log('3. Filter by categories');
    console.log('4. Everything should work with your Saudi location!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
};

runAddSaudiData();