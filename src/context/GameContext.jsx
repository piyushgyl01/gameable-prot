import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getProfile, saveProfile, updateProfile as dbUpdateProfile,
  getSettings, saveSettings,
  getQuestArcs, getActiveSideQuests, getTodayQuests,
  addToQuestLog, updateDailyQuest, updateQuestArc, updateSideQuest,
  bulkAddArcs, bulkAddSideQuests, bulkAddDailyQuests,
  getRecentLog,
} from '../lib/db';
import { processQuestCompletion, getRequiredXp, getRank } from '../lib/progression';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [questArcs, setQuestArcs] = useState([]);
  const [sideQuests, setSideQuests] = useState([]);
  const [dailyQuests, setDailyQuests] = useState([]);
  const [recentLog, setRecentLog] = useState([]);

  // Load all data from IndexedDB on mount
  const loadAll = useCallback(async () => {
    const [p, s, arcs, sides, daily, log] = await Promise.all([
      getProfile(),
      getSettings(),
      getQuestArcs(),
      getActiveSideQuests(),
      getTodayQuests(),
      getRecentLog(30),
    ]);
    setProfile(p || null);
    setSettings(s);
    setQuestArcs(arcs);
    setSideQuests(sides);
    setDailyQuests(daily);
    setRecentLog(log);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // --- Actions ---

  const updateSettings = async (updates) => {
    const newSettings = { ...settings, ...updates };
    await saveSettings(newSettings);
    setSettings(newSettings);
  };

  const initProfile = async (data) => {
    await saveProfile(data);
    setProfile(data);
  };

  const updateProfileData = async (updates) => {
    await dbUpdateProfile(updates);
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const finishOnboarding = async (arcs, sides) => {
    await bulkAddArcs(arcs);
    await bulkAddSideQuests(sides);
    await updateSettings({ onboardingComplete: true });
    await loadAll();
  };

  const addDailyQuestsBatch = async (quests) => {
    await bulkAddDailyQuests(quests);
    const updated = await getTodayQuests();
    setDailyQuests(updated);
  };

  const completeDaily = async (questId) => {
    const quest = dailyQuests.find(q => q.id === questId);
    if (!quest || quest.status === 'completed') return;

    await updateDailyQuest(questId, { status: 'completed' });
    await addToQuestLog({
      questId,
      questType: 'daily',
      pillar: quest.pillar,
      xpEarned: quest.xpReward || 20,
    });

    const result = processQuestCompletion('daily', quest.pillar, profile.level, profile.xp);
    const statUpdates = {};
    for (const [key, val] of Object.entries(result.statGains)) {
      statUpdates[key] = (profile[key] || 0) + val;
    }
    await dbUpdateProfile({ level: result.newLevel, xp: result.newXp, ...statUpdates });

    await loadAll();
    return result;
  };

  const completeArcStep = async (arcId, stepIndex) => {
    const arc = questArcs.find(a => a.id === arcId);
    if (!arc) return;

    const newSteps = arc.steps.map((s, i) => i === stepIndex ? { ...s, done: true } : s);
    const allDone = newSteps.every(s => s.done);

    await updateQuestArc(arcId, {
      steps: newSteps,
      status: allDone ? 'completed' : 'active',
    });

    await addToQuestLog({
      questId: arcId,
      questType: 'story',
      pillar: arc.pillar,
      xpEarned: 50,
    });

    const result = processQuestCompletion('story', arc.pillar, profile.level, profile.xp);
    const statUpdates = {};
    for (const [key, val] of Object.entries(result.statGains)) {
      statUpdates[key] = (profile[key] || 0) + val;
    }
    await dbUpdateProfile({ level: result.newLevel, xp: result.newXp, ...statUpdates });

    await loadAll();
    return result;
  };

  const completeSideQuest = async (questId) => {
    const quest = sideQuests.find(q => q.id === questId);
    if (!quest) return;

    await updateSideQuest(questId, { status: 'completed' });
    await addToQuestLog({
      questId,
      questType: 'side',
      pillar: quest.pillar,
      xpEarned: 30,
    });

    const result = processQuestCompletion('side', quest.pillar, profile.level, profile.xp);
    const statUpdates = {};
    for (const [key, val] of Object.entries(result.statGains)) {
      statUpdates[key] = (profile[key] || 0) + val;
    }
    await dbUpdateProfile({ level: result.newLevel, xp: result.newXp, ...statUpdates });

    await loadAll();
    return result;
  };

  const value = {
    loading,
    profile,
    settings,
    questArcs,
    sideQuests,
    dailyQuests,
    recentLog,
    // Computed
    rank: profile ? getRank(profile.level) : 'Wanderer',
    requiredXp: profile ? getRequiredXp(profile.level) : 100,
    // Actions
    updateSettings,
    initProfile,
    updateProfileData,
    finishOnboarding,
    addDailyQuestsBatch,
    completeDaily,
    completeArcStep,
    completeSideQuest,
    loadAll,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
