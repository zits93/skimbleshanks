
import { PassengerSelect } from './PassengerSelect';

import { PassengerSelect } from './PassengerSelect';
import { useRailStore } from '../store/railStore';
import { useAuthStore } from '../store/authStore';
import { Search, ArrowLeftRight } from 'lucide-react';

export function SearchForm({ stations }: { stations: string[] }) {
    const { 
        dep, arr, date, time, adults, children, seniors, dis1to3, dis4to6,
        setSearchField, doSearch 
    } = useRailStore();
    const { loading } = useAuthStore();

    const swapStations = () => {
        const oldDep = dep;
        setSearchField('dep', arr);
        setSearchField('arr', oldDep);
    };

    return (
        <div className="glass search-panel">
            <div className="station-grid">
                <div className="input-group">
                    <label>출발역</label>
                    <select value={dep} onChange={e => setSearchField('dep', e.target.value)}>
                        {stations.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <button className="swap-btn" onClick={swapStations} title="출발/도착역 전환">
                    <ArrowLeftRight size={20} strokeWidth={2.5} />
                </button>
                <div className="input-group">
                    <label>도착역</label>
                    <select value={arr} onChange={e => setSearchField('arr', e.target.value)}>
                        {stations.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div className="datetime-select">
                <div className="input-group">
                    <label>출발일</label>
                    <input 
                        type="date" 
                        value={`${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`} 
                        onChange={e => setSearchField('date', e.target.value.replace(/-/g,''))}
                    />
                </div>
                <div className="input-group">
                    <label>출발 시간</label>
                    <select value={time} onChange={e => setSearchField('time', e.target.value)}>
                        {Array.from({length:24},(_, i) => String(i).padStart(2,'0')).map(h => (
                            <option key={h} value={`${h}0000`}>{h}시 이후</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="passengers-grid">
                <PassengerSelect label="어른" value={adults} onChange={v => setSearchField('adults', v)}/>
                <PassengerSelect label="어린이" value={children} onChange={v => setSearchField('children', v)}/>
                <PassengerSelect label="경로" value={seniors} onChange={v => setSearchField('seniors', v)}/>
                <PassengerSelect label="장애(1-3)" value={dis1to3} onChange={v => setSearchField('dis1to3', v)}/>
                <PassengerSelect label="장애(4-6)" value={dis4to6} onChange={v => setSearchField('dis4to6', v)}/>
            </div>
            <button className="btn-primary" onClick={doSearch} disabled={loading} style={{marginTop: '1rem'}}>
                <Search size={20} style={{marginRight: '8px'}} />
                {loading ? '조회 중...' : '열차 조회'}
            </button>
        </div>
    );
}
