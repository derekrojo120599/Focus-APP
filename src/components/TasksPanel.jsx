import React, { useState, useEffect } from "react";
import { Plus, Play, Timer, Check, X, Trash2 } from "lucide-react";
import { todayISO, uid } from "../utils/helpers";
import { COLOR_PRESETS, EXTENSION_MINUTES } from "../utils/constants";

export default function TasksPanel({ tasks, setTasks, categories, setCategories, catById, activeTaskId, onStart, onGoToSession }) {
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
