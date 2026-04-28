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

function AppContent() {
    const { isLoggedIn, checkConfig } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [paws, setPaws] = useState<Paw[]>([]);

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
            navigate('/login');
        } else if (isLoggedIn && path === '/login') {
            navigate('/');
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
        // Use relative path for public assets in JS to be safe with HashRouter
        const base = import.meta.env.BASE_URL;
        
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
                // Absolute path from site root is safest if base is set correctly
                const imgPath = `${base}cat/run_${frameIndex}.png`.replace(/\/+/g, '/');
                framesRef.current.style.backgroundImage = `url('${imgPath}')`;
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
