/**
 * رابعة طب — Interactive Medical Calendar
 * Full Gregorian + Umm al-Qura Hijri dual calendar with Month, Week, and Day views.
 * Real-time task mapping, day inspection panel, and seamless scheduling.
 */

const CalendarManager = {
  viewMode: "month", // "month" | "week" | "day"
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(), // 0-indexed
  selectedDate: DateUtils.todayString(),

  render(container, state) {
    const todayStr = DateUtils.todayString();
    if (!this.selectedDate) {
      this.selectedDate = todayStr;
    }

    const selectedTasks = TasksManager.getTasksForDate(state, this.selectedDate);
    const selectedCompleted = selectedTasks.filter(t => t.completed).length;
    const selectedPending = selectedTasks.length - selectedCompleted;

    const selectedGregorian = DateUtils.formatGregorian(this.selectedDate, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
    const selectedHijri = DateUtils.formatHijri(this.selectedDate);

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h1 class="page-title">Study Calendar</h1>
          <p class="page-subtitle">Interactive schedule mapped to your fourth-year examination milestones</p>
        </div>
        <div class="header-actions">
          <div class="calendar-view-toggle">
            <button class="toggle-btn ${this.viewMode === 'month' ? 'active' : ''}" data-view="month">Month</button>
            <button class="toggle-btn ${this.viewMode === 'week' ? 'active' : ''}" data-view="week">Week</button>
            <button class="toggle-btn ${this.viewMode === 'day' ? 'active' : ''}" data-view="day">Day</button>
          </div>
          <button class="btn btn-primary" id="btn-cal-add-task">
            ${AppIcons.get("plus", "", 16)} Add Task
          </button>
        </div>
      </div>

      <div class="calendar-layout-container">
        <!-- Main Calendar Grid Area -->
        <div class="calendar-main-pane">
          <!-- Calendar Header Navigation -->
          <div class="cal-nav-toolbar">
            <div class="cal-nav-controls">
              <button class="btn btn-secondary btn-icon-only" id="cal-btn-prev" title="Previous">
                ${AppIcons.get("chevronLeft", "", 18)}
              </button>
              <button class="btn btn-outline" id="cal-btn-today">Today</button>
              <button class="btn btn-secondary btn-icon-only" id="cal-btn-next" title="Next">
                ${AppIcons.get("chevronRight", "", 18)}
              </button>
            </div>
            
            <div class="cal-current-label-group">
              <span class="cal-gregorian-title" id="cal-heading-text">${this.getHeaderLabel()}</span>
              <span class="cal-hijri-subtitle" id="cal-hijri-heading-text">${this.getHijriHeaderLabel()}</span>
            </div>

            <div class="cal-jump-pickers">
              <select id="cal-select-month" class="form-select cal-select-compact">
                ${[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((m, idx) => `<option value="${idx}" ${idx === this.currentMonth ? 'selected' : ''}>${m}</option>`).join("")}
              </select>
              <select id="cal-select-year" class="form-select cal-select-compact">
                ${Array.from({ length: 7 }, (_, i) => 2025 + i).map(y => `<option value="${y}" ${y === this.currentYear ? 'selected' : ''}>${y}</option>`).join("")}
              </select>
            </div>
          </div>

          <!-- Dynamic View Content (Month, Week, Day) -->
          <div class="calendar-grid-card">
            ${this.renderViewContent(state)}
          </div>
        </div>

        <!-- Selected Day Task Side Panel -->
        <aside class="selected-day-panel">
          <div class="day-panel-header">
            <span class="day-panel-badge badge badge-gold">Selected Date</span>
            <h3 class="day-panel-gregorian">${selectedGregorian}</h3>
            <span class="day-panel-hijri">${selectedHijri}</span>
            <div class="day-panel-counts">
              <span class="count-pill">${selectedTasks.length} total</span>
              <span class="count-pill text-success">${selectedCompleted} done</span>
              <span class="count-pill text-warning">${selectedPending} pending</span>
            </div>
          </div>

          <div class="day-panel-body">
            <div class="day-panel-action-bar">
              <span class="day-panel-heading">Scheduled Agenda</span>
              <button class="btn btn-sm btn-primary" id="btn-panel-add-task">
                ${AppIcons.get("plus", "", 14)} Add
              </button>
            </div>

            <div class="day-panel-tasks-list">
              ${selectedTasks.length === 0 ? `
                <div class="empty-day-state">
                  <div class="empty-day-icon">${AppIcons.get("calendar", "", 32)}</div>
                  <p>No tasks scheduled for this day.</p>
                  <button class="btn btn-outline btn-sm mt-2" id="btn-panel-empty-add">
                    ${AppIcons.get("plus", "", 14)} Schedule Task
                  </button>
                </div>
              ` : `
                <div class="day-tasks-mini-list">
                  ${selectedTasks.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99")).map(t => {
                    return `
                      <div class="day-task-mini-card ${t.completed ? 'is-done' : ''}" data-task-id="${t.id}">
                        <label class="custom-checkbox" title="Mark Done">
                          <input type="checkbox" class="panel-task-cb" data-task-id="${t.id}" ${t.completed ? 'checked' : ''}>
                          <span class="checkmark"></span>
                        </label>
                        <div class="mini-task-details">
                          <span class="mini-task-title ${t.completed ? 'completed-text' : ''}">${this.escapeHtml(t.title)}</span>
                          <div class="mini-task-sub">
                            ${t.time ? `<span>${AppIcons.get("clock", "", 11)} ${t.time}</span>` : ""}
                            ${t.durationMin ? `<span>${t.durationMin}m</span>` : ""}
                            ${t.priority ? `<span class="priority-dot priority-${t.priority}"></span>` : ""}
                          </div>
                        </div>
                        <button class="btn-icon-subtle btn-panel-delete-task" data-task-id="${t.id}" title="Delete Task">
                          ${AppIcons.get("trash", "", 13)}
                        </button>
                      </div>
                    `;
                  }).join("")}
                </div>
              `}
            </div>
          </div>
        </aside>
      </div>
    `;

    // Hook listeners
    container.querySelectorAll(".calendar-view-toggle .toggle-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.viewMode = btn.dataset.view;
        this.render(container, state);
      });
    });

    container.querySelector("#cal-btn-prev")?.addEventListener("click", () => {
      this.navigate(-1, state, container);
    });

    container.querySelector("#cal-btn-next")?.addEventListener("click", () => {
      this.navigate(1, state, container);
    });

    container.querySelector("#cal-btn-today")?.addEventListener("click", () => {
      const today = new Date();
      this.currentYear = today.getFullYear();
      this.currentMonth = today.getMonth();
      this.selectedDate = DateUtils.todayString();
      this.render(container, state);
    });

    container.querySelector("#cal-select-month")?.addEventListener("change", (e) => {
      this.currentMonth = parseInt(e.target.value);
      this.render(container, state);
    });

    container.querySelector("#cal-select-year")?.addEventListener("change", (e) => {
      this.currentYear = parseInt(e.target.value);
      this.render(container, state);
    });

    container.querySelector("#btn-cal-add-task")?.addEventListener("click", () => {
      TasksManager.openTaskModal(null, this.selectedDate, state);
    });

    container.querySelector("#btn-panel-add-task")?.addEventListener("click", () => {
      TasksManager.openTaskModal(null, this.selectedDate, state);
    });

    container.querySelector("#btn-panel-empty-add")?.addEventListener("click", () => {
      TasksManager.openTaskModal(null, this.selectedDate, state);
    });

    // Calendar day cell click
    container.querySelectorAll(".cal-day-cell").forEach(cell => {
      cell.addEventListener("click", () => {
        const d = cell.dataset.date;
        if (d) {
          this.selectedDate = d;
          this.render(container, state);
        }
      });
    });

    // Panel task checkboxes
    container.querySelectorAll(".panel-task-cb").forEach(cb => {
      cb.addEventListener("change", (e) => {
        e.stopPropagation();
        const taskId = cb.dataset.taskId;
        TasksManager.toggleTaskCompletion(taskId, cb.checked, state);
      });
    });

    // Panel task card click -> Open task detail modal
    container.querySelectorAll(".day-task-mini-card").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".custom-checkbox") || e.target.closest(".btn-panel-delete-task")) {
          return;
        }
        const taskId = card.dataset.taskId;
        TasksManager.openTaskDetailModal(taskId, state);
      });
    });

    // Panel task delete
    container.querySelectorAll(".btn-panel-delete-task").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const taskId = btn.dataset.taskId;
        TasksManager.promptDeleteTask(taskId, state);
      });
    });
  },

  getHeaderLabel() {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    if (this.viewMode === "month") {
      return `${months[this.currentMonth]} ${this.currentYear}`;
    }
    if (this.viewMode === "week") {
      const d = DateUtils.parseLocalDate(this.selectedDate);
      return `Week of ${DateUtils.formatGregorian(d, { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return DateUtils.formatGregorian(this.selectedDate, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  },

  getHijriHeaderLabel() {
    try {
      const midDate = new Date(this.currentYear, this.currentMonth, 15);
      return DateUtils.formatHijri(midDate, { month: "long", year: "numeric" });
    } catch (e) {
      return "";
    }
  },

  navigate(direction, state, container) {
    if (this.viewMode === "month") {
      this.currentMonth += direction;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
    } else if (this.viewMode === "week") {
      this.selectedDate = DateUtils.addDays(this.selectedDate, direction * 7);
      const d = DateUtils.parseLocalDate(this.selectedDate);
      this.currentMonth = d.getMonth();
      this.currentYear = d.getFullYear();
    } else {
      this.selectedDate = DateUtils.addDays(this.selectedDate, direction);
      const d = DateUtils.parseLocalDate(this.selectedDate);
      this.currentMonth = d.getMonth();
      this.currentYear = d.getFullYear();
    }
    this.render(container, state);
  },

  renderViewContent(state) {
    if (this.viewMode === "week") {
      return this.renderWeekView(state);
    }
    if (this.viewMode === "day") {
      return this.renderDayView(state);
    }
    return this.renderMonthView(state);
  },

  renderMonthView(state) {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();

    const todayStr = DateUtils.todayString();
    let cellHtml = "";

    // Weekday headers
    const headersHtml = weekdays.map(day => `<div class="cal-weekday-header">${day}</div>`).join("");

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
      const prevYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      cellHtml += this.renderDayCell(dateStr, dayNum, true, todayStr, state);
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      cellHtml += this.renderDayCell(dateStr, dayNum, false, todayStr, state);
    }

    // Next month leading days to complete standard 35 or 42 grid cells
    const totalFilled = firstDay + daysInMonth;
    const totalCells = totalFilled > 35 ? 42 : 35;
    const remainingCells = totalCells - totalFilled;

    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      const nextMonth = this.currentMonth === 11 ? 0 : this.currentMonth + 1;
      const nextYear = this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      cellHtml += this.renderDayCell(dateStr, dayNum, true, todayStr, state);
    }

    return `
      <div class="cal-month-grid">
        <div class="cal-weekdays-row">${headersHtml}</div>
        <div class="cal-days-grid">${cellHtml}</div>
      </div>
    `;
  },

  renderDayCell(dateStr, dayNum, isOtherMonth, todayStr, state) {
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === this.selectedDate;
    const tasks = TasksManager.getTasksForDate(state, dateStr);
    const hasTasks = tasks.length > 0;
    const completedTasks = tasks.filter(t => t.completed).length;
    const allCompleted = hasTasks && completedTasks === tasks.length;
    const hasIncomplete = hasTasks && completedTasks < tasks.length;

    const hijriBadge = DateUtils.getHijriCellLabel(dateStr);

    let dotsHtml = "";
    if (hasTasks) {
      if (allCompleted) {
        dotsHtml = `<span class="cal-task-dot dot-all-done" title="${tasks.length} tasks completed"></span>`;
      } else if (hasIncomplete) {
        dotsHtml = `<span class="cal-task-dot dot-pending" title="${tasks.length - completedTasks} pending, ${completedTasks} done"></span>`;
      }
    }

    return `
      <div class="cal-day-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}" data-date="${dateStr}">
        <div class="cal-day-cell-top">
          <span class="cal-day-greg">${dayNum}</span>
          <span class="cal-day-hijri">${hijriBadge}</span>
        </div>
        <div class="cal-day-cell-body">
          ${dotsHtml}
          ${hasTasks ? `<span class="cal-task-count-pill">${completedTasks}/${tasks.length}</span>` : ""}
        </div>
      </div>
    `;
  },

  renderWeekView(state) {
    const current = DateUtils.parseLocalDate(this.selectedDate);
    const dayOfWeek = current.getDay();
    // Sunday start of week
    const sunDate = new Date(current);
    sunDate.setDate(current.getDate() - dayOfWeek);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunDate);
      d.setDate(sunDate.getDate() + i);
      weekDays.push(DateUtils.toLocalDateString(d));
    }

    const todayStr = DateUtils.todayString();

    return `
      <div class="cal-week-view">
        <div class="week-columns-grid">
          ${weekDays.map(dateStr => {
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === this.selectedDate;
            const tasks = TasksManager.getTasksForDate(state, dateStr);
            const gregDayName = DateUtils.formatGregorian(dateStr, { weekday: "short" });
            const gregDayNum = DateUtils.formatGregorian(dateStr, { month: "short", day: "numeric" });
            const hijriStr = DateUtils.getHijriCellLabel(dateStr);

            return `
              <div class="week-day-column ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}" data-date="${dateStr}">
                <div class="week-col-header cal-day-cell" data-date="${dateStr}">
                  <span class="week-col-name">${gregDayName}</span>
                  <span class="week-col-date">${gregDayNum}</span>
                  <span class="week-col-hijri">${hijriStr}</span>
                </div>
                <div class="week-col-tasks">
                  ${tasks.length === 0 ? `
                    <div class="week-empty-slot">No tasks</div>
                  ` : tasks.map(t => `
                    <div class="week-task-item ${t.completed ? 'is-done' : ''}" data-task-id="${t.id}">
                      <span class="week-task-dot ${t.completed ? 'dot-all-done' : 'dot-pending'}"></span>
                      <span class="week-task-title ${t.completed ? 'completed-text' : ''}">${this.escapeHtml(t.title)}</span>
                    </div>
                  `).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  },

  renderDayView(state) {
    const tasks = TasksManager.getTasksForDate(state, this.selectedDate);
    const todayStr = DateUtils.todayString();
    const isToday = this.selectedDate === todayStr;

    return `
      <div class="cal-single-day-view">
        <div class="single-day-header">
          <div>
            <span class="badge ${isToday ? 'badge-gold' : 'badge-neutral'}">${isToday ? "Today" : "Selected Day"}</span>
            <h3 class="single-day-title">${DateUtils.formatGregorian(this.selectedDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h3>
            <span class="single-day-hijri">${DateUtils.formatHijri(this.selectedDate)}</span>
          </div>
          <button class="btn btn-primary" id="btn-dayview-add-task">
            ${AppIcons.get("plus", "", 16)} Add Task for this Day
          </button>
        </div>

        <div class="single-day-timeline mt-4">
          ${tasks.length === 0 ? `
            <div class="empty-state-card">
              <div class="empty-icon">${AppIcons.get("calendar", "", 36)}</div>
              <h3>Nothing scheduled for this day</h3>
              <p>Add medical tasks, review sessions, or lecture study blocks.</p>
            </div>
          ` : tasks.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99")).map(t => {
            return TasksManager.renderTaskItemHtml(t, state, false);
          }).join("")}
        </div>
      </div>
    `;
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

