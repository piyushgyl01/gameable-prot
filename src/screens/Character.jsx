import React from 'react';
import { useGame } from '../context/GameContext';
import { PILLARS } from '../lib/progression';
import { ACHIEVEMENTS, SKILL_TREES } from '../lib/systems';

const RANKS = [
  { minLevel: 1, title: 'Wanderer' },
  { minLevel: 5, title: 'Seeker' },
  { minLevel: 10, title: 'Adventurer' },
  { minLevel: 15, title: 'Pathfinder' },
  { minLevel: 20, title: 'Vanguard' },
  { minLevel: 30, title: 'Champion' },
  { minLevel: 40, title: 'Warden' },
  { minLevel: 50, title: 'Legend' },
  { minLevel: 75, title: 'Mythic' },
  { minLevel: 100, title: 'Transcendent' },
];

const STAT_KEYS = { health: 'healthStat', wealth: 'wealthStat', relationships: 'relationshipsStat' };

export default function Character() {
  const { profile, rank, requiredXp, recentLog, unlockedAchievements } = useGame();

  if (!profile) return null;

  const xpPct = (profile.xp / requiredXp) * 100;
  const initials = (profile.name || 'U').charAt(0).toUpperCase();

  const dailyDone = recentLog.filter(l => l.questType === 'daily').length;
  const storyDone = recentLog.filter(l => l.questType === 'story').length;
  const sideDone = recentLog.filter(l => l.questType === 'side').length;

  const stats = [
    { key: 'health', val: profile.healthStat || 0, ...PILLARS.health },
    { key: 'wealth', val: profile.wealthStat || 0, ...PILLARS.wealth },
    { key: 'relationships', val: profile.relationshipsStat || 0, ...PILLARS.relationships },
  ];

  return (
    <div className="animate-in">
      <h1 style={{ marginBottom: 32 }}>Character</h1>

      {/* Character Card */}
      <div className="card" style={{ padding: 32, textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 36, background: 'var(--bg-hover)', border: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800,
          margin: '0 auto 16px', color: 'var(--accent)',
        }}>
          {initials}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{profile.name}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{rank}</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Level {profile.level}</div>
        <div style={{ maxWidth: 300, margin: '0 auto' }}>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            {profile.xp} / {requiredXp} XP
          </div>
        </div>
        {(profile.currentStreak || 0) > 0 && (
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--color-wealth)' }}>
            🔥 {profile.currentStreak} day streak · Best: {profile.longestStreak || 0}
          </div>
        )}
      </div>

      {/* Core Pillars */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Core Pillars</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {stats.map(s => (
            <div key={s.key} className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: s.color, marginBottom: 4 }}>{s.label}</div>
              <div className="mono" style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div className="progress-bar" style={{ marginTop: 12 }}>
                <div className="progress-bar-fill" style={{ width: `${Math.min(100, s.val * 2.5)}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Trees */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Skill Trees</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {Object.entries(SKILL_TREES).map(([pillarKey, tree]) => {
            const statVal = profile[STAT_KEYS[pillarKey]] || 0;
            return (
              <div key={pillarKey} className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: tree.color, marginBottom: 16 }}>{tree.label}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {tree.nodes.map(node => {
                    const unlocked = statVal >= node.reqStat;
                    return (
                      <div key={node.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        opacity: unlocked ? 1 : 0.35,
                      }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: unlocked ? tree.color : 'var(--bg-base)',
                          border: `2px solid ${unlocked ? tree.color : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, color: unlocked ? '#fff' : 'var(--text-muted)',
                          fontWeight: 700, flexShrink: 0,
                        }}>
                          {unlocked ? '✓' : node.reqStat}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{node.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{node.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>
          Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {ACHIEVEMENTS.map(ach => {
            const unlocked = unlockedAchievements.includes(ach.id);
            return (
              <div key={ach.id} className="card" style={{
                padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
                opacity: unlocked ? 1 : 0.3,
              }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{ach.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{ach.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ach.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quest Stats */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Quest Stats</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Total', val: recentLog.length },
            { label: 'Story Steps', val: storyDone },
            { label: 'Side Quests', val: sideDone },
            { label: 'Dailies', val: dailyDone },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 16, textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rank Progression */}
      <div>
        <div className="section-title" style={{ marginBottom: 12 }}>Rank Progression</div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {RANKS.map((r, i) => {
              const achieved = profile.level >= r.minLevel;
              const isCurrent = rank === r.title;
              return (
                <div key={i} style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  background: isCurrent ? 'var(--accent-dim)' : achieved ? 'var(--bg-hover)' : 'var(--bg-base)',
                  color: isCurrent ? 'var(--accent)' : achieved ? 'var(--text-secondary)' : 'var(--text-muted)',
                  border: isCurrent ? '1px solid var(--accent)' : '1px solid transparent',
                }}>
                  {r.title} <span className="mono" style={{ opacity: 0.5 }}>Lv.{r.minLevel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
