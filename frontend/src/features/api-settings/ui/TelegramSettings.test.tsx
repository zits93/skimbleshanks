import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TelegramSettings } from './TelegramSettings';
import { useAuthStore } from '../../auth/model/authStore';
import { useUiStore } from '../../../shared/api/uiStore';

vi.mock('../../auth/model/authStore', () => ({
    useAuthStore: vi.fn()
}));

vi.mock('../../../shared/api/uiStore', () => ({
    useUiStore: vi.fn()
}));

describe('TelegramSettings', () => {
    const mockSetTgField = vi.fn();
    const mockSaveTelegramSettings = vi.fn();
    const mockShowToast = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuthStore as any).mockReturnValue({
            tgToken: '',
            tgChatId: '',
            showTgGuide: false,
            setTgField: mockSetTgField,
            saveTelegramSettings: mockSaveTelegramSettings
        });
        (useUiStore as any).mockReturnValue({
            showToast: mockShowToast
        });
    });

    it('should update telegram fields and save', () => {
        render(<TelegramSettings />);
        
        const tokenInput = screen.getByPlaceholderText(/123456:ABC-DEF/i);
        fireEvent.change(tokenInput, { target: { value: 'new-token' } });
        expect(mockSetTgField).toHaveBeenCalledWith('tgToken', 'new-token');

        const form = screen.getByTestId('tg-form');
        fireEvent.submit(form);
        expect(mockSaveTelegramSettings).toHaveBeenCalled();
    });

    it('should toggle guide', () => {
        (useAuthStore as any).mockReturnValue({
            tgToken: '',
            tgChatId: '',
            showTgGuide: true, // Mock it as open to cover lines
            setTgField: mockSetTgField,
            saveTelegramSettings: mockSaveTelegramSettings
        });

        render(<TelegramSettings />);
        expect(screen.getByText(/봇 생성 및 토큰 받기/i)).toBeDefined();
        
        const guideBtn = screen.getByText(/가이드 닫기/i);
        fireEvent.click(guideBtn);
        expect(mockSetTgField).toHaveBeenCalledWith('showTgGuide', false);
    });
});
