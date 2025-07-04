// src/services/dataService.js
import { GoogleMapsService } from './googleMapsService.js';
import { mockServices } from '../data/mockData.js';
import { CONFIG } from '../config/config.js';

export class DataService {
    constructor() {
        this.googleMaps = new GoogleMapsService();
        this.mockServices = mockServices;
        this.useRealData = !!CONFIG.GOOGLE_MAPS_API_KEY; // Only use real data if API key is available
        this.cache = new Map(); // Cache results
        this.cacheTimeout = CONFIG.CACHE_DURATION;
        
        // Track API usage for debugging
        this.requestCount = 0;
        this.lastRequestTime = 0;
    }

    async getAllServices(userLocation = null) {
        try {
            if (!this.useRealData || !userLocation) {
                console.log('Using mock data - location not available or real data disabled');
                return this.mockServices;
            }

            const cacheKey = `all_${userLocation.lat},${userLocation.lng}`;
            const cached = this.cache.get(cacheKey);
            
            if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
                console.log('Using cached data for all services');
                return cached.data;
            }

            console.log('Fetching all real services from Google Maps API...');
            const realServices = await this.getRealServices(userLocation);
            
            // Cache the results
            this.cache.set(cacheKey, {
                data: realServices,
                timestamp: Date.now()
            });

            return realServices;
        } catch (error) {
            console.error('Failed to fetch all services, using mock data:', error);
            return this.mockServices;
        }
    }

    async getServicesByCategory(category, userLocation = null) {
        try {
            if (!this.useRealData || !userLocation) {
                return this.mockServices.filter(service => service.category === category);
            }

            const cacheKey = `${category}_${userLocation.lat},${userLocation.lng}`;
            const cached = this.cache.get(cacheKey);
            
            if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
                console.log(`Using cached data for ${category} services`);
                return cached.data;
            }

            console.log(`Fetching ${category} services from Google Maps API...`);
            this.trackRequest();
            
            const services = await this.googleMaps.searchByCategory(
                userLocation, 
                category, 
                CONFIG.DEFAULT_SEARCH_RADIUS
            );
            
            // Cache the results
            this.cache.set(cacheKey, {
                data: services,
                timestamp: Date.now()
            });

            return services;
        } catch (error) {
            console.error(`Failed to fetch ${category} services:`, error);
            return this.mockServices.filter(service => service.category === category);
        }
    }

    async searchByText(query, userLocation) {
        try {
            if (!this.useRealData || !userLocation) {
                // Search in mock data
                return this.mockServices.filter(service =>
                    service.name.toLowerCase().includes(query.toLowerCase()) ||
                    service.category.toLowerCase().includes(query.toLowerCase()) ||
                    service.address.toLowerCase().includes(query.toLowerCase())
                );
            }

            const cacheKey = `search_${query}_${userLocation.lat},${userLocation.lng}`;
            const cached = this.cache.get(cacheKey);
            
            if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
                console.log(`Using cached search results for "${query}"`);
                return cached.data;
            }

            console.log(`Searching for "${query}" using Google Maps API...`);
            this.trackRequest();
            
            // Use Google Maps text search
            const services = await this.googleMaps.textSearch(
                query, 
                userLocation, 
                CONFIG.DEFAULT_SEARCH_RADIUS
            );
            
            // Cache the results
            this.cache.set(cacheKey, {
                data: services,
                timestamp: Date.now()
            });
            
            console.log(`Found ${services.length} results for "${query}"`);
            return services;
        } catch (error) {
            console.error(`Failed to search for "${query}":`, error);
            
            // Fallback to mock data search
            return this.mockServices.filter(service =>
                service.name.toLowerCase().includes(query.toLowerCase()) ||
                service.category.toLowerCase().includes(query.toLowerCase()) ||
                service.address.toLowerCase().includes(query.toLowerCase())
            );
        }
    }

    async getRealServices(userLocation) {
        const categories = ['pharmacy', 'grocery', 'restaurant', 'mall', 'market', 'hospital', 'gas'];
        const allServices = [];
        const maxResultsPerCategory = 10; // Reduced to avoid too many requests

        for (const category of categories) {
            try {
                console.log(`Searching for ${category} services...`);
                this.trackRequest();
                
                const services = await this.googleMaps.searchByCategory(
                    userLocation, 
                    category, 
                    CONFIG.DEFAULT_SEARCH_RADIUS
                );
                
                // Limit results per category
                allServices.push(...services.slice(0, maxResultsPerCategory));
                
                // Add delay to respect rate limits
                await this.delay(300);
            } catch (error) {
                console.warn(`Failed to fetch ${category} services:`, error);
                // Continue with other categories
            }
        }

        console.log(`Found ${allServices.length} real services total`);
        return allServices;
    }

    async addService(service) {
        // For real implementation, this would save to your backend
        return new Promise((resolve) => {
            setTimeout(() => {
                const newService = {
                    ...service,
                    id: Date.now(),
                    isOpen: this.isServiceOpen(service.hours),
                    source: 'user_added'
                };
                this.mockServices.push(newService);
                resolve(newService);
            }, 100);
        });
    }

    isServiceOpen(hours) {
        if (!hours || hours.includes('not available')) return null;
        if (hours.includes('24') || hours.includes('open')) return true;
        if (hours.includes('closed')) return false;
        
        const now = new Date();
        const currentHour = now.getHours();
        return currentHour >= 8 && currentHour <= 22;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    trackRequest() {
        this.requestCount++;
        this.lastRequestTime = Date.now();
        
        if (CONFIG.IS_DEVELOPMENT) {
            console.log(`API Request #${this.requestCount}`);
        }
    }

    // Toggle between real and mock data
    setUseRealData(useReal) {
        this.useRealData = useReal && !!CONFIG.GOOGLE_MAPS_API_KEY;
        this.clearCache(); // Clear cache when switching
        console.log(`Switched to ${this.useRealData ? 'real' : 'mock'} data`);
    }

    // Clear cache manually
    clearCache() {
        this.cache.clear();
        console.log('Cache cleared');
    }

    // Get cache stats
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            requestCount: this.requestCount,
            lastRequest: this.lastRequestTime
        };
    }

    // Get service status
    getServiceStatus() {
        const googleMapsStatus = this.googleMaps.getApiStatus();
        
        return {
            useRealData: this.useRealData,
            apiKeyConfigured: !!CONFIG.GOOGLE_MAPS_API_KEY,
            googleMapsApi: googleMapsStatus,
            cacheSize: this.cache.size,
            totalRequests: this.requestCount
        };
    }

    // Preload services for better UX
    async preloadNearbyServices(userLocation) {
        if (!userLocation || !this.useRealData) return;

        try {
            // Preload popular categories in background
            const popularCategories = ['pharmacy', 'restaurant', 'grocery'];
            
            for (const category of popularCategories) {
                // Don't await - run in background
                this.getServicesByCategory(category, userLocation).catch(err => {
                    console.warn(`Failed to preload ${category}:`, err);
                });
                
                await this.delay(200);
            }
            
            console.log('Background preloading started for popular categories');
        } catch (error) {
            console.warn('Failed to preload services:', error);
        }
    }

    // Check if we can use real data
    canUseRealData() {
        return this.useRealData && CONFIG.GOOGLE_MAPS_API_KEY && this.googleMaps.isApiLoaded();
    }
}