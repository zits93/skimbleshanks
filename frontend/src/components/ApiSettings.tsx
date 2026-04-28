import React from 'react';

interface ApiSettingsProps {
    apiBase: string;
    setApiBase: (val: string) => void;
    apiKey: string;
    setApiKey: (val: string) => void;
    saveApiSettings: (e: React.FormEvent) => void;
    tgToken: string;
    setTgToken: (val: string) => void;
    tgChatId: string;
    setTgChatId: (val: string) => void;
    saveTelegramSettings: (e: React.FormEvent) => Promise<void>;
    showTgGuide: boolean;
    setShowTgGuide: (val: boolean) => void;
}

export function ApiSettings({ 
    apiBase, setApiBase, apiKey, setApiKey, saveApiSettings,
    tgToken, setTgToken, tgChatId, setTgChatId, saveTelegramSettings,
    showTgGuide, setShowTgGuide
}: ApiSettingsProps) {
    const iconStyle = { marginRight: '10px', verticalAlign: 'middle', filter: 'drop-shadow(0 0 8px var(--primary-glow))' };

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem'}}>
            <div className="glass" style={{padding: '1.5rem'}}>
                <h2 style={{display: 'flex', alignItems: 'center', marginBottom: '1.2rem', fontSize: '1.2rem'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
                    API 설정
                </h2>
                <form onSubmit={saveApiSettings}>
                    <div className="input-group">
                        <label style={{fontSize: '0.85rem'}}>백엔드 API 주소</label>
                        <input value={apiBase} onChange={e=>setApiBase(e.target.value)} placeholder="https://api.example.com" required/>
                    </div>
                    <div className="input-group">
                        <label style={{fontSize: '0.85rem'}}>API 인증 키</label>
                        <input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="X-API-KEY" required/>
                    </div>
                    <button type="submit" className="btn-primary" style={{padding: '0.6rem'}}>API 설정 저장</button>
                </form>
            </div>

            <div className="glass" style={{padding: '1.5rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem'}}>
                    <h2 style={{display: 'flex', alignItems: 'center', margin: 0, fontSize: '1.2rem'}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                        텔레그램 알림
                    </h2>
                    <button 
                        onClick={() => setShowTgGuide(!showTgGuide)}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '2rem',
                            padding: '0.2rem 0.6rem',
                            fontSize: '0.7rem',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                        }}
                    >
                        {showTgGuide ? '닫기' : '가이드'}
                    </button>
                </div>
                {showTgGuide && (
                    <div style={{
                        background: 'rgba(139, 92, 246, 0.05)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '0.8rem',
                        padding: '0.8rem',
                        marginBottom: '1rem',
                        fontSize: '0.8rem',
                        lineHeight: '1.5'
                    }}>
                        <ol style={{margin: 0, paddingLeft: '1.2rem', color: 'rgba(255,255,255,0.7)'}}>
                            <li><strong style={{color: '#fff'}}>@BotFather</strong>에서 봇 생성</li>
                            <li><strong style={{color: '#fff'}}>HTTP API Token</strong> 입력</li>
                            <li><strong style={{color: '#fff'}}>@userinfobot</strong>으로 본인 <strong style={{color: '#fff'}}>Chat ID</strong> 확인 후 입력</li>
                        </ol>
                    </div>
                )}
                <form onSubmit={saveTelegramSettings}>
                    <div className="input-group">
                        <label style={{fontSize: '0.85rem'}}>봇 토큰 (Bot Token)</label>
                        <input value={tgToken} onChange={e=>setTgToken(e.target.value)} placeholder="123456:ABC-DEF..." required/>
                    </div>
                    <div className="input-group">
                        <label style={{fontSize: '0.85rem'}}>채팅 ID (Chat ID)</label>
                        <input value={tgChatId} onChange={e=>setTgChatId(e.target.value)} placeholder="12345678" required/>
                    </div>
                    <button type="submit" className="btn-primary" style={{padding: '0.6rem'}}>텔레그램 연동 테스트</button>
                </form>
            </div>
        </div>
    );
}
