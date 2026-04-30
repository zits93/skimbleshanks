import { Server, Save } from 'lucide-react';
import { useUiStore } from '../../../shared/api/uiStore';

export function ApiConnectionSettings() {
    const { showToast } = useUiStore();

    const handleSave = () => {
        showToast('설정이 저장되었습니다. 반영을 위해 새로고침합니다.', 'success');
        setTimeout(() => window.location.reload(), 1000);
    };

    return (
        <div className="glass" style={{padding: '2.5rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <h3 style={{display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 800}}>
                    <Server size={22} /> API 연결 설정
                </h3>
                <button 
                    onClick={handleSave}
                    style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '0.8rem',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        border: 'none',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 15px var(--primary-glow)'
                    }}
                >
                    <Save size={16} /> 저장 후 새로고침
                </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '1.2rem'}}>
                <div style={{ fontSize: '0.9rem', opacity: 0.8, textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.8rem' }}>
                    현재 로컬 API 서버와 연동되어 있습니다.<br/>
                    별도의 인증 키가 필요하지 않은 환경입니다.
                </div>
            </div>
        </div>
    );
}
