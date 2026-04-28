import { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ModalButton {
    label: string;
    onClick: () => void;
    primary?: boolean;
    timer?: number;
}

interface ModalProps {
    icon?: string;
    title?: string;
    message?: string;
    buttons: ModalButton[];
    onClose: () => void;
}

export function Modal({ icon, title, message, buttons, onClose }: ModalProps) {
    useEffect(() => {
        const timerBtn = buttons.find(b => b.timer);
        if (timerBtn) {
            const t = setTimeout(() => {
                timerBtn.onClick();
            }, timerBtn.timer);
            return () => clearTimeout(t);
        }
    }, [buttons]);

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                {icon && <span className="modal-icon">{icon}</span>}
                {title && <p className="modal-title">{title}</p>}
                {message && <p className="modal-message">{message}</p>}
                <div className="modal-buttons">
                    {buttons.map((btn, i) => (
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
            </div>
        </div>,
        document.body
    );
}
