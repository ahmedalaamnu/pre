/**
 * رابعة طب — Main Application Orchestrator
 * High-performance vanilla SPA router, modal dialog system, toast notification engine,
 * and persistent sidebar/navigation manager.
 */

window.App = {
  state: null,
  currentRoute: "dashboard",
  modalActive: false,

  init() {
    // 1. Load persistent state
    this.state = StorageManager.loadState();

    // 2. Apply preferences (density, theme)
    this.applyPreferences(this.state.preferences);

    // 3. Register global storage listener
    StorageManager.subscribe((changeType, newState) => {
      // Re-render current view when state changes if no modal is actively typing
      if (!this.modalActive) {
        this.renderCurrentView();
      }
    });

    // 4. Setup navigation
    this.setupNavigation();

    // 5. Initial routing based on location hash or default
    const hashRoute = window.location.hash.replace("#", "");
    const validRoutes = ["dashboard", "subjects", "calendar", "tasks", "progression", "settings"];
    if (validRoutes.includes(hashRoute)) {
      this.currentRoute = hashRoute;
    }

    this.navigateTo(this.currentRoute, false);

    // 6. Keyboard shortcuts (Escape closes modals)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modalActive) {
        this.closeModal();
      }
    });

    // 7. Initialize Authentication & Cloud Synchronization
    if (window.AuthManager && typeof window.AuthManager.init === "function") {
      window.AuthManager.init();
    }

    console.log("رابعة طب — Medical Study Planner initialized successfully.");
  },

  applyPreferences(preferences = {}) {
    const root = document.documentElement;
    if (preferences.density === "compact") {
      root.classList.add("density-compact");
    } else {
      root.classList.remove("density-compact");
    }
  },

  setupNavigation() {
    // Desktop right-sidebar links
    document.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const route = item.dataset.route;
        if (route) {
          this.navigateTo(route);
        }
      });
    });

    // Mobile bottom-navigation items
    document.querySelectorAll(".mobile-nav-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const route = item.dataset.route;
        if (route) {
          this.navigateTo(route);
        }
      });
    });

    // Sidebar toggle collapse button
    const toggleBtn = document.getElementById("btn-toggle-sidebar");
    const sidebar = document.querySelector(".app-sidebar");
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
      });
    }

    // Window popstate / hashchange listener
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace("#", "");
      const validRoutes = ["dashboard", "subjects", "calendar", "tasks", "progression", "settings"];
      if (validRoutes.includes(hash) && hash !== this.currentRoute) {
        this.navigateTo(hash, false);
      }
    });
  },

  navigateTo(route, updateHash = true) {
    this.currentRoute = route;
    if (updateHash) {
      window.location.hash = route;
    }

    // Update active class on desktop sidebar
    document.querySelectorAll(".nav-item").forEach(item => {
      if (item.dataset.route === route) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Update active class on mobile navigation
    document.querySelectorAll(".mobile-nav-item").forEach(item => {
      if (item.dataset.route === route) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    this.renderCurrentView();

    // Scroll to top of main view container
    const mainEl = document.getElementById("main-view-container");
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: "smooth" });
    }
  },

  renderCurrentView() {
    const container = document.getElementById("main-view-container");
    if (!container) return;

    switch (this.currentRoute) {
      case "dashboard":
        DashboardManager.render(container, this.state);
        break;
      case "subjects":
        SubjectsManager.render(container, this.state);
        break;
      case "calendar":
        CalendarManager.render(container, this.state);
        break;
      case "tasks":
        TasksManager.renderDailyView(container, this.state);
        break;
      case "progression":
        AnalyticsManager.render(container, this.state);
        break;
      case "settings":
        SettingsManager.render(container, this.state);
        break;
      default:
        DashboardManager.render(container, this.state);
        break;
    }
  },

  /**
   * Helper to open the Task Modal with a specific lecture preselected
   */
  openTaskModalWithLecture(subjectId, branchId, lectureId) {
    const subj = (this.state.subjects || []).find(s => s.id === subjectId);
    const branch = subj?.branches?.find(b => b.id === branchId);
    const lecture = branch?.lectures?.find(l => l.id === lectureId);

    const preselected = {
      subjectId,
      branchId,
      lectureId,
      title: lecture ? lecture.title : ""
    };

    TasksManager.openTaskModal(null, DateUtils.todayString(), this.state, preselected);
  },

  /**
   * Modal System
   */
  showModal({ title = "", content = "", onOpen = null }) {
    const modalBackdrop = document.getElementById("app-modal-backdrop");
    const modalContainer = document.getElementById("app-modal-container");
    if (!modalBackdrop || !modalContainer) return;

    this.modalActive = true;

    modalContainer.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close-btn" id="btn-modal-close" title="Close">${AppIcons.get("x", "", 18)}</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;

    modalBackdrop.classList.add("active");
    document.body.classList.add("modal-open");

    const closeModal = () => this.closeModal();

    modalContainer.querySelector("#btn-modal-close")?.addEventListener("click", closeModal);
    modalBackdrop.onclick = (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    };

    if (typeof onOpen === "function") {
      onOpen(modalContainer, closeModal);
    }
  },

  closeModal() {
    const modalBackdrop = document.getElementById("app-modal-backdrop");
    const modalContainer = document.getElementById("app-modal-container");
    if (modalBackdrop) modalBackdrop.classList.remove("active");
    if (modalContainer) modalContainer.innerHTML = "";
    document.body.classList.remove("modal-open");
    this.modalActive = false;
  },

  showConfirmDialog({ title, message, confirmText = "Confirm", danger = false, onConfirm }) {
    this.showModal({
      title,
      content: `
        <div class="confirm-dialog-content">
          <p class="confirm-message">${message}</p>
          <div class="modal-buttons mt-4">
            <button class="btn btn-ghost" id="confirm-btn-cancel">Cancel</button>
            <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirm-btn-proceed">${confirmText}</button>
          </div>
        </div>
      `,
      onOpen: (modalEl, closeModal) => {
        modalEl.querySelector("#confirm-btn-cancel")?.addEventListener("click", closeModal);
        modalEl.querySelector("#confirm-btn-proceed")?.addEventListener("click", () => {
          closeModal();
          if (typeof onConfirm === "function") {
            onConfirm();
          }
        });
      }
    });
  },

  /**
   * Toast Notifications
   */
  showToast(message, type = "info", duration = 3500) {
    const toastContainer = document.getElementById("app-toast-container");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const icon = type === "success" ? AppIcons.get("check", "", 16) :
                 type === "danger" ? AppIcons.get("alert", "", 16) : AppIcons.get("info", "", 16);

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-text">${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("visible");
    }, 10);

    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }
};

// Initialize application on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.App.init();
});

