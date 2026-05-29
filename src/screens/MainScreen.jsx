import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import ProgressRing from '../components/ProgressRing';
import QuestGroup from '../components/QuestGroup';
import { MAIN_QUESTS, PILLARS } from '../lib/quests';
import { formatEnergyTime } from '../lib/systems';

export default function MainScreen() {
  const [filter, setFilter] = useState('all');
  const {
    dailyPool, questStates, level, energy, dailyXp, mastery, streaks, history, activityLog,
    startQuest, skipQuest, completeQuest, doNewDay, setCustomQuests,
  } = useGame();

  const getPet = (lvl) => {
    if (lvl < 5) return { icon: '🥚', name: 'Mystic Egg' };
    if (lvl < 10) return { icon: '🐣', name: 'Hatchling' };
    if (lvl < 15) return { icon: '🐥', name: 'Fledgling' };
    return { icon: '🦅', name: 'Apex Familiar' };
  };
  const pet = getPet(level);

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

  // Weekly Heatmap Data
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().slice(0, 10));
  }

  const formatTime = (ms) => {
    const d = new Date(ms);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {/* Summary header */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '14px 16px', marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>Daily XP</div>
              <div style={{ ...mono, fontSize: 16, fontWeight: 700, color: '#818cf8' }}>
                {dailyXp}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Heatmap */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {last7Days.map(date => {
            const count = history[date] || 0;
            return (
              <div
                key={date}
                title={`${date}: ${count} completed`}
                style={{
                  width: 12, height: 12, borderRadius: 3,
                  background: count > 3 ? '#10b981' : count > 0 ? 'rgba(16,185,129,0.4)' : 'var(--border)',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Pet UI */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '16px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 16
      }}>
        <div style={{
          width: 50, height: 50, borderRadius: 25, background: 'rgba(129,140,248,0.1)',
          display: 'grid', placeItems: 'center', fontSize: 28, border: '1px solid rgba(129,140,248,0.3)'
        }}>
          {pet.icon}
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
            Companion
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
            {pet.name}
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

      {/* Activity Log */}
      <div style={{ marginTop: 32 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
          color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10,
        }}>
          Activity Log
        </div>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
          padding: 12, maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {activityLog.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center' }}>No recent activity.</div>
          )}
          {activityLog.map((log, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ ...mono, fontSize: 10, color: 'var(--text-dim)', paddingTop: 2, flexShrink: 0 }}>
                {formatTime(log.time)}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {log.msg}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
