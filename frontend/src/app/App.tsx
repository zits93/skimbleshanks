import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toast } from '../shared/ui/Toast';
import { Modal } from '../shared/ui/Modal';
import { SearchForm } from '../widgets/search-form/ui/SearchForm';
import { TrainList } from '../widgets/train-list/ui/TrainList';
import { ApiSettings } from '../features/api-settings/ui/ApiSettings';
import { useAuthStore } from '../features/auth/model/authStore';
import { useUiStore } from '../shared/api/uiStore';
import { Settings, Search, User, Globe, Terminal } from 'lucide-react';
import './style.css';

const STATIONS = ["수서", "동탄", "평택지제", "곡성", "공주", "광주송정", "구례구", "김천(구미)", "나주", "남원", "대구", "대전", "마산", "목포", "밀양", "부산", "서대구", "순천", "신경주", "여수EXPO", "여천", "오송", "울산(통도사)", "익산", "전주", "진영", "진주", "창원", "창원중앙", "천안아산", "포항"];

interface Paw {
    id: number;
    x: number;
    y: number;
    rotate: number;
}

export default function App() {
    const [activeTab, setActiveTab] = useState<'search' | 'settings'>('search');
    const [devMode, setDevMode] = useState(false);
    const [password, setPassword] = useState('');
    const [paws, setPaws] = useState<Paw[]>([]);

    const { isLoggedIn, userId, loading, setUserId, login, checkConfig } = useAuthStore();
    const { showToast } = useUiStore();

    const trackRef = useRef<HTMLDivElement>(null);
    const catRef = useRef<HTMLDivElement>(null);
    const framesRef = useRef<HTMLDivElement>(null);
    const boostRef = useRef(0);
    const directionRef = useRef<number>(1);

    useEffect(() => {
        document.title = "Skimbleshanks Web GUI";
        checkConfig();
    }, [checkConfig]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login(password, 'SRT');
        if (success) {
            showToast('로그인 성공!', 'success');
        } else {
            showToast('로그인 실패. 정보를 확인하세요.', 'error');
        }
    };

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

    const handleCatClick = () => {
        boostRef.current = 25;
        directionRef.current *= -1;
        if (framesRef.current) {
            framesRef.current.style.transition = 'none';
            framesRef.current.style.transform = `scale(1.3) rotate(-10deg) scaleX(${directionRef.current})`;
            setTimeout(() => {
                if (framesRef.current) framesRef.current.style.transform = `scale(1) rotate(0deg) scaleX(${directionRef.current})`;
            }, 100);
        }
    };

    useEffect(() => {
        let lastTime = 0;
        let position = 50;
        let frameAcc = 0;
        
        const animate = (time: number) => {
            if (!lastTime) { lastTime = time; requestAnimationFrame(animate); return; }
            const dt = (time - lastTime) / 1000;
            lastTime = time;

            boostRef.current *= 0.92;
            if (boostRef.current < 0.1) boostRef.current = 0;

            const currentFPS = 14 + Math.sin(time / 1200) * 10 + Math.sin(time / 500) * 4 + boostRef.current;
            const catSpeed = currentFPS * 6.5;
            const trackSpeed = 90;
            
            const velocity = directionRef.current === 1 ? (catSpeed - trackSpeed) : (-catSpeed - trackSpeed);
            position += velocity * dt;
            
            const trackWidth = trackRef.current ? trackRef.current.offsetWidth : 800;
            const minPos = -40;
            const maxPos = trackWidth - 80; 
            
            if (position < minPos) { position = minPos; directionRef.current = 1; }
            if (position > maxPos) { position = maxPos; directionRef.current = -1; }
            
            frameAcc += currentFPS * dt;
            const frameIndex = Math.floor(frameAcc) % 5;
            
            if (catRef.current) catRef.current.style.transform = `translateX(${position}px)`;
            if (framesRef.current) {
                framesRef.current.style.backgroundImage = `url('./cat/run_${frameIndex}.png')`;
                framesRef.current.style.transform = `scaleX(${directionRef.current})`;
            }
            
            requestAnimationFrame(animate);
        };
        const handle = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(handle);
    }, []);

    return (
        <div onClick={handleGlobalClick} style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
            <AnimatePresence>
                {paws.map(paw => (
                    <motion.div 
                        key={paw.id}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 0.4, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        className="paw-particle" 
                        style={{
                            left: paw.x,
                            top: paw.y,
                            transform: `translate(-50%, -50%) rotate(${paw.rotate}deg)`
                        }}
                    >🐾</motion.div>
                ))}
            </AnimatePresence>

            <Toast />
            <Modal />

            <header>
                <div className="steam-container">
                    <div className="steam-cloud cloud-1"></div>
                    <div className="steam-cloud cloud-2"></div>
                    <div className="steam-cloud cloud-3"></div>
                </div>
                <h1>Skimble<span>shanks</span></h1>
                <p className="quote">The Railway Cat</p>
                <div className="rail-track" ref={trackRef}>
                    <div className="rail-track-sleepers-container">
                        <div className="rail-track-inner"></div>
                    </div>
                    <div className="cat-runner" ref={catRef} onClick={handleCatClick} style={{ cursor: 'pointer' }}>
                        <div className="cat-runner-frames" ref={framesRef} style={{ transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}></div>
                    </div>
                </div>
            </header>

            <main className="container">
                {!isLoggedIn ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ maxWidth: '420px', margin: '5vh auto 0' }}
                    >
                        <div className="glass login-card">
                            <form onSubmit={handleLogin}>
                                <div className="input-group">
                                    <label>SRT 서비스 아이디</label>
                                    <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="아이디 입력" required />
                                </div>
                                <div className="input-group">
                                    <label>비밀번호</label>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호 입력" required />
                                </div>
                                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                                    <User size={18} style={{ marginRight: '8px' }} />
                                    {loading ? '로그인 중...' : '로그인'}
                                </button>
                            </form>
                        </div>
                        
                        <div className="glass" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', opacity: 0.8 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                                <Terminal size={18} style={{ marginRight: '8px' }} />
                                개발자 설정 (API)
                            </span>
                            <label className="switch">
                                <input type="checkbox" checked={devMode} onChange={e => setDevMode(e.target.checked)} />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        {devMode && <ApiSettings />}
                    </motion.div>
                ) : (
                    <div className="dashboard-layout">
                        <div className="nav-tabs-wrapper">
                            <div className="nav-tabs">
                                <div className="active-bg" style={{
                                    width: '150px',
                                    transform: activeTab === 'search' ? 'translateX(0)' : 'translateX(150px)',
                                    left: '0.4rem'
                                }}></div>
                                <button className={activeTab === 'search' ? 'active' : ''} onClick={() => setActiveTab('search')} style={{ width: '150px' }}>
                                    <Search size={18} style={{ marginRight: '8px' }} /> 예매
                                </button>
                                <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')} style={{ width: '150px' }}>
                                    <Settings size={18} style={{ marginRight: '8px' }} /> 설정
                                </button>
                            </div>
                        </div>

                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="dashboard-content"
                        >
                            {activeTab === 'search' ? (
                                <div className="dashboard">
                                    <SearchForm stations={STATIONS} />
                                    <TrainList />
                                </div>
                            ) : (
                                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                                    <ApiSettings />
                                    <div className="glass" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', opacity: 0.8 }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                                            <Terminal size={18} style={{ marginRight: '8px' }} /> 개발자 모드
                                        </span>
                                        <label className="switch">
                                            <input type="checkbox" checked={devMode} onChange={e => setDevMode(e.target.checked)} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </main>

            <footer style={{ textAlign: 'center', padding: '3rem', opacity: 0.4, fontSize: '0.8rem' }}>
                <a href="https://github.com/zits93/skimbleshanks" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Globe size={14} /> GitHub Repository
                </a>
            </footer>
        </div>
    );
}
