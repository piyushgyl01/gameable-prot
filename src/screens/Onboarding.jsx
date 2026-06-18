import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { generateOnboardingQuests } from '../lib/gemini';
import { PILLARS } from '../lib/progression';

const TOTAL_STEPS = 7;

export default function Onboarding() {
  const { settings, updateSettings, initProfile, finishOnboarding } = useGame();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [current, setCurrent] = useState('');
  const [healthNotes, setHealthNotes] = useState('');
  const [wealthNotes, setWealthNotes] = useState('');
  const [relationshipsNotes, setRelationshipsNotes] = useState('');
  const [endgame, setEndgame] = useState('');
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
      const msg = err.message || 'Generation failed.';
      if (msg.includes('429')) {
        setError('API rate limit hit. Wait 1-2 minutes, then try again.');
      } else {
        setError(msg);
      }
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

        {/* Progress bar */}
        {step <= 7 && (
          <div className="onboarding-progress">
            <div
              className="onboarding-progress-fill"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        )}

        <div className="card animate-slide-in" key={step} style={{ padding: 32 }}>

          {/* Step 1: Welcome + Name */}
          {step === 1 && (
            <div>
              <h1 style={{ marginBottom: 8 }}>Welcome to Gameable</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                Turn your life into a game. Your journey spans three pillars:
              </p>
              <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                {Object.entries(PILLARS).map(([key, p], i) => (
                  <div key={key} className={`card animate-pop stagger-${i + 1}`} style={{ flex: 1, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{p.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: p.color }}>{p.label}</div>
                  </div>
                ))}
              </div>
              <label className="label">What's your name?</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" onKeyDown={e => e.key === 'Enter' && canContinue() && next()} />
            </div>
          )}

          {/* Step 2: Where you are now */}
          {step === 2 && (
            <div>
              <h1 style={{ marginBottom: 4 }}>Where are you now?</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Be honest about where you stand today. This is your starting point.</p>
              <label className="label">Your current situation</label>
              <textarea rows={4} value={current} onChange={e => setCurrent(e.target.value)} placeholder="What does your day-to-day look like right now?" />
            </div>
          )}

          {/* Step 3: Health */}
          {step === 3 && (
            <div>
              <h1 style={{ marginBottom: 4 }}>❤️ Health</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>How's your body and mind doing?</p>
              <label className="label">Health right now</label>
              <textarea rows={4} value={healthNotes} onChange={e => setHealthNotes(e.target.value)} placeholder="Exercise, diet, sleep, energy levels, mental health..." />
            </div>
          )}

          {/* Step 4: Wealth */}
          {step === 4 && (
            <div>
              <h1 style={{ marginBottom: 4 }}>💰 Wealth</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Where do you stand financially and professionally?</p>
              <label className="label">Wealth right now</label>
              <textarea rows={4} value={wealthNotes} onChange={e => setWealthNotes(e.target.value)} placeholder="Job, income, savings, skills, side projects..." />
            </div>
          )}

          {/* Step 5: Relationships */}
          {step === 5 && (
            <div>
              <h1 style={{ marginBottom: 4 }}>🤝 Relationships</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>How's your social life and connections?</p>
              <label className="label">Relationships right now</label>
              <textarea rows={4} value={relationshipsNotes} onChange={e => setRelationshipsNotes(e.target.value)} placeholder="Family, friends, partner, networking, community..." />
            </div>
          )}

          {/* Step 6: Endgame */}
          {step === 6 && (
            <div>
              <h1 style={{ marginBottom: 4 }}>The Endgame</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Where do you want to be? Think big.</p>
              <label className="label">Your ideal life</label>
              <textarea rows={4} value={endgame} onChange={e => setEndgame(e.target.value)} placeholder="What does winning look like for you in 1-5 years?" />
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
              <div style={{ animation: 'pulseAccent 1.5s ease-in-out infinite', margin: '0 auto 24px' }}>
                <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }} />
              </div>
              <h2 className="animate-slide-up stagger-1" style={{ marginBottom: 8 }}>Building your quest plan...</h2>
              <p className="animate-slide-up stagger-2" style={{ fontSize: 13, color: 'var(--text-muted)' }}>This takes a few seconds.</p>
            </div>
          )}

          {/* Step 9: Review */}
          {step === 9 && generatedData && (
            <div>
              <h1 style={{ marginBottom: 4 }}>Your Quest Plan</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Here's what we came up with. Accept it or regenerate.</p>

              {generatedData.storyArcs && generatedData.storyArcs.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div className="section-title" style={{ marginBottom: 12 }}>Story Arcs</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {generatedData.storyArcs.map((arc, i) => (
                      <div key={i} className={`card animate-slide-up stagger-${i + 1}`} style={{ padding: 16 }}>
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
                    {generatedData.sideQuests.map((q, i) => {
                      const offset = (generatedData.storyArcs?.length || 0) + i + 1;
                      return (
                        <div key={i} className={`card animate-slide-up stagger-${offset}`} style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{q.title}</span>
                          <span className={`badge badge-${q.pillar}`}>{q.pillar}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.frequency}</span>
                        </div>
                      );
                    })}
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
                <button className="btn btn-done" onClick={next} disabled={!canContinue()}>Continue</button>
              )}
              {step === 7 && (
                <button className="btn btn-done" onClick={handleGenerate} disabled={!canContinue()}>Generate Quests</button>
              )}
            </div>
          )}

          {step === 9 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button className="btn" onClick={() => { setStep(7); setGeneratedData(null); }}>Regenerate</button>
              <div style={{ flex: 1 }} />
              <button className="btn btn-done" onClick={handleAccept}>Accept & Begin</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
