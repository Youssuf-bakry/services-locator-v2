import React, { useState, useEffect, useRef } from 'react';

// API service for food businesses
const foodBusinessApiService = {
    async createBusiness(businessData) {
        const apiUrl = 'http://localhost:5000/api/admin'; // Update to your API URL
        
        console.log('🔍 Sending business data to:', apiUrl);
        console.log('📦 Business data:', businessData);
            
        const response = await fetch(`${apiUrl}/businesses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(businessData)
        });
        console.log('Response status:', response.status);
console.log('Response ok:', response.ok);
        const result = await response.json();
        console.log('📡 Backend response:', result);
        
        if (!response.ok) {
             const errorText = await response.text();
            console.error('❌ Backend error details:', errorText);
             throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return result.data;
    }
};

// Location service
const locationService = {
    async getCurrentPosition() {
        if (!navigator.geolocation) {
            throw new Error('Geolocation is not supported by this browser');
        }

        return new Promise((resolve, reject) => {
            const options = {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 5 * 60 * 1000
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    reject(new Error(`Location access denied: ${error.message}`));
                },
                options
            );
        });
    }
};

const AdminPanel = () => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [adminLocation, setAdminLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [currentStep, setCurrentStep] = useState(1);

    // Form state matching your Business schema
    const [formData, setFormData] = useState({
        businessName: '',
        businessDescription: '',
        businessType: 'مطعم',
        mainBusinessType: 'مطعم',
        
        foodCategories: {
            mainCategories: [],
            subCategories: [],
            dietaryOptions: [],
            mealTimes: [],
            cuisineStyle: [],
            foodTags: []
        },
        
        location: {
            province: 'الرياض',
            city: '',
            neighborhood: '',
            street: '',
            mallName: '',
            shopNumber: '',
            coordinates: []
        },
        
        contact: {
            phoneNumber: '',
            whatsappNumber: '',
            deliveryNumber: '',
            website: '',
            socialMediaLinks: []
        },
        
        operatingHours: {
            workingDays: [
                { day: 'Sunday', openTime: '08:00', closeTime: '22:00', isOpen: true },
                { day: 'Monday', openTime: '08:00', closeTime: '22:00', isOpen: true },
                { day: 'Tuesday', openTime: '08:00', closeTime: '22:00', isOpen: true },
                { day: 'Wednesday', openTime: '08:00', closeTime: '22:00', isOpen: true },
                { day: 'Thursday', openTime: '08:00', closeTime: '22:00', isOpen: true },
                { day: 'Friday', openTime: '14:00', closeTime: '22:00', isOpen: true },
                { day: 'Saturday', openTime: '08:00', closeTime: '22:00', isOpen: true }
            ]
        },
        
        serviceInfo: {
            diningOptions: {
                dineIn: true,
                takeaway: true,
                delivery: false
            },
            diningRoomType: 'مختلط',
            paymentMethods: [],
            features: []
        },
        
        delivery: {
            isAvailable: false,
            deliveryFees: 0,
            minimumOrder: 0,
            deliveryAreas: [],
            deliveryDuration: { min: 30, max: 60 }
        },
        
        menuItems: [],
        
        status: {
            isVerified: true,
            isOpen: true,
            temporarilyClosed: false
        }
    });

    // Available options based on your schema
    const businessTypeOptions = [
        { value: 'مطعم', label: 'مطعم - Restaurant', icon: '🍽️' },
        { value: 'مقهى', label: 'مقهى - Cafe', icon: '☕' },
        { value: 'مخبزة', label: 'مخبزة - Bakery', icon: '🥖' },
        { value: 'حلويات', label: 'حلويات - Sweets', icon: '🍰' },
        { value: 'وجبات سريعة', label: 'وجبات سريعة - Fast Food', icon: '🍔' },
        { value: 'عصائر', label: 'عصائر - Juice Bar', icon: '🥤' },
        { value: 'كافيتيريا', label: 'كافيتيريا - Cafeteria', icon: '🍴' },
        { value: 'بوفيه مفتوح', label: 'بوفيه مفتوح - Buffet', icon: '🍽️' },
        { value: 'مطبخ منزلي', label: 'مطبخ منزلي - Home Kitchen', icon: '🏠' }
    ];

    const mainCategoryOptions = [
        'إفطار', 'وجبة رئيسية', 'مشروب', 'حلويات', 'سناك'
    ];

    const subCategoryOptions = [
        'مخبوزات', 'لحوم', 'دواجن', 'أرز/عدس', 'ساندوتش', 'ساخن', 'بارد', 'متنوع'
    ];

    const dietaryOptions = [
        'عادي', 'صحي', 'نباتي', 'خالي من الجلوتين', 'قليل الدسم', 'كيتو'
    ];

    const mealTimeOptions = [
        'صباح', 'غداء', 'عشاء', 'سناك', 'صباح/سناك', 'غداء/عشاء', 'أي وقت'
    ];

    const cuisineStyleOptions = [
        'عربي', 'شعبي', 'غربي', 'إيطالي', 'آسيوي', 'مصري', 'لبناني', 'تركي', 'هندي', 'مكسيكي'
    ];

    const foodTagOptions = [
        'حلويات', 'دايت', 'خفيف', 'منبه', 'مشبع', 'سريع', 'مقلي', 'مشويات', 'لفائف', 'طازج', 'منزلي', 'فاخر'
    ];

    const diningRoomOptions = [
        'عائلي', 'رجال فقط', 'مختلط', 'لا يوجد صالة'
    ];

    const paymentMethodOptions = [
        'cash', 'visa', 'mada', 'stc_pay', 'apple_pay', 'mastercard'
    ];

    const featureOptions = [
        'واي فاي مجاني', 'موقف سيارات', 'متاح للعائلات', 'قسم نسائي', 
        'العاب أطفال', 'طلبات أونلاين', 'حجز طاولات', 'مناسب للمعاقين'
    ];

    // Initialize map
    useEffect(() => {
        const initMap = async () => {
            try {
                // Load Leaflet CSS
                if (!document.querySelector('link[href*="leaflet"]')) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                    document.head.appendChild(link);
                }

                // Load Leaflet JS
                let L;
                if (window.L) {
                    L = window.L;
                } else {
                    const script = document.createElement('script');
                    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                    document.head.appendChild(script);
                    
                    await new Promise((resolve) => {
                        script.onload = resolve;
                    });
                    
                    L = window.L;
                }
                
                // Default to Riyadh coordinates
                const defaultCenter = [24.7136, 46.6753];
                
                const mapInstance = L.map(mapRef.current).setView(defaultCenter, 13);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(mapInstance);

                // Add click handler for location selection
                mapInstance.on('click', (e) => {
                    const { lat, lng } = e.latlng;
                    setSelectedLocation({ lat, lng });
                    
                    // Remove existing marker
                    mapInstance.eachLayer((layer) => {
                        if (layer instanceof L.Marker) {
                            mapInstance.removeLayer(layer);
                        }
                    });
                    
                    // Add new marker
                    L.marker([lat, lng]).addTo(mapInstance)
                        .bindPopup(`Selected Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
                        .openPopup();
                    
                    setMessage(`📍 Location selected: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                });

                setMap(mapInstance);
            } catch (error) {
                console.error('Failed to initialize map:', error);
                setMessage('❌ Failed to load map. Please refresh the page.');
            }
        };

        initMap();
    }, []);

    // Get admin's current location
    const getAdminLocation = async () => {
        try {
            setLocationLoading(true);
            setMessage('📍 Getting your location automatically...');
            const location = await locationService.getCurrentPosition();
            setAdminLocation(location);
            
            if (map) {
                map.setView([location.lat, location.lng], 15);
            }
            
            setMessage(`✅ Your location detected: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
        } catch (error) {
            console.error('Location error:', error);
            setMessage('❌ Could not get your location. Please click on the map to select a location manually.');
        } finally {
            setLocationLoading(false);
        }
    };

    // Use admin's location for business
    const useAdminLocation = () => {
        if (adminLocation) {
            setSelectedLocation(adminLocation);
            setMessage(`📍 Using your location: ${adminLocation.lat.toFixed(6)}, ${adminLocation.lng.toFixed(6)}`);
            
            if (map && window.L) {
                const L = window.L;
                map.eachLayer((layer) => {
                    if (layer instanceof L.Marker) {
                        map.removeLayer(layer);
                    }
                });
                
                L.marker([adminLocation.lat, adminLocation.lng]).addTo(map)
                    .bindPopup(`Your Location: ${adminLocation.lat.toFixed(6)}, ${adminLocation.lng.toFixed(6)}`)
                    .openPopup();
            }
        }
    };

    useEffect(() => {
        getAdminLocation();
    }, []);

    // Handle form input changes
    const handleInputChange = (field, value) => {
        const fieldParts = field.split('.');
        
        if (fieldParts.length === 1) {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        } else if (fieldParts.length === 2) {
            const [parent, child] = fieldParts;
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else if (fieldParts.length === 3) {
            const [parent, child, grandchild] = fieldParts;
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: {
                        ...prev[parent][child],
                        [grandchild]: value
                    }
                }
            }));
        }
    };

    // Handle array changes
    const handleArrayChange = (field, value) => {
        const fieldParts = field.split('.');
        
        if (fieldParts.length === 2) {
            const [parent, child] = fieldParts;
            setFormData(prev => {
                const currentArray = prev[parent][child];
                if (currentArray.includes(value)) {
                    return {
                        ...prev,
                        [parent]: {
                            ...prev[parent],
                            [child]: currentArray.filter(item => item !== value)
                        }
                    };
                } else {
                    return {
                        ...prev,
                        [parent]: {
                            ...prev[parent],
                            [child]: [...currentArray, value]
                        }
                    };
                }
            });
        } else {
            setFormData(prev => {
                const currentArray = prev[field];
                if (currentArray.includes(value)) {
                    return {
                        ...prev,
                        [field]: currentArray.filter(item => item !== value)
                    };
                } else {
                    return {
                        ...prev,
                        [field]: [...currentArray, value]
                    };
                }
            });
        }
    };

    // Submit business data
    const handleSubmit = async () => {
        if (!selectedLocation) {
            setMessage('❌ Please select a location on the map or use your current location');
            return;
        }

        if (!formData.businessName.trim()) {
            setMessage('❌ Business name is required');
            return;
        }

        if (!formData.contact.phoneNumber.trim()) {
            setMessage('❌ Phone number is required');
            return;
        }

        setIsLoading(true);
        
        try {
            const businessData = {
                ...formData,
                location: {
                    ...formData.location,
                    coordinates: [selectedLocation.lng, selectedLocation.lat] // [longitude, latitude]
                },
                owner: '507f1f77bcf86cd799439011' // You'll need to add authentication to get real owner ID
            };

            const result = await foodBusinessApiService.createBusiness(businessData);
            
            setMessage(`✅ Business "${formData.businessName}" created successfully!`);
            
            // Reset form
            setFormData({
                businessName: '',
                businessDescription: '',
                businessType: 'مطعم',
                mainBusinessType: 'مطعم',
                foodCategories: {
                    mainCategories: [],
                    subCategories: [],
                    dietaryOptions: [],
                    mealTimes: [],
                    cuisineStyle: [],
                    foodTags: []
                },
                location: {
                    province: 'الرياض',
                    city: '',
                    neighborhood: '',
                    street: '',
                    mallName: '',
                    shopNumber: '',
                    coordinates: []
                },
                contact: {
                    phoneNumber: '',
                    whatsappNumber: '',
                    deliveryNumber: '',
                    website: '',
                    socialMediaLinks: []
                },
                operatingHours: {
                    workingDays: [
                        { day: 'Sunday', openTime: '08:00', closeTime: '22:00', isOpen: true },
                        { day: 'Monday', openTime: '08:00', closeTime: '22:00', isOpen: true },
                        { day: 'Tuesday', openTime: '08:00', closeTime: '22:00', isOpen: true },
                        { day: 'Wednesday', openTime: '08:00', closeTime: '22:00', isOpen: true },
                        { day: 'Thursday', openTime: '08:00', closeTime: '22:00', isOpen: true },
                        { day: 'Friday', openTime: '14:00', closeTime: '22:00', isOpen: true },
                        { day: 'Saturday', openTime: '08:00', closeTime: '22:00', isOpen: true }
                    ]
                },
                serviceInfo: {
                    diningOptions: {
                        dineIn: true,
                        takeaway: true,
                        delivery: false
                    },
                    diningRoomType: 'مختلط',
                    paymentMethods: [],
                    features: []
                },
                delivery: {
                    isAvailable: false,
                    deliveryFees: 0,
                    minimumOrder: 0,
                    deliveryAreas: [],
                    deliveryDuration: { min: 30, max: 60 }
                },
                menuItems: [],
                status: {
                    isVerified: true,
                    isOpen: true,
                    temporarilyClosed: false
                }
            });
            
            setSelectedLocation(null);
            
            // Clear map markers
            if (map && window.L) {
                map.eachLayer((layer) => {
                    if (layer instanceof window.L.Marker) {
                        map.removeLayer(layer);
                    }
                });
            }
            
        } catch (error) {
            console.error('❌ Error creating business:', error);
            setMessage(`❌ Failed to create business: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">إضافة نشاط غذائي جديد</h1>
                <p className="text-gray-600">Add New Food Business</p>
            </div>

            {/* Status Message */}
            {message && (
                <div className={`mb-6 animate-fade-in rounded-xl p-4 ${
                    message.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' : 
                    message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 
                    'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                    <div className="flex items-center space-x-2 justify-center">
                        <span className="font-medium">{message}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Map Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                            <span>📍</span>
                            <span>تحديد الموقع - Select Location</span>
                        </h2>
                    </div>
                    
                    <div className="p-6">
                        {adminLocation && (
                            <div className="mb-4">
                                <button
                                    onClick={useAdminLocation}
                                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                                >
                                    <span>✓</span>
                                    <span>استخدم موقعي - Use My Location</span>
                                </button>
                            </div>
                        )}
                        
                        <div 
                            ref={mapRef} 
                            className="w-full h-80 border border-gray-200 rounded-xl"
                        />
                        
                        {selectedLocation && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                                <p className="font-semibold text-green-800">✅ موقع محدد - Selected Location</p>
                                <p className="text-sm text-green-600">
                                    Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                            <span>📝</span>
                            <span>معلومات النشاط - Business Information</span>
                        </h2>
                    </div>
                    
                    <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    اسم النشاط - Business Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="مثال: مطعم البيت الشامي"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    نوع النشاط - Business Type *
                                </label>
                                <select
                                    value={formData.businessType}
                                    onChange={(e) => {
                                        handleInputChange('businessType', e.target.value);
                                        handleInputChange('mainBusinessType', e.target.value);
                                    }}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {businessTypeOptions.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.icon} {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    وصف النشاط - Description
                                </label>
                                <textarea
                                    value={formData.businessDescription}
                                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="وصف مختصر عن النشاط..."
                                />
                            </div>

                            {/* Food Categories */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    الفئات الأساسية - Main Categories
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {mainCategoryOptions.map(category => (
                                        <label key={category} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.foodCategories.mainCategories.includes(category)}
                                                onChange={() => handleArrayChange('foodCategories.mainCategories', category)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{category}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    نمط المأكولات - Cuisine Style
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {cuisineStyleOptions.map(style => (
                                        <label key={style} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.foodCategories.cuisineStyle.includes(style)}
                                                onChange={() => handleArrayChange('foodCategories.cuisineStyle', style)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{style}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    value={formData.location.city}
                                    onChange={(e) => handleInputChange('location.city', e.target.value)}
                                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="المدينة - City"
                                />
                                <input
                                    type="text"
                                    value={formData.location.neighborhood}
                                    onChange={(e) => handleInputChange('location.neighborhood', e.target.value)}
                                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="الحي - Neighborhood"
                                />
                            </div>

                            <input
                                type="text"
                                value={formData.location.street}
                                onChange={(e) => handleInputChange('location.street', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="الشارع - Street"
                            />

                            {/* Contact */}
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="tel"
                                    value={formData.contact.phoneNumber}
                                    onChange={(e) => handleInputChange('contact.phoneNumber', e.target.value)}
                                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="رقم الهاتف *"
                                />
                                <input
                                    type="tel"
                                    value={formData.contact.whatsappNumber}
                                    onChange={(e) => handleInputChange('contact.whatsappNumber', e.target.value)}
                                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="واتساب"
                                />
                            </div>

                            {/* Service Options */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    خيارات الخدمة - Service Options
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.serviceInfo.diningOptions.dineIn}
                                            onChange={(e) => handleInputChange('serviceInfo.diningOptions.dineIn', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">تناول في المكان - Dine In</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.serviceInfo.diningOptions.takeaway}
                                            onChange={(e) => handleInputChange('serviceInfo.diningOptions.takeaway', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">استلام - Takeaway</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.serviceInfo.diningOptions.delivery}
                                            onChange={(e) => {
                                                handleInputChange('serviceInfo.diningOptions.delivery', e.target.checked);
                                                handleInputChange('delivery.isAvailable', e.target.checked);
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">توصيل - Delivery</span>
                                    </label>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    طرق الدفع - Payment Methods
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {paymentMethodOptions.map(payment => (
                                        <label key={payment} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.serviceInfo.paymentMethods.includes(payment)}
                                                onChange={() => handleArrayChange('serviceInfo.paymentMethods', payment)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{payment}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    المميزات - Features
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {featureOptions.map(feature => (
                                        <label key={feature} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.serviceInfo.features.includes(feature)}
                                                onChange={() => handleArrayChange('serviceInfo.features', feature)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Dining Room Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    نوع الصالة - Dining Room Type
                                </label>
                                <select
                                    value={formData.serviceInfo.diningRoomType}
                                    onChange={(e) => handleInputChange('serviceInfo.diningRoomType', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {diningRoomOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading || !selectedLocation}
                            className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                                isLoading || !selectedLocation
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    <span>إنشاء النشاط... Creating Business...</span>
                                </>
                            ) : (
                                <>
                                    <span>💾</span>
                                    <span>إنشاء النشاط - Create Business</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminPanel;