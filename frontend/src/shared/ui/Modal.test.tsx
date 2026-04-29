import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal';
import { useUiStore } from '../api/uiStore';

vi.mock('../api/uiStore', () => ({
    useUiStore: vi.fn()
}));

describe('Modal', () => {
    it('should render nothing when modal is null', () => {
        (useUiStore as any).mockReturnValue({
            modal: null,
            hideModal: vi.fn()
        });
        
        const { container } = render(<Modal />);
        expect(container.firstChild).toBeNull();
    });

    it('should render title, message and buttons', () => {
        const mockHideModal = vi.fn();
        const mockButtonClick = vi.fn();
        
        (useUiStore as any).mockReturnValue({
            modal: {
                title: 'Test Modal',
                message: 'Hello World',
                icon: '👋',
                buttons: [
                    { label: 'Confirm', onClick: mockButtonClick, primary: true }
                ]
            },
            hideModal: mockHideModal
        });
        
        render(<Modal />);
        
        expect(screen.getByText('Test Modal')).toBeDefined();
        expect(screen.getByText('Hello World')).toBeDefined();
        
        const confirmBtn = screen.getByText('Confirm');
        fireEvent.click(confirmBtn);
        expect(mockButtonClick).toHaveBeenCalled();
    });

    it('should call hideModal when clicking overlay', () => {
        const mockHideModal = vi.fn();
        (useUiStore as any).mockReturnValue({
            modal: {
                title: 'Test',
                message: 'Test',
                icon: '',
                buttons: []
            },
            hideModal: mockHideModal
        });
        
        render(<Modal />);
        
        const overlay = screen.getByTestId('modal-overlay');
        fireEvent.click(overlay);
        expect(mockHideModal).toHaveBeenCalled();
    });
});
