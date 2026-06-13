import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export function GameProvider({ children }) {
  // Load initial state from local storage or default to onboarding
  const [appState, setAppState] = useState(() => {
    const saved = localStorage.getItem('cleanLife_appState');
    return saved || 'onboarding'; // 'onboarding', 'dashboard'
  });

  const [geminiKey, setGeminiKey] = useState(() => {
    return localStorage.getItem('cleanLife_geminiKey') || '';
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('cleanLife_profile');
    if (saved) return JSON.parse(saved);
    return {
      endgame: '',
      current: '',
      level: 1,
      xp: 0,
      stats: { health: 0, wealth: 0, relationships: 0 }
    };
  });

  const [quests, setQuests] = useState(() => {
    const saved = localStorage.getItem('cleanLife_quests');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Save to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem('cleanLife_appState', appState);
    localStorage.setItem('cleanLife_geminiKey', geminiKey);
    localStorage.setItem('cleanLife_profile', JSON.stringify(profile));
    localStorage.setItem('cleanLife_quests', JSON.stringify(quests));
  }, [appState, geminiKey, profile, quests]);

  // Actions
  const saveApiKey = (key) => {
    setGeminiKey(key);
  };

  const updateProfile = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const finishOnboarding = (generatedQuests) => {
    setQuests(generatedQuests);
    setAppState('dashboard');
  };

  const resetProgress = () => {
    if (window.confirm("Are you sure you want to completely reset? This will erase all quests and progress.")) {
      setAppState('onboarding');
      setQuests([]);
      setProfile({
        endgame: '', current: '', level: 1, xp: 0,
        stats: { health: 0, wealth: 0, relationships: 0 }
      });
    }
  };

  const getRequiredXp = (level) => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  };

  const completeQuest = (questId) => {
    setQuests(prev => prev.map(q => 
      q.id === questId ? { ...q, status: 'completed' } : q
    ));

    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    // Grant XP and Stats based on quest pillar
    let xpGain = quest.type === 'main' ? 100 : quest.type === 'story' ? 50 : 20;
    
    setProfile(prev => {
      let newXp = prev.xp + xpGain;
      let newLevel = prev.level;
      let reqXp = getRequiredXp(newLevel);
      
      while (newXp >= reqXp) {
        newXp -= reqXp;
        newLevel++;
        reqXp = getRequiredXp(newLevel);
      }

      const newStats = { ...prev.stats };
      if (quest.pillar === 'health') newStats.health += 1;
      if (quest.pillar === 'wealth') newStats.wealth += 1;
      if (quest.pillar === 'relationships') newStats.relationships += 1;

      return { ...prev, level: newLevel, xp: newXp, stats: newStats };
    });
  };

  return (
    <GameContext.Provider value={{
      appState, setAppState,
      geminiKey, saveApiKey,
      profile, updateProfile,
      quests, setQuests,
      finishOnboarding, completeQuest, getRequiredXp, resetProgress
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
