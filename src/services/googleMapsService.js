import { CONFIG } from '../config/config.js';

export class GoogleMapsService {
    constructor() {
        this.apiKey = CONFIG.GOOGLE_MAPS_API_KEY;
        this.isLoaded = false;
        this.placesService = null;
        this.map = null;
        this.loadPromise = null;
        
        if (!this.apiKey) {
            console.error('Google Maps API key not configured');
        }
    }

    async loadGoogleMaps() {
        // Return existing promise if already loading
        if (this.loadPromise) {
            return this.loadPromise;
        }

        // Return immediately if already loaded
        if (this.isLoaded && window.google && window.google.maps) {
            return Promise.resolve();
        }

        this.loadPromise = new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.google && window.google.maps && window.google.maps.places) {
                this.initializeServices();
                resolve();
                return;
            }

            // Create callback function
            const callbackName = 'initGoogleMaps_' + Date.now();
            window[callbackName] = () => {
                try {
                    this.initializeServices();
                    delete window[callbackName]; // Cleanup
                    resolve();
                } catch (error) {
                    delete window[callbackName]; // Cleanup
                    reject(error);
                }
            };

            // Create and load script
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places&callback=${callbackName}`;
            script.async = true;
            script.defer = true;
            
            script.onerror = () => {
                delete window[callbackName]; // Cleanup
                reject(new Error('Failed to load Google Maps API'));
            };

            document.head.appendChild(script);
        });

        return this.loadPromise;
    }

    initializeServices() {
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            throw new Error('Google Maps API not loaded properly');
        }

        // Create a hidden div for PlacesService
        const mapDiv = document.createElement('div');
        mapDiv.style.display = 'none';
        document.body.appendChild(mapDiv);

        // Initialize map (required for PlacesService)
        this.map = new window.google.maps.Map(mapDiv, {
            center: CONFIG.DEFAULT_CITY_CENTER,
            zoom: 13
        });

        // Initialize PlacesService
        this.placesService = new window.google.maps.places.PlacesService(this.map);
        this.isLoaded = true;
    }

    async searchNearby(location, type, radius = CONFIG.DEFAULT_SEARCH_RADIUS) {
        await this.loadGoogleMaps();

        if (!this.placesService) {
            throw new Error('Places service not initialized');
        }

        return new Promise((resolve, reject) => {
            const request = {
                location: new window.google.maps.LatLng(location.lat, location.lng),
                radius: radius,
                keyword: type,
                type: this.getPlaceType(type)
            };

            this.placesService.nearbySearch(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    resolve(this.transformResults(results, type));
                } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    resolve([]);
                } else {
                    reject(new Error(`Places service failed: ${status}`));
                }
            });
        });
    }

    async textSearch(query, location, radius = CONFIG.DEFAULT_SEARCH_RADIUS) {
        await this.loadGoogleMaps();

        if (!this.placesService) {
            throw new Error('Places service not initialized');
        }

        return new Promise((resolve, reject) => {
            const request = {
                query: query,
                location: new window.google.maps.LatLng(location.lat, location.lng),
                radius: radius
            };

            this.placesService.textSearch(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    resolve(this.transformResults(results, query));
                } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    resolve([]);
                } else {
                    reject(new Error(`Text search failed: ${status}`));
                }
            });
        });
    }

    async getPlaceDetails(placeId) {
        await this.loadGoogleMaps();

        if (!this.placesService) {
            throw new Error('Places service not initialized');
        }

        return new Promise((resolve, reject) => {
            const request = {
                placeId: placeId,
                fields: [
                    'place_id', 'name', 'formatted_address', 'geometry',
                    'formatted_phone_number', 'opening_hours', 'rating',
                    'user_ratings_total', 'website', 'photos', 'price_level',
                    'types'
                ]
            };

            this.placesService.getDetails(request, (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    resolve(this.transformSingleResult(place));
                } else {
                    reject(new Error(`Place details failed: ${status}`));
                }
            });
        });
    }

    transformResults(results, searchType) {
        return results.map((place, index) => this.transformSingleResult(place, searchType, index));
    }

    transformSingleResult(place, searchType = '', index = 0) {
        return {
            id: place.place_id || `${searchType}_${index}`,
            googlePlaceId: place.place_id,
            name: place.name,
            category: this.mapGoogleTypeToCategory(searchType, place.types),
            address: place.formatted_address || place.vicinity || 'Address not available',
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            hours: this.formatOpeningHours(place.opening_hours),
            phone: place.formatted_phone_number || 'Not available',
            isOpen: place.opening_hours?.isOpen?.() ?? null,
            rating: place.rating || 0,
            reviews: place.user_ratings_total || 0,
            priceLevel: place.price_level || 0,
            website: place.website || null,
            photo: place.photos?.[0] ? this.getPhotoUrl(place.photos[0]) : null,
            source: 'google_maps_js_api'
        };
    }

    getPlaceType(searchType) {
        const typeMap = {
            'pharmacy': 'pharmacy',
            'grocery': 'grocery_or_supermarket',
            'restaurant': 'restaurant',
            'mall': 'shopping_mall',
            'market': 'grocery_or_supermarket',
            'hospital': 'hospital',
            'gas': 'gas_station'
        };
        return typeMap[searchType] || searchType;
    }

    mapGoogleTypeToCategory(searchType, placeTypes = []) {
        // Primary mapping based on search type
        const searchTypeMap = {
            'pharmacy': 'pharmacy',
            'grocery': 'grocery',
            'restaurant': 'restaurant',
            'mall': 'mall',
            'market': 'market',
            'hospital': 'hospital',
            'gas': 'gas'
        };

        // Secondary mapping based on place types
        const typeMap = {
            'pharmacy': 'pharmacy',
            'grocery_or_supermarket': 'grocery',
            'supermarket': 'grocery',
            'restaurant': 'restaurant',
            'food': 'restaurant',
            'meal_takeaway': 'restaurant',
            'shopping_mall': 'mall',
            'hospital': 'hospital',
            'gas_station': 'gas',
            'convenience_store': 'market'
        };

        // Check search type first
        if (searchTypeMap[searchType]) {
            return searchTypeMap[searchType];
        }

        // Check place types
        for (const type of placeTypes) {
            if (typeMap[type]) {
                return typeMap[type];
            }
        }

        return 'other';
    }

    formatOpeningHours(openingHours) {
        if (!openingHours) return 'Hours not available';
        
        if (openingHours.isOpen) {
            if (openingHours.isOpen()) {
                return 'Currently open';
            } else {
                return 'Currently closed';
            }
        }
        
        // If we have detailed hours
        if (openingHours.weekday_text && openingHours.weekday_text.length > 0) {
            const today = new Date().getDay();
            const daysMap = [6, 0, 1, 2, 3, 4, 5]; // Sunday = 0, Monday = 1, etc.
            const todayIndex = daysMap[today];
            return openingHours.weekday_text[todayIndex] || 'Hours not available';
        }
        
        return 'Check hours';
    }

    getPhotoUrl(photo, maxWidth = 400) {
        if (!photo || !photo.getUrl) return null;
        return photo.getUrl({ maxWidth });
    }

    // Search for specific business types in your city
    async searchByCategory(location, category, radius = CONFIG.DEFAULT_SEARCH_RADIUS) {
        const categoryMap = {
            'pharmacy': ['pharmacy', 'drug store'],
            'grocery': ['grocery store', 'supermarket'],
            'restaurant': ['restaurant', 'food'],
            'mall': ['shopping mall', 'shopping center'],
            'market': ['market', 'grocery store'],
            'hospital': ['hospital', 'medical center'],
            'gas': ['gas station', 'petrol station']
        };

        const searchTerms = categoryMap[category] || [category];
        const allResults = [];

        for (const term of searchTerms) {
            try {
                const results = await this.searchNearby(location, term, radius);
                allResults.push(...results);
            } catch (error) {
                console.warn(`Failed to search for ${term}:`, error);
            }
        }

        // Remove duplicates based on place ID
        const uniqueResults = allResults.filter((place, index, self) => 
            index === self.findIndex(p => p.googlePlaceId === place.googlePlaceId)
        );

        return uniqueResults;
    }

    // Check if API is available
    isApiLoaded() {
        return this.isLoaded && window.google && window.google.maps && window.google.maps.places;
    }

    // Get API status
    getApiStatus() {
        return {
            keyConfigured: !!this.apiKey,
            apiLoaded: this.isApiLoaded(),
            placesServiceReady: !!this.placesService
        };
    }
}