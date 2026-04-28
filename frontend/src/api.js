const getApiBase = () => {
    const saved = localStorage.getItem('srtgo_api_base');
    if (saved) return saved;
    
    // Default to localhost if we are running locally, 
    // otherwise use the hardcoded ngrok for testing on GH Pages
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8000/api';
    }
    return 'https://fce9-14-32-100-180.ngrok-free.app/api';
};

const API_BASE = getApiBase();
const API_KEY = localStorage.getItem('srtgo_api_key') || 'srtgo-default-key';

export async function apiFetch(endpoint, options = {}) {
    const headers = {
        ...options.headers,
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
    };
    return fetch(`${API_BASE}${endpoint}`, { ...options, headers });
}
