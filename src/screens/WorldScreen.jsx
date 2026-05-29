import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { xpMultiplier } from '../lib/systems';

export default function WorldScreen() {
  const { worldQuests, setWorldQuests, toggleWorldTask, level } = useGame();
  
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleAddWorld = () => {
    if (!newTitle.trim()) return;
    setWorldQuests(prev => [...prev, {
      id: `w_${Date.now()}`,
      ic: "✨",
      nm: newTitle.trim(),
      tasks: []
    }]);
    setShowAdd(false);
    setNewTitle("");
  };

  const handleAddTask = (worldId) => {
    const tx = prompt("Task name:");
    if (!tx) return;
    setWorldQuests(prev => prev.map(w => {
      if (w.id === worldId) {
        return { ...w, tasks: [...w.tasks, { id: `wt_${Date.now()}`, tx: tx.trim(), dn: false }] };
      }
      return w;
    }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>World</span>
          <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(161, 161, 170, 0.2)', color: '#a1a1aa', background: 'rgba(161, 161, 170, 0.08)' }}>Pure</span>
        </div>
        <button className="btn-ghost" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "Cancel" : "+ New"}
        </button>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0', marginBottom: '16px' }}>
        No accountability. Do them anyway. ~{Math.round(6 * xpMultiplier(level))} XP
      </div>

      {showAdd && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input className="input-base" placeholder="Quest name" value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus />
            <button className="btn-primary" onClick={handleAddWorld}>Create</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
        {worldQuests.map(wq => {
          const done = wq.tasks.filter(t => t.dn).length;
          const pct = wq.tasks.length ? Math.round((done / wq.tasks.length) * 100) : 0;
          
          return (
            <div key={wq.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px' }}>{wq.ic}</span>
                <div style={{ fontSize: '14px', fontWeight: '700', flex: 1 }}>{wq.nm}</div>
              </div>
              
              {wq.tasks.length > 0 && (
                <div style={{ height: '2px', background: 'var(--border)', borderRadius: '1px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ height: '100%', background: 'var(--text-dim)', width: `${pct}%`, transition: 'width 0.4s ease' }} />
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {wq.tasks.map(t => (
                  <div 
                    key={t.id} 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '2px 0', opacity: t.dn ? 0.5 : 1 }}
                    onClick={() => toggleWorldTask(wq.id, t.id)}
                  >
                    <div style={{ 
                      width: '14px', height: '14px', borderRadius: '50%', border: '1px solid var(--border)',
                      background: t.dn ? 'var(--text-dim)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px'
                    }}>
                      {t.dn && "✓"}
                    </div>
                    <div style={{ fontSize: '13px', textDecoration: t.dn ? 'line-through' : 'none', color: 'var(--text-main)' }}>
                      {t.tx}
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                className="btn-ghost" 
                style={{ width: '100%', marginTop: '12px', border: '1px dashed var(--border)' }} 
                onClick={() => handleAddTask(wq.id)}
              >
                + Task
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
