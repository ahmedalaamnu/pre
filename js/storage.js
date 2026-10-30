/**
 * رابعة طب — Local Storage & State Management
 * Robust persistence, data schema validation, activity logging, and export/import.
 */

const STORAGE_KEY = "RABIA_MED_STUDY_PLANNER_V1";

const StorageManager = {
  listeners: [],

  subscribe(listener) {
    if (typeof listener === "function") {
      this.listeners.push(listener);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify(changeType, payload) {
    this.listeners.forEach(fn => {
      try {
        fn(changeType, payload);
      } catch (err) {
        console.error("Storage subscriber error:", err);
      }
    });
  },

  /**
   * Initializes application state on first launch or loads persistent state
   */
  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return this.initDefaultState();
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.subjects)) {
        console.warn("Invalid storage format detected. Reverting safely to default schema.");
        return this.initDefaultState();
      }

      // Defensive fill of missing fields
      const state = {
        version: parsed.version || 1,
        exam: { ...DEFAULT_EXAM_SETTINGS, ...(parsed.exam || {}) },
        preferences: { ...DEFAULT_PREFERENCES, ...(parsed.preferences || {}) },
        subjects: Array.isArray(parsed.subjects) ? parsed.subjects : JSON.parse(JSON.stringify(INITIAL_SUBJECTS_DATA)),
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        activityLogs: Array.isArray(parsed.activityLogs) ? parsed.activityLogs : []
      };

      return state;
    } catch (e) {
      console.error("Failed to parse localStorage data:", e);
      return this.initDefaultState();
    }
  },

  initDefaultState() {
    const initialState = {
      version: 1,
      createdAt: new Date().toISOString(),
      exam: { ...DEFAULT_EXAM_SETTINGS },
      preferences: { ...DEFAULT_PREFERENCES },
      subjects: JSON.parse(JSON.stringify(INITIAL_SUBJECTS_DATA)),
      tasks: [],
      activityLogs: []
    };
    this.saveState(initialState, false);
    return initialState;
  },

  saveState(state, triggerNotify = true, changeType = "general") {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serialized);
      if (triggerNotify) {
        this.notify(changeType, state);
      }
      // Trigger cloud synchronization if active
      if (window.SyncManager && typeof window.SyncManager.notifyLocalChange === "function") {
        window.SyncManager.notifyLocalChange(state);
      }
      return true;
    } catch (err) {
      console.error("Failed to write to localStorage:", err);
      return false;
    }
  },

  getStorageSizeKB() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return 0;
      return (raw.length * 2 / 1024).toFixed(2);
    } catch (e) {
      return 0;
    }
  },

  /**
   * Activity Logging for historical analytics and streaks
   */
  logActivity(state, type, details = {}) {
    if (!state.activityLogs) {
      state.activityLogs = [];
    }
    const logEntry = {
      id: generateId("act"),
      type, // 'lecture_complete', 'lecture_uncomplete', 'task_complete', 'task_uncomplete'
      timestamp: new Date().toISOString(),
      date: DateUtils.todayString(),
      ...details
    };
    state.activityLogs.push(logEntry);
    // Keep max 3,000 logs to prevent bloat
    if (state.activityLogs.length > 3000) {
      state.activityLogs = state.activityLogs.slice(-2500);
    }
  },

  /**
   * Export all data to a JSON blob download
   */
  exportData(state) {
    const payload = {
      app: "رابعة طب — Premium Medical Study Planner",
      exportDate: new Date().toISOString(),
      ...state
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateFormatted = DateUtils.todayString();
    a.href = url;
    a.download = `rabia-med-backup-${dateFormatted}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  },

  /**
   * Validate and import JSON string into state
   */
  validateImport(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== "object") {
        return { valid: false, error: "The file does not contain a valid JSON object." };
      }
      if (!Array.isArray(parsed.subjects)) {
        return { valid: false, error: "Invalid backup format: missing subjects array." };
      }
      if (parsed.subjects.length === 0) {
        return { valid: false, error: "Invalid backup format: subjects list is empty." };
      }
      // Validate at least the first subject has basic properties
      const first = parsed.subjects[0];
      if (!first.name || !Array.isArray(first.branches)) {
        return { valid: false, error: "Invalid backup format: corrupted subject structure." };
      }

      return {
        valid: true,
        data: {
          version: parsed.version || 1,
          exam: parsed.exam && parsed.exam.date ? parsed.exam : { ...DEFAULT_EXAM_SETTINGS },
          preferences: parsed.preferences || { ...DEFAULT_PREFERENCES },
          subjects: parsed.subjects,
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
          activityLogs: Array.isArray(parsed.activityLogs) ? parsed.activityLogs : []
        }
      };
    } catch (e) {
      return { valid: false, error: "Malformed JSON file: " + e.message };
    }
  }
};

