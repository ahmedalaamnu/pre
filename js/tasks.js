/**
 * رابعة طب — Task Management & Daily Tasks Page
 * Single source of truth for all calendar-scheduled and daily medical tasks.
 * Cascading subject-to-lecture linking, date grouping, and full synchronization.
 */

const TasksManager = {
  currentFilterDate: DateUtils.todayString(),

  /**
   * Get tasks for a specific date (YYYY-MM-DD)
   */
  getTasksForDate(state, dateStr) {
    if (!state.tasks || !Array.isArray(state.tasks)) return [];
    return state.tasks.filter(t => t.date === dateStr);
  },

  /**
   * Get overdue tasks (incomplete tasks with date strictly before today)
   */
  getOverdueTasks(state, todayStr = DateUtils.todayString()) {
    if (!state.tasks || !Array.isArray(state.tasks)) return [];
    return state.tasks.filter(t => !t.completed && t.date < todayStr);
  },

  /**
   * Render the Daily Tasks page: "What do I have to do today?"
   */
  renderDailyView(container, state) {
    const today = DateUtils.todayString();
    const currentDate = this.currentFilterDate || today;
    const isToday = currentDate === today;

    const dayTasks = this.getTasksForDate(state, currentDate);
    const overdueTasks = isToday ? this.getOverdueTasks(state, today) : [];

    const totalDayTasks = dayTasks.length;
    const completedDayTasks = dayTasks.filter(t => t.completed).length;
    const remainingDayTasks = totalDayTasks - completedDayTasks;
    const dayPercentage = totalDayTasks > 0 ? Math.round((completedDayTasks / totalDayTasks) * 100) : 0;

    const gregorianTitle = DateUtils.formatGregorian(currentDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const hijriTitle = DateUtils.formatHijri(currentDate);

    container.innerHTML = `
      <div class="view-header">
        <div>
          <div class="daily-date-header">
            <span class="badge ${isToday ? 'badge-gold' : 'badge-neutral'}">${isToday ? "Today's Schedule" : "Browsing Date"}</span>
            <span class="hijri-sub-label">${hijriTitle}</span>
          </div>
          <h1 class="page-title">${gregorianTitle}</h1>
        </div>
        <div class="header-actions">
          <div class="day-stepper-btn-group">
            <button class="btn btn-secondary btn-icon-only" id="btn-prev-day" title="Previous Day">
              ${AppIcons.get("chevronLeft", "", 18)}
            </button>
            <button class="btn ${isToday ? 'btn-primary' : 'btn-outline'}" id="btn-today-day">
              Today
            </button>
            <button class="btn btn-secondary btn-icon-only" id="btn-next-day" title="Next Day">
              ${AppIcons.get("chevronRight", "", 18)}
            </button>
          </div>
          <button class="btn btn-primary" id="btn-add-daily-task">
            ${AppIcons.get("plus", "", 16)} Add Task
          </button>
        </div>
      </div>

      <!-- Daily Progress Summary Bar -->
      <div class="daily-progress-banner stats-card">
        <div class="daily-progress-info">
          <span class="banner-label">Daily Goal Completion</span>
          <div class="banner-numbers">
            <span class="banner-val text-gold">${dayPercentage}%</span>
            <span class="banner-sub">(${completedDayTasks} of ${totalDayTasks} tasks completed)</span>
          </div>
          <div class="progress-bar-container mt-2">
            <div class="progress-bar-fill" style="width: ${dayPercentage}%"></div>
          </div>
        </div>
        <div class="daily-progress-stats">
          <div class="stat-mini">
            <span class="stat-mini-label">Total</span>
            <span class="stat-mini-val">${totalDayTasks}</span>
          </div>
          <div class="stat-mini">
            <span class="stat-mini-label">Completed</span>
            <span class="stat-mini-val text-success">${completedDayTasks}</span>
          </div>
          <div class="stat-mini">
            <span class="stat-mini-label">Pending</span>
            <span class="stat-mini-val text-warning">${remainingDayTasks}</span>
          </div>
        </div>
      </div>

      <!-- Overdue Section (if any and viewing Today) -->
      ${overdueTasks.length > 0 ? `
        <div class="task-section overdue-section">
          <div class="section-title-row">
            <span class="section-badge danger">${AppIcons.get("alert", "", 14)} Overdue Tasks (${overdueTasks.length})</span>
            <span class="section-subtext">Tasks from previous days that require attention</span>
          </div>
          <div class="tasks-list-grid">
            ${overdueTasks.map(task => this.renderTaskItemHtml(task, state, true)).join("")}
          </div>
        </div>
      ` : ""}

      <!-- Today's Scheduled Tasks -->
      <div class="task-section">
        <div class="section-title-row">
          <h2 class="section-heading">${isToday ? "Today's Agenda" : "Scheduled For This Day"}</h2>
          <span class="section-count">${totalDayTasks} tasks</span>
        </div>

        ${totalDayTasks === 0 ? `
          <div class="empty-state-card">
            <div class="empty-icon">${AppIcons.get("tasks", "", 44)}</div>
            <h3>No tasks scheduled for ${isToday ? "today" : "this date"}</h3>
            <p>Plan ahead by scheduling lectures, review sessions, or MCQ practice sets.</p>
            <button class="btn btn-primary mt-2" id="btn-empty-add-task">
              ${AppIcons.get("plus", "", 16)} Schedule a Task
            </button>
          </div>
        ` : `
          <div class="tasks-list-grid">
            ${dayTasks.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99")).map(task => this.renderTaskItemHtml(task, state, false)).join("")}
          </div>
        `}
      </div>
    `;

    // Hook listeners
    container.querySelector("#btn-prev-day")?.addEventListener("click", () => {
      this.currentFilterDate = DateUtils.addDays(currentDate, -1);
      this.renderDailyView(container, state);
    });

    container.querySelector("#btn-next-day")?.addEventListener("click", () => {
      this.currentFilterDate = DateUtils.addDays(currentDate, 1);
      this.renderDailyView(container, state);
    });

    container.querySelector("#btn-today-day")?.addEventListener("click", () => {
      this.currentFilterDate = today;
      this.renderDailyView(container, state);
    });

    container.querySelector("#btn-add-daily-task")?.addEventListener("click", () => {
      this.openTaskModal(null, currentDate, state);
    });

    container.querySelector("#btn-empty-add-task")?.addEventListener("click", () => {
      this.openTaskModal(null, currentDate, state);
    });

    // Task Checkboxes
    container.querySelectorAll(".task-checkbox-input").forEach(cb => {
      cb.addEventListener("change", (e) => {
        const taskId = cb.dataset.taskId;
        this.toggleTaskCompletion(taskId, cb.checked, state);
      });
    });

    // Task Item Click -> Opens Detail Modal (Mandatory requirement)
    container.querySelectorAll(".task-card").forEach(card => {
      card.addEventListener("click", (e) => {
        // Prevent opening if clicked on checkbox directly
        if (e.target.closest(".custom-checkbox") || e.target.closest(".task-quick-action")) {
          return;
        }
        const taskId = card.dataset.taskId;
        this.openTaskDetailModal(taskId, state);
      });
    });

    // Task Quick Delete
    container.querySelectorAll(".btn-task-quick-delete").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const taskId = btn.dataset.taskId;
        this.promptDeleteTask(taskId, state);
      });
    });
  },

  /**
   * Helper to generate HTML for a single task card
   */
  renderTaskItemHtml(task, state, isOverdue = false) {
    const subject = task.subjectId ? (state.subjects || []).find(s => s.id === task.subjectId) : null;
    let branchName = "";
    let lectureTitle = "";

    if (subject && task.branchId) {
      const branch = (subject.branches || []).find(b => b.id === task.branchId);
      if (branch) {
        branchName = branch.name;
        if (task.lectureId) {
          const lec = (branch.lectures || []).find(l => l.id === task.lectureId);
          if (lec) lectureTitle = lec.title;
        }
      }
    }

    const priorityClass = task.priority ? `priority-${task.priority}` : "priority-medium";
    const dateBadge = isOverdue ? `<span class="badge badge-danger">${DateUtils.formatGregorian(task.date, { month: "short", day: "numeric" })}</span>` : "";

    return `
      <div class="task-card ${task.completed ? 'is-completed' : ''} ${isOverdue ? 'is-overdue' : ''}" data-task-id="${task.id}">
        <label class="custom-checkbox task-check-wrapper" title="Mark Task Complete">
          <input type="checkbox" class="task-checkbox-input" data-task-id="${task.id}" ${task.completed ? 'checked' : ''}>
          <span class="checkmark"></span>
        </label>
        <div class="task-body">
          <div class="task-top-meta">
            ${subject ? `<span class="subject-tag" style="border-color: ${subject.color || '#C99A2E'}; color: ${subject.color || '#C99A2E'}">${this.escapeHtml(subject.name)}</span>` : ""}
            ${branchName ? `<span class="branch-tag">${this.escapeHtml(branchName)}</span>` : ""}
            ${dateBadge}
            ${task.time ? `<span class="task-time-pill">${AppIcons.get("clock", "", 12)} ${task.time}</span>` : ""}
            ${task.durationMin ? `<span class="task-duration-pill">${task.durationMin}m</span>` : ""}
            ${task.priority ? `<span class="priority-pill ${priorityClass}">${task.priority}</span>` : ""}
          </div>
          <h4 class="task-title ${task.completed ? 'completed-text' : ''}">${this.escapeHtml(task.title)}</h4>
          ${task.notes ? `<p class="task-notes-snippet">${this.escapeHtml(task.notes)}</p>` : ""}
        </div>
        <div class="task-tail">
          <button class="btn-icon-subtle task-quick-action btn-task-quick-delete" data-task-id="${task.id}" title="Delete Task">
            ${AppIcons.get("trash", "", 15)}
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Toggle task completion
   */
  toggleTaskCompletion(taskId, isCompleted, state) {
    const task = (state.tasks || []).find(t => t.id === taskId);
    if (!task) return;

    task.completed = isCompleted;

    // Log activity
    StorageManager.logActivity(state, isCompleted ? "task_complete" : "task_uncomplete", {
      taskId: task.id,
      taskTitle: task.title,
      date: task.date
    });

    StorageManager.saveState(state, true, "task_toggle");
    window.App.renderCurrentView();

    if (window.App && window.App.showToast) {
      window.App.showToast(
        isCompleted ? `Task completed: "${task.title}"` : `Task marked incomplete: "${task.title}"`,
        isCompleted ? "success" : "info"
      );
    }
  },

  /**
   * Open full task detail modal (Mandatory: clicking a task must open its details)
   */
  openTaskDetailModal(taskId, state) {
    const task = (state.tasks || []).find(t => t.id === taskId);
    if (!task) return;

    const subject = task.subjectId ? (state.subjects || []).find(s => s.id === task.subjectId) : null;
    let branchName = "None";
    let lectureTitle = "None";

    if (subject && task.branchId) {
      const branch = (subject.branches || []).find(b => b.id === task.branchId);
      if (branch) {
        branchName = branch.name;
        if (task.lectureId) {
          const lec = (branch.lectures || []).find(l => l.id === task.lectureId);
          if (lec) lectureTitle = lec.title;
        }
      }
    }

    const gregorianDate = DateUtils.formatGregorian(task.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const hijriDate = DateUtils.formatHijri(task.date);

    window.App.showModal({
      title: "Task Details",
      content: `
        <div class="task-details-view">
          <div class="task-details-header">
            <span class="badge ${task.completed ? 'badge-success' : 'badge-gold'}">
              ${task.completed ? 'Completed' : 'Pending Action'}
            </span>
            <span class="task-priority-badge priority-${task.priority || 'medium'}">${(task.priority || 'medium').toUpperCase()} PRIORITY</span>
          </div>

          <h2 class="task-detail-title ${task.completed ? 'completed-text' : ''}">${this.escapeHtml(task.title)}</h2>

          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Scheduled Date</span>
              <span class="detail-value">${gregorianDate}</span>
              <span class="detail-sub">${hijriDate}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Scheduled Time & Duration</span>
              <span class="detail-value">${task.time || "Flexible Time"} ${task.durationMin ? `(${task.durationMin} minutes)` : ""}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Curriculum Association</span>
              <span class="detail-value">${subject ? this.escapeHtml(subject.name) : "Independent Study Task"}</span>
              ${branchName !== "None" ? `<span class="detail-sub">Branch: ${this.escapeHtml(branchName)}</span>` : ""}
              ${lectureTitle !== "None" ? `<span class="detail-sub">Lecture: ${this.escapeHtml(lectureTitle)}</span>` : ""}
            </div>
          </div>

          ${task.notes ? `
            <div class="detail-notes-block">
              <span class="detail-label">Study Notes</span>
              <p class="notes-content">${this.escapeHtml(task.notes)}</p>
            </div>
          ` : ""}

          <div class="modal-buttons mt-4">
            <button class="btn btn-ghost" id="modal-btn-close-detail">Close</button>
            <button class="btn btn-danger" id="modal-btn-delete-task">${AppIcons.get("trash", "", 16)} Delete</button>
            <button class="btn btn-secondary" id="modal-btn-edit-task">${AppIcons.get("edit", "", 16)} Edit / Reschedule</button>
            <button class="btn ${task.completed ? 'btn-outline' : 'btn-primary'}" id="modal-btn-toggle-task">
              ${task.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
          </div>
        </div>
      `,
      onOpen: (modalEl, closeModal) => {
        modalEl.querySelector("#modal-btn-close-detail")?.addEventListener("click", closeModal);

        modalEl.querySelector("#modal-btn-toggle-task")?.addEventListener("click", () => {
          this.toggleTaskCompletion(task.id, !task.completed, state);
          closeModal();
        });

        modalEl.querySelector("#modal-btn-delete-task")?.addEventListener("click", () => {
          closeModal();
          this.promptDeleteTask(task.id, state);
        });

        modalEl.querySelector("#modal-btn-edit-task")?.addEventListener("click", () => {
          closeModal();
          this.openTaskModal(task, task.date, state);
        });
      }
    });
  },

  /**
   * Open Task Creation / Edit Modal with dynamic cascading subject-to-lecture dropdowns!
   */
  openTaskModal(taskToEdit = null, defaultDate = DateUtils.todayString(), state, preselectedLecture = null) {
    const isEdit = !!taskToEdit;
    const task = taskToEdit || {
      id: generateId("task"),
      title: "",
      date: defaultDate || DateUtils.todayString(),
      time: "",
      durationMin: 60,
      priority: "medium",
      notes: "",
      subjectId: preselectedLecture ? preselectedLecture.subjectId : "",
      branchId: preselectedLecture ? preselectedLecture.branchId : "",
      lectureId: preselectedLecture ? preselectedLecture.lectureId : "",
      completed: false
    };

    // If preselected lecture provided, fill title if empty
    if (preselectedLecture && preselectedLecture.title && !task.title) {
      task.title = preselectedLecture.title;
    }

    const subjects = state.subjects || [];

    // Build initial subject options
    const subjectOptions = subjects.map(s => {
      return `<option value="${s.id}" ${s.id === task.subjectId ? 'selected' : ''}>${this.escapeHtml(s.name)}</option>`;
    }).join("");

    window.App.showModal({
      title: isEdit ? "Edit Task" : "Schedule New Task",
      content: `
        <form id="form-task-editor" class="modal-form">
          <!-- Subject -> Branch -> Lecture Cascading Selectors -->
          <div class="cascading-card">
            <span class="cascading-heading">Link to Curriculum (Optional)</span>
            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label" for="task-select-subject">Subject</label>
                <select id="task-select-subject" class="form-select">
                  <option value="">-- No Subject (General Task) --</option>
                  ${subjectOptions}
                </select>
              </div>
              <div class="form-group flex-1">
                <label class="form-label" for="task-select-branch">Branch</label>
                <select id="task-select-branch" class="form-select">
                  <option value="">-- Select Subject First --</option>
                </select>
              </div>
            </div>

            <div class="form-group mt-1">
              <label class="form-label" for="task-select-lecture">Lecture</label>
              <select id="task-select-lecture" class="form-select">
                <option value="">-- Select Branch First --</option>
              </select>
              <span class="field-hint">Selecting a lecture automatically sets the task title and links progress.</span>
            </div>
          </div>

          <div class="form-group mt-2">
            <label class="form-label" for="task-input-title">Task Title *</label>
            <input type="text" id="task-input-title" class="form-input" required placeholder="e.g. Rheumatic Heart Disease, Solve 30 MCQs, Revise Anatomy" value="${this.escapeHtml(task.title)}">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="task-input-date">Date *</label>
              <input type="date" id="task-input-date" class="form-input" required value="${task.date || defaultDate}">
            </div>
            <div class="form-group">
              <label class="form-label" for="task-input-time">Start Time (Optional)</label>
              <input type="time" id="task-input-time" class="form-input" value="${task.time || ""}">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="task-select-priority">Priority</label>
              <select id="task-select-priority" class="form-select">
                <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High Priority</option>
                <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium Priority</option>
                <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low Priority</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="task-input-duration">Estimated Duration (mins)</label>
              <input type="number" id="task-input-duration" class="form-input" min="5" step="5" value="${task.durationMin || 60}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="task-input-notes">Notes & Key Objectives</label>
            <textarea id="task-input-notes" class="form-textarea" rows="2" placeholder="e.g. Focus on Duke criteria and antibiotic prophylaxis">${this.escapeHtml(task.notes || "")}</textarea>
          </div>

          <div class="modal-buttons">
            <button type="button" class="btn btn-ghost" id="modal-btn-cancel-task">Cancel</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Task'}</button>
          </div>
        </form>
      `,
      onOpen: (modalEl, closeModal) => {
        const form = modalEl.querySelector("#form-task-editor");
        const titleInput = modalEl.querySelector("#task-input-title");
        const subjectSelect = modalEl.querySelector("#task-select-subject");
        const branchSelect = modalEl.querySelector("#task-select-branch");
        const lectureSelect = modalEl.querySelector("#task-select-lecture");

        modalEl.querySelector("#modal-btn-cancel-task")?.addEventListener("click", closeModal);

        // Helper to update branches dropdown based on chosen subject
        const updateBranches = (selectedSubjId, preselectBranchId = null) => {
          branchSelect.innerHTML = `<option value="">-- No Branch Selected --</option>`;
          lectureSelect.innerHTML = `<option value="">-- Select Branch First --</option>`;

          if (!selectedSubjId) {
            branchSelect.disabled = true;
            lectureSelect.disabled = true;
            return;
          }

          const subj = subjects.find(s => s.id === selectedSubjId);
          if (!subj || !Array.isArray(subj.branches)) {
            branchSelect.disabled = true;
            lectureSelect.disabled = true;
            return;
          }

          branchSelect.disabled = false;
          subj.branches.forEach(b => {
            const opt = document.createElement("option");
            opt.value = b.id;
            opt.textContent = b.name;
            if (preselectBranchId && b.id === preselectBranchId) {
              opt.selected = true;
            }
            branchSelect.appendChild(opt);
          });
        };

        // Helper to update lectures dropdown based on chosen branch
        const updateLectures = (selectedSubjId, selectedBranchId, preselectLecId = null) => {
          lectureSelect.innerHTML = `<option value="">-- No Lecture Selected --</option>`;
          if (!selectedSubjId || !selectedBranchId) {
            lectureSelect.disabled = true;
            return;
          }

          const subj = subjects.find(s => s.id === selectedSubjId);
          if (!subj) return;
          const branch = (subj.branches || []).find(b => b.id === selectedBranchId);
          if (!branch || !Array.isArray(branch.lectures)) {
            lectureSelect.disabled = true;
            return;
          }

          lectureSelect.disabled = false;
          branch.lectures.forEach(l => {
            const opt = document.createElement("option");
            opt.value = l.id;
            opt.textContent = l.title;
            if (preselectLecId && l.id === preselectLecId) {
              opt.selected = true;
            }
            lectureSelect.appendChild(opt);
          });
        };

        // Initialize cascading selectors
        if (task.subjectId) {
          updateBranches(task.subjectId, task.branchId);
          if (task.branchId) {
            updateLectures(task.subjectId, task.branchId, task.lectureId);
          }
        } else {
          branchSelect.disabled = true;
          lectureSelect.disabled = true;
        }

        // Subject change event
        subjectSelect.addEventListener("change", () => {
          const sId = subjectSelect.value;
          updateBranches(sId);
        });

        // Branch change event
        branchSelect.addEventListener("change", () => {
          const sId = subjectSelect.value;
          const bId = branchSelect.value;
          updateLectures(sId, bId);
        });

        // Lecture change event -> Automatically sets the task title!
        lectureSelect.addEventListener("change", () => {
          const sId = subjectSelect.value;
          const bId = branchSelect.value;
          const lId = lectureSelect.value;
          if (sId && bId && lId) {
            const subj = subjects.find(s => s.id === sId);
            const branch = subj?.branches.find(b => b.id === bId);
            const lecture = branch?.lectures.find(l => l.id === lId);
            if (lecture) {
              titleInput.value = lecture.title;
            }
          }
        });

        // Form submit
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const title = titleInput.value.trim();
          const date = modalEl.querySelector("#task-input-date").value;
          const time = modalEl.querySelector("#task-input-time").value;
          const priority = modalEl.querySelector("#task-select-priority").value;
          const durationMin = parseInt(modalEl.querySelector("#task-input-duration").value) || 60;
          const notes = modalEl.querySelector("#task-input-notes").value.trim();
          const subjectId = subjectSelect.value || null;
          const branchId = branchSelect.value || null;
          const lectureId = lectureSelect.value || null;

          if (!title || !date) return;

          if (isEdit) {
            taskToEdit.title = title;
            taskToEdit.date = date;
            taskToEdit.time = time;
            taskToEdit.priority = priority;
            taskToEdit.durationMin = durationMin;
            taskToEdit.notes = notes;
            taskToEdit.subjectId = subjectId;
            taskToEdit.branchId = branchId;
            taskToEdit.lectureId = lectureId;
          } else {
            if (!Array.isArray(state.tasks)) state.tasks = [];
            state.tasks.push({
              id: generateId("task"),
              title,
              date,
              time,
              priority,
              durationMin,
              notes,
              subjectId,
              branchId,
              lectureId,
              completed: false,
              createdAt: new Date().toISOString()
            });
          }

          StorageManager.saveState(state, true, isEdit ? "task_edit" : "task_create");
          closeModal();
          window.App.renderCurrentView();
          window.App.showToast(isEdit ? "Task updated." : "Task scheduled successfully.", "success");
        });
      }
    });
  },

  promptDeleteTask(taskId, state) {
    const task = (state.tasks || []).find(t => t.id === taskId);
    if (!task) return;

    window.App.showConfirmDialog({
      title: "Delete Task?",
      message: `Are you sure you want to delete task <strong>"${this.escapeHtml(task.title)}"</strong>?`,
      confirmText: "Delete Task",
      danger: true,
      onConfirm: () => {
        state.tasks = state.tasks.filter(t => t.id !== taskId);
        StorageManager.saveState(state, true, "task_delete");
        window.App.renderCurrentView();
        window.App.showToast("Task deleted.", "info");
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

