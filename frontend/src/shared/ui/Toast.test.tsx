import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toast } from './Toast';
import { useUiStore } from '../../shared/api/uiStore';

vi.mock('../../shared/api/uiStore', () => ({
    useUiStore: vi.fn()
}));

describe('Toast', () => {
    it('should render nothing when toast is not visible', () => {
        (useUiStore as any).mockReturnValue({
            toast: { visible: false, message: '', type: 'info' },
            hideToast: vi.fn()
        });
        
        const { container } = render(<Toast />);
        expect(container.firstChild).toBeNull();
    });

    it('should render message and type class when visible', () => {
        (useUiStore as any).mockReturnValue({
            toast: { visible: true, message: 'Success Message', type: 'success' },
            hideToast: vi.fn()
        });
        
        render(<Toast />);
        expect(screen.getByText('Success Message')).toBeDefined();
        expect(screen.getByRole('alert')).toHaveClass('success');
    });
});
