export const GEAR_DB = [
  {
    id: 'amulet_focus',
    name: 'Amulet of Focus',
    desc: '+10% XP from Mastery quests',
    icon: '🧿',
    cost: 500,
    slot: 'accessory',
    buffs: { masteryXp: 1.1 }
  },
  {
    id: 'vitality_ring',
    name: 'Vitality Ring',
    desc: '-5 HP lost from missed quests',
    icon: '💍',
    cost: 800,
    slot: 'accessory',
    buffs: { hpLossReduction: 5 }
  },
  {
    id: 'bonds_bracelet',
    name: 'Charm Bracelet',
    desc: '+20% XP from Bonds quests',
    icon: '📿',
    cost: 400,
    slot: 'accessory',
    buffs: { bondsXp: 1.2 }
  },
  {
    id: 'crown_discipline',
    name: 'Crown of Discipline',
    desc: '+50 Max Energy',
    icon: '👑',
    cost: 1500,
    slot: 'head',
    buffs: { maxEnergy: 50 }
  },
  {
    id: 'cloak_shadows',
    name: 'Cloak of Shadows',
    desc: 'Chain bonus starts at x1.2',
    icon: '🧥',
    cost: 1200,
    slot: 'body',
    buffs: { baseChain: 1.2 }
  }
];

export function getGear(id) {
  return GEAR_DB.find(g => g.id === id);
}
