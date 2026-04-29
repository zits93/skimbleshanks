import { CreditCard } from 'lucide-react';
import { useRailStore } from '../../reservation/model/railStore';

export function CardSettings() {
    const { 
        cardNum, cardPw, cardBirth, cardExp,
        setCardField 
    } = useRailStore();

    return (
        <div className="glass" style={{padding: '2rem'}}>
            <h3 style={{display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', fontSize: '1.2rem', color: 'var(--primary)'}}>
                <CreditCard size={20} /> 자동 결제 카드 정보
            </h3>
            <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5'}}>
                정보를 입력하면 예매 성공 시 즉시 결제가 진행됩니다. <br/>
                결제 실패 시 예매가 취소될 수 있으니 정확한 정보를 입력해주세요.
                <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '1.2rem', textAlign: 'center', lineHeight: 1.4 }}>
                    🔒 입력하신 카드 정보는 브라우저에만 저장되며,<br/>서버 데이터베이스에는 저장되지 않습니다.
                </div>
            </p>
            
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
