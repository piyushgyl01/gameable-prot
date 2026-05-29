const KEY = 'liferpg_v5';

export function saveGameState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

export function loadGameState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Load failed:', e);
    return null;
  }
}

export function clearGameState() {
  try {
    localStorage.removeItem(KEY);
  } catch (e) {
    console.warn('Clear failed:', e);
  }
}

export function exportGameState() {
  const data = loadGameState();
  if (!data) return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `liferpg_save_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importGameState(file, onComplete) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data && data.name) {
        saveGameState(data);
        onComplete?.(true);
      } else {
        onComplete?.(false);
      }
    } catch (err) {
      console.warn('Import failed:', err);
      onComplete?.(false);
    }
  };
  reader.readAsText(file);
}
