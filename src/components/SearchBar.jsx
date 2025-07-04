// src/components/SearchBar.jsx
import { useState, useEffect } from 'preact/hooks';

export const SearchBar = ({ onSearch, searchQuery, onQueryChange }) => {
    const [localQuery, setLocalQuery] = useState(searchQuery || '');

    // Sync with parent component
    useEffect(() => {
        setLocalQuery(searchQuery || '');
    }, [searchQuery]);

    const handleSearch = () => {
        const query = localQuery.trim();
        onSearch(query);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setLocalQuery(value);
        
        // Update parent component immediately for controlled input
        if (onQueryChange) {
            onQueryChange(value);
        }
        
        // Trigger search on input (debounced)
        onSearch(value.trim());
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const clearInput = () => {
        setLocalQuery('');
        if (onQueryChange) {
            onQueryChange('');
        }
        onSearch('');
    };

    return (
        <div className="search-bar">
            <div className="search-input-container">
                <input
                    type="text"
                    placeholder="Search for pharmacies, stores, markets..."
                    className="search-input"
                    value={localQuery}
                    onInput={handleInputChange}
                    onKeyPress={handleKeyPress}
                />
                
                {localQuery && (
                    <button 
                        className="clear-button"
                        onClick={clearInput}
                        title="Clear search"
                    >
                        ✕
                    </button>
                )}
                
                <button 
                    className="search-button"
                    onClick={handleSearch}
                    title="Search"
                >
                    🔍
                </button>
            </div>
        </div>
    );
};