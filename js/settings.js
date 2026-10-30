/**
 * رابعة طب — Settings & Data Management
 * Examination parameters, density preference, JSON backup export/import,
 * storage diagnostics, and curriculum reset.
 */

const SettingsManager = {
  render(container, state) {
    const overall = SubjectsManager.calcOverallStats(state.subjects);
    const storageSizeKB = StorageManager.getStorageSizeKB();
    const taskCount = (state.tasks || []).length;
    const logCount = (state.activityLogs || []).length;

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h1 class="page-title">Application Settings</h1>
          <p class="page-subtitle">Configure examination timelines, appearance density, and data backups</p>
        </div>
      </div>

      <div class="settings-grid">
        <!-- 0. Google Account & Cloud Synchronization -->
        <div class="settings-card">
          <div class="card-title-group">
            <h3 class="card-heading">Google Account & Cloud Synchronization</h3>
            <span class="card-subheading">Automatic real-time sync across your desktop, laptop, tablet, and mobile devices</span>
          </div>

          <div class="settings-account-box mt-3">
            ${window.AuthManager?.currentUser ? `
              <div class="account-profile-row">
                ${window.AuthManager.currentUser.photoURL ? 
                  `<img src="${window.AuthManager.currentUser.photoURL}" alt="User Avatar" class="account-avatar-img">` : 
                  `<div class="account-avatar-fallback">${window.AuthManager.getInitials(window.AuthManager.currentUser.displayName || window.AuthManager.currentUser.email)}</div>`
                }
                <div class="account-details">
                  <div class="account-name-badge">
                    <strong>${this.escapeHtml(window.AuthManager.currentUser.displayName || "Medical Student")}</strong>
                    <span class="badge badge-success">Google Authenticated</span>
                  </div>
                  <span class="account-email text-secondary">${this.escapeHtml(window.AuthManager.currentUser.email || "")}</span>
                  <div class="sync-status-row mt-1">
                    <span class="sync-dot ${window.SyncManager?.status || 'synced'}"></span>
                    <span class="text-xs ${window.SyncManager?.status === 'synced' ? 'text-success' : 'text-gold'}">
                      ${window.SyncManager?.status === 'synced' ? 'Cloud Synced' : window.SyncManager?.status === 'syncing' ? 'Syncing...' : 'Connected'}
                    </span>
                    ${window.SyncManager?.lastSyncedAt ? `<span class="text-xs text-muted">• Last synced: ${new Date(window.SyncManager.lastSyncedAt).toLocaleTimeString()}</span>` : ""}
                  </div>
                </div>
              </div>
              <div class="account-actions-row mt-3">
                <button class="btn btn-secondary btn-sm" id="btn-settings-sync-now">
                  ${AppIcons.get("cloudCheck", "", 16)} Sync Now
                </button>
                <button class="btn btn-ghost btn-sm" id="btn-settings-config-keys">
                  ${AppIcons.get("settings", "", 16)} Firebase Project Keys
                </button>
                <button class="btn btn-outline btn-sm text-danger" id="btn-settings-signout">
                  ${AppIcons.get("logOut", "", 16)} Sign Out
                </button>
              </div>
            ` : `
              <div class="account-signin-prompt">
                <p class="text-secondary text-sm">Sign in with your Google account to synchronize your curriculum progress and study calendar across all your devices.</p>
                <div class="mt-3">
                  <button class="btn btn-primary btn-sm" id="btn-settings-signin">
                    ${AppIcons.get("google", "", 16)} Continue with Google
                  </button>
                  <button class="btn btn-ghost btn-sm" id="btn-settings-config-keys">
                    ${AppIcons.get("settings", "", 16)} Configure Firebase Keys
                  </button>
                </div>
              </div>
            `}
          </div>
        </div>

        <!-- 1. Examination Target Configuration -->
        <div class="settings-card">
          <div class="card-title-group">
            <h3 class="card-heading">Examination Countdown Target</h3>
            <span class="card-subheading">Synchronized dynamically across the countdown clock and dashboard</span>
          </div>

          <form id="form-settings-exam" class="mt-3">
            <div class="form-group">
              <label class="form-label" for="settings-exam-title">Examination Title</label>
              <input type="text" id="settings-exam-title" class="form-input" required value="${this.escapeHtml(state.exam.title || "")}">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="settings-exam-date">Target Examination Date</label>
                <input type="date" id="settings-exam-date" class="form-input" required value="${state.exam.date}">
              </div>
              <div class="form-group">
                <label class="form-label" for="settings-exam-time">Examination Start Time</label>
                <input type="time" id="settings-exam-time" class="form-input" value="${state.exam.time || "09:00"}">
              </div>
            </div>
            <button type="submit" class="btn btn-primary mt-2">
              ${AppIcons.get("check", "", 16)} Save Examination Milestone
            </button>
          </form>
        </div>

        <!-- 2. Visual Density & Layout -->
        <div class="settings-card">
          <div class="card-title-group">
            <h3 class="card-heading">Visual Density & Theme</h3>
            <span class="card-subheading">Academic dark navy (#101827) and muted deep gold (#C99A2E)</span>
          </div>

          <div class="density-selector-group mt-3">
            <label class="form-label">Layout Density</label>
            <div class="density-options">
              <label class="density-radio-card ${state.preferences.density === 'comfortable' ? 'active' : ''}">
                <input type="radio" name="pref-density" value="comfortable" ${state.preferences.density === 'comfortable' ? 'checked' : ''}>
                <div class="density-info">
                  <strong>Comfortable</strong>
                  <span>Spacious card padding, ideal for desktops and tablets</span>
                </div>
              </label>
              <label class="density-radio-card ${state.preferences.density === 'compact' ? 'active' : ''}">
                <input type="radio" name="pref-density" value="compact" ${state.preferences.density === 'compact' ? 'checked' : ''}>
                <div class="density-info">
                  <strong>Compact</strong>
                  <span>Tighter spacing, displaying more lectures per screen</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- 3. Backup, Export & Import -->
        <div class="settings-card">
          <div class="card-title-group">
            <h3 class="card-heading">Data Management & Backup</h3>
            <span class="card-subheading">Export all progress, custom subjects, and tasks to an offline JSON backup</span>
          </div>

          <div class="data-actions-row mt-3">
            <div class="data-action-box">
              <h4>Export Backup File</h4>
              <p>Download a snapshot of your full curriculum, lecture completions, and calendar schedule.</p>
              <button class="btn btn-secondary" id="btn-export-backup">
                ${AppIcons.get("download", "", 16)} Export Data (JSON)
              </button>
            </div>

            <div class="data-action-box">
              <h4>Restore from Backup</h4>
              <p>Upload a previously exported JSON backup file to restore your study data.</p>
              <input type="file" id="file-import-input" accept=".json" style="display: none;">
              <button class="btn btn-outline" id="btn-trigger-import">
                ${AppIcons.get("upload", "", 16)} Import Backup File
              </button>
            </div>
          </div>

          <div class="reset-zone mt-4">
            <div class="reset-warning-text">
              <strong>Reset to Factory Curriculum:</strong>
              <span>Restores original five fourth-year subjects (Pediatrics, Anesthesia, Psychiatry, Tropical Medicine, Rheumatology) and clears all task records.</span>
            </div>
            <button class="btn btn-danger" id="btn-reset-default">
              ${AppIcons.get("refresh", "", 16)} Reset to Default Curriculum
            </button>
          </div>
        </div>

        <!-- 4. Storage Architecture & Privacy Notice -->
        <div class="settings-card">
          <div class="card-title-group">
            <h3 class="card-heading">Storage Diagnostics & Privacy</h3>
            <span class="card-subheading">Zero server dependencies, completely private in your browser</span>
          </div>

          <div class="storage-stats-grid mt-3">
            <div class="stat-mini">
              <span class="stat-mini-label">Storage Footprint</span>
              <span class="stat-mini-val text-gold">${storageSizeKB} KB</span>
            </div>
            <div class="stat-mini">
              <span class="stat-mini-label">Subjects Stored</span>
              <span class="stat-mini-val">${state.subjects.length}</span>
            </div>
            <div class="stat-mini">
              <span class="stat-mini-label">Total Lectures</span>
              <span class="stat-mini-val">${overall.total}</span>
            </div>
            <div class="stat-mini">
              <span class="stat-mini-label">Scheduled Tasks</span>
              <span class="stat-mini-val">${taskCount}</span>
            </div>
            <div class="stat-mini">
              <span class="stat-mini-label">Activity Logs</span>
              <span class="stat-mini-val">${logCount}</span>
            </div>
          </div>

          <div class="privacy-note mt-3">
            <p><strong>Note on Local Storage:</strong> All your progress and personal medical tasks are saved strictly inside your web browser's local sandbox (<code>localStorage</code>). No data is transmitted to an external server or commercial API.</p>
            <p class="mt-1">Please export regular JSON backups if you plan on clearing your browser cache, reinstalling your operating system, or transferring your study setup to a study colleague's device.</p>
          </div>
        </div>
      </div>
    `;

    // Hook listeners
    container.querySelector("#btn-settings-sync-now")?.addEventListener("click", () => {
      window.SyncManager?.forceSyncNow();
    });

    container.querySelector("#btn-settings-config-keys")?.addEventListener("click", () => {
      window.AuthManager?.openFirebaseConfigModal();
    });

    container.querySelector("#btn-settings-signout")?.addEventListener("click", () => {
      window.AuthManager?.confirmSignOut();
    });

    container.querySelector("#btn-settings-signin")?.addEventListener("click", () => {
      window.AuthManager?.signInWithGoogle();
    });

    container.querySelector("#form-settings-exam")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = container.querySelector("#settings-exam-title").value.trim();
      const date = container.querySelector("#settings-exam-date").value;
      const time = container.querySelector("#settings-exam-time").value;

      if (!title || !date) return;

      state.exam.title = title;
      state.exam.date = date;
      state.exam.time = time;

      StorageManager.saveState(state, true, "exam_settings_change");
      window.App.showToast("Examination settings saved successfully.", "success");
    });

    // Density toggle
    container.querySelectorAll("input[name='pref-density']").forEach(radio => {
      radio.addEventListener("change", (e) => {
        const val = e.target.value;
        state.preferences.density = val;
        StorageManager.saveState(state, true, "pref_change");
        window.App.applyPreferences(state.preferences);
        this.render(container, state);
        window.App.showToast(`Display density set to ${val}.`, "info");
      });
    });

    // Export button
    container.querySelector("#btn-export-backup")?.addEventListener("click", () => {
      StorageManager.exportData(state);
      window.App.showToast("Backup exported successfully.", "success");
    });

    // Import button
    const fileInput = container.querySelector("#file-import-input");
    container.querySelector("#btn-trigger-import")?.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content !== "string") {
          window.App.showToast("Failed to read file.", "danger");
          return;
        }

        const validation = StorageManager.validateImport(content);
        if (!validation.valid) {
          window.App.showToast("Import failed: " + validation.error, "danger");
          return;
        }

        // Show confirmation before overwriting
        const imported = validation.data;
        const subjCount = imported.subjects.length;
        const taskCount = imported.tasks.length;

        window.App.showConfirmDialog({
          title: "Restore from Backup File?",
          message: `The selected backup file contains <strong>${subjCount} subjects</strong> and <strong>${taskCount} tasks</strong>. Restoring will replace your current study data. Do you wish to proceed?`,
          confirmText: "Restore Data",
          danger: true,
          onConfirm: () => {
            Object.assign(state, imported);
            StorageManager.saveState(state, true, "data_import");
            window.App.applyPreferences(state.preferences);
            window.App.renderCurrentView();
            window.App.showToast("Backup successfully restored!", "success");
          }
        });
      };
      reader.readAsText(file);
      // Reset input value
      fileInput.value = "";
    });

    // Reset default
    container.querySelector("#btn-reset-default")?.addEventListener("click", () => {
      window.App.showConfirmDialog({
        title: "Reset to Factory Curriculum?",
        message: "This will completely erase all current progress, newly added lectures, and calendar tasks, resetting the system to the initial fourth-year medical curriculum. This action cannot be undone unless you have a saved backup.",
        confirmText: "Reset Everything",
        danger: true,
        onConfirm: () => {
          const fresh = StorageManager.initDefaultState();
          Object.assign(state, fresh);
          window.App.renderCurrentView();
          window.App.showToast("Curriculum and planner reset to factory defaults.", "info");
        }
      });
    });
  },

  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

