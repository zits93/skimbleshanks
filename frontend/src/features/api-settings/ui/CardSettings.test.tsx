import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CardSettings } from './CardSettings';
import { useRailStore } from '../../reservation/model/railStore';

vi.mock('../../reservation/model/railStore', () => ({
    useRailStore: vi.fn()
}));

describe('CardSettings', () => {
    const mockSetCardField = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useRailStore as any).mockReturnValue({
            cardNum: '',
            cardPw: '',
            cardBirth: '',
            cardExp: '',
            setCardField: mockSetCardField
        });
    });

    it('should update card fields', () => {
        render(<CardSettings />);
        
        const numInput = screen.getByPlaceholderText('0000-0000-0000-0000');
        fireEvent.change(numInput, { target: { value: '1234-5678' } });
        expect(mockSetCardField).toHaveBeenCalledWith('cardNum', '1234-5678');

        const pwInput = screen.getByPlaceholderText('**');
        fireEvent.change(pwInput, { target: { value: '12' } });
        expect(mockSetCardField).toHaveBeenCalledWith('cardPw', '12');
    });
});
