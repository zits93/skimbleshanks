import { useState } from 'react';
import { Server, Save, Globe, Key } from 'lucide-react';
import { useUiStore } from '../../../shared/api/uiStore';

export function ApiConnectionSettings() {
    const { showToast } = useUiStore();
    const [baseUrl, setBaseUrl] = useState(localStorage.getItem('skimbleshanks_api_base') || '');
    const [apiKey, setApiKey] = useState(localStorage.getItem('skimbleshanks_api_key') || '');

    const handleSave = () => {
        localStorage.setItem('skimbleshanks_api_base', baseUrl);
        localStorage.setItem('skimbleshanks_api_key', apiKey);
        showToast('설정이 저장되었습니다. 반영을 위해 새로고침합니다.', 'success');
        setTimeout(() => window.location.reload(), 1000);
    };

    return (
        <div className="glass" style={{padding: '2.5rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <h3 style={{display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 800}}>
                    <Server size={22} /> API 서버 연결
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
                <div className="input-group" style={{marginBottom: 0}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <Globe size={14} /> 백엔드 API 주소
                    </label>
                    <input 
                        value={baseUrl} 
                        onChange={e => setBaseUrl(e.target.value)} 
                        placeholder="http://localhost:8000/api"
                        style={{padding: '0.9rem 1.1rem', fontSize: '0.95rem'}}
                    />
                </div>
                
                <div className="input-group" style={{marginBottom: 0}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <Key size={14} /> API 인증 키 (X-API-KEY)
                    </label>
                    <input 
                        type="password" 
                        value={apiKey} 
                        onChange={e => setApiKey(e.target.value)} 
                        placeholder="인증 키를 입력하세요"
                        style={{padding: '0.9rem 1.1rem', fontSize: '0.95rem'}}
                    />
                </div>
            </div>
            
            <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '1.2rem', textAlign: 'center', lineHeight: 1.4 }}>
                🔒 입력하신 API 키 정보는 브라우저에 저장되며,<br/>서버 데이터베이스에는 저장되지 않습니다.
            </div>
        </div>
    );
}
