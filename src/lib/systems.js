// --- Achievement Definitions ---

export const ACHIEVEMENTS = [
  // Milestones
  { id: 'first_quest', title: 'First Steps', desc: 'Complete your first quest.', icon: '🌱', condition: (p, log) => log.length >= 1 },
  { id: 'ten_quests', title: 'Getting Serious', desc: 'Complete 10 quests.', icon: '⚡', condition: (p, log) => log.length >= 10 },
  { id: 'fifty_quests', title: 'Relentless', desc: 'Complete 50 quests.', icon: '🔥', condition: (p, log) => log.length >= 50 },
  { id: 'hundred_quests', title: 'Centurion', desc: 'Complete 100 quests.', icon: '💯', condition: (p, log) => log.length >= 100 },

  // Levels
  { id: 'level_5', title: 'Awakened', desc: 'Reach Level 5.', icon: '✨', condition: (p) => p.level >= 5 },
  { id: 'level_10', title: 'Double Digits', desc: 'Reach Level 10.', icon: '🌟', condition: (p) => p.level >= 10 },
  { id: 'level_25', title: 'Quarter Century', desc: 'Reach Level 25.', icon: '👑', condition: (p) => p.level >= 25 },
  { id: 'level_50', title: 'Half Way There', desc: 'Reach Level 50.', icon: '🏆', condition: (p) => p.level >= 50 },

  // Streaks
  { id: 'streak_3', title: 'Consistent', desc: 'Maintain a 3-day streak.', icon: '🔗', condition: (p) => (p.longestStreak || 0) >= 3 },
  { id: 'streak_7', title: 'Week Warrior', desc: 'Maintain a 7-day streak.', icon: '📅', condition: (p) => (p.longestStreak || 0) >= 7 },
  { id: 'streak_30', title: 'Iron Will', desc: 'Maintain a 30-day streak.', icon: '💎', condition: (p) => (p.longestStreak || 0) >= 30 },

  // Pillars
  { id: 'health_10', title: 'Body Aware', desc: 'Reach Health stat 10.', icon: '❤️', condition: (p) => (p.healthStat || 0) >= 10 },
  { id: 'wealth_10', title: 'Investor', desc: 'Reach Wealth stat 10.', icon: '💰', condition: (p) => (p.wealthStat || 0) >= 10 },
  { id: 'relations_10', title: 'Social Butterfly', desc: 'Reach Relationships stat 10.', icon: '🤝', condition: (p) => (p.relationshipsStat || 0) >= 10 },
  { id: 'balanced_5', title: 'Balanced', desc: 'All three pillars at 5+.', icon: '⚖️', condition: (p) => (p.healthStat || 0) >= 5 && (p.wealthStat || 0) >= 5 && (p.relationshipsStat || 0) >= 5 },
  { id: 'balanced_20', title: 'Renaissance', desc: 'All three pillars at 20+.', icon: '🌈', condition: (p) => (p.healthStat || 0) >= 20 && (p.wealthStat || 0) >= 20 && (p.relationshipsStat || 0) >= 20 },

  // Special
  { id: 'arc_complete', title: 'Arc Complete', desc: 'Complete an entire Story Arc.', icon: '📖', condition: (p, log) => log.some(l => l.questType === 'story') },
];

export function checkAchievements(profile, questLog, unlockedIds) {
  const newlyUnlocked = [];
  for (const ach of ACHIEVEMENTS) {
    if (unlockedIds.includes(ach.id)) continue;
    if (ach.condition(profile, questLog)) {
      newlyUnlocked.push(ach);
    }
  }
  return newlyUnlocked;
}

// --- Skill Tree Definitions ---

