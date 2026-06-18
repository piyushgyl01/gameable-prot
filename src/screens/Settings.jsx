import React, { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { exportAllData, importAllData, clearAllData } from '../lib/db';
import { THEMES, applyTheme } from '../lib/systems';

export default function Settings() {
  const { settings, profile, updateSettings, updateProfileData, loadAll } = useGame();

  const [apiKey, setApiKey] = useState(settings?.geminiKey || '');
  const [endgame, setEndgame] = useState(profile?.endgame || '');
  const [keySaved, setKeySaved] = useState(false);
  const [endgameSaved, setEndgameSaved] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef();

  const handleSaveKey = async () => {
    await updateSettings({ geminiKey: apiKey });
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleSaveEndgame = async () => {
    await updateProfileData({ endgame });
    setEndgameSaved(true);
    setTimeout(() => setEndgameSaved(false), 2000);
  };

  const handleExport = async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gameable-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importAllData(data);
      setImportMsg('Data imported successfully. Reloading...');
      setTimeout(() => { loadAll(); setImportMsg(''); }, 1000);
    } catch (err) {
      setImportMsg('Import failed: ' + err.message);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) return;
    await clearAllData();
    window.location.reload();
  };

  return (
    <div className="animate-in" style={{ maxWidth: 600 }}>
      <h1 style={{ marginBottom: 32 }}>Settings</h1>

      {/* API Key */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <label className="label">Gemini API Key</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Your Gemini API key..." />
          <button className="btn btn-primary" onClick={handleSaveKey}>{keySaved ? 'Saved ✓' : 'Save'}</button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Get a free key from{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>Google AI Studio</a>.
          Stored locally in your browser.
        </p>
      </div>

      {/* Endgame */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <label className="label">Your Endgame Goal</label>
        <textarea rows={3} value={endgame} onChange={e => setEndgame(e.target.value)} placeholder="Your ultimate goal..." style={{ marginBottom: 8 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-primary" onClick={handleSaveEndgame}>{endgameSaved ? 'Saved ✓' : 'Save'}</button>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Changing this won't erase your progress.</span>
        </div>
      </div>

      {/* Theme */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div className="label" style={{ marginBottom: 12 }}>Theme</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {Object.entries(THEMES).map(([id, theme]) => {
            const isActive = (settings?.theme || 'dark') === id;
            return (
              <button
                key={id}
                onClick={async () => {
                  applyTheme(id);
                  await updateSettings({ theme: id });
                }}
                style={{
                  padding: '12px 8px', borderRadius: 8, cursor: 'pointer',
                  background: theme.colors['--bg-surface'],
                  border: `2px solid ${isActive ? theme.colors['--accent'] : theme.colors['--border']}`,
                  color: theme.colors['--accent'],
                  fontSize: 13, fontWeight: 600, textAlign: 'center',
                  transition: 'all 150ms ease',
                  outline: 'none',
                }}
              >
                <div style={{ width: 20, height: 20, borderRadius: 10, background: theme.colors['--accent'], margin: '0 auto 6px' }} />
                {theme.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Management */}
      <div className="card" style={{ padding: 24 }}>
        <div className="label" style={{ marginBottom: 16 }}>Data Management</div>

        {importMsg && <div style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 12 }}>{importMsg}</div>}

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className="btn" onClick={handleExport}>Export Data</button>
          <button className="btn" onClick={() => fileRef.current.click()}>Import Data</button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button className="btn btn-danger" onClick={handleReset}>Reset All Data</button>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>This permanently deletes all quests, progress, and settings.</p>
        </div>
      </div>
    </div>
  );
}
