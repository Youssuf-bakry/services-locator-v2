// src/components/ServiceCard.jsx

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

export const ServiceCard = ({ service, onGetDirections }) => {
    const handleCallNow = () => {
        if (service.phone) {
            window.open(`tel:${service.phone}`);
        }
    };

    return (
        <div className="service-card">
            <div className="service-header">
                <div className="service-icon">
                    {getServiceIcon(service.category)}
                </div>
                <div className="service-info">
                    <h3 className="service-name">{service.name}</h3>
                    <p className="service-category">{service.category}</p>
                </div>
                <div className={`service-status ${service.isOpen ? 'open' : 'closed'}`}>
                    {service.isOpen ? 'Open' : 'Closed'}
                </div>
            </div>

            <div className="service-details">
                <div className="detail-item">
                    <span className="detail-icon">🕒</span>
                    <span className="detail-text">{service.hours}</span>
                </div>
                
                <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <span className="detail-text">{service.address}</span>
                </div>
                
                {service.distance && (
                    <div className="detail-item">
                        <span className="detail-icon">📏</span>
                        <span className="detail-text">{service.distance.toFixed(2)} km away</span>
                    </div>
                )}
                
                {service.phone && (
                    <div className="detail-item">
                        <span className="detail-icon">📞</span>
                        <span className="detail-text">{service.phone}</span>
                    </div>
                )}

                {service.rating > 0 && (
                    <div className="detail-item">
                        <span className="detail-icon">⭐</span>
                        <span className="detail-text">
                            {service.rating.toFixed(1)} ({service.reviews} reviews)
                        </span>
                    </div>
                )}
            </div>

            <div className="service-actions">
                <button 
                    className="action-btn primary"
                    onClick={() => onGetDirections(service)}
                >
                    Get Directions
                </button>
                
                {service.phone && (
                    <button 
                        className="action-btn secondary"
                        onClick={handleCallNow}
                    >
                        Call Now
                    </button>
                )}
            </div>
        </div>
    );
};