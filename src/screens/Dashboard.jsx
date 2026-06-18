import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { generateDailyQuests } from '../lib/gemini';
import { PILLARS } from '../lib/progression';

// --- Daily Goal Ring Component ---
function GoalRing({ completed, goal = 4 }) {
  const size = 120;
  const strokeWidth = 5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(completed / goal, 1);
  const offset = circumference - progress * circumference;
  const isComplete = completed >= goal;

  return (
    <div className={`goal-ring-container ${isComplete ? 'goal-ring-complete' : ''}`}>
      <svg className="goal-ring-svg" width={size} height={size}>
        <circle className="goal-ring-bg" cx={size / 2} cy={size / 2} r={radius} />
        <circle
          className="goal-ring-fill"
          cx={size / 2} cy={size / 2} r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="goal-ring-center">
        {isComplete ? (
          <>
            <div style={{ fontSize: 24 }} className="animate-pop">🔥</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent)', marginTop: 2 }}>COMPLETE</div>
          </>
        ) : (
          <>
            <div className="mono" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{completed}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>of {goal}</div>
          </>
        )}
      </div>
    </div>
  );
}

// --- Floating XP Toast ---
function XpFloater({ xp, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      zIndex: 1500, pointerEvents: 'none',
      animation: 'floatUp 1.5s ease-out forwards',
    }}>
      <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', textShadow: '0 0 20px rgba(16,185,129,0.5)' }}>
        +{xp} XP
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile, settings, dailyQuests, questArcs, sideQuests, recentLog, rank, requiredXp, completeDaily, uncompleteDaily, addDailyQuestsBatch, autoGenerating } = useGame();
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [xpFloat, setXpFloat] = useState(null);
  const [justCompleted, setJustCompleted] = useState(null);

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

  const handleComplete = useCallback(async (questId) => {
    const quest = dailyQuests.find(q => q.id === questId);
    if (!quest) return;

    setJustCompleted(questId);
    setTimeout(() => setJustCompleted(null), 600);

    // Show floating XP
    setXpFloat(quest.xpReward || 20);
    setTimeout(() => setXpFloat(null), 1500);

    await completeDaily(questId);
  }, [dailyQuests, completeDaily]);

  const completedToday = dailyQuests.filter(q => q.status === 'completed').length;
  const totalToday = dailyQuests.length;
  const activeQuests = dailyQuests.filter(q => q.status !== 'completed');
  const completedQuests = dailyQuests.filter(q => q.status === 'completed');

  return (
    <div className="animate-in">
      {/* Floating XP */}
      {xpFloat && <XpFloater xp={xpFloat} onDone={() => setXpFloat(null)} />}

      {/* Hero Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 32 }}>
        {/* Goal Ring */}
        <GoalRing completed={completedToday} goal={4} />

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{dateStr}</div>
          <h1 style={{ marginBottom: 12 }}>Level {profile?.level || 1} · {rank}</h1>

          {/* XP Bar */}
          <div style={{ maxWidth: 400 }}>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }} className="mono">
                {profile?.xp || 0} / {requiredXp} XP
              </div>
              {(profile?.currentStreak || 0) > 0 && (
                <div style={{ fontSize: 12, color: 'var(--color-wealth)', fontWeight: 600 }}>
                  🔥 {profile.currentStreak} day streak
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Quests */}
      <div style={{ marginBottom: 40 }}>
        <div className="section-header">
          <div className="section-title">
            Today's Quests
            {totalToday > 0 && (
              completedToday >= 4
                ? <span style={{ color: 'var(--accent)', fontWeight: 'normal', fontSize: 13, marginLeft: 8 }}>Daily Goal Completed 🔥</span>
                : <span style={{ fontWeight: 'normal', fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>({completedToday}/4)</span>
            )}
          </div>
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
            {autoGenerating ? (
              <>
                <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--text-secondary)' }}>The Architect is preparing today's quests...</p>
              </>
            ) : (
              <>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>No quests for today yet.</p>
                <button className="btn-done" onClick={handleGenerateDaily} disabled={generating} style={{ padding: '10px 24px', fontSize: 14 }}>
                  {generating ? 'Generating...' : 'Generate Daily Quests'}
                </button>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeQuests.map((q, i) => (
              <div
                key={q.id}
                className={`quest-card quest-${q.pillar} animate-slide-up stagger-${Math.min(i + 1, 8)} ${justCompleted === q.id ? 'quest-completed' : ''}`}
              >
                <div style={{ flex: 1 }}>
                  <div className="quest-title" style={{ fontSize: 14, fontWeight: 600 }}>{q.title}</div>
                  {q.desc && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{q.desc}</div>}
                </div>
                <span className={`badge badge-${q.pillar}`}>{q.pillar}</span>
                <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 44, textAlign: 'right' }}>+{q.xpReward || 20}</span>
                <button className="btn-done" onClick={() => handleComplete(q.id)}>Done</button>
              </div>
            ))}

            {completedToday > 0 && (
              <details style={{ marginTop: 16 }}>
                <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', padding: '8px 0', userSelect: 'none' }}>
                  Show completed ({completedToday})
                </summary>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {completedQuests.map(q => (
                    <div key={q.id} className="quest-card quest-completed" style={{ cursor: 'default' }}>
                      <div className="check-burst" style={{ flexShrink: 0 }}>✓</div>
                      <div style={{ flex: 1 }}>
                        <div className="quest-title" style={{ fontSize: 14, fontWeight: 600 }}>{q.title}</div>
                        {q.desc && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{q.desc}</div>}
                      </div>
                      <span className={`badge badge-${q.pillar}`}>{q.pillar}</span>
                      <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 44, textAlign: 'right' }}>+{q.xpReward || 20}</span>
                      <button className="btn btn-sm" onClick={() => uncompleteDaily(q.id)} style={{ fontSize: 11 }}>Undo</button>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {/* Active Story Arcs */}
      {activeArcs.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="section-header">
            <div className="section-title">Active Story Arcs</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {activeArcs.map((arc, i) => {
              const doneSteps = arc.steps?.filter(s => s.done).length || 0;
              const totalSteps = arc.steps?.length || 1;
              const pct = (doneSteps / totalSteps) * 100;
              const pillar = PILLARS[arc.pillar] || {};
              return (
                <div key={arc.id} className={`card animate-slide-up stagger-${Math.min(i + 1, 8)}`} style={{ padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{arc.title}</span>
                    <span className={`badge badge-${arc.pillar}`}>{arc.pillar}</span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: 6, height: 5 }}>
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
