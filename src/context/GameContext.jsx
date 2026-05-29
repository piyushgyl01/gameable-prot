import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MAIN_QUESTS, INITIAL_STORY_QUESTS, INITIAL_WORLD_QUESTS } from '../lib/quests';
import { loadGameState, saveGameState, clearGameState } from '../lib/storage';
import { getTodayString, xpRequired, xpMultiplier, getRankIndex, MAX_ENERGY, stringHash, seededShuffle } from '../lib/systems';

const GameContext = createContext(null);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
}

export function GameProvider({ children }) {
  const [phase, setPhase] = useState("loading");
  
  // Player stats
  const [name, setName] = useState("");
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [energy, setEnergy] = useState(MAX_ENERGY);
  
  // Progress
  const [mastery, setMastery] = useState({}); // { [pillarId]: completions }
  const [streaks, setStreaks] = useState({}); // { [pillarId]: { c: count, d: lastDate } }
  const [history, setHistory] = useState({}); // { [date]: completions }
  const [totalXp, setTotalXp] = useState(0);
  const [gameDate, setGameDate] = useState(getTodayString());
  
  // Custom Data
  const [customQuests, setCustomQuests] = useState({});
  const [storyQuests, setStoryQuests] = useState(INITIAL_STORY_QUESTS);
  const [worldQuests, setWorldQuests] = useState(INITIAL_WORLD_QUESTS);
  
  // Daily Quests
  const [dailyPool, setDailyPool] = useState([]);
  const [questStates, setQuestStates] = useState({}); // { [id]: { s: "idle"|"active"|"done", en: energy } }
  
  // Transient UI states (level up flashes, toasts)
  const [toastMsg, setToastMsg] = useState(null);
  const [levelUpAlert, setLevelUpAlert] = useState(null);

  // Initialize
  useEffect(() => {
    const data = loadGameState();
    if (data && data.name) {
      setName(data.name);
      setXp(data.xp || 0);
      setLevel(data.level || 1);
      setEnergy(data.energy != null ? data.energy : MAX_ENERGY);
      setMastery(data.mastery || {});
      setStreaks(data.streaks || {});
      setHistory(data.history || {});
      setTotalXp(data.totalXp || 0);
      setCustomQuests(data.customQuests || {});
      setStoryQuests(data.storyQuests || INITIAL_STORY_QUESTS);
      setWorldQuests(data.worldQuests || INITIAL_WORLD_QUESTS);
      
      const today = getTodayString();
      if (data.gameDate !== today) {
        // New day reset
        setEnergy(MAX_ENERGY);
        setQuestStates({});
        setGameDate(today);
        setDailyPool(buildDailyPool(data.mastery || {}, data.customQuests || {}, today));
      } else {
        setGameDate(data.gameDate);
        setQuestStates(data.questStates || {});
        setDailyPool(data.dailyPool || buildDailyPool(data.mastery || {}, data.customQuests || {}, today));
      }
      setPhase("play");
    } else {
      setPhase("enter");
    }
  }, []);

  // Save changes
  useEffect(() => {
    if (phase !== "play") return;
    const timeout = setTimeout(() => {
      saveGameState({
        name, xp, level, energy, mastery, streaks, history, totalXp,
        gameDate, customQuests, storyQuests, worldQuests,
        dailyPool, questStates
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [phase, name, xp, level, energy, mastery, streaks, history, totalXp, gameDate, customQuests, storyQuests, worldQuests, dailyPool, questStates]);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  }, []);

  function buildDailyPool(mast, cust, dayDate) {
    let res = [];
    MAIN_QUESTS.forEach(mq => {
      const rk = getRankIndex(mast[mq.id] || 0);
      const maxTier = rk >= 4 ? 3 : rk >= 2 ? 2 : 1;
      let pool = mq.subs.filter(s => s.t <= maxTier);
      if (cust[mq.id]) {
        pool = pool.concat(cust[mq.id].map(c => ({ ...c, t: 1 })));
      }
      const shuffled = seededShuffle(pool, stringHash(dayDate + mq.id));
      const picked = shuffled.slice(0, Math.min(mq.pk, pool.length));
      
      picked.forEach(s => {
        res.push({
          id: s.id, t: s.t, ic: s.ic, nm: s.nm, ds: s.ds, en: s.en, xp: s.xp, df: s.df,
          mqId: mq.id, mqNm: mq.nm, mqIc: mq.ic, pillar: mq.p
        });
      });
    });
    return res;
  }

  function startApp(n) {
    setName(n);
    const today = getTodayString();
    setGameDate(today);
    setDailyPool(buildDailyPool({}, {}, today));
    setPhase("play");
  }

  function doNewDay() {
    const today = getTodayString();
    setGameDate(today);
    setEnergy(MAX_ENERGY);
    setQuestStates({});
    setDailyPool(buildDailyPool(mastery, customQuests, today));
    showToast("New Day Generated");
  }

  function earnXp(amount) {
    const earned = Math.round(amount * xpMultiplier(level));
    setTotalXp(p => p + earned);
    setXp(p => {
      let current = p + earned;
      let currentLv = level;
      while (current >= xpRequired(currentLv)) {
        current -= xpRequired(currentLv);
        currentLv++;
      }
      if (currentLv > level) {
        setLevel(currentLv);
        setLevelUpAlert(currentLv);
        setTimeout(() => setLevelUpAlert(null), 3000);
      }
      return current;
    });
    return earned;
  }

  function startQuest(q) {
    if (energy < q.en) {
      showToast("Not enough energy");
      return;
    }
    setEnergy(e => e - q.en);
    setQuestStates(prev => ({ ...prev, [q.id]: { s: "active", en: q.en } }));
    showToast(`Started: ${q.nm}`);
  }

  function skipQuest(q) {
    const mq = MAIN_QUESTS.find(x => x.id === q.mqId);
    if (!mq) return;
    const rk = getRankIndex(mastery[mq.id] || 0);
    const maxTier = rk >= 4 ? 3 : rk >= 2 ? 2 : 1;
    let pool = mq.subs.filter(s => s.t <= maxTier);
    if (customQuests[mq.id]) {
        pool = pool.concat(customQuests[mq.id].map(c => ({ ...c, t: 1 })));
    }
    const currentIds = dailyPool.filter(d => d.mqId === q.mqId).map(d => d.id);
    const available = pool.filter(s => !currentIds.includes(s.id));
    
    if (!available.length) {
      showToast("No more alternative quests");
      return;
    }
    const pick = available[Math.floor(Math.random() * available.length)];
    
    setDailyPool(prev => prev.map(d => d.id === q.id ? {
      id: pick.id, t: pick.t, ic: pick.ic, nm: pick.nm, ds: pick.ds, en: pick.en, xp: pick.xp, df: pick.df,
      mqId: mq.id, mqNm: mq.nm, mqIc: mq.ic, pillar: mq.p
    } : d));
  }

  function completeQuest(q) {
    const s = questStates[q.id];
    if (!s || s.s !== "active") return;
    
    setQuestStates(prev => ({ ...prev, [q.id]: { s: "done", en: s.en } }));
    
    // Streaks
    setStreaks(prev => {
      const st = prev[q.mqId] || { c: 0, d: "" };
      const today = getTodayString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      
      let newCount = (st.d === yStr || st.d === today) ? st.c + 1 : 1;
      if (st.d === today) newCount = st.c; // already counted today
      return { ...prev, [q.mqId]: { c: newCount, d: today } };
    });

    setHistory(prev => ({ ...prev, [getTodayString()]: (prev[getTodayString()] || 0) + 1 }));
    setMastery(prev => ({ ...prev, [q.mqId]: (prev[q.mqId] || 0) + 1 }));
    
    earnXp(q.xp);
  }

  function toggleStoryTask(chapterId, taskId) {
    setStoryQuests(prev => prev.map(ch => {
      if (ch.id !== chapterId) return ch;
      const t = ch.tasks.find(x => x.id === taskId);
      if (t && !t.dn) earnXp(ch.xp);
      return { ...ch, tasks: ch.tasks.map(x => x.id === taskId ? { ...x, dn: !x.dn } : x) };
    }));
  }

  function toggleWorldTask(worldId, taskId) {
    setWorldQuests(prev => prev.map(w => {
      if (w.id !== worldId) return w;
      const t = w.tasks.find(x => x.id === taskId);
      if (t && !t.dn) earnXp(6); // Minimal XP for pure tasks
      return { ...w, tasks: w.tasks.map(x => x.id === taskId ? { ...x, dn: !x.dn } : x) };
    }));
  }

  function resetGame() {
    clearGameState();
    setPhase("enter");
    setName("");
    setXp(0);
    setLevel(1);
    setEnergy(MAX_ENERGY);
    setMastery({});
    setStreaks({});
    setHistory({});
    setTotalXp(0);
    setCustomQuests({});
    setStoryQuests(INITIAL_STORY_QUESTS);
    setWorldQuests(INITIAL_WORLD_QUESTS);
    setQuestStates({});
  }

  const contextValue = {
    phase, startApp, resetGame,
    name, xp, level, energy, mastery, streaks, history, totalXp,
    customQuests, setCustomQuests,
    storyQuests, setStoryQuests, toggleStoryTask,
    worldQuests, setWorldQuests, toggleWorldTask,
    dailyPool, questStates, startQuest, skipQuest, completeQuest, doNewDay,
    toastMsg, levelUpAlert
  };

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
}
