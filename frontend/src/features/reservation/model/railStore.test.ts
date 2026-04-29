import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRailStore } from './railStore';

// Mock uiStore to avoid toast/alert issues during tests
const mockShowToast = vi.fn();
const mockShowAlert = vi.fn();

vi.mock('../../../shared/api/uiStore', () => ({
    useUiStore: {
        getState: () => ({
            showToast: mockShowToast,
            showAlert: mockShowAlert
        })
    }
}));

describe('useRailStore', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
        mockShowToast.mockClear();
        mockShowAlert.mockClear();
        localStorage.clear();
        // Reset store state before each test
        const store = useRailStore.getState();
        store.setSearchField('trains', []);
        store.setSearchField('selectedTargets', []);
        store.setSearchField('autoReserveActive', false);
        store.setCardField('cardNum', '');
        store.setCardField('cardPw', '');
        store.setCardField('cardBirth', '');
        store.setCardField('cardExp', '');
    });

    it('should update search fields', () => {
        const { setSearchField } = useRailStore.getState();
        setSearchField('dep', '대전');
        expect(useRailStore.getState().dep).toBe('대전');
    });

    it('should update card fields and localStorage', () => {
        const { setCardField } = useRailStore.getState();
        setCardField('cardNum', '1234-5678');
        expect(useRailStore.getState().cardNum).toBe('1234-5678');
        expect(localStorage.getItem('skimbleshanks_card_num')).toBe('1234-5678');
    });

    it('should toggle targets', () => {
        const { toggleTarget } = useRailStore.getState();
        toggleTarget('SRT101', '일반실');
        expect(useRailStore.getState().selectedTargets).toHaveLength(1);
        expect(useRailStore.getState().selectedTargets[0]).toEqual({ train_name: 'SRT101', seat_type: '일반실' });

        toggleTarget('SRT101', '일반실');
        expect(useRailStore.getState().selectedTargets).toHaveLength(0);
    });

    it('should bulk toggle targets', () => {
        const { setSearchField, bulkToggleTarget } = useRailStore.getState();
        const mockTrains = [
            { train_name: 'SRT101' },
            { train_name: 'SRT102' }
        ];
        setSearchField('trains', mockTrains);
        
        bulkToggleTarget('일반실');
        expect(useRailStore.getState().selectedTargets).toHaveLength(2);

        bulkToggleTarget('일반실');
        expect(useRailStore.getState().selectedTargets).toHaveLength(0);
    });

    it('should fetch trains successfully', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({ trains: [{ train_name: 'SRT101' }] })
        };
        (fetch as any).mockResolvedValue(mockResponse);

        const { doSearch } = useRailStore.getState();
        await doSearch();

        expect(useRailStore.getState().trains).toHaveLength(1);
        expect(useRailStore.getState().trains[0].train_name).toBe('SRT101');
    });

    it('should fail startAutoReserve without targets', () => {
        const { startAutoReserve } = useRailStore.getState();
        
        startAutoReserve();
        expect(mockShowAlert).toHaveBeenCalledWith(
            expect.any(String), 
            expect.stringContaining('먼저 선택'), 
            expect.any(String)
        );
        expect(useRailStore.getState().autoReserveActive).toBe(false);
    });

    it('should fail startAutoReserve without card info', () => {
        const { toggleTarget, startAutoReserve } = useRailStore.getState();
        
        toggleTarget('SRT101', '일반실');
        startAutoReserve();
        
        expect(mockShowAlert).toHaveBeenCalledWith(
            expect.any(String), 
            expect.stringContaining('카드 정보'), 
            expect.any(String),
            expect.any(Number),
            expect.any(String)
        );
        expect(useRailStore.getState().autoReserveActive).toBe(false);
    });

    it('should stop auto reserve', () => {
        const { stopAutoReserve, setSearchField } = useRailStore.getState();
        setSearchField('autoReserveActive', true);
        
        stopAutoReserve();
        expect(useRailStore.getState().autoReserveActive).toBe(false);
    });

    it('should successfully complete auto reservation', async () => {
        vi.useFakeTimers();
        const { toggleTarget, setCardField, startAutoReserve } = useRailStore.getState();
        
        toggleTarget('SRT101', '일반실');
        setCardField('cardNum', '1234');
        setCardField('cardPw', '12');
        setCardField('cardBirth', '900101');
        setCardField('cardExp', '2512');

        const mockResponse = {
            ok: true,
            json: async () => ({ success: true, message: '예매 성공' })
        };
        (fetch as any).mockResolvedValue(mockResponse);

        startAutoReserve();
        
        // Wait for async attempt
        await vi.runAllTimersAsync();

        expect(useRailStore.getState().autoReserveActive).toBe(false);
        expect(mockShowAlert).toHaveBeenCalledWith(expect.stringContaining('성공'), '예매 성공', '🎊');
        vi.useRealTimers();
    });

    it('should retry auto reservation on failure', async () => {
        vi.useFakeTimers();
        const { toggleTarget, setCardField, startAutoReserve } = useRailStore.getState();
        
        toggleTarget('SRT101', '일반실');
        setCardField('cardNum', '1234');
        setCardField('cardPw', '12');
        setCardField('cardBirth', '900101');
        setCardField('cardExp', '2512');

        // First attempt fails, second succeeds
        const failResponse = {
            ok: false,
            json: async () => ({ detail: '매진' })
        };
        const successResponse = {
            ok: true,
            json: async () => ({ success: true, message: '예매 성공' })
        };
        
        (fetch as any)
            .mockResolvedValueOnce(failResponse)
            .mockResolvedValueOnce(successResponse);

        startAutoReserve();
        
        // First attempt
        await vi.advanceTimersByTimeAsync(0);
        expect(useRailStore.getState().autoReserveAttempts).toBe(1);

        // Second attempt after timeout
        await vi.advanceTimersByTimeAsync(2000);
        expect(useRailStore.getState().autoReserveAttempts).toBe(2);
        expect(useRailStore.getState().autoReserveActive).toBe(false);
        
        vi.useRealTimers();
    });
});
