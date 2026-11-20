// layouts.js — panel geometry for VICE COVER STUDIO.
// Every layout returns panels in normalised coordinates (fractions of
// the canvas) plus the default role tag for each panel. Role tags sit
// on a shared baseline grid: a tag's top edge is always the same
// distance above its panel's bottom edge, so tags line up across a row.

export const TAG_BASELINE = 0.035; // fraction of canvas height

function panel(x, y, w, h, role) {
  return { x, y, w, h, role };
}

export const LAYOUTS = {
  ensemble: {
    id: 'ensemble',
    label: 'Ensemble Poster',
    build(W, H) {
      const m = 0.042, gap = 0.014;
      const top = 0.058, midBottom = 0.658;
      const leftW = 0.252, rightW = 0.252;
      const centreX = m + leftW + gap, centreW = 1 - centreX - rightW - m;
      const rightX = 1 - m - rightW;
      const leftH = (midBottom - top - gap * 3) / 4;
      const rightH = (midBottom - top - gap * 2) / 3;
      const botY = midBottom + 0.015, botH = 0.106;
      const botW = (1 - m * 2 - gap) / 2;
      return [
        panel(m, top, leftW, leftH, 'THE GETAWAY'),
        panel(m, top + (leftH + gap), leftW, leftH, 'THE RIDE'),
        panel(m, top + (leftH + gap) * 2, leftW, leftH, 'THE FIXER'),
        panel(m, top + (leftH + gap) * 3, leftW, leftH, 'THE RACER'),
        panel(centreX, top, centreW, midBottom - top, 'THE DRIVER'),
        panel(rightX, top, rightW, rightH, 'THE CAPTAIN'),
        panel(rightX, top + (rightH + gap), rightW, rightH, 'THE MUSCLE'),
        panel(rightX, top + (rightH + gap) * 2, rightW, rightH, 'THE INSIDER'),
        panel(m, botY, botW, botH, 'THE RIDER'),
        panel(m + botW + gap, botY, botW, botH, 'THE LOOKOUT'),
      ];
    },
  },
  classic: {
    id: 'classic',
    label: 'Vice Classic',
    build() {
      // Angled-divider collage: render.js slants the shared edges.
      return [
        panel(0.030, 0.040, 0.560, 0.560, 'THE DRIVER'),
        panel(0.610, 0.040, 0.360, 0.270, 'THE CAPTAIN'),
        panel(0.610, 0.330, 0.360, 0.270, 'THE RIDE'),
        panel(0.030, 0.620, 0.460, 0.230, 'THE GETAWAY'),
        panel(0.510, 0.620, 0.460, 0.230, 'THE FIXER'),
      ];
    },
  },
  solo: {
    id: 'solo',
    label: 'Solo Hero',
    build() {
      return [panel(0.030, 0.035, 0.940, 0.815, 'THE DRIVER')];
    },
  },
  duo: {
    id: 'duo',
    label: 'Duo Split',
    build() {
      return [
        panel(0.030, 0.040, 0.460, 0.810, 'THE DRIVER'),
        panel(0.510, 0.040, 0.460, 0.810, 'THE CAPTAIN'),
      ];
    },
  },
  trio: {
    id: 'trio',
    label: 'Trio Strip',
    build() {
      const w = (0.940 - 0.028) / 3;
      return [
        panel(0.030, 0.040, w, 0.810, 'THE DRIVER'),
        panel(0.030 + w + 0.014, 0.040, w, 0.810, 'THE FIXER'),
        panel(0.030 + (w + 0.014) * 2, 0.040, w, 0.810, 'THE RIDER'),
      ];
    },
  },
  quad: {
    id: 'quad',
    label: 'Quad Grid',
    build() {
      const w = (0.940 - 0.014) / 2, h = (0.810 - 0.014) / 2;
      return [
        panel(0.030, 0.040, w, h, 'THE DRIVER'),
        panel(0.030 + w + 0.014, 0.040, w, h, 'THE CAPTAIN'),
        panel(0.030, 0.040 + h + 0.014, w, h, 'THE RIDE'),
        panel(0.030 + w + 0.014, 0.040 + h + 0.014, w, h, 'THE RIDER'),
      ];
    },
  },
  mosaic: {
    id: 'mosaic',
    label: 'Mosaic Six',
    build() {
      return [
        panel(0.030, 0.040, 0.470, 0.500, 'THE DRIVER'),
        panel(0.514, 0.040, 0.456, 0.240, 'THE CAPTAIN'),
        panel(0.514, 0.294, 0.456, 0.246, 'THE RIDE'),
        panel(0.030, 0.554, 0.300, 0.296, 'THE FIXER'),
        panel(0.344, 0.554, 0.300, 0.296, 'THE RACER'),
        panel(0.658, 0.554, 0.312, 0.296, 'THE RIDER'),
      ];
    },
  },
};

export function layoutList() {
  return Object.values(LAYOUTS);
}

export function getLayout(id) {
  return LAYOUTS[id] || LAYOUTS.ensemble;
}
