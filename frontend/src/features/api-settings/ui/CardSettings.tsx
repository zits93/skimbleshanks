import { CreditCard, Trash2 } from 'lucide-react';
import { useRailStore } from '../../reservation/model/railStore';
import { useUiStore } from '../../../shared/api/uiStore';

export function CardSettings() {
    const { 
        cardNum, cardPw, cardBirth, cardExp,
        setCardField, clearCardInfo 
    } = useRailStore();
    const { showToast } = useUiStore();

    const handleClear = () => {
        if (confirm('브라우저에 저장된 카드 정보를 삭제할까요?')) {
            clearCardInfo();
            showToast('카드 정보가 삭제되었습니다.', 'success');
        }
    };

    return (
        <div className="glass" style={{padding: '2rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h3 style={{display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0, fontSize: '1.2rem', color: 'var(--primary)'}}>
                    <CreditCard size={20} /> 자동 결제 카드 정보
                </h3>
                <button 
                    onClick={handleClear}
                    title="정보 삭제"
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.5rem',
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
            <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5'}}>
                정보를 입력하면 예매 성공 시 즉시 결제가 진행됩니다. <br/>
                결제 실패 시 예매가 취소될 수 있으니 정확한 정보를 입력해주세요.
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
            
            <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '2rem', textAlign: 'center', lineHeight: 1.4 }}>
                🔒 입력하신 카드 정보는 브라우저에만 저장되며,<br/>서버 데이터베이스에는 저장되지 않습니다.
            </div>
        </div>
    );
}
