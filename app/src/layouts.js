// VICE COVER STUDIO — poster layouts.
//
// Every layout is a list of panels in normalised cover coordinates
// (x, y, w, h as fractions of the canvas), so the same arrangement works at
// 1080x1080, 1080x1350 and 1920x1080. Each panel names a default sample and
// a default role tag; the editor can re-fill, re-crop and re-tag any panel.
//
// The default layout, Ensemble Poster, is the signature arrangement: one
// dominant central portrait framed by gold-edged cast panels on a dark
// plum-brown field, with THE RIDER — a real garage photograph of a weathered
// cruiser — stretched wide beneath the hero, in the landscape slot its
// side-profile framing deserves. Ten panels in all.

function panel(id, tag, sample, x, y, w, h, extra = {}) {
  return { id, tag, sample, x, y, w, h, ox: 0.5, oy: 0.5, zoom: 1, punch: 0.35, ...extra };
}

export const LAYOUTS = [
  {
    id: 'ensemble',
    name: 'Ensemble Poster',
    panels: [
      panel('driver', 'THE DRIVER', 'neon-woman', 0.305, 0.045, 0.39, 0.56, { oy: 0.32 }),
      panel('getaway', 'THE GETAWAY', 'speedboat', 0.035, 0.045, 0.245, 0.128),
      panel('ride', 'THE RIDE', 'sunset-car', 0.035, 0.188, 0.245, 0.128),
      panel('fixer', 'THE FIXER', 'silver-fixer', 0.035, 0.331, 0.245, 0.128),
      panel('racer', 'THE RACER', 'street-racer', 0.035, 0.474, 0.245, 0.131, { oy: 0.15 }),
      panel('captain', 'THE CAPTAIN', 'yacht-man', 0.72, 0.045, 0.245, 0.176),
      panel('muscle', 'THE MUSCLE', 'bodyguard', 0.72, 0.236, 0.245, 0.176),
      panel('insider', 'THE INSIDER', 'glamour-insider', 0.72, 0.427, 0.245, 0.178, { oy: 0.16 }),
      panel('rider', 'THE RIDER', 'garage-rider', 0.035, 0.62, 0.455, 0.155, { oy: 0.58 }),
      panel('lookout', 'THE LOOKOUT', 'garage-rider-2', 0.505, 0.62, 0.46, 0.155, { oy: 0.52 }),
    ],
  },
  {
    id: 'duo',
    name: 'Duo Split',
    panels: [
      panel('left', 'THE DRIVER', 'neon-woman', 0.035, 0.05, 0.45, 0.72, { oy: 0.3 }),
      panel('right', 'THE RIDER', 'garage-rider', 0.515, 0.05, 0.45, 0.72, { oy: 0.55 }),
    ],
  },
  {
    id: 'trio',
    name: 'Trio Columns',
    panels: [
      panel('a', 'THE GETAWAY', 'speedboat', 0.03, 0.05, 0.3, 0.72),
      panel('b', 'THE DRIVER', 'neon-woman', 0.35, 0.05, 0.3, 0.72, { oy: 0.3 }),
      panel('c', 'THE RIDE', 'sunset-car', 0.67, 0.05, 0.3, 0.72),
    ],
  },
  {
    id: 'grid',
    name: 'Grid Four',
    panels: [
      panel('a', 'THE CAPTAIN', 'yacht-man', 0.035, 0.045, 0.455, 0.35),
      panel('b', 'THE FIXER', 'silver-fixer', 0.51, 0.045, 0.455, 0.35),
      panel('c', 'THE RACER', 'street-racer', 0.035, 0.415, 0.455, 0.35),
      panel('d', 'THE RIDER', 'garage-rider', 0.51, 0.415, 0.455, 0.35, { oy: 0.55 }),
    ],
  },
  {
    id: 'hero',
    name: 'Solo Hero',
    panels: [
      panel('hero', 'THE DRIVER', 'neon-woman', 0.03, 0.04, 0.94, 0.74, { oy: 0.3 }),
    ],
  },
  {
    id: 'strip',
    name: 'Film Strip',
    panels: [
      panel('wide', 'THE RIDE', 'sunset-car', 0.035, 0.045, 0.93, 0.4),
      panel('a', 'THE GETAWAY', 'speedboat', 0.035, 0.465, 0.297, 0.3),
      panel('b', 'THE MUSCLE', 'bodyguard', 0.351, 0.465, 0.297, 0.3),
      panel('c', 'THE INSIDER', 'glamour-insider', 0.667, 0.465, 0.298, 0.3),
    ],
  },
  {
    id: 'mosaic',
    name: 'Mosaic Six',
    panels: [
      panel('a', 'THE DRIVER', 'neon-woman', 0.03, 0.045, 0.46, 0.47, { oy: 0.3 }),
      panel('b', 'THE CAPTAIN', 'yacht-man', 0.51, 0.045, 0.46, 0.225),
      panel('c', 'THE RIDE', 'sunset-car', 0.51, 0.29, 0.46, 0.225),
      panel('d', 'THE FIXER', 'silver-fixer', 0.03, 0.535, 0.297, 0.23),
      panel('e', 'THE RACER', 'street-racer', 0.347, 0.535, 0.297, 0.23),
      panel('f', 'THE RIDER', 'garage-rider', 0.664, 0.535, 0.306, 0.23, { oy: 0.55 }),
    ],
  },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

// Fresh, deep-copied panel state for a layout, so edits never mutate the
// layout definitions themselves.
export function freshPanels(layoutId) {
  return layoutById(layoutId).panels.map((p) => ({ ...p }));
}
