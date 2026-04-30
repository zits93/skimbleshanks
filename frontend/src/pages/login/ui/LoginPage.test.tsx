import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage';
import { useAuthStore } from '../../../features/auth/model/authStore';
import { useUiStore } from '../../../shared/api/uiStore';

// Mock lucide-react
vi.mock('lucide-react', () => ({
    User: () => <div data-testid="icon-user" />,
}));

vi.mock('../../../features/auth/model/authStore', () => ({
    useAuthStore: vi.fn()
}));

vi.mock('../../../shared/api/uiStore', () => ({
    useUiStore: vi.fn()
}));

describe('LoginPage', () => {
    const mockLogin = vi.fn();
    const mockSetUserId = vi.fn();
    const mockShowToast = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuthStore as any).mockReturnValue({
            userId: '',
            loading: false,
            setUserId: mockSetUserId,
            login: mockLogin
        });
        (useUiStore as any).mockReturnValue({
            showToast: mockShowToast
        });
    });

    it('should render login form', () => {
        render(<LoginPage />);
        expect(screen.getByPlaceholderText(/아이디 입력/i)).toBeDefined();
        expect(screen.getByPlaceholderText(/비밀번호 입력/i)).toBeDefined();
    });

    it('should call login when form is submitted', async () => {
        mockLogin.mockResolvedValue(true);
        render(<LoginPage />);
        
        const idInput = screen.getByPlaceholderText(/아이디 입력/i);
        const pwInput = screen.getByPlaceholderText(/비밀번호 입력/i);
        screen.getByText('로그인');

        fireEvent.change(idInput, { target: { value: 'user1' } });
        fireEvent.change(pwInput, { target: { value: 'pass1' } });
        
        const form = screen.getByTestId('login-form');
        fireEvent.submit(form);

        expect(mockSetUserId).toHaveBeenCalledWith('user1');
        expect(mockLogin).toHaveBeenCalledWith('pass1', 'SRT');
    });
});
