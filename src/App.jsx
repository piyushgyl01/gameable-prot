import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import Onboarding from './screens/Onboarding';
import Dashboard from './screens/Dashboard';
import QuestBoard from './screens/QuestBoard';
import Character from './screens/Character';
import Chat from './screens/Chat';
import Settings from './screens/Settings';

// Simple SVG icons
const Icons = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  quests: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  character: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.home },
  { id: 'quests', label: 'Quest Board', icon: Icons.quests },
  { id: 'chat', label: 'The Architect', icon: Icons.chat },
  { id: 'character', label: 'Character', icon: Icons.character },
  { id: 'settings', label: 'Settings', icon: Icons.settings },
];

function Sidebar({ activeScreen, setActiveScreen, profile, rank }) {
  return (
    <div className="sidebar">
      <div className="sidebar-profile">
        <div className="sidebar-profile-name">{profile?.name || 'Traveler'}</div>
        <div className="sidebar-profile-rank">Lv. {profile?.level || 1} · {rank}</div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activeScreen === item.id ? 'active' : ''}`}
            onClick={() => setActiveScreen(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Life RPG v1.0</div>
      </div>
    </div>
  );
}

function AppContent() {
  const { loading, settings, profile, rank, toastMessage } = useGame();
  const [activeScreen, setActiveScreen] = useState('dashboard');

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100vh' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  // Show onboarding if not complete
  if (!settings?.onboardingComplete) {
    return <Onboarding />;
  }

  const screens = {
    dashboard: <Dashboard />,
    quests: <QuestBoard />,
    chat: <Chat />,
    character: <Character />,
    settings: <Settings />,
  };

  return (
    <div className="app-layout">
      <Sidebar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        profile={profile}
        rank={rank}
      />
      <div className="main-content">
        {screens[activeScreen] || <Dashboard />}
      </div>

      {/* Achievement Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          background: 'var(--bg-elevated)', border: '1px solid var(--accent)',
          borderRadius: 12, padding: '14px 20px', fontSize: 14, fontWeight: 600,
          color: 'var(--accent)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.3s ease-out',
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
