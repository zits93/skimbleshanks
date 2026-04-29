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
    onClose?: () => void;
}

interface ToastState {
    message: string;
    type: 'info' | 'success' | 'error';
    key: number;
}

interface UiStore {
    toast: ToastState | null;
    modal: ModalState | null;
    activeTab: 'search' | 'settings';
    showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
    hideToast: () => void;
    showModal: (modal: ModalState) => void;
    hideModal: () => void;
    setActiveTab: (tab: 'search' | 'settings') => void;
    showAlert: (title: string, message: string, icon?: string, timer?: number | null, btnLabel?: string) => Promise<void>;
}

export const useUiStore = create<UiStore>((set, get) => ({
    toast: null,
    modal: null,
    activeTab: 'search',
    showToast: (message, type = 'info') => set({ toast: { message, type, key: Date.now() } }),
    hideToast: () => set({ toast: null }),
    showModal: (modal) => set({ modal }),
    hideModal: () => {
        const { modal } = get();
        if (modal?.onClose) modal.onClose();
        set({ modal: null });
    },
    setActiveTab: (tab) => set({ activeTab: tab }),
    showAlert: (title, message, icon = '📢', timer = null, btnLabel = '확인') => {
        return new Promise<void>((resolve) => {
            set({
                modal: {
                    icon,
                    title,
                    message,
                    onClose: resolve,
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
