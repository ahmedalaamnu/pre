/**
 * رابعة طب — Main Dashboard & Examination Countdown
 * Dynamic countdown, real-time curriculum metrics, SVG progress ring,
 * weekly productivity chart, and quick shortcuts.
 */

const DashboardManager = {
  countdownIntervalId: null,

  render(container, state) {
    const todayStr = DateUtils.todayString();
    const overall = SubjectsManager.calcOverallStats(state.subjects);

    // Task statistics
    const allTasks = state.tasks || [];
    const todayTasks = allTasks.filter(t => t.date === todayStr);
    const todayCompleted = todayTasks.filter(t => t.completed).length;
    const overdueTasks = allTasks.filter(t => !t.completed && t.date < todayStr);
    const totalAllTasks = allTasks.length;
    const completedAllTasks = allTasks.filter(t => t.completed).length;
    const overallTaskPct = totalAllTasks > 0 ? Math.round((completedAllTasks / totalAllTasks) * 100) : 0;

    // Countdown metrics
    const cd = DateUtils.calculateCountdown(state.exam.date, state.exam.time);

    container.innerHTML = `
      <!-- Welcome & Examination Hero Section -->
      <section class="dashboard-hero">
        <div class="hero-content">
          <div class="hero-top-row">
            <span class="badge badge-gold hero-badge">${AppIcons.get("award", "", 14)} Fourth Year Milestone</span>
            <button class="btn btn-ghost btn-sm btn-edit-exam-settings" id="btn-edit-exam">
              ${AppIcons.get("edit", "", 14)} Edit Exam Date
            </button>
          </div>
          <h1 class="hero-title">${this.escapeHtml(state.exam.title || "Final Fourth-Year Examination")}</h1>
          <p class="hero-target-date">
            Scheduled for: <strong>${DateUtils.formatGregorian(state.exam.date, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong> at <strong>${state.exam.time || "09:00"}</strong>
            <span class="hero-hijri-inline">(${DateUtils.formatHijri(state.exam.date)})</span>
          </p>

          <!-- Large Dynamic Countdown -->
          <div class="countdown-container" id="dashboard-countdown-boxes">
            ${this.renderCountdownBoxes(cd)}
          </div>
        </div>
      </section>

      <!-- Quick Action Floating Bar -->
      <div class="quick-actions-bar">
        <button class="quick-action-btn" id="qa-add-task">
          <span class="qa-icon">${AppIcons.get("plus", "", 18)}</span>
          <span class="qa-label">New Task</span>
        </button>
        <button class="quick-action-btn" id="qa-today-tasks">
          <span class="qa-icon">${AppIcons.get("tasks", "", 18)}</span>
          <span class="qa-label">Today's Tasks</span>
        </button>
        <button class="quick-action-btn" id="qa-calendar">
          <span class="qa-icon">${AppIcons.get("calendar", "", 18)}</span>
          <span class="qa-label">Open Calendar</span>
        </button>
        <button class="quick-action-btn" id="qa-subjects">
          <span class="qa-icon">${AppIcons.get("subjects", "", 18)}</span>
          <span class="qa-label">Curriculum</span>
        </button>
        <button class="quick-action-btn" id="qa-progress">
          <span class="qa-icon">${AppIcons.get("progression", "", 18)}</span>
          <span class="qa-label">Detailed Analytics</span>
        </button>
      </div>

      <!-- Statistics Summary Grid -->
      <section class="stats-overview-grid mt-4">
        <!-- Card 1: Curriculum Progress -->
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">Curriculum Completion</span>
            <span class="stat-icon-wrapper text-gold">${AppIcons.get("subjects", "", 20)}</span>
          </div>
          <div class="stat-card-main">
            <span class="stat-number text-gold">${overall.percentage}%</span>
            <span class="stat-detail">${overall.completed} / ${overall.total} lectures</span>
          </div>
          <div class="progress-bar-container mt-2">
            <div class="progress-bar-fill" style="width: ${overall.percentage}%"></div>
          </div>
          <div class="stat-card-footer">
            <span>${overall.remaining} lectures remaining</span>
            <span>${state.subjects.length} subjects</span>
          </div>
        </div>

        <!-- Card 2: Today's Tasks -->
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">Tasks Due Today</span>
            <span class="stat-icon-wrapper text-info">${AppIcons.get("clock", "", 20)}</span>
          </div>
          <div class="stat-card-main">
            <span class="stat-number">${todayTasks.length}</span>
            <span class="stat-detail">${todayCompleted} done</span>
          </div>
          <div class="progress-bar-container mt-2">
            <div class="progress-bar-fill" style="width: ${todayTasks.length > 0 ? (todayCompleted / todayTasks.length) * 100 : 0}%"></div>
          </div>
          <div class="stat-card-footer">
            <span>${todayTasks.length - todayCompleted} pending today</span>
            <span class="text-success">${todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0}% day rate</span>
          </div>
        </div>

        <!-- Card 3: Overdue Action Needed -->
        <div class="stat-card ${overdueTasks.length > 0 ? 'card-warning-border' : ''}">
          <div class="stat-card-header">
            <span class="stat-card-title">Overdue Incomplete</span>
            <span class="stat-icon-wrapper text-danger">${AppIcons.get("alert", "", 20)}</span>
          </div>
          <div class="stat-card-main">
            <span class="stat-number ${overdueTasks.length > 0 ? 'text-danger' : 'text-success'}">${overdueTasks.length}</span>
            <span class="stat-detail">prior day tasks</span>
          </div>
          <div class="stat-card-footer mt-auto">
            <span>${overdueTasks.length === 0 ? '✓ Schedule is fully on track!' : 'Requires urgent catch-up'}</span>
          </div>
        </div>

        <!-- Card 4: Overall Task Volume -->
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">Overall Task Mastery</span>
            <span class="stat-icon-wrapper text-success">${AppIcons.get("tasks", "", 20)}</span>
          </div>
          <div class="stat-card-main">
            <span class="stat-number text-success">${overallTaskPct}%</span>
            <span class="stat-detail">${completedAllTasks} / ${totalAllTasks} total</span>
          </div>
          <div class="progress-bar-container mt-2">
            <div class="progress-bar-fill" style="width: ${overallTaskPct}%"></div>
          </div>
          <div class="stat-card-footer">
            <span>${totalAllTasks - completedAllTasks} pending in calendar</span>
          </div>
        </div>
      </section>

      <!-- Charts & Visual Breakdown Grid -->
      <section class="dashboard-visual-grid mt-4">
        <!-- Left: Overall Study Circular Ring & Subject Breakdown -->
        <div class="dashboard-card ring-card">
          <div class="card-title-group">
            <h3 class="card-heading">Curriculum Progression</h3>
            <span class="card-subheading">Total mastery across all modules</span>
          </div>

          <div class="ring-display-wrapper">
            ${this.renderSvgProgressRing(overall.percentage, 160, 14)}
            <div class="ring-center-stats">
              <span class="ring-percent-text">${overall.percentage}%</span>
              <span class="ring-label-text">Mastered</span>
            </div>
          </div>

          <!-- Subject Progress Mini Bars -->
          <div class="subject-mini-bars-list mt-3">
            ${state.subjects.map(subj => {
              const sStats = SubjectsManager.calcSubjectStats(subj);
              return `
                <div class="subj-mini-row">
                  <div class="subj-mini-info">
                    <span class="subj-mini-name">${this.escapeHtml(subj.name)}</span>
                    <span class="subj-mini-pct text-gold">${sStats.percentage}%</span>
                  </div>
                  <div class="progress-bar-container mini">
                    <div class="progress-bar-fill" style="width: ${sStats.percentage}%; background-color: ${subj.color || '#C99A2E'}"></div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- Right: Weekly Task Productivity Chart & Recent Activity -->
        <div class="dashboard-card weekly-card">
          <div class="card-title-group">
            <h3 class="card-heading">Weekly Productivity</h3>
            <span class="card-subheading">Tasks completed in the past 7 days</span>
          </div>

          <div class="weekly-chart-wrapper">
            ${this.renderWeeklyBarChart(state)}
          </div>

          <!-- Recent Activity Feed -->
          <div class="recent-activity-section mt-4">
            <h4 class="sub-heading-recent">Recent Activity</h4>
            <div class="activity-feed-list">
              ${this.renderRecentActivity(state)}
            </div>
          </div>
        </div>
      </section>
    `;

    // Setup live ticking countdown
    this.startCountdownTicker(state);

    // Event hooks
    container.querySelector("#btn-edit-exam")?.addEventListener("click", () => {
      this.promptEditExam(state);
    });

    container.querySelector("#qa-add-task")?.addEventListener("click", () => {
      TasksManager.openTaskModal(null, todayStr, state);
    });

    container.querySelector("#qa-today-tasks")?.addEventListener("click", () => {
      window.App.navigateTo("tasks");
    });

    container.querySelector("#qa-calendar")?.addEventListener("click", () => {
      window.App.navigateTo("calendar");
    });

    container.querySelector("#qa-subjects")?.addEventListener("click", () => {
      window.App.navigateTo("subjects");
    });

    container.querySelector("#qa-progress")?.addEventListener("click", () => {
      window.App.navigateTo("progression");
    });
  },

  renderCountdownBoxes(cd) {
    if (cd.expired) {
      return `
        <div class="countdown-expired-banner">
          <span class="expired-title">EXAMINATION DAY / PASSED</span>
          <p class="expired-desc">The scheduled examination date has arrived! Best of luck with your clinical boards!</p>
        </div>
      `;
    }

    return `
      <div class="cd-box">
        <span class="cd-num" id="cd-days">${cd.days}</span>
        <span class="cd-unit">DAYS</span>
      </div>
      <div class="cd-separator">:</div>
      <div class="cd-box">
        <span class="cd-num" id="cd-hours">${String(cd.hours).padStart(2, "0")}</span>
        <span class="cd-unit">HOURS</span>
      </div>
      <div class="cd-separator">:</div>
      <div class="cd-box">
        <span class="cd-num" id="cd-minutes">${String(cd.minutes).padStart(2, "0")}</span>
        <span class="cd-unit">MINUTES</span>
      </div>
      <div class="cd-separator">:</div>
      <div class="cd-box">
        <span class="cd-num" id="cd-seconds">${String(cd.seconds).padStart(2, "0")}</span>
        <span class="cd-unit">SECONDS</span>
      </div>
    `;
  },

  startCountdownTicker(state) {
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
    }

    this.countdownIntervalId = setInterval(() => {
      const cd = DateUtils.calculateCountdown(state.exam.date, state.exam.time);
      const daysEl = document.getElementById("cd-days");
      const hoursEl = document.getElementById("cd-hours");
      const minEl = document.getElementById("cd-minutes");
      const secEl = document.getElementById("cd-seconds");

      if (daysEl && hoursEl && minEl && secEl) {
        if (cd.expired) {
          const container = document.getElementById("dashboard-countdown-boxes");
          if (container) container.innerHTML = this.renderCountdownBoxes(cd);
          clearInterval(this.countdownIntervalId);
        } else {
          daysEl.textContent = cd.days;
          hoursEl.textContent = String(cd.hours).padStart(2, "0");
          minEl.textContent = String(cd.minutes).padStart(2, "0");
          secEl.textContent = String(cd.seconds).padStart(2, "0");
        }
      }
    }, 1000);
  },

  renderSvgProgressRing(percentage, size = 160, strokeWidth = 14) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return `
      <svg class="progress-ring-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle
          class="progress-ring-track"
          stroke="#172235"
          stroke-width="${strokeWidth}"
          fill="transparent"
          r="${radius}"
          cx="${size / 2}"
          cy="${size / 2}"
        />
        <circle
          class="progress-ring-indicator"
          stroke="url(#goldRingGradient)"
          stroke-width="${strokeWidth}"
          stroke-linecap="round"
          stroke-dasharray="${circumference} ${circumference}"
          stroke-dashoffset="${offset}"
          fill="transparent"
          r="${radius}"
          cx="${size / 2}"
          cy="${size / 2}"
        />
        <defs>
          <linearGradient id="goldRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#E2BE65"/>
            <stop offset="100%" stop-color="#C99A2E"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  },

  renderWeeklyBarChart(state) {
    const today = DateUtils.todayString();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push(DateUtils.addDays(today, -i));
    }

    const tasks = state.tasks || [];
    let maxCount = 1;

    const data = days.map(dStr => {
      const dayTasks = tasks.filter(t => t.date === dStr);
      const completed = dayTasks.filter(t => t.completed).length;
      const total = dayTasks.length;
      if (total > maxCount) maxCount = total;
      return {
        date: dStr,
        dayLabel: DateUtils.formatGregorian(dStr, { weekday: "short" }),
        completed,
        total
      };
    });

    return `
      <div class="weekly-bars-container">
        ${data.map(item => {
          const fillHeightPct = maxCount > 0 ? Math.round((item.completed / maxCount) * 100) : 0;
          return `
            <div class="chart-bar-column" title="${item.dayLabel}: ${item.completed} of ${item.total} tasks completed">
              <div class="bar-track">
                <div class="bar-fill" style="height: ${Math.max(fillHeightPct, 6)}%"></div>
              </div>
              <span class="bar-count-label">${item.completed}</span>
              <span class="bar-day-label">${item.dayLabel}</span>
            </div>
          `;
        }).join("")}
      </div>
    `;
  },

  renderRecentActivity(state) {
    const logs = (state.activityLogs || []).slice(-5).reverse();
    if (logs.length === 0) {
      return `<p class="empty-feed-text">No study activity recorded yet. Check off lectures or calendar tasks to build your activity history.</p>`;
    }

    return logs.map(log => {
      const isLecture = log.type.includes("lecture");
      const isCompleted = log.type.includes("complete") && !log.type.includes("uncomplete");
      const icon = isLecture ? AppIcons.get("subjects", "", 14) : AppIcons.get("tasks", "", 14);
      const title = log.lectureTitle || log.taskTitle || "Study item";
      const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

      return `
        <div class="activity-feed-item">
          <span class="activity-icon ${isCompleted ? 'icon-success' : 'icon-info'}">${icon}</span>
          <div class="activity-feed-text">
            <span class="activity-feed-title">${this.escapeHtml(title)}</span>
            <span class="activity-feed-meta">${isCompleted ? 'Completed' : 'Updated'} ${timeStr ? `at ${timeStr}` : ''}</span>
          </div>
        </div>
      `;
    }).join("");
  },

  promptEditExam(state) {
    window.App.showModal({
      title: "Edit Examination Target",
      content: `
        <form id="form-edit-exam-modal" class="modal-form">
          <div class="form-group">
            <label class="form-label" for="exam-title-input">Examination Title *</label>
            <input type="text" id="exam-title-input" class="form-input" required value="${this.escapeHtml(state.exam.title || "")}">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="exam-date-input">Examination Date *</label>
              <input type="date" id="exam-date-input" class="form-input" required value="${state.exam.date}">
            </div>
            <div class="form-group">
              <label class="form-label" for="exam-time-input">Examination Time</label>
              <input type="time" id="exam-time-input" class="form-input" value="${state.exam.time || "09:00"}">
            </div>
          </div>
          <div class="modal-buttons">
            <button type="button" class="btn btn-ghost" id="modal-btn-cancel-exam">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Target Date</button>
          </div>
        </form>
      `,
      onOpen: (modalEl, closeModal) => {
        modalEl.querySelector("#modal-btn-cancel-exam")?.addEventListener("click", closeModal);
        modalEl.querySelector("#form-edit-exam-modal")?.addEventListener("submit", (e) => {
          e.preventDefault();
          const title = modalEl.querySelector("#exam-title-input").value.trim();
          const date = modalEl.querySelector("#exam-date-input").value;
          const time = modalEl.querySelector("#exam-time-input").value;

          if (!title || !date) return;

          state.exam.title = title;
          state.exam.date = date;
          state.exam.time = time;

          StorageManager.saveState(state, true, "exam_settings_change");
          closeModal();
          window.App.renderCurrentView();
          window.App.showToast("Examination target updated.", "success");
        });
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

