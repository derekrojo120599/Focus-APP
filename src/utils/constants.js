export const DEFAULT_CATEGORIES = [
  { id: "trabajo", name: "Trabajo", color: "#95C84F" },
  { id: "estudio", name: "Estudio", color: "#7BA07F" },
  { id: "personal", name: "Personal", color: "#FFE14F" },
  { id: "salud", name: "Salud", color: "#FF6A47" },
];

export const COLOR_PRESETS = ["#95C84F", "#7BA07F", "#FFE14F", "#FF6A47", "#C58AE0", "#9FB5C2", "#E8A08F", "#6FCCF0"];

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

export const MOOD_COLOR = { happy: "#95C84F", neutral: "#7BA07F", sad: "#FF6A47" };
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
  work: { label: "Enfoque", color: "#95C84F" },
  short: { label: "Descanso corto", color: "#7BA07F" },
  long: { label: "Descanso largo", color: "#FFE14F" },
  done: { label: "Tiempo estimado cumplido", color: "#FF6A47" },
};
