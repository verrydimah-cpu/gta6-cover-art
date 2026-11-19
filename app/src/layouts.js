// layouts.js — the six poster layouts of Vice Cover Studio.
//
// Every layout is a small set of polygons in normalised cover space
// (x and y both run 0..1, origin at the top-left). Polygons are listed
// back-to-front: the renderer paints them in order, then strokes every
// edge with the chosen divider style, so neighbouring panels share a
// clean angled seam instead of a gap. The polygons deliberately
// overlap by a hair under the seam so no background can peek through.

function poly(points) {
  return points.map(([x, y]) => ({ x, y }));
}

// Hero Collage: one tall hero on the left, a stack of three frames on
// the right, and a wide base panel under the hero. Five panels.
const heroCollage = [
  poly([[0, 0], [0.56, 0], [0.505, 0.575], [0, 0.575]]),
  poly([[0.575, 0], [1, 0], [1, 0.335], [0.52, 0.395]]),
  poly([[0.515, 0.415], [1, 0.355], [1, 0.665], [0.5, 0.695]]),
  poly([[0.495, 0.715], [1, 0.685], [1, 1], [0.6, 1]]),
  poly([[0, 0.595], [0.5, 0.595], [0.47, 1], [0, 1]]),
];

// Diagonal Trio: three full-height blades leaning the same way, like
// a loading screen sliced by a katana. Three panels.
const diagonalTrio = [
  poly([[0, 0], [0.425, 0], [0.285, 1], [0, 1]]),
  poly([[0.445, 0], [0.765, 0], [0.625, 1], [0.305, 1]]),
  poly([[0.785, 0], [1, 0], [1, 1], [0.645, 1]]),
];

// Grid Six: a 3 x 2 grid whose rows lean a few pixels off square, so
// the sheet feels printed rather than spreadsheeted. Six panels,
// generated so the seams line up exactly.
function gridSix() {
  const xs = [0, 0.338, 0.668, 1];
  const rows = [
    { y0: 0, y1: 0.502, lean: 0.012 },
    { y0: 0.498, y1: 1, lean: -0.01 },
  ];
  const out = [];
  for (const row of rows) {
    for (let c = 0; c < 3; c += 1) {
      const x0 = xs[c];
      const x1 = xs[c + 1];
      out.push(poly([
        [x0, row.y0 + (c === 0 ? 0 : row.lean)],
        [x1, row.y0 + (c === 2 ? 0 : row.lean)],
        [x1, row.y1 + (c === 2 ? 0 : row.lean)],
        [x0, row.y1 + (c === 0 ? 0 : row.lean)],
      ]));
    }
  }
  return out;
}

// Spotlight: a wide centre stage flanked by two narrower witnesses.
// Three panels, the middle one owns the middle of the cover.
const spotlight = [
  poly([[0, 0], [0.305, 0], [0.225, 1], [0, 1]]),
  poly([[0.325, 0], [0.685, 0], [0.785, 1], [0.245, 1]]),
  poly([[0.705, 0], [1, 0], [1, 1], [0.805, 1]]),
];

// Hero + Filmstrip: a two-shot hero band on top (lead + detail) and a
// three-frame filmstrip running along the bottom. Five panels.
const heroFilmstrip = [
  poly([[0, 0], [0.645, 0], [0.605, 0.655], [0, 0.655]]),
  poly([[0.665, 0], [1, 0], [1, 0.655], [0.625, 0.655]]),
  poly([[0, 0.685], [0.328, 0.685], [0.318, 1], [0, 1]]),
  poly([[0.342, 0.685], [0.668, 0.685], [0.662, 1], [0.332, 1]]),
  poly([[0.682, 0.685], [1, 0.685], [1, 1], [0.676, 1]]),
];

// Magazine Split: a tall cover portrait on the left, and the right
// side cut into a headline frame, a mid frame and a wide footer
// frame, like a glossy magazine cover. Four panels.
const magazineSplit = [
  poly([[0, 0], [0.465, 0], [0.425, 1], [0, 1]]),
  poly([[0.485, 0], [1, 0], [1, 0.475], [0.452, 0.52]]),
  poly([[0.448, 0.542], [1, 0.497], [1, 0.775], [0.442, 0.798]]),
  poly([[0.44, 0.82], [1, 0.797], [1, 1], [0.432, 1]]),
];

export const LAYOUTS = [
  { id: 'hero-collage', name: 'Hero Collage', blurb: 'Tall hero, three stacked frames, wide base', panels: heroCollage },
  { id: 'diagonal-trio', name: 'Diagonal Trio', blurb: 'Three leaning full-height blades', panels: diagonalTrio },
  { id: 'grid-six', name: 'Grid Six', blurb: 'Six frames in a leaning 3 x 2 grid', panels: gridSix() },
  { id: 'spotlight', name: 'Spotlight', blurb: 'One centre stage, two witnesses', panels: spotlight },
  { id: 'hero-filmstrip', name: 'Hero + Filmstrip', blurb: 'Two-shot hero over a three-frame strip', panels: heroFilmstrip },
  { id: 'magazine-split', name: 'Magazine Split', blurb: 'Cover portrait with a glossy right rail', panels: magazineSplit },
];

export function layoutById(id) {
  return LAYOUTS.find((layout) => layout.id === id) || LAYOUTS[0];
}

// Axis-aligned bounds of a polygon, in normalised space.
export function panelBounds(points) {
  let minX = 1; let minY = 1; let maxX = 0; let maxY = 0;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

// Average of the corners: a good enough "middle" for labels and for
// keeping decoration away from where a face usually sits.
export function panelCentroid(points) {
  let x = 0; let y = 0;
  for (const p of points) { x += p.x; y += p.y; }
  return { x: x / points.length, y: y / points.length };
}

// Even-odd ray cast, in normalised space. Used by the editor to know
// which panel a pointer press landed in.
export function pointInPanel(points, x, y) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const a = points[i];
    const b = points[j];
    const crosses = (a.y > y) !== (b.y > y)
      && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}
