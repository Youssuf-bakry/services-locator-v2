//Fixed to handle both string and object hours

const getServiceIcon = (category) => {
    const icons = {
        pharmacy: '💊',
        grocery: '🛒',
        restaurant: '🍽️',
        mall: '🏬',
        market: '🛒',
        hospital: '🏥',
        gas_station: '⛽',
        bank: '🏦'
    };
    return icons[category] || '🏢';
};

// Helper function to format hours
const formatHours = (hours) => {
    // If hours is already a string, return it
    if (typeof hours === 'string') {
        return hours;
    }
    
    // If hours is an object (detailed schedule), format it
    if (typeof hours === 'object' && hours !== null) {
        const today = new Date().getDay();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = days[today];
        
        if (hours[currentDay]) {
            const todayHours = hours[currentDay];
            
            if (todayHours.closed) {
                return 'Closed today';
            }
            
            if (todayHours.open === '00:00' && todayHours.close === '23:59') {
                return '24 Hours';
            }
            
            return `${todayHours.open} - ${todayHours.close}`;
        }
    }
    
    // Fallback
    return 'Hours not available';
};

// Helper function to check if service is open
const isServiceOpen = (hours, is24Hours) => {
    if (is24Hours) return true;
    
    // If hours is a string, do basic check
    if (typeof hours === 'string') {
        if (hours.includes('24') || hours.toLowerCase().includes('24 hours')) return true;
        if (hours.toLowerCase().includes('closed')) return false;
        
        const now = new Date();
        const currentHour = now.getHours();
        return currentHour >= 8 && currentHour <= 22; // Basic assumption
    }
    
    // If hours is an object, check current day
    if (typeof hours === 'object' && hours !== null) {
        const today = new Date().getDay();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = days[today];
        
        if (hours[currentDay]) {
            const todayHours = hours[currentDay];
            
            if (todayHours.closed) return false;
            
            if (todayHours.open === '00:00' && todayHours.close === '23:59') return true;
            
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
            
            return currentTime >= todayHours.open && currentTime <= todayHours.close;
        }
    }
    
    return null; // Unknown
};

export const ServiceCard = ({ service, onGetDirections }) => {
    const handleCallNow = () => {
        // Handle both old format (service.phone) and new format (service.contact.phone)
        const phoneNumber = service.phone || service.contact?.phone || service.contact?.mobile;
        if (phoneNumber) {
            window.open(`tel:${phoneNumber}`);
        }
    };

    // Determine if service is open
    const serviceIsOpen = service.isOpen !== undefined 
        ? service.isOpen 
        : isServiceOpen(service.hours, service.is24Hours);

    // Get phone number from either format
    const phoneNumber = service.phone || service.contact?.phone || service.contact?.mobile;

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
                <div className={`service-status ${serviceIsOpen ? 'open' : serviceIsOpen === false ? 'closed' : 'unknown'}`}>
                    {serviceIsOpen === true ? 'Open' : serviceIsOpen === false ? 'Closed' : 'Unknown'}
                </div>
            </div>

            <div className="service-details">
                <div className="detail-item">
                    <span className="detail-icon">🕒</span>
                    <span className="detail-text">{formatHours(service.hours)}</span>
                </div>
                
                <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <span className="detail-text">{service.address?.full || service.address}</span>
                </div>
                
                {service.distance && (
                    <div className="detail-item">
                        <span className="detail-icon">📏</span>
                        <span className="detail-text">{service.distance.toFixed(2)} km away</span>
                    </div>
                )}
                
                {phoneNumber && (
                    <div className="detail-item">
                        <span className="detail-icon">📞</span>
                        <span className="detail-text">{phoneNumber}</span>
                    </div>
                )}

                {service.rating > 0 && (
                    <div className="detail-item">
                        <span className="detail-icon">⭐</span>
                        <span className="detail-text">
                            {service.rating.toFixed(1)} ({service.reviewCount} reviews)
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
                
                {phoneNumber && (
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
/*const getServiceIcon = (category) => {
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
*/