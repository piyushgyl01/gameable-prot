import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PILLARS } from '../lib/progression';

export default function QuestBoard() {
  const { profile, questArcs, sideQuests, recentLog, completeArcStep, completeSideQuest } = useGame();
  const [expandedArc, setExpandedArc] = useState(null);

  const toggleArc = (id) => setExpandedArc(prev => prev === id ? null : id);

  return (
    <div className="animate-in">
      <h1 style={{ marginBottom: 32 }}>Quest Board</h1>

      {/* Main Quest */}
      <div style={{ marginBottom: 32 }} className="animate-slide-up stagger-1">
        <div className="section-title" style={{ marginBottom: 12 }}>Your Endgame</div>
        <div className="main-quest-card">
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, lineHeight: 1.3 }}>
            {profile?.endgame || 'No endgame set'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Current: {profile?.current || '—'}
          </div>
        </div>
      </div>

      {/* Story Arcs */}
      <div style={{ marginBottom: 32 }} className="animate-slide-up stagger-2">
        <div className="section-title" style={{ marginBottom: 12 }}>Story Arcs</div>
        {questArcs.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No story arcs yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {questArcs.map((arc, idx) => {
              const isExpanded = expandedArc === arc.id;
              const doneSteps = arc.steps?.filter(s => s.done).length || 0;
              const totalSteps = arc.steps?.length || 0;
              const pct = totalSteps > 0 ? (doneSteps / totalSteps) * 100 : 0;
              const allDone = arc.status === 'completed';
              const pillar = PILLARS[arc.pillar] || {};

              return (
                <div key={arc.id} className={`card animate-slide-up stagger-${Math.min(idx + 1, 8)}`} style={{ overflow: 'hidden' }}>
                  {/* Header */}
                  <div
                    style={{ padding: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                    onClick={() => toggleArc(arc.id)}
                  >
                    <span style={{
                      color: 'var(--text-muted)', fontSize: 12,
                      transition: 'transform 200ms ease',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      display: 'inline-block',
                    }}>▶</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{arc.title}</span>
                        <span className={`badge badge-${arc.pillar}`}>{arc.pillar}</span>
                        {allDone && <span className="badge" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>Completed</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{arc.desc}</div>
                      {/* Mini progress bar */}
                      <div className="progress-bar" style={{ marginTop: 8, height: 3 }}>
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pillar.color || 'var(--accent)' }} />
                      </div>
                    </div>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{doneSteps}/{totalSteps}</div>
                  </div>

                  {/* Expanded Steps — Timeline */}
                  <div style={{
                    maxHeight: isExpanded ? '1000px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}>
                    {arc.steps && (
                      <div style={{ borderTop: '1px solid var(--border)', padding: '16px 18px 18px' }}>
                        <div className="timeline">
                          {arc.steps.map((step, i) => (
                            <div key={i} className="timeline-item">
                              <div className={`timeline-dot ${step.done ? 'done' : ''}`} />
                              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{
                                    fontSize: 13, fontWeight: 500,
                                    textDecoration: step.done ? 'line-through' : 'none',
                                    opacity: step.done ? 0.5 : 1,
                                  }}>{step.title}</div>
                                  {step.desc && (
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, opacity: step.done ? 0.5 : 1 }}>
                                      {step.desc}
                                    </div>
                                  )}
                                </div>
                                {!step.done && (
                                  <button
                                    className="btn-done"
                                    onClick={(e) => { e.stopPropagation(); completeArcStep(arc.id, i); }}
                                    style={{ fontSize: 11, padding: '3px 10px' }}
                                  >
                                    Complete
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Side Quests */}
      <div style={{ marginBottom: 32 }} className="animate-slide-up stagger-3">
        <div className="section-title" style={{ marginBottom: 12 }}>Side Quests</div>
        {sideQuests.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No side quests yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sideQuests.map((q, i) => {
              const done = q.status === 'completed';
              return (
                <div
                  key={q.id}
                  className={`quest-card quest-${q.pillar} ${done ? 'quest-completed' : ''} animate-slide-up stagger-${Math.min(i + 1, 8)}`}
                >
                  <div style={{ flex: 1 }}>
                    <div className="quest-title" style={{ fontSize: 14, fontWeight: 600 }}>{q.title}</div>
                    {q.desc && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{q.desc}</div>}
                  </div>
                  <span className={`badge badge-${q.pillar}`}>{q.pillar}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{q.frequency}</span>
                  {!done && <button className="btn-done" onClick={() => completeSideQuest(q.id)}>Done</button>}
                  {done && <div className="check-burst" style={{ animation: 'none', width: 24, height: 24, fontSize: 12 }}>✓</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {recentLog.length > 0 && (
        <div className="animate-slide-up stagger-4">
          <div className="section-title" style={{ marginBottom: 12 }}>Recent Activity</div>
          <div className="card" style={{ padding: '4px 0', overflow: 'hidden' }}>
            {recentLog.slice(0, 15).map((entry, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 18px',
                  borderBottom: i < Math.min(recentLog.length, 15) - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <span className={`badge badge-${entry.pillar}`}>{entry.pillar}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1, textTransform: 'capitalize' }}>{entry.questType}</span>
                <span className="mono" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>+{entry.xpEarned} XP</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(entry.completedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
