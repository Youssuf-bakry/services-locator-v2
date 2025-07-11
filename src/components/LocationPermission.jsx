//for mobile
export class LocationService {
    constructor() {
        this.watchId = null;
        this.lastKnownLocation = null;
        this.permissionStatus = null;
    }
    
    async getCurrentPosition() {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            throw new Error('Geolocation is not supported by this browser');
        }

        // Check if we're on HTTPS (required for mobile)
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            console.warn('⚠️ Geolocation requires HTTPS on mobile devices');
        }

        return new Promise((resolve, reject) => {
            // Enhanced options for better mobile compatibility
            const options = {
                enableHighAccuracy: true,
                timeout: 15000,        // Increased timeout for mobile
                maximumAge: 5 * 60 * 1000  // Accept location up to 5 minutes old
            };

            console.log('📍 Requesting location with options:', options);
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp
                    };
                    
                    this.lastKnownLocation = location;
                    console.log('✅ Location obtained:', location);
                    resolve(location);
                },
                (error) => {
                    console.error('❌ Location error:', error);
                    
                    // Enhanced error handling
                    const errorDetails = {
                        code: error.code,
                        message: error.message,
                        description: this.getLocationErrorDescription(error.code),
                        isHttps: window.location.protocol === 'https:',
                        userAgent: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
                    };
                    
                    console.error('📍 Location error details:', errorDetails);
                    
                    // Try fallback strategies
                    if (this.lastKnownLocation) {
                        console.log('🔄 Using last known location');
                        resolve(this.lastKnownLocation);
                    } else {
                        reject(new Error(`Location access denied: ${errorDetails.description}`));
                    }
                },
                options
            );
        });
    }

    getLocationErrorDescription(code) {
        switch (code) {
            case 1:
                return 'Permission denied - User blocked location access. Please enable location in browser settings.';
            case 2:
                return 'Position unavailable - GPS or network location services are not available.';
            case 3:
                return 'Timeout - Location request took too long. Please try again.';
            default:
                return 'Unknown geolocation error occurred.';
        }
    }

    // Check if geolocation permission is available
    async checkPermissionStatus() {
        if (!navigator.permissions) {
            return 'unknown';
        }

        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            this.permissionStatus = permission.state;
            
            permission.addEventListener('change', () => {
                this.permissionStatus = permission.state;
                console.log('📍 Geolocation permission changed:', permission.state);
            });
            
            return permission.state;
        } catch (error) {
            console.warn('Could not check geolocation permission:', error);
            return 'unknown';
        }
    }

    // Enhanced mobile-friendly location request
    async requestLocationWithUI() {
        try {
            // Check permission first
            const permissionStatus = await this.checkPermissionStatus();
            console.log('📍 Permission status:', permissionStatus);

            if (permissionStatus === 'denied') {
                throw new Error('Location permission was previously denied. Please enable it in browser settings and refresh the page.');
            }

            // For mobile, show user-friendly message before requesting
            if (this.isMobileDevice()) {
                console.log('📱 Mobile device detected - using mobile-optimized location request');
            }

            const location = await this.getCurrentPosition();
            return location;

        } catch (error) {
            console.error('❌ Location request failed:', error.message);
            
            // Provide helpful error messages for users
            if (error.message.includes('denied')) {
                throw new Error('Location access is required to find nearby services. Please enable location access and try again.');
            } else if (error.message.includes('unavailable')) {
                throw new Error('Could not determine your location. Please check your GPS/network connection.');
            } else {
                throw error;
            }
        }
    }

    isMobileDevice() {
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    isHTTPS() {
        return window.location.protocol === 'https:';
    }

    // Get location info for debugging
    getLocationInfo() {
        return {
            supported: !!navigator.geolocation,
            permissionApi: !!navigator.permissions,
            permissionStatus: this.permissionStatus,
            isHttps: this.isHTTPS(),
            isMobile: this.isMobileDevice(),
            userAgent: navigator.userAgent,
            lastKnownLocation: this.lastKnownLocation
        };
    }
    
    watchPosition(callback) {
        if (!navigator.geolocation) {
            throw new Error('Geolocation is not supported');
        }
        
        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 5 * 60 * 1000
        };
        
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                this.lastKnownLocation = location;
                callback(location);
            },
            (error) => {
                console.error('Location watch error:', error);
                // Still call callback with last known location if available
                if (this.lastKnownLocation) {
                    callback(this.lastKnownLocation);
                }
            },
            options
        );
    }
    
    stopWatching() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }
}

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