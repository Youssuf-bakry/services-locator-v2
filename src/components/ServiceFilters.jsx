
const filters = [
    { id: 'all', label: 'All Services', icon: '🏢' },
    { id: 'pharmacy', label: 'Pharmacies', icon: '💊' },
    { id: 'grocery', label: 'Grocery Stores', icon: '🛒' },
    { id: 'restaurant', label: 'Restaurants', icon: '🍽️' },
    { id: 'mall', label: 'Shopping Malls', icon: '🏬' },
    { id: 'market', label: 'Markets', icon: '🛒' },
    { id: 'hospital', label: 'Hospitals', icon: '🏥' },
    { id: 'gas', label: 'Gas Stations', icon: '⛽' }
];

export const ServiceFilters = ({ activeFilter, onFilterChange }) => {
    return (
        <div className="service-filters">
                        <div className="filter-buttons">
                {filters.map(filter => (
                    <button
                        key={filter.id}
                        className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
                        onClick={() => onFilterChange(filter.id)}
                    >
                        <span className="filter-icon">{filter.icon}</span>
                        <span className="filter-label">{filter.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};