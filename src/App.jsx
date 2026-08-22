import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  Timer, ListTodo, BarChart3, Plus, Play, Pause, RotateCcw,
  Check, X, Trash2, Settings2, Sparkles, Leaf, AlarmClock, Ban,
} from "lucide-react";

/* ---------------------------------------------------------
   Tokens
   pine:      #12201A  main background / sidebar
   card:      #1B3224  panel surface
   raised:    #26402C  inputs / rows / raised surfaces
   sage:      #7BA07F  borders / secondary cards / inactive state
   olive:     #95C84F  main accent / primary CTA / progress / active tab
   highlight: #FFE14F  secondary accent / hover / timer / badges
   cream:     #FBF6E3  primary text on dark
   beige:     #DED9B8  secondary / muted text
   clay:      #FF6A47  danger / sad mood / tiempo cumplido
--------------------------------------------------------- */

const DEFAULT_CATEGORIES = [
  { id: "trabajo", name: "Trabajo", color: "#95C84F" },
  { id: "estudio", name: "Estudio", color: "#7BA07F" },
  { id: "personal", name: "Personal", color: "#FFE14F" },
  { id: "salud", name: "Salud", color: "#FF6A47" },
];

const COLOR_PRESETS = ["#95C84F", "#7BA07F", "#FFE14F", "#FF6A47", "#C58AE0", "#9FB5C2", "#E8A08F", "#6FCCF0"];

const DEFAULT_SETTINGS = { work: 25, short: 5, long: 15, longEvery: 4 };

const STORAGE_KEY = "focus-companion-data-v1";

const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const MAX_EXTENSIONS = 3;
const EXTENSION_MINUTES = 15;
const WARNING_SECONDS = 30 * 60;

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function monthKey(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : "";
}
function monthLabel(key) {
  const [y, m] = key.split("-");
  return `${MONTHS_ES[parseInt(m, 10) - 1]} ${y.slice(2)}`;
}
function withinDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const diff = (now - d) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}
function fmtClock(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(Math.floor(s % 60)).padStart(2, "0");
  return `${mm}:${ss}`;
}

const STAGE_NAMES = [
  "Semilla", "Brote", "Retoño", "Arbusto", "Árbol joven",
  "Árbol floreciente", "Árbol en flor", "Árbol frondoso", "Árbol con frutos", "Árbol dorado",
  "Árbol luminoso", "Árbol resplandeciente", "Árbol ancestral", "Árbol sagrado", "Árbol celestial",
  "Árbol mítico", "Árbol legendario", "Árbol eterno", "Árbol cósmico", "Árbol del infinito",
  "Árbol de la eternidad",
];
const MAX_LEVEL = 20;

