import { useState } from 'react';
import { motion } from 'framer-motion';
import { SearchForm } from '../../../widgets/search-form/ui/SearchForm';
import { TrainList } from '../../../widgets/train-list/ui/TrainList';
import { ApiSettings } from '../../../features/api-settings/ui/ApiSettings';
import { Settings, Search, Terminal } from 'lucide-react';
import '../../../app/style.css';

const STATIONS = ["수서", "동탄", "평택지제", "곡성", "공주", "광주송정", "구례구", "김천(구미)", "나주", "남원", "대구", "대전", "마산", "목포", "밀양", "부산", "서대구", "순천", "신경주", "여수EXPO", "여천", "오송", "울산(통도사)", "익산", "전주", "진영", "진주", "창원", "창원중앙", "천안아산", "포항"];

export default function MainPage() {
    const [activeTab, setActiveTab] = useState<'search' | 'settings'>('search');
    const [devMode, setDevMode] = useState(false);

    return (
        <div className="dashboard-layout">
            <div className="nav-tabs-wrapper">
                <div className="nav-tabs">
                    <div className="active-bg" style={{
                        width: '150px',
                        transform: activeTab === 'search' ? 'translateX(0)' : 'translateX(150px)',
                        left: '0.4rem'
                    }}></div>
                    <button className={activeTab === 'search' ? 'active' : ''} onClick={() => setActiveTab('search')} style={{ width: '150px' }}>
                        <Search size={20} /> 예매
                    </button>
                    <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')} style={{ width: '150px' }}>
                        <Settings size={20} /> 설정
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
                                <Terminal /> 개발자 모드
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
    );
}
