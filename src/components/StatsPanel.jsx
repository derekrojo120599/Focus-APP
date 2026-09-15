import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { monthKey, monthLabel } from "../utils/helpers";

export default function StatsPanel({ tasks, categories }) {
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
        <span className="eyebrow" style={{ color: "var(--highlight)" }}>progreso mensual</span>
        {monthly.length === 0 ? (
          <div className="empty">Aún no hay tareas completadas o perdidas para graficar.</div>
        ) : (
          <div style={{ width: "100%", height: 300, marginTop: 12 }}>
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--sage)" vertical={false} />
                <XAxis dataKey="mes" stroke="#DED9B8" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#DED9B8" fontSize={12} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--sage)", borderRadius: 10, fontSize: 12 }} cursor={{ fill: "var(--raised)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="completadas" fill="#95C84F" radius={[6, 6, 0, 0]} name="Completadas" maxBarSize={40} />
                <Bar dataKey="perdidas" fill="#FF6A47" radius={[6, 6, 0, 0]} name="Perdidas" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="card accent-moss">
        <span className="eyebrow" style={{ color: "var(--highlight)" }}>por categoría</span>
        {byCategory.length === 0 && <div className="empty">Sin datos todavía.</div>}
        {byCategory.map((c) => {
          const total = c.completadas + c.perdidas;
          const pct = total ? Math.round((c.completadas / total) * 100) : 0;
          return (
            <div key={c.id} className="cat-row">
              <div className="cat-row-head">
                <span className="cat-chip" style={{ background: c.color + "22", color: c.color }}>{c.name}</span>
                <span className="mono cat-row-meta">{c.completadas} completadas Â· {c.perdidas} perdidas Â· {pct}%</span>
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
