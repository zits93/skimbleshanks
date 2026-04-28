import { CreditCard } from 'lucide-react';
import { useRailStore } from '../../reservation/model/railStore';

export function CardSettings() {
    const { 
        cardNum, cardPw, cardBirth, cardExp, autoPayActive,
        setCardField 
    } = useRailStore();

    return (
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
    );
}
