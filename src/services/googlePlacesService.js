import { CONFIG } from '../config/config.js';

export class GooglePlacesService {
    constructor() {
        this.apiKey = CONFIG.GOOGLE_PLACES_API_KEY;
        this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
        this.corsProxy = 'https://cors-anywhere.herokuapp.com/'; // For development only
    }

    async searchNearbyPlaces(location, type, radius = CONFIG.DEFAULT_SEARCH_RADIUS) {
        // Use the new Places API (New) - Text Search
        const url = `${this.corsProxy}${this.baseUrl}/textsearch/json?query=${type}&location=${location.lat},${location.lng}&radius=${radius}&key=${this.apiKey}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
                throw new Error(`Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
            }
            
            return this.transformPlacesData(data.results, type);
        } catch (error) {
            console.error('Google Places API error:', error);
            throw error;
        }
    }

    async searchNearbyByType(location, placeType, radius = CONFIG.DEFAULT_SEARCH_RADIUS) {
        // Use Nearby Search for specific place types
        const url = `${this.corsProxy}${this.baseUrl}/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=${placeType}&key=${this.apiKey}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
                throw new Error(`Places API error: ${data.status}`);
            }
            
            return this.transformPlacesData(data.results, placeType);
        } catch (error) {
            console.error('Google Places API error:', error);
            throw error;
        }
    }

    async getPlaceDetails(placeId) {
        const fields = 'place_id,name,formatted_address,geometry,formatted_phone_number,opening_hours,rating,user_ratings_total,website,photos,price_level';
        const url = `${this.corsProxy}${this.baseUrl}/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === 'OK') {
                return data.result;
            }
            throw new Error(`Place details error: ${data.status}`);
        } catch (error) {
            console.error('Place details error:', error);
            return null;
        }
    }

    transformPlacesData(places, searchType) {
        return places.map((place, index) => ({
            id: place.place_id || `${searchType}_${index}`,
            googlePlaceId: place.place_id,
            name: place.name,
            category: this.mapGoogleTypeToCategory(searchType, place.types),
            address: place.formatted_address || place.vicinity || 'Address not available',
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            hours: this.formatOpeningHours(place.opening_hours),
            phone: place.formatted_phone_number || 'Not available',
            isOpen: place.opening_hours?.open_now ?? null,
            rating: place.rating || 0,
            reviews: place.user_ratings_total || 0,
            priceLevel: place.price_level || 0,
            website: place.website || null,
            photo: place.photos?.[0] ? this.getPhotoUrl(place.photos[0].photo_reference) : null,
            source: 'google_places'
        }));
    }

    mapGoogleTypeToCategory(searchType, placeTypes = []) {
        // Primary mapping based on search type
        const searchTypeMap = {
            'pharmacy': 'pharmacy',
            'grocery_or_supermarket': 'grocery',
            'supermarket': 'grocery',
            'restaurant': 'restaurant',
            'food': 'restaurant',
            'shopping_mall': 'mall',
            'hospital': 'hospital',
            'gas_station': 'gas',
            'market': 'market'
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
        
        if (openingHours.open_now === false) {
            return 'Currently closed';
        } else if (openingHours.open_now === true) {
            return 'Currently open';
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

    getPhotoUrl(photoReference, maxWidth = 400) {
        return `${this.baseUrl}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
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
                const results = await this.searchNearbyPlaces(location, term, radius);
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
}