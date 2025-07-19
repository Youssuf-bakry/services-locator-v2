// src/config/config.js - Final production configuration

// Determine the backend URL based on environment
const getBackendUrl = () => {
    // Production: Use your Render backend URL
    if (window.location.hostname !== 'localhost') {
        return 'https://dawwarli-backend.onrender.com/api';
    }
    
    // Development: Use localhost
    return 'http://localhost:5000/api';
};

export const CONFIG = {
    // Disable Google Maps API (we're using our own MongoDB data)
    GOOGLE_MAPS_API_KEY: null,
    USE_GOOGLE_API: false,
    
    // Dynamic Backend API URL
    BACKEND_API_URL: getBackendUrl(),
    BACKEND_HEALTH_URL: getBackendUrl(),
    
    // Search Configuration
    DEFAULT_SEARCH_RADIUS: 10000, // 10km radius
    MAX_SEARCH_RADIUS: 50000, // 50km max radius
    
    // Default location (Saudi Arabia - will use user's actual GPS when available)
    DEFAULT_CITY_CENTER: {
        lat: 26.3006, // Your Saudi coordinates
        lng: 50.2081
    },
    
    // API Configuration
    MAX_REQUESTS_PER_MINUTE: 60,
    CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
    REQUEST_TIMEOUT: 15000, // 15 seconds (increased for mobile)
    
    // Environment detection
    IS_DEVELOPMENT: import.meta.env.DEV,
    IS_PRODUCTION: import.meta.env.PROD,
    
    // App settings
    APP_NAME: 'Dawwarli - دوارلي',
    APP_VERSION: '2.0.0',
    LOCATION: 'OCTOBER CITY - جمهورية مصر العربية',
    DESCRIPTION: 'Find nearby services in Egypt',
    
    // Feature flags
    FEATURES: {
        ENABLE_CACHING: true,
        ENABLE_GEOLOCATION: true,
        ENABLE_SEARCH: true,
        ENABLE_CATEGORIES: true,
        ENABLE_ADMIN_PANEL: false,
        DEBUG_MODE: import.meta.env.DEV,
        MOBILE_OPTIMIZED: true
    },
    
    // UI Configuration
    UI: {
        DEFAULT_ZOOM_LEVEL: 13,
        MAX_RESULTS_PER_PAGE: 50,
        SHOW_DISTANCE: true,
        LANGUAGE: 'en', // 'en' or 'ar'
        THEME: 'light'
    }
};

// Helper functions
export const isBackendEnabled = () => {
    return !CONFIG.USE_GOOGLE_API && CONFIG.BACKEND_API_URL;
};

export const getApiUrl = (endpoint) => {
    return `${CONFIG.BACKEND_API_URL}/${endpoint.replace(/^\//, '')}`;
};

export const isFeatureEnabled = (featureName) => {
    return CONFIG.FEATURES[featureName] === true;
};

// Log configuration
console.log('🔧 Dawwarli Configuration:');
console.log('   🌍 Environment:', CONFIG.IS_PRODUCTION ? 'Production' : 'Development');
console.log('   📍 Target Location:', CONFIG.LOCATION);
console.log('   🗄️ Backend API:', CONFIG.BACKEND_API_URL);
console.log('   🚫 Google API:', CONFIG.USE_GOOGLE_API ? 'Enabled' : 'Disabled (Using MongoDB)');
console.log('   📱 Mobile Optimized:', CONFIG.FEATURES.MOBILE_OPTIMIZED);

// Test backend connection on load (production only)
if (CONFIG.IS_PRODUCTION) {
    fetch(CONFIG.BACKEND_HEALTH_URL)
        .then(res => res.json())
        .then(data => {
            console.log('✅ Backend Health:', data.message);
            console.log('📊 Backend Version:', data.version);
        })
        .catch(err => console.log('❌ Backend Health Check Failed:', err.message));
}