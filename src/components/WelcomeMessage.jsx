const popularSearches = [
    { term: 'pharmacy', icon: '💊', label: 'Pharmacies' },
    { term: 'restaurant', icon: '🍽️', label: 'Restaurants' },
    { term: 'grocery', icon: '🛒', label: 'Grocery Stores' },
    { term: 'hospital', icon: '🏥', label: 'Hospitals' }
];

const steps = [
    'Enable location access for better results',
    'Search for services or select a category',
    'Get directions to your destination'
];

export const WelcomeMessage = ({ onQuickSearch }) => {
    return (
        <div className="welcome-message">
            <div className="welcome-icon">🏙️</div>
            <h2>Welcome to City Services</h2>
            <p>Find nearby pharmacies, restaurants, stores, and more in your city</p>
            
            <div className="getting-started">
                <h3>Getting Started:</h3>
                <div className="steps">
                    {steps.map((step, index) => (
                        <div key={index} className="step">
                            <span className="step-number">{index + 1}</span>
                            <span className="step-text">{step}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="quick-search">
                <h3>Popular Searches:</h3>
                <div className="popular-buttons">
                    {popularSearches.map(search => (
                        <button
                            key={search.term}
                            className="popular-btn"
                            onClick={() => onQuickSearch(search.term)}
                        >
                            {search.icon} {search.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};