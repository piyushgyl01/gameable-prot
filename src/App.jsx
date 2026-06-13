import React from 'react';
import { useGame } from './context/GameContext';
import Onboarding from './screens/Onboarding';
import Dashboard from './screens/Dashboard';

function AppContent() {
  const { appState } = useGame();

  if (appState === 'onboarding') {
    return <Onboarding />;
  }

  if (appState === 'dashboard') {
    return <Dashboard />;
  }

  return null;
}

export default function App() {
  return (
    <div className="app-container">
      <AppContent />
    </div>
  );
}
