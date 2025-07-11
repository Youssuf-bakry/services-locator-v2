import { useState, useEffect } from 'preact/hooks';
import { SearchBar } from './components/SearchBar';
import { ServiceFilters } from './components/ServiceFilters';
import { LocationPermission } from './components/LocationPermission';
import { MapView } from './components/MapView';
import { ServiceCard } from './components/ServiceCard';
import { WelcomeMessage } from './components/WelcomeMessage';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { NoResultsState } from './components/NoResultsState';
import { DataService } from './services/dataService';
import { LocationService } from './services/locationService';
import { calculateDistance } from './utils/helpers';
import { MobileDebug } from './components/MobileDebug';

const dataService = new DataService();
const locationService = new LocationService();

export const App = () => {
    const [showMobileDebug, setShowMobileDebug] = useState(false)

    const [userLocation, setUserLocation] = useState(null);
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [currentFilter, setCurrentFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState(null);
    const [showLocationPermission, setShowLocationPermission] = useState(true);

    // Get user location on mount
    useEffect(() => {
        getUserLocation();
    }, []);
 useEffect(() => {
        if (searchQuery.trim() || currentFilter !== 'all') {
            performSearch();
        } else {
            // Reset to welcome state
            setHasSearched(false);
            setServices([]);
            setFilteredServices([]);
            setError(null);
        }
    }, [searchQuery, currentFilter, userLocation]);

    const getUserLocation = async () => {
        try {
            const location = await locationService.getCurrentPosition();
            setUserLocation(location);
            setShowLocationPermission(false);
        } catch (err) {
            console.log('Location access denied or failed');
        }
    };

    const performSearch = async () => {
        if (!searchQuery.trim() && currentFilter === 'all') {
            setHasSearched(false);
            setServices([]);
            setFilteredServices([]);
            setError(null);
            return;
        }

        setIsLoading(true);
        setHasSearched(true);
        setError(null);

        try {
            let results;
            
            if (searchQuery.trim()) {
                results = await searchSpecificQuery(searchQuery);
            } else if (currentFilter !== 'all') {
                results = await dataService.getServicesByCategory(currentFilter, userLocation);
            } else {
                results = await dataService.getAllServices(userLocation);
            }

            // Add distances and sort
            if (userLocation) {
                results = results.map(service => ({
                    ...service,
                    distance: calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        service.latitude,
                        service.longitude
                    )
                })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
            }

            setServices(results);
            setFilteredServices(results);
        } catch (error) {
            console.error('Search failed:', error);
            setError('Failed to search for services. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const searchSpecificQuery = async (query) => {
        const searchTerms = query.toLowerCase().trim();
        
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
            return await dataService.getServicesByCategory(category, userLocation);
        } else {
            return await dataService.searchByText(query, userLocation);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim()) {
            setCurrentFilter('all');
        }
        performSearch();
    };

    const handleFilterChange = (filter) => {
        setCurrentFilter(filter);
        if (filter !== 'all') {
            setSearchQuery('');
        }
        performSearch();
    };

    const handleLocationGranted = (location) => {
        setUserLocation(location);
        setShowLocationPermission(false);
        
        // If user has already searched, refresh results with location
        if (hasSearched) {
            performSearch();
        }
    };

    const handleGetDirections = (service) => {
        if (!userLocation) {
            alert('Please enable location access to get directions');
            return;
        }
        
        const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${service.latitude},${service.longitude}`;
        window.open(url, '_blank');
    };

    const clearError = () => {
        setError(null);
        setHasSearched(false);
        setSearchQuery('');
        setCurrentFilter('all');
    };

    const renderMainContent = () => {
        if (error) {
            return (
                <ErrorState 
                    message={error}
                    onRetry={() => window.location.reload()}
                    onBackToHome={clearError}
                />
            );
        }

        if (isLoading) {
            return <LoadingState searchQuery={searchQuery} />;
        }

        if (!hasSearched) {
            return <WelcomeMessage onQuickSearch={handleSearch} />;
        }

        if (filteredServices.length === 0) {
            return (
                <NoResultsState 
                    searchQuery={searchQuery}
                    onSuggestionClick={handleSearch}
                />
            );
        }

        return (
            <>
                <div className="results-header">
                    <h3>Found {filteredServices.length} services</h3>
                    {searchQuery && <p>Showing results for "{searchQuery}"</p>}
                </div>
                <div className="results-grid">
                    {filteredServices.map(service => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            onGetDirections={handleGetDirections}
                        />
                    ))}
                </div>
            </>
        );
    };

    return (
        <div id="app">
            <header className="header">
                <h1>🏙️ City Services</h1>
                <p>Find nearby services in your area</p>
            </header>
            
            <main className="main-content">
                <div id="search-container">
                    <SearchBar 
                        onSearch={handleSearch}
                        searchQuery={searchQuery}
                        onQueryChange={setSearchQuery}
                    />
                </div>
                
                <div id="filters-container">
                    <ServiceFilters 
                        activeFilter={currentFilter}
                        onFilterChange={handleFilterChange}
                    />
                </div>
                
                {showLocationPermission && (
                    <div id="location-permission">
                        <LocationPermission onLocationGranted={handleLocationGranted} />
                    </div>
                )}
                
                <div id="map-container" hidden>
                    <MapView 
                        userLocation={userLocation}
                        services={filteredServices}
                    />
                </div>
                
                <div id="results-container">
                    {renderMainContent()}
                </div>
            </main>
           <button 
    onClick={() => setShowMobileDebug(true)}
    style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#ff6b6b',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        fontSize: '24px',
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}
    title="Mobile Debug"
>
    🔧
</button>
{/* Mobile Debug Component */}
{showMobileDebug && (
    <MobileDebug onClose={() => setShowMobileDebug(false)} />
)}
        </div>
    );
};