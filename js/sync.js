/**
 * رابعة طب — Cloud Synchronization Engine (Firebase Firestore)
 * 
 * Provides real-time cross-device synchronization, user data isolation,
 * seamless localStorage migration, and intelligent conflict-free merging.
 */

const SyncManager = {
  db: null,
  currentUser: null,
  unsubscribeSnapshot: null,
  syncTimeoutId: null,
  deviceId: null,
  isApplyingRemoteUpdate: false,
  status: "idle", // 'idle' | 'syncing' | 'synced' | 'error' | 'offline'
  lastSyncedAt: null,
  listeners: [],

  init(user) {
    if (!user) return;
    this.currentUser = user;

    // Generate or retrieve persistent unique Device ID to prevent echo loops
    this.deviceId = this.getOrCreateDeviceId();

    try {
      this.db = firebase.firestore();
      
      // Enable offline cache if supported
      try {
        this.db.enablePersistence({ synchronizeTabs: true }).catch(err => {
          if (err.code !== "failed-precondition" && err.code !== "unimplemented") {
            console.warn("Firestore persistence warning:", err.code);
          }
        });
      } catch (e) {
        // Persistence already enabled or unsupported
      }

      this.setStatus("syncing", "Connecting to cloud...");
      this.attachRealtimeListener();
    } catch (err) {
      console.error("Failed to initialize Firestore sync:", err);
      this.setStatus("error", "Sync connection error");
    }
  },

  getOrCreateDeviceId() {
    let id = localStorage.getItem("RABIA_DEVICE_ID");
    if (!id) {
      id = "dev-" + Math.random().toString(36).substring(2, 9) + "-" + Date.now().toString(36);
      localStorage.setItem("RABIA_DEVICE_ID", id);
    }
    return id;
  },

  subscribe(listener) {
    if (typeof listener === "function") {
      this.listeners.push(listener);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  setStatus(status, message = "") {
    this.status = status;
    this.listeners.forEach(fn => {
      try {
        fn(status, message, this.lastSyncedAt);
      } catch (e) {
        console.error(e);
      }
    });

    // Update global visual indicators in UI
    this.updateUIIndicators(status, message);
  },

  updateUIIndicators(status, message) {
    const badges = document.querySelectorAll(".cloud-sync-indicator");
    badges.forEach(badge => {
      const dot = badge.querySelector(".sync-dot");
      const label = badge.querySelector(".sync-label");
      if (dot) {
        dot.className = "sync-dot " + status;
      }
      if (label) {
        if (status === "synced") {
          label.textContent = "Cloud Synced";
        } else if (status === "syncing") {
          label.textContent = "Syncing...";
        } else if (status === "error") {
          label.textContent = "Sync Error";
        } else {
          label.textContent = "Offline";
        }
      }
    });
  },

  getUserDocRef() {
    if (!this.db || !this.currentUser) return null;
    return this.db.collection("users").doc(this.currentUser.uid).collection("data").doc("state");
  },

  /**
   * Listen to remote Firestore document changes in real-time
   */
  attachRealtimeListener() {
    const docRef = this.getUserDocRef();
    if (!docRef) return;

    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
    }

    this.unsubscribeSnapshot = docRef.onSnapshot(
      async (snapshot) => {
        if (!snapshot.exists) {
          // Document does not exist in cloud yet for this user
          await this.handleInitialCloudSetup();
        } else {
          const remoteData = snapshot.data();
          this.handleRemoteSnapshot(remoteData);
        }
      },
      (error) => {
        console.error("Firestore onSnapshot error:", error);
        this.setStatus("error", "Sync connection interrupted");
      }
    );
  },

  /**
   * Called when cloud document does not exist yet (first-time login on Firebase)
   */
  async handleInitialCloudSetup() {
    const localState = StorageManager.loadState();
    const hasCustomLocalData = this.detectCustomLocalData(localState);

    if (hasCustomLocalData) {
      // Local progress was found on device -> Offer migration to cloud
      this.promptDataMigration(localState);
    } else {
      // Clean start -> Push initial state to cloud
      await this.pushToCloud(localState, true);
      this.lastSyncedAt = new Date();
      this.setStatus("synced", "Initial cloud sync complete");
    }
  },

  /**
   * Checks if local state has user-customized study progress or scheduled tasks
   */
  detectCustomLocalData(state) {
    if (!state) return false;

    // Check completed lectures
    let hasCompletedLectures = false;
    if (Array.isArray(state.subjects)) {
      for (const subj of state.subjects) {
        if (Array.isArray(subj.branches)) {
          for (const br of subj.branches) {
            if (Array.isArray(br.lectures) && br.lectures.some(l => l.completed)) {
              hasCompletedLectures = true;
              break;
            }
          }
        }
        if (hasCompletedLectures) break;
      }
    }

    // Check custom tasks
    const hasTasks = Array.isArray(state.tasks) && state.tasks.length > 0;

    // Check activity logs
    const hasLogs = Array.isArray(state.activityLogs) && state.activityLogs.length > 0;

    // Check exam date modifications
    const hasCustomExam = state.exam && (state.exam.date !== DEFAULT_EXAM_SETTINGS.date || state.exam.title !== DEFAULT_EXAM_SETTINGS.title);

    return hasCompletedLectures || hasTasks || hasLogs || hasCustomExam;
  },

  /**
   * Displays an elegant modal prompt offering to migrate local progress to the Google Account
   */
  promptDataMigration(localState) {
    let completedCount = 0;
    if (Array.isArray(localState.subjects)) {
      localState.subjects.forEach(s => {
        (s.branches || []).forEach(b => {
          (b.lectures || []).forEach(l => {
            if (l.completed) completedCount++;
          });
        });
      });
    }
    const taskCount = (localState.tasks || []).length;

    window.App.showModal({
      title: "Migrate Study Data to Google Account",
      content: `
        <div class="migration-modal-content">
          <div class="migration-badge">
            ${AppIcons.get("cloudCheck", "text-gold", 32)}
          </div>
          <h4 class="mt-2 text-gold">Local Study Progress Detected</h4>
          <p class="mt-2">
            We found existing study records stored on this device:
          </p>
          <ul class="migration-stats-list mt-3">
            <li><strong>${completedCount}</strong> completed lectures</li>
            <li><strong>${taskCount}</strong> scheduled tasks & calendar items</li>
            <li>Custom examination timelines and activity logs</li>
          </ul>
          <p class="mt-3 text-secondary text-sm">
            Would you like to migrate this data to your Google account (<strong>${this.currentUser.email}</strong>)?
            Once migrated, your study progress will automatically synchronize across your laptop, tablet, and mobile devices.
          </p>

          <div class="modal-buttons mt-4">
            <button class="btn btn-ghost" id="btn-migration-fresh">Start Clean Account</button>
            <button class="btn btn-primary" id="btn-migration-proceed">
              ${AppIcons.get("cloudCheck", "", 16)} Migrate to Cloud
            </button>
          </div>
        </div>
      `,
      onOpen: (modalEl, closeModal) => {
        modalEl.querySelector("#btn-migration-proceed")?.addEventListener("click", async () => {
          closeModal();
          window.App.showToast("Migrating your study data to Google Account...", "info", 3000);
          await this.pushToCloud(localState, true);
          this.lastSyncedAt = new Date();
          this.setStatus("synced", "Migrated successfully");
          window.App.showToast("Data migration complete! Your study records are now in the cloud.", "success", 4000);
        });

        modalEl.querySelector("#btn-migration-fresh")?.addEventListener("click", async () => {
          closeModal();
          const defaultState = StorageManager.initDefaultState();
          window.App.state = defaultState;
          await this.pushToCloud(defaultState, true);
          this.lastSyncedAt = new Date();
          this.setStatus("synced", "Default account initialized");
          window.App.renderCurrentView();
          window.App.showToast("Starting with clean curriculum account.", "info", 3000);
        });
      }
    });
  },

  /**
   * Handle incoming remote snapshot from Firestore
   */
  handleRemoteSnapshot(remoteDoc) {
    if (!remoteDoc) return;

    // Check if this update originated from this exact device to avoid echo
    if (remoteDoc.lastDeviceId === this.deviceId) {
      this.lastSyncedAt = new Date();
      this.setStatus("synced", "Synced");
      return;
    }

    // Merge remote state into local state
    const mergedState = this.mergeStates(window.App.state, remoteDoc);

    // Apply merged state locally without triggering another cloud save
    this.isApplyingRemoteUpdate = true;
    try {
      window.App.state = mergedState;
      StorageManager.saveState(mergedState, true, "cloud_sync");
      this.lastSyncedAt = new Date();
      this.setStatus("synced", "Synced from other device");
    } finally {
      this.isApplyingRemoteUpdate = false;
    }
  },

  /**
   * Intelligent conflict-free merging of local state and cloud state
   */
  mergeStates(local, remote) {
    if (!remote) return local;
    if (!local) return remote;

    // 1. Merge Exam Settings (favor most recent or remote if valid)
    const exam = {
      title: remote.exam?.title || local.exam?.title || DEFAULT_EXAM_SETTINGS.title,
      date: remote.exam?.date || local.exam?.date || DEFAULT_EXAM_SETTINGS.date,
      time: remote.exam?.time || local.exam?.time || DEFAULT_EXAM_SETTINGS.time,
      notes: remote.exam?.notes || local.exam?.notes || DEFAULT_EXAM_SETTINGS.notes
    };

    // 2. Merge Preferences
    const preferences = {
      density: remote.preferences?.density || local.preferences?.density || "comfortable",
      theme: remote.preferences?.theme || local.preferences?.theme || "navy-gold"
    };

    // 3. Merge Subjects, Branches & Lectures preserving completion & notes
    const subjectsMap = new Map();

    // Seed with local subjects
    (local.subjects || []).forEach(subj => {
      subjectsMap.set(subj.id, JSON.parse(JSON.stringify(subj)));
    });

    // Merge remote subjects
    (remote.subjects || []).forEach(remSubj => {
      if (!subjectsMap.has(remSubj.id)) {
        subjectsMap.set(remSubj.id, JSON.parse(JSON.stringify(remSubj)));
      } else {
        const localSubj = subjectsMap.get(remSubj.id);
        localSubj.name = remSubj.name || localSubj.name;
        localSubj.color = remSubj.color || localSubj.color;
        localSubj.icon = remSubj.icon || localSubj.icon;

        const branchMap = new Map();
        (localSubj.branches || []).forEach(br => branchMap.set(br.id, br));

        (remSubj.branches || []).forEach(remBr => {
          if (!branchMap.has(remBr.id)) {
            branchMap.set(remBr.id, remBr);
          } else {
            const localBr = branchMap.get(remBr.id);
            localBr.name = remBr.name || localBr.name;

            const lecMap = new Map();
            (localBr.lectures || []).forEach(lec => lecMap.set(lec.id, lec));

            (remBr.lectures || []).forEach(remLec => {
              if (!lecMap.has(remLec.id)) {
                lecMap.set(remLec.id, remLec);
              } else {
                const localLec = lecMap.get(remLec.id);
                // Union completion: if marked complete on either device, keep complete
                localLec.completed = Boolean(localLec.completed || remLec.completed);
                localLec.rating = Math.max(localLec.rating || 0, remLec.rating || 0);
                localLec.notes = remLec.notes || localLec.notes || "";
                localLec.priority = remLec.priority || localLec.priority || "medium";
                localLec.durationMin = remLec.durationMin || localLec.durationMin || 60;
              }
            });
            localBr.lectures = Array.from(lecMap.values());
          }
        });
        localSubj.branches = Array.from(branchMap.values());
      }
    });

    const subjects = Array.from(subjectsMap.values());

    // 4. Merge Tasks by ID avoiding duplicates
    const tasksMap = new Map();
    (local.tasks || []).forEach(t => tasksMap.set(t.id, t));
    (remote.tasks || []).forEach(remTask => {
      if (!tasksMap.has(remTask.id)) {
        tasksMap.set(remTask.id, remTask);
      } else {
        // If both have task, preserve latest state
        const localTask = tasksMap.get(remTask.id);
        localTask.completed = Boolean(localTask.completed || remTask.completed);
        localTask.title = remTask.title || localTask.title;
        localTask.date = remTask.date || localTask.date;
        localTask.notes = remTask.notes || localTask.notes;
        localTask.priority = remTask.priority || localTask.priority;
      }
    });
    const tasks = Array.from(tasksMap.values());

    // 5. Merge Activity Logs deduplicated by ID / timestamp
    const logsMap = new Map();
    (local.activityLogs || []).forEach(l => logsMap.set(l.id || (l.timestamp + l.type), l));
    (remote.activityLogs || []).forEach(l => logsMap.set(l.id || (l.timestamp + l.type), l));
    const activityLogs = Array.from(logsMap.values()).slice(-3000);

    return {
      version: 1,
      exam,
      preferences,
      subjects,
      tasks,
      activityLogs
    };
  },

  /**
   * Debounced save to Cloud Firestore whenever state changes locally
   */
  notifyLocalChange(state) {
    if (!this.currentUser || !this.db || this.isApplyingRemoteUpdate) {
      return;
    }

    this.setStatus("syncing", "Saving changes to cloud...");

    if (this.syncTimeoutId) {
      clearTimeout(this.syncTimeoutId);
    }

    this.syncTimeoutId = setTimeout(() => {
      this.pushToCloud(state);
    }, 600);
  },

  /**
   * Direct push to Firestore document
   */
  async pushToCloud(state, isImmediate = false) {
    const docRef = this.getUserDocRef();
    if (!docRef || !state) return;

    try {
      const payload = {
        version: state.version || 1,
        exam: state.exam || {},
        preferences: state.preferences || {},
        subjects: state.subjects || [],
        tasks: state.tasks || [],
        activityLogs: state.activityLogs || [],
        updatedAt: new Date().toISOString(),
        lastDeviceId: this.deviceId,
        userId: this.currentUser.uid,
        userEmail: this.currentUser.email || ""
      };

      await docRef.set(payload, { merge: true });
      this.lastSyncedAt = new Date();
      this.setStatus("synced", "All changes saved to cloud");
    } catch (err) {
      console.error("Failed to write state to Firestore:", err);
      this.setStatus("error", "Failed to sync: " + (err.message || "Network error"));
    }
  },

  /**
   * Manual force sync triggered by user
   */
  async forceSyncNow() {
    if (!this.currentUser) return;
    this.setStatus("syncing", "Synchronizing...");
    const state = window.App?.state || StorageManager.loadState();
    await this.pushToCloud(state, true);
    window.App?.showToast("Manual cloud synchronization complete!", "success", 2500);
  },

  disconnect() {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
    }
    if (this.syncTimeoutId) {
      clearTimeout(this.syncTimeoutId);
      this.syncTimeoutId = null;
    }
    this.currentUser = null;
    this.setStatus("offline", "Signed out");
  }
};

