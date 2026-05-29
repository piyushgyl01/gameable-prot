import React from 'react';
import { useGame } from '../context/GameContext';

const BOSS_DB = {
  id: 'procrastination_demon',
  name: 'The Procrastination Demon',
  maxHp: 300,
  desc: 'Feeds on your uncompleted tasks. Defeat it by Sunday for massive rewards!',
  img: '👹'
};

export default function BossScreen() {
  const { activeBoss, hp: playerHp } = useGame();
  
  const mono = { fontFamily: "'JetBrains Mono', monospace" };

  if (!activeBoss) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🕊️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>The Realm is Peaceful</div>
        <div style={{ fontSize: 13 }}>No boss is currently attacking. Rest up, a new adversary will arrive on Monday.</div>
      </div>
    );
  }

  const hpPct = Math.max(0, Math.min(100, (activeBoss.hp / activeBoss.maxHp) * 100));

  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
        color: '#ef4444', textTransform: 'uppercase', marginBottom: 14,
      }}>
        Active Adversary
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid #ef4444',
        borderRadius: 12, padding: 20, textAlign: 'center', position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Boss HP Bar BG */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: 'var(--border)'
        }}>
          <div style={{
            height: '100%', width: `${hpPct}%`, background: '#ef4444',
            transition: 'width 0.5s ease'
          }} />
        </div>

        <div style={{ fontSize: 72, margin: '20px 0' }}>{BOSS_DB.img}</div>
        
        <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444', marginBottom: 8 }}>
          {BOSS_DB.name}
        </div>
        
        <div style={{ fontSize: 13, color: 'var(--text-main)', marginBottom: 20 }}>
          {BOSS_DB.desc}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
          <div style={{ background: 'rgba(239,68,68,0.1)', padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)' }}>
            <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Boss HP</div>
            <div style={{ ...mono, fontSize: 18, fontWeight: 800, color: '#ef4444' }}>
              {activeBoss.hp} / {activeBoss.maxHp}
            </div>
          </div>
          <div style={{ background: 'var(--bg)', padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Deadline</div>
            <div style={{ ...mono, fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>
              Sunday
            </div>
          </div>
        </div>
      </div>

      {playerHp < 30 && (
        <div style={{
          marginTop: 20, padding: 14, background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <div style={{ fontSize: 24 }}>☠️</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>Fatigued</div>
            <div style={{ fontSize: 12, color: 'var(--text-main)' }}>
              Your HP is below 30. All XP gained is reduced by 20% until you recover.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
