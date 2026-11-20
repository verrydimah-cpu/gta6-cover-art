// grades.js — photographic colour grades for VICE COVER STUDIO.
// Each grade is a small, honest recipe: a multi-stop sky that shows
// through wherever a panel has no photo, a soft sun glow, the photo
// treatment (saturation, contrast, brightness and a warm sepia kiss),
// split toning for shadows and highlights, and the film finish values
// the renderer finishes with. The numbers are kept gentle on purpose:
// skin and paintwork should stay believable, never plastic.

export const GRADES = [
  {
    id: 'vice-sunset',
    label: 'Vice Sunset',
    blurb: 'Peach horizon melting up through coral into deep violet.',
    sky: [
      [0, '#2b1055'],
      [0.34, '#7b2d8b'],
      [0.58, '#c73e7e'],
      [0.78, '#f2765c'],
      [0.92, '#ffb35c'],
      [1, '#ffd98a'],
    ],
    sun: { x: 0.72, y: 0.66, r: 0.55, color: '255,170,90', alpha: 0.5 },
    photo: { sat: 1.13, con: 1.07, bright: 1.02, warm: 0.16 },
    shadowTint: '43,16,85',
    highlightTint: '255,179,92',
    tintStrength: 0.16,
    vignette: 0.34,
    grain: 0.055,
  },
  {
    id: 'neon-night',
    label: 'Neon Night',
    blurb: 'Midnight blue depths lit by magenta and cyan signage.',
    sky: [
      [0, '#050914'],
      [0.4, '#0d1b3e'],
      [0.68, '#232a6e'],
      [0.88, '#7a2a8f'],
      [1, '#c73e7e'],
    ],
    sun: { x: 0.24, y: 0.3, r: 0.5, color: '64,200,255', alpha: 0.34 },
    photo: { sat: 1.2, con: 1.12, bright: 0.97, warm: 0.04 },
    shadowTint: '8,16,60',
    highlightTint: '255,80,180',
    tintStrength: 0.2,
    vignette: 0.46,
    grain: 0.07,
  },
  {
    id: 'golden-hour',
    label: 'Golden Hour',
    blurb: 'Low amber light, honeyed highlights, soft green shadows.',
    sky: [
      [0, '#3a2a55'],
      [0.36, '#8a4a6e'],
      [0.62, '#d97a4e'],
      [0.84, '#ffb35c'],
      [1, '#ffe3a1'],
    ],
    sun: { x: 0.5, y: 0.58, r: 0.62, color: '255,190,100', alpha: 0.46 },
    photo: { sat: 1.08, con: 1.04, bright: 1.05, warm: 0.26 },
    shadowTint: '40,50,30',
    highlightTint: '255,210,120',
    tintStrength: 0.14,
    vignette: 0.28,
    grain: 0.045,
  },
  {
    id: 'ocean-drive',
    label: 'Ocean Drive',
    blurb: 'Bright pastel daylight: aqua sky, pink stucco, clean chrome.',
    sky: [
      [0, '#7fd4e8'],
      [0.42, '#a8e0dd'],
      [0.7, '#f6d9c8'],
      [0.9, '#ffb8a8'],
      [1, '#ff9e8a'],
    ],
    sun: { x: 0.82, y: 0.2, r: 0.48, color: '255,240,200', alpha: 0.4 },
    photo: { sat: 1.1, con: 1.03, bright: 1.06, warm: 0.08 },
    shadowTint: '20,70,90',
    highlightTint: '255,200,170',
    tintStrength: 0.11,
    vignette: 0.2,
    grain: 0.035,
  },
];

export function gradeById(id) {
  return GRADES.find((entry) => entry.id === id) || GRADES[0];
}

// Build the CSS-style filter string the canvas applies while drawing
// a photo. Punch is a per-panel multiplier the user controls, centred
// on 1 so the grade itself stays the reference look.
export function photoFilter(grade, punch) {
  const p = grade.photo;
  const sat = Math.max(0.6, p.sat * (0.72 + 0.28 * punch));
  const con = Math.max(0.7, p.con * (0.8 + 0.2 * punch));
  return (
    'saturate(' + sat.toFixed(3) + ') ' +
    'contrast(' + con.toFixed(3) + ') ' +
    'brightness(' + p.bright.toFixed(3) + ') ' +
    'sepia(' + p.warm.toFixed(3) + ')'
  );
}
