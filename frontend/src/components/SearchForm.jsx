import React from 'react';
import { PassengerSelect } from './PassengerSelect';

export function SearchForm({ 
    dep, setDep, arr, setArr, date, setDate, time, setTime,
    adults, setAdults, children, setChildren, seniors, setSeniors,
    dis1to3, setDis1to3, dis4to6, setDis4to6, doSearch, stations 
}) {
    return (
        <div className="glass search-panel">
            <div className="station-grid">
                <div className="input-group"><label>출발역</label><select value={dep} onChange={e=>setDep(e.target.value)}>{stations.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                <button className="swap-btn" onClick={()=>{setDep(arr); setArr(dep);}} title="출발/도착역 전환">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>
                </button>
                <div className="input-group"><label>도착역</label><select value={arr} onChange={e=>setArr(e.target.value)}>{stations.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
            </div>
            <div className="datetime-select">
                <div className="input-group"><label>출발일</label><input type="date" value={`${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`} onChange={e=>setDate(e.target.value.replace(/-/g,''))}/></div>
                <div className="input-group"><label>출발 시간</label><select value={time} onChange={e=>setTime(e.target.value)}>{Array.from({length:24},(_, i)=>String(i).padStart(2,'0')).map(h=><option key={h} value={`${h}0000`}>{h}시 이후</option>)}</select></div>
            </div>
            <div className="passengers-grid">
                <PassengerSelect label="어른" value={adults} onChange={setAdults}/>
                <PassengerSelect label="어린이" value={children} onChange={setChildren}/>
                <PassengerSelect label="경로" value={seniors} onChange={setSeniors}/>
                <PassengerSelect label="장애(1-3)" value={dis1to3} onChange={setDis1to3}/>
                <PassengerSelect label="장애(4-6)" value={dis4to6} onChange={setDis4to6}/>
            </div>
            <button className="btn-primary" onClick={doSearch} style={{marginTop: '1rem'}}>열차 조회</button>
        </div>
    );
}
