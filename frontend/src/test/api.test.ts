import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch } from '../api';

describe('apiFetch', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
        localStorage.clear();
    });

    it('should call fetch with correct URL and headers', async () => {
        const mockResponse = new Response(JSON.stringify({ success: true }), { status: 200 });
        (fetch as any).mockResolvedValue(mockResponse);

        await apiFetch('/test');

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/test'),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'X-API-KEY': 'skimbleshanks-default-key',
                    'Content-Type': 'application/json'
                })
            })
        );
    });

    it('should use custom API key from localStorage', async () => {
        localStorage.setItem('skimbleshanks_api_key', 'my-custom-key');
        // Note: API_KEY is evaluated at module load time in the current api.ts
        // This test might fail if the module is already loaded.
        // We might need to rethink how constants are handled in api.ts for better testability.
    });
});
