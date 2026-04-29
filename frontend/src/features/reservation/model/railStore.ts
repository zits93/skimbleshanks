import { create } from 'zustand';
import { apiFetch } from '../../../shared/api/api';
import { Train, Target } from '../../../shared/api/types';
import { useLogStore } from '../../../entities/log/model/logStore';
import { useUiStore } from '../../../shared/api/uiStore';

interface RailStore {
    trains: Train[];
    selectedTargets: Target[];
    autoReserveActive: boolean;
    autoReserveAttempts: number;
    searching: boolean;
    activeTaskId: string | null;
    
    // Search Fields
    dep: string;
    arr: string;
    date: string;
    time: string;
    adults: number;
    children: number;
    seniors: number;
    dis1to3: number;
    dis4to6: number;

    cardNum: string;
    cardPw: string;
    cardBirth: string;
    cardExp: string;

    // Setters
    setSearchField: (field: string, value: any) => void;
    setCardField: (field: string, value: any) => void;
    saveCardInfo: () => Promise<void>;
    toggleTarget: (trainName: string, seatType: string) => void;
    bulkToggleTarget: (seatType: string) => void;
    
    // Actions
    doSearch: () => Promise<void>;
    startAutoReserve: () => void;
    stopAutoReserve: () => void;
}

let autoTimer: any = null;

export const useRailStore = create<RailStore>((set, get) => ({
    trains: [],
    selectedTargets: [],
    autoReserveActive: false,
    autoReserveAttempts: 0,
    searching: false,
    activeTaskId: null,

    dep: '수서',
    arr: '부산',
    date: new Date().toLocaleDateString('en-CA').replace(/-/g, ''),
    time: `${new Date().getHours().toString().padStart(2, '0')}0000`,
    adults: 1,
    children: 0,
    seniors: 0,
    dis1to3: 0,
    dis4to6: 0,

    cardNum: localStorage.getItem('skimbleshanks_card_num') || '',
    cardPw: localStorage.getItem('skimbleshanks_card_pw') || '',
    cardBirth: localStorage.getItem('skimbleshanks_card_birth') || '',
    cardExp: localStorage.getItem('skimbleshanks_card_exp') || '',

    setSearchField: (field, value) => set({ [field]: value } as any),
    setCardField: (field, value) => set({ [field]: value } as any),
    
    saveCardInfo: async () => {
        const { cardNum, cardPw, cardBirth, cardExp } = get();
        const { showToast } = useUiStore.getState();
        try {
            await apiFetch('/config/card', {
                method: 'POST',
                body: JSON.stringify({ 
                    number: cardNum, 
                    password: cardPw, 
                    birthday: cardBirth, 
                    expire: cardExp 
                })
            });
            showToast('카드 정보가 서버에 안전하게 저장되었습니다.', 'success');
        } catch (e: any) {
            showToast(e.message || '카드 정보 저장 실패', 'error');
        }
    },

    toggleTarget: (trainName, seatType) => {
        const { selectedTargets } = get();
        const exists = selectedTargets.find(t => t.train_name === trainName && t.seat_type === seatType);
        if (exists) {
            set({ selectedTargets: selectedTargets.filter(t => !(t.train_name === trainName && t.seat_type === seatType)) });
        } else {
            set({ selectedTargets: [...selectedTargets, { train_name: trainName, seat_type: seatType }] });
        }
    },

    bulkToggleTarget: (seatType) => {
        const { trains, selectedTargets } = get();
        if (trains.length === 0) return;
        const allOfType = trains.map(t => ({ train_name: t.train_name, seat_type: seatType }));
        const currentOfType = selectedTargets.filter(x => x.seat_type === seatType);
        
        if (currentOfType.length === trains.length) {
            set({ selectedTargets: selectedTargets.filter(x => x.seat_type !== seatType) });
        } else {
            const filtered = selectedTargets.filter(x => x.seat_type !== seatType);
            set({ selectedTargets: [...filtered, ...allOfType] });
        }
    },

    doSearch: async () => {
        const { dep, arr, date, time, adults, children, seniors, dis1to3, dis4to6 } = get();
        const { showToast } = useUiStore.getState();
        
        set({ searching: true });
        try {
            const res = await apiFetch('/search', {
                method: 'POST',
                body: JSON.stringify({ 
                    dep, arr, date, time, adults, children, seniors, 
                    disability1to3: dis1to3, disability4to6: dis4to6, provider: 'SRT' 
                })
            });
            const data = await res.json();
            set({ trains: data.trains });
            if (data.trains.length === 0) showToast('조회 결과가 없습니다.', 'error');
        } catch (e: any) {
            showToast(e.message || '서버 연결 오류', 'error');
        } finally {
            set({ searching: false });
        }
    },

    startAutoReserve: async () => {
        const { selectedTargets } = get();
        const { showAlert } = useUiStore.getState();
        const { addLog, clearLogs } = useLogStore.getState();

        if (selectedTargets.length === 0) return showAlert('알림', '예매할 열차를 먼저 선택해주세요.', '⚠️');

        clearLogs();
        addLog('서버 예매 세션을 요청합니다...', 'info');
        
        try {
            const state = get();
            const res = await apiFetch('/reserve/start', {
                method: 'POST',
                body: JSON.stringify({
                    dep: state.dep, arr: state.arr, date: state.date, time: state.time,
                    adults: state.adults, children: state.children, seniors: state.seniors,
                    disability1to3: state.dis1to3, disability4to6: state.dis4to6,
                    targets: state.selectedTargets, auto_pay: true,
                    provider: 'SRT'
                })
            });

            const { task_id } = await res.json();
            set({ autoReserveActive: true, activeTaskId: task_id, autoReserveAttempts: 0 });

            // Connect to SSE for status updates
            const API_BASE = localStorage.getItem('skimbleshanks_api_base') || 
                            ((import.meta as any).env?.VITE_API_URL) || 
                            (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : `${window.location.origin}/api`);
            
            const eventSource = new EventSource(`${API_BASE}/reserve/status/${task_id}`);
            
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.message) {
                    addLog(data.message, data.type === 'error' ? 'error' : data.type === 'success' ? 'success' : 'info');
                }
                
                if (data.type === 'info' && data.message.includes('회차')) {
                    set(s => ({ autoReserveAttempts: s.autoReserveAttempts + 1 }));
                }

                if (data.type === 'success') {
                    showAlert('🎉 예매 성공!', data.message, '🎊');
                    set({ autoReserveActive: false, activeTaskId: null });
                    eventSource.close();
                } else if (data.type === 'stop') {
                    set({ autoReserveActive: false, activeTaskId: null });
                    eventSource.close();
                }
            };

            eventSource.onerror = () => {
                addLog('실시간 상태 연결에 실패했습니다. (백그라운드에서 예매는 계속될 수 있습니다)', 'warning');
                eventSource.close();
            };

        } catch (e: any) {
            addLog(`예매 시작 실패: ${e.message}`, 'error');
        }
    },

    stopAutoReserve: async () => {
        const { activeTaskId } = get();
        const { addLog } = useLogStore.getState();
        
        if (activeTaskId) {
            try {
                await apiFetch(`/reserve/stop/${activeTaskId}`, { method: 'POST' });
                addLog('예매 중지 요청을 보냈습니다.', 'warning');
            } catch (e) {}
        }
        
        set({ autoReserveActive: false, activeTaskId: null });
    }
}));
