import { describe, it, expect, beforeEach } from 'vitest';
import { useUiStore } from './uiStore';

describe('useUiStore', () => {
    beforeEach(() => {
        const store = useUiStore.getState();
        store.hideToast();
        store.hideModal();
    });

    it('should show and hide toast', () => {
        const { showToast, hideToast } = useUiStore.getState();
        
        showToast('Test Message', 'success');
        expect(useUiStore.getState().toast?.message).toBe('Test Message');
        expect(useUiStore.getState().toast?.type).toBe('success');

        hideToast();
        expect(useUiStore.getState().toast).toBeNull();
    });

    it('should show and hide modal', () => {
        const { showModal, hideModal } = useUiStore.getState();
        
        const mockModal = {
            title: 'Modal Title',
            message: 'Modal Msg',
            buttons: []
        };
        
        showModal(mockModal);
        expect(useUiStore.getState().modal?.title).toBe('Modal Title');

        hideModal();
        expect(useUiStore.getState().modal).toBeNull();
    });

    it('should show alert and resolve when clicked', async () => {
        const { showAlert } = useUiStore.getState();
        
        const alertPromise = showAlert('Alert Title', 'Alert Msg');
        const state = useUiStore.getState();
        
        expect(state.modal?.title).toBe('Alert Title');
        expect(state.modal?.buttons[0].label).toBe('확인');

        // Simulate click
        state.modal?.buttons[0].onClick();
        
        await alertPromise;
        expect(useUiStore.getState().modal).toBeNull();
    });
});
