
import { useEffect, useRef } from 'preact/hooks';

export const MapView = ({ userLocation, services = [] }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const userMarkerRef = useRef(null);
    const serviceMarkersRef = useRef([]);

    // Initialize map
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Default center (Riyadh coordinates)
        const defaultCenter = [24.7136, 46.6753];
        
        mapInstanceRef.current = L.map(mapRef.current).setView(defaultCenter, 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update user location
    useEffect(() => {
        if (!mapInstanceRef.current || !userLocation) return;

        // Remove existing user marker
        if (userMarkerRef.current) {
            mapInstanceRef.current.removeLayer(userMarkerRef.current);
        }

        // Add new user marker
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
            icon: L.divIcon({
                className: 'user-marker',
                html: '📍',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(mapInstanceRef.current);

        // Center map on user location
        mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15);
    }, [userLocation]);

    // Update service markers
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Clear existing service markers
        serviceMarkersRef.current.forEach(marker => {
            mapInstanceRef.current.removeLayer(marker);
        });
        serviceMarkersRef.current = [];

        // Add service markers
        services.forEach(service => {
            const marker = L.marker([service.latitude, service.longitude], {
                icon: L.divIcon({
                    className: 'service-marker',
                    html: getServiceIcon(service.category),
                    iconSize: [25, 25],
                    iconAnchor: [12, 12]
                })
            }).addTo(mapInstanceRef.current);

            const popupContent = `
                <div class="map-popup">
                    <h4>${service.name}</h4>
                    <p><strong>Category:</strong> ${service.category}</p>
                    <p><strong>Hours:</strong> ${service.hours}</p>
                    ${service.distance ? `<p><strong>Distance:</strong> ${service.distance.toFixed(2)} km</p>` : ''}
                    <button 
                        onclick="window.openDirections('${service.latitude}','${service.longitude}')" 
                        class="popup-btn"
                    >
                        Get Directions
                    </button>
                </div>
            `;

            marker.bindPopup(popupContent);
            serviceMarkersRef.current.push(marker);
        });

        // Add global function for popup directions
        window.openDirections = (lat, lng) => {
            if (userLocation) {
                const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}`;
                window.open(url, '_blank');
            } else {
                alert('Please enable location access to get directions');
            }
        };
    }, [services, userLocation]);

    const getServiceIcon = (category) => {
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
    };

    return (
        <div className="map-section">
            <h3>📍 Map View</h3>
            <div 
                ref={mapRef}
                className="map-canvas"
                style={{ width: '100%', height: '300px' }}
            />
        </div>
    );
};