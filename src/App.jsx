import SearchBar from './components/SearchBar.js';
import ServiceFilters from './components/ServiceFilters.js';
import LocationPermission from './components/LocationPermission.js';
import MapView from './components/MapView.js';
import ServiceCard from './components/ServiceCard.js';
import { LocationService } from './services/locationService.js';
import { DataService } from './services/dataService.js';
import { calculateDistance } from './utils/helpers.js';

class App {
    constructor() {
        this.userLocation = null;
        this.services = [];
        this.filteredServices = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.hasSearched = false; // Track if user has searched
        this.isLoading = false;
        
        // Initialize services
        this.locationService = new LocationService();
        this.dataService = new DataService();
        
        // Initialize components
        this.searchBar = new SearchBar();
        this.serviceFilters = new ServiceFilters();
        this.locationPermission = new LocationPermission();
        this.mapView = new MapView();
        this.serviceCard = new ServiceCard();
        
        this.bindEvents();
    }
    
    async init() {
        try {
            // Initialize components but don't load data yet
            this.searchBar.render();
            this.serviceFilters.render();
            this.locationPermission.render();
            this.mapView.render();
            
            // Show welcome message instead of loading data
            this.showWelcomeMessage();
            
            // Try to get user location (but don't search yet)
            await this.getUserLocation();
            
        } catch (error) {
            console.error('App initialization failed:', error);
            this.showWelcomeMessage();
        }
    }
    
    bindEvents() {
        // Search events
        document.addEventListener('search', (e) => {
            this.searchQuery = e.detail.query;
            
            // Clear filters when user searches
            if (this.searchQuery.trim()) {
                this.clearActiveFilter();
            }
            
            this.performSearch();
        });
        
        // Filter events
        document.addEventListener('filterChange', (e) => {
            this.currentFilter = e.detail.filter;
            
            // Clear search when user selects a filter
            if (this.currentFilter !== 'all') {
                this.clearSearchInput();
            }
            
            this.performSearch();
        });
        
        // Location events
        document.addEventListener('locationGranted', (e) => {
            this.userLocation = e.detail.location;
            this.mapView.updateUserLocation(this.userLocation);
            this.locationPermission.hidePermissionCard();
            
            // If user has already searched, refresh results with location
            if (this.hasSearched) {
                this.performSearch();
            }
        });
        
        // Service card events
        document.addEventListener('getDirections', (e) => {
            this.showDirections(e.detail.service);
        });
    }
    
