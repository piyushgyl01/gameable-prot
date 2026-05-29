import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { xpMultiplier } from '../lib/systems';

export default function StoryScreen() {
  const { storyQuests, setStoryQuests, toggleStoryTask, level } = useGame();
  
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTimeline, setNewTimeline] = useState("");

  const handleAddChapter = () => {
    if (!newTitle.trim()) return;
    setStoryQuests(prev => [...prev, {
      id: `s_${Date.now()}`,
      ic: "📌",
      nm: newTitle.trim(),
      ds: newDesc.trim() || "Chapter.",
      tm: newTimeline.trim() || "TBD",
      xp: 50,
      tasks: []
    }]);
    setShowAdd(false);
    setNewTitle("");
    setNewDesc("");
    setNewTimeline("");
  };

  const handleAddTask = (chapterId) => {
    const tx = prompt("Task name:");
    if (!tx) return;
    setStoryQuests(prev => prev.map(ch => {
      if (ch.id === chapterId) {
        return { ...ch, tasks: [...ch.tasks, { id: `st_${Date.now()}`, tx: tx.trim(), dn: false }] };
      }
      return ch;
    }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Story</span>
          <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(96, 165, 250, 0.2)', color: '#60a5fa', background: 'rgba(96, 165, 250, 0.08)' }}>Chapters</span>
        </div>
        <button className="btn-ghost" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "Cancel" : "+ New Chapter"}
        </button>
      </div>

      {showAdd && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input className="input-base" placeholder="Chapter Name" value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus />
            <input className="input-base" placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            <input className="input-base" placeholder="Timeline (e.g. 2025+)" value={newTimeline} onChange={e => setNewTimeline(e.target.value)} />
            <button className="btn-primary" style={{ marginTop: '4px' }} onClick={handleAddChapter}>Create Chapter</button>
          </div>
        </div>
      )}

      <div>
        {storyQuests.map(sq => {
          const done = sq.tasks.filter(t => t.dn).length;
          const pct = sq.tasks.length ? Math.round((done / sq.tasks.length) * 100) : 0;
          const xpEarned = Math.round(sq.xp * xpMultiplier(level));
          
          return (
            <div key={sq.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>{sq.ic}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '800' }}>{sq.nm}</div>
                  <div className="mono text-xs text-muted">{sq.tm}</div>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.5' }}>
                {sq.ds}
              </div>
              
              {sq.tasks.length > 0 && (
                <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg, #4338ca, #818cf8)', width: `${pct}%`, transition: 'width 0.4s ease' }} />
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sq.tasks.map(t => (
                  <div 
                    key={t.id} 
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '4px 0', opacity: t.dn ? 0.6 : 1 }}
                    onClick={() => toggleStoryTask(sq.id, t.id)}
                  >
                    <div style={{ 
                      width: '18px', height: '18px', borderRadius: '4px', border: '1px solid var(--border)',
                      background: t.dn ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      borderColor: t.dn ? 'rgba(16, 185, 129, 0.4)' : 'var(--border)',
                      color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
                    }}>
                      {t.dn && "✓"}
                    </div>
                    <div style={{ fontSize: '14px', textDecoration: t.dn ? 'line-through' : 'none', color: t.dn ? 'var(--text-dim)' : 'var(--text-main)' }}>
                      {t.tx}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <span className="mono text-xs text-muted">{done}/{sq.tasks.length}</span>
                <button className="btn-ghost" onClick={() => handleAddTask(sq.id)}>+ Task</button>
                <span className="mono text-xs text-muted">+{xpEarned} XP ea</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
