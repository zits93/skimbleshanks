import { create } from 'zustand';

interface ModalButton {
    label: string;
    onClick: () => void;
    primary?: boolean;
    timer?: number;
}

interface ModalState {
    icon?: string;
    title?: string;
    message?: string;
    buttons: ModalButton[];
}

interface ToastState {
    message: string;
    type: 'info' | 'success' | 'error';
    key: number;
}

interface UiStore {
    toast: ToastState | null;
    modal: ModalState | null;
    showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
    hideToast: () => void;
    showModal: (modal: ModalState) => void;
    hideModal: () => void;
    showAlert: (title: string, message: string, icon?: string, timer?: number | null, btnLabel?: string) => Promise<void>;
}

export const useUiStore = create<UiStore>((set) => ({
    toast: null,
    modal: null,
    showToast: (message, type = 'info') => set({ toast: { message, type, key: Date.now() } }),
    hideToast: () => set({ toast: null }),
    showModal: (modal) => set({ modal }),
    hideModal: () => set({ modal: null }),
    showAlert: (title, message, icon = '📢', timer = null, btnLabel = '확인') => {
        return new Promise<void>((resolve) => {
            set({
                modal: {
                    icon,
                    title,
                    message,
                    buttons: [{
                        label: btnLabel,
                        primary: true,
                        timer: timer || undefined,
                        onClick: () => {
                            set({ modal: null });
                            resolve();
                        }
                    }]
                }
            });
        });
    }
}));
