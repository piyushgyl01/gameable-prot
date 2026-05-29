import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { xpMultiplier } from '../lib/systems';

export default function StoryScreen() {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTimeline, setNewTimeline] = useState('');

  const { storyQuests, setStoryQuests, toggleStoryTask, level } = useGame();

  const mono = { fontFamily: "'JetBrains Mono', monospace" };

  const handleAddChapter = () => {
    if (!newTitle.trim()) return;
    setStoryQuests((prev) => [...prev, {
      id: 's_' + Date.now(),
      ic: '📖',
      nm: newTitle.trim(),
      ds: newDesc.trim(),
      tm: newTimeline.trim() || 'TBD',
      xp: 50,
      tasks: [],
    }]);
    setNewTitle('');
    setNewDesc('');
    setNewTimeline('');
    setShowAdd(false);
  };

  const handleAddTask = (chapterId) => {
    const name = prompt('Task name:');
    if (!name?.trim()) return;
    setStoryQuests((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? { ...ch, tasks: [...ch.tasks, { id: 'st_' + Date.now(), tx: name.trim(), dn: false }] }
          : ch
      )
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
          color: 'var(--text-dim)', textTransform: 'uppercase',
        }}>
          Story
        </span>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
          background: 'rgba(129,140,248,0.1)', color: '#818cf8',
        }}>
          Chapters
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-dim)', cursor: 'pointer',
          }}
        >
          {showAdd ? 'Cancel' : '+ New Chapter'}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 14, marginBottom: 12,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <input
            value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Chapter title" autoFocus
            style={{
              fontSize: 13, padding: '6px 10px', borderRadius: 6,
              border: '1px solid var(--border)', background: 'var(--bg)',
              color: 'var(--text-main)', outline: 'none', fontFamily: 'var(--font)',
            }}
          />
          <input
            value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description"
            style={{
              fontSize: 13, padding: '6px 10px', borderRadius: 6,
              border: '1px solid var(--border)', background: 'var(--bg)',
              color: 'var(--text-main)', outline: 'none', fontFamily: 'var(--font)',
            }}
          />
          <input
            value={newTimeline} onChange={(e) => setNewTimeline(e.target.value)}
            placeholder="Timeline (e.g. Jan-May 26)"
            style={{
              fontSize: 13, padding: '6px 10px', borderRadius: 6,
              border: '1px solid var(--border)', background: 'var(--bg)',
              color: 'var(--text-main)', outline: 'none', fontFamily: 'var(--font)',
            }}
          />
          <button
            onClick={handleAddChapter}
            style={{
              fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8,
              background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.3)',
              color: '#818cf8', cursor: 'pointer', alignSelf: 'flex-start',
            }}
          >
            Create
          </button>
        </div>
      )}

      {/* Chapters */}
      {storyQuests.map((ch) => {
        const done = ch.tasks.filter((t) => t.dn).length;
        const total = ch.tasks.length;
        const progress = total > 0 ? (done / total) * 100 : 0;
        const xpEarned = Math.round(ch.xp * xpMultiplier(level));

        return (
          <div key={ch.id} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, marginBottom: 10, overflow: 'hidden',
          }}>
            <div style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>{ch.ic}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', flex: 1 }}>
                  {ch.nm}
                </span>
                {ch.tm && (
                  <span style={{
                    ...mono, fontSize: 10, color: 'var(--text-dim)',
                    padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)',
                  }}>
                    {ch.tm}
                  </span>
                )}
              </div>
              {ch.ds && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {ch.ds}
                </div>
              )}

              {/* Progress bar */}
              <div style={{ height: 3, borderRadius: 2, background: 'var(--border)', marginBottom: 10 }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  width: progress + '%',
                  background: '#818cf8', transition: 'width 0.3s ease',
                }} />
              </div>

              {/* Task checklist */}
              {ch.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleStoryTask(ch.id, task.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 0', cursor: 'pointer', userSelect: 'none',
                  }}
                >
                  <span style={{
                    width: 16, height: 16, borderRadius: 4,
                    border: task.dn ? '2px solid #818cf8' : '2px solid var(--border)',
                    background: task.dn ? 'rgba(129,140,248,0.2)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: '#818cf8', flexShrink: 0,
                  }}>
                    {task.dn ? '✓' : ''}
                  </span>
                  <span style={{
                    fontSize: 13,
                    color: task.dn ? 'var(--text-dim)' : 'var(--text-main)',
                    textDecoration: task.dn ? 'line-through' : 'none',
                  }}>
                    {task.tx}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderTop: '1px solid var(--border)',
            }}>
              <span style={{ ...mono, fontSize: 11, color: 'var(--text-dim)' }}>
                {done}/{total}
              </span>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => handleAddTask(ch.id)}
                style={{
                  fontSize: 11, color: 'var(--text-dim)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                }}
              >
                + Task
              </button>
              <span style={{ ...mono, fontSize: 11, color: '#818cf8' }}>
                +{xpEarned} xp/task
              </span>
            </div>
          </div>
        );
      })}

      {storyQuests.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)', fontSize: 14 }}>
          No chapters yet. Create one to start your story.
        </div>
      )}
    </div>
  );
}
