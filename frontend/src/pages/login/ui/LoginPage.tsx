import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../../features/auth/model/authStore';
import { useUiStore } from '../../../shared/api/uiStore';
import { ApiConnectionSettings } from '../../../features/api-settings/ui/ApiConnectionSettings';
import { User, Terminal } from 'lucide-react';
import '../../../app/style.css';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [devMode, setDevMode] = useState(false);
    const { userId, setUserId, login, loading } = useAuthStore();
    const { showToast } = useUiStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login(password, 'SRT');
        if (success) {
            showToast('로그인 성공!', 'success');
        } else {
            showToast('로그인 실패. 정보를 확인하세요.', 'error');
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: '420px', margin: '5vh auto 0' }}
        >
            <div className="glass login-card">
                <form onSubmit={handleLogin} data-testid="login-form">
                    <div className="input-group">
                        <label>SRT 서비스 아이디</label>
                        <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="아이디 입력" required />
                    </div>
                    <div className="input-group">
                        <label>비밀번호</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호 입력" required />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                        <User />
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                    <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '1.2rem', textAlign: 'center', lineHeight: 1.4 }}>
                        🔒 입력하신 계정 정보는 브라우저에만 저장되며,<br/>서버 데이터베이스에는 저장되지 않습니다.
                    </div>
                </form>
            </div>
            
            <div className="glass" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', opacity: 0.8 }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <Terminal />
                    개발자 설정 (API)
                </span>
                <label className="switch">
                    <input type="checkbox" checked={devMode} onChange={e => setDevMode(e.target.checked)} />
                    <span className="slider round"></span>
                </label>
            </div>

            {devMode && (
                <div style={{ marginTop: '1.5rem' }}>
                    <ApiConnectionSettings />
                </div>
            )}
        </motion.div>
    );
}
