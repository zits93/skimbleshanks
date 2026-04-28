import { Train, Target, Log } from '../types';
import { LogViewer } from './LogViewer';

interface TrainListProps {
    trains: Train[];
    selectedTargets: Target[];
    toggleTarget: (trainName: string, seatType: string) => void;
    bulkToggleTarget: (seatType: string) => void;
    autoPayActive: boolean;
    setAutoPayActive: (val: boolean) => void;
    autoReserveActive: boolean;
    autoReserveAttempts: number;
    startAutoReserve: () => void;
    stopAutoReserve: () => void;
    logs: Log[];
}

export function TrainList({ 
    trains, selectedTargets, toggleTarget, bulkToggleTarget, autoPayActive, setAutoPayActive,
    autoReserveActive, autoReserveAttempts, startAutoReserve, stopAutoReserve,
    logs
}: TrainListProps) {
    if (trains.length === 0) {
        return (
            <div className="results-panel">
                <div className="glass" style={{
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    minHeight: '400px',
                    opacity: 0.8
                }}>
                    <span style={{fontSize: '3rem', marginBottom: '1rem'}}>🔍</span>
                    <h3 style={{color: 'var(--text-muted)'}}>열차를 조회해주세요</h3>
                    <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>출발지와 목적지를 선택하고 조회 버튼을 눌러주세요</p>
                </div>
                <LogViewer logs={logs} />
            </div>
        );
    }

    const isSelected = (trainName, seatType) => 
        selectedTargets.some(x => x.train_name === trainName && x.seat_type === seatType);

    const formatTime = (tm) => {
        if (!tm || tm.length < 4) return '--:--';
        return `${tm.slice(0,2)}:${tm.slice(2,4)}`;
    };

    return (
        <div className="results-panel glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="results-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.8rem'}}>
                    {autoReserveActive && <div className="radar-pulse"></div>}
                    <div>
                        <h3 style={{margin: 0, fontSize: '1.3rem', color: 'var(--primary)', fontFamily: 'Outfit, sans-serif'}}>
                            {autoReserveActive ? '자동 예매 중...' : '조회 결과'}
                        </h3>
                        <span style={{fontSize: '0.85rem', opacity: 0.6}}>{trains.length}개의 열차 발견</span>
                    </div>
                </div>
                
                <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                    {autoReserveActive ? (
                        <button className="btn-primary pulse-red" onClick={stopAutoReserve} style={{
                            background: 'linear-gradient(135deg, #ef4444, #b91c1c)', 
                            padding: '0.6rem 1.2rem',
                            borderRadius: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            width: 'auto'
                        }}>
                            <span className="spinner"></span>
                            중지 ({autoReserveAttempts}회)
                        </button>
                    ) : (
                        <button className="btn-primary" onClick={startAutoReserve} style={{padding: '0.6rem 1.5rem', borderRadius: '2rem', width: 'auto'}}>
                            자동 예매 시작
                        </button>
                    )}
                </div>
            </div>

            <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid var(--primary-glow)',
                borderRadius: '1.2rem',
                padding: '1.2rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                animation: 'pulse-subtle 3s infinite'
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <div style={{fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5}}>
                    <strong style={{color: 'var(--primary)', display: 'block', marginBottom: '0.2rem'}}>💡 자동 예매 팁</strong>
                    매진된 좌석(<span style={{color: '#f87171'}}>RED</span>)을 클릭하여 대기 목록에 추가하세요. 
                    <br/>원하는 열차를 모두 선택한 후 <strong>'자동 예매 시작'</strong>을 누르면 예약이 진행됩니다.
                </div>
            </div>
            
            {/* Bulk Selection Controls */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
            }}>
                <BulkSelectButton 
                    label="일반실 전체"
                    isSelected={selectedTargets.filter(x => x.seat_type === 'GENERAL_FIRST').length === trains.length}
                    onClick={() => bulkToggleTarget('GENERAL_FIRST')}
                />
                <BulkSelectButton 
                    label="특실 전체"
                    isSelected={selectedTargets.filter(x => x.seat_type === 'SPECIAL_ONLY').length === trains.length}
                    onClick={() => bulkToggleTarget('SPECIAL_ONLY')}
                />
            </div>

            <div className="train-list" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {trains.map(t => (
                    <div key={t.id} className="train-item" style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr',
                        gap: '1.5rem',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '1.2rem',
                        borderRadius: '1.2rem'
                    }}>
                        <div>
                            <strong style={{
                                fontSize: '1.25rem', 
                                display: 'block', 
                                marginBottom: '0.3rem',
                                color: 'var(--primary)',
                                fontFamily: 'Outfit, sans-serif'
                            }}>{t.train_name}</strong>
                            <div style={{fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)'}}>
                                {formatTime(t.dep_time)} <span style={{opacity: 0.5, margin: '0 0.3rem'}}>→</span> {formatTime(t.arr_time)}
                            </div>
                        </div>
                        
                        <div style={{display: 'flex', gap: '0.6rem'}}>
                            <SeatButton 
                                type="일반실" 
                                status={t.general_seat} 
                                selected={isSelected(t.train_name, 'GENERAL_FIRST')}
                                onClick={() => toggleTarget(t.train_name, 'GENERAL_FIRST')}
                            />
                            <SeatButton 
                                type="특실" 
                                status={t.special_seat} 
                                selected={isSelected(t.train_name, 'SPECIAL_ONLY')}
                                onClick={() => toggleTarget(t.train_name, 'SPECIAL_ONLY')}
                            />
                        </div>
                    </div>
                ))}
            </div>
            
            <LogViewer logs={logs} />
        </div>
    );
}

interface SeatButtonProps {
    type: string;
    status: string;
    selected: boolean;
    onClick: () => void;
}

function SeatButton({ type, status, selected, onClick }: SeatButtonProps) {
    const isAvailable = status.includes('예약가능');
    return (
        <button 
            className={`seat-button-premium ${isAvailable ? 'available' : 'soldout'} ${selected ? 'selected' : ''}`}
            onClick={onClick}
            style={{
                flex: 1,
                padding: '0.8rem',
                borderRadius: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: 'none'
            }}
        >
            <span style={{fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.2rem', opacity: 0.8}}>{type}</span>
            <span style={{fontSize: '0.95rem', fontWeight: '800'}}>{status}</span>
            {!isAvailable && (
                <div style={{
                    fontSize: '0.65rem', 
                    marginTop: '0.3rem', 
                    padding: '0.1rem 0.4rem',
                    borderRadius: '0.4rem',
                    background: selected ? 'rgba(255,255,255,0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: selected ? '#fff' : '#fecaca',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                }}>
                    {selected ? (
                        <><span>✓</span> 대기 중</>
                    ) : (
                        <><span>+</span> 대기 신청</>
                    )}
                </div>
            )}
        </button>
    );
}

interface BulkSelectButtonProps {
    label: string;
    isSelected: boolean;
    onClick: () => void;
}

function BulkSelectButton({ label, isSelected, onClick }: BulkSelectButtonProps) {
    return (
        <button 
            onClick={onClick}
            style={{
                background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '0.8rem',
                padding: '0.7rem',
                color: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.6)',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
            }}
        >
            <span style={{
                width: '12px', 
                height: '12px', 
                borderRadius: '3px', 
                border: `1px solid ${isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.3)'}`,
                background: isSelected ? 'var(--primary)' : 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                color: '#fff'
            }}>
                {isSelected && '✓'}
            </span>
            {isSelected ? `${label} 해제` : `${label} 선택`}
        </button>
    );
}
