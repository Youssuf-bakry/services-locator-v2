import { useState, useEffect } from 'preact/hooks';
import { DataService } from '../services/dataService';

const dataService = new DataService();

export const ConnectionTest = ({ onClose }) => {
    const [status, setStatus] = useState({ testing: true });
    const [stats, setStats] = useState(null);

    useEffect(() => {
        testConnection();
    }, []);

    const testConnection = async () => {
        setStatus({ testing: true });
        
        try {
            // Test backend health
            const healthResult = await dataService.testConnection();
            
            if (healthResult.connected) {
                // Test categories endpoint
                const categories = await dataService.getCategories();
                
                // Test services endpoint (with default location)
                const services = await dataService.getAllServices({
                    lat: 29.9792,
                    lng: 30.9754
                });
                
                setStatus({
                    success: true,
                    message: healthResult.message,
                    categoriesCount: categories.length,
                    servicesCount: services.length
                });
                
                // Get cache stats
                const cacheStats = dataService.getCacheStats();
                setStats(cacheStats);
                
            } else {
                setStatus({
                    success: false,
                    error: healthResult.error
                });
            }
            
        } catch (error) {
            setStatus({
                success: false,
                error: error.message
            });
        }
    };

    const handleRetry = () => {
        testConnection();
    };

    if (status.testing) {
        return (
            <div className="connection-test testing">
                <div className="test-card">
                    <div className="loading-spinner"></div>
                    <h3>Testing MongoDB Backend Connection...</h3>
                    <p>Checking your local server at localhost:5000</p>
                </div>
            </div>
        );
    }

    if (status.success) {
        return (
            <div className="connection-test success">
                <div className="test-card">
                    <div className="success-icon">✅</div>
                    <h3>MongoDB Backend Connected!</h3>
                    <p>{status.message}</p>
                    
                    <div className="test-results">
                        <div className="result-item">
                            <span className="label">Categories:</span>
                            <span className="value">{status.categoriesCount}</span>
                        </div>
                        <div className="result-item">
                            <span className="label">Services:</span>
                            <span className="value">{status.servicesCount}</span>
                        </div>
                        {stats && (
                            <div className="result-item">
                                <span className="label">Cache:</span>
                                <span className="value">{stats.size} items</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="test-actions">
                        <button className="test-btn success" onClick={onClose}>
                            Continue with App
                        </button>
                        <button className="test-btn secondary" onClick={handleRetry}>
                            Test Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="connection-test error">
            <div className="test-card">
                <div className="error-icon">❌</div>
                <h3>MongoDB Backend Not Available</h3>
                <p className="error-message">{status.error}</p>
                
                <div className="troubleshooting">
                    <h4>Troubleshooting:</h4>
                    <ul>
                        <li>Make sure your backend server is running: <code>npm run dev</code></li>
                        <li>Check that server is on port 5000: <code>http://localhost:5000/health</code></li>
                        <li>Verify your MongoDB connection in backend logs</li>
                    </ul>
                </div>
                
                <div className="test-actions">
                    <button className="test-btn primary" onClick={handleRetry}>
                        Retry Connection
                    </button>
                    <button className="test-btn secondary" onClick={onClose}>
                        Continue Anyway (Mock Data)
                    </button>
                </div>
            </div>
        </div>
    );
};

