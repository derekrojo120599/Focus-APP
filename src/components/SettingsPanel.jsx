import React from "react";
import { Settings, Moon, Sun, User, LogOut } from "lucide-react";
import { supabase } from "../utils/supabaseClient";

export default function SettingsPanel({ settings, setSettings, theme, setTheme, user, setShowAuthModal }) {
  return (
    <div className="panel">
      <h2 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: 10 }}>
        <Settings size={20} color="var(--sage)" /> Opciones del Sistema
      </h2>
      <p style={{ color: "var(--beige)", marginBottom: "2rem" }}>
        Personaliza tu refugio para trabajar cómodamente.
      </p>

      <section style={{ marginBottom: "2.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", color: "var(--olive)", marginBottom: "1rem" }}>Tiempos del Pomodoro (Minutos)</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--sage)", marginBottom: "1rem" }}>
          Estos tiempos también controlan cómo se dividen los ciclos automáticos de tus tareas en curso.
        </p>
        <div className="settings-grid">
          <div>
            <label className="field-label">Tiempo de Enfoque</label>
            <input 
              type="number" 
              min="1" 
              value={settings.work} 
              onChange={(e) => setSettings({ ...settings, work: Number(e.target.value) || 1 })} 
              style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--sage)", background: "var(--raised)", color: "var(--cream)" }}
            />
          </div>
          <div>
            <label className="field-label">Descanso Corto</label>
            <input 
              type="number" 
              min="1" 
              value={settings.short} 
              onChange={(e) => setSettings({ ...settings, short: Number(e.target.value) || 1 })} 
              style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--sage)", background: "var(--raised)", color: "var(--cream)" }}
            />
          </div>
          <div>
            <label className="field-label">Descanso Largo</label>
            <input 
              type="number" 
              min="1" 
              value={settings.long} 
              onChange={(e) => setSettings({ ...settings, long: Number(e.target.value) || 1 })} 
              style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--sage)", background: "var(--raised)", color: "var(--cream)" }}
            />
          </div>
          <div>
            <label className="field-label">Ciclos hasta Descanso Largo</label>
            <input 
              type="number" 
              min="1" 
              value={settings.longEvery} 
              onChange={(e) => setSettings({ ...settings, longEvery: Number(e.target.value) || 1 })} 
              style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--sage)", background: "var(--raised)", color: "var(--cream)" }}
            />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: "2.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", color: "var(--olive)", marginBottom: "1rem" }}>Apariencia</h3>
        <button 
          className="btn btn-primary" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.6rem 1.2rem" }}
        >
          {theme === 'dark' ? <><Sun size={18} /> Cambiar a Modo Claro</> : <><Moon size={18} /> Cambiar a Modo Oscuro</>}
        </button>
      </section>

      <section>
        <h3 style={{ fontSize: "1.1rem", color: "var(--olive)", marginBottom: "1rem" }}>Tu Cuenta y Nube</h3>
        <div style={{ background: "var(--raised)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--sage)" }}>
          {user ? (
            <div>
              <p style={{ margin: "0 0 1rem 0", color: "var(--cream)", display: "flex", alignItems: "center", gap: 8 }}>
                <User size={18} color="var(--olive)"/> Sesión iniciada como: <strong style={{ color: "var(--highlight)" }}>{user.email}</strong>
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--sage)", marginBottom: "1.5rem" }}>
                Tu progreso y tareas se están guardando y sincronizando con la nube automáticamente.
              </p>
              <button 
                className="btn" 
                onClick={() => supabase.auth.signOut()}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255, 106, 71, 0.15)", color: "var(--clay)", border: "1px solid rgba(255, 106, 71, 0.3)", padding: "0.5rem 1rem" }}
              >
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </div>
          ) : (
            <div>
              <p style={{ margin: "0 0 1rem 0", color: "var(--sage)" }}>
                No has iniciado sesión. Tus datos solo se están guardando localmente en este navegador.
              </p>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowAuthModal(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <User size={18} /> Iniciar Sesión o Registrarse
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
