import  React,{ useState, useEffect, useRef } from 'react';
import AdminHeader from './AdminHeader';

// Inline API service for admin panel
const adminApiService = {
    async createService(serviceData) {
        const apiUrl = 'https://dawwarli-backend.onrender.com/api';
        
        console.log('🔍 Sending service data to:', apiUrl);
        console.log('📦 Service data:', serviceData);
            
        const response = await fetch(`${apiUrl}/admin/services`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serviceData)
        });
        
        const result = await response.json();
        console.log('📡 Backend response:', result);
        
        if (!response.ok) {
            console.error('❌ Backend error details:', result);
            console.error('🔍 Validation errors:', result.errors);
            
            if (result.errors && result.errors.length > 0) {
                const errorMessages = result.errors.map(err => `${err.field || err.path}: ${err.message || err.msg}`).join(', ');
                throw new Error(`Validation failed: ${errorMessages}`);
            }
            
            throw new Error(`HTTP ${response.status}: ${result.message || response.statusText}`);
        }
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to create service');
        }
        
        return result.data;
    }
};

// Inline location service for admin panel
const adminLocationService = {
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

export const AdminPanel = () => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [adminLocation, setAdminLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [currentStep, setCurrentStep] = useState(1);

    // Form state with all Service model fields
    const [formData, setFormData] = useState({
        name: '',
        category: 'pharmacy',
        subcategory: '',
        description: '',
        address: {
            full: '',
            street: '',
            district: '',
            city: '',
            governorate: '',
            postalCode: '',
            country: 'Saudi Arabia'
        },
        contact: {
            phone: '',
            mobile: '',
            whatsapp: '',
            email: '',
            website: ''
        },
        hours: {
            monday: { open: '08:00', close: '22:00', closed: false },
            tuesday: { open: '08:00', close: '22:00', closed: false },
            wednesday: { open: '08:00', close: '22:00', closed: false },
            thursday: { open: '08:00', close: '22:00', closed: false },
            friday: { open: '08:00', close: '22:00', closed: false },
            saturday: { open: '08:00', close: '22:00', closed: false },
            sunday: { open: '08:00', close: '22:00', closed: false }
        },
        is24Hours: false,
        rating: 0,
        reviewCount: 0,
        priceLevel: 2,
        features: [],
        paymentMethods: [],
        languages: ['arabic', 'english'],
        verified: true,
        status: 'active'
    });

    // Available options
    const categoryOptions = [
        { value: 'pharmacy', label: 'Pharmacy / صيدلية', icon: '💊' },
        { value: 'restaurant', label: 'Restaurant / مطعم', icon: '🍽️' },
        { value: 'grocery', label: 'Grocery Store / بقالة', icon: '🛒' },
        { value: 'hospital', label: 'Hospital / مستشفى', icon: '🏥' },
        { value: 'gas_station', label: 'Gas Station / محطة وقود', icon: '⛽' },
        { value: 'bank', label: 'Bank / بنك', icon: '🏦' },
        { value: 'mall', label: 'Mall / مركز تجاري', icon: '🏬' },
        { value: 'other', label: 'Other / أخرى', icon: '📍' }
    ];

    const featureOptions = [
        'parking', 'wifi', 'wheelchair_accessible', 'air_conditioning',
        'drive_through', 'delivery', 'takeout', 'outdoor_seating',
        'kids_friendly', 'pet_friendly', 'credit_cards', 'cash_only'
    ];

    const paymentOptions = [
        'cash', 'visa', 'mastercard', 'stc_pay', 'apple_pay',
        'samsung_pay', 'mada', 'amex', 'discover'
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
                    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
                    link.crossOrigin = '';
                    document.head.appendChild(link);
                }

                // Load Leaflet JS
                let L;
                if (window.L) {
                    L = window.L;
                } else {
                    const script = document.createElement('script');
                    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
                    script.crossOrigin = '';
                    document.head.appendChild(script);
                    
                    await new Promise((resolve) => {
                        script.onload = resolve;
                    });
                    
                    L = window.L;
                }
                
                // Default to your Saudi coordinates
                const defaultCenter = [26.3006, 50.2081];
                
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

    // Automatically get admin location on component mount
    useEffect(() => {
        getAdminLocation();
    }, []);

    // Get admin's current location
    const getAdminLocation = async () => {
        try {
            setLocationLoading(true);
            setMessage('📍 Getting your location automatically...');
            const location = await adminLocationService.getCurrentPosition();
            setAdminLocation(location);
            
            if (map) {
                map.setView([location.lat, location.lng], 15);
            }
            
            setMessage(`✅ Your location detected: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
        } catch (error) {
            console.error('Location error:', error);
            
            // Handle specific location permission errors
            if (error.message.includes('denied') || error.message.includes('Permission')) {
                const alertMessage = '🚨 Location Access Required!\n\nPlease allow location access in your browser to automatically detect your position.\n\n• Click "Allow" when prompted\n• Check your browser settings if no prompt appears\n• You can also manually click on the map to select a location';
                alert(alertMessage);
                setMessage('❌ Location permission denied. Please allow location access or click on the map to select a location manually.');
            } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
                setMessage('❌ Location request timed out. Please check your internet connection or click on the map to select a location.');
            } else {
                setMessage('❌ Could not get your location automatically. Please click on the map to select a location manually.');
            }
        } finally {
            setLocationLoading(false);
        }
    };

    // Use admin's location for service
    const useAdminLocation = () => {
        if (adminLocation) {
            setSelectedLocation(adminLocation);
            setMessage(`📍 Using your location: ${adminLocation.lat.toFixed(6)}, ${adminLocation.lng.toFixed(6)}`);
            
            // Add marker to map
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

    // Handle form input changes
    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    // Handle array changes (features, payment methods)
    const handleArrayChange = (field, value) => {
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
    };

    // Submit service data
    const handleSubmit = async () => {
        if (!selectedLocation) {
            setMessage('❌ Please select a location on the map or use your current location');
            return;
        }

        if (!formData.name.trim()) {
            setMessage('❌ Service name is required');
            return;
        }

        if (!formData.address.full.trim()) {
            setMessage('❌ Full address is required');
            return;
        }

        setIsLoading(true);
        
        try {
            const cleanedFormData = {
                ...formData,
                subcategory: formData.subcategory.trim() || undefined,
                description: formData.description.trim() || undefined,
                address: {
                    full: formData.address.full.trim(),
                    street: formData.address.street.trim() || undefined,
                    district: formData.address.district.trim() || undefined,
                    city: formData.address.city.trim() || undefined,
                    governorate: formData.address.governorate.trim() || undefined,
                    postalCode: formData.address.postalCode.trim() || undefined,
                    country: formData.address.country.trim() || 'Saudi Arabia'
                },
                contact: {
                    phone: formData.contact.phone.trim() || undefined,
                    mobile: formData.contact.mobile.trim() || undefined,
                    whatsapp: formData.contact.whatsapp.trim() || undefined,
                    email: formData.contact.email.trim() || undefined,
                    website: formData.contact.website.trim() || undefined
                }
            };

            const serviceData = {
                ...cleanedFormData,
                latitude: parseFloat(selectedLocation.lat),
                longitude: parseFloat(selectedLocation.lng)
            };

            const result = await adminApiService.createService(serviceData);
            
            setMessage(`✅ Service "${formData.name}" created successfully!`);
            
            // Reset form
            setFormData({
                name: '',
                category: 'pharmacy',
                subcategory: '',
                description: '',
                address: {
                    full: '',
                    street: '',
                    district: '',
                    city: '',
                    governorate: '',
                    postalCode: '',
                    country: 'EGYPT'
                },
                contact: {
                    phone: '',
                    mobile: '',
                    whatsapp: '',
                    email: '',
                    website: ''
                },
                hours: {
                    monday: { open: '08:00', close: '22:00', closed: false },
                    tuesday: { open: '08:00', close: '22:00', closed: false },
                    wednesday: { open: '08:00', close: '22:00', closed: false },
                    thursday: { open: '08:00', close: '22:00', closed: false },
                    friday: { open: '08:00', close: '22:00', closed: false },
                    saturday: { open: '08:00', close: '22:00', closed: false },
                    sunday: { open: '08:00', close: '22:00', closed: false }
                },
                is24Hours: false,
                rating: 3,
                reviewCount: 0,
                priceLevel: 2,
                features: [],
                paymentMethods: [],
                languages: ['arabic', 'english'],
                verified: true,
                status: 'active'
            });
            
            setSelectedLocation(null);
            setCurrentStep(3);
            
            // Clear map markers
            if (map && window.L) {
                map.eachLayer((layer) => {
                    if (layer instanceof window.L.Marker) {
                        map.removeLayer(layer);
                    }
                });
            }
            
        } catch (error) {
            console.error('❌ Error creating service:', error);
            
            if (error.message.includes('Validation failed')) {
                setMessage(`❌ ${error.message}`);
            } else if (error.message.includes('HTTP 400')) {
                setMessage('❌ Validation error: Please check all required fields are filled correctly');
            } else {
                setMessage(`❌ Failed to create service: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container p-4 min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
              <AdminHeader/>

            <div className="px-5 mx-auto py-8">
                {/* Status Message */}
                {message && (
                    <div className={`mb-6 animate-fade-in rounded-xl p-4 ${
                        message.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' : 
                        message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 
                        'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                        <div className="flex items-center space-x-2 justify-center">
                            {message.includes('❌') && <span className="text-red-500 text-lg">❌</span>}
                            {message.includes('✅') && <span className="text-green-500 text-lg">✅</span>}
                            {!message.includes('❌') && !message.includes('✅') && <span className="text-blue-500 text-lg">ℹ️</span>}
                            <span className="font-medium text-[32px] ">{message}</span>
                        </div>
                    </div>
                )}


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Map Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <h2 className="text-lg font-semibold text-gray-900">Select Location</h2>
                                </div>
                                {locationLoading && (
                                    <svg className="animate-spin w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {adminLocation && (
                                <div className="mb-4">
                                    <button
                                        onClick={useAdminLocation}
                                        className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Use My Location</span>
                                    </button>
                                </div>
                            )}
                            
                            <div 
                                ref={mapRef} 
                                className="w-full h-80 border border-gray-200 rounded-xl shadow-inner"
                            />
                            
                            {selectedLocation && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-1.5 bg-green-100 rounded-lg">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-green-800">Selected Location</p>
                                            <p className="text-sm text-green-600">
                                                Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <p className="text-sm text-gray-500 mt-4 flex items-center space-x-2">
                                <span className="text-sm">💡</span>
                                <span>Your location is detected automatically. Click on the map to select a different location.</span>
                            </p>
                        </div>
                </div>

                  
                </div>
                  {/* Form Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                <span className="text-base">📝</span>
                                <span>Service Information</span>
                            </h2>
                        </div>
                        
                        <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Service Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="e.g., صيدلية النهدي - حي الخبر"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    >
                                        {categoryOptions.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.icon} {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        rows={3}
                                        placeholder="Brief description of the service..."
                                    />
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Address *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address.full}
                                        onChange={(e) => handleInputChange('address.full', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Complete address including street, district, city"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        value={formData.address.city}
                                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                                        className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="City / المدينة"
                                    />
                                    <input
                                        type="text"
                                        value={formData.address.governorate}
                                        onChange={(e) => handleInputChange('address.governorate', e.target.value)}
                                        className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Governorate / المحافظة"
                                    />
                                </div>

                                {/* Contact */}
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="tel"
                                        value={formData.contact.phone}
                                        onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                                        className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Phone / الهاتف"
                                    />
                                    <input
                                        type="tel"
                                        value={formData.contact.mobile}
                                        onChange={(e) => handleInputChange('contact.mobile', e.target.value)}
                                        className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Mobile / الجوال"
                                    />
                                </div>

                                {/* Features */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Features
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {featureOptions.map(feature => (
                                            <label key={feature} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.features.includes(feature)}
                                                    onChange={() => handleArrayChange('features', feature)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">{feature.replace('_', ' ')}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Payment Methods
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {paymentOptions.map(payment => (
                                            <label key={payment} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.paymentMethods.includes(payment)}
                                                    onChange={() => handleArrayChange('paymentMethods', payment)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">{payment}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Rating and Price */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Rating (0-5)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="5"
                                            step="0.1"
                                            value={formData.rating}
                                            onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Price Level
                                        </label>
                                        <select
                                            value={formData.priceLevel}
                                            onChange={(e) => handleInputChange('priceLevel', parseInt(e.target.value))}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        >
                                            <option value={1}>$ - Inexpensive</option>
                                            <option value={2}>$$ - Moderate</option>
                                            <option value={3}>$$$ - Expensive</option>
                                            <option value={4}>$$$$ - Very Expensive</option>
                                        </select>
                                    </div>
                                </div>

                                {/* 24 Hours Toggle */}
                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="is24Hours"
                                        checked={formData.is24Hours}
                                        onChange={(e) => handleInputChange('is24Hours', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="is24Hours" className="text-sm font-semibold text-gray-700 cursor-pointer">
                                        Open 24 Hours
                                    </label>
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
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Creating Service...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-base">💾</span>
                                        <span>Create Service</span>
                                    </>
                                )}
                            </button>
                            {isLoading && (<div className='loading-spinner'></div>)}
                        </div>
                </div>
            </div>
        </div>
    );
};