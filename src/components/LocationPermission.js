class LocationPermission {
    constructor() {
        this.container = document.getElementById('location-permission');
    }
    
    render() {
        this.container.innerHTML = `
            <div class="location-permission">
                <div class="permission-card">
                    <h3>📍 Enable Location</h3>
                    <p>Allow location access to find services near you and get directions</p>
                    <button class="permission-btn" id="enable-location">
                        Enable Location
                    </button>
                </div>
            </div>
        `;
        
        this.bindEvents();
    }
    
    bindEvents() {
        const enableButton = document.getElementById('enable-location');
        
        enableButton.addEventListener('click', async () => {
            try {
                const position = await this.getCurrentPosition();
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                document.dispatchEvent(new CustomEvent('locationGranted', {
                    detail: { location }
                }));
                
                this.hidePermissionCard();
            } catch (error) {
                this.showError('Location access denied. You can still search for services.');
            }
        });
    }
    
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            });
        });
    }
    
    hidePermissionCard() {
        this.container.style.display = 'none';
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.container.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

export default LocationPermission;