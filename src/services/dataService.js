import { GooglePlacesService } from './googlePlacesService.js';
import { mockServices } from '../data/mockData.js';
import { CONFIG } from '../config/config.js';

export class DataService {
    constructor() {
        this.googlePlaces = new GooglePlacesService();
        this.mockServices = mockServices;
        this.useRealData = true; // Enable real data
        this.cache = new Map(); // Cache results
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
    }

    async getAllServices(userLocation = null) {
        try {
            if (!this.useRealData || !userLocation) {
                console.log('Using mock data - location not available or real data disabled');
                return this.mockServices;
            }

            const cacheKey = `${userLocation.lat},${userLocation.lng}`;
            const cached = this.cache.get(cacheKey);
            
            if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
                console.log('Using cached data');
                return cached.data;
            }

            console.log('Fetching real data from Google Places...');
            const realServices = await this.getRealServices(userLocation);
            
            // Cache the results
            this.cache.set(cacheKey, {
                data: realServices,
                timestamp: Date.now()
            });

            return realServices;
        } catch (error) {
            console.error('Failed to fetch real data, using mock data:', error);
            return this.mockServices;
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

        console.log(`Searching for "${query}"...`);
        
        // Use Google Places text search
        const services = await this.googlePlaces.searchNearbyPlaces(
            userLocation, 
            query, 
            CONFIG.DEFAULT_SEARCH_RADIUS
        );
        
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
        const maxResultsPerCategory = 20;

        for (const category of categories) {
            try {
                console.log(`Searching for ${category} services...`);
                const services = await this.googlePlaces.searchByCategory(
                    userLocation, 
                    category, 
                    CONFIG.DEFAULT_SEARCH_RADIUS
                );
                
                // Limit results per category to avoid too many results
                allServices.push(...services.slice(0, maxResultsPerCategory));
                
                // Add small delay to respect rate limits
                await this.delay(100);
            } catch (error) {
                console.warn(`Failed to fetch ${category} services:`, error);
            }
        }

        console.log(`Found ${allServices.length} real services`);
        return allServices;
    }

    async getServicesByCategory(category, userLocation = null) {
        try {
            if (!this.useRealData || !userLocation) {
                return this.mockServices.filter(service => service.category === category);
            }

            return await this.googlePlaces.searchByCategory(userLocation, category);
        } catch (error) {
            console.error(`Failed to fetch ${category} services:`, error);
            return this.mockServices.filter(service => service.category === category);
        }
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

    // Toggle between real and mock data
    setUseRealData(useReal) {
        this.useRealData = useReal;
        this.cache.clear(); // Clear cache when switching
    }

    // Clear cache manually
    clearCache() {
        this.cache.clear();
    }
}

// import { mockServices } from '../data/mockData.js';

// export class DataService {
//     constructor() {
//         this.services = mockServices;
//     }
    
//     async getAllServices() {
//         // Simulate API call
//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 resolve(this.services);
//             }, 100);
//         });
//     }
    
//     async getServicesByCategory(category) {
//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 const filtered = this.services.filter(service => 
//                     service.category === category
//                 );
//                 resolve(filtered);
//             }, 100);
//         });
//     }
    
//     async addService(service) {
//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 const newService = {
//                     ...service,
//                     id: Date.now(),
//                     isOpen: this.isServiceOpen(service.hours)
//                 };
//                 this.services.push(newService);
//                 resolve(newService);
//             }, 100);
//         });
//     }
    
//     isServiceOpen(hours) {
//         // Simple check - in a real app, you'd have more sophisticated logic
//         const now = new Date();
//         const currentHour = now.getHours();
//         return currentHour >= 8 && currentHour <= 22;
//     }
// }