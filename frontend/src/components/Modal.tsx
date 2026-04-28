import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUiStore } from '../store/uiStore';
import { useEffect } from 'react';

export function Modal() {
    const { modal, hideModal } = useUiStore();

    useEffect(() => {
        if (modal) {
            const timerBtn = modal.buttons.find(b => b.timer);
            if (timerBtn) {
                const t = setTimeout(() => {
                    timerBtn.onClick();
                }, timerBtn.timer);
                return () => clearTimeout(t);
            }
        }
    }, [modal]);

    if (!modal) return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modal-overlay" 
                onClick={hideModal}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 10 }}
                    className="modal-box" 
                    onClick={e => e.stopPropagation()}
                >
                    {modal.icon && <span className="modal-icon">{modal.icon}</span>}
                    {modal.title && <p className="modal-title">{modal.title}</p>}
                    {modal.message && <p className="modal-message">{modal.message}</p>}
                    <div className="modal-buttons">
                        {modal.buttons.map((btn, i) => (
                            <button
                                key={i}
                                className={btn.primary ? 'modal-btn-primary' : 'modal-btn-secondary'}
                                style={btn.timer ? { position: 'relative', overflow: 'hidden' } : {}}
                                onClick={btn.onClick}
                            >
                                {btn.label}
                                {btn.timer && (
                                    <div 
                                        className="modal-btn-progress" 
                                        style={{ animationDuration: `${btn.timer}ms` }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}
