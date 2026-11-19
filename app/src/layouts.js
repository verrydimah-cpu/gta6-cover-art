// Vice Cover Studio — panel layouts.
// Every layout is a set of polygons in normalised canvas coordinates
// (0..1 on both axes) that tile the whole canvas with no gaps and no
// overlaps, so angled dividers can be stroked along every polygon edge
// and the poster always reads as one sheet. Panels are listed in
// reading order: top to bottom, left to right. Each panel also carries
// a default focal point used until the visitor punches it in by hand.

'use strict';

const VCS_LAYOUTS = [
  {
    id: 'vice-quad',
    name: 'Vice Quad',
    blurb: 'Four panels split by one diagonal cross. The classic.',
    panels: [
      { name: 'Top Left', poly: [[0, 0], [0.58, 0], [0.48, 0.52], [0, 0.62]], focal: [0.42, 0.42] },
      { name: 'Top Right', poly: [[0.58, 0], [1, 0], [1, 0.48], [0.48, 0.52]], focal: [0.58, 0.42] },
      { name: 'Bottom Left', poly: [[0, 0.62], [0.48, 0.52], [0.55, 1], [0, 1]], focal: [0.42, 0.6] },
      { name: 'Bottom Right', poly: [[0.48, 0.52], [1, 0.48], [1, 1], [0.55, 1]], focal: [0.58, 0.6] },
    ],
  },
  {
    id: 'fan-five',
    name: 'Fan Five',
    blurb: 'Five wedges radiating from a point low in the frame.',
    panels: [
      { name: 'West Wedge', poly: [[0, 0], [0.25, 0], [0.5, 0.95], [0, 0.7]], focal: [0.3, 0.35] },
      { name: 'North West', poly: [[0.25, 0], [0.5, 0], [0.5, 0.95]], focal: [0.5, 0.3] },
      { name: 'North East', poly: [[0.5, 0], [0.75, 0], [0.5, 0.95]], focal: [0.5, 0.3] },
      { name: 'East Wedge', poly: [[0.75, 0], [1, 0], [1, 0.7], [0.5, 0.95]], focal: [0.7, 0.35] },
      { name: 'Shore Strip', poly: [[0, 0.7], [0.5, 0.95], [1, 0.7], [1, 1], [0, 1]], focal: [0.5, 0.55] },
    ],
  },
  {
    id: 'skyline-bands',
    name: 'Skyline Bands',
    blurb: 'Four wide bands, each edge tipped like a skyline roof.',
    panels: [
      { name: 'Band One', poly: [[0, 0], [1, 0], [1, 0.24], [0, 0.32]], focal: [0.5, 0.45] },
      { name: 'Band Two', poly: [[0, 0.32], [1, 0.24], [1, 0.5], [0, 0.58]], focal: [0.5, 0.5] },
      { name: 'Band Three', poly: [[0, 0.58], [1, 0.5], [1, 0.76], [0, 0.84]], focal: [0.5, 0.5] },
      { name: 'Band Four', poly: [[0, 0.84], [1, 0.76], [1, 1], [0, 1]], focal: [0.5, 0.55] },
    ],
  },
  {
    id: 'diamond-center',
    name: 'Diamond Center',
    blurb: 'A hero diamond in the middle, four corners around it.',
    panels: [
      { name: 'Top Corner', poly: [[0, 0], [1, 0], [0.88, 0.5], [0.5, 0.12], [0.12, 0.5]], focal: [0.5, 0.3] },
      { name: 'Hero Diamond', poly: [[0.5, 0.12], [0.88, 0.5], [0.5, 0.88], [0.12, 0.5]], focal: [0.5, 0.5] },
      { name: 'West Corner', poly: [[0, 0], [0.12, 0.5], [0.5, 0.88], [0, 1]], focal: [0.3, 0.6] },
      { name: 'East Corner', poly: [[1, 0], [1, 1], [0.5, 0.88], [0.88, 0.5]], focal: [0.7, 0.6] },
      { name: 'South Corner', poly: [[0, 1], [0.5, 0.88], [1, 1]], focal: [0.5, 0.7] },
    ],
  },
  {
    id: 'twin-slash',
    name: 'Twin Slash',
    blurb: 'Two tall slashes over one wide shore panel. Bold and few.',
    panels: [
      { name: 'West Slash', poly: [[0, 0], [0.55, 0], [0.4, 0.68], [0, 0.78]], focal: [0.45, 0.4] },
      { name: 'East Slash', poly: [[0.55, 0], [1, 0], [1, 0.6], [0.4, 0.68]], focal: [0.55, 0.4] },
      { name: 'Shore Panel', poly: [[0, 0.78], [0.4, 0.68], [1, 0.6], [1, 1], [0, 1]], focal: [0.5, 0.5] },
    ],
  },
  {
    id: 'grand-six',
    name: 'Grand Six',
    blurb: 'Six panels in three slanted rows. The full collage.',
    panels: [
      { name: 'Row One West', poly: [[0, 0], [0.52, 0], [0.46, 0.34], [0, 0.38]], focal: [0.45, 0.45] },
      { name: 'Row One East', poly: [[0.52, 0], [1, 0], [1, 0.3], [0.46, 0.34]], focal: [0.55, 0.45] },
      { name: 'Row Two West', poly: [[0, 0.38], [0.46, 0.34], [0.52, 0.66], [0, 0.7]], focal: [0.45, 0.5] },
      { name: 'Row Two East', poly: [[0.46, 0.34], [1, 0.3], [1, 0.62], [0.52, 0.66]], focal: [0.55, 0.5] },
      { name: 'Row Three West', poly: [[0, 0.7], [0.52, 0.66], [0.58, 1], [0, 1]], focal: [0.45, 0.55] },
      { name: 'Row Three East', poly: [[0.52, 0.66], [1, 0.62], [1, 1], [0.58, 1]], focal: [0.55, 0.55] },
    ],
  },
];

function vcsLayoutById(id) {
  for (const layout of VCS_LAYOUTS) {
    if (layout.id === id) return layout;
  }
  return VCS_LAYOUTS[0];
}

// The axis-aligned box a polygon lives in, in normalised coordinates.
function vcsPolyBounds(poly) {
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (const point of poly) {
    minX = Math.min(minX, point[0]);
    minY = Math.min(minY, point[1]);
    maxX = Math.max(maxX, point[0]);
    maxY = Math.max(maxY, point[1]);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

// Traces a panel polygon onto a context scaled to a W by H canvas.
function vcsTracePanel(ctx, poly, W, H) {
  ctx.beginPath();
  poly.forEach(function (point, index) {
    const px = point[0] * W;
    const py = point[1] * H;
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
}

// Every edge of every panel, de-duplicated, as canvas-space segments.
// The renderer strokes these once so shared borders never double up.
function vcsDividerSegments(layout, W, H) {
  const seen = new Set();
  const segments = [];
  for (const panel of layout.panels) {
    const pts = panel.poly;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const key = [a, b].map(function (p) { return p[0].toFixed(3) + ',' + p[1].toFixed(3); }).sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      segments.push({
        x1: a[0] * W, y1: a[1] * H,
        x2: b[0] * W, y2: b[1] * H,
        // Outer means the segment runs along the canvas frame itself.
        outer: (a[0] === b[0] && (a[0] === 0 || a[0] === 1)) || (a[1] === b[1] && (a[1] === 0 || a[1] === 1)),
      });
    }
  }
  return segments;
}
