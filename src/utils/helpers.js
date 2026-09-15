import { MONTHS_ES, MAX_LEVEL, STAGE_NAMES, STORAGE_KEY } from "./constants";

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
export function monthKey(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : "";
}
export function monthLabel(key) {
  const [y, m] = key.split("-");
  return `${MONTHS_ES[parseInt(m, 10) - 1]} ${y.slice(2)}`;
}
export function withinDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const diff = (now - d) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}
export function fmtClock(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(Math.floor(s % 60)).padStart(2, "0");
  return `${mm}:${ss}`;
}
export function getStage(completedCount) {
  const level = Math.min(Math.floor(completedCount / 10), MAX_LEVEL);
  const intoLevel = completedCount - level * 10;
  const toNext = level < MAX_LEVEL ? 10 - intoLevel : 0;
  return {
    level,
    name: STAGE_NAMES[level],
    next: level < MAX_LEVEL ? STAGE_NAMES[level + 1] : null,
    progressPct: level < MAX_LEVEL ? (intoLevel / 10) * 100 : 100,
    toNext,
  };
}
export function getMood(tasks) {
  const recent = tasks.filter(
    (t) => (t.status === "completed" || t.status === "missed") && withinDays(t.date, 30)
  );
  if (recent.length === 0) return "neutral";
  const rate = recent.filter((t) => t.status === "completed").length / recent.length;
  if (rate >= 0.7) return "happy";
  if (rate >= 0.4) return "neutral";
  return "sad";
}
export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}
export function requestNotifyPermission() {
  try {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  } catch (e) {}
}
export function fireBrowserNotification(title, body) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  } catch (e) {}
}
export function startSessionFields(task, settings) {
  const totalSeconds = task.duration * 60;
  const workChunk = Math.min(settings.work * 60, totalSeconds);
  return {
    status: "in_progress",
    startedAt: Date.now(),
    extensionsUsed: 0,
    notified30: false,
    workedSeconds: 0,
    cyclesCompleted: 0,
    overtimeSeconds: 0,
    running: true,
    phase: "work",
    phaseSecondsLeft: workChunk,
    phaseTotalSeconds: workChunk,
  };
}
export function advanceTaskTick(t, settings) {
  if (t.phase === "done") {
    return { ...t, overtimeSeconds: (t.overtimeSeconds || 0) + 1 };
  }
  const phaseSecondsLeft = t.phaseSecondsLeft - 1;
  const workedSeconds = t.workedSeconds + (t.phase === "work" ? 1 : 0);

  if (phaseSecondsLeft > 0) {
    return { ...t, phaseSecondsLeft, workedSeconds };
  }

  const totalSeconds = t.duration * 60;
  const remaining = totalSeconds - workedSeconds;

  if (t.phase === "work") {
    const cyclesCompleted = t.cyclesCompleted + 1;
    if (remaining <= 0) {
      return { ...t, workedSeconds, cyclesCompleted, phase: "done", phaseSecondsLeft: 0, phaseTotalSeconds: 0, overtimeSeconds: 0 };
    }
    const isLong = cyclesCompleted % (settings.longEvery || 4) === 0;
    const breakSeconds = (isLong ? settings.long : settings.short) * 60;
    return { ...t, workedSeconds, cyclesCompleted, phase: isLong ? "long" : "short", phaseSecondsLeft: breakSeconds, phaseTotalSeconds: breakSeconds };
  }

  // a break just ended — resume work (or finish if the estimate is already spent)
  if (remaining <= 0) {
    return { ...t, workedSeconds, phase: "done", phaseSecondsLeft: 0, phaseTotalSeconds: 0, overtimeSeconds: 0 };
  }
  const workChunk = Math.min(settings.work * 60, remaining);
  return { ...t, workedSeconds, phase: "work", phaseSecondsLeft: workChunk, phaseTotalSeconds: workChunk };
}
