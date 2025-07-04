// src/components/LocationPermission.jsx
import { useState } from 'preact/hooks';

export const LocationPermission = ({ onLocationGranted }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getCurrentPosition = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            });
        });
    };

    const handleEnableLocation = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const position = await getCurrentPosition();
            const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            onLocationGranted(location);
        } catch (error) {
            setError('Location access denied. You can still search for services.');
            console.error('Location error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const dismissError = () => {
        setError(null);
    };

    return (
        <div className="location-permission">
            <div className="permission-card">
                <h3>📍 Enable Location</h3>
                <p>Allow location access to find services near you and get directions</p>
                
                <button 
                    className={`permission-btn ${isLoading ? 'loading' : ''}`}
                    onClick={handleEnableLocation}
                    disabled={isLoading}
                >
                    {isLoading ? 'Getting Location...' : 'Enable Location'}
                </button>

                {error && (
                    <div className="error-message">
                        <span>{error}</span>
                        <button 
                            className="dismiss-btn"
                            onClick={dismissError}
                            title="Dismiss"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};