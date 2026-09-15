import React, { useState, useEffect, useRef } from "react";
import { Pause, Play, RotateCcw, Settings2, Timer } from "lucide-react";
import MotivationalQuote from "./MotivationalQuote";
import { fmtClock } from "../utils/helpers";
import TaskSessionCard from "./TaskSessionCard";

export default function PomodoroPanel({ settings, setSettings, sessionsCompleted, setSessionsCompleted, activeTask, onToggleRunning, onExtend, onComplete, onMiss, onCancel }) {
  const [mode, setMode] = useState("work");
  const [secondsLeft, setSecondsLeft] = useState(settings.work * 60);
  const [running, setRunning] = useState(false);
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
        
        <div className="empty-state" style={{ marginTop: '24px' }}>
          <Timer size={48} />
          <h3 style={{ margin: '8px 0 0 0', color: 'var(--cream)', fontSize: '1.1rem' }}>Sin tarea vinculada</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Inicia una desde la pestaña <strong>Tareas</strong> para arrancar el Pomodoro.</p>
        </div>
  
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

        <div className="timer-controls" style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={() => setRunning((r) => !r)}>
            {running ? <Pause size={15} /> : <Play size={15} />} {running ? "Pausar" : "Iniciar"}
          </button>
          <button className="btn btn-ghost" onClick={() => { setRunning(false); setSecondsLeft(durationsMin[mode] * 60); }}>
            <RotateCcw size={15} /> Reiniciar
          </button>
        </div>

        <MotivationalQuote mode={mode} running={running} />

        <div className="stat-row" style={{ marginTop: 22 }}>
          <div className="stat"><span className="stat-num">{sessionsCompleted}</span><span className="stat-label">sesiones de enfoque completadas</span></div>
        </div>
      </div>
    </div>
  );
}

