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
