// Panel layouts for VICE COVER STUDIO. Each layout is a set of polygons in normalised cover coordinates
// (x and y both run 0..1 across the cover, whatever its pixel size), drawn in order. The polygons share
// edges exactly, so the renderer can stroke every outline in the frame colour and get the angled,
// white-divided multi-panel collage of a game poster. Four layouts ship: a five-panel hero collage,
// a three-panel diagonal, a six-panel grid and a four-panel spotlight.

/** One polygon: a list of [x, y] points in normalised cover coordinates. */
// typedef PanelPolygon = Array<[number, number]>

export const LAYOUTS = [
  {
    id: 'hero',
    name: 'Hero Collage',
    blurb: 'Five panels — one big scene over a three-way split',
    panels: [
      // The hero panel, top left, with a slanted foot.
      [[0, 0], [0.66, 0], [0.6, 0.52], [0, 0.52]],
      // Top right, sharing the hero panel's slanted divider.
      [[0.66, 0], [1, 0], [1, 0.52], [0.6, 0.52]],
      // Bottom row: three panels split by slanted uprights.
      [[0, 0.52], [0.38, 0.52], [0.33, 1], [0, 1]],
      [[0.38, 0.52], [0.71, 0.52], [0.66, 1], [0.33, 1]],
      [[0.71, 0.52], [1, 0.52], [1, 1], [0.66, 1]],
    ],
  },
  {
    id: 'trio',
    name: 'Diagonal Trio',
    blurb: 'Three wide bands cut on the diagonal',
    panels: [
      [[0, 0], [1, 0], [1, 0.22], [0, 0.55]],
      [[0, 0.55], [1, 0.22], [1, 0.6], [0, 0.95]],
      [[0, 0.95], [1, 0.6], [1, 1], [0, 1]],
    ],
  },
  {
    id: 'grid',
    name: 'Grid Six',
    blurb: 'Six panels in two rows, uprights leaning',
    panels: [
      [[0, 0], [0.36, 0], [0.34, 0.52], [0, 0.52]],
      [[0.36, 0], [0.69, 0], [0.67, 0.52], [0.34, 0.52]],
      [[0.69, 0], [1, 0], [1, 0.52], [0.67, 0.52]],
      [[0, 0.52], [0.34, 0.52], [0.32, 1], [0, 1]],
      [[0.34, 0.52], [0.67, 0.52], [0.65, 1], [0.32, 1]],
      [[0.67, 0.52], [1, 0.52], [1, 1], [0.65, 1]],
    ],
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    blurb: 'One tall star panel beside a three-high stack',
    panels: [
      [[0, 0], [0.7, 0], [0.64, 1], [0, 1]],
      [[0.7, 0], [1, 0], [1, 0.34], [0.685, 0.34]],
      [[0.685, 0.34], [1, 0.34], [1, 0.67], [0.67, 0.67]],
      [[0.67, 0.67], [1, 0.67], [1, 1], [0.64, 1]],
    ],
  },
];

/** The layout with the given id, or the first layout when the id is unknown. */
export function layoutById(id) {
  return LAYOUTS.find((layout) => layout.id === id) ?? LAYOUTS[0];
}

/** The axis-aligned bounding box of a polygon, in the same coordinates. */
export function polygonBounds(polygon) {
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (const [x, y] of polygon) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** True when the point (x, y) falls inside the polygon (even-odd ray cast). */
export function pointInPolygon(polygon, x, y) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
