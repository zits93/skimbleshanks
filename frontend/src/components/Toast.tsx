import { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ToastProps {
    message: string;
    type?: string;
    onDone: () => void;
}

export function Toast({ message, type, onDone }: ToastProps) {
    useEffect(() => {
        const t = setTimeout(onDone, 3000);
        return () => clearTimeout(t);
    }, [onDone]);

    return ReactDOM.createPortal(
        <div className={`toast ${type || ''}`}>{message}</div>,
        document.body
    );
}
