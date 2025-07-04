class ServiceFilters {
    constructor() {
        this.container = document.getElementById('filters-container');
        this.filters = [
            { id: 'all', label: 'All Services', icon: '🏢' },
            { id: 'pharmacy', label: 'Pharmacies', icon: '💊' },
            { id: 'grocery', label: 'Grocery Stores', icon: '🛒' },
            { id: 'restaurant', label: 'Restaurants', icon: '🍽️' },
            { id: 'mall', label: 'Shopping Malls', icon: '🏬' },
            { id: 'market', label: 'Markets', icon: '🛒' },
            { id: 'hospital', label: 'Hospitals', icon: '🏥' },
            { id: 'gas', label: 'Gas Stations', icon: '⛽' }
        ];
    }
    
    render() {
        this.container.innerHTML = `
            <div class="service-filters">
                <h3>Filter Services</h3>
                <div class="filter-buttons">
                    ${this.filters.map(filter => `
                        <button 
                            class="filter-btn ${filter.id === 'all' ? 'active' : ''}" 
                            data-filter="${filter.id}"
                        >
                            <span class="filter-icon">${filter.icon}</span>
                            <span class="filter-label">${filter.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.bindEvents();
    }
    
    bindEvents() {
        const filterButtons = this.container.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Dispatch filter change event
                const filter = button.dataset.filter;
                document.dispatchEvent(new CustomEvent('filterChange', {
                    detail: { filter }
                }));
            });
        });
    }
}

export default ServiceFilters;