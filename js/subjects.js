/**
 * رابعة طب — Subjects & Curriculum Manager
 * Full hierarchical management: Subjects -> Branches -> Lectures.
 * Real-time calculation, scheduling links, reordering, and search/filtering.
 */

const SubjectsManager = {
  currentSubjectId: null,
  searchQuery: "",
  filterStatus: "all", // "all" | "completed" | "incomplete"

  /**
   * Calculate stats for a given subject or branch
   */
  calcSubjectStats(subject) {
    if (!subject || !subject.branches || subject.branches.length === 0) {
      return { total: 0, completed: 0, remaining: 0, percentage: 0 };
    }
    let total = 0;
    let completed = 0;
    subject.branches.forEach(b => {
      if (Array.isArray(b.lectures)) {
        b.lectures.forEach(l => {
          total++;
          if (l.completed) completed++;
        });
      }
    });
    const remaining = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, remaining, percentage };
  },

  calcBranchStats(branch) {
    if (!branch || !Array.isArray(branch.lectures) || branch.lectures.length === 0) {
      return { total: 0, completed: 0, remaining: 0, percentage: 0 };
    }
    const total = branch.lectures.length;
    const completed = branch.lectures.filter(l => l.completed).length;
    const remaining = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, remaining, percentage };
  },

  calcOverallStats(subjects = []) {
    let total = 0;
    let completed = 0;
    subjects.forEach(s => {
      const stats = this.calcSubjectStats(s);
      total += stats.total;
      completed += stats.completed;
    });
    const remaining = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, remaining, percentage };
  },

  /**
   * Render the main Subjects section
   */
  render(container, state) {
    if (this.currentSubjectId) {
      const activeSubj = state.subjects.find(s => s.id === this.currentSubjectId);
      if (activeSubj) {
        this.renderSubjectDetail(container, activeSubj, state);
        return;
      } else {
        this.currentSubjectId = null;
      }
    }
    this.renderSubjectList(container, state);
  },

  /**
   * Render list of subjects
   */
  renderSubjectList(container, state) {
    const overall = this.calcOverallStats(state.subjects);

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h1 class="page-title">Curriculum Subjects</h1>
          <p class="page-subtitle">Track, master, and schedule all 4th-year modules and branches</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" id="btn-add-subject">
            ${AppIcons.get("plus", "btn-icon", 16)} Add Subject
          </button>
        </div>
      </div>

      <!-- Overall Summary Bar -->
      <div class="stats-card overall-curriculum-banner">
        <div class="banner-info">
          <span class="badge badge-gold">Total Curriculum Completion</span>
          <div class="banner-numbers">
            <span class="banner-val">${overall.percentage}%</span>
            <span class="banner-sub">(${overall.completed} of ${overall.total} lectures mastered)</span>
          </div>
          <div class="progress-bar-container mt-2">
            <div class="progress-bar-fill" style="width: ${overall.percentage}%"></div>
          </div>
        </div>
        <div class="banner-counters">
          <div class="stat-mini">
            <span class="stat-mini-label">Total Subjects</span>
            <span class="stat-mini-val">${state.subjects.length}</span>
          </div>
          <div class="stat-mini">
            <span class="stat-mini-label">Remaining</span>
            <span class="stat-mini-val text-warning">${overall.remaining}</span>
          </div>
        </div>
      </div>

      <!-- Subject Cards Grid -->
      <div class="subjects-grid">
        ${state.subjects.map(subj => {
          const stats = this.calcSubjectStats(subj);
          const icon = AppIcons.get(subj.icon || "subjects", "subject-icon-svg", 26);
          return `
            <div class="subject-card" data-subject-id="${subj.id}">
              <div class="subject-card-header">
                <div class="subject-icon-box" style="color: ${subj.color || '#C99A2E'}">
                  ${icon}
                </div>
                <div class="subject-card-meta">
                  <h3 class="subject-card-title">${this.escapeHtml(subj.name)}</h3>
                  <span class="subject-branch-count">${(subj.branches || []).length} branches</span>
                </div>
                <button class="btn-icon-subtle edit-subj-btn" title="Edit Subject" data-id="${subj.id}">
                  ${AppIcons.get("edit", "", 16)}
                </button>
              </div>

              <div class="subject-progress-section">
                <div class="progress-header">
                  <span class="progress-label">Progress</span>
                  <span class="progress-percent text-gold">${stats.percentage}%</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar-fill" style="width: ${stats.percentage}%; background-color: ${subj.color || '#C99A2E'}"></div>
                </div>
              </div>

              <div class="subject-stats-row">
                <div class="sub-stat">
                  <span class="sub-stat-num">${stats.total}</span>
                  <span class="sub-stat-label">Total</span>
                </div>
                <div class="sub-stat">
                  <span class="sub-stat-num text-success">${stats.completed}</span>
                  <span class="sub-stat-label">Done</span>
                </div>
                <div class="sub-stat">
                  <span class="sub-stat-num text-warning">${stats.remaining}</span>
                  <span class="sub-stat-label">Left</span>
                </div>
              </div>

              <div class="subject-card-footer">
                <button class="btn btn-outline btn-block open-subject-btn" data-id="${subj.id}">
                  Open Subject ${AppIcons.get("chevronRight", "", 16)}
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    // Event listeners
    container.querySelector("#btn-add-subject")?.addEventListener("click", () => {
      this.promptAddSubject(state);
    });

    container.querySelectorAll(".open-subject-btn, .subject-card-title").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = btn.closest(".subject-card")?.dataset.subjectId;
        if (id) {
          this.currentSubjectId = id;
          this.render(container, state);
        }
      });
    });

    container.querySelectorAll(".edit-subj-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        this.promptEditSubject(id, state);
      });
    });
  },

  /**
   * Render single subject detail with branches & lectures
   */
  renderSubjectDetail(container, subject, state) {
    const stats = this.calcSubjectStats(subject);

    // Apply search and filter
    const q = this.searchQuery.trim().toLowerCase();
    const filter = this.filterStatus;

    container.innerHTML = `
      <div class="view-header">
        <div class="header-back-group">
          <button class="btn btn-ghost" id="btn-back-subjects">
            ${AppIcons.get("chevronLeft", "", 18)} Back to Subjects
          </button>
          <div class="subject-detail-title-row">
            <h1 class="page-title">${this.escapeHtml(subject.name)}</h1>
            <span class="badge badge-gold">${stats.percentage}% Done</span>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" id="btn-add-branch">
            ${AppIcons.get("plus", "", 16)} Add Branch
          </button>
          <button class="btn btn-danger btn-icon-only" id="btn-delete-subject" title="Delete Subject">
            ${AppIcons.get("trash", "", 16)}
          </button>
        </div>
      </div>

      <!-- Filter and Search Toolbar -->
      <div class="curriculum-toolbar">
        <div class="search-input-wrapper">
          <span class="search-icon">${AppIcons.get("search", "", 16)}</span>
          <input type="text" id="lecture-search-input" class="search-field" placeholder="Search lectures in ${this.escapeHtml(subject.name)}..." value="${this.escapeHtml(this.searchQuery)}">
          ${this.searchQuery ? `<button class="clear-search-btn" id="btn-clear-search">${AppIcons.get("x", "", 14)}</button>` : ""}
        </div>
        <div class="filter-pills">
          <button class="filter-pill ${filter === 'all' ? 'active' : ''}" data-filter="all">All (${stats.total})</button>
          <button class="filter-pill ${filter === 'incomplete' ? 'active' : ''}" data-filter="incomplete">Remaining (${stats.remaining})</button>
          <button class="filter-pill ${filter === 'completed' ? 'active' : ''}" data-filter="completed">Completed (${stats.completed})</button>
        </div>
      </div>

      <!-- Branches List -->
      <div class="branches-container">
        ${(!subject.branches || subject.branches.length === 0) ? `
          <div class="empty-state-card">
            <div class="empty-icon">${AppIcons.get("subjects", "", 40)}</div>
            <h3>No branches yet</h3>
            <p>Add a branch (e.g., Cardiology, Respiratory) to start grouping your lectures.</p>
            <button class="btn btn-primary mt-2" id="btn-empty-add-branch">${AppIcons.get("plus", "", 16)} Create First Branch</button>
          </div>
        ` : subject.branches.map((branch, bIdx) => {
          const bStats = this.calcBranchStats(branch);

          // Filter branch lectures
          const filteredLectures = (branch.lectures || []).filter(lec => {
            if (filter === "completed" && !lec.completed) return false;
            if (filter === "incomplete" && lec.completed) return false;
            if (q) {
              const matchTitle = (lec.title || "").toLowerCase().includes(q);
              const matchNotes = (lec.notes || "").toLowerCase().includes(q);
              return matchTitle || matchNotes;
            }
            return true;
          });

          // If searching or filtering and no matches in this branch, hide branch
          if (filteredLectures.length === 0 && (q || filter !== "all")) {
            return "";
          }

          return `
            <div class="branch-card" data-branch-id="${branch.id}">
              <div class="branch-card-header">
                <div class="branch-title-group">
                  <h3 class="branch-name">${this.escapeHtml(branch.name)}</h3>
                  <span class="branch-count-badge">${bStats.completed}/${bStats.total}</span>
                </div>
                <div class="branch-progress-compact">
                  <div class="progress-bar-container mini">
                    <div class="progress-bar-fill" style="width: ${bStats.percentage}%"></div>
                  </div>
                  <span class="branch-pct text-gold">${bStats.percentage}%</span>
                </div>
                <div class="branch-actions">
                  <button class="btn-icon-subtle btn-add-lecture" data-branch-id="${branch.id}" title="Add Lecture to Branch">
                    ${AppIcons.get("plus", "", 16)}
                  </button>
                  <button class="btn-icon-subtle btn-rename-branch" data-branch-id="${branch.id}" title="Rename Branch">
                    ${AppIcons.get("edit", "", 16)}
                  </button>
                  <button class="btn-icon-subtle btn-move-branch-up" data-branch-id="${branch.id}" title="Move Up" ${bIdx === 0 ? "disabled" : ""}>
                    ${AppIcons.get("chevronUp", "", 15)}
                  </button>
                  <button class="btn-icon-subtle btn-move-branch-down" data-branch-id="${branch.id}" title="Move Down" ${bIdx === subject.branches.length - 1 ? "disabled" : ""}>
                    ${AppIcons.get("chevronDown", "", 15)}
                  </button>
                  <button class="btn-icon-subtle btn-delete-branch text-danger" data-branch-id="${branch.id}" title="Delete Branch">
                    ${AppIcons.get("trash", "", 16)}
                  </button>
                </div>
              </div>

              <!-- Lectures in Branch -->
              <div class="lectures-list">
                ${filteredLectures.length === 0 ? `
                  <div class="empty-branch-hint">No lectures in this branch. Click '+' to add one.</div>
                ` : filteredLectures.map((lec, lIdx) => {
                  return `
                    <div class="lecture-item ${lec.completed ? 'is-completed' : ''}" data-lecture-id="${lec.id}" data-branch-id="${branch.id}">
                      <label class="custom-checkbox">
                        <input type="checkbox" class="lecture-check" data-lecture-id="${lec.id}" data-branch-id="${branch.id}" ${lec.completed ? 'checked' : ''}>
                        <span class="checkmark"></span>
                      </label>
                      <div class="lecture-content">
                        <div class="lecture-header-row">
                          <span class="lecture-title ${lec.completed ? 'completed-text' : ''}">${this.escapeHtml(lec.title)}</span>
                          ${lec.priority ? `<span class="priority-pill priority-${lec.priority}">${lec.priority}</span>` : ""}
                          ${lec.durationMin ? `<span class="duration-badge">${AppIcons.get("clock", "", 12)} ${lec.durationMin}m</span>` : ""}
                        </div>
                        ${lec.notes ? `<p class="lecture-notes">${this.escapeHtml(lec.notes)}</p>` : ""}
                        ${lec.rating ? `<div class="lecture-rating">${'★'.repeat(lec.rating)}${'☆'.repeat(5 - lec.rating)}</div>` : ""}
                      </div>
                      <div class="lecture-actions">
                        <button class="btn-icon-subtle btn-schedule-lecture" data-lecture-id="${lec.id}" data-branch-id="${branch.id}" title="Schedule on Calendar">
                          ${AppIcons.get("calendar", "", 15)}
                        </button>
                        <button class="btn-icon-subtle btn-edit-lecture" data-lecture-id="${lec.id}" data-branch-id="${branch.id}" title="Edit Lecture">
                          ${AppIcons.get("edit", "", 15)}
                        </button>
                        <button class="btn-icon-subtle btn-delete-lecture text-danger" data-lecture-id="${lec.id}" data-branch-id="${branch.id}" title="Delete Lecture">
                          ${AppIcons.get("trash", "", 15)}
                        </button>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    // Hook listeners
    container.querySelector("#btn-back-subjects")?.addEventListener("click", () => {
      this.currentSubjectId = null;
      this.searchQuery = "";
      this.render(container, state);
    });

    container.querySelector("#btn-empty-add-branch")?.addEventListener("click", () => {
      this.promptAddBranch(subject, state, container);
    });

    container.querySelector("#btn-add-branch")?.addEventListener("click", () => {
      this.promptAddBranch(subject, state, container);
    });

    container.querySelector("#btn-delete-subject")?.addEventListener("click", () => {
      this.promptDeleteSubject(subject, state, container);
    });

    // Search and filter
    const searchInput = container.querySelector("#lecture-search-input");
    searchInput?.addEventListener("input", (e) => {
      this.searchQuery = e.target.value;
      this.renderSubjectDetail(container, subject, state);
    });

    container.querySelector("#btn-clear-search")?.addEventListener("click", () => {
      this.searchQuery = "";
      this.renderSubjectDetail(container, subject, state);
    });

    container.querySelectorAll(".filter-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        this.filterStatus = pill.dataset.filter;
        this.renderSubjectDetail(container, subject, state);
      });
    });

    // Branch actions
    container.querySelectorAll(".btn-rename-branch").forEach(btn => {
      btn.addEventListener("click", () => {
        const bId = btn.dataset.branchId;
        const branch = subject.branches.find(b => b.id === bId);
        if (branch) this.promptRenameBranch(subject, branch, state, container);
      });
    });

    container.querySelectorAll(".btn-delete-branch").forEach(btn => {
      btn.addEventListener("click", () => {
        const bId = btn.dataset.branchId;
        const branch = subject.branches.find(b => b.id === bId);
        if (branch) this.promptDeleteBranch(subject, branch, state, container);
      });
    });

    container.querySelectorAll(".btn-move-branch-up").forEach(btn => {
      btn.addEventListener("click", () => {
        const bId = btn.dataset.branchId;
        this.moveBranch(subject, bId, -1, state, container);
      });
    });

    container.querySelectorAll(".btn-move-branch-down").forEach(btn => {
      btn.addEventListener("click", () => {
        const bId = btn.dataset.branchId;
        this.moveBranch(subject, bId, 1, state, container);
      });
    });

    container.querySelectorAll(".btn-add-lecture").forEach(btn => {
      btn.addEventListener("click", () => {
        const bId = btn.dataset.branchId;
        const branch = subject.branches.find(b => b.id === bId);
        if (branch) this.promptAddLecture(subject, branch, state, container);
      });
    });

    // Lecture checkboxes
    container.querySelectorAll(".lecture-check").forEach(cb => {
      cb.addEventListener("change", (e) => {
        const lId = cb.dataset.lectureId;
        const bId = cb.dataset.branchId;
        this.toggleLectureCompletion(subject, bId, lId, cb.checked, state, container);
      });
    });

    // Lecture edit & delete & schedule
    container.querySelectorAll(".btn-edit-lecture").forEach(btn => {
      btn.addEventListener("click", () => {
        const lId = btn.dataset.lectureId;
        const bId = btn.dataset.branchId;
        this.promptEditLecture(subject, bId, lId, state, container);
      });
    });

    container.querySelectorAll(".btn-delete-lecture").forEach(btn => {
      btn.addEventListener("click", () => {
        const lId = btn.dataset.lectureId;
        const bId = btn.dataset.branchId;
        this.promptDeleteLecture(subject, bId, lId, state, container);
      });
    });

    container.querySelectorAll(".btn-schedule-lecture").forEach(btn => {
      btn.addEventListener("click", () => {
        const lId = btn.dataset.lectureId;
        const bId = btn.dataset.branchId;
        if (window.App && typeof window.App.openTaskModalWithLecture === "function") {
          window.App.openTaskModalWithLecture(subject.id, bId, lId);
        }
      });
    });
  },

  toggleLectureCompletion(subject, branchId, lectureId, isCompleted, state, container) {
    const branch = subject.branches.find(b => b.id === branchId);
    if (!branch) return;
    const lecture = branch.lectures.find(l => l.id === lectureId);
    if (!lecture) return;

    lecture.completed = isCompleted;

    // Log activity
    StorageManager.logActivity(state, isCompleted ? "lecture_complete" : "lecture_uncomplete", {
      subjectId: subject.id,
      subjectName: subject.name,
      branchId: branch.id,
      branchName: branch.name,
      lectureId: lecture.id,
      lectureTitle: lecture.title
    });

    StorageManager.saveState(state, true, "lecture_toggle");
    this.renderSubjectDetail(container, subject, state);

    if (window.App && window.App.showToast) {
      window.App.showToast(
        isCompleted ? `Completed: "${lecture.title}"` : `Marked incomplete: "${lecture.title}"`,
        isCompleted ? "success" : "info"
      );
    }
  },

  promptAddSubject(state) {
    window.App.showModal({
      title: "Add New Subject",
      content: `
        <form id="form-new-subject" class="modal-form">
          <div class="form-group">
            <label class="form-label" for="new-subj-name">Subject Name *</label>
            <input type="text" id="new-subj-name" class="form-input" required placeholder="e.g. Ophthalmology, Dermatology">
          </div>
          <div class="form-group">
            <label class="form-label" for="new-subj-color">Accent Color</label>
            <div class="color-picker-row">
              <input type="color" id="new-subj-color" class="color-picker" value="#C99A2E">
              <span class="color-hex-label">#C99A2E</span>
            </div>
          </div>
          <div class="modal-buttons">
            <button type="button" class="btn btn-ghost" id="modal-btn-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Subject</button>
          </div>
        </form>
      `,
      onOpen: (modalEl, closeModal) => {
        const form = modalEl.querySelector("#form-new-subject");
        modalEl.querySelector("#modal-btn-cancel").addEventListener("click", closeModal);
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const name = modalEl.querySelector("#new-subj-name").value.trim();
          const color = modalEl.querySelector("#new-subj-color").value;
          if (!name) return;

          const newSubj = {
            id: generateId("subj"),
            name,
            icon: "subjects",
            color,
            order: state.subjects.length + 1,
            branches: []
          };
          state.subjects.push(newSubj);
          StorageManager.saveState(state, true, "subject_create");
          closeModal();
          this.currentSubjectId = newSubj.id;
          window.App.renderCurrentView();
          window.App.showToast(`Subject "${name}" created.`, "success");
        });
      }
    });
  },

  promptEditSubject(subjectId, state) {
    const subj = state.subjects.find(s => s.id === subjectId);
    if (!subj) return;

    window.App.showModal({
      title: "Edit Subject",
      content: `
        <form id="form-edit-subject" class="modal-form">
          <div class="form-group">
            <label class="form-label" for="edit-subj-name">Subject Name *</label>
            <input type="text" id="edit-subj-name" class="form-input" required value="${this.escapeHtml(subj.name)}">
          </div>
          <div class="form-group">
            <label class="form-label" for="edit-subj-color">Accent Color</label>
            <div class="color-picker-row">
              <input type="color" id="edit-subj-color" class="color-picker" value="${subj.color || '#C99A2E'}">
            </div>
          </div>
          <div class="modal-buttons">
            <button type="button" class="btn btn-ghost" id="modal-btn-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      `,
      onOpen: (modalEl, closeModal) => {
        modalEl.querySelector("#modal-btn-cancel").addEventListener("click", closeModal);
        modalEl.querySelector("#form-edit-subject").addEventListener("submit", (e) => {
          e.preventDefault();
          const name = modalEl.querySelector("#edit-subj-name").value.trim();
          const color = modalEl.querySelector("#edit-subj-color").value;
          if (!name) return;
          subj.name = name;
          subj.color = color;
          StorageManager.saveState(state, true, "subject_edit");
          closeModal();
          window.App.renderCurrentView();
          window.App.showToast("Subject updated successfully.", "success");
        });
      }
    });
  },

  promptDeleteSubject(subject, state, container) {
    const stats = this.calcSubjectStats(subject);
    const hasLinkedTasks = (state.tasks || []).some(t => t.subjectId === subject.id);
    let warningMsg = `Are you sure you want to delete "${this.escapeHtml(subject.name)}"?`;

    if (stats.total > 0 || hasLinkedTasks) {
      warningMsg += ` This subject contains <strong>${stats.total} lectures</strong> and ${hasLinkedTasks ? 'linked calendar tasks' : 'associated branches'}. All enclosed lectures and branch structures will be permanently removed.`;
    }

    window.App.showConfirmDialog({
      title: `Delete Subject "${subject.name}"?`,
      message: warningMsg,
      confirmText: "Delete Subject",
      danger: true,
      onConfirm: () => {
        state.subjects = state.subjects.filter(s => s.id !== subject.id);
        // Clean linked tasks subject references defensively
        (state.tasks || []).forEach(t => {
          if (t.subjectId === subject.id) {
            t.subjectId = null;
            t.branchId = null;
            t.lectureId = null;
          }
        });
        StorageManager.saveState(state, true, "subject_delete");
        this.currentSubjectId = null;
        window.App.renderCurrentView();
        window.App.showToast(`Subject "${subject.name}" deleted.`, "info");
      }
    });
  },

  promptAddBranch(subject, state, container) {
    window.App.showModal({
      title: `Add Branch to ${this.escapeHtml(subject.name)}`,
      content: `
        <form id="form-new-branch" class="modal-form">
          <div class="form-group">
            <label class="form-label" for="new-branch-name">Branch / Category Name *</label>
            <input type="text" id="new-branch-name" class="form-input" required placeholder="e.g. Cardiology, Hematology, General Care">
          </div>
          <div class="modal-buttons">
            <button type="button" class="btn btn-ghost" id="modal-btn-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Branch</button>
          </div>
        </form>
      `,
      onOpen: (modalEl, closeModal) => {
        modalEl.querySelector("#modal-btn-cancel").addEventListener("click", closeModal);
        modalEl.querySelector("#form-new-branch").addEventListener("submit", (e) => {
          e.preventDefault();
          const name = modalEl.querySelector("#new-branch-name").value.trim();
          if (!name) return;
          if (!Array.isArray(subject.branches)) subject.branches = [];
          const newBranch = {
            id: generateId("br"),
            name,
            order: subject.branches.length + 1,
            lectures: []
          };
          subject.branches.push(newBranch);
          StorageManager.saveState(state, true, "branch_create");
          closeModal();
          this.renderSubjectDetail(container, subject, state);
          window.App.showToast(`Branch "${name}" added.`, "success");
        });
      }
    });
  },

  promptRenameBranch(subject, branch, state, container) {
    window.App.showModal({
      title: "Rename Branch",
      content: `
        <form id="form-rename-branch" class="modal-form">
          <div class="form-group">
            <label class="form-label" for="rename-branch-input">Branch Name *</label>
            <input type="text" id="rename-branch-input" class="form-input" required value="${this.escapeHtml(branch.name)}">
          </div>
          <div class="modal-buttons">
            <button type="button" class="btn btn-ghost" id="modal-btn-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary">Rename</button>
          </div>
        </form>
      `,
      onOpen: (modalEl, closeModal) => {
        modalEl.querySelector("#modal-btn-cancel").addEventListener("click", closeModal);
        modalEl.querySelector("#form-rename-branch").addEventListener("submit", (e) => {
          e.preventDefault();
          const name = modalEl.querySelector("#rename-branch-input").value.trim();
          if (!name) return;
          branch.name = name;
          StorageManager.saveState(state, true, "branch_rename");
          closeModal();
          this.renderSubjectDetail(container, subject, state);
          window.App.showToast("Branch renamed.", "success");
        });
      }
    });
  },

  promptDeleteBranch(subject, branch, state, container) {
    const count = (branch.lectures || []).length;
    window.App.showConfirmDialog({
      title: `Delete Branch "${branch.name}"?`,
      message: `Are you sure you want to delete this branch? ${count > 0 ? `It contains <strong>${count} lectures</strong> that will also be removed.` : ''}`,
      confirmText: "Delete Branch",
      danger: true,
      onConfirm: () => {
        subject.branches = subject.branches.filter(b => b.id !== branch.id);
        StorageManager.saveState(state, true, "branch_delete");
        this.renderSubjectDetail(container, subject, state);
        window.App.showToast(`Branch "${branch.name}" deleted.`, "info");
      }
    });
  },

  moveBranch(subject, branchId, offset, state, container) {
    const idx = subject.branches.findIndex(b => b.id === branchId);
    if (idx === -1) return;
    const targetIdx = idx + offset;
    if (targetIdx < 0 || targetIdx >= subject.branches.length) return;

    const item = subject.branches.splice(idx, 1)[0];
    subject.branches.splice(targetIdx, 0, item);
    StorageManager.saveState(state, true, "branch_reorder");
    this.renderSubjectDetail(container, subject, state);
  },

  promptAddLecture(subject, branch, state, container) {
    window.App.showModal({
      title: `Add Lecture to ${this.escapeHtml(branch.name)}`,
      content: `
        <form id="form-new-lecture" class="modal-form">
          <div class="form-group">
            <label class="form-label" for="new-lec-title">Lecture Title *</label>
            <input type="text" id="new-lec-title" class="form-input" required placeholder="e.g. Heart Failure & Obstructive Lesions">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="new-lec-priority">Priority</label>
              <select id="new-lec-priority" class="form-select">
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="new-lec-duration">Estimated Duration (mins)</label>
              <input type="number" id="new-lec-duration" class="form-input" value="60" min="5" step="5">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="new-lec-notes">Study Notes / Key Points (Optional)</label>
            <textarea id="new-lec-notes" class="form-textarea" rows="2" placeholder="Important concepts, high-yield board topics, or reference books..."></textarea>
          </div>
          <div class="modal-buttons">
            <button type="button" class="btn btn-ghost" id="modal-btn-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Lecture</button>
          </div>
        </form>
      `,
      onOpen: (modalEl, closeModal) => {
        modalEl.querySelector("#modal-btn-cancel").addEventListener("click", closeModal);
        modalEl.querySelector("#form-new-lecture").addEventListener("submit", (e) => {
          e.preventDefault();
          const title = modalEl.querySelector("#new-lec-title").value.trim();
          const priority = modalEl.querySelector("#new-lec-priority").value;
          const durationMin = parseInt(modalEl.querySelector("#new-lec-duration").value) || 60;
          const notes = modalEl.querySelector("#new-lec-notes").value.trim();
          if (!title) return;

          if (!Array.isArray(branch.lectures)) branch.lectures = [];
          const newLecture = {
            id: generateId("lec"),
            title,
            completed: false,
            priority,
            durationMin,
            notes,
            rating: 0
          };
          branch.lectures.push(newLecture);
          StorageManager.saveState(state, true, "lecture_create");
          closeModal();
          this.renderSubjectDetail(container, subject, state);
          window.App.showToast(`Lecture "${title}" added.`, "success");
        });
      }
    });
  },

  promptEditLecture(subject, branchId, lectureId, state, container) {
    const branch = subject.branches.find(b => b.id === branchId);
    if (!branch) return;
    const lecture = branch.lectures.find(l => l.id === lectureId);
    if (!lecture) return;

    // Build branch options for moving lecture
    const branchOptions = subject.branches.map(b => {
      return `<option value="${b.id}" ${b.id === branch.id ? 'selected' : ''}>${this.escapeHtml(b.name)}</option>`;
    }).join("");

    window.App.showModal({
      title: "Edit Lecture",
      content: `
        <form id="form-edit-lecture" class="modal-form">
          <div class="form-group">
            <label class="form-label" for="edit-lec-title">Lecture Title *</label>
            <input type="text" id="edit-lec-title" class="form-input" required value="${this.escapeHtml(lecture.title)}">
          </div>
          <div class="form-group">
            <label class="form-label" for="edit-lec-branch">Belongs to Branch</label>
            <select id="edit-lec-branch" class="form-select">
              ${branchOptions}
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="edit-lec-priority">Priority</label>
              <select id="edit-lec-priority" class="form-select">
                <option value="high" ${lecture.priority === 'high' ? 'selected' : ''}>High Priority</option>
                <option value="medium" ${lecture.priority === 'medium' ? 'selected' : ''}>Medium Priority</option>
                <option value="low" ${lecture.priority === 'low' ? 'selected' : ''}>Low Priority</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="edit-lec-duration">Duration (mins)</label>
              <input type="number" id="edit-lec-duration" class="form-input" value="${lecture.durationMin || 60}" min="5" step="5">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="edit-lec-rating">Self-Assessment / Confidence (0 to 5 Stars)</label>
            <select id="edit-lec-rating" class="form-select">
              <option value="0" ${lecture.rating === 0 ? 'selected' : ''}>No Rating</option>
              <option value="1" ${lecture.rating === 1 ? 'selected' : ''}>★☆☆☆☆ — Weak / Needs Heavy Revision</option>
              <option value="2" ${lecture.rating === 2 ? 'selected' : ''}>★★☆☆☆ — Basic Understanding</option>
              <option value="3" ${lecture.rating === 3 ? 'selected' : ''}>★★★☆☆ — Fair Knowledge</option>
              <option value="4" ${lecture.rating === 4 ? 'selected' : ''}>★★★★☆ — Strong Mastery</option>
              <option value="5" ${lecture.rating === 5 ? 'selected' : ''}>★★★★★ — Exam Ready Board Mastery</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="edit-lec-notes">Study Notes</label>
            <textarea id="edit-lec-notes" class="form-textarea" rows="3">${this.escapeHtml(lecture.notes || "")}</textarea>
          </div>
          <div class="modal-buttons">
            <button type="button" class="btn btn-ghost" id="modal-btn-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      `,
      onOpen: (modalEl, closeModal) => {
        modalEl.querySelector("#modal-btn-cancel").addEventListener("click", closeModal);
        modalEl.querySelector("#form-edit-lecture").addEventListener("submit", (e) => {
          e.preventDefault();
          const title = modalEl.querySelector("#edit-lec-title").value.trim();
          const targetBranchId = modalEl.querySelector("#edit-lec-branch").value;
          const priority = modalEl.querySelector("#edit-lec-priority").value;
          const durationMin = parseInt(modalEl.querySelector("#edit-lec-duration").value) || 60;
          const rating = parseInt(modalEl.querySelector("#edit-lec-rating").value) || 0;
          const notes = modalEl.querySelector("#edit-lec-notes").value.trim();
          if (!title) return;

          lecture.title = title;
          lecture.priority = priority;
          lecture.durationMin = durationMin;
          lecture.rating = rating;
          lecture.notes = notes;

          // If moved to another branch
          if (targetBranchId !== branch.id) {
            const targetBranch = subject.branches.find(b => b.id === targetBranchId);
            if (targetBranch) {
              branch.lectures = branch.lectures.filter(l => l.id !== lecture.id);
              if (!Array.isArray(targetBranch.lectures)) targetBranch.lectures = [];
              targetBranch.lectures.push(lecture);
            }
          }

          StorageManager.saveState(state, true, "lecture_edit");
          closeModal();
          this.renderSubjectDetail(container, subject, state);
          window.App.showToast("Lecture updated.", "success");
        });
      }
    });
  },

  promptDeleteLecture(subject, branchId, lectureId, state, container) {
    const branch = subject.branches.find(b => b.id === branchId);
    if (!branch) return;
    const lecture = branch.lectures.find(l => l.id === lectureId);
    if (!lecture) return;

    window.App.showConfirmDialog({
      title: `Delete Lecture?`,
      message: `Are you sure you want to delete <strong>"${this.escapeHtml(lecture.title)}"</strong>?`,
      confirmText: "Delete Lecture",
      danger: true,
      onConfirm: () => {
        branch.lectures = branch.lectures.filter(l => l.id !== lectureId);
        StorageManager.saveState(state, true, "lecture_delete");
        this.renderSubjectDetail(container, subject, state);
        window.App.showToast(`Lecture deleted.`, "info");
      }
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

