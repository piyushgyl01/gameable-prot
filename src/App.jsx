import { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import MainScreen from './screens/MainScreen';
import StoryScreen from './screens/StoryScreen';
import WorldScreen from './screens/WorldScreen';
import StatsScreen from './screens/StatsScreen';

const TABS = ['main', 'story', 'world', 'stats'];

function GameApp() {
  const { phase, startApp, name, level, xp, toastMsg, levelUpAlert } = useGame();
  const [tab, setTab] = useState('main');
  const [inputName, setInputName] = useState('');

  if (phase === 'loading') {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
        Loading...
      </div>
    );
  }

  if (phase === 'enter') {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{
          background: 'var(--surface)', padding: '40px 28px', borderRadius: '12px',
          textAlign: 'center', width: '100%', maxWidth: '360px', border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '36px', marginBottom: '20px' }}>⚔️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>Life RPG</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px' }}>Who steps into the arena?</p>
          <input
            style={{
              width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '12px 16px', color: 'var(--text-main)',
              fontFamily: 'var(--font)', fontSize: '15px', fontWeight: 600, outline: 'none',
              textAlign: 'center', marginBottom: '16px',
            }}
            placeholder="Your name"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && inputName.trim()) startApp(inputName.trim()); }}
            autoFocus
          />
          <button
            style={{
              width: '100%', background: 'var(--surface-hover)', border: '1px solid var(--border-focus)',
              borderRadius: '8px', padding: '12px', fontFamily: 'var(--font)', fontSize: '14px',
              fontWeight: 700, color: inputName.trim() ? 'var(--text-main)' : 'var(--text-dim)',
              cursor: inputName.trim() ? 'pointer' : 'default', transition: 'all 0.2s',
            }}
            onClick={() => { if (inputName.trim()) startApp(inputName.trim()); }}
          >
            Begin
          </button>
        </div>
      </div>
    );
  }

  // ── Main Game UI ───────────────────────────────────
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 120px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: 'var(--surface)',
          border: '1px solid var(--border)', display: 'grid', placeItems: 'center',
          fontSize: '18px', fontWeight: 800, color: '#818cf8',
        }}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '17px', fontWeight: 800 }}>{name}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            Lv {level}
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div style={{
        display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 8, padding: 3, marginBottom: 24,
      }}>
        {TABS.map((t) => (
          <button
            key={t}
            style={{
              flex: 1, padding: '10px 0', border: 'none', borderRadius: 6,
              fontFamily: 'var(--font)', fontSize: 13, fontWeight: 700,
              textTransform: 'capitalize', cursor: 'pointer',
              background: tab === t ? 'var(--surface-hover)' : 'transparent',
              color: tab === t ? 'var(--text-main)' : 'var(--text-dim)',
              transition: 'all 0.15s',
            }}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Active Screen */}
      {tab === 'main' && <MainScreen />}
      {tab === 'story' && <StoryScreen />}
      {tab === 'world' && <WorldScreen />}
      {tab === 'stats' && <StatsScreen />}

      {/* Toast */}
      <div className={'toast' + (toastMsg ? ' show' : '')}>{toastMsg}</div>

      {/* Level Up */}
      {levelUpAlert && (
        <div className="level-up-overlay">
          <div>
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
