import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { PILLARS, XP_REWARDS } from '../lib/progression';
import { ACHIEVEMENTS, SKILL_TREES } from '../lib/systems';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const RANKS = [
  { minLevel: 1, title: 'Wanderer' },
  { minLevel: 5, title: 'Seeker' },
  { minLevel: 10, title: 'Adventurer' },
  { minLevel: 15, title: 'Pathfinder' },
  { minLevel: 20, title: 'Vanguard' },
  { minLevel: 30, title: 'Champion' },
  { minLevel: 40, title: 'Warden' },
  { minLevel: 50, title: 'Legend' },
  { minLevel: 75, title: 'Mythic' },
  { minLevel: 100, title: 'Transcendent' },
];

const STAT_KEYS = { health: 'healthStat', wealth: 'wealthStat', relationships: 'relationshipsStat' };

/* ── SVG Semi-Circular Gauge ── */
function SemiGauge({ value, max = 40, color, size = 120 }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10; // push center down so arc sits nicely

  // Arc spans 180° (π radians), from left to right across the top
  const startAngle = Math.PI;       // left
  const endAngle = 0;               // right
  const pct = Math.min(value / max, 1);
  const sweepAngle = Math.PI * pct;

  // Background arc path (full semi-circle)
  const bgX1 = cx + radius * Math.cos(startAngle);
  const bgY1 = cy - radius * Math.sin(startAngle);
  const bgX2 = cx + radius * Math.cos(endAngle);
  const bgY2 = cy - radius * Math.sin(endAngle);
  const bgPath = `M ${bgX1} ${bgY1} A ${radius} ${radius} 0 1 1 ${bgX2} ${bgY2}`;

  // Fill arc path
  const fillEndAngle = startAngle - sweepAngle;
  const fX2 = cx + radius * Math.cos(fillEndAngle);
  const fY2 = cy - radius * Math.sin(fillEndAngle);
  const largeArc = pct > 0.5 ? 1 : 0;
  const fillPath = pct > 0
    ? `M ${bgX1} ${bgY1} A ${radius} ${radius} 0 ${largeArc} 1 ${fX2} ${fY2}`
    : '';

  return (
    <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`} style={{ overflow: 'visible' }}>
      {/* Background arc */}
      <path
        d={bgPath}
        fill="none"
        stroke="var(--bg-hover)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Filled arc */}
      {pct > 0 && (
        <path
          d={fillPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${color}40)`,
          }}
        />
      )}
      {/* Center value */}
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontFamily="var(--font-mono)"
        fontSize="22"
        fontWeight="800"
      >
        {value}
      </text>
    </svg>
  );
}

