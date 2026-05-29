import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export default function FocusScreen() {
  const { focusQuest, setFocusQuest, completeQuest } = useGame();
  
  // 1 energy = 1 minute = 60 seconds
  const totalSeconds = focusQuest ? focusQuest.en * 60 : 0;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);

  useEffect(() => {
    if (!focusQuest) return;
    if (timeLeft <= 0) {
      completeQuest(focusQuest, { focus: true });
      setFocusQuest(null);
      return;
    }

    const id = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [focusQuest, timeLeft, completeQuest, setFocusQuest]);

  if (!focusQuest) return null;

  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  const pct = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'var(--bg)', zIndex: 9999, display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20
    }}>
      <div style={{ fontSize: 48, marginBottom: 20 }}>{focusQuest.ic}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, textAlign: 'center' }}>
        {focusQuest.nm}
      </div>
      <div style={{ fontSize: 14, color: '#eab308', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 40 }}>
        Focus Mode Active
      </div>

      {/* Circular Timer (simulated with large text and bar) */}
      <div style={{ position: 'relative', width: 240, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Progress Ring Background */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <circle cx="120" cy="120" r="110" fill="none" stroke="var(--surface)" strokeWidth="8" />
          <circle cx="120" cy="120" r="110" fill="none" stroke="#eab308" strokeWidth="8"
            strokeDasharray="690" strokeDashoffset={690 - (690 * pct) / 100}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 48, fontWeight: 800, color: '#eab308' }}>
          {m}:{s}
        </div>
      </div>

      <div style={{ marginTop: 60, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 20 }}>
          Stay on this screen. Leaving or canceling forfeits the focus bonus.
        </p>
        <button
          onClick={() => {
            if (window.confirm("Abandon focus? You will not get the XP bonus, and the quest will not be completed.")) {
              setFocusQuest(null);
            }
          }}
          style={{
            background: 'transparent', border: '1px solid #ef4444', color: '#ef4444',
            padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer'
          }}
        >
          Abandon Focus
        </button>
      </div>
    </div>
  );
}
