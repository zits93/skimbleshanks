import { useEffect, useRef, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toast } from '../shared/ui/Toast';
import { Modal } from '../shared/ui/Modal';
import { useAuthStore } from '../features/auth/model/authStore';
import { Globe } from 'lucide-react';
import LoginPage from '../pages/login/ui/LoginPage';
import MainPage from '../pages/main/ui/MainPage';
import './style.css';

interface Paw {
    id: number;
    x: number;
    y: number;
    rotate: number;
}

interface Steam {
    id: number;
    x: number;
    y: number;
    vx: number;
    scale: number;
}

function AppContent() {
    const { isLoggedIn, checkConfig } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [paws, setPaws] = useState<Paw[]>([]);
    const [steams, setSteams] = useState<Steam[]>([]);
    const steamIdRef = useRef(0);
    const lastSteamSpawnRef = useRef(0);

    const trackRef = useRef<HTMLDivElement>(null);
    const catRef = useRef<HTMLDivElement>(null);
    const framesRef = useRef<HTMLDivElement>(null);
    const boostRef = useRef(0);
    const directionRef = useRef<number>(1);

    useEffect(() => {
        document.title = "Skimbleshanks Web GUI";
        checkConfig();
    }, [checkConfig]);

    useEffect(() => {
        const path = location.pathname;
        if (!isLoggedIn && path !== '/login') {
            navigate('/login', { replace: true });
        } else if (isLoggedIn && path === '/login') {
            navigate('/', { replace: true });
        }
    }, [isLoggedIn, location.pathname, navigate]);

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

    const spawnSteam = (x: number, y: number, dir: number, count = 3) => {
        const newSteams: Steam[] = Array.from({ length: count }).map((_) => ({
            id: ++steamIdRef.current,
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vx: -dir * (Math.random() * 150 + 80),
            scale: Math.random() * 0.7 + 0.5
        }));
        setSteams(prev => [...prev, ...newSteams]);
        setTimeout(() => {
            setSteams(prev => prev.filter(s => !newSteams.find(ns => ns.id === s.id)));
        }, 800);
    };

    const handleCatClick = () => {
        boostRef.current = 45;
        
        // Spawn more dramatic steam from cat position
        if (catRef.current && trackRef.current) {
            const now = performance.now();
            if (now - lastSteamSpawnRef.current > 100) {
                const catRect = catRef.current.getBoundingClientRect();
                const trackRect = trackRef.current.getBoundingClientRect();
                // Increased count for dramatic effect
                spawnSteam(catRect.left - trackRect.left + 40, 20, directionRef.current, 8);
                lastSteamSpawnRef.current = now;
            }
        }

        if (framesRef.current) {
            framesRef.current.style.transition = 'none';
            framesRef.current.style.transform = `scale(1.3) rotate(-10deg) scaleX(${directionRef.current})`;
            setTimeout(() => {
                if (framesRef.current) framesRef.current.style.transform = `scale(1) rotate(0deg) scaleX(${directionRef.current})`;
            }, 100);
        }
    };

    const lastFrameIndexRef = useRef(-1);
    const preloadedImagesRef = useRef<HTMLImageElement[]>([]);

    useEffect(() => {
        // Preload images to prevent blinking
        const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
        const images = [0, 1, 2, 3, 4].map(i => {
            const img = new Image();
            img.src = `${base}/cat/run_${i}.png`;
            return img;
        });
        preloadedImagesRef.current = images;
    }, []);

    useEffect(() => {
        let lastTime = 0;
        let position = 50;
        let frameAcc = 0;
        const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
        
        const animate = (time: number) => {
            if (!lastTime) { lastTime = time; requestAnimationFrame(animate); return; }
            const dt = (time - lastTime) / 1000;
            lastTime = time;

            boostRef.current *= 0.96;
            if (boostRef.current < 0.1) boostRef.current = 0;

            const currentFPS = 12 + Math.sin(time / 1200) * 8 + Math.sin(time / 500) * 3 + boostRef.current;
            const catSpeed = currentFPS * 11.0;
            const trackSpeed = 85;
            
            const velocity = directionRef.current === 1 ? (catSpeed - trackSpeed) : (-catSpeed - trackSpeed);
            position += velocity * dt;
            
            const trackWidth = trackRef.current ? trackRef.current.offsetWidth : 800;
            const minPos = -40;
            const maxPos = trackWidth - 80; 
            
            if (position < minPos) { 
                position = minPos; 
                if (directionRef.current === -1) {
                    directionRef.current = 1; 
                    if (time - lastSteamSpawnRef.current > 300) {
                        spawnSteam(position + 40, 20, directionRef.current, 3);
                        lastSteamSpawnRef.current = time;
                    }
                }
            }
            if (position > maxPos) { 
                position = maxPos; 
                if (directionRef.current === 1) {
                    directionRef.current = -1; 
                    if (time - lastSteamSpawnRef.current > 300) {
                        spawnSteam(position + 40, 20, directionRef.current, 3);
                        lastSteamSpawnRef.current = time;
                    }
                }
            }
            
            frameAcc += currentFPS * dt;
            const frameIndex = Math.floor(frameAcc) % 5;
            
            if (catRef.current) catRef.current.style.transform = `translateX(${position}px)`;
            if (framesRef.current) {
                // Only update background if frame index changed to prevent flickering
                if (frameIndex !== lastFrameIndexRef.current) {
                    const imgPath = `${base}/cat/run_${frameIndex}.png`;
                    framesRef.current.style.backgroundImage = `url('${imgPath}')`;
                    lastFrameIndexRef.current = frameIndex;
                }
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
                    <AnimatePresence>
                        {steams.map(s => (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0.8, scale: 0.2, x: s.x, y: s.y }}
                                animate={{ opacity: 0, scale: 2, x: s.x + s.vx, y: s.y - 40 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                style={{
                                    position: 'absolute',
                                    width: '30px',
                                    height: '30px',
                                    background: 'rgba(255,255,255,0.4)',
                                    borderRadius: '50%',
                                    filter: 'blur(8px)',
                                    pointerEvents: 'none',
                                    zIndex: 1
                                }}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </header>

            <main className="container">
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<MainPage />} />
                    <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} />} />
                </Routes>
            </main>

            <footer style={{ textAlign: 'center', padding: '3rem', opacity: 0.4, fontSize: '0.8rem' }}>
                <a href="https://github.com/zits93/skimbleshanks" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Globe size={18} /> GitHub Repository
                </a>
            </footer>
        </div>
    );
}

export default function App() {
    return (
        <HashRouter>
            <AppContent />
        </HashRouter>
    );
}
