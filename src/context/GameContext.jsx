import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MAIN_QUESTS, INITIAL_STORY_QUESTS, INITIAL_WORLD_QUESTS } from '../lib/quests';
import { loadGameState, saveGameState, clearGameState, importGameState } from '../lib/storage';
import { playSound } from '../lib/sounds';
import {
  getTodayString, xpRequired, xpMultiplier, getRankIndex,
  MAX_ENERGY, stringHash, seededShuffle, getRankLabel
} from '../lib/systems';

import { fetchCloudSave, pushCloudSave } from '../lib/api';

const GameContext = createContext(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
}

function buildDailyPool(mast, cust, day) {
  const res = [];
  MAIN_QUESTS.forEach((mq) => {
    const rk = getRankIndex(mast[mq.id] || 0);
    const maxTier = rk >= 4 ? 3 : rk >= 2 ? 2 : 1;
    let pool = mq.subs.filter((s) => {
      if (s.t > maxTier) return false;
      if (s.req) {
        const reqRank = getRankIndex(mast[s.req.mq] || 0);
        if (reqRank < s.req.r) return false;
      }
      return true;
    });
    if (cust[mq.id]) {
      pool = pool.concat(cust[mq.id].map((c) => ({ ...c, t: 1 })));
    }
    const shuffled = seededShuffle(pool, stringHash(day + mq.id));
    shuffled.slice(0, Math.min(mq.pk, pool.length)).forEach((s) => {
      res.push({
        id: s.id, t: s.t, ic: s.ic, nm: s.nm, ds: s.ds,
        en: s.en, xp: s.xp, df: s.df,
        mqId: mq.id, mqNm: mq.nm, mqIc: mq.ic, pillar: mq.p,
      });
    });
  });
  return res;
}

