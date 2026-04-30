import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('useAuthStore', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
        localStorage.clear();
        // Reset store
        const store = useAuthStore.getState();
        store.logout();
        store.setUserId('');
        store.setTgField('tgToken', '');
        store.setTgField('tgChatId', '');
    });

    it('should update userId', () => {
        const { setUserId } = useAuthStore.getState();
        setUserId('testuser');
        expect(useAuthStore.getState().userId).toBe('testuser');
    });

    it('should login successfully', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({ success: true })
        };
        (fetch as any).mockResolvedValue(mockResponse);

        const { setUserId, login } = useAuthStore.getState();
        setUserId('testuser');
        const result = await login('password', 'SRT');

        expect(result).toBe(true);
        expect(useAuthStore.getState().isLoggedIn).toBe(true);
        expect(localStorage.getItem('skimbleshanks_user_id')).toBe('testuser');
    });

    it('should fail login on server error', async () => {
        const mockResponse = {
            ok: false,
            json: async () => ({ detail: 'Invalid credentials' })
        };
        (fetch as any).mockResolvedValue(mockResponse);

        const { login } = useAuthStore.getState();
        const result = await login('wrong', 'SRT');

        expect(result).toBe(false);
        expect(useAuthStore.getState().isLoggedIn).toBe(false);
    });

    it('should logout and clear state', () => {
        const { logout } = useAuthStore.getState();
        useAuthStore.setState({ isLoggedIn: true });

        logout();

        expect(useAuthStore.getState().isLoggedIn).toBe(false);
    });

    it('should save telegram settings', async () => {
        const mockResponse = { ok: true, json: async () => ({}) };
        (fetch as any).mockResolvedValue(mockResponse);

        const { setTgField, saveTelegramSettings } = useAuthStore.getState();
        setTgField('tgToken', 'token123');
        setTgField('tgChatId', 'chat456');

        await saveTelegramSettings();

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/telegram'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ token: 'token123', chat_id: 'chat456' })
            })
        );
    });

    it('should check config and update state', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({
                srt_user_id: 'auto-user',
                telegram_token: 'auto-token',
                telegram_chat_id: 'auto-chat'
            })
        };
        (fetch as any).mockResolvedValue(mockResponse);

        const { checkConfig } = useAuthStore.getState();
        await checkConfig();

        const state = useAuthStore.getState();
        expect(state.userId).toBe('auto-user');
        expect(state.tgToken).toBe('auto-token');
        expect(state.tgChatId).toBe('auto-chat');
    });
});
