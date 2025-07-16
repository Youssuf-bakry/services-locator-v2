export const translations = {
  en: {
    // App Header
    appTitle: "🏙️ City Services",
    appSubtitle: "Find nearby services in your area",
    
    // Search & Filters
    searchPlaceholder: "Search for services...",
    searchButton: "Search",
    allCategories: "All Categories",
    
    // Categories
    pharmacy: "Pharmacies",
    restaurant: "Restaurants", 
    grocery: "Grocery Stores",
    hospital: "Hospitals",
    gas_station: "Gas Stations",
    bank: "Banks",
    mall: "Malls",
    other: "Other",
    
    // Location
    locationPermissionTitle: "Location Access Required",
    locationPermissionText: "Please enable location access to find nearby services",
    enableLocation: "Enable Location",
    getMyLocation: "Get My Location",
    useMyLocation: "Use My Location",
    
    // Results
    resultsFound: "Found {count} services",
    showingResultsFor: "Showing results for \"{query}\"",
    noResults: "No services found",
    noResultsText: "Try searching for something else or check different categories",
    
    // Service Card
    openNow: "Open Now",
    closedNow: "Closed Now",
    rating: "Rating",
    priceLevel: "Price",
    getDirections: "Get Directions",
    callNow: "Call Now",
    distanceAway: "{distance} away",
    
    // Loading & Errors
    loading: "Loading...",
    searchingFor: "Searching for {query}...",
    error: "Something went wrong",
    retryButton: "Try Again",
    backToHome: "Back to Home",
    
    // Welcome Message
    welcomeTitle: "Welcome to City Services",
    welcomeText: "Find pharmacies, restaurants, and other services near you",
    quickSearchTitle: "Quick Search:",
    
    // Admin Panel
    adminTitle: "🔧 Admin Panel",
    adminSubtitle: "Add new service locations to the database",
    backToMainApp: "← Back to Main App",
    
    // Admin Map
    selectLocation: "📍 Select Location",
    mapInstructions: "💡 Click anywhere on the map to select a location for the new service",
    selectedCoordinates: "Selected coordinates:",
    latitude: "Latitude",
    longitude: "Longitude",
    
    // Admin Form
    serviceInformation: "📝 Service Information",
    serviceName: "Service Name",
    serviceNamePlaceholder: "e.g., Al Nahdi Pharmacy - Khobar",
    category: "Category",
    description: "Description",
    descriptionPlaceholder: "Brief description of the service...",
    
    // Address Fields
    fullAddress: "Full Address",
    fullAddressPlaceholder: "Complete address including street, district, city",
    city: "City / المدينة",
    governorate: "Governorate / المحافظة",
    street: "Street",
    district: "District",
    postalCode: "Postal Code",
    
    // Contact Fields
    phone: "Phone / الهاتف",
    mobile: "Mobile / الجوال", 
    whatsapp: "WhatsApp",
    email: "Email",
    website: "Website",
    
    // Business Hours
    businessHours: "Business Hours",
    openTime: "Open",
    closeTime: "Close",
    closed: "Closed",
    open24Hours: "Open 24 Hours",
    
    // Days of week
    saturday: "Saturday",
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday", 
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
   
    
    // Features & Amenities
    features: "Features",
    paymentMethods: "Payment Methods",
    languages: "Languages",
    
    // Common Features
    parking: "Parking",
    wifi: "WiFi",
    wheelchair_accessible: "Wheelchair Accessible",
    air_conditioning: "Air Conditioning",
    drive_through: "Drive Through",
    delivery: "Delivery",
    takeout: "Takeout",
    outdoor_seating: "Outdoor Seating",
    kids_friendly: "Kids Friendly",
    pet_friendly: "Pet Friendly",
    credit_cards: "Credit Cards",
    cash_only: "Cash Only",
    
    // Payment Methods
    cash: "Cash",
    visa: "Visa",
    mastercard: "Mastercard",
    apple_pay: "Apple Pay",
    samsung_pay: "Samsung Pay",
  
    
    // Admin Actions
    createService: "💾 Create Service",
    creatingService: "⏳ Creating Service...",
    updateService: "Update Service",
    deleteService: "Delete Service",
    testConnection: "Test Connection",
    
    // Success/Error Messages
    serviceCreatedSuccess: "✅ SUCCESS! Service \"{name}\" created successfully with ID: {id}",
    serviceCreatedMongo: "🎉 Service saved to MongoDB! You can now find it in your app.",
    backendConnected: "✅ Backend connected! {message} (Version: {version})",
    backendConnectionFailed: "❌ Backend connection failed",
    validationFailed: "❌ Validation failed: {errors}",
    locationSelected: "📍 Location selected: {lat}, {lng}",
    locationRequired: "❌ Please select a location on the map or use your current location",
    serviceNameRequired: "❌ Service name is required",
    addressRequired: "❌ Full address is required",
    
    // Rating & Price
    ratingLabel: "Rating (0-5)",
    priceLevelLabel: "Price Level (1-4)",
    inexpensive: "$ - Inexpensive",
    moderate: "$$ - Moderate", 
    expensive: "$$$ - Expensive",
    veryExpensive: "$$$$ - Very Expensive",
    
    // Language Switcher
    language: "Language",
    english: "English",
    arabic: "العربية",
    
    // Status
    active: "Active",
    pending: "Pending",
    closed: "Closed",
    suspended: "Suspended",
    verified: "Verified",
    unverified: "Unverified"
  },
  
  ar: {
    // App Header
    appTitle: "🏙️ خدمات المدينة",
    appSubtitle: "ابحث عن الخدمات القريبة منك",
    
    // Search & Filters  
    searchPlaceholder: "ابحث عن الخدمات...",
    searchButton: "بحث",
    allCategories: "جميع الفئات",
    
    // Categories
    pharmacy: "صيدليات",
    restaurant: "مطاعم",
    grocery: "سوبر ماركت",
    hospital: "مستشفيات", 
    gas_station: "محطات وقود",
    bank: "بنوك",
    mall: "مراكز تجارية",
    other: "أخرى",
    
    // Location
    locationPermissionTitle: "مطلوب الوصول للموقع",
    locationPermissionText: "يرجى تفعيل الوصول للموقع للعثور على الخدمات القريبة",
    enableLocation: "تفعيل الموقع",
    getMyLocation: "الحصول على موقعي",
    useMyLocation: "استخدام موقعي",
    
    // Results
    resultsFound: "تم العثور على {count} خدمة",
    showingResultsFor: "عرض النتائج لـ \"{query}\"",
    noResults: "لم يتم العثور على خدمات",
    noResultsText: "جرب البحث عن شيء آخر أو تحقق من فئات مختلفة",
    
    // Service Card
    openNow: "مفتوح الآن",
    closedNow: "مغلق الآن", 
    rating: "التقييم",
    priceLevel: "السعر",
    getDirections: "الحصول على الاتجاهات",
    callNow: "اتصل الآن",
    distanceAway: "على بعد {distance}",
    
    // Loading & Errors
    loading: "جاري التحميل...",
    searchingFor: "البحث عن {query}...",
    error: "حدث خطأ ما",
    retryButton: "حاول مرة أخرى",
    backToHome: "العودة للرئيسية",
    
    // Welcome Message
    welcomeTitle: "مرحباً بك في خدمات المدينة",
    welcomeText: "ابحث عن الصيدليات والمطاعم والخدمات الأخرى بالقرب منك",
    quickSearchTitle: "بحث سريع:",
    
    // Admin Panel
    adminTitle: "🔧 لوحة الإدارة",
    adminSubtitle: "إضافة مواقع خدمات جديدة إلى قاعدة البيانات",
    backToMainApp: "← العودة للتطبيق الرئيسي",
    
    // Admin Map
    selectLocation: "📍 اختيار الموقع",
    mapInstructions: "💡 انقر في أي مكان على الخريطة لاختيار موقع للخدمة الجديدة",
    selectedCoordinates: "الإحداثيات المختارة:",
    latitude: "خط العرض",
    longitude: "خط الطول",
    
    // Admin Form
    serviceInformation: "📝 معلومات الخدمة",
    serviceName: "اسم الخدمة",
    serviceNamePlaceholder: "مثال: صيدلية النهدي - الخبر",
    category: "الفئة",
    description: "الوصف",
    descriptionPlaceholder: "وصف مختصر للخدمة...",
    
    // Address Fields
    fullAddress: "العنوان الكامل",
    fullAddressPlaceholder: "العنوان الكامل بما في ذلك الشارع والحي والمدينة",
    city: "المدينة",
    governorate: "المحافظة",
    street: "الشارع",
    district: "الحي",
    postalCode: "الرمز البريدي",
    
    // Contact Fields
    phone: "الهاتف",
    mobile: "الجوال",
    whatsapp: "واتساب",
    email: "البريد الإلكتروني",
    website: "الموقع الإلكتروني",
    
    // Business Hours
    businessHours: "ساعات العمل",
    openTime: "فتح",
    closeTime: "إغلاق",
    closed: "مغلق",
    open24Hours: "مفتوح 24 ساعة",
    
    // Days of week
    saturday: "السبت",
    sunday: "الأحد",
    monday: "الاثنين",
    tuesday: "الثلاثاء",
    wednesday: "الأربعاء", 
    thursday: "الخميس",
    friday: "الجمعة",
  
    
    // Features & Amenities
    features: "المميزات",
    paymentMethods: "طرق الدفع",
    languages: "اللغات",
    
    // Common Features
    parking: "موقف سيارات",
    wifi: "واي فاي",
    wheelchair_accessible: "مناسب للكراسي المتحركة",
    air_conditioning: "تكييف",
    drive_through: "خدمة السيارة",
    delivery: "توصيل",
    takeout: "طلبات خارجية",
    outdoor_seating: "جلسة خارجية",
    kids_friendly: "مناسب للأطفال",
    pet_friendly: "مناسب للحيوانات الأليفة",
    credit_cards: "بطاقات ائتمان",
    cash_only: "نقدي فقط",
    
    // Payment Methods
    cash: "نقدي",
    visa: "فيزا",
    mastercard: "ماستركارد",
    apple_pay: "آبل باي",
    samsung_pay: "سامسونج باي",
  
    
    // Admin Actions
    createService: "💾 إنشاء خدمة",
    creatingService: "⏳ جاري إنشاء الخدمة...",
    updateService: "تحديث الخدمة",
    deleteService: "حذف الخدمة",
    testConnection: "اختبار الاتصال",
    
    // Success/Error Messages
    serviceCreatedSuccess: "✅ نجح! تم إنشاء الخدمة \"{name}\" بنجاح برقم: {id}",
    serviceCreatedMongo: "🎉 تم حفظ الخدمة في قاعدة البيانات! يمكنك الآن العثور عليها في التطبيق.",
    backendConnected: "✅ تم الاتصال بالخادم! {message} (الإصدار: {version})",
    backendConnectionFailed: "❌ فشل الاتصال بالخادم",
    validationFailed: "❌ فشل التحقق: {errors}",
    locationSelected: "📍 تم اختيار الموقع: {lat}, {lng}",
    locationRequired: "❌ يرجى اختيار موقع على الخريطة أو استخدام موقعك الحالي",
    serviceNameRequired: "❌ اسم الخدمة مطلوب",
    addressRequired: "❌ العنوان الكامل مطلوب",
    
    // Rating & Price
    ratingLabel: "التقييم (0-5)",
    priceLevelLabel: "مستوى السعر (1-4)",
    inexpensive: "$ - غير مكلف",
    moderate: "$$ - متوسط",
    expensive: "$$$ - مكلف",
    veryExpensive: "$$$$ - مكلف جداً",
    
    // Language Switcher
    language: "اللغة",
    english: "English",
    arabic: "العربية",
    
    // Status
    active: "نشط",
    pending: "قيد المراجعة",
    closed: "مغلق",
    suspended: "معلق",
    verified: "تم التحقق",
    unverified: "غير محقق"
  }
};

// Helper function to get translation with placeholder replacement
export const t = (key, params = {}, language = 'en') => {
  let text = translations[language]?.[key] || translations.en[key] || key;
  
  // Replace placeholders like {count}, {name}, etc.
  Object.keys(params).forEach(param => {
    text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
  });
  
  return text;
};

// Get direction for language (LTR/RTL)
export const getDirection = (language) => {
  return language === 'ar' ? 'rtl' : 'ltr';
};

// Get text alignment for language
export const getTextAlign = (language) => {
  return language === 'ar' ? 'right' : 'left';
};