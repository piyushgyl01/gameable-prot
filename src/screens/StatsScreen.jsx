import React from 'react';
import { useGame } from '../context/GameContext';
import { MAIN_QUESTS, PILLARS } from '../lib/quests';
import { getRankLabel, getRankIndex } from '../lib/systems';

export default function StatsScreen() {
  const { totalXp, history, mastery, streaks, customQuests, resetGame } = useGame();

  const mono = { fontFamily: "'JetBrains Mono', monospace" };

  const questsDone = Object.values(history || {}).reduce((sum, count) => sum + count, 0);
  const bestStreak = Math.max(0, ...Object.values(streaks || {}).map((s) => s.c || 0));
  const daysPlayed = Object.keys(history || {}).length;

  const handleReset = () => {
    if (window.confirm('Reset ALL game data? This cannot be undone.')) {
      if (window.confirm('Are you really sure? Everything will be lost.')) {
        resetGame();
      }
    }
  };

  const statCards = [
    { label: 'Total XP', value: totalXp || 0, color: '#818cf8' },
    { label: 'Quests Done', value: questsDone, color: '#10b981' },
    { label: 'Best Streak', value: bestStreak, color: '#eab308' },
    { label: 'Days Played', value: daysPlayed, color: 'var(--text-main)' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
        color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 14,
      }}>
        Stats
      </div>

      {/* 2x2 stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {statCards.map((sc) => (
          <div key={sc.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: 14, textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>
              {sc.label}
            </div>
            <div style={{ ...mono, fontSize: 22, fontWeight: 700, color: sc.color }}>
              {sc.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Mastery Lines */}
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
        color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10,
      }}>
        Mastery Lines
      </div>

      {MAIN_QUESTS.map((mq) => {
        const comp = mastery[mq.id] || 0;
        const rankIdx = getRankIndex(comp);
        const streak = streaks[mq.id]?.c || 0;
        const pc = PILLARS[mq.p];
        const customs = (customQuests[mq.id] || []).length;

        return (
          <div key={mq.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8,
          }}>
            <span style={{ fontSize: 18 }}>{mq.ic}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                {mq.nm}
              </div>
              <div style={{ ...mono, fontSize: 11, color: pc?.color || 'var(--text-dim)', marginTop: 2 }}>
                {getRankLabel(rankIdx)} • {comp} completions
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              {streak > 0 && (
                <span style={{ ...mono, fontSize: 11, color: '#eab308' }}>🔥 {streak}</span>
              )}
              {customs > 0 && (
                <span style={{ ...mono, fontSize: 10, color: 'var(--text-dim)' }}>+{customs} custom</span>
              )}
            </div>
          </div>
        );
      })}

      {/* Reset */}
      <div style={{ marginTop: 30, textAlign: 'center' }}>
        <button
          onClick={handleReset}
          style={{
            fontSize: 12, fontWeight: 600, padding: '8px 20px', borderRadius: 8,
            border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)',
            color: '#ef4444', cursor: 'pointer',
          }}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}
