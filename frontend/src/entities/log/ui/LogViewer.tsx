import { useEffect, useRef } from 'react';
import { useLogStore } from '../model/logStore';
import { Terminal } from 'lucide-react';

export function LogViewer() {
    const { logs } = useLogStore();
    const scrollRef = useRef<HTMLDivElement>(null);

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
                    <Terminal size={16} color="#60a5fa" />
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
