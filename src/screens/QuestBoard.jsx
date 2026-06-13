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
      <div style={{ marginBottom: 32 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Main Quest</div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{profile?.endgame || 'No endgame set'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Current: {profile?.current || '—'}</div>
        </div>
      </div>

      {/* Story Arcs */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Story Arcs</div>
        {questArcs.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No story arcs yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {questArcs.map(arc => {
              const isExpanded = expandedArc === arc.id;
              const doneSteps = arc.steps?.filter(s => s.done).length || 0;
              const totalSteps = arc.steps?.length || 0;
              const allDone = arc.status === 'completed';
              const pillar = PILLARS[arc.pillar] || {};

              return (
                <div key={arc.id} className="card" style={{ overflow: 'hidden' }}>
                  <div
                    style={{ padding: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                    onClick={() => toggleArc(arc.id)}
                  >
                    <span style={{ color: 'var(--text-muted)', fontSize: 12, transition: 'transform 150ms', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{arc.title}</span>
                        <span className={`badge badge-${arc.pillar}`}>{arc.pillar}</span>
                        {allDone && <span className="badge" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>Completed</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{arc.desc}</div>
                    </div>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{doneSteps}/{totalSteps}</div>
                  </div>

                  {isExpanded && arc.steps && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '12px 18px 18px' }}>
                      {arc.steps.map((step, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0',
                            opacity: step.done ? 0.5 : 1
                          }}
                        >
                          <button
                            onClick={() => !step.done && completeArcStep(arc.id, i)}
                            disabled={step.done}
                            style={{
                              width: 18, height: 18, borderRadius: 4, border: `1px solid ${step.done ? 'var(--accent)' : 'var(--border)'}`,
                              background: step.done ? 'var(--accent-dim)' : 'transparent', cursor: step.done ? 'default' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                              color: 'var(--accent)', fontSize: 11, outline: 'none',
                            }}
                          >
                            {step.done && '✓'}
                          </button>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, textDecoration: step.done ? 'line-through' : 'none' }}>{step.title}</div>
                            {step.desc && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{step.desc}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Side Quests */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Side Quests</div>
        {sideQuests.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No side quests yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sideQuests.map(q => {
              const done = q.status === 'completed';
              return (
                <div key={q.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, opacity: done ? 0.5 : 1 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, textDecoration: done ? 'line-through' : 'none' }}>{q.title}</div>
                    {q.desc && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{q.desc}</div>}
                  </div>
                  <span className={`badge badge-${q.pillar}`}>{q.pillar}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.frequency}</span>
                  {!done && <button className="btn btn-sm btn-primary" onClick={() => completeSideQuest(q.id)}>Done</button>}
                  {done && <span style={{ color: 'var(--accent)', fontSize: 14 }}>✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed History */}
      {recentLog.length > 0 && (
        <div>
          <div className="section-title" style={{ marginBottom: 12 }}>Recent Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recentLog.slice(0, 15).map((entry, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span className={`badge badge-${entry.pillar}`}>{entry.pillar}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{entry.questType}</span>
                <span className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>+{entry.xpEarned} XP</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(entry.completedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
