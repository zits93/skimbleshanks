import React from 'react';

export function PassengerSelect({ label, value, onChange }) {
    return (
        <div className="input-group">
            <label>{label}</label>
            <div style={{
                display: 'flex', 
                alignItems: 'center', 
                background: 'rgba(255,255,255,0.05)', 
                borderRadius: '1rem', 
                padding: '0.2rem',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <button 
                    onClick={() => onChange(Math.max(0, value - 1))}
                    style={{width: '36px', height: '36px', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '1.2rem'}}
                >-</button>
                <div style={{
                    flex: 1, 
                    textAlign: 'center', 
                    fontWeight: '700', 
                    fontSize: '1.2rem',
                    fontFamily: 'Outfit, sans-serif',
                    color: value > 0 ? '#fff' : 'rgba(255,255,255,0.2)',
                    textShadow: value > 0 ? '0 0 10px var(--primary-glow)' : 'none'
                }}>{value}</div>
                <button 
                    onClick={() => onChange(Math.min(9, value + 1))}
                    style={{width: '36px', height: '36px', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '1.2rem'}}
                >+</button>
            </div>
        </div>
    );
}
