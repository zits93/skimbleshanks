import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LogViewer } from './LogViewer';
import { useLogStore } from '../model/logStore';

vi.mock('../model/logStore', () => ({
    useLogStore: vi.fn()
}));

describe('LogViewer', () => {
    const mockClearLogs = vi.fn();

    it('should render logs from store', () => {
        (useLogStore as any).mockReturnValue({
            logs: [
                { id: 1, message: 'Test Log 1', time: '12:00:00' },
                { id: 2, message: 'Test Log 2', time: '12:00:01' }
            ],
            clearLogs: mockClearLogs
        });

        render(<LogViewer />);
        
        expect(screen.getByText(/Test Log 1/)).toBeDefined();
        expect(screen.getByText(/Test Log 2/)).toBeDefined();
        expect(screen.getByText(/12:00:00/)).toBeDefined();
    });

    it('should call clearLogs when clicking clear button', () => {
        (useLogStore as any).mockReturnValue({
            logs: [{ id: 1, message: 'Log', time: '12:00' }],
            clearLogs: mockClearLogs
        });

        render(<LogViewer />);
        
        const clearBtn = screen.getByTitle('로그 지우기');
        fireEvent.click(clearBtn);
        
        expect(mockClearLogs).toHaveBeenCalled();
    });

    it('should render empty state message when no logs', () => {
        (useLogStore as any).mockReturnValue({
            logs: [],
            clearLogs: mockClearLogs
        });

        render(<LogViewer />);
        expect(screen.getByText(/로그가 없습니다/i)).toBeDefined();
    });
});
