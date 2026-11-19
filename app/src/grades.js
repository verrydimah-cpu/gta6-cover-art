// grades.js — the four colour grades of Vice Cover Studio.
//
// A grade is applied per panel inside the renderer: first a CSS-style
// filter string (saturation / contrast / brightness / sepia / hue),
// then a duotone wash — the shadow colour multiplied into the darks
// and the highlight colour screened into the lights — so every photo,
// whatever it started as, lands in the same printed-poster world.
// `punch` (per panel, 0.4..1.8) scales how far the filter travels
// from the neutral photo toward the grade's full look.

export const GRADES = [
  {
    id: 'vice-sunset',
    name: 'Vice Sunset',
    blurb: 'Violet shadows, coral light, cream frame, pink glow',
    sat: 1.46, con: 1.13, bri: 1.02, sepia: 0.08, hue: -4,
    shadow: [62, 30, 98],
    highlight: [255, 148, 108],
    tint: 0.34,
    frame: '#fff3d6',
    glow: '#ff5fa2',
    sky: ['#2b1055', '#7597de', '#ff7e5f', '#feb47b'],
  },
  {
    id: 'neon-night',
    name: 'Neon Night',
    blurb: 'Cyan and magenta over a midnight-blue frame',
    sat: 1.32, con: 1.18, bri: 0.98, sepia: 0.02, hue: -8,
    shadow: [8, 42, 78],
    highlight: [255, 92, 205],
    tint: 0.3,
    frame: '#0d1330',
    glow: '#22d3ee',
    sky: ['#020617', '#0e7490', '#a21caf', '#f0abfc'],
  },
  {
    id: 'clean-daylight',
    name: 'Clean Daylight',
    blurb: 'Honest colour, gentle contrast, white frame',
    sat: 1.08, con: 1.04, bri: 1.05, sepia: 0, hue: 0,
    shadow: [52, 58, 66],
    highlight: [255, 244, 224],
    tint: 0.1,
    frame: '#ffffff',
    glow: null,
    sky: ['#7dd3fc', '#bae6fd', '#fef9c3', '#ffffff'],
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    blurb: 'Teal shadows, amber light, a late-afternoon film still',
    sat: 1.18, con: 1.08, bri: 1.03, sepia: 0.16, hue: -2,
    shadow: [22, 70, 80],
    highlight: [255, 188, 108],
    tint: 0.3,
    frame: '#ffe9c4',
    glow: '#f59e0b',
    sky: ['#134e4a', '#2dd4bf', '#fbbf24', '#fde68a'],
  },
];

export function gradeById(id) {
  return GRADES.find((grade) => grade.id === id) || GRADES[0];
}

// The canvas filter string for a grade at a given punch. Punch 1 is
// the grade as designed; below 1 the photo keeps more of itself,
// above 1 the grade leans in harder. Sepia is not scaled past its
// designed value — extra sepia turns skin to cardboard.
export function filterFor(grade, punch) {
  const lerp = (from, to) => from + (to - from) * punch;
  const sat = Math.max(0.05, lerp(1, grade.sat));
  const con = Math.max(0.05, lerp(1, grade.con));
  const bri = Math.max(0.05, lerp(1, grade.bri));
  const sepia = grade.sepia * Math.min(1, punch);
  const hue = grade.hue * punch;
  return `saturate(${sat.toFixed(3)}) contrast(${con.toFixed(3)}) `
    + `brightness(${bri.toFixed(3)}) sepia(${sepia.toFixed(3)}) `
    + `hue-rotate(${hue.toFixed(1)}deg)`;
}

// Whether the grade's frame colour is a dark one — handy when a
// caller needs to pick a contrasting edge ink for the sheet border.
export function frameIsDark(grade) {
  if (!grade.frame) return false;
  const hex = grade.frame.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 110;
}

// 'rgb(r, g, b)' for a grade colour triple, with optional alpha.
export function rgb(triple, alpha) {
  if (alpha === undefined) return `rgb(${triple[0]}, ${triple[1]}, ${triple[2]})`;
  return `rgba(${triple[0]}, ${triple[1]}, ${triple[2]}, ${alpha})`;
}
