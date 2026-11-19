// shots.js — the shot scenes the screenshot driver loads.
//
// Each scene is a complete cover state plus the export size it was
// composed for. The editor reads ?shot=<name>, applies the scene and
// (for the cover scenes) fills the window with the cover alone, so a
// headless browser can photograph genuine app output. The same scenes
// double as the studio's gallery presets.

const panel = (photo, dx = 0, dy = 0, zoom = 1, punch = 1) => ({ photo, dx, dy, zoom, punch });

export const SAMPLES = [
  { id: 'neon', name: 'Neon Woman', src: 'samples/neon-woman.webp' },
  { id: 'sunset', name: 'Sunset Car', src: 'samples/sunset-car.webp' },
  { id: 'yacht', name: 'Yacht Man', src: 'samples/yacht-man.webp' },
];

const base = {
  divider: 'cream',
  captionStyle: 'sunset',
  captionPos: 'bottom',
  outline: 1,
  subSize: 1,
  grain: true,
  leak: false,
  halftone: 0,
  sharp: true,
  sharpAmt: 0.6,
};

export const SHOT_SCENES = {
  cover: {
    ...base,
    size: 'wide',
    layout: 'hero',
    grade: 'vice',
    leak: true,
    halftone: 0.35,
    title: 'NEON VICE',
    subtitle: 'VICE COVER STUDIO',
    panels: [
      panel('neon', 0, -0.05, 1.14, 1.3),
      panel('sunset', 0.05, 0, 1.2, 1.15),
      panel('yacht', -0.04, -0.3, 1.18, 1.1),
      panel('sunset', -0.3, 0.05, 1.55, 1.05),
      panel('sunset', 0.1, -0.38, 1.5, 1),
    ],
  },
  editor: {
    ...base,
    size: 'square',
    layout: 'hero',
    grade: 'vice',
    leak: true,
    title: 'NEON VICE',
    subtitle: 'VICE COVER STUDIO',
    panels: [
      panel('neon', 0, -0.04, 1.12, 1.25),
      panel('sunset', 0.05, 0, 1.2, 1.1),
      panel('yacht', -0.04, -0.3, 1.18, 1.05),
      panel('sunset', -0.3, 0.05, 1.55, 1),
      panel('sunset', 0.1, -0.38, 1.5, 1),
    ],
  },
  portrait: {
    ...base,
    size: 'portrait',
    layout: 'filmstrip',
    grade: 'neon',
    divider: 'chrome',
    captionStyle: 'chrome',
    title: 'MIDNIGHT RUN',
    subtitle: 'AFTER DARK ON THE BOULEVARD',
    panels: [
      panel('sunset', 0, -0.02, 1.1, 1.2),
      panel('neon', 0, 0, 1.15, 1.1),
      panel('yacht', -0.28, -0.1, 1.2, 1.05),
      panel('sunset', -0.06, 0.03, 1.3, 1),
      panel('neon', -0.05, -0.03, 1.25, 1.1),
    ],
  },
  square: {
    ...base,
    size: 'square',
    layout: 'magazine',
    grade: 'golden',
    title: 'NEON PALMS',
    subtitle: 'GOLDEN HOUR EDITION',
    panels: [
      panel('neon', 0, -0.03, 1.08, 1.15),
      panel('yacht', -0.02, 0.01, 1.12, 1.05),
    ],
  },
};
