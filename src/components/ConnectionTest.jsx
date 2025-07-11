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

// CSS for the connection test (add this to your main.css)
const connectionTestStyles = `
.connection-test {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.test-card {
    background: white;
    border-radius: 15px;
    padding: 40px;
    max-width: 500px;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.success-icon, .error-icon {
    font-size: 3rem;
    margin-bottom: 20px;
}

.test-results {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
    margin: 20px 0;
}

.result-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.result-item:last-child {
    margin-bottom: 0;
}

.label {
    font-weight: 600;
    color: #333;
}

.value {
    color: #667eea;
    font-weight: 600;
}

.test-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 20px;
}

.test-btn {
    padding: 12px 25px;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.test-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.test-btn.success {
    background: #4CAF50;
    color: white;
}

.test-btn.secondary {
    background: #f0f0f0;
    color: #333;
}

.test-btn:hover {
    transform: translateY(-2px);
}

.troubleshooting {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 10px;
    padding: 15px;
    margin: 20px 0;
    text-align: left;
}

.troubleshooting h4 {
    margin-bottom: 10px;
    color: #856404;
}

.troubleshooting ul {
    margin: 0;
    padding-left: 20px;
}

.troubleshooting li {
    margin-bottom: 5px;
    color: #856404;
}

.troubleshooting code {
    background: #f8f9fa;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
}

.error-message {
    color: #dc3545;
    font-weight: 600;
    margin-bottom: 20px;
}
`;

export { connectionTestStyles };