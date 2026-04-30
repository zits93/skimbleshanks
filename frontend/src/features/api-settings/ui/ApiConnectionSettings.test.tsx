import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiConnectionSettings } from './ApiConnectionSettings';
import { useUiStore } from '../../../shared/api/uiStore';

vi.mock('../../../shared/api/uiStore', () => ({
    useUiStore: vi.fn()
}));

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
    value: { reload: mockReload },
    writable: true
});

describe('ApiConnectionSettings', () => {
    const mockShowToast = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        (useUiStore as any).mockReturnValue({
            showToast: mockShowToast
        });
        localStorage.clear();
    });

    it('should show connection info and reload', async () => {
        render(<ApiConnectionSettings />);
        
        expect(screen.getByText(/로컬 API 서버와 연동/i)).toBeDefined();
        
        const saveBtn = screen.getByText(/저장 후 새로고침/i);
        fireEvent.click(saveBtn);
        
        expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining('설정이 저장'), 'success');
        
        vi.advanceTimersByTime(1000);
        expect(mockReload).toHaveBeenCalled();
    });
});
