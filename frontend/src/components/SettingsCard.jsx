import React, { useState } from 'react';

export function SettingsCard({ 
    cardNum, setCardNum, cardPw, setCardPw, cardBirth, setCardBirth, cardExp, setCardExp, saveCard,
    apiBase, setApiBase, apiKey, setApiKey, saveApiSettings,
    devMode, setDevMode, tgToken, setTgToken, tgChatId, setTgChatId, saveTelegramSettings
}) {
    const [showTgGuide, setShowTgGuide] = useState(false);
    const iconStyle = { marginRight: '10px', verticalAlign: 'middle', filter: 'drop-shadow(0 0 8px var(--primary-glow))' };

    return (
        <div style={{maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            <div className="glass">
                <h2 style={{display: 'flex', alignItems: 'center', marginBottom: '1.2rem'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                    카드 설정
                </h2>
                <p style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', lineHeight: 1.6}}>
                    자동 결제에 사용할 카드 정보를 입력하세요.<br/>이 정보는 현재 브라우저에만 암호화되어 저장됩니다.
                </p>
                <form onSubmit={saveCard} autoComplete="on">
                    <div className="input-group"><label>카드번호</label><input name="cardnumber" autoComplete="cc-number" inputMode="numeric" value={cardNum} onChange={e=>setCardNum(e.target.value)} placeholder="1234 5678 9012 3456" required/></div>
                    <div className="input-group"><label>비밀번호 (앞 2자리)</label><input name="card-pin" type="password" autoComplete="off" inputMode="numeric" value={cardPw} onChange={e=>setCardPw(e.target.value)} placeholder="••" maxLength={2} required/></div>
                    <div className="input-group"><label>생년월일 / 사업자번호</label><input name="card-birthday" type="password" autoComplete="off" inputMode="numeric" value={cardBirth} onChange={e=>setCardBirth(e.target.value)} placeholder="••••••" required/></div>
                    <div className="input-group"><label>유효기간 (YYMM)</label><input name="cc-exp" autoComplete="cc-exp" inputMode="numeric" value={cardExp} onChange={e=>setCardExp(e.target.value)} placeholder="••••" maxLength={4} required/></div>
                    <button type="submit" className="btn-primary" style={{marginTop: '0.5rem'}}>카드 정보 저장</button>
                </form>
            </div>

            {devMode && (
                <>
                    <div className="glass">
                        <h2 style={{display: 'flex', alignItems: 'center', marginBottom: '1.2rem'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
                            API 설정
                        </h2>
                        <p style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', lineHeight: 1.6}}>
                            외부 호스팅 환경에서 백엔드 서버 주소를 설정합니다.
                        </p>
                        <form onSubmit={saveApiSettings}>
                            <div className="input-group">
                                <label>백엔드 API 주소</label>
                                <input value={apiBase} onChange={e=>setApiBase(e.target.value)} placeholder="https://api.example.com" required/>
                            </div>
                            <div className="input-group">
                                <label>API 인증 키</label>
                                <input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="X-API-KEY" required/>
                            </div>
                            <button type="submit" className="btn-primary">API 설정 저장</button>
                        </form>
                    </div>

                    <div className="glass">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem'}}>
                            <h2 style={{display: 'flex', alignItems: 'center', margin: 0}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                                텔레그램 알림
                            </h2>
                            <button 
                                onClick={() => setShowTgGuide(!showTgGuide)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '2rem',
                                    padding: '0.3rem 0.8rem',
                                    fontSize: '0.75rem',
                                    color: 'var(--primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem'
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                                {showTgGuide ? '가이드 닫기' : '설정 방법'}
                            </button>
                        </div>
                        <p style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', lineHeight: 1.6}}>
                            예매 성공 시 실시간 알림을 받을 텔레그램 봇 정보를 입력하세요.
                        </p>
                        {showTgGuide && (
                            <div style={{
                                background: 'rgba(139, 92, 246, 0.05)',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                borderRadius: '1rem',
                                padding: '1rem',
                                marginBottom: '1.5rem',
                                fontSize: '0.85rem',
                                lineHeight: '1.6'
                            }}>
                                <div style={{marginBottom: '0.8rem', fontWeight: '700', color: 'var(--primary)'}}>🤖 봇 생성 및 ID 찾기</div>
                                <ol style={{margin: 0, paddingLeft: '1.2rem', color: 'rgba(255,255,255,0.7)'}}>
                                    <li>텔레그램에서 <strong style={{color: '#fff'}}>@BotFather</strong> 검색</li>
                                    <li><code style={{color: 'var(--accent)'}}>/newbot</code> 입력 후 가이드에 따라 봇 생성</li>
                                    <li>생성 완료 후 받은 <strong style={{color: '#fff'}}>HTTP API Token</strong>을 아래에 입력</li>
                                    <li>방금 만든 본인의 봇에게 아무 메시지나 전송 (활성화)</li>
                                    <li><strong style={{color: '#fff'}}>@userinfobot</strong>을 검색하여 본인의 <strong style={{color: '#fff'}}>Chat ID</strong> 확인 후 입력</li>
                                </ol>
                            </div>
                        )}
                        <form onSubmit={saveTelegramSettings}>
                            <div className="input-group">
                                <label>봇 토큰 (Bot Token)</label>
                                <input value={tgToken} onChange={e=>setTgToken(e.target.value)} placeholder="123456:ABC-DEF..." required/>
                            </div>
                            <div className="input-group">
                                <label>채팅 ID (Chat ID)</label>
                                <input value={tgChatId} onChange={e=>setTgChatId(e.target.value)} placeholder="12345678" required/>
                            </div>
                            <button type="submit" className="btn-primary">텔레그램 연동 테스트</button>
                        </form>
                    </div>
                </>
            )}

            <div className="glass" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', opacity: 0.8}}>
                <span style={{fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
                    개발자 모드
                </span>
                <label className="switch">
                    <input type="checkbox" checked={devMode} onChange={e => setDevMode(e.target.checked)} />
                    <span className="slider round"></span>
                </label>
            </div>
        </div>
    );
}
