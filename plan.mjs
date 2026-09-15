import fs from 'fs';

// 1. UPDATE index.css
let css = fs.readFileSync('src/index.css', 'utf8');

// Contrast adjustments
css = css.replace(/--sage: #7BA07F;/, '--sage: #8CAE8F;'); // Lighter sage for dark mode
css = css.replace(/--beige: #DED9B8;/, '--beige: #EBE7CD;'); // Lighter beige for dark mode
css = css.replace(/--sage: #8EA891;/, '--sage: #6B886E;'); // Darker sage for light mode
css = css.replace(/--beige: #5B7A65;/, '--beige: #3C5243;'); // Darker beige for light mode

// Add mobile button touch targets and companion card collapse to media query
const mobileCSS = `
  /* UI/UX Mobile Enhancements */
  .btn, .icon-btn, .nav-btn { min-height: 44px; }
  .icon-btn { min-width: 44px; display: flex; align-items: center; justify-content: center; }
  
  .companion-card {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    gap: 16px;
  }
  .companion-card .eyebrow { width: 100%; margin-bottom: 0; }
  .companion-card svg { width: 60px; height: 60px; }
  .companion-card .stage-name { font-size: 1rem; margin: 0; text-align: left; flex: 1; }
  .companion-card .evolve-track-wrap { width: 100%; margin-top: 8px; }
  
  .settings-grid { grid-template-columns: 1fr; gap: 16px; }
  .timer-controls { flex-wrap: wrap; gap: 8px; }
`;

css = css.replace(/@media \(max-width: 900px\) \{/, `@media (max-width: 900px) {\n${mobileCSS}`);

// Add Ring transition and companion idle animation
const animations = `
/* Smooth SVG Ring Transition */
.ring-progress {
  transition: stroke-dashoffset 1s linear, stroke 0.3s ease;
}

/* Companion Idle Animation */
@keyframes companionIdle {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}
.companion-svg {
  animation: companionIdle 4s ease-in-out infinite;
}

/* Fade Out Fullscreen Text */
@keyframes fadeOutHint {
  0%, 70% { opacity: 0.6; }
  100% { opacity: 0; pointer-events: none; }
}
.fullscreen-hint {
  animation: fadeOutHint 4s forwards;
}

/* Spacing Scale normalization */
.card { padding: 24px; gap: 16px; }
.form-grid { gap: 16px; }
.task-row { padding: 16px; margin-bottom: 8px; }
`;

css += animations;
fs.writeFileSync('src/index.css', css, 'utf8');

// 2. UPDATE PomodoroPanel.jsx
let pomo = fs.readFileSync('src/components/PomodoroPanel.jsx', 'utf8');
pomo = pomo.replace(
  /<div className="hint-note">.*?<\/div>/s,
  `
        <div className="empty-state" style={{ marginTop: '24px' }}>
          <Timer size={48} />
          <h3 style={{ margin: '8px 0 0 0', color: 'var(--cream)', fontSize: '1.1rem' }}>Sin tarea vinculada</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Inicia una desde la pestaña <strong>Tareas</strong> para arrancar el Pomodoro.</p>
        </div>
  `
);
pomo = pomo.replace(/<div className="timer-controls">/g, '<div className="timer-controls" style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>');
fs.writeFileSync('src/components/PomodoroPanel.jsx', pomo, 'utf8');

// 3. UPDATE TaskSessionCard.jsx
let tsc = fs.readFileSync('src/components/TaskSessionCard.jsx', 'utf8');
tsc = tsc.replace(
  /<svg className="ring" viewBox="0 0 200 200">/,
  '<svg className="ring" viewBox="0 0 200 200" style={{ width: "100%", maxWidth: "250px", height: "auto", aspectRatio: "1/1" }}>'
);
// Replace the old text if it's there
tsc = tsc.replace(/<MotivationalQuote mode=\{task\.phase\} running=\{task\.running\} \/>/, 
  `<MotivationalQuote mode={task.phase} running={task.running} />
        <div className="fullscreen-hint" style={{ textAlign: "center", fontSize: "11px", color: "var(--beige)", marginTop: "16px", opacity: 0.6 }}>
          (En PC, pulsa F11 para pantalla completa)
        </div>`
);
// Ensure button wrap
tsc = tsc.replace(/<div className="timer-controls" style=\{\{ marginTop: 10 \}\}>/, '<div className="timer-controls" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>');
fs.writeFileSync('src/components/TaskSessionCard.jsx', tsc, 'utf8');

// 4. UPDATE Companion.jsx
let comp = fs.readFileSync('src/components/Companion.jsx', 'utf8');
comp = comp.replace(/<svg\s+width="120"/, '<svg className="companion-svg" width="120"');
fs.writeFileSync('src/components/Companion.jsx', comp, 'utf8');

console.log('done');