export const SKILL_TREES = {
  health: {
    label: 'Health',
    color: 'var(--color-health)',
    nodes: [
      { id: 'h1', title: 'Body Awareness', desc: 'Begin your health journey.', reqStat: 0, tier: 0 },
      { id: 'h2', title: 'Consistent Mover', desc: 'Regular physical activity.', reqStat: 5, tier: 1 },
      { id: 'h3', title: 'Clean Eater', desc: 'Mindful nutrition habits.', reqStat: 8, tier: 1 },
      { id: 'h4', title: 'Endurance', desc: 'Push your physical limits.', reqStat: 15, tier: 2 },
      { id: 'h5', title: 'Iron Body', desc: 'Peak physical conditioning.', reqStat: 25, tier: 2 },
      { id: 'h6', title: 'Vitality Master', desc: 'Complete mastery of health.', reqStat: 40, tier: 3 },
    ],
  },
  wealth: {
    label: 'Wealth',
    color: 'var(--color-wealth)',
    nodes: [
      { id: 'w1', title: 'Money Aware', desc: 'Track your finances.', reqStat: 0, tier: 0 },
      { id: 'w2', title: 'Saver', desc: 'Build a savings habit.', reqStat: 5, tier: 1 },
      { id: 'w3', title: 'Skill Builder', desc: 'Invest in your abilities.', reqStat: 8, tier: 1 },
      { id: 'w4', title: 'Income Growth', desc: 'Increase your earning power.', reqStat: 15, tier: 2 },
      { id: 'w5', title: 'Investor', desc: 'Make money work for you.', reqStat: 25, tier: 2 },
      { id: 'w6', title: 'Financial Freedom', desc: 'Complete financial independence.', reqStat: 40, tier: 3 },
    ],
  },
  relationships: {
    label: 'Relationships',
    color: 'var(--color-relationships)',
    nodes: [
      { id: 'r1', title: 'Self Aware', desc: 'Understand your social needs.', reqStat: 0, tier: 0 },
      { id: 'r2', title: 'Connector', desc: 'Actively reach out to others.', reqStat: 5, tier: 1 },
      { id: 'r3', title: 'Deep Bonds', desc: 'Nurture meaningful relationships.', reqStat: 8, tier: 1 },
      { id: 'r4', title: 'Community Builder', desc: 'Create and lead groups.', reqStat: 15, tier: 2 },
      { id: 'r5', title: 'Mentor', desc: 'Guide others on their path.', reqStat: 25, tier: 2 },
      { id: 'r6', title: 'Social Architect', desc: 'Master of human connection.', reqStat: 40, tier: 3 },
    ],
  },
};

// --- Theme Definitions ---

export const THEMES = {
  dark: {
    label: 'Obsidian',
    colors: {
      '--bg-base': '#0a0a0b',
      '--bg-surface': '#141416',
      '--bg-elevated': '#1c1c1f',
      '--bg-hover': '#232326',
      '--bg-active': '#2a2a2e',
      '--border': '#27272a',
      '--border-hover': '#3f3f46',
      '--border-focus': '#52525b',
      '--accent': '#10b981',
      '--accent-dim': 'rgba(16, 185, 129, 0.12)',
      '--accent-hover': '#059669',
    },
  },
  midnight: {
    label: 'Midnight',
    colors: {
      '--bg-base': '#0b0e1a',
      '--bg-surface': '#111827',
      '--bg-elevated': '#1e293b',
      '--bg-hover': '#283548',
      '--bg-active': '#334155',
      '--border': '#1e293b',
      '--border-hover': '#334155',
      '--border-focus': '#475569',
      '--accent': '#6366f1',
      '--accent-dim': 'rgba(99, 102, 241, 0.12)',
      '--accent-hover': '#4f46e5',
    },
  },
  forest: {
    label: 'Forest',
    colors: {
      '--bg-base': '#0a0f0a',
      '--bg-surface': '#111c11',
      '--bg-elevated': '#1a2a1a',
      '--bg-hover': '#223522',
      '--bg-active': '#2a3f2a',
      '--border': '#1a2a1a',
      '--border-hover': '#2a3f2a',
      '--border-focus': '#3a5a3a',
      '--accent': '#22c55e',
      '--accent-dim': 'rgba(34, 197, 94, 0.12)',
      '--accent-hover': '#16a34a',
    },
  },
  crimson: {
    label: 'Crimson',
    colors: {
      '--bg-base': '#0f0a0a',
      '--bg-surface': '#1a1111',
      '--bg-elevated': '#261818',
      '--bg-hover': '#332020',
      '--bg-active': '#3f2828',
      '--border': '#261818',
      '--border-hover': '#3f2828',
      '--border-focus': '#5a3a3a',
      '--accent': '#f43f5e',
      '--accent-dim': 'rgba(244, 63, 94, 0.12)',
      '--accent-hover': '#e11d48',
    },
  },
};

export function applyTheme(themeId) {
  const theme = THEMES[themeId];
  if (!theme) return;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(key, value);
  }
}
