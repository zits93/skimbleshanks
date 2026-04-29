import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MainPage from './MainPage';
import { useAuthStore } from '../../../features/auth/model/authStore';
import { useRailStore } from '../../../features/reservation/model/railStore';

// Mock lucide-react
vi.mock('lucide-react', () => ({
    Settings: () => <div data-testid="icon-settings" />,
    Search: () => <div data-testid="icon-search" />,
    Terminal: () => <div data-testid="icon-terminal" />,
    ArrowLeftRight: () => <div data-testid="icon-swap" />,
    CreditCard: () => <div data-testid="icon-card" />,
    Play: () => <div data-testid="icon-play" />,
    Square: () => <div data-testid="icon-square" />,
    Info: () => <div data-testid="icon-info" />,
    Check: () => <div data-testid="icon-check" />,
    Globe: () => <div data-testid="icon-globe" />,
    User: () => <div data-testid="icon-user" />,
    Trash2: () => <div data-testid="icon-trash" />
}));

vi.mock('../../../features/auth/model/authStore', () => ({
    useAuthStore: vi.fn()
}));

vi.mock('../../../features/reservation/model/railStore', () => ({
    useRailStore: vi.fn()
}));

// Mock widgets
vi.mock('../../../widgets/search-form/ui/SearchForm', () => ({
    SearchForm: () => <div data-testid="search-form">Search Form</div>
}));
vi.mock('../../../widgets/train-list/ui/TrainList', () => ({
    TrainList: () => <div data-testid="train-list">Train List</div>
}));
vi.mock('../../../features/api-settings/ui/CardSettings', () => ({
    CardSettings: () => <div data-testid="card-settings">Card Settings</div>
}));
vi.mock('../../../features/api-settings/ui/TelegramSettings', () => ({
    TelegramSettings: () => <div data-testid="telegram-settings">Telegram Settings</div>
}));

describe('MainPage', () => {
    const mockLogout = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuthStore as any).mockReturnValue({
            userId: 'testuser',
            logout: mockLogout
        });
        (useRailStore as any).mockReturnValue({
            autoReserveActive: false
        });
    });

    it('should render reservation tab by default', () => {
        render(<MainPage />);
        expect(screen.getByTestId('search-form')).toBeDefined();
        expect(screen.getByTestId('train-list')).toBeDefined();
    });

    it('should switch to settings tab', () => {
        render(<MainPage />);
        const settingsBtn = screen.getByText(/설정/i);
        
        fireEvent.click(settingsBtn);
        
        expect(screen.getByTestId('card-settings')).toBeDefined();
        expect(screen.queryByTestId('search-form')).toBeNull();
    });

    it('should show telegram settings in dev mode', () => {
        render(<MainPage />);
        // Switch to settings
        fireEvent.click(screen.getByText(/설정/i));

        // Click dev mode checkbox
        const devCheckbox = screen.getByRole('checkbox');
        fireEvent.click(devCheckbox);

        expect(screen.getByTestId('telegram-settings')).toBeDefined();
    });
});
