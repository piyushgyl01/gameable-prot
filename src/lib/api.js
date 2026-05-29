import { loadGameState, saveGameState } from './storage';

/**
 * API Abstraction Layer
 * 
 * Right now this just wraps local storage in Promises to simulate network latency.
 * If you want to integrate Firebase, Supabase, or a custom backend, you can replace
 * the logic in these functions without changing anything else in the app.
 */

export async function fetchCloudSave() {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      try {
        const data = loadGameState();
        resolve(data);
      } catch (err) {
        console.error("Failed to fetch cloud save", err);
        resolve(null);
      }
    }, 200);
  });
}

export async function pushCloudSave(data) {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      try {
        saveGameState(data);
        resolve({ success: true });
      } catch (err) {
        console.error("Failed to push cloud save", err);
        resolve({ success: false, error: err });
      }
    }, 100);
  });
}
