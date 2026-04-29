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
    setCardField: (field, value) => {
        set({ [field]: value } as any);
        if (field.startsWith('card')) {
            const storageKey = `skimbleshanks_${field.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`)}`;
            localStorage.setItem(storageKey, value);
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
        
        try {
            const res = await apiFetch('/search', {
                method: 'POST',
                body: JSON.stringify({ 
                    dep, arr, date, time, adults, children, seniors, 
                    disability1to3: dis1to3, disability4to6: dis4to6, provider: 'SRT' 
                })
            });
            if (res.ok) {
                const data = await res.json();
                set({ trains: data.trains });
                if (data.trains.length === 0) showToast('조회 결과가 없습니다.', 'error');
            } else {
                showToast('조회 중 오류 발생', 'error');
            }
        } catch (e) {
            showToast('서버 연결 오류', 'error');
        }
    },

    startAutoReserve: () => {
        const { selectedTargets, cardNum, cardPw, cardBirth, cardExp } = get();
        const { showAlert } = useUiStore.getState();
        const { addLog, clearLogs } = useLogStore.getState();

        if (selectedTargets.length === 0) return showAlert('알림', '예매할 열차를 먼저 선택해주세요.', '⚠️');
        if (!cardNum || !cardPw || !cardBirth || !cardExp) {
            return showAlert('알림', '자동 결제를 위한 카드 정보를 모두 입력해주세요.', '💳', 3000, '설정하러 가기');
        }

        clearLogs();
        addLog('자동 예매를 시작합니다.', 'info');
        set({ autoReserveActive: true, autoReserveAttempts: 0 });
        
        const attempt = async () => {
            const state = get();
            if (!state.autoReserveActive) return;

            set(s => ({ autoReserveAttempts: s.autoReserveAttempts + 1 }));
            const currentAttempt = get().autoReserveAttempts;
            addLog(`[${currentAttempt}회차] 열차 조회 및 예매 시도 중...`, 'info');

            try {
                const res = await apiFetch('/reserve', {
                    method: 'POST',
                    body: JSON.stringify({
                        dep: state.dep, arr: state.arr, date: state.date, time: state.time,
                        adults: state.adults, children: state.children, seniors: state.seniors,
                        disability1to3: state.dis1to3, disability4to6: state.dis4to6,
                        targets: state.selectedTargets, auto_pay: true,
                        card_number: state.cardNum, 
                        card_password: state.cardPw,
                        card_birthday: state.cardBirth, 
                        card_expire: state.cardExp,
                        provider: 'SRT'
                    })
                });

                if (!get().autoReserveActive) return;

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({ detail: '서버 응답 오류' }));
                    addLog(`예매 시도 실패: ${errData.detail}`, 'error');
                    autoTimer = setTimeout(attempt, 2000);
                    return;
                }

                const data = await res.json();
                if (data.success) {
                    addLog(`예매 성공! ${data.message}`, 'success');
                    set({ autoReserveActive: false });
                    showAlert('🎉 예매 성공!', data.message, '🎊');
                } else if (data.retry) {
                    autoTimer = setTimeout(attempt, 1000);
                } else {
                    addLog(`예매 실패: ${data.message}`, 'error');
                    set({ autoReserveActive: false });
                    showAlert('❌ 예매 실패', data.message, '🚨');
                }
            } catch (e) {
                addLog('서버 연결 오류로 재시도합니다.', 'error');
                autoTimer = setTimeout(attempt, 3000);
            }
        };

        attempt();
    },

    stopAutoReserve: () => {
        const { addLog } = useLogStore.getState();
        addLog('자동 예매를 중지합니다.', 'warning');
        set({ autoReserveActive: false });
        if (autoTimer) clearTimeout(autoTimer);
    }
}));