/* ── Custom Tooltip for Growth Chart ── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 12px',
      fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div className="mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>
        +{payload[0].value} XP
      </div>
    </div>
  );
}

export default function Character() {
  const { profile, rank, requiredXp, recentLog, unlockedAchievements } = useGame();

  if (!profile) return null;

  const xpPct = (profile.xp / requiredXp) * 100;
  const initials = (profile.name || 'U').charAt(0).toUpperCase();

  const dailyDone = recentLog.filter(l => l.questType === 'daily').length;
  const storyDone = recentLog.filter(l => l.questType === 'story').length;
  const sideDone = recentLog.filter(l => l.questType === 'side').length;

  const stats = [
    { key: 'health', val: profile.healthStat || 0, ...PILLARS.health },
    { key: 'wealth', val: profile.wealthStat || 0, ...PILLARS.wealth },
    { key: 'relationships', val: profile.relationshipsStat || 0, ...PILLARS.relationships },
  ];

  /* ── Growth chart data: group XP by date ── */
  const growthData = useMemo(() => {
    const byDate = {};
    for (const entry of recentLog) {
      if (!entry.completedAt) continue;
      const date = entry.completedAt.split('T')[0]; // 'YYYY-MM-DD'
      const xp = entry.xpEarned || XP_REWARDS[entry.questType] || 20;
      byDate[date] = (byDate[date] || 0) + xp;
    }
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, xp]) => ({
        date: date.slice(5), // 'MM-DD'
        xp,
      }));
  }, [recentLog]);

  return (
    <div className="animate-in">
      <h1 style={{ marginBottom: 32 }}>Character</h1>

      {/* ── Character Card ── */}
      <div className="card animate-slide-up" style={{ padding: 32, textAlign: 'center', marginBottom: 32 }}>
        {/* Avatar with gradient accent border */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), #34d399)',
          padding: 3, margin: '0 auto 16px',
        }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: 'var(--bg-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, fontWeight: 800, color: 'var(--accent)',
          }}>
            {initials}
          </div>
        </div>

        <div style={{ fontSize: 20, fontWeight: 700 }}>{profile.name}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{rank}</div>

        {/* Prominent level */}
        <div className="mono" style={{
          fontSize: 36, fontWeight: 800, marginBottom: 12,
          background: 'linear-gradient(135deg, var(--accent), #34d399)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Level {profile.level}
        </div>

        <div style={{ maxWidth: 300, margin: '0 auto' }}>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            {profile.xp} / {requiredXp} XP
          </div>
        </div>

        {(profile.currentStreak || 0) > 0 && (
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--color-wealth)' }}>
            🔥 {profile.currentStreak} day streak · Best: {profile.longestStreak || 0}
          </div>
        )}
      </div>

      {/* ── Core Pillars — SVG Gauges ── */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Core Pillars</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {stats.map(s => (
            <div key={s.key} className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: s.color, marginBottom: 8 }}>{s.label}</div>
              <SemiGauge value={s.val} max={40} color={s.color} size={120} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Growth Chart ── */}
      {growthData.length > 1 && (
        <div style={{ marginBottom: 32 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Growth</div>
          <div className="card" style={{ padding: '20px 20px 12px' }}>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={growthData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="url(#xpGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Skill Trees with connecting lines ── */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Skill Trees</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {Object.entries(SKILL_TREES).map(([pillarKey, tree]) => {
            const statVal = profile[STAT_KEYS[pillarKey]] || 0;
            return (
              <div key={pillarKey} className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: tree.color, marginBottom: 16 }}>{tree.label}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {tree.nodes.map((node, idx) => {
                    const unlocked = statVal >= node.reqStat;
                    return (
                      <div
                        key={node.id}
                        className={unlocked ? 'animate-pop' : ''}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          opacity: unlocked ? 1 : 0.35,
                          paddingLeft: idx > 0 ? 13 : 0,
                          borderLeft: idx > 0 ? `2px solid ${unlocked ? tree.color : 'var(--border)'}` : 'none',
                          paddingTop: 8,
                          paddingBottom: 8,
                          marginLeft: idx > 0 ? 0 : 13,
                        }}
                      >
                        <div style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: unlocked ? tree.color : 'var(--bg-base)',
                          border: `2px solid ${unlocked ? tree.color : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, color: unlocked ? '#fff' : 'var(--text-muted)',
                          fontWeight: 700, flexShrink: 0,
                        }}>
                          {unlocked ? '✓' : node.reqStat}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{node.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{node.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Achievements ── */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>
          Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = unlockedAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon" style={{ fontSize: 22, flexShrink: 0 }}>{ach.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{ach.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ach.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quest Stats ── */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Quest Stats</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Total', val: recentLog.length },
            { label: 'Story Steps', val: storyDone },
            { label: 'Side Quests', val: sideDone },
            { label: 'Dailies', val: dailyDone },
          ].map((s, i) => (
            <div
              key={i}
              className={`card animate-slide-up stagger-${i + 1}`}
              style={{ padding: 16, textAlign: 'center' }}
            >
              <div className="mono" style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Rank Progression ── */}
      <div className="animate-slide-up">
        <div className="section-title" style={{ marginBottom: 12 }}>Rank Progression</div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {RANKS.map((r, i) => {
              const achieved = profile.level >= r.minLevel;
              const isCurrent = rank === r.title;
              return (
                <div key={i} style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  background: isCurrent ? 'var(--accent-dim)' : achieved ? 'var(--bg-hover)' : 'var(--bg-base)',
                  color: isCurrent ? 'var(--accent)' : achieved ? 'var(--text-secondary)' : 'var(--text-muted)',
                  border: isCurrent ? '1px solid var(--accent)' : '1px solid transparent',
                }}>
                  {r.title} <span className="mono" style={{ opacity: 0.5 }}>Lv.{r.minLevel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
