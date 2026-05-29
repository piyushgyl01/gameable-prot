import React, { useState } from 'react';
import { formatEnergyTime, xpMultiplier } from '../lib/systems';
import { useGame } from '../context/GameContext';
import { useSwipeable } from 'react-swipeable';

const DF_COL = { 1: '#10b981', 2: '#eab308', 3: '#ef4444' };
const DF_LBL = { 1: 'Easy', 2: 'Med', 3: 'Hard' };

export default function QuestCard({ quest, questState, currentLevel, onStart, onSkip, onComplete }) {
  const { floatingXp, setFocusQuest } = useGame();
  const q = quest;
  const status = questState?.s || 'idle';
  const isDone = status === 'done';
  const isActive = status === 'active';
  const dc = DF_COL[q.df] || '#818cf8';
  const earnedXp = Math.round(q.xp * xpMultiplier(currentLevel));

  const [swipeOffset, setSwipeOffset] = useState(0);

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (status !== 'idle' && status !== 'active') return;
      if (e.dir === 'Left' || e.dir === 'Right') {
        setSwipeOffset(e.deltaX);
      }
    },
    onSwipedLeft: () => {
      setSwipeOffset(0);
      if (status === 'idle') onSkip(q);
    },
    onSwipedRight: () => {
      setSwipeOffset(0);
      if (status === 'active') onComplete(q);
      else if (status === 'idle') onStart(q);
    },
    onSwiped: () => setSwipeOffset(0),
    trackMouse: true,
  });

  const chip = (bg) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
    background: bg, marginRight: 6, marginTop: 6,
  });

  return (
    <div {...handlers} style={{
      display: 'flex', gap: 12, padding: '12px 14px',
      borderTop: '1px solid var(--border)', opacity: isDone ? 0.3 : 1,
      background: isActive ? 'rgba(234,179,8,0.04)' : 'transparent',
      borderLeft: isActive ? '2px solid #eab308' : '2px solid transparent',
      transition: swipeOffset === 0 ? 'all 0.2s ease' : 'none',
      transform: `translateX(${swipeOffset}px)`,
    }}>
      {/* Icon */}
      <div style={{ fontSize: 20, lineHeight: '24px', flexShrink: 0, paddingTop: 2 }}>
        {q.ic}
      </div>

      {/* Middle */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: 'var(--text-main)',
          textDecoration: isDone ? 'line-through' : 'none',
        }}>
          {q.nm}
        </div>
        {q.ds && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{q.ds}</div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={chip(dc + '1a')}>
            <span style={{ color: dc }}>{DF_LBL[q.df] || 'Med'}</span>
          </span>
          {isActive && (
            <span style={chip('rgba(234,179,8,0.1)')}>
              <span style={{ color: '#eab308' }}>⚡ {q.en} • {formatEnergyTime(q.en)}</span>
            </span>
          )}
          {isDone && (
            <span style={chip('rgba(16,185,129,0.1)')}>
              <span style={{ color: '#10b981' }}>✓ Completed</span>
            </span>
          )}
        </div>
      </div>

      {/* Right */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        justifyContent: 'flex-end', gap: 6, flexShrink: 0, position: 'relative',
      }}>
        {floatingXp && floatingXp.id === q.id && (
          <div className="float-xp">+{floatingXp.amount} XP</div>
        )}
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
          fontWeight: 700, color: 'var(--text-dim)',
        }}>
          +{earnedXp} xp
        </span>

        {status === 'idle' && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => onSkip(q)}
              style={{
                fontSize: 12, padding: '4px 10px', borderRadius: 6,
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-dim)', cursor: 'pointer',
              }}
            >
              Skip
            </button>
            <button
              onClick={() => onStart(q)}
              style={{
                fontSize: 12, padding: '4px 10px', borderRadius: 6,
                background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)',
                color: '#eab308', fontWeight: 600, cursor: 'pointer',
              }}
            >
              {formatEnergyTime(q.en)}
            </button>
          </div>
        )}

        {isActive && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={() => onComplete(q)}
              style={{
                background: '#10b981', border: 'none', color: '#fff',
                padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                flex: 1
              }}
            >
              Complete
            </button>
            {q.en >= 15 && (
              <button
                onClick={() => setFocusQuest(q)}
                style={{
                  background: '#eab308', border: 'none', color: '#000',
                  padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  flex: 1
                }}
              >
                Deep Focus
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
