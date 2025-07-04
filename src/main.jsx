
import { render } from 'preact';
import { App } from './App';
import './styles/main.css';

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    render(<App />, document.getElementById('app'));
});

// Optional: Add global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Optional: Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});