import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import ProgressRing from '../components/ProgressRing';
import QuestGroup from '../components/QuestGroup';
import { MAIN_QUESTS, PILLARS } from '../lib/quests';
import { formatEnergyTime } from '../lib/systems';

export default function MainScreen() {
  const [filter, setFilter] = useState('all');
  const {
    dailyPool, questStates, level, energy, xp, mastery, streaks,
    startQuest, skipQuest, completeQuest, doNewDay, setCustomQuests,
  } = useGame();

  const completedToday = Object.values(questStates).filter((s) => s?.s === 'done').length;
  const totalToday = dailyPool.length;
  const percentage = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;
  const isEnergyLow = energy < 60;

  const grouped = MAIN_QUESTS
    .filter((mq) => filter === 'all' || mq.p === filter)
    .map((mq) => ({
      group: mq,
      quests: dailyPool.filter((q) => q.mqId === mq.id),
    }))
    .filter((g) => g.quests.length > 0);

  const handleAddCustom = (mqId, name, desc, en) => {
    setCustomQuests((prev) => {
      const current = prev[mqId] || [];
      return {
        ...prev,
        [mqId]: [...current, {
          id: 'c_' + Date.now(),
          ic: '⭐',
          nm: name,
          ds: desc || 'Custom task.',
          en: en,
          xp: Math.round(en * 2.5),
          df: en > 25 ? 3 : en > 12 ? 2 : 1,
        }],
      };
    });
  };

  const pillarFilters = [
    { key: 'all', label: 'All', color: 'var(--text-main)' },
    { key: 'vitality', label: 'Vitality', color: '#10b981' },
    { key: 'mastery', label: 'Mastery', color: '#818cf8' },
    { key: 'bonds', label: 'Bonds', color: '#eab308' },
  ];

  const mono = { fontFamily: "'JetBrains Mono', monospace" };

  return (
    <div>
      {/* Summary header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '14px 16px', marginBottom: 14,
      }}>
        <ProgressRing percentage={percentage} />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>Time Left</div>
            <div style={{ ...mono, fontSize: 16, fontWeight: 700, color: isEnergyLow ? '#ef4444' : 'var(--text-main)' }}>
              {formatEnergyTime(energy)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>Done</div>
            <div style={{ ...mono, fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>
              {completedToday}/{totalToday}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>XP</div>
            <div style={{ ...mono, fontSize: 16, fontWeight: 700, color: '#818cf8' }}>
              {xp}
            </div>
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {pillarFilters.map((pf) => (
          <button
            key={pf.key}
            onClick={() => setFilter(pf.key)}
            style={{
              fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 8,
              border: filter === pf.key ? '1px solid ' + pf.color : '1px solid var(--border)',
              background: filter === pf.key ? pf.color + '1a' : 'transparent',
              color: filter === pf.key ? pf.color : 'var(--text-dim)',
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
          >
            {pf.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          onClick={doNewDay}
          style={{
            fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-dim)', cursor: 'pointer',
          }}
        >
          New Day
        </button>
      </div>

      {/* Quest groups */}
      {grouped.map(({ group, quests }) => (
        <QuestGroup
          key={group.id}
          group={group}
          quests={quests}
          questStates={questStates}
          mastery={mastery[group.id] || 0}
          streak={streaks[group.id]?.c || 0}
          level={level}
          onStart={startQuest}
          onSkip={skipQuest}
          onComplete={completeQuest}
          onAddCustom={handleAddCustom}
        />
      ))}

      {grouped.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)', fontSize: 14 }}>
          No quests for this filter. Try "All" or start a New Day.
        </div>
      )}
    </div>
  );
}
