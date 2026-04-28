import { create } from 'zustand';
import { Log } from '../types';

interface LogStore {
    logs: Log[];
    addLog: (message: string, type?: string) => void;
    clearLogs: () => void;
}

export const useLogStore = create<LogStore>((set) => ({
    logs: [],
    addLog: (message, type = 'info') => set((state) => ({
        logs: [...state.logs, {
            time: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
            message,
            type
        }].slice(-100) // Keep last 100 logs
    })),
    clearLogs: () => set({ logs: [] })
}));
