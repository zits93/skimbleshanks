import React, { useEffect, useRef } from 'react';

export function LogViewer({ logs }) {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    if (logs.length === 0) return null;

    return (
        <div className="log-viewer glass">
            <div className="log-header">
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 5px rgba(96, 165, 250, 0.5))'}}><path d="m13 2-2 10h3l-2 10"/></svg>
                    <span>실시간 작업 로그</span>
                </div>
                <span className="log-count">{logs.length} entries</span>
            </div>
            <div className="log-content" ref={scrollRef}>
                {logs.map((log, i) => (
                    <div key={i} className={`log-item ${log.type || ''}`}>
                        <span className="log-time">[{log.time}]</span>
                        <span className="log-msg">{log.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
