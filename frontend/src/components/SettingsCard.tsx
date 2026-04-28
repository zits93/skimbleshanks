import React, { useState } from 'react';
import { ApiSettings } from './ApiSettings';

interface SettingsCardProps {
    cardNum: string;
    setCardNum: (val: string) => void;
    cardPw: string;
    setCardPw: (val: string) => void;
    cardBirth: string;
    setCardBirth: (val: string) => void;
    cardExp: string;
    setCardExp: (val: string) => void;
    saveCard: (e: React.FormEvent) => void;
    apiBase: string;
    setApiBase: (val: string) => void;
    apiKey: string;
    setApiKey: (val: string) => void;
    saveApiSettings: (e: React.FormEvent) => void;
    devMode: boolean;
    setDevMode: (val: boolean) => void;
    tgToken: string;
    setTgToken: (val: string) => void;
    tgChatId: string;
    setTgChatId: (val: string) => void;
    saveTelegramSettings: (e: React.FormEvent) => Promise<void>;
}

export function SettingsCard({ 
    cardNum, setCardNum, cardPw, setCardPw, cardBirth, setCardBirth, cardExp, setCardExp, saveCard,
    apiBase, setApiBase, apiKey, setApiKey, saveApiSettings,
    devMode, setDevMode, tgToken, setTgToken, tgChatId, setTgChatId, saveTelegramSettings
}: SettingsCardProps) {
    const [showTgGuide, setShowTgGuide] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const iconStyle = { marginRight: '10px', verticalAlign: 'middle', filter: 'drop-shadow(0 0 8px var(--primary-glow))' };

    return (
        <div style={{maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            <div className="glass">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem'}}>
                    <h2 style={{display: 'flex', alignItems: 'center', margin: 0}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                        카드 설정
                    </h2>
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        style={{background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem'}}
                    >
                        {showPassword ? '가리기' : '번호 보기'}
                    </button>
                </div>
                <p style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', lineHeight: 1.6}}>
                    자동 결제에 사용할 카드 정보를 입력하세요.<br/>이 정보는 현재 브라우저에만 저장됩니다.
                </p>
                <form onSubmit={saveCard} autoComplete="on">
                    <div className="input-group"><label>카드번호</label><input name="cardnumber" autoComplete="cc-number" inputMode="numeric" value={cardNum} onChange={e=>setCardNum(e.target.value)} placeholder="1234 5678 9012 3456" required/></div>
                    <div className="input-group"><label>비밀번호 (앞 2자리)</label><input name="card-pin" type={showPassword ? "text" : "password"} autoComplete="off" inputMode="numeric" value={cardPw} onChange={e=>setCardPw(e.target.value)} placeholder="••" maxLength={2} required/></div>
                    <div className="input-group"><label>생년월일 / 사업자번호</label><input name="card-birthday" type={showPassword ? "text" : "password"} autoComplete="off" inputMode="numeric" value={cardBirth} onChange={e=>setCardBirth(e.target.value)} placeholder="••••••" required/></div>
                    <div className="input-group"><label>유효기간 (YYMM)</label><input name="cc-exp" type={showPassword ? "text" : "password"} autoComplete="cc-exp" inputMode="numeric" value={cardExp} onChange={e=>setCardExp(e.target.value)} placeholder="••••" maxLength={4} required/></div>
                    <button type="submit" className="btn-primary" style={{marginTop: '0.5rem'}}>카드 정보 저장</button>
                </form>
            </div>

            {devMode && (
                <ApiSettings 
                    apiBase={apiBase} setApiBase={setApiBase} 
                    apiKey={apiKey} setApiKey={setApiKey} 
                    saveApiSettings={saveApiSettings}
                    tgToken={tgToken} setTgToken={setTgToken} 
                    tgChatId={tgChatId} setTgChatId={setTgChatId} 
                    saveTelegramSettings={saveTelegramSettings}
                    showTgGuide={showTgGuide} setShowTgGuide={setShowTgGuide}
                />
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
