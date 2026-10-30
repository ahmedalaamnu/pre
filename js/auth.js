/**
 * رابعة طب — Authentication Manager (Google Account & Firebase Auth)
 * 
 * Provides frictionless "Continue with Google" sign-in, session persistence,
 * user profile rendering, and safe sign-out workflows.
 */

const AuthManager = {
  auth: null,
  currentUser: null,
  isInitialized: false,

  init() {
    this.setupEventListeners();

    if (!FirebaseConfigManager.isConfigured()) {
      console.warn("Firebase credentials are not configured yet. Presenting setup guidance.");
      this.renderUnconfiguredState();
      this.showLoginScreen();
      return;
    }

    try {
      // Defensively initialize Firebase App
      if (!firebase.apps.length) {
        const config = FirebaseConfigManager.getConfig();
        firebase.initializeApp(config);
      }

      this.auth = firebase.auth();

      // Listen for authentication changes
      this.auth.onAuthStateChanged(
        (user) => this.handleAuthStateChanged(user),
        (error) => {
          console.error("Auth state change error:", error);
          window.App?.showToast("Authentication service error: " + error.message, "danger");
        }
      );

      this.isInitialized = true;
    } catch (err) {
      console.error("Firebase Auth initialization failed:", err);
      this.renderUnconfiguredState(err.message);
      this.showLoginScreen();
    }
  },

  setupEventListeners() {
    // 1. Continue with Google button on login screen
    const btnGoogle = document.getElementById("btn-google-login");
    if (btnGoogle) {
      btnGoogle.addEventListener("click", () => this.signInWithGoogle());
    }

    // 2. Sidebar Sign Out button
    const btnSidebarSignOut = document.getElementById("btn-sidebar-signout");
    if (btnSidebarSignOut) {
      btnSidebarSignOut.addEventListener("click", () => this.confirmSignOut());
    }

    // 3. Setup Firebase Key config modal trigger
    const btnOpenConfigModal = document.getElementById("btn-open-firebase-config");
    if (btnOpenConfigModal) {
      btnOpenConfigModal.addEventListener("click", () => this.openFirebaseConfigModal());
    }
  },

  handleAuthStateChanged(user) {
    const authScreen = document.getElementById("app-auth-screen");
    const sidebarUserSection = document.getElementById("sidebar-user-section");

    if (user) {
      this.currentUser = user;
      console.log("Authenticated as:", user.displayName, user.email);

      // Render profile in sidebar
      this.renderUserProfile(user);

      // Hide auth overlay smoothly
      if (authScreen) {
        authScreen.classList.add("hidden");
      }

      if (sidebarUserSection) {
        sidebarUserSection.style.display = "flex";
      }

      // Initialize cloud Firestore synchronization
      if (window.SyncManager) {
        SyncManager.init(user);
      }

      // Redirect user to the existing Dashboard as requested
      if (window.App && typeof window.App.navigateTo === "function") {
        window.App.navigateTo("dashboard");
      }

      window.App?.showToast(`Welcome back, ${user.displayName || "Doctor"}!`, "success", 3000);
    } else {
      this.currentUser = null;
      console.log("No authenticated user.");

      if (sidebarUserSection) {
        sidebarUserSection.style.display = "none";
      }

      if (window.SyncManager) {
        SyncManager.disconnect();
      }

      this.showLoginScreen();
    }
  },

  showLoginScreen() {
    const authScreen = document.getElementById("app-auth-screen");
    if (authScreen) {
      authScreen.classList.remove("hidden");
    }
  },

  renderUserProfile(user) {
    const avatarImg = document.getElementById("user-avatar-img");
    const avatarFallback = document.getElementById("user-avatar-fallback");
    const nameEl = document.getElementById("user-display-name");
    const emailEl = document.getElementById("user-email-text");

    const displayName = user.displayName || "Clinical Medical Student";
    const email = user.email || "";

    if (nameEl) nameEl.textContent = displayName;
    if (emailEl) emailEl.textContent = email;

    if (avatarImg) {
      if (user.photoURL) {
        avatarImg.src = user.photoURL;
        avatarImg.style.display = "block";
        if (avatarFallback) avatarFallback.style.display = "none";

        avatarImg.onerror = () => {
          avatarImg.style.display = "none";
          if (avatarFallback) {
            avatarFallback.style.display = "flex";
            avatarFallback.textContent = this.getInitials(displayName);
          }
        };
      } else {
        avatarImg.style.display = "none";
        if (avatarFallback) {
          avatarFallback.style.display = "flex";
          avatarFallback.textContent = this.getInitials(displayName);
        }
      }
    }
  },

  getInitials(name = "") {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },

  async signInWithGoogle() {
    if (!FirebaseConfigManager.isConfigured()) {
      this.openFirebaseConfigModal();
      return;
    }

    const btnGoogle = document.getElementById("btn-google-login");
    const originalText = btnGoogle ? btnGoogle.innerHTML : "";

    try {
      if (btnGoogle) {
        btnGoogle.disabled = true;
        btnGoogle.innerHTML = `
          <span class="btn-spinner"></span>
          <span>Signing in with Google...</span>
        `;
      }

      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      // First attempt popup sign in
      try {
        await this.auth.signInWithPopup(provider);
      } catch (popupErr) {
        if (popupErr.code === "auth/popup-blocked") {
          console.warn("Popup was blocked by the browser. Redirecting to Google...");
          await this.auth.signInWithRedirect(provider);
          return;
        } else if (popupErr.code === "auth/popup-closed-by-user") {
          console.log("Sign-in popup closed by user.");
          return;
        } else {
          throw popupErr;
        }
      }
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      let errorMsg = "Unable to sign in with Google.";

      if (err.code === "auth/unauthorized-domain") {
        errorMsg = "Unauthorized domain. Please add this domain to Firebase Console -> Authentication -> Settings -> Authorized Domains.";
      } else if (err.code === "auth/operation-not-allowed") {
        errorMsg = "Google provider is not enabled in Firebase Console. Please enable it under Authentication -> Sign-in method.";
      } else if (err.code === "auth/network-request-failed") {
        errorMsg = "Network error. Please check your internet connection.";
      } else if (err.message) {
        errorMsg = err.message;
      }

      window.App?.showToast(errorMsg, "danger", 6000);
    } finally {
      if (btnGoogle) {
        btnGoogle.disabled = false;
        btnGoogle.innerHTML = originalText;
      }
    }
  },

  confirmSignOut() {
    window.App.showConfirmDialog({
      title: "Sign Out of Account",
      message: `Are you sure you want to sign out of <strong>${this.currentUser?.email || "your account"}</strong>? Your study records will remain safely backed up in the cloud.`,
      confirmText: "Sign Out",
      danger: true,
      onConfirm: async () => {
        try {
          await this.auth.signOut();
          window.App.showToast("Signed out successfully.", "info", 3000);
        } catch (err) {
          console.error("Sign out failed:", err);
          window.App.showToast("Failed to sign out: " + err.message, "danger");
        }
      }
    });
  },

  renderUnconfiguredState(errorDetails = "") {
    const configNotice = document.getElementById("auth-config-notice");
    if (configNotice) {
      configNotice.style.display = "block";
      if (errorDetails) {
        const errorEl = configNotice.querySelector(".config-error-text");
        if (errorEl) errorEl.textContent = errorDetails;
      }
    }
  },

  openFirebaseConfigModal() {
    const currentCfg = FirebaseConfigManager.getConfig();
    const apiKey = FirebaseConfigManager.isPlaceholder(currentCfg.apiKey) ? "" : currentCfg.apiKey;
    const authDomain = FirebaseConfigManager.isPlaceholder(currentCfg.authDomain) ? "" : currentCfg.authDomain;
    const projectId = FirebaseConfigManager.isPlaceholder(currentCfg.projectId) ? "" : currentCfg.projectId;
    const storageBucket = FirebaseConfigManager.isPlaceholder(currentCfg.storageBucket) ? "" : currentCfg.storageBucket;
    const messagingSenderId = FirebaseConfigManager.isPlaceholder(currentCfg.messagingSenderId) ? "" : currentCfg.messagingSenderId;
    const appId = FirebaseConfigManager.isPlaceholder(currentCfg.appId) ? "" : currentCfg.appId;

    window.App.showModal({
      title: "Firebase Project Configuration",
      content: `
        <div class="firebase-config-modal-content">
          <p class="text-sm text-secondary">
            Enter your Firebase web app keys from <a href="https://console.firebase.google.com" target="_blank" class="text-gold" rel="noopener">Firebase Console</a> (Project Settings -> General -> Your apps -> Web app).
          </p>
          <form id="form-firebase-config" class="mt-3">
            <div class="form-group">
              <label class="form-label" for="cfg-api-key">API Key</label>
              <input type="text" id="cfg-api-key" class="form-input" required placeholder="AIzaSy..." value="${apiKey}">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="cfg-project-id">Project ID</label>
                <input type="text" id="cfg-project-id" class="form-input" required placeholder="my-med-planner" value="${projectId}">
              </div>
              <div class="form-group">
                <label class="form-label" for="cfg-auth-domain">Auth Domain</label>
                <input type="text" id="cfg-auth-domain" class="form-input" required placeholder="my-med-planner.firebaseapp.com" value="${authDomain}">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="cfg-app-id">App ID</label>
                <input type="text" id="cfg-app-id" class="form-input" placeholder="1:123456789:web:abcdef" value="${appId}">
              </div>
              <div class="form-group">
                <label class="form-label" for="cfg-storage-bucket">Storage Bucket</label>
                <input type="text" id="cfg-storage-bucket" class="form-input" placeholder="my-med-planner.appspot.com" value="${storageBucket}">
              </div>
            </div>
            <div class="modal-buttons mt-4">
              <button type="button" class="btn btn-ghost" id="cfg-btn-cancel">Cancel</button>
              <button type="submit" class="btn btn-primary">
                ${AppIcons.get("check", "", 16)} Save Configuration & Connect
              </button>
            </div>
          </form>
        </div>
      `,
      onOpen: (modalEl, closeModal) => {
        modalEl.querySelector("#cfg-btn-cancel")?.addEventListener("click", closeModal);
        modalEl.querySelector("#form-firebase-config")?.addEventListener("submit", (e) => {
          e.preventDefault();
          const newConfig = {
            apiKey: modalEl.querySelector("#cfg-api-key").value.trim(),
            projectId: modalEl.querySelector("#cfg-project-id").value.trim(),
            authDomain: modalEl.querySelector("#cfg-auth-domain").value.trim(),
            appId: modalEl.querySelector("#cfg-app-id").value.trim(),
            storageBucket: modalEl.querySelector("#cfg-storage-bucket").value.trim(),
            messagingSenderId: messagingSenderId || "100000000"
          };

          if (!newConfig.apiKey || !newConfig.projectId) {
            window.App.showToast("Please provide at least API Key and Project ID.", "warning");
            return;
          }

          FirebaseConfigManager.saveCustomConfig(newConfig);
          closeModal();
          window.App.showToast("Firebase credentials saved! Reloading authentication...", "success", 2500);

          setTimeout(() => {
            window.location.reload();
          }, 600);
        });
      }
    });
  }
};

