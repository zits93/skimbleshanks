import { create } from 'zustand';
import { apiFetch } from '../api';

interface AuthStore {
    isLoggedIn: boolean;
    userId: string;
    loading: boolean;
    setUserId: (userId: string) => void;
    login: (password: string, provider: string) => Promise<boolean>;
    logout: () => void;
    checkConfig: () => Promise<void>;
    
    // Telegram Settings
    tgToken: string;
    tgChatId: string;
    showTgGuide: boolean;
    setTgField: (field: string, value: any) => void;
    saveTelegramSettings: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    isLoggedIn: false,
    userId: localStorage.getItem('skimbleshanks_user_id') || '',
    loading: false,

    tgToken: '',
    tgChatId: '',
    showTgGuide: false,

    setUserId: (userId) => set({ userId }),
    setTgField: (field, value) => set({ [field]: value } as any),

    login: async (password, provider) => {
        set({ loading: true });
        try {
            const { userId } = get();
            const res = await apiFetch('/login', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, password, provider })
            });
            if (res.ok) {
                set({ isLoggedIn: true, loading: false });
                localStorage.setItem('skimbleshanks_user_id', userId);
                return true;
            }
        } catch (e) {
            console.error('Login failed', e);
        }
        set({ loading: false });
        return false;
    },

    logout: () => {
        set({ isLoggedIn: false });
    },

    checkConfig: async () => {
        try {
            const res = await apiFetch('/config');
            if (res.ok) {
                const data = await res.json();
                if (data.srt_user_id) set({ userId: data.srt_user_id });
                if (data.telegram_token) set({ tgToken: data.telegram_token });
                if (data.telegram_chat_id) set({ tgChatId: data.telegram_chat_id });
            }
        } catch (e) {
            // Ignore initial config check errors
        }
    },

    saveTelegramSettings: async () => {
        const { tgToken, tgChatId } = get();
        try {
            const res = await apiFetch('/config/telegram', {
                method: 'POST',
                body: JSON.stringify({ token: tgToken, chat_id: tgChatId })
            });
            if (res.ok) {
                // Success
            }
        } catch (e) {
            console.error('Failed to save telegram settings', e);
        }
    }
}));
