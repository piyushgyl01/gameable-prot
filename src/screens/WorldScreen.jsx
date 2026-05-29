import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { xpMultiplier } from '../lib/systems';

export default function WorldScreen() {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const { worldQuests, setWorldQuests, toggleWorldTask, level } = useGame();

  const xpPer = Math.round(6 * xpMultiplier(level));
  const mono = { fontFamily: "'JetBrains Mono', monospace" };

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    setWorldQuests((prev) => [...prev, {
      id: 'w_' + Date.now(),
      ic: '🌍',
      nm: newTitle.trim(),
      tasks: [],
    }]);
    setNewTitle('');
    setShowAdd(false);
  };

  const handleAddTask = (questId) => {
    const name = prompt('Task name:');
    if (!name?.trim()) return;
    setWorldQuests((prev) =>
      prev.map((wq) =>
        wq.id === questId
          ? { ...wq, tasks: [...wq.tasks, { id: 'wt_' + Date.now(), tx: name.trim(), dn: false }] }
          : wq
      )
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
          color: 'var(--text-dim)', textTransform: 'uppercase',
        }}>
          World
        </span>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
          background: 'rgba(16,185,129,0.1)', color: '#10b981',
        }}>
          Pure
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
          {showAdd ? 'Cancel' : '+ New'}
        </button>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>
        No accountability. Do them anyway. ~{xpPer} XP
      </div>

      {showAdd && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          <input
            value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Quest name" autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            style={{
              flex: 1, fontSize: 13, padding: '6px 10px', borderRadius: 6,
              border: '1px solid var(--border)', background: 'var(--bg)',
              color: 'var(--text-main)', outline: 'none', fontFamily: 'var(--font)',
            }}
          />
          <button
            onClick={handleAdd}
            style={{
              fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8,
              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
              color: '#10b981', cursor: 'pointer',
            }}
          >
            Add
          </button>
        </div>
      )}

      {/* 2-column grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10,
      }}>
        {worldQuests.map((wq) => {
          const done = wq.tasks.filter((t) => t.dn).length;
          const total = wq.tasks.length;
          const progress = total > 0 ? (done / total) * 100 : 0;

          return (
            <div key={wq.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, padding: 12, display: 'flex',
              flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>{wq.ic}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', flex: 1 }}>
                  {wq.nm}
                </span>
              </div>

              {total > 0 && (
                <div style={{ height: 3, borderRadius: 2, background: 'var(--border)' }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    width: progress + '%',
                    background: '#10b981', transition: 'width 0.3s ease',
                  }} />
                </div>
              )}

              {wq.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleWorldTask(wq.id, task.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    cursor: 'pointer', userSelect: 'none',
                  }}
                >
                  <span style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: task.dn ? '2px solid #10b981' : '2px solid var(--border)',
                    background: task.dn ? 'rgba(16,185,129,0.2)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, color: '#10b981', flexShrink: 0,
                  }}>
                    {task.dn ? '●' : ''}
                  </span>
                  <span style={{
                    fontSize: 12,
                    color: task.dn ? 'var(--text-dim)' : 'var(--text-main)',
                    textDecoration: task.dn ? 'line-through' : 'none',
                  }}>
                    {task.tx}
                  </span>
                </div>
              ))}

              <button
                onClick={() => handleAddTask(wq.id)}
                style={{
                  fontSize: 11, color: 'var(--text-dim)',
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', textAlign: 'left', padding: 0,
                }}
              >
                + Task
              </button>
            </div>
          );
        })}
      </div>

      {worldQuests.length === 0 && !showAdd && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)', fontSize: 14 }}>
          No world quests yet. Add one — no pressure.
        </div>
      )}
    </div>
  );
}
