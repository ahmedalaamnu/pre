/**
 * رابعة طب — Date & Calendar Utilities
 * Robust Gregorian and Umm al-Qura Hijri formatting, countdown calculations,
 * and streak tracking without timezone drift.
 */

const DateUtils = {
  /**
   * Returns a local YYYY-MM-DD date string without UTC timezone skew
   */
  toLocalDateString(dateInput) {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },

  /**
   * Returns today's local date string
   */
  todayString() {
    return this.toLocalDateString(new Date());
  },

  /**
   * Parse YYYY-MM-DD safely into local midnight Date
   */
  parseLocalDate(dateStr) {
    if (!dateStr || typeof dateStr !== "string") return new Date();
    const parts = dateStr.split("-").map(Number);
    if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
      return new Date();
    }
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  },

  /**
   * Shift date by N days
   */
  addDays(dateStr, days) {
    const d = this.parseLocalDate(dateStr);
    d.setDate(d.getDate() + days);
    return this.toLocalDateString(d);
  },

  /**
   * Format Gregorian date in human-friendly English
   */
  formatGregorian(dateInput, options = { month: "short", day: "numeric", year: "numeric" }) {
    try {
      const d = typeof dateInput === "string" ? this.parseLocalDate(dateInput) : dateInput;
      return new Intl.DateTimeFormat("en-US", options).format(d);
    } catch (e) {
      return String(dateInput);
    }
  },

  /**
   * Format Hijri date using islamic-umalqura calendar
   * Graceful fallback if not supported on client
   */
  formatHijri(dateInput, options = { day: "numeric", month: "long", year: "numeric" }) {
    try {
      const d = typeof dateInput === "string" ? this.parseLocalDate(dateInput) : dateInput;
      // Use en-u-ca-islamic-umalqura for English transcriptions or ar-SA-u-ca-islamic-umalqura
      // Let's format nicely in English with Hijri month names, e.g. "14 Shaʻban 1448 AH"
      const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
        ...options
      });
      const formatted = formatter.format(d);
      return formatted.includes("AH") ? formatted : `${formatted} AH`;
    } catch (err) {
      try {
        // Fallback to basic islamic
        const fallback = new Intl.DateTimeFormat("en-u-ca-islamic", options).format(
          typeof dateInput === "string" ? this.parseLocalDate(dateInput) : dateInput
        );
        return fallback.includes("AH") ? fallback : `${fallback} AH`;
      } catch (e2) {
        return "";
      }
    }
  },

  /**
   * Get short Hijri day & month for calendar cell badge (e.g. "14 Shb")
   */
  getHijriCellLabel(dateInput) {
    try {
      const d = typeof dateInput === "string" ? this.parseLocalDate(dateInput) : dateInput;
      const dayFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric" });
      const monthFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { month: "short" });
      const day = dayFormatter.format(d);
      const month = monthFormatter.format(d);
      return `${day} ${month}`;
    } catch (e) {
      return "";
    }
  },

  /**
   * Calculate examination countdown
   */
  calculateCountdown(targetDateStr, targetTimeStr = "09:00") {
    if (!targetDateStr) {
      return { expired: false, days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    }
    const [year, month, day] = targetDateStr.split("-").map(Number);
    const [hour, minute] = (targetTimeStr || "09:00").split(":").map(Number);
    const target = new Date(year, (month || 1) - 1, day || 1, hour || 0, minute || 0, 0, 0);
    const now = new Date();

    const diffMs = target.getTime() - now.getTime();
    if (diffMs <= 0) {
      return {
        expired: true,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        target
      };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);

    return {
      expired: false,
      days,
      hours,
      minutes,
      seconds,
      totalSeconds,
      target
    };
  },

  /**
   * Calculate streaks from an array of activity logs
   * Only completed tasks/lectures count towards streaks.
   */
  calculateStreaks(activityLogs = []) {
    if (!activityLogs || activityLogs.length === 0) {
      return { currentStreak: 0, longestStreak: 0, activeDaysSet: new Set() };
    }

    // Collect unique dates where actual study activity happened (completion)
    const activeDates = new Set();
    activityLogs.forEach(log => {
      if (log.type === "lecture_complete" || log.type === "task_complete") {
        if (log.timestamp) {
          activeDates.add(DateUtils.toLocalDateString(new Date(log.timestamp)));
        } else if (log.date) {
          activeDates.add(log.date);
        }
      }
    });

    if (activeDates.size === 0) {
      return { currentStreak: 0, longestStreak: 0, activeDaysSet: activeDates };
    }

    const sortedDates = Array.from(activeDates).sort();
    const today = this.todayString();
    const yesterday = this.addDays(today, -1);

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = activeDates.has(today) ? today : (activeDates.has(yesterday) ? yesterday : null);

    if (checkDate) {
      while (activeDates.has(checkDate)) {
        currentStreak++;
        checkDate = this.addDays(checkDate, -1);
      }
    }

    // Calculate longest streak across all history
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = null;

    for (const dStr of sortedDates) {
      if (!lastDate) {
        tempStreak = 1;
      } else {
        const expectedNext = this.addDays(lastDate, 1);
        if (dStr === expectedNext) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      lastDate = dStr;
    }

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      activeDaysSet: activeDates
    };
  }
};

