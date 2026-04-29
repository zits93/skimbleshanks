import { useEffect, useRef } from 'react';
import { useLogStore } from '../model/logStore';
import { Terminal, Trash2 } from 'lucide-react';

export function LogViewer() {
    const { logs, clearLogs } = useLogStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="log-viewer glass">
            <div className="log-header">
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Terminal size={16} color="#60a5fa" />
                    <span>실시간 작업 로그</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <span className="log-count">{logs.length} entries</span>
                    <button 
                        onClick={clearLogs} 
                        className="log-clear-btn"
                        title="로그 지우기"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
            <div className="log-content" ref={scrollRef}>
                {logs.length === 0 ? (
                    <div className="log-empty">로그가 없습니다</div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className={`log-item ${log.type || ''}`}>
                            <span className="log-time">[{log.time}]</span>
                            <span className="log-msg">{log.message}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
