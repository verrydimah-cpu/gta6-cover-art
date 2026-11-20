// layouts.js — panel geometry for the seven cover layouts. Every panel is
// a rectangle in relative units (0..1 of the canvas) with a cast role, the
// sample that fills it by default and a slant for the angled-divider look.
// The Ensemble Poster is the house layout: one dominant central portrait,
// a column of cast panels on each side and the two garage photographs
// sharing the bottom row.

const panel = (role, sample, x, y, w, h, slant = 0) => ({ key: role, role, sample, x, y, w, h, slant });

function ensemblePanels(aspect) {
  const top = 0.016, artBottom = 0.852, gap = 0.009;
  const leftX = 0.014, leftW = aspect >= 1.25 ? 0.185 : 0.232;
  const rightW = leftW, rightX = 1 - rightW - 0.014;
  const midX = leftX + leftW + gap, midW = rightX - gap - midX;
  const colH = artBottom - top;
  const left = ['THE GETAWAY', 'THE RIDE', 'THE FIXER', 'THE RACER'];
  const leftSamples = ['speedboat', 'sunset-car', 'silver-fixer', 'street-racer'];
  const right = ['THE CAPTAIN', 'THE MUSCLE', 'THE INSIDER'];
  const rightSamples = ['yacht-man', 'bodyguard', 'glamour-insider'];
  const out = [];
  const lh = (colH - gap * (left.length - 1)) / left.length;
  left.forEach((role, i) => out.push(panel(role, leftSamples[i], leftX, top + i * (lh + gap), leftW, lh)));
  const rh = (colH - gap * (right.length - 1)) / right.length;
  right.forEach((role, i) => out.push(panel(role, rightSamples[i], rightX, top + i * (rh + gap), rightW, rh)));
  const midBottom = artBottom - 0.235;
  out.push(panel('THE DRIVER', 'neon-woman', midX, top, midW, midBottom - top));
  const bw = (midW - gap) / 2;
  out.push(panel('THE RIDER', 'garage-rider', midX, midBottom + gap, bw, artBottom - midBottom - gap));
  out.push(panel('THE LOOKOUT', 'garage-rider-2', midX + bw + gap, midBottom + gap, bw, artBottom - midBottom - gap));
  return out;
}

function duoPanels() {
  return [
    panel('THE DRIVER', 'neon-woman', 0.012, 0.016, 0.52, 0.836, 0.05),
    panel('THE RIDE', 'sunset-car', 0.50, 0.016, 0.488, 0.836, 0.05),
  ];
}

function trioPanels() {
  return [
    panel('THE GETAWAY', 'speedboat', 0.012, 0.016, 0.315, 0.836, 0.035),
    panel('THE DRIVER', 'neon-woman', 0.345, 0.016, 0.315, 0.836, 0.035),
    panel('THE CAPTAIN', 'yacht-man', 0.678, 0.016, 0.31, 0.836, 0.035),
  ];
}

function quadPanels() {
  const w = 0.482, h = 0.413, gx = 0.012, gy = 0.016, gap = 0.01;
  return [
    panel('THE DRIVER', 'neon-woman', gx, gy, w, h),
    panel('THE RIDE', 'sunset-car', gx + w + gap, gy, w, h),
    panel('THE GETAWAY', 'speedboat', gx, gy + h + gap, w, h),
    panel('THE RIDER', 'garage-rider', gx + w + gap, gy + h + gap, w, h),
  ];
}

function heroPanels() {
  return [panel('THE DRIVER', 'neon-woman', 0, 0, 1, 1)];
}

function stripsPanels() {
  const rows = [
    ['THE RIDE', 'sunset-car'], ['THE GETAWAY', 'speedboat'],
    ['THE RIDER', 'garage-rider'], ['THE DRIVER', 'neon-woman'],
  ];
  const h = 0.209, gap = 0.006;
  return rows.map(([role, s], i) => panel(role, s, 0.012, 0.016 + i * (h + gap), 0.976, h));
}

function sixPanels() {
  const cols = 3, rows = 2, gap = 0.01;
  const w = (0.976 - gap * (cols - 1)) / cols, h = (0.836 - gap * (rows - 1)) / rows;
  const cast = [
    ['THE DRIVER', 'neon-woman'], ['THE FIXER', 'silver-fixer'], ['THE CAPTAIN', 'yacht-man'],
    ['THE RIDE', 'sunset-car'], ['THE MUSCLE', 'bodyguard'], ['THE RIDER', 'garage-rider'],
  ];
  return cast.map(([role, s], i) => panel(role, s, 0.012 + (i % cols) * (w + gap), 0.016 + Math.floor(i / cols) * (h + gap), w, h));
}

export const LAYOUTS = [
  { id: 'ensemble', name: 'Ensemble Poster', panels: ensemblePanels },
  { id: 'duo', name: 'Duo', panels: () => duoPanels() },
  { id: 'trio', name: 'Trio', panels: () => trioPanels() },
  { id: 'quad', name: 'Quad', panels: () => quadPanels() },
  { id: 'hero', name: 'Hero', panels: () => heroPanels() },
  { id: 'strips', name: 'Strips', panels: () => stripsPanels() },
  { id: 'six', name: 'Grid Six', panels: () => sixPanels() },
];

export const layoutById = (id) => LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];

// The panels for a layout at a canvas aspect, with the aspect handed to
// the layouts that reshape themselves for wide or square exports.
export function panelsFor(layoutId, aspect) {
  const layout = layoutById(layoutId);
  return layout.panels(aspect);
}

// The ensemble's cast in billing order — the editor lists panels in this
// order and the cover's bottom row closes the bill.
export const ENSEMBLE_CAST = [
  'THE DRIVER', 'THE GETAWAY', 'THE RIDE', 'THE FIXER', 'THE RACER',
  'THE CAPTAIN', 'THE MUSCLE', 'THE INSIDER', 'THE RIDER', 'THE LOOKOUT',
];
