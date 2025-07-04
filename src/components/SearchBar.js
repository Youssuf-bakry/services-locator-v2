class SearchBar {
    constructor() {
        this.container = document.getElementById('search-container');
    }
    
    render() {
        this.container.innerHTML = `
            <div class="search-bar">
                <div class="search-input-container">
                    <input 
                        type="text" 
                        id="search-input" 
                        placeholder="Search for pharmacies, stores, markets..." 
                        class="search-input"
                    >
                    <button class="search-button" id="search-button">
                        🔍
                    </button>
                </div>
            </div>
        `;
        
        this.bindEvents();
    }
    
    bindEvents() {
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        
        const handleSearch = () => {
            const query = searchInput.value.trim();
            document.dispatchEvent(new CustomEvent('search', {
                detail: { query }
            }));
        };
        
        searchInput.addEventListener('input', handleSearch);
        searchButton.addEventListener('click', handleSearch);
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
}

export default SearchBar;