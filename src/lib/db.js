import Dexie from 'dexie';

const db = new Dexie('LifeRPG');

db.version(1).stores({
  profile: 'id',
  questArcs: '++id, pillar, status, createdAt',
  sideQuests: '++id, pillar, status, createdAt',
  dailyQuests: '++id, pillar, date, status, sourceArcId',
  questLog: '++id, questId, questType, completedAt, pillar',
  settings: 'id',
});

// --- Profile ---

export async function getProfile() {
  return await db.profile.get('main');
}

export async function saveProfile(data) {
  return await db.profile.put({ id: 'main', ...data });
}

export async function updateProfile(updates) {
  const existing = await getProfile();
  if (existing) {
    return await db.profile.put({ ...existing, ...updates });
  }
  return await db.profile.put({ id: 'main', ...updates });
}

// --- Settings ---

export async function getSettings() {
  const s = await db.settings.get('main');
  return s || { id: 'main', geminiKey: '', onboardingComplete: false };
}

export async function saveSettings(data) {
  return await db.settings.put({ id: 'main', ...data });
}

// --- Story Arcs ---

export async function getQuestArcs() {
  return await db.questArcs.toArray();
}

export async function getActiveArcs() {
  return await db.questArcs.where('status').equals('active').toArray();
}

export async function addQuestArc(arc) {
  return await db.questArcs.add({
    ...arc,
    status: 'active',
    createdAt: new Date().toISOString(),
  });
}

export async function updateQuestArc(id, updates) {
  return await db.questArcs.update(id, updates);
}

export async function bulkAddArcs(arcs) {
  return await db.questArcs.bulkAdd(
    arcs.map(a => ({ ...a, status: 'active', createdAt: new Date().toISOString() }))
  );
}

// --- Side Quests ---

export async function getSideQuests() {
  return await db.sideQuests.toArray();
}

export async function getActiveSideQuests() {
  return await db.sideQuests.where('status').equals('active').toArray();
}

export async function addSideQuest(quest) {
  return await db.sideQuests.add({
    ...quest,
    status: 'active',
    createdAt: new Date().toISOString(),
  });
}

export async function updateSideQuest(id, updates) {
  return await db.sideQuests.update(id, updates);
}

export async function bulkAddSideQuests(quests) {
  return await db.sideQuests.bulkAdd(
    quests.map(q => ({ ...q, status: 'active', createdAt: new Date().toISOString() }))
  );
}

// --- Daily Quests ---

export async function getDailyQuests(date) {
  return await db.dailyQuests.where('date').equals(date).toArray();
}

export async function getTodayQuests() {
  const today = new Date().toISOString().split('T')[0];
  return await getDailyQuests(today);
}

export async function addDailyQuest(quest) {
  const today = new Date().toISOString().split('T')[0];
  return await db.dailyQuests.add({
    ...quest,
    date: quest.date || today,
    status: 'active',
    createdAt: new Date().toISOString(),
  });
}

export async function updateDailyQuest(id, updates) {
  return await db.dailyQuests.update(id, updates);
}

export async function bulkAddDailyQuests(quests) {
  const today = new Date().toISOString().split('T')[0];
  return await db.dailyQuests.bulkAdd(
    quests.map(q => ({
      ...q,
      date: q.date || today,
      status: 'active',
      createdAt: new Date().toISOString(),
    }))
  );
}

// --- Quest Log ---

export async function addToQuestLog(entry) {
  return await db.questLog.add({
    ...entry,
    completedAt: new Date().toISOString(),
  });
}

export async function getQuestLog() {
  return await db.questLog.reverse().sortBy('completedAt');
}

export async function getRecentLog(limit = 20) {
  return await db.questLog.reverse().limit(limit).toArray();
}

// --- Export / Import ---

export async function exportAllData() {
  const profile = await getProfile();
  const settings = await getSettings();
  const questArcs = await db.questArcs.toArray();
  const sideQuests = await db.sideQuests.toArray();
  const dailyQuests = await db.dailyQuests.toArray();
  const questLog = await db.questLog.toArray();

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile,
    settings: { ...settings, geminiKey: '' }, // Don't export API key
    questArcs,
    sideQuests,
    dailyQuests,
    questLog,
  };
}

export async function importAllData(data) {
  if (data.version !== 1) throw new Error('Incompatible data version.');

  await db.transaction('rw', db.profile, db.settings, db.questArcs, db.sideQuests, db.dailyQuests, db.questLog, async () => {
    await db.profile.clear();
    await db.questArcs.clear();
    await db.sideQuests.clear();
    await db.dailyQuests.clear();
    await db.questLog.clear();

    if (data.profile) await db.profile.put(data.profile);
    if (data.questArcs) await db.questArcs.bulkPut(data.questArcs);
    if (data.sideQuests) await db.sideQuests.bulkPut(data.sideQuests);
    if (data.dailyQuests) await db.dailyQuests.bulkPut(data.dailyQuests);
    if (data.questLog) await db.questLog.bulkPut(data.questLog);
  });
}

export async function clearAllData() {
  await db.transaction('rw', db.profile, db.settings, db.questArcs, db.sideQuests, db.dailyQuests, db.questLog, async () => {
    await db.profile.clear();
    await db.settings.clear();
    await db.questArcs.clear();
    await db.sideQuests.clear();
    await db.dailyQuests.clear();
    await db.questLog.clear();
  });
}

export default db;
