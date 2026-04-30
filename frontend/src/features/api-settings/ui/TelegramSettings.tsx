import { Send, Info, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../auth/model/authStore';
import { useUiStore } from '../../../shared/api/uiStore';

export function TelegramSettings() {
    const { 
        tgToken, tgChatId, showTgGuide, setTgField, saveTelegramSettings, clearTelegramSettings 
    } = useAuthStore();
    const { showToast } = useUiStore();

    const handleClear = () => {
        if (confirm('브라우저에 표시된 텔레그램 설정을 지울까요?')) {
            clearTelegramSettings();
            showToast('입력값이 초기화되었습니다.', 'success');
        }
    };

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
                <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                    <button onClick={() => setTgField('showTgGuide', !showTgGuide)} className="swap-btn" style={{width: 'auto', height: 'auto', padding: '0.4rem 0.8rem', borderRadius: '2rem', fontSize: '0.8rem'}}>
                        {showTgGuide ? '가이드 닫기' : '도움말'}
                    </button>
                    <button 
                        onClick={handleClear}
                        title="입력값 초기화"
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.4rem',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.color = '#ff4d4d'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {showTgGuide && (
                <div style={{background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.7'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)'}}>
                        <Info size={18} /> <strong>텔레그램 알림 상세 설정 가이드</strong>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', color: 'rgba(255,255,255,0.8)'}}>
                        <div>
                            <strong style={{color: '#fff', display: 'block', marginBottom: '0.3rem'}}>1. 봇 생성 및 토큰 받기</strong>
                            텔레그램에서 <strong>@BotFather</strong>를 검색하여 대화를 시작하세요. <br/>
                            <code>/newbot</code> 명령어를 입력한 뒤, 봇의 이름과 아이디(반드시 _bot으로 끝남)를 설정하면 <strong>HTTP API Token</strong>이 발급됩니다.
                        </div>
                        <div>
                            <strong style={{color: '#fff', display: 'block', marginBottom: '0.3rem'}}>2. 내 채팅 ID 확인하기</strong>
                            텔레그램에서 <strong>@userinfobot</strong>을 검색하여 대화를 시작하면 본인의 고유한 <strong>Chat ID</strong>(숫자)를 즉시 확인할 수 있습니다.
                        </div>
                        <div>
                            <strong style={{color: '#fff', display: 'block', marginBottom: '0.3rem'}}>3. 봇 활성화 (필수!)</strong>
                            방금 생성한 본인의 봇을 검색하여 대화를 시작하고 <code>/start</code>를 한 번 보내주세요. 이 과정을 거쳐야만 봇이 메시지를 보낼 수 있습니다.
                        </div>
                        <div style={{fontSize: '0.8rem', color: 'var(--primary)', opacity: 0.8, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.8rem'}}>
                            ※ 설정 저장 후 '테스트' 버튼을 눌러 메시지가 정상적으로 오는지 확인해보세요.
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleTgSubmit} data-testid="tg-form">
                <div className="input-group">
                    <label>봇 토큰 (Bot Token)</label>
                    <input value={tgToken} onChange={e => setTgField('tgToken', e.target.value)} placeholder="123456:ABC-DEF..." required/>
                </div>
                <div className="input-group">
                    <label>채팅 ID (Chat ID)</label>
                    <input value={tgChatId} onChange={e => setTgField('tgChatId', e.target.value)} placeholder="12345678" required/>
                </div>
                <button type="submit" className="btn-primary" style={{padding: '1rem'}}>설정 저장 및 테스트</button>
                <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '1.2rem', textAlign: 'center', lineHeight: 1.4 }}>
                    🔒 입력하신 텔레그램 설정은 브라우저에만 저장되며,<br/>서버 데이터베이스에는 저장되지 않습니다.
                </div>
            </form>
        </div>
    );
}
