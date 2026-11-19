// layouts.js — collage geometry for VICE COVER STUDIO.
// Each layout is a set of panels. Panel points are fractions of the
// canvas (0..1) so the same layout works at every export size.
// "divider" names the stroke treatment render.js gives panel edges.
// Panels list their corner points clockwise from the top-left.

export const DIVIDER_STYLES = [
  { id: 'neon', name: 'Neon Edge' },
  { id: 'chrome', name: 'Chrome Line' },
  { id: 'shadow', name: 'Hard Shadow' },
  { id: 'clean', name: 'Clean Cut' },
];

export const LAYOUTS = [
  {
    id: 'trio-slash', name: 'Trio Slash', divider: 'neon',
    panels: [
      { points: [[0, 0], [0.42, 0], [0.30, 1], [0, 1]], motif: 'palm' },
      { points: [[0.42, 0], [0.74, 0], [0.62, 1], [0.30, 1]], motif: 'sun' },
      { points: [[0.74, 0], [1, 0], [1, 1], [0.62, 1]], motif: 'wave' },
    ],
  },
  {
    id: 'quad-cross', name: 'Quad Cross', divider: 'chrome',
    panels: [
      { points: [[0, 0], [0.55, 0], [0.48, 0.52], [0, 0.58]], motif: 'star' },
      { points: [[0.55, 0], [1, 0], [1, 0.55], [0.48, 0.52]], motif: 'palm' },
      { points: [[0, 0.58], [0.48, 0.52], [0.58, 1], [0, 1]], motif: 'wave' },
      { points: [[0.48, 0.52], [1, 0.55], [1, 1], [0.58, 1]], motif: 'sun' },
    ],
  },
  {
    id: 'hero-side', name: 'Hero + Side Stories', divider: 'neon',
    panels: [
      { points: [[0, 0], [0.62, 0], [0.55, 1], [0, 1]], motif: 'palm' },
      { points: [[0.62, 0], [1, 0], [1, 0.48], [0.585, 0.48]], motif: 'star' },
      { points: [[0.585, 0.48], [1, 0.48], [1, 1], [0.55, 1]], motif: 'wave' },
    ],
  },
  {
    id: 'diagonal-duo', name: 'Diagonal Duo', divider: 'shadow',
    panels: [
      { points: [[0, 0], [1, 0], [1, 0.30], [0, 0.72]], motif: 'sun' },
      { points: [[0, 0.72], [1, 0.30], [1, 1], [0, 1]], motif: 'palm' },
    ],
  },
  {
    id: 'five-star', name: 'Five Star Spread', divider: 'chrome',
    panels: [
      { points: [[0, 0], [0.38, 0], [0.34, 0.45], [0, 0.5]], motif: 'star' },
      { points: [[0.38, 0], [1, 0], [1, 0.42], [0.34, 0.45]], motif: 'palm' },
      { points: [[0, 0.5], [0.34, 0.45], [0.40, 1], [0, 1]], motif: 'wave' },
      { points: [[0.34, 0.45], [1, 0.42], [0.72, 1], [0.40, 1]], motif: 'sun' },
      { points: [[1, 0.42], [1, 1], [0.72, 1]], motif: 'star' },
    ],
  },
  {
    id: 'solo-strip', name: 'Solo + Strip', divider: 'clean',
    panels: [
      { points: [[0, 0], [1, 0], [1, 0.78], [0, 0.78]], motif: 'palm' },
      { points: [[0, 0.78], [0.5, 0.78], [0.5, 1], [0, 1]], motif: 'wave' },
      { points: [[0.5, 0.78], [1, 0.78], [1, 1], [0.5, 1]], motif: 'star' },
    ],
  },
];

export function getLayout(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

// Axis-aligned bounds of a panel, in fractions — handy for decor
// placement and for focal-point maths in the renderer.
export function panelBounds(panel) {
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (const [x, y] of panel.points) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}
