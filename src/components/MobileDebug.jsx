import { useState, useEffect } from 'preact/hooks';
import { DataService } from '../services/dataService';
import { CONFIG } from '../config/config';

const dataService = new DataService();

export const MobileDebug = ({ onClose }) => {
    const [debugInfo, setDebugInfo] = useState({
        loading: true,
        geolocation: {},
        apiTest: {},
        deviceInfo: {},
        networkTest: {}
    });

    useEffect(() => {
        runAllTests();
    }, []);

    const runAllTests = async () => {
        console.log('🔧 Starting mobile debug tests...');
        
        const tests = {
            loading: false,
            geolocation: await testGeolocation(),
            deviceInfo: getDeviceInfo(),
            networkTest: await testNetworkConnection(),
            apiTest: await testApiConnection()
        };
        
        setDebugInfo(tests);
        console.log('📋 All tests completed:', tests);
    };

    const testGeolocation = () => {
        return new Promise((resolve) => {
            const result = {
                supported: !!navigator.geolocation,
                permissions: null,
                coordinates: null,
                error: null,
                isHttps: window.location.protocol === 'https:',
                timestamp: new Date().toISOString()
            };

            if (!navigator.geolocation) {
                result.error = 'Geolocation not supported';
                resolve(result);
                return;
            }

            // Check permissions if available
            if (navigator.permissions) {
                navigator.permissions.query({ name: 'geolocation' })
                    .then(permission => {
                        result.permissions = permission.state;
                    })
                    .catch(() => {
                        result.permissions = 'unknown';
                    });
            }

            const options = {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 300000
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    result.coordinates = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp
                    };
                    resolve(result);
                },
                (error) => {
                    result.error = {
                        code: error.code,
                        message: error.message,
                        description: getGeolocationErrorDescription(error.code)
                    };
                    resolve(result);
                },
                options
            );
        });
    };

    const getGeolocationErrorDescription = (code) => {
        switch (code) {
            case 1: return 'Permission denied by user';
            case 2: return 'Position unavailable (GPS/network issue)';
            case 3: return 'Timeout - location request took too long';
            default: return 'Unknown geolocation error';
        }
    };

    const getDeviceInfo = () => {
        return {
            userAgent: navigator.userAgent,
            isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
            isAndroid: /Android/.test(navigator.userAgent),
            touchSupport: 'ontouchstart' in window,
            online: navigator.onLine,
            cookieEnabled: navigator.cookieEnabled,
            language: navigator.language,
            platform: navigator.platform,
            screen: {
                width: screen.width,
                height: screen.height,
                orientation: screen.orientation?.angle || 'unknown'
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            protocol: window.location.protocol,
            hostname: window.location.hostname
        };
    };

    const testNetworkConnection = async () => {
        const result = {
            online: navigator.onLine,
            backendUrl: CONFIG.BACKEND_API_URL,
            healthCheck: null,
            cors: null,
            dns: null
        };

        try {
            // Test 1: Simple health check
            console.log('📡 Testing health check...');
            const healthResponse = await fetch(CONFIG.BACKEND_HEALTH_URL, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            result.healthCheck = {
                status: healthResponse.status,
                ok: healthResponse.ok,
                headers: Object.fromEntries(healthResponse.headers.entries()),
                url: healthResponse.url
            };

            if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                result.healthCheck.data = healthData;
            }

        } catch (error) {
            result.healthCheck = {
                error: error.message,
                type: error.name,
                stack: error.stack
            };
        }

        return result;
    };

    const testApiConnection = async () => {
        const result = {
            categoriesTest: null,
            servicesTest: null,
            searchTest: null
        };

        try {
            // Test 1: Categories endpoint
            console.log('📂 Testing categories API...');
            const categoriesResponse = await fetch(`${CONFIG.BACKEND_API_URL}/categories`);
            result.categoriesTest = {
                status: categoriesResponse.status,
                ok: categoriesResponse.ok,
                url: categoriesResponse.url
            };

            if (categoriesResponse.ok) {
                const categoriesData = await categoriesResponse.json();
                result.categoriesTest.count = categoriesData.data?.length || 0;
            }

            // Test 2: Services endpoint (with test coordinates)
            console.log('🏪 Testing services API...');
            const servicesUrl = `${CONFIG.BACKEND_API_URL}/services/nearby?lat=26.3006&lng=50.2081&radius=10000&limit=5`;
            const servicesResponse = await fetch(servicesUrl);
            result.servicesTest = {
                status: servicesResponse.status,
                ok: servicesResponse.ok,
                url: servicesUrl
            };

            if (servicesResponse.ok) {
                const servicesData = await servicesResponse.json();
                result.servicesTest.count = servicesData.data?.length || 0;
            }

            // Test 3: Search endpoint
            console.log('🔍 Testing search API...');
            const searchUrl = `${CONFIG.BACKEND_API_URL}/services/search?q=صيدلية&lat=26.3006&lng=50.2081&radius=10000`;
            const searchResponse = await fetch(searchUrl);
            result.searchTest = {
                status: searchResponse.status,
                ok: searchResponse.ok,
                url: searchUrl
            };

            if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                result.searchTest.count = searchData.data?.length || 0;
            }

        } catch (error) {
            result.error = {
                message: error.message,
                type: error.name,
                stack: error.stack
            };
        }

        return result;
    };

    const renderGeolocationResults = () => {
        const geo = debugInfo.geolocation;
        
        return (
            <div className="debug-section">
                <h4>📍 Geolocation Test</h4>
                <div className="debug-grid">
                    <div className="debug-item">
                        <span className="label">Supported:</span>
                        <span className={`value ${geo.supported ? 'success' : 'error'}`}>
                            {geo.supported ? '✅ Yes' : '❌ No'}
                        </span>
                    </div>
                    
                    <div className="debug-item">
                        <span className="label">HTTPS:</span>
                        <span className={`value ${geo.isHttps ? 'success' : 'warning'}`}>
                            {geo.isHttps ? '✅ Yes' : '⚠️ No (Required for mobile)'}
                        </span>
                    </div>
                    
                    {geo.permissions && (
                        <div className="debug-item">
                            <span className="label">Permission:</span>
                            <span className={`value ${geo.permissions === 'granted' ? 'success' : 'warning'}`}>
                                {geo.permissions}
                            </span>
                        </div>
                    )}
                    
                    {geo.coordinates ? (
                        <>
                            <div className="debug-item">
                                <span className="label">Location:</span>
                                <span className="value success">
                                    {geo.coordinates.lat.toFixed(4)}, {geo.coordinates.lng.toFixed(4)}
                                </span>
                            </div>
                            <div className="debug-item">
                                <span className="label">Accuracy:</span>
                                <span className="value">{geo.coordinates.accuracy}m</span>
                            </div>
                        </>
                    ) : geo.error ? (
                        <div className="debug-item">
                            <span className="label">Error:</span>
                            <span className="value error">
                                {geo.error.description} (Code: {geo.error.code})
                            </span>
                        </div>
                    ) : null}
                </div>
            </div>
        );
    };

    const renderNetworkResults = () => {
        const network = debugInfo.networkTest;
        
        return (
            <div className="debug-section">
                <h4>📡 Network Test</h4>
                <div className="debug-grid">
                    <div className="debug-item">
                        <span className="label">Online:</span>
                        <span className={`value ${network.online ? 'success' : 'error'}`}>
                            {network.online ? '✅ Yes' : '❌ No'}
                        </span>
                    </div>
                    
                    <div className="debug-item">
                        <span className="label">Backend URL:</span>
                        <span className="value small">{network.backendUrl}</span>
                    </div>
                    
                    {network.healthCheck ? (
                        <div className="debug-item">
                            <span className="label">Health Check:</span>
                            <span className={`value ${network.healthCheck.ok ? 'success' : 'error'}`}>
                                {network.healthCheck.ok ? '✅ Success' : `❌ Failed (${network.healthCheck.status})`}
                            </span>
                        </div>
                    ) : null}
                </div>
            </div>
        );
    };

    const renderApiResults = () => {
        const api = debugInfo.apiTest;
        
        return (
            <div className="debug-section">
                <h4>🔌 API Test</h4>
                <div className="debug-grid">
                    {api.categoriesTest && (
                        <div className="debug-item">
                            <span className="label">Categories:</span>
                            <span className={`value ${api.categoriesTest.ok ? 'success' : 'error'}`}>
                                {api.categoriesTest.ok ? `✅ ${api.categoriesTest.count} found` : '❌ Failed'}
                            </span>
                        </div>
                    )}
                    
                    {api.servicesTest && (
                        <div className="debug-item">
                            <span className="label">Services:</span>
                            <span className={`value ${api.servicesTest.ok ? 'success' : 'error'}`}>
                                {api.servicesTest.ok ? `✅ ${api.servicesTest.count} found` : '❌ Failed'}
                            </span>
                        </div>
                    )}
                    
                    {api.searchTest && (
                        <div className="debug-item">
                            <span className="label">Search:</span>
                            <span className={`value ${api.searchTest.ok ? 'success' : 'error'}`}>
                                {api.searchTest.ok ? `✅ ${api.searchTest.count} found` : '❌ Failed'}
                            </span>
                        </div>
                    )}
                    
                    {api.error && (
                        <div className="debug-item">
                            <span className="label">Error:</span>
                            <span className="value error">{api.error.message}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (debugInfo.loading) {
        return (
            <div className="mobile-debug-overlay">
                <div className="debug-card">
                    <div className="loading-spinner"></div>
                    <h3>Running Mobile Diagnostics...</h3>
                    <p>Testing location, network, and API connections</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mobile-debug-overlay">
            <div className="debug-card">
                <div className="debug-header">
                    <h3>📱 Mobile Debug Results</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>
                
                <div className="debug-content">
                    {renderGeolocationResults()}
                    {renderNetworkResults()}
                    {renderApiResults()}
                    
                    <div className="debug-section">
                        <h4>📱 Device Info</h4>
                        <div className="debug-grid">
                            <div className="debug-item">
                                <span className="label">Mobile:</span>
                                <span className="value">{debugInfo.deviceInfo.isMobile ? '✅ Yes' : '❌ No'}</span>
                            </div>
                            <div className="debug-item">
                                <span className="label">Platform:</span>
                                <span className="value">{debugInfo.deviceInfo.platform}</span>
                            </div>
                            <div className="debug-item">
                                <span className="label">Protocol:</span>
                                <span className="value">{debugInfo.deviceInfo.protocol}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="debug-actions">
                    <button className="debug-btn" onClick={runAllTests}>
                        🔄 Run Tests Again
                    </button>
                    <button className="debug-btn secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};