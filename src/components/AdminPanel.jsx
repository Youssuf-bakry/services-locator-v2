import { useState, useEffect, useRef } from 'react';

// Inline API service for admin panel
const adminApiService = {
    async createService(serviceData) {
        const apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:5000/api'
            : 'https://dawwarli-backend.onrender.com/api';
            
        const response = await fetch(`${apiUrl}/admin/services`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serviceData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
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
    const [message, setMessage] = useState('');
    const [categories, setCategories] = useState([]);

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

    // Get admin's current location
    const getAdminLocation = async () => {
        try {
            setMessage('📍 Getting your location...');
            const location = await adminLocationService.getCurrentPosition();
            setAdminLocation(location);
            
            if (map) {
                map.setView([location.lat, location.lng], 15);
            }
            
            setMessage(`✅ Your location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
        } catch (error) {
            setMessage('❌ Could not get your location. Please click on the map to select a location.');
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

    // Handle hours changes
    const handleHoursChange = (day, field, value) => {
        setFormData(prev => ({
            ...prev,
            hours: {
                ...prev.hours,
                [day]: {
                    ...prev.hours[day],
                    [field]: value
                }
            }
        }));
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
            const serviceData = {
                ...formData,
                latitude: selectedLocation.lat,
                longitude: selectedLocation.lng
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
            console.error('Error creating service:', error);
            setMessage(`❌ Failed to create service: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">🔧 Admin Panel</h1>
                    <p className="text-gray-600 mb-4">Add new service locations to the database</p>
                    
                    {message && (
                        <div className={`p-3 rounded-lg mb-4 ${
                            message.includes('❌') ? 'bg-red-100 text-red-700' : 
                            message.includes('✅') ? 'bg-green-100 text-green-700' : 
                            'bg-blue-100 text-blue-700'
                        }`}>
                            {message}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Map Section */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">📍 Select Location</h2>
                        
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={getAdminLocation}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                📍 Get My Location
                            </button>
                            
                            {adminLocation && (
                                <button
                                    onClick={useAdminLocation}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                >
                                    ✅ Use My Location
                                </button>
                            )}
                        </div>
                        
                        <div 
                            ref={mapRef} 
                            className="w-full h-96 border border-gray-300 rounded-lg"
                            style={{ minHeight: '400px' }}
                        />
                        
                        {selectedLocation && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-700">
                                    <strong>Selected coordinates:</strong><br/>
                                    Latitude: {selectedLocation.lat.toFixed(6)}<br/>
                                    Longitude: {selectedLocation.lng.toFixed(6)}
                                </p>
                            </div>
                        )}
                        
                        <p className="text-sm text-gray-500 mt-2">
                            💡 Click anywhere on the map to select a location for the new service
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">📝 Service Information</h2>
                        
                        <div className="space-y-4">
                            {/* Basic Information */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Service Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., صيدلية النهدي - حي الخبر"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    {categoryOptions.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.icon} {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Brief description of the service..."
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Address *
                                </label>
                                <input
                                    type="text"
                                    value={formData.address.full}
                                    onChange={(e) => handleInputChange('address.full', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Complete address including street, district, city"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={formData.address.city}
                                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="City / المدينة"
                                />
                                <input
                                    type="text"
                                    value={formData.address.governorate}
                                    onChange={(e) => handleInputChange('address.governorate', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Governorate / المحافظة"
                                />
                            </div>

                            {/* Contact */}
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="tel"
                                    value={formData.contact.phone}
                                    onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Phone / الهاتف"
                                />
                                <input
                                    type="tel"
                                    value={formData.contact.mobile}
                                    onChange={(e) => handleInputChange('contact.mobile', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Mobile / الجوال"
                                />
                            </div>

                            {/* Features */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Features
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {featureOptions.map(feature => (
                                        <label key={feature} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.features.includes(feature)}
                                                onChange={() => handleArrayChange('features', feature)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">{feature.replace('_', ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Methods
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {paymentOptions.map(payment => (
                                        <label key={payment} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.paymentMethods.includes(payment)}
                                                onChange={() => handleArrayChange('paymentMethods', payment)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">{payment}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Rating and Price */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rating (0-5)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        value={formData.rating}
                                        onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price Level (1-4)
                                    </label>
                                    <select
                                        value={formData.priceLevel}
                                        onChange={(e) => handleInputChange('priceLevel', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value={1}>$ - Inexpensive</option>
                                        <option value={2}>$$ - Moderate</option>
                                        <option value={3}>$$$ - Expensive</option>
                                        <option value={4}>$$$$ - Very Expensive</option>
                                    </select>
                                </div>
                            </div>

                            {/* 24 Hours Toggle */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is24Hours"
                                    checked={formData.is24Hours}
                                    onChange={(e) => handleInputChange('is24Hours', e.target.checked)}
                                    className="mr-2"
                                />
                                <label htmlFor="is24Hours" className="text-sm font-medium text-gray-700">
                                    Open 24 Hours
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading || !selectedLocation}
                                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                                    isLoading || !selectedLocation
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {isLoading ? '⏳ Creating Service...' : '💾 Create Service'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};