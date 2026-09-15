import React from "react";
import { Pause, Play, AlarmClock, Plus, Check, X, Ban } from "lucide-react";
import MotivationalQuote from "./MotivationalQuote";
import { WARNING_SECONDS, PHASE_META, EXTENSION_MINUTES, MAX_EXTENSIONS } from "../utils/constants";
import { fmtClock } from "../utils/helpers";

export default function TaskSessionCard({ task, onToggleRunning, onExtend, onComplete, onMiss, onCancel }) {
  const totalSeconds = task.duration * 60;
  const remainingTotal = Math.max(0, totalSeconds - task.workedSeconds);
  const overallPct = totalSeconds ? Math.min(100, (task.workedSeconds / totalSeconds) * 100) : 0;
  const nearEnd = remainingTotal <= WARNING_SECONDS && remainingTotal > 0;
  const meta = PHASE_META[task.phase] || PHASE_META.done;
  const phasePct = task.phaseTotalSeconds ? ((task.phaseTotalSeconds - task.phaseSecondsLeft) / task.phaseTotalSeconds) * 100 : 100;
  const extensionsLeft = MAX_EXTENSIONS - task.extensionsUsed;

  return (
    <div className="card accent-amber">
      <span className="eyebrow">tarea en curso Â· ciclo {task.cyclesCompleted + 1}</span>
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
            <div className="progress-fill" style={{ width: `${overallPct}%`, background: "var(--olive)" }} />
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
            <AlarmClock size={14} /> Tiempo estimado cumplido â€” agrega tiempo o cierra la tarea
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

        <MotivationalQuote mode={task.phase} running={task.running} />
      </div>
    </div>
  );
}
