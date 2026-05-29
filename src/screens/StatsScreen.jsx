import React, { useRef } from 'react';
import { useGame } from '../context/GameContext';
import { MAIN_QUESTS, PILLARS } from '../lib/quests';
import { getRankLabel, getRankIndex } from '../lib/systems';
import { exportGameState } from '../lib/storage';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line, XAxis, Tooltip, CartesianGrid
} from 'recharts';

export default function StatsScreen() {
  const { 
    level, totalXp, history, mastery, streaks, customQuests, 
    resetGame, triggerImport, playerClass, setPlayerClass 
  } = useGame();
  const fileInputRef = useRef(null);

  const mono = { fontFamily: "'JetBrains Mono', monospace" };

  // Calculate history with the new {count, xp} structure
  const getHistCount = (d) => typeof history[d] === 'number' ? history[d] : (history[d]?.count || 0);
  const getHistXp = (d) => typeof history[d] === 'number' ? 0 : (history[d]?.xp || 0);

  const questsDone = Object.keys(history || {}).reduce((sum, d) => sum + getHistCount(d), 0);
  const bestStreak = Math.max(0, ...Object.values(streaks || {}).map((s) => s.c || 0));
  const daysPlayed = Object.keys(history || {}).length;

  const statCards = [
    { label: 'Total XP', value: totalXp || 0, color: '#818cf8' },
    { label: 'Quests Done', value: questsDone, color: '#10b981' },
    { label: 'Best Streak', value: bestStreak, color: '#eab308' },
    { label: 'Days Played', value: daysPlayed, color: 'var(--text-main)' },
  ];

  // Pillar Stats (for Radar Chart)
  const pillarStats = Object.keys(PILLARS).map(pKey => {
    const pData = PILLARS[pKey];
    const mqs = MAIN_QUESTS.filter(mq => mq.p === pKey);
    const totalRanks = mqs.reduce((sum, mq) => sum + getRankIndex(mastery[mq.id] || 0), 0);
    return { key: pKey, subject: pData.name, fullMark: 25, value: totalRanks, color: pData.color };
  });

  // Last 14 days XP history (for Line Chart)
  const last14Days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    last14Days.push({
      date: dateStr.slice(5), // MM-DD
      xp: getHistXp(dateStr)
    });
  }

  // Monthly Retrospective & Analytics
  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthDays = Object.keys(history || {}).filter(d => d.startsWith(currentMonthPrefix));
  const monthQuests = monthDays.reduce((sum, d) => sum + getHistCount(d), 0);

  // Time Analytics
  const { activityLog } = useGame();
  const hourCounts = {};
  activityLog.forEach(log => {
    if (log.msg.includes('Completed')) {
      const h = new Date(log.time).getHours();
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    }
  });
  let bestHour = -1;
  let maxC = 0;
  Object.entries(hourCounts).forEach(([h, c]) => {
    if (c > maxC) { maxC = c; bestHour = h; }
  });
  const bestTime = bestHour >= 0 ? new Date(0,0,0,bestHour).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A';

  const handleReset = () => {
    if (window.confirm('Reset ALL game data? This cannot be undone.')) {
      if (window.confirm('Are you really sure? Everything will be lost.')) {
        resetGame();
      }
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 8 }}>
          <p style={{ ...mono, fontSize: 11, color: 'var(--text-dim)', margin: '0 0 4px 0' }}>{label}</p>
          <p style={{ ...mono, fontSize: 13, color: '#818cf8', margin: 0, fontWeight: 700 }}>{payload[0].value} XP</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
        color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 14,
      }}>
        Stats
      </div>

      {/* 2x2 stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {statCards.map((sc) => (
          <div key={sc.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: 14, textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>
              {sc.label}
            </div>
            <div style={{ ...mono, fontSize: 22, fontWeight: 700, color: sc.color }}>
              {sc.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Time Analytics */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '14px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 600 }}>Prime Time</div>
        <div style={{ ...mono, fontSize: 16, fontWeight: 800, color: '#eab308' }}>
          🕒 {bestTime}
        </div>
      </div>

      {/* Radar Chart */}
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
        color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10,
      }}>
        Build Shape
      </div>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, height: 250, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={pillarStats}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-main)', fontSize: 11, fontWeight: 700 }} />
            <Radar name="Ranks" dataKey="value" stroke="#818cf8" fill="#818cf8" fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* XP Line Graph */}
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
        color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10,
      }}>
        XP History (14 Days)
      </div>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, height: 200, marginBottom: 24, padding: '16px 16px 16px 0'
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={last14Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--text-dim)" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="xp" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#818cf8', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Retrospective */}
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
        color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10,
      }}>
        This Month
      </div>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: 14, marginBottom: 24, display: 'flex', gap: 20,
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Active Days</div>
          <div style={{ ...mono, fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>{monthDays.length}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Quests Done</div>
          <div style={{ ...mono, fontSize: 16, fontWeight: 700, color: '#10b981' }}>{monthQuests}</div>
        </div>
      </div>

      {/* Mastery Lines */}
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
        color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10,
      }}>
        Mastery Lines
      </div>

      {MAIN_QUESTS.map((mq) => {
        const comp = mastery[mq.id] || 0;
        const rankIdx = getRankIndex(comp);
        const streak = streaks[mq.id]?.c || 0;
        const pc = PILLARS[mq.p];
        const customs = (customQuests[mq.id] || []).length;

        return (
          <div key={mq.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8,
          }}>
            <span style={{ fontSize: 18 }}>{mq.ic}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                {mq.nm}
              </div>
              <div style={{ ...mono, fontSize: 11, color: pc?.color || 'var(--text-dim)', marginTop: 2 }}>
                {getRankLabel(rankIdx)} • {comp} completions
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              {streak > 0 && (
                <span style={{ ...mono, fontSize: 11, color: '#eab308' }}>🔥 {streak}</span>
              )}
              {customs > 0 && (
                <span style={{ ...mono, fontSize: 10, color: 'var(--text-dim)' }}>+{customs} custom</span>
              )}
            </div>
          </div>
        );
      })}

      {/* Class Selection */}
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginTop: 30,
        color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10,
      }}>
        Identity Class
      </div>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: 14, marginBottom: 24
      }}>
        {level < 10 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            Reach Level 10 to unlock a Class Specialization.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { id: 'scholar', name: 'The Scholar', desc: '+20% XP from Mastery quests', icon: '📖' },
              { id: 'athlete', name: 'The Athlete', desc: 'Max Energy raised to 300', icon: '⚡' },
              { id: 'bard', name: 'The Bard', desc: 'Chain bonus scales 2x faster', icon: '🎵' },
            ].map(cls => (
              <div key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 24 }}>{cls.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: playerClass === cls.id ? '#eab308' : 'var(--text-main)' }}>
                    {cls.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{cls.desc}</div>
                </div>
                <button
                  onClick={() => setPlayerClass(cls.id)}
                  disabled={playerClass === cls.id}
                  style={{
                    padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                    border: playerClass === cls.id ? '1px solid var(--border)' : '1px solid rgba(234,179,8,0.5)',
                    background: playerClass === cls.id ? 'transparent' : 'rgba(234,179,8,0.1)',
                    color: playerClass === cls.id ? 'var(--text-dim)' : '#eab308',
                    cursor: playerClass === cls.id ? 'default' : 'pointer'
                  }}
                >
                  {playerClass === cls.id ? 'Active' : 'Choose'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Management */}
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginTop: 30,
        color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10,
      }}>
        Settings & Data
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => {
            if ('Notification' in window) {
              Notification.requestPermission().then(p => {
                if (p === 'granted') alert('Notifications enabled!');
              });
            } else {
              alert('Notifications not supported in this browser.');
            }
          }}
          style={{
            fontSize: 12, fontWeight: 600, padding: '10px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text-main)', cursor: 'pointer', gridColumn: 'span 2'
          }}
        >
          🔔 Enable Daily Reminders
        </button>
        <button
          onClick={exportGameState}
          style={{
            fontSize: 12, fontWeight: 600, padding: '10px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text-main)', cursor: 'pointer',
          }}
        >
          Export Save
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            fontSize: 12, fontWeight: 600, padding: '10px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text-main)', cursor: 'pointer',
          }}
        >
          Import Save
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) triggerImport(file);
            e.target.value = ''; // Reset
          }}
        />
      </div>

      {/* Reset */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <button
          onClick={handleReset}
          style={{
            fontSize: 12, fontWeight: 600, padding: '8px 20px', borderRadius: 8,
            border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)',
            color: '#ef4444', cursor: 'pointer',
          }}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}
