// VICE COVER STUDIO — colour grades.
//
// A grade is a complete photographic treatment, not a filter slapped on at
// the end. Each one carries:
//   sky      — multi-stop gradient stops for backdrops and gradient panels,
//   backdrop — the poster field colour behind the panels,
//   sun      — position and colour of the soft glow screened across panels,
//   tint     — a translucent wash laid over every photo panel,
//   split    — split-toning colours for shadows and highlights,
//   warmth   — per-panel saturation/contrast nudge baked into the punch,
//   grain    — film grain strength, vignette — corner falloff strength.
//
// The renderer applies the same grade to the live preview and to every
// export, so what you see while editing is exactly what ships.

export const GRADES = [
  {
    id: 'vice-sunset',
    name: 'Vice Sunset',
    sky: ['#2b1030', '#6d1f4e', '#c73e63', '#f2762e', '#ffc46b'],
    backdrop: '#241118',
    backdropEdge: '#12070d',
    sun: { x: 0.5, y: 0.34, color: '255,176,102', strength: 0.5 },
    tint: 'rgba(255,120,70,0.07)',
    split: { shadow: 'rgba(40,16,80,0.16)', highlight: 'rgba(255,170,90,0.10)' },
    sat: 1.06,
    con: 1.04,
    grain: 0.05,
    vignette: 0.32,
  },
  {
    id: 'neon-night',
    name: 'Neon Night',
    sky: ['#050914', '#0d1b3d', '#173a6e', '#7a1e5e', '#e83e8c'],
    backdrop: '#0a0d1d',
    backdropEdge: '#04050c',
    sun: { x: 0.72, y: 0.26, color: '120,200,255', strength: 0.34 },
    tint: 'rgba(60,90,255,0.06)',
    split: { shadow: 'rgba(8,10,60,0.22)', highlight: 'rgba(255,80,180,0.08)' },
    sat: 1.12,
    con: 1.07,
    grain: 0.055,
    vignette: 0.4,
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    sky: ['#33190b', '#7a3a14', '#c97a24', '#f2a93b', '#ffe3a1'],
    backdrop: '#221207',
    backdropEdge: '#100702',
    sun: { x: 0.34, y: 0.3, color: '255,205,120', strength: 0.55 },
    tint: 'rgba(255,170,60,0.08)',
    split: { shadow: 'rgba(70,30,8,0.16)', highlight: 'rgba(255,210,130,0.12)' },
    sat: 1.04,
    con: 1.03,
    grain: 0.045,
    vignette: 0.3,
  },
  {
    id: 'ocean-drive',
    name: 'Ocean Drive',
    sky: ['#07263b', '#0d4a63', '#17808c', '#e8875a', '#ffd9a0'],
    backdrop: '#0b1c22',
    backdropEdge: '#050f13',
    sun: { x: 0.6, y: 0.3, color: '255,190,130', strength: 0.42 },
    tint: 'rgba(40,180,190,0.06)',
    split: { shadow: 'rgba(6,40,60,0.18)', highlight: 'rgba(255,180,120,0.09)' },
    sat: 1.08,
    con: 1.05,
    grain: 0.05,
    vignette: 0.34,
  },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}
