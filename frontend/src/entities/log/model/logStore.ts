import { create } from 'zustand';
import { Log } from '../../../shared/api/types';

interface LogStore {
    logs: Log[];
    addLog: (message: string, type?: Log['type']) => void;
    clearLogs: () => void;
}

export const useLogStore = create<LogStore>((set) => ({
    logs: [],
    addLog: (message: string, type: Log['type'] = 'info') => set((state) => ({
        logs: [...state.logs, {
            time: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
            message,
            type
        }].slice(-100)
    })),
    clearLogs: () => set({ logs: [] })
}));
