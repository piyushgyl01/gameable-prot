// XP required grows steeply
export function xpRequired(lv) {
  return Math.floor(250 * Math.pow(1.2, lv - 1));
}

// XP earned scales with your level
export function xpMultiplier(lv) {
  return 1 + (lv - 1) * 0.05;
}

// Ranks
export const RANKS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
export const RANK_THRESHOLDS = [0, 5, 12, 22, 35, 52, 74, 102, 138, 185, 250];

export function getRankIndex(completions) {
  let r = 0;
  while (r < RANK_THRESHOLDS.length - 1 && completions >= RANK_THRESHOLDS[r + 1]) {
    r++;
  }
  return r;
}

export function getRankLabel(rankIndex) {
  return RANKS[Math.min(rankIndex, RANKS.length - 1)];
}

export function getNextRankThreshold(rankIndex) {
  return rankIndex < RANK_THRESHOLDS.length - 1 ? RANK_THRESHOLDS[rankIndex + 1] : null;
}

// Energy
export const MAX_ENERGY = 240;

export function formatEnergyTime(en) {
  const m = Math.round(en * 6);
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? `${h}h${r}m` : `${r}m`;
}

// Dates
export function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

// Random utils
export function stringHash(s) {
  let v = 0;
  for (let i = 0; i < s.length; i++) {
    v = Math.imul(31, v) + s.charCodeAt(i) | 0;
  }
  return v;
}

export function seededShuffle(array, seed) {
  const r = [...array];
  let h = seed;
  for (let i = r.length - 1; i > 0; i--) {
    h = Math.imul(1664525, h) + 1013904223 | 0;
    const j = Math.abs(h) % (i + 1);
    const t = r[i];
    r[i] = r[j];
    r[j] = t;
  }
  return r;
}
