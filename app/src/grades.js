// grades.js — colour grades for VICE COVER STUDIO (all original, fictional places)
export const GRADES = {
  sunset: {
    id: "sunset", label: "Vice Sunset",
    sky: ["#1b0f2e", "#3d1440", "#7a1e52", "#c93a5e", "#f2764f", "#ffb35c", "#ffe29a"],
    sun: "#ffd98a", glow: "rgba(255,150,80,0.55)",
    shadowTone: "rgba(20,40,90,0.18)", highlightTone: "rgba(255,170,90,0.16)",
    accent: "#ff5e8a", chrome: ["#fff3b0", "#ffb347", "#ff5e7a", "#c22ed1"],
  },
  neon: {
    id: "neon", label: "Neon Night",
    sky: ["#050514", "#0d1033", "#1d1b5e", "#4b1e7a", "#8a2be2", "#ff2ea6", "#37e0ff"],
    sun: "#ff7ad9", glow: "rgba(255,46,166,0.45)",
    shadowTone: "rgba(0,60,90,0.22)", highlightTone: "rgba(80,220,255,0.14)",
    accent: "#37e0ff", chrome: ["#d8fbff", "#37e0ff", "#7a5cff", "#ff2ea6"],
  },
  golden: {
    id: "golden", label: "Golden Hour",
    sky: ["#241207", "#4a2408", "#8a4b12", "#c97e22", "#f2a93b", "#ffd977", "#fff3c4"],
    sun: "#ffe9a8", glow: "rgba(255,190,80,0.55)",
    shadowTone: "rgba(60,30,10,0.20)", highlightTone: "rgba(255,210,110,0.18)",
    accent: "#ffb347", chrome: ["#fff8d0", "#ffd166", "#f28c28", "#b3541e"],
  },
  ocean: {
    id: "ocean", label: "Ocean Drive",
    sky: ["#041e2e", "#073a52", "#0b5e7a", "#1290a8", "#3fc1b0", "#8fe3c0", "#e8ffd8"],
    sun: "#d8ffe8", glow: "rgba(90,220,190,0.45)",
    shadowTone: "rgba(0,40,60,0.20)", highlightTone: "rgba(140,255,220,0.14)",
    accent: "#3fc1b0", chrome: ["#eafff2", "#8fe3c0", "#1290a8", "#0b3a5e"],
  },
};
export const GRADE_ORDER = ["sunset", "neon", "golden", "ocean"];
export function getGrade(id) { return GRADES[id] || GRADES.sunset; }
