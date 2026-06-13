import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { generateOnboardingQuests } from '../lib/gemini';
import { PILLARS } from '../lib/progression';

const TOTAL_STEPS = 9;

export default function Onboarding() {
  const { settings, updateSettings, initProfile, finishOnboarding } = useGame();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [healthNotes, setHealthNotes] = useState('');
  const [wealthNotes, setWealthNotes] = useState('');
  const [relationshipsNotes, setRelationshipsNotes] = useState('');
  const [endgame, setEndgame] = useState('');
  const [current, setCurrent] = useState('');
  const [apiKey, setApiKey] = useState(settings?.geminiKey || '');
  const [error, setError] = useState('');
  const [generatedData, setGeneratedData] = useState(null);

  const next = () => { setError(''); setStep(s => s + 1); };
  const back = () => { setError(''); setStep(s => s - 1); };

  const handleGenerate = async () => {
    setError('');
    setStep(8); // loading

    const key = apiKey || settings?.geminiKey;
    if (!key) { setError('API key is required.'); setStep(7); return; }

    // Save profile and key
    await updateSettings({ geminiKey: key });
    const profileData = {
      id: 'main', name, endgame, current,
      healthNotes, wealthNotes, relationshipsNotes,
      level: 1, xp: 0,
      healthStat: 0, wealthStat: 0, relationshipsStat: 0,
      createdAt: new Date().toISOString(),
    };
    await initProfile(profileData);

    try {
      const data = await generateOnboardingQuests(key, profileData);
      setGeneratedData(data);
      setStep(9);
    } catch (err) {
      setError(err.message || 'Generation failed.');
      setStep(7);
    }
  };

  const handleAccept = async () => {
    if (!generatedData) return;
    await finishOnboarding(generatedData.storyArcs || [], generatedData.sideQuests || []);
  };

  const canContinue = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 7) return apiKey.trim().length > 0;
    return true;
  };

  const isSkippable = step >= 2 && step <= 6;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-base)' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Step indicator */}
        {step <= 7 && (
          <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 12, color: 'var(--text-muted)' }}>
            {step} / {TOTAL_STEPS}
          </div>
        )}

        <div className="card animate-in" key={step} style={{ padding: 32 }}>

          {/* Step 1: Welcome */}
          {step === 1 && (
            <div>
              <h1 style={{ marginBottom: 8 }}>Welcome to Life RPG</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                Turn your life into a game. Your journey spans three pillars:
              </p>
              <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                {Object.entries(PILLARS).map(([key, p]) => (
                  <div key={key} className="card" style={{ flex: 1, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{p.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: p.color }}>{p.label}</div>
                  </div>
                ))}
              </div>
              <label className="label">What's your name?</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" onKeyDown={e => e.key === 'Enter' && canContinue() && next()} />
            </div>
          )}

          {/* Step 2: Health */}
          {step === 2 && (
            <div>
              <h1 style={{ marginBottom: 4 }}>❤️ Health</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Tell us about your physical and mental health.</p>
              <label className="label">Your health situation</label>
              <textarea rows={4} value={healthNotes} onChange={e => setHealthNotes(e.target.value)} placeholder="Exercise habits, diet, sleep, health goals..." />
            </div>
          )}

          {/* Step 3: Wealth */}
          {step === 3 && (
            <div>
              <h1 style={{ marginBottom: 4 }}>💰 Wealth</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Tell us about your financial and career situation.</p>
              <label className="label">Your wealth situation</label>
              <textarea rows={4} value={wealthNotes} onChange={e => setWealthNotes(e.target.value)} placeholder="Income, savings, career goals, skills you're building..." />
            </div>
          )}

          {/* Step 4: Relationships */}
          {step === 4 && (
            <div>
              <h1 style={{ marginBottom: 4 }}>🤝 Relationships</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Tell us about your social and relational life.</p>
              <label className="label">Your relationships situation</label>
              <textarea rows={4} value={relationshipsNotes} onChange={e => setRelationshipsNotes(e.target.value)} placeholder="Family, friends, networking, relationship goals..." />
            </div>
          )}

          {/* Step 5: Endgame */}
          {step === 5 && (
            <div>
              <h1 style={{ marginBottom: 4 }}>The Endgame</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Describe the ultimate version of yourself.</p>
              <label className="label">Your ideal future</label>
              <textarea rows={4} value={endgame} onChange={e => setEndgame(e.target.value)} placeholder="What does your ideal life look like in 5 years?" />
            </div>
          )}

          {/* Step 6: Current */}
          {step === 6 && (
            <div>
              <h1 style={{ marginBottom: 4 }}>Your Origin</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Where do you honestly stand right now?</p>
              <label className="label">Current position</label>
              <textarea rows={4} value={current} onChange={e => setCurrent(e.target.value)} placeholder="Be honest about where you are today..." />
            </div>
          )}

          {/* Step 7: API Key */}
          {step === 7 && (
            <div>
              <h1 style={{ marginBottom: 4 }}>AI Setup</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                We use Google Gemini to generate your personalized quest plan. Your key is stored locally.
              </p>
              {error && <div style={{ color: 'var(--color-health)', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>{error}</div>}
              <label className="label">Gemini API Key</label>
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Paste your API key..." />
              <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                Get a free key from{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>Google AI Studio</a>.
              </p>
            </div>
          )}

          {/* Step 8: Loading */}
          {step === 8 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 24px' }} />
              <h2 style={{ marginBottom: 8 }}>The Architect is analyzing your path...</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Generating personalized quests from your life data.</p>
            </div>
          )}

          {/* Step 9: Review */}
          {step === 9 && generatedData && (
            <div>
              <h1 style={{ marginBottom: 4 }}>Your Quest Plan</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Review the AI-generated plan for your journey.</p>

              {generatedData.storyArcs && generatedData.storyArcs.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div className="section-title" style={{ marginBottom: 12 }}>Story Arcs</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {generatedData.storyArcs.map((arc, i) => (
                      <div key={i} className="card" style={{ padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{arc.title}</span>
                          <span className={`badge badge-${arc.pillar}`}>{arc.pillar}</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{arc.desc}</p>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{arc.steps?.length || 0} steps</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {generatedData.sideQuests && generatedData.sideQuests.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div className="section-title" style={{ marginBottom: 12 }}>Side Quests</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {generatedData.sideQuests.map((q, i) => (
                      <div key={i} className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{q.title}</span>
                        <span className={`badge badge-${q.pillar}`}>{q.pillar}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {step <= 7 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              {step > 1 && <button className="btn" onClick={back}>Back</button>}
              <div style={{ flex: 1 }} />
              {isSkippable && <button className="btn" onClick={next}>Skip</button>}
              {step < 7 && (
                <button className="btn btn-primary" onClick={next} disabled={!canContinue()}>Continue</button>
              )}
              {step === 7 && (
                <button className="btn btn-primary" onClick={handleGenerate} disabled={!canContinue()}>Generate Quests</button>
              )}
            </div>
          )}

          {step === 9 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button className="btn" onClick={() => { setStep(7); setGeneratedData(null); }}>Regenerate</button>
              <div style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={handleAccept}>Accept & Begin</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
