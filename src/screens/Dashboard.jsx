import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { generateDailyQuests } from '../lib/gemini';
import { PILLARS } from '../lib/progression';

export default function Dashboard() {
  const { profile, settings, dailyQuests, questArcs, sideQuests, recentLog, rank, requiredXp, completeDaily, addDailyQuestsBatch } = useGame();
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const xpPct = profile ? (profile.xp / requiredXp) * 100 : 0;

  const activeArcs = questArcs.filter(a => a.status === 'active');

  const handleGenerateDaily = async () => {
    setGenerating(true);
    setGenError('');
    try {
      const quests = await generateDailyQuests(settings.geminiKey, {
        activeArcs,
        activeSideQuests: sideQuests.filter(q => q.status === 'active'),
        recentCompletions: recentLog.filter(l => {
          const d = new Date(l.completedAt);
          const week = new Date(); week.setDate(week.getDate() - 7);
          return d > week;
        }),
        profile,
      });
      await addDailyQuestsBatch(quests);
    } catch (err) {
      setGenError(err.message);
    }
    setGenerating(false);
  };

  const completedToday = dailyQuests.filter(q => q.status === 'completed').length;
  const totalToday = dailyQuests.length;

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{dateStr}</div>
        <h1>Level {profile?.level || 1} · {rank}</h1>
      </div>

      {/* XP Bar */}
      <div style={{ marginBottom: 32 }}>
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }} className="mono">
          {profile?.xp || 0} / {requiredXp} XP
        </div>
      </div>

      {/* Today's Quests */}
      <div style={{ marginBottom: 40 }}>
        <div className="section-header">
          <div className="section-title">Today's Quests {totalToday > 0 && `(${completedToday}/${totalToday})`}</div>
          {totalToday > 0 && (
            <button className="btn btn-sm" onClick={handleGenerateDaily} disabled={generating}>
              {generating ? 'Generating...' : '+ More'}
            </button>
          )}
        </div>

        {genError && (
          <div style={{ color: 'var(--color-health)', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>{genError}</div>
        )}

        {totalToday === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>No quests for today yet.</p>
            <button className="btn btn-primary" onClick={handleGenerateDaily} disabled={generating}>
              {generating ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Generating...</> : 'Generate Daily Quests'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dailyQuests.map(q => {
              const done = q.status === 'completed';
              const pillar = PILLARS[q.pillar] || {};
              return (
                <div key={q.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, opacity: done ? 0.5 : 1 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, textDecoration: done ? 'line-through' : 'none' }}>{q.title}</div>
                    {q.desc && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{q.desc}</div>}
                  </div>
                  <span className={`badge badge-${q.pillar}`}>{q.pillar}</span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 44, textAlign: 'right' }}>+{q.xpReward || 20}</span>
                  {!done ? (
                    <button className="btn btn-primary btn-sm" onClick={() => completeDaily(q.id)}>Done</button>
                  ) : (
                    <span style={{ color: 'var(--accent)', fontSize: 16 }}>✓</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Story Arcs */}
      {activeArcs.length > 0 && (
        <div>
          <div className="section-header">
            <div className="section-title">Active Story Arcs</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {activeArcs.map(arc => {
              const doneSteps = arc.steps?.filter(s => s.done).length || 0;
              const totalSteps = arc.steps?.length || 1;
              const pct = (doneSteps / totalSteps) * 100;
              const pillar = PILLARS[arc.pillar] || {};
              return (
                <div key={arc.id} className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{arc.title}</span>
                    <span className={`badge badge-${arc.pillar}`}>{arc.pillar}</span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: 6 }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pillar.color || 'var(--accent)' }} />
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{doneSteps} / {totalSteps} steps</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
