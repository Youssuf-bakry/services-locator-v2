export const LoadingState = ({ searchQuery }) => {
    return (
        <div className="loading-state">
            <div className="loading-spinner"></div>
            <h3>Searching for services...</h3>
            <p>Finding {searchQuery || 'services'} near you</p>
        </div>
    );
};