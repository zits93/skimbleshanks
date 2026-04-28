import React from 'react';
import ReactDOM from 'react-dom';

export function Modal({ icon, title, message, buttons, onClose }) {
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
                            onClick={btn.onClick}
                        >{btn.label}</button>
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
}
