// layouts.js — the six panel layouts of Vice Cover Studio.
//
// Each layout is a set of polygons in normalised cover coordinates
// (0..1 on both axes, y down). Panels lean on diagonals so the dividers
// drawn between them read as poster collage rather than a spreadsheet
// grid. The renderer clips each polygon, paints the panel's photo (or
// its procedural backdrop) inside, then strokes the outline with the
// chosen divider style.

const P = (x, y) => [x, y];

export const LAYOUTS = {
  hero: {
    id: 'hero',
    name: 'Hero Collage',
    panels: [
      [P(0, 0), P(0.62, 0), P(0.5, 1), P(0, 1)],
      [P(0.62, 0), P(1, 0), P(1, 0.34), P(0.56, 0.4)],
      [P(0.56, 0.4), P(1, 0.34), P(1, 0.64), P(0.53, 0.68)],
      [P(0.53, 0.68), P(1, 0.64), P(1, 1), P(0.5, 1)],
      [P(0, 0), P(0.62, 0), P(0.6, 0.1), P(0, 0.08)],
    ],
  },
  trio: {
    id: 'trio',
    name: 'Diagonal Trio',
    panels: [
      [P(0, 0), P(0.44, 0), P(0.3, 1), P(0, 1)],
      [P(0.44, 0), P(0.74, 0), P(0.62, 1), P(0.3, 1)],
      [P(0.74, 0), P(1, 0), P(1, 1), P(0.62, 1)],
    ],
  },
  grid: {
    id: 'grid',
    name: 'Grid Six',
    panels: [
      [P(0, 0), P(0.5, 0), P(0.5, 0.5), P(0, 0.5)],
      [P(0.5, 0), P(1, 0), P(1, 0.5), P(0.5, 0.5)],
      [P(0, 0.5), P(0.5, 0.5), P(0.5, 0.76), P(0, 0.76)],
      [P(0.5, 0.5), P(1, 0.5), P(1, 0.76), P(0.5, 0.76)],
      [P(0, 0.76), P(0.5, 0.76), P(0.5, 1), P(0, 1)],
      [P(0.5, 0.76), P(1, 0.76), P(1, 1), P(0.5, 1)],
    ],
  },
  spotlight: {
    id: 'spotlight',
    name: 'Spotlight',
    panels: [
      [P(0.1, 0), P(0.9, 0), P(1, 1), P(0, 1)],
      [P(0, 0), P(0.1, 0), P(0, 1)],
      [P(0.9, 0), P(1, 0), P(1, 1)],
    ],
  },
  filmstrip: {
    id: 'filmstrip',
    name: 'Hero + Filmstrip',
    panels: [
      [P(0, 0), P(1, 0), P(1, 0.66), P(0, 0.66)],
      [P(0, 0.66), P(0.25, 0.66), P(0.25, 1), P(0, 1)],
      [P(0.25, 0.66), P(0.5, 0.66), P(0.5, 1), P(0.25, 1)],
      [P(0.5, 0.66), P(0.75, 0.66), P(0.75, 1), P(0.5, 1)],
      [P(0.75, 0.66), P(1, 0.66), P(1, 1), P(0.75, 1)],
    ],
  },
  magazine: {
    id: 'magazine',
    name: 'Magazine Split',
    panels: [
      [P(0, 0), P(0.58, 0), P(0.52, 1), P(0, 1)],
      [P(0.58, 0), P(1, 0), P(1, 1), P(0.52, 1)],
    ],
  },
};

export const LAYOUT_ORDER = ['hero', 'trio', 'grid', 'spotlight', 'filmstrip', 'magazine'];

// Polygon area in normalised units — auto-arrange deals the biggest
// photos into the biggest panels.
export function panelArea(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2);
}

export function panelBBox(poly) {
  let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
  for (const [x, y] of poly) {
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}

// Point-in-polygon hit test, used when the editor canvas is clicked to
// select a panel.
export function panelAt(layout, nx, ny) {
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const poly = layout.panels[i];
    let inside = false;
    for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
      const [xa, ya] = poly[a];
      const [xb, yb] = poly[b];
      if ((ya > ny) !== (yb > ny) && nx < ((xb - xa) * (ny - ya)) / (yb - ya) + xa) inside = !inside;
    }
    if (inside) return i;
  }
  return -1;
}