export function GameProvider({ children }) {
  const [phase, setPhase] = useState('loading');

  // Player
  const [name, setName] = useState('');
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [energy, setEnergy] = useState(MAX_ENERGY);
  const [theme, setTheme] = useState('dark');
  const [hp, setHp] = useState(100);
  const [gold, setGold] = useState(0);

  // Progress
  const [mastery, setMastery] = useState({});
  const [streaks, setStreaks] = useState({});
  const [history, setHistory] = useState({});
  const [totalXp, setTotalXp] = useState(0);
  const [gameDate, setGameDate] = useState(getTodayString());

  // Daily & Logging
  const [dailyXp, setDailyXp] = useState(0);
  const [chainBonus, setChainBonus] = useState({ pillar: null, count: 0 });
  const [activityLog, setActivityLog] = useState([]);
  const [dailyPool, setDailyPool] = useState([]);
  const [questStates, setQuestStates] = useState({});

  // Custom data
  const [customQuests, setCustomQuests] = useState({});
  const [storyQuests, setStoryQuests] = useState(INITIAL_STORY_QUESTS);
  const [worldQuests, setWorldQuests] = useState(INITIAL_WORLD_QUESTS);
  const [rewards, setRewards] = useState([]);

  // UI transient
  const [toastMsg, setToastMsg] = useState(null);
  const [levelUpAlert, setLevelUpAlert] = useState(null);
  const [rankUpAlert, setRankUpAlert] = useState(null);
  const [floatingXp, setFloatingXp] = useState(null);

  const addToLog = useCallback((msg) => {
    setActivityLog(prev => [{ time: Date.now(), msg }, ...prev].slice(0, 100));
  }, []);

  const loadFromData = useCallback((data) => {
    setName(data.name);
    setXp(data.xp || 0);
    setLevel(data.level || 1);
    setEnergy(data.energy != null ? data.energy : MAX_ENERGY);
    setTheme(data.theme || 'dark');
    setHp(data.hp != null ? data.hp : 100);
    setGold(data.gold || 0);
    setMastery(data.mastery || {});
    setStreaks(data.streaks || {});
    setHistory(data.history || {});
    setTotalXp(data.totalXp || 0);
    setCustomQuests(data.customQuests || {});
    setStoryQuests(data.storyQuests || INITIAL_STORY_QUESTS);
    setWorldQuests(data.worldQuests || INITIAL_WORLD_QUESTS);
    setRewards(data.rewards || []);
    setActivityLog(data.activityLog || []);

    const today = getTodayString();
    if (data.gameDate !== today) {
      // Process new day penalties
      let penalty = 0;
      if (data.questStates) {
        Object.values(data.questStates).forEach(qs => {
          if (qs.s === 'active') penalty += 10;
        });
      }
      if (penalty > 0) {
        setHp((prev) => {
          const newHp = prev - penalty;
          if (newHp <= 0) {
            setLevel(l => Math.max(1, l - 1));
            return 100;
          }
          return newHp;
        });
      }

      setEnergy(MAX_ENERGY);
      setQuestStates({});
      setDailyXp(0);
      setChainBonus({ pillar: null, count: 0 });
      setGameDate(today);
      setDailyPool(buildDailyPool(data.mastery || {}, data.customQuests || {}, today));
    } else {
      setGameDate(data.gameDate);
      setQuestStates(data.questStates || {});
      setDailyXp(data.dailyXp || 0);
      setChainBonus(data.chainBonus || { pillar: null, count: 0 });
      setDailyPool(data.dailyPool || buildDailyPool(data.mastery || {}, data.customQuests || {}, today));
    }
  }, []);

  useEffect(() => {
    fetchCloudSave().then(data => {
      if (data && data.name) {
        loadFromData(data);
        setPhase('play');
      } else {
        setPhase('enter');
      }
    });
  }, [loadFromData]);

  useEffect(() => {
    if (phase !== 'play') return;
    const id = setTimeout(() => {
      pushCloudSave({
        name, xp, level, energy, theme, hp, gold, mastery, streaks, history, totalXp,
        gameDate, dailyXp, chainBonus, activityLog, customQuests, storyQuests,
        worldQuests, rewards, dailyPool, questStates,
      });
    }, 600);
    return () => clearTimeout(id);
  }, [
    phase, name, xp, level, energy, theme, hp, gold, mastery, streaks, history, totalXp,
    gameDate, dailyXp, chainBonus, activityLog, customQuests, storyQuests,
    worldQuests, rewards, dailyPool, questStates
  ]);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  }, []);

  function earnXp(amount, sourceId) {
    const earned = Math.round(amount * xpMultiplier(level));
    setTotalXp((p) => p + earned);
    setDailyXp((p) => p + earned);
    setGold((p) => p + Math.round(earned / 2));
    
    const today = getTodayString();
    setHistory(prev => {
      const todayData = prev[today] || { count: 0, xp: 0 };
      // Fallback for old history data shape
      if (typeof todayData === 'number') {
        return { ...prev, [today]: { count: todayData + (sourceId ? 1 : 0), xp: earned } };
      }
      return { ...prev, [today]: { 
        count: (todayData.count || 0) + (sourceId ? 1 : 0), 
        xp: (todayData.xp || 0) + earned 
      }};
    });

    if (sourceId) {
      setFloatingXp({ id: sourceId, amount: earned });
      setTimeout(() => setFloatingXp(null), 1200);
    }
    setXp((prev) => {
      let current = prev + earned;
      let lv = level;
      while (current >= xpRequired(lv)) {
        current -= xpRequired(lv);
        lv++;
      }
      if (lv > level) {
        setLevel(lv);
        setLevelUpAlert(lv);
        playSound('levelUp');
        setTimeout(() => setLevelUpAlert(null), 3000);
        addToLog(`Leveled up to Lv ${lv}!`);
      }
      return current;
    });
    return earned;
  }

  function startApp(n) {
    setName(n);
    const today = getTodayString();
    setGameDate(today);
    setDailyPool(buildDailyPool({}, {}, today));
    setPhase('play');
  }

  function doNewDay() {
    let penalty = 0;
    Object.values(questStates).forEach(qs => {
      if (qs.s === 'active') penalty += 10;
    });
    
    if (penalty > 0) {
      setHp(prev => {
        const newHp = prev - penalty;
        if (newHp <= 0) {
          setLevel(l => Math.max(1, l - 1));
          showToast('HP hit 0. Lost 1 Level.');
          return 100;
        }
        showToast(`Missed quests! Lost ${penalty} HP.`);
        return newHp;
      });
    } else {
      showToast('New day started');
    }

    const today = getTodayString();
    setGameDate(today);
    setEnergy(MAX_ENERGY);
    setQuestStates({});
    setDailyXp(0);
    setChainBonus({ pillar: null, count: 0 });
    setDailyPool(buildDailyPool(mastery, customQuests, today));
    addToLog('Started a new day');
  }

  function startQuest(q) {
    if (energy < q.en) { showToast('Not enough energy'); return; }
    setEnergy((e) => e - q.en);
    setQuestStates((prev) => ({ ...prev, [q.id]: { s: 'active', en: q.en } }));
    playSound('start');
    addToLog(`Started ${q.nm} (${q.mqNm})`);
  }

  function skipQuest(q) {
    const mq = MAIN_QUESTS.find((x) => x.id === q.mqId);
    if (!mq) return;
    const rk = getRankIndex(mastery[mq.id] || 0);
    const maxTier = rk >= 4 ? 3 : rk >= 2 ? 2 : 1;
    let pool = mq.subs.filter((s) => {
      if (s.t > maxTier) return false;
      if (s.req && getRankIndex(mastery[s.req.mq] || 0) < s.req.r) return false;
      return true;
    });
    if (customQuests[mq.id]) pool = pool.concat(customQuests[mq.id].map((c) => ({ ...c, t: 1 })));
    const currentIds = dailyPool.filter((d) => d.mqId === q.mqId).map((d) => d.id);
    const available = pool.filter((s) => !currentIds.includes(s.id));
    if (!available.length) { showToast('No alternatives'); return; }
    const pick = available[Math.floor(Math.random() * available.length)];
    setDailyPool((prev) => prev.map((d) =>
      d.id === q.id
        ? { ...pick, mqId: mq.id, mqNm: mq.nm, mqIc: mq.ic, pillar: mq.p }
        : d
    ));
    addToLog(`Skipped ${q.nm}`);
  }

  function completeQuest(q) {
    const st = questStates[q.id];
    if (!st || st.s !== 'active') return;
    
    // Chain bonus logic
    let multiplier = 1;
    setChainBonus(prev => {
      if (prev.pillar === q.pillar) {
        multiplier = 1 + ((prev.count + 1) * 0.1);
        if (prev.count >= 2) showToast(`Chain Bonus: x${multiplier.toFixed(1)} XP!`);
        return { pillar: q.pillar, count: prev.count + 1 };
      }
      return { pillar: q.pillar, count: 1 };
    });

    setQuestStates((prev) => ({ ...prev, [q.id]: { s: 'done', en: st.en } }));
    playSound('complete');

    const today = getTodayString();
    setStreaks((prev) => {
      const old = prev[q.mqId] || { c: 0, d: '' };
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      let nc = (old.d === yStr || old.d === today) ? old.c + 1 : 1;
      if (old.d === today) nc = old.c;
      return { ...prev, [q.mqId]: { c: nc, d: today } };
    });

    // Mastery & Rank up
    let rankUp = false;
    let oldRank = 0;
    let newRank = 0;
    setMastery((prev) => {
      const oldComp = prev[q.mqId] || 0;
      oldRank = getRankIndex(oldComp);
      const newComp = oldComp + 1;
      newRank = getRankIndex(newComp);
      if (newRank > oldRank) rankUp = true;
      return { ...prev, [q.mqId]: newComp };
    });

    if (rankUp) {
      const lbl = getRankLabel(newRank);
      setRankUpAlert(`${q.mqNm} reached Rank ${lbl}`);
      playSound('levelUp');
      setTimeout(() => setRankUpAlert(null), 3000);
      addToLog(`Rank Up: ${q.mqNm} reached Rank ${lbl}`);
    }

    const earned = earnXp(Math.round(q.xp * multiplier), q.id);
    addToLog(`Completed ${q.nm} (+${earned} XP)`);
  }

  function toggleStoryTask(chapterId, taskId) {
    setStoryQuests((prev) => prev.map((ch) => {
      if (ch.id !== chapterId) return ch;
      const t = ch.tasks.find((x) => x.id === taskId);
      if (t && !t.dn) {
        const earned = earnXp(ch.xp, taskId);
        addToLog(`Story Task: ${t.tx} (+${earned} XP)`);
        playSound('complete');
      }
      return { ...ch, tasks: ch.tasks.map((x) => x.id === taskId ? { ...x, dn: !x.dn } : x) };
    }));
  }

  function toggleWorldTask(worldId, taskId) {
    setWorldQuests((prev) => prev.map((w) => {
      if (w.id !== worldId) return w;
      const t = w.tasks.find((x) => x.id === taskId);
      if (t && !t.dn) {
        const earned = earnXp(6, taskId);
        addToLog(`World Task: ${t.tx} (+${earned} XP)`);
        playSound('complete');
      }
      return { ...w, tasks: w.tasks.map((x) => x.id === taskId ? { ...x, dn: !x.dn } : x) };
    }));
  }

  function resetGame() {
    clearGameState();
    setPhase('enter');
    setName(''); setXp(0); setLevel(1); setEnergy(MAX_ENERGY);
    setTheme('dark'); setHp(100); setGold(0); setMastery({}); setStreaks({}); setHistory({});
    setTotalXp(0); setDailyXp(0); setChainBonus({ pillar: null, count: 0 });
    setActivityLog([]); setCustomQuests({}); setRewards([]);
    setStoryQuests(INITIAL_STORY_QUESTS); setWorldQuests(INITIAL_WORLD_QUESTS);
    setQuestStates({});
  }

  function triggerImport(file) {
    importGameState(file, (success) => {
      if (success) {
        const data = loadGameState();
        loadFromData(data);
        showToast('Save imported successfully');
      } else {
        showToast('Failed to import save');
      }
    });
  }

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <GameContext.Provider value={{
      phase, startApp, resetGame, triggerImport,
      name, xp, level, energy, theme, toggleTheme, hp, setHp, gold, setGold,
      mastery, streaks, history, totalXp, dailyXp, chainBonus, activityLog,
      customQuests, setCustomQuests, rewards, setRewards,
      storyQuests, setStoryQuests, toggleStoryTask,
      worldQuests, setWorldQuests, toggleWorldTask,
      dailyPool, questStates, startQuest, skipQuest, completeQuest, doNewDay,
      toastMsg, showToast, levelUpAlert, rankUpAlert, floatingXp
    }}>
      {children}
    </GameContext.Provider>
  );
}
