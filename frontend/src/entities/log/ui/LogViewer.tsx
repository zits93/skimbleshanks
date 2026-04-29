import { useEffect, useRef, useState } from 'react';
import { useLogStore } from '../model/logStore';
import { useRailStore } from '../../../features/reservation/model/railStore';
import { Terminal } from 'lucide-react';

export function LogViewer() {
    const { logs, clearLogs } = useLogStore();
    const { stopAutoReserve } = useRailStore();
    const [isMinimized, setIsMinimized] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="log-viewer glass">
            <div className="log-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.02)'
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <button 
                        className="terminal-dot red" 
                        onClick={stopAutoReserve} 
                        title="자동 예매 중지"
                        style={{ border: 'none', cursor: 'pointer' }}
                    ></button>
                    <button 
                        className="terminal-dot yellow" 
                        onClick={clearLogs} 
                        title="로그 지우기"
                        style={{ border: 'none', cursor: 'pointer' }}
                    ></button>
                    <button 
                        className="terminal-dot green"
                        onClick={() => setIsMinimized(!isMinimized)}
                        title={isMinimized ? "로그 확장" : "로그 최소화"}
                        style={{ border: 'none', cursor: 'pointer' }}
                    ></button>
                    <Terminal size={16} color="var(--primary)" style={{ marginLeft: '8px' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', fontFamily: 'Outfit, sans-serif' }}>실시간 작업 로그</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <span className="log-count" style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: 600 }}>{logs.length} ENTRIES</span>
                </div>
            </div>
            <div className="log-content" ref={scrollRef} style={{ 
                padding: isMinimized ? '0.8rem 1.5rem' : '1.2rem 1.5rem',
                maxHeight: isMinimized ? '45px' : '250px',
                overflowY: isMinimized ? 'hidden' : 'auto'
            }}>
                {logs.length === 0 ? (
                    <div className="log-empty">로그가 없습니다</div>
                ) : (
                    isMinimized ? (
                        <div className={`log-item ${logs[logs.length - 1].type || ''}`} style={{ margin: 0 }}>
                            <span className="log-time">[{logs[logs.length - 1].time}]</span>
                            <span className="log-msg">{logs[logs.length - 1].message}</span>
                        </div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className={`log-item ${log.type || ''}`}>
                                <span className="log-time">[{log.time}]</span>
                                <span className="log-msg">{log.message}</span>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
}
