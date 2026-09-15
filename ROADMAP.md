# 🗺️ Roadmap - Refugio de Enfoque (Focus-APP)

## 🏗️ Estado Actual (Dónde quedamos)
- **Arquitectura Limpia**: El código espagueti de `App.jsx` fue refactorizado. Ahora usa componentes independientes en `src/components/` y utilidades puras en `src/utils/`.
- **Gamificación Viva**: La mascota (Companion) ahora respira, parpadea, reacciona a los clics y sigue el cursor del ratón de forma fluida.
- **Persistencia**: 100% Frontend. Todos los datos (tareas, ajustes, progreso) viven únicamente en el `localStorage` del navegador.

---

## 🚀 Siguientes Pasos (Backlog)

### 1. Notificaciones Inteligentes (Estilo Duolingo)
Para lograr que la app envíe alertas en segundo plano (incluso si está cerrada):
- [ ] **Integrar un Backend**: Configurar Firebase o Supabase para manejar usuarios y sesiones.
- [ ] **Migración de Datos**: Sincronizar el `localStorage` actual con la nueva base de datos en la nube.
- [ ] **Motor de Notificaciones (Cron Jobs)**: Crear funciones en el servidor que evalúen qué usuarios no han entrado en el día y disparen Web Push Notifications.
- [ ] **Service Workers**: Ampliar el PWA actual para registrar las VAPID keys y recibir notificaciones silenciosas.

### 2. Experiencia Nativa Móvil (Opcional pero recomendado)
- [ ] **Capacitor JS**: Envolver el proyecto web con Capacitor para poder compilarlo como aplicación nativa en iOS y Android, obteniendo acceso directo y sin bloqueos al centro de notificaciones del celular.

### 3. Mejoras Menores (Quick Wins)
- [ ] **Sonidos**: Agregar audio de *tick* sutil, alarmas de finalización y efectos al subir de nivel la mascota.
- [ ] **Refactorización de Hooks**: Extraer la máquina de estados del Pomodoro que quedó en `App.jsx` hacia un hook personalizado (ej. `usePomodoro.js`).