import { useState } from 'react';
import { useAuthStore } from '../../auth/model/authStore';
import { MapPin, Save, Plus, X } from 'lucide-react';

export function StationSettings({ provider }: { provider: 'SRT' | 'KTX' }) {
    const { srtStations, ktxStations, setStations } = useAuthStore();
    const currentStations = provider === 'SRT' ? srtStations : ktxStations;
    const [newStation, setNewStation] = useState('');

    const handleAdd = () => {
        if (!newStation) return;
        if (currentStations.includes(newStation)) return;
        setStations(provider, [...currentStations, newStation]);
        setNewStation('');
    };

    const handleRemove = (name: string) => {
        setStations(provider, currentStations.filter(s => s !== name));
    };

    return (
        <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                <MapPin size={18} /> {provider} 선호 역 설정
            </h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {currentStations.map(s => (
                    <span key={s} className="badge" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {s}
                        <button onClick={() => handleRemove(s)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}>
                            <X size={14} />
                        </button>
                    </span>
                ))}
                {currentStations.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>등록된 역이 없습니다.</div>}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                    type="text" 
                    value={newStation} 
                    onChange={e => setNewStation(e.target.value)} 
                    placeholder="역 이름 입력 (예: 대전)"
                    style={{ flex: 1 }}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
                <button className="btn-primary" onClick={handleAdd} style={{ padding: '0.5rem 1rem' }}>
                    <Plus size={18} />
                </button>
            </div>
        </div>
    );
}
