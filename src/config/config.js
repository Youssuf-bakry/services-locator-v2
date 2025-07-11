// Updated to use MongoDB backend instead of Google API

export const CONFIG = {
    // Disable Google Maps API (we're using our own data now!)
    GOOGLE_MAPS_API_KEY: null,
    USE_GOOGLE_API: false,
    
    // Your MongoDB Backend API
    BACKEND_API_URL: 'http://localhost:5000/api',
    BACKEND_HEALTH_URL: 'http://localhost:5000/health',
    
    // Search Configuration
    DEFAULT_SEARCH_RADIUS: 10000, // 10km radius (increased from 5km)
    MAX_SEARCH_RADIUS: 50000, // 50km max radius
    
    // Default location (October City, Egypt)
    DEFAULT_CITY_CENTER: {
        lat: 29.9792, // October City coordinates
        lng: 30.9754
    },
    
    // API Configuration
    MAX_REQUESTS_PER_MINUTE: 60,
    CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
    REQUEST_TIMEOUT: 10000, // 10 seconds
    
    // Environment detection
    IS_DEVELOPMENT: import.meta.env.DEV,
    IS_PRODUCTION: import.meta.env.PROD,
    
    // App settings
    APP_NAME: 'City Services Locator',
    APP_VERSION: '2.0.0', // Updated version for MongoDB backend
    LOCATION: 'October City, Egypt',
    
    // Feature flags
    FEATURES: {
        ENABLE_CACHING: true,
        ENABLE_GEOLOCATION: true,
        ENABLE_SEARCH: true,
        ENABLE_CATEGORIES: true,
        ENABLE_ADMIN_PANEL: false, // Set to true when you build admin panel
        DEBUG_MODE: import.meta.env.DEV
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
if (CONFIG.IS_DEVELOPMENT) {
    console.log('🔧 App Configuration:');
    console.log('   📍 Location:', CONFIG.LOCATION);
    console.log('   🗄️ Using MongoDB Backend:', isBackendEnabled());
    console.log('   🚫 Google API Disabled:', !CONFIG.USE_GOOGLE_API);
    console.log('   🔗 Backend URL:', CONFIG.BACKEND_API_URL);
    console.log('   🎯 Default Center:', CONFIG.DEFAULT_CITY_CENTER);
}

//google maps api
/*const getApiKey = () => {

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    

    
    if (!apiKey) {
        console.error('❌ Google Maps API key not found. Please check your environment variables.');
        return null;
    }
    
    // Basic validation
    if (!apiKey.startsWith('AIza')) {
        console.warn('⚠️Google Maps API key format seems incorrect');
    }else {
        console.log('✅ Google Maps API key configured successfully');
    }
    
    return apiKey;
};

export const CONFIG = {
    GOOGLE_MAPS_API_KEY: getApiKey(),
    DEFAULT_SEARCH_RADIUS: 5000, // 5km radius
    MAX_SEARCH_RADIUS: 50000, // 50km max radius
    DEFAULT_CITY_CENTER: {
       lat: 30.06263, //cairo
        lng: 31.24967
    },
    
    // API Rate limiting
    MAX_REQUESTS_PER_MINUTE: 60,
    CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
    
    // Environment detection
    IS_DEVELOPMENT: import.meta.env.DEV,
    IS_PRODUCTION: import.meta.env.PROD,
    
    // App settings
    APP_NAME: 'City Services Locator',
    APP_VERSION: '1.0.0'
};

*/