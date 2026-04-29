import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../../features/auth/model/authStore';
import { Terminal, RefreshCw } from 'lucide-react';

export function LogViewer() {
    const { serverLogs, fetchLogs } = useAuthStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchLogs();
        const timer = setInterval(fetchLogs, 5000);
        return () => clearInterval(timer);
    }, [fetchLogs]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [serverLogs]);

    return (
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.1rem', color: 'var(--primary)', margin: 0 }}>
                    <Terminal size={18} /> 실시간 서버 로그
                </h3>
                <button onClick={fetchLogs} className="icon-btn" title="새로고침">
                    <RefreshCw size={16} />
                </button>
            </div>
            
            <div 
                ref={scrollRef}
                style={{ 
                    backgroundColor: 'rgba(0,0,0,0.3)', 
                    borderRadius: '8px', 
                    padding: '1rem', 
                    flex: 1, 
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    lineHeight: '1.4',
                    color: '#e0e0e0'
                }}
            >
                {serverLogs.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>로그가 없습니다.</div>
                ) : (
                    serverLogs.map((log, i) => {
                        let color = '#e0e0e0';
                        if (log.includes('INFO')) color = '#a0c0ff';
                        if (log.includes('WARNING')) color = '#ffd080';
                        if (log.includes('ERROR')) color = '#ff8080';
                        if (log.includes('SUCCESS')) color = '#80ffb0';

                        return <div key={i} style={{ color, marginBottom: '2px', wordBreak: 'break-all' }}>{log}</div>
                    })
                )}
            </div>
        </div>
    );
}
