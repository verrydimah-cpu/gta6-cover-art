// layouts.js — collage geometry for VICE COVER STUDIO.
// A layout is a stack of horizontal bands. Each band is split into
// segments by cut fractions, and every vertical edge in the band is
// slanted by a small offset so neighbouring panels meet along angled
// dividers, the way printed poster collages are sliced. Because the
// bands share straight horizontal seams, the polygons always tile the
// cover exactly: no gaps, no overlaps, whatever the export size is.

export const LAYOUTS = [
  {
    id: 'vice-classic',
    label: 'Vice Classic',
    blurb: 'One hero portrait, a wide scene and a three-panel base.',
    bands: [
      { y: [0, 0.52], cuts: [0, 0.56, 1], slant: -0.055 },
      { y: [0.52, 1], cuts: [0, 0.34, 0.67, 1], slant: 0.045 },
    ],
  },
  {
    id: 'duo-feature',
    label: 'Duo Feature',
    blurb: 'A tall lead panel over a full-width closing scene.',
    bands: [
      { y: [0, 0.64], cuts: [0, 0.6, 1], slant: -0.05 },
      { y: [0.64, 1], cuts: [0, 1], slant: 0 },
    ],
  },
  {
    id: 'quad-grid',
    label: 'Quad Grid',
    blurb: 'Four equal frames, dividers leaning against each other.',
    bands: [
      { y: [0, 0.5], cuts: [0, 0.5, 1], slant: 0.04 },
      { y: [0.5, 1], cuts: [0, 0.5, 1], slant: -0.04 },
    ],
  },
  {
    id: 'top-strip',
    label: 'Top Strip',
    blurb: 'A three-frame strip above two large story panels.',
    bands: [
      { y: [0, 0.36], cuts: [0, 0.33, 0.66, 1], slant: 0.03 },
      { y: [0.36, 1], cuts: [0, 0.58, 1], slant: -0.065 },
    ],
  },
  {
    id: 'story-strips',
    label: 'Story Strips',
    blurb: 'Four leaning vertical strips, like frames from a film reel.',
    bands: [
      { y: [0, 1], cuts: [0, 0.25, 0.5, 0.75, 1], slant: 0.055 },
    ],
  },
  {
    id: 'mosaic-six',
    label: 'Mosaic Six',
    blurb: 'Six matched frames for a crowded, busy poster wall.',
    bands: [
      { y: [0, 0.5], cuts: [0, 0.33, 0.66, 1], slant: 0.05 },
      { y: [0.5, 1], cuts: [0, 0.33, 0.66, 1], slant: -0.05 },
    ],
  },
  {
    id: 'ensemble',
    label: 'Ensemble Poster',
    blurb: 'One dominant central portrait framed by four cast panels.',
    poster: true,
    // Explicit polygons: [top-left, top-right, centre hero,
    // bottom-left, bottom-right]. The hero is drawn after its
    // neighbours so its frame sits proudly on top of theirs.
    panels: [
      [[0.03, 0.09], [0.315, 0.09], [0.315, 0.42], [0.03, 0.42]],
      [[0.685, 0.09], [0.97, 0.09], [0.97, 0.42], [0.685, 0.42]],
      [[0.33, 0.07], [0.67, 0.07], [0.67, 0.7], [0.33, 0.7]],
      [[0.03, 0.445], [0.315, 0.445], [0.315, 0.7], [0.03, 0.7]],
      [[0.685, 0.445], [0.97, 0.445], [0.97, 0.7], [0.685, 0.7]],
    ],
    photoMap: [1, 3, 0, 2, -1],
    labels: ['THE GETAWAY', 'THE CAPTAIN', 'THE DRIVER', 'THE RIDE', 'THE CITY'],
  },
];

export function layoutById(id) {
  return LAYOUTS.find((entry) => entry.id === id) || LAYOUTS[0];
}

// Expand a layout into pixel polygons for a W x H cover. Each panel
// carries its centre (handy for labels and decor placement) and a
// bounding box (handy for cover-fitting a photo into the panel).
export function layoutPanels(layout, W, H) {
  const panels = [];
  if (layout.panels) {
    for (const raw of layout.panels) {
      const points = raw.map(([fx, fy]) => [fx * W, fy * H]);
      const xs = points.map((p) => p[0]);
      const ys = points.map((p) => p[1]);
      panels.push({
        index: panels.length,
        points,
        cx: xs.reduce((a, b) => a + b, 0) / points.length,
        cy: ys.reduce((a, b) => a + b, 0) / points.length,
        box: {
          x: Math.min(...xs),
          y: Math.min(...ys),
          w: Math.max(...xs) - Math.min(...xs),
          h: Math.max(...ys) - Math.min(...ys),
        },
      });
    }
    return panels;
  }
  for (const band of layout.bands) {
    const [yTop, yBottom] = band.y;
    for (let i = 0; i < band.cuts.length - 1; i += 1) {
      const xLeft = band.cuts[i];
      const xRight = band.cuts[i + 1];
      const points = [
        [xLeft * W, yTop * H],
        [xRight * W, yTop * H],
        [(xRight + band.slant) * W, yBottom * H],
        [(xLeft + band.slant) * W, yBottom * H],
      ];
      const xs = points.map((p) => p[0]);
      const ys = points.map((p) => p[1]);
      panels.push({
        index: panels.length,
        points,
        cx: xs.reduce((a, b) => a + b, 0) / 4,
        cy: ys.reduce((a, b) => a + b, 0) / 4,
        box: {
          x: Math.min(...xs),
          y: Math.min(...ys),
          w: Math.max(...xs) - Math.min(...xs),
          h: Math.max(...ys) - Math.min(...ys),
        },
      });
    }
  }
  return panels;
}

// Point-in-polygon test used when the user drags on the preview: the
// panel under the pointer is the one that receives the drag.
export function panelAtPoint(panels, x, y) {
  for (let i = panels.length - 1; i >= 0; i -= 1) {
    const pts = panels[i].points;
    let inside = false;
    for (let a = 0, b = pts.length - 1; a < pts.length; b = a, a += 1) {
      const [xa, ya] = pts[a];
      const [xb, yb] = pts[b];
      if ((ya > y) !== (yb > y) && x < ((xb - xa) * (y - ya)) / (yb - ya) + xa) {
        inside = !inside;
      }
    }
    if (inside) return i;
  }
  return -1;
}
