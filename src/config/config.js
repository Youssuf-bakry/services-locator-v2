const getApiKey = () => {

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

