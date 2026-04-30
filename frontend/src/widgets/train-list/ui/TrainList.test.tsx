import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrainList } from './TrainList';
import { useRailStore } from '../../../features/reservation/model/railStore';

vi.mock('../../../features/reservation/model/railStore', () => ({
    useRailStore: vi.fn()
}));

describe('TrainList', () => {
    const mockToggleTarget = vi.fn();
    const mockBulkToggleTarget = vi.fn();
    const mockStartAutoReserve = vi.fn();
    const mockStopAutoReserve = vi.fn();

    const mockTrains = [
        {
            id: '1',
            train_name: 'SRT 301',
            dep_time: '0900',
            arr_time: '1130',
            duration: '2:30',
            general_seat: '예약가능',
            special_seat: '매진'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (useRailStore as any).mockImplementation(() => ({
            trains: [],
            selectedTargets: [],
            autoReserveActive: false,
            autoReserveAttempts: 0,
            toggleTarget: mockToggleTarget,
            bulkToggleTarget: mockBulkToggleTarget,
            startAutoReserve: mockStartAutoReserve,
            stopAutoReserve: mockStopAutoReserve
        }));
    });

    it('should render empty state message', () => {
        // Uses default from beforeEach
        render(<TrainList />);
        expect(screen.getByText(/열차를 조회해주세요/i)).toBeDefined();
    });

    it('should render searching state', () => {
        (useRailStore as any).mockImplementation(() => ({
            searching: true,
            trains: [],
            selectedTargets: [],
            autoReserveActive: false
        }));
        
        render(<TrainList />);
        expect(screen.getByText(/정보를 불러오는 중/i)).toBeDefined();
    });

    it('should render train list and handle toggles', () => {
        (useRailStore as any).mockImplementation(() => ({
            trains: mockTrains,
            selectedTargets: [],
            autoReserveActive: false,
            autoReserveAttempts: 0,
            toggleTarget: mockToggleTarget,
            bulkToggleTarget: mockBulkToggleTarget,
            startAutoReserve: mockStartAutoReserve,
            stopAutoReserve: mockStopAutoReserve
        }));

        render(<TrainList />);
        
        expect(screen.getByText('SRT 301')).toBeDefined();
        
        const standardSeatBtn = screen.getByText('일반실');
        fireEvent.click(standardSeatBtn);
        expect(mockToggleTarget).toHaveBeenCalledWith('SRT 301', 'GENERAL_FIRST');

        const bulkGeneralBtn = screen.getByText(/일반실 전체/i);
        fireEvent.click(bulkGeneralBtn);
        expect(mockBulkToggleTarget).toHaveBeenCalledWith('GENERAL_FIRST');

        const bulkSpecialBtn = screen.getByText(/특실 전체/i);
        fireEvent.click(bulkSpecialBtn);
        expect(mockBulkToggleTarget).toHaveBeenCalledWith('SPECIAL_ONLY');
    });

    it('should show waiting status when a sold out seat is selected', () => {
        (useRailStore as any).mockImplementation(() => ({
            trains: mockTrains,
            selectedTargets: [{ train_name: 'SRT 301', seat_type: 'SPECIAL_ONLY' }],
            autoReserveActive: false,
            autoReserveAttempts: 0,
            toggleTarget: mockToggleTarget,
            bulkToggleTarget: mockBulkToggleTarget,
            startAutoReserve: vi.fn(),
            stopAutoReserve: vi.fn()
        }));

        render(<TrainList />);
        expect(screen.getByText(/대기 중/i)).toBeDefined();
    });

    it('should handle auto reserve buttons', () => {
        const baseMock = {
            trains: mockTrains,
            selectedTargets: [{ train_name: 'SRT 301', seat_type: 'GENERAL_FIRST' }],
            autoReserveActive: false,
            autoReserveAttempts: 0,
            toggleTarget: mockToggleTarget,
            bulkToggleTarget: mockBulkToggleTarget,
            startAutoReserve: mockStartAutoReserve,
            stopAutoReserve: mockStopAutoReserve
        };

        (useRailStore as any).mockImplementation(() => baseMock);

        const { rerender } = render(<TrainList />);
        
        const startBtn = screen.getByRole('button', { name: /자동 예매 시작/i });
        fireEvent.click(startBtn);
        expect(mockStartAutoReserve).toHaveBeenCalled();

        // Switch to active state
        (useRailStore as any).mockImplementation(() => ({
            ...baseMock,
            autoReserveActive: true,
            autoReserveAttempts: 5
        }));

        rerender(<TrainList />);
        const stopBtn = screen.getByTestId('stop-reserve-btn');
        fireEvent.click(stopBtn);
        expect(mockStopAutoReserve).toHaveBeenCalled();
        expect(screen.getByText(/5회/i)).toBeDefined();
    });
});
