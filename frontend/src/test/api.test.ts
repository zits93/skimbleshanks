import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch } from '../shared/api/api';

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
                    'Content-Type': 'application/json'
                })
            })
        );
    });
});
