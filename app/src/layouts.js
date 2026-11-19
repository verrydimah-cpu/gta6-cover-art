// Panel geometry for Vice Cover Studio.
// Each layout returns panels in unit space; render.js scales them to
// the export size. A panel carries its polygon, a photo slot index
// and a focus hint, so a wide hero panel crops faces kindly while a
// narrow strip panel leans into its subject instead of its edges.

function panel(poly, slot, focusX, focusY, zoom) {
  return { poly, slot, focusX, focusY, zoom: zoom || 1 };
}

export const LAYOUT_ORDER = [
  'hero-collage',
  'hero-filmstrip',
  'magazine-split',
  'triptych',
  'quad-grid',
  'duo-slash',
];

export const LAYOUT_LABELS = {
  'hero-collage': 'Hero Collage',
  'hero-filmstrip': 'Hero Filmstrip',
  'magazine-split': 'Magazine Split',
  'triptych': 'Triptych',
  'quad-grid': 'Quad Grid',
  'duo-slash': 'Duo Slash',
};

const BUILDERS = {
  'hero-collage': () => [
    panel([[0, 0], [0.62, 0], [0.52, 0.58], [0, 0.66]], 0, 0.5, 0.35, 1.05),
    panel([[0.62, 0], [1, 0], [1, 0.44], [0.52, 0.58]], 1, 0.5, 0.4, 1),
    panel([[0, 0.66], [0.52, 0.58], [0.58, 1], [0, 1]], 2, 0.5, 0.45, 1),
    panel([[0.52, 0.58], [1, 0.44], [1, 1], [0.58, 1]], 3, 0.5, 0.4, 1.1),
  ],
  'hero-filmstrip': () => [
    panel([[0, 0], [1, 0], [1, 0.52], [0, 0.6]], 0, 0.5, 0.35, 1.05),
    panel([[0, 0.6], [0.34, 0.55], [0.34, 1], [0, 1]], 1, 0.5, 0.45, 1),
    panel([[0.34, 0.55], [0.67, 0.5], [0.67, 1], [0.34, 1]], 2, 0.5, 0.4, 1),
    panel([[0.67, 0.5], [1, 0.52], [1, 1], [0.67, 1]], 3, 0.5, 0.45, 1),
  ],
  'magazine-split': () => [
    panel([[0, 0], [0.56, 0], [0.48, 1], [0, 1]], 0, 0.45, 0.4, 1.05),
    panel([[0.56, 0], [1, 0], [1, 0.52], [0.51, 0.52]], 1, 0.5, 0.4, 1),
    panel([[0.51, 0.52], [1, 0.52], [1, 1], [0.48, 1]], 2, 0.5, 0.45, 1),
  ],
  'triptych': () => [
    panel([[0, 0], [0.36, 0], [0.31, 1], [0, 1]], 0, 0.5, 0.4, 1),
    panel([[0.36, 0], [0.68, 0], [0.64, 1], [0.31, 1]], 1, 0.5, 0.4, 1.05),
    panel([[0.68, 0], [1, 0], [1, 1], [0.64, 1]], 2, 0.5, 0.4, 1),
  ],
  'quad-grid': () => [
    panel([[0, 0], [0.52, 0], [0.5, 0.5], [0, 0.54]], 0, 0.5, 0.4, 1),
    panel([[0.52, 0], [1, 0], [1, 0.46], [0.5, 0.5]], 1, 0.5, 0.4, 1),
    panel([[0, 0.54], [0.5, 0.5], [0.52, 1], [0, 1]], 2, 0.5, 0.45, 1),
    panel([[0.5, 0.5], [1, 0.46], [1, 1], [0.52, 1]], 3, 0.5, 0.45, 1),
  ],
  'duo-slash': () => [
    panel([[0, 0], [1, 0], [0.42, 1], [0, 1]], 0, 0.45, 0.4, 1.05),
    panel([[1, 0], [1, 1], [0.42, 1]], 1, 0.55, 0.45, 1),
  ],
};

export function getLayout(id) {
  const build = BUILDERS[id] || BUILDERS['hero-collage'];
  return build();
}

export function panelBounds(p) {
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (const [x, y] of p.poly) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}
