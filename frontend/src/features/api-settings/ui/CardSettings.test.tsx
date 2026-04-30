import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CardSettings } from './CardSettings';
import { useRailStore } from '../../reservation/model/railStore';

import { useUiStore } from '../../../shared/api/uiStore';

vi.mock('../../reservation/model/railStore', () => ({
    useRailStore: vi.fn()
}));

vi.mock('../../../shared/api/uiStore', () => ({
    useUiStore: vi.fn()
}));

describe('CardSettings', () => {
    const mockSetCardField = vi.fn();
    const mockClearCardInfo = vi.fn();
    const mockShowToast = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useRailStore as any).mockReturnValue({
            cardNum: '1111-2222',
            cardPw: '12',
            cardBirth: '900101',
            cardExp: '2512',
            setCardField: mockSetCardField,
            clearCardInfo: mockClearCardInfo
        });
        (useUiStore as any).mockReturnValue({
            showToast: mockShowToast
        });
        vi.spyOn(window, 'confirm').mockReturnValue(true);
    });

    it('should update card fields', () => {
        render(<CardSettings />);
        
        const numInput = screen.getByPlaceholderText('0000-0000-0000-0000');
        fireEvent.change(numInput, { target: { value: '1234-5678' } });
        expect(mockSetCardField).toHaveBeenCalledWith('cardNum', '1234-5678');
    });

    it('should clear card info when trash button is clicked', () => {
        render(<CardSettings />);
        
        const clearBtn = screen.getByTitle('정보 삭제');
        fireEvent.click(clearBtn);
        
        expect(window.confirm).toHaveBeenCalled();
        expect(mockClearCardInfo).toHaveBeenCalled();
        expect(mockShowToast).toHaveBeenCalledWith(expect.any(String), 'success');
    });
});
