// --- XP Curve ---

export function getRequiredXp(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// --- XP Rewards by quest type ---

export const XP_REWARDS = {
  main: 100,
  story: 50,
  side: 30,
  daily: 20,
};

// --- Process quest completion ---
// Returns { newXp, newLevel, statGains }

export function processQuestCompletion(questType, pillar, currentLevel, currentXp) {
  const xpGain = XP_REWARDS[questType] || 20;
  let newXp = currentXp + xpGain;
  let newLevel = currentLevel;
  let reqXp = getRequiredXp(newLevel);

  while (newXp >= reqXp) {
    newXp -= reqXp;
    newLevel++;
    reqXp = getRequiredXp(newLevel);
  }

  const statGains = {};
  if (pillar === 'health') statGains.healthStat = 1;
  if (pillar === 'wealth') statGains.wealthStat = 1;
  if (pillar === 'relationships') statGains.relationshipsStat = 1;

  return {
    xpGain,
    newXp,
    newLevel,
    leveledUp: newLevel > currentLevel,
    statGains,
  };
}

// --- Rank / Title System ---

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

export function getRank(level) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (level >= r.minLevel) rank = r;
  }
  return rank.title;
}

// --- Pillar metadata ---

export const PILLARS = {
  health: { label: 'Health', color: '#ef4444', icon: '❤️' },
  wealth: { label: 'Wealth', color: '#f59e0b', icon: '💰' },
  relationships: { label: 'Relationships', color: '#3b82f6', icon: '🤝' },
};
