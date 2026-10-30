/**
 * رابعة طب — Firebase Configuration & Key Manager
 * 
 * Instructions to obtain your configuration:
 * 1. Go to the Firebase Console: https://console.firebase.google.com/
 * 2. Select or create your Firebase project (e.g. "rabia-med-planner").
 * 3. In Project Settings (gear icon) -> General -> "Your apps", add a Web App ("</>").
 * 4. Copy the firebaseConfig values and replace the placeholders below, or enter them
 *    directly inside the application Settings -> Cloud Synchronization panel.
 */

window.FIREBASE_CONFIG = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

const FirebaseConfigManager = {
  STORAGE_KEY: "RABIA_FIREBASE_CUSTOM_CONFIG",

  getConfig() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.apiKey && !this.isPlaceholder(parsed.apiKey)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read custom Firebase config from localStorage", e);
    }
    return window.FIREBASE_CONFIG;
  },

  isPlaceholder(value) {
    if (!value || typeof value !== "string") return true;
    const lower = value.toLowerCase().trim();
    return (
      lower === "" ||
      lower.startsWith("paste_") ||
      lower.startsWith("your_") ||
      lower.includes("placeholder")
    );
  },

  isConfigured() {
    const cfg = this.getConfig();
    if (!cfg) return false;
    return (
      !this.isPlaceholder(cfg.apiKey) &&
      !this.isPlaceholder(cfg.projectId) &&
      !this.isPlaceholder(cfg.authDomain)
    );
  },

  saveCustomConfig(configObj) {
    try {
      if (!configObj || typeof configObj !== "object") return false;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configObj));
      return true;
    } catch (e) {
      console.error("Failed to save custom Firebase config:", e);
      return false;
    }
  },

  clearCustomConfig() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }
};

