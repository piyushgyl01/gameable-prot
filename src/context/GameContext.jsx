import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getProfile, saveProfile, updateProfile as dbUpdateProfile,
  getSettings, saveSettings,
  getQuestArcs, getSideQuests, getTodayQuests,
  addToQuestLog, updateDailyQuest, updateQuestArc, updateSideQuest, addQuestArc,
  bulkAddArcs, bulkAddSideQuests, bulkAddDailyQuests,
  getRecentLog, getChatMessages, addChatMessage, clearChat, removeQuestLogEntryByQuestId,
} from '../lib/db';
import { processQuestCompletion, processQuestReversion, getRequiredXp, getRank } from '../lib/progression';
import { generateDailyQuests, generateNextStoryArc } from '../lib/gemini';
import { checkAchievements, applyTheme } from '../lib/systems';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [questArcs, setQuestArcs] = useState([]);
  const [sideQuests, setSideQuests] = useState([]);
  const [dailyQuests, setDailyQuests] = useState([]);
  const [recentLog, setRecentLog] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [autoGeneratingArcs, setAutoGeneratingArcs] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Load all data from IndexedDB on mount
  const loadAll = useCallback(async () => {
    const [p, s, arcs, sides, daily, log, chat] = await Promise.all([
      getProfile(),
      getSettings(),
      getQuestArcs(),
      getSideQuests(),
      getTodayQuests(),
      getRecentLog(30),
      getChatMessages(),
    ]);
    setProfile(p || null);
    setSettings(s);
    setQuestArcs(arcs);
    setSideQuests(sides);
    setDailyQuests(daily);
    setRecentLog(log);
    setChatMessages(chat);
    setLoading(false);

    // Load unlocked achievements from profile
    if (p?.unlockedAchievements) {
      setUnlockedAchievements(p.unlockedAchievements);
    }

    // Apply saved theme
    if (s?.theme) {
      applyTheme(s.theme);
    }

    return { profile: p, settings: s, arcs, sides, daily };
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // --- Auto-generate daily quests on new day ---
  useEffect(() => {
    if (loading || !settings?.onboardingComplete || !settings?.geminiKey || !profile) return;
    if (dailyQuests.length > 0) return;
    if (autoGenerating) return;

    // Cooldown persists across refreshes — prevents quota burn on reload loops
    const cooldownUntil = localStorage.getItem('gameable_api_cooldown');
    if (cooldownUntil && Date.now() < parseInt(cooldownUntil)) {
      const remaining = parseInt(cooldownUntil) - Date.now();
      const timer = setTimeout(() => {
        localStorage.removeItem('gameable_api_cooldown');
        setAutoGenerating(false);
      }, remaining);
      return () => clearTimeout(timer);
    }

    const doAutoGenerate = async () => {
      setAutoGenerating(true);
      try {
        // --- Reset recurring side quests ---
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        let sidesUpdated = false;

        for (const sq of sideQuests) {
          if (sq.status === 'completed' && sq.updatedAt) {
            const updatedTime = new Date(sq.updatedAt).getTime();
            let shouldReset = false;
            
            if (sq.frequency === 'daily' && updatedTime < startOfToday) {
              shouldReset = true;
            } else if (sq.frequency === 'weekly' && (now.getTime() - updatedTime) > 7 * 24 * 60 * 60 * 1000) {
              shouldReset = true;
            } else if (!sq.frequency) { // fallback reset
              shouldReset = true;
            }

            if (shouldReset) {
              await updateSideQuest(sq.id, { status: 'active', updatedAt: now.toISOString() });
              sidesUpdated = true;
            }
          }
        }
        
        let currentSides = sideQuests;
        if (sidesUpdated) {
          currentSides = await getSideQuests();
          setSideQuests(currentSides);
        }

        const activeArcs = questArcs.filter(a => a.status === 'active');
        const activeSides = currentSides.filter(q => q.status === 'active');
        const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
        const recentCompletions = recentLog.filter(l => new Date(l.completedAt) > weekAgo);

        const quests = await generateDailyQuests(settings.geminiKey, {
          activeArcs,
          activeSideQuests: activeSides,
          recentCompletions,
          profile,
        });
        await bulkAddDailyQuests(quests);
        const updated = await getTodayQuests();
        setDailyQuests(updated);
        localStorage.removeItem('gameable_api_cooldown');
      } catch (err) {
        console.error('Auto daily generation failed:', err);
        // 5-minute cooldown — prevents quota death spiral
        localStorage.setItem('gameable_api_cooldown', String(Date.now() + 300000));
        setTimeout(() => setAutoGenerating(false), 300000);
        return;
      }
      setAutoGenerating(false);
    };

    doAutoGenerate();
  }, [loading, settings, profile, dailyQuests.length, autoGenerating, questArcs, sideQuests, recentLog]);

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

  // --- Streak Logic ---
  const updateStreak = async () => {
    const today = new Date().toISOString().split('T')[0];
    const todayQuests = await getTodayQuests();
    const completedCount = todayQuests.filter(q => q.status === 'completed').length;
    const allDone = completedCount >= 4;

    if (!allDone) return;

    const lastDate = profile.lastCompletedDate || '';
    const currentStreak = profile.currentStreak || 0;
    const longestStreak = profile.longestStreak || 0;

    // Calculate yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak;
    if (lastDate === yesterdayStr) {
      newStreak = currentStreak + 1; // Consecutive day
    } else if (lastDate === today) {
      newStreak = currentStreak; // Already counted today
    } else {
      newStreak = 1; // Streak broken, start fresh
    }

    const newLongest = Math.max(longestStreak, newStreak);
    // Streak bonus: +5 XP per streak day (capped at +50)
    const streakBonus = Math.min(newStreak * 5, 50);

    await dbUpdateProfile({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastCompletedDate: today,
      xp: (profile.xp || 0) + streakBonus,
    });

    setProfile(prev => ({
      ...prev,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastCompletedDate: today,
      xp: (prev.xp || 0) + streakBonus,
    }));

    return { streakBonus, newStreak };
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

    // Check if all dailies are now done → update streak
    const updatedDaily = await getTodayQuests();
    if (updatedDaily.filter(q => q.status === 'completed').length === 4) {
      await updateStreak();
    }

    return result;
  };

  const uncompleteDaily = async (questId) => {
    const quest = dailyQuests.find(q => q.id === questId);
    if (!quest || quest.status !== 'completed') return;

    // 1. Revert quest status
    await updateDailyQuest(questId, { status: 'active' });

    // 2. Remove from quest log
    await removeQuestLogEntryByQuestId(questId);

    // 3. Revert XP and stats
    const result = processQuestReversion('daily', quest.pillar, profile.level, profile.xp);
    const statUpdates = {};
    for (const [key, val] of Object.entries(result.statGains)) {
      statUpdates[key] = Math.max(0, (profile[key] || 0) - val); // Don't drop below 0
    }

    // Streak logic check: If reverting this means today isn't fully complete anymore,
    // we don't automatically break their streak, but we might remove today's lastCompletedDate 
    // so they have to earn it again.
    const today = new Date().toISOString().split('T')[0];
    const streakUpdates = {};
    if (profile.lastCompletedDate === today) {
      // Revert streak by 1 and remove lastCompletedDate since today is no longer fully complete
      streakUpdates.currentStreak = Math.max(0, (profile.currentStreak || 1) - 1);
      streakUpdates.lastCompletedDate = null; // Forces them to re-earn today's streak
      // Subtract the streak bonus XP (5 XP per streak day, max 50)
      const removedStreakBonus = Math.min((profile.currentStreak || 1) * 5, 50);
      result.newXp = Math.max(0, result.newXp - removedStreakBonus);
      if (result.newXp === 0 && result.newLevel > 1) {
        // Handle possible de-leveling from streak bonus loss
        result.newLevel--;
        result.newXp += getRequiredXp(result.newLevel);
      }
    }

    await dbUpdateProfile({ level: result.newLevel, xp: result.newXp, ...statUpdates, ...streakUpdates });
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

    // If arc is fully completed, generate the next one automatically
    if (allDone) {
      setAutoGeneratingArcs(true);
      setToastMessage(`Arc complete! Generating next ${arc.pillar} arc...`);
      try {
        const nextArc = await generateNextStoryArc(settings.geminiKey, {
          profile,
          completedArc: { ...arc, desc: arc.desc || 'N/A' },
        });
        await addQuestArc(nextArc);
        await loadAll();
        setToastMessage(`New Story Arc: ${nextArc.title}`);
      } catch (err) {
        console.error('Failed to auto-generate next arc:', err);
        setToastMessage('Arc complete! Next arc will generate later.');
      }
      setTimeout(() => setToastMessage(null), 4000);
      setAutoGeneratingArcs(false);
    }

    return result;
  };

  const completeSideQuest = async (questId) => {
    const quest = sideQuests.find(q => q.id === questId);
    if (!quest) return;

    await updateSideQuest(questId, { status: 'completed', updatedAt: new Date().toISOString() });
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

  // --- Chat ---
  const sendChatMessage = async (content) => {
    await addChatMessage('user', content);
    setChatMessages(prev => [...prev, { role: 'user', content, createdAt: new Date().toISOString() }]);
  };

  const addArchitectReply = async (content) => {
    await addChatMessage('architect', content);
    setChatMessages(prev => [...prev, { role: 'architect', content, createdAt: new Date().toISOString() }]);
  };

  const resetChat = async () => {
    await clearChat();
    setChatMessages([]);
  };

  // --- Achievement Check ---
  const runAchievementCheck = async () => {
    if (!profile) return;
    const newlyUnlocked = checkAchievements(profile, recentLog, unlockedAchievements);
    if (newlyUnlocked.length > 0) {
      const newIds = [...unlockedAchievements, ...newlyUnlocked.map(a => a.id)];
      setUnlockedAchievements(newIds);
      await dbUpdateProfile({ unlockedAchievements: newIds });
      // Show toast for first new one
      setToastMessage(`🏅 Achievement Unlocked: ${newlyUnlocked[0].title}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Run achievement check whenever profile or log changes
  useEffect(() => {
    if (!loading && profile) {
      runAchievementCheck();
    }
  }, [loading, profile?.level, profile?.healthStat, profile?.wealthStat, profile?.relationshipsStat, recentLog.length]);

  const value = {
    loading,
    autoGenerating,
    autoGeneratingArcs,
    profile,
    settings,
    questArcs,
    sideQuests,
    dailyQuests,
    recentLog,
    chatMessages,
    unlockedAchievements,
    toastMessage,
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
    uncompleteDaily,
    completeArcStep,
    completeSideQuest,
    sendChatMessage,
    addArchitectReply,
    resetChat,
    loadAll,
    setToastMessage,
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
