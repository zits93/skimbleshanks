import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUiStore } from '../api/uiStore';
import { useEffect } from 'react';

export function Toast() {
    const { toast, hideToast } = useUiStore();

    useEffect(() => {
        if (toast) {
            const t = setTimeout(hideToast, 3000);
            return () => clearTimeout(t);
        }
    }, [toast, hideToast]);

    return ReactDOM.createPortal(
        <AnimatePresence>
            {toast && (
                <motion.div 
                    initial={{ opacity: 0, y: 20, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: 10, x: '-50%' }}
                    className={`toast ${toast.type || ''}`}
                    role="alert"
                >
                    {toast.message}
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