    clearActiveFilter() {
        // Reset filter to 'all'
        this.currentFilter = 'all';
        
        // Update filter buttons UI
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === 'all') {
                btn.classList.add('active');
            }
        });
    }
    
    clearSearchInput() {
        // Clear search input
        this.searchQuery = '';
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
    }
    
    async getUserLocation() {
        try {
            const location = await this.locationService.getCurrentPosition();
            this.userLocation = location;
            this.mapView.updateUserLocation(location);
            this.locationPermission.hidePermissionCard();
        } catch (error) {
            console.log('Location access denied or failed');
        }
    }
    
    async performSearch() {
        // If search is cleared and no specific filter, show welcome
        if (!this.searchQuery.trim() && this.currentFilter === 'all') {
            this.showWelcomeMessage();
            this.hasSearched = false;
            return;
        }
        
        if (this.isLoading) return; // Prevent multiple simultaneous searches
        
        this.isLoading = true;
        this.hasSearched = true;
        this.showLoadingState();
        
        try {
            // Load services based on search query or filter
            await this.loadServices();
            
            // Filter and display results
            this.filterAndDisplayServices();
            
        } catch (error) {
            console.error('Search failed:', error);
            this.showError('Failed to search for services. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }
    
    async loadServices() {
        if (!this.userLocation) {
            throw new Error('Location required for search');
        }
        
        // If we have a specific search query, search for it
        if (this.searchQuery.trim()) {
            this.services = await this.searchSpecificQuery(this.searchQuery);
        }
        // If we have a category filter, search for that category
        else if (this.currentFilter !== 'all') {
            this.services = await this.dataService.getServicesByCategory(
                this.currentFilter, 
                this.userLocation
            );
        }
        // Otherwise, get all services
        else {
            this.services = await this.dataService.getAllServices(this.userLocation);
        }
        
        // Calculate distances
        this.updateServicesWithDistance();
    }
    
    async searchSpecificQuery(query) {
        // Use Google Places to search for the specific query
        const searchTerms = query.toLowerCase().trim();
        
        // Try to match query to categories first
        const categoryMap = {
            'pharmacy': 'pharmacy',
            'pharmacies': 'pharmacy',
            'drug store': 'pharmacy',
            'medicine': 'pharmacy',
            'grocery': 'grocery',
            'supermarket': 'grocery',
            'food store': 'grocery',
            'restaurant': 'restaurant',
            'food': 'restaurant',
            'eat': 'restaurant',
            'dining': 'restaurant',
            'mall': 'mall',
            'shopping': 'mall',
            'market': 'market',
            'hospital': 'hospital',
            'medical': 'hospital',
            'health': 'hospital',
            'gas': 'gas',
            'fuel': 'gas',
            'petrol': 'gas'
        };
        
        // Check if query matches a category
        let category = null;
        for (const [key, value] of Object.entries(categoryMap)) {
            if (searchTerms.includes(key)) {
                category = value;
                break;
            }
        }
        
        if (category) {
            // Search by category
            return await this.dataService.getServicesByCategory(category, this.userLocation);
        } else {
            // Search by text query using Google Places
            return await this.dataService.searchByText(query, this.userLocation);
        }
    }
    
    updateServicesWithDistance() {
        if (!this.userLocation) return;
        
        this.services = this.services.map(service => ({
            ...service,
            distance: calculateDistance(
                this.userLocation.lat,
                this.userLocation.lng,
                service.latitude,
                service.longitude
            )
        }));
    }
    
    filterAndDisplayServices() {
        let filtered = this.services;
        
        // Apply category filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(service => 
                service.category === this.currentFilter
            );
        }
        
        // Apply search filter (if not already searched by text)
        if (this.searchQuery && !this.searchQuery.toLowerCase().includes('pharmacy') && 
            !this.searchQuery.toLowerCase().includes('restaurant')) {
            filtered = filtered.filter(service =>
                service.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                service.category.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                service.address.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }
        
        // Sort by distance if available
        if (this.userLocation) {
            filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }
        
        this.filteredServices = filtered;
        this.displayResults();
        this.mapView.updateMarkers(filtered, this.userLocation);
    }
    
    displayResults() {
        const container = document.getElementById('results-container');
        
        if (this.filteredServices.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>No services found</h3>
                    <p>Try searching for "${this.searchQuery}" or select a different category</p>
                    <div class="search-suggestions">
                        <h4>Try searching for:</h4>
                        <div class="suggestion-chips">
                            <button class="suggestion-chip" onclick="this.performQuickSearch('pharmacy')">Pharmacies</button>
                            <button class="suggestion-chip" onclick="this.performQuickSearch('restaurant')">Restaurants</button>
                            <button class="suggestion-chip" onclick="this.performQuickSearch('grocery')">Grocery Stores</button>
                            <button class="suggestion-chip" onclick="this.performQuickSearch('hospital')">Hospitals</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Bind suggestion chip events
            const suggestions = container.querySelectorAll('.suggestion-chip');
            suggestions.forEach(chip => {
                chip.addEventListener('click', (e) => {
                    const searchTerm = e.target.textContent.toLowerCase();
                    document.getElementById('search-input').value = searchTerm;
                    this.searchQuery = searchTerm;
                    this.performSearch();
                });
            });
            
            return;
        }
        
        // Show results count
        container.innerHTML = `
            <div class="results-header">
                <h3>Found ${this.filteredServices.length} services</h3>
                ${this.searchQuery ? `<p>Showing results for "${this.searchQuery}"</p>` : ''}
            </div>
            <div class="results-grid" id="results-grid"></div>
        `;
        
        const gridContainer = container.querySelector('#results-grid');
        
        this.filteredServices.forEach(service => {
            const cardElement = this.serviceCard.render(service);
            gridContainer.appendChild(cardElement);
        });
    }
    
    showWelcomeMessage() {
        const container = document.getElementById('results-container');
        container.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">🏙️</div>
                <h2>Welcome to City Services</h2>
                <p>Find nearby pharmacies, restaurants, stores, and more in your city</p>
                
                <div class="getting-started">
                    <h3>Getting Started:</h3>
                    <div class="steps">
                        <div class="step">
                            <span class="step-number">1</span>
                            <span class="step-text">Enable location access for better results</span>
                        </div>
                        <div class="step">
                            <span class="step-number">2</span>
                            <span class="step-text">Search for services or select a category</span>
                        </div>
                        <div class="step">
                            <span class="step-number">3</span>
                            <span class="step-text">Get directions to your destination</span>
                        </div>
                    </div>
                </div>
                
                <div class="quick-search">
                    <h3>Popular Searches:</h3>
                    <div class="popular-buttons">
                        <button class="popular-btn" data-search="pharmacy">💊 Pharmacies</button>
                        <button class="popular-btn" data-search="restaurant">🍽️ Restaurants</button>
                        <button class="popular-btn" data-search="grocery">🛒 Grocery Stores</button>
                        <button class="popular-btn" data-search="hospital">🏥 Hospitals</button>
                    </div>
                </div>
            </div>
        `;
        
        // Bind popular search buttons
        const popularButtons = container.querySelectorAll('.popular-btn');
        popularButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const searchTerm = e.target.dataset.search;
                document.getElementById('search-input').value = searchTerm;
                this.searchQuery = searchTerm;
                this.performSearch();
            });
        });
    }
    
    showLoadingState() {
        const container = document.getElementById('results-container');
        container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <h3>Searching for services...</h3>
                <p>Finding ${this.searchQuery || 'services'} near you</p>
            </div>
        `;
    }
    
    showError(message) {
        const container = document.getElementById('results-container');
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>${message}</h3>
                <div class="error-actions">
                    <button onclick="location.reload()" class="retry-btn">Retry</button>
                    <button onclick="this.showWelcomeMessage()" class="back-btn">Back to Home</button>
                </div>
            </div>
        `;
    }
    
    showDirections(service) {
        if (!this.userLocation) {
            alert('Please enable location access to get directions');
            return;
        }
        
        const url = `https://www.google.com/maps/dir/${this.userLocation.lat},${this.userLocation.lng}/${service.latitude},${service.longitude}`;
        window.open(url, '_blank');
    }
}

export default App;