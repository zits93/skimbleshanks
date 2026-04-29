import { create } from 'zustand';
import { apiFetch } from '../../../shared/api/api';

interface AuthStore {
    isLoggedIn: boolean;
    userId: string;
    loading: boolean;
    setUserId: (userId: string) => void;
    login: (password: string, provider: string) => Promise<boolean>;
    logout: () => void;
    checkConfig: () => Promise<void>;
    
    // Server Config
    srtStations: string[];
    ktxStations: string[];
    options: string[];
    setStations: (provider: string, stations: string[]) => Promise<void>;
    setOptions: (options: string[]) => Promise<void>;

    // Logs
    serverLogs: string[];
    fetchLogs: () => Promise<void>;
    
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

    srtStations: [],
    ktxStations: [],
    options: [],
    serverLogs: [],

    setUserId: (userId) => set({ userId }),
    setTgField: (field, value) => set({ [field]: value } as any),

    login: async (password, provider) => {
        set({ loading: true });
        const { showToast } = (await import('../../../shared/api/uiStore')).useUiStore.getState();
        try {
            const { userId } = get();
            await apiFetch('/login', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, password, provider })
            });
            set({ isLoggedIn: true, loading: false });
            localStorage.setItem('skimbleshanks_user_id', userId);
            showToast('로그인 성공!', 'success');
            return true;
        } catch (e: any) {
            console.error('Login failed', e);
            showToast(e.message || '로그인 실패', 'error');
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
                set({
                    srtStations: data.srt_stations || [],
                    ktxStations: data.ktx_stations || [],
                    options: data.options || []
                });
            }
        } catch (e) {
            // Ignore initial config check errors
        }
    },

    saveTelegramSettings: async () => {
        const { tgToken, tgChatId } = get();
        const { showToast } = (await import('../../../shared/api/uiStore')).useUiStore.getState();
        try {
            await apiFetch('/telegram', {
                method: 'POST',
                body: JSON.stringify({ token: tgToken, chat_id: tgChatId })
            });
            showToast('텔레그램 설정이 완료되었습니다.', 'success');
        } catch (e: any) {
            console.error('Failed to save telegram settings', e);
            showToast(e.message || '텔레그램 설정 실패', 'error');
        }
    },

    setStations: async (provider, stations) => {
        try {
            await apiFetch('/config/stations', {
                method: 'POST',
                body: JSON.stringify({ provider, stations })
            });
            if (provider === 'SRT') set({ srtStations: stations });
            else set({ ktxStations: stations });
        } catch (e) {}
    },

    setOptions: async (options) => {
        try {
            await apiFetch('/config/options', {
                method: 'POST',
                body: JSON.stringify({ options })
            });
            set({ options });
        } catch (e) {}
    },

    fetchLogs: async () => {
        try {
            const res = await apiFetch('/logs?lines=100');
            const data = await res.json();
            set({ serverLogs: data.logs });
        } catch (e) {}
    }
}));
