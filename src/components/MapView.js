class MapView {
    constructor() {
        this.container = document.getElementById('map-container');
        this.map = null;
        this.userMarker = null;
        this.serviceMarkers = [];
    }
    
    render() {
        this.container.innerHTML = `
            <div class="map-section">
                <h3>📍 Map View</h3>
                <div id="map" class="map-canvas"></div>
            </div>
        `;
        
        this.initMap();
    }
    
    initMap() {
        // Default center (you can change this to your city's coordinates)
        const defaultCenter = [24.7136, 46.6753]; // Riyadh coordinates
        
        this.map = L.map('map').setView(defaultCenter, 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    }
    
    updateUserLocation(location) {
        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
        }
        
        this.userMarker = L.marker([location.lat, location.lng], {
            icon: L.divIcon({
                className: 'user-marker',
                html: '📍',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(this.map);
        
        this.map.setView([location.lat, location.lng], 15);
    }
    
    updateMarkers(services, userLocation) {
        // Clear existing service markers
        this.serviceMarkers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.serviceMarkers = [];
        
        // Add service markers
        services.forEach(service => {
            const marker = L.marker([service.latitude, service.longitude], {
                icon: L.divIcon({
                    className: 'service-marker',
                    html: this.getServiceIcon(service.category),
                    iconSize: [25, 25],
                    iconAnchor: [12, 12]
                })
            }).addTo(this.map);
            
            const popupContent = `
                <div class="map-popup">
                    <h4>${service.name}</h4>
                    <p><strong>Category:</strong> ${service.category}</p>
                    <p><strong>Hours:</strong> ${service.hours}</p>
                    ${service.distance ? `<p><strong>Distance:</strong> ${service.distance.toFixed(2)} km</p>` : ''}
                    <button onclick="window.getDirections(${service.id})" class="popup-btn">
                        Get Directions
                    </button>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            this.serviceMarkers.push(marker);
        });
        
        // Add global function for directions
        window.getDirections = (serviceId) => {
            const service = services.find(s => s.id === serviceId);
            if (service) {
                document.dispatchEvent(new CustomEvent('getDirections', {
                    detail: { service }
                }));
            }
        };
    }
    
    getServiceIcon(category) {
        const icons = {
            pharmacy: '💊',
            grocery: '🛒',
            restaurant: '🍽️',
            mall: '🏬',
            market: '🛒',
            hospital: '🏥',
            gas: '⛽'
        };
        return icons[category] || '🏢';
    }
}

export default MapView;