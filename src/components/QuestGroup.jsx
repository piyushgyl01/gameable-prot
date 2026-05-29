import React, { useState } from 'react';
import QuestCard from './QuestCard';
import { getRankLabel, getNextRankThreshold, getRankIndex } from '../lib/systems';
import { PILLARS } from '../lib/quests';

export default function QuestGroup({
  group, quests, questStates, mastery, streak,
  level, onStart, onSkip, onComplete, onAddCustom,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEnergy, setNewEnergy] = useState(20);

  const pc = PILLARS[group.p];
  const comp = mastery || 0;
  const rankIdx = getRankIndex(comp);
  const nxt = getNextRankThreshold(rankIdx);
  const rp = nxt > 0 ? Math.min(100, (comp / nxt) * 100) : 100;
  const doneCount = quests.filter((q) => questStates[q.id]?.s === 'done').length;

  const handleSubmit = () => {
    if (!newName.trim()) return;
    onAddCustom(group.id, newName.trim(), newDesc.trim(), newEnergy);
    setNewName('');
    setNewDesc('');
    setNewEnergy(20);
    setShowAdd(false);
  };

  const mono = { fontFamily: "'JetBrains Mono', monospace" };

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, marginBottom: 10, overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', cursor: 'pointer', userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 18 }}>{group.ic}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', flex: 1 }}>
          {group.nm}
        </span>
        <span style={{ ...mono, fontSize: 11, fontWeight: 600, color: pc?.color || 'var(--text-dim)' }}>
          {getRankLabel(rankIdx)}
        </span>
        <span style={{ ...mono, fontSize: 11, color: 'var(--text-dim)' }}>
          {doneCount}/{quests.length}
        </span>
        {streak > 1 && (
          <span style={{ fontSize: 12 }}>🔥{streak}</span>
        )}
        <span style={{
          fontSize: 14, color: 'var(--text-dim)',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }}>
          ▾
        </span>
      </div>

      {/* Rank progress bar */}
      <div style={{ height: 2, background: 'var(--border)' }}>
        <div style={{
          height: '100%', width: rp + '%',
          background: pc?.color || '#818cf8', opacity: 0.5,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Quest list */}
      {isOpen && (
        <>
          {quests.map((q) => (
            <QuestCard
              key={q.id}
              quest={q}
              questState={questStates[q.id]}
              currentLevel={level}
              onStart={onStart}
              onSkip={onSkip}
              onComplete={onComplete}
            />
          ))}

          {/* Footer: add custom */}
          <div style={{
            padding: '8px 14px', borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {!showAdd ? (
              <button
                onClick={(e) => { e.stopPropagation(); setShowAdd(true); }}
                style={{
                  fontSize: 12, color: 'var(--text-dim)', background: 'transparent',
                  border: 'none', cursor: 'pointer', padding: '2px 0',
                }}
              >
                + Custom quest
              </button>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1, alignItems: 'center' }}>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Quest name"
                  style={{
                    flex: 1, minWidth: 100, fontSize: 12, padding: '4px 8px', borderRadius: 6,
                    border: '1px solid var(--border)', background: 'var(--bg)',
                    color: 'var(--text-main)', outline: 'none',
                  }}
                />
                <input
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Description"
                  style={{
                    flex: 1, minWidth: 80, fontSize: 12, padding: '4px 8px', borderRadius: 6,
                    border: '1px solid var(--border)', background: 'var(--bg)',
                    color: 'var(--text-main)', outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    onClick={() => setNewEnergy(Math.max(5, newEnergy - 5))}
                    style={{
                      width: 22, height: 22, borderRadius: 4,
                      border: '1px solid var(--border)', background: 'var(--bg)',
                      color: 'var(--text-main)', fontSize: 12, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >−</button>
                  <span style={{ ...mono, fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', minWidth: 28, textAlign: 'center' }}>
                    {newEnergy}
                  </span>
                  <button
                    onClick={() => setNewEnergy(Math.min(120, newEnergy + 5))}
                    style={{
                      width: 22, height: 22, borderRadius: 4,
                      border: '1px solid var(--border)', background: 'var(--bg)',
                      color: 'var(--text-main)', fontSize: 12, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >+</button>
                </div>
                <button
                  onClick={handleSubmit}
                  style={{
                    fontSize: 12, padding: '4px 10px', borderRadius: 6,
                    background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.3)',
                    color: '#818cf8', fontWeight: 600, cursor: 'pointer',
                  }}
                >Add</button>
                <button
                  onClick={() => setShowAdd(false)}
                  style={{
                    fontSize: 12, padding: '4px 8px', borderRadius: 6,
                    background: 'transparent', border: '1px solid var(--border)',
                    color: 'var(--text-dim)', cursor: 'pointer',
                  }}
                >✕</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
