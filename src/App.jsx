import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  Timer, ListTodo, BarChart3, Plus, Play, Pause, RotateCcw,
  Check, X, Trash2, Settings2, Sparkles,
} from "lucide-react";

/* ---------------------------------------------------------
   Tokens
   ink:        #132420  deep pine background
   card:       #1B322C  panel surface
   parchment:  #F3ECDD  primary text on dark
   amber:      #E7A33E  primary accent / neutral mood
   moss:       #6FA96C  success / happy mood
   clay:       #C3572E  danger / sad mood
   periwinkle: #93A8D6  secondary accent
--------------------------------------------------------- */

const DEFAULT_CATEGORIES = [
  { id: "trabajo", name: "Trabajo", color: "#E7A33E" },
  { id: "estudio", name: "Estudio", color: "#93A8D6" },
  { id: "personal", name: "Personal", color: "#6FA96C" },
  { id: "salud", name: "Salud", color: "#C3572E" },
];

const COLOR_PRESETS = ["#E7A33E", "#93A8D6", "#6FA96C", "#C3572E", "#B98BD1", "#4FB3A9", "#D9857A", "#8FA0AD"];

const DEFAULT_SETTINGS = { work: 25, short: 5, long: 15, longEvery: 4 };

const STORAGE_KEY = "focus-companion-data-v1";

const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

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

