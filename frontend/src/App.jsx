import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toast } from './components/Toast';
import { Modal } from './components/Modal';
import { SearchForm } from './components/SearchForm';
import { TrainList } from './components/TrainList';
import { SettingsCard } from './components/SettingsCard';
import { LogViewer } from './components/LogViewer';
import { apiFetch } from './api';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState('search');
    
    // Auth & Search State
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [dep, setDep] = useState('수서');
    const [arr, setArr] = useState('부산');
    
    // Initialize date and time with current values
    const now = new Date();
    const initialDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const initialTime = `${String(now.getHours()).padStart(2, '0')}0000`;

    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState(initialTime);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [seniors, setSeniors] = useState(0);
    const [dis1to3, setDis1to3] = useState(0);
    const [dis4to6, setDis4to6] = useState(0);
    const [trains, setTrains] = useState([]);
    
    // Auto Reserve State
    const [selectedTargets, setSelectedTargets] = useState([]);
    const [autoReserveActive, setAutoReserveActive] = useState(false);
    const [autoPayActive, setAutoPayActive] = useState(true);

    const [autoReserveAttempts, setAutoReserveAttempts] = useState(0);
    const [logs, setLogs] = useState([]);
    const autoTimerRef = useRef(null);

    // Settings State
    const [cardNum, setCardNum] = useState(() => localStorage.getItem('srtgo_card_num') || '');
    const [cardPw, setCardPw] = useState(() => localStorage.getItem('srtgo_card_pw') || '');
    const [cardBirth, setCardBirth] = useState(() => localStorage.getItem('srtgo_card_birth') || '');
    const [cardExp, setCardExp] = useState(() => localStorage.getItem('srtgo_card_exp') || '');

    const [apiBase, setApiBase] = useState(() => localStorage.getItem('srtgo_api_base') || 'http://localhost:8000/api');
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('srtgo_api_key') || 'srtgo-default-key');
    const [devMode, setDevMode] = useState(false);

    const [tgToken, setTgToken] = useState(() => localStorage.getItem('srtgo_tg_token') || '');
    const [tgChatId, setTgChatId] = useState(() => localStorage.getItem('srtgo_tg_chat_id') || '');

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState(null);

    const saveApiSettings = (e) => {
        e.preventDefault();
        localStorage.setItem('srtgo_api_base', apiBase);
        localStorage.setItem('srtgo_api_key', apiKey);
        showToast('API 설정이 저장되었습니다. 페이지를 새로고침하세요.', 'success');
    };

    const saveTelegramSettings = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await apiFetch('/telegram', {
                method: 'POST',
                body: JSON.stringify({ token: tgToken, chat_id: tgChatId })
            });
            if (res.ok) {
                localStorage.setItem('srtgo_tg_token', tgToken);
                localStorage.setItem('srtgo_tg_chat_id', tgChatId);
                showToast('텔레그램 설정 완료 및 테스트 메시지 전송 성공!', 'success');
            } else {
                const data = await res.json();
                showToast(`설정 실패: ${data.detail || '알 수 없는 오류'}`, 'error');
            }
        } catch (err) {
            showToast('서버 연결 오류', 'error');
        } finally {
            setLoading(false);
        }
    };

    const addLog = useCallback((message, type = 'info') => {
        const time = new Date().toLocaleTimeString('ko-KR', { hour12: false });
        setLogs(prev => [...prev, { time, message, type }].slice(-50)); // Keep last 50 logs
    }, []);

    const showToast = useCallback((message, type) => {
        setToast({ message, type, key: Date.now() });
    }, []);

    const showAlert = useCallback((title, message, icon) => {
        return new Promise(resolve => {
            setModal({
                icon: icon || '📢',
                title,
                message,
                buttons: [{ label: '확인', primary: true, onClick: () => { setModal(null); resolve(); } }]
            });
        });
    }, []);

    useEffect(() => {
        checkConfig();
    }, []);

    const checkConfig = async () => {
        try {
            const res = await apiFetch('/config');
            if (res.ok) {
                const data = await res.json();
                setIsLoggedIn(data.is_logged_in);
            }
        } catch (e) {}
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await apiFetch('/login', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, password })
            });
            if (res.ok) {
                setIsLoggedIn(true);
                showToast('로그인 성공!', 'success');
            } else {
                showToast('로그인 실패. 아이디/비번을 확인하세요.', 'error');
            }
        } catch (e) {
            showToast('서버 연결 오류', 'error');
        } finally {
            setLoading(false);
        }
    };

    const doSearch = async () => {
        const res = await apiFetch('/search', {
            method: 'POST',
            body: JSON.stringify({ dep, arr, date, time, adults, children, seniors, disability1to3: dis1to3, disability4to6: dis4to6 })
        });
        if (res.ok) {
            const data = await res.json();
            setTrains(data.trains);
            if (data.trains.length === 0) showToast('조회 결과가 없습니다.', 'error');
        } else {
            showToast('조회 중 오류 발생', 'error');
        }
    };

    const toggleTarget = (trainName, seatType) => {
        setSelectedTargets(prev => {
            const exists = prev.find(t => t.train_name === trainName && t.seat_type === seatType);
            if (exists) return prev.filter(t => !(t.train_name === trainName && t.seat_type === seatType));
            return [...prev, { train_name: trainName, seat_type: seatType }];
        });
    };

    const bulkToggleTarget = (seatType) => {
        if (trains.length === 0) return;
        const allOfType = trains.map(t => ({ train_name: t.train_name, seat_type: seatType }));
        const currentOfType = selectedTargets.filter(x => x.seat_type === seatType);
        
        if (currentOfType.length === trains.length) {
            setSelectedTargets(prev => prev.filter(x => x.seat_type !== seatType));
        } else {
            setSelectedTargets(prev => {
                const filtered = prev.filter(x => x.seat_type !== seatType);
                return [...filtered, ...allOfType];
            });
        }
    };

    const startAutoReserve = () => {
        if (selectedTargets.length === 0) return showAlert('알림', '예매할 열차를 먼저 선택해주세요.', '⚠️');
        setLogs([]); // Clear old logs
        addLog('자동 예매를 시작합니다.', 'info');
        setAutoReserveActive(true);
        setAutoReserveAttempts(0);
    };

    const stopAutoReserve = () => {
        addLog('자동 예매를 중지합니다.', 'warning');
        setAutoReserveActive(false);
        if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };

    const autoReserveActiveRef = useRef(autoReserveActive);
    useEffect(() => {
        autoReserveActiveRef.current = autoReserveActive;
        let isCancelled = false;
        
        if (autoReserveActive) {
            const attemptReserve = async () => {
                if (isCancelled || !autoReserveActiveRef.current) return;
                
                setAutoReserveAttempts(a => {
                    const next = a + 1;
                    addLog(`[${next}회차] 열차 조회 및 예매 시도 중...`, 'info');
                    return next;
                });
                
                try {
                    const res = await apiFetch('/reserve', {
                        method: 'POST',
                        body: JSON.stringify({
                            dep, arr, date, time, adults, children, seniors, disability1to3: dis1to3, disability4to6: dis4to6,
                            targets: selectedTargets, auto_pay: autoPayActive,
                            card_number: autoPayActive ? cardNum : '', card_password: autoPayActive ? cardPw : '',
                            card_birthday: autoPayActive ? cardBirth : '', card_expire: autoPayActive ? cardExp : '',
                        })
                    });
                    
                    if (isCancelled || !autoReserveActiveRef.current) return;
                    
                    const data = await res.json();
                    if (data.success) {
                        addLog(`예매 성공! ${data.message}`, 'success');
                        setAutoReserveActive(false);
                        showAlert('🎉 예매 성공!', data.message, '🎊');
                    } else if (data.retry) {
                        if (!isCancelled && autoReserveActiveRef.current) {
                            autoTimerRef.current = setTimeout(attemptReserve, 1000);
                        }
                    } else {
                        addLog(`예매 실패: ${data.message}`, 'error');
                        setAutoReserveActive(false);
                        showAlert('❌ 예매 실패', data.message, '🚨');
                    }
                } catch (e) {
                    if (!isCancelled && autoReserveActiveRef.current) {
                        addLog(`오류 발생: ${e.message}. 2초 후 재시도...`, 'error');
                        autoTimerRef.current = setTimeout(attemptReserve, 2000);
                    }
                }
            };
            attemptReserve();
        }
        
        return () => { 
            isCancelled = true; 
            if (autoTimerRef.current) clearTimeout(autoTimerRef.current); 
        };
    }, [autoReserveActive, dep, arr, date, time, adults, children, seniors, dis1to3, dis4to6, selectedTargets, autoPayActive, cardNum, cardPw, cardBirth, cardExp, addLog, showAlert]);

    const saveCard = (e) => {
        e.preventDefault();
        localStorage.setItem('srtgo_card_num', cardNum);
        localStorage.setItem('srtgo_card_pw', cardPw);
        localStorage.setItem('srtgo_card_birth', cardBirth);
        localStorage.setItem('srtgo_card_exp', cardExp);
        showToast('카드 정보가 브라우저에 저장되었습니다.', 'success');
    };

    const stations = ["수서","동탄","평택지제","대전","동대구","부산","광주송정","목포"];

    return (
        <>
            {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
            {modal && <Modal {...modal} onClose={() => setModal(null)} />}

            <header>
                <h1>SRT<span>go</span></h1>
            </header>

            <div className="container">
                {!isLoggedIn ? (
                    <div className="glass login-card">
                        <form onSubmit={handleLogin}>
                            <div className="input-group">
                                <label style={{fontSize: '1rem', marginBottom: '0.8rem'}}>SRT 아이디</label>
                                <input value={userId} onChange={e=>setUserId(e.target.value)} placeholder="아이디 입력" required/>
                            </div>
                            <div className="input-group">
                                <label style={{fontSize: '1rem', marginBottom: '0.8rem'}}>비밀번호</label>
                                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="비밀번호 입력" required/>
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading} style={{marginTop: '1rem'}}>
                                {loading ? '로그인 중...' : '로그인'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        <div className="nav-tabs-wrapper">
                            <div className="nav-tabs">
                                <div className="active-bg" style={{
                                    width: '150px',
                                    transform: activeTab === 'search' ? 'translateX(0)' : 'translateX(150px)',
                                    left: '0.4rem'
                                }}></div>
                                <button className={activeTab === 'search' ? 'active' : ''} onClick={() => setActiveTab('search')} style={{width: '150px'}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                    예매
                                </button>
                                <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')} style={{width: '150px'}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                                    설정
                                </button>
                            </div>
                        </div>

                        {activeTab === 'search' && (
                            <div className="dashboard">
                                <SearchForm 
                                    dep={dep} setDep={setDep} arr={arr} setArr={setArr} date={date} setDate={setDate} time={time} setTime={setTime}
                                    adults={adults} setAdults={setAdults} children={children} setChildren={setChildren} seniors={seniors} setSeniors={setSeniors}
                                    dis1to3={dis1to3} setDis1to3={setDis1to3} dis4to6={dis4to6} setDis4to6={setDis4to6}
                                    doSearch={doSearch} stations={stations}
                                />
                                <TrainList 
                                    trains={trains} selectedTargets={selectedTargets} toggleTarget={toggleTarget} bulkToggleTarget={bulkToggleTarget}
                                    autoPayActive={autoPayActive} setAutoPayActive={setAutoPayActive}
                                    autoReserveActive={autoReserveActive} autoReserveAttempts={autoReserveAttempts}
                                    startAutoReserve={startAutoReserve} stopAutoReserve={stopAutoReserve}
                                    logs={logs}
                                />
                            </div>
                        )}


                        {activeTab === 'settings' && (
                            <SettingsCard 
                                cardNum={cardNum} setCardNum={setCardNum} cardPw={cardPw} setCardPw={setCardPw}
                                cardBirth={cardBirth} setCardBirth={setCardBirth} cardExp={cardExp} setCardExp={setCardExp}
                                saveCard={saveCard}
                                apiBase={apiBase} setApiBase={setApiBase} apiKey={apiKey} setApiKey={setApiKey}
                                saveApiSettings={saveApiSettings}
                                devMode={devMode} setDevMode={setDevMode}
                                tgToken={tgToken} setTgToken={setTgToken}
                                tgChatId={tgChatId} setTgChatId={setTgChatId}
                                saveTelegramSettings={saveTelegramSettings}
                            />
                        )}
                    </>
                )}
            </div>
        </>
    );
}

export default App;
