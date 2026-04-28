import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toast } from './components/Toast';
import { Modal } from './components/Modal';
import { SearchForm } from './components/SearchForm';
import { TrainList } from './components/TrainList';
import { SettingsCard } from './components/SettingsCard';
import { Log } from './types';
import { ApiSettings } from './components/ApiSettings';
import { apiFetch } from './api';

interface Paw {
    id: number;
    x: number;
    y: number;
    rotate: number;
}

interface ToastState {
    message: string;
    type: string;
    key: number;
}

interface ModalState {
    icon: string;
    title: string;
    message: string;
    buttons: any[];
}

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('search');
    const [stationList] = useState<string[]>(["수서","동탄","평택지제","대전","동대구","부산","광주송정","목포"]);
    
    // Auth & Search State
    const [userId, setUserId] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [dep, setDep] = useState<string>('수서');
    const [arr, setArr] = useState<string>('부산');
    
    // Initialize date and time with current values
    const now = new Date();
    const initialDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const initialTime = `${String(now.getHours()).padStart(2, '0')}0000`;

    const [date, setDate] = useState<string>(initialDate);
    const [time, setTime] = useState<string>(initialTime);
    
    // Animation Refs
    const catRef = useRef<HTMLDivElement>(null);
    const framesRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const boostRef = useRef<number>(0);
    const [adults, setAdults] = useState<number>(1);
    const [children, setChildren] = useState<number>(0);
    const [seniors, setSeniors] = useState<number>(0);
    const [dis1to3, setDis1to3] = useState<number>(0);
    const [dis4to6, setDis4to6] = useState<number>(0);
    const [trains, setTrains] = useState<any[]>([]);
    
    // Auto Reserve State
    const [selectedTargets, setSelectedTargets] = useState<any[]>([]);
    const [autoReserveActive, setAutoReserveActive] = useState<boolean>(false);
    const [autoPayActive, setAutoPayActive] = useState<boolean>(true);

    const [autoReserveAttempts, setAutoReserveAttempts] = useState<number>(0);
    const [logs, setLogs] = useState<Log[]>([]);
    const autoTimerRef = useRef<any>(null);

    // Settings State
    const [cardNum, setCardNum] = useState<string>(() => localStorage.getItem('skimbleshanks_card_num') || '');
    const [cardPw, setCardPw] = useState<string>(() => localStorage.getItem('skimbleshanks_card_pw') || '');
    const [cardBirth, setCardBirth] = useState<string>(() => localStorage.getItem('skimbleshanks_card_birth') || '');
    const [cardExp, setCardExp] = useState<string>(() => localStorage.getItem('skimbleshanks_card_exp') || '');

    const [apiBase, setApiBase] = useState<string>(() => localStorage.getItem('skimbleshanks_api_base') || 'http://localhost:8000/api');
    const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('skimbleshanks_api_key') || 'skimbleshanks-default-key');
    const [devMode, setDevMode] = useState<boolean>(false);

    const [tgToken, setTgToken] = useState<string>(() => localStorage.getItem('skimbleshanks_tg_token') || '');
    const [tgChatId, setTgChatId] = useState<string>(() => localStorage.getItem('skimbleshanks_tg_chat_id') || '');

    const [loading, setLoading] = useState<boolean>(false);
    const [toast, setToast] = useState<ToastState | null>(null);
    const [modal, setModal] = useState<ModalState | null>(null);
    const [paws, setPaws] = useState<Paw[]>([]);
    const [showTgGuide, setShowTgGuide] = useState<boolean>(false);

    const handleGlobalClick = (e: React.MouseEvent) => {
        const newPaw: Paw = {
            id: Date.now(),
            x: e.clientX,
            y: e.clientY,
            rotate: Math.random() * 360
        };
        setPaws(prev => [...prev, newPaw]);
        setTimeout(() => {
            setPaws(prev => prev.filter(p => p.id !== newPaw.id));
        }, 1000);
    };

    const saveApiSettings = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('skimbleshanks_api_base', apiBase);
        localStorage.setItem('skimbleshanks_api_key', apiKey);
        showToast('API 설정이 저장되었습니다. 페이지를 새로고침합니다...', 'success');
        setTimeout(() => window.location.reload(), 1000);
    };

    const saveTelegramSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await apiFetch('/telegram', {
                method: 'POST',
                body: JSON.stringify({ token: tgToken, chat_id: tgChatId })
            });
            if (res.ok) {
                localStorage.setItem('skimbleshanks_tg_token', tgToken);
                localStorage.setItem('skimbleshanks_tg_chat_id', tgChatId);
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

    const addLog = useCallback((message: string, type: Log['type'] = 'info') => {
        const time = new Date().toLocaleTimeString('ko-KR', { hour12: false });
        setLogs(prev => [...prev, { time, message, type }].slice(-50)); // Keep last 50 logs
    }, []);

    const showToast = useCallback((message: string, type: string) => {
        setToast({ message, type, key: Date.now() });
    }, []);

    const showAlert = useCallback((title: string, message: string, icon?: string, timer: number | null = null, btnLabel: string = '확인') => {
        return new Promise<void>(resolve => {
            setModal({
                icon: icon || '📢',
                title,
                message,
                buttons: [{ 
                    label: btnLabel, 
                    primary: true, 
                    timer,
                    onClick: () => { setModal(null); resolve(); } 
                }]
            });
        });
    }, []);

    useEffect(() => {
        document.title = "Skimbleshanks Web GUI";
        checkConfig();
    }, []);

    const checkConfig = async () => {
        try {
            const res = await apiFetch('/config');
            if (res.ok) {
                const data = await res.json();
                // 백엔드에 정보가 있더라도 프론트엔드에서는 직접 로그인을 거치도록 함
                if (data.srt_user_id) setUserId(data.srt_user_id);
            } else if (res.status === 403) {
                showToast('API 인증 키(X-API-KEY)가 잘못되었습니다.', 'error');
            }
        } catch (e) {
            // Silently fail for initial config check unless it's a specific auth error
        }
    };

    const handleCatClick = () => {
        boostRef.current = 25; // Add raw FPS boost
        if (framesRef.current) {
            framesRef.current.style.transition = 'none';
            framesRef.current.style.transform = 'scale(1.3) rotate(-10deg)';
            setTimeout(() => {
                if (framesRef.current) framesRef.current.style.transform = 'scale(1) rotate(0deg)';
            }, 100);
        }
    };

    useEffect(() => {
        let lastTime = 0;
        let position = 50; // Initial start position
        let frameAcc = 0;
        
        const animate = (time: number) => {
            if (!lastTime) {
                lastTime = time;
                requestAnimationFrame(animate);
                return;
            }
            const dt = (time - lastTime) / 1000;
            lastTime = time;

            // Decay boost
            boostRef.current *= 0.92;
            if (boostRef.current < 0.1) boostRef.current = 0;

            const currentFPS = 14 + Math.sin(time / 1200) * 10 + Math.sin(time / 500) * 4 + boostRef.current;
            const catSpeed = currentFPS * 6.5; // px/s
            const trackSpeed = 90; // Constant track feel
            
            position += (catSpeed - trackSpeed) * dt;
            
            // Dynamic boundaries
            const trackWidth = trackRef.current ? trackRef.current.offsetWidth : 800;
            const minPos = -40;
            const maxPos = trackWidth - 80; 
            
            if (position < minPos) position = minPos;
            if (position > maxPos) position = maxPos;
            
            // Update frames
            frameAcc += currentFPS * dt;
            const frameIndex = Math.floor(frameAcc) % 5;
            
            if (catRef.current) catRef.current.style.transform = `translateX(${position}px)`;
            if (framesRef.current) framesRef.current.style.backgroundImage = `url('./cat/run_${frameIndex}.png')`;
            
            requestAnimationFrame(animate);
        };
        const handle = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(handle);
    }, [isLoggedIn]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await apiFetch('/login', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, password, provider: 'SRT' })
            });
            if (res.ok) {
                setIsLoggedIn(true);
                showToast('로그인 성공!', 'success');
            } else if (res.status === 403) {
                showToast('API 인증 키(X-API-KEY)가 올바르지 않습니다.', 'error');
            } else if (res.status === 401) {
                showToast('열차 서비스 로그인 실패. 아이디/비번을 확인하세요.', 'error');
            } else {
                showToast('로그인 처리 중 오류가 발생했습니다.', 'error');
            }
        } catch (e) {
            showToast('서버 연결 오류', 'error');
        } finally {
            setLoading(false);
        }
    };

    const doSearch = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/search', {
                method: 'POST',
                body: JSON.stringify({ dep, arr, date, time, adults, children, seniors, disability1to3: dis1to3, disability4to6: dis4to6, provider: 'SRT' })
            });
            if (res.ok) {
                const data = await res.json();
                setTrains(data.trains);
                if (data.trains.length === 0) showToast('조회 결과가 없습니다.', 'error');
            } else if (res.status === 403) {
                showToast('API 인증 키가 올바르지 않습니다.', 'error');
            } else {
                showToast('조회 중 오류 발생', 'error');
            }
        } catch (e) {
            showToast('서버 연결 오류', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleTarget = (trainName: string, seatType: string) => {
        setSelectedTargets(prev => {
            const exists = prev.find(t => t.train_name === trainName && t.seat_type === seatType);
            if (exists) return prev.filter(t => !(t.train_name === trainName && t.seat_type === seatType));
            return [...prev, { train_name: trainName, seat_type: seatType }];
        });
    };

    const bulkToggleTarget = (seatType: string) => {
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
        if (autoPayActive && (!cardNum || !cardPw || !cardBirth || !cardExp)) {
            showAlert('알림', '자동 결제를 사용하려면 카드 정보를 먼저 입력해주세요.', '💳', 3000, '설정하러 가기')
                .then(() => setActiveTab('settings'));
            return;
        }
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
                            provider: 'SRT'
                        })
                    });
                    
                    if (isCancelled || !autoReserveActiveRef.current) return;
                    
                    if (!res.ok) {
                        if (res.status === 403) {
                            addLog('API 인증 키가 올바르지 않아 자동 예매를 중단합니다.', 'error');
                            setAutoReserveActive(false);
                            showAlert('❌ 인증 오류', 'API 인증 키(X-API-KEY)가 올바르지 않습니다.', '🚨');
                            return;
                        }
                        const errData = await res.json().catch(() => ({ detail: '알 수 없는 오류' }));
                        addLog(`예매 시도 실패: ${errData.detail || '서버 응답 오류'}`, 'error');
                        autoTimerRef.current = setTimeout(attemptReserve, 2000);
                        return;
                    }

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
                } catch (e: any) {
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

    const saveCard = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('skimbleshanks_card_num', cardNum);
        localStorage.setItem('skimbleshanks_card_pw', cardPw);
        localStorage.setItem('skimbleshanks_card_birth', cardBirth);
        localStorage.setItem('skimbleshanks_card_exp', cardExp);
        showToast('카드 정보가 브라우저에 저장되었습니다.', 'success');
        setTimeout(() => setActiveTab('search'), 600);
    };

    return (
        <div onClick={handleGlobalClick} style={{minHeight: '100vh'}}>
            {paws.map(paw => (
                <div key={paw.id} className="paw-particle" style={{
                    left: paw.x,
                    top: paw.y,
                    transform: `translate(-50%, -50%) rotate(${paw.rotate}deg)`
                }}>🐾</div>
            ))}
            {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
            {modal && <Modal {...modal} onClose={() => setModal(null)} />}

            <header>
                <div className="steam-container">
                    <div className="steam-cloud cloud-1"></div>
                    <div className="steam-cloud cloud-2"></div>
                    <div className="steam-cloud cloud-3"></div>
                </div>
                <h1>Skimble<span>shanks</span></h1>
                <p className="quote">The Railway Cat</p>
                <div className="rail-track" ref={trackRef}>
                    <div className="rail-track-inner"></div>
                    <div className="cat-runner" ref={catRef} onClick={handleCatClick} style={{cursor: 'pointer'}}>
                        <div className="cat-runner-frames" ref={framesRef} style={{transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'}}></div>
                    </div>
                </div>
            </header>

            <div className="container">
                {!isLoggedIn ? (
                    <div style={{maxWidth: '420px', margin: '5vh auto 0'}}>
                        <div className="glass login-card" style={{margin: 0}}>
                            <form onSubmit={handleLogin}>
                                <div className="input-group">
                                    <label style={{fontSize: '1rem', marginBottom: '0.8rem'}}>SRT 서비스 아이디</label>
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
                        
                        <div className="glass" style={{marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', opacity: 0.8}}>
                            <span style={{fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center'}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
                                개발자 설정 (API)
                            </span>
                            <label className="switch">
                                <input type="checkbox" checked={devMode} onChange={e => setDevMode(e.target.checked)} />
                                <span className="slider round"></span>
                            </label>
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
                                    doSearch={doSearch} stations={stationList}
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
        </div>
    );
}

export default App;
