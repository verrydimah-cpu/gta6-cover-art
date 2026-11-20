// layouts.js — the collage geometries of Vice Cover Studio.
//
// A panel is a rectangle in unit space (0..1 across the whole cover) plus
// the editorial decisions that make it read as poster art: a role tag for
// the little black slash label, the sample photo the panel is cast with by
// default, a punch (focal point and zoom) that frames faces and cars the
// way a poster artist would, and a slant used by the angled dividers.
//
// Sample indices follow the shipped sample order:
//   0 neon woman · 1 speedboat · 2 sunset car · 3 yacht man
//   4 silver fixer · 5 street racer · 6 bodyguard · 7 glamour insider
// The last four portraits were generated for this studio's expanded cast,
// in the same photographic Vice light as the original four.

export const ROLE_TAGS = [
  'THE DRIVER',
  'THE GETAWAY',
  'THE CAPTAIN',
  'THE RIDE',
  'THE FIXER',
  'THE RACER',
  'THE MUSCLE',
  'THE INSIDER',
  'THE CITY',
];

function panel(x, y, w, h, tag, sample, punch, slant = 0) {
  return { x, y, w, h, tag, sample, punch, slant };
}

// The punch values are focal points (fx, fy in 0..1 of the photo) and a
// zoom past the plain cover-fit. They are tuned gently — enough to give a
// panel poster energy, never enough to bend a face or a car out of shape.
const PUNCH = {
  portrait: { fx: 0.5, fy: 0.34, zoom: 1.04 },
  face: { fx: 0.52, fy: 0.35, zoom: 1.06 },
  car: { fx: 0.44, fy: 0.58, zoom: 1.06 },
  boat: { fx: 0.5, fy: 0.52, zoom: 1.05 },
  wide: { fx: 0.5, fy: 0.46, zoom: 1.03 },
};

export const LAYOUTS = [
  {
    id: 'ensemble-poster',
    name: 'Ensemble Poster',
    ensemble: true,
    // The full cast around one dominant central portrait: four panels up
    // each side — the getaway, the ride, the fixer and the racer on the
    // left; the captain, the muscle, the insider and a gradient city
    // panel on the right — the crowded movie-poster arrangement.
    panels: [
      panel(0.035, 0.088, 0.235, 0.1245, 'THE GETAWAY', 1, PUNCH.boat),
      panel(0.035, 0.221, 0.235, 0.1245, 'THE RIDE', 2, PUNCH.car),
      panel(0.035, 0.354, 0.235, 0.1245, 'THE FIXER', 4, PUNCH.face),
      panel(0.035, 0.487, 0.235, 0.1245, 'THE RACER', 5, PUNCH.face),
      panel(0.29, 0.072, 0.42, 0.54, 'THE DRIVER', 0, PUNCH.portrait),
      panel(0.73, 0.088, 0.235, 0.1245, 'THE CAPTAIN', 3, PUNCH.face),
      panel(0.73, 0.221, 0.235, 0.1245, 'THE MUSCLE', 6, PUNCH.face),
      panel(0.73, 0.354, 0.235, 0.1245, 'THE INSIDER', 7, PUNCH.face),
      panel(0.73, 0.487, 0.235, 0.1245, 'THE CITY', -1, PUNCH.wide),
    ],
  },
  {
    id: 'vice-classic',
    name: 'Vice Classic',
    ensemble: false,
    panels: [
      panel(0, 0, 0.52, 0.55, 'THE DRIVER', 0, PUNCH.portrait, 0.06),
      panel(0.52, 0, 0.48, 0.55, 'THE GETAWAY', 1, PUNCH.boat, 0.06),
      panel(0, 0.55, 0.3, 0.45, 'THE RIDE', 2, PUNCH.car),
      panel(0.3, 0.55, 0.34, 0.45, 'THE FIXER', 4, PUNCH.face),
      panel(0.64, 0.55, 0.36, 0.45, 'THE CAPTAIN', 3, PUNCH.face),
    ],
  },
  {
    id: 'duo-feature',
    name: 'Duo Feature',
    ensemble: false,
    panels: [
      panel(0, 0, 0.52, 1, 'THE DRIVER', 0, PUNCH.portrait, 0.05),
      panel(0.52, 0, 0.48, 1, 'THE GETAWAY', 1, PUNCH.boat, 0.05),
    ],
  },
  {
    id: 'quad-grid',
    name: 'Quad Grid',
    ensemble: false,
    panels: [
      panel(0, 0, 0.5, 0.5, 'THE DRIVER', 0, PUNCH.face),
      panel(0.5, 0, 0.5, 0.5, 'THE GETAWAY', 1, PUNCH.boat),
      panel(0, 0.5, 0.5, 0.5, 'THE RIDE', 2, PUNCH.car),
      panel(0.5, 0.5, 0.5, 0.5, 'THE CAPTAIN', 3, PUNCH.face),
    ],
  },
  {
    id: 'top-strip',
    name: 'Top Strip',
    ensemble: false,
    panels: [
      panel(0, 0, 1, 0.46, 'THE CITY', 2, PUNCH.wide),
      panel(0, 0.46, 0.34, 0.54, 'THE DRIVER', 0, PUNCH.portrait),
      panel(0.34, 0.46, 0.33, 0.54, 'THE RACER', 5, PUNCH.face),
      panel(0.67, 0.46, 0.33, 0.54, 'THE INSIDER', 7, PUNCH.face),
    ],
  },
  {
    id: 'story-strips',
    name: 'Story Strips',
    ensemble: false,
    panels: [
      panel(0, 0, 0.34, 1, 'THE DRIVER', 0, PUNCH.portrait, 0.04),
      panel(0.34, 0, 0.33, 1, 'THE RIDE', 2, PUNCH.car, 0.04),
      panel(0.67, 0, 0.33, 1, 'THE INSIDER', 7, PUNCH.face, 0.04),
    ],
  },
  {
    id: 'mosaic-six',
    name: 'Mosaic Six',
    ensemble: false,
    panels: [
      panel(0, 0, 0.34, 0.5, 'THE DRIVER', 0, PUNCH.face),
      panel(0.34, 0, 0.33, 0.5, 'THE GETAWAY', 1, PUNCH.boat),
      panel(0.67, 0, 0.33, 0.5, 'THE RIDE', 2, PUNCH.car),
      panel(0, 0.5, 0.34, 0.5, 'THE CAPTAIN', 3, PUNCH.face),
      panel(0.34, 0.5, 0.33, 0.5, 'THE FIXER', 4, PUNCH.face),
      panel(0.67, 0.5, 0.33, 0.5, 'THE MUSCLE', 6, PUNCH.face),
    ],
  },
];

export function layoutById(id) {
  return LAYOUTS.find((layout) => layout.id === id) || LAYOUTS[0];
}

// The ensemble poster is the default: it is the arrangement the cover
// screenshot leads with, so a first-time visitor lands on the full poster.
export const DEFAULT_LAYOUT_ID = 'ensemble-poster';
