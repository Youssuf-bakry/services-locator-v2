
export const ErrorState = ({ message, onRetry, onBackToHome }) => {
    return (
        <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>{message}</h3>
            <div className="error-actions">
                <button 
                    className="retry-btn"
                    onClick={onRetry}
                >
                    Retry
                </button>
                <button 
                    className="back-btn"
                    onClick={onBackToHome}
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};