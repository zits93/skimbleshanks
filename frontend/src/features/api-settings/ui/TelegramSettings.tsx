import { Send, Info } from 'lucide-react';
import { useAuthStore } from '../../auth/model/authStore';
import { useUiStore } from '../../../shared/api/uiStore';

export function TelegramSettings() {
    const { 
        tgToken, tgChatId, showTgGuide, setTgField, saveTelegramSettings 
    } = useAuthStore();
    const { showToast } = useUiStore();

    const handleTgSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveTelegramSettings();
        showToast('텔레그램 설정이 저장되었습니다.', 'success');
    };

    return (
        <div className="glass" style={{padding: '2rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h3 style={{display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0, fontSize: '1.2rem', color: 'var(--primary)'}}>
                    <Send size={20} /> 텔레그램 알림 설정
                </h3>
                <button onClick={() => setTgField('showTgGuide', !showTgGuide)} className="swap-btn" style={{width: 'auto', height: 'auto', padding: '0.4rem 0.8rem', borderRadius: '2rem', fontSize: '0.8rem'}}>
                    {showTgGuide ? '가이드 닫기' : '도움말'}
                </button>
            </div>

            {showTgGuide && (
                <div style={{background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '1rem', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.6'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary)'}}>
                        <Info size={16} /> <strong>설정 방법</strong>
                    </div>
                    <ol style={{margin: 0, paddingLeft: '1.2rem', color: 'rgba(255,255,255,0.7)'}}>
                        <li><strong>@BotFather</strong>에게 메시지를 보내 봇을 생성하고 토큰을 받으세요.</li>
                        <li><strong>@userinfobot</strong>을 통해 자신의 Chat ID를 확인하세요.</li>
                        <li>정보를 입력하고 저장하면 예매 성공 시 알림을 받을 수 있습니다.</li>
                    </ol>
                </div>
            )}

            <form onSubmit={handleTgSubmit}>
                <div className="input-group">
                    <label>봇 토큰 (Bot Token)</label>
                    <input value={tgToken} onChange={e => setTgField('tgToken', e.target.value)} placeholder="123456:ABC-DEF..." required/>
                </div>
                <div className="input-group">
                    <label>채팅 ID (Chat ID)</label>
                    <input value={tgChatId} onChange={e => setTgField('tgChatId', e.target.value)} placeholder="12345678" required/>
                </div>
                <button type="submit" className="btn-primary" style={{padding: '1rem'}}>설정 저장 및 테스트</button>
            </form>
        </div>
    );
}
