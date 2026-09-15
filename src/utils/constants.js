export const DEFAULT_CATEGORIES = [
  { id: "trabajo", name: "Trabajo", color: "var(--olive)" },
  { id: "estudio", name: "Estudio", color: "var(--sage)" },
  { id: "personal", name: "Personal", color: "var(--highlight)" },
  { id: "salud", name: "Salud", color: "var(--clay)" },
];

export const COLOR_PRESETS = ["var(--olive)", "var(--sage)", "var(--highlight)", "var(--clay)", "#C58AE0", "#9FB5C2", "#E8A08F", "#6FCCF0"];

export const DEFAULT_SETTINGS = { work: 25, short: 5, long: 15, longEvery: 4 };

export const STORAGE_KEY = "focus-companion-data-v1";

export const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export const MAX_EXTENSIONS = 3;
export const EXTENSION_MINUTES = 15;
export const WARNING_SECONDS = 30 * 60;

export const STAGE_NAMES = [
  "Semilla", "Brote", "Retoño", "Arbusto", "Árbol joven",
  "Árbol floreciente", "Árbol en flor", "Árbol frondoso", "Árbol con frutos", "Árbol dorado",
  "Árbol luminoso", "Árbol resplandeciente", "Árbol ancestral", "Árbol sagrado", "Árbol celestial",
  "Árbol mítico", "Árbol legendario", "Árbol eterno", "Árbol cósmico", "Árbol del infinito",
  "Árbol de la eternidad",
];
export const MAX_LEVEL = 20;

export const MOOD_COLOR = { happy: "var(--olive)", neutral: "var(--sage)", sad: "var(--clay)" };
export const MOOD_LABEL = { happy: "contento", neutral: "estable", sad: "decaído" };

export const FOCUS_PHRASES = [
  "Mantén el enfoque, fluye con la tarea.",
  "Respira profundo y continúa.",
  "Un paso a la vez, sin prisa.",
  "Tu atención es tu superpoder.",
  "El progreso se construye ahora mismo.",
  "Concéntrate en lo esencial.",
  "Estás exactamente donde necesitas estar."
];

export const BREAK_PHRASES = [
  "Toma un vaso de agua, hidrátate.",
  "Estira tus músculos y relaja los hombros.",
  "Descansa la vista, mira a lo lejos.",
  "Respira, te lo has ganado.",
  "Descansa, tu mente también necesita recargar.",
  "Desconecta unos minutos y disfruta la pausa.",
  "Un breve respiro antes de volver con energía."
];

export const PHASE_META = {
  work: { label: "Enfoque", color: "var(--olive)" },
  short: { label: "Descanso corto", color: "var(--sage)" },
  long: { label: "Descanso largo", color: "var(--highlight)" },
  done: { label: "Tiempo estimado cumplido", color: "var(--clay)" },
};
