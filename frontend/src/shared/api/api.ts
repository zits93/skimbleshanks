const getApiBase = () => {
    const saved = localStorage.getItem('skimbleshanks_api_base');
    if (saved) return saved;
    
    // 1. Try Environment Variable (Vite)
    const envBase = (import.meta as any).env?.VITE_API_URL;
    if (envBase) return envBase;

    // 2. Default to localhost if we are running locally
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8000/api';
    }

    // 3. If hosted (e.g. GitHub Pages), assume API is on the same host or relative
    // For now, keep a fallback but prefer dynamic detection
    return `${window.location.origin}/api`;
};

const API_BASE = getApiBase();
const API_KEY = localStorage.getItem('skimbleshanks_api_key') || '';

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
        ...options.headers,
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
    };
    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    
    if (!response.ok) {
        // Try to parse structured error from backend
        try {
            const data = await response.json();
            if (data.detail && typeof data.detail === 'object') {
                throw new Error(data.detail.message || '요청 처리에 실패했습니다.');
            }
            if (data.detail) {
                throw new Error(data.detail);
            }
        } catch (e: any) {
            if (e.message) throw e;
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
    }
    
    return response;
}