function getStage(completedCount) {
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
function getMood(tasks) {
  const recent = tasks.filter(
    (t) => (t.status === "completed" || t.status === "missed") && withinDays(t.date, 30)
  );
  if (recent.length === 0) return "neutral";
  const rate = recent.filter((t) => t.status === "completed").length / recent.length;
  if (rate >= 0.7) return "happy";
  if (rate >= 0.4) return "neutral";
  return "sad";
}

const MOOD_COLOR = { happy: "#95C84F", neutral: "#7BA07F", sad: "#FF6A47" };
const MOOD_LABEL = { happy: "contento", neutral: "estable", sad: "decaído" };

/* ---------------------------------------------------------
   Companion creature — SVG, evolves through 21 forms
--------------------------------------------------------- */
function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function Companion({ level, mood, size = 176 }) {
  const bodyColor = MOOD_COLOR[mood];
  const tilt = mood === "sad" ? -6 : mood === "happy" ? 2 : 0;

  const leafPairs = Math.min(level, 6);
  const bodyR = 26 + Math.min(level, 8) * 2;
  const flowerCount = level >= 5 ? Math.min(level - 4, 8) : 0;
  const fruitCount = level >= 10 ? Math.min(level - 9, 6) : 0;
  const auraRings = level >= 12 ? Math.min(Math.floor((level - 11) / 2) + 1, 4) : 0;
  const orbitCount = level >= 15 ? Math.min(level - 14, 6) : 0;
  const hasCrown = level >= 18;
  const auraPalette = ["#95C84F", "#FFE14F", "#7BA07F", "#DED9B8"];

  return (
    <div className={`companion-stage mood-${mood}`}>
      <div className="companion-glow" style={{ background: `radial-gradient(circle, ${bodyColor}55 0%, transparent 70%)` }} />
      {mood === "happy" && level < 15 && (
        <div className="sparkles">
          <span className="spark s1" /><span className="spark s2" /><span className="spark s3" />
        </div>
      )}
      <svg width={size} height={size} viewBox="0 0 200 200" className="companion-svg" style={{ "--tilt": `${tilt}deg` }}>
        <ellipse cx="100" cy="192" rx="42" ry="6" fill="#000" opacity="0.28" />
        <path d="M 70 168 L 130 168 L 122 190 L 78 190 Z" fill="#8B5E3C" />
        <path d="M 70 168 L 130 168 L 127 176 L 73 176 Z" fill="#71492E" opacity="0.6" />
        <rect x="66" y="160" width="68" height="10" rx="3" fill="#6E4A2F" />

        {Array.from({ length: auraRings }).map((_, i) => (
          <circle
            key={`ring-${i}`} cx="100" cy="90" r={bodyR + 26 + i * 13} fill="none"
            stroke={auraPalette[i % auraPalette.length]} strokeWidth="2" opacity="0.35"
            className="aura-ring" style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}

        {Array.from({ length: orbitCount }).map((_, i) => {
          const [x, y] = polar(100, 88, bodyR + 42, (360 / orbitCount) * i - 90);
          return (
            <circle key={`orbit-${i}`} cx={x} cy={y} r="3.2" fill="#F4D58D" className="orbit-spark" style={{ animationDelay: `${i * 0.3}s` }} />
          );
        })}

        <g className="companion-plant">
          <line x1="100" y1="160" x2="100" y2="120" stroke="#4F7A4C" strokeWidth="5" strokeLinecap="round" />
          {Array.from({ length: leafPairs }).map((_, i) => {
            const y = 152 - i * 14;
            return (
              <g key={i}>
                <path d={`M 100 ${y} Q 78 ${y - 8} 82 ${y - 20} Q 100 ${y - 14} 100 ${y} Z`} fill="#5B8C5A" />
                <path d={`M 100 ${y} Q 122 ${y - 8} 118 ${y - 20} Q 100 ${y - 14} 100 ${y} Z`} fill="#6FA96C" />
              </g>
            );
          })}

          {Array.from({ length: flowerCount }).map((_, i) => {
            const [x, y] = polar(100, 82, bodyR + 14, (360 / flowerCount) * i - 90);
            return <circle key={`flower-${i}`} cx={x} cy={y} r="6.5" fill="#FFE14F" stroke="#12201A" strokeWidth="0.5" />;
          })}

          {Array.from({ length: fruitCount }).map((_, i) => {
            const angle = 60 + (60 / Math.max(fruitCount - 1, 1)) * i;
            const [x, y] = polar(100, 92, bodyR + 6, angle);
            return <circle key={`fruit-${i}`} cx={x} cy={y} r="4.5" fill="#D9857A" />;
          })}

          {hasCrown && (
            <g transform={`translate(100, ${64 - bodyR})`}>
              <path d="M -14 6 L -9 -9 L 0 1 L 9 -9 L 14 6 Z" fill="#F4D58D" stroke="#E7A33E" strokeWidth="1" />
              <circle cx="0" cy="-9" r="2.4" fill="#E7A33E" />
              <circle cx="-9" cy="-6" r="2" fill="#E7A33E" />
              <circle cx="9" cy="-6" r="2" fill="#E7A33E" />
            </g>
          )}

          <circle cx="100" cy="90" r={bodyR} fill={bodyColor} className="companion-body" />
          <circle cx="100" cy="90" r={bodyR} fill="url(#sheen)" opacity="0.25" />
          <defs>
            <radialGradient id="sheen" cx="35%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={100 - bodyR * 0.4} cy="86" r="5" fill="#12201A" />
          <circle cx={100 + bodyR * 0.4} cy="86" r="5" fill="#12201A" />
          {mood === "happy" && (
            <path d={`M ${100 - bodyR * 0.35} ${98} Q 100 ${112} ${100 + bodyR * 0.35} ${98}`} stroke="#12201A" strokeWidth="4" fill="none" strokeLinecap="round" />
          )}
          {mood === "neutral" && (
            <line x1={100 - bodyR * 0.3} y1="102" x2={100 + bodyR * 0.3} y2="102" stroke="#12201A" strokeWidth="4" strokeLinecap="round" />
          )}
          {mood === "sad" && (
            <path d={`M ${100 - bodyR * 0.35} ${106} Q 100 ${94} ${100 + bodyR * 0.35} ${106}`} stroke="#12201A" strokeWidth="4" fill="none" strokeLinecap="round" />
          )}
        </g>
      </svg>
    </div>
  );
}

/* ---------------------------------------------------------
   Persistence — localStorage
--------------------------------------------------------- */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}
function requestNotifyPermission() {
  try {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  } catch (e) {}
}
function fireBrowserNotification(title, body) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  } catch (e) {}
}

