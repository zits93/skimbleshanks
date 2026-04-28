import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUiStore } from '../api/uiStore';
import { useEffect } from 'react';

export function Modal() {
    const { modal, hideModal } = useUiStore();

    useEffect(() => {
        if (modal) {
            const timerBtn = modal.buttons.find((b: any) => b.timer);
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
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="modal-content glass" 
                    onClick={e => e.stopPropagation()}
                >
                    <div className="modal-icon">{modal.icon}</div>
                    <h3>{modal.title}</h3>
                    <p>{modal.message}</p>
                    <div className="modal-buttons">
                        {modal.buttons.map((btn: any, i: number) => (
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
