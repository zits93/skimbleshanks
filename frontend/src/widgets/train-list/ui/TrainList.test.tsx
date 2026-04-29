import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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

    it('should render empty state message', () => {
        (useRailStore as any).mockReturnValue({
            trains: [],
            selectedTargets: [],
            autoReserveActive: false
        });

        render(<TrainList />);
        expect(screen.getByText(/열차를 조회해주세요/i)).toBeDefined();
    });

    it('should render train list and handle toggles', () => {
        (useRailStore as any).mockReturnValue({
            trains: mockTrains,
            selectedTargets: [],
            autoReserveActive: false,
            toggleTarget: mockToggleTarget,
            bulkToggleTarget: mockBulkToggleTarget,
            startAutoReserve: mockStartAutoReserve,
            stopAutoReserve: mockStopAutoReserve
        });

        render(<TrainList />);
        
        expect(screen.getByText('SRT 301')).toBeDefined();
        
        const standardSeatBtn = screen.getByText('일반실');
        fireEvent.click(standardSeatBtn);
        expect(mockToggleTarget).toHaveBeenCalledWith('SRT 301', 'GENERAL_FIRST');
    });

    it('should handle auto reserve buttons', () => {
        (useRailStore as any).mockReturnValue({
            trains: mockTrains,
            selectedTargets: [{ train_name: 'SRT 301', seat_type: '일반실' }],
            autoReserveActive: false,
            startAutoReserve: mockStartAutoReserve,
            stopAutoReserve: mockStopAutoReserve,
            toggleTarget: mockToggleTarget,
            bulkToggleTarget: mockBulkToggleTarget
        });

        render(<TrainList />);
        
        const startBtn = screen.getByRole('button', { name: /자동 예매 시작/i });
        fireEvent.click(startBtn);
        expect(mockStartAutoReserve).toHaveBeenCalled();

        // Switch to active state
        (useRailStore as any).mockReturnValue({
            trains: mockTrains,
            selectedTargets: [{ train_name: 'SRT 301', seat_type: '일반실' }],
            autoReserveActive: true,
            startAutoReserve: mockStartAutoReserve,
            stopAutoReserve: mockStopAutoReserve,
            toggleTarget: mockToggleTarget,
            bulkToggleTarget: mockBulkToggleTarget,
            autoReserveAttempts: 5
        });

        render(<TrainList />);
        const stopBtn = screen.getByRole('button', { name: /중지/i });
        fireEvent.click(stopBtn);
        expect(mockStopAutoReserve).toHaveBeenCalled();
        expect(screen.getByText(/5회/i)).toBeDefined();
    });
});
