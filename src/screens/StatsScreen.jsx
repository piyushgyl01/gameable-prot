import React from 'react';
import { useGame } from '../context/GameContext';
import { MAIN_QUESTS, PILLARS } from '../lib/quests';
import { getRankLabel, getRankIndex } from '../lib/systems';

export default function StatsScreen() {
  const { totalXp, history, mastery, streaks, customQuests, resetGame } = useGame();
  
  const daysPlayed = Object.keys(history).length;
  const totalCompleted = Object.values(history).reduce((sum, count) => sum + count, 0);
  
  const bestStreak = Math.max(0, ...Object.values(streaks).map(s => s.c));

  const handleReset = () => {
    if (confirm("Are you sure? This will wipe all your progress permanently.")) {
      if (confirm("Absolutely sure?")) {
        resetGame();
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Stats</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: '28px', fontWeight: '700', color: 'var(--accent-mastery)', marginBottom: '4px' }}>{totalXp}</div>
          <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total XP</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: '28px', fontWeight: '700', color: 'var(--accent-vitality)', marginBottom: '4px' }}>{totalCompleted}</div>
          <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Quests Done</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: '28px', fontWeight: '700', color: '#eab308', marginBottom: '4px' }}>{bestStreak}</div>
          <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Best Streak</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>{daysPlayed}</div>
          <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Days Played</div>
        </div>
      </div>

      <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Mastery Lines</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '40px' }}>
        {MAIN_QUESTS.map(mq => {
          const comp = mastery[mq.id] || 0;
          const rk = getRankIndex(comp);
          const st = streaks[mq.id]?.c || 0;
          const cust = customQuests[mq.id]?.length || 0;
          
          return (
            <div key={mq.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>{mq.ic}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '700' }}>{mq.nm}</div>
                <div className="mono text-xs text-muted" style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: PILLARS[mq.p].c }}>Rk {getRankLabel(rk)}</span>
                  <span>{comp} done</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {st > 0 && <span className="mono text-xs" style={{ color: '#eab308' }}>🔥{st}</span>}
                {cust > 0 && <span className="mono text-xs text-muted">+{cust} cust</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <button 
          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '10px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
          onClick={handleReset}
        >
          Reset All Data
        </button>
      </div>
    </div>
  );
}
