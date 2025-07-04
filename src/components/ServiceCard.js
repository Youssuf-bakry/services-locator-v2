class ServiceCard {
    render(service) {
        const card = document.createElement('div');
        card.className = 'service-card';
        
        card.innerHTML = `
            <div class="service-header">
                <div class="service-icon">${this.getServiceIcon(service.category)}</div>
                <div class="service-info">
                    <h3 class="service-name">${service.name}</h3>
                    <p class="service-category">${service.category}</p>
                </div>
                <div class="service-status ${service.isOpen ? 'open' : 'closed'}">
                    ${service.isOpen ? 'Open' : 'Closed'}
                </div>
            </div>
            
            <div class="service-details">
                <div class="detail-item">
                    <span class="detail-icon">🕒</span>
                    <span class="detail-text">${service.hours}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-icon">📍</span>
                    <span class="detail-text">${service.address}</span>
                </div>
                
                ${service.distance ? `
                    <div class="detail-item">
                        <span class="detail-icon">📏</span>
                        <span class="detail-text">${service.distance.toFixed(2)} km away</span>
                    </div>
                ` : ''}
                
                ${service.phone ? `
                    <div class="detail-item">
                        <span class="detail-icon">📞</span>
                        <span class="detail-text">${service.phone}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="service-actions">
                <button class="action-btn primary" data-service-id="${service.id}">
                    Get Directions
                </button>
                ${service.phone ? `
                    <button class="action-btn secondary" onclick="window.open('tel:${service.phone}')">
                        Call Now
                    </button>
                ` : ''}
            </div>
        `;
        
        // Bind events
        const directionsBtn = card.querySelector('.action-btn.primary');
        directionsBtn.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('getDirections', {
                detail: { service }
            }));
        });
        
        return card;
    }
    
    getServiceIcon(category) {
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
    }
}

export default ServiceCard;