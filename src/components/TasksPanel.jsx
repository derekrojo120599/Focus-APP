import React, { useState, useEffect } from "react";
import { Plus, Play, Timer, Check, X, Trash2, ListTodo } from "lucide-react";
import { todayISO, uid } from "../utils/helpers";
import { COLOR_PRESETS, EXTENSION_MINUTES } from "../utils/constants";

export default function TasksPanel({ tasks, setTasks, categories, setCategories, catById, activeTaskId, onStart, onGoToSession }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayISO());
  const [duration, setDuration] = useState(30);
  const [catId, setCatId] = useState(categories[0]?.id || "");
  const [priority, setPriority] = useState("media");
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
        id: uid(), title: title.trim(), date, duration: Number(duration) || 0, type: catId, priority, status: "pending",
        createdAt: Date.now(), startedAt: null, extensionsUsed: 0, notified30: false,
        phase: null, phaseSecondsLeft: 0, phaseTotalSeconds: 0, workedSeconds: 0, cyclesCompleted: 0, overtimeSeconds: 0, running: false,
      },
    ]);
    setTitle("");
    setDuration(30);
    setPriority("media");
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

  const priorityWeight = { alta: 3, media: 2, baja: 1 };

  const filtered = tasks
    .filter((t) => filter === "all" || t.type === filter || (filter === "alta" && t.priority === "alta"))
    .sort((a, b) => {
      if (a.status === "in_progress" && b.status !== "in_progress") return -1;
      if (b.status === "in_progress" && a.status !== "in_progress") return 1;
      const wA = priorityWeight[a.priority] || 0;
      const wB = priorityWeight[b.priority] || 0;
      if (wA !== wB) return wB - wA;
      return a.date < b.date ? 1 : -1;
    });

  return (
    <>
      <div className="card accent-peri">
        <span className="eyebrow" style={{ color: "var(--sage)" }}>nueva tarea</span>
        <div className="form-grid">
          <div>
            <label className="field-label">TÃ­tulo</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Redactar informe" onKeyDown={(e) => e.key === "Enter" && addTask()} />
          </div>
          <div>
            <label className="field-label">Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="field-label">DuraciÃ³n estimada (min)</label>
            <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
            <div>
              <label className="field-label">Tipo</label>
              <select value={catId} onChange={(e) => setCatId(e.target.value)}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Prioridad</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={addTask} style={{ alignSelf: 'flex-end', height: '36px' }}><Plus size={15} /> Añadir</button>
          </div>

        <div style={{ marginTop: 14 }}>
          {!showAddCat ? (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddCat(true)}><Plus size={12} /> Nueva categorÃ­a</button>
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
          <button className={`filter-chip ${filter === "alta" ? "active" : ""}`} onClick={() => setFilter("alta")} style={{ borderStyle: 'dashed' }}>Solo Altas</button>
          {categories.map((c) => (
            <button key={c.id} className={`filter-chip ${filter === c.id ? "active" : ""}`} onClick={() => setFilter(c.id)}>{c.name}</button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <ListTodo size={48} />
            <h3 style={{ margin: '8px 0 0 0', color: 'var(--cream)', fontSize: '1.1rem' }}>No hay tareas por aquÃ­</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>AÃ±adÃ­ una arriba pa' empezar a darle caÃ±a.</p>
          </div>
        )}

        {filtered.map((t) => {
          const cat = catById(t.type);
          const overdue = t.status === "pending" && t.date < todayISO();
          const isActive = t.status === "in_progress";
          const blockedStart = t.status === "pending" && !!activeTaskId;
          return (
            <div className={`task-row ${isActive ? "task-row-active" : ""}`} key={t.id}>
              <div className="task-bar" style={{ background: cat ? cat.color : "var(--sage)" }} />
              <div style={{ flex: 1 }}>
                <div className="task-title">{t.title}</div>
                <div className="task-meta">
                  {t.date} • {t.duration} min estimados
                  {t.extensionsUsed > 0 && <span className="mono" style={{ marginLeft: 4 }}>(+{t.extensionsUsed}x{EXTENSION_MINUTES}min)</span>}
                  {t.priority === 'alta' && <span className="status-tag" style={{ background: "rgba(255, 106, 71, 0.15)", color: "var(--clay)", marginLeft: 8 }}>ALTA</span>}
                  {t.priority === 'media' && <span className="status-tag" style={{ background: "rgba(255, 225, 79, 0.15)", color: "var(--highlight)", marginLeft: 8 }}>MEDIA</span>}
                  {t.priority === 'baja' && <span className="status-tag" style={{ background: "rgba(115, 160, 48, 0.15)", color: "var(--olive)", marginLeft: 8 }}>BAJA</span>}
                  {cat && <span className="cat-chip" style={{ background: cat.color + "22", color: cat.color, marginLeft: 8 }}>{cat.name}</span>}
                  {overdue && <span className="status-tag" style={{ background: "var(--clay-22)", color: "var(--clay)", marginLeft: 8 }}>vencida</span>}
                  {isActive && <span className="status-tag" style={{ background: "var(--highlight-22)", color: "var(--highlight)", marginLeft: 8 }}>en curso Â· {Math.round(t.workedSeconds / 60)}/{t.duration} min</span>}
                  {t.status === "completed" && <span className="status-tag" style={{ background: "var(--olive-22)", color: "var(--olive)", marginLeft: 8 }}>completada</span>}
                  {t.status === "missed" && <span className="status-tag" style={{ background: "var(--clay-22)", color: "var(--clay)", marginLeft: 8 }}>perdida</span>}
                </div>
              </div>
              <div className="task-actions">
                {t.status === "pending" && (
                  <button className="icon-btn" title={blockedStart ? "Ya hay una tarea en curso" : "Iniciar (reparte el tiempo en ciclos de pomodoro)"} disabled={blockedStart} onClick={() => onStart(t.id)}>
                    <Play size={14} />
                  </button>
                )}
                {isActive && (
                  <button className="icon-btn completed-active" title="Ver sesiÃ³n en curso" onClick={onGoToSession}>
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

