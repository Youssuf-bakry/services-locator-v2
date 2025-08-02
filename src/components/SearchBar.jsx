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

            <div className="flex gap-3 bg-white rounded-[15px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                <input
                    type="text"
                    placeholder="ابحث باسم المكان أو بنوع الخدمة المطلوبة"
                    className="flex-1 px-5 py-[15px] border-2 border-gray-300 rounded-[10px] text-base transition-colors duration-300 ease-in-out focus:outline-none focus:border-indigo-500 sm:placeholder:text-2xl placeholder:text-blue-600 placeholder:text-center"
                    value={localQuery}
                    onInput={handleInputChange}
                    onKeyPress={handleKeyPress}
                />
                
                {localQuery && (
                    <button 
                        onClick={clearInput}
                        title="Clear search"
                        className="absolute right-[70px] top-1/2 -translate-y-1/2 bg-transparent border-none text-base text-gray-400 cursor-pointer p-[5px] rounded-full transition-all duration-200 ease-in-out hover:bg-gray-100 hover:text-gray-700"
                    >
                        ✕
                    </button>
                )}
                
                <button 
                 onClick={handleSearch}
                  className="px-5 py-[15px] bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-[10px] text-base cursor-pointer transition-transform duration-200 ease-in-out hover:-translate-y-0.5"
                >
                    🔍
                </button>
            </div>
    );
};