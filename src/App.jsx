import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import MainScreen from './screens/MainScreen';
import StoryScreen from './screens/StoryScreen';
import WorldScreen from './screens/WorldScreen';
import StatsScreen from './screens/StatsScreen';

function GameApp() {
  const { phase, startApp, name, level, toastMsg, levelUpAlert } = useGame();
  const [tab, setTab] = useState("main");
  const [inputName, setInputName] = useState("");

  if (phase === "loading") {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (phase === "enter") {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'var(--surface)', padding: '32px 24px', borderRadius: '12px', textAlign: 'center', width: '100%', maxWidth: '360px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚔️</div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Life RPG</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Who is stepping into the arena?</p>
          <input 
            className="input-base" 
            placeholder="Enter your name" 
            value={inputName} 
            onChange={(e) => setInputName(e.target.value)}
            style={{ marginBottom: '16px', textAlign: 'center' }}
            autoFocus
          />
          <button 
            className="btn-primary" 
            style={{ width: '100%' }}
            onClick={() => { if (inputName.trim()) startApp(inputName.trim()); }}
            disabled={!inputName.trim()}
          >
            Begin Journey
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', fontSize: '20px', fontWeight: '800', color: 'var(--accent-mastery)' }}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: '800' }}>{name}</div>
          <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Level {level}</div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px', marginBottom: '24px' }}>
        {["main", "story", "world", "stats"].map(t => (
          <button 
            key={t}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px',
              background: tab === t ? 'var(--surface-hover)' : 'transparent',
              color: tab === t ? 'var(--text-main)' : 'var(--text-muted)'
            }}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Active Tab */}
      <div>
        {tab === "main" && <MainScreen />}
        {tab === "story" && <StoryScreen />}
        {tab === "world" && <WorldScreen />}
        {tab === "stats" && <StatsScreen />}
      </div>

      {/* Toast Notification */}
      <div className={`toast ${toastMsg ? 'show' : ''}`}>
        {toastMsg}
      </div>

      {/* Level Up Flash */}
      {levelUpAlert && (
        <div className="level-up-overlay">
          <div className="level-up-text">
            <div className="level-up-number">{levelUpAlert}</div>
            <div className="level-up-label">Level Up</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}
