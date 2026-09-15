import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Timer, ListTodo, BarChart3, X, Sparkles, Leaf, AlarmClock, User
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

import {
  DEFAULT_CATEGORIES, DEFAULT_SETTINGS, WARNING_SECONDS, MAX_EXTENSIONS, EXTENSION_MINUTES, MOOD_COLOR, MOOD_LABEL
} from "./utils/constants";
import Companion from "./components/Companion";
import PomodoroPanel from "./components/PomodoroPanel";
import TasksPanel from "./components/TasksPanel";
import StatsPanel from "./components/StatsPanel";
import AuthModal from "./components/AuthModal";
import { supabase } from "./utils/supabaseClient";
import { pullCloudData, pushCloudDataDebounced } from "./utils/cloudSync";
import {
  getStage, getMood, loadData, requestNotifyPermission, fireBrowserNotification, startSessionFields, advanceTaskTick
} from "./utils/helpers";


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

  // Auth State
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) setShowAuthModal(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar datos de la nube cuando inicia sesión
  useEffect(() => {
    if (user) {
      pullCloudData(user.id).then((cloudData) => {
        if (cloudData) {
          if (cloudData.tasks) setTasks(cloudData.tasks);
          if (cloudData.categories) setCategories(cloudData.categories);
          if (cloudData.settings) setSettings(cloudData.settings);
          if (cloudData.sessionsCompleted !== undefined) setSessionsCompleted(cloudData.sessionsCompleted);
        }
      });
    }
  }, [user]);

  // Guardar (Local + Nube con debounce)
  useEffect(() => {
    pushCloudDataDebounced(user?.id, { tasks, categories, settings, sessionsCompleted });
  }, [tasks, categories, settings, sessionsCompleted, user?.id]);

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
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
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

            <div style={{ margin: "1rem 0", height: "1px", background: "var(--sage)", opacity: 0.2 }} />
            
            {user ? (
              <button className="nav-btn" onClick={() => supabase.auth.signOut()}>
                <User size={16} /> Cerrar Sesión
              </button>
            ) : (
              <button className="nav-btn" onClick={() => setShowAuthModal(true)}>
                <User size={16} /> Iniciar Sesión
              </button>
            )}
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


