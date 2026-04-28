import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

export function Toast({ message, type, onDone }) {
    useEffect(() => {
        const t = setTimeout(onDone, 3000);
        return () => clearTimeout(t);
    }, [onDone]);

    return ReactDOM.createPortal(
        <div className={`toast ${type || ''}`}>{message}</div>,
        document.body
    );
}
