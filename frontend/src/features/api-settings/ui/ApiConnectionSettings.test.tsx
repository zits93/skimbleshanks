import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

    it('should save API base and reload', async () => {
        render(<ApiConnectionSettings />);
        
        const baseInput = screen.getByPlaceholderText(/localhost:8000/i);
        fireEvent.blur(baseInput, { target: { value: 'https://api.test.com' } });
        
        expect(localStorage.getItem('skimbleshanks_api_base')).toBe('https://api.test.com');
        expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining('주소가 저장'), 'success');
        
        vi.advanceTimersByTime(1000);
        expect(mockReload).toHaveBeenCalled();
    });

    it('should save API key and reload', async () => {
        render(<ApiConnectionSettings />);
        
        const keyInput = screen.getByPlaceholderText(/인증 키를 입력/i);
        fireEvent.blur(keyInput, { target: { value: 'secret-key' } });
        
        expect(localStorage.getItem('skimbleshanks_api_key')).toBe('secret-key');
        expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining('키가 저장'), 'success');
        
        vi.advanceTimersByTime(1000);
        expect(mockReload).toHaveBeenCalled();
    });
});
