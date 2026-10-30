/**
 * رابعة طب — Topic Progression & Analytics Engine
 * 100% real-data metrics, streaks, SVG progress charts, GitHub-style activity heatmap,
 * branch inspection drilldown, and rule-based study insights.
 */

const AnalyticsManager = {
  selectedPeriod: "30", // "7" | "30" | "90" | "all"
  drilldownSubjectId: null,

  render(container, state) {
    const overall = SubjectsManager.calcOverallStats(state.subjects);
    const tasks = state.tasks || [];
    const todayStr = DateUtils.todayString();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const overdueTasks = tasks.filter(t => !t.completed && t.date < todayStr).length;

    // Streaks
    const streakInfo = DateUtils.calculateStreaks(state.activityLogs || []);

    // Average daily completion rate: completed tasks divided by distinct active days (or 1)
    const activeDaysCount = Math.max(streakInfo.activeDaysSet.size, 1);
    const avgDailyTasks = (completedTasks / activeDaysCount).toFixed(1);

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h1 class="page-title">Topic Progression & Analytics</h1>
          <p class="page-subtitle">Evidence-based performance analytics and curriculum mastery trends</p>
        </div>
        <div class="header-actions">
          <div class="period-filter-pills">
            <button class="filter-pill ${this.selectedPeriod === '7' ? 'active' : ''}" data-period="7">Last 7 Days</button>
            <button class="filter-pill ${this.selectedPeriod === '30' ? 'active' : ''}" data-period="30">Last 30 Days</button>
            <button class="filter-pill ${this.selectedPeriod === '90' ? 'active' : ''}" data-period="90">Last 90 Days</button>
            <button class="filter-pill ${this.selectedPeriod === 'all' ? 'active' : ''}" data-period="all">All Time</button>
          </div>
        </div>
      </div>

      <!-- Streaks & High-Level Metric Tiles -->
      <div class="analytics-metrics-grid">
        <div class="metric-box">
          <div class="metric-top">
            <span class="metric-label">Current Streak</span>
            <span class="metric-icon text-gold">${AppIcons.get("flame", "", 18)}</span>
          </div>
          <div class="metric-value-row">
            <span class="metric-value text-gold">${streakInfo.currentStreak}</span>
            <span class="metric-sub">days active</span>
          </div>
          <span class="metric-caption">Longest streak: ${streakInfo.longestStreak} days</span>
        </div>

        <div class="metric-box">
          <div class="metric-top">
            <span class="metric-label">Curriculum Mastered</span>
            <span class="metric-icon text-gold">${AppIcons.get("award", "", 18)}</span>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${overall.percentage}%</span>
            <span class="metric-sub">${overall.completed}/${overall.total}</span>
          </div>
          <span class="metric-caption">${overall.remaining} lectures remaining</span>
        </div>

        <div class="metric-box">
          <div class="metric-top">
            <span class="metric-label">Task Completion Rate</span>
            <span class="metric-icon text-success">${AppIcons.get("tasks", "", 18)}</span>
          </div>
          <div class="metric-value-row">
            <span class="metric-value text-success">${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</span>
            <span class="metric-sub">${completedTasks}/${totalTasks}</span>
          </div>
          <span class="metric-caption">Avg ${avgDailyTasks} tasks/day</span>
        </div>

        <div class="metric-box">
          <div class="metric-top">
            <span class="metric-label">Overdue Tasks</span>
            <span class="metric-icon text-danger">${AppIcons.get("alert", "", 18)}</span>
          </div>
          <div class="metric-value-row">
            <span class="metric-value ${overdueTasks > 0 ? 'text-danger' : 'text-success'}">${overdueTasks}</span>
            <span class="metric-sub">pending</span>
          </div>
          <span class="metric-caption">${pendingTasks} total pending</span>
        </div>
      </div>

      <!-- Rule-Based Smart Study Insights -->
      <section class="insights-section mt-4">
        <div class="insights-card">
          <div class="insights-header">
            <span class="badge badge-gold">${AppIcons.get("brain", "", 14)} Clinical Study Insights</span>
            <span class="insights-sub">Dynamically synthesized from your activity</span>
          </div>
          <div class="insights-list">
            ${this.generateInsights(state, overall, streakInfo)}
          </div>
        </div>
      </section>

      <!-- Activity Heatmap Section (GitHub style) -->
      <section class="heatmap-section mt-4">
        <div class="dashboard-card">
          <div class="card-title-group">
            <h3 class="card-heading">Study Activity Heatmap</h3>
            <span class="card-subheading">Daily completion intensity across lectures and tasks</span>
          </div>
          <div class="heatmap-container-scroll">
            ${this.renderActivityHeatmap(state)}
          </div>
        </div>
      </section>

      <!-- Subject Comparison & Drilldown Section -->
      <section class="subject-comparison-section mt-4">
        <div class="dashboard-card">
          <div class="card-title-group">
            <h3 class="card-heading">Subject Mastery Comparison</h3>
            <span class="card-subheading">Select any subject to drill down into branch-level progression</span>
          </div>

          <div class="subject-comparison-bars-container mt-3">
            ${state.subjects.map(subj => {
              const sStats = SubjectsManager.calcSubjectStats(subj);
              const isDrilled = this.drilldownSubjectId === subj.id;
              return `
                <div class="subject-comp-item ${isDrilled ? 'drilldown-active' : ''}">
                  <div class="subject-comp-header" data-subject-id="${subj.id}">
                    <div class="subject-comp-title-group">
                      <span class="subject-color-indicator" style="background-color: ${subj.color || '#C99A2E'}"></span>
                      <strong class="subject-comp-name">${this.escapeHtml(subj.name)}</strong>
                      <span class="subject-comp-counts">(${sStats.completed}/${sStats.total} lectures)</span>
                    </div>
                    <div class="subject-comp-stat">
                      <span class="subject-comp-pct text-gold">${sStats.percentage}%</span>
                      <button class="btn btn-ghost btn-sm drilldown-toggle-btn" data-subject-id="${subj.id}">
                        ${isDrilled ? 'Hide Branches ' + AppIcons.get('chevronUp', '', 14) : 'Inspect Branches ' + AppIcons.get('chevronDown', '', 14)}
                      </button>
                    </div>
                  </div>
                  <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${sStats.percentage}%; background-color: ${subj.color || '#C99A2E'}"></div>
                  </div>

                  <!-- Branch drilldown if active -->
                  ${isDrilled ? `
                    <div class="branch-drilldown-box mt-3">
                      <h4 class="drilldown-heading">Branch Breakdown for ${this.escapeHtml(subj.name)}:</h4>
                      <div class="branch-drilldown-grid">
                        ${(subj.branches || []).map(b => {
                          const bStats = SubjectsManager.calcBranchStats(b);
                          return `
                            <div class="branch-drill-card">
                              <div class="branch-drill-header">
                                <span class="branch-drill-name">${this.escapeHtml(b.name)}</span>
                                <span class="branch-drill-val text-gold">${bStats.percentage}%</span>
                              </div>
                              <div class="progress-bar-container mini">
                                <div class="progress-bar-fill" style="width: ${bStats.percentage}%"></div>
                              </div>
                              <span class="branch-drill-sub">${bStats.completed} of ${bStats.total} lectures done</span>
                            </div>
                          `;
                        }).join("")}
                      </div>
                    </div>
                  ` : ""}
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </section>

      <!-- Productivity Over Time Chart -->
      <section class="time-charts-section mt-4">
        <div class="dashboard-card">
          <div class="card-title-group">
            <h3 class="card-heading">Productivity Over Time (${this.getPeriodLabel()})</h3>
            <span class="card-subheading">Daily completed study items</span>
          </div>
          <div class="time-chart-wrapper">
            ${this.renderTimelineChart(state)}
          </div>
        </div>
      </section>

      <!-- Detailed Progress History Log -->
      <section class="history-log-section mt-4">
        <div class="dashboard-card">
          <div class="card-title-group">
            <h3 class="card-heading">Verified Progress History Log</h3>
            <span class="card-subheading">Chronological record of verified completions</span>
          </div>
          <div class="history-table-container">
            ${this.renderHistoryTable(state)}
          </div>
        </div>
      </section>
    `;

    // Hook listeners
    container.querySelectorAll(".period-filter-pills .filter-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        this.selectedPeriod = pill.dataset.period;
        this.render(container, state);
      });
    });

    container.querySelectorAll(".drilldown-toggle-btn, .subject-comp-header").forEach(el => {
      el.addEventListener("click", (e) => {
        const id = el.dataset.subjectId;
        if (this.drilldownSubjectId === id) {
          this.drilldownSubjectId = null;
        } else {
          this.drilldownSubjectId = id;
        }
        this.render(container, state);
      });
    });
  },

  getPeriodLabel() {
    switch (this.selectedPeriod) {
      case "7": return "Past 7 Days";
      case "30": return "Past 30 Days";
      case "90": return "Past 90 Days";
      default: return "All Time";
    }
  },

  generateInsights(state, overall, streakInfo) {
    const insights = [];
    const subjects = state.subjects || [];

    // 1. Most completed subject
    let bestSubj = null;
    let worstSubj = null;
    let maxPct = -1;
    let maxRemaining = -1;
    let remainingSubj = null;

    subjects.forEach(s => {
      const stats = SubjectsManager.calcSubjectStats(s);
      if (stats.percentage > maxPct && stats.total > 0) {
        maxPct = stats.percentage;
        bestSubj = s;
      }
      if (stats.remaining > maxRemaining) {
        maxRemaining = stats.remaining;
        remainingSubj = s;
      }
    });

    if (bestSubj && maxPct > 0) {
      insights.push(`
        <div class="insight-item">
          <span class="insight-bullet text-success">✓</span>
          <p><strong>Strongest Mastery:</strong> <span>${this.escapeHtml(bestSubj.name)}</span> leads your curriculum with <strong>${maxPct}%</strong> completion.</p>
        </div>
      `);
    }

    if (remainingSubj && maxRemaining > 0) {
      insights.push(`
        <div class="insight-item">
          <span class="insight-bullet text-warning">!</span>
          <p><strong>High-Yield Attention Needed:</strong> <span>${this.escapeHtml(remainingSubj.name)}</span> has <strong>${maxRemaining} lectures</strong> pending study.</p>
        </div>
      `);
    }

    // 2. Weekly tasks count
    const today = DateUtils.todayString();
    const tasks = state.tasks || [];
    let completedThisWeek = 0;
    for (let i = 0; i < 7; i++) {
      const dStr = DateUtils.addDays(today, -i);
      completedThisWeek += tasks.filter(t => t.date === dStr && t.completed).length;
    }

    insights.push(`
      <div class="insight-item">
        <span class="insight-bullet text-gold">★</span>
        <p><strong>Weekly Velocity:</strong> You completed <strong>${completedThisWeek} tasks</strong> in the past 7 days.</p>
      </div>
    `);

    // 3. Streak evaluation
    if (streakInfo.currentStreak >= 3) {
      insights.push(`
        <div class="insight-item">
          <span class="insight-bullet text-gold">🔥</span>
          <p><strong>Consistent Momentum:</strong> Active streak of <strong>${streakInfo.currentStreak} consecutive days</strong>. Maintaining daily consistency is proven to improve board retention.</p>
        </div>
      `);
    } else {
      insights.push(`
        <div class="insight-item">
          <span class="insight-bullet text-info">ℹ</span>
          <p><strong>Consistency Habit:</strong> Complete at least one lecture or calendar task today to keep your streak alive.</p>
        </div>
      `);
    }

    return insights.join("");
  },

  renderActivityHeatmap(state) {
    const today = new Date();
    const daysToShow = 112; // 16 weeks of 7 days
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysToShow + 1);

    // Map activity count per date
    const activityMap = new Map();
    (state.activityLogs || []).forEach(log => {
      if (log.type === "lecture_complete" || log.type === "task_complete") {
        const dStr = log.date || DateUtils.toLocalDateString(new Date(log.timestamp));
        activityMap.set(dStr, (activityMap.get(dStr) || 0) + 1);
      }
    });

    const cells = [];
    const cur = new Date(startDate);

    while (cur <= today) {
      const dStr = DateUtils.toLocalDateString(cur);
      const count = activityMap.get(dStr) || 0;
      let level = 0;
      if (count > 0 && count <= 1) level = 1;
      else if (count >= 2 && count <= 3) level = 2;
      else if (count >= 4 && count <= 6) level = 3;
      else if (count > 6) level = 4;

      const dateLabel = DateUtils.formatGregorian(dStr, { month: "short", day: "numeric", year: "numeric" });
      cells.push(`
        <div class="heatmap-cell level-${level}" title="${dateLabel}: ${count} study item${count === 1 ? '' : 's'} completed" data-date="${dStr}"></div>
      `);
      cur.setDate(cur.getDate() + 1);
    }

    return `
      <div class="heatmap-wrapper">
        <div class="heatmap-cells-grid">
          ${cells.join("")}
        </div>
        <div class="heatmap-legend">
          <span>Less</span>
          <div class="heatmap-cell level-0"></div>
          <div class="heatmap-cell level-1"></div>
          <div class="heatmap-cell level-2"></div>
          <div class="heatmap-cell level-3"></div>
          <div class="heatmap-cell level-4"></div>
          <span>More</span>
        </div>
      </div>
    `;
  },

  renderTimelineChart(state) {
    const daysCount = this.selectedPeriod === "7" ? 7 : (this.selectedPeriod === "30" ? 30 : (this.selectedPeriod === "90" ? 90 : 30));
    const today = DateUtils.todayString();
    const days = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      days.push(DateUtils.addDays(today, -i));
    }

    const activityMap = new Map();
    (state.activityLogs || []).forEach(log => {
      if (log.type === "lecture_complete" || log.type === "task_complete") {
        const dStr = log.date || DateUtils.toLocalDateString(new Date(log.timestamp));
        activityMap.set(dStr, (activityMap.get(dStr) || 0) + 1);
      }
    });

    let maxVal = 1;
    const data = days.map(dStr => {
      const count = activityMap.get(dStr) || 0;
      if (count > maxVal) maxVal = count;
      return {
        date: dStr,
        label: DateUtils.formatGregorian(dStr, { month: "numeric", day: "numeric" }),
        count
      };
    });

    return `
      <div class="timeline-bars-track">
        ${data.map(item => {
          const pct = Math.round((item.count / maxVal) * 100);
          return `
            <div class="timeline-bar-col" title="${item.date}: ${item.count} items completed">
              <div class="timeline-bar-rail">
                <div class="timeline-bar-fill" style="height: ${Math.max(pct, 5)}%"></div>
              </div>
              <span class="timeline-bar-val">${item.count > 0 ? item.count : ''}</span>
              <span class="timeline-bar-label">${item.label}</span>
            </div>
          `;
        }).join("")}
      </div>
    `;
  },

  renderHistoryTable(state) {
    const logs = (state.activityLogs || []).slice(-25).reverse();
    if (logs.length === 0) {
      return `<p class="empty-feed-text">No activity history recorded yet. Completed lectures and tasks will be logged here with immutable timestamps.</p>`;
    }

    return `
      <table class="history-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Item Name</th>
            <th>Curriculum Subject</th>
            <th>Date & Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${logs.map(log => {
            const isLec = log.type.includes("lecture");
            const isDone = log.type.includes("complete") && !log.type.includes("uncomplete");
            const dateStr = log.timestamp ? DateUtils.formatGregorian(new Date(log.timestamp), { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : log.date;
            const title = log.lectureTitle || log.taskTitle || "Study task";
            const subjName = log.subjectName || "Independent Task";

            return `
              <tr>
                <td><span class="badge ${isLec ? 'badge-gold' : 'badge-neutral'}">${isLec ? 'Lecture' : 'Task'}</span></td>
                <td><strong>${this.escapeHtml(title)}</strong></td>
                <td>${this.escapeHtml(subjName)}</td>
                <td>${dateStr}</td>
                <td>
                  <span class="status-indicator ${isDone ? 'status-done' : 'status-reverted'}">
                    ${isDone ? 'Completed' : 'Reverted'}
                  </span>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
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

