import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function Dashboard() {
  const { profile, quests, completeQuest, getRequiredXp, resetProgress } = useGame();
  const [activeTab, setActiveTab] = useState('main'); // main, story, side

  const reqXp = getRequiredXp(profile.level);
  const xpPct = (profile.xp / reqXp) * 100;

  const filteredQuests = quests.filter(q => q.type === activeTab);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* Sidebar Navigation */}
      <div style={{
        width: 300, background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)',
        padding: 24, display: 'flex', flexDirection: 'column'
      }}>
        {/* Character Profile */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 40, background: 'var(--bg-main)',
            border: '2px solid var(--border-color)', margin: '0 auto 16px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 32,
          }}>
            👤
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            Level {profile.level}
          </div>
          
          {/* XP Bar */}
          <div style={{ background: 'var(--bg-main)', height: 6, borderRadius: 3, overflow: 'hidden', position: 'relative', marginBottom: 8, marginTop: 12 }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, height: '100%', width: `${xpPct}%`,
              background: 'var(--accent-primary)', transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: 'var(--text-muted)' }}>
            {profile.xp} / {reqXp} XP
          </div>
        </div>

        {/* Stats Radar (Simplified bars for now) */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Core Pillars
          </div>
          {[
            { label: 'Health', val: profile.stats.health, color: 'var(--color-health)' },
            { label: 'Wealth', val: profile.stats.wealth, color: 'var(--color-wealth)' },
            { label: 'Relationships', val: profile.stats.relationships, color: 'var(--color-relations)' },
          ].map(stat => (
            <div key={stat.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{stat.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: stat.color }}>{stat.val}</span>
              </div>
              <div style={{ background: 'var(--bg-main)', height: 4, borderRadius: 2 }}>
                <div style={{ background: stat.color, width: `${Math.min(100, stat.val * 5)}%`, height: '100%', borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
          {[
            { id: 'main', label: 'Main Quests' },
            { id: 'story', label: 'Story Arcs' },
            { id: 'side', label: 'Side Quests' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: activeTab === t.id ? 'var(--bg-card-hover)' : 'transparent',
                border: `1px solid ${activeTab === t.id ? 'var(--border-focus)' : 'transparent'}`,
                padding: '10px 16px', borderRadius: 8, color: activeTab === t.id ? '#fff' : 'var(--text-dim)',
                display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 600,
                textAlign: 'left', outline: 'none', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        
        <button className="btn" style={{ marginTop: 24, fontSize: 12, color: 'var(--color-health)' }} onClick={resetProgress}>
          Reset Progress
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Ultimate Endgame
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)' }}>
            {profile.endgame}
          </div>
        </div>

        {/* Quest List */}
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textTransform: 'capitalize', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 12 }}>
            {activeTab} Quests
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 10 }}>
              {filteredQuests.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredQuests.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, padding: 40, background: 'var(--bg-card)', borderRadius: 12, border: '1px dashed var(--border-color)' }}>
                No {activeTab} quests generated.
              </div>
            ) : (
              filteredQuests.map(q => {
                const isCompleted = q.status === 'completed';
                return (
                  <div key={q.id} className="card" style={{
                    padding: 24, display: 'flex', alignItems: 'flex-start', gap: 20,
                    opacity: isCompleted ? 0.6 : 1
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, textDecoration: isCompleted ? 'line-through' : 'none' }}>
                          {q.title}
                        </div>
                        <div className={`badge badge-${q.pillar}`}>{q.pillar}</div>
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                        {q.desc}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        +{q.type === 'main' ? 100 : q.type === 'story' ? 50 : 20} XP
                      </div>
                      {!isCompleted ? (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '6px 16px', fontSize: 13 }}
                          onClick={() => completeQuest(q.id)}
                        >
                          Complete
                        </button>
                      ) : (
                        <div style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: 13, padding: '6px 16px', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)' }}>
                          Completed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
