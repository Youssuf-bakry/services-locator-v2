//for mobile
import { useState, useEffect } from 'preact/hooks';
import { LocationService } from '../services/locationService';

const locationService = new LocationService();

export const LocationPermission = ({ onLocationGranted }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [locationInfo, setLocationInfo] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState('unknown');

    useEffect(() => {
        checkInitialStatus();
    }, []);

    const checkInitialStatus = async () => {
        const info = locationService.getLocationInfo();
        setLocationInfo(info);
        
        const permission = await locationService.checkPermissionStatus();
        setPermissionStatus(permission);
        
        console.log('📍 Initial location info:', info);
        console.log('📍 Permission status:', permission);
    };

    const handleEnableLocation = async () => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('📍 Requesting location...');
            const location = await locationService.requestLocationWithUI();
            
            console.log('✅ Location obtained:', location);
            onLocationGranted(location);
            
        } catch (error) {
            console.error('❌ Location request failed:', error);
            
            // Set user-friendly error message
            let errorMessage = error.message;
            
            if (error.message.includes('denied')) {
                if (!locationInfo?.isHttps) {
                    errorMessage = 'Location access requires HTTPS. Please use the deployed version of the app.';
                } else {
                    errorMessage = 'Location access denied. Please enable location in your browser settings and refresh the page.';
                }
            } else if (error.message.includes('unavailable')) {
                errorMessage = 'Could not get your location. Please check your GPS and network connection.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Location request timed out. Please try again.';
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkipLocation = () => {
        console.log('📍 User chose to skip location');
        // Use default Saudi coordinates as fallback
        const defaultLocation = {
            lat: 26.3006,
            lng: 50.2081,
            isDefault: true
        };
        onLocationGranted(defaultLocation);
    };

    const dismissError = () => {
        setError(null);
    };

    const getLocationAdvice = () => {
        if (!locationInfo) return null;

        const advice = [];
        
        if (!locationInfo.isHttps) {
            advice.push({
                icon: '🔒',
                title: 'HTTPS Required',
                message: 'Location access requires a secure connection. Please use the deployed app version.',
                type: 'error'
            });
        }
        
        if (locationInfo.isMobile && permissionStatus === 'denied') {
            advice.push({
                icon: '📱',
                title: 'Mobile Settings',
                message: 'Go to browser settings → Site permissions → Location → Allow',
                type: 'warning'
            });
        }
        
        if (!locationInfo.supported) {
            advice.push({
                icon: '❌',
                title: 'Not Supported',
                message: 'Your browser does not support location services.',
                type: 'error'
            });
        }

        return advice;
    };

    const advice = getLocationAdvice();

    return (
        <div className="location-permission">
            <div className="permission-card">
                <h3>📍 Enable Location</h3>
                <p>Allow location access to find services near you in Saudi Arabia</p>
                
                {/* Location Info Debug (only in development) */}
                {locationInfo && import.meta.env.DEV && (
                    <div className="location-debug">
                        <details>
                            <summary>🔧 Debug Info</summary>
                            <div className="debug-info">
                                <div>HTTPS: {locationInfo.isHttps ? '✅' : '❌'}</div>
                                <div>Mobile: {locationInfo.isMobile ? '✅' : '❌'}</div>
                                <div>Supported: {locationInfo.supported ? '✅' : '❌'}</div>
                                <div>Permission: {permissionStatus}</div>
                            </div>
                        </details>
                    </div>
                )}
                
                {/* Advice Section */}
                {advice && advice.length > 0 && (
                    <div className="location-advice">
                        {advice.map((item, index) => (
                            <div key={index} className={`advice-item ${item.type}`}>
                                <span className="advice-icon">{item.icon}</span>
                                <div className="advice-content">
                                    <strong>{item.title}:</strong> {item.message}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="permission-buttons">
                    <button 
                        className={`permission-btn primary ${isLoading ? 'loading' : ''}`}
                        onClick={handleEnableLocation}
                        disabled={isLoading || !locationInfo?.supported}
                    >
                        {isLoading ? 'Getting Location...' : 'Enable Location'}
                    </button>
                    
                    <button 
                        className="permission-btn secondary"
                        onClick={handleSkipLocation}
                    >
                        Use Default Location
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        <div className="error-content">
                            <span className="error-text">{error}</span>
                            <button 
                                className="dismiss-btn"
                                onClick={dismissError}
                                title="Dismiss"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {/* Additional help for common errors */}
                        {error.includes('denied') && locationInfo?.isHttps && (
                            <div className="error-help">
                                <h4>How to enable location:</h4>
                                <ul>
                                    <li>Click the location icon 🌍 in your browser's address bar</li>
                                    <li>Select "Allow" for location access</li>
                                    <li>Refresh the page and try again</li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// import { useState } from 'preact/hooks';

// export const LocationPermission = ({ onLocationGranted }) => {
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const getCurrentPosition = () => {
//         return new Promise((resolve, reject) => {
//             if (!navigator.geolocation) {
//                 reject(new Error('Geolocation is not supported'));
//                 return;
//             }
            
//             navigator.geolocation.getCurrentPosition(resolve, reject, {
//                 enableHighAccuracy: true,
//                 timeout: 10000,
//                 maximumAge: 300000
//             });
//         });
//     };

//     const handleEnableLocation = async () => {
//         setIsLoading(true);
//         setError(null);

//         try {
//             const position = await getCurrentPosition();
//             const location = {
//                 lat: position.coords.latitude,
//                 lng: position.coords.longitude
//             };
            
//             onLocationGranted(location);
//         } catch (error) {
//             setError('Location access denied. You can still search for services.');
//             console.error('Location error:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const dismissError = () => {
//         setError(null);
//     };

//     return (
//         <div className="location-permission">
//             <div className="permission-card">
//                 <h3>📍 Enable Location</h3>
//                 <p>Allow location access to find services near you and get directions</p>
                
//                 <button 
//                     className={`permission-btn ${isLoading ? 'loading' : ''}`}
//                     onClick={handleEnableLocation}
//                     disabled={isLoading}
//                 >
//                     {isLoading ? 'Getting Location...' : 'Enable Location'}
//                 </button>

//                 {error && (
//                     <div className="error-message">
//                         <span>{error}</span>
//                         <button 
//                             className="dismiss-btn"
//                             onClick={dismissError}
//                             title="Dismiss"
//                         >
//                             ✕
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };