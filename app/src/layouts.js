// layouts.js — panel geometries as fractions of the cover (x, y, w, h), baseline-aligned
export const PANEL_DEFS = [
  { src: "samples/neon-woman.webp", role: "THE DRIVER", key: "driver" },
  { src: "samples/speedboat.webp", role: "THE GETAWAY", key: "getaway" },
  { src: "samples/sunset-car.webp", role: "THE RIDE", key: "ride" },
  { src: "samples/silver-fixer.webp", role: "THE FIXER", key: "fixer" },
  { src: "samples/street-racer.webp", role: "THE RACER", key: "racer" },
  { src: "samples/yacht-man.webp", role: "THE CAPTAIN", key: "captain" },
  { src: "samples/bodyguard.webp", role: "THE MUSCLE", key: "muscle" },
  { src: "samples/glamour-insider.webp", role: "THE INSIDER", key: "insider" },
  { src: "samples/garage-rider.webp", role: "THE RIDER", key: "rider" },
  { src: "samples/garage-rider-2.webp", role: "THE LOOKOUT", key: "lookout" },
];
// Ensemble: centre dominant, left column 4, right column 3, bottom row 2
export const ENSEMBLE_SLOTS = [
  { x: 0.315, y: 0.205, w: 0.37, h: 0.545 },   // centre driver
  { x: 0.035, y: 0.205, w: 0.26, h: 0.128 },   // getaway
  { x: 0.035, y: 0.343, w: 0.26, h: 0.128 },   // ride
  { x: 0.035, y: 0.481, w: 0.26, h: 0.128 },   // fixer
  { x: 0.035, y: 0.619, w: 0.26, h: 0.131 },   // racer
  { x: 0.705, y: 0.205, w: 0.26, h: 0.172 },   // captain
  { x: 0.705, y: 0.387, w: 0.26, h: 0.172 },   // muscle
  { x: 0.705, y: 0.569, w: 0.26, h: 0.181 },   // insider
  { x: 0.315, y: 0.760, w: 0.18, h: 0.105 },   // rider
  { x: 0.505, y: 0.760, w: 0.18, h: 0.105 },   // lookout
];
function grid(n, cols) {
  const rows = Math.ceil(n / cols), out = [], m = 0.04, g = 0.015;
  const w = (1 - m * 2 - g * (cols - 1)) / cols, h = (0.78 - g * (rows - 1)) / rows;
  for (let i = 0; i < n; i++) out.push({ x: m + (i % cols) * (w + g), y: 0.16 + Math.floor(i / cols) * (h + g), w, h });
  return out;
}
export const LAYOUTS = {
  ensemble: { id: "ensemble", label: "Ensemble Poster", slots: ENSEMBLE_SLOTS },
  hero: { id: "hero", label: "Solo Hero", slots: [{ x: 0.06, y: 0.15, w: 0.88, h: 0.72 }] },
  duo: { id: "duo", label: "Duo Split", slots: [{ x: 0.04, y: 0.16, w: 0.45, h: 0.68 }, { x: 0.51, y: 0.16, w: 0.45, h: 0.68 }] },
  trio: { id: "trio", label: "Trio Strip", slots: grid(3, 3) },
  quad: { id: "quad", label: "Quad Grid", slots: grid(4, 2) },
  six: { id: "six", label: "Six Panel Grid", slots: grid(6, 3) },
  magazine: { id: "magazine", label: "Magazine Cover", slots: [{ x: 0.05, y: 0.14, w: 0.58, h: 0.74 }, { x: 0.65, y: 0.14, w: 0.30, h: 0.36 }, { x: 0.65, y: 0.52, w: 0.30, h: 0.36 }] },
};
export const LAYOUT_ORDER = ["ensemble", "hero", "duo", "trio", "quad", "six", "magazine"];
