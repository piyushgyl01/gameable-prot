import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import ProgressRing from '../components/ProgressRing';
import QuestGroup from '../components/QuestGroup';
import { MAIN_QUESTS, PILLARS } from '../lib/quests';
import { formatEnergyTime, getTodayString } from '../lib/systems';

export default function MainScreen() {
  const { 
    dailyPool, questStates, level, energy, xp, totalXp,
    mastery, streaks, startQuest, skipQuest, completeQuest, doNewDay, setCustomQuests
  } = useGame();

  const [filter, setFilter] = useState("all");

  const completedToday = dailyPool.filter(q => questStates[q.id]?.s === "done").length;
  const percentage = dailyPool.length ? (completedToday / dailyPool.length) * 100 : 0;
  const isEnergyLow = energy < 60;

  // Group daily pool by main quest
  const activeGroups = MAIN_QUESTS
    .map(mq => ({
      group: mq,
      quests: dailyPool.filter(q => q.mqId === mq.id)
    }))
    .filter(g => g.quests.length > 0)
    .filter(g => filter === "all" || g.group.p === filter);

  const handleAddCustom = (mqId, name, desc, en) => {
    setCustomQuests(prev => {
      const current = prev[mqId] || [];
      return {
        ...prev,
        [mqId]: [...current, { 
          id: `c_${Date.now()}`, 
          ic: '⭐', 
          nm: name, 
          ds: desc || "Custom task.", 
          en: en, 
          xp: Math.round(en * 2.5), 
          df: en > 25 ? 3 : en > 12 ? 2 : 1 
        }]
      };
    });
  };

  return (
    <div>
      {/* Daily Summary Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '20px', 
        background: 'var(--surface)', border: '1px solid var(--border)', 
        borderRadius: 'var(--radius)', padding: '16px', marginBottom: '16px'
      }}>
        <ProgressRing percentage={percentage} />
        
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
          <div>
            <div className="mono font-bold" style={{ fontSize: '18px', color: isEnergyLow ? 'var(--diff-hard)' : 'var(--diff-med)' }}>
              {formatEnergyTime(energy)}
            </div>
            <div className="text-xs font-semibold text-muted" style={{ letterSpacing: '0.5px', textTransform: 'uppercase' }}>Left</div>
          </div>
          <div>
            <div className="mono font-bold" style={{ fontSize: '18px', color: 'var(--accent-vitality)' }}>
              {completedToday}
            </div>
            <div className="text-xs font-semibold text-muted" style={{ letterSpacing: '0.5px', textTransform: 'uppercase' }}>Done</div>
          </div>
          <div>
            <div className="mono font-bold" style={{ fontSize: '18px', color: 'var(--accent-mastery)' }}>
              {xp}
            </div>
            <div className="text-xs font-semibold text-muted" style={{ letterSpacing: '0.5px', textTransform: 'uppercase' }}>XP</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            className={`btn-ghost ${filter === "all" ? "active" : ""}`}
            style={filter === "all" ? { background: 'var(--surface)', color: 'var(--text-main)' } : {}}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          {Object.entries(PILLARS).map(([id, p]) => (
            <button 
              key={id}
              className="btn-ghost"
              style={filter === id ? { background: `${p.c}15`, color: p.c, border: `1px solid ${p.c}40` } : {}}
              onClick={() => setFilter(id)}
            >
              {p.n}
            </button>
          ))}
        </div>
        <button className="btn-ghost" onClick={doNewDay}>New Day</button>
      </div>

      {/* Quest Groups */}
      <div>
        {activeGroups.map(({ group, quests }) => (
          <QuestGroup
            key={group.id}
            group={group}
            quests={quests}
            stateObj={questStates}
            mastery={mastery[group.id]}
            streak={streaks[group.id]?.c || 0}
            level={level}
            onStart={startQuest}
            onSkip={skipQuest}
            onComplete={completeQuest}
            onAddCustom={handleAddCustom}
          />
        ))}
        {activeGroups.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No quests found. Start a new day!
          </div>
        )}
      </div>
    </div>
  );
}
