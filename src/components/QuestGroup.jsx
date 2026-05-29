import React, { useState } from 'react';
import QuestCard from './QuestCard';
import { getRankLabel, getNextRankThreshold, getRankIndex } from '../lib/systems';
import { PILLARS, MAIN_QUESTS } from '../lib/quests';

export default function QuestGroup({ 
  group, quests, stateObj, mastery, streak, 
  onStart, onSkip, onComplete, level, onAddCustom 
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newEnergy, setNewEnergy] = useState(20);

  const pc = PILLARS[group.p];
  const comp = mastery || 0;
  const rankIdx = getRankIndex(comp);
  const nxt = getNextRankThreshold(rankIdx);
  const rp = nxt ? Math.round(((comp - (rankIdx === 0 ? 0 : getNextRankThreshold(rankIdx - 1))) / (nxt - (rankIdx === 0 ? 0 : getNextRankThreshold(rankIdx - 1)))) * 100) : 100;
  
  const doneCount = quests.filter(q => stateObj[q.id]?.s === "done").length;

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddCustom(group.id, newName.trim(), newDesc.trim(), newEnergy);
    setNewName("");
    setNewDesc("");
    setNewEnergy(20);
    setShowAdd(false);
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      marginBottom: '10px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', cursor: 'pointer' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ fontSize: '18px' }}>{group.ic}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '2px' }}>{group.nm}</div>
          <div className="mono text-xs" style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)' }}>
            <span style={{ color: pc.c, fontWeight: '600' }}>Rk {getRankLabel(rankIdx)}</span>
            <span>{nxt ? `${comp}/${nxt}` : 'Max'}</span>
            {streak > 1 && <span style={{ color: '#eab308', fontWeight: '700' }}>🔥{streak}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="mono text-xs" style={{ color: 'var(--text-muted)' }}>{doneCount}/{quests.length}</span>
          <span style={{ 
            color: 'var(--text-dim)', 
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', 
            transition: 'transform 0.2s' 
          }}>›</span>
        </div>
      </div>

      {/* Rank Progress Bar */}
      <div style={{ height: '2px', background: 'var(--border)' }}>
        <div style={{ height: '100%', width: `${rp}%`, background: pc.c, opacity: 0.5, transition: 'width 0.4s' }} />
      </div>

      {/* Quest List */}
      {isOpen && (
        <div>
          {quests.map(q => (
            <QuestCard 
              key={q.id} 
              quest={q} 
              stateObj={stateObj[q.id]} 
              onStart={onStart} 
              onSkip={onSkip} 
              onComplete={onComplete} 
              currentLevel={level}
            />
          ))}
          
          {/* Add Custom Quest Footer */}
          <div style={{ borderTop: '1px solid var(--border)', padding: '10px 14px' }}>
            {showAdd ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input className="input-base" placeholder="Quest Name" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
                <input className="input-base" placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>⚡</span>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    <button style={{ padding: '4px 10px' }} onClick={() => setNewEnergy(Math.max(5, newEnergy - 5))}>-</button>
                    <span className="mono text-sm" style={{ width: '30px', textAlign: 'center' }}>{newEnergy}</span>
                    <button style={{ padding: '4px 10px' }} onClick={() => setNewEnergy(Math.min(60, newEnergy + 5))}>+</button>
                  </div>
                  <div style={{ flex: 1 }} />
                  <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button className="btn-primary" onClick={handleAdd}>Add</button>
                </div>
              </div>
            ) : (
              <button 
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px dashed var(--border-focus)',
                  borderRadius: '6px',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setShowAdd(true)}
              >
                + Add Custom Quest
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