/* ---------------------------------------------------------
   Task pomodoro state machine
   A task's estimated duration is spent only during "work"
   phases; breaks are scheduled automatically between work
   chunks following the normal pomodoro rule (short break
   after each cycle, long break every `longEvery` cycles).
   The final work chunk is capped to whatever time remains
   so the total always adds up to the estimate (+ extensions).
--------------------------------------------------------- */
function startSessionFields(task, settings) {
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

function advanceTaskTick(t, settings) {
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

/* ---------------------------------------------------------
   Main App
--------------------------------------------------------- */
export default function App() {
  const initial = useRef(loadData());
  const [tab, setTab] = useState("pomodoro");
  const [tasks, setTasks] = useState(initial.current?.tasks || []);
  const [categories, setCategories] = useState(
    initial.current?.categories?.length ? initial.current.categories : DEFAULT_CATEGORIES
  );
  const [settings, setSettings] = useState(initial.current?.settings || DEFAULT_SETTINGS);
  const [sessionsCompleted, setSessionsCompleted] = useState(initial.current?.sessionsCompleted || 0);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    saveData({ tasks, categories, settings, sessionsCompleted });
  }, [tasks, categories, settings, sessionsCompleted]);

  const completedCount = useMemo(() => tasks.filter((t) => t.status === "completed").length, [tasks]);
  const missedCount = useMemo(() => tasks.filter((t) => t.status === "missed").length, [tasks]);
  const pendingCount = useMemo(() => tasks.filter((t) => t.status === "pending").length, [tasks]);
  const activeTask = useMemo(() => tasks.find((t) => t.status === "in_progress") || null, [tasks]);
  const stage = getStage(completedCount);
  const mood = getMood(tasks);
  const catById = useCallback((id) => categories.find((c) => c.id === id), [categories]);

  // pomodoro engine tick — advances the active task's phase every second while running
  useEffect(() => {
    if (!activeTask || !activeTask.running) return;
    const id = setInterval(() => {
      setTasks((ts) => ts.map((t) => (t.id === activeTask.id ? advanceTaskTick(t, settings) : t)));
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTask?.id, activeTask?.running, settings.work, settings.short, settings.long, settings.longEvery]);

  // 30-minute-of-work-remaining warning — fires once per session (resets on extension)
  useEffect(() => {
    if (!activeTask) return;
    const remaining = activeTask.duration * 60 - activeTask.workedSeconds;
    if (remaining <= WARNING_SECONDS && remaining > 0 && !activeTask.notified30) {
      const msg = `Quedan ${Math.ceil(remaining / 60)} min de trabajo estimado para "${activeTask.title}".`;
      fireBrowserNotification("⏰ Refugio de Enfoque", msg);
      setBanner(msg);
      setTasks((ts) => ts.map((t) => (t.id === activeTask.id ? { ...t, notified30: true } : t)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTask?.workedSeconds, activeTask?.id]);

  function startTask(id) {
    if (activeTask) return;
    requestNotifyPermission();
    setBanner(null);
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...startSessionFields(t, settings) } : t)));
    setTab("pomodoro");
  }
  function toggleActiveRunning() {
    if (!activeTask) return;
    setTasks((ts) => ts.map((t) => (t.id === activeTask.id ? { ...t, running: !t.running } : t)));
  }
  function extendActiveTask() {
    if (!activeTask || activeTask.extensionsUsed >= MAX_EXTENSIONS) return;
    setTasks((ts) =>
      ts.map((t) => {
        if (t.id !== activeTask.id) return t;
        const newDuration = t.duration + EXTENSION_MINUTES;
        const patch = { duration: newDuration, extensionsUsed: t.extensionsUsed + 1, notified30: false };
        if (t.phase === "done") {
          const remaining = newDuration * 60 - t.workedSeconds;
          const workChunk = Math.min(settings.work * 60, remaining);
          Object.assign(patch, { phase: "work", phaseSecondsLeft: workChunk, phaseTotalSeconds: workChunk, overtimeSeconds: 0, running: true });
        }
        return { ...t, ...patch };
      })
    );
    setBanner(null);
  }
  function finishActiveTask(status) {
    if (!activeTask) return;
    setTasks((ts) => ts.map((t) => (t.id === activeTask.id ? { ...t, status, running: false } : t)));
    setBanner(null);
  }
  function cancelActiveTask() {
    if (!activeTask) return;
    setTasks((ts) =>
      ts.map((t) =>
        t.id === activeTask.id
          ? { ...t, status: "pending", startedAt: null, extensionsUsed: 0, notified30: false, running: false, phase: null }
          : t
      )
    );
    setBanner(null);
  }

  return (
    <div className="app-root">
      <div className="grain" />
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-mark"><Leaf size={18} /></span>
            <div>
              <div className="title">Refugio de Enfoque</div>
              <div className="subtitle">crece una sesión a la vez</div>
            </div>
          </div>

          <nav className="nav">
            <button className={`nav-btn ${tab === "pomodoro" ? "active" : ""}`} onClick={() => setTab("pomodoro")}>
              <Timer size={16} /> Pomodoro {activeTask && <span className="nav-count nav-count-live">●</span>}
            </button>
            <button className={`nav-btn ${tab === "tasks" ? "active" : ""}`} onClick={() => setTab("tasks")}>
              <ListTodo size={16} /> Tareas {pendingCount > 0 && <span className="nav-count">{pendingCount}</span>}
            </button>
            <button className={`nav-btn ${tab === "stats" ? "active" : ""}`} onClick={() => setTab("stats")}>
              <BarChart3 size={16} /> Estadísticas
            </button>
          </nav>

          <div className="companion-card">
            <span className="eyebrow" style={{ color: MOOD_COLOR[mood] }}>tu compañero · nivel {stage.level}</span>
            <Companion level={stage.level} mood={mood} />
            <div className="stage-name">{stage.name}</div>
            <span className="mood-pill" style={{ background: MOOD_COLOR[mood] + "22", color: MOOD_COLOR[mood] }}>
              <Sparkles size={12} /> Ánimo {MOOD_LABEL[mood]}
            </span>
            <div className="evolve-track-wrap">
              <div className="progress-track evolve-track">
                <div className="progress-fill" style={{ width: `${stage.progressPct}%`, background: "#95C84F" }} />
              </div>
              <div className="evolve-label">
                {stage.next
                  ? <>faltan <strong>{stage.toNext}</strong> tareas para {stage.next}</>
                  : <>nivel máximo alcanzado 🎉</>}
              </div>
            </div>
          </div>

          <div className="quick-stats">
            <div className="qstat"><span className="qnum" style={{ color: "#95C84F" }}>{completedCount}</span><span className="qlabel">completadas</span></div>
            <div className="qstat"><span className="qnum" style={{ color: "#FF6A47" }}>{missedCount}</span><span className="qlabel">perdidas</span></div>
            <div className="qstat"><span className="qnum">{completedCount + missedCount ? Math.round((completedCount / (completedCount + missedCount)) * 100) : 0}%</span><span className="qlabel">éxito</span></div>
          </div>
        </aside>

        <main className="content">
          {banner && (
            <div className="alert-banner">
              <AlarmClock size={15} />
              <span>{banner}</span>
              <button className="alert-close" onClick={() => setBanner(null)}><X size={13} /></button>
            </div>
          )}

          {tab === "pomodoro" && (
            <PomodoroPanel
              settings={settings}
              setSettings={setSettings}
              sessionsCompleted={sessionsCompleted}
              setSessionsCompleted={setSessionsCompleted}
              activeTask={activeTask}
              onToggleRunning={toggleActiveRunning}
              onExtend={extendActiveTask}
              onComplete={() => finishActiveTask("completed")}
              onMiss={() => finishActiveTask("missed")}
              onCancel={cancelActiveTask}
            />
          )}
          {tab === "tasks" && (
            <TasksPanel
              tasks={tasks} setTasks={setTasks} categories={categories} setCategories={setCategories}
              catById={catById} activeTaskId={activeTask?.id || null} onStart={startTask} onGoToSession={() => setTab("pomodoro")}
            />
          )}
          {tab === "stats" && <StatsPanel tasks={tasks} categories={categories} />}
        </main>
      </div>
    </div>
  );
}

/* ---------------- Task session — real pomodoro cycles against the estimate ---------------- */
const PHASE_META = {
  work: { label: "Enfoque", color: "#95C84F" },
  short: { label: "Descanso corto", color: "#7BA07F" },
  long: { label: "Descanso largo", color: "#FFE14F" },
  done: { label: "Tiempo estimado cumplido", color: "#FF6A47" },
};

function TaskSessionCard({ task, onToggleRunning, onExtend, onComplete, onMiss, onCancel }) {
  const totalSeconds = task.duration * 60;
  const remainingTotal = Math.max(0, totalSeconds - task.workedSeconds);
  const overallPct = totalSeconds ? Math.min(100, (task.workedSeconds / totalSeconds) * 100) : 0;
  const nearEnd = remainingTotal <= WARNING_SECONDS && remainingTotal > 0;
  const meta = PHASE_META[task.phase] || PHASE_META.done;
  const phasePct = task.phaseTotalSeconds ? ((task.phaseTotalSeconds - task.phaseSecondsLeft) / task.phaseTotalSeconds) * 100 : 100;
  const extensionsLeft = MAX_EXTENSIONS - task.extensionsUsed;

  return (
    <div className="card accent-amber">
      <span className="eyebrow">tarea en curso · ciclo {task.cyclesCompleted + 1}</span>
      <div className="timer-wrap">
        <div className="task-session-title">{task.title}</div>
        <div className="phase-pill" style={{ background: meta.color + "22", color: meta.color }}>{meta.label}</div>

        <div className="ring-wrap">
          <svg className="ring" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="88" fill="none" stroke="#26402C" strokeWidth="10" />
            <circle
              cx="100" cy="100" r="88" fill="none" stroke={meta.color} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - phasePct / 100)}
              transform="rotate(-90 100 100)"
              className="ring-progress"
            />
          </svg>
          <div className="time-display">
            {task.phase === "done" ? `+${fmtClock(task.overtimeSeconds)}` : fmtClock(task.phaseSecondsLeft)}
          </div>
        </div>

        {task.phase !== "done" && (
          <button className="btn btn-ghost" style={{ marginTop: 18 }} onClick={onToggleRunning}>
            {task.running ? <Pause size={15} /> : <Play size={15} />} {task.running ? "Pausar" : "Reanudar"}
          </button>
        )}

        <div className="task-overall">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${overallPct}%`, background: "#95C84F" }} />
          </div>
          <div className="task-overall-label">
            {Math.round(task.workedSeconds / 60)} / {task.duration} min trabajados en esta tarea
          </div>
        </div>

        {nearEnd && (
          <div className="session-alert">
            <AlarmClock size={14} /> Menos de 30 min de trabajo estimado restantes
          </div>
        )}
        {task.phase === "done" && (
          <div className="session-alert danger">
            <AlarmClock size={14} /> Tiempo estimado cumplido — agrega tiempo o cierra la tarea
          </div>
        )}

        <div className="timer-controls" style={{ marginTop: 18 }}>
          <button className="btn btn-ghost" onClick={onExtend} disabled={extensionsLeft <= 0}>
            <Plus size={14} /> +{EXTENSION_MINUTES} min {extensionsLeft > 0 ? `(${extensionsLeft} disp.)` : "(sin extensiones)"}
          </button>
        </div>

        <div className="timer-controls" style={{ marginTop: 10 }}>
          <button className="btn btn-primary" onClick={onComplete}><Check size={15} /> Completar</button>
          <button className="btn btn-ghost" onClick={onMiss}><X size={15} /> Perdida</button>
          <button className="btn btn-ghost" onClick={onCancel}><Ban size={14} /> Cancelar</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Free-form Pomodoro (no task attached) ---------------- */
function PomodoroPanel({ settings, setSettings, sessionsCompleted, setSessionsCompleted, activeTask, onToggleRunning, onExtend, onComplete, onMiss, onCancel }) {
  const [mode, setMode] = useState("work");
  const [secondsLeft, setSecondsLeft] = useState(settings.work * 60);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef(null);
  const durationsMin = { work: settings.work, short: settings.short, long: settings.long };

  useEffect(() => {
    setSecondsLeft(durationsMin[mode] * 60);
    setRunning(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, settings.work, settings.short, settings.long]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "work") setSessionsCompleted((n) => n + 1);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, setSessionsCompleted]);

  if (activeTask) {
    return <TaskSessionCard task={activeTask} onToggleRunning={onToggleRunning} onExtend={onExtend} onComplete={onComplete} onMiss={onMiss} onCancel={onCancel} />;
  }

  const total = durationsMin[mode] * 60;
  const pct = total ? ((total - secondsLeft) / total) * 100 : 0;
  const modeColor = mode === "work" ? "#95C84F" : mode === "short" ? "#7BA07F" : "#FFE14F";

  return (
    <div className="card accent-amber">
      <span className="eyebrow">pomodoro libre</span>
      <div className="timer-wrap">
        <div className="hint-note">Sin tarea vinculada. Inicia una tarea desde la pestaña <strong>Tareas</strong> para repartir su tiempo estimado en ciclos de pomodoro con descansos automáticos.</div>
        <div className="mode-pills">
          <button className={`mode-pill ${mode === "work" ? "active" : ""}`} onClick={() => setMode("work")}>Enfoque</button>
          <button className={`mode-pill ${mode === "short" ? "active" : ""}`} onClick={() => setMode("short")}>Descanso corto</button>
          <button className={`mode-pill ${mode === "long" ? "active" : ""}`} onClick={() => setMode("long")}>Descanso largo</button>
        </div>

        <div className="ring-wrap">
          <svg className="ring" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="88" fill="none" stroke="#26402C" strokeWidth="10" />
            <circle
              cx="100" cy="100" r="88" fill="none" stroke={modeColor} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - pct / 100)}
              transform="rotate(-90 100 100)"
              className="ring-progress"
            />
          </svg>
          <div className="time-display">{fmtClock(secondsLeft)}</div>
        </div>

        <div className="timer-controls">
          <button className="btn btn-primary" onClick={() => setRunning((r) => !r)}>
            {running ? <Pause size={15} /> : <Play size={15} />} {running ? "Pausar" : "Iniciar"}
          </button>
          <button className="btn btn-ghost" onClick={() => { setRunning(false); setSecondsLeft(durationsMin[mode] * 60); }}>
            <RotateCcw size={15} /> Reiniciar
          </button>
          <button className="btn btn-ghost" onClick={() => setShowSettings((s) => !s)}>
            <Settings2 size={15} />
          </button>
        </div>

        <div className="stat-row" style={{ marginTop: 22 }}>
          <div className="stat"><span className="stat-num">{sessionsCompleted}</span><span className="stat-label">sesiones de enfoque completadas</span></div>
        </div>

        {showSettings && (
          <div style={{ width: "100%", marginTop: 18 }}>
            <label className="field-label">Duraciones (minutos) — también rigen los ciclos automáticos de las tareas</label>
            <div className="settings-grid">
              <div>
                <label className="field-label">Enfoque</label>
                <input type="number" min="1" value={settings.work} onChange={(e) => setSettings({ ...settings, work: Number(e.target.value) || 1 })} />
              </div>
              <div>
                <label className="field-label">Descanso corto</label>
                <input type="number" min="1" value={settings.short} onChange={(e) => setSettings({ ...settings, short: Number(e.target.value) || 1 })} />
              </div>
              <div>
                <label className="field-label">Descanso largo</label>
                <input type="number" min="1" value={settings.long} onChange={(e) => setSettings({ ...settings, long: Number(e.target.value) || 1 })} />
              </div>
              <div>
                <label className="field-label">Ciclos hasta descanso largo</label>
                <input type="number" min="1" value={settings.longEvery} onChange={(e) => setSettings({ ...settings, longEvery: Number(e.target.value) || 1 })} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Tasks ---------------- */
function TasksPanel({ tasks, setTasks, categories, setCategories, catById, activeTaskId, onStart, onGoToSession }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayISO());
  const [duration, setDuration] = useState(30);
  const [catId, setCatId] = useState(categories[0]?.id || "");
  const [filter, setFilter] = useState("all");
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(COLOR_PRESETS[0]);

  useEffect(() => {
    if (!catId && categories.length) setCatId(categories[0].id);
  }, [categories, catId]);

  function addTask() {
    if (!title.trim()) return;
    setTasks((ts) => [
      ...ts,
      {
        id: uid(), title: title.trim(), date, duration: Number(duration) || 0, type: catId, status: "pending",
        createdAt: Date.now(), startedAt: null, extensionsUsed: 0, notified30: false,
        phase: null, phaseSecondsLeft: 0, phaseTotalSeconds: 0, workedSeconds: 0, cyclesCompleted: 0, overtimeSeconds: 0, running: false,
      },
    ]);
    setTitle("");
    setDuration(30);
  }
  function setStatus(id, status) {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: t.status === status ? "pending" : status } : t)));
  }
  function removeTask(id) {
    setTasks((ts) => ts.filter((t) => t.id !== id));
  }
  function addCategory() {
    if (!newCatName.trim()) return;
    const id = newCatName.trim().toLowerCase().replace(/\s+/g, "-") + "-" + uid().slice(0, 4);
    setCategories((cs) => [...cs, { id, name: newCatName.trim(), color: newCatColor }]);
    setNewCatName("");
    setShowAddCat(false);
  }

  const filtered = tasks
    .filter((t) => filter === "all" || t.type === filter)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <>
      <div className="card accent-peri">
        <span className="eyebrow" style={{ color: "#7BA07F" }}>nueva tarea</span>
        <div className="form-grid">
          <div>
            <label className="field-label">Título</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Redactar informe" onKeyDown={(e) => e.key === "Enter" && addTask()} />
          </div>
          <div>
            <label className="field-label">Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Duración estimada (min)</label>
            <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Tipo</label>
            <select value={catId} onChange={(e) => setCatId(e.target.value)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={addTask}><Plus size={15} /> Añadir</button>
        </div>

        <div style={{ marginTop: 14 }}>
          {!showAddCat ? (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddCat(true)}><Plus size={12} /> Nueva categoría</button>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input type="text" style={{ width: 160 }} placeholder="Nombre" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
              {COLOR_PRESETS.map((c) => (
                <div key={c} className={`color-swatch ${newCatColor === c ? "selected" : ""}`} style={{ background: c }} onClick={() => setNewCatColor(c)} />
              ))}
              <button className="btn btn-primary btn-sm" onClick={addCategory}>Guardar</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddCat(false)}>Cancelar</button>
            </div>
          )}
        </div>
      </div>

      <div className="card accent-peri">
        <div className="filters">
          <button className={`filter-chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Todas</button>
          {categories.map((c) => (
            <button key={c.id} className={`filter-chip ${filter === c.id ? "active" : ""}`} onClick={() => setFilter(c.id)}>{c.name}</button>
          ))}
        </div>

        {filtered.length === 0 && <div className="empty">No hay tareas en esta vista todavía.</div>}

        {filtered.map((t) => {
          const cat = catById(t.type);
          const overdue = t.status === "pending" && t.date < todayISO();
          const isActive = t.status === "in_progress";
          const blockedStart = t.status === "pending" && !!activeTaskId;
          return (
            <div className={`task-row ${isActive ? "task-row-active" : ""}`} key={t.id}>
              <div className="task-bar" style={{ background: cat ? cat.color : "#7BA07F" }} />
              <div style={{ flex: 1 }}>
                <div className="task-title">{t.title}</div>
                <div className="task-meta">
                  {t.date} · {t.duration} min estimados
                  {t.extensionsUsed > 0 && <span className="mono" style={{ marginLeft: 4 }}>(+{t.extensionsUsed}x{EXTENSION_MINUTES}min)</span>}
                  {cat && <span className="cat-chip" style={{ background: cat.color + "22", color: cat.color, marginLeft: 8 }}>{cat.name}</span>}
                  {overdue && <span className="status-tag" style={{ background: "#FF6A4722", color: "#FF6A47", marginLeft: 8 }}>vencida</span>}
                  {isActive && <span className="status-tag" style={{ background: "#FFE14F22", color: "#FFE14F", marginLeft: 8 }}>en curso · {Math.round(t.workedSeconds / 60)}/{t.duration} min</span>}
                  {t.status === "completed" && <span className="status-tag" style={{ background: "#95C84F22", color: "#95C84F", marginLeft: 8 }}>completada</span>}
                  {t.status === "missed" && <span className="status-tag" style={{ background: "#FF6A4722", color: "#FF6A47", marginLeft: 8 }}>perdida</span>}
                </div>
              </div>
              <div className="task-actions">
                {t.status === "pending" && (
                  <button className="icon-btn" title={blockedStart ? "Ya hay una tarea en curso" : "Iniciar (reparte el tiempo en ciclos de pomodoro)"} disabled={blockedStart} onClick={() => onStart(t.id)}>
                    <Play size={14} />
                  </button>
                )}
                {isActive && (
                  <button className="icon-btn completed-active" title="Ver sesión en curso" onClick={onGoToSession}>
                    <Timer size={14} />
                  </button>
                )}
                <button className={`icon-btn ${t.status === "completed" ? "completed-active" : ""}`} title="Marcar completada" onClick={() => setStatus(t.id, "completed")}><Check size={15} /></button>
                <button className={`icon-btn ${t.status === "missed" ? "missed-active" : ""}`} title="Marcar perdida" onClick={() => setStatus(t.id, "missed")}><X size={15} /></button>
                <button className="icon-btn" title="Eliminar" onClick={() => removeTask(t.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ---------------- Stats ---------------- */
function StatsPanel({ tasks, categories }) {
  const monthly = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (t.status !== "completed" && t.status !== "missed") return;
      const key = monthKey(t.date);
      if (!key) return;
      if (!map[key]) map[key] = { key, completadas: 0, perdidas: 0 };
      if (t.status === "completed") map[key].completadas += 1;
      else map[key].perdidas += 1;
    });
    return Object.values(map)
      .sort((a, b) => (a.key < b.key ? -1 : 1))
      .slice(-6)
      .map((m) => ({ ...m, mes: monthLabel(m.key) }));
  }, [tasks]);

  const byCategory = useMemo(() => {
    return categories.map((c) => {
      const catTasks = tasks.filter((t) => t.type === c.id && (t.status === "completed" || t.status === "missed"));
      return {
        ...c,
        completadas: catTasks.filter((t) => t.status === "completed").length,
        perdidas: catTasks.filter((t) => t.status === "missed").length,
      };
    }).filter((c) => c.completadas + c.perdidas > 0);
  }, [tasks, categories]);

  return (
    <>
      <div className="card accent-moss chart-card">
        <span className="eyebrow" style={{ color: "#FFE14F" }}>progreso mensual</span>
        {monthly.length === 0 ? (
          <div className="empty">Aún no hay tareas completadas o perdidas para graficar.</div>
        ) : (
          <div style={{ width: "100%", height: 300, marginTop: 12 }}>
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#7BA07F" vertical={false} />
                <XAxis dataKey="mes" stroke="#DED9B8" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#DED9B8" fontSize={12} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1B3224", border: "1px solid #7BA07F", borderRadius: 10, fontSize: 12 }} cursor={{ fill: "#26402C" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="completadas" fill="#95C84F" radius={[6, 6, 0, 0]} name="Completadas" maxBarSize={40} />
                <Bar dataKey="perdidas" fill="#FF6A47" radius={[6, 6, 0, 0]} name="Perdidas" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="card accent-moss">
        <span className="eyebrow" style={{ color: "#FFE14F" }}>por categoría</span>
        {byCategory.length === 0 && <div className="empty">Sin datos todavía.</div>}
        {byCategory.map((c) => {
          const total = c.completadas + c.perdidas;
          const pct = total ? Math.round((c.completadas / total) * 100) : 0;
          return (
            <div key={c.id} className="cat-row">
              <div className="cat-row-head">
                <span className="cat-chip" style={{ background: c.color + "22", color: c.color }}>{c.name}</span>
                <span className="mono cat-row-meta">{c.completadas} completadas · {c.perdidas} perdidas · {pct}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${pct}%`, background: c.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
