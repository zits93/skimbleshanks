import { useRailStore } from '../store/railStore';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { Server, Send, Key, Globe, CreditCard, Info } from 'lucide-react';

export function ApiSettings() {
    const { 
        cardNum, cardPw, cardBirth, cardExp, autoPayActive,
        setCardField 
    } = useRailStore();
    const { 
        tgToken, tgChatId, showTgGuide, setTgField, saveTelegramSettings 
    } = useAuthStore();
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

    const handleTgSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveTelegramSettings();
        showToast('텔레그램 설정이 저장되었습니다.', 'success');
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem'}}>
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

            <div className="glass" style={{padding: '2rem'}}>
                <h3 style={{display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--primary)'}}>
                    <CreditCard size={20} /> 자동 결제 카드 정보
                </h3>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '1rem'}}>
                    <span style={{fontSize: '0.9rem', fontWeight: 600}}>자동 결제 활성화</span>
                    <label className="switch">
                        <input type="checkbox" checked={autoPayActive} onChange={e => setCardField('autoPayActive', e.target.checked)} />
                        <span className="slider"></span>
                    </label>
                </div>
                
                <div className="input-group">
                    <label>카드 번호</label>
                    <input type="text" value={cardNum} onChange={e => setCardField('cardNum', e.target.value)} placeholder="0000-0000-0000-0000" />
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem'}}>
                    <div className="input-group"><label>비밀번호 (앞2자리)</label><input type="password" value={cardPw} onChange={e => setCardField('cardPw', e.target.value)} placeholder="**" maxLength={2} /></div>
                    <div className="input-group"><label>생년월일 (6자리)</label><input type="text" value={cardBirth} onChange={e => setCardField('cardBirth', e.target.value)} placeholder="YYMMDD" maxLength={6} /></div>
                    <div className="input-group"><label>만료일 (YYMM)</label><input type="text" value={cardExp} onChange={e => setCardField('cardExp', e.target.value)} placeholder="YYMM" maxLength={4} /></div>
                </div>
            </div>

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
        </div>
    );
}
