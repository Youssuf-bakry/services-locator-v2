
const suggestions = ['pharmacy', 'restaurant', 'grocery', 'hospital'];

export const NoResultsState = ({ searchQuery, onSuggestionClick }) => {
    return (
        <div className="no-results">
            <h3>No services found</h3>
            <p>
                {searchQuery 
                    ? `Try searching for "${searchQuery}" or select a different category`
                    : 'Try adjusting your search or filters'
                }
            </p>
            
            <div className="search-suggestions">
                <h4>Try searching for:</h4>
                <div className="suggestion-chips">
                    {suggestions.map(term => (
                        <button
                            key={term}
                            className="suggestion-chip"
                            onClick={() => onSuggestionClick(term)}
                        >
                            {term}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};