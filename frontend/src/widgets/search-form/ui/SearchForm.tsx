import { PassengerSelect } from '../../../shared/ui/PassengerSelect';
import { useRailStore } from '../../../features/reservation/model/railStore';
import { Search, ArrowLeftRight } from 'lucide-react';

export function SearchForm({ stations }: { stations: string[] }) {
    const { 
        dep, arr, date, time, adults, children, seniors, dis1to3, dis4to6,
        setSearchField, doSearch, searching
    } = useRailStore();

    const swapStations = () => {
        const oldDep = dep;
        setSearchField('dep', arr);
        setSearchField('arr', oldDep);
    };

    return (
        <div className="glass search-panel">
            <div className="station-grid">
                <div className="input-group">
                    <label htmlFor="dep-select">출발역</label>
                    <select id="dep-select" value={dep} onChange={e => setSearchField('dep', e.target.value)}>
                        {stations.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <button className="swap-btn" onClick={swapStations} title="출발/도착역 전환">
                    <ArrowLeftRight size={20} strokeWidth={2.5} />
                </button>
                <div className="input-group">
                    <label htmlFor="arr-select">도착역</label>
                    <select id="arr-select" value={arr} onChange={e => setSearchField('arr', e.target.value)}>
                        {stations.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div className="datetime-select">
                <div className="input-group">
                    <label htmlFor="date-input">출발일</label>
                    <input 
                        id="date-input"
                        type="date" 
                        value={`${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`} 
                        onChange={e => setSearchField('date', e.target.value.replace(/-/g,''))}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="time-select">출발 시간</label>
                    <select id="time-select" value={time} onChange={e => setSearchField('time', e.target.value)}>
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
            <button 
                className="btn-primary" 
                onClick={doSearch} 
                disabled={searching} 
                style={{marginTop: '1rem', position: 'relative'}}
            >
                <Search 
                    size={20} 
                    className={searching ? "spinning" : ""} 
                    style={{marginRight: '8px'}} 
                />
                {searching ? '열차 정보를 가져오는 중...' : '열차 조회'}
            </button>
        </div>
    );
}
