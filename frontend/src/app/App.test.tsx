import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { useAuthStore } from '../features/auth/model/authStore';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
    Globe: () => <div data-testid="icon-globe" />,
    User: () => <div data-testid="icon-user" />,
    Terminal: () => <div data-testid="icon-terminal" />,
    Search: () => <div data-testid="icon-search" />,
    Settings: () => <div data-testid="icon-settings" />,
    Server: () => <div data-testid="icon-server" />
}));

vi.mock('../features/auth/model/authStore', () => ({
    useAuthStore: vi.fn()
}));

// Mock pages to avoid deep rendering issues
vi.mock('../pages/login/ui/LoginPage', () => ({
    default: () => <div data-testid="login-page">Login Page</div>
}));
vi.mock('../pages/main/ui/MainPage', () => ({
    default: () => <div data-testid="main-page">Main Page</div>
}));

describe('App', () => {
    const mockCheckConfig = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuthStore as any).mockReturnValue({
            isLoggedIn: false,
            checkConfig: mockCheckConfig
        });
    });

    it('should render login page when not logged in', () => {
        render(<App />);
        expect(screen.getByTestId('login-page')).toBeDefined();
        expect(mockCheckConfig).toHaveBeenCalled();
    });

    it('should render main page when logged in', () => {
        (useAuthStore as any).mockReturnValue({
            isLoggedIn: true,
            checkConfig: mockCheckConfig
        });
        
        render(<App />);
        expect(screen.getByTestId('main-page')).toBeDefined();
    });
});