function getStage(completedCount) {
  if (completedCount >= 50) return { name: "Árbol radiante", level: 5 };
  if (completedCount >= 30) return { name: "Árbol", level: 4 };
  if (completedCount >= 15) return { name: "Retoño", level: 3 };
  if (completedCount >= 5) return { name: "Brote", level: 2 };
  return { name: "Semilla", level: 1 };
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

const MOOD_COLOR = { happy: "#6FA96C", neutral: "#E7A33E", sad: "#C3572E" };
const MOOD_LABEL = { happy: "contento", neutral: "estable", sad: "decaído" };

/* ---------------------------------------------------------
   Companion creature — SVG, grows with completed tasks,
   expression follows recent success rate
--------------------------------------------------------- */
function Companion({ level, mood, size = 168 }) {
  const bodyColor = MOOD_COLOR[mood];
  const leafPairs = Math.min(level, 4);
  const showFlower = level >= 5;
  const bodyR = 30 + level * 3;

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className="companion-svg">
      <path d="M 70 168 L 130 168 L 122 190 L 78 190 Z" fill="#8B5E3C" />
      <rect x="66" y="160" width="68" height="10" rx="3" fill="#6E4A2F" />
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
      {showFlower && (
        <g>
          <circle cx="82" cy="60" r="7" fill="#E7A33E" />
          <circle cx="118" cy="58" r="7" fill="#E7A33E" />
          <circle cx="100" cy="46" r="7" fill="#E7A33E" />
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
      <circle cx={100 - bodyR * 0.4} cy="86" r="5" fill="#132420" />
      <circle cx={100 + bodyR * 0.4} cy="86" r="5" fill="#132420" />
      {mood === "happy" && (
        <path d={`M ${100 - bodyR * 0.35} ${98} Q 100 ${112} ${100 + bodyR * 0.35} ${98}`} stroke="#132420" strokeWidth="4" fill="none" strokeLinecap="round" />
      )}
      {mood === "neutral" && (
        <line x1={100 - bodyR * 0.3} y1="102" x2={100 + bodyR * 0.3} y2="102" stroke="#132420" strokeWidth="4" strokeLinecap="round" />
      )}
      {mood === "sad" && (
        <path d={`M ${100 - bodyR * 0.35} ${106} Q 100 ${94} ${100 + bodyR * 0.35} ${106}`} stroke="#132420" strokeWidth="4" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

/* ---------------------------------------------------------
   Persistence — localStorage (per-browser, no backend needed)
--------------------------------------------------------- */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // storage unavailable or full — fail silently
  }
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

  useEffect(() => {
    saveData({ tasks, categories, settings, sessionsCompleted });
  }, [tasks, categories, settings, sessionsCompleted]);

  const completedCount = useMemo(() => tasks.filter((t) => t.status === "completed").length, [tasks]);
  const missedCount = useMemo(() => tasks.filter((t) => t.status === "missed").length, [tasks]);
  const stage = getStage(completedCount);
  const mood = getMood(tasks);

  const catById = useCallback((id) => categories.find((c) => c.id === id), [categories]);

  return (
    <div className="app-root">
      <div className="shell">
        <div className="header-row">
          <div>
            <div className="title">🌱 Refugio de Enfoque</div>
            <div className="subtitle">Pomodoro, tareas y un compañero que crece contigo</div>
          </div>
          <div className="nav">
            <button className={`nav-btn ${tab === "pomodoro" ? "active" : ""}`} onClick={() => setTab("pomodoro")}>
              <Timer size={15} /> Pomodoro
            </button>
            <button className={`nav-btn ${tab === "tasks" ? "active" : ""}`} onClick={() => setTab("tasks")}>
              <ListTodo size={15} /> Tareas
            </button>
            <button className={`nav-btn ${tab === "stats" ? "active" : ""}`} onClick={() => setTab("stats")}>
              <BarChart3 size={15} /> Estadísticas
            </button>
          </div>
        </div>

        <CompanionCard stage={stage} mood={mood} completedCount={completedCount} missedCount={missedCount} />

        {tab === "pomodoro" && (
          <PomodoroPanel
            settings={settings}
            setSettings={setSettings}
            tasks={tasks.filter((t) => t.status === "pending")}
            sessionsCompleted={sessionsCompleted}
            setSessionsCompleted={setSessionsCompleted}
          />
        )}

        {tab === "tasks" && (
          <TasksPanel tasks={tasks} setTasks={setTasks} categories={categories} setCategories={setCategories} catById={catById} />
        )}

        {tab === "stats" && <StatsPanel tasks={tasks} categories={categories} />}
      </div>
    </div>
  );
}

function CompanionCard({ stage, mood, completedCount, missedCount }) {
  const total = completedCount + missedCount;
  const rate = total ? Math.round((completedCount / total) * 100) : 0;
  return (
    <div className="card companion-card">
      <Companion level={stage.level} mood={mood} />
      <div className="companion-info">
        <div className="stage-name">{stage.name}</div>
        <span className="mood-pill" style={{ background: MOOD_COLOR[mood] + "22", color: MOOD_COLOR[mood] }}>
          <Sparkles size={12} /> Ánimo {MOOD_LABEL[mood]}
        </span>
        <div className="stat-row">
          <div className="stat"><span className="stat-num" style={{ color: "#6FA96C" }}>{completedCount}</span><span className="stat-label">completadas</span></div>
          <div className="stat"><span className="stat-num" style={{ color: "#C3572E" }}>{missedCount}</span><span className="stat-label">perdidas</span></div>
          <div className="stat"><span className="stat-num">{rate}%</span><span className="stat-label">tasa de éxito</span></div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Pomodoro ---------------- */
function PomodoroPanel({ settings, setSettings, tasks, sessionsCompleted, setSessionsCompleted }) {
  const [mode, setMode] = useState("work");
  const [secondsLeft, setSecondsLeft] = useState(settings.work * 60);
  const [running, setRunning] = useState(false);
  const [linkedTaskId, setLinkedTaskId] = useState("");
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

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="card">
      <div className="timer-wrap">
        <div className="mode-pills">
          <button className={`mode-pill ${mode === "work" ? "active" : ""}`} onClick={() => setMode("work")}>Enfoque</button>
          <button className={`mode-pill ${mode === "short" ? "active" : ""}`} onClick={() => setMode("short")}>Descanso corto</button>
          <button className={`mode-pill ${mode === "long" ? "active" : ""}`} onClick={() => setMode("long")}>Descanso largo</button>
        </div>

        <div className="time-display">{mm}:{ss}</div>

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

        {mode === "work" && (
          <div className="task-select">
            <label className="field-label">Tarea en la que estás trabajando (opcional)</label>
            <select value={linkedTaskId} onChange={(e) => setLinkedTaskId(e.target.value)}>
              <option value="">— sin vincular —</option>
              {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
        )}

        <div className="stat-row" style={{ marginTop: 20 }}>
          <div className="stat"><span className="stat-num">{sessionsCompleted}</span><span className="stat-label">sesiones de enfoque completadas</span></div>
        </div>

        {showSettings && (
          <div style={{ width: "100%", marginTop: 18 }}>
            <label className="field-label">Duraciones (minutos)</label>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Tasks ---------------- */
function TasksPanel({ tasks, setTasks, categories, setCategories, catById }) {
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
      { id: uid(), title: title.trim(), date, duration: Number(duration) || 0, type: catId, status: "pending", createdAt: Date.now() },
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
      <div className="card">
        <label className="field-label">Nueva tarea</label>
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
            <label className="field-label">Duración (min)</label>
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

      <div className="card">
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
          return (
            <div className="task-row" key={t.id}>
              <div style={{ flex: 1 }}>
                <div className="task-title">{t.title}</div>
                <div className="task-meta">
                  {t.date} · {t.duration} min
                  {cat && <span className="cat-chip" style={{ background: cat.color + "22", color: cat.color, marginLeft: 8 }}>{cat.name}</span>}
                  {overdue && <span className="status-tag" style={{ background: "#C3572E22", color: "#C3572E", marginLeft: 8 }}>vencida</span>}
                  {t.status === "completed" && <span className="status-tag" style={{ background: "#6FA96C22", color: "#6FA96C", marginLeft: 8 }}>completada</span>}
                  {t.status === "missed" && <span className="status-tag" style={{ background: "#C3572E22", color: "#C3572E", marginLeft: 8 }}>perdida</span>}
                </div>
              </div>
              <div className="task-actions">
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
      <div className="card chart-card">
        <label className="field-label">Tareas completadas vs. perdidas por mes</label>
        {monthly.length === 0 ? (
          <div className="empty">Aún no hay tareas completadas o perdidas para graficar.</div>
        ) : (
          <div style={{ width: "100%", height: 280, marginTop: 12 }}>
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A473C" />
                <XAxis dataKey="mes" stroke="#9DB6AA" fontSize={12} />
                <YAxis stroke="#9DB6AA" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#1B322C", border: "1px solid #2A473C", borderRadius: 10, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="completadas" fill="#6FA96C" radius={[6, 6, 0, 0]} name="Completadas" />
                <Bar dataKey="perdidas" fill="#C3572E" radius={[6, 6, 0, 0]} name="Perdidas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="card">
        <label className="field-label">Por categoría</label>
        {byCategory.length === 0 && <div className="empty">Sin datos todavía.</div>}
        {byCategory.map((c) => {
          const total = c.completadas + c.perdidas;
          const pct = total ? Math.round((c.completadas / total) * 100) : 0;
          return (
            <div key={c.id} style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span className="cat-chip" style={{ background: c.color + "22", color: c.color }}>{c.name}</span>
                <span className="mono" style={{ color: "#9DB6AA" }}>{c.completadas} completadas · {c.perdidas} perdidas · {pct}%</span>
              </div>
              <div style={{ height: 8, background: "#21392F", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: c.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
