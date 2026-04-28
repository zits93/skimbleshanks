import { Server } from 'lucide-react';
import { useUiStore } from '../../../shared/api/uiStore';

export function ApiConnectionSettings() {
    const { showToast } = useUiStore();

    const updateApiKey = (val: string) => {
        localStorage.setItem('skimbleshanks_api_key', val);
        showToast('API 키가 저장되었습니다. 반영을 위해 새로고침합니다.', 'success');
        setTimeout(() => window.location.reload(), 1000);
    };

    const updateApiBase = (val: string) => {
        localStorage.setItem('skimbleshanks_api_base', val);
        showToast('API 주소가 저장되었습니다. 반영을 위해 새로고침합니다.', 'success');
        setTimeout(() => window.location.reload(), 1000);
    };

    return (
        <div className="glass" style={{padding: '2rem'}}>
            <h3 style={{display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--primary)'}}>
                <Server size={20} /> API 연결 설정
            </h3>
            <div className="input-group">
                <label>백엔드 API 주소</label>
                <input 
                    defaultValue={localStorage.getItem('skimbleshanks_api_base') || ''} 
                    onBlur={e => updateApiBase(e.target.value)} 
                    placeholder="http://localhost:8000/api"
                />
            </div>
            <div className="input-group">
                <label>API 인증 키 (X-API-KEY)</label>
                <input 
                    type="password" 
                    defaultValue={localStorage.getItem('skimbleshanks_api_key') || ''} 
                    onBlur={e => updateApiKey(e.target.value)} 
                    placeholder="인증 키를 입력하세요"
                />
            </div>
        </div>
    );
}
