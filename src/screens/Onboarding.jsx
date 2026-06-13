import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { generateQuests } from '../lib/gemini';

export default function Onboarding() {
  const { geminiKey, saveApiKey, profile, updateProfile, finishOnboarding } = useGame();
  
  // Steps: 1: Key, 2: Goals, 3: Loading, 4: Review
  const [step, setStep] = useState(geminiKey ? 2 : 1);
  const [keyInput, setKeyInput] = useState(geminiKey);
  const [endgame, setEndgame] = useState(profile.endgame);
  const [current, setCurrent] = useState(profile.current);
  
  const [loadingMsg, setLoadingMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedQuests, setGeneratedQuests] = useState([]);

  const handleSaveKey = () => {
    if (!keyInput.trim()) {
      setErrorMsg("API Key cannot be empty.");
      return;
    }
    saveApiKey(keyInput.trim());
    setErrorMsg('');
    setStep(2);
  };

  const handleGenerate = async () => {
    if (!endgame.trim() || !current.trim()) {
      setErrorMsg("Please fill out both fields.");
      return;
    }
    
    updateProfile({ endgame, current });
    setErrorMsg('');
    setStep(3);
    setLoadingMsg('Consulting the AI... This may take a few seconds.');
    
    try {
      const quests = await generateQuests(geminiKey || keyInput, endgame, current);
      setGeneratedQuests(quests);
      setStep(4);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate quests. Please check your API key and try again.');
      setStep(2);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 500, padding: 32 }}>
        
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Welcome to Life RPG</h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: 24, fontSize: 14, lineHeight: 1.5 }}>
              To generate deeply personalized quests, we use Google's Gemini AI. 
              Please provide your API key. It is stored locally in your browser.
            </p>
            
            {errorMsg && <div style={{ color: 'var(--color-health)', fontSize: 13, marginBottom: 12 }}>{errorMsg}</div>}
            
            <input 
              type="password" 
              placeholder="Paste Gemini API Key here..."
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              style={{ marginBottom: 20 }}
            />
            
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSaveKey}>
              Save & Continue
            </button>
            
            <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              Get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>Google AI Studio</a>.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800 }}>Chart Your Course</h1>
              <button className="btn" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setStep(1)}>
                Edit Key
              </button>
            </div>

            {errorMsg && <div style={{ color: 'var(--color-health)', fontSize: 13, marginBottom: 12 }}>{errorMsg}</div>}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 8 }}>
                What is your ultimate Endgame?
              </label>
              <input 
                type="text" 
                placeholder="e.g. Become a successful indie game dev"
                value={endgame}
                onChange={e => setEndgame(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 8 }}>
                What is your current position?
              </label>
              <input 
                type="text" 
                placeholder="e.g. Working a 9-5, learning React"
                value={current}
                onChange={e => setCurrent(e.target.value)}
              />
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleGenerate}>
              Generate My Quests
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ 
              width: 40, height: 40, border: '4px solid var(--border-color)', 
              borderTopColor: 'var(--accent-primary)', borderRadius: '50%', 
              animation: 'spin 1s linear infinite', margin: '0 auto 24px' 
            }} />
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{loadingMsg}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Structuring your life into a game...</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Destiny Revealed</h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: 24, fontSize: 14 }}>
              The AI has structured your path. Review your initial quests below.
            </p>

            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 24, paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {generatedQuests.map((q, idx) => (
                <div key={idx} style={{ padding: 16, background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>{q.type} Quest</div>
                    <div className={`badge badge-${q.pillar}`}>{q.pillar}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{q.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{q.desc}</div>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => finishOnboarding(generatedQuests)}>
              Accept Quests & Begin
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
